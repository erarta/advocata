'use client';

import React from 'react';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { Counter } from '@/components/animations/counter';
import { STATISTICS } from '@/lib/constants';
import { motion } from 'framer-motion';

export const Statistics: React.FC = () => {
  return (
    <Section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white relative overflow-hidden">
      {/* Background patterns */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="relative">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Advocata в цифрах
            </h2>
            <p className="text-xl text-purple-100">
              Нам доверяют тысячи клиентов по всей России
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATISTICS.map((stat, index) => (
            <FadeIn key={stat.label} direction="up" delay={index * 0.1}>
              <motion.div
                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="text-5xl sm:text-6xl font-bold mb-3">
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </div>
                <p className="text-lg text-purple-100">{stat.label}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};
