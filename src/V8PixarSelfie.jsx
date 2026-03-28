// React Source Code Link: frontend/src/pages/V8PixarSelfie.jsx
import React, { useState } from 'react';
import { Camera, Lock, Star, Palette, Flame, Clapperboard, Sparkles, Brain, Diamond, Globe, Zap, ShieldCheck, Image as ImageIcon, X, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// POČETAK FUNKCIJE: V8PixarSelfiePage
const V8PixarSelfiePage = ({ isAdmin }) => {
  const [filmSerija, setFilmSerija] = useState('');
  const [izabranStil, setIzabranStil] = useState('pixar_classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const cena = "350 RSD"; 

  // --- V8 SENZOR ZA AUTOMATSKU DETEKCIJU SERIVERA ---
  const BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:5000" 
    : "https://goranov-sajt-srpski-backend-production.up.railway.app";

  // POČETAK FUNKCIJE: bazniPrompt
  const bazniPrompt = (unos, stilTokens) => {
    const template = `Ultra-detailed stylized 3D animation render with strong real-actor likeness preservation, inspired by Disney/Pixar CGI but grounded in semi-realistic human facial reconstruction, vertical 3:4 frame.

Scene shows the primary iconic characters from {SHOW_MOVIE_INPUT}, automatically inferred and generated based on the original film/series cast, with high resemblance to the actors who portrayed them.

The system must identify and reconstruct the most recognizable characters from {SHOW_MOVIE_INPUT} using widely known visual identity, without explicitly naming them.

The central protagonist (most recognizable lead from {SHOW_MOVIE_INPUT}) holds a large retro camera toward a mirror, while supporting characters gather tightly around, forming a dynamic, playful group selfie with expressions consistent with their personalities and relationships from the original story.

All characters wear their screen-accurate outfits from {SHOW_MOVIE_INPUT}, with correct materials, textures, historical or narrative accuracy.

FACES — CRITICAL:
preserve strong actor likeness, accurate facial structure, bone proportions, age accuracy, skin tone, natural asymmetry, recognizable identity traits,
avoid generic AI faces, avoid over-stylization, avoid face distortion,
Pixar-style influence must be subtle and applied only to expression, not identity.

Mirror includes realistic smudges, toothpaste marks, and imperfections, with bold black handwritten-style text "{SHOW_MOVIE_INPUT}" visible in reflection.

Bathroom environment is context-aware and adapted to the world of {SHOW_MOVIE_INPUT}, including appropriate props, materials, and subtle easter eggs.

---

CAMERA:
cinematic capture, 50mm lens equivalent, natural perspective, shallow depth of field, focus on mirror reflection, realistic optical behavior

LIGHTING:
soft bathroom lighting mixed with strong flash reflection, natural skin highlights, realistic light bounce, cinematic contrast

---

ACTOR LIKENESS ENFORCEMENT:
based on original cast of {SHOW_MOVIE_INPUT},
high resemblance priority,
identity lock,
facial structure fidelity,
no random face generation,
no reinterpretation

---

RENDER QUALITY:
4K, high detail, clean CGI shading, realistic skin texture, no watermark

---
FINAL V8 STYLE BOOST: ${stilTokens}`;

    const prompt = template.replaceAll("{SHOW_MOVIE_INPUT}", unos);
    return prompt;
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
    // Ako Admin klikne bypass, slika se odmah tretira kao plaćena i otključana
    if (bypass) setIsPaid(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/generisi-pixar`, {
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

  // POČETAK FUNKCIJE: handleDownload
  const handleDownload = async () => {
    if (!rezultat) return;
    try {
      const backendDownloadUrl = `${BASE_URL}/api/download-sliku?url=${encodeURIComponent(rezultat)}`;
      const response = await fetch(backendDownloadUrl);
      
      if (!response.ok) throw new Error("Backend nije uspeo da isporuči fajl");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `V8_Cinematic_Render_${Date.now()}.png`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("V8 Greška pri downloadu:", error);
      // Fallback
      const link = document.createElement('a');
      link.href = rezultat;
      link.download = `V8_Cinematic_Render_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  // KRAJ FUNKCIJE: handleDownload

  return (
    <div className="min-h-screen bg-[#050505] pt-20 pb-24 px-4 flex flex-col items-center font-sans text-white relative overflow-hidden">
      
      {/* V8 Ambient Glow u pozadini */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header Sekcija */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3 flex items-center justify-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">
          <Camera className="w-10 h-10 text-orange-500" /> V8 CINEMATIC STUDIO
        </h1>
        <div className="flex items-center justify-center gap-2 text-orange-500/80 text-xs font-bold tracking-[0.3em] uppercase">
          <Sparkles className="w-3 h-3" /> Powered by V8 Enterprise AI
        </div>
      </div>

      {/* Glavni Layout: Levi tekst - Centar - Desni tekst */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col xl:flex-row items-stretch justify-center gap-8 xl:gap-12 relative z-10">
        
        {/* LEVA KOLONA */}
        <div className="flex-1 flex flex-col justify-center space-y-8 bg-gradient-to-br from-black/60 to-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl xl:max-w-[380px] order-2 xl:order-1">
          <div className="text-center xl:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Vizionarski Pogled <br/><span className="text-orange-500">Za Vaš Brend</span></h2>
            <p className="text-zinc-400 text-sm">Privucite pažnju premium klijenata vizualima koji pomeraju granice mogućeg.</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Revolucionarna AI Moć</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Pretvorite bilo koji film ili seriju u nezaboravne, interaktivne kampanje koje generišu enorman angažman publike.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <Diamond className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Unikatno Brendiranje</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Stvorite prepoznatljive 4K vizuale koji se ne mogu imitirati, apsolutno podižući vizuelni identitet vaše kompanije.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Globalni Odjek</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Iskoristite snagu globalne pop kulture za instantno prepoznavanje, poverenje i lojalnost vaših premium klijenata.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTRALNA KOLONA */}
        <div className="flex-none w-full xl:w-[600px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-orange-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(234,88,12,0.05)] order-1 xl:order-2">
          
          {!rezultat && !isGenerating ? (
            <div className="space-y-8">
              
              {/* Input Polje sa X dugmetom */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Bioskopski Univerzum</label>
                <div className="relative group flex items-center">
                  <div className="absolute left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Clapperboard className="h-5 w-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input 
                    className="w-full bg-[#050505] border border-white/10 py-5 pl-14 pr-16 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white text-lg transition-all placeholder:text-zinc-600 shadow-inner"
                    placeholder="Npr. Gladiator, Peaky Blinders..."
                    value={filmSerija}
                    onChange={(e) => setFilmSerija(e.target.value)}
                  />
                  {/* Taster X - Pojavljuje se samo kada ima unetog teksta */}
                  {filmSerija && (
                    <button 
                      onClick={() => setFilmSerija('')}
                      className="absolute right-4 p-2 text-zinc-400 hover:text-orange-500 transition-colors z-20"
                      title="Obriši unos"
                    >
                      <X className="w-5 h-5 animate-pulse" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Stilova */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">V8 Premium Stil Renderovanja</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.keys(stilovi).map(s => {
                    const isActive = izabranStil === s;
                    return (
                      <button 
                        key={s} 
                        onClick={() => setIzabranStil(s)} 
                        className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black
                          ${isActive 
                            ? 'border-orange-500 bg-gradient-to-b from-orange-500/20 to-transparent text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.2)] scale-[1.02]' 
                            : 'border-white/5 bg-black/40 text-zinc-500 hover:border-orange-500/30 hover:text-zinc-300 hover:bg-black/60'
                          }`}
                      >
                        {React.createElement(stilovi[s].ikonica, { className: `w-5 h-5 ${isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]' : 'text-zinc-600'}` })} 
                        <span className="text-center">{stilovi[s].ime}</span>
                        {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,1)] animate-pulse"></div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Glavno V8 Dugme */}
              <div className="pt-2">
                <button 
                  onClick={() => handleGenerisi(false)} 
                  disabled={filmSerija.length < 3} 
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3
                    ${filmSerija.length < 3 
                      ? 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] hover:scale-[1.02]'
                    }`}
                >
                  Kreiraj remek-delo ({cena})
                </button>
                
                {isAdmin && (
                  <button onClick={() => handleGenerisi(true)} className="w-full mt-4 py-3 border border-red-600/20 text-red-500 hover:bg-red-600/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    🔥 Admin Bypass
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
              <p className="text-orange-500 font-black tracking-[0.3em] uppercase text-sm animate-pulse drop-shadow-[0_0_10px_rgba(234,88,12,0.5)] text-center">
                V8 Engine Rekonstruiše<br/><span className="text-xs text-orange-500/60 mt-2 block">Molimo sačekajte...</span>
              </p>
            </div>
            
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-orange-500/30 aspect-[3/4] w-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* 100% CISTA SLIKA - Bez ikakvih tamnih layera */}
                <img src={rezultat} className="w-full h-full object-cover" alt="V8 Rezultat" />
                
                {/* AKO NIJE PLAĆENO: Prikazuje se QR Kod box na čistoj slici */}
                {!isPaid && !isAdmin && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4"> 
                    {/* Boks blokira samo sredinu, sada malo veći da stane tekst */}
                    <div className="pointer-events-auto bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 border border-orange-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl w-full max-w-[340px]">
                      <Lock className="w-8 h-8 text-orange-500 mb-3 drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                      <p className="text-[11px] font-black uppercase tracking-widest mb-3 text-white leading-relaxed text-center">
                        OTKLJUČAJ PUN REZULTAT <br/><span className="text-orange-500 text-sm">({cena})</span>
                      </p>
                      
                      <div className="bg-white p-2.5 rounded-2xl mb-4 hover:scale-105 transition-transform duration-300 shadow-inner">
                        <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${cena.replace(/\D/g, '')},00|SF:289|S:V8CinematicRender`} size={130} />
                      </div>

                      {/* TEKSTUALNI PODACI ZA UPLATU */}
                      <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 mb-2 text-left space-y-1.5 font-mono shadow-inner">
                         <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[9px] text-zinc-500 uppercase">Primalac:</span>
                            <span className="text-[9px] font-bold text-white">Goran Damnjanović</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[9px] text-zinc-500 uppercase">Račun:</span>
                            <span className="text-[9px] font-bold text-white">265-0000006535770-83</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[9px] text-zinc-500 uppercase">Svrha:</span>
                            <span className="text-[9px] font-bold text-white truncate max-w-[120px]">V8 Cinematic</span>
                         </div>
                         <div className="flex justify-between pt-0.5">
                            <span className="text-[9px] text-zinc-500 uppercase">Iznos:</span>
                            <span className="text-[11px] font-black text-orange-500">{cena}</span>
                         </div>
                      </div>

                      <p className="text-[9px] text-zinc-500 mt-2 uppercase font-bold tracking-widest text-center">Nakon uplate, sliku odmah dobijate na email/viber</p>
                    </div>
                  </div>
                )}

                {/* AKO JE PLAĆENO ILI JE ADMIN: Prikazuje se dugme za Download na dnu */}
                {(isPaid || isAdmin) && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                    <button 
                      onClick={handleDownload}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.6)] flex items-center gap-3 transition-transform hover:scale-105"
                    >
                      <Download className="w-5 h-5" />
                      Preuzmi 4K Vizual
                    </button>
                  </div>
                )}
                
              </div>
              <button 
                onClick={() => {
                  setRezultat(null);
                  setIsPaid(false); // Reset statusa plaćanja za novu sliku
                }} 
                className="text-zinc-500 uppercase tracking-widest text-[11px] font-black underline underline-offset-8 hover:text-orange-500 transition-colors"
              >
                ← Generiši novi vizual
              </button>
            </div>
          )}
        </div>

        {/* DESNA KOLONA */}
        <div className="flex-1 flex flex-col justify-center space-y-8 bg-gradient-to-bl from-black/60 to-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] shadow-2xl xl:max-w-[380px] order-3">
          <div className="text-center xl:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Transformacija: <br/><span className="text-orange-500">Ideja u Stvarnost</span></h2>
            <p className="text-zinc-400 text-sm">Superiorni rezultati bez tehničkih kompromisa.</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Poverenje pre Kupovine</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Prozirnost i poverenje su V8 standard. Vidite punu kreativnost vizuala u visokoj rezoluciji pre nego što uložite novac, uz samo centralno IPS preklapanje.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Trenutni Rezultati</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Nema dugotrajnog čekanja agencija. Naš V8 AI endžin isporučuje premium kvalitet vizuala u roku od nekoliko sekundi.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Maksimalna Sigurnost</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Plaćanje se vrši isključivo putem zvaničnog i sigurnog IPS QR sistema. Vaši podaci i transakcije ostaju potpuno zaštićeni.</p>
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