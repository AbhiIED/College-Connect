import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, Clock } from "lucide-react";

export default function NewsDetailModal({ article, onClose }) {
  if (!article) return null;

  const date = article.Published_At
    ? new Date(article.Published_At).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 w-full shrink-0">
            <img
              src={article.Image_URL || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&q=80"}
              alt={article.Title}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all border border-white/10 backdrop-blur-xs"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges / Title overlaid */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white border border-indigo-400 mb-3 shadow-md">
                <Tag className="w-3.5 h-3.5" />
                {article.Category || "Announcement"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                {article.Title}
              </h2>
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Meta Row */}
            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 border-b border-gray-100 pb-4">
              {date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Published: <span className="text-gray-700 font-semibold">{date}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Category: <span className="text-gray-700 font-semibold">{article.Category || "General"}</span>
              </div>
            </div>

            {/* Description (Abstract) */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-indigo-900 text-[15px] font-medium leading-relaxed">
              {article.Description}
            </div>

            {/* Details (Full Article content) */}
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {article.Details || "No additional details available for this news article."}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-8 border-t border-gray-100 flex justify-end bg-gray-50 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Close Article
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
