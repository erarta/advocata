export interface Lawyer {
  id: number;
  name: string;
  photo: string;
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Statistic {
  value: number;
  suffix: string;
  label: string;
}
