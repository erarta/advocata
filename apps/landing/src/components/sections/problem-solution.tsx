'use client';

import React from 'react';
import { Car, Shield, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { motion } from 'framer-motion';

const problems = [
  {
    icon: Car,
    title: 'ДТП',
    problem: 'Попали в аварию? Не знаете, что делать?',
    solution: 'Адвокат приедет на место за 20 минут',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
  },
  {
    icon: Shield,
    title: 'Задержание',
    problem: 'Вас задержали? Нужна срочная помощь?',
    solution: 'Консультация по телефону за 5 минут',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
  },
  {
    icon: Scale,
    title: 'Судебные споры',
    problem: 'Нужна защита в суде?',
    solution: 'Проверенные адвокаты с опытом 5+ лет',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
  },
];

export const ProblemSolution: React.FC = () => {
  return (
    <Section className="bg-gray-50">
      <FadeIn direction="up">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Юридические проблемы?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Мы знаем, как помочь
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advocata — это быстрая и профессиональная юридическая помощь в любой
            ситуации
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8">
        {problems.map((item, index) => (
          <SlideIn
            key={item.title}
            direction={index % 2 === 0 ? 'left' : 'right'}
            delay={index * 0.2}
          >
            <Card
              variant="default"
              hoverable
              className="h-full group relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative p-8">
                {/* Icon */}
                <div className="mb-6">
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.color}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>

                {/* Problem */}
                <div className="mb-6">
                  <p className="text-gray-600 font-medium mb-2">❌ Проблема:</p>
                  <p className="text-gray-700">{item.problem}</p>
                </div>

                {/* Solution */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-green-600 font-medium mb-2">✅ Решение:</p>
                  <p className="text-gray-900 font-semibold">{item.solution}</p>
                </div>
              </div>
            </Card>
          </SlideIn>
        ))}
      </div>
    </Section>
  );
};
