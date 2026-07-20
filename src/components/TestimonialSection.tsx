import TestimonialCarousel from './TestimonialCarousel';
import Reveal from './Reveal';

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="w-full">
      <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-16">
        <Reveal delay={1}>
          <p className="font-mono text-xs md:text-sm text-muted uppercase tracking-[0.2em]">
            Testimonials
          </p>
          <h2 className="font-serif-accent text-[32px] md:text-[44px] lg:text-[52px] leading-[1.1] text-ink-2 mt-2">
            Viktor leaving Apple
          </h2>
          <p className="text-sm md:text-base text-ink/70 mt-3 max-w-2xl">
            The best thing that could have happened to the teams he works with — here is what a few of them had to say.
          </p>
        </Reveal>
      </div>
      <TestimonialCarousel />
    </section>
  );
}
