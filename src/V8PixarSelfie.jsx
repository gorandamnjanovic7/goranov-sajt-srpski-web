import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, Zap, Download, PlayCircle, Brain, Diamond, Globe, Image as ImageIcon, ShieldCheck, Star, Palette, Moon, QrCode, Phone, MessageCircle, Copy } from 'lucide-react';
import { v8Toast } from './App';

const BASE_BACKEND_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://goranov-sajt-srpski-backend-production.up.railway.app";

// POČETAK FUNKCIJE: V8PixarSelfiePage
const V8PixarSelfiePage = ({ isAdmin }) => {
  const [unos, setUnos] = useState('');
  const [slika, setSlika] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // V8 MENJAČ
  const [stil, setStil] = useState('pixar');

  // POČETAK FUNKCIJE: bazniPrompt
  const bazniPrompt = (unosTekst, stilTokens) => {
    const template = `Ultra-detailed stylized 3D animation render with Pixar-inspired CGI surface quality BUT with STRICT real-actor facial identity preservation, vertical 3:4 frame.

Scene shows the primary iconic characters from {SHOW_MOVIE_INPUT}, automatically inferred from the original cast, with MAXIMUM likeness accuracy to the real actors who portrayed them.

All characters are positioned tightly together in a bathroom mirror selfie composition.
The central protagonist holds a retro camera toward the mirror while others crowd naturally with dynamic, in-character expressions.

Wardrobe must be 100% screen-accurate to {SHOW_MOVIE_INPUT}.

---

IDENTITY LOCK — CRITICAL (DO NOT BREAK):
same person consistency, fixed facial identity, no variation across faces  
accurate skull structure, jawline, cheekbones, eye spacing, nose shape, lip structure  
preserve actor-specific asymmetry and imperfections (do NOT beautify)  
maintain correct age, ethnicity, and facial proportions  
no generic AI faces, no face averaging, no symmetry correction  
no cartoon exaggeration of facial features  
facial geometry must match real-world human anatomy exactly  

---

LIKELINESS BOOST ENGINE:
trained-on-film-stills look, production still photography reference  
casting-photo accuracy, on-set lighting reference realism  
IMG_0001.CR2 DSLR realism simulation, studio archive capture feel  
subsurface_scattering_skin, micro_skin_detail, pore-level texture  
fine facial hair, natural skin roughness, subtle eye imperfections  
real iris detail, natural eye reflections, no artificial glow  

---

EXPRESSION & BEHAVIOR:
each character must reflect their personality from {SHOW_MOVIE_INPUT}  
natural micro-expressions, not exaggerated cartoon emotions  
authentic interaction between characters (overlapping poses, depth layering)  

---

MIRROR ENVIRONMENT:
realistic bathroom mirror with smudges, fingerprints, toothpaste marks  
bold black handwritten text "{SHOW_MOVIE_INPUT}" visible in reflection  
accurate reflection physics, slight imperfections in mirror surface  

---

RENDER STYLE:
Pixar-inspired rendering ONLY for materials, lighting and shading — NOT for facial structure  
faces must remain semi-photorealistic, grounded in real human anatomy  

---

CAMERA & OPTICS:
shot as mirror reflection using 35mm lens equivalent  
natural perspective distortion, slight handheld feel  
depth of field subtle and realistic  

---

LIGHTING:
soft bathroom practical lighting mixed with flash reflection  
natural skin highlights, realistic shadow falloff  
no overexposed CGI lighting, no plastic shine  

---

OUTPUT QUALITY:
4K resolution, ultra-clean render, no artifacts, no watermark  

---

FINAL V10 STYLE BOOST:
${stilTokens}`;

    return template.replaceAll("{SHOW_MOVIE_INPUT}", unosTekst);
  };
  // KRAJ FUNKCIJE: bazniPrompt

  // POČETAK FUNKCIJE: kreirajRemekDelo
  const kreirajRemekDelo = async () => {
    if (!unos.trim()) {
      if(typeof v8Toast !== 'undefined') v8Toast.error("Moraš uneti ime filma ili serije!");
      return;
    }

    setIsGenerating(true);
    setSlika(null);

    let dodatakStilu = "Premium Pixar 3D Lighting, soft bathroom lighting, natural skin highlights, 8K Resolution";
    if (stil === 'arri') dodatakStilu = "ARRI Alexa 65 cinematic lighting, dramatic shadows, deep contrast, photorealistic details, cinematic color grading, 8K";
    if (stil === 'dark') dodatakStilu = "V8 Dark Mode aesthetic, high contrast, deep black shadows, moody atmosphere, subtle neon orange rim lighting, 8K";

    const finalniReactPrompt = bazniPrompt(unos, dodatakStilu);

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/generisi-pixar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalniReactPrompt,
          aspectRatio: "3:4" 
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Greška na serveru.");
      }

      setSlika(data.imageUrl);
      if(typeof v8Toast !== 'undefined') v8Toast.success("V8 Mašina je isporučila remek-delo!");

    } catch (error) {
      console.error(error);
      if(typeof v8Toast !== 'undefined') v8Toast.error("Greška pri generisanju: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  // KRAJ FUNKCIJE: kreirajRemekDelo

  // POČETAK FUNKCIJE: preuzmiSliku
  const preuzmiSliku = () => {
    if (!slika) return;
    const a = document.createElement('a');
    a.href = slika;
    a.download = `V8_Pixar_${unos.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // KRAJ FUNKCIJE: preuzmiSliku

  // POČETAK FUNKCIJE: kopirajEmail
  const kopirajEmail = () => {
    navigator.clipboard.writeText("aitoolsprosmart@gmail.com"); 
    if(typeof v8Toast !== 'undefined') v8Toast.success("Email je kopiran u beležnicu!");
  };
  // KRAJ FUNKCIJE: kopirajEmail

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 flex flex-col items-center text-white">
      <div className="max-w-[1400px] w-full mx-auto font-sans text-center">
        
        {/* HEADER */}
        <div className="mb-16 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <Camera className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              V8 CINEMATIC STUDIO
            </h1>
          </div>
          <p className="text-orange-500/70 text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em]">
            # POWERED BY V8 ENTERPRISE AI
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-6 w-full">
          
          {/* LEVA KOLONA */}
          <div className="w-full lg:w-[28%] flex flex-col text-left space-y-8 pt-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">VIZIONARSKI POGLED<br/><span className="text-orange-500">ZA VAŠ BREND</span></h2>
              <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Privucite pažnju premium klijenata vizualima koji pomeraju granice mogućeg.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Brain className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">REVOLUCIONARNA AI MOĆ</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Pretvorite bilo koji film ili seriju u nezaboravne, interaktivne kampanje koje generišu enorman angažman publike.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Diamond className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">UNIKATNO BRENDIRANJE</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Stvorite prepoznatljive 4K vizuale koji se ne mogu imitirati, apsolutno podižući vizuelni identitet vaše kompanije.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Globe className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">GLOBALNI ODJEK</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Iskoristite snagu globalne pop kulture za instantno prepoznavanje, poverenje i lojalnost vaših premium klijenata.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SREDNJA KOLONA: APLIKACIJA */}
          <div className="w-full lg:w-[44%] bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-6 shadow-[0_0_40px_rgba(234,88,12,0.1)] relative flex flex-col items-center">
            
            <div className="w-full mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 text-left pl-2">Bioskopski Univerzum</label>
              <div className="relative">
                <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                <input 
                  type="text" 
                  value={unos}
                  onChange={(e) => setUnos(e.target.value)}
                  placeholder="NPR: GLADIATOR, MATRIX, VIKINGS..." 
                  className="w-full bg-[#050505] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-[14px] font-black uppercase outline-none focus:border-orange-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* V8 PREMIUM STIL RENDEROVANJA */}
            <div className="w-full mb-6">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setStil('pixar')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${stil === 'pixar' ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-[#050505] border-white/5 hover:border-orange-500/30'}`}>
                  <Star className={`w-4 h-4 mb-1.5 ${stil === 'pixar' ? 'text-orange-500' : 'text-zinc-500'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${stil === 'pixar' ? 'text-orange-400' : 'text-zinc-500'}`}>Klasik Pixar</span>
                </button>
                <button onClick={() => setStil('arri')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${stil === 'arri' ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-[#050505] border-white/5 hover:border-orange-500/30'}`}>
                  <Palette className={`w-4 h-4 mb-1.5 ${stil === 'arri' ? 'text-orange-500' : 'text-zinc-500'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${stil === 'arri' ? 'text-orange-400' : 'text-zinc-500'}`}>Arri Look</span>
                </button>
                <button onClick={() => setStil('dark')} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${stil === 'dark' ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-[#050505] border-white/5 hover:border-orange-500/30'}`}>
                  <Moon className={`w-4 h-4 mb-1.5 ${stil === 'dark' ? 'text-orange-500' : 'text-zinc-500'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${stil === 'dark' ? 'text-orange-400' : 'text-zinc-500'}`}>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* OKVIR ZA PRIKAZ SLIKE */}
            <div className="relative w-full aspect-[3/4] max-w-[380px] mx-auto bg-[#050505] border-2 border-orange-500/20 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.15)] mb-6 group">
              
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                   <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                   <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse text-center">V10 Rekonstrukcija...</p>
                </div>
              ) : slika ? (
                <>
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    src={slika} 
                    alt="V8 Pixar Selfie" 
                    className="w-full h-full object-cover" 
                  />

                  {/* 🚨 V8 PAYWALL (STAKLO PREKO SLIKE ZA KLIJENTE) 🚨 */}
                  {!isAdmin && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[6px] p-4 animate-in fade-in duration-700">
                      
                      {/* IPS QR MODAL */}
                      <div className="bg-[#0a0a0a]/95 border border-orange-500/50 rounded-3xl p-5 flex flex-col items-center shadow-[0_0_40px_rgba(234,88,12,0.4)] w-full max-w-[280px]">
                        <div className="bg-white p-2 rounded-xl mb-3 w-full flex justify-center shadow-inner">
                          {/* 🔧 GORANE: ZAMENI OVO SVOJIM QR KODOM: <img src="/tvoj-qr-kod.png" className="w-32 h-32" /> */}
                          <QrCode className="w-32 h-32 text-black" /> 
                        </div>
                        
                        <h3 className="text-orange-500 font-black tracking-widest text-[16px] mb-1">IPS SKENIRAJ</h3>
                        <p className="text-zinc-300 text-[10px] font-bold mb-5 uppercase tracking-widest text-center">
                          Otključaj i preuzmi 4K<br/>rezoluciju (350 RSD)
                        </p>

                        {/* KONTAKT DUGMIĆI */}
                        <div className="w-full flex justify-between gap-2 border-t border-white/10 pt-4">
                          <a href="viber://chat?number=%2B381648201496" className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl bg-[#7360f2]/10 text-[#7360f2] hover:bg-[#7360f2]/30 border border-[#7360f2]/30 transition-colors">
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Viber</span>
                          </a>
                          <a href="https://wa.me/381648201496" target="_blank" rel="noreferrer" className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 transition-colors">
                            <Phone className="w-5 h-5 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">WApp</span>
                          </a>
                          <button onClick={kopirajEmail} className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/30 border border-orange-500/30 transition-colors">
                            <Copy className="w-5 h-5 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Email</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DUGME ZA PREUZIMANJE (VIDI SE SAMO KAD JE ADMIN / OTKLJUČANO) */}
                  {isAdmin && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button onClick={preuzmiSliku} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.6)] flex items-center gap-2 hover:scale-105 transition-transform">
                        <Download className="w-4 h-4" /> PREUZMI 4K VIZUAL
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-30">
                   <Camera className="w-12 h-12 text-zinc-500" />
                   <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest text-center px-4">Unesi ime filma iznad</p>
                </div>
              )}
            </div>

            <button 
              onClick={kreirajRemekDelo} 
              disabled={isGenerating || !unos}
              className="w-full max-w-[380px] bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "PROCESIRANJE..." : "KREIRAJ REMEK-DELO (350 RSD)"}
            </button>
          </div>

          {/* DESNA KOLONA: TRANSFORMACIJA */}
          <div className="w-full lg:w-[28%] flex flex-col text-left space-y-8 pt-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">TRANSFORMACIJA:<br/><span className="text-orange-500">IDEJA U STVARNOST</span></h2>
              <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Superiorni rezultati bez tehničkih kompromisa.</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><ImageIcon className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">POVERENJE PRE KUPOVINE</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Prozirnost i poverenje su V8 standard. Vidite punu kreativnost vizuala u visokoj rezoluciji pre nego što uložite novac, uz samo centralno IPS preklapanje.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Zap className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">TRENUTNI REZULTATI</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Nema dugotrajnog čekanja agencija. Naš V8 AI endžin isporučuje premium kvalitet vizuala u roku od nekoliko sekundi.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><ShieldCheck className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">MAKSIMALNA SIGURNOST</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">Plaćanje se vrši isključivo putem zvaničnog i sigurnog IPS QR sistema. Vaši podaci i transakcije ostaju potpuno zaštićeni.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
// KRAJ FUNKCIJE: V8PixarSelfiePage

export default V8PixarSelfiePage;