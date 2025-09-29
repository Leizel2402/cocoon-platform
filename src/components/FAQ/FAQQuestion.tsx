import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FAQQuestionProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export const FAQQuestion: React.FC<FAQQuestionProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-4"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors border border-b border-gray-100 duration-200 "
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${index}`}
        >
          <h3 className="text-lg font-semibold text-gray-900 pr-4">
            {question}
          </h3>
          <div className="flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-green-600 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
            )}
          </div>
        </button>
        
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
          id={`faq-answer-${index}`}
          role="region"
          aria-labelledby={`faq-question-${index}`}
        >
          <div className="px-8  py-4">
            <p className="text-gray-600 leading-relaxed">
              {answer}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
