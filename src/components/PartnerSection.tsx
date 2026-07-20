import Button from './Button';
import Reveal from './Reveal';

export default function PartnerSection() {
  return (
    <section className="w-full py-16 md:py-24 px-6">
      <Reveal delay={1}>
        <div className="relative max-w-5xl mx-auto rounded-[40px] overflow-hidden px-8 md:px-16 py-16 md:py-24 text-center flex flex-col items-center gap-6 shadow-card-dark"
          style={{ background: 'linear-gradient(135deg, #051a24 0%, #0d212c 55%, #7a0071 100%)' }}
        >
          <p className="font-mono text-xs md:text-sm text-on-dark-2 uppercase tracking-[0.2em]">
            Partner with us
          </p>
          <h2 className="font-serif-accent text-[36px] md:text-[56px] lg:text-[64px] leading-[1.05] text-on-dark">
            Let&apos;s build something<br />worth remembering
          </h2>
          <p className="text-sm md:text-base text-on-dark-2 max-w-lg">
            Have a product idea, a team to scale, or a problem worth solving? Start a conversation and let&apos;s figure it out together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button variant="primary" href="#contact">Start chat with Viktor</Button>
            <Button variant="secondary" href="#projects">See the work</Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
