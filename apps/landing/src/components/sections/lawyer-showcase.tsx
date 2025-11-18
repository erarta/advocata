'use client';

import React from 'react';
import { Star, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { FadeIn } from '@/components/animations/fade-in';
import { LAWYERS } from '@/lib/constants';
import { motion } from 'framer-motion';

export const LawyerShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <Section className="bg-white">
      <FadeIn direction="up">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Наши адвокаты
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Каждый юрист прошел тщательную проверку и имеет подтвержденную квалификацию
          </p>
        </div>
      </FadeIn>

      {/* Desktop view - Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {LAWYERS.map((lawyer, index) => (
          <FadeIn key={lawyer.id} direction="up" delay={index * 0.1}>
            <Card variant="default" hoverable className="h-full group">
              <div className="p-6">
                {/* Avatar */}
                <motion.div
                  className="relative mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-white">
                        {lawyer.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                  {/* Rating badge */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">{lawyer.rating}</span>
                  </div>
                </motion.div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {lawyer.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-3">
                    {lawyer.specialization}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
                    <Briefcase className="h-4 w-4" />
                    <span>{lawyer.experience} лет опыта</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 group-hover:line-clamp-none transition-all">
                    {lawyer.bio}
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Mobile view - Carousel */}
      <div className="md:hidden">
        <div className="relative">
          {/* Cards */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `${-activeIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {LAWYERS.map((lawyer) => (
                <div key={lawyer.id} className="w-full flex-shrink-0 px-4">
                  <Card variant="default" className="h-full">
                    <div className="p-6">
                      {/* Avatar */}
                      <div className="relative mb-6">
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-8xl font-bold text-white">
                              {lawyer.name.charAt(0)}
                            </div>
                          </div>
                        </div>
                        {/* Rating badge */}
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{lawyer.rating}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {lawyer.name}
                        </h3>
                        <p className="text-purple-600 font-medium mb-4">
                          {lawyer.specialization}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                          <Briefcase className="h-5 w-5" />
                          <span>{lawyer.experience} лет опыта</span>
                        </div>
                        <p className="text-gray-600">{lawyer.bio}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {LAWYERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-purple-600'
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
