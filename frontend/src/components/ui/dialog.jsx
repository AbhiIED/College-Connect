import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const sizeClasses = {
  sm: "max-w-sm", // ~24rem
  md: "max-w-md", // ~28rem
  lg: "max-w-lg", // ~32rem
  xl: "max-w-2xl", // ~42rem
  "2xl": "max-w-4xl", // ~56rem
  full: "w-[90vw] max-w-[1200px]", // ✅ custom wide modal size
};

export function Dialog({ open, onOpenChange, children, size = "full" }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => onOpenChange(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DialogHeader({ children }) {
  return (
    <div className="mb-4 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
      {children}
    </div>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="text-2xl font-semibold text-gray-800">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-gray-600 text-sm mt-1">{children}</p>;
}

export function DialogContent({ children }) {
  return <div className="space-y-4">{children}</div>;
}

export function DialogFooter({ children }) {
  return (
    <div className="mt-4 border-t border-gray-200 pt-3 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
      {children}
    </div>
  );
}
