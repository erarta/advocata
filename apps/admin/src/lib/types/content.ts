// Content Types
export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}
