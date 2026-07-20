import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import CursorGlow from './components/CursorGlow';
import ViktorTopBar from './components/ViktorTopBar';
import DockNav from './components/DockNav';
import HeroSection from './components/HeroSection';
import ImpactCards from './components/ImpactCards';
import AboutSection from './components/AboutSection';
import GuoyangFeature from './components/GuoyangFeature';
import GuoyangWorkflow from './components/GuoyangWorkflow';
import CareerTimeline from './components/CareerTimeline';
import ProjectsCatalog from './components/ProjectsCatalog';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={done} />}</AnimatePresence>
      <CursorGlow />
      <ViktorTopBar />
      <main className="overflow-x-clip bg-bg">
        <HeroSection />
        <ImpactCards />
        <AboutSection />
        <GuoyangFeature />
        <GuoyangWorkflow />
        <CareerTimeline />
        <ProjectsCatalog />
        <ContactSection />
      </main>
      <Footer />
      <DockNav />
    </>
  );
}
