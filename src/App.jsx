import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  PlayCircle, Sparkles, Youtube, X, ChevronLeft, ChevronRight, Award, 
  ArrowRight, Maximize, Edit, Loader2, ShieldAlert, Trash2, UploadCloud,
  Dices, Eye, MousePointerClick, Clock, Users, Zap, HelpCircle, ChevronDown,
  ChevronUp, Activity, BarChart
} from 'lucide-react';

// --- ANIMACIJE ---
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit, addDoc, deleteDoc, doc } from "firebase/firestore";

import * as data from './data';
import { 
  TypewriterText, UniversalVideoPlayer, 
  MatrixRain, TutorialCard, FormattedDescription 
} from './data';
import mojBaner from './moj-baner.png'; 

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  window.scrollTo(0, 0);
}

const BASE_BACKEND_URL = "https://aitoolsprosmart-becend-production.up.railway.app"; 
const API_URL = `${BASE_BACKEND_URL}/api/products`;

// --- V8 SYSTEM CONFIG ---
const MOJA_IP = "213.196.99.10"; 
const YOUTUBE_API_KEY = "AIzaSyCwy46TsBPW7LxKTjExhQbHhYhq8lyc2YM"; 

let globalUserIp = "";
const currentSessionId = Math.random().toString(36).substring(2, 15);

const fetchUserIp = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    globalUserIp = data.ip;
  } catch (err) { console.warn("IP tracking offline"); }
};
fetchUserIp();

export const logAnalyticsEvent = async (type, details) => {
  if (globalUserIp === MOJA_IP || globalUserIp === "") return; 
  try {
    await addDoc(collection(db, "analytics"), {
      type, ...details, timestamp: Date.now(), sessionId: currentSessionId
    });
  } catch (err) {}
};

// --- V8 CINEMATIC LOADER (REACT SPRING ANIMATED) ---
const FullScreenBoot = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800); 
          return 100;
        }
        return p + Math.floor(Math.random() * 5) + 1; 
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  const { offset, percent } = useSpring({
    offset: circumference - (Math.min(progress, 100) / 100) * circumference,
    percent: Math.min(progress, 100),
    config: { tension: 120, friction: 14 }
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-8">
        <svg className="w-56 h-56 transform -rotate-90 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <animated.circle 
            cx="70" cy="70" r={radius} 
            fill="transparent" stroke="#ea580c" strokeWidth="3" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
          />
        </svg>
        <img src={data.logoUrl} alt="Logo" className={`absolute w-16 h-16 object-contain transition-all duration-1000 ${progress >= 100 ? 'scale-125 drop-shadow-[0_0_30px_rgba(234,88,12,1)]' : 'animate-pulse'}`} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="text-orange-600 font-black uppercase tracking-[0.6em] text-[13px] drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]">V8 Sistem se Pokreće</div>
        <div className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
          <span>USPOSTAVLJANJE VEZE</span>
          <animated.span className="text-orange-500 font-black min-w-[30px]">
            {percent.to(n => `${Math.floor(n)}%`)}
          </animated.span>
        </div>
      </div>
    </div>
  );
};

const getRibbonStyle = (index) => {
  if (index === 0) return "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.7)]";
  const colors = ["bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]", "bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]", "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]", "bg-pink-600 shadow-[0_0_15px_rgba(219,39,119,0.5)]", "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"];
  return colors[Math.max(0, index - 1) % colors.length];
};

const MarketplaceCard = ({ app, index }) => {
  const isVideo = app.media?.[0]?.type === 'video' || app.media?.[0]?.url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const displayUrl = isVideo ? `${app.media[0].url}#t=0.001` : (app.media?.[0]?.url || data.bannerUrl);
  const ribbonClass = getRibbonStyle(index);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const handlePlay = (e) => { e.preventDefault(); e.stopPropagation(); setIsPlaying(true); if (videoRef.current) { videoRef.current.muted = false; videoRef.current.currentTime = 0; videoRef.current.play(); } };
  
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative rounded-[2.5rem] p-[2px] bg-gradient-to-br from-orange-500 to-blue-600 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] flex flex-col h-full"
    >
      <div className="bg-[#0a0a0a] rounded-[2.4rem] p-5 flex flex-col h-full relative overflow-hidden">
        {app.type && (
          <div className="absolute top-8 -right-14 w-52 text-center rotate-45 z-30 pointer-events-none drop-shadow-2xl">
            {app.type === 'THE MOST UNIQUE PHOTOREALISTIC IMAGE EVER' ? (
                <div className="py-2.5 w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border border-orange-400">UNIKATNA SLIKA</div>
            ) : (
                <div className={`py-2 w-full text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ${ribbonClass}`}>{app.type}</div>
            )}
          </div>
        )}
        <div className="relative mb-6">
          <div className="aspect-video relative rounded-[2rem] overflow-hidden bg-black border-2 border-blue-500 shrink-0 block group-hover:border-blue-400 transition-colors">
            {isVideo ? (
               <>
                 <video ref={videoRef} src={displayUrl} className={`w-full h-full object-cover transition-all duration-700 ${!isPlaying ? 'opacity-80 group-hover:opacity-100 group-hover:scale-105' : 'opacity-100'}`} playsInline controls={isPlaying} onEnded={() => setIsPlaying(false)} />
                 {!isPlaying && (<button type="button" onClick={handlePlay} className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 bg-black/20 cursor-pointer"><PlayCircle className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" /></button>)}
               </>
            ) : (
               <Link to={`/app/${app.id}`} className="block w-full h-full">
                 <img src={displayUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={app.name} />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 bg-black/20"><PlayCircle className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" /></div>
               </Link>
            )}
          </div>
          <div className="absolute top-4 -left-[2px] bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-r-xl z-20 shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400 border-l-0">{app.category || 'AI SREDSTVO'}</div>
        </div>
        <div className="flex-1 flex flex-col px-2 pb-2">
           <div className="flex justify-between items-start mb-2">
              <Link to={`/app/${app.id}`} className="flex-1 pr-4 hover:opacity-80"><h3 className="text-white font-black text-[18px] md:text-[20px] uppercase tracking-tighter line-clamp-2 leading-tight mb-2 group-hover:text-orange-500 transition-colors">{app.name}</h3></Link>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shrink-0 ml-2"><span className="text-white font-black text-[14px]">${app.price || '14.99'}</span></div>
           </div>
           {app.headline && <p className="text-zinc-400 text-[12px] font-medium leading-relaxed line-clamp-2 mb-6 mt-3">{app.headline}</p>}
           <Link to={`/app/${app.id}`} className="mt-auto w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex justify-center items-center gap-2">POGLEDAJ VIŠE DETALJA <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </motion.div>
  );
};

const SmartScrollButton = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => { 
    const checkScroll = () => setIsScrolled(window.scrollY > 400); 
    window.addEventListener('scroll', checkScroll); 
    return () => window.removeEventListener('scroll', checkScroll); 
  }, []);
  const smoothSlowScroll = (targetY) => {
    if (window.isAutoScrolling) { window.isAutoScrolling = false; return; }
    window.isAutoScrolling = true;
    const startY = window.scrollY;
    const difference = targetY - startY;
    const duration = Math.max(Math.abs(difference) * 1.8, 1000); 
    let startTime = null;
    const abortScroll = () => { window.isAutoScrolling = false; };
    const step = (currentTime) => {
      if (!window.isAutoScrolling) return;
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percent = Math.min(progress / duration, 1);
      const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
      window.scrollTo(0, startY + difference * easeInOutSine(percent));
      if (progress < duration) window.requestAnimationFrame(step);
      else abortScroll();
    };
    window.requestAnimationFrame(step);
  };
  const handleAction = () => { if (isScrolled) smoothSlowScroll(0); else smoothSlowScroll(document.body.scrollHeight - window.innerHeight); };
  return (
    <button onClick={handleAction} className="fixed bottom-10 right-6 z-[5000] flex flex-col items-center group transition-all duration-500">
      <div className={`w-1.5 rounded-full transition-all duration-700 flex items-center justify-center ${isScrolled ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] h-16' : 'bg-white/20 h-10 hover:bg-white/40'}`}>
        <div className={`transition-transform duration-700 text-white ${isScrolled ? 'rotate-0' : 'rotate-180'}`}><ChevronUp size={14} strokeWidth={4} /></div>
      </div>
    </button>
  );
};

const WelcomeBanner = ({ onClose }) => (
  <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-[#0a0a0a] border border-orange-500/50 rounded-[2rem] max-w-2xl w-full overflow-hidden shadow-2xl relative text-zinc-100 text-center font-sans"
    >
      <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:text-orange-500 transition-all z-10"><X size={20} /></button>
      <img src={mojBaner} alt="Welcome" className="w-full h-48 object-cover border-b border-orange-500/20" />
      <div className="p-8">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest mb-4">Dobrodošli u <span className="text-orange-500">V8 PRO SMART</span></h2>
        <p className="text-zinc-400 text-xs md:text-sm mb-8 uppercase tracking-[0.2em] leading-relaxed">Centralizovani sistem za Premium AI Arhitekturu je sada NA MREŽI.</p>
        <button onClick={onClose} className="bg-orange-600 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-orange-500 transition-all shadow-lg">Uđi u Sistem</button>
      </div>
    </motion.div>
  </div>
);

const OptionButton = ({ label, selected, onClick, type }) => {
  const isQuality = type === 'quality';
  const activeClass = isQuality ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]";
  return <button type="button" onClick={onClick} className={`px-4 py-2 rounded-lg text-[9px] font-black border transition-all ${selected ? activeClass : "bg-black border-white/10 text-zinc-500 hover:border-white/20 hover:text-white"}`}>{label}</button>;
};

const PromptResultBox = ({ type, text, copiedBox, onCopy }) => {
  let title = type.toUpperCase();
  let icon = null;
  let containerClass = "gsap-result-box w-full bg-[#0a0a0a]/40 backdrop-blur-xl border rounded-2xl p-6 pb-20 relative flex flex-col h-full min-h-[250px] transition-all duration-500 hover:-translate-y-1 group ";
  let labelClass = "text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-4 border-b pb-3 flex items-center transition-colors duration-500 ";
  let buttonClass = "absolute bottom-6 right-6 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg ";

  if (type === 'uniquePhoto') {
    title = 'NAJUNIKATNIJA FOTOREALISTIČNA SLIKA IKADA';
    icon = <Zap className="w-4 h-4 mr-2 text-amber-500 group-hover:animate-pulse" />;
    containerClass += "border-amber-400/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:border-amber-400/60";
    labelClass += "text-amber-400 border-amber-400/20 group-hover:border-amber-400/50";
    buttonClass += "bg-gradient-to-r from-amber-600 to-orange-600 text-black hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:scale-105";
  } else if (type === 'abstract') {
    title = 'VRHUNSKO APSTRAKTNO REMEK-DELO';
    icon = <Sparkles className="w-4 h-4 mr-2 text-purple-400 group-hover:animate-pulse" />;
    containerClass += "border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.1)] hover:shadow-[0_10px_30px_rgba(147,51,234,0.25)] hover:border-purple-500/60";
    labelClass += "text-purple-400 border-purple-500/20 group-hover:border-purple-500/50";
    buttonClass += "bg-gradient-to-r from-purple-700 to-purple-500 text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-105";
  } else if (type === 'cinematic') {
    title = 'EPSKI HOLIVUDSKI KINEMATOGRAFSKI KADAR';
    icon = <PlayCircle className="w-4 h-4 mr-2 text-blue-400 group-hover:animate-pulse" />;
    containerClass += "border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:border-blue-500/60";
    labelClass += "text-blue-400 border-blue-500/20 group-hover:border-blue-500/50";
    buttonClass += "bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:scale-105";
  } else if (type === 'photoreal') {
    title = 'BESPREKORAN NEXT-GEN FOTOREALISTIČNI RENDER';
    icon = <Eye className="w-4 h-4 mr-2 text-emerald-400 group-hover:animate-pulse" />;
    containerClass += "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:border-emerald-500/60";
    labelClass += "text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/50";
    buttonClass += "bg-gradient-to-r from-emerald-700 to-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:scale-105";
  } else {
    containerClass += "border-white/5 shadow-inner bg-black";
    labelClass += "text-zinc-500 border-white/5";
    buttonClass += "bg-white/10 text-white hover:bg-white/20";
  }

  return (
    <div className={containerClass}>
      <label className={labelClass}>{icon}{title}</label>
      <div className="w-full font-mono text-[11px] md:text-[13px] leading-relaxed text-left flex-1 text-zinc-200 whitespace-pre-wrap mt-2">
        {text ? <TypewriterText text={text} speed={8} /> : "ČEKAM UNOS U JEZGRO..."}
      </div>
      {text && (
        <button type="button" onClick={() => onCopy(text, type)} className={buttonClass}>
          {copiedBox === type ? "Kopirano! ✓" : "Kopiraj Prompt"}
        </button>
      )}
    </div>
  );
};

function EnhancerPage() {
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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [exclusiveWarning, setExclusiveWarning] = useState('');
  const [gallery, setGallery] = useState([]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const containerRef = useRef();

  useGSAP(() => {
    if (generatedPrompts.abstract) {
      gsap.from('.gsap-result-box', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        clearProps: 'all'
      });
    }
  }, { dependencies: [generatedPrompts.abstract], scope: containerRef });

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snapshot = await getDocs(collection(db, "enhancer_gallery"));
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => b.createdAt - a.createdAt);
        setGallery(items);
      } catch (err) {}
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const interval = setInterval(() => {
      setActiveGalleryIndex((prev) => (prev + 1) % gallery.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [gallery.length]);

  const handleClearAll = () => {
    setCustomerPrompt(''); setDemoInput('');
    setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' });
    setIsScanning(false); setUploadedImage(null);
  };

  const handleRollDice = (e) => { 
    if (e) e.preventDefault();
    if (customerPrompt.trim() !== "") { setExclusiveWarning("Moraš prvo očistiti polje 'Nalepi Korisnički Prompt'."); return; }
    setIsRolling(true);
    const prompts = data.DICE_PROMPTS || [];
    if (prompts.length > 0) {
      const randomText = prompts[Math.floor(Math.random() * prompts.length)];
      setDemoInput(''); 
      setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }); 
      setTimeout(() => { setDemoInput(randomText); setIsRolling(false); }, 300);
    }
  };

  const handleImageUpload = async (e) => {
    if (customerPrompt.trim() !== "") { setExclusiveWarning("Moraš prvo očistiti polje 'Nalepi Korisnički Prompt'."); return; }
    if (uploadedImage) { setShowWarningModal(true); return; }
    const file = e.target.files[0]; if (!file) return;
    setIsImageUploading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json();
      setUploadedImage(resData.secure_url);
      setDemoInput(prev => prev ? `${resData.secure_url} ${prev}` : resData.secure_url);
    } catch (err) {} finally { setIsImageUploading(false); }
  };
  
  const handleEnhance = (e, boxType) => {
    if (e) e.preventDefault();
    const rawInput = (customerPrompt || demoInput || "").trim(); 
    if(!rawInput) return; 
    if (customerPrompt.trim() !== "" && boxType === 'prompt') setIsScanning(true);
    setIsEnhancing(true); 
    setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' });
    logAnalyticsEvent('enhancer_action', { input: rawInput, actionType: boxType, aspectRatio: selectedAR });
    setTimeout(() => { 
      try { 
        const std = { single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }; 
        let cleanInput = rawInput;
        let detectedBadFormat = false;
        if (/\[.*?\]|--\w+/.test(rawInput)) {
            detectedBadFormat = true;
            cleanInput = rawInput.replace(/\[.*?\]:?/g, '').replace(/--\w+(?:\s+[^\s]+)?/g, '').replace(/\s{2,}/g, ' ').trim();
        }
        const lowerInput = cleanInput.toLowerCase();
        let missingLighting = !/(light|sun|glow|shadow|dark|illuminat|bright|ray|hour|overcast|moody)/i.test(lowerInput);
        let missingCamera = !/(shot on|camera|lens|mm|f\/\d|canon|nikon|sony|arri|red|fujifilm|hasselblad|leica|optics)/i.test(lowerInput);
        const isPortrait = /(man|woman|face|portrait|person|girl|boy|people|human)/i.test(lowerInput);
        const isLandscape = /(landscape|mountain|nature|forest|ocean|cityscape|valley|cliff|sky)/i.test(lowerInput);
        const isMacro = /(macro|close up|insect|jewelry|watch|eye|tiny|detail)/i.test(lowerInput);
        const getRand = (arr, fallback) => (arr && arr.length > 0) ? arr[Math.floor(Math.random() * arr.length)] : fallback;
        let selCamera, selLens, selLight, metaTokens;
        if (isPortrait) {
            selCamera = getRand(["Canon EOS R5", "Sony A7R IV", "Leica M11", "Hasselblad X2D 100C"], "Canon EOS R5");
            selLens = getRand(["85mm f/1.4", "50mm f/1.2"], "85mm f/1.4");
            selLight = getRand(["rembrandt lighting", "soft softbox lighting"], "soft softbox lighting");
            metaTokens = getRand(["fashion editorial, Vogue cover", "ultra-sharp eye focus"], "fashion editorial");
        } else if (isLandscape) {
            selCamera = getRand(["Phase One XF IQ4 150MP", "Fujifilm GFX 100"], "Phase One XF IQ4 150MP");
            selLens = getRand(["14mm f/2.8", "24mm f/1.4"], "14mm f/2.8");
            selLight = getRand(["golden hour volumetric lighting", "blue hour ambient"], "golden hour volumetric lighting");
            metaTokens = getRand(["National Geographic award winner"], "National Geographic award winner");
        } else {
            selCamera = getRand(data.CAMERA_TOKENS, "ARRI Alexa 65");
            selLens = getRand(data.LENS_TOKENS, "Zeiss Master Prime 50mm T1.3");
            selLight = getRand(data.LIGHTING_TOKENS, "cinematic lighting");
            metaTokens = getRand(["IMAX 70mm film scan"], "IMAX 70mm film scan");
        }
        const tokRealism = data.getRandomTokens(data.REALISM_TOKENS, 3);
        const tokPhysics = data.getRandomTokens(data.PHYSICS_TOKENS, 3);
        const tokOptics = data.getRandomTokens(data.OPTICS_TOKENS, 2);
        const tokRender = data.getRandomTokens(data.AI_RENDER_TOKENS, 3);
        const uniqueMeta = data.getRandomTokens(data.THE_MOST_UNIQUE_PHOTOREALISTIC_TOKENS, 2);
        const noTextInstruction = "Absolutely NO text, NO letters, NO watermarks, NO signatures. Pure visual composition only.";
        const enhanced10x = `${uploadedImage ? `${uploadedImage} ` : ""}A breathtaking capture of: ${cleanInput}. Shot on ${selCamera} paired with ${selLens}. ${selLight}. Protocols: ${tokRealism}, ${tokPhysics}, ${tokOptics}, ${tokRender}. ${metaTokens}, ${uniqueMeta}. ${noTextInstruction}. [Aspect Ratio: ${selectedAR}]`;
        if (boxType === 'prompt') {
            let roastMsgs = [];
            if (detectedBadFormat) roastMsgs.push("- Vaš format je bio neefikasan; izbrisao sam zagrade i šum.");
            if (missingLighting) roastMsgs.push("- Ignorisali ste osvetljenje; ubacio sam precizne volumetrijske protokole.");
            if (missingCamera) roastMsgs.push("- Nije definisan optički sistem; dodao sam specifična sočiva za realističnu dubinu.");
            const roastIntro = `/// V8 AI EKSPERTSKA ANALIZA ///\n\n🟢 ŠTA JE DOBRO:\nVizija je solidna.\n\n🔴 ŠTA JE LOŠE:\n${roastMsgs.length > 0 ? roastMsgs.join('\n') : "Nedostaje standardna tehnička dubina."}\n\n🚀 V8 10X FINALNI PROMPT:\n\n`;
            std.single = roastIntro + enhanced10x;
        } else { std.single = ''; }
        const detailedPrompts = data.generateDetailedPrompts ? data.generateDetailedPrompts(cleanInput + ". " + noTextInstruction, selectedAR) : null;
        if (detailedPrompts) {
          std.cinematic = detailedPrompts.cinematic + ` [Aspect Ratio: ${selectedAR}]`;
          std.abstract = detailedPrompts.abstract + ` [Aspect Ratio: ${selectedAR}]`;
          std.photoreal = detailedPrompts.photoreal + ` [Aspect Ratio: ${selectedAR}]`;
          std.uniquePhoto = detailedPrompts.uniquePhoto + ` [Aspect Ratio: ${selectedAR}]`;
        }
        if (boxType === 'concept') std.uniquePhoto = enhanced10x;
        setGeneratedPrompts(std); 
      } catch (err) {} finally { setIsEnhancing(false); setIsScanning(false); } 
    }, 2500); 
  };
  const handleCopy = (text, boxName) => { 
    let copyText = text; if (text.includes("🚀 V8 10X FINALNI PROMPT:\n\n")) copyText = text.split("🚀 V8 10X FINALNI PROMPT:\n\n")[1];
    navigator.clipboard.writeText(copyText); setCopiedBox(boxName); setTimeout(() => setCopiedBox(''), 2000); 
  };
  
  return (
    <div ref={containerRef} className="pt-32 pb-24 px-6 max-w-[1600px] mx-auto font-sans text-left text-white min-h-screen relative">
      <style>{`
        @keyframes scanLineAmber { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-amber { position: absolute; left: 0; width: 100%; height: 2px; background: #fbbf24; box-shadow: 0 0 25px 3px #fbbf24; z-index: 50; animation: scanLineAmber 2.5s infinite; }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .text-gradient-animate { background-size: 200% auto; animation: gradientMove 4s ease infinite; }
      `}</style>
      <Helmet><title>10X ENHANCER | AI TOOLS PRO SMART</title></Helmet>
      <div className="mb-8 relative z-10"><Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 uppercase text-[10px] font-black tracking-widest transition-all w-fit"><ChevronLeft className="w-4 h-4" /> Sistemski Registar</Link></div>
      <div className="mb-12 text-left lg:text-center w-full relative z-10 flex flex-col items-start lg:items-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 text-gradient-animate drop-shadow-[0_0_15px_rgba(234,88,12,0.3)]">10X PROMPT ENHANCER</h1>
        <div className="text-[12px] md:text-[14px] font-black text-green-400 uppercase tracking-[0.2em] flex items-center flex-wrap gap-3 justify-center text-center">
          <span className="relative flex h-3 w-3 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          Premium 3-u-1 alat vredan 200$/mesečno. SAMO 12.000 RSD DOŽIVOTNO.
        </div>
        <p className="text-white text-[12px] md:text-[14px] max-w-2xl font-bold uppercase tracking-[0.2em] leading-relaxed mt-6">PREMIUM AI SISTEM ZA INŽENJERING PROMPTOVA. PRETVORI JEDNOSTAVNE IDEJE ILI SLIKU U REMEK-DELA.</p>
        <a href="#" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all mt-4 w-fit">KUPI SAD</a>
      </div>
      <div className="flex flex-col gap-12 w-full items-stretch relative z-10">
         <div className="bg-[#0a0a0a]/50 backdrop-blur-md border border-blue-500/30 rounded-[2.5rem] p-8 md:p-12 relative flex flex-col gap-10 hover:border-blue-500/60 group">
            <div className="w-full text-center border-b border-blue-500/20 pb-6 mb-2"><h2 className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase text-blue-400 tracking-wider">PRETVORI SVOJE IDEJE, BACI KOCKICE, ILI OTPREMI SLIKU</h2></div>
            <div className="w-full flex flex-col lg:flex-row gap-8">
               <div className="w-full lg:w-1/3 flex flex-col justify-start text-left">
                 <label className="text-[14px] md:text-[16px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2 mb-3"><PlayCircle className="w-5 h-5" /> Koncept / Subjekat</label>
                 <p className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest mb-6">Unesi svoju osnovnu ideju ili baci V8 Kockice.</p>
               </div>
               <div className="w-full lg:w-2/3 relative flex flex-col rounded-2xl border border-white/10 bg-[#050505]/50 focus-within:border-blue-500/50">
                 {uploadedImage && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg overflow-hidden border border-blue-500/50 z-20 group/img"><img src={uploadedImage} alt="Ref" className="w-full h-full object-cover" /><button type="button" onClick={() => { setUploadedImage(null); setDemoInput(prev => prev.replace(uploadedImage, '').trim()); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button></div>}
                 <textarea value={demoInput} spellCheck="false" data-gramm="false" data-lt-active="false" onChange={e => { if (customerPrompt.trim() !== "") { setExclusiveWarning("Moraš prvo očistiti polje 'Nalepi Korisnički Prompt'."); return; } setDemoInput(e.target.value); setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }); }} placeholder="npr. 'zlatni sat' ili Otpremi Sliku" className={`w-full flex-1 bg-transparent pr-28 py-4 text-white text-[16px] font-medium outline-none resize-none min-h-[100px] ${uploadedImage ? 'pl-20' : 'pl-6'}`} />
                 {!demoInput && customerPrompt.length === 0 && <label className="absolute right-16 top-1/2 -translate-y-1/2 bg-blue-600/10 p-3 rounded-xl hover:bg-blue-600 transition-all cursor-pointer z-10">{isImageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5 text-blue-500" />}<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>}
                 {!demoInput && customerPrompt.length === 0 && <button type="button" onClick={handleRollDice} disabled={isRolling} className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600/10 p-3 rounded-xl hover:bg-blue-600 cursor-pointer z-10"><Dices className={`w-5 h-5 text-blue-500 ${isRolling ? 'animate-spin' : ''}`} /></button>}
                 {demoInput && <button type="button" onClick={handleClearAll} className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600/10 p-3 rounded-xl hover:bg-red-600 cursor-pointer z-10"><X className="w-5 h-5 text-red-500" /></button>}
               </div>
            </div>
            <div className="w-full flex flex-col border-t border-blue-500/20 pt-8">
               <label className="text-[10px] md:text-[12px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2 mb-6 border-b border-blue-500/20 pb-4"><Sparkles className="w-4 h-4 mr-1" /> Izlaz V8 Kinematografskog Sistema</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full text-left">
                   {['abstract', 'cinematic', 'photoreal', 'uniquePhoto'].map((type) => (<PromptResultBox key={type} type={type} text={generatedPrompts[type]} copiedBox={copiedBox} onCopy={handleCopy} />))}
               </div>
            </div>
            <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 mt-4 border-t border-blue-500/20 pt-8">
               <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto text-left">
                  <div className="flex flex-col gap-4"><span className="text-[12px] font-black uppercase text-zinc-300">ODNOS STRANICA</span><div className="flex flex-wrap gap-2">{['1:1', '9:16', '16:9', '21:9'].map(ar => <OptionButton key={`ar-${ar}`} label={ar} selected={selectedAR === ar} onClick={() => setSelectedAR(ar)} type="ar" />)}</div></div>
                  <div className="flex flex-col gap-4"><span className="text-[12px] font-black uppercase text-zinc-300">KVALITET</span><div className="flex flex-wrap gap-2">{['1x', '2x', '4x'].map(q => <OptionButton key={`q-${q}`} label={q} selected={selectedQuality === q} onClick={() => setSelectedQuality(q)} type="quality" />)}</div></div>
               </div>
               <button type="button" onClick={(e) => handleEnhance(e, 'concept')} disabled={isEnhancing || (!demoInput && !customerPrompt)} className="w-full lg:w-[30%] bg-gradient-to-r from-blue-700 to-blue-500 text-white py-6 rounded-2xl font-black uppercase text-[14px] transition-all flex items-center justify-center shadow-lg cursor-pointer">{isEnhancing ? <Loader2 className="w-6 h-6 animate-spin mr-4" /> : "Poboljšaj Kinematografski Koncept"}</button>
            </div>
         </div>
         <div className="bg-[#0a0a0a]/50 backdrop-blur-md border border-amber-400/30 rounded-[2.5rem] p-8 md:p-12 hover:border-amber-400/60 group">
            <div className="w-full text-center border-b border-amber-400/20 pb-6 mb-2"><h2 className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase text-amber-400 tracking-wider">UČINIĆEMO TVOJ PROMPT SAVRŠENIM</h2></div>
            <div className="w-full flex flex-col lg:flex-row gap-8">
               <div className="w-full lg:w-1/3 text-left">
                 <label className="text-[14px] md:text-[16px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 mb-3"><Zap className="w-5 h-5" /> Nalepi Korisnički Prompt</label>
                 <p className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-widest mb-6">Nalepi sirovi prompt da bismo ga rekonstruisali.</p>
               </div>
               <div className="w-full lg:w-2/3 relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505]/50 focus-within:border-amber-400/50">
                 {isScanning && customerPrompt.trim() !== "" && <div className="animate-scan-amber" />}
                 <textarea value={customerPrompt} spellCheck="false" data-gramm="false" data-lt-active="false" onChange={e => { if (demoInput.trim() !== "" || uploadedImage) { setExclusiveWarning("Moraš prvo očistiti polje 'Koncept / Subjekat'."); return; } setCustomerPrompt(e.target.value); setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }); }} placeholder="NALEPI SVOJ SIROVI PROMPT OVDE" className="w-full flex-1 bg-transparent p-6 text-white text-[12px] md:text-[14px] outline-none resize-none min-h-[160px]" />
                 {customerPrompt && <button type="button" onClick={() => { setCustomerPrompt(''); setGeneratedPrompts({ single: '', abstract: '', cinematic: '', photoreal: '', uniquePhoto: '' }); setIsScanning(false); }} className="absolute right-4 top-4 bg-red-600/10 p-2.5 rounded-xl hover:bg-red-600 cursor-pointer"><Trash2 className="w-4 h-4 text-red-500 animate-pulse" /></button>}
               </div>
            </div>
            <div className="w-full flex flex-col border-t border-amber-400/20 pt-8">
               <label className="text-[10px] md:text-[12px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-2 mb-6 border-b border-amber-400/20 pb-4"><Eye className="w-4 h-4 mr-1" /> Izlaz V8 Matrice</label>
               <div className="w-full bg-[#0a0a0a]/50 border border-amber-400/20 rounded-[2rem] p-6 pb-20 relative min-h-[300px]">
                 <div className="text-amber-400 font-black text-[12px] uppercase mb-6 border-b border-amber-400/10 pb-4 flex items-center gap-3"><Zap className="w-4 h-4" /> Premium Unikatni Izlaz Matrice</div>
                 <div className="w-full font-mono text-[11px] md:text-[13px] leading-relaxed text-left text-zinc-200 whitespace-pre-wrap">{generatedPrompts.single ? <TypewriterText text={generatedPrompts.single} speed={10} /> : "ČEKAM UNOS U JEZGRO..."}</div>
                 {generatedPrompts.single && <button type="button" onClick={() => handleCopy(generatedPrompts.single, 'single')} className="absolute bottom-6 right-6 px-6 py-3 rounded-xl text-[11px] font-black uppercase bg-amber-400/10 border border-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black">Kopiraj 10X Prompt</button>}
               </div>
            </div>
            <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 mt-4 border-t border-amber-400/20 pt-8">
               <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto text-left"><div className="flex flex-col gap-4"><span className="text-[12px] font-black text-amber-100 uppercase">KVALITET</span><div className="flex flex-wrap gap-2">{['1x', '2x', '4x'].map(q => <OptionButton key={`q2-${q}`} label={q} selected={selectedQuality === q} onClick={() => setSelectedQuality(q)} type="quality" />)}</div></div></div>
               <button type="button" onClick={(e) => handleEnhance(e, 'prompt')} disabled={isEnhancing || (!demoInput && !customerPrompt)} className="w-full lg:w-[30%] bg-gradient-to-r from-amber-600 to-amber-500 text-black py-6 rounded-2xl font-black uppercase text-[14px] shadow-lg cursor-pointer">{isEnhancing ? <Loader2 className="w-6 h-6 animate-spin mr-4" /> : "Poboljšaj Unikatni Prompt"}</button>
            </div>
         </div>

         {/* BOKS 3: REFERENCE GALERIJA */}
         {gallery.length > 0 && (
           <div className="bg-[#0a0a0a]/50 backdrop-blur-md border border-orange-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] relative flex flex-col gap-6 transition-all duration-500 hover:border-orange-500/60 mt-4 text-center items-center">
             <div className="flex items-center justify-center gap-3 border-b border-orange-500/20 pb-4 mb-4 w-full">
               <Zap className="w-6 h-6 text-orange-500 animate-pulse" />
               <h2 className="text-xl md:text-2xl font-black text-orange-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(234,88,12,0.4)]">Premium V8 Galerija</h2>
             </div>
             <div className="w-full max-w-4xl mx-auto aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 relative group bg-black shadow-inner">
                <img src={gallery[activeGalleryIndex]?.url} alt="Main Enhancer Reference" className="w-full h-full object-cover transition-opacity duration-1000" />
                <div className="absolute bottom-6 right-12 z-20 flex justify-center items-center group/tooltip">
                    <span className="absolute bottom-full mb-3 px-4 py-2 bg-[#0a0a0a] border border-blue-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-all shadow-xl pointer-events-none">Koristi kao Sliku za Prompt</span>
                    <button type="button" onClick={() => { if (uploadedImage) { setShowWarningModal(true); return; } const imgUrl = gallery[activeGalleryIndex]?.url; setUploadedImage(imgUrl); setDemoInput(prev => prev ? `${imgUrl} ${prev}` : imgUrl); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3.5 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:scale-110 cursor-pointer"><UploadCloud className="w-5 h-5" /></button>
                </div>
             </div>
             <div className="flex flex-wrap justify-center gap-4 pb-4 pt-2 w-full max-w-5xl mx-auto">
                {gallery.map((img, idx) => (
                   <button key={img.id} type="button" onClick={() => setActiveGalleryIndex(idx)} className={`relative w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeGalleryIndex === idx ? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(234,88,12,0.5)] opacity-100' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}`}>
                      <img src={img.url} className="w-full h-full object-cover" alt="Thumbnail" />
                      {activeGalleryIndex === idx && <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl pointer-events-none"></div>}
                   </button>
                ))}
             </div>
           </div>
         )}
      </div>

      {/* FRAMER MOTION NA MODALIMA */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-[#0a0a0a] border border-red-500/50 rounded-3xl p-8 max-w-md w-full relative text-center flex flex-col items-center">
              <button type="button" onClick={() => setShowWarningModal(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-black/50 p-2 rounded-full"><X className="w-5 h-5" /></button>
              <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
              <h3 className="text-white font-black text-xl md:text-2xl uppercase mb-3">Akcija Odbijena</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">Prvo ukloni trenutnu sliku.</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-red-600 text-white font-black uppercase text-sm py-4 rounded-xl">Razumem</button>
            </motion.div>
          </div>
        )}
        {exclusiveWarning && (
          <div className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-[#0a0a0a] border border-amber-500/50 rounded-3xl p-8 max-w-md w-full relative text-center flex flex-col items-center">
              <button type="button" onClick={() => setExclusiveWarning('')} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-black/50 p-2 rounded-full"><X className="w-5 h-5" /></button>
              <ShieldAlert className="w-16 h-16 text-amber-500 mb-6" />
              <h3 className="text-white font-black text-xl uppercase mb-3">Akcija Odbijena</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">{exclusiveWarning}</p>
              <button onClick={() => setExclusiveWarning('')} className="w-full bg-amber-600 text-black font-black uppercase text-sm py-4 rounded-xl">Razumem</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomePage({ apps = [] }) {
  const [activeSlide, setActiveSlide] = useState(0); 
  const [liveVideos, setLiveVideos] = useState([]); 
  const [isLoadingVideos, setIsLoadingVideos] = useState(true); 
  const location = useLocation();
  const sortedApps = [...apps].sort((a, b) => Number(b.id) - Number(a.id));
  
  useEffect(() => { 
    let isMounted = true; 
    const fetchVideos = async () => {
      setIsLoadingVideos(true); 
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=UC6ilBUks_oFMSD8CE9qD6lQ&part=snippet,id&order=date&maxResults=8&type=video`);
        const result = await res.json();
        if (isMounted && result?.items?.length > 0) { setLiveVideos(result.items.map(item => ({ title: item.snippet.title, url: `https://www.youtube.com/watch?v=${item.id.videoId}` }))); setIsLoadingVideos(false); }
      } catch (err) { if (isMounted) setIsLoadingVideos(false); }
    }; fetchVideos(); return () => { isMounted = false; };
  }, []);
  
  useEffect(() => { if (location.hash === '#marketplace') { const el = document.getElementById('marketplace'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }, [location]);
  const nextSlide = useCallback(() => setActiveSlide(s => (s + 1) % (data.BANNER_DATA?.length || 1)), []);
  const prevSlide = () => setActiveSlide(s => (s - 1 + (data.BANNER_DATA?.length || 1)) % (data.BANNER_DATA?.length || 1));
  useEffect(() => { const t = setInterval(nextSlide, 7000); return () => clearInterval(t); }, [nextSlide]);
  
  return (
    <>
      <Helmet><title>AI TOOLS PRO SMART | PROMPT GENERATOR</title></Helmet>
      {/* DODATA LINIJA ISPOD BANERA */}
      <div id="home-banner" className="relative w-full h-[85vh] flex items-end overflow-hidden bg-black text-white border-b border-orange-500/20">
        <div className="absolute inset-0 z-0 bg-black">{(data.BANNER_DATA || []).map((item, idx) => (<div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeSlide ? 'opacity-100' : 'opacity-0'} z-0`}><img src={item.image} className="w-full h-full object-cover opacity-80" alt="banner" /></div>))}</div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] to-transparent z-10" />
        <div className="absolute inset-0 z-20 w-full h-full pointer-events-none opacity-40"><MatrixRain /></div>
        <button type="button" onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-40 text-white hover:text-orange-500 transition-all"><ChevronLeft className="w-8 h-8" strokeWidth={3} /></button>
        <button type="button" onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-40 text-white hover:text-orange-500 transition-all"><ChevronRight className="w-8 h-8" strokeWidth={3} /></button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-40">{(data.BANNER_DATA || []).map((_, i) => <button key={i} type="button" onClick={() => setActiveSlide(i)} className={`h-[1px] transition-all duration-500 rounded-full ${i === activeSlide ? 'w-6 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />)}</div>
        <div className="relative z-40 max-w-7xl mx-auto px-6 pb-20 w-full text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-orange-600/90 text-[6px] font-black uppercase mb-4 tracking-widest shadow-lg">{data.BANNER_DATA?.[activeSlide]?.badge}</div>
          <h1 className="text-xl md:text-4xl font-black uppercase mb-1.5 tracking-tighter drop-shadow-2xl">{data.BANNER_DATA?.[activeSlide]?.title}</h1>
          <p className="text-zinc-300 text-[12px] md:text-sm max-w-lg font-medium opacity-90">{data.BANNER_DATA?.[activeSlide]?.subtitle}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12 text-left">
        <div id="protocols" className="flex items-center gap-4 mb-10"><div className="flex items-center gap-2.5 shrink-0"><Youtube className="text-red-600 w-6 h-6" /><h3 className="text-white font-black uppercase text-[20px] tracking-widest italic">Najnoviji Intel Protokoli</h3></div><div className="h-[1px] w-32 bg-gradient-to-r from-red-600/80 to-transparent"></div></div>
        {isLoadingVideos ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">{[...Array(4)].map((_, i) => <div className="animate-pulse bg-[#0a0a0a] rounded-[2.4rem] p-6 h-48" key={i} />)}</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">{liveVideos.map((vid, i) => <TutorialCard key={i} vid={vid} />)}</div>}
        
        <div id="enhancer" className="mb-24 flex flex-col items-center justify-center text-center py-20 border-y border-orange-500/30 scroll-mt-32">
          <div className="bg-orange-600/10 p-4 rounded-full mb-6"><Zap className="w-12 h-12 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" strokeWidth={1.5} /></div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-orange-600 mb-4 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">10X PROMPT ENHANCER</h2>
          <div className="text-[13px] md:text-[15px] font-black text-green-500 uppercase tracking-[0.2em] mb-8">Premium 3-u-1 alat vredan 200$/mesečno. SAMO 12.000 RSD DOŽIVOTNO.</div>
          {/* BOLDOVAN TEKST U BELOJ BOJI */}
          <p className="text-zinc-400 text-[10px] md:text-[12px] max-w-2xl font-medium uppercase tracking-[0.2em] leading-relaxed mb-10 mx-auto">
            <span className="font-black text-white">PRISTUPI PREMIUM AI SISTEMU ZA INŽENJERING PROMPTOVA. PRETVORI JEDNOSTAVNE IDEJE ILI SLIKU U REMEK-DELA.</span>
            <br /><br />
            <span className="text-orange-500 font-black uppercase">UNESI SVOJ PROMPT; MI ĆEMO GA DETALJNO ANALIZIRATI I POBOLJŠATI DA BUDE 10X BOLJI.</span>
          </p>
          
          {/* OBA DUGMETA JEDNO PORED DRUGOG (KUPI SAD i POGLEDAJ STRANICU) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
            <a href="#" target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center">
              KUPI SAD
            </a>
            <Link to="/enxance" className="bg-[#ea580c] hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center">
              POGLEDAJ STRANICU
            </Link>
          </div>
        </div>
        
        <div id="marketplace" className="flex items-center gap-4 mb-6 text-left">
          <div className="flex items-center gap-2.5 shrink-0">
            <Sparkles className="text-blue-500 w-6 h-6" />
            <h3 className="text-white font-black uppercase text-[20px] tracking-widest italic text-left">Premium Prodavnica AI Sredstava</h3>
          </div>
          <div className="h-[1px] w-32 bg-gradient-to-r from-blue-500/80 to-transparent"></div>
        </div>

        {/* UPOZORENJE ZA KUPCE */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-5 mb-10 shadow-[0_0_15px_rgba(37,99,235,0.1)] flex items-start gap-4"
        >
          <HelpCircle className="w-6 h-6 text-blue-500 shrink-0 mt-1 animate-pulse" />
          <p className="text-[11px] md:text-[13px] text-zinc-300 font-medium uppercase tracking-[0.1em] leading-relaxed">
            <span className="text-blue-400 font-black">VAŽNA NAPOMENA:</span> Svi proizvodi iz sekcije Premium Prodavnica AI Sredstava su sajtovi koji koriste <span className="text-white font-bold">isključivo engleski jezik</span> za generisanje promptova radi boljeg postizanja rezultata.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
          {sortedApps.map((app, index) => <MarketplaceCard key={app.id} app={app} index={index} />)}
        </div>
      </div>
    </>
  );
}

function SingleProductPage({ apps = [] }) {
  const { id } = useParams(); const app = apps.find(a => a.id === id); const [activeMedia, setActiveMedia] = useState(0); const [fullScreenImage, setFullScreenImage] = useState(null); const navigate = useNavigate(); const mainVideoRef = useRef(null);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  if (!app) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 uppercase text-[10px] tracking-widest">Učitavanje...</div>;
  const currentMedia = app.media?.[activeMedia] || { url: data.bannerUrl, type: 'image' }; 
  const isVideo = currentMedia?.type === 'video' || currentMedia?.url?.match(/\.(mp4|webm|ogg|mov)$/i); 
  const { s: sysData } = data.extractSys(app.description); const parts = (app.whopLink || "").split("[SPLIT]");
  const sortedApps = [...apps].sort((a, b) => Number(b.id) - Number(a.id));
  const ribbonClass = getRibbonStyle(sortedApps.findIndex(a => a.id === id));
  
  return (
    <div className="bg-[#050505] pt-32 pb-32 px-6 font-sans text-white text-left relative">
      <Helmet><title>{app.name} | AI TOOLS PRO SMART</title></Helmet>
      
      {/* ANIMIRANI FULLSCREEN MODAL */}
      <AnimatePresence>
        {fullScreenImage && (
          <div className="fixed inset-0 z-[6000] bg-black/95 flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <button className="absolute top-6 right-6 text-white bg-black/50 hover:bg-red-600 rounded-full p-3 transition-all z-[6010]"><X className="w-8 h-8" /></button>
              <img src={fullScreenImage} className="max-w-full max-h-full object-contain" alt="Enlarged" onClick={(e) => e.stopPropagation()} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white flex items-center gap-2 mb-10 uppercase text-[10px] font-black tracking-widest transition-all"><ChevronLeft className="w-4 h-4" /> Sistemski Registar</button>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[65%]">
            {app.type && <div className={`mb-6 px-6 py-2.5 rounded-full inline-block text-white text-[13px] font-black uppercase tracking-[0.2em] shadow-xl ${ribbonClass}`}>{app.type}</div>}
            <div className="relative mb-6 aspect-video rounded-[2.5rem] overflow-hidden border-2 border-blue-500 bg-black shadow-2xl group">
              {!isVideo ? <><img src={currentMedia.url} onClick={() => setFullScreenImage(currentMedia.url)} className="w-full h-full object-cover cursor-pointer" alt="" /><button onClick={(e) => { e.stopPropagation(); setFullScreenImage(currentMedia.url); }} className="absolute top-6 right-6 p-3 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-blue-600"><Maximize className="w-5 h-5 text-white" /></button></> : <video ref={mainVideoRef} src={currentMedia.url} className="w-full h-full object-cover" controls autoPlay muted loop playsInline />}
              {app.media?.length > 1 && <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 pointer-events-none z-20"><button onClick={(e) => {e.stopPropagation(); setActiveMedia((activeMedia - 1 + app.media.length) % app.media.length);}} className="p-3 text-white pointer-events-auto opacity-0 group-hover:opacity-100 hover:text-orange-500 transition-all"><ChevronLeft className="w-8 h-8" /></button><button onClick={(e) => {e.stopPropagation(); setActiveMedia((activeMedia + 1) % app.media.length);}} className="p-3 text-white pointer-events-auto opacity-0 group-hover:opacity-100 hover:text-orange-500 transition-all"><ChevronRight className="w-8 h-8" /></button></div>}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">{app.media?.map((m, idx) => <button type="button" key={idx} onClick={() => setActiveMedia(idx)} className={`relative w-28 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === idx ? 'border-orange-500 scale-105 shadow-lg' : 'border-white/5 opacity-50 hover:opacity-100'}`}>{(m.type === 'video' || m.url?.match(/\.(mp4|webm|ogg|mov)$/i)) ? <><video src={`${m.url}#t=0.001`} className="w-full h-full object-cover" /><div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle className="w-6 h-6 text-white" /></div></> : <img src={m.url} className="w-full h-full object-cover" />}</button>)}</div>
            <h1 className="text-[24px] md:text-[28px] font-black uppercase tracking-tighter mt-8 mb-4 border-l-[5px] border-orange-500 pl-5 italic leading-tight">{app.name}</h1>
            <div className="flex mb-6"><div className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-xl">{app.category || 'AI SREDSTVO'}</div></div>
            {app.headline && <p className="text-[18px] md:text-[22px] text-white font-black mb-10 border-l-[5px] border-orange-500 pl-5 italic leading-relaxed">{app.headline}</p>}
            <div className="border-t border-white/5 pt-10 mb-12">
               <FormattedDescription text={app.description} />
               <div className="mt-14 border-t border-white/5 pt-12">
                 <details className="group">
                   <summary className="w-full flex items-center justify-between text-left cursor-pointer outline-none list-none [&::-webkit-details-marker]:hidden"><h3 className="text-[20px] md:text-[24px] font-black text-white uppercase tracking-widest border-l-[5px] border-orange-500 pl-5 italic flex items-center gap-4 transition-colors group-hover:text-orange-500 m-0"><HelpCircle className="w-6 h-6 text-orange-500" /> ČESTO POSTAVLJANA PITANJA</h3><ChevronDown className="w-8 h-8 text-zinc-500 group-hover:text-orange-500 transition-transform duration-300 group-open:rotate-180" /></summary>
                   {app.faq && app.faq.length > 0 && app.faq.some(f => f.q && f.a) && <div className="mt-10 space-y-4">{app.faq.filter(f => f.q && f.a).map((item, idx) => (<details key={idx} className="group/faq bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-inner text-left transition-all"><summary className="w-full p-6 flex justify-between items-center text-left hover:bg-white/[0.04] outline-none cursor-pointer list-none [&::-webkit-details-marker]:hidden"><h4 className="font-bold text-[15px] md:text-[18px] uppercase tracking-wider flex items-center gap-3 transition-colors duration-300 text-zinc-300 group-open/faq:text-orange-500">P: {item.q}</h4><ChevronDown className="w-5 h-5 shrink-0 text-zinc-500 transition-transform duration-300 group-open/faq:rotate-180" /></summary><div className="p-6 pt-0 text-white font-bold text-[15px] md:text-[18px] leading-relaxed border-t border-white/5 mt-2 pt-5 tracking-wide">O: {item.a}</div></details>))}</div>}
                 </details>
               </div>
            </div>
          </div>
          <div className="w-full lg:w-[35%] lg:sticky lg:top-40">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <img src={mojBaner} alt="" className="w-full h-40 object-cover rounded-2xl mb-8" />
              <div className="space-y-6 mb-8">
                <div className="relative rounded-2xl bg-white/[0.02] border border-white/10 py-3.5 flex items-center justify-center"><div className="absolute -top-3 px-4 py-1 rounded-full bg-blue-600 text-[8px] font-black uppercase tracking-widest shadow-lg">Mesečno</div><span className="text-2xl font-black">${app.price || '14.99'}</span></div>
                <div className="relative rounded-2xl bg-orange-500/[0.03] border border-orange-500/30 py-3.5 flex items-center justify-center mt-6"><div className="absolute -top-3 px-4 py-1 rounded-full bg-orange-600 text-[8px] font-black uppercase tracking-widest shadow-lg">Doživotno</div><span className="text-2xl font-black">${app.priceLifetime || '88.99'}</span></div>
              </div>
              <a href={data.formatExternalLink(sysData.w || parts[0])} target="_blank" rel="noreferrer" className="w-full py-5 rounded-2xl flex items-center justify-center bg-blue-600 text-white font-black text-[13px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl">Otključaj na Whop-u</a>
              <div className="pt-6 border-t border-white/5 mt-6">
                <div className="flex items-center justify-center gap-2 mb-4 text-orange-500"><Award className="w-5 h-5" /><span className="text-[11px] font-black uppercase tracking-widest">Dev Paket</span></div>
                <div className="flex flex-col gap-3">
                  <a href={data.formatExternalLink(sysData.g || parts[1])} target="_blank" rel="noreferrer" className="w-full py-4 rounded-xl flex items-center justify-center gap-2 border border-blue-900 bg-[#0f172a] text-blue-300 font-black text-[11px] uppercase tracking-[0.15em] hover:bg-blue-900 hover:text-white transition-all shadow-lg text-center px-2">OTKLJUČAJ REACT IZVORNI KOD NA WHOP-U <ArrowRight className="w-4 h-4 shrink-0" /></a>
                  {app.gumroadLink && <a href={data.formatExternalLink(app.gumroadLink)} target="_blank" rel="noreferrer" className="w-full py-4 rounded-xl flex items-center justify-center gap-2 border border-purple-800 bg-[#2e1065] text-purple-300 font-black text-[11px] uppercase tracking-[0.15em] hover:bg-purple-800 hover:text-white transition-all shadow-lg text-center px-2">OTKLJUČAJ REACT IZVORNI KOD NA GUMROAD-U <ArrowRight className="w-4 h-4 shrink-0" /></a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EnhancerAdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => { loadGallery(); }, []);
  const loadGallery = async () => {
    try {
      const snapshot = await getDocs(collection(db, "enhancer_gallery"));
      const items = [];
      snapshot.forEach(document => items.push({ id: document.id, ...document.data() }));
      setGallery(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {}
  };
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setIsUploading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json();
      await addDoc(collection(db, "enhancer_gallery"), { url: resData.secure_url, createdAt: Date.now() });
      loadGallery();
    } catch (err) {} finally { setIsUploading(false); }
  };
  const handleDelete = async (id) => { if(window.confirm("Delete image?")) { await deleteDoc(doc(db, "enhancer_gallery", id)); loadGallery(); } };
  return (
    <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 shadow-[0_0_30px_rgba(234,88,12,0.1)] mt-12 mb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div><h2 className="text-xl md:text-2xl font-black text-orange-500 uppercase tracking-widest flex items-center gap-3"><Zap className="w-6 h-6" /> 10X Enhancer Reference Gallery</h2><p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Slike dodate ovde će biti dostupne korisnicima na 10X Enhancer stranici.</p></div>
        <label className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-6 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest cursor-pointer transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-105">{isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}{isUploading ? "UPLOADING..." : "UPLOAD NEW IMAGE"}<input type="file" accept="image/*" onChange={handleUpload} className="hidden" /></label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {gallery.map(img => (
          <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-square bg-[#050505]"><img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" alt="Enhancer Ref" /><button type="button" onClick={() => handleDelete(img.id)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"><Trash2 className="w-4 h-4" /></button></div>
        ))}
        {gallery.length === 0 && !isUploading && <div className="col-span-full py-16 text-center text-zinc-600 text-[12px] font-black uppercase tracking-widest border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">NEMA SLIKA U ENHANCER GALERIJI</div>}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const snapshot = await getDocs(collection(db, "analytics"));
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        setStats(items.sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {} finally { setIsLoading(false); }
    };
    fetchAnalytics();
  }, []);
  if (isLoading) return <div className="py-20 text-center text-orange-500 animate-pulse font-black uppercase tracking-widest text-[12px]">SYNCING ANALYTICS...</div>;
  const totalVisitors = new Set(stats.map(s => s.sessionId)).size;
  const pageViews = stats.filter(s => s.type === 'page_view');
  const clicks = stats.filter(s => s.type === 'click');
  const enhancerActions = stats.filter(s => s.type === 'enhancer_action');
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-orange-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><Users className="w-8 h-8 text-orange-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Visitors</span><span className="text-3xl font-black text-white">{totalVisitors}</span></div>
        <div className="bg-[#0a0a0a] border border-blue-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><MousePointerClick className="w-8 h-8 text-blue-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Button Clicks</span><span className="text-3xl font-black text-white">{clicks.length}</span></div>
        <div className="bg-[#0a0a0a] border border-amber-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><Zap className="w-8 h-8 text-amber-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Enhancer Actions</span><span className="text-3xl font-black text-white">{enhancerActions.length}</span></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl">
           <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest mb-6 flex items-center gap-2"><Eye className="w-4 h-4 text-orange-500" /> Page Views (Traffic)</h3>
           <div className="space-y-4">
             {Object.entries(pageViews.reduce((acc, curr) => { acc[curr.path] = (acc[curr.path] || 0) + 1; return acc; }, {})).map(([path, count]) => (<div key={path} className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-[11px] text-zinc-300 font-mono truncate mr-4">{path || '/'}</span><span className="text-[13px] font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">{count}</span></div>))}
           </div>
         </div>
         <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl">
           <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest mb-6 flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-blue-500" /> User Clicks</h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             {clicks.slice(0, 50).map((click, i) => (<div key={i} className="flex flex-col border-b border-white/5 pb-3"><div className="flex justify-between items-start mb-1"><span className="text-[11px] text-zinc-100 font-bold capitalize">{click.elementText || 'Icon/Image'}</span><span className="text-[9px] text-zinc-500">{new Date(click.timestamp).toLocaleTimeString()}</span></div><span className="text-[9px] font-mono text-blue-400">Path: {click.path}</span></div>))}
           </div>
         </div>
      </div>
      <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl">
         <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest mb-6 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> 10X Enhancer Prompt History</h3>
         <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
           {enhancerActions.length === 0 && <div className="text-zinc-600 text-[10px] font-black uppercase">No enhancer actions recorded yet.</div>}
           {enhancerActions.map((action, i) => (<div key={i} className="flex flex-col border border-white/5 bg-white/[0.02] p-4 rounded-xl"><div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2"><span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{action.actionType === 'concept' ? 'Concept Form' : 'Raw Prompt Paste'}</span><span className="text-[9px] text-zinc-500">{new Date(action.timestamp).toLocaleString()}</span></div><p className="text-[11px] text-zinc-300 font-mono leading-relaxed break-words">{action.input}</p></div>))}
         </div>
      </div>
    </div>
  );
};

function AdminPage({ apps = [], refreshData }) {
  const [password, setPassword] = useState(''); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [editingId, setEditingId] = useState(null); 
  const [isUploading, setIsUploading] = useState(false); 
  const [adminTab, setAdminTab] = useState('assets'); 
  const initialForm = { name: '', category: 'AI ASSET', type: '', headline: '', price: '', priceLifetime: '', description: '', media: [], whopLink: '', reactSourceCode: '', gumroadLink: '', faq: Array.from({ length: 7 }, () => ({ q: '', a: '' })) }; 
  const [formData, setFormData] = useState(initialForm); 
  const sortedAppsAdmin = [...apps].sort((a, b) => Number(b.id) - Number(a.id));
  const handleLogin = (e) => { e.preventDefault(); const coreHash = password.split('').reduce((acc, char) => (((acc << 5) - acc) + char.charCodeAt(0)) | 0, 0); if (coreHash === 110755051) setIsAuthenticated(true); else alert("DENIED"); };
  const handleEditClick = (app) => { const parts = (app.whopLink || "").split("[SPLIT]"); const loadedFaq = app.faq || []; const paddedFaq = Array.from({ length: 7 }, (_, i) => loadedFaq[i] || { q: '', a: '' }); setFormData({ ...app, whopLink: parts[0] || '', reactSourceCode: parts[1] || '', gumroadLink: app.gumroadLink || '', faq: paddedFaq }); setEditingId(app.id); setAdminTab('assets'); window.scrollTo(0, 0); };
  const handleSubmit = async (e) => { e.preventDefault(); const payload = { ...formData, id: editingId || String(Date.now()), whopLink: `${formData.whopLink}[SPLIT]${formData.reactSourceCode}`, faq: formData.faq.filter(f => f.q && f.a) }; try { const res = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (res.ok) { setFormData(initialForm); setEditingId(null); refreshData(); alert('PROTOCOL SAVED.'); } } catch (err) {} }; 
  const handleImageUpload = async (e) => { const files = Array.from(e.target.files); setIsUploading(true); for (const file of files) { const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET); try { const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd }); const resData = await res.json(); setFormData(prev => ({ ...prev, media: [...prev.media, { url: resData.secure_url, type: file.type.startsWith('video/') ? 'video' : 'image' }] })); } catch (err) {} } setIsUploading(false); };
  
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 text-center">
      <div className="bg-[#0a0a0a] p-12 rounded-[2rem] border-2 border-red-900 shadow-[0_0_30px_rgba(185,28,28,0.2)] max-w-md w-full relative group">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-red-700 rounded-tr-xl"></div><div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-red-700 rounded-tl-xl"></div>
        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-10 shadow-[0_0_15px_rgba(185,28,28,0.3)] animate-pulse" />
        <div className="space-y-4 mb-12"><h1 className="text-xl font-black text-red-500 uppercase tracking-[0.3em] font-sans">CLASSIFIED // ADMIN</h1></div>
        <form onSubmit={handleLogin} className="space-y-6"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="CORE KEY" className="w-full bg-black/40 border-2 border-red-900 p-4 rounded-xl text-red-100 outline-none text-center text-[11px] tracking-[0.6em] focus:border-red-600 transition-all" /><button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-red-900 to-red-600 px-6 py-4 font-black uppercase text-[10px] tracking-widest text-white shadow-xl hover:shadow-[0_0_20px_rgba(185,28,28,0.3)] transition-all">Authorize</button></form>
      </div>
    </div>
  );
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-sans text-left text-white relative">
      <div className="flex gap-4 mb-12 border-b border-white/5 pb-6">
         <button type="button" onClick={() => setAdminTab('assets')} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'assets' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Award className="w-4 h-4 inline mr-2" /> Assets Manager</button>
         <button type="button" onClick={() => setAdminTab('analytics')} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'analytics' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><BarChart className="w-4 h-4 inline mr-2" /> V8 Analytics</button>
      </div>
      {adminTab === 'assets' ? (
        <><form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" required /><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Category" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /><input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Ribbon" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Standard Price" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /><input type="text" value={formData.priceLifetime} onChange={e => setFormData({...formData, priceLifetime: e.target.value})} placeholder="Lifetime Price" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input type="text" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} placeholder="Headline" className="bg-black border border-white/10 p-3 rounded-xl text-[11px] md:col-span-3" /></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input type="text" value={formData.whopLink} onChange={e => setFormData({...formData, whopLink: e.target.value})} placeholder="Whop Link" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /><input type="text" value={formData.reactSourceCode} onChange={e => setFormData({...formData, reactSourceCode: e.target.value})} placeholder="React Code (Whop)" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /><input type="text" value={formData.gumroadLink} onChange={e => setFormData({...formData, gumroadLink: e.target.value})} placeholder="Gumroad React Code" className="bg-black border border-purple-500/50 text-purple-100 placeholder-purple-500/50 focus:border-purple-500 outline-none transition-all p-3 rounded-xl text-[11px]" /></div>
               <div className="bg-black border border-white/10 p-4 rounded-xl"><label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">Media</label><div className="flex flex-wrap gap-4">{formData.media.map((m, i) => (<div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group">{m.type === 'video' ? <video src={m.url} className="w-full h-full object-cover" /> : <img src={m.url} className="w-full h-full object-cover" />}<button type="button" onClick={() => setFormData({...formData, media: formData.media.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button></div>))}<label className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-zinc-500">{isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><UploadCloud className="w-6 h-6 mb-2" /><span className="text-[8px] uppercase font-black">Upload</span></>}<input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="hidden" /></label></div></div>
               <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" className="bg-black border border-white/10 p-4 rounded-xl text-[11px] h-96 w-full outline-none font-mono leading-relaxed" />
               <div className="bg-black border border-white/10 p-4 rounded-xl"><label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">FAQ</label><div className="space-y-3">{formData.faq.map((f, i) => (<div key={i} className="flex gap-2"><input type="text" value={f.q} onChange={e => { const newFaq = [...formData.faq]; newFaq[i].q = e.target.value; setFormData({...formData, faq: newFaq}); }} placeholder="Question" className="flex-1 bg-black border border-white/5 p-2 rounded-lg text-[10px]" /><input type="text" value={f.a} onChange={e => { const newFaq = [...formData.faq]; newFaq[i].a = e.target.value; setFormData({...formData, faq: newFaq}); }} placeholder="Answer" className="flex-[2] bg-black border border-white/5 p-2 rounded-lg text-[10px]" /></div>))}</div></div>
               <div className="flex gap-4"><button type="submit" disabled={isUploading} className="flex-1 py-5 rounded-2xl font-black uppercase text-[12px] bg-orange-600 hover:bg-orange-500 transition-all">Execute Deploy</button>{editingId && <button type="button" onClick={() => {setFormData(initialForm); setEditingId(null);}} className="px-8 py-5 rounded-2xl bg-zinc-800 uppercase font-black text-[12px]">Cancel</button>}</div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">{sortedAppsAdmin.map(app => (<div key={app.id} className="p-5 bg-black border border-white/10 rounded-[1.5rem] flex flex-col gap-4 shadow-xl"><div className="aspect-video relative overflow-hidden rounded-2xl bg-zinc-900">{app.media?.[0]?.type === 'video' ? <video src={`${app.media[0].url}#t=0.001`} className="w-full h-full object-cover" muted /> : <img src={data.getMediaThumbnail(app.media?.[0]?.url)} className="w-full h-full object-cover" alt="" />}</div><div className="flex justify-between items-start gap-4"><div><span className="text-[13px] font-black uppercase text-white line-clamp-2">{app.name}</span><span className="text-[9px] text-zinc-500 block mt-1">ID: {app.id}</span></div><div className="flex gap-2"><button type="button" onClick={() => handleEditClick(app)} className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 transition-all"><Edit className="w-4 h-4" /></button><button type="button" onClick={async () => { if(window.confirm("Delete?")) { await fetch(`${API_URL}/${app.id}`, { method: 'DELETE' }); refreshData(); } }} className="p-2.5 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button></div></div></div>))}</div>
          </form><EnhancerAdminGallery /></>
      ) : (<AnalyticsDashboard />)}
    </div>
  );
}

function AppContent({ appsData, refreshData }) {
  const [isBooting, setIsBooting] = useState(true); const [showBanner, setShowBanner] = useState(false); const location = useLocation();
  const prevLocation = useRef(location.pathname); const entryTime = useRef(Date.now());
  
  useEffect(() => {
    if (prevLocation.current !== location.pathname) {
       const timeSpent = Date.now() - entryTime.current;
       logAnalyticsEvent('time_spent', { path: prevLocation.current, durationMS: timeSpent });
       prevLocation.current = location.pathname; entryTime.current = Date.now();
       logAnalyticsEvent('page_view', { path: location.pathname });
    }
  }, [location.pathname]);
  
  useEffect(() => { logAnalyticsEvent('page_view', { path: location.pathname }); }, []);
  
  useEffect(() => {
    const handleGlobalClick = (e) => { const target = e.target.closest('button, a'); if (target) logAnalyticsEvent('click', { elementText: target.innerText || target.getAttribute('aria-label') || 'Icon', path: window.location.pathname }); };
    document.addEventListener('click', handleGlobalClick); return () => document.removeEventListener('click', handleGlobalClick);
  }, []);
  
  const handleHomeClick = (e) => { if (location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); window.history.replaceState(null, '', '/'); } };
  
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans relative pb-20 lg:pb-0 text-left">
      {/* ANIMIRANI LOADER I BANER */}
      <AnimatePresence>
        {isBooting && <FullScreenBoot key="boot" onComplete={() => { setIsBooting(false); setShowBanner(true); window.scrollTo(0,0); }} />}
        {!isBooting && showBanner && <WelcomeBanner key="banner" onClose={() => setShowBanner(false)} />}
      </AnimatePresence>
      
      <div className="fixed top-0 left-0 w-full z-[1000]">
        <nav className="w-full px-4 md:px-8 py-3 md:py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-orange-500/20 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
            <Link to="/" onClick={handleHomeClick} className="flex items-center gap-4 group">
              <img src={data.logoUrl} className="h-8 md:h-10 object-contain animate-pulse" alt="logo" />
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] hidden sm:block"><span className="text-blue-500">AI TOOLS</span> <span className="text-orange-500">PRO SMART</span></span>
            </Link>
            <div className="flex items-center gap-3 md:gap-4 font-black uppercase text-[10px] md:text-[11px] tracking-widest">
              <Link to="/" onClick={handleHomeClick} className="bg-emerald-900/60 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-emerald-400 border border-emerald-800 shadow-xl hover:bg-emerald-800 transition-all">Početna</Link>
              <Link to="/#marketplace" className="bg-blue-600 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-white shadow-xl hover:bg-blue-500 transition-all">Prodavnica</Link>
              {location.pathname !== '/enxance' && (<Link to="/enxance" className="bg-transparent border-2 border-orange-600 text-orange-600 px-4 md:px-5 py-1.5 md:py-2 rounded-full shadow-xl hover:bg-orange-600/10 transition-all flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 10X ENHANCER</Link>)}
              <Link to="/admin" className="bg-orange-600 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-white shadow-xl hover:bg-orange-500 transition-all">Admin</Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="flex-1 text-left pt-20"><Routes><Route path="/" element={<HomePage apps={appsData} />} /><Route path="/enxance" element={<EnhancerPage />} /><Route path="/app/:id" element={<SingleProductPage apps={appsData} />} /><Route path="/admin" element={<AdminPage apps={appsData} refreshData={refreshData} />} /></Routes></div>
      <SmartScrollButton />
      <footer className="flex flex-col items-center gap-4 text-center text-zinc-100 font-black italic uppercase text-[9px] tracking-[0.5em] py-6 mt-8" style={{ borderTop: '0.5px solid #f97316' }}>
        <div className="flex items-center gap-6">
          <a href="https://x.com/AiToolsProSmart" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg></a>
          <a href="https://www.youtube.com/@SmartAiToolsPro-Smart-AI" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><Youtube size={20} className="text-[#FF0000]" /></a>
          <a href="https://www.instagram.com/aitoolsprosmart/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="h-4 w-4 object-contain" /></a>
          <a href="https://www.tiktok.com/@smartaitoolspro" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" className="h-4 w-4 object-contain" /></a>
        </div>
        <div>© 2026 <span className="text-blue-500 font-black">AI TOOLS</span> <span className="text-orange-500 font-black">PRO SMART</span> <span className="mx-1 text-white font-black">|</span> SVA PRAVA ZADRŽANA</div>
      </footer>
    </div>
  );
}

export default function App() { 
  const [appsData, setAppsData] = useState([]); const refreshData = useCallback(() => { fetch(API_URL).then(res => res.json()).then(db => setAppsData(db)).catch(() => setAppsData([])); }, []); useEffect(() => { refreshData(); }, [refreshData]);
  return (<HelmetProvider><Router><AppContent appsData={appsData} refreshData={refreshData} /><data.LiveSalesNotification apps={appsData} /></Router></HelmetProvider>); 
}