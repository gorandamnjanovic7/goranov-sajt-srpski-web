// React Source Code Link: frontend/src/pages/V8PixarSelfie.jsx
import React, { useState } from 'react';
import { Camera, Lock, Star, Palette, Flame, Clapperboard, Sparkles } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// POČETAK FUNKCIJE: V8PixarSelfiePage
const V8PixarSelfiePage = ({ isAdmin }) => {
  const [filmSerija, setFilmSerija] = useState('');
  const [izabranStil, setIzabranStil] = useState('pixar_classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const cena = "350 RSD"; 

  // POČETAK FUNKCIJE: bazniPrompt
  const bazniPrompt = (unos, stilTokens) => {
    return `Ultra-detailed stylized 3D animation render in a Disney/Pixar-inspired CGI look, vertical 3:4 frame. Scene shows the main iconic characters from ${unos} taking a fun, messy bathroom mirror selfie. The most recognizable character holds a large retro camera toward the mirror while the rest crowd tightly around, filling the frame with energetic, playful expressions matching their signature personalities. All characters wear their classic outfits accurate to ${unos}. Faces are slightly cartoon-stylized with expressive eyes but keep original hairstyles, colors, and defining features. Mirror includes light smudges and toothpaste marks, with bold black animated lettering reading "${unos}" visible in reflection. Bathroom environment matches the theme of ${unos} with fitting props and small easter eggs placed naturally. Use soft bathroom lighting mixed with bright flash reflection, warm cinematic color grading, smooth highlights, high-end Pixar-style shading, sharp 4K quality, no watermark. ${stilTokens}`;
  };
  // KRAJ FUNKCIJE: bazniPrompt

  const stilovi = {
    pixar_classic: { ime: "Klasik Pixar 3D", tokens: "Disney Pixar CGI look, warm lighting.", ikonica: Star },
    cinema_arri: { ime: "Arri Look", tokens: "ALTERNATIVE CINEMA MODE: ARRI Alexa 35, Panavision anamorphic 40mm T2.0, soft edge falloff, cinematic lens breathing, anamorphic bokeh stretch.", ikonica: Palette },
    v8_dark_mode: { ime: "V8 Dark Mode", tokens: "SPECIAL V8 DARK MODE: Black matte surfaces, glowing orange neon accents, dramatic cinematic shadows.", ikonica: Flame }
  };

  // POČETAK FUNKCIJE: handleGenerisi
  const handleGenerisi = async (bypass = false) => {
    if (!filmSerija) return;
    setIsGenerating(true);
    if (bypass) setIsPaid(true);
    try {
      const resp = await fetch("http://localhost:5000/api/generisi-pixar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: bazniPrompt(filmSerija, stilovi[izabranStil].tokens) })
      });
      const data = await resp.json();
      if (data.imageUrl) {
        setRezultat(data.imageUrl);
      } else {
        alert("Greška na serveru.");
      }
    } catch (e) { 
      alert("Server nije dostupan."); 
    } finally { 
      setIsGenerating(false); 
    }
  };
  // KRAJ FUNKCIJE: handleGenerisi

  return (
    <div className="min-h-screen bg-[#050505] pt-20 pb-24 px-4 flex flex-col items-center font-sans text-white relative overflow-hidden">
      
      {/* V8 Ambient Glow u pozadini */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Sekcija */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3 flex items-center justify-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">
          <Camera className="w-10 h-10 text-orange-500" /> PIXAR SELFIE MEJKER
        </h1>
        <div className="flex items-center justify-center gap-2 text-orange-500/80 text-xs font-bold tracking-[0.3em] uppercase">
          <Sparkles className="w-3 h-3" /> Powered by V8 Studijo
        </div>
      </div>

      {/* Glavna Kartica */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-orange-500/20 rounded-[2.5rem] p-8 md:p-12 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(234,88,12,0.05)] relative z-10">
        
        {!rezultat && !isGenerating ? (
          <div className="space-y-8">
            
            {/* Input Polje */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Unesite ime filma ili serije</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Clapperboard className="h-5 w-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input 
                  className="w-full bg-black/50 border border-white/10 py-5 pl-14 pr-6 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white text-lg transition-all placeholder:text-zinc-600 shadow-inner"
                  placeholder="Npr. Gladiator, Peaky Blinders..."
                  value={filmSerija}
                  onChange={(e) => setFilmSerija(e.target.value)}
                />
              </div>
            </div>

            {/* Grid Stilova */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Odaberite V8 Stil</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.keys(stilovi).map(s => {
                  const isActive = izabranStil === s;
                  return (
                    <button 
                      key={s} 
                      onClick={() => setIzabranStil(s)} 
                      className={`relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-[11px] uppercase tracking-widest font-black
                        ${isActive 
                          ? 'border-orange-500 bg-gradient-to-b from-orange-500/20 to-transparent text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.2)] scale-[1.02]' 
                          : 'border-white/5 bg-black/40 text-zinc-500 hover:border-orange-500/30 hover:text-zinc-300 hover:bg-black/60'
                        }`}
                    >
                      {React.createElement(stilovi[s].ikonica, { className: `w-6 h-6 ${isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]' : 'text-zinc-600'}` })} 
                      {stilovi[s].ime}
                      
                      {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,1)] animate-pulse"></div>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Glavno V8 Dugme */}
            <div className="pt-4">
              <button 
                onClick={() => handleGenerisi(false)} 
                disabled={filmSerija.length < 3} 
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3
                  ${filmSerija.length < 3 
                    ? 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] hover:scale-[1.02]'
                  }`}
              >
                Napravi moj selfie ({cena})
              </button>
              
              {isAdmin && (
                <button onClick={() => handleGenerisi(true)} className="w-full mt-4 py-3 border-2 border-red-600/30 text-red-500 hover:bg-red-600/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  🔥 Admin Bypass (Besplatno)
                </button>
              )}
            </div>
          </div>

        ) : isGenerating ? (
          <div className="py-24 flex flex-col items-center gap-8 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 border-4 border-orange-500/20 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(234,88,12,0.5)]"></div>
              <Flame className="absolute text-orange-500 animate-pulse" />
            </div>
            <p className="text-orange-500 font-black tracking-[0.3em] uppercase text-sm animate-pulse drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]">
              V8 Sistem Generiše...
            </p>
          </div>
          
        ) : (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-orange-500/20 aspect-[3/4] w-full max-w-[420px] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <img src={rezultat} className="w-full h-full object-cover" alt="V8 Rezultat" />
              
              {!isPaid && !isAdmin && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-[#050505] border border-orange-500/30 p-8 rounded-3xl flex flex-col items-center shadow-[0_0_30px_rgba(234,88,12,0.2)]">
                    <Lock className="w-10 h-10 text-orange-500 mb-6 drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                    <p className="text-sm font-black uppercase tracking-widest mb-6 text-white">
                      Skeniraj za otključavanje <br/><span className="text-orange-500">({cena})</span>
                    </p>
                    <div className="bg-white p-3 rounded-2xl mb-2">
                      <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran|I:RSD350,00|S:CinematicSelfie`} size={150} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setRezultat(null)} 
              className="text-zinc-500 uppercase tracking-widest text-xs font-black underline underline-offset-8 hover:text-orange-500 transition-colors"
            >
              Generiši novu sliku
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// KRAJ FUNKCIJE: V8PixarSelfiePage

export default V8PixarSelfiePage;