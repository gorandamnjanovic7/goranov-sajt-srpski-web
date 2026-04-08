import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronLeft, Zap, Gem, ArrowRight, CheckCircle } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';

const V8Katalog = () => {
  const bookRef = useRef(null);

  // Tvoje slike iz eksportovanih PDF-ova (ubaci ih u public/katalog/ folder)
 // 🔥 V8 AUTOMATIKA: Sistem sam pravi niz od 39 slika 🔥
  const brojStrana = 45;
  const stranice = Array.from({ length: brojStrana }, (_, i) => `/katalog/strana${i + 1}.jpg`);
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6 font-sans relative overflow-hidden flex flex-col items-center">
      <Helmet><title>V8 PORTFOLIO KLIJENTSKI MATERIJAL | AI TOOLS PRO</title></Helmet>
      
      {/* V8 AURA POZADINA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1400px] w-full relative z-10 flex flex-col items-center">
        
        {/* NAVIGACIJA NAZAD */}
        <div className="w-full flex justify-start mb-8">
          <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 uppercase text-[10px] font-black tracking-widest transition-all w-fit bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-blue-500/50">
            <ChevronLeft className="w-4 h-4" /> Nazad
          </Link>
        </div>

        {/* B2B PRODAJNI NASLOV (Ovo prodaje tvoju uslugu!) */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 px-5 py-2.5 rounded-full text-blue-500 text-[11px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
             <Gem className="w-4 h-4" /> V8 Agencijski Standard
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-wide text-zinc-100 mb-6">
            Ovakav Promotivni Materijal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500 font-black not-italic drop-shadow-md tracking-tighter uppercase text-5xl md:text-6xl mt-2 block">
              Pravimo Za Vaš Brend.
            </span>
          </h1>
          <p className="text-zinc-400 text-[13px] md:text-[15px] uppercase tracking-widest font-bold max-w-2xl mx-auto leading-relaxed">
            Prelistajte primjer ispod. Naš V8 AI inženjering pretvara vašu ponudu u <span className="text-white">čisti luksuz</span>. Bilo da prodajete nekretnine, nakit, automobile ili softver – mi kreiramo vizuelni identitet koji dominira.
          </p>
          
          <div className="flex justify-center gap-6 mt-8 text-[11px] font-black uppercase text-zinc-500 tracking-widest">
             <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vrhunska 4K Rezolucija</span>
             <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Potpuno Unikatan Dizajn</span>
          </div>
        </div>

        {/* FLIPBOOK MOTOR */}
        <div className="relative w-full flex justify-center perspective-[2000px] mt-4 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          <div className="hidden md:block">
             <HTMLFlipBook 
                width={500} 
                height={700} 
                size="fixed"
                minWidth={315}
                maxWidth={500}
                minHeight={400}
                maxHeight={700}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                className="v8-flipbook drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-y border-r border-white/10 rounded-r-xl"
                ref={bookRef}
              >
                {stranice.map((slika, index) => (
                  <div key={index} className="bg-[#050505] overflow-hidden flex items-center justify-center">
                    <img 
                       src={slika} 
                       alt={`Primer Strana ${index + 1}`} 
                       className="w-full h-full object-contain" 
                       loading="lazy"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
          </div>
          
          {/* UPOZORENJE ZA MOBILNE */}
          <div className="md:hidden flex flex-col items-center bg-zinc-900/50 border border-blue-500/30 p-8 rounded-3xl text-center">
             <Zap className="w-10 h-10 text-blue-500 mb-4 animate-pulse" />
             <h3 className="text-white font-black uppercase text-[14px] mb-2 tracking-widest">Zahteva Veći Ekran</h3>
             <p className="text-zinc-400 text-[12px] leading-relaxed">
               Zbog naprednog 3D efekta i detalja kataloga, prelistavanje portfolija je optimizirano isključivo za desktop računare.
             </p>
          </div>
        </div>
        
        <div className="mt-10 flex gap-4 hidden md:flex items-center">
             <button onClick={() => bookRef.current.pageFlip().flipPrev()} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Prethodna Strana</button>
             <span className="text-zinc-600 font-mono text-[10px]">Prelistaj Magazin</span>
             <button onClick={() => bookRef.current.pageFlip().flipNext()} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Sledeća Strana</button>
        </div>

        {/* B2B POZIV NA AKCIJU (CALL TO ACTION) */}
        <div className="mt-20 w-full max-w-4xl bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-500/30 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl">
           <div>
              <h2 className="text-2xl font-black uppercase text-white tracking-widest mb-2">Želite ovakav katalog za vaš biznis?</h2>
              <p className="text-zinc-400 text-[13px] font-medium leading-relaxed max-w-lg">
                Nemojte prodavati sa generičnim PDF fajlovima. Dopustite da naš V8 tim kreira vizuelno iskustvo koje opravdava vašu cijenu i ostavlja klijente bez daha.
              </p>
           </div>
           
           {/* Dugme koje vodi na tvoj kontakt ili nudi uslugu izrade */}
           <a href="mailto:aitoolsprosmart@gmail.com?subject=Upit za izradu V8 Kataloga" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all flex items-center gap-3 shrink-0">
              Naručite Izradu <ArrowRight className="w-5 h-5" />
           </a>
        </div>

      </div>
    </div>
  );
};

export default V8Katalog;