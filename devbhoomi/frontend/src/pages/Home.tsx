import {
  Hero,
  StatsBar,
  WhyUs,
  
  
  HowItWorks,
  Testimonials,
 
  Faq,
 
} from "../components/home";

/**
 * Home page = just the section order below.
 *
 * To reorder sections: move the lines.
 * To edit a section: open its file in src/components/home/ (e.g. Hero.tsx, Districts.tsx).
 * To add a new section: create a component in src/components/home/, export it from
 * src/components/home/index.ts, then add it here.
 */
export const Home = () => (
  <>
    <Hero />
    <StatsBar />
    <WhyUs />
  
 
    <HowItWorks />
    <Testimonials />
   
    <Faq />

  </>
);
