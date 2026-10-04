import React, { useState } from "react";
import { Book } from "../types";
import {
  Sparkles,
  Bot,
  MessageSquare,
  ArrowRight,
  Send,
  BookOpen,
} from "lucide-react";

interface AiFeaturesBannerProps {
  catalog: Book[];
  onSelectBook: (book: Book) => void;
  onNavigate: (screen: string) => void;
  onQuickQuery: (query: string) => void;
}

export const AiFeaturesBanner: React.FC<AiFeaturesBannerProps> = ({
  catalog,
  onSelectBook,
  onNavigate,
  onQuickQuery,
}) => {
  const [nlQuery, setNlQuery] = useState("");

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlQuery.trim()) {
      onQuickQuery(nlQuery.trim());
      onNavigate("search");
    }
  };

  const previewBooks = catalog.slice(0, 3);

  return (
    <div className="w-full bg-blue-50/70 border-t border-blue-100 py-8 px-4 sm:px-6 lg:px-8 mt-12 rounded-3xl shadow-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section Header matching image */}
        <div className="flex items-center justify-center gap-2 text-blue-700 font-black tracking-widest text-xs uppercase">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>AI FEATURES</span>
        </div>

        {/* 3 Interactive Cards matching the image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: AI Book Finder */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">AI Book Finder</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Describe what you need in natural language and get the best book suggestions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onQuickQuery("beginner books on data science");
                onNavigate("search");
              }}
              className="w-full py-2 px-3 bg-stone-50 hover:bg-blue-50/70 border border-stone-200/80 rounded-xl text-xs font-medium text-stone-700 text-left flex items-center justify-between transition-colors group"
            >
              <span className="truncate italic">"Show me beginner books on data science"</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
            </button>
          </div>

          {/* Card 2: Personalized Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                Personalized Recommendations
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Get book suggestions based on your reading interests and academic history.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex -space-x-2 overflow-hidden">
                {previewBooks.map((book) => (
                  <img
                    key={book.id}
                    src={book.coverUrl}
                    alt={book.title}
                    className="inline-block w-8 h-11 object-cover rounded shadow-xs border border-white"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate("ai-advisor")}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Natural Language Search & Help */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100/80 text-cyan-800 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                Natural Language Search & Help
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ask questions, search for books, or get library assistance — just type it!
              </p>
            </div>

            <form onSubmit={handleNlSubmit} className="relative">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Find books on web development..."
                className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 p-0.5"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Tagline matching image footer */}
        <div className="pt-2 text-center text-xs font-semibold text-blue-900/70 flex items-center justify-center gap-2 flex-wrap">
          <BookOpen className="w-4 h-4 text-blue-600 inline" />
          <span>Smart Library</span>
          <span>•</span>
          <span>Search</span>
          <span>•</span>
          <span>Reserve</span>
          <span>•</span>
          <span>Borrow</span>
          <span>•</span>
          <span>Manage</span>
        </div>
      </div>
    </div>
  );
};
