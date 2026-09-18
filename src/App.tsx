import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
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
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={done} />}</AnimatePresence>
      <ViktorTopBar />
      <main className="overflow-x-clip bg-bg">
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
