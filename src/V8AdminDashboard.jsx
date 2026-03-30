import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Zap, Image as ImageIcon, CheckCircle, Search, Power, QrCode } from 'lucide-react';
import { v8Toast } from './App'; // Tvoj toster za notifikacije

// 🔧 GORANE: Ovde importujemo tvoj alat kako bi ga imao u Dashboardu!
import V8PixarSelfiePage from './V8PixarSelfiePage'; 

// POČETAK FUNKCIJE: V8AdminDashboard
const V8AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('ips_zahtevi');
// REZERVOAR ZA 10X PROMO STRANICU
  const [promoVideo, setPromoVideo] = useState("");
  const [promoImages, setPromoImages] = useState("");

  // MOCK PODACI: Ovde će ti kasnije stizati pravi zahtevi iz baze kada klijent skenira QR
  const [zahtevi, setZahtevi] = useState([
    { id: 1, klijent: "Marko M.", film: "GLADIATOR", vreme: "Pre 2 min", status: "ceka_uplatu" },
    { id: 2, klijent: "Studio X", film: "MATRIX", vreme: "Pre 15 min", status: "ceka_uplatu" },
  ]);

  // POČETAK FUNKCIJE: otkljucajKlijentu
  const otkljucajKlijentu = (id) => {
    // Ovde ćemo kasnije gađati tvoj backend da klijentu u bazi stavi isPaid = true
    setZahtevi(zahtevi.filter(z => z.id !== id));
    if(typeof v8Toast !== 'undefined') v8Toast.success("IPS Uplata potvrđena! Klijentu je otključan 4K vizual.");
  };
  // KRAJ FUNKCIJE: otkljucajKlijentu

  return (
    <div className="min-h-screen bg-[#050505] text-white flex pt-20">
      
      {/* LEVI MENI (SIDEBAR) */}
      <div className="w-64 bg-[#0a0a0a] border-r border-orange-500/20 flex flex-col fixed h-full z-20 shadow-[10px_0_30px_rgba(234,88,12,0.05)]">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-orange-500" />
          <div>
            <h2 className="font-black text-[14px] uppercase tracking-widest text-white">V8 MASTER</h2>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Kontrolna Soba</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('ips_zahtevi')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'ips_zahtevi' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <QrCode className="w-4 h-4" /> IPS Otključavanja
            {zahtevi.length > 0 && (
              <span className="ml-auto bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full">{zahtevi.length}</span>
            )}
          </button>
// POČETAK FUNKCIJE: DugmePromo10xTab
<button
  onClick={() => setActiveTab('promo_10x')}
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'promo_10x' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
>
  <Zap className="w-4 h-4" /> 10X Promo
</button>
// KRAJ FUNKCIJE: DugmePromo10xTab

          <button 
            onClick={() => setActiveTab('v8_alati')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'v8_alati' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <Zap className="w-4 h-4" /> V8 Alati (Bypass)
          </button>

          <button 
            onClick={() => setActiveTab('klijenti')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'klijenti' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <Users className="w-4 h-4" /> Baza Klijenata
          </button>
        </div>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <Power className="w-4 h-4" /> Izlaz
          </button>
        </div>
      </div>

      {/* GLAVNI SADRŽAJ (DESNO) */}
      <div className="ml-64 flex-1 p-10">
        
        {/* TAB 1: IPS OTKLJUČAVANJA */}
        {activeTab === 'ips_zahtevi' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">IPS ODOBRENJA</h1>
                <p className="text-zinc-500 text-[12px] font-bold tracking-widest uppercase">Klijenti koji čekaju otključavanje vizuala</p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-[2rem] p-2 shadow-[0_0_40px_rgba(234,88,12,0.05)]">
              {zahtevi.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <CheckCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-[12px] font-black uppercase tracking-widest text-zinc-500">Svi zahtevi su rešeni.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {zahtevi.map((z) => (
                    <div key={z.id} className="flex items-center justify-between p-6 rounded-3xl bg-[#050505] border border-white/5 hover:border-orange-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-orange-600/10 flex items-center justify-center border border-orange-500/30">
                          <ImageIcon className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-[14px] font-black uppercase tracking-widest text-white">{z.klijent}</h3>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Traži: <span className="text-orange-400">{z.film}</span> • {z.vreme}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-black uppercase tracking-widest">
                          Skenirao QR
                        </div>
                        <button 
                          onClick={() => otkljucajKlijentu(z.id)}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                        >
                          OTKLJUČAJ (POTVRDI UPLATU)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

{/* TAB 3: PROMO 10X REKLAMA */}
      {activeTab === 'promo_10x' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-[#0a0a0a] border border-orange-500/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(234,88,12,0.1)] mb-8">
          
          <div className="flex items-center gap-3 mb-8 border-b border-orange-500/20 pb-4">
            <Zap className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              Podešavanje 10X Reklame
            </h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* GLAVNI VIDEO */}
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-orange-500" /> Glavni Video (URL)
              </label>
              <input 
                type="text" 
                value={promoVideo} 
                onChange={(e) => setPromoVideo(e.target.value)} 
                className="w-full bg-black border border-white/10 hover:border-orange-500/50 focus:border-orange-500 rounded-xl p-4 text-[13px] text-white transition-all outline-none"
                placeholder="Unesi link do MP4 videa" 
              />
            </div>

            {/* GALERIJA SLIKA */}
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-500" /> Trakica Slika (Zarezima odvojeni linkovi)
              </label>
              <textarea 
                value={promoImages} 
                onChange={(e) => setPromoImages(e.target.value)} 
                className="w-full bg-black border border-white/10 hover:border-orange-500/50 focus:border-orange-500 rounded-xl p-4 text-[13px] text-white transition-all outline-none resize-none font-mono leading-relaxed"
                placeholder="link_slike_1.jpg, link_slike_2.jpg, link_slike_3.jpg"
                rows="5"
              />
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                * Razdvoj linkove zarezom da bi se napravio onaj brutalni V8 karusel.
              </p>
            </div>
            
            {/* DUGME ZA ČUVANJE */}
            <button 
              onClick={() => {
                if(typeof v8Toast !== 'undefined') v8Toast.success("V8 Reklama Ažurirana! BOMBA!");
              }}
              className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-2 w-full md:w-auto self-end cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" /> Sačuvaj Podešavanja
            </button>

          </div>
        </motion.div>
      )}

        {/* TAB 2: V8 ALATI (UČITAVA TVOJ EKRAN BEZ BLOKADE) */}
        {activeTab === 'v8_alati' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-black uppercase tracking-widest text-orange-500 mb-2">MASTER BYPASS AKTIVAN</h1>
              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Svi IPS paywallovi su isključeni.</p>
            </div>
            {/* OVO UČITAVA TVOJ ALAT I KAŽE MU DA SI TI ADMIN */}
            <div className="scale-[0.9] origin-top -mt-10"> 
              <V8PixarSelfiePage isAdmin={true} />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
// KRAJ FUNKCIJE: V8AdminDashboard

export default V8AdminDashboard;