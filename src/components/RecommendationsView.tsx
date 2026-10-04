import React, { useState, useEffect } from "react";
import { Book, StudentProfile, BookRecommendation } from "../types";
import { AVAILABLE_INTEREST_TAGS } from "../data/initialData";
import { haptic } from "../utils/haptics";
import {
  Sparkles,
  Plus,
  X,
  BookOpen,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle,
  Brain,
  ThumbsUp,
  BookmarkCheck,
  Info,
} from "lucide-react";

interface RecommendationsViewProps {
  student: StudentProfile;
  catalog: Book[];
  onUpdateInterests: (newInterests: string[]) => void;
  onSelectBook: (book: Book) => void;
  onReserveBookId: (bookId: string) => void;
  reservedBookIds: Set<string>;
}

const RecommendationsViewComponent: React.FC<RecommendationsViewProps> = ({
  student,
  catalog,
  onUpdateInterests,
  onSelectBook,
  onReserveBookId,
  reservedBookIds,
}) => {
  const [interests, setInterests] = useState<string[]>(student.readingInterests);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [recommendationSource, setRecommendationSource] = useState<string>("gemini");
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const toggleInterest = (tag: string) => {
    haptic.selection();
    let updated: string[];
    if (interests.includes(tag)) {
      updated = interests.filter((t) => t !== tag);
    } else {
      updated = [...interests, tag];
    }
    setInterests(updated);
    onUpdateInterests(updated);
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !interests.includes(tag)) {
      haptic.light();
      const updated = [...interests, tag];
      setInterests(updated);
      onUpdateInterests(updated);
      setCustomTagInput("");
    }
  };

  const fetchRecommendations = async (promptOverride?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          major: student.major,
          recentBooks: ["Clean Code", "Thinking, Fast and Slow", "Sapiens"],
          customPrompt: promptOverride !== undefined ? promptOverride : customPrompt,
          catalog,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch recommendations");

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setRecommendationSource(data.source || "gemini");
      setNoticeMessage(data.notice || null);
      setHasFetched(true);
    } catch (err) {
      console.warn("Recommendation API call error, using local fallback:", err);
      // Client-side fallback
      const fallback = catalog
        .map((b) => {
          let score = 75;
          if (b.tags.some((t) => interests.includes(t))) score += 20;
          return {
            bookId: b.id,
            title: b.title,
            author: b.author,
            category: b.category,
            matchScore: Math.min(99, score),
            reasoning: `Selected because it aligns with your declared interests in ${interests.slice(0, 2).join(", ")}.`,
            keyTakeaways: ["Core theoretical foundations", "Applied case studies"],
            suggestedNextSteps: "Available on library shelf " + b.shelfLocation.callNumber,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setRecommendations(fallback);
      setRecommendationSource("local-heuristics");
      setNoticeMessage("Showing interest-matched recommendations from library catalog.");
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount if not loaded
  useEffect(() => {
    if (!hasFetched) {
      fetchRecommendations();
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner: Student Reading Profile & Interest Tags */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>Personalized Reading Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              Reading Interests & Curricular Topics
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Select or customize the topics that fuel your coursework, research, and personal reading goals.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-stone-500 font-mono">
              Student: <strong className="text-stone-800">{student.name}</strong> ({student.major})
            </span>
          </div>
        </div>

        {/* Interactive Interest Pills */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Your Active Reading Interests ({interests.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTEREST_TAGS.map((tag) => {
              const active = interests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  <span>{tag}</span>
                  {active ? (
                    <X className="w-3 h-3 text-emerald-200" />
                  ) : (
                    <Plus className="w-3 h-3 text-stone-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Add custom interest form */}
          <form onSubmit={handleAddCustomTag} className="flex gap-2 max-w-sm pt-1">
            <input
              type="text"
              placeholder="Add custom topic (e.g. Graph Theory)"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Add Topic
            </button>
          </form>
        </div>

        {/* Custom AI Query Box */}
        <div className="pt-4 border-t border-stone-100">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask the AI Library Advisor for Specific Recommendations</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. 'I loved Designing Data-Intensive Applications, what should I read next for consensus protocols?'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchRecommendations();
                }
              }}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              onClick={() => fetchRecommendations()}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">
              Curated Book Recommendations
            </h3>
            <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-medium">
              {recommendations.length} recommendations
            </span>
          </div>

          <div className="text-xs text-stone-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Advisor: {recommendationSource === "gemini" ? "Gemini AI Engine" : "Interest Matcher"}</span>
          </div>
        </div>

        {noticeMessage && (
          <div className="flex items-center gap-2 p-3 bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded-xl">
            <Info className="w-4 h-4 text-stone-500 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-6 bg-stone-200 rounded w-3/4" />
                <div className="h-16 bg-stone-100 rounded" />
                <div className="h-8 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec, idx) => {
              // Check if in catalog
              const catalogBook = rec.bookId
                ? catalog.find((b) => b.id === rec.bookId)
                : catalog.find(
                    (b) =>
                      b.title.toLowerCase().includes(rec.title.toLowerCase()) ||
                      rec.title.toLowerCase().includes(b.title.toLowerCase())
                  );

              const isReserved = catalogBook ? reservedBookIds.has(catalogBook.id) : false;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-400 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    {/* Match Score and Category */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {rec.category || catalogBook?.category || "Recommended"}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{rec.matchScore}% Match</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {catalogBook && (
                        <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden border border-stone-200/90 shadow-sm cursor-pointer group/rec" onClick={() => onSelectBook(catalogBook)}>
                          <img
                            src={catalogBook.coverUrl}
                            alt={`Front cover of ${rec.title}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform"
                          />
                          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => catalogBook && onSelectBook(catalogBook)}
                          className="text-base font-bold text-stone-900 leading-snug hover:text-emerald-700 cursor-pointer"
                        >
                          {rec.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-0.5">by {rec.author}</p>

                        {catalogBook && (
                          <p className="text-[11px] text-stone-500 font-mono mt-1">
                            Call No: {catalogBook.shelfLocation.callNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reasoning Box */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 space-y-1.5">
                      <p className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Why this fits your profile</span>
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed">{rec.reasoning}</p>
                    </div>

                    {/* Key Takeaways */}
                    {rec.keyTakeaways && rec.keyTakeaways.length > 0 && (
                      <div className="text-[11px] text-stone-600 space-y-1">
                        <span className="font-semibold text-stone-700 uppercase tracking-wider block text-[10px]">
                          Key Focus Areas
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                          {rec.keyTakeaways.map((takeaway, tIdx) => (
                            <li key={tIdx}>{takeaway}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                    {catalogBook ? (
                      <>
                        <div className="text-xs text-stone-500">
                          {catalogBook.availableCopies > 0 ? (
                            <span className="text-emerald-600 font-semibold">
                              ● {catalogBook.availableCopies} Copies Available
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">● Waitlist Hold Open</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onSelectBook(catalogBook)}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                          >
                            Details & Shelf
                          </button>
                          <button
                            onClick={() => onReserveBookId(catalogBook.id)}
                            disabled={isReserved}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                              isReserved
                                ? "bg-purple-100 text-purple-800 cursor-default"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            {isReserved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5" />
                                <span>Reserved</span>
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Reserve Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs">
                        <span className="text-stone-500 italic">Extended Reading Suggestion</span>
                        <button
                          onClick={() => alert(`Requested inter-library loan order for "${rec.title}"`)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-300 transition-colors"
                        >
                          Request Inter-Library Loan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const RecommendationsView = React.memo(RecommendationsViewComponent);
