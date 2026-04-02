import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Crown, CheckCircle, Zap, Play, Rocket, TrendingUp, Cpu, Crosshair } from 'lucide-react';

const V8Promo10xPage = () => {
  // --- 1. RADAR ZA BAZU ---
  const [promoData, setPromoData] = useState({ images: [], promoText: "" });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "v8_settings", "promo10x"), (doc) => {
      if (doc.exists()) {
        setPromoData(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const images = promoData?.images?.length > 0 
    ? promoData.images 
    : ['/v8-poster.jpg']; 

  // --- 2. VIDEO PODACI I KONTROLA ---
  const videoUrl = "/v8-reklama.mp4";
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Funkcija koja pali video kad klijent klikne Play
  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Funkcija koja gasi video kad dođe do kraja i vraća poster
  const handleVideoEnded = () => {
    setIsPlaying(false); 
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* GLAVNI NASLOVI */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-16 mt-10">
        <div className="inline-flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 px-5 py-2.5 rounded-full text-orange-500 text-[11px] font-black uppercase tracking-[0.2em] mb-8">
          <Crown className="w-4 h-4" /> Ekskluzivna V8 Premijera
        </div>

        <h1 className="text-3xl md:text-5xl font-serif italic tracking-wide leading-[1.2] mb-6 text-zinc-100">
          Pretvori prosečne ideje u <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-black not-italic drop-shadow-md tracking-tighter uppercase">
            Remek-Dela za 3 Sekunde.
          </span>
        </h1>

        <div className="max-w-4xl mx-auto font-light leading-relaxed mb-14 flex flex-col gap-5 text-center">
          <p className="text-zinc-300 text-[15px] md:text-[17px]">
            Zaboravi na amaterske greške i sate izgubljene u pokušajima. <strong className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-black drop-shadow-sm text-[16px] md:text-[18px]">V8 Master Engine</strong> direktno preuzima tvoju sirovu viziju i generiše hipnotišuće 4K vizuale.
          </p>
        </div>

        {/* --- POČETAK NAFILOVANOG TEKSTA --- */}
        <div className="max-w-4xl mx-auto font-light leading-relaxed mb-12 flex flex-col gap-6 text-center px-4">
          <p className="text-zinc-300 text-[16px] md:text-[19px] leading-relaxed">
            Zaboravi na amaterske greške, preplaćene dizajnere i sate izgubljene u beskrajnim pokušajima. Tvoje vreme je najskuplji resurs. 
            <strong className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-black drop-shadow-[0_0_12px_rgba(255,69,0,0.4)] text-[18px] md:text-[22px] mx-2 tracking-wide uppercase inline-block hover:scale-105 transition-transform cursor-default">
              V8 Master Engine
            </strong> 
            ne pita za objašnjenja – on direktno preuzima tvoju sirovu viziju, ubacuje je u najviši stepen prenosa i u realnom vremenu generiše hipnotišuće 4K vizuale koji dominiraju tržištem.
          </p>
          <p className="text-zinc-500 text-[14px] md:text-[16px] font-medium tracking-wide">
            Bez kompromisa. Bez skrivenih troškova. Samo čista, surova snaga na tvoj klik.
          </p>
        </div>

        {/* --- PREMIUM ANIMIRANI BEDŽEVI --- */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[11px] md:text-[13px] font-black tracking-[0.15em] uppercase mb-20">
          
          <div className="group flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 hover:border-green-500/50 px-5 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(34,197,94,0.15)] cursor-default">
            <Crosshair className="w-5 h-5 text-green-500 group-hover:rotate-90 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> 
            <span className="text-zinc-400 group-hover:text-white transition-colors">99.8% Preciznost</span>
          </div>

          <div className="group flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 hover:border-orange-500/50 px-5 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(249,115,22,0.15)] cursor-default">
            <Cpu className="w-5 h-5 text-orange-500 group-hover:animate-pulse transition-transform duration-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" /> 
            <span className="text-zinc-400 group-hover:text-white transition-colors">V8 Arhitektura</span>
          </div>

          <div className="group flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 hover:border-blue-500/50 px-5 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)] cursor-default">
            <Rocket className="w-5 h-5 text-blue-500 group-hover:-translate-y-1.5 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
            <span className="text-zinc-400 group-hover:text-white transition-colors">0.3s Odziv</span>
          </div>

          <div className="group flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 hover:border-yellow-500/50 px-5 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(234,179,8,0.15)] cursor-default">
            <TrendingUp className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" /> 
            <span className="text-zinc-400 group-hover:text-white transition-colors">10X Konverzija</span>
          </div>

        </div>

      </div>

      {/* --- PAMETNI VIDEO PLEJER --- */}
      <div className="max-w-4xl mx-auto px-6 mb-24 relative group">
        <div className="w-full aspect-video relative p-[2px] rounded-[2rem] overflow-hidden bg-black">
          
          <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] v8-ai-aura opacity-70 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
          
          <div className="relative w-full h-full bg-black rounded-[calc(2rem-2px)] overflow-hidden z-10 flex items-center justify-center">
            
            {/* OVERLAY: POSTER + MANJA PLAY IKONICA */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group/play"
                onClick={handlePlayVideo}
              >
                <img src="/v8-poster.jpg" alt="V8 Poster" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/play:opacity-40 transition-opacity" />
                
                <div className="relative z-30 bg-orange-500/90 p-4 rounded-full border border-orange-400 shadow-[0_0_20px_rgba(255,69,0,0.6)] group-hover/play:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            <video 
              ref={videoRef}
              controls={isPlaying} 
              muted 
              playsInline 
              onEnded={handleVideoEnded} 
              className="w-full h-full object-cover"
              poster="/v8-poster.jpg" 
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>

          <div className="absolute -inset-4 animate-[spin_4s_linear_infinite] v8-ai-aura opacity-20 group-hover:opacity-50 blur-2xl transition-opacity duration-700 pointer-events-none z-0"></div>
        </div>
      </div>

      {/* --- V8 BESKONAČNA TRAKA --- */}
      <div className="w-full mb-20 overflow-hidden bg-black/50 py-10 border-y border-white/5">
        <h3 className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 text-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)]"></span>
          </span>
          Live V8 Stream Vizuala
        </h3>
        
       <div className="v8-slider-container-small flex overflow-hidden">
          {/* Usporavanje trake na 120s i pauza kad se pređe mišem */}
          <div className="v8-track-fast flex w-max hover:[animation-play-state:paused] transition-all" style={{ animationDuration: '150s' }}>
            {/* Prvi set slika */}
            {images.map((imgUrl, idx) => (
              <div key={`v8-1-${idx}`} className="relative p-[2px] rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-110 shrink-0 w-[200px] md:w-[280px] aspect-video cursor-pointer mx-3">
                <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-orange-600 via-transparent to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full w-full rounded-[14px] overflow-hidden bg-[#050505] z-10">
                  <img src={imgUrl} alt={`V8 Vizual ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="absolute -inset-4 animate-[spin_3s_linear_infinite] bg-gradient-to-r from-orange-600 to-blue-600 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700 pointer-events-none z-0"></div>
              </div>
            ))}
            
            {/* Drugi set slika (za beskonačan loop) */}
            {images.map((imgUrl, idx) => (
              <div key={`v8-2-${idx}`} className="relative p-[2px] rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-110 shrink-0 w-[200px] md:w-[280px] aspect-video cursor-pointer mx-3">
                <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-orange-600 via-transparent to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative h-full w-full rounded-[14px] overflow-hidden bg-[#050505] z-10">
                  <img src={imgUrl} alt={`V8 Vizual ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="absolute -inset-4 animate-[spin_3s_linear_infinite] bg-gradient-to-r from-orange-600 to-blue-600 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700 pointer-events-none z-0"></div>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
};

export default V8Promo10xPage;