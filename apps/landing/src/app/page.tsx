import { Hero } from '@/components/sections/hero';
import { ProblemSolution } from '@/components/sections/problem-solution';
import { HowItWorksClients } from '@/components/sections/how-it-works-clients';
import { HowItWorksLawyers } from '@/components/sections/how-it-works-lawyers';
import { Statistics } from '@/components/sections/statistics';
import { LawyerShowcase } from '@/components/sections/lawyer-showcase';
import { Pricing } from '@/components/sections/pricing';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <ProblemSolution />
      <HowItWorksClients />
      <Statistics />
      <LawyerShowcase />
      <HowItWorksLawyers />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
