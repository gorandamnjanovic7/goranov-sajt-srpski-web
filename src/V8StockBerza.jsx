import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Zap, ShieldCheck, X, Image as ImageIcon, Video, FolderArchive, Layers, Pencil, Users, CheckCircle, Globe, MapPin } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { KATEGORIJE, PODKATEGORIJE, OPISI_SABLONI, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME, V8_TRANSLATIONS } from './data'; 

const FullScreenLightbox = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-10 right-10 bg-white/10 hover:bg-[#FF8C00]/20 p-3 rounded-full text-white hover:text-[#FF8C00] transition-all z-10">
                <X size={28} strokeWidth={3} />
            </button>
            <img src={imageUrl} alt="Full Screen Primer" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(255,140,0,0.25)] border-2 border-white/5" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

const V8StockBerza = () => {
  const [paketi, setPaketi] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [showIpsModal, setShowIpsModal] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPrimer, setIsUploadingPrimer] = useState(false);
  const [primeriUrls, setPrimeriUrls] = useState([]); 
  const [editingPaketId, setEditingPaketId] = useState(null); 
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null);
  const [isGlobal, setIsGlobal] = useState(true);

  // V8 POLJA
  const [noviNaziv, setNoviNaziv] = useState('');
  const [noviNazivEn, setNoviNazivEn] = useState('');
  const [noviVolume, setNoviVolume] = useState('');
  const [noviFormat, setNoviFormat] = useState('16:9 (20 SLIKA)'); // VRATIO: POLJE ZA FORMAT
  const [novaKategorija, setNovaKategorija] = useState(KATEGORIJE[0]);
  const [novaPodkategorija, setNovaPodkategorija] = useState(''); 
  const [novaCena, setNovaCena] = useState('1999');
  const [noviTip, setNoviTip] = useState('Slika'); 
  const [noviOpis, setNoviOpis] = useState(OPISI_SABLONI[0]); 
  const [previewUrl, setPreviewUrl] = useState('');
  const [zipLink, setZipLink] = useState('');

  const [showKlijentiPanel, setShowKlijentiPanel] = useState(false);
  const [klijenti, setKlijenti] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
          setCurrentUser(user);
          if (user.email === "damnjanovicgoran7@gmail.com" || user.email === "aitoolsprosmart@gmail.com") setIsAdmin(true);
          else setIsAdmin(false);
      } else {
          setCurrentUser(null);
          setIsAdmin(false);
      }
    });
    fetchPaketi();
  }, []);

  const fetchPaketi = async () => {
    try {
      const q = query(collection(db, "v8_stock_paketi"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPaketi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  const fetchKlijenti = async () => {
      try {
          const q = query(collection(db, "v8_kupci"), orderBy("vreme", "desc"));
          const snap = await getDocs(q);
          setKlijenti(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
  };

  const otkljucajPaketDirektno = async (id) => {
      try {
          await updateDoc(doc(db, "v8_kupci", id), { isPaid: true, vremeOdobrenja: serverTimestamp() });
          alert("🔥 V8 TURBO: Paket je uspešno otključan!");
          fetchKlijenti(); 
      } catch (err) { console.error(err); }
  };

  const prijavaIKupovina = async (paket) => {
      if (currentUser) {
          snimiKupcaUBazu(currentUser, paket);
          setShowIpsModal(paket);
      } else {
          const provider = new GoogleAuthProvider();
          try {
              const result = await signInWithPopup(auth, provider);
              await snimiKupcaUBazu(result.user, paket);
              setShowIpsModal(paket); 
          } catch (error) { alert("Prijava je neophodna za kupovinu."); }
      }
  };

  const snimiKupcaUBazu = async (user, paket) => {
      try {
          await addDoc(collection(db, "v8_kupci"), {
              ime: user.displayName || "Klijent", email: user.email, uid: user.uid,
              zeliPaket: paket.naziv, cenaPaketa: paket.cena, vreme: serverTimestamp(), isPaid: false
          });
      } catch (error) { console.error(error); }
  };

  const handleUploadPreview = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json();
      setPreviewUrl(resData.secure_url);
    } catch (err) { alert("Upload greška!"); } finally { setIsUploading(false); }
  };

  const handleUploadPrimeri = async (e) => {
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;
    const slobodnaMesta = 4 - primeriUrls.length;
    if (slobodnaMesta <= 0) return alert("Maksimum 4 primera!");
    setIsUploadingPrimer(true);
    const noveSlike = [];
    try {
      for (const file of files.slice(0, slobodnaMesta)) {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
        const resData = await res.json();
        noveSlike.push(resData.secure_url);
      }
      setPrimeriUrls(prev => [...prev, ...noveSlike]);
    } catch (err) { alert("Greška kod primera!"); } finally { setIsUploadingPrimer(false); e.target.value = null; }
  };

  const dodajPaket = async (e) => {
    e.preventDefault();
    if (!previewUrl || !zipLink) return alert("Preview i ZIP link su obavezni!");
    const paketData = {
        naziv: noviNaziv, 
        nazivEn: noviNazivEn, 
        volume: noviVolume,
        format: noviFormat, // VRATIO: ČUVANJE FORMATA U BAZU
        kategorija: novaKategorija, podkategorija: novaPodkategorija, 
        cena: novaCena, tip: noviTip, opis: noviOpis, previewUrl: previewUrl,
        zipLink: zipLink, primeri: primeriUrls, updatedAt: serverTimestamp() 
    };
    try {
        if (editingPaketId) {
            await updateDoc(doc(db, "v8_stock_paketi", editingPaketId), paketData);
            alert("Ažurirano!");
        } else {
            await addDoc(collection(db, "v8_stock_paketi"), { ...paketData, createdAt: serverTimestamp() });
            alert("Dodato!");
        }
        stoziEdit(); fetchPaketi();
    } catch (error) { alert(error.message); }
  };

  const startEditPaket = (paket) => {
    setEditingPaketId(paket.id); 
    setNoviNaziv(paket.naziv || ''); 
    setNoviNazivEn(paket.nazivEn || ''); 
    setNoviVolume(paket.volume || '');
    setNoviFormat(paket.format || '16:9 (20 SLIKA)'); // POVLAČENJE FORMATA
    setNovaKategorija(paket.kategorija);
    setNovaPodkategorija(paket.podkategorija || ''); setNovaCena(paket.cena); setNoviTip(paket.tip);
    setNoviOpis(paket.opis); setPreviewUrl(paket.previewUrl); setZipLink(paket.zipLink);
    setPrimeriUrls(paket.primeri || []); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stoziEdit = () => {
    setEditingPaketId(null); setNoviNaziv(''); setNoviNazivEn(''); setNoviVolume(''); setNoviFormat('16:9 (20 SLIKA)'); setPreviewUrl(''); setZipLink(''); setPrimeriUrls([]);
  };

  const obrisiPaket = async (id) => {
    if (window.confirm("Obrisati paket?")) { await deleteDoc(doc(db, "v8_stock_paketi", id)); fetchPaketi(); }
  };

  const getGlobalCena = (rsdCena) => {
      const osnova = parseInt(rsdCena) / 117;
      return Math.ceil(osnova * 1.8) + 9;
  };

  const translateV8 = (text) => { if (!isGlobal || !text) return text; return V8_TRANSLATIONS[text] || V8_TRANSLATIONS[text.toUpperCase()] || text; };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 font-sans text-white text-left">
      <style>{`
        @keyframes spin-gradient { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .v8-premium-card { position: relative; border-radius: 2rem; padding: 2px; overflow: hidden; background: #0a0a0a; }
        .v8-premium-card::before { content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent 0%, transparent 50%, #ea580c 70%, #8b5cf6 85%, #3b82f6 100%); animation: spin-gradient 3.5s linear infinite; z-index: 0; }
        .v8-card-content { position: relative; background: #0a0a0a; border-radius: 1.9rem; z-index: 1; height: 100%; display: flex; flex-direction: column; }
      `}</style>

      <FullScreenLightbox imageUrl={fullScreenImageUrl} onClose={() => setFullScreenImageUrl(null)} />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-16 mt-4">
            <div className="bg-[#0a0a0a] border border-white/10 p-2 rounded-full flex items-center relative shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                
                {/* SRBIJA DUGME */}
                <button onClick={() => setIsGlobal(false)} className={`px-8 py-3.5 rounded-full font-black text-[11px] uppercase transition-all flex items-center gap-2 z-10 ${!isGlobal ? 'bg-[#FF8C00] text-black shadow-[0_0_20px_rgba(255,140,0,0.6)] scale-105' : 'text-zinc-500 hover:text-white'}`}>
                    <MapPin size={16} /> SRBIJA
                </button>

                {/* GLOBAL DUGME */}
                <button onClick={() => setIsGlobal(true)} className={`px-10 py-3.5 rounded-full font-black text-[13px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative overflow-hidden border-2 z-10 ml-2 ${isGlobal ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)] scale-110' : 'bg-blue-900/30 text-blue-400 border-blue-500/50 hover:bg-blue-600 hover:text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse hover:animate-none hover:scale-105'}`}>
                    <Globe size={18} className={isGlobal ? "animate-bounce" : ""} /> GLOBAL (EN) EUR
                </button>
                
            </div>
        </div>

        {isAdmin && !showKlijentiPanel && (
          <form onSubmit={dodajPaket} className="bg-[#0a0a0a] border-2 border-[#FF8C00]/50 rounded-[2.5rem] p-8 mb-16 shadow-[0_0_30px_rgba(255,140,0,0.1)]">
            <h2 className="text-xl font-black text-[#FF8C00] uppercase tracking-widest mb-6 flex items-center gap-2"><Zap className="w-6 h-6" /> {editingPaketId ? 'Izmeni Paket' : 'Dodaj Novi ZIP Paket'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" value={noviNaziv} onChange={(e)=>setNoviNaziv(e.target.value)} placeholder="Naziv Paketa (SRB)" className="bg-black border border-[#FF8C00]/50 p-4 rounded-xl text-[14px] font-black text-white w-full outline-none" required />
                <input type="text" value={noviNazivEn} onChange={(e)=>setNoviNazivEn(e.target.value)} placeholder="Naziv Paketa (ENG)" className="bg-black border border-blue-500/50 p-4 rounded-xl text-[14px] font-black text-white w-full outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <textarea value={noviOpis} onChange={(e)=>setNoviOpis(e.target.value)} placeholder="Sadržaj paketa..." rows={3} className="bg-black border border-white/10 p-4 rounded-xl text-[13px] font-bold text-white w-full outline-none resize-none" required />
              <select value={novaKategorija} onChange={(e) => setNovaKategorija(e.target.value)} className="bg-black border border-white/10 p-4 rounded-xl text-[13px] font-bold text-white">
                {KATEGORIJE.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <input type="text" value={novaCena} onChange={(e)=>setNovaCena(e.target.value)} placeholder="Cena RSD" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] font-bold text-white" />
            </div>

            {/* SELEKCIJA FORMATA 20 vs 80 SLIKA */}
            <div className="mb-4 flex flex-col gap-2">
                <label className="text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">Format Paketa (Rezolucije)</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`cursor-pointer flex-1 p-4 rounded-xl border-2 transition-all text-center font-black text-[12px] uppercase ${noviFormat === '16:9 (20 SLIKA)' ? 'bg-[#FF8C00]/20 border-[#FF8C00] text-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-[#FF8C00]/50 hover:text-white'}`}>
                        <input type="radio" name="format" value="16:9 (20 SLIKA)" checked={noviFormat === '16:9 (20 SLIKA)'} onChange={(e) => setNoviFormat(e.target.value)} className="hidden" />
                        Samo 16:9 (20 slika)
                    </label>
                    <label className={`cursor-pointer flex-1 p-4 rounded-xl border-2 transition-all text-center font-black text-[12px] uppercase ${noviFormat === 'SVI FORMATI (80 SLIKA)' ? 'bg-[#FF8C00]/20 border-[#FF8C00] text-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'bg-black border-white/10 text-zinc-500 hover:border-[#FF8C00]/50 hover:text-white'}`}>
                        <input type="radio" name="format" value="SVI FORMATI (80 SLIKA)" checked={noviFormat === 'SVI FORMATI (80 SLIKA)'} onChange={(e) => setNoviFormat(e.target.value)} className="hidden" />
                        Svi formati (80 slika)
                    </label>
                </div>
            </div>

            {/* VOLUME INPUT */}
            {novaKategorija && (
              <div className="mb-4 flex flex-col gap-2">
                <label className="text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">Kolekcija (Volume)</label>
                <input type="text" placeholder="Npr. VOL 1 (Opciono)" value={noviVolume} onChange={(e) => setNoviVolume(e.target.value)} className="bg-black text-white border border-[#FF8C00]/50 p-4 rounded-xl text-[13px] font-black outline-none focus:border-[#FF8C00] transition-all" />
              </div>
            )}

            <input type="url" value={zipLink} onChange={(e)=>setZipLink(e.target.value)} placeholder="Google Drive ZIP Link" className="bg-black border border-blue-500/50 p-4 rounded-xl text-[13px] text-white w-full mb-4 outline-none font-bold" required />
            
            {/* VIZUELNI PREGLED I DUGMIĆI ZA UPLOAD */}
            <div className="flex flex-col gap-4">
              {(previewUrl || primeriUrls.length > 0) && (
                <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mt-2 mb-2">
                  {previewUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                      <span className="absolute top-0 left-0 bg-[#FF8C00] text-black text-[9px] font-black px-2 py-0.5 z-10">MAIN</span>
                      <img src={previewUrl} alt="Main" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {primeriUrls.map((url, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                      <img src={url} alt={`Primer ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="bg-white/10 hover:bg-[#FF8C00] hover:text-black px-6 py-4 rounded-xl font-black text-[11px] uppercase cursor-pointer transition-all"> 
                  {isUploading ? 'UČITAVAM...' : 'Glavni Preview'} 
                  <input type="file" onChange={handleUploadPreview} className="hidden" /> 
                </label>
                <label className="bg-white/10 hover:bg-[#FF8C00] hover:text-black px-6 py-4 rounded-xl font-black text-[11px] uppercase cursor-pointer transition-all"> 
                  {isUploadingPrimer ? 'UČITAVAM...' : `Sličice (${primeriUrls.length}/4)`} 
                  <input type="file" multiple onChange={handleUploadPrimeri} className="hidden" /> 
                </label>
                <button type="submit" className="ml-auto px-8 py-4 rounded-xl font-black text-[12px] uppercase bg-[#FF8C00] hover:bg-orange-500 text-black transition-all shadow-[0_0_20px_rgba(255,140,0,0.5)]"> 
                  {editingPaketId ? 'Sačuvaj Izmene' : 'Sačuvaj Paket'} 
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {paketi.map(paket => (
            <div key={paket.id} className="v8-premium-card group transition-all duration-500 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,140,0,0.15)] flex flex-col">
              <div className="v8-card-content p-5 md:p-6">
                
                {/* SLIKA SA V8 RIBONIMA (BEDŽEVIMA) */}
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-4 bg-black border border-white/5 shadow-inner">
                  
                  {/* BEDŽ ZA VOLUME (GORE LEVO) */}
                  {paket.volume && (
                      <div className="absolute top-0 left-0 bg-[#FF8C00] text-black px-3 py-1.5 rounded-br-xl rounded-tl-2xl font-black text-[10px] uppercase tracking-widest z-20 shadow-lg border-b border-r border-[#FF8C00]/50">
                          {paket.volume}
                      </div>
                  )}

                  {/* BEDŽ ZA FORMAT (GORE DESNO) */}
                  {paket.format && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-[#FF8C00]/50 text-[#FF8C00] px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider z-20">
                          {paket.format}
                      </div>
                  )}

                  {paket.previewUrl && paket.previewUrl.match(/\.(mp4|webm|mov)$/i) ? (
                    <video preload="none" src={`${paket.previewUrl}#t=0.001`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                  ) : (
                    <img loading="lazy" src={paket.previewUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" alt={paket.naziv} />
                  )}
                </div>
                
                {paket.primeri && paket.primeri.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {paket.primeri.map((imgUrl, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl relative cursor-pointer" onClick={() => setFullScreenImageUrl(imgUrl)}>
                                <img loading="lazy" src={imgUrl} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-all duration-300" alt="V8 Primer" />
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  {paket.tip === 'Video' ? <Video className="w-5 h-5 text-[#FF8C00]" /> : <ImageIcon className="w-5 h-5 text-[#FF8C00]" />}
                  <h3 className="text-[18px] md:text-[20px] font-black uppercase text-white tracking-widest">
                    {isGlobal && paket.nazivEn ? paket.nazivEn : translateV8(paket.naziv)}
                  </h3>
                </div>
                
                <p className="text-zinc-400 text-[11px] uppercase font-black mb-6 flex-1 leading-relaxed tracking-wider">
                    {translateV8(paket.opis)}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-[#FF8C00]/30">
                  <span className="text-2xl font-black text-white">{isGlobal ? `€${getGlobalCena(paket.cena)}` : `${paket.cena} RSD`}</span>
                  {isAdmin ? (
                      <a href={paket.zipLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2">PREUZMI <Download className="w-4 h-4" /></a>
                  ) : (
                      <button onClick={() => prijavaIKupovina(paket)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2">{isGlobal ? "BUY NOW" : "Kupi"} <Zap className="w-4 h-4" /></button>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="mt-5 pt-4 border-t border-red-900/30 flex items-center gap-3">
                    <button onClick={() => startEditPaket(paket)} className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">Izmeni <Pencil size={14} /></button>
                    <button onClick={() => obrisiPaket(paket.id)} className="w-full py-3 bg-red-900/30 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all">Ukloni</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showIpsModal && (
        <div className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1522] rounded-xl max-w-[420px] w-full relative pt-8 pb-10 px-8 border border-white/5 shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-black uppercase tracking-widest mb-3 text-white">{isGlobal ? "INTERNATIONAL WIRE" : "IPS UPLATA"}</h2>
            <p className="text-[12px] text-zinc-300 font-bold uppercase tracking-widest mb-6 text-center">{showIpsModal.naziv}</p>
            <div className="w-full border border-blue-500/60 rounded-xl p-6 mb-6 bg-[#141b2d] flex flex-col items-center">
              {!isGlobal ? (
                <div className="bg-white p-2 rounded-lg"><QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${showIpsModal.cena},00|SF:289|S:V8 Paket-${(showIpsModal.naziv || "").substring(0,10)}|RO:V8-PAKET`} size={180} /></div>
              ) : (
                <div className="w-full text-left text-[11px] uppercase tracking-wider text-zinc-300 space-y-4 font-mono">
                    <div className="pb-3 border-b border-white/10"><span className="text-zinc-500 block text-[9px] mb-1">RECEIVER</span><strong className="text-white">GORAN DAMNJANOVIĆ</strong></div>
                    <div className="pb-3 border-b border-white/10"><span className="text-zinc-500 block text-[9px] mb-1">SWIFT</span><strong className="text-blue-400">KOBBRSBG</strong></div>
                    <div className="pb-3 border-b border-white/10"><span className="text-zinc-500 block text-[9px] mb-1">IBAN</span><strong className="text-blue-400 select-all">RS35205903102884947363</strong></div>
                    <div className="pt-2 flex justify-between items-center"><span className="text-zinc-500">TOTAL:</span><strong className="text-[#FF8C00] text-[20px]">€{getGlobalCena(showIpsModal.cena)}</strong></div>
                </div>
              )}
            </div>
            <button onClick={() => setShowIpsModal(null)} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-zinc-400 hover:text-white"><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default V8StockBerza;