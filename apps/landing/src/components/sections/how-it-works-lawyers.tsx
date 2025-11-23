'use client';

import React from 'react';
import { DollarSign, Calendar, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { Stagger } from '@/components/animations/stagger';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: DollarSign,
    title: 'Заработок до 300,000₽/месяц',
    description: 'Прозрачная система оплаты с минимальной комиссией',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Calendar,
    title: 'Гибкий график работы',
    description: 'Работайте когда удобно вам, без жестких обязательств',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Target,
    title: 'Готовые клиенты каждый день',
    description: 'Не тратьте время на поиск — клиенты находят вас',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: TrendingUp,
    title: 'Прозрачная аналитика доходов',
    description: 'Отслеживайте статистику и планируйте развитие',
    color: 'from-orange-500 to-red-600',
  },
];

export const HowItWorksLawyers: React.FC = () => {
  return (
    <Section className="bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <FadeIn direction="right">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Зарабатывайте больше{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                с Advocata
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Присоединяйтесь к платформе №1 для юристов в России. Более 500
              адвокатов уже зарабатывают с нами.
            </p>

            {/* Benefits grid */}
            <Stagger staggerDelay={0.15}>
              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <motion.div
                    key={benefit.title}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${benefit.color}`}
                    >
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Stagger>

            <FadeIn delay={0.6}>
              <div className="mt-8">
                <Button size="lg" className="group">
                  Подать заявку
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Проверка заявки занимает 1-2 рабочих дня
                </p>
              </div>
            </FadeIn>
          </div>
        </FadeIn>

        {/* Right content - Stats cards */}
        <FadeIn direction="left" delay={0.3}>
          <div className="grid grid-cols-2 gap-6">
            {/* Average earnings card */}
            <Card
              variant="gradient"
              className="col-span-2 p-8 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative">
                <p className="text-gray-600 font-medium mb-2">
                  Средний заработок
                </p>
                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  187,500₽
                </p>
                <p className="text-sm text-gray-500">в месяц на платформе</p>
              </div>
            </Card>

            {/* Active lawyers */}
            <Card variant="default" className="p-6">
              <DollarSign className="h-8 w-8 text-green-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">500+</p>
              <p className="text-sm text-gray-600">Активных юристов</p>
            </Card>

            {/* Response time */}
            <Card variant="default" className="p-6">
              <Target className="h-8 w-8 text-blue-600 mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">15 мин</p>
              <p className="text-sm text-gray-600">До первого клиента</p>
            </Card>

            {/* Success rate */}
            <Card
              variant="bordered"
              className="col-span-2 p-6 border-2 border-purple-300 bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Коэффициент успеха</p>
                  <p className="text-3xl font-bold text-gray-900">94%</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">+496</span>
                </div>
              </div>
            </Card>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};
