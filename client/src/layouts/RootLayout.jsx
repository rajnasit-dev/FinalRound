import { Outlet } from "react-router-dom";
import { useState, useEffect, Suspense, useRef } from "react";
import Lenis from "lenis";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Spinner from "../components/ui/Spinner";

const RootLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Initialize Lenis smooth scrolling once for the whole app
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
      // Keep native wheel scroll for modals and other opt-out containers.
      prevent: (node) =>
        !!node?.closest?.("[data-lenis-prevent], [data-lenis-prevent-wheel]"),
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-1" style={{ paddingTop: "var(--navbar-height)" }}>
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default RootLayout;
