'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface SlideInProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right';
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'left',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
