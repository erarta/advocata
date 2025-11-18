'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Gavel, FileText, MessageSquare, Apple, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { FadeIn } from '@/components/animations/fade-in';
import { Float } from '@/components/animations/float';
import { SITE_CONFIG } from '@/lib/constants';

const floatingIcons = [
  { Icon: Scale, delay: 0, position: 'top-20 left-10' },
  { Icon: Gavel, delay: 0.5, position: 'top-40 right-20' },
  { Icon: FileText, delay: 1, position: 'bottom-32 left-20' },
  { Icon: MessageSquare, delay: 1.5, position: 'bottom-20 right-10' },
];

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] bg-[length:200%_200%]">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea]"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, delay, position }, index) => (
          <div key={index} className={`absolute ${position} opacity-10`}>
            <Float delay={delay} duration={3 + index}>
              <Icon size={64} className="text-white" />
            </Float>
          </div>
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <Container className="relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white">
            <FadeIn direction="up" delay={0.2}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
                Юридическая помощь{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-pink-400">
                  онлайн
                </span>{' '}
                за 15 минут
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.4}>
              <p className="text-xl sm:text-2xl text-purple-100 mb-8 leading-relaxed">
                Экстренный вызов адвоката, консультации по видео, поддержка 24/7
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group"
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
                  className="group"
                  onClick={() =>
                    window.open(SITE_CONFIG.links.playStore, '_blank')
                  }
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Google Play
                </Button>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.8}>
              <button className="text-purple-200 hover:text-white transition-colors text-lg font-medium group">
                Стать адвокатом{' '}
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </FadeIn>

            {/* Trust badges */}
            <FadeIn direction="up" delay={1}>
              <div className="mt-12 pt-8 border-t border-purple-400/30">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold mb-1">10,000+</div>
                    <div className="text-sm text-purple-200">Клиентов</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">500+</div>
                    <div className="text-sm text-purple-200">Адвокатов</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">4.9 ★</div>
                    <div className="text-sm text-purple-200">Рейтинг</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right content - Phone mockup */}
          <div className="relative lg:block hidden">
            <FadeIn direction="left" delay={0.4}>
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-[3rem] blur-3xl opacity-30" />

                {/* Phone frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                    {/* Status bar */}
                    <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] px-6 py-3 flex justify-between items-center">
                      <span className="text-white text-xs font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* App content preview */}
                    <div className="p-6 space-y-4">
                      <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 bg-purple-100 rounded-xl" />
                        <div className="h-24 bg-pink-100 rounded-xl" />
                      </div>
                      <div className="h-16 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};
