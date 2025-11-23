'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { PRICING_PLANS } from '@/lib/constants';
import { motion } from 'framer-motion';

export const Pricing: React.FC = () => {
  return (
    <Section className="bg-gray-50">
      <FadeIn direction="up">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Выберите тариф
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Гибкие планы для разных потребностей — от разовых консультаций до
            полного юридического сопровождения
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PRICING_PLANS.map((plan, index) => (
          <FadeIn key={plan.id} direction="up" delay={index * 0.15}>
            <motion.div
              className="h-full"
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card
                variant={plan.popular ? 'gradient' : 'bordered'}
                className={`h-full relative ${
                  plan.popular ? 'border-2 border-purple-300 shadow-xl' : ''
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Популярный
                    </motion.div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {plan.price === 0 ? (
                        <span className="text-5xl font-bold text-gray-900">
                          Бесплатно
                        </span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-gray-900">
                            {plan.price.toLocaleString('ru-RU')}₽
                          </span>
                          <span className="text-gray-600">/{plan.period}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Additional info */}
      <FadeIn delay={0.6}>
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Все тарифы включают безопасные платежи через{' '}
            <span className="font-semibold">ЮКасса</span> и возможность отмены в
            любой момент
          </p>
        </div>
      </FadeIn>
    </Section>
  );
};
