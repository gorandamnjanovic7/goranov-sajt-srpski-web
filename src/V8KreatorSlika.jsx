import React, { useState, useEffect } from 'react';
import { Zap, Image as ImageIcon, Download, Lock, Loader2, ShieldAlert, Mail, Camera, Crop, X, Info } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const V8KreatorSlikaPage = ({ isAdmin }) => {
  useEffect(() => {
    console.log("🏎️ V8 Kreator Slika: Sistem online.");
  }, []);

  const [unos, setUnos] = useState('');
  const [ar, setAr] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [proveraUplate, setProveraUplate] = useState('idle');

  const BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:5000" 
    : "https://goranov-sajt-srpski-backend-production.up.railway.app";

  // --- MOTOR 1: STANDARD (GEMINI) ---
  const handleGenerisi = async (adminBypass = false) => {
    if (unos.length < 5) return;
    setIsGenerating(true);
    if (adminBypass) setIsPaid(true); 

    try {
      const response = await fetch(`${BASE_URL}/api/generisi-sliku`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: unos, aspectRatio: ar })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Greška u V8 prenosu");
      
      setRezultat(data.imageUrl); 
    } catch (error) {
      console.error("V8 Kvar:", error);
      alert("Zastoj na standardnom motoru: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- MOTOR 2: TURBO (OPENAI) - SA V8 DIJAGNOSTIKOM ---
  const handleGenerisiOpenAI = async (adminBypass = false) => {
    if (unos.length < 5) return;
    setIsGenerating(true);
    if (adminBypass) setIsPaid(true); 

    try {
      console.log(`🏎️💨 Šaljem Turbo zahtev na: ${BASE_URL}/api/generisi-sliku-openai`);
      
      const response = await fetch(`${BASE_URL}/api/generisi-sliku-openai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: unos, aspectRatio: ar })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Nepoznata greška na serveru");
      }
      
      console.log("✅ V8 Turbo slika stigla!", data.imageUrl);
      setRezultat(data.imageUrl); 
    } catch (error) {
      console.error("❌ V8 Turbo Kvar:", error);
      alert("V8 TURBO GREŠKA: " + error.message + "\n\n(Ako ovo vidiš, slikaj mi ekran!)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProveraUplate = () => {
    setProveraUplate('loading');
    setTimeout(() => setProveraUplate('failed'), 3500);
  };

  
  // --- V8 FORSIRANI DIREKTNI DOWNLOAD ---
  const handleDownload = async () => {
    if (!rezultat) return;
    
    // Ako je u pitanju OpenAI URL, tražimo od našeg backend-a da nam pošalje fajl
    if (rezultat.startsWith('http')) {
      try {
        const response = await fetch(`${BASE_URL}/api/download-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: rezultat })
        });

        if (!response.ok) throw new Error("Greška pri preuzimanju fajla");

        // Pretvaramo odgovor u pravi fajl i preuzimamo ga u DOWNLOAD folder
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `V8_Premium_Turbo_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("❌ Greška pri skidanju:", err);
        window.open(rezultat, '_blank');
      }
    } else {
      // Standardni Gemini Base64 Download (Ovo ostaje isto)
      const link = document.createElement('a');
      link.href = rezultat; 
      link.download = `V8_Premium_Standard_${Date.now()}.jpg`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getAspectRatioStyle = () => {
    if (ar === '9:16') return "aspect-[9/16]";
    if (ar === '16:9') return "aspect-[16/9]";
    return "aspect-[1/1]";
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-24 px-6 relative flex flex-col items-center">
      <div className="max-w-5xl w-full mx-auto font-sans text-left text-white relative z-10 flex flex-col items-center">
        
        <div className="mb-12 text-center w-full relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 drop-shadow-[0_0_15px_rgba(234,88,12,0.3)] flex items-center justify-center gap-4">
            <Camera className="w-10 h-10 text-orange-500" /> V8 KREATOR SLIKA
          </h1>
          <div className="text-[12px] md:text-[14px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center flex-wrap gap-3 justify-center text-center mb-6">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            SISTEM SPREMAN ZA GENERISANJE.
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] mb-16 w-full max-w-4xl relative">
          
          {!rezultat && !isGenerating && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                  <Crop className="w-4 h-4" /> Format:
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['1:1', '9:16', '16:9'].map(ratio => (
                    <button key={ratio} onClick={() => setAr(ratio)} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all border-2 ${ar === ratio ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50'}`}>AR {ratio}</button>
                  ))}
                </div>
              </div>

              {/* V8 OBAVEŠTENJE ZA KLIJENTE */}
              <div className="bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-5 my-6 flex flex-col md:flex-row gap-4 items-start shadow-inner">
                <Info className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div className="text-zinc-300 text-[13px] leading-relaxed">
                  <h4 className="text-orange-400 font-black uppercase tracking-widest text-[11px] mb-2">⚙️ V8 Specifikacija Motora</h4>
                  <p className="mb-2">
                    <strong className="text-white">STANDARD (Gemini):</strong> Otključan za poznate ličnosti, glumce i likove iz pop kulture. Birajte ovaj motor ako generišete specifične karaktere.
                  </p>
                  <p>
                    <strong className="text-white">V8 TURBO (OpenAI):</strong> Maksimalan fotorealizam za objekte, luksuzne enterijere, vozila i pejzaže. <span className="text-zinc-400 italic">Ima strogu cenzuru autorskih prava (ne generiše poznata lica).</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">Opis vizije:</label>
                <textarea 
                  value={unos} 
                  onChange={(e) => setUnos(e.target.value)} 
                  placeholder="Npr: Hiper-realistična fotografija crnog V8 motora, narandžasti neon, 8k..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-[14px] outline-none focus:border-orange-500 transition-all min-h-[150px] resize-none shadow-inner"
                ></textarea>
              </div>
              
              <div className="flex flex-col gap-4 w-full pt-4 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => handleGenerisi(false)} disabled={unos.length < 5} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all ${unos.length < 5 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 border border-white/10 text-white hover:border-orange-500 shadow-xl'}`}>
                    <ImageIcon className="w-5 h-5" /> Standard (Gemini)
                  </button>

                  <button onClick={() => handleGenerisiOpenAI(false)} disabled={unos.length < 5} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all ${unos.length < 5 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-[1.02]'}`}>
                    <Zap className="w-5 h-5" /> V8 TURBO (OpenAI)
                  </button>
                </div>
                
                {isAdmin && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleGenerisi(true)} className="py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-all">Admin Gemini</button>
                    <button onClick={() => handleGenerisiOpenAI(true)} className="py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-700 transition-all">Admin Turbo</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="py-24 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
              <div className="relative">
                 <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                 <Camera className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest text-center">V8 NEURONSKA MREŽA RENDERUJE...</h3>
            </div>
          )}

          {rezultat && !isGenerating && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <div className={`relative w-full max-w-2xl bg-[#050505] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 ${getAspectRatioStyle()}`}>
                 <img src={rezultat} className="w-full h-full object-cover absolute inset-0" alt="V8 AI Result" />
                 
                 {(!isPaid && !isAdmin) && (
                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                      <div className="bg-[#050505]/95 border border-orange-500/50 p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_0_50px_rgba(234,88,12,0.3)] w-full max-w-[400px]">
                        <Lock className="w-10 h-10 text-orange-500 mb-4" />
                        <h3 className="text-[18px] font-black text-white uppercase tracking-widest mb-2">OTKLJUČAJ PUN REZULTAT</h3>
                        <div className="bg-white p-3 rounded-2xl mb-6 inline-block">
                          <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD300,00|SF:289|S:V8 Slika`} size={160} />
                        </div>
                        <button onClick={handleProveraUplate} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-black uppercase text-[12px] text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)]">POTVRDIO SAM UPLATU</button>
                        {proveraUplate === 'failed' && <p className="text-red-500 font-black text-[10px] mt-4 uppercase">UPLATA NIJE EVIDENTIRANA</p>}
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-full max-w-2xl flex gap-4">
                 <button onClick={handleDownload} disabled={!isPaid && !isAdmin} className={`flex-1 py-5 rounded-2xl font-black uppercase text-[13px] flex items-center justify-center gap-3 transition-all ${(!isPaid && !isAdmin) ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]'}`}>
                   <Download className="w-5 h-5" /> DOWNLOAD
                 </button>
              </div>
              <button onClick={() => { setRezultat(null); setIsPaid(false); setProveraUplate('idle'); }} className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors mt-4 underline">Generiši novu sliku</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default V8KreatorSlikaPage;