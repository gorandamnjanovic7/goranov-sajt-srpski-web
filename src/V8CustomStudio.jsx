import React, { useState } from 'react';
import { Camera, Zap, Sparkles, Send, ShieldCheck, X, Image as ImageIcon, Video } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const V8CustomStudio = () => {
  const [opis, setOpis] = useState('');
  const [email, setEmail] = useState('');
  const [format, setFormat] = useState('Slika (Fotorealizam)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIpsModal, setShowIpsModal] = useState(false);

  const cenaRsd = 1500; // Premium cena za Custom izradu

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opis || !email) return alert("Popunite email i opis vizije!");
    
    setIsSubmitting(true);

    // --- V8 VIP BYPASS PROVERA ---
    const adminEmailovi = ['damnjanovicgoran7@gmail.com', 'aitoolsprosmart@gmail.com'];
    const unetEmail = email.toLowerCase().trim();
    const jesteAdmin = adminEmailovi.includes(unetEmail);

    try {
      // Šaljemo narudžbinu u tvoju V8 bazu
      await addDoc(collection(db, "v8_narudzbine"), {
        email: unetEmail,
        opis: opis,
        format: format,
        cena: jesteAdmin ? 0 : cenaRsd, // Adminu je 0 RSD
        status: jesteAdmin ? "Admin_Odobreno" : "Ceka_Uplatu", // Odmah zeleno svetlo za tebe
        vreme: serverTimestamp(),
        klijentId: auth.currentUser ? auth.currentUser.uid : 'Gost'
      });
      
      if (jesteAdmin) {
        // Ako je Admin, izbaci VIP poruku i očisti formu BEZ otvaranja naplate
        alert("👑 V8 MASTER PREPOZNAT! Narudžbina je prosleđena u bazu bez naplate.");
        setOpis('');
        setEmail('');
      } else {
        // Običan korisnik - Otvaramo IPS Modal za naplatu
        setShowIpsModal(true);
      }
      
    } catch (error) {
      console.error(error);
      alert("Greška pri slanju narudžbine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 font-sans text-white text-left">
      <div className="max-w-4xl mx-auto">
        
        {/* V8 HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" /> V8 Custom Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">
            TVOJA VIZIJA. <span className="text-orange-500">NAŠ MOTOR.</span>
          </h1>
          <p className="text-zinc-400 text-[13px] uppercase tracking-widest font-bold max-w-2xl mx-auto leading-relaxed">
            Naruči unikatnu AI sliku ili video tačno po tvojoj meri. Naši inženjeri će generisati vizual Holivudskog kvaliteta i poslati ti ga na email u roku od 24h.
          </p>
        </div>

        {/* FORMA ZA NARUČIVANJE */}
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-red-600"></div>
          
          <div className="flex flex-col gap-6 pl-4">
            
            {/* Email */}
            <div>
              <label className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Vaš Email (Gde šaljemo radove):</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none focus:border-orange-500 transition-all"
                placeholder="ime@firma.com"
                required
              />
            </div>

            {/* Format (Slika ili Video) */}
            <div>
              <label className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mb-3 block">Izaberi Format:</label>
              <div className="flex flex-wrap gap-3">
                {['Slika (Fotorealizam)', 'Slika (3D Pixar)', 'Video (Motion 4K)'].map(f => (
                  <button 
                    type="button" 
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${format === f ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-black border-white/10 text-zinc-500 hover:border-orange-500/50 hover:text-white'}`}
                  >
                    {f.includes('Video') ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Opis */}
            <div>
              <label className="text-[11px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Opiši detaljno šta želiš:</label>
              <textarea 
                value={opis} 
                onChange={(e) => setOpis(e.target.value)} 
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none focus:border-orange-500 transition-all min-h-[150px]"
                placeholder="Npr: Želim lava u poslovnom odelu koji pije kafu na krovu zgrade u Njujorku. Svetlo neka bude neonsko, filmski izgled..."
                required
              />
            </div>

            {/* Dugme za plaćanje */}
            <div className="mt-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 uppercase tracking-widest font-black">
                <ShieldCheck className="w-6 h-6 text-green-500" /> Sigurna IPS Transakcija
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Obrada...' : `Naruči i Plati (${cenaRsd} RSD)`} <Send className="w-5 h-5" />
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* IPS MODAL ZA NAPLATU */}
      {showIpsModal && (
        <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-orange-500/40 rounded-[2.5rem] max-w-md w-full relative text-zinc-100 font-sans shadow-[0_0_60px_rgba(234,88,12,0.15)] overflow-hidden">
            <button onClick={() => setShowIpsModal(false)} className="absolute top-5 right-5 bg-white/5 p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all z-10"><X size={20} strokeWidth={3} /></button>
            
            <div className="p-10 flex flex-col items-center">
              <h3 className="text-[18px] font-black uppercase tracking-widest mb-2 text-orange-500 flex items-center gap-3"><Zap className="w-5 h-5" /> IPS Uplata</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6">Usluga: V8 Custom Izrada</p>
              
              <div className="w-52 h-52 bg-white p-3 rounded-3xl mb-5 flex items-center justify-center border-4 border-dashed border-orange-500/30 shadow-inner overflow-hidden relative">
                {/* OBAVEZNO TVOJ PRAVI ŽIRO RAČUN */}
                <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD1500,00|SF:289|S:V8 Custom Studio|RO:V8-CUSTOM`} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"M"} includeMargin={false} />
              </div>
              
              <div className="text-[10px] font-black bg-orange-500/10 border border-orange-500/20 text-orange-400 px-5 py-2.5 rounded-full uppercase tracking-widest mb-8 shadow-lg">Skeniraj m-banking aplikacijom</div>
              
              <div className="mt-4 w-full bg-[#050505] border border-orange-500/30 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(234,88,12,0.15)]">
                <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mb-4">Nakon uplate, potvrdu pošaljite na:</p>
                <div className="flex flex-col gap-3">
                  <a href="viber://chat?number=%2B381648201496" className="flex items-center justify-center gap-2 bg-[#7360f2]/10 border border-[#7360f2]/30 text-[#7360f2] py-3 rounded-xl font-black text-[12px] tracking-widest hover:bg-[#7360f2]/20 transition-all">🟣 VIBER</a>
                  <a href="https://wa.me/381648201496" className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] py-3 rounded-xl font-black text-[12px] tracking-widest hover:bg-[#25D366]/20 transition-all">🟢 WHATSAPP</a>
                </div>
                <span className="block mt-4 text-[9px] text-zinc-500 uppercase font-black tracking-widest">Sistem odmah kreće u izradu vašeg vizuala.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default V8CustomStudio;