import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import CursorGlow from './components/CursorGlow';
import ViktorTopBar from './components/ViktorTopBar';
import DockNav from './components/DockNav';
import HeroSection from './components/HeroSection';
import ImpactCards from './components/ImpactCards';
import AboutSection from './components/AboutSection';
import MethodSection from './components/MethodSection';
import GuoyangFeature from './components/GuoyangFeature';
import GuoyangWorkflow from './components/GuoyangWorkflow';
import ProjectsCatalog from './components/ProjectsCatalog';
import CareerTimeline from './components/CareerTimeline';
import EducationSection from './components/EducationSection';
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
        <MethodSection />
        <GuoyangFeature />
        <GuoyangWorkflow />
        <ProjectsCatalog />
        <CareerTimeline />
        <EducationSection />
        <ContactSection />
      </main>
      <Footer />
      <DockNav />
    </>
  );
}
