import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Zap, Loader2, Eye, Trash2, UploadCloud, Dices, History, Sparkles, Lock, X, PlayCircle, Award, ShieldAlert,ChevronLeft, Mail } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// FIREBASE
import { db, auth, provider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// DATA & TOAST
import * as data from './data';
import { v8Toast } from './App'; // Uvozimo v8Toast iz tvog glavnog fajla

// --- V8 SENZOR ZA AUTOMATSKU DETEKCIJU SERVERA ---
const BASE_BACKEND_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://goranov-sajt-srpski-backend-production.up.railway.app";

/// POČETAK POMOĆNIH KOMPONENTI ZA ENHANCER ///
const ScrambleText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!text) { setDisplayed(''); return; }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#';
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayed(text.split('').map((char, index) => {
        if(index < iteration) return char;
        if(char === ' ' || char === '\n') return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iteration >= text.length) clearInterval(interval);
      iteration += text.length > 500 ? 6 : text.length > 100 ? 3 : 1;
    }, 25);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed || "ČEKAM UNOS U JEZGRO..."}<span className="animate-pulse opacity-50 text-orange-500">_</span></span>;
};

const RippleButton = ({ children, onClick, disabled, className }) => {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipples([...ripples, { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    if (onClick) onClick(e);
  };
  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={`relative overflow-hidden ${className}`}>
      <span className="relative z-10 flex items-center justify-center">{children}</span>
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span key={r.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute bg-white/40 rounded-full pointer-events-none z-0" style={{ left: r.x, top: r.y, width: 100, height: 100, marginTop: -50, marginLeft: -50 }} onAnimationComplete={() => setRipples(prev => prev.filter(rip => rip.id !== r.id))} />
        ))}
      </AnimatePresence>
    </button>
  );
};

const OptionButton = ({ label, selected, onClick, type, disabled }) => {
  const isQuality = type === 'quality';
  const activeClass = isQuality ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]";
  return <button type="button" disabled={disabled} onClick={onClick} className={`px-4 py-2 rounded-lg text-[9px] font-black border transition-all ${selected ? activeClass : "bg-black border-white/10 text-zinc-500 hover:border-white/20 hover:text-white"} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{label}</button>;
};
/// KRAJ POMOĆNIH KOMPONENTI ZA ENHANCER ///

/// POČETAK FUNKCIJE: V8Enhancer10x ///
const V8Enhancer10x = () => {
  const [demoInput, setDemoInput] = useState(''); 
  const [customerPrompt, setCustomerPrompt] = useState(''); 
  const [generatedPrompts, setGeneratedPrompts] = useState({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }); 
  const [isEnhancing, setIsEnhancing] = useState(false); 
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAR, setSelectedAR] = useState('16:9'); 
  const [selectedQuality, setSelectedQuality] = useState('4x'); 
  const [copiedBox, setCopiedBox] = useState(''); 
  const [isRolling, setIsRolling] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); 
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const containerRef = useRef();

  const [isVIP, setIsVIP] = useState(false);
  const [ipsModalData, setIpsModalData] = useState(null);
  const [vipHistory, setVipHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === "damnjanovicgoran7@gmail.com") {
          setIsVIP(true); v8Toast.success("Dobrodošao nazad, Gorane! Sistem otključan."); loadHistory(user.email);
        } else {
          try {
            const docRef = doc(db, "vip_users", user.email.toLowerCase());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().unlockedApps && (docSnap.data().unlockedApps.includes('FULL_ACCESS') || docSnap.data().unlockedApps.includes('10X_ENHANCER'))) { 
              setIsVIP(true); v8Toast.success("Premium Pristup Odobren!"); loadHistory(user.email); 
            } else { setIsVIP(false); }
          } catch(e) { setIsVIP(false); }
        }
      } else { setIsVIP(false); setVipHistory([]); }
    });
    return () => unsubscribe();
  }, []);

  const loadHistory = (email) => {
    const saved = localStorage.getItem(`v8_history_${email}`);
    if(saved) setVipHistory(JSON.parse(saved));
  };

  const saveToHistory = (promptText, typeLabel) => {
    if(!auth.currentUser) return;
    const email = auth.currentUser.email;
    const newItem = { id: Date.now(), text: promptText, type: typeLabel, date: new Date().toLocaleString() };
    const updated = [newItem, ...vipHistory].slice(0, 10); 
    setVipHistory(updated);
    localStorage.setItem(`v8_history_${email}`, JSON.stringify(updated));
  };
// --- V8 FUNKCIJA: BRISANJE IZ ISTORIJE ---
  const handleDeleteHistoryItem = (id) => {
    const updatedHistory = vipHistory.filter(item => item.id !== id);
    setVipHistory(updatedHistory);
    if (auth.currentUser) {
      localStorage.setItem(`v8_history_${auth.currentUser.email}`, JSON.stringify(updatedHistory));
    }
    v8Toast.success("Uklonjeno iz V8 trezora!");
  };

  const handlePremiumLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.email === "damnjanovicgoran7@gmail.com") {
        setIsVIP(true);
      } else {
        const docRef = doc(db, "vip_users", user.email.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().unlockedApps && (docSnap.data().unlockedApps.includes('FULL_ACCESS') || docSnap.data().unlockedApps.includes('10X_ENHANCER'))) { setIsVIP(true); } else {
           alert("Vaš email (" + user.email + ") nije pronađen u bazi za ovaj alat. Ako ste uplatili, pošaljite nam dokaz na email.");
           await signOut(auth);
        }
      }
    } catch (err) { v8Toast.error("Greška pri prijavi!"); }
  };

  const handlePaymentV8 = async (tip, cena) => {
    if (auth.currentUser) { try { await setDoc(doc(db, "posetioci", auth.currentUser.uid), { poslednjiKlik: serverTimestamp(), zainteresovanZa: tip }, { merge: true }); } catch (err) {} }
    setIpsModalData({ tip, cena });
  };

  useGSAP(() => { if (generatedPrompts.abstract) { gsap.from('.gsap-result-box', { y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)', clearProps: 'all' }); } }, { dependencies: [generatedPrompts.abstract], scope: containerRef });

  useEffect(() => {
    const fetchGallery = async () => {
      try { const snapshot = await getDocs(collection(db, "enhancer_gallery")); const items = []; snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() })); setGallery(items.sort((a, b) => b.createdAt - a.createdAt)); } catch (err) {}
    }; fetchGallery();
  }, []);

  useEffect(() => { if (gallery.length <= 1) return; const interval = setInterval(() => { setActiveGalleryIndex((prev) => (prev + 1) % gallery.length); }, 15000); return () => clearInterval(interval); }, [gallery.length]);

  const handleRollDice = (e) => { 
    if (e) e.preventDefault();
    setIsRolling(true);
    const prompts = data.DICE_PROMPTS || ["zlatni sat iznad Beograda", "apstraktna geometrija u neon bojama", "filmska jurnjava kroz Tokio"];
    if (prompts.length > 0) {
      const randomText = prompts[Math.floor(Math.random() * prompts.length)];
      setDemoInput(randomText); 
      setGeneratedPrompts(prev => ({ ...prev, abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' })); 
      setTimeout(() => { setIsRolling(false); }, 300);
    }
  };

  const handleImageUpload = async (e) => {
    if (uploadedImage) { setShowWarningModal(true); return; }
    const file = e.target.files[0]; if (!file) return; setIsImageUploading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json(); setUploadedImage(resData.secure_url); setDemoInput(prev => prev ? `${resData.secure_url} ${prev}` : resData.secure_url);
    } catch (err) {} finally { setIsImageUploading(false); }
  };

  const handleAnalyzeImage = async (e) => {
    if (e) e.preventDefault(); if (!uploadedImage) return; setIsAnalyzingImage(true);
    try {
        const promptInstruction = "Kao ekspert za inženjering promptova, dubinski i tehnički analiziraj ovu sliku. Opiši glavni subjekat, atmosferu, stil, paletu boja, tip osvetljenja i podešavanja kamere/sočiva (ako izgleda kao fotografija). Napiši izlaz isključivo na engleskom jeziku u formi vrhunskog prompta, bez dodatnih uvoda ili objašnjenja.";
        const res = await fetch(`${BASE_BACKEND_URL}/api/read-image`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: uploadedImage, prompt: promptInstruction }) });
        const apiData = await res.json();
        if (apiData.result) { setDemoInput(apiData.result); v8Toast.success("Dubinska analiza uspešna!"); } else if (apiData.error) { v8Toast.error("V8 Vision Greška: " + apiData.error); }
    } catch (err) { v8Toast.error("Greška pri komunikaciji sa V8 serverom."); console.error(err); } finally { setIsAnalyzingImage(false); }
  };

  // --- V8 PRIVATNA BAZA TOKENA (GORANOV INŽENJERING) ---
  const V8_PRESETS = {
    abstract: [
      { cameraLens: "IMAX 65mm MSM Film × Panavision Ultra Vista 50mm Anamorphic", meta: "film_grain_35mm, halation_glow, ACEScg_grade, volumetric_depth, spectral_diffusion, microcontrast_boost, optical_bloom, RAW_dynamic_range", keywords: "liquid geometry flow, fractal energy ribbons, hyperfluid motion fields, layered dimensional waves", lighting: "volumetric golden-hour beams with soft shadow rolloff and light scattering" },
      { cameraLens: "ARRI ALEXA 35 × Zeiss Master Prime 100mm", meta: "ultra_dynamic_color, cinematic_shadow_rolloff, subsurface_scattering_light, HDRx_fusion, depth_precision_render, texture_fidelity_max", keywords: "dark matter gradients, energy filament veins, abstract gravity distortion, smooth entropy transitions", lighting: "low-key studio lighting with rim highlights and deep contrast separation" },
      { cameraLens: "RED RAPTOR V 8K × Sigma Cine 35mm T1.5", meta: "hyperreal_reflection_engine, raytrace_precision, light_bounce_simulation, ultra_clean_render, spectral_highlight_control", keywords: "glass-like wave interference, reflective liquid surfaces, kinetic ripple distortions, chromatic displacement fields", lighting: "high contrast reflective lighting with sharp specular highlights and controlled glare" },
      { cameraLens: "Sony VENICE 2 × Leica Summilux-C 75mm", meta: "color_science_mastery, tone_mapping_pro, soft_gradient_blending, cinematic_depth_layers, diffusion_haze_control", keywords: "minimalist flowing shapes, soft energy folds, abstract silk-like motion, atmospheric density gradients", lighting: "soft diffused studio lighting with subtle glow and ambient wrap illumination" },
      { cameraLens: "Fujifilm GFX100 II × GF 110mm f/2", meta: "ultra_texture_precision, medium_format_depth, microdetail_enhancement, natural_color_volume, optical_realism_engine", keywords: "organic abstract formations, fluid ink diffusion, macro texture waves, evolving surface patterns", lighting: "natural soft daylight with smooth highlight transitions and realistic shadow gradients" }
    ],
    cinematic: [
      { cameraLens: "ARRI ALEXA 65 × Panavision T-Series Anamorphic 50mm", meta: "film_grain_35mm, halation_glow, ACEScg_grade, cinematic_shadow_rolloff, volumetric_depth, highlight_rolloff_pro, analog_color_response, lens_breathing", keywords: "epic cinematic composition, layered depth staging, foreground-midground-background separation, hero framing, dramatic scale", lighting: "golden hour cinematic backlight with volumetric rays and atmospheric haze" },
      { cameraLens: "IMAX MSM 65mm Film × IMAX 80mm Prime", meta: "ultra_dynamic_range, filmic_color_science, optical_compression, microcontrast_precision, HDRx_fusion, ultra_depth_field", keywords: "monumental scale visuals, ultra-wide cinematic scope, environmental storytelling, grand perspective distortion, immersive realism", lighting: "high-intensity natural daylight with strong contrast and realistic shadow falloff" },
      { cameraLens: "RED V-RAPTOR XL 8K × Cooke Anamorphic/i 75mm", meta: "cooke_look_warmth, skin_tone_accuracy, cinematic_soft_contrast, highlight_bloom_control, subtle_halation, depth_layering_engine", keywords: "character-driven framing, emotional close-up intensity, narrative focus, expressive facial micro-details, cinematic intimacy", lighting: "soft diffused key light with practical highlights and warm ambient fill" },
      { cameraLens: "Sony VENICE 2 × Zeiss Supreme Prime 35mm", meta: "color_science_mastery, tonal_range_expansion, shadow_detail_recovery, cinematic_motion_blur, optical_realism_engine, texture_fidelity_max", keywords: "modern cinematic realism, urban storytelling, handheld immersion, grounded atmosphere, natural scene dynamics", lighting: "mixed practical lighting (neon + tungsten) with realistic color contrast and ambient spill" },
      { cameraLens: "ARRI ALEXA Mini LF × Leica Summilux-C 90mm", meta: "ultra_skin_texture, micro_expression_engine, shallow_depth_precision, cinematic_focus_falloff, organic_color_response, fine_grain_structure", keywords: "luxury cinematic portrait, intimate storytelling, subtle emotion capture, shallow depth isolation, premium film still quality", lighting: "soft window light with gentle bounce fill and natural highlight transitions" }
    ],
    photoreal: [
      { cameraLens: "Fujifilm GFX100 II × GF 110mm f/2", meta: "ultra_texture_precision, medium_format_depth, subsurface_scattering_skin, natural_color_volume, optical_realism_engine, microdetail_enhancement, RAW_dynamic_range", keywords: "true skin pores, natural asymmetry, real-world imperfections, micro hair detail, tactile surface realism", lighting: "soft natural window light with realistic shadow gradients and gentle highlight rolloff" },
      { cameraLens: "Canon EOS R5 × RF 85mm f/1.2L", meta: "skin_tone_accuracy, shallow_depth_precision, highlight_rolloff_pro, color_science_real, lens_aberration_subtle, natural_bokeh_render", keywords: "portrait realism, candid moment capture, human imperfection detail, authentic expression, DSLR snapshot feel", lighting: "golden hour natural light with soft backlight and warm tonal balance" },
      { cameraLens: "Sony A1 × FE 35mm f/1.4 GM", meta: "real_world_texture_fidelity, motion_microblur, optical_distortion_natural, ambient_light_balance, ultra_clean_sensor_output", keywords: "street photography realism, unposed moment, environmental storytelling, natural movement capture, documentary style", lighting: "mixed natural daylight with real ambient spill and uncontrolled light variations" },
      { cameraLens: "Nikon Z9 × NIKKOR 50mm f/1.2 S", meta: "dynamic_range_expansion, shadow_detail_recovery, highlight_compression, RAW_noise_structure, sensor_grain_natural", keywords: "editorial realism, magazine-grade photography, clean composition, real-life color accuracy, high-end DSLR output", lighting: "studio softbox lighting with subtle falloff and realistic contrast shaping" },
      { cameraLens: "Phase One XF IQ4 × Schneider Kreuznach 80mm LS", meta: "ultra_high_resolution_capture, microcontrast_precision, medium_format_color_depth, extreme_detail_retention, optical_perfection_engine", keywords: "luxury product realism, hyper-detailed textures, premium material rendering, crystal clarity surfaces, commercial photography quality", lighting: "controlled studio lighting with precision highlights and perfect reflection shaping" }
    ],
    uniquePhoto: [
      { cameraLens: "ARRI ALEXA 65 × Panavision T-Series Anamorphic 40mm", meta: "film_grain_35mm, halation_glow, ACEScg_grade, dimensional_warp_engine, reality_distortion_field, volumetric_depth, optical_bloom, highlight_rolloff_pro", keywords: "folded reality layers, impossible geometry landscapes, multi-plane existence, perspective-breaking composition, cinematic paradox space", lighting: "volumetric god rays slicing through layered dimensions with deep atmospheric haze and cinematic shadow rolloff" },
      { cameraLens: "IMAX 65mm Film × IMAX 100mm Prime", meta: "ultra_dynamic_range, macro_scale_fusion, infinity_focus_engine, hyperreal_depth_stack, environmental_density_render, HDRx_fusion", keywords: "cosmic-scale environments blended with micro-detail worlds, infinite recursion landscapes, scale ambiguity illusion, universe within particles", lighting: "extreme high-contrast cosmic lighting with radiant highlights and deep space shadows" },
      { cameraLens: "RED V-RAPTOR XL 8K × Laowa Probe 24mm", meta: "micro_world_engine, extreme_perspective_distortion, texture_fidelity_max, macro_depth_layering, hyper_detail_precision, optical_realism_engine", keywords: "inside-liquid-world perspective, microscopic cinematic environments, organic structures as landscapes, alien fluid ecosystems", lighting: "bioluminescent glow mixed with directional macro lighting and reflective highlights" },
      { cameraLens: "Sony VENICE 2 × Zeiss Supreme Prime 29mm", meta: "color_science_mastery, temporal_motion_blur, dimensional_transition_engine, spectral_light_split, cinematic_depth_layers, tone_mapping_pro", keywords: "time-freeze transitions, multiple motion states in one frame, fragmented reality slices, layered time exposure, visual echo trails", lighting: "mixed lighting (cool vs warm contrast) with dynamic exposure blending and light streak transitions" },
      { cameraLens: "Phase One XF IQ4 × Schneider Kreuznach 55mm LS", meta: "ultra_high_resolution_capture, microcontrast_precision, reality_lock_engine, extreme_detail_retention, hyperreal_surface_render, optical_perfection_engine", keywords: "ultra-real surreal fusion, indistinguishable from reality but impossible scene, paradox realism, hyper-detailed dream logic, real-world physics breaking", lighting: "perfectly controlled studio lighting fused with natural daylight realism for impossible clarity" }
    ]
  };

  // V8 FUNKCIJA ZA SPAJANJE PROMPTA
  const buildV8Prompt = (category, baseInput, aspectRatio, imageUrl) => {
    const presets = V8_PRESETS[category];
    const preset = presets[Math.floor(Math.random() * presets.length)];
    const noTextInstruction = "Absolutely NO text, NO letters, NO watermarks, NO signatures. Pure visual composition only.";
    const imgPrefix = imageUrl ? `${imageUrl} ` : "";
    
    return `${imgPrefix}A breathtaking capture of: ${baseInput}. Built upon: ${preset.cameraLens}. Illumination: ${preset.lighting}. Protocols: ${preset.meta}. Visual structure defined by: ${preset.keywords}. ${noTextInstruction} [Aspect Ratio: ${aspectRatio}]`;
  };
  
  const handleEnhance = (e, boxType) => {
    if (e) e.preventDefault();
    const rawInput = boxType === 'concept' ? demoInput.trim() : customerPrompt.trim();
    if(!rawInput) return; 
    
    if (boxType === 'prompt') { setIsScanning(true); setGeneratedPrompts(prev => ({ ...prev, single: '' })); } 
    else { setGeneratedPrompts(prev => ({ ...prev, abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' })); }
    
    setIsEnhancing(true); 
    
    setTimeout(() => { 
      try { 
        let cleanInput = rawInput; let detectedBadFormat = false;
        if (/\[.*?\]|--\w+/.test(rawInput)) { detectedBadFormat = true; cleanInput = rawInput.replace(/\[.*?\]:?/g, '').replace(/--\w+(?:\s+[^\s]+)?/g, '').replace(/\s{2,}/g, ' ').trim(); }
        
        setGeneratedPrompts(prev => {
           const nextState = { ...prev };
           if (boxType === 'prompt') {
              let roastMsgs = [];
              if (detectedBadFormat) roastMsgs.push("- Vaš format je bio neefikasan; izbrisao sam šum.");
              const roastIntro = `/// V8 AI EKSPERTSKA ANALIZA ///\n\n🟢 ŠTA JE DOBRO:\nVizija je solidna.\n\n🔴 ŠTA JE LOŠE:\n${roastMsgs.length > 0 ? roastMsgs.join('\n') : "Nedostaje profesionalna tehnička dubina."}\n\n🚀 V8 10X FINALNI PROMPT:\n\n`;
              
              const enhancedSingle = buildV8Prompt('uniquePhoto', cleanInput, selectedAR, uploadedImage);
              nextState.single = roastIntro + enhancedSingle;
              saveToHistory(enhancedSingle, "10X Rekonstrukcija");
           } else {
              nextState.abstract = buildV8Prompt('abstract', cleanInput, selectedAR, uploadedImage);
              nextState.cinematic = buildV8Prompt('cinematic', cleanInput, selectedAR, uploadedImage);
              nextState.photoreal = buildV8Prompt('photoreal', cleanInput, selectedAR, uploadedImage);
              nextState.uniquePhoto = buildV8Prompt('uniquePhoto', cleanInput, selectedAR, uploadedImage);
              saveToHistory(nextState.cinematic, "Kinematografski Koncept");
           }
           return nextState;
        });
        
        v8Toast.success("Generisanje uspešno završeno!");
      } catch (err) { v8Toast.error("Greška prilikom generisanja!"); } finally { setIsEnhancing(false); setIsScanning(false); } 
    }, 2500); 
  };
  
  const handleCopy = (text, boxName) => { 
    let copyText = text; if (text.includes("🚀 V8 10X FINALNI PROMPT:\n\n")) copyText = text.split("🚀 V8 10X FINALNI PROMPT:\n\n")[1];
    navigator.clipboard.writeText(copyText); setCopiedBox(boxName); v8Toast.success("10X Prompt uspešno kopiran!"); setTimeout(() => setCopiedBox(''), 2000); 
  };

  const v8Stilovi = [
    { id: 'abstract', naslov: 'APSTRAKTNI', bojaClass: 'border-purple-500/30', hoverBojaClass: 'hover:border-purple-500/80', textClass: 'text-purple-400', bgHover: 'hover:bg-purple-600', shadowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', hoverShadowClass: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]' },
    { id: 'cinematic', naslov: 'KINEMATOGRAFSKI', bojaClass: 'border-blue-500/30', hoverBojaClass: 'hover:border-blue-500/80', textClass: 'text-blue-400', bgHover: 'hover:bg-blue-600', shadowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', hoverShadowClass: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]' },
    { id: 'photoreal', naslov: 'FOTOREALISTIČNI', bojaClass: 'border-emerald-500/30', hoverBojaClass: 'hover:border-emerald-500/80', textClass: 'text-emerald-400', bgHover: 'hover:bg-emerald-600', shadowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', hoverShadowClass: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]' },
    { id: 'uniquePhoto', naslov: 'UNIKATNI', bojaClass: 'border-amber-500/30', hoverBojaClass: 'hover:border-amber-500/80', textClass: 'text-amber-400', bgHover: 'hover:bg-amber-600', shadowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', hoverShadowClass: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]' }
  ];

  return (
    <div ref={containerRef} className="pt-32 pb-24 px-6 max-w-[1600px] mx-auto font-sans text-left text-white min-h-screen relative flex flex-col xl:flex-row gap-8">
      <style>{`
        @keyframes scanLineAmber { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-amber { position: absolute; left: 0; width: 100%; height: 2px; background: #fbbf24; box-shadow: 0 0 25px 3px #fbbf24; z-index: 50; animation: scanLineAmber 2.5s infinite; }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .text-gradient-animate { background-size: 200% auto; animation: gradientMove 4s ease infinite; }
        @keyframes raySpin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        .ray-container { position: relative; overflow: hidden; border-radius: 2rem; padding: 2px; }
        .ray-beam { position: absolute; top: 50%; left: 50%; width: 150%; height: 150%; background: conic-gradient(from 0deg, transparent 75%, rgba(251,191,36,0.8) 90%, transparent 100%); animation: raySpin 3s linear infinite; transform-origin: 0 0; z-index: 0; }
        .ray-inner { background: rgba(10,10,10,0.95); backdrop-filter: blur(20px); border-radius: calc(2rem - 2px); position: relative; z-index: 1; height: 100%; padding: 1.5rem; display: flex; flex-direction: column; }
      `}</style>
      <Helmet><title>10X ENHANCER | AI TOOLS PRO SMART</title></Helmet>

      {isVIP && (
        <div className="hidden xl:flex w-72 flex-col bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 h-[calc(100vh-160px)] sticky top-32 overflow-hidden shadow-2xl shrink-0 z-20">
           <h3 className="text-orange-500 font-black uppercase text-[12px] tracking-widest flex items-center gap-2 mb-6 border-b border-orange-500/20 pb-4"><History className="w-4 h-4" /> VIP Istorija</h3>
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {vipHistory.length === 0 && <p className="text-zinc-600 text-[10px] uppercase font-bold text-center mt-10">Tvoj trezor je prazan.</p>}
              {vipHistory.map((h) => (
  <div key={h.id} className="bg-black border border-white/5 p-4 rounded-xl flex flex-col gap-2 hover:border-orange-500/30 transition-all group relative">
     <div className="flex justify-between items-start">
       <span className="text-orange-400 text-[9px] font-black uppercase pr-4">{h.type}</span>
       <span className="text-zinc-600 text-[8px]">{h.date}</span>
     </div>
     <p className="text-zinc-300 text-[10px] line-clamp-3 font-mono leading-relaxed">{h.text}</p>
     
     {/* V8 AKCIONI RED: KOPIRAJ I OBRIŠI */}
     <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-all">
       <button onClick={() => { navigator.clipboard.writeText(h.text); v8Toast.success("Kopirano iz istorije!"); }} className="text-zinc-500 hover:text-white text-[9px] uppercase font-black tracking-widest transition-colors">
         Kopiraj
       </button>
       
       <button onClick={() => handleDeleteHistoryItem(h.id)} title="Trajno obriši" className="text-red-500 hover:text-red-400 transition-transform hover:scale-110">
         <Trash2 className="w-4 h-4 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
       </button>
     </div>
  </div>
))}
           </div>
        </div>
      )}

     <div className="flex-1 flex flex-col w-full">
        <div className="mb-8 relative z-10"><Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 uppercase text-[10px] font-black tracking-widest transition-all w-fit"><ChevronLeft className="w-4 h-4" /> Sistemski Registar</Link></div>
        
        <div className="mb-12 text-left lg:text-center w-full relative z-10 flex flex-col items-start lg:items-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 text-gradient-animate drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]">10X PROMPT ENHANCER</h1>
          <div className="text-[12px] md:text-[14px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center flex-wrap gap-3 justify-center text-center">
            <span className="relative flex h-3 w-3 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            Premium 3-u-1 alat vredan 200$/mesečno. SAMO 15.000 RSD DOŽIVOTNO.
          </div>
          <p className="text-white text-[12px] md:text-[14px] max-w-2xl font-bold uppercase tracking-[0.2em] leading-relaxed mt-6 mb-4">PREMIUM AI SISTEM ZA INŽENJERING PROMPTOVA. PRETVORI JEDNOSTAVNE IDEJE ILI SLIKU U REMEK-DELA.</p>
          
          {!isVIP && (
             <div className="mt-8 p-6 bg-[#050505] border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] rounded-3xl flex flex-col items-center justify-center w-full max-w-4xl mx-auto z-20">
                <Lock className="w-10 h-10 text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">SISTEM JE ZAKLJUČAN</h3>
                <p className="text-zinc-400 text-[11px] mb-8 uppercase tracking-widest font-bold">Polja za unos i generisanje su onesposobljena dok ne otključate alat.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
                   <RippleButton onClick={() => handlePaymentV8('10X Enhancer - Doživotno', 15000)} className="w-full sm:w-1/2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all">KUPI PRISTUP (15.000 RSD)</RippleButton>
                   <a href="https://www.youtube.com/watch?v=TVOJ_LINK" target="_blank" rel="noopener noreferrer" className="w-full sm:w-1/2 flex items-center justify-center bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest hover:scale-105 transition-all"><PlayCircle className="w-5 h-5 mr-2"/> POGLEDAJ DEMO</a>
                </div>
                <button onClick={handlePremiumLogin} className="text-[10px] uppercase font-black tracking-widest text-zinc-500 hover:text-white border-b border-zinc-700 hover:border-white transition-all pb-1">VEĆ IMAM PRISTUP - PRIJAVI SE KAO PREMIUM KORISNIK</button>
             </div>
          )}
        </div>

        <div className="flex flex-col gap-12 w-full items-stretch relative z-10">
           
           {/* --- GORNJA SEKCIJA: PLAVI KINEMATOGRAFSKI MOTOR --- */}
           <div className={`bg-[#0a0a0a]/50 backdrop-blur-md border border-blue-500/30 rounded-[2.5rem] p-8 md:p-12 relative flex flex-col gap-10 transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] ${!isVIP ? 'opacity-50 grayscale-[50%] pointer-events-none select-none' : 'hover:border-blue-500/60 group'}`}>
              <div className="w-full text-center border-b border-blue-500/20 pb-6 mb-2"><h2 className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase text-blue-400 tracking-wider">PRETVORITE VAŠE IDEJE U UMETNIČKA DELA, BACI KOCKICE, ILI OTPREMITE VAŠU ILI NAŠU SLIKU</h2></div>
              <div className="w-full flex flex-col lg:flex-row gap-8">
                 <div className="w-full lg:w-1/3 flex flex-col justify-start text-left">
                   <label className="text-[14px] md:text-[16px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2 mb-3"><PlayCircle className="w-5 h-5" /> Koncept / Subjekat</label>
                   <p className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest mb-6">Unesi svoju osnovnu ideju ili baci V8 Kockice.</p>
                 </div>
                 
                 {/* POLJE ZA UNOS */}
                 <div className="w-full lg:w-2/3 relative flex flex-col">
                   <div className={`relative flex flex-col rounded-2xl border border-white/10 bg-[#050505]/50 ${isVIP ? 'focus-within:border-blue-500/50' : ''}`}>
                     {uploadedImage && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg overflow-hidden border border-blue-500/50 z-20 group/img"><img src={uploadedImage} alt="Ref" className="w-full h-full object-cover" /><button type="button" disabled={!isVIP} onClick={() => { setUploadedImage(null); setDemoInput(prev => prev.replace(uploadedImage, '').trim()); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button></div>}
                     <textarea disabled={!isVIP} value={demoInput} spellCheck="false" data-gramm="false" data-lt-active="false" onChange={e => { setDemoInput(e.target.value); setGeneratedPrompts(prev => ({ ...prev, abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' })); }} placeholder={isVIP ? "npr. 'zlatni sat' ili Otpremi Sliku" : "ZAKLJUČANO: Kupi pristup za unos teksta"} className={`w-full flex-1 bg-transparent pr-28 py-4 text-white text-[16px] font-medium outline-none resize-none min-h-[100px] ${uploadedImage ? 'pl-20' : 'pl-6'} ${!isVIP ? 'cursor-not-allowed' : ''}`} />
                     
                     {!demoInput && (
                        <label title="DODAJTE SLIKU" className={`absolute right-16 top-1/2 -translate-y-1/2 p-2 z-10 transition-transform hover:scale-110 ${isVIP ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                          {isImageUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400" /> : <UploadCloud className="w-6 h-6 text-zinc-400 hover:text-white drop-shadow-md transition-colors" />}
                          <input type="file" accept="image/*" disabled={!isVIP} onChange={handleImageUpload} className="hidden" />
                        </label>
                     )}
                     {!demoInput && (
                        <button type="button" title="BACITE KOCKICE" disabled={!isVIP || isRolling} onClick={handleRollDice} className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 z-10 transition-transform hover:scale-110 ${isVIP ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                           <Dices className={`w-6 h-6 text-zinc-400 hover:text-white drop-shadow-md transition-colors ${isRolling ? 'animate-spin text-orange-500' : ''}`} />
                        </button>
                     )}
                     {demoInput && (
                        <button type="button" title="OBRIŠI UNOS" disabled={!isVIP} onClick={() => { setDemoInput(''); setGeneratedPrompts(prev => ({ ...prev, abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' })); setUploadedImage(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-transform hover:scale-110 cursor-pointer z-10">
                          <X className="w-6 h-6 text-red-500 drop-shadow-md hover:text-red-400" />
                        </button>
                     )}
                   </div>
                   
                   {/* DUGME ZA ANALIZU SLIKE (V8 VISION) */}
                   {uploadedImage && (
                     <button type="button" onClick={handleAnalyzeImage} disabled={!isVIP || isAnalyzingImage} className={`mt-4 w-full bg-gradient-to-r from-purple-800 to-indigo-600 text-white py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all border border-purple-500/50 ${isVIP ? 'hover:from-purple-700 hover:to-indigo-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] cursor-pointer hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'}`}>
                       {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin text-purple-300" /> : <Eye className="w-4 h-4 text-purple-300" />}
                       {isAnalyzingImage ? "V8 VISION DUBINSKO SKENIRANJE U TOKU..." : "DUBINSKI ANALIZIRAJ SLIKU (V8 VISION GPT)"}
                     </button>
                   )}
                 </div>
              </div>
              <div className="w-full flex flex-col border-t border-blue-500/20 pt-8">
                 <label className="text-[10px] md:text-[12px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2 mb-6 border-b border-blue-500/20 pb-4"><Sparkles className="w-4 h-4 mr-1" /> Izlaz V8 Kinematografskog Sistema</label>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full text-left mt-4">
                    {v8Stilovi.map((stil) => (
                      <div key={stil.id} className={`border rounded-xl p-6 bg-[#0a0a0a] min-h-[280px] flex flex-col group overflow-hidden transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] relative gsap-result-box ${stil.bojaClass} ${stil.hoverBojaClass} ${stil.shadowClass} ${stil.hoverShadowClass}`}>
                        <label className={`text-[11px] font-black uppercase tracking-widest mb-4 border-b border-white/30 pb-3 flex items-center ${stil.textClass}`}>{stil.naslov} V8 PROMPT</label>
                        <div className="relative w-full flex-grow flex flex-col mb-10">
                          <div className="font-mono text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                            {generatedPrompts[stil.id] ? <ScrambleText text={generatedPrompts[stil.id]} /> : <span className="text-zinc-600 italic text-[10px]">Čekam V8 paljenje...</span>}
                          </div>
                        </div>
                        {generatedPrompts[stil.id] && (
                          <button onClick={() => handleCopy(generatedPrompts[stil.id], stil.id)} className={`absolute bottom-6 right-6 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white ${stil.bgHover} transition-colors border border-white/10 z-10`}>
                            {copiedBox === stil.id ? "KOPIRANO! ✓" : "KOPIRAJ PROMPT"}
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 mt-4 border-t border-blue-500/20 pt-8">
                 <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto text-left">
                    <div className="flex flex-col gap-4"><span className="text-[12px] font-black uppercase text-zinc-300">ODNOS STRANICA</span><div className="flex flex-wrap gap-2">{['1:1', '9:16', '16:9', '21:9'].map(ar => <OptionButton key={`ar-${ar}`} label={ar} selected={selectedAR === ar} onClick={() => setSelectedAR(ar)} type="ar" disabled={!isVIP} />)}</div></div>
                    <div className="flex flex-col gap-4"><span className="text-[12px] font-black uppercase text-zinc-300">KVALITET</span><div className="flex flex-wrap gap-2">{['1x', '2x', '4x'].map(q => <OptionButton key={`q-${q}`} label={q} selected={selectedQuality === q} onClick={() => setSelectedQuality(q)} type="quality" disabled={!isVIP} />)}</div></div>
                 </div>
                 <RippleButton onClick={(e) => handleEnhance(e, 'concept')} disabled={!isVIP || isEnhancing || !demoInput.trim()} className={`w-full lg:w-[30%] bg-gradient-to-r from-blue-700 to-blue-500 text-white py-6 rounded-2xl font-black uppercase text-[14px] ${isVIP ? 'shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                   {isEnhancing ? <Loader2 className="w-6 h-6 animate-spin mr-4 inline" /> : "Poboljšaj Kinematografski Koncept"}
                 </RippleButton>
              </div>
           </div>

           {/* --- DONJA SEKCIJA: NARANDŽASTA MATRICA --- */}
           <div className={`bg-[#0a0a0a]/50 backdrop-blur-md border border-amber-400/30 rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 shadow-[0_0_30px_rgba(251,191,36,0.1)] hover:shadow-[0_0_40px_rgba(251,191,36,0.2)] ${!isVIP ? 'opacity-50 grayscale-[50%] pointer-events-none select-none' : 'hover:border-amber-400/60 group'}`}>
              <div className="w-full text-center border-b border-amber-400/20 pb-6 mb-2"><h2 className="text-[12px] md:text-[15px] font-black uppercase text-amber-400 tracking-wider">POBOLJŠAĆEMO VAŠ PROMT 10X BOLJIM</h2></div>
              <div className="w-full flex flex-col lg:flex-row gap-8">
                 <div className="w-full lg:w-1/3 text-left">
                   <label className="text-[14px] md:text-[16px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 mb-3"><Zap className="w-5 h-5" /> Nalepi Korisnički Prompt</label>
                   <p className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest mb-6">Nalepi sirovi prompt da bismo ga rekonstruisali.</p>
                 </div>
                 <div className={`w-full lg:w-2/3 relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505]/50 ${isVIP ? 'focus-within:border-amber-400/50' : ''}`}>
                   {isScanning && customerPrompt.trim() !== "" && <div className="animate-scan-amber" />}
                   <textarea disabled={!isVIP} value={customerPrompt} spellCheck="false" data-gramm="false" data-lt-active="false" onChange={e => { setCustomerPrompt(e.target.value); setGeneratedPrompts(prev => ({ ...prev, single: '' })); }} placeholder={isVIP ? "NALEPI SVOJ SIROVI PROMPT OVDE" : "ZAKLJUČANO"} className={`w-full flex-1 bg-transparent p-6 text-white text-[12px] md:text-[14px] outline-none resize-none min-h-[160px] ${!isVIP ? 'cursor-not-allowed' : ''}`} />
                   {customerPrompt && <button type="button" disabled={!isVIP} onClick={() => { setCustomerPrompt(''); setGeneratedPrompts(prev => ({ ...prev, single: '' })); setIsScanning(false); }} className="absolute right-4 top-4 bg-red-600/10 p-2.5 rounded-xl hover:bg-red-600 cursor-pointer"><Trash2 className="w-4 h-4 text-red-500 animate-pulse" /></button>}
                 </div>
              </div>
              <div className="w-full flex flex-col border-t border-amber-400/20 pt-8">
                 <label className="text-[10px] md:text-[12px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 mb-6 border-b border-amber-400/20 pb-4"><Eye className="w-4 h-4 mr-1" /> Izlaz V8 Matrice</label>
                 <div className="w-full ray-container min-h-[300px]">
                   <div className="ray-beam" />
                   <div className="ray-inner pb-20">
                       <div className="text-amber-400 font-black text-[12px] uppercase mb-6 border-b border-amber-400/10 pb-4 flex items-center gap-3"><Zap className="w-4 h-4" /> Premium Unikatni Izlaz Matrice</div>
                       <div className="w-full font-mono text-[11px] md:text-[13px] leading-relaxed text-left text-zinc-200 whitespace-pre-wrap"><ScrambleText text={generatedPrompts.single} /></div>
                       {generatedPrompts.single && <button type="button" onClick={() => handleCopy(generatedPrompts.single, 'single')} className="absolute bottom-6 right-6 px-6 py-3 rounded-xl text-[11px] font-black uppercase bg-amber-400/10 border border-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black transition-colors z-20">Kopiraj 10X Prompt</button>}
                   </div>
                 </div>
              </div>
              <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 mt-4 border-t border-amber-400/20 pt-8">
                 <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto text-left"><div className="flex flex-col gap-4"><span className="text-[12px] font-black text-amber-100 uppercase">KVALITET</span><div className="flex flex-wrap gap-2">{['1x', '2x', '4x'].map(q => <OptionButton key={`q2-${q}`} label={q} selected={selectedQuality === q} onClick={() => setSelectedQuality(q)} type="quality" disabled={!isVIP} />)}</div></div></div>
                 <RippleButton onClick={(e) => handleEnhance(e, 'prompt')} disabled={!isVIP || isEnhancing || !customerPrompt.trim()} className={`w-full lg:w-[30%] bg-gradient-to-r from-amber-600 to-amber-500 text-black py-6 rounded-2xl font-black uppercase text-[14px] ${isVIP ? 'shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                   {isEnhancing ? <Loader2 className="w-6 h-6 animate-spin mr-4 inline" /> : "Poboljšaj Unikatni Prompt"}
                 </RippleButton>
              </div>
           </div>

           {/* --- V8 REFERENTNA GALERIJA --- */}
           {gallery.length > 0 && (
             <div className={`bg-[#0a0a0a]/50 backdrop-blur-md border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 relative flex flex-col gap-6 transition-all duration-500 mt-4 text-center items-center shadow-[0_0_30px_rgba(234,88,12,0.15)] hover:shadow-[0_0_40px_rgba(234,88,12,0.25)] ${!isVIP ? 'opacity-50 grayscale-[50%] pointer-events-none select-none' : 'hover:border-orange-500/60'}`}>
               <div className="flex items-center justify-center gap-3 border-b border-orange-500/20 pb-4 mb-4 w-full">
                 <Zap className="w-6 h-6 text-orange-500 animate-pulse" />
                 <h2 className="text-xl md:text-2xl font-black text-orange-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(234,88,12,0.4)]">Premium V8 Galerija</h2>
               </div>
               <div className="w-full max-w-4xl mx-auto aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 relative group bg-black shadow-inner">
                  <img src={gallery[activeGalleryIndex]?.url} alt="Main Enhancer Reference" loading="lazy" className="w-full h-full object-cover transition-opacity duration-1000" />
                  <div className="absolute bottom-6 right-12 z-20 flex justify-center items-center group/tooltip">
                      <span className="absolute bottom-full mb-3 px-4 py-2 bg-[#0a0a0a] border border-blue-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-all shadow-xl pointer-events-none">DODAJ SLIKU</span>
                      <button type="button" title={isVIP ? "DODAJ SLIKU" : "ZAKLJUČANO"} disabled={!isVIP} onClick={() => { const imgUrl = gallery[activeGalleryIndex]?.url; setUploadedImage(imgUrl); setDemoInput(prev => prev ? `${imgUrl} ${prev}` : imgUrl); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-3.5 bg-blue-600 rounded-xl text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] ${isVIP ? 'hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}><UploadCloud className="w-5 h-5" /></button>
                  </div>
               </div>
               <div className="flex flex-wrap justify-center gap-4 pb-4 pt-2 w-full max-w-5xl mx-auto">
                  {gallery.map((img, idx) => (
                     <button key={img.id} type="button" disabled={!isVIP} onClick={() => setActiveGalleryIndex(idx)} className={`relative w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeGalleryIndex === idx ? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(234,88,12,0.5)] opacity-100' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'} ${!isVIP ? 'cursor-not-allowed' : ''}`}>
                        <img src={img.url} loading="lazy" className="w-full h-full object-cover" alt="Thumbnail" />
                        {activeGalleryIndex === idx && <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl pointer-events-none"></div>}
                     </button>
                  ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* --- V8 IPS MODAL ZA PLAĆANJE --- */}
      <AnimatePresence>
        {ipsModalData && (
          <div className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-[#0a0a0a] border border-orange-500/40 rounded-[2.5rem] max-w-md w-full relative text-zinc-100 font-sans shadow-[0_0_60px_rgba(234,88,12,0.15)] overflow-hidden">
              <button onClick={() => setIpsModalData(null)} className="absolute top-5 right-5 bg-white/5 p-2.5 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all z-10"><X size={20} strokeWidth={3} /></button>
              <div className="p-10 flex flex-col items-center">
                <h3 className="text-[18px] font-black uppercase tracking-widest mb-2 text-orange-500 flex items-center gap-3"><Zap className="w-5 h-5" /> Instrukcije za uplatu</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6">Paket: {ipsModalData.tip}</p>
                <div className="w-52 h-52 bg-white p-3 rounded-3xl mb-5 flex items-center justify-center border-4 border-dashed border-orange-500/30 shadow-inner overflow-hidden relative">
                  <QRCodeCanvas value={`K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:RSD${ipsModalData.cena},00|SF:289|S:${ipsModalData.tip}|RO:V8-ENHANCER`} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"M"} includeMargin={false} />
                </div>
                <div className="text-[10px] font-black bg-orange-500/10 border border-orange-500/20 text-orange-400 px-5 py-2.5 rounded-full uppercase tracking-widest mb-10 shadow-lg">Skeniraj m-banking aplikacijom</div>
                <div className="w-full bg-[#050505] border border-white/10 rounded-2xl p-6 space-y-4 text-[13px] font-mono shadow-inner">
                  <div className="flex justify-between border-b border-white/5 pb-3"><span className="text-zinc-500 uppercase">Primalac:</span><span className="font-bold text-white text-right">Goran Damnjanović</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-3"><span className="text-zinc-500 uppercase">Račun:</span><span className="font-bold text-white text-[11px] md:text-[13px]">265-0000006535770-83</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-3"><span className="text-zinc-500 uppercase">Svrha:</span><span className="font-bold text-white text-right truncate pl-4" title={ipsModalData.tip}>{ipsModalData.tip}</span></div>
                  <div className="flex justify-between pt-2"><span className="text-zinc-500 uppercase">Iznos:</span><span className="font-black text-orange-500 text-[18px] drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]">{ipsModalData.cena.toLocaleString('sr-RS')} RSD</span></div>
                </div>
                <div className="mt-8 w-full bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-xl p-4 text-center shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                  <p className="text-[12px] md:text-[13px] text-zinc-200 font-bold leading-relaxed mb-1">Nakon uplate, pošaljite nam dokaz na email:</p>
                  <a href="mailto:aitoolsprosmart@gmail.com" className="block text-[14px] md:text-[16px] text-orange-400 font-black tracking-widest hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(234,88,12,0.8)] my-2">aitoolsprosmart@gmail.com</a>
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Sistem će vam odmah otključati pristup! 🚀</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default V8Enhancer10x;
/// KRAJ FUNKCIJE: V8Enhancer10x ///