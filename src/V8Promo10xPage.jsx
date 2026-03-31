import React, { useState } from 'react';
import { Crown, CheckCircle } from 'lucide-react';

// POČETAK FUNKCIJE: V8Promo10xPage
const V8Promo10xPage = ({ promoData }) => {
  // Sigurnosne provere za slike u galeriji
  const mediaStrip = promoData?.images || [
    'https://images.unsplash.com/photo-1620041700421-7a1c342ea42e?q=80&w=500&auto=format&fit=crop'
  ];

  // POČETAK FUNKCIJE: V8 Hardkodovani Drive Video
  const DRIVE_FILE_ID = '1gP3eJNzfg79y0K4sG0cObwYdAPixJqej'; 
  const videoUrl = "/v8-reklama.mp4";
  // KRAJ FUNKCIJE: V8 Hardkodovani Drive Video

  const [activeMedia, setActiveMedia] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* POČETAK FUNKCIJE: Glavni Kontejner sa Tekstom */}
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

        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[12px] md:text-[14px] font-black tracking-widest uppercase mb-16">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> 99.8% Preciznost
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" /> V8 Arhitektura
          </span>
        </div>

      </div>
      {/* KRAJ FUNKCIJE: Glavni Kontejner sa Tekstom */}

      {/* POČETAK FUNKCIJE: Animirani Glavni Video Plejer sa Posterom */}
      <div className="max-w-4xl mx-auto px-6 mb-24 relative group">
        <div className="w-full aspect-video relative p-[2px] rounded-[2rem] overflow-hidden bg-black">
          
          {/* ROTIRAJUĆA V8 AURA */}
          <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] v8-ai-aura opacity-70 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
          
          {/* KONTEJNER ZA VIDEO */}
          <div className="relative w-full h-full bg-black rounded-[calc(2rem-2px)] overflow-hidden z-10">
            <video 
              controls 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
              poster="/v8-poster.jpg" 
            >
              <source src={videoUrl} type="video/mp4" />
              Vaš pretraživač ne podržava video tag.
            </video>
          </div>

          {/* DODATNI SJAJ OKO PLEJERA */}
          <div className="absolute -inset-4 animate-[spin_4s_linear_infinite] v8-ai-aura opacity-20 group-hover:opacity-50 blur-2xl transition-opacity duration-700 pointer-events-none z-0"></div>
          
        </div>
      </div>
      {/* KRAJ FUNKCIJE: Animirani Glavni Video Plejer sa Posterom */}

      {/* POČETAK FUNKCIJE: Galerija */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 border-b border-white/5 pb-4 text-center">
          Galerija Tvojih Vizuala
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {Array.isArray(mediaStrip) && mediaStrip.map((imgUrl, idx) => (
            <img 
              key={idx} 
              src={imgUrl} 
              alt={`V8 Vizual ${idx + 1}`} 
              className="h-48 w-auto rounded-xl border border-white/10 object-cover shrink-0 cursor-pointer hover:border-orange-500 transition-colors"
              onClick={() => setActiveMedia(imgUrl)}
            />
          ))}
        </div>
      </div>
      {/* KRAJ FUNKCIJE: Galerija */}

    </div>
  );
};

export default V8Promo10xPage;
// KRAJ FUNKCIJE: V8Promo10xPage