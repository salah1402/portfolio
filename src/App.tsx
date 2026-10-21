import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { LeadModal } from './components/ui/LeadModal';
import { HomePage } from './pages/HomePage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ModalContextType, LeadIntakeFormData } from './types';
import { SmoothScrollProvider, useSmoothScroll } from './providers/SmoothScrollProvider';

export const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

const AppShell: React.FC<{
  openModal: (initialData?: Partial<LeadIntakeFormData>) => void;
  closeModal: () => void;
  isLeadModalOpen: boolean;
}> = ({ openModal, closeModal, isLeadModalOpen }) => {
  const { stop, start } = useSmoothScroll();

  // Freeze smooth scroll when lead intake modal is active
  useEffect(() => {
    if (isLeadModalOpen) {
      stop();
    } else {
      start();
    }
  }, [isLeadModalOpen, stop, start]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2b2b2b] font-sans antialiased selection:bg-[#fc4778]/20 selection:text-[#2b2b2b] overflow-x-clip">
      <Navbar onOpenLeadModal={() => openModal()} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work/:slug" element={<CaseStudyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Catch-all wildcard fallback to HomePage */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer onOpenLeadModal={() => openModal()} />
      <LeadModal isOpen={isLeadModalOpen} onClose={closeModal} />
    </div>
  );
};

/**
 * Root Application Router Shell
 * Coordinates dynamic routes:
 * - /           -> HomePage (flagship 10-section studio experience)
 * - /work/:slug -> CaseStudyPage (dynamic project deep dive)
 * - /about      -> AboutPage (editorial founder biography)
 * - /contact    -> ContactPage (dedicated high-ticket intake)
 * - *           -> Wildcard fallback to HomePage
 */
export const App: React.FC = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [_initialModalData, setInitialModalData] = useState<Partial<LeadIntakeFormData> | undefined>();

  const openModal = (initialData?: Partial<LeadIntakeFormData>) => {
    setInitialModalData(initialData);
    setIsLeadModalOpen(true);
  };
  const closeModal = () => {
    setIsLeadModalOpen(false);
    setInitialModalData(undefined);
  };

  return (
    <ModalContext.Provider value={{ isOpen: isLeadModalOpen, openModal, closeModal }}>
      <SmoothScrollProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell
            openModal={openModal}
            closeModal={closeModal}
            isLeadModalOpen={isLeadModalOpen}
          />
        </BrowserRouter>
      </SmoothScrollProvider>
    </ModalContext.Provider>
  );
};

export default App;
