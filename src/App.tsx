import ViktorTopBar from './components/ViktorTopBar';
import DockNav from './components/DockNav';
import HeroStory from './components/HeroStory';
import Evidence from './components/Evidence';
import GuoyangCaseStudy from './components/GuoyangCaseStudy';
import SelectedProjects from './components/SelectedProjects';
import ProductMethod from './components/ProductMethod';
import CareerTimeline from './components/CareerTimeline';
import EducationSection from './components/EducationSection';
import ClosingCTA from './components/ClosingCTA';
import MaxKBChat from './components/MaxKBChat';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[2000] -translate-y-24 bg-ink px-4 py-3 text-sm font-medium text-white transition-transform focus:translate-y-0"
      >
        跳到主要内容
      </a>
      <ViktorTopBar />
      <main id="main-content" className="overflow-x-clip bg-bg" tabIndex={-1}>
        <HeroStory />
        <Evidence />
        <GuoyangCaseStudy />
        <SelectedProjects />
        <ProductMethod />
        <CareerTimeline />
        <EducationSection />
        <ClosingCTA />
      </main>
      <Footer />
      <MaxKBChat />
      <DockNav />
    </>
  );
}
