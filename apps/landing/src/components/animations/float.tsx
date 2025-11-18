'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export const Float: React.FC<FloatProps> = ({
  children,
  delay = 0,
  duration = 3,
  yOffset = 20,
}) => {
  return (
    <motion.div
      animate={{
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};
