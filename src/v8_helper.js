// fajl: src/v8_helper.js
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useV8Pristup = (alatId) => {
  const [imaPristup, setImaPristup] = useState(false);
  const [proveravam, setProveravam] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Admini uvek imaju FULL pristup
        if (user.email === "damnjanovicgoran7@gmail.com" || user.email === "aitoolsprosmart@gmail.com") {
          setImaPristup(true);
        } else {
          try {
            // Provera VIP baze za klijenta
            const docRef = doc(db, "vip_users", user.email.toLowerCase());
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().unlockedApps) {
              const unlocked = docSnap.data().unlockedApps;
              // Ako klijent ima specifičan alat ILI Master ključ (FULL_ACCESS)
              if (unlocked.includes(alatId) || unlocked.includes('FULL_ACCESS')) {
                setImaPristup(true);
              } else {
                setImaPristup(false);
              }
            } else {
              setImaPristup(false);
            }
          } catch (err) {
            setImaPristup(false);
          }
        }
      } else {
        setImaPristup(false);
      }
      setProveravam(false);
    });

    return () => unsubscribe();
  }, [alatId]);

  return { imaPristup, proveravam };
};