/// POČETAK FUNKCIJE: V8PixarSelfiePage ///
import React, { useState } from 'react';
import { Zap, Camera, Lock, Loader2, Star, Palette, Flame, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const V8PixarSelfiePage = ({ isAdmin }) => {
  const [filmSerija, setFilmSerija] = useState('');
  const [izabranStil, setIzabranStil] = useState('pixar_classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [proveraUplate, setProveraUplate] = useState('idle');

  const cena = "350 RSD"; 

  // --- 🤫 SKRIVENI V8 PROMPT TEMPLATE ---
  const bazniPromptTemplate = (unos, stilTokens) => `Ultra-detailed stylized 3D animation render, vertical 3:4 frame. Scene shows the main iconic characters from ${unos} taking a fun, messy bathroom mirror selfie. The most recognizable character holds a large retro camera toward the mirror while the rest crowd tightly around, filling the frame with energetic, playful expressions matching their signature personalities. All characters wear their classic outfits accurate to ${unos}. Faces are slightly cartoon-stylized with expressive eyes but preserve original hairstyles, colors, and defining features with consistent identity-lock precision. Mirror includes light smudges and toothpaste marks, with bold black animated lettering reading "${unos}" visible in reflection. Bathroom environment matches the theme of ${unos} with fitting props and small easter eggs placed naturally. CAMERA SYSTEM: captured as if shot on Sony A7R V, 35mm f/1.4 GM lens, shallow depth of field, cinematic focus falloff, subtle wide-angle distortion for group compression, handheld micro jitter realism, mirror reflection optical accuracy. ${stilTokens} META TOKEN STACK: ACEScg_color_pipeline, HDR_vision_fusion_v5, global_illumination_bounce, subsurface_scattering_skin, micro_detail_enhancement, physically_based_rendering, dynamic_range_expansion REALISM BOOST TOKENS: production_stills_archive, disney_animation_pipeline, unreal_engine_path_tracing, cinematic_color_science_v3 FINAL OUTPUT: sharp 4K quality, ultra-clean render, no watermark, high-end shading, perfectly balanced exposure, cinematic composition, social-media-ready framing`;

  const stiloviConfig = {
    pixar_classic: {
      tokens: "Inspired in a Disney/Pixar CGI look, warm cinematic color temperature, Pixar_shading_engine, soft bathroom practical lighting.",
      ime: "Klasik Pixar 3D",
      ikonica: Star
    },
    cinema_arri: {
      tokens: "ALTERNATIVE CINEMA MODE: ARRI Alexa 35, Panavision anamorphic 40mm T2.0, cinematic lens breathing, anamorphic bokeh stretch.",
      ime: "Bioskopski Arri Look",
      ikonica: Palette
    },
    v8_dark_mode: {
      tokens: "SPECIAL V8 DARK MODE: The entire bathroom environment is transformed into a sleek, dark black and charcoal setting. Integrated glowing orange neon light strips and accents, dramatic orange reflections, crushed black shadow detail.",
      ime: "V8 Dark Mode",
      ikonica: Flame
    }
  };

  // --- GLAVNA KOMANDA ZA NOVI GOOGLE NANO BANANA MOTOR ---
  const handleSkopiAndGenerisi = async (adminBypass = false) => {
    setIsGenerating(true);
    if (adminBypass) setIsPaid(true); 

    const finalniZidPrompta = bazniPromptTemplate(filmSerija, stiloviConfig[izabranStil].tokens);

    try {
      // Šaljemo na tvoju NOVU rutu za rotaciju ključeva
      const backendUrl = "http://localhost:5000/api/generisi-pixar"; 

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalniZidPrompta })
      });

      if (!response.ok) throw new Error("Kvar na Nano Banana motoru");

      const data = await response.json();
      setRezultat(data.imageUrl); 
      
    } catch (error) {
      console.error("V8 Greška:", error);
      alert("Došlo je do zastoja na Nano Banana serveru. Proveri terminal!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProveraUplate = () => {
    setProveraUplate('loading');
    setTimeout(() => setProveraUplate('failed'), 3500);
  };

  const handleDownload = () => {
    if (!rezultat) return;
    const link = document.createElement('a');
    link.href = rezultat;
    link.download = `V8_Pixar_Selfie_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-24 px-6 relative flex flex-col items-center">
      <div className="max-w-5xl w-full mx-auto font-sans text-left text-white relative z-10 flex flex-col items-center">
        
        <div className="mb-12 text-center w-full relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)] flex items-center justify-center gap-4">
            <Camera className="w-10 h-10 text-orange-500" /> PIXAR SELFIE MEJKER
          </h1>
          <div className="text-[12px] md:text-[14px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center flex-wrap gap-3 justify-center text-center mb-6">
            <span className="relative flex h-3 w-3 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            V8 NANO BANANA POGON AKTIVAN.
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] mb-16 w-full max-w-4xl relative">
          
          {!rezultat && !isGenerating && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">Unesite ime omiljenog filma ili serije:</label>
                <input 
                  type="text"
                  value={filmSerija} 
                  onChange={(e) => setFilmSerija(e.target.value)} 
                  placeholder="Npr: Gladiator, Peaky Blinders, Maratonci..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-[16px] font-bold outline-none focus:border-orange-500 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                  <Palette className="w-4 h-4" /> Izaberite vizuelni stil:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.keys(stiloviConfig).map(stilKey => {
                    const StilIkonica = stiloviConfig[stilKey].ikonica;
                    return (
                      <button 
                        key={stilKey}
                        onClick={() => setIzabranStil(stilKey)}
                        className={`py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all border-2 flex flex-col items-center gap-3 text-center ${izabranStil === stilKey ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50'}`}
                      >
                        <StilIkonica className={`w-6 h-6 ${izabranStil === stilKey ? 'text-orange-500' : 'text-zinc-600'}`} />
                        {stiloviConfig[stilKey].ime}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full pt-6 border-t border-white/5">
                <button 
                  onClick={() => handleSkopiAndGenerisi(false)}
                  disabled={filmSerija.length < 3}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[14px] flex items-center justify-center gap-3 transition-all ${filmSerija.length < 3 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-[1.02]'}`}
                >
                  <Zap className="w-5 h-5" /> GENERIŠI PREMIUM SELFIE ({cena})
                </button>
                
                {isAdmin && (
                  <button onClick={() => handleSkopiAndGenerisi(true)} disabled={filmSerija.length < 3} className="w-full sm:w-1/3 py-6 rounded-2xl font-black uppercase tracking-widest text-[13px] border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    ADMIN BYPASS
                  </button>
                )}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="py-24 flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
              <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest text-center">NANO BANANA GENERIŠE PIKSELE...</h3>
            </div>
          )}

          {rezultat && !isGenerating && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <div className="relative w-full max-w-[450px] bg-[#050505] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 aspect-[3/4]">
                 <img src={rezultat} className="w-full h-full object-cover" alt="V8 Result" />
                 
                 {(!isPaid && !isAdmin) && (
                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
                      <div className="bg-[#050505]/95 border border-orange-500/50 p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_0_50px_rgba(234,88,12,0.3)]">
                        <Lock className="w-10 h-10 text-orange-500 mb-4" />
                        <h3 className="text-[18px] font-black text-white uppercase tracking-widest mb-6">OTKLJUČAJ PUN REZULTAT</h3>
                        <div className="bg-white p-3 rounded-2xl mb-6">
                          <QRCodeCanvas 
                            value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${cena.replace(' RSD', '')},00|SF:289|S:Pixar Selfie`}
                            size={160} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"}
                          />
                        </div>
                        <button onClick={handleProveraUplate} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-black uppercase text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                          POTVRDIO SAM UPLATU
                        </button>
                      </div>
                   </div>
                 )}
              </div>

              {(isPaid || isAdmin) && (
                <button onClick={handleDownload} className="w-full max-w-[450px] py-5 bg-orange-600 rounded-2xl font-black uppercase text-white flex items-center justify-center gap-3">
                  <Download className="w-5 h-5" /> PREUZMI SLIKU
                </button>
              )}

              <button onClick={() => { setRezultat(null); setIsPaid(false); setProveraUplate('idle'); }} className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest underline underline-offset-4 mt-4">Generiši novu sliku</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default V8PixarSelfiePage;
/// KRAJ FUNKCIJE: V8PixarSelfiePage ///