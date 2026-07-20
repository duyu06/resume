import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import CursorGlow from './components/CursorGlow';
import ViktorTopBar from './components/ViktorTopBar';
import DockNav from './components/DockNav';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import GuoyangFeature from './components/GuoyangFeature';
import ViktorWorkStrip from './components/ViktorWorkStrip';
import CareerSection from './components/CareerSection';
import ProjectsSection from './components/ProjectsSection';
import ExperienceSection from './components/ExperienceSection';
import CertGallery from './components/CertGallery';
import ContactSection from './components/ContactSection';

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
        <MarqueeSection />
        <AboutSection />
        <GuoyangFeature />
        <ViktorWorkStrip />
        <CareerSection />
        <ProjectsSection />
        <ExperienceSection />
        <CertGallery />
        <ContactSection />
      </main>
      <DockNav />
    </>
  );
}
