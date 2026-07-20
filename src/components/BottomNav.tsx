import Button from './Button';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" aria-label="快捷导航">
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full pl-6 pr-2 py-2 shadow-dock">
        <a
          href="#top"
          className="font-serif-accent text-base font-semibold text-[#051A24] leading-none hover:opacity-70 transition-opacity px-1"
          title="回到顶部"
        >
          𝓭𝓾𝓼𝓱𝓾
        </a>
        <Button variant="primary" href="tel:18163794793" className="text-sm !py-2.5 !px-5">
          联系我
        </Button>
      </div>
    </nav>
  );
}
