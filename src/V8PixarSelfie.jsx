import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, Zap, Download, PlayCircle, Brain, Diamond, Globe, Image as ImageIcon, ShieldCheck, Star, Palette, Moon, QrCode, Phone, MessageCircle, Copy, Lock, Info, Trophy, Clapperboard, Building, PenTool, Type } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { v8Toast } from './App';

const BASE_BACKEND_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://goranov-sajt-srpski-backend-production.up.railway.app";

// POČETAK FUNKCIJE: V8PixarStudioPage
const V8PixarStudioPage = ({ isAdmin }) => {
  // ==========================================
  // APLIKACIJA 1 (3:4 Format - Film & Sport) STATE
  // ==========================================
  const [unos, setUnos] = useState('');
  const [slika, setSlika] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stil, setStil] = useState('pixar');
  const [kategorija, setKategorija] = useState('film'); // 'film' ili 'sport'
  const [isPaid, setIsPaid] = useState(false);
  const [vipEmail, setVipEmail] = useState('');
  const [proveraStatus, setProveraStatus] = useState('idle');

  // ==========================================
  // APLIKACIJA 2 (16:9 Format - Bespoke & Diorama) STATE
  // ==========================================
  const [unosBespoke, setUnosBespoke] = useState('');
  const [slikaBespoke, setSlikaBespoke] = useState(null);
  const [isGeneratingBespoke, setIsGeneratingBespoke] = useState(false);
  const [kategorijaBespoke, setKategorijaBespoke] = useState('grad'); // 'grad' ili 'naslov'
  const [isPaidBespoke, setIsPaidBespoke] = useState(false);
  const [vipEmailBespoke, setVipEmailBespoke] = useState('');
  const [proveraStatusBespoke, setProveraStatusBespoke] = useState('idle');

  // ==========================================
  // 1. APLIKACIJA 1 (3:4) PROMPTOVI
  // ==========================================
  const bazniPromptFilm = (unosTekst, stilTokens) => {
    return `Create a final-frame, ultra-premium, feature-film-quality 3D ensemble mirror-selfie render in a polished Disney/Pixar-inspired cinematic animation style, based on the iconic main cast of ${unosTekst}. Automatically identify and generate the most recognizable principal characters from ${unosTekst}, preserving their original actor-specific identity, signature visual traits, costume language, and unmistakable screen presence. The scene takes place in a slightly messy, believable bathroom and is viewed entirely through the mirror reflection, with the central protagonist holding a large retro camera toward the mirror while the rest of the ensemble crowds naturally into frame in a dynamic, playful, chaotic but visually controlled group selfie composition. Extreme anatomical accuracy for all faces grounded in real actors.

FINAL V10 STYLE BOOST:
${stilTokens}`;
  };

  const bazniPromptSport = (unosTekst, stilTokens) => {
    return `Create an ultra-premium, final-frame, feature-film-quality 3D animated CGI render in a polished Disney/Pixar-inspired cinematic style, showing the most iconic, instantly recognizable hero players from ${unosTekst} taking a chaotic bathroom mirror selfie in a vertical 3:4 composition. Automatically identify and generate the core star players associated with ${unosTekst}, selecting the most visually recognizable faces, hairstyles, tattoos, and signature personalities. Absolute identity lock for all faces grounded in real players wearing exact screen-accurate kits.

FINAL V10 STYLE BOOST:
${stilTokens}`;
  };

  // ==========================================
  // 2. APLIKACIJA 2 (16:9) PROMPTOVI
  // ==========================================
  const bazniPromptGrad = (city) => {
    return `Create an ultra-photorealistic cinematic miniature city diorama of ${city}, where a highly detailed printed street map lies on a luxurious dark mahogany desk and a scaled-down three-dimensional version of the city rises directly out of the map itself, as if the urban landscape is physically emerging from the printed paper. The transformation from flat map to dimensional city must be seamless and structurally believable.

Include the most iconic and instantly recognizable landmarks of ${city}, surrounded by dense, realistic urban fabric. The miniature city should feel like a world-class handcrafted architectural model captured with the realism of high-end macro photography. Use a refined elevated three-quarter macro camera angle. Emphasize the illusion of scale with shallow depth of field, selective focal falloff, realistic lens compression. Soft directional studio illumination, subtle bounce light, realistic ambient occlusion. 16:9 cinematic aspect ratio perfection. 8k resolution, masterpiece.`;
  };

  const bazniPromptNaslov = (rec) => {
    return `Create a custom cinematic title design for the word "${rec}", where the typography itself visually embodies the meaning, emotional tone, and conceptual essence of the word. Invent a completely original decorative letterform system with no reliance on existing fonts, no copied typefaces, and no generic typography. Each letter should feel uniquely designed for this specific word, suggesting atmosphere, narrative, symbolism, and genre through its construction, surface treatment, and mood. The forms suggest atmosphere, narrative, symbolism, and genre. Bold, clean, powerful, carry intricate detail matched to the word's emotional world. Captured on a minimal but powerful cinematic background that supports the typography. Polished lighting, subtle depth, crisp edges, cinematic highlight control, premium poster-grade presentation. Masterpiece. 8k resolution.`;
  };

  // ==========================================
  // GENERISANJE LOGIKA (Aplikacija 1 - 3:4)
  // ==========================================
  const kreirajRemekDelo = async () => {
    if (!unos.trim()) {
      if(typeof v8Toast !== 'undefined') v8Toast.error(`Moraš uneti ime!`);
      return;
    }

    setIsGenerating(true);
    setSlika(null);
    setIsPaid(false);
    setProveraStatus('idle');
    setVipEmail('');

    let dodatakStilu = "Premium Pixar 3D Lighting, cinematic atmosphere, natural skin highlights, 8K Resolution";
    if (stil === 'arri') dodatakStilu = "ARRI Alexa 65 cinematic lighting, dramatic shadows, deep contrast, photorealistic details, cinematic color grading, 8K";
    if (stil === 'dark') dodatakStilu = "V8 Dark Mode aesthetic, high contrast, deep black shadows, moody atmosphere, subtle neon orange rim lighting, 8K";

    let finalniReactPrompt = kategorija === 'film' ? bazniPromptFilm(unos, dodatakStilu) : bazniPromptSport(unos, dodatakStilu);

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/generisi-pixar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalniReactPrompt, aspectRatio: "3:4" })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Greška na serveru.");
      setSlika(data.imageUrl);
      if(typeof v8Toast !== 'undefined') v8Toast.success("V8 Mašina je isporučila 3:4 remek-delo!");
    } catch (error) {
      if(typeof v8Toast !== 'undefined') v8Toast.error("Greška: " + error.message);
    } finally { setIsGenerating(false); }
  };

  // ==========================================
  // GENERISANJE LOGIKA (Aplikacija 2 - 16:9)
  // ==========================================
  const kreirajBespoke = async () => {
    if (!unosBespoke.trim()) {
      if(typeof v8Toast !== 'undefined') v8Toast.error(`Moraš uneti podatak!`);
      return;
    }

    setIsGeneratingBespoke(true);
    setSlikaBespoke(null);
    setIsPaidBespoke(false);
    setProveraStatusBespoke('idle');
    setVipEmailBespoke('');

    let finalPrompt = kategorijaBespoke === 'grad' ? bazniPromptGrad(unosBespoke) : bazniPromptNaslov(unosBespoke);

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/generisi-pixar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio: "16:9" }) // Forsiran 16:9
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Greška na serveru.");
      setSlikaBespoke(data.imageUrl);
      if(typeof v8Toast !== 'undefined') v8Toast.success("V8 Bespoke (16:9) je generisan!");
    } catch (error) {
      if(typeof v8Toast !== 'undefined') v8Toast.error("Greška pri bespoke: " + error.message);
    } finally { setIsGeneratingBespoke(false); }
  };

  // ==========================================
  // VIP BYPASS LOGIKA
  // ==========================================
  const handleOtkljucaj = (tip) => {
    const adminEmailovi = ['damnjanovicgoran7@gmail.com', 'aitoolsprosmart@gmail.com'];
    if (tip === 'standard') {
      if (adminEmailovi.includes(vipEmail.toLowerCase().trim())) {
        if(typeof v8Toast !== 'undefined') v8Toast.success("👑 V8 MASTER OTKLJUČANO."); setIsPaid(true);
      } else {
        setProveraStatus('loading'); setTimeout(() => { setProveraStatus('failed'); if(typeof v8Toast !== 'undefined') v8Toast.error("Uplata nije pronađena."); }, 2000);
      }
    } else {
      if (adminEmailovi.includes(vipEmailBespoke.toLowerCase().trim())) {
        if(typeof v8Toast !== 'undefined') v8Toast.success("👑 V8 MASTER OTKLJUČANO."); setIsPaidBespoke(true);
      } else {
        setProveraStatusBespoke('loading'); setTimeout(() => { setProveraStatusBespoke('failed'); if(typeof v8Toast !== 'undefined') v8Toast.error("Uplata nije pronađena."); }, 2000);
      }
    }
  };

  const preuzmiSliku = async (imgUrl, imeFajla) => {
    if (!imgUrl || !imgUrl.startsWith('http')) return;
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/download-image`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: imgUrl })
      });
      if (!response.ok) throw new Error("Greška");
      const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${imeFajla}_${Date.now()}.jpg`; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url);
    } catch (err) { window.open(imgUrl, '_blank'); }
  };

  const kopirajEmail = () => { navigator.clipboard.writeText("aitoolsprosmart@gmail.com"); if(typeof v8Toast !== 'undefined') v8Toast.success("Email kopiran!"); };

  // ==========================================
  // HTML / JSX STRUKTURA
  // ==========================================
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 flex flex-col items-center text-white">
      <div className="max-w-[1400px] w-full mx-auto font-sans text-center">
        
        {/* HEADER */}
        <div className="mb-16 flex flex-col items-center animate-in fade-in duration-1000">
          <div className="flex items-center gap-4 mb-4">
            <Camera className="w-10 h-10 text-orange-500" />
            <motion.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]">V8 CINEMATIC STUDIO</motion.h1>
          </div>
          <p className="text-orange-500/70 text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em]"># POWERED BY V8 ENTERPRISE AI</p>
        </div>

        {/* ========================================== */}
        {/* SEKCIJA 1: 3:4 FORMAT (FILM & SPORT) */}
        {/* ========================================== */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-6 w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
          
          {/* LEVA KOLONA: INFO */}
          <div className="w-full lg:w-[28%] flex flex-col text-left space-y-8 pt-4">
            <div><h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">VIZIONARSKI POGLED<br/><span className="text-orange-500">ZA VAŠ BREND</span></h2><p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Privucite pažnju premium klijenata vizualima koji pomeraju granice.</p></div>
            <div className="space-y-6">
              {[ {Icon: Brain, text: "Pretvorite bilo koji film ili tim u spektakularnu 4K vizuelnu kampanju."}, {Icon: Diamond, text: "Stvorite prepoznatljive 4K vizuale koji podižu identitet kompanije."}, {Icon: Globe, text: "Iskoristite snagu pop kulture za instantno prepoznavanje klijenata."}].map(({Icon, text}, idx) => (
                <div key={idx} className="flex items-start gap-4"><div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Icon className="w-5 h-5 text-orange-500" /></div><div><p className="text-[11px] text-zinc-500 font-medium">{text}</p></div></div>
              ))}
            </div>
          </div>

          {/* SREDNJA KOLONA: KONTROLE + REZULTAT */}
          <div className="w-full lg:w-[44%] bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-6 shadow-[0_0_40px_rgba(234,88,12,0.1)] flex flex-col items-center relative">
            <div className="w-full bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-4 flex gap-3 items-center mb-6"><Info className="w-8 h-8 text-orange-500 shrink-0" /><p className="text-zinc-300 text-[10px] uppercase font-black tracking-widest text-left">Naš <strong className="text-white">V8 SISTEM</strong> garantuje preciznost glumaca ili sportista u premium 8K 3:4 formatu.</p></div>

            {/* MENJAČ: FILM ILI SPORT */}
            <div className="w-full grid grid-cols-2 gap-2 mb-4 bg-black border border-white/10 p-1.5 rounded-2xl">
              {[ {id: 'film', Icon: Clapperboard, text: "Bioskop"}, {id: 'sport', Icon: Trophy, text: "Sport"}].map(({id, Icon, text}) => (
                <button key={id} onClick={() => setKategorija(id)} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${kategorija === id ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}><Icon className="w-4 h-4" /> {text}</button>
              ))}
            </div>

            <div className="w-full mb-6 relative"><PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" /><input type="text" value={unos} onChange={(e) => setUnos(e.target.value)} placeholder={kategorija === 'film' ? "NPR: GLADIATOR, MATRIX..." : "NPR: REAL MADRID, BARCELONA..."} className="w-full bg-[#050505] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-[14px] font-black uppercase outline-none focus:border-orange-500 transition-colors shadow-inner" /></div>

            {/* MENJAČ STILA */}
            <div className="w-full mb-6 grid grid-cols-3 gap-2">
              {[ {id: 'pixar', Icon: Star, text: "Standard"}, {id: 'arri', Icon: Palette, text: "Cinematic"}, {id: 'dark', Icon: Moon, text: "Dark Mode"}].map(({id, Icon, text}) => (
                <button key={id} onClick={() => setStil(id)} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${stil === id ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-[#050505] border-white/5 hover:border-orange-500/30'}`}><Icon className={`w-4 h-4 mb-1.5 ${stil === id ? 'text-orange-500' : 'text-zinc-500'}`} /><span className={`text-[8px] font-black uppercase tracking-widest ${stil === id ? 'text-orange-400' : 'text-zinc-500'}`}>{text}</span></button>
              ))}
            </div>

            {/* SLIKA 3:4 */}
            <div className="relative w-full aspect-[3/4] max-w-[380px] mx-auto bg-[#050505] border-2 border-orange-500/20 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.15)] mb-6 group">
              {isGenerating ? ( <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /><p className="text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse text-center">Rekonstrukcija...</p></div>
              ) : slika ? ( <>
                <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={slika} alt="V8 Result 3:4" className="w-full h-full object-cover" />
                {(!isAdmin && !isPaid) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[6px] p-4 animate-in fade-in duration-700">
                    <div className="bg-[#0a0a0a]/95 border border-orange-500/50 rounded-3xl p-5 flex flex-col items-center shadow-[0_0_40px_rgba(234,88,12,0.4)] w-full max-w-[280px]">
                      <div className="bg-white p-2 rounded-xl mb-3 w-full flex justify-center shadow-inner relative overflow-hidden"><QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD350,00|SF:289|S:V8 Cinematic Studio|RO:V8-CINEMA`} size={110} level={"M"} fgColor={"#000000"} bgColor={"#ffffff"} /></div>
                      <h3 className="text-orange-500 font-black tracking-widest text-[16px] mb-1">IPS SKENIRAJ</h3><p className="text-zinc-300 text-[10px] font-bold mb-3 uppercase tracking-widest text-center">Otključaj 4K rezoluciju<br/>(350 RSD)</p>
                      <div className="w-full mb-2"><input type="email" value={vipEmail} onChange={(e) => setVipEmail(e.target.value)} placeholder="Unesi email..." className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white text-[10px] text-center outline-none focus:border-orange-500 transition-colors mb-2" />
                        <button onClick={() => handleOtkljucaj('standard')} disabled={proveraStatus === 'loading' || !vipEmail} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:scale-[1.02] text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">{proveraStatus === 'loading' ? "Provera..." : "Potvrdi Uplatu"}</button>
                      </div>
                    </div>
                  </div>
                )}
                {(isAdmin || isPaid) && ( <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"><button onClick={() => preuzmiSliku(slika, `V8_34_${unos}`)} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"><Download className="w-4 h-4" /> PREUZMI 4K</button></div> )}
              </> ) : ( <div className="flex flex-col items-center gap-3 opacity-30"><Camera className="w-12 h-12 text-zinc-500" /><p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest text-center px-4">Unesi podatke iznad</p></div> )}
            </div>

            <button onClick={kreirajRemekDelo} disabled={isGenerating || !unos} className="w-full max-w-[380px] bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(234,88,12,0.4)] disabled:opacity-50">{isGenerating ? "PROCESIRANJE..." : "KREIRAJ V8 VIZUAL (350 RSD)"}</button>
          </div>

          {/* DESNA KOLONA: INFO (Zadržavamo simetriju) */}
          <div className="w-full lg:w-[28%] flex flex-col text-left space-y-8 pt-4">
            <div><h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">TRANSFORMACIJA:<br/><span className="text-orange-500">IDEJA U STVARNOST</span></h2><p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Superiorni rezultati bez tehničkih kompromisa.</p></div>
            <div className="space-y-6">
              {[ {Icon: ImageIcon, text: "Vidite punu kreativnost vizuala pre ulaganja novca."}, {Icon: Zap, text: "Naš V8 AI endžin isporučuje kvalitet u roku od nekoliko sekundi."}, {Icon: ShieldCheck, text: "Plaćanje isključivo putem sigurnog IPS sistema."}].map(({Icon, text}, idx) => (
                <div key={idx} className="flex items-start gap-4"><div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl shrink-0"><Icon className="w-5 h-5 text-orange-500" /></div><div><p className="text-[11px] text-zinc-500 font-medium">{text}</p></div></div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SEKCIJA 2: 16:9 FORMAT (GRADOVI & NASLOVI) */}
        {/* ========================================== */}
        <div className="mt-24 pt-16 border-t border-orange-500/10 w-full text-center flex flex-col items-center animate-in fade-in duration-1000">
          <div className="mb-10 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-3">
              <Building className="w-10 h-10 text-red-500" />
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-red-400">V8 BESPOKE & DIORAMA</h2>
            </div>
            <p className="text-red-500/70 text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em]"># PREMIUM 16:9 WIDESCREEN RENDER</p>
          </div>

          <div className="flex flex-col xl:flex-row w-full gap-10 xl:gap-6 max-w-[1200px] items-start justify-center">
            
            {/* KONTROLE (LEVO) */}
            <div className="w-full xl:w-[40%] bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-6 shadow-xl flex flex-col items-center">
              <div className="w-full bg-zinc-900/50 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-center mb-6"><Type className="w-8 h-8 text-red-500 shrink-0" /><p className="text-zinc-300 text-[10px] uppercase font-black tracking-widest text-left">Generiši 3D Makete gradova ili Unikatne Naslove u <strong className="text-red-400">16:9 FORMATU</strong>.</p></div>
              
              <div className="w-full grid grid-cols-2 gap-2 mb-6 bg-black border border-white/10 p-1.5 rounded-2xl">
                {[ {id: 'grad', Icon: Building, text: "3D Gradovi"}, {id: 'naslov', Icon: Type, text: "Naslovi"}].map(({id, Icon, text}) => (
                  <button key={id} onClick={() => setKategorijaBespoke(id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${kategorijaBespoke === id ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}><Icon className="w-4 h-4" /> {text}</button>
                ))}
              </div>

              <div className="w-full mb-6 relative"><PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" /><input type="text" value={unosBespoke} onChange={(e) => setUnosBespoke(e.target.value.toUpperCase().trim())} placeholder={kategorijaBespoke === 'grad' ? "NPR: BEOGRAD, TOKYO..." : "NPR: AURORA, ZENITH..."} className="w-full bg-[#050505] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-[14px] font-black uppercase outline-none focus:border-red-500 transition-colors shadow-inner" /></div>
              
              <button onClick={kreirajBespoke} disabled={isGeneratingBespoke || !unosBespoke} className="w-full max-w-[380px] bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50">{isGeneratingBespoke ? "OBRADA U TOKU..." : "KREIRAJ 16:9 VIZUAL (350 RSD)"}</button>
            </div>

            {/* PRIKAZ 16:9 (DESNO) */}
            <div className="w-full xl:w-[60%] bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-6 relative aspect-[16/9] overflow-hidden flex items-center justify-center group shadow-2xl">
                {isGeneratingBespoke ? ( <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /><p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse text-center">Bespokorno iscrtavanje...</p></div>
                ) : slikaBespoke ? ( <>
                  <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={slikaBespoke} alt="V8 Bespoke Result 16:9" className="w-full h-full object-cover" />
                  {(!isAdmin && !isPaidBespoke) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[6px] p-4 animate-in fade-in duration-700">
                      <div className="bg-[#0a0a0a]/95 border border-red-500/50 rounded-3xl p-5 flex flex-col items-center shadow-[0_0_40px_rgba(220,38,38,0.4)] w-full max-w-[280px]">
                        <div className="bg-white p-2 rounded-xl mb-3 w-full flex justify-center shadow-inner relative overflow-hidden"><QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD350,00|SF:289|S:V8 Cinematic Studio|RO:V8-CINEMA`} size={110} level={"M"} fgColor={"#000000"} bgColor={"#ffffff"} /></div>
                        <h3 className="text-red-500 font-black tracking-widest text-[16px] mb-1">IPS SKENIRAJ</h3><p className="text-zinc-300 text-[10px] font-bold mb-3 uppercase tracking-widest text-center">Otključaj V8 16:9<br/>(350 RSD)</p>
                        <div className="w-full mb-2"><input type="email" value={vipEmailBespoke} onChange={(e) => setVipEmailBespoke(e.target.value)} placeholder="Unesi email..." className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white text-[10px] text-center outline-none focus:border-red-500 transition-colors mb-2" />
                          <button onClick={() => handleOtkljucaj('bespoke')} disabled={proveraStatusBespoke === 'loading' || !vipEmailBespoke} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:scale-[1.02] text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">{proveraStatusBespoke === 'loading' ? "Provera..." : "Potvrdi Uplatu"}</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(isAdmin || isPaidBespoke) && ( <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"><button onClick={() => preuzmiSliku(slikaBespoke, `V8_169_${unosBespoke}`)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"><Download className="w-4 h-4" /> PREUZMI 16:9 NASLOV</button></div> )}
                </> ) : ( <div className="flex flex-col items-center gap-3 opacity-30"><PenTool className="w-12 h-12 text-zinc-500" /><p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest text-center px-4">Unesi podatke levo</p></div> )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default V8PixarStudioPage;