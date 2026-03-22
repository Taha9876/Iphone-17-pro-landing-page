"use client";

import CanvasSequence from "@/components/CanvasSequence";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const COLOR_OPTIONS = [
  { name: "Natural Titanium", hex: "#B0A696", ring: "#B0A696" },
  { name: "Blue Titanium", hex: "#3B4D5E", ring: "#5A7A9A" },
  { name: "White Titanium", hex: "#E3E0D8", ring: "#E3E0D8" },
  { name: "Black Titanium", hex: "#3A3A3C", ring: "#5A5A5E" },
];

const SPECS = [
  { label: "Display", value: "6.9″ Super Retina XDR, ProMotion 120Hz, Always-On" },
  { label: "Chip", value: "A19 Pro — 2nm, 6-core CPU, 6-core GPU" },
  { label: "Camera", value: "48MP Main · 48MP Ultra Wide · 12MP 10x Telephoto" },
  { label: "Battery", value: "Up to 33 hours video playback" },
  { label: "Storage", value: "256GB / 512GB / 1TB / 2TB" },
  { label: "Connectivity", value: "5G Advanced, Wi-Fi 7, Bluetooth 5.4, UWB" },
  { label: "Durability", value: "Ceramic Shield, IP68 water resistance" },
  { label: "Material", value: "Grade 5 Titanium, brushed finish" },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Scroll % for progress bar (vanilla JS — works on all devices)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.round((window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Framer Motion Hero Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const s1Opacity = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const s1Y = useTransform(scrollYProgress, [0.2, 0.5], [50, -50]);
  const s2Opacity = useTransform(scrollYProgress, [0.5, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  const s2Y = useTransform(scrollYProgress, [0.5, 0.75], [50, -50]);

  useGSAP(() => {
    /* ── Hero text overlays driven by GSAP (mobile-safe) ── */
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    heroTl
      .to("#hero-text", { opacity: 1, y: -20, duration: 2 }, 0)
      .to("#hero-text", { opacity: 0, duration: 1 }, 2)
      .to("#story-text-1", { opacity: 1, y: -20, duration: 2 }, 3)
      .to("#story-text-1", { opacity: 0, duration: 1 }, 6)
      .to("#story-text-2", { opacity: 1, y: -20, duration: 2 }, 7)
      .to("#story-text-2", { opacity: 0, duration: 1 }, 10)
      .to({}, { duration: 2 });  // pad end

    // Shared trigger config — high start % ensures it fires on any viewport
    const oneShot = { toggleActions: "play none none none" as const, invalidateOnRefresh: true };

    gsap.from(".perf-card-wrapper", {
      scrollTrigger: { trigger: ".perf-section", start: "top 90%", ...oneShot },
      y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
    });
    gsap.from(".cam-card", {
      scrollTrigger: { trigger: ".cam-section", start: "top 90%", ...oneShot },
      scale: 0.85, opacity: 0, duration: 1, stagger: 0.12, ease: "back.out(1.7)",
    });
    gsap.to(".titanium-bg", {
      scrollTrigger: { trigger: ".titanium-section", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      y: 150, ease: "none",
    });
    gsap.from(".titanium-card", {
      scrollTrigger: { trigger: ".titanium-section", start: "top 85%", ...oneShot },
      x: -60, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    gsap.from(".float-card", {
      scrollTrigger: { trigger: ".float-section", start: "top 90%", ...oneShot },
      y: 40, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power2.out",
    });
    gsap.from(".color-option", {
      scrollTrigger: { trigger: ".color-section", start: "top 90%", ...oneShot },
      scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(2)",
    });
    gsap.from(".spec-row", {
      scrollTrigger: { trigger: ".spec-section", start: "top 90%", ...oneShot },
      x: -30, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out",
    });

    // Recalculate positions after layout settles  
    ScrollTrigger.refresh();

    /* 3D card hover — desktop only */
    if (window.matchMedia("(pointer: fine)").matches) {
      const hoverCards = document.querySelectorAll<HTMLElement>(".perf-card");
      hoverCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rx = ((e.clientY - rect.top - cy) / cy) * -12;
          const ry = ((e.clientX - rect.left - cx) / cx) * 12;
          gsap.to(card, { rotationX: rx, rotationY: ry, transformPerspective: 1000, ease: "power2.out", duration: 0.5 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, ease: "back.out(1.5)", duration: 1 });
        });
      });
    }
  }, { scope: gsapRef });

  return (
    <>
      {/* --- PRELOADER --- */}
      <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-1000 ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-6 animate-pulse" viewBox="0 0 814 1000" fill="white">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8-62.2 0-106.9-56.3-155.5-124.7C46.7 813.5 0 680.7 0 554.4c0-203.7 132.3-311.7 262.6-311.7 69.2 0 126.9 45.4 170.4 45.4 41.5 0 106.2-48.1 184.6-48.1 29.8 0 137 2.6 207.9 99z M554.1 163.2c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.6 1.3 18.2 2.6.6 6.4 1.3 10.2 1.3 45.4 0 103.7-30.4 139.5-71.4z" />
        </svg>
        <div className="w-36 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/80 rounded-full animate-[loading_2.5s_ease-in-out_forwards]" />
        </div>
      </div>

      {/* --- SCROLL PROGRESS BAR --- */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[60]">
        <div className="h-full bg-gradient-to-r from-white/80 to-[#E8E3DC] transition-all duration-100" style={{ width: `${scrollPct}%` }} />
      </div>

      <main className="w-full bg-[#050505] text-white selection:bg-white/30 selection:text-white overflow-clip" ref={gsapRef}>

        {/* ═══════════════ NAVBAR ═══════════════ */}
        <header className="fixed top-[2px] w-full z-50 backdrop-blur-xl bg-black/60 border-b border-white/5">
          <div className="max-w-[980px] mx-auto px-4 h-11 flex items-center justify-between text-white/80 text-[11px] tracking-wide">
            <a href="#" aria-label="Apple">
              <svg className="w-[14px] h-[18px] fill-current text-white/90 hover:text-white transition-colors" viewBox="0 0 814 1000">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8-62.2 0-106.9-56.3-155.5-124.7C46.7 813.5 0 680.7 0 554.4c0-203.7 132.3-311.7 262.6-311.7 69.2 0 126.9 45.4 170.4 45.4 41.5 0 106.2-48.1 184.6-48.1 29.8 0 137 2.6 207.9 99z M554.1 163.2c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.6 1.3 18.2 2.6.6 6.4 1.3 10.2 1.3 45.4 0 103.7-30.4 139.5-71.4z" />
              </svg>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              <a href="#" className="hover:text-white transition-colors">Store</a>
              <a href="#" className="hover:text-white transition-colors">Mac</a>
              <a href="#" className="hover:text-white transition-colors">iPad</a>
              <a href="#" className="hover:text-white transition-colors font-semibold text-white">iPhone</a>
              <a href="#" className="hover:text-white transition-colors">Watch</a>
              <a href="#" className="hover:text-white transition-colors">Vision</a>
              <a href="#" className="hover:text-white transition-colors">AirPods</a>
              <a href="#" className="hover:text-white transition-colors">TV &amp; Home</a>
              <a href="#" className="hover:text-white transition-colors">Entertainment</a>
              <a href="#" className="hover:text-white transition-colors">Accessories</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </nav>

            <div className="flex items-center gap-5">
              <svg className="w-[15px] h-[15px] text-white/70 hover:text-white transition-colors cursor-pointer hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
              <svg className="w-[15px] h-[17px] text-white/70 hover:text-white transition-colors cursor-pointer hidden sm:block" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
              {/* Mobile hamburger */}
              <button className="md:hidden flex flex-col gap-[5px] group" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
                <span className={`w-[18px] h-[1.5px] bg-white/80 transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
                <span className={`w-[18px] h-[1.5px] bg-white/80 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-[18px] h-[1.5px] bg-white/80 transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-black/95 backdrop-blur-xl border-t border-white/5 ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <nav className="flex flex-col px-6 py-4 gap-4 text-[15px] text-white/80">
              {["Store", "Mac", "iPad", "iPhone", "Watch", "Vision", "AirPods", "TV & Home", "Entertainment", "Accessories", "Support"].map(item => (
                <a key={item} href="#" className={`hover:text-white transition-colors py-1 border-b border-white/5 last:border-none ${item === "iPhone" ? "font-semibold text-white" : ""}`}>{item}</a>
              ))}
            </nav>
          </div>
        </header>

        {/* ═══════════════ SECTION 1: HERO CANVAS ═══════════════ */}
        <section ref={containerRef} className="hero-scroll-container relative h-[600vh] w-full">
          <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
            <CanvasSequence scrollProgress={scrollYProgress} />
            <div className="absolute inset-0 pointer-events-none">
              <motion.div className="absolute inset-0 flex flex-col justify-center items-center px-4" style={{ opacity: heroOpacity, y: heroY }}>
                <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.4em] sm:tracking-[0.5em] text-white/40 mb-2 sm:mb-4 font-medium">Apple Intelligence</p>
                <h1 className="text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-[#E8E3DC] drop-shadow-2xl text-center leading-tight px-2">
                  iPhone 17 Pro
                </h1>
                <p className="mt-2 sm:mt-4 text-xs sm:text-xl md:text-2xl text-white/50 text-center uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium">
                  Titanium Refined
                </p>
                <p className="mt-6 sm:mt-8 text-[10px] sm:text-base text-white/30 animate-bounce">↓ Scroll to explore</p>
              </motion.div>

              <motion.div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-[10%]" style={{ opacity: s1Opacity, y: s1Y }}>
                <div className="max-w-xl text-left">
                  <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/50 mb-2 sm:mb-3 font-semibold">Engineering</p>
                  <h2 className="text-xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-white/90 drop-shadow-md leading-tight">Engineered to the <br />sub-atomic level.</h2>
                  <p className="mt-3 sm:mt-8 text-xs sm:text-lg md:text-xl text-white/60 leading-relaxed font-light max-w-[280px] sm:max-w-none">Every component re-architected. The new thermal system allows for unprecedented sustained performance.</p>
                </div>
              </motion.div>

              <motion.div className="absolute inset-0 flex items-center justify-end px-6 sm:px-10 md:px-[10%]" style={{ opacity: s2Opacity, y: s2Y }}>
                <div className="max-w-xl text-right">
                  <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/50 mb-2 sm:mb-3 font-semibold">Pro Camera</p>
                  <h2 className="text-xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-white/90 drop-shadow-md leading-tight">A camera system <br />that defies reality.</h2>
                  <p className="mt-3 sm:mt-8 text-xs sm:text-lg md:text-xl text-white/60 leading-relaxed font-light max-w-[280px] sm:max-w-none ml-auto">Capture the impossible with the new 48MP periscope telephoto.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 2: PERFORMANCE ═══════════════ */}
        <section className="perf-section relative z-10 w-full py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 flex items-center justify-center bg-[#050505]">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 text-center font-semibold">Performance</p>
            <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 text-center tracking-tight px-4 leading-tight">
              Monstrous <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">Performance.</span>
            </h2>
            <p className="text-center text-white/40 text-xs sm:text-lg mb-10 sm:mb-20 max-w-2xl mx-auto font-light px-6">The A19 Pro pushes boundaries with a 2nm process, delivering more performance per watt than any chip in any smartphone.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                { img: "/assets/a19.png", title: "A19 Pro Chip", desc: "Industry-leading speed and efficiency built on 2nm architecture." },
                { img: "/assets/gpu.png", title: "6-Core GPU", desc: "Hardware-accelerated ray tracing that is 4x faster." },
                { img: "/assets/neural.png", title: "Neural Engine", desc: "Built for generative AI with 35 trillion operations per second." },
              ].map((item, i) => (
                <div key={i} className="perf-card-wrapper h-[280px] sm:h-[350px] md:h-[450px]" style={{ perspective: "1000px" }}>
                  <div className="perf-card w-full h-full bg-[#0A0A0C] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-white/30 transition-all shadow-2xl relative transform-gpu cursor-pointer group hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)]">
                    <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 pointer-events-none" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-end h-full pointer-events-none">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">{item.title}</h3>
                      <p className="text-white/60 text-sm sm:text-base md:text-lg font-light mt-2 sm:mt-3">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 3: CAMERA ═══════════════ */}
        <section className="cam-section relative z-10 w-full bg-[#050505] py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 text-center font-semibold">Camera System</p>
            <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 text-center tracking-tight px-4 leading-tight">
              Lenses that <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">bend light.</span>
            </h2>
            <p className="text-center text-white/40 text-xs sm:text-lg mb-8 sm:mb-16 max-w-2xl mx-auto font-light px-6">The most advanced camera system ever, with a 48MP Fusion camera, 48MP Ultra Wide, and the revolutionary tetraprism 10x Telephoto.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                { title: "48MP Main", desc: "Quad-pixel sensor for unmatched detail in any light.", size: "md:col-span-2 h-[220px] sm:h-[300px] md:h-[420px]" },
                { title: "10x Telephoto", desc: "Tetraprism design. The farthest zoom ever.", size: "h-[220px] sm:h-[300px] md:h-[420px]" },
                { title: "48MP Ultra Wide", desc: "Macro photography with autofocus at 2cm.", size: "h-[200px] sm:h-[260px] md:h-[350px]" },
                { title: "Photonic Engine", desc: "Pixel-level fusion in the image pipeline for extraordinary low-light.", size: "md:col-span-2 h-[200px] sm:h-[260px] md:h-[350px]" },
              ].map((c, i) => (
                <div key={i} className={`cam-card ${c.size} bg-gradient-to-br from-[#111113] to-[#0A0A0C] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden group hover:border-[#E8E3DC]/30 transition-colors`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_50%,rgba(232,227,220,0.04),transparent_70%)]" />
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-[#E8E3DC]">{c.title}</h3>
                  <p className="text-white/50 text-sm sm:text-lg md:text-xl font-light max-w-md">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 4: TITANIUM ═══════════════ */}
        <section className="titanium-section relative w-full min-h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-start px-4 sm:px-6 md:px-24 py-16 md:py-0 bg-[#0A0A0C]">
          <div className="titanium-bg absolute inset-0 -top-[20%] h-[140%] w-full flex items-center justify-end pointer-events-none opacity-[0.08]">
            <div className="w-[400px] sm:w-[600px] md:w-[900px] h-[400px] sm:h-[600px] md:h-[900px] rounded-full border-[60px] sm:border-[80px] md:border-[120px] border-white/50 transform translate-x-1/3" />
          </div>
          <div className="titanium-card relative z-10 max-w-2xl bg-black/50 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem]">
            <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 font-semibold">Design &amp; Materials</p>
            <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">Forged in <br />Titanium.</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/60 font-light leading-relaxed">Grade 5 Titanium — the same alloy used in spacecraft. Beautifully fine-brushed. Incredibly light. Extraordinarily durable.</p>
          </div>
        </section>

        {/* ═══════════════ SECTION 5: COLOR PICKER ═══════════════ */}
        <section className="color-section relative z-10 w-full py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 flex flex-col items-center justify-center bg-[#050505]">
          <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 font-semibold">Finishes</p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-6 text-center tracking-tight">
            Pick your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">finish.</span>
          </h2>
          <p className="text-center text-white/40 text-sm sm:text-lg mb-10 sm:mb-16 max-w-2xl mx-auto font-light px-2">Four stunning titanium finishes, each with a unique personality.</p>

          <div className="flex gap-3 sm:gap-6 mb-8 sm:mb-12">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`color-option w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 ${selectedColor.name === c.name ? "ring-2 ring-offset-4 ring-offset-[#050505] scale-110" : "border-white/20"}`}
                style={{ backgroundColor: c.hex, borderColor: selectedColor.name === c.name ? c.ring : undefined }}
                aria-label={c.name}
              />
            ))}
          </div>
          <p className="text-lg sm:text-2xl font-semibold text-white/80 transition-all duration-300">{selectedColor.name}</p>
        </section>

        {/* ═══════════════ SECTION 6: SPECS TABLE ═══════════════ */}
        <section className="spec-section relative z-10 w-full py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 flex items-center justify-center bg-[#050505]">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 text-center font-semibold">Technical Specifications</p>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-8 sm:mb-16 text-center tracking-tight">
              The full <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">picture.</span>
            </h2>
            <div className="border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
              {SPECS.map((s, i) => (
                <div
                  key={i}
                  className={`spec-row flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 px-5 sm:px-8 ${i < SPECS.length - 1 ? "border-b border-white/10" : ""} hover:bg-white/[0.02] transition-colors`}
                >
                  <span className="text-white/40 text-xs sm:text-sm uppercase tracking-widest font-semibold w-full sm:w-40 shrink-0 mb-1 sm:mb-0">{s.label}</span>
                  <span className="text-white/80 text-sm sm:text-lg font-light">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 7: INTELLIGENCE & BATTERY ═══════════════ */}
        <section className="float-section relative z-10 w-full py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-16 flex flex-col items-center justify-center bg-[#050505]">
          <p className="text-[10px] sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#E8E3DC]/40 mb-2 sm:mb-4 font-semibold">Connectivity</p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-12 sm:mb-24 text-center tracking-tight">
            Beyond <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">Smart.</span>
          </h2>
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl">
            {[
              { title: "All-Day Battery Life", desc: "Up to 33hrs video playback. The longest ever.", ml: "" },
              { title: "Generative AI", desc: "On-device Apple Intelligence built right into the chip.", ml: "lg:ml-16" },
              { title: "Wi-Fi 7", desc: "Blazing wireless. Unmatched low latency.", ml: "lg:ml-32" },
              { title: "USB-C / Thunderbolt", desc: "Pro workflows. 40Gbps data transfer.", ml: "lg:ml-16" },
            ].map((f, i) => (
              <div key={i} className={`float-card bg-[#0A0A0C] border border-white/10 rounded-2xl sm:rounded-full py-5 sm:py-7 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-white/20 hover:scale-[1.015] transition-all duration-500 gap-2 sm:gap-0 ${f.ml}`}>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">{f.title}</h3>
                <p className="text-white/50 text-sm sm:text-base md:text-lg font-light sm:max-w-sm sm:text-right">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="relative z-10 py-20 sm:py-32 md:py-40 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-t from-black via-[#050505] to-[#050505]">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 sm:mb-4">Take the leap.</h2>
          <p className="text-base sm:text-xl text-white/40 mb-8 sm:mb-12 max-w-lg font-light">Starting at $1,199. Trade in your current device for credit.</p>
          <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row w-full sm:w-auto px-6 sm:px-0">
            <button className="px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#0071E3] text-white font-semibold text-base sm:text-lg hover:bg-[#0077ED] transition-colors">
              Buy
            </button>
            <button className="px-8 sm:px-10 py-4 sm:py-5 rounded-full border border-[#0071E3] text-[#2997FF] font-semibold text-base sm:text-lg hover:bg-[#0071E3]/10 transition-colors">
              Learn more ›
            </button>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="relative z-10 border-t border-white/10 bg-[#161617] text-white/50 text-xs">
          <div className="max-w-[980px] mx-auto px-4 sm:px-6 pt-4 pb-2">
            <p className="text-[11px] text-white/25 leading-[1.6] pb-4">
              1. iPhone 17 Pro Max is splash, water, and dust resistant and was tested under controlled laboratory conditions with a rating of IP68 under IEC standard 60529 (maximum depth of 6 metres up to 30 minutes). Splash, water and dust resistance are not permanent conditions. 2. Trade-in values will vary based on the condition, year and configuration of your eligible trade-in device.
            </p>

            <div className="border-t border-white/10" />

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8 py-4 sm:py-6 text-center sm:text-left">
              <div>
                <h4 className="text-white/80 font-semibold text-[11px] mb-2 sm:mb-3">Shop and Learn</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[11px] text-white/40">
                  {["Store", "Mac", "iPad", "iPhone", "Watch", "Vision", "AirPods", "Accessories"].map(l => <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-white/80 font-semibold text-[11px] mb-2 sm:mb-3">Services</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[11px] text-white/40">
                  {["Apple Music", "Apple TV+", "Apple Arcade", "iCloud", "Apple One", "Apple Card"].map(l => <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-white/80 font-semibold text-[11px] mb-2 sm:mb-3">Account</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[11px] text-white/40">
                  {["Manage Your Apple ID", "Apple Store Account", "iCloud.com"].map(l => <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-white/80 font-semibold text-[11px] mb-2 sm:mb-3">Apple Store</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[11px] text-white/40">
                  {["Find a Store", "Genius Bar", "Today at Apple", "Financing", "Apple Trade In", "Order Status", "Shopping Help"].map(l => <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-white/80 font-semibold text-[11px] mb-2 sm:mb-3">Apple Values</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[11px] text-white/40">
                  {["Accessibility", "Education", "Environment", "Inclusion and Diversity", "Privacy", "Supplier Responsibility"].map(l => <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>)}
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:py-4 text-[11px] text-white/30 gap-2 sm:gap-3">
              <p>Copyright © 2026 Apple Inc. All rights reserved.</p>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                {["Privacy Policy", "Terms of Use", "Sales and Refunds", "Legal", "Site Map"].map((l, i) => (
                  <span key={l} className="flex items-center gap-2 sm:gap-3">
                    {i > 0 && <span className="text-white/10">|</span>}
                    <a href="#" className="hover:text-white/60 transition-colors">{l}</a>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
