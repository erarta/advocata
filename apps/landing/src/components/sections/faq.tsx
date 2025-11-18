'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { FAQ_ITEMS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section className="bg-white">
      <FadeIn direction="up">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Частые вопросы
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ответы на самые популярные вопросы о работе платформы
          </p>
        </div>
      </FadeIn>

      <div className="max-w-3xl mx-auto space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <FadeIn key={item.question} direction="up" delay={index * 0.05}>
            <motion.div
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              initial={false}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-2xl"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-purple-600" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Contact support */}
      <FadeIn delay={0.5}>
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Не нашли ответ на свой вопрос?
          </h3>
          <p className="text-gray-600 mb-4">
            Свяжитесь с нашей службой поддержки — мы поможем!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@advocata.ru"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              support@advocata.ru
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="tel:+78006001808"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              8 (800) 600-18-08
            </a>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
};
