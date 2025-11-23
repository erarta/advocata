'use client';

import React from 'react';
import { FileSearch, Users, Video, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    icon: FileSearch,
    title: 'Опишите проблему',
    description: 'Выберите ситуацию и заполните форму',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Выберите адвоката',
    description: 'Из 100+ проверенных специалистов',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Video,
    title: 'Получите консультацию',
    description: 'По видео, чату или на месте',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: CheckCircle2,
    title: 'Решите проблему',
    description: 'С профессиональной поддержкой',
    color: 'from-green-500 to-green-600',
  },
];

export const HowItWorksClients: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <Section ref={ref} className="bg-white">
      <FadeIn direction="up">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Как получить помощь
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Простой процесс из 4 шагов — от описания проблемы до её решения
          </p>
        </div>
      </FadeIn>

      <div className="relative max-w-4xl mx-auto">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden lg:block">
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-purple-600 to-pink-600"
            style={{ height: `${progress.get()}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-24">
          {steps.map((step, index) => (
            <FadeIn key={step.title} direction="up" delay={index * 0.2}>
              <div
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                      <div className={`inline-flex mb-4 ${index % 2 === 0 ? 'lg:float-right lg:ml-4' : 'lg:float-left lg:mr-4'}`}>
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${step.color}`}
                        >
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Step number */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {index + 1}
                  </motion.div>
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden lg:block" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};
