import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Zap, ShieldCheck, X, Image as ImageIcon, Video, FolderArchive, Layers, Pencil, Users } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import * as data from './data'; 

// 🔥 OSNOVNE KATEGORIJE 🔥
const KATEGORIJE = [
  "Prilagođen dizajn",
  "Viral",
  "Portretna Fotografija", "Modni Editorijal", "Luksuzni Lajfstajl", 
  "Reklamiranje Proizvoda", "Nekretnine i Enterijeri", "Hrana i Piće",
  "Arhitektura i Eksterijeri", "Automobili", 
  "Superautomobili (Supercars)", 
  "Pogled iz vazduha (Dron)", 
  "Tehnologija i Gedžeti", "Lepota i Kozmetika", "Nakit i Satovi", 
  "Podvodni Svet", "Priroda i Pejzaži", "Urbana Ulična Fotografija", 
  "Filmski Kadrovi", "Istorijski Realizam", "Fantazijski Realizam", 
  "Sci-Fi Realizam", "Makro i Detalji", "Minimalistički Studio", 
  "Konceptualna Umetnost", "AI Umetnost", "Prilagođeni Stilovi"
];

// 🔥 V8 PAMETNE PODKATEGORIJE 🔥
const PODKATEGORIJE = {
  "Luksuzni Lajfstajl": [
    "Haute Horlogerie Tourbillon sat na tamnom opsidijanskom postolju",
    "Verenički prsten obložen dijamantima koji reflektuje lasersku svetlost",
    "Luksuzna Niche bočica parfema okružena lebdećim tečnim zlatom",
    "High-End teglica kreme za negu kože na zaleđenoj površini",
    "Premium kožna dizajnerska torbica u minimalističkom studiju",
    "Ručno rađene italijanske kožne Oxford cipele, filmske senke",
    "Platinasti hronograf sat sa odsjajem safirnog stakla",
    "Ogrlica od smaragda i zlata koja počiva na crnom somotu",
    "Kristalni dekanter za viski iz kog se toči ćilibarska tečnost",
    "Luksuzni karmin sa metalik završnicom ogledala",
    "Minimalistička mat crna kreditna kartica, dramatično osvetljenje ivica",
    "Visoka moda sunčane naočare, sjajna tekstura, oštar kontrast",
    "Zanatsko nalivpero koje piše po debelom pergamentu",
    "Rubinske minđuše pod jakim reflektorom zlatare",
    "Titanijumska dugmad za manžetne po meri na pozadini od brušenog čelika",
    "Premium audio slušalice, detalji od eloksiranog aluminijuma",
    "Luksuzna svilena marama koja se elegantno savija u vazduhu",
    "High-End espreso aparat koji svetli u mračnom kafiću",
    "Ekskluzivna vintage kutija za cigare, metalik tipografija",
    "Moderni pametni sat sa svetlećim OLED interfejsom",
    "Rose Gold narukvica prebačena preko bele mermerne kocke",
    "Luksuzni organski sapun okružen lebdećim biljkama",
    "Tekstura sakoa po meri, makro detalj tkanine",
    "Izuzetna dijamantska tijara koja hvata oštre zrake svetlosti",
    "Premium dizajnerske sunčane naočare na belom pesku sa oštrim senkama",
    "High-end mehanička tastatura sa svetlećim RGB i okvirom od brušenog aluminijuma",
    "Luksuzna svilena kravata graciozno prebačena preko minimalnog mermernog bloka",
    "Izuzetan broš od safira i dijamanata osvetljen laserskim reflektorima",
    "Zanatska kožna aktovka u mračnom, high-end izlogu butika",
    "Kristalna bočica parfema koja reflektuje neonski cyberpunk grad",
    "Premium slušalice za poništavanje buke koje lebde u gluvoj sobi"
  ]
};

// POČETAK FUNKCIJE: FullScreenLightbox
const FullScreenLightbox = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-10 right-10 bg-white/10 hover:bg-orange-600/20 p-3 rounded-full text-white hover:text-orange-500 transition-all z-10">
                <X size={28} strokeWidth={3} />
            </button>
            <img src={imageUrl} alt="Full Screen Primer" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.25)] border-2 border-white/5" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};
// KRAJ FUNKCIJE: FullScreenLightbox

// POČETAK FUNKCIJE: V8StockBerza
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

  const [noviNaziv, setNoviNaziv] = useState('');
  const [novaKategorija, setNovaKategorija] = useState(KATEGORIJE[0]);
  const [novaPodkategorija, setNovaPodkategorija] = useState(''); 
  const [novaCena, setNovaCena] = useState('1999');
  const [noviTip, setNoviTip] = useState('Slika'); 
  const [noviOpis, setNoviOpis] = useState('Sadržaj paketa: 20 Premium AI Vizuala. Svaki dolazi u 4 rezolucije (Post, Story, Web, Wide). Ukupno 80 fajlova spremnih za upload. Vrednost studijskog fotkanja je preko 50.000 RSD.');
  const [previewUrl, setPreviewUrl] = useState('');
  const [zipLink, setZipLink] = useState('');

  const [showKlijentiPanel, setShowKlijentiPanel] = useState(false);
  const [klijenti, setKlijenti] = useState([]);

  // POČETAK FUNKCIJE: useEffect
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
          setCurrentUser(user);
          if (user.email === "damnjanovicgoran7@gmail.com") setIsAdmin(true);
          else setIsAdmin(false);
      } else {
          setCurrentUser(null);
          setIsAdmin(false);
      }
    });
    fetchPaketi();
  }, []);
  // KRAJ FUNKCIJE: useEffect

  // POČETAK FUNKCIJE: fetchPaketi
  const fetchPaketi = async () => {
    try {
      const q = query(collection(db, "v8_stock_paketi"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPaketi(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
    }
  };
  // KRAJ FUNKCIJE: fetchPaketi

  // POČETAK FUNKCIJE: fetchKlijenti
  const fetchKlijenti = async () => {
      try {
          const q = query(collection(db, "v8_kupci"), orderBy("vreme", "desc"));
          const snap = await getDocs(q);
          setKlijenti(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
          console.error("Greška pri učitavanju klijenata:", err);
      }
  };
  // KRAJ FUNKCIJE: fetchKlijenti

  // POČETAK FUNKCIJE: prijavaIKupovina
  const prijavaIKupovina = async (paket) => {
      if (currentUser) {
          snimiKupcaUBazu(currentUser, paket);
          setShowIpsModal(paket);
      } else {
          const provider = new GoogleAuthProvider();
          try {
              const result = await signInWithPopup(auth, provider);
              const ulogovaniKorisnik = result.user;
              await snimiKupcaUBazu(ulogovaniKorisnik, paket);
              setShowIpsModal(paket); 
          } catch (error) {
              console.error("Prijava prekinuta", error);
              alert("Za kupovinu premium paketa, molimo vas da se prijavite.");
          }
      }
  };
  // KRAJ FUNKCIJE: prijavaIKupovina

  // POČETAK FUNKCIJE: snimiKupcaUBazu
  const snimiKupcaUBazu = async (user, paket) => {
      try {
          await addDoc(collection(db, "v8_kupci"), {
              ime: user.displayName || "Klijent",
              email: user.email,
              uid: user.uid,
              zeliPaket: paket.naziv,
              cenaPaketa: paket.cena,
              vreme: serverTimestamp()
          });
      } catch (error) {
          console.error("Greška pri beleženju klijenta", error);
      }
  };
  // KRAJ FUNKCIJE: snimiKupcaUBazu

  // POČETAK FUNKCIJE: handleUploadPreview
  const handleUploadPreview = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData(); 
    fd.append('file', file); 
    fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json();
      setPreviewUrl(resData.secure_url);
    } catch (err) {
      alert("Greška pri uploadu!");
    } finally {
      setIsUploading(false);
    }
  };
  // KRAJ FUNKCIJE: handleUploadPreview

  // POČETAK FUNKCIJE: handleUploadPrimeri
  const handleUploadPrimeri = async (e) => {
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;

    const slobodnaMesta = 4 - primeriUrls.length;
    if (slobodnaMesta <= 0) {
        alert("Maksimalan broj primera (4) je već dodat!");
        return;
    }

    const fajloviZaUpload = files.slice(0, slobodnaMesta);
    setIsUploadingPrimer(true);
    const noveSlike = [];

    try {
      for (const file of fajloviZaUpload) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
        const resData = await res.json();
        noveSlike.push(resData.secure_url);
      }
      setPrimeriUrls(stareSlike => [...stareSlike, ...noveSlike]);
    } catch (err) {
      alert("Greška pri uploadu primera!");
    } finally {
      setIsUploadingPrimer(false);
      e.target.value = null; 
    }
  };
  // KRAJ FUNKCIJE: handleUploadPrimeri

  // POČETAK FUNKCIJE: handleKategorijaChange
  const handleKategorijaChange = (e) => {
    setNovaKategorija(e.target.value);
    setNovaPodkategorija(''); 
  };
  // KRAJ FUNKCIJE: handleKategorijaChange

  // POČETAK FUNKCIJE: dodajPaket
  const dodajPaket = async (e) => {
    e.preventDefault();
    if (!previewUrl || !zipLink) return alert("Moraš dodati Preview i Link do ZIP fajla!");
    
    const paketData = {
        naziv: noviNaziv,
        kategorija: novaKategorija,
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
            alert("V8 Paket uspešno ažuriran!");
        } else {
            await addDoc(collection(db, "v8_stock_paketi"), {
                ...paketData,
                createdAt: serverTimestamp() 
            });
            alert("V8 Paket uspešno dodat u prodavnicu!");
        }
        stoziEdit(); 
        fetchPaketi();
    } catch (error) {
      alert(`Greška: ${error.message}`);
    }
  };
  // KRAJ FUNKCIJE: dodajPaket

  // POČETAK FUNKCIJE: startEditPaket
  const startEditPaket = (paket) => {
    setEditingPaketId(paket.id);
    setNoviNaziv(paket.naziv);
    setNovaKategorija(paket.kategorija);
    setNovaPodkategorija(paket.podkategorija || '');
    setNovaCena(paket.cena);
    setNoviTip(paket.tip);
    setNoviOpis(paket.opis);
    setPreviewUrl(paket.previewUrl);
    setZipLink(paket.zipLink);
    setPrimeriUrls(paket.primeri || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowKlijentiPanel(false);
  };
  // KRAJ FUNKCIJE: startEditPaket

  // POČETAK FUNKCIJE: stoziEdit
  const stoziEdit = () => {
    setEditingPaketId(null);
    setNoviNaziv(''); setPreviewUrl(''); setZipLink(''); setPrimeriUrls([]); setNovaPodkategorija('');
  };
  // KRAJ FUNKCIJE: stoziEdit

  // POČETAK FUNKCIJE: obrisiPaket
  const obrisiPaket = async (id) => {
    if (window.confirm("Obrisati ovaj paket iz prodavnice?")) {
      await deleteDoc(doc(db, "v8_stock_paketi", id));
      fetchPaketi();
    }
  };
  // KRAJ FUNKCIJE: obrisiPaket
 return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 font-sans text-white text-left">
      
      <style>{`
        @keyframes spin-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .v8-premium-card {
          position: relative;
          border-radius: 2rem;
          padding: 2px;
          overflow: hidden;
          background: #0a0a0a;
        }
        .v8-premium-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 50%,
            #ea580c 70%,
            #8b5cf6 85%,
            #3b82f6 100%
          );
          animation: spin-gradient 3.5s linear infinite;
          z-index: 0;
        }
        .v8-card-content {
          position: relative;
          background: #0a0a0a;
          border-radius: 1.9rem;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      <FullScreenLightbox imageUrl={fullScreenImageUrl} onClose={() => setFullScreenImageUrl(null)} />

      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
            <FolderArchive className="w-4 h-4" /> Digitalna Berza Paketa
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">
            GOTOVI V8 <span className="text-blue-500">VIZUALNI PAKETI</span>
          </h1>
          <p className="text-zinc-400 text-[13px] uppercase tracking-widest font-bold max-w-3xl mx-auto leading-relaxed text-center">
            Zaboravite na preskupe produkcije. Preuzmite kompletne ZIP arhive ekskluzivnih slika i videa u kristalno čistoj <span className="text-blue-400 drop-shadow-md font-black">2K rezoluciji</span>. Svaki V8 paket je inženjerski optimizovan i isporučuje svaki vizual u sva 4 ključna formata (1:1, 9:16, 16:9, 21:9). Spremno za preuzimanje. Spremno za apsolutnu dominaciju u vašim kampanjama.
          </p>
        </div>

        {/* ADMIN PANEL - KONTROLE */}
        {isAdmin && (
            <div className="mb-6 flex gap-4 justify-center">
                <button onClick={() => { setShowKlijentiPanel(false); stoziEdit(); }} className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${!showKlijentiPanel ? 'bg-orange-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/5'}`}>
                   📦 Dodaj Paket
                </button>
                <button onClick={() => { setShowKlijentiPanel(true); fetchKlijenti(); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${showKlijentiPanel ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/5'}`}>
                   <Users size={16} /> Baza Klijenata
                </button>
            </div>
        )}

        {/* 🔥 ADMIN BAZA KLIJENATA TAB 🔥 */}
        {isAdmin && showKlijentiPanel && (
            <div className="bg-[#0a0a0a] border-2 border-blue-500/50 rounded-[2.5rem] p-8 mb-16 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <h2 className="text-xl font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Users className="w-6 h-6" /> Klijenti koji su tražili kupovinu</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-400 text-[10px] uppercase tracking-widest">
                                <th className="p-4">Ime klijenta</th>
                                <th className="p-4">Email adresa</th>
                                <th className="p-4">Željeni Paket</th>
                                <th className="p-4 text-right">Cena</th>
                            </tr>
                        </thead>
                        <tbody>
                            {klijenti.map((k, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all text-[12px] text-white">
                                    <td className="p-4 font-bold">{k.ime}</td>
                                    <td className="p-4 text-blue-400 select-all">{k.email}</td>
                                    <td className="p-4 text-orange-400 font-bold">{k.zeliPaket}</td>
                                    <td className="p-4 text-right">{k.cenaPaketa} RSD</td>
                                </tr>
                            ))}
                            {klijenti.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-zinc-500">Još uvek nema klijenata u bazi.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ADMIN FORMA ZA PAKETE TAB */}
        {isAdmin && !showKlijentiPanel && (
          <form onSubmit={dodajPaket} className="bg-[#0a0a0a] border-2 border-orange-500/50 rounded-[2.5rem] p-8 mb-16 shadow-[0_0_30px_rgba(234,88,12,0.1)] relative">
            
            {editingPaketId && (
                <button type="button" onClick={stoziEdit} className="absolute -top-4 -right-4 bg-[#ea1212] p-3 rounded-full text-white hover:scale-110 hover:bg-orange-600 transition-all z-10 shadow-lg border border-white/5">
                    <X size={20} strokeWidth={4} />
                </button>
            )}

            <h2 className="text-xl font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                {editingPaketId ? <Pencil className="w-6 h-6 text-blue-500" /> : <Zap className="w-6 h-6" />}
                {editingPaketId ? 'Izmeni Paket (Admin)' : 'Dodaj Novi ZIP Paket (Admin)'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input type="text" value={noviNaziv} onChange={(e)=>setNoviNaziv(e.target.value)} placeholder="Naziv Paketa (npr. Zlatni Satovi)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white" required />
              
              <select value={novaKategorija} onChange={handleKategorijaChange} className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none">
                {KATEGORIJE.map(k => <option key={k} value={k}>{k}</option>)}
              </select>

              {PODKATEGORIJE[novaKategorija] && (
                  <select value={novaPodkategorija} onChange={(e)=>setNovaPodkategorija(e.target.value)} className="bg-black border border-orange-500/30 p-4 rounded-xl text-[13px] text-white outline-none">
                    <option value="">Izaberi podkategoriju (Opciono)</option>
                    {PODKATEGORIJE[novaKategorija].map(pk => <option key={pk} value={pk}>{pk}</option>)}
                  </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select value={noviTip} onChange={(e)=>setNoviTip(e.target.value)} className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none">
                <option value="Slika">Slike (Paket)</option>
                <option value="Video">Video (Paket)</option>
              </select>
              <input type="text" value={novaCena} onChange={(e)=>setNovaCena(e.target.value)} placeholder="Cena u RSD (npr. 1500)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white" required />
            </div>

            <input type="text" value={noviOpis} onChange={(e)=>setNoviOpis(e.target.value)} placeholder="Opis šta se dobija" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white w-full mb-4" required />
            <input type="url" value={zipLink} onChange={(e)=>setZipLink(e.target.value)} placeholder="Link do ZIP fajla (Google Drive / Mega)" className="bg-black border border-blue-500/50 p-4 rounded-xl text-[13px] text-white w-full mb-4 outline-none" required />
            
            <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
              
              <label className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all">
                {isUploading ? 'Učitavam Preview...' : '1. Ubaci Glavni Preview'}
                <input type="file" accept="image/*,video/*" onChange={handleUploadPreview} className="hidden" />
              </label>
              {previewUrl && <div className="w-12 h-12 rounded-lg bg-green-500 border-2 border-green-400 flex items-center justify-center shadow-lg"><ShieldCheck className="w-6 h-6 text-white" /></div>}
              
              <label className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all">
                {isUploadingPrimer ? 'Učitavam Primer...' : '2. Ubaci Sličice (Max 4)'}
                <input type="file" multiple accept="image/*" onChange={handleUploadPrimeri} className="hidden" />
              </label>
              
              {primeriUrls.length > 0 && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-green-500 font-black tracking-widest">{primeriUrls.length}/4</span>
                      <button type="button" onClick={() => setPrimeriUrls([])} className="text-red-500 hover:bg-red-500/20 p-1 rounded-full transition-all ml-1" title="Obriši sve primere">
                          <X size={14} strokeWidth={3} />
                      </button>
                  </div>
              )}

              <button type="submit" className={`ml-auto px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg ${editingPaketId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white transition-all w-full md:w-auto mt-4 md:mt-0`}>
                  {editingPaketId ? '3. Sačuvaj Izmene' : '3. Sačuvaj Paket'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {paketi.map(paket => (
            <div key={paket.id} className="v8-premium-card group transition-all duration-500 hover:scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.15)] text-left flex flex-col">
              <div className="v8-card-content p-5">
                
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                    <div className="bg-blue-600 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg tracking-widest">{paket.kategorija}</div>
                    {paket.podkategorija && (
                        <div className="bg-orange-600 text-white text-[7px] font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-widest opacity-95 text-right max-w-[200px] leading-tight">
                            {paket.podkategorija}
                        </div>
                    )}
                </div>
                
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-3 bg-black border border-white/5 shadow-inner">
                  {paket.previewUrl && paket.previewUrl.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={`${paket.previewUrl}#t=0.001`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                  ) : (
                    <img src={paket.previewUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt={paket.naziv} />
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md flex items-center gap-2 text-[9px] font-black uppercase text-white border border-white/10 z-10">
                    <Layers className="w-3 h-3 text-orange-500" /> Svi Formati Uključeni
                  </div>
                </div>

                {paket.primeri && paket.primeri.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-5">
                        {paket.primeri.map((imgUrl, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-zinc-900 shadow-xl relative cursor-pointer" onClick={() => setFullScreenImageUrl(imgUrl)}>
                                <img src={imgUrl} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110" alt={`Primer ${idx+1}`} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {paket.tip === 'Video' ? <Video className="w-4 h-4 text-blue-500" /> : <ImageIcon className="w-4 h-4 text-orange-500" />}
                  <h3 className="text-[17px] font-black uppercase text-white line-clamp-1 italic">{paket.naziv}</h3>
                </div>
                
                <p className="text-zinc-500 text-[10px] uppercase font-bold mb-6 flex-1 leading-relaxed">{paket.opis}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-xl font-black text-white">{paket.cena} <span className="text-[10px] text-zinc-500">RSD</span></span>
                    <button onClick={() => prijavaIKupovina(paket)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2">
                        Kupi <Zap className="w-3 h-3" />
                    </button>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-red-900/30 flex items-center gap-3">
                    <button onClick={() => startEditPaket(paket)} className="w-full py-2.5 bg-zinc-800 text-zinc-400 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all border border-zinc-700/50 flex items-center justify-center gap-2 shadow-lg">
                        Izmeni Paket <Pencil size={12} />
                    </button>
                    <button onClick={() => obrisiPaket(paket.id)} className="w-full py-2.5 bg-red-900/30 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all border border-red-900/50 shadow-lg">
                      Ukloni Paket
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 POČETAK: CUSTOM DIZAJN BANER 🔥 */}
        <div className="mt-20 relative bg-[#0a0a0a] border-2 border-blue-600 rounded-[2rem] p-6 md:p-10 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />

          {/* Slike levo */}
          <div className="flex items-center gap-4 shrink-0 relative z-10">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <img src="https://images.pexels.com/photos/266621/pexels-photo-266621.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Premium Custom 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            {/* 🔥 OVDE JE SKLONJENA mt-6 MARGINA 🔥 */}
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <img src="https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Premium Custom 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 delay-100" />
            </div>
          </div>

          {/* Tekst desno */}
          <div className="flex-1 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> V8 Studio Produkcija
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-white italic">
              USLUGA IZRADE <span className="text-blue-500">PRILAGOĐENIH PAKETA</span> FOTOGRAFIJA
            </h3>
            <p className="text-zinc-400 text-[11px] md:text-[13px] font-bold tracking-wide uppercase leading-relaxed mb-8">
              Kreiramo jedinstvene pakete vizuala po vašim pojedinačnim željama, hirurški prilagođene specifičnim potrebama, estetici i bojama vašeg biznisa. Ne nalazite na Berzi tačno ono što tražite? Naš V8 AI tim će izraditi ekskluzivnu kolekciju samo za vas.
            </p>
            <a href="mailto:damnjanovicgoran7@gmail.com" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
              📧 Kontaktirajte nas za ponudu na mail
            </a>
          </div>
        </div>
        {/* 🔥 KRAJ: CUSTOM DIZAJN BANER 🔥 */}

      </div>

      {/* 🔥 POČETAK FUNKCIJE: NOVI IPS MODAL SA SLIKE 🔥 */}
      {showIpsModal && (
        <div className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1522] rounded-xl max-w-[420px] w-full relative text-zinc-100 font-sans shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center pt-8 pb-10 px-8 border border-white/5">
            
            {/* Naslovi */}
            <h2 className="text-xl font-black uppercase tracking-widest mb-3 text-white">IPS UPLATA</h2>
            <p className="text-[12px] text-zinc-300 font-bold uppercase tracking-widest mb-6 text-center">PAKET: {showIpsModal.naziv}</p>
            
            <p className="text-[13px] text-zinc-300 mb-3 text-center">Konfirmacija uplate:</p>
            
            {/* Plavi box za QR */}
            <div className="w-full border border-blue-500/60 rounded-xl p-6 flex flex-col items-center mb-6 bg-[#141b2d]">
              <p className="text-[12px] text-zinc-200 mb-5 text-center">Skenirajte QR kod za potvrdu uplate:</p>
              
              <div className="bg-white p-2 rounded-lg relative flex items-center justify-center">
                <QRCodeCanvas 
                   value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${showIpsModal.cena},00|SF:289|S:V8 Paket-${showIpsModal.naziv.substring(0,10)}|RO:V8-PAKET`} 
                   size={180} 
                   bgColor={"#ffffff"} 
                   fgColor={"#000000"} 
                   level={"M"} 
                   includeMargin={false} 
                />
              </div>
            </div>
            
            {/* Kontakt */}
            <p className="text-[13px] text-zinc-300 mb-5 text-center">Pošaljite potvrdu uplate na:</p>
            
            <div className="flex items-center gap-6">
               {/* Viber Ikona - Bulletproof SVG */}
               <a href="viber://chat?number=%2B381648201496" className="w-12 h-12 bg-[#7360f2] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                 <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                   <path d="M21.05 6.64c-.38-1.5-1.12-2.82-2.13-3.83-1.01-1.01-2.33-1.75-3.83-2.13C13.63.31 12 0 12 0s-1.63.31-3.09.68c-1.5.38-2.82 1.12-3.83 2.13-1.01 1.01-1.75 2.33-2.13 3.83-.37 1.46-.68 3.09-.68 3.09s.31 1.63.68 3.09c.38 1.5 1.12 2.82 2.13 3.83 1.01 1.01 2.33 1.75 3.83 2.13C10.37 19.16 12 19.47 12 19.47v4.53s2.94-2.58 4.71-4.35c.18-.18.33-.37.49-.55.97-.24 1.89-.66 2.7-1.22l.06-.05c.89-.68 1.63-1.52 2.15-2.48.37-1.46.68-3.09.68-3.09s.32-1.63-.06-3.09h-.02a18.23 18.23 0 0 0-.01-.01c-.42-1.55-1.19-2.9-2.22-3.95zm-2.07 9.54c-.16.51-.51.9-.98 1.09-.81.33-1.99.11-3.23-.48-1.42-.69-3.05-1.92-4.52-3.39-1.47-1.47-2.7-3.1-3.39-4.52-.59-1.24-.81-2.42-.48-3.23.19-.47.58-.82 1.09-.98.44-.14 1.01-.13 1.43.14.3.19.49.52.61.85.19.55.33 1.12.39 1.69.05.41-.09.82-.39 1.12-.2.2-.42.38-.66.53-.13.08-.18.25-.11.39.54 1.11 1.34 2.11 2.33 2.95.84.72 1.84 1.3 2.95 1.69.14.05.3-.02.39-.14.15-.24.33-.46.53-.66.3-.3.71-.44 1.12-.39.57.06 1.14.2 1.69.39.33.12.66.31.85.61.27.42.28.99.14 1.43zM16.6 9.69a6.6 6.6 0 0 0-4.66-4.66c-.46-.12-.86.27-.86.74 0 .36.26.68.61.76 1.95.46 3.49 2 3.95 3.95.08.35.4.61.76.61.47 0 .86-.4.74-.86v-.01c-.13-.19-.32-.38-.54-.53zm1.88-.53c-.3-.49-.69-.94-1.14-1.34-.4-.36-.85-.68-1.34-.94-.55-.29-1.14-.52-1.76-.66-.46-.11-.86.27-.86.74 0 .36.26.68.61.75 1.1.25 2.14.77 2.99 1.54.77.85 1.29 1.89 1.54 2.99.07.35.39.61.75.61.47 0 .85-.4.74-.86-.14-.62-.37-1.21-.66-1.76-.04-.03-.07-.05-.11-.07z"/>
                 </svg>
               </a>
            </div>

            {/* X Dugme dole - kao na slici za lakše zatvaranje, ili ostavimo gore. Da bi bilo sigurno stavljam X i gore desno i dole. */}
            <button onClick={() => setShowIpsModal(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-zinc-400 hover:text-white transition-all">
               <X size={20} strokeWidth={3} />
            </button>

          </div>
        </div>
      )}
      {/* 🔥 KRAJ FUNKCIJE: NOVI IPS MODAL SA SLIKE 🔥 */}

    </div>
  );
};
// KRAJ FUNKCIJE: V8StockBerza

export default V8StockBerza;