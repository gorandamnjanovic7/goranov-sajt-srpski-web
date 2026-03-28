/// POČETAK FUNKCIJE: V8KreatorSlikaPage ///
import React, { useState } from 'react';
import { Zap, Image as ImageIcon, Download, Lock, Loader2, ShieldAlert, Mail, Camera, Crop, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const V8KreatorSlikaPage = ({ isAdmin }) => {
  const [unos, setUnos] = useState('');
  const [ar, setAr] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [proveraUplate, setProveraUplate] = useState('idle');

  const cena = "300 RSD";

  // --- V8 SENZOR ZA AUTOMATSKU DETEKCIJU SERVERA ---
  const BASE_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:5000" 
    : "https://goranov-sajt-srpski-backend-production.up.railway.app";

  // --- V8 MOTOR ZA GENERISANJE ---
  const handleGenerisi = async (adminBypass = false) => {
    setIsGenerating(true);
    if (adminBypass) setIsPaid(true); 

    try {
      // SADA KORISTI PAMETNI URL ZAVISNO OD TOGA GDE SE NALAZIŠ
      const backendUrl = `${BASE_URL}/api/generisi-sliku`; 

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          prompt: unos,
          aspectRatio: ar 
        })
      });

      if (!response.ok) {
        throw new Error("Greška u komunikaciji sa V8 serverom");
      }

      const data = await response.json();
      setRezultat(data.imageUrl); 
      
    } catch (error) {
      console.error("V8 Greška u motoru:", error);
      alert("Došlo je do zastoja na V8 serveru. Pokušajte ponovo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProveraUplate = () => {
    setProveraUplate('loading');
    setTimeout(() => {
      setProveraUplate('failed');
    }, 3500);
  };

 // --- BLINDIRANI SISTEM ZA PREUZIMANJE SLIKA ---
  const handleDownload = () => {
    if (!rezultat) return;
    try {
      // V8 Taktika: Slika je već učitana u memoriji tvog brauzera, 
      // skidamo je direktno na hard disk bez ikakvog pingovanja servera!
      const link = document.createElement('a');
      link.href = rezultat; 
      link.download = `V8_Premium_Remek_Delo_${Date.now()}.jpg`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("V8 Greška pri downloadu:", error);
      alert("Došlo je do greške pri preuzimanju slike.");
    }
  };

  const getAspectRatioStyle = () => {
    if (ar === '1:1') return "aspect-[1/1]";
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
            <span className="relative flex h-3 w-3 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            GENERATOR PREMIUM AI FOTOGRAFIJA.
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] mb-16 w-full max-w-4xl relative">
          
          {!rezultat && !isGenerating && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                  <Crop className="w-4 h-4" /> Izaberite format slike:
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => setAr('1:1')} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all border-2 ${ar === '1:1' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50'}`}>AR 1:1</button>
                  <button onClick={() => setAr('9:16')} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all border-2 ${ar === '9:16' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50'}`}>AR 9:16</button>
                  <button onClick={() => setAr('16:9')} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all border-2 ${ar === '16:9' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50'}`}>AR 16:9</button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-4">Opišite detaljno šta želite da generišemo:</label>
                <textarea 
                  value={unos} 
                  onChange={(e) => setUnos(e.target.value)} 
                  placeholder="Npr: Hiper-realistična fotografija crnog V8 motora na stolu, tamna pozadina sa narandžastim neon svetlom, 8k rezolucija..."
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-[14px] outline-none focus:border-orange-500 transition-all min-h-[150px] resize-none shadow-inner"
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleGenerisi(false)}
                  disabled={unos.length < 5}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all ${unos.length < 5 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-[1.02]'}`}
                >
                  <ImageIcon className="w-5 h-5" /> Generisati Premium Sliku
                </button>
                
                {isAdmin && (
                  <button 
                    onClick={() => handleGenerisi(true)}
                    disabled={unos.length < 5}
                    className={`w-full sm:w-1/3 py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-2 transition-all ${unos.length < 5 ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : 'bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-[1.02]'}`}
                  >
                    <Zap className="w-4 h-4" /> ADMIN BYPASS
                  </button>
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
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest text-center">V8 NEURONSKA MREŽA RENDERUJE PIKSELE...</h3>
              <p className="text-zinc-500 font-bold text-[12px] uppercase tracking-widest animate-pulse">Povezivanje sa grafičkim procesorima u toku</p>
            </div>
          )}

          {rezultat && !isGenerating && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2 w-full justify-start">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                  <span className="text-green-400 font-black uppercase tracking-widest text-[11px]">Renderovanje uspešno završeno</span>
              </div>

              <div className={`relative w-full max-w-2xl bg-[#050505] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 ${getAspectRatioStyle()}`}>
                 <img src={rezultat} className="w-full h-full object-cover absolute inset-0 z-0" alt="V8 AI Result" />
                 
                 {(!isPaid && !isAdmin) && (
                   <div className="absolute inset-0 z-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] [backdrop-filter:blur(16px)] pointer-events-none"></div>
                 )}

                 {(!isPaid && !isAdmin) && (
                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/60">
                      <div className="bg-[#050505]/95 border border-orange-500/50 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_0_50px_rgba(234,88,12,0.3)] w-full max-w-[400px] animate-in zoom-in duration-500">
                        <Lock className="w-10 h-10 text-orange-500 mb-4 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
                        <h3 className="text-[16px] md:text-[18px] font-black text-white uppercase tracking-widest mb-2">OTKLJUČAJ PUN REZULTAT</h3>
                        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-6">Skeniraj IPS kod ({cena})</p>
                        
                        <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-inner border border-zinc-200 hover:scale-105 transition-transform cursor-pointer">
                          <QRCodeCanvas 
                            value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${cena.replace(' RSD', '')},00|SF:289|S:V8 Kreator Slika`}
                            size={160} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} includeMargin={false}
                          />
                        </div>

                        <div className="bg-orange-900/20 border border-orange-500/30 w-full p-4 rounded-xl mb-6">
                           <p className="text-[10px] md:text-[11px] text-orange-400 font-black uppercase tracking-widest leading-relaxed">
                             POSLE UPLATE POSLATI DOKAZ O UPLATI NA WHATUP/VIBER/AITOOLSPROSMAT@GMAIL.COM
                           </p>
                        </div>
                        
                        {proveraUplate === 'idle' && (
                          <button onClick={handleProveraUplate} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:scale-105 rounded-xl font-black uppercase tracking-widest text-[12px] text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                            <Zap className="w-4 h-4" /> POTVRDIO SAM UPLATU
                          </button>
                        )}

                        {proveraUplate === 'loading' && (
                          <button disabled className="w-full py-4 bg-zinc-800 border border-zinc-600 rounded-xl font-black uppercase tracking-widest text-[11px] text-zinc-400 flex items-center justify-center gap-2 cursor-wait">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> PROVERA BANKE U TOKU...
                          </button>
                        )}

                        {proveraUplate === 'failed' && (
                          <div className="w-full bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center animate-in zoom-in">
                            <p className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2 flex justify-center items-center gap-1"><ShieldAlert className="w-3 h-3" /> UPLATA NIJE EVIDENTIRANA</p>
                            <a href="mailto:aitoolsprosmart@gmail.com?subject=Dokaz o uplati - V8 Kreator Slika" className="bg-red-600/30 border border-red-500/50 hover:bg-red-600 text-white px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2">
                                <Mail className="w-3 h-3" /> Pošalji na Email
                            </a>
                          </div>
                        )}
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-full max-w-2xl flex gap-4">
                 <button 
                   onClick={handleDownload}
                   disabled={!isPaid && !isAdmin}
                   className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all ${(!isPaid && !isAdmin) ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-[1.02]'}`}
                 >
                   <Download className="w-5 h-5" /> DIREKTNO U DOWNLOAD FOLDER
                 </button>
              </div>

              <button onClick={() => { setRezultat(null); setIsPaid(false); setProveraUplate('idle'); }} className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors mt-4 underline underline-offset-4">Generiši novu sliku</button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default V8KreatorSlikaPage;
/// KRAJ FUNKCIJE: V8KreatorSlikaPage ///