import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Zap, ShieldCheck, X, Image as ImageIcon, Video, FolderArchive, Layers, Pencil } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import * as data from './data'; 

// 🔥 OSNOVNE KATEGORIJE (Dodat "Viral", a "Hrana i Piće" je već tu) 🔥
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

// 🔥 V8 PAMETNE PODKATEGORIJE (Za sada samo Luksuzni Lajfstajl) 🔥
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

  // POČETAK FUNKCIJE: useEffect
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email === "damnjanovicgoran7@gmail.com") setIsAdmin(true);
      else setIsAdmin(false);
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
          <p className="text-zinc-400 text-[13px] uppercase tracking-widest font-bold max-w-3xl mx-auto leading-relaxed text-center leading-relaxed">
            Zaboravite na preskupe produkcije. Preuzmite kompletne ZIP arhive ekskluzivnih slika i videa u kristalno čistoj <span className="text-blue-400 drop-shadow-md font-black">2K rezoluciji</span>. Svaki V8 paket je inženjerski optimizovan i isporučuje svaki vizual u sva 4 ključna formata (1:1, 9:16, 16:9, 21:9). Spremno za preuzimanje. Spremno za apsolutnu dominaciju u vašim kampanjama.
          </p>
        </div>

        {isAdmin && (
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
                    <button onClick={() => setShowIpsModal(paket)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2">
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

      </div>

      {showIpsModal && (
        <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-blue-500/40 rounded-[2.5rem] max-w-md w-full relative text-zinc-100 font-sans shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden">
            <button onClick={() => setShowIpsModal(null)} className="absolute top-5 right-5 bg-white/5 p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all z-10"><X size={20} strokeWidth={3} /></button>
            
            <div className="p-10 flex flex-col items-center">
              <h3 className="text-[18px] font-black uppercase tracking-widest mb-2 text-blue-500 flex items-center gap-3"><Zap className="w-5 h-5" /> IPS Uplata</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6 text-center leading-relaxed">Paket: {showIpsModal.naziv}</p>
              
              <div className="w-52 h-52 bg-white p-3 rounded-3xl mb-5 flex items-center justify-center border-4 border-dashed border-blue-500/30 shadow-inner overflow-hidden relative">
                <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${showIpsModal.cena},00|SF:289|S:V8 Paket-${showIpsModal.naziv.substring(0,10)}|RO:V8-PAKET`} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"M"} includeMargin={false} />
              </div>
              
              <div className="text-[10px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-2.5 rounded-full uppercase tracking-widest mb-8 shadow-lg">Skeniraj m-banking aplikacijom</div>
              
              <div className="mt-4 w-full bg-[#050505] border border-blue-500/30 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mb-4">Pošaljite potvrdu uplate na:</p>
                <div className="flex flex-col gap-3">
                  <a href="viber://chat?number=%2B381648201496" className="flex items-center justify-center gap-2 bg-[#7360f2]/10 border border-[#7360f2]/30 text-[#7360f2] py-3 rounded-xl font-black text-[12px] tracking-widest hover:bg-[#7360f2]/20 transition-all">🟣 VIBER</a>
                  <a href="https://wa.me/381648201496" className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] py-3 rounded-xl font-black text-[12px] tracking-widest hover:bg-[#25D366]/20 transition-all">🟢 WHATSAPP</a>
                  <a href="mailto:damnjanovicgoran7@gmail.com" className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 py-3 rounded-xl font-black text-[12px] tracking-widest hover:bg-blue-500/20 transition-all">📧 EMAIL</a>
                </div>
                <span className="block mt-4 text-[9px] text-zinc-500 uppercase font-black tracking-widest">Sistem vam automatski šalje ZIP link.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
// KRAJ FUNKCIJE: V8StockBerza

export default V8StockBerza;