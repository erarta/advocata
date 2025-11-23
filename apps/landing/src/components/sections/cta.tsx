'use client';

import React from 'react';
import { Apple, Play, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { SITE_CONFIG } from '@/lib/constants';
import { motion } from 'framer-motion';

export const CTA: React.FC = () => {
  return (
    <Section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <FadeIn direction="right">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
                🎉 Первая консультация бесплатно
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Получите юридическую помощь{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">
                  прямо сейчас
                </span>
              </h2>
            </FadeIn>

            <FadeIn direction="right" delay={0.4}>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Скачайте приложение и получите первую консультацию бесплатно.
                Более 500 адвокатов готовы помочь вам 24/7.
              </p>
            </FadeIn>

            <FadeIn direction="right" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() =>
                    window.open(SITE_CONFIG.links.appStore, '_blank')
                  }
                >
                  <Apple className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  App Store
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="group bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() =>
                    window.open(SITE_CONFIG.links.playStore, '_blank')
                  }
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Google Play
                </Button>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.8}>
              <div className="mt-8 flex items-center gap-4 text-sm text-purple-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400"
                    />
                  ))}
                </div>
                <p>
                  <span className="font-bold text-white">10,000+</span> довольных
                  клиентов
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Right content - QR Code */}
          <FadeIn direction="left" delay={0.4}>
            <div className="flex justify-center lg:justify-end">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-50" />

                {/* QR Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <QrCode className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Отсканируйте QR-код
                    </h3>
                    <p className="text-gray-600">
                      и скачайте приложение
                    </p>
                  </div>

                  {/* QR Code placeholder */}
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 aspect-square flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-sm ${
                            Math.random() > 0.5
                              ? 'bg-purple-900'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-2">
                        <Apple className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">iOS</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-2">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">Android</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
};
