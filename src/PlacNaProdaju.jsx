import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, MapPin, Phone, Mail, Tag, Layers, Map, Home, Snowflake, FileText, Info } from 'lucide-react';

// POČETAK FUNKCIJE: PlacNaProdaju
const PlacNaProdaju = () => {
  const [activeGallery, setActiveGallery] = useState('plac');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // POČETAK FUNKCIJE: trackConversion
  const trackConversion = () => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-18075037332/GbjncJKhgZwceJTd7KpD'
      });
      console.log("✅ V8 Signal poslat: Kupac je kliknuo na kontakt!");
    }
  };
  // KRAJ FUNKCIJE: trackConversion

  const imagesPlac = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464047736614-af63643285bf?auto=format&fit=crop&w=1200&q=80"
  ];

  const imagesOkolina = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
  ];

  const currentImages = activeGallery === 'plac' ? imagesPlac : imagesOkolina;

  useEffect(() => {
    let interval;
    if (!isHovered && !isFullscreen && currentImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [isHovered, isFullscreen, currentImages.length]);

  const handleTabChange = (tabName) => {
    setActiveGallery(tabName);
    setCurrentIndex(0);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
  };

  return (
    <div className="min-h-screen bg-[#050505] py-12 px-4 sm:px-6 lg:px-8 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* NASLOV - CENTRIRAN SA V8 LINIJOM */}
        <div className="mb-16 flex justify-center w-full mt-4">
          <div className="border-l-4 border-orange-600 pl-6 text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight uppercase drop-shadow-lg">
              Kompletno Imanje: <span className="text-orange-500 font-black">Kuća, Plac i Hladnjača</span>
            </h1>
            <p className="text-xl text-slate-400 flex items-center gap-2 font-medium">
              <MapPin className="w-6 h-6 text-orange-500" />
              Vojvodina, Grocka (Odlična mikrolokacija za biznis i život)
            </p>
          </div>
        </div>

        {/* GORNJI DEO: Galerija i Brzi podaci */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex gap-3 mb-2">
              <button onClick={() => handleTabChange('plac')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeGallery === 'plac' ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'bg-[#111] text-slate-400 hover:bg-[#222]'}`}>Slike Imanja</button>
              <button onClick={() => handleTabChange('okolina')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeGallery === 'okolina' ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'bg-[#111] text-slate-400 hover:bg-[#222]'}`}>Okolina</button>
            </div>

            <div className="relative w-full h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-[#0a0a0a] group border border-white/10" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => setIsFullscreen(true)}>
              <img src={currentImages[currentIndex]} alt="Prikaz" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                 <Maximize2 className="w-12 h-12 text-white/50" />
              </div>
              {currentImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-orange-600 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-orange-600 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-6 h-6" /></button>
                </>
              )}
              {!isHovered && <div className="absolute bottom-0 left-0 h-1.5 bg-orange-600 animate-[progress_15s_linear_infinite]"></div>}
            </div>

            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
              {currentImages.map((img, idx) => (
                <div key={idx} onClick={() => setCurrentIndex(idx)} className={`flex-shrink-0 w-36 h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === idx ? 'border-orange-600 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#111] rounded-3xl p-8 border border-white/5 shadow-2xl">
               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter text-orange-500">Kratak Pregled</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Snowflake className="text-cyan-500" /> <span>Hladnjača u radu</span></div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Home className="text-orange-500" /> <span>Porodična kuća 1/1</span></div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Map className="text-green-500" /> <span>14 ari ograđeno</span></div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-black rounded-3xl p-8 border border-orange-600/30 shadow-[0_20px_50px_rgba(234,88,12,0.15)] text-center">
                <p className="text-orange-500 text-sm font-black uppercase mb-1">Cena za ceo paket</p>
                {/* 🎯 OVDE JE PROMENJENA CENA NA 200.000 € */}
                <h2 className="text-5xl font-black mb-8 italic">200.000 €</h2>
                <div className="space-y-4">
                  <a href="tel:+381648201496" onClick={trackConversion} className="flex items-center justify-center gap-3 bg-orange-600 text-white p-5 rounded-2xl font-black hover:scale-105 transition-all shadow-lg text-lg uppercase tracking-wider">
                    <Phone /> +381 64 820 1496
                  </a>
                  <a href="mailto:damnjanovicgoran7@gmail.com" onClick={trackConversion} className="flex items-center justify-center gap-3 bg-white/5 text-white p-5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10">
                    <Mail /> Pošalji Upit
                  </a>
                </div>
            </div>
          </div>
        </div>

        {/* BOX SA OPISOM - PROFESIONALAN I MODERNAN */}
        <div className="mb-24 bg-[#0a0a0a] rounded-[2rem] p-10 md:p-16 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-orange-600/20 p-3 rounded-xl"><Info className="text-orange-500 w-8 h-8" /></div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Detaljan Opis Nekretnine</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-300 text-lg leading-relaxed">
              <div className="space-y-6">
                <p>Ovo imanje u Grockoj predstavlja savršen spoj stambenog komfora i poslovnog potencijala. Nalazi se na mirnoj lokaciji sa brzim pristupom glavnim saobraćajnicama, što ga čini idealnim za distribuciju robe ili miran porodični život.</p>
                <p>Plac je potpuno ravan, ograđen i pod stalnim nadzorom, sa asfaltnim prilazom koji omogućava ulazak teretnih vozila direktno do hladnjače.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <p className="font-bold text-white mb-4 uppercase text-sm tracking-widest text-orange-500">Specifikacije:</p>
                <ul className="space-y-4 list-none">
                   <li className="flex justify-between border-b border-white/5 pb-2"><span>Površina placa:</span> <span className="text-white font-bold">1400m² (14 ari)</span></li>
                   <li className="flex justify-between border-b border-white/5 pb-2"><span>Stambeni prostor:</span> <span className="text-white font-bold">Standardna kuća</span></li>
                   <li className="flex justify-between border-b border-white/5 pb-2"><span>Hladnjača:</span> <span className="text-white font-bold">Instalirana i testirana</span></li>
                   <li className="flex justify-between"><span>Vlasništvo:</span> <span className="text-white font-bold">Uknjiženo 1/1</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* DONJI DEO: 3 PDF KONTEJNERA */}
        <div className="mt-24 pt-12 border-t border-white/10">
          <div className="mb-10 flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-black uppercase">Projektna Dokumentacija</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[600px] flex flex-col hover:border-orange-500/50 transition-all">
              <h3 className="text-orange-500 font-bold mb-4 text-center uppercase text-sm tracking-widest">List Nepokretnosti</h3>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/vlasnicki-list.pdf#toolbar=0&view=FitH" className="w-full h-full border-none" title="PDF 1" />
              </div>
            </div>
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[600px] flex flex-col hover:border-orange-500/50 transition-all">
              <h3 className="text-orange-500 font-bold mb-4 text-center uppercase text-sm tracking-widest">Skica Placa</h3>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/skica-placa.pdf#toolbar=0&view=FitH" className="w-full h-full border-none" title="PDF 2" />
              </div>
            </div>
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[600px] flex flex-col hover:border-orange-500/50 transition-all">
              <h3 className="text-orange-500 font-bold mb-4 text-center uppercase text-sm tracking-widest">Projekat Hladnjače</h3>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/projekat-hladnjace.pdf#toolbar=0&view=FitH" className="w-full h-full border-none" title="PDF 3" />
              </div>
            </div>
          </div>
        </div>

        {/* GOOGLE MAPS SEKCIJA SA NAVIGACIJOM */}
        <div className="mt-24 relative group">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-black uppercase tracking-tight">Lokacija i Navigacija</h2>
            </div>
            
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Vučka+Milićevića+129,+Grocka,+Serbia" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={trackConversion}
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)]"
            >
              <Map className="w-6 h-6" />
              POKRENI NAVIGACIJU
            </a>
          </div>

          <div className="rounded-[3rem] overflow-hidden h-[450px] border border-white/10 shadow-2xl relative">
            <iframe 
              src="https://maps.google.com/maps?q=Vučka+Milićevića+129,+Grocka,+Serbia&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              className="w-full h-full grayscale-[0.8] contrast-[1.2] invert-[0.9] opacity-80 group-hover:grayscale-0 group-hover:invert-0 group-hover:opacity-100 transition-all duration-700"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokacija Imanja"
            ></iframe>
            
            <div className="absolute top-6 left-6 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 text-white p-4 rounded-2xl pointer-events-none hidden md:block">
              <p className="font-black text-orange-500 uppercase tracking-widest text-xs mb-1">Tačna Adresa</p>
              <p className="font-bold">Vučka Milićevića 129</p>
              <p className="text-slate-400 text-sm">Grocka, Srbija</p>
            </div>
          </div>
        </div>

        {/* ZVANIČNI FOOTER POTPIS */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-start gap-2">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Goran Damnjanović</h4>
            <p className="text-orange-500 font-bold">+381 64 820 1496</p>
            <p className="text-slate-500 text-sm">Grocka, Vojvodina, Srbija | V8 Digital Solutions</p>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center backdrop-blur-md" onClick={() => setIsFullscreen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-orange-500 transition-colors"><X className="w-10 h-10" /></button>
          <img src={currentImages[currentIndex]} alt="Fullscreen" className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl" />
          <button onClick={prevImage} className="absolute left-6 top-1/2 bg-white/10 p-5 rounded-full hover:bg-orange-600 transition-all"><ChevronLeft className="w-8 h-8 text-white" /></button>
          <button onClick={nextImage} className="absolute right-6 top-1/2 bg-white/10 p-5 rounded-full hover:bg-orange-600 transition-all"><ChevronRight className="w-8 h-8 text-white" /></button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
// KRAJ FUNKCIJE: PlacNaProdaju

export default PlacNaProdaju;