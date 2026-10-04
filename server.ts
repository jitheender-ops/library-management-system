import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "2mb" }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=()");
    next();
  });

  // Tiny in-memory rate limiter for the AI endpoint (30 req/min per IP)
  const hits = new Map<string, { count: number; reset: number }>();
  const rateLimit: express.RequestHandler = (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + 60_000 });
      return next();
    }
    if (++entry.count > 30) {
      res.setHeader("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }
    next();
  };
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }, 60_000).unref();

  const asStringArray = (v: unknown, max: number) =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => x.slice(0, 80)).slice(0, max) : [];

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
  app.post("/api/recommendations", rateLimit, async (req, res) => {
    const body = req.body || {};
    const interests = asStringArray(body.interests, 20);
    const recentBooks = asStringArray(body.recentBooks, 20);
    const major = typeof body.major === "string" ? body.major.slice(0, 100) : "General Studies";
    const customPrompt = typeof body.customPrompt === "string" ? body.customPrompt.slice(0, 500) : "";
    const catalog = Array.isArray(body.catalog) ? body.catalog.slice(0, 200) : [];

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

        // Model fallback chain (override the first choice with GEMINI_MODEL)
        const candidateModels = [
          process.env.GEMINI_MODEL,
          "gemini-3.8-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
        ].filter((m): m is string => Boolean(m));
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

  // JSON error handler (malformed bodies etc.)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
