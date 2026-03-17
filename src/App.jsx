import React, { useState, useRef } from 'react';

const App = () => {
  // --- 1. SVA STANJA (STATE) ---
  const [customerPrompt, setCustomerPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAR, setSelectedAR] = useState("16:9");
  
  // Statusi učitavanja
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Rezultati sa servera
  const [generatedPrompts, setGeneratedPrompts] = useState({
    single: '', 
    abstract: '', 
    cinematic: '', 
    photoreal: '', 
    uniquePhoto: ''
  });

  const fileInputRef = useRef(null);

  // --- 2. PODEŠAVANJE ADRESE SERVERA ---
  // Dok testiraš lokalno ostavi localhost. Kad šalješ uživo, ubaci svoj Railway link!
  const BASE_BACKEND_URL = "http://localhost:8000"; 
  // Primer: const BASE_BACKEND_URL = "https://goranov-backend-python-production.up.railway.app";

  // Dummy funkcija za analitiku (da kod ne bi pukao ako je nemaš)
  const logAnalyticsEvent = (eventName, data) => {
    console.log(`[Analytics] ${eventName}:`, data);
  };

  // --- 3. RUKOVANJE SLIKAMA ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
      // Očisti tekst ako korisnik ubaci sliku
      setCustomerPrompt(""); 
    }
  };

  const clearInput = () => {
    setCustomerPrompt("");
    setUploadedImage(null);
    setSelectedFile(null);
    setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' });
  };

  // --- 4. GLAVNA LOGIKA (MOZAK SISTEMA) ---
  const handleEnhance = async (e, boxType = 'prompt') => {
    if (e) e.preventDefault();
    const rawInput = customerPrompt.trim(); 
    
    // Ako nema ni teksta ni slike, ne radi ništa
    if(!rawInput && !uploadedImage) return; 
    
    setIsEnhancing(true); 
    if (rawInput !== "" && boxType === 'prompt') setIsScanning(true);
    
    setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' });
    logAnalyticsEvent('enhancer_action', { input: rawInput || "Slika (GPT-4o-mini)", actionType: boxType, aspectRatio: selectedAR });
    
    try {
        // --- LOGIKA ZA BOKS 2 (ROASTOVANJE TEKSTUALNOG PROMPTA) ---
        if (rawInput !== "" && !uploadedImage) {
            const res = await fetch(`${BASE_BACKEND_URL}/api/roast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: rawInput })
            });

            if (!res.ok) throw new Error("Server error");
            const dataResponse = await res.json();
            
            setGeneratedPrompts(prev => ({
                ...prev,
                single: `/// HASSELBLAD AI EKSPERTSKA ANALIZA ///\n\n${dataResponse.roast}\n\n🚀 V8 10X FINALNI PROMPT:\n\n${dataResponse.enhanced_prompt} [Aspect Ratio: ${selectedAR}]`
            }));
            
            setIsEnhancing(false);
            setIsScanning(false);
            return;
        }

        // --- LOGIKA ZA BOKS 1 (ANALIZA SLIKE -> 4 STILA) ---
        if (uploadedImage || selectedFile) {
            let fileToSend = selectedFile;
            
            // Konverzija ako je slika prosleđena kao običan link
            if (!fileToSend && uploadedImage && uploadedImage.startsWith('http')) {
                const response = await fetch(uploadedImage);
                const blob = await response.blob();
                fileToSend = new File([blob], "image.jpg", { type: "image/jpeg" });
            }

            if (fileToSend) {
                const fd = new FormData();
                fd.append('image', fileToSend);

                const res = await fetch(`${BASE_BACKEND_URL}/api/analyze`, {
                    method: 'POST',
                    body: fd
                });

                if (!res.ok) throw new Error("Server nije odgovorio.");
                const dataResponse = await res.json(); 

                setGeneratedPrompts({
                    single: `/// V8 AI GPT-4o-mini EKSPERTSKA ANALIZA ///\n\n🟢 OPIS SLIKE:\n${dataResponse.description}\n\n🚀 V8 10X PROMPTOVI SU GENERISANI!`,
                    abstract: `${uploadedImage ? `${uploadedImage} ` : ""}${dataResponse.prompts[0]} [Aspect Ratio: ${selectedAR}]`,
                    cinematic: `${uploadedImage ? `${uploadedImage} ` : ""}${dataResponse.prompts[1]} [Aspect Ratio: ${selectedAR}]`,
                    photoreal: `${uploadedImage ? `${uploadedImage} ` : ""}${dataResponse.prompts[2]} [Aspect Ratio: ${selectedAR}]`,
                    uniquePhoto: `${uploadedImage ? `${uploadedImage} ` : ""}${dataResponse.prompts[3]} [Aspect Ratio: ${selectedAR}]`
                });
                
                setIsEnhancing(false); 
                setIsScanning(false);
                return; 
            }
        }

        setIsEnhancing(false); 
        setIsScanning(false);

    } catch (err) {
        console.error(err);
        alert("Došlo je do greške u komunikaciji sa AI Serverom. Proverite da li je Railway Python server aktivan.");
        setIsEnhancing(false); 
        setIsScanning(false);
    }
  };

  // --- 5. RENDER (KORISNIČKI INTERFEJS) ---
  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#ff6600', fontSize: '24px', margin: 0 }}>AI TOOLS <span style={{ color: '#aaa', fontSize: '14px' }}>PRO SMART</span></h1>
      </header>

      {/* GLAVNI UNOS */}
      <section style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
        <h2 style={{ fontSize: '14px', color: '#66b3ff', marginBottom: '20px' }}>▶ KONCEPT / SUBJEKAT</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="npr. 'zlatni sat' ili Otpremi Sliku (za Roast sistem, samo ukucaj loš prompt ovde)"
            value={customerPrompt}
            onChange={(e) => setCustomerPrompt(e.target.value)}
            disabled={uploadedImage !== null}
            style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
          />
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
          <button onClick={() => fileInputRef.current.click()} style={{ padding: '0 20px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            📸 Otpremi Sliku
          </button>
          
          {(customerPrompt || uploadedImage) && (
            <button onClick={clearInput} style={{ padding: '0 20px', backgroundColor: '#4a0000', border: '1px solid #ff4444', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              ✖ Očisti
            </button>
          )}
        </div>

        {/* PREKIDAČI (ASPECT RATIO) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>ODNOS STRANICA</p>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['1:1', '9:16', '16:9', '21:9'].map(ar => (
                <button 
                  key={ar} 
                  onClick={() => setSelectedAR(ar)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: selectedAR === ar ? '#0055ff' : '#222', color: '#fff' }}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleEnhance} 
            disabled={isEnhancing}
            style={{ padding: '15px 40px', backgroundColor: '#0044cc', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isEnhancing ? 'not-allowed' : 'pointer', opacity: isEnhancing ? 0.7 : 1 }}
          >
            {isEnhancing ? "UČITAVAM..." : "POBOLJŠAJ KINEMATOGRAFSKI KONCEPT"}
          </button>
        </div>
      </section>

      {/* REZULTATI */}
      <section style={{ maxWidth: '1200px', margin: '40px auto' }}>
        
        {/* AKO JE U PITANJU ROAST (SAMO TEKSTUALNI UNOS) POKAŽI JEDAN VELIKI BOKS */}
        {generatedPrompts.single && !uploadedImage && (
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #ffaa00', padding: '20px', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
            <h3 style={{ color: '#ffaa00', fontSize: '14px', marginBottom: '15px' }}>🔥 HASSELBLAD ROAST & ENHANCE</h3>
            <p>{generatedPrompts.single}</p>
          </div>
        )}

        {/* AKO JE U PITANJU SLIKA POKAŽI 4 BOKSA */}
        {uploadedImage && generatedPrompts.abstract && (
          <div>
             <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '15px', borderRadius: '10px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                <p style={{ color: '#44ff44', fontSize: '14px' }}>{generatedPrompts.single}</p>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {[
                  { title: 'VRHUNSKO APSTRAKTNO REMEK-DELO', text: generatedPrompts.abstract, color: '#aa00ff' },
                  { title: 'EPSKI HOLIVUDSKI KADAR', text: generatedPrompts.cinematic, color: '#0077ff' },
                  { title: 'SAVRŠEN FOTOREALISTIČNI RENDER', text: generatedPrompts.photoreal, color: '#00ffaa' },
                  { title: 'NAJUNIKATNIJA SLIKA IKADA', text: generatedPrompts.uniquePhoto, color: '#ffaa00' }
                ].map((box, idx) => (
                  <div key={idx} style={{ backgroundColor: '#111', border: `1px solid ${box.color}`, padding: '20px', borderRadius: '10px', position: 'relative' }}>
                    <h4 style={{ color: box.color, fontSize: '12px', marginBottom: '15px' }}>{box.title}</h4>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#ccc', marginBottom: '40px' }}>{box.text}</p>
                    <button onClick={() => navigator.clipboard.writeText(box.text)} style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: box.color, color: '#000', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                      KOPIRAJ PROMPT
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default App;