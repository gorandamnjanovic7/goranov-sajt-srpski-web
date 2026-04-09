import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { db } from './firebase'; 
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';

// POČETAK FUNKCIJE: VisitorCounter
export const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // 1. V8 Skener: Uzimamo IP adresu posetioca
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIP = ipData.ip;
        
        // Lokacija u tvojoj Firebase bazi gde čuvamo brojku
        const docRef = doc(db, 'v8_stats', 'visitors');
        
        // 2. Čitamo trenutno stanje
        const docSnap = await getDoc(docRef);
        let currentCount = 0;
        
        if (docSnap.exists()) {
          currentCount = docSnap.data().count;
        } else {
          // Ako dokument ne postoji, kreiramo ga od nule
          await setDoc(docRef, { count: 0 });
        }

        // 3. Proveravamo da li je već upisan u ovoj sesiji (da refresh ne nabija preglede)
        const hasCounted = sessionStorage.getItem('v8_counted');
        
        // 4. V8 Filter: Ignorišemo tvoju IP adresu (213.196.99.10)
        if (userIP !== '213.196.99.10' && !hasCounted) {
          // Ako nije tvoj IP i nije već uračunat, dodajemo +1 u bazu
          await updateDoc(docRef, { count: increment(1) });
          setVisitorCount(currentCount + 1);
          sessionStorage.setItem('v8_counted', 'true');
        } else {
          // Ako si to ti ili je klijent samo osvežio stranicu, prikazujemo trenutnu brojku bez dodavanja
          setVisitorCount(currentCount);
        }
      } catch (error) {
        console.error("V8 Skener Greška:", error);
      }
    };

    trackVisitor();
  }, []);

  // Ne prikazujemo ništa dok sistem ne izvuče podatak iz baze
  if (visitorCount === 0) return null; 

  return (
    // Odmaknuto od ivice sa right-32 da ne smeta satu i smart skrolu
    <div className="fixed bottom-6 right-32 z-[9900] bg-[#0a0a0a]/90 backdrop-blur-md border border-orange-500/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.2)] flex items-center gap-2 font-sans transition-all hover:border-orange-500">
      <Users className="w-4 h-4 text-orange-500" />
      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        Poseta: <span className="text-white text-[11px]">{visitorCount.toLocaleString('sr-RS')}</span>
      </span>
    </div>
  );
};
// KRAJ FUNKCIJE: VisitorCounter