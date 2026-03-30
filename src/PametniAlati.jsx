import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, Lock, Mail, Briefcase, ChevronRight, ChevronLeft, X, Loader2, ShieldAlert, Award } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase'; // Proveri da li ti je putanja do firebase.js tačna!

const V8PametniAlatiPage = ({ isAdmin }) => {
  const [alati, setAlati] = useState([]);
  const [aktivniAlat, setAktivniAlat] = useState(null);
  const [unos, setUnos] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(true);
  const [rezultat, setRezultat] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [proveraUplate, setProveraUplate] = useState('idle');

  const fallbackAlati = [
    {
      id: 'kopirajter',
      ikona: 'Zap',
      naziv: 'V8 KOPIRAJTER ZA MREŽE',
      opis: 'Unesite prostu ideju, a naša veštačka inteligencija generiše 3 agresivne, prodajne verzije teksta za vaše društvene mreže.',
      cena: '150 RSD',
      placeholder: 'Npr: Prodajem crne kožne jakne, danas popust 20%...',
      mockText: '🔥 VERZIJA 1 (Agresivna prodaja - Konverzija 10X):\nZaboravite apsolutno sve što ste do sada videli na tržištu! 🛑 Naša nova kolekcija menja pravila igre. Znamo da tražite premium kvalitet i zato smo doneli proizvod koji ostavlja konkurenciju u prašini. Ono što smo danas spremili nije za svakoga. Ograničena serija je upravo puštena u prodaju i garantujemo da će zalihe nestati u narednih 48 sati. Zašto? Zato što nismo pravili kompromise. Od najsitnijeg šava do glavnog materijala, sve vrišti LUKSUZ. Kliknite na link u opisu profila pre nego što zalihe nestanu brzinom svetlosti! ⚡\n\n🚀 VERZIJA 2 (Emocija, Status i Prestiž):\nNeki komadi se ne kupuju. Oni se zaslužuju. Kada obučete naš novi model, ne nosite samo materijal – nosite samopouzdanje. Osetite razliku koju pruža ručna izrada i pažljivo biran dizajn. Zamislite kako ulazite u prostoriju i svi pogledi su uprti u vas. To nije slučajnost, to je namera. Vaš novi omiljeni komad vas čeka. Naručite ga već danas i podignite svoj stil na potpuno novi nivo. 💎 Neka vaša pojava govori umesto vas.\n\n🎯 VERZIJA 3 (Kratko, Jasno, Udarno):\nNajbolji odnos cene i kvaliteta na Balkanu. Bez kompromisa. 💯 Znamo šta želite i upravo smo vam to doneli. Popust od 20% važi SAMO DANAS do ponoći. Pošaljite nam poruku u DM da rezervišete svoj primerak odmah! Vreme curi. ⏰'
    },
    {
      id: 'diplomata',
      ikona: 'Mail',
      naziv: 'V8 POSLOVNI DIPLOMATA',
      opis: 'Pretvara vaš besan, neformalan tekst u savršeno odmeren, hladan i visoko-profesionalan korporativni imejl.',
      cena: '100 RSD',
      placeholder: 'Npr: Ne pada mi na pamet da ti ovo radim besplatno...',
      mockText: 'Poštovani,\n\nNajpre želim da Vam se iskreno zahvalim na izdvojenom vremenu, poslatoj poruci i ukazanom poverenju za potencijalnu saradnju sa našom kompanijom.\n\nNakon detaljnog uvida u Vaš zahtev, kao i u našu dosadašnju korespondenciju i definisane uslove poslovanja, želim da Vas obavestim da nismo u mogućnosti da navedeni obim dodatnih usluga pružimo bez odgovarajuće finansijske kompenzacije.\n\nNaš standardni cenovnik jasno definiše ovakve zahteve, te smo prinuđeni da ostanemo dosledni našoj poslovnoj politici kako bismo održali vrhunski kvalitet usluge za sve naše klijente. Kao što znate, naša agencija se vodi principom beskompromisnog kvaliteta, a to iziskuje adekvatne resurse i vreme naših stručnjaka.\n\nUkoliko ste saglasni sa ovakvim pristupom, vrlo rado ću Vam proslediti zvaničnu i detaljnu ponudu sa specifikacijom troškova za pomenute dodatne radove u najkraćem mogućem roku.\n\nStojim Vam na punom raspolaganju za sve dodatne konsultacije ili eventualni sastanak na kojem bismo razjasnili sve tehničke i finansijske detalje.\n\nSrdačan pozdrav i svako dobro,\nVaš V8 Tim'
    },
    {
      id: 'pro-max',
      ikona: 'Zap',
      naziv: 'V8 KOPIRAJTER PRO MAX',
      opis: 'Napredni AI inženjering za prodajne tekstove. Generiše tri nivoa duboke psihološke prodaje (Strah, Logika, Status).',
      cena: '150 RSD',
      placeholder: 'Npr: Prodajem premium kožne jakne, ručni rad, popust 20%...',
      mockText: '🚀 V8 ANALIZA TRŽIŠTA ZAVRŠENA - GENERISANJE EKSTREMNOG PRODAJNOG TEKSTA...\n\n🔥 OPCIJA 1: "BRUTALNA DOMINACIJA" (Fokus na status i prestiž)\n------------------------------------------------------------\nNASLOV: NEKI KOMADI SE NE KUPUJU. ONI SE ZASLUŽUJU. 👑\n\nTEKST:\nDosta vam je jeftinih kopija koje traju jednu sezonu? Dok drugi prate trendove, vi postavljate pravila igre. Naš [NAZIV PROIZVODA] nije samo stvar koju posedujete – to je izjava ko ste zapravo. \n\n✅ RUČNA IZRADA: Svaki šav je priča za sebe.\n✅ PREMIUM MATERIJALI: Osetite razliku koju pruža beskompromisni kvalitet.\n✅ LIMITIRANA SERIJA: Samo 10 komada dostupno za ceo region.\n\nKada uđete u prostoriju, želite da se svi okrenu. Naš proizvod je tajni začin vašeg samopouzdanja. \n🛒 NARUČI ODMAH: [LINK]\n(V8 Napomena: Preostalo je samo još 3 komada u ovoj seriji!)\n\n---\n\n📈 OPCIJA 2: "MATEMATIKA USPEHA" (Fokus na ROI i uštedu)\n------------------------------------------------------\nNASLOV: INVESTICIJA KOJA SE ISPLAĆUJE SVAKOG DANA. 💎\n\nTEKST:\nPrestanite da bacate novac na rešenja koja ne rade. Naš proizvod je dizajniran da vam uštedi vreme, novac i energiju. Zašto klijenti biraju V8 standard?\n1. Trajnost: Testirano u najtežim uslovima.\n2. Efikasnost: Postignite 3x bolje rezultate za pola vremena.\n3. Podrška: Naš tim je tu za vas 24/7.\nStatistika ne laže – 98% naših korisnika je prijavilo drastično poboljšanje već u prvoj nedelji korišćenja.\n\n🎯 KLIKNI ZA SPECIJALNU PONUDU: [LINK]\n\n---\n\n⚡ OPCIJA 3: "HITNA INTERVENCIJA" (Fokus na FOMO)\n---------------------------------------------------------------------\nNASLOV: SAT OTKUCAVA. DA LI ĆETE PONOVO OKLEVATI? ⏱️\n\nTEKST:\nOvo nije još jedna reklama. Ovo je vaša poslednja šansa da dobijete vrhunski kvalitet uz 20% popusta pre nego što cene odu u nebo. Zaboravite na "uradiću to sutra". Pobednici reaguju odmah. \n🛑 STOP ODREĐENIM PROBLEMIMA: Rešite svoje probleme jednom zauvek.\n🔥 EKSKLUZIVNO: Samo za prvih 50 kupaca poklanjamo V8 Bonus paket.\nKada se link ugasi, ponuda nestaje zauvek.\n\n🚀 REZERVIŠI SVOJE MESTO: [LINK]'
    },
    {
      id: 'v8-closer',
      ikona: 'Briefcase',
      naziv: 'V8 ZATVARAČ PRODAJE',
      opis: 'Klijent kaže "Skupo je"? Naša AI matrica generiše 3 psihološka odgovora koja slamaju prigovore i zatvaraju prodaju.',
      cena: '150 RSD',
      placeholder: 'Npr: Klijent kaže: "Sve je super, ali mi je to trenutno preskupo, javiću se sledećeg meseca."',
      mockText: '/// V8 SALES MATRICA AKTIVIRANA ///\n\n🔥 ODGOVOR 1 (Fokus na ROI - Povrat investicije):\n"Razumem vas u potpunosti. I mnogi naši najuspešniji klijenti su mislili isto na samom početku. Ali hajde da pogledamo matematiku: da li je zaista skupo ako vam ovaj sistem donese 3 nova klijenta već u prvih 15 dana? Ono što je zaista skupo je propušten profit dok čekate sledeći mesec. Da li želite da prepustite tu zaradu konkurenciji ili da počnemo već danas?"\n\n🚀 ODGOVOR 2 (Smanjenje rizika - "Pacing"):\n"Potpuno vas shvatam, budžet je uvek izuzetno bitna stavka za svaki ozbiljan biznis. Da li vam je problem ukupna cifra ili trenutni "cash flow"? Ako je u pitanju trenutna likvidnost, imamo opciju podeljenog plaćanja. Cilj je da odmah počnete da zarađujete od ovoga, kako bi sistem u narednim nedeljama praktično isplatio sam sebe. Šta mislite o toj opciji?"\n\n🎯 ODGOVOR 3 (FOMO - Uskraćivanje i Ekskluzivnost):\n"Slažem se, ovo rešenje apsolutno nije za svakoga i zahteva određenu finansijsku posvećenost. Trenutno radimo samo sa klijentima koji su spremni za agresivan rast na tržištu. Ako mislite da sada nije pravi trenutak za vas, nema problema, možemo pauzirati priču. Samo imajte na umu da od sledećeg meseca cene rastu za 30% zbog prevelike potražnje i ograničenih kapaciteta našeg tima. Hoćemo li da sačuvamo staru cenu za vas?"'
    },
    {
      id: 'v8-hook',
      ikona: 'Zap',
      naziv: 'V8 VIRALNI HOOK KREATOR',
      opis: 'Prve 3 sekunde prodaju sve. Generiše 5 agresivnih "udica" (hooks) za TikTok i Reels koje garantuju preglede.',
      cena: '100 RSD',
      placeholder: 'Npr: Prodajem plan ishrane za mršavljenje i lične treninge.',
      mockText: '/// V8 ALGORITAM ZA ZADRŽAVANJE PAŽNJE ///\n\n🎣 V8 UDICA 1 (Šokantna istina - Prekida skrolovanje):\n"Svi fitnes influenseri vam lažu kada kažu da morate da gladujete da biste skinuli taj stomak. Evo 3 bizarne stvari koje radite pogrešno svakog prokletog jutra, a koje blokiraju vaš metabolizam..."\n\n🎣 V8 UDICA 2 (Agresivna bolna tačka - Pogađa emociju):\n"Ako i dalje radite trbušnjake do besvesti svako veče, a donji stomak je i dalje tu, prestanite odmah. Vi bukvalno uništavate svoj kortizol. Evo šta zapravo treba da radite..."\n\n🎣 V8 UDICA 3 (Kontroverza - Izaziva komentare i share):\n"Treneri u vašoj teretani će me apsolutno mrzeti što vam ovo otkrivam potpuno besplatno. Ali evo tačne formule kako da skinete 5 kilograma čistog sala bez ijedne sekunde na onoj dosadnoj traci za trčanje..."\n\n🎣 V8 UDICA 4 (Previše dobro da bi bilo istinito - Dokaz):\n"Svi su mi celog života govorili da je moja genetika loša i da nikada neću imati trbušnjake. A onda sam promenio samo OVU JEDNU JEDINU STVAR u svom doručku i rezultati su eksplodirali..."\n\n🎣 V8 UDICA 5 (Direktna prozivka - Profilisanje publike):\n"Ovaj video je isključivo za one koji su 100 puta počinjali dijetu u ponedeljak i odustajali u sredu, osećajući se krivim. Ako si to ti, stani i gledaj pažljivo, jer ovo menja sve..."'
    },
    {
      id: 'v8-b2b',
      ikona: 'Mail',
      naziv: 'V8 B2B SNAJPER',
      opis: 'Hladni mejlovi koji se otvaraju. Hirurški precizna poruka koja direktno gađa bolne tačke direktora i zakazuje sastanak.',
      cena: '200 RSD',
      placeholder: 'Npr: Prodajem izradu web sajta vlasnicima privatnih stomatoloških ordinacija.',
      mockText: '/// V8 KORPORATIVNI SNAJPER - STATUS: SPREMAN ///\n\nNaslov mejla: Pitanje u vezi neiskorišćenih kapaciteta Vaše ordinacije u [Grad/Deo grada]\n\nPoštovani [Ime],\n\nKao neko ko se bavi analizom digitalnog tržišta, pratim rad Vaše ordinacije već neko vreme i primećujem da imate zaista izvanredne ocene i preporuke pacijenata na Google-u. \n\nMeđutim, gledajući Vaš trenutni web sajt i online prisustvo, primetio sam jedan ozbiljan propust: nemate integrisan sistem za instant zakazivanje i IPS naplatu. Iz našeg iskustva sa drugim premium ordinacijama u regionu, ovaj nedostatak direktno dovodi do gubitka od oko 20-30% potencijalnih pacijenata koji traže usluge kasno uveče, van Vašeg radnog vremena.\n\nMi u V8 Digital Agency smo napravili specifičan zatvoreni sistem za stomatologe koji potpuno eliminiše "prazne termine", filtrira neozbiljne upite i potpuno automatizuje prijem novih, premium pacijenata, dok vi spavate.\n\nNe želim da Vam oduzimam vreme dugačkim mejlovima. Da li ste otvoreni za jedan brz, konkretan poziv od tačno 7 minuta, u utorak ili sredu prepodne, da Vam na delu pokažem kako to izgleda u praksi i kakve rezultate donosi?\n\nSrdačan pozdrav,\n\n[Vaše Ime]\nV8 Digital Agency\nPremium Solutions for Premium Clients'
    }
  ];

  useEffect(() => {
    const fetchAlati = async () => {
      const snap = await getDocs(collection(db, "v8_mikro_alati"));
      if (!snap.empty) {
        setAlati(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setAlati(fallbackAlati); 
      }
    };
    fetchAlati();
  }, []);

  const renderIkona = (ikonaStr, isSmall = false) => {
    const classes = isSmall ? "w-5 h-5" : "w-8 h-8 mb-4";
    if(ikonaStr === 'Mail') return <Mail className={`${classes} text-blue-500`} />;
    if(ikonaStr === 'Briefcase') return <Briefcase className={`${classes} text-green-500`} />;
    return <Zap className={`${classes} text-orange-500`} />;
  };

  const handleOtvoriAlat = (alat) => {
    setAktivniAlat(alat);
    setUnos('');
    setIsGenerating(false);
    setRezultat(null);
    setIsPaid(false);
    setProveraUplate('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerisiRezultat = (adminBypass = false) => {
    setIsGenerating(true);
    if (adminBypass) setIsPaid(true); 
    
    setTimeout(() => {
      setRezultat(aktivniAlat.mockText || "V8 Sistem je uspešno generisao tekst...");
      setIsGenerating(false);
    }, 2500);
  };

  const handleProveraUplate = () => {
    setProveraUplate('loading');
    setTimeout(() => {
      setProveraUplate('failed');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-24 px-6 relative flex flex-col items-center">
      
      <AnimatePresence>
        {showUnderConstruction && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-xl"
          >
            <div className="relative max-w-2xl w-full bg-blue-950/40 border border-blue-500/30 rounded-[2.5rem] p-10 md:p-14 text-center shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-blue-600/20 blur-[70px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <Settings className="w-12 h-12 text-blue-400 mb-6 animate-spin-slow" style={{ animationDuration: '4s' }} />
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-6">
                  Stranica u <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Doradi</span>
                </h2>
                <p className="text-blue-100/90 text-[14px] md:text-[16px] leading-relaxed mb-8 font-medium max-w-lg mx-auto">
                  Poštovani posetioci, stranica je u doradi. Kao što vidite, imamo mnogo usluga koje trenutno usavršavamo. 
                  Stranica kreće sa punim kapacitetom veoma uskoro.
                </p>
                <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[11px] mb-8">
                  Hvala Vam na strpljenju, Vaš AI-ALATI tim.
                </p>

                {isAdmin && (
                  <button 
                    onClick={() => setShowUnderConstruction(false)}
                    className="mt-4 bg-gradient-to-r from-red-700 to-red-600 border border-red-500 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer group"
                  >
                    <Zap className="w-4 h-4" /> Admin Bypass
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl w-full mx-auto font-sans text-left text-white relative z-10 flex flex-col items-center">
        
        <div className="mb-12 text-center w-full relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 text-gradient-animate drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            V8 PAMETNI ALATI
          </h1>
          <div className="text-[12px] md:text-[14px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center flex-wrap gap-3 justify-center text-center">
            <span className="relative flex h-3 w-3 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            MIKRO-ALATI ZA MAKSIMALAN PROFIT. DIREKTNA IPS NAPLATA.
          </div>
          <p className="text-white text-[12px] md:text-[14px] max-w-2xl font-bold uppercase tracking-[0.2em] leading-relaxed mt-6 mb-8">
            AUTOMATIZUJTE SVOJ BIZNIS UZ POMOĆ VEŠTAČKE INTELIGENCIJE. IZABERITE ALAT, UNESITE IDEJU I TESTIRAJTE MOĆ V8 SISTEMA.
          </p>
        </div>

        {aktivniAlat && (
          <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] mb-16 w-full max-w-4xl relative">
            <button onClick={() => setAktivniAlat(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
            <div className="flex items-center gap-4 mb-8">
              {renderIkona(aktivniAlat.ikona)}
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">{aktivniAlat.naziv}</h2>
                <p className="text-orange-500 font-bold text-sm">Cena otključavanja: {aktivniAlat.cena}</p>
              </div>
            </div>
            
            {!rezultat && !isGenerating && (
                <div className="space-y-6 animate-in fade-in">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500">Unesite vaš polazni tekst:</label>
                  <textarea 
                    value={unos} 
                    onChange={(e) => setUnos(e.target.value)} 
                    placeholder={aktivniAlat.placeholder}
                    className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-orange-500 transition-all min-h-[150px] resize-none"
                  ></textarea>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button 
                      onClick={() => handleGenerisiRezultat(false)}
                      disabled={unos.length < 5}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all ${unos.length < 5 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-xl hover:scale-[1.02]'}`}
                    >
                      <Zap className="w-5 h-5" /> Generiši V8 Koncept
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => handleGenerisiRezultat(true)}
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
                <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
                    <Zap className="w-16 h-16 text-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(234,88,12,0.8)]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-widest text-center">V8 NEURONSKA MREŽA OBRAĐUJE PODATKE...</h3>
                    <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest animate-pulse">Generisanje premium rezultata u toku</p>
                </div>
            )}

            {rezultat && !isGenerating && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                        <span className="text-green-400 font-black uppercase tracking-widest text-[11px]">Sistem uspešno izvršio zadatak</span>
                    </div>

                    <div className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden shadow-inner min-h-[450px] flex flex-col">
                        
                        <div className={`text-zinc-300 text-[13px] md:text-[14px] whitespace-pre-wrap leading-relaxed font-mono transition-all duration-700 relative z-0 flex-1 ${(!isPaid && !isAdmin) ? 'select-none' : ''}`}>
                            {(!isPaid && !isAdmin) ? (
                                <>
                                  <span className="text-white font-bold drop-shadow-md">{rezultat.substring(0, 150)}</span>
                                  <span className="blur-[4px] opacity-40">{rezultat.substring(150, 1000)}...</span>
                                </>
                            ) : (
                                rezultat
                            )}
                        </div>

                        {(!isPaid && !isAdmin) && (
                           <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10">
                              <div className="bg-[#050505] border border-orange-500/50 p-6 rounded-3xl text-center flex flex-col items-center shadow-[0_0_50px_rgba(234,88,12,0.4)] w-full max-w-[360px] animate-in zoom-in duration-500">
                                <Lock className="w-8 h-8 text-orange-500 mb-2 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
                                <h3 className="text-[14px] font-black text-white uppercase tracking-widest mb-1">OTKLJUČAJ PUN REZULTAT</h3>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-4">Skeniraj IPS kod ({aktivniAlat.cena})</p>
                                
                                <div className="bg-white p-2 rounded-2xl inline-block mb-3 shadow-inner border border-zinc-200">
                                  <QRCodeCanvas 
                                    value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${aktivniAlat.cena.replace(/\D/g, '')},00|SF:289|S:${aktivniAlat.naziv.substring(0,20)}`}
                                    size={120} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} includeMargin={false}
                                  />
                                </div>

                                <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 mb-4 text-left space-y-1.5 font-mono shadow-inner">
                                   <div className="flex justify-between border-b border-white/5 pb-1.5">
                                      <span className="text-[9px] text-zinc-500 uppercase">Primalac:</span>
                                      <span className="text-[9px] font-bold text-white">Goran Damnjanović</span>
                                   </div>
                                   <div className="flex justify-between border-b border-white/5 pb-1.5">
                                      <span className="text-[9px] text-zinc-500 uppercase">Račun:</span>
                                      <span className="text-[9px] font-bold text-white">265-0000006535770-83</span>
                                   </div>
                                   <div className="flex justify-between border-b border-white/5 pb-1.5">
                                      <span className="text-[9px] text-zinc-500 uppercase">Svrha:</span>
                                      <span className="text-[9px] font-bold text-white truncate max-w-[120px]">{aktivniAlat.naziv}</span>
                                   </div>
                                   <div className="flex justify-between pt-0.5">
                                      <span className="text-[9px] text-zinc-500 uppercase">Iznos:</span>
                                      <span className="text-[11px] font-black text-orange-500">{aktivniAlat.cena}</span>
                                   </div>
                                </div>
                                
                                {proveraUplate === 'idle' && (
                                  <button onClick={handleProveraUplate} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:scale-105 rounded-xl font-black uppercase tracking-widest text-[11px] text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                    <Zap className="w-4 h-4" /> POTVRDIO SAM UPLATU
                                  </button>
                                )}

                                {proveraUplate === 'loading' && (
                                  <button disabled className="w-full py-4 bg-zinc-800 border border-zinc-600 rounded-xl font-black uppercase tracking-widest text-[10px] text-zinc-400 flex items-center justify-center gap-2 cursor-wait">
                                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> PROVERA BANKE U TOKU...
                                  </button>
                                )}

                                {proveraUplate === 'failed' && (
                                  <div className="w-full bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center animate-in zoom-in">
                                    <p className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2 flex justify-center items-center gap-1"><ShieldAlert className="w-3 h-3" /> UPLATA NIJE EVIDENTIRANA</p>
                                    <p className="text-zinc-300 text-[9px] uppercase font-bold leading-relaxed mb-3">Sistem ne vidi uplatu. Pošaljite nam sliku uplatnice da bismo Vam odmah otključali pristup.</p>
                                    <div className="flex flex-col gap-2 w-full">
                                        <a href="https://wa.me/381648201496?text=Pozdrav,%20šaljem%20dokaz%20o%20uplati%20za%20V8%20Alat" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex justify-center items-center shadow-lg gap-2">
                                            Pošalji na WhatsApp
                                        </a>
                                        <a href="mailto:aitoolsprosmart@gmail.com?subject=Dokaz o uplati - V8 Pametni Alati" className="bg-red-600/30 border border-red-500/50 hover:bg-red-600 text-white px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2">
                                            <Mail className="w-3 h-3" /> Pošalji na Email
                                        </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                           </div>
                        )}
                    </div>

                    {(isPaid || isAdmin) && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(rezultat); alert("V8 Rezultat je uspešno kopiran u memoriju!"); }}
                        className="w-full py-5 mt-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-black uppercase tracking-widest text-[13px] text-white transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                      >
                        <Award className="w-5 h-5" /> KOPIRAJ CEO TEKST
                      </button>
                    )}
                </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {alati.map((alat) => (
            <div key={alat.id} className="bg-black border border-white/5 p-8 rounded-[2rem] hover:border-orange-500/50 transition-all group cursor-pointer flex flex-col h-full shadow-lg" onClick={() => handleOtvoriAlat(alat)}>
              {renderIkona(alat.ikona)}
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-3 group-hover:text-orange-500 transition-colors">{alat.naziv}</h3>
              <p className="text-zinc-500 text-sm mb-6 flex-1">{alat.opis}</p>
              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                <span className="text-white font-black">{alat.cena}</span>
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-1 group-hover:translate-x-2 transition-transform">Pokreni <ChevronRight className="w-3 h-3" /></span>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default V8PametniAlatiPage;