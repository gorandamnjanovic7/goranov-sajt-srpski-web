import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Maximize2, X, MapPin, Phone, Mail, 
  Tag, Layers, Map, Home, Snowflake, FileText, Info, Zap, 
  ShieldCheck, Truck 
} from 'lucide-react';

// POČETAK FUNKCIJE: PlacNaProdaju
const PlacNaProdaju = () => {
  const [activeGallery, setActiveGallery] = useState('plac');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State za PDF preko celog ekrana
  const [fullscreenPdf, setFullscreenPdf] = useState(null);

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
    "sl-1.png", "sl-2.jpg", "sl-3.png", "sl-4.jpg", "sl-5.jpg", "sl-6.jpg",
    "sl-7.jpg", "sl-8.jpg", "sl-9.jpg", "sl-10.jpg", "sl-11.jpg", "sl-12.jpg",
  ];

  const imagesOkolina = [
    "okolina-1.jpg", "okolina-2.jpg", "okolina-3.jpg",
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
    <div className="min-h-screen bg-[#050505] py-12 px-4 sm:px-6 lg:px-8 font-sans text-white selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* NASLOV */}
        <div className="mb-16 flex justify-center w-full mt-4">
          <div className="border-l-4 border-orange-600 pl-6 text-left max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight uppercase drop-shadow-lg">
              Kompletno Imanje: <span className="text-orange-500 font-black">Kuća, Plac i Hladnjača</span>
            </h1>
            <p className="text-xl text-slate-400 flex items-center gap-2 font-bold">
              <MapPin className="w-6 h-6 text-orange-500" />
              Beograd, Grocka (Strateška lokacija za biznis)
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
                  <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-orange-600 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-orange-600 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"><ChevronRight className="w-6 h-6" /></button>
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
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Snowflake className="text-cyan-500" /> <span className="font-bold">Hladnjača 25t Kapacitet</span></div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Home className="text-orange-500" /> <span className="font-bold">Uknjiženo 1/1</span></div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl"><Map className="text-green-500" /> <span className="font-bold">14 ari ograđeno</span></div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-black rounded-3xl p-8 border border-orange-600/30 shadow-[0_20px_50px_rgba(234,88,12,0.15)] text-center">
                <p className="text-orange-500 text-sm font-black uppercase mb-1">Cena za ceo paket</p>
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

        {/* BOX SA OPISOM - NIJE RASTEGNUT */}
        <div className="mb-24 bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-orange-600/20 p-4 rounded-2xl"><Info className="text-orange-500 w-8 h-8" /></div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Detaljan Opis Nekretnine</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
              
              {/* LEVA KOLONA (3/5 širine) - TEKST KOJI DIŠE */}
              <div className="lg:col-span-3 space-y-8 text-slate-300 text-lg leading-relaxed max-w-2xl">
                <p>
                  Ovo imanje u Grockoj predstavlja <strong className="text-white">savršen spoj stambenog komfora i poslovnog potencijala</strong>. Nalazi se na mirnoj lokaciji sa brzim pristupom glavnim saobraćajnicama, što ga čini idealnim za distribuciju robe ili miran porodični život.
                </p>
                <p>
                  Nekretnina obuhvata površinu od <strong className="text-orange-500 font-black">14 Ari</strong> sa priključkom na vodovod, kanalizaciju i elektro mrežu. Strateški je locirana između <strong className="text-white text-xl">Beograda (22km)</strong> i <strong className="text-white text-xl">Smedereva (11km)</strong>, uz brz pristup autoputu. Uknjižena je kao gradsko stambeno zemljište na ime vlasnika <strong className="text-green-500">1/1</strong>.
                </p>
                <p>
                  Plac je podeljen u dve celine: <strong className="text-white">4 Ara</strong> su pod voćnjakom, dok preostalih <strong className="text-white">10 Ari</strong> čini centralni poslovno-stambeni deo sa objektima. Stambeni deo je površine <strong className="text-white font-bold text-xl uppercase">50m²</strong> uz pripadajuće pomoćne prostorije.
                </p>
                
                {/* HLADNJAČA HIGHLIGHT */}
                <div className="bg-gradient-to-r from-orange-600/10 to-transparent p-8 rounded-[2rem] border-l-4 border-orange-500 mt-10 shadow-2xl">
                  <h4 className="text-orange-500 font-black uppercase mb-4 text-sm tracking-widest flex items-center gap-2">
                    <Snowflake className="w-5 h-5" /> Tehnologija Hladnjače
                  </h4>
                  <p className="mb-4 text-white font-medium">
                    Poslovni objekat je <strong className="text-orange-500 uppercase text-xl">Hladnjača (100m²)</strong>, sa rashladnim delom od 70m² i manipulativnim od 34m². 
                  </p>
                  <p className="text-sm border-t border-white/10 pt-4">
                    Dimenzije rashladnog dela su 9.6m x 4.6m x 2.8m, sa ukupnom zapreminom od <strong className="text-white">25 tona robe</strong>. Hladnjača je <strong className="text-cyan-400 uppercase">plusna</strong>, opremljena motorom jačine <strong className="text-white">4kW</strong> i dva ventilatora snage 130W.
                  </p>
                </div>
              </div>

              {/* DESNA KOLONA (2/5 širine) - SPECIFIKACIJE */}
              <div className="lg:col-span-2 bg-[#111] p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl sticky top-8">
                <p className="font-black text-white mb-8 uppercase text-sm tracking-widest text-orange-500 flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Tehnički Podaci:
                </p>
                <ul className="space-y-6 list-none font-bold">
                   <li className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><Map className="w-4 h-4 text-orange-500"/> Plac</span> 
                     <span className="text-white">1400m² (14 Ari)</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><Home className="w-4 h-4 text-orange-500"/> Kuća</span> 
                     <span className="text-white">50m² + Pomoćno</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><Snowflake className="w-4 h-4 text-orange-500"/> Kapacitet</span> 
                     <span className="text-cyan-400 font-black">25 Tona</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><Zap className="w-4 h-4 text-orange-500"/> Struja</span> 
                     <span className="text-white uppercase">Trofazna</span>
                   </li>
                   <li className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><Truck className="w-4 h-4 text-orange-500"/> Prilaz</span> 
                     <span className="text-orange-500 uppercase">Za Šlepere</span>
                   </li>
                   <li className="flex items-center justify-between">
                     <span className="flex items-center gap-3 text-slate-400 font-medium text-sm italic uppercase tracking-tighter"><ShieldCheck className="w-4 h-4 text-orange-500"/> Status</span> 
                     <span className="text-green-500 uppercase font-black">Uknjiženo 1/1</span>
                   </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* PROJEKTNA DOKUMENTACIJA */}
        <div className="mt-24 pt-12 border-t border-white/10">
          <div className="mb-10 flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-black uppercase tracking-tight">Projektna Dokumentacija</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PDF 1 */}
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[800px] flex flex-col hover:border-orange-500/50 transition-all select-none" onContextMenu={(e) => e.preventDefault()}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest">List Nepokretnosti</h3>
                <button onClick={() => setFullscreenPdf('/pdf-1.pdf')} className="bg-white/10 hover:bg-orange-600 text-white p-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                  <Maximize2 className="w-4 h-4" /> Uveličaj
                </button>
              </div>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/pdf-1.pdf#toolbar=0&navpanes=0&view=FitH" className="w-full h-full border-none" title="PDF 1" />
              </div>
            </div>

            {/* PDF 2 */}
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[800px] flex flex-col hover:border-orange-500/50 transition-all select-none" onContextMenu={(e) => e.preventDefault()}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest">Skica Placa</h3>
                <button onClick={() => setFullscreenPdf('/pdf-2.pdf')} className="bg-white/10 hover:bg-orange-600 text-white p-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                  <Maximize2 className="w-4 h-4" /> Uveličaj
                </button>
              </div>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/pdf-2.pdf#toolbar=0&navpanes=0&view=FitH" className="w-full h-full border-none" title="PDF 2" />
              </div>
            </div>

            {/* PDF 3 */}
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[800px] flex flex-col hover:border-orange-500/50 transition-all select-none" onContextMenu={(e) => e.preventDefault()}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest leading-tight">Prijava za Upis (Poseban Zakon)</h3>
                <button onClick={() => setFullscreenPdf('/pdf-3.pdf')} className="bg-white/10 hover:bg-orange-600 text-white p-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                  <Maximize2 className="w-4 h-4" /> Uveličaj
                </button>
              </div>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/pdf-3.pdf#toolbar=0&navpanes=0&view=FitH" className="w-full h-full border-none" title="PDF 3" />
              </div>
            </div>

            {/* PDF 4 */}
            <div className="bg-[#111] rounded-3xl p-4 border border-white/5 shadow-2xl h-[800px] flex flex-col hover:border-orange-500/50 transition-all select-none" onContextMenu={(e) => e.preventDefault()}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest leading-tight">Prijava za Upis (Poseban Zakon)</h3>
                <button onClick={() => setFullscreenPdf('/pdf-4.pdf')} className="bg-white/10 hover:bg-orange-600 text-white p-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                  <Maximize2 className="w-4 h-4" /> Uveličaj
                </button>
              </div>
              <div className="flex-grow rounded-2xl overflow-hidden bg-[#222]">
                <iframe src="/pdf-4.pdf#toolbar=0&navpanes=0&view=FitH" className="w-full h-full border-none" title="PDF 4" />
              </div>
            </div>
          </div>
        </div>

        {/* MAPA */}
        <div className="mt-24 relative group mb-20">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-black uppercase tracking-tight">Lokacija i Navigacija</h2>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Vučka+Milićevića+129,+Grocka,+Serbia" target="_blank" rel="noopener noreferrer" onClick={trackConversion} className="flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-lg uppercase tracking-wider text-sm">
              <Map className="w-6 h-6" /> POKRENI NAVIGACIJU
            </a>
          </div>
          <div className="rounded-[3rem] overflow-hidden h-[450px] border border-white/10 shadow-2xl relative">
            <iframe src="https://maps.google.com/maps?q=Vučka+Milićevića+129,+Grocka,+Serbia&t=&z=15&ie=UTF8&iwloc=&output=embed" className="w-full h-full grayscale-[0.8] contrast-[1.2] invert-[0.9] opacity-80 group-hover:grayscale-0 group-hover:invert-0 group-hover:opacity-100 transition-all duration-700" allowFullScreen="" loading="lazy" title="Lokacija" />
            <div className="absolute top-6 left-6 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 text-white p-4 rounded-2xl pointer-events-none hidden md:block">
              <p className="font-black text-orange-500 uppercase tracking-widest text-xs mb-1">Tačna Adresa</p>
              <p className="font-bold">Vučka Milićevića 129, Grocka</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-start gap-2">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Goran Damnjanović</h4>
            <p className="text-orange-500 font-bold">+381 64 820 1496</p>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Beograd, Grocka | V8 Digital Solutions</p>
        </div>
      </div>

      {/* FULLSCREEN GALERIJA */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center backdrop-blur-md" onClick={() => setIsFullscreen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-orange-500 transition-colors z-30"><X className="w-10 h-10" /></button>
          <img src={currentImages[currentIndex]} alt="Fullscreen" className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl relative z-20" />
          <button onClick={prevImage} className="absolute left-6 top-1/2 bg-white/10 p-5 rounded-full hover:bg-orange-600 transition-all z-30"><ChevronLeft className="w-8 h-8 text-white" /></button>
          <button onClick={nextImage} className="absolute right-6 top-1/2 bg-white/10 p-5 rounded-full hover:bg-orange-600 transition-all z-30"><ChevronRight className="w-8 h-8 text-white" /></button>
        </div>
      )}

      {/* FULLSCREEN PDF */}
      {fullscreenPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/98 flex flex-col items-center justify-center backdrop-blur-md p-4 sm:p-8" onClick={() => setFullscreenPdf(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-orange-500 transition-colors z-20" onClick={() => setFullscreenPdf(null)}>
            <X className="w-10 h-10" />
          </button>
          <div className="w-full h-full max-w-6xl bg-[#222] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.2)] mt-8" onClick={(e) => e.stopPropagation()}>
            <iframe src={`${fullscreenPdf}#toolbar=0&navpanes=0&view=FitH`} className="w-full h-full border-none" title="Fullscreen PDF" />
          </div>
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

export default PlacNaProdaju;