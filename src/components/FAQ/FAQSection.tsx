import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { FAQQuestion } from './FAQQuestion';
import { Button } from '../ui/Button';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  faqData: FAQItem[];
  onBrowseProperties?: () => void;
  onContactSupport?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqData,
  onBrowseProperties,
  onContactSupport
}) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleToggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-green-600" />
          <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get answers to common questions about renting, applications, and our platform
        </p>
      </motion.div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        {faqData.map((faq, index) => (
          <FAQQuestion
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openFAQ === index}
            onToggle={() => handleToggleFAQ(index)}
            index={index}
          />
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team is here to help! Contact us for personalized assistance with your rental search.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onBrowseProperties && (
              <Button
                onClick={onBrowseProperties}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Browse Properties
              </Button>
            )}
            {onContactSupport && (
              <Button
                variant="outline"
                onClick={onContactSupport}
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Contact Support
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
