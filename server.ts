import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side Gemini client helper
  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Heuristic recommendation generator from library catalog
  const getCatalogHeuristicRecommendations = (
    catalogList: any[],
    userInterests: string[],
    userMajor: string
  ) => {
    return (catalogList || [])
      .map((b: any) => {
        let score = 72;
        const matchesInterest = (b.tags || []).some((t: string) =>
          (userInterests || []).some(
            (i: string) =>
              i.toLowerCase().includes(t.toLowerCase()) ||
              t.toLowerCase().includes(i.toLowerCase())
          )
        );
        if (matchesInterest) score += 20;
        if (b.category?.toLowerCase().includes((userMajor || "").toLowerCase().split(" ")[0])) {
          score += 6;
        }

        const tagsList = (userInterests && userInterests.length > 0)
          ? userInterests.slice(0, 2).join(" & ")
          : "your academic topics";

        return {
          bookId: b.id,
          title: b.title,
          author: b.author,
          category: b.category,
          matchScore: Math.min(99, score),
          reasoning: `Matches interest in ${tagsList} and coursework in ${userMajor || "University Studies"}.`,
          keyTakeaways: [
            `Core insights into ${b.category || "interdisciplinary"} methodologies`,
            "Key analytical frameworks relevant to campus studies",
          ],
          suggestedNextSteps:
            "Available on library shelf " + (b.shelfLocation?.callNumber || "Main Stacks"),
        };
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 5);
  };

  // API Route: Recommendations based on student interests and reading history
  app.post("/api/recommendations", async (req, res) => {
    const {
      interests = [],
      major = "General Studies",
      recentBooks = [],
      customPrompt = "",
      catalog = [],
    } = req.body || {};

    try {
      const ai = getGeminiClient();

      if (ai) {
        const prompt = `You are an expert university library reading advisor.
A student with Major: "${major}" has reading interests: ${JSON.stringify(interests)}.
Their recently borrowed or read books are: ${JSON.stringify(recentBooks)}.
Student's custom request: "${customPrompt || "Recommend books that expand their mind and match their interests."}"

Here is a list of existing library catalog books you can prioritize recommending from (if relevant):
${JSON.stringify(
  (catalog || []).slice(0, 15).map((b: any) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    tags: b.tags,
  }))
)}

Provide 4 to 6 compelling, specific book recommendations tailored to their reading interests.
Return ONLY valid JSON matching this schema:
[
  {
    "bookId": "existing-catalog-id or null if external recommendation",
    "title": "Book Title",
    "author": "Author Name",
    "category": "Category name",
    "matchScore": 95,
    "reasoning": "Clear explanation of why this book matches their reading interests and major",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
    "suggestedNextSteps": "Brief tip for student"
  }
]`;

        // Recommended model for text generation: gemini-3.8-flash
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
        let generatedText: string | null = null;

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              },
            });

            if (response.text) {
              generatedText = response.text;
              break;
            }
          } catch {
            // Model unavailable or high demand; attempt next model in list
            continue;
          }
        }

        if (generatedText) {
          let parsed = [];
          try {
            parsed = JSON.parse(generatedText);
          } catch {
            const match = generatedText.match(/\[[\s\S]*\]/);
            parsed = match ? JSON.parse(match[0]) : [];
          }

          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({ recommendations: parsed, source: "gemini" });
          }
        }
      }

      // Graceful fallback to heuristic catalog matcher if AI key is absent or temporarily experiencing high demand
      const matched = getCatalogHeuristicRecommendations(catalog, interests, major);
      return res.json({
        recommendations: matched,
        source: "curated-interests",
        notice: "Recommendations curated from catalog interest matching while AI model demand is high.",
      });
    } catch {
      const matched = getCatalogHeuristicRecommendations(catalog, interests, major);
      return res.json({
        recommendations: matched,
        source: "curated-interests",
      });
    }
  });

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
