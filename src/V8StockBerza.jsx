import React, { useState, useEffect } from 'react';
import { V8_SVE_KATEGORIJE, PODKATEGORIJE, OPISI_SABLONI, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME, V8_TRANSLATIONS, KATEGORIJE_PREVOD } from './data';
import { Sparkles, Download, Zap, ShieldCheck, X, Image as ImageIcon, Video, FolderArchive, Layers, Pencil, Users, CheckCircle, Globe, MapPin, Type, FileText, Wallet, MonitorPlay, Link, Images } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';


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
  const [noviFormat, setNoviFormat] = useState('16:9 (20 SLIKA)');
  const [novaKategorija, setNovaKategorija] = useState(V8_SVE_KATEGORIJE[0]);
  const [novaKategorijaEn, setNovaKategorijaEn] = useState(''); // ENG Kategorija
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

  // 👇 V8 AUTOMATSKI OPIS 👇
  useEffect(() => {
    if (noviFormat === '16:9 (20 SLIKA)') {
      setNoviOpis("20 PREMIUM AI VIZUALA U ULTRA-ŠIROKOJ 16:9 REZOLUCIJI. Savršeno za desktop prezentacije, Hero sekcije sajtova i video produkciju. V8 kvalitet bez kompromisa.");
    } else if (noviFormat === 'SVI FORMATI (80 SLIKA)') {
      setNoviOpis("80 PREMIUM AI VIZUALA U 4 REZOLUCIJE (16:9, 9:16, 1:1, 21:9). Kompletan paket za sve platforme: od Instagram i TikTok Reels-a do premium web dizajna. Ultimativna V8 kolekcija.");
    }
  }, [noviFormat]);
// 👇 V8 AUTOMATSKI PREVOD KATEGORIJE 👇
  useEffect(() => {
      if (novaKategorija) {
          const engleskiPrevod = KATEGORIJE_PREVOD[novaKategorija];
          if (engleskiPrevod) {
              setNovaKategorijaEn(engleskiPrevod);
          } else {
              setNovaKategorijaEn(novaKategorija); // Ako nema prevoda, ostavlja original da ne bude prazno
          }
      }
  }, [novaKategorija]);
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

  // --- POČETAK FUNKCIJE: prijavaIKupovina ---
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
        } catch (error) { 
            alert(isGlobal ? "LOGIN REQUIRED: Please log in with your Gmail account to proceed." : "Prijava preko Gmail-a je neophodna za kupovinu."); 
        }
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
    
    // 👇 V8 AUTOPILOT: Dvosmerna sinhronizacija Naziva i Kategorije 👇
    
    // 1. Definišemo konačan NAZIV (Ako je prazno, vuče kategoriju. Ako nije, uzima ono što si kucao)
    const konacanNaziv = noviNaziv.trim() !== '' ? noviNaziv.trim() : novaKategorija;
    const konacanNazivEn = noviNazivEn.trim() !== '' ? noviNazivEn.trim() : novaKategorijaEn;
    
    // 2. Definišemo konačnu KATEGORIJU (Ako si ukucao svoj naziv, on PREGAZI kategoriju i postaje nova kategorija)
    const konacnaKategorija = noviNaziv.trim() !== '' ? noviNaziv.trim() : novaKategorija;
    const konacnaKategorijaEn = noviNazivEn.trim() !== '' ? noviNazivEn.trim() : novaKategorijaEn;
    
    const paketData = {
        naziv: konacanNaziv, 
        nazivEn: konacanNazivEn, 
        volume: noviVolume,
        format: noviFormat, 
        kategorija: konacnaKategorija,     // SADA SE AUTOMATSKI MENJA
        kategorijaEn: konacnaKategorijaEn, // SADA SE AUTOMATSKI MENJA
        podkategorija: novaPodkategorija, 
        cena: novaCena, 
        tip: noviTip, 
        opis: noviOpis, 
        previewUrl: previewUrl,
        zipLink: zipLink, 
        primeri: primeriUrls, 
        updatedAt: serverTimestamp() 
    };
    
    try {
        if (editingPaketId) {
            await updateDoc(doc(db, "v8_stock_paketi", editingPaketId), paketData);
            alert("V8: Paket uspešno ažuriran!");
        } else {
            await addDoc(collection(db, "v8_stock_paketi"), { ...paketData, createdAt: serverTimestamp() });
            alert("V8: Novi paket je dodat u Berzu!");
        }
        stoziEdit(); fetchPaketi();
    } catch (error) { alert(error.message); }
  };

  const startEditPaket = (paket) => {
    setEditingPaketId(paket.id); 
    setNoviNaziv(paket.naziv || ''); 
    setNoviNazivEn(paket.nazivEn || ''); 
    setNoviVolume(paket.volume || '');
    setNoviFormat(paket.format || '16:9 (20 SLIKA)'); 
    setNovaKategorija(paket.kategorija || V8_SVE_KATEGORIJE[0]);
    setNovaKategorijaEn(paket.kategorijaEn || ''); // Povlači ENG kategoriju
    setNovaPodkategorija(paket.podkategorija || ''); 
    setNovaCena(paket.cena || '1999'); 
    setNoviTip(paket.tip || 'Slika');
    setNoviOpis(paket.opis || ''); 
    setPreviewUrl(paket.previewUrl || ''); 
    setZipLink(paket.zipLink || '');
    setPrimeriUrls(paket.primeri || []); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stoziEdit = () => {
    setEditingPaketId(null); 
    setNoviNaziv(''); 
    setNoviNazivEn(''); 
    setNoviVolume(''); 
    setNoviFormat('16:9 (20 SLIKA)'); 
    setNovaKategorijaEn(''); // Čisti ENG kategoriju
    setPreviewUrl(''); 
    setZipLink(''); 
    setPrimeriUrls([]);
  };

  const obrisiPaket = async (id) => {
    if (window.confirm("Obrisati paket?")) { await deleteDoc(doc(db, "v8_stock_paketi", id)); fetchPaketi(); }
  };

  const getGlobalCena = (rsdCena) => {
      const osnova = parseInt(rsdCena) / 117;
      return Math.ceil(osnova * 1.8) + 9;
  };

  const translateV8 = (text) => { if (!isGlobal || !text) return text; return V8_TRANSLATIONS[text] || V8_TRANSLATIONS[text.toUpperCase()] || text; };

  // 👇 V8 HELPER ZA PREVOD OPISA 👇
  const prevodOpisa = (opis) => {
    if (!isGlobal || !opis) return opis;
    const recnik = {
        "20 PREMIUM AI VIZUALA U ULTRA-ŠIROKOJ 16:9 REZOLUCIJI. Savršeno za desktop prezentacije, Hero sekcije sajtova i video produkciju. V8 kvalitet bez kompromisa.": "PACKAGE CONTENTS: 20 PREMIUM AI VISUALS IN ULTRA-WIDE 16:9. PERFECT FOR WEBSITES AND YT. VALUE OVER €250.",
        "80 PREMIUM AI VIZUALA U 4 REZOLUCIJE (16:9, 9:16, 1:1, 21:9). Kompletan paket za sve platforme: od Instagram i TikTok Reels-a do premium web dizajna. Ultimativna V8 kolekcija.": "PACKAGE CONTENTS: 80 PREMIUM AI VISUALS IN 4 RESOLUTIONS (16:9, 9:16, 1:1, 21:9). COMPLETE PACKAGE FOR ALL PLATFORMS. THE ULTIMATE V8 COLLECTION."
    };
    if (recnik[opis]) return recnik[opis];
    return translateV8(opis);
  };

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
                <button onClick={() => setIsGlobal(false)} className={`px-8 py-3.5 rounded-full font-black text-[11px] uppercase transition-all flex items-center gap-2 z-10 ${!isGlobal ? 'bg-[#FF8C00] text-black shadow-[0_0_20px_rgba(255,140,0,0.6)] scale-105' : 'text-zinc-500 hover:text-white'}`}>
                    <MapPin size={16} /> SRBIJA
                </button>
                <button onClick={() => setIsGlobal(true)} className={`px-10 py-3.5 rounded-full font-black text-[13px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative overflow-hidden border-2 z-10 ml-2 ${isGlobal ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)] scale-110' : 'bg-blue-900/30 text-blue-400 border-blue-500/50 hover:bg-blue-600 hover:text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse hover:animate-none hover:scale-105'}`}>
                    <Globe size={18} className={isGlobal ? "animate-bounce" : ""} /> GLOBAL (EN) EUR
                </button>
            </div>
        </div>

        {/* --- POČETAK: V8 ADMIN KOMANDNA TABLA ZA ODOBRENJA --- */}
        {isAdmin && (
            <div className="flex justify-center mb-8">
                <button
                    onClick={() => {
                        setShowKlijentiPanel(!showKlijentiPanel);
                        if (!showKlijentiPanel) fetchKlijenti();
                    }}
                    className="bg-zinc-900 border border-[#FF8C00]/50 hover:bg-[#FF8C00] text-[#FF8C00] hover:text-black transition-all px-8 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,140,0,0.2)]"
                >
                    <Users size={18} />
                    {showKlijentiPanel ? "ZATVORI ODOBRENJA (NAZAD NA FORMU)" : "KLIJENTI I ODOBRENJA"}
                </button>
            </div>
        )}

        {isAdmin && showKlijentiPanel && (
            <div className="bg-[#0a0a0a] border-2 border-[#FF8C00] rounded-[2.5rem] p-8 mb-16 shadow-[0_0_40px_rgba(255,140,0,0.15)] max-w-4xl mx-auto">
                <h2 className="text-xl font-black text-[#FF8C00] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" /> KONTROLA UPLATA
                </h2>
                
                <div className="flex flex-col gap-3">
                    {klijenti.length === 0 ? (
                        <div className="text-center py-10 bg-black rounded-2xl border border-white/5">
                            <p className="text-zinc-500 font-bold uppercase text-sm tracking-widest">Trenutno nema narudžbina u redu čekanja.</p>
                        </div>
                    ) : (
                        klijenti.map(klijent => (
                            <div key={klijent.id} className="bg-black border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-[#FF8C00]/50 hover:shadow-[0_0_15px_rgba(255,140,0,0.2)]">
                                <div>
                                    <p className="text-white font-black text-[15px]">{klijent.email}</p>
                                    <p className="text-zinc-400 text-[11px] uppercase font-bold tracking-wider mt-1">
                                        Traženi paket: <span className="text-[#FF8C00] ml-1">{klijent.zeliPaket}</span>
                                    </p>
                                    <p className="text-zinc-600 text-[10px] font-mono mt-2 font-bold uppercase tracking-widest">
                                        Datum: {klijent.vreme?.toDate().toLocaleString("sr-RS")}
                                    </p>
                                </div>
                                <div>
                                    {klijent.isPaid ? (
                                        <div className="bg-green-900/20 border border-green-500/30 text-green-500 px-6 py-3 rounded-xl font-black text-[11px] uppercase flex items-center gap-2">
                                            <CheckCircle size={16} /> ODOBRENO
                                        </div>
                                    ) : (
                                        <button onClick={() => otkljucajPaketDirektno(klijent.id)} className="bg-[#FF8C00] hover:bg-orange-500 text-black px-8 py-3 rounded-xl font-black text-[11px] uppercase shadow-[0_0_20px_rgba(255,140,0,0.4)] transition-all flex items-center gap-2 hover:scale-105">
                                            <Zap size={16} /> KLIKNI DA ODOBRIŠ
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
        {/* --- KRAJ: V8 ADMIN KOMANDNA TABLA --- */}

        {isAdmin && !showKlijentiPanel && (
          <form onSubmit={dodajPaket} className="bg-[#0a0a0a] border-2 border-[#FF8C00]/50 rounded-[2.5rem] p-8 mb-16 shadow-[0_0_30px_rgba(255,140,0,0.1)]">
            <h2 className="text-xl font-black text-[#FF8C00] uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-[#FF8C00]/20 pb-4">
              <Zap className="w-6 h-6" /> {editingPaketId ? 'IZMENI PAKET' : 'DODAJ NOVI ZIP PAKET'}
            </h2>
            
            {/* PRVI RED: Nazivi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                        <Type size={14} /> NAZIV PAKETA (SRB)
                    </label>
                    <input type="text" value={noviNaziv} onChange={(e)=>setNoviNaziv(e.target.value)} placeholder="Npr. Priroda i Pejzaži" className="bg-black border border-[#FF8C00]/50 p-4 rounded-xl text-[14px] font-black text-white w-full outline-none focus:border-[#FF8C00] transition-all" required />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-blue-400 font-black text-[11px] tracking-widest uppercase">
                        <Globe size={14} /> NAZIV PAKETA (ENG)
                    </label>
                    <input type="text" value={noviNazivEn} onChange={(e)=>setNoviNazivEn(e.target.value)} placeholder="Npr. Nature & Landscape" className="bg-black border border-blue-500/50 p-4 rounded-xl text-[14px] font-black text-white w-full outline-none focus:border-blue-400 transition-all" />
                </div>
            </div>

            {/* DRUGI RED: Opis, Kategorije, Cena */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                      <FileText size={14} /> OPIS PAKETA
                  </label>
                  <textarea value={noviOpis} onChange={(e)=>setNoviOpis(e.target.value)} placeholder="Sadržaj paketa..." rows={3} className="bg-black border border-white/10 p-4 rounded-xl text-[12px] font-bold text-white w-full outline-none resize-none focus:border-[#FF8C00] transition-all h-full" required />
              </div>

              <div className="flex flex-col gap-6 md:col-span-2">
                  {/* Kategorije SRB i ENG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                              <Layers size={14} /> KATEGORIJA (SRB)
                          </label>
                          <select value={novaKategorija} onChange={(e) => setNovaKategorija(e.target.value)} className="bg-black border border-white/10 p-4 rounded-xl text-[13px] font-bold text-white outline-none focus:border-[#FF8C00] transition-all">
                            {V8_SVE_KATEGORIJE.map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-blue-400 font-black text-[11px] tracking-widest uppercase">
                              <Globe size={14} /> CATEGORY (ENG)
                          </label>
                          <input type="text" value={novaKategorijaEn} onChange={(e) => setNovaKategorijaEn(e.target.value)} placeholder="E.g. Nature & Landscapes" className="bg-black border border-blue-500/50 p-4 rounded-xl text-[13px] font-bold text-white outline-none focus:border-blue-400 transition-all" />
                      </div>
                  </div>

                  {/* Cena i Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                              <Wallet size={14} /> CENA / PRICE (RSD)
                          </label>
                          <input type="text" value={novaCena} onChange={(e)=>setNovaCena(e.target.value)} placeholder="Npr. 1999" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] font-bold text-white outline-none focus:border-[#FF8C00] transition-all" />
                      </div>

                      <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                              <MonitorPlay size={14} /> FORMAT (REZOLUCIJE)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                              <label className={`cursor-pointer flex-1 p-3 rounded-xl border-2 transition-all text-center font-black text-[10px] uppercase ${noviFormat === '16:9 (20 SLIKA)' ? 'bg-[#FF8C00]/20 border-[#FF8C00] text-[#FF8C00]' : 'bg-black border-white/10 text-zinc-500'}`}>
                                  <input type="radio" name="format" value="16:9 (20 SLIKA)" checked={noviFormat === '16:9 (20 SLIKA)'} onChange={(e) => setNoviFormat(e.target.value)} className="hidden" />
                                  16:9 (20 slika)
                              </label>
                              <label className={`cursor-pointer flex-1 p-3 rounded-xl border-2 transition-all text-center font-black text-[10px] uppercase ${noviFormat === 'SVI FORMATI (80 SLIKA)' ? 'bg-[#FF8C00]/20 border-[#FF8C00] text-[#FF8C00]' : 'bg-black border-white/10 text-zinc-500'}`}>
                                  <input type="radio" name="format" value="SVI FORMATI (80 SLIKA)" checked={noviFormat === 'SVI FORMATI (80 SLIKA)'} onChange={(e) => setNoviFormat(e.target.value)} className="hidden" />
                                  Svi formati
                              </label>
                          </div>
                      </div>
                  </div>

                  {/* Volume (Kolekcija) */}
                  {novaKategorija && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[#FF8C00] font-black text-[11px] tracking-widest uppercase">
                              <FolderArchive size={14} /> KOLEKCIJA (VOLUME)
                          </label>
                          <input type="text" placeholder="Npr. VOL 1 (Opciono)" value={noviVolume} onChange={(e) => setNoviVolume(e.target.value)} className="bg-black text-white border border-white/10 p-3.5 rounded-xl text-[13px] font-black outline-none focus:border-[#FF8C00] transition-all" />
                        </div>
                    </div>
                  )}
              </div>
            </div>

            {/* TREĆI RED: Link i Slike */}
            <div className="border-t border-white/10 pt-6 mt-2">
                <div className="flex flex-col gap-2 mb-6">
                    <label className="flex items-center gap-2 text-blue-400 font-black text-[11px] tracking-widest uppercase">
                        <Link size={14} /> GOOGLE DRIVE ZIP LINK (ISPORUKA)
                    </label>
                    <input type="url" value={zipLink} onChange={(e)=>setZipLink(e.target.value)} placeholder="https://drive.google.com/..." className="bg-black border border-blue-500/50 p-4 rounded-xl text-[13px] text-white w-full outline-none font-bold focus:border-blue-400 transition-all" required />
                </div>

                <div className="flex flex-col gap-4">
                  {(previewUrl || primeriUrls.length > 0) && (
                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      {previewUrl && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                          <span className="absolute top-0 left-0 bg-[#FF8C00] text-black text-[9px] font-black px-2 py-0.5 z-10">MAIN</span>
                          <img src={previewUrl} alt="Main" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {primeriUrls.map((url, idx) => (
                        <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 relative">
                          <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] font-black px-1.5 py-0.5 z-10">PREVIEW</span>
                          <img src={url} alt={`Primer ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-zinc-400 font-black text-[10px] tracking-widest uppercase">
                            <ImageIcon size={12} /> GLAVNA SLIKA
                        </label>
                        <label className="bg-zinc-900 hover:bg-[#FF8C00] text-white hover:text-black border border-white/10 hover:border-[#FF8C00] px-6 py-4 rounded-xl font-black text-[11px] uppercase cursor-pointer transition-all flex items-center gap-2"> 
                          <ImageIcon size={16} /> {isUploading ? 'UČITAVAM...' : 'DODAJ PREVIEW'} 
                          <input type="file" onChange={handleUploadPreview} className="hidden" /> 
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-zinc-400 font-black text-[10px] tracking-widest uppercase">
                            <Images size={12} /> DODATNE SLIKE
                        </label>
                        <label className="bg-zinc-900 hover:bg-[#FF8C00] text-white hover:text-black border border-white/10 hover:border-[#FF8C00] px-6 py-4 rounded-xl font-black text-[11px] uppercase cursor-pointer transition-all flex items-center gap-2"> 
                          <Images size={16} /> {isUploadingPrimer ? 'UČITAVAM...' : `DODAJ SLIČICE (${primeriUrls.length}/4)`} 
                          <input type="file" multiple onChange={handleUploadPrimeri} className="hidden" /> 
                        </label>
                    </div>

                    <button type="submit" className="ml-auto px-8 py-4 rounded-xl font-black text-[13px] tracking-widest uppercase bg-[#FF8C00] hover:bg-orange-500 text-black transition-all shadow-[0_0_20px_rgba(255,140,0,0.5)] flex items-center gap-2 hover:scale-105"> 
                      <Zap size={18} /> {editingPaketId ? 'SAČUVAJ IZMENE' : 'SAČUVAJ PAKET'} 
                    </button>
                  </div>
                </div>
            </div>
          </form>
        )}

        {/* POČETAK FUNKCIJE: PrikazPaketaKontejner */}
        <div className="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
          {paketi.map(paket => (
            <div key={paket.id} className="w-full md:w-[calc(50%-1.5rem)] v8-premium-card group transition-all duration-500 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,140,0,0.15)] flex flex-col">
        {/* KRAJ FUNKCIJE: PrikazPaketaKontejner */}
              <div className="v8-card-content p-5 md:p-6">
                
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-4 bg-black border border-white/5 shadow-inner">
                  {paket.volume && (
                      <div className="absolute top-0 left-0 bg-[#FF8C00] text-black px-3 py-1.5 rounded-br-xl rounded-tl-2xl font-black text-[10px] uppercase tracking-widest z-20 shadow-lg border-b border-r border-[#FF8C00]/50">
                          {paket.volume}
                      </div>
                  )}
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
                
                <p className="text-zinc-400 text-[11px] uppercase font-black mb-6 flex-1 leading-relaxed tracking-wider whitespace-pre-wrap">
                    {prevodOpisa(paket.opis)}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-[#FF8C00]/30">
                  <span className="text-2xl font-black text-white">{isGlobal ? `€${getGlobalCena(paket.cena)}` : `${paket.cena} RSD`}</span>
                  {isAdmin ? (
    <a href={paket.zipLink} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
        {isGlobal ? "DOWNLOAD" : "PREUZMI"} <Download className="w-4 h-4" />
    </a>
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
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050505] rounded-3xl max-w-[420px] w-full relative pt-8 pb-10 px-8 border-2 border-[#FF8C00] shadow-[0_0_50px_rgba(255,140,0,0.2)] flex flex-col items-center">
            
            <h2 className="text-2xl font-black uppercase tracking-widest mb-2 text-[#FF8C00]">
              {isGlobal ? "INTERNATIONAL WIRE" : "IPS UPLATA"}
            </h2>
            
            <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mb-6 text-center">
              {isGlobal && showIpsModal.nazivEn ? showIpsModal.nazivEn : showIpsModal.naziv} {showIpsModal.volume ? showIpsModal.volume : ''}
            </p>
            
            {isGlobal && (
              <div className="w-full mb-6 p-4 bg-[#FF8C00]/10 border border-[#FF8C00]/50 rounded-xl text-center">
                  <p className="text-[10px] text-zinc-300 font-black uppercase tracking-widest mb-1">
                      ⚠️ IMPORTANT
                  </p>
                  <p className="text-[12px] text-white font-bold mb-1">
                      Send proof of payment to:
                  </p>
                  <p className="text-[16px] text-[#FF8C00] font-black uppercase tracking-wider">
                      aitoolsprosmart@gmail.com
                  </p>
              </div>
            )}
           
            <div className="w-full border border-white/10 rounded-2xl p-6 mb-6 bg-[#0a0a0a] flex flex-col items-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8C00] to-transparent opacity-50"></div>
              
              {!isGlobal ? (
                <div className="bg-white p-3 rounded-xl shadow-[0_0_20px_rgba(255,140,0,0.3)]">
                  <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${showIpsModal.cena},00|SF:289|S:V8 Paket-${(showIpsModal.naziv || "").substring(0,10)}|RO:V8-PAKET`} size={180} />
                </div>
              ) : (
                <div className="w-full text-left text-[12px] uppercase tracking-wider text-zinc-300 space-y-4 font-mono">
                    <div className="pb-3 border-b border-white/5">
                        <span className="text-zinc-600 block text-[9px] mb-1 font-sans font-black">BENEFICIARY</span>
                        <strong className="text-white text-[13px]">GORAN DAMNJANOVIĆ</strong>
                    </div>
                    <div className="pb-3 border-b border-white/5">
                        <span className="text-zinc-600 block text-[9px] mb-1 font-sans font-black">BANK</span>
                        <strong className="text-zinc-400">KOMERCIJALNA BANKA AD BEOGRAD</strong>
                    </div>
                    <div className="pb-3 border-b border-white/5">
                        <span className="text-zinc-600 block text-[9px] mb-1 font-sans font-black">SWIFT / BIC</span>
                        <strong className="text-[#FF8C00]">KOBBRSBG</strong>
                    </div>
                    <div className="pb-3 border-b border-white/5">
                        <span className="text-zinc-600 block text-[9px] mb-1 font-sans font-black">IBAN</span>
                        <strong className="text-[#FF8C00] select-all tracking-widest text-[14px]">RS35205903102884947363</strong>
                    </div>
                    <div className="pt-2 flex justify-between items-end">
                        <span className="text-zinc-600 font-sans font-black text-[10px]">TOTAL:</span>
                        <strong className="text-white text-[24px] leading-none">€{getGlobalCena(showIpsModal.cena)}</strong>
                    </div>
                </div>
              )}
            </div>
            
            <button onClick={() => setShowIpsModal(null)} className="absolute top-4 right-4 bg-white/5 p-2 rounded-full text-zinc-500 hover:text-[#FF8C00] hover:bg-[#FF8C00]/10 transition-all">
              <X size={20} strokeWidth={3} />
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default V8StockBerza;