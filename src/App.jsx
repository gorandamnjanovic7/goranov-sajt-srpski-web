import V8Promo10xPage from './V8Promo10xPage';
import V8ContactWidget from './V8ContactWidget';
import './App.css'; // Obavezno uvezi CSS ako već nisi
import V8Enhancer10x from './V8Enhancer10x';
import V8MasterCollection from './V8MasterCollection';
import V8PametniAlatiPage from './PametniAlati';
import V8KreatorSlikaPage from './V8KreatorSlika';
import V8PixarSelfiePage from './V8PixarSelfie';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  PlayCircle, Sparkles, Youtube,  ChevronLeft, Award, 
  ArrowRight, Maximize, Edit, Loader2, ShieldAlert, Trash2, UploadCloud,
  Dices, Eye, MousePointerClick,Mail,Download, Briefcase, QrCode, X, ChevronRight, Clock, Users, Zap,Camera, Crop, Image as ImageIcon, HelpCircle, ChevronDown,
  ChevronUp, Activity, BarChart, Layers, Settings, Lock, LogOut, User, Timer, History, CheckCircle, Plus,Crown, ExternalLink
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// FIREBASE
import { db, auth, provider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, getDoc, query, orderBy, limit, addDoc, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import * as data from './data';
import { UniversalVideoPlayer, MatrixRain, TutorialCard, FormattedDescription, TypewriterText } from './data';
import mojBaner from './moj-baner.png'; 

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) { window.history.scrollRestoration = 'manual'; }
  if (window.location.hash) { window.history.replaceState(null, '', window.location.pathname); }
  window.scrollTo(0, 0);
}

// V8 SENZOR: Automatski prebacuje između lokalne garaže (localhost) i interneta (Railway)
const BASE_BACKEND_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://goranov-sajt-srpski-backend-production.up.railway.app";

// Napomena: API_URL više ne koristimo za proizvode jer sada gađamo direktno Firebase, 
// ali ga ostavljamo ako ti zatreba za neku drugu rutu.
const API_URL = `${BASE_BACKEND_URL}/api/products`;
const MOJA_IP = "213.196.99.10"; 
const YOUTUBE_API_KEY = "AIzaSyCwy46TsBPW7LxKTjExhQbHhYhq8lyc2YM"; 

let globalUserIp = "";
const currentSessionId = Math.random().toString(36).substring(2, 15);

const fetchUserIp = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const d = await res.json(); globalUserIp = d.ip;
  } catch (err) {}
};
fetchUserIp();

export const logAnalyticsEvent = async (type, details) => {
  if (globalUserIp === MOJA_IP || globalUserIp === "") return; 
  try { await addDoc(collection(db, "analytics"), { type, ...details, timestamp: Date.now(), sessionId: currentSessionId }); } catch (err) {}
};

export const v8Toast = {
  listeners: [],
  success: (msg) => v8Toast.listeners.forEach(l => l({ type: 'success', msg, id: Date.now() })),
  error: (msg) => v8Toast.listeners.forEach(l => l({ type: 'error', msg, id: Date.now() })),
  subscribe: (l) => { v8Toast.listeners.push(l); return () => v8Toast.listeners = v8Toast.listeners.filter(cb => cb !== l); }
};

const V8ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    return v8Toast.subscribe((t) => {
      setToasts(p => [...p, t]);
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3500);
    });
  }, []);
  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.9 }} className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${t.type === 'success' ? 'bg-green-900/40 border-green-500/50 text-green-100' : 'bg-red-900/40 border-red-500/50 text-red-100'}`}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <ShieldAlert className="w-5 h-5 text-red-400" />}
            <span className="text-[11px] font-black uppercase tracking-widest">{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 15 * 60 + 43);
  useEffect(() => {
    const interval = setInterval(() => { setTimeLeft(prev => (prev > 0 ? prev - 1 : 24 * 3600)); }, 1000);
    return () => clearInterval(interval);
  }, []);
  const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center justify-center gap-3 bg-orange-600/10 border border-orange-500/30 px-6 py-3 rounded-2xl shadow-[0_0_15px_rgba(234,88,12,0.2)] mt-4">
      <Timer className="w-5 h-5 text-orange-500 animate-pulse" />
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">AKCIJA ISTEČE ZA:</span>
        <span className="text-[16px] font-mono font-black text-white tracking-widest">{h}:{m}:{s}</span>
      </div>
    </div>
  );
};

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

const MagneticButton = ({ children, className, onClick, href, target, rel }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    setPos({ x: (clientX - (left + width / 2)) * 0.3, y: (clientY - (top + height / 2)) * 0.3 });
  };
  const reset = () => setPos({ x: 0, y: 0 });
  const Component = href ? motion.a : motion.button;
  return (
    <Component ref={ref} href={href} target={target} rel={rel} onClick={onClick} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: pos.x, y: pos.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className={className} style={{ display: 'inline-flex', position: 'relative', zIndex: 50 }}>
      {children}
    </Component>
  );
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

const FullScreenBoot = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 800); return 100; }
        return p + Math.floor(Math.random() * 5) + 1; 
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  const radius = 60; const circumference = 2 * Math.PI * radius;
  const { offset, percent } = useSpring({ offset: circumference - (Math.min(progress, 100) / 100) * circumference, percent: Math.min(progress, 100), config: { tension: 120, friction: 14 } });

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-8">
        <svg className="w-56 h-56 transform -rotate-90 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <animated.circle cx="70" cy="70" r={radius} fill="transparent" stroke="#ea580c" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <img src={data.logoUrl} alt="Logo" className={`absolute w-16 h-16 object-contain transition-all duration-1000 ${progress >= 100 ? 'scale-125 drop-shadow-[0_0_30px_rgba(234,88,12,1)]' : 'animate-pulse'}`} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="text-orange-600 font-black uppercase tracking-[0.6em] text-[13px] drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]">V8 Sistem se Pokreće</div>
        <div className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /><span>USPOSTAVLJANJE VEZE</span>
          <animated.span className="text-orange-500 font-black min-w-[30px]">{percent.to(n => `${Math.floor(n)}%`)}</animated.span>
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
  
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const centerX = rect.width / 2; const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: tilt.x === 0 && tilt.y === 0 ? 1 : 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ perspective: 1000, transformStyle: "preserve-3d" }} className="group relative rounded-[2.5rem] p-[2px] bg-gradient-to-br from-orange-500 to-blue-600 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] flex flex-col h-full z-10 hover:z-20">
      <div className="bg-[#0a0a0a] rounded-[2.4rem] p-5 flex flex-col h-full relative overflow-hidden transition-transform duration-300">
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
                 <img src={displayUrl} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={app.name} />
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
      <img src={mojBaner} loading="lazy" alt="Welcome" className="w-full h-48 object-cover border-b border-orange-500/20" />
      <div className="p-8">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest mb-4">Dobrodošli u <span className="text-orange-500">V8 PRO SMART</span></h2>
        <p className="text-zinc-400 text-xs md:text-sm mb-8 uppercase tracking-[0.2em] leading-relaxed">Centralizovani sistem za Premium AI Arhitekturu je sada NA MREŽI.</p>
        <button onClick={onClose} className="bg-orange-600 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-orange-500 transition-all shadow-lg">Uđi u Sistem</button>
      </div>
    </motion.div>
  </div>
);

const OptionButton = ({ label, selected, onClick, type, disabled }) => {
  const isQuality = type === 'quality';
  const activeClass = isQuality ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]";
  return <button type="button" disabled={disabled} onClick={onClick} className={`px-4 py-2 rounded-lg text-[9px] font-black border transition-all ${selected ? activeClass : "bg-black border-white/10 text-zinc-500 hover:border-white/20 hover:text-white"} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{label}</button>;
};

/* --- POČETAK: PromptResultBox komponenta sa Cliffhanger efektom --- */
const PromptResultBox = ({ type, text, copiedBox, onCopy, isVIP }) => {
  const userIsPremium = isVIP || false; 
  const isLocked = !userIsPremium && text; 
  const displaySnippet = isLocked ? text.substring(0, 120) + "..." : text;

  return (
    <div className="relative p-6 bg-[#0a0a0a] border border-orange-500/30 rounded-2xl w-full min-h-[250px] flex flex-col group overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.1)] transition-all duration-300 hover:border-orange-500/50">
      <label className="text-[11px] font-black uppercase tracking-widest mb-4 border-b pb-3 flex items-center text-orange-500 border-white/5">
        GENERISANI V8 PROMPT
      </label>
      <div className="relative w-full flex-grow flex flex-col">
        <div className={`font-mono text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap transition-all duration-500 ${isLocked ? 'blur-[5px] select-none opacity-50' : ''}`}>
          {displaySnippet}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-sm rounded-xl p-4 text-center z-10">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className="text-orange-500 font-black tracking-widest uppercase mb-2">Sistem Zaključan</h3>
            <p className="text-[11px] text-zinc-300 mb-5 max-w-[220px]">
              Ovaj premium rezultat je zaštićen. Puni potencijal je rezervisan za V8 klijente.
            </p>
            <button 
              onClick={() => document.getElementById('ips-payment-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black px-6 py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,88,12,0.4)]"
            >
              Otključaj na ai-alati.rs
            </button>
          </div>
        )}
      </div>
      {!isLocked && text && (
        <button 
          onClick={() => onCopy(text, type)} 
          className="absolute bottom-6 right-6 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
        >
          {copiedBox === type ? "Kopirano! ✓" : "Kopiraj Prompt"}
        </button>
      )}
    </div>
  );
};
/* --- KRAJ: PromptResultBox komponenta --- */
function SingleProductPage({ apps = [] }) {
  const { id } = useParams(); 
  const app = apps.find(a => a.id === id); 
  const [activeMedia, setActiveMedia] = useState(0); 
  const [fullScreenImage, setFullScreenImage] = useState(null); 
  
  const [ipsModalData, setIpsModalData] = useState(null); 
  const [hasAccess, setHasAccess] = useState(false); 
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const navigate = useNavigate(); 
  const mainVideoRef = useRef(null);
  
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (!app) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === "damnjanovicgoran7@gmail.com") {
          setHasAccess(true);
        } else {
          try {
            const docRef = doc(db, "vip_users", user.email.toLowerCase());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().unlockedApps) {
              const unlocked = docSnap.data().unlockedApps;
              if (unlocked.includes(app.id) || unlocked.includes('FULL_ACCESS')) {
                setHasAccess(true);
              } else {
                setHasAccess(false);
              }
            } else {
              setHasAccess(false);
            }
          } catch(e) { setHasAccess(false); }
        }
      } else {
        setHasAccess(false);
      }
      setIsCheckingAccess(false);
    });
    return () => unsubscribe();
  }, [app]);
  
  if (!app) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 uppercase text-[10px] tracking-widest">Učitavanje...</div>;
  
  const currentMedia = app.media?.[activeMedia] || { url: data.bannerUrl, type: 'image' }; 
  const isVideo = currentMedia?.type === 'video' || currentMedia?.url?.match(/\.(mp4|webm|ogg|mov)$/i); 
  
  const parts = (app.whopLink || "").split("[SPLIT]");
  const mainLink = parts[0] || ""; 

  const sortedApps = [...apps].sort((a, b) => Number(b.id) - Number(a.id));
  const ribbonClass = getRibbonStyle(sortedApps.findIndex(a => a.id === id));

  const KURS_DOLARA = 115; 
  const cenaMesecnoUDolarima = app.price ? parseFloat(app.price) : 15;
  const cenaLifetimeUDolarima = app.priceLifetime ? parseFloat(app.priceLifetime) : 89;
  
  const mesecnaCenaRsd = Math.ceil(cenaMesecnoUDolarima * KURS_DOLARA);
  const lifetimeCenaRsd = Math.ceil(cenaLifetimeUDolarima * KURS_DOLARA);
  
  const formatiranIznos = ipsModalData ? `RSD${ipsModalData.cena},00` : 'RSD0,00';
  const skracenoIme = (app.name || 'AI Alat').substring(0, 15); 
  const svrhaPlacanja = ipsModalData ? `${ipsModalData.tip} ${skracenoIme}` : '';
  const ipsString = `K:PR|V:01|C:1|R:265000000653577083|N:Goran Damnjanovic|I:${formatiranIznos}|SF:289|S:${svrhaPlacanja}|RO:V8-${app.id}`;
  
  const handlePaymentV8 = async (tip, cena) => {
    if (auth.currentUser) {
      try { await setDoc(doc(db, "posetioci", auth.currentUser.uid), { poslednjiKlik: serverTimestamp(), zainteresovanZa: tip }, { merge: true }); } catch (err) {}
      setIpsModalData({ tip, cena });
    } else {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, "posetioci", user.uid), { ime: user.displayName, email: user.email, vremePrijave: serverTimestamp(), zainteresovanZa: tip, identitet: "V8-Klijent" }, { merge: true });
        
        const docRef = doc(db, "vip_users", user.email.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().unlockedApps && (docSnap.data().unlockedApps.includes(app.id) || docSnap.data().unlockedApps.includes('FULL_ACCESS'))) {
            setHasAccess(true);
            v8Toast.success("Dobrodošli nazad! Pristup je već otključan.");
        } else {
            setIpsModalData({ tip, cena });
        }
      } catch (error) { v8Toast.error("Greška pri prijavi!"); }
    }
  };
  
  return (
    <div className="bg-[#050505] pt-32 pb-32 px-6 font-sans text-white text-left relative">
      <Helmet><title>{app.name} | AI TOOLS PRO SMART</title></Helmet>
      
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
              <img src={mojBaner} alt="Banner" className="w-full h-40 object-cover rounded-2xl mb-8 border border-white/5" />
              
              {isCheckingAccess ? (
                 <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
              ) : hasAccess ? (
                <div className="bg-[#050505] border border-green-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10 shadow-lg">PREMIUM NALOG</div>
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1">Pristup Odobren</h3>
                  <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-8">Dobrodošli u vaš VIP Trezor</p>
                  
                  <div className="flex flex-col gap-4">
                    {mainLink ? (
                      <a href={data.formatExternalLink(mainLink)} target="_blank" rel="noreferrer" className="w-full py-5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black text-[13px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        🚀 Otvori Aplikaciju
                      </a>
                    ) : (
                      <div className="text-zinc-500 text-[10px] uppercase font-bold p-3 border border-white/5 rounded-xl">Link aplikacije nije postavljen</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#050505] border border-orange-500/40 p-5 rounded-2xl shadow-[0_0_20px_rgba(234,88,12,0.1)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10 shadow-lg">Srbija 🇷🇸</div>
                  
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6 mt-2 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> Direktno plaćanje
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handlePaymentV8('Mesečno', mesecnaCenaRsd)} className="w-full py-4 rounded-xl flex items-center justify-between px-5 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white font-black text-[12px] uppercase tracking-widest transition-all">
                      <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Mesečno</span>
                      <span className="text-orange-400">{mesecnaCenaRsd.toLocaleString('sr-RS')} RSD</span>
                    </button>
                    <button onClick={() => handlePaymentV8('Lifetime', lifetimeCenaRsd)} className="w-full py-4 rounded-xl flex items-center justify-between px-5 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/40 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[12px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:shadow-[0_0_25px_rgba(234,88,12,0.6)]">
                      <span className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Doživotno</span>
                      <span className="text-white drop-shadow-md">{lifetimeCenaRsd.toLocaleString('sr-RS')} RSD</span>
                    </button>
                  </div>

                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-6 text-center leading-relaxed font-bold px-2">
                    Nakon IPS uplate, sistem će vam ovde automatski otključati dugme za pristup alatu.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                
                {/* NOVI KONTAKT BLOK SA VIBEROM I WHATSAPPOM */}
                <div className="mt-8 w-full bg-[#050505] border border-orange-500/30 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(234,88,12,0.15)]">
                  <p className="text-[11px] md:text-[12px] text-zinc-400 font-black uppercase tracking-widest mb-4">Nakon uplate, pošaljite nam dokaz na:</p>
                  <div className="flex flex-col gap-3">
                    <a href="mailto:aitoolsprosmart@gmail.com" onClick={(e) => { navigator.clipboard.writeText('aitoolsprosmart@gmail.com'); if (typeof v8Toast !== 'undefined') v8Toast.success('Email adresa je kopirana!'); }} className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-400 py-3 rounded-xl font-black text-[12px] md:text-[14px] tracking-widest transition-all cursor-pointer shadow-inner">
                      📧 aitoolsprosmart@gmail.com
                    </a>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <a href="viber://chat?number=%2B381648201496" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#7360f2]/10 border border-[#7360f2]/30 hover:bg-[#7360f2]/20 hover:border-[#7360f2] text-[#7360f2] py-3 rounded-xl font-black text-[11px] md:text-[12px] tracking-widest transition-all cursor-pointer">
                        🟣 VIBER
                      </a>
                      <a href="https://wa.me/381648201496" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 hover:border-[#25D366] text-[#25D366] py-3 rounded-xl font-black text-[11px] md:text-[12px] tracking-widest transition-all cursor-pointer">
                        🟢 WHATSAPP
                      </a>
                    </div>
                  </div>
                  <span className="block mt-5 text-[10px] text-zinc-500 uppercase font-black tracking-widest">Sistem će vam odmah otključati pristup! 🚀</span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/// POČETAK FUNKCIJE: IzradaSajtovaPage ///

// 1. Tvoja stroga funkcija za mail (definisana van glavne, ali u istom fajlu)
// 1. Tvoja stroga funkcija za mail (Popravljena V8 metoda)
// 1. Tvoja stroga funkcija za mail (Čist HTML, bez blokada)
/// POČETAK FUNKCIJE: ContactButton ///
const ContactButton = () => {
  const email = "aitoolsprosmart@gmail.com";
  const subject = encodeURIComponent("V8 Konsultacije - Izrada Premium Sajta");
  const body = encodeURIComponent(
    "Poštovani,\n\nŽelim da zakažem besplatne konsultacije u vezi izrade premium web sajta.\n\nMoje ime je:\nMoj broj telefona je:\n"
  );

  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <a 
      href={mailtoLink} 
      className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl cursor-pointer text-center"
    >
      ZAKAŽI BESPLATNE KONSULTACIJE
    </a>
  );
};
/// KRAJ FUNKCIJE: ContactButton ///

// 2. Tvoja glavna stranica
function IzradaSajtovaPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [demoProjekti, setDemoProjekti] = useState([]);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    const fetchDemos = async () => {
      try {
        const snap = await getDocs(collection(db, "demo_projekti"));
        if (!snap.empty) {
          setDemoProjekti(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
        }
      } catch(e) {}
    };
    fetchDemos();
  }, []);
  
  const nextSlide = useCallback(() => setActiveSlide(s => (s + 1) % (data.BANNER_DATA?.length || 1)), []);
  const prevSlide = () => setActiveSlide(s => (s - 1 + (data.BANNER_DATA?.length || 1)) % (data.BANNER_DATA?.length || 1));
  useEffect(() => { const t = setInterval(nextSlide, 7000); return () => clearInterval(t); }, [nextSlide]);

  return (
    <div className="min-h-screen bg-[#050505] text-white text-left">
      <Helmet><title>Izrada Web Stranica | V8 Digital Agency</title></Helmet>
      
      <div className="relative w-full h-[85vh] flex items-end overflow-hidden bg-black text-white border-b border-orange-500/20">
        <div className="absolute inset-0 z-0 bg-black">{(data.BANNER_DATA || []).map((item, idx) => (<div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeSlide ? 'opacity-100' : 'opacity-0'} z-0`}><img src={item.image} loading={idx === 0 ? "eager" : "lazy"} className="w-full h-full object-cover opacity-80" alt="banner" /></div>))}</div>
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

      <section className="py-20 px-6 relative overflow-hidden bg-[#050505] border-b border-orange-500/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white uppercase italic">POTREBAN VAM JE <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">OVAKAV SAJT?</span></h2>
              <p className="text-zinc-300 font-black tracking-[0.3em] uppercase text-[10px] md:text-[12px]">V8 DIGITAL AGENCY — PREMIUM WEB REŠENJA ZA VAŠ BIZNIS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 group shadow-xl">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Layers className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase italic">V8 Vizuelni Identitet</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">Sajt koji ostavlja konkurenciju u prašini. Ultra-moderan dizajn optimizovan za maksimalnu prodaju.</p>
              </div>

              <div className="bg-[#0a0a0a] border border-orange-500/30 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-[0_0_40px_rgba(234,88,12,0.05)]">
                <div className="absolute top-0 right-0 bg-orange-500 text-black text-[9px] font-black px-4 py-1.5 uppercase rounded-bl-xl font-sans">NAJTRAŽENIJE</div>
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Zap className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase italic">IPS Instant Naplata</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">Implementiramo QR kod plaćanje direktno na vaš tekući račun. Bez provizija banaka i čekanja.</p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all group shadow-xl">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Settings className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase italic">Smart Admin Panel</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">Potpuna autonomija. Menjajte sami cene, slike i tekstove bez potrebe za programerom.</p>
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              {/* Ovdje pozivamo tvoju strogu funkciju */}
              <ContactButton />
            </div>
          </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-orange-500/30 rounded-[2rem] p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Premium Web Arhitektura
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-5 italic">
              KOMPLETNA DIGITALNA TRANSFORMACIJA
            </h3>
            <p className="text-zinc-400 text-[13px] md:text-[15px] leading-relaxed mb-8 max-w-4xl font-medium">
              Pružamo usluge izrade najsavremenijih web sajtova i aplikacija. Naša rešenja uključuju 
              <span className="text-white font-black tracking-wide"> direktnu IPS naplatu</span>, kao i 
              <span className="text-white font-black tracking-wide"> pametne Admin panele</span> putem kojih možete pratiti apsolutno sve: od zakazivanja termina, preko analitike poseta, do upravljanja zalihama proizvoda i bazom klijenata.
              <br/><br/>
              Bilo da vam je potrebna robusna <span className="text-orange-400 font-black tracking-wide">e-commerce platforma za online prodaju</span>, sajt za rezervacije ili korporativna prezentacija, tu smo za vas. 
              Klijenti mogu započeti brzo koristeći naše industrijski-optimizovane šablone (template), ili možemo izgraditi 
              <span className="text-white font-black tracking-wide"> potpuno unikatno rešenje od nule</span>, skrojeno strogo po meri i vizuelnom identitetu vašeg brenda.
            </p>
            
            <div className="flex flex-wrap gap-3">
               <span className="text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl uppercase font-black tracking-widest flex items-center gap-2 shadow-inner"><Zap className="w-4 h-4 text-orange-500"/> IPS Naplata</span>
               <span className="text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl uppercase font-black tracking-widest flex items-center gap-2 shadow-inner"><Settings className="w-4 h-4 text-blue-500"/> Smart Admin Dashboard</span>
               <span className="text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl uppercase font-black tracking-widest flex items-center gap-2 shadow-inner"><Activity className="w-4 h-4 text-green-500"/> E-Commerce Prodaja</span>
               <span className="text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl uppercase font-black tracking-widest flex items-center gap-2 shadow-inner"><Layers className="w-4 h-4 text-purple-500"/> Custom & Template Rešenja</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-28 mb-20 px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="text-center mb-12">
  <h3 className="text-orange-500 font-black uppercase text-[11px] tracking-[0.5em] mb-3">Industrijski Standardi</h3>
  <h4 className="text-2xl md:text-3xl font-black text-blue-500 uppercase italic tracking-tighter">Specijalizovani <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">Demo Projekti</span></h4>
</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-2 md:px-8 mx-auto">
            {demoProjekti.length === 0 ? (
               <div className="col-span-full text-center py-10 text-zinc-500 uppercase tracking-widest text-[10px] font-black">
                 Trenutno nema unetih demo projekata. Dodajte ih iz Admin Panela.
               </div>
            ) : (
              demoProjekti.map((item, i) => (
                <div key={item.id || i} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(234,88,12,0.2)]">
                  <div className="aspect-video relative overflow-hidden bg-zinc-900">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="w-10 h-10 bg-orange-600/20 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h5 className="text-[13px] md:text-[14px] font-black text-blue-500 uppercase tracking-wider mb-1 line-clamp-1">{item.name}</h5>
                   <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mb-6 line-clamp-1">{item.desc}</p>
                    <a href={item.img} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[9px] font-black text-orange-500 uppercase tracking-widest border border-orange-500/20 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all">Pogledaj Dizajn <ExternalLink className="w-3 h-3" /></a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="max-w-4xl mx-auto mt-16 px-4">
            <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(234,88,12,0.1)] relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Layers className="w-10 h-10 text-orange-500 mx-auto mb-4 animate-pulse" />
              <h4 className="text-[18px] md:text-[22px] font-black text-white uppercase tracking-widest mb-3 italic">V8 Kolekcija se neprestano širi</h4>
              <p className="text-[10px] md:text-[12px] text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Uskoro otključavamo još ekskluzivnih premium šablona za različite industrije. <br className="hidden md:block mt-1"/> 
                <span className="text-orange-400">Svaki šablon je moćna osnova koju u potpunosti prilagođavamo <br className="hidden md:block"/> vizuelnom identitetu vašeg brenda.</span>
              </p>
            </div>
          </div>

      </div>
    </div>
  );
}
/// KRAJ FUNKCIJE: IzradaSajtovaPage ///

/// POČETAK FUNKCIJE: HomePage ///
function HomePage({ apps = [] }) {
  const [activeSlide, setActiveSlide] = useState(0); 
  const [liveVideos, setLiveVideos] = useState([]); 
  const [isLoadingVideos, setIsLoadingVideos] = useState(true); 
  const location = useLocation();
  const sortedApps = [...apps].sort((a, b) => Number(b.id) - Number(a.id));
  
  const [ipsModalData, setIpsModalData] = useState(null);
  const [hasEnhancerAccess, setHasEnhancerAccess] = useState(false);
  const [showWelcomeBox, setShowWelcomeBox] = useState(true);

  const closeBox = () => setShowWelcomeBox(false);

  // ==========================================
  // 🚀 V8 YOUTUBE MOTOR (AUTOMATSKO POVLAČENJE)
  // ==========================================
  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      try {
        // ⚠️ UNESI SVOJ PRAVI YOUTUBE CHANNEL ID OVDE:
        const channelId = "UC6ilBUks_oFMSD8CE9qD6lQ"; 
        
        // maxResults=8 znači da će povući tvojih poslednjih 8 videa
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=8&order=date&type=video&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(url);
        const ytData = await response.json();
        
        if (ytData.items && ytData.items.length > 0) {
          // 🚀 V8 PREVODILAC: Pakujemo YouTube podatke u format koji TutorialCard razume bez pucanja!
          const praviVidei = ytData.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
          }));
          
          setLiveVideos(praviVidei);
        } else {
          throw new Error("Prazan YouTube odgovor ili loš ID"); 
        }
      } catch (error) {
        console.log("⚠️ V8 Info: YouTube API nije prošao, palim rezervne vizuale...");
        
        // 🛡️ V8 REZERVA: Čisti podaci koji 100% rade
        setLiveVideos([
          { id: "v8-1", title: "V8 Premium Edukacija 1", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg" },
          { id: "v8-2", title: "V8 Intel Protokol 2", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg" },
          { id: "v8-3", title: "V8 Tajne Zanata 3", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg" },
          { id: "v8-4", title: "V8 Masterclass 4", url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg" }
        ]);
      } finally {
        setIsLoadingVideos(false); // Gasi animaciju učitavanja
      }
    };

    fetchYouTubeVideos();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === "damnjanovicgoran7@gmail.com") {
          setHasEnhancerAccess(true);
        } else {
          try {
            const docRef = doc(db, "vip_users", user.email.toLowerCase());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().unlockedApps && (docSnap.data().unlockedApps.includes('FULL_ACCESS') || docSnap.data().unlockedApps.includes('10X_ENHANCER'))) {
              setHasEnhancerAccess(true);
            } else { setHasEnhancerAccess(false); }
          } catch(e) { setHasEnhancerAccess(false); }
        }
      } else { setHasEnhancerAccess(false); }
    });
    return () => unsubscribe();
  }, []);

  const handlePaymentV8 = async (tip, cena) => {
    if (auth.currentUser) {
      try { await setDoc(doc(db, "posetioci", auth.currentUser.uid), { poslednjiKlik: serverTimestamp(), zainteresovanZa: tip }, { merge: true }); } catch (err) {}
      setIpsModalData({ tip, cena });
    } else {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await setDoc(doc(db, "posetioci", user.uid), { 
          ime: user.displayName, 
          email: user.email, 
          vremePrijave: serverTimestamp(), 
          zainteresovanZa: tip, 
          identitet: "V8-Klijent" 
        }, { merge: true });
        
        const docRef = doc(db, "vip_users", user.email.toLowerCase());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().unlockedApps && (docSnap.data().unlockedApps.includes('10X_ENHANCER') || docSnap.data().unlockedApps.includes('FULL_ACCESS'))) {
            setHasEnhancerAccess(true);
            if(typeof v8Toast !== 'undefined') v8Toast.success("Dobrodošli nazad! Pristup je već otključan.");
        } else {
            setIpsModalData({ tip, cena });
        }
      } catch (error) { 
        if(typeof v8Toast !== 'undefined') v8Toast.error("Greška pri prijavi preko Google-a!"); 
      }
    }
  };
  
  useEffect(() => { if (location.hash === '#marketplace') { const el = document.getElementById('marketplace'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }, [location]);
  const nextSlide = useCallback(() => setActiveSlide(s => (s + 1) % (data.BANNER_DATA?.length || 1)), []);
  const prevSlide = () => setActiveSlide(s => (s - 1 + (data.BANNER_DATA?.length || 1)) % (data.BANNER_DATA?.length || 1));
  useEffect(() => { const t = setInterval(nextSlide, 7000); return () => clearInterval(t); }, [nextSlide]);
  
  return (
    <>
      <Helmet><title>AI TOOLS PRO SMART | PROMPT GENERATOR</title></Helmet>

      {/* --- POČETAK V8 PREMIUM BOX-A --- */}
      <AnimatePresence>
        {showWelcomeBox && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-orange-500/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(234,88,12,0.25)] text-center overflow-hidden group"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-orange-600/10 blur-[60px] rounded-full pointer-events-none"></div>

              <div 
                onClick={closeBox}
                className="absolute top-6 right-6 flex flex-col items-center justify-center cursor-pointer z-20 group/close"
              >
                <X className="w-8 h-8 text-orange-500 group-hover/close:text-white transition-colors duration-300 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)] animate-pulse" strokeWidth={2.5} />
                <span className="text-[9px] text-zinc-500 group-hover/close:text-white uppercase tracking-[0.2em] mt-1 font-black transition-colors">zatvori me</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-orange-500 mb-4 opacity-80" />
                
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-6 italic">
                  Dobrodošli u <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]">V8 Mrežu</span>
                </h2>
                
                <p className="text-zinc-300 text-[14px] md:text-[15px] leading-relaxed mb-8 font-medium max-w-lg mx-auto">
                  Dragi naši posetioci i korisnici sajta, obaveštavamo Vas da je sajt tek postavljen. 
                  Imamo mnogo funkcija i usluga koje već rade, a ubrzo dodajemo nove, specijalno skrojene za Vaše potrebe.
                </p>

                <div className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 hover:border-orange-500/30 transition-colors duration-500">
                  <p className="text-zinc-300 text-[14px] md:text-[16px] leading-relaxed mb-6 font-bold">
                    Jedna od stvari koje odmah možemo da počnemo da radimo je izrada <br className="hidden md:block"/>
                    <span className="text-orange-400 uppercase tracking-widest text-[18px] drop-shadow-md">Premium Web Sajtova</span>
                  </p>
                  
                  <Link 
                    to="/izrada-sajtova" 
                    onClick={closeBox}
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-4 rounded-xl font-black text-[12px] md:text-[14px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] hover:scale-105 transition-all duration-300"
                  >
                    Pogledajte Template <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                <p className="text-zinc-500 text-[11px] uppercase tracking-[0.3em] font-black mb-4">
                  Uskoro počinjemo punim potencijalom!
                </p>
                
                <p className="text-orange-500 font-black italic tracking-widest text-[13px]">
                  Vaš ai-alati tim
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- KRAJ V8 PREMIUM BOX-A --- */}
      
      <div id="home-banner" className="relative w-full h-[85vh] flex items-end overflow-hidden bg-black text-white border-b border-orange-500/20">
        <div className="absolute inset-0 z-0 bg-black">{(data.BANNER_DATA || []).map((item, idx) => (<div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeSlide ? 'opacity-100' : 'opacity-0'} z-0`}><img src={item.image} loading={idx === 0 ? "eager" : "lazy"} className="w-full h-full object-cover opacity-80" alt="banner" /></div>))}</div>
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
         <div className="text-[13px] md:text-[15px] font-black text-green-500 uppercase tracking-[0.2em] mb-4">Premium 3-u-1 alat vredan 200$/mesečno. SAMO 20.000 RSD DOŽIVOTNO.</div>
          <CountdownTimer />
          <p className="text-zinc-400 text-[10px] md:text-[12px] max-w-2xl font-medium uppercase tracking-[0.2em] leading-relaxed mt-10 mb-10 mx-auto">
            <span className="font-black text-white">PRISTUPI PREMIUM AI SISTEMU ZA INŽENJERING PROMPTOVA. PRETVORI JEDNOSTAVNE IDEJE ILI SLIKU U REMEK-DELA.</span><br /><br />
            <span className="text-orange-500 font-black uppercase">UNESI SVOJ PROMPT; MI ĆEMO GA DETALJNO ANALIZIRATI I POBOLJŠATI DA BUDE 10X BOLJI.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
            {hasEnhancerAccess ? (
              <Link to="/enxance" className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-12 py-4 rounded-xl font-black text-[13px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-colors flex items-center justify-center hover:scale-105 cursor-pointer">🚀 UĐI U APLIKACIJU</Link>
            ) : (
              <>
              <button type="button" onClick={() => handlePaymentV8('10X Enhancer - Doživotno', 20000)} className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-colors flex items-center justify-center cursor-pointer">KUPI SAD</button>
             <Link 
  to="/reklama-10x" 
  className="bg-[#ea580c] hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-colors flex items-center justify-center cursor-pointer"
>
  POGLEDAJ DEMO
</Link>
              </>
            )}
          </div>
        </div>

        <section id="izrada-sajtova" className="mb-24 py-20 px-6 relative overflow-hidden bg-[#050505] border-b border-white/5 scroll-mt-32">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white uppercase italic">POTREBAN VAM JE <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)]">OVAKAV SAJT?</span></h2>
              <p className="text-zinc-300 font-black tracking-[0.3em] uppercase text-[10px] md:text-[12px] drop-shadow-md">V8 DIGITAL AGENCY — PREMIUM WEB REŠENJA ZA VAŠ BIZNIS</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 group">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"><Layers className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight italic text-left">V8 Vizuelni Identitet</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed font-medium text-left">Sajt koji ostavlja konkurenciju u prašini. Ultra-moderan dizajn optimizovan da svaki posetilac postane kupac.</p>
              </div>
              <div className="bg-[#0a0a0a] border border-orange-500/30 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-[0_0_40px_rgba(234,88,12,0.05)]">
                <div className="absolute top-0 right-0 bg-orange-500 text-black text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-xl font-sans">NAJTRAŽENIJE</div>
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"><Zap className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight italic text-left">IPS Instant Naplata</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed font-medium text-left">Zaboravite na bankarske provizije. Implementiramo QR kod plaćanje direktno na vaš račun. Brzo i sigurno.</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/50 transition-all duration-500 group">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"><Settings className="text-orange-500 w-7 h-7" /></div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight italic text-left">Smart Admin Panel</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed font-medium text-left">Dobijate potpunu kontrolu. Menjajte cene, slike i tekstove sami, bez potrebe za plaćanjem programera.</p>
              </div>
            </div>
            <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4">
              <MagneticButton href="mailto:damnjanovicgoran7@gmail.com" className="bg-white text-black px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all w-full sm:w-auto text-center">ZAKAŽI BESPLATNE KONSULTACIJE</MagneticButton>
              <Link to="/izrada-sajtova" className="bg-orange-600 text-white px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-orange-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.4)] w-full sm:w-auto justify-center">VIŠE DETALJA <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        <div id="marketplace" className="flex items-center gap-4 mb-6 text-left">
          <div className="flex items-center gap-2.5 shrink-0"><Sparkles className="text-blue-500 w-6 h-6" /><h3 className="text-white font-black uppercase text-[20px] tracking-widest italic text-left">Premium Prodavnica AI Sredstava</h3></div>
          <div className="h-[1px] w-32 bg-gradient-to-r from-blue-500/80 to-transparent"></div>
        </div>
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-5 mb-10 shadow-[0_0_15px_rgba(37,99,235,0.1)] flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-blue-500 shrink-0 mt-1 animate-pulse" />
          <p className="text-[11px] md:text-[13px] text-zinc-300 font-medium uppercase tracking-[0.1em] leading-relaxed text-left"><span className="text-blue-400 font-black">VAŽNA NAPOMENA:</span> Svi proizvodi iz sekcije Premium Prodavnica AI Sredstava su sajtovi koji koriste <span className="text-white font-bold">isključivo engleski jezik</span> za generisanje promptova radi boljeg postizanja rezultata.</p>
        </motion.div>
        
        {/* --- POČETAK FUNKCIJE: Rotirajući V8/Gemini Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
          {sortedApps.map((app, index) => (
            <div key={app.id} className="relative p-[2px] rounded-[2.1rem] overflow-hidden group transition-all duration-500 hover:scale-[1.02]">
              
              {/* 1. ANIMIRANA IVICA (Vuče Google boje iz tvog index.css i vrti ih 24/7 oko centra) */}
              <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] v8-ai-aura opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* 2. UNUTRAŠNJA KARTICA (Crna pozadina koja ostavlja samo onaj 2px okvir da svetli i kruži) */}
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden bg-[#050505] z-10 flex flex-col">
                {/* --- POČETAK FUNKCIJE: MarketplaceCard --- */}
                <MarketplaceCard app={app} index={index} />
                {/* --- KRAJ FUNKCIJE: MarketplaceCard --- */}
              </div>

              {/* 3. GLOW EFEKAT ISPOD (Mutna verzija tvoje CSS animacije za pozadinski sjaj koji se takođe vrti) */}
              <div className="absolute -inset-4 animate-[spin_4s_linear_infinite] v8-ai-aura opacity-20 group-hover:opacity-50 blur-2xl transition-opacity duration-700 pointer-events-none z-0"></div>

            </div>
          ))}
        </div>
        {/* --- KRAJ FUNKCIJE: Rotirajući V8/Gemini Grid --- */}

      </div> {/* ZATVARA GLAVNI max-w-7xl KONTEJNER */}

      {/* MODAL ZA IPS UPLATU */}
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
                
                {/* NOVI KONTAKT BLOK SA VIBEROM I WHATSAPPOM */}
                <div className="mt-8 w-full bg-[#050505] border border-orange-500/30 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(234,88,12,0.15)]">
                  <p className="text-[11px] md:text-[12px] text-zinc-400 font-black uppercase tracking-widest mb-4">Nakon uplate, pošaljite nam dokaz na:</p>
                  <div className="flex flex-col gap-3">
                    <a href="mailto:aitoolsprosmart@gmail.com" onClick={(e) => { navigator.clipboard.writeText('aitoolsprosmart@gmail.com'); if (typeof v8Toast !== 'undefined') v8Toast.success('Email adresa je kopirana!'); }} className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-400 py-3 rounded-xl font-black text-[12px] md:text-[14px] tracking-widest transition-all cursor-pointer shadow-inner">
                      📧 aitoolsprosmart@gmail.com
                    </a>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <a href="viber://chat?number=%2B381648201496" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#7360f2]/10 border border-[#7360f2]/30 hover:bg-[#7360f2]/20 hover:border-[#7360f2] text-[#7360f2] py-3 rounded-xl font-black text-[11px] md:text-[12px] tracking-widest transition-all cursor-pointer">
                        🟣 VIBER
                      </a>
                      <a href="https://wa.me/381648201496" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 hover:border-[#25D366] text-[#25D366] py-3 rounded-xl font-black text-[11px] md:text-[12px] tracking-widest transition-all cursor-pointer">
                        🟢 WHATSAPP
                      </a>
                    </div>
                  </div>
                  <span className="block mt-5 text-[10px] text-zinc-500 uppercase font-black tracking-widest">Sistem će vam odmah otključati pristup! 🚀</span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
/// KRAJ FUNKCIJE: HomePage ///
 
/// POČETAK FUNKCIJE: AdminDemoProjekti ///
const AdminDemoProjekti = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [demoList, setDemoList] = useState([]);

  useEffect(() => {
    const fetchList = async () => {
      const snap = await getDocs(collection(db, "demo_projekti"));
      setDemoList(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    };
    fetchList();
  }, [isUploading]);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setIsUploading(true);
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
      const resData = await res.json();
      await addDoc(collection(db, "demo_projekti"), { name, desc, img: resData.secure_url, createdAt: Date.now() }); 
      setName(''); setDesc(''); v8Toast.success("Demo uspešno dodat!");
    } catch (err) { v8Toast.error("Greška pri uploadu!"); } finally { setIsUploading(false); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Brisanjem uklanjate demo sa sajta. Nastaviti?")) {
      await deleteDoc(doc(db, "demo_projekti", id));
      setDemoList(prev => prev.filter(item => item.id !== id));
      v8Toast.success("Obrisano.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-3"><Layers className="w-6 h-6"/> Dodaj Novi Demo Projekt</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ime (npr. V8 AUTO GARAŽA)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white flex-1 outline-none focus:border-orange-500" />
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opis (npr. Premium servis i tuning)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white flex-1 outline-none focus:border-orange-500" />
        </div>
        <label className={`bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest inline-flex items-center transition-all ${(!name || !desc || isUploading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UploadCloud className="w-5 h-5 mr-2" />}
          {isUploading ? "Zapisivanje u bazu..." : "Izaberi sliku i Snimi"}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={!name || !desc || isUploading} className="hidden" />
        </label>
        <p className="text-[10px] font-black text-zinc-500 uppercase mt-4">Pravilo: Prvo ukucaj ime i opis, pa tek onda izaberi sliku. Sistem sve automatski šalje na sajt.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Trenutni Demo Projekti ({demoList.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demoList.map(item => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#050505]">
              <img src={item.img} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" alt={item.name} />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-center">
                <p className="text-[9px] font-black text-orange-500 uppercase truncate">{item.name}</p>
              </div>
              <button type="button" onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
/// KRAJ FUNKCIJE: AdminDemoProjekti ///

/// POČETAK FUNKCIJE: AdminMikroAlati ///
const AdminMikroAlati = () => {
  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [cena, setCena] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [mockText, setMockText] = useState('');
  const [ikona, setIkona] = useState('Zap');
  const [lista, setLista] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const snap = await getDocs(collection(db, "v8_mikro_alati"));
      setLista(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    };
    fetchList();
  }, [isUploading]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await addDoc(collection(db, "v8_mikro_alati"), { naziv, opis, cena, placeholder, mockText, ikona, createdAt: Date.now() });
      setNaziv(''); setOpis(''); setCena(''); setPlaceholder(''); setMockText('');
      v8Toast.success("Alat uspešno dodat u V8 Bazu!");
    } catch (err) { v8Toast.error("Greška pri dodavanju!"); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Brisanjem uklanjate alat sa sajta. Nastaviti?")) {
      await deleteDoc(doc(db, "v8_mikro_alati", id));
      setLista(prev => prev.filter(item => item.id !== id));
      v8Toast.success("Alat obrisan.");
    }
  };

  const renderIkona = (ikonaStr) => {
    if(ikonaStr === 'Mail') return <Mail className="w-5 h-5 text-blue-500" />;
    if(ikonaStr === 'Briefcase') return <Briefcase className="w-5 h-5 text-green-500" />;
    return <Zap className="w-5 h-5 text-orange-500" />;
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-3"><Zap className="w-6 h-6"/> Dodaj Novi Mikro Alat</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={naziv} onChange={e => setNaziv(e.target.value)} placeholder="Naziv Alata (npr. V8 KOPIRAJTER)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none focus:border-orange-500" required />
            <input type="text" value={cena} onChange={e => setCena(e.target.value)} placeholder="Cena (npr. 150 RSD)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white outline-none focus:border-orange-500" required />
          </div>
          <input type="text" value={opis} onChange={e => setOpis(e.target.value)} placeholder="Kratak opis (Šta alat radi)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white w-full outline-none focus:border-orange-500" required />
          <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} placeholder="Placeholder u polju (Npr: Unesite tekst ovde...)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white w-full outline-none focus:border-orange-500" required />
          <textarea value={mockText} onChange={e => setMockText(e.target.value)} placeholder="Rezultat koji AI generiše (Tekst koji se otkriva na kraju)" className="bg-black border border-white/10 p-4 rounded-xl text-[13px] text-white w-full h-32 outline-none focus:border-orange-500 font-mono" required />
          
          <div className="flex gap-4 items-center mt-4">
             <span className="text-[11px] font-black uppercase text-zinc-500">Izaberi Ikonu Alata:</span>
             <div className="flex gap-3">
                <button type="button" onClick={() => setIkona('Zap')} className={`p-3 rounded-xl border flex items-center justify-center transition-all ${ikona === 'Zap' ? 'bg-orange-600/20 border-orange-500' : 'bg-black border-white/10 hover:border-orange-500/50'}`}><Zap className={`w-5 h-5 ${ikona === 'Zap' ? 'text-orange-500' : 'text-zinc-500'}`} /></button>
                <button type="button" onClick={() => setIkona('Mail')} className={`p-3 rounded-xl border flex items-center justify-center transition-all ${ikona === 'Mail' ? 'bg-blue-600/20 border-blue-500' : 'bg-black border-white/10 hover:border-blue-500/50'}`}><Mail className={`w-5 h-5 ${ikona === 'Mail' ? 'text-blue-500' : 'text-zinc-500'}`} /></button>
                <button type="button" onClick={() => setIkona('Briefcase')} className={`p-3 rounded-xl border flex items-center justify-center transition-all ${ikona === 'Briefcase' ? 'bg-green-600/20 border-green-500' : 'bg-black border-white/10 hover:border-green-500/50'}`}><Briefcase className={`w-5 h-5 ${ikona === 'Briefcase' ? 'text-green-500' : 'text-zinc-500'}`} /></button>
             </div>
          </div>

          <button type="submit" disabled={isUploading} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all w-full mt-6 shadow-[0_0_15px_rgba(234,88,12,0.4)]">
            {isUploading ? "Zapisivanje u Bazu..." : "Dodaj Alat na Sajt"}
          </button>
        </form>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Aktivni Alati ({lista.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lista.map(item => (
            <div key={item.id} className="relative group bg-black border border-white/10 p-5 rounded-2xl flex flex-col gap-3 hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {renderIkona(item.ikona)}
                  <span className="text-[13px] font-black text-white uppercase tracking-widest">{item.naziv}</span>
                </div>
                <button type="button" onClick={() => handleDelete(item.id)} className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold bg-white/5 px-3 py-1.5 rounded-lg w-fit">Cena: {item.cena}</span>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{item.opis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
/// KRAJ FUNKCIJE: AdminMikroAlati ///

/// POČETAK FUNKCIJE: AdminPage ///
const AdminPage = ({ apps = [], refreshData }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [authChecking, setAuthChecking] = useState(true); 
  const [adminTab, setAdminTab] = useState('assets'); 
  const [isUploading, setIsUploading] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [promoVideo, setPromoVideo] = useState("");
  const [promoImages, setPromoImages] = useState("");

  const [editingId, setEditingId] = useState(null); 
  const initialForm = { id: '', name: '', category: 'AI ASSET', type: '', headline: '', price: '', priceLifetime: '', description: '', media: [], whopLink: '', reactSourceCode: '', gumroadLink: '', faq: Array.from({ length: 7 }, () => ({ q: '', a: '' })) }; 
  const [formData, setFormData] = useState(initialForm); 
  const sortedAppsAdmin = [...apps].sort((a, b) => Number(b.id) - Number(a.id));

  const [vipEmail, setVipEmail] = useState('');
  const [vipList, setVipList] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]); 

  const [gallery, setGallery] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  // --- V8 IPS MOCK PODACI ---
  const [zahtevi, setZahtevi] = useState([
    { id: 1, klijent: "Marko M.", film: "GLADIATOR", vreme: "Pre 2 min", status: "ceka_uplatu" },
    { id: 2, klijent: "Studio X", film: "MATRIX", vreme: "Pre 15 min", status: "ceka_uplatu" },
  ]);

  const otkljucajKlijentu = (id) => {
    setZahtevi(zahtevi.filter(z => z.id !== id));
    if(typeof v8Toast !== 'undefined') v8Toast.success("IPS Uplata potvrđena! Klijentu je otključan 4K vizual.");
  };
  // --------------------------

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "damnjanovicgoran7@gmail.com") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setAuthChecking(false); 
    });
    return () => unsub();
  }, []);

  const fetchAllFirebaseData = async () => {
    try {
      const vipSnap = await getDocs(collection(db, "vip_users"));
      setVipList(vipSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.addedAt - a.addedAt));
      const galSnap = await getDocs(collection(db, "enhancer_gallery"));
      setGallery(galSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
      const anSnap = await getDocs(collection(db, "analytics"));
      setAnalyticsData(anSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
    } catch(e) {}
  };

  useEffect(() => { if (isAuthenticated) fetchAllFirebaseData(); }, [isAuthenticated]);

  const handleGoogleLogin = async (e) => { 
    e.preventDefault(); 
    try { 
      const result = await signInWithPopup(auth, provider); 
      if (result.user.email === "damnjanovicgoran7@gmail.com") { setIsAuthenticated(true); v8Toast.success("Admin prijava uspešna!"); } 
      else { v8Toast.error("Samo Goran ima pristup Admin Panelu!"); await signOut(auth); } 
    } catch (err) { v8Toast.error("Greška: " + err.message); } 
  };

  const handleEditClick = (app) => { 
    const parts = (app.whopLink || "").split("[SPLIT]"); 
    const loadedFaq = app.faq || []; 
    const paddedFaq = Array.from({ length: 7 }, (_, i) => loadedFaq[i] || { q: '', a: '' }); 
  setFormData({ ...app, whopLink: parts[0] || '', reactSourceCode: parts[1] || '', gumroadLink: app.gumroadLink || '', faq: paddedFaq }); 
  setEditingId(app.id); setAdminTab('assets'); window.scrollTo(0, 0); 
};

// 🚀 DIREKTNO UPISIVANJE U FIREBASE BAZU (BEZ NODE.JS-A)
const handleSubmit = async (e) => { 
  e.preventDefault(); 
  const finalId = formData.id ? String(formData.id).trim() : (editingId || null);
  
  const payload = { 
    ...formData, 
    whopLink: `${formData.whopLink}[SPLIT]${formData.reactSourceCode}`, 
    faq: formData.faq.filter(f => f.q && f.a),
    updatedAt: serverTimestamp()
  }; 
  
  if (!editingId) payload.createdAt = serverTimestamp();
  delete payload.id; // Firebase sam postavlja ime dokumenta

  try { 
    if (editingId) {
       await setDoc(doc(db, "v8_products", editingId), payload, { merge: true });
       v8Toast.success("Proizvod uspešno ažuriran u V8 bazi!");
    } else if (finalId) {
       await setDoc(doc(db, "v8_products", finalId), payload);
       v8Toast.success("Novi proizvod dodat u V8 bazu!");
    } else {
       await addDoc(collection(db, "v8_products"), payload);
       v8Toast.success("Novi proizvod dodat u V8 bazu!");
    }
    setFormData(initialForm); setEditingId(null); refreshData(); 
  } catch (err) { 
    console.error(err);
    v8Toast.error("Greška pri čuvanju proizvoda u Firebase!"); 
  } 
}; 

const handleImageUpload = async (e) => { 
  const files = Array.from(e.target.files); setIsUploading(true); 
  for (const file of files) { 
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET); 
    try { 
      const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd }); 
      const resData = await res.json(); 
      setFormData(prev => ({ ...prev, media: [...prev.media, { url: resData.secure_url, type: file.type.startsWith('video/') ? 'video' : 'image' }] })); 
    } catch (err) {} 
  } setIsUploading(false); 
};

// 🚀 DIREKTNO BRISANJE IZ FIREBASE BAZE
const handleDeleteAsset = async (appId) => {
  if(window.confirm("Trajno obrisati ovaj proizvod sa sajta?")) { 
    try {
      await deleteDoc(doc(db, "v8_products", appId));
      refreshData(); v8Toast.success("Proizvod uspešno obrisan iz V8 baze!"); 
    } catch(e) {
      v8Toast.error("Greška pri brisanju!");
    }
  }
};

const handleAddVip = async (e) => {
  e.preventDefault(); 
  if(!vipEmail) return v8Toast.error("Unesi email kupca!");
  if(selectedApps.length === 0) return v8Toast.error("Izaberi bar jedan proizvod koji mu otključavaš!");
  const emailLower = vipEmail.trim().toLowerCase();
  try { 
    await setDoc(doc(db, "vip_users", emailLower), { addedAt: Date.now(), unlockedApps: selectedApps }, { merge: true }); 
    setVipEmail(''); setSelectedApps([]); fetchAllFirebaseData(); v8Toast.success(`Pristup uspešno dodeljen!`); 
  } catch(e) { v8Toast.error("Greška pri dodavanju u bazu!"); }
};

const handleDeleteVip = async (id) => { 
  if(window.confirm(`Izbrisati ${id} iz VIP baze i oduzeti mu sav pristup?`)) { await deleteDoc(doc(db, "vip_users", id)); fetchAllFirebaseData(); v8Toast.success("Korisnik trajno obrisan."); } 
};

const handleUploadGallery = async (e) => {
  const file = e.target.files[0]; if (!file) return; setIsUploading(true);
  const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', data.CLOUDINARY_UPLOAD_PRESET);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${data.CLOUDINARY_CLOUD_NAME}/upload`, { method: 'POST', body: fd });
    const resData = await res.json();
    await addDoc(collection(db, "enhancer_gallery"), { url: resData.secure_url, createdAt: Date.now() }); fetchAllFirebaseData();
  } catch (err) {} finally { setIsUploading(false); }
};

const handleDeleteGallery = async (id) => { if(window.confirm("Obrisati sliku iz Enhancer galerije?")) { await deleteDoc(doc(db, "enhancer_gallery", id)); fetchAllFirebaseData(); } };

if (authChecking) return (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>
);

if (!isAuthenticated) return (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 text-center">
    <div className="bg-[#0a0a0a] p-12 rounded-[2rem] border-2 border-red-900 shadow-[0_0_30px_rgba(185,28,28,0.2)] max-w-md w-full relative group">
      <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-10 animate-pulse" />
      <button onClick={handleGoogleLogin} className="w-full rounded-2xl bg-gradient-to-r from-red-900 to-red-600 px-6 py-5 font-black uppercase text-[12px] tracking-widest text-white shadow-xl hover:shadow-[0_0_20px_rgba(185,28,28,0.3)] transition-all flex items-center justify-center gap-3"><Zap className="w-5 h-5" /> PRIJAVI SE KAO GORAN</button>
    </div>
  </div>
);

return (
  <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-sans text-left text-white relative">
    <div className="flex gap-4 mb-12 border-b border-white/5 pb-6 overflow-x-auto custom-scrollbar">
       <button type="button" onClick={() => setAdminTab('assets')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'assets' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Award className="w-4 h-4 inline mr-2" /> Assets Manager</button>
       <button type="button" onClick={() => setAdminTab('enhancer')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'enhancer' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Sparkles className="w-4 h-4 inline mr-2" /> Enhancer Gallery</button>
       <button type="button" onClick={() => setAdminTab('demo')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'demo' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Layers className="w-4 h-4 inline mr-2" /> Demo Projekti</button>
       <button type="button" onClick={() => setAdminTab('vip')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'vip' ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Users className="w-4 h-4 inline mr-2" /> VIP Baza</button>
       <button type="button" onClick={() => setAdminTab('analytics')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'analytics' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><BarChart className="w-4 h-4 inline mr-2" /> V8 Analytics</button>
       <button type="button" onClick={() => setAdminTab('mikroalati')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'mikroalati' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Zap className="w-4 h-4 inline mr-2" /> Mikro Alati</button>
       <div className="w-[1px] h-10 bg-white/10 mx-2 hidden md:block"></div>
       <button type="button" onClick={() => setAdminTab('ips_zahtevi')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'ips_zahtevi' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}>
         <QrCode className="w-4 h-4 inline mr-2" /> IPS Odobrenja
         {zahtevi.length > 0 && <span className="ml-2 bg-white text-red-600 px-1.5 py-0.5 rounded-full text-[9px]">{zahtevi.length}</span>}
       </button>
       <button type="button" onClick={() => setAdminTab('v8_alati')} className={`shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${adminTab === 'v8_alati' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}><Camera className="w-4 h-4 inline mr-2" /> V8 Pixar Bypass</button>
       {/* POČETAK: 10X Promo Dugme */}
<button
  onClick={() => setAdminTab('promo_10x')}
  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
    adminTab === 'promo_10x' 
      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
      : 'text-zinc-400 hover:bg-white/10 hover:text-white'
  }`}
>
  <Zap className="w-4 h-4 inline mr-2" /> 10X Promo
</button>
{/* KRAJ: 10X Promo Dugme */}
    </div>

    {adminTab === 'ips_zahtevi' && (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
          <div className="mb-8"><h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">IPS ODOBRENJA</h1><p className="text-zinc-500 text-[12px] font-bold tracking-widest uppercase">Klijenti koji čekaju otključavanje V8 vizuala (Mockup Prikaz)</p></div>
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-[2rem] p-4 shadow-[0_0_40px_rgba(234,88,12,0.05)]">
            {zahtevi.length === 0 ? (
              <div className="text-center py-20 opacity-50"><CheckCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" /><p className="text-[12px] font-black uppercase tracking-widest text-zinc-500">Svi IPS zahtevi su rešeni.</p></div>
            ) : (
              <div className="space-y-3">
                {zahtevi.map((z) => (
                  <div key={z.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl bg-[#050505] border border-white/5 hover:border-orange-500/30 transition-all gap-4">
                    <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-full bg-orange-600/10 flex items-center justify-center border border-orange-500/30 shrink-0"><ImageIcon className="w-5 h-5 text-orange-500" /></div><div><h3 className="text-[14px] font-black uppercase tracking-widest text-white">{z.klijent}</h3><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Traži: <span className="text-orange-400">{z.film}</span> • {z.vreme}</p></div></div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto"><div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-black uppercase tracking-widest text-center">Skenirao QR</div><button onClick={() => otkljucajKlijentu(z.id)} className="px-6 py-3 w-full md:w-auto rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(234,88,12,0.4)]">OTKLJUČAJ (POTVRDI)</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    )}

    {adminTab === 'v8_alati' && (
      <div className="animate-in fade-in duration-500 w-full">
        <div className="mb-4 text-center"><h1 className="text-2xl font-black uppercase tracking-widest text-orange-500 mb-2">MASTER BYPASS AKTIVAN</h1><p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Generiši premium vizuale bez IPS naplate.</p></div>
        <div className="origin-top scale-[0.9] -mt-16"><V8PixarSelfiePage isAdmin={true} /></div>
      </div>
    )}


{/* POČETAK: V8 10X PROMO FORMA */}
{adminTab === 'promo_10x' && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto mt-8 w-full px-4">
    <div className="bg-[#0a0a0a] border border-orange-500/20 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(234,88,12,0.1)]">
      
      <div className="flex items-center gap-3 mb-8 border-b border-orange-500/20 pb-4">
        <Zap className="w-8 h-8 text-orange-500" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
          Podešavanje 10X Reklame
        </h2>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* GLAVNI VIDEO */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-orange-500" /> Glavni Video (URL)
          </label>
          <input 
            type="text" 
            value={promoVideo} 
            onChange={(e) => setPromoVideo(e.target.value)} 
            className="w-full bg-black border border-white/10 hover:border-orange-500/50 focus:border-orange-500 rounded-xl p-4 text-[13px] text-white transition-all outline-none"
            placeholder="Unesi link do MP4 videa" 
          />
        </div>

        {/* GALERIJA SLIKA */}
        <div className="flex flex-col gap-2">
          {/* POČETAK FUNKCIJE: V8 Upload Modul */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2 mb-1">
            <ImageIcon className="w-4 h-4 text-orange-500" /> Trakica Slika (Upload)
          </label>
          
          <div className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-orange-500/30 rounded-xl bg-black hover:border-orange-500/60 hover:bg-orange-500/5 transition-all duration-300 cursor-pointer group overflow-hidden">
            
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                // Ovde kasnije kačimo tvoju Firebase ili Cloudinary funkciju
                const files = e.target.files;
                if(files.length > 0 && typeof v8Toast !== 'undefined') {
                  v8Toast.success(`Selektovano ${files.length} slika! V8 spreman za upload.`);
                }
              }}
            />
            
            <div className="flex flex-col items-center justify-center pointer-events-none z-0">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-[13px] text-zinc-300 font-bold group-hover:text-white transition-colors">
                Klikni ili prevuci slike ovde
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-2 font-black">
                Podržano: JPG, PNG, WEBP
              </p>
            </div>

            {/* V8 Hover Efekat Linija */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-orange-600 to-yellow-500 group-hover:w-full transition-all duration-500"></div>
          </div>
        </div>
        {/* KRAJ FUNKCIJE: V8 Upload Modul */}
        </div>
        
        {/* DUGME ZA ČUVANJE */}
        <button 
          onClick={() => {
            if(typeof v8Toast !== 'undefined') v8Toast.success("V8 Reklama Ažurirana! BOMBA!");
          }}
          className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-2 w-full md:w-auto self-end cursor-pointer"
        >
          <CheckCircle className="w-5 h-5" /> Sačuvaj Podešavanja
        </button>

      </div>
    </div>
  </div>
)}
{/* KRAJ: V8 10X PROMO FORMA */}


    {adminTab === 'assets' && (
      <div className="flex flex-col gap-12">
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
             <div className="flex items-center gap-3 mb-6"><Settings className="w-6 h-6 text-orange-500" /><h2 className="text-xl font-black text-orange-500 uppercase tracking-widest">{editingId ? 'Edit Product' : 'Add New Product'}</h2></div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="Custom ID (Opciono)" className="bg-black border border-orange-500/50 p-3 rounded-xl text-[11px] text-orange-400 font-black outline-none" />
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ime Proizvoda" className="bg-black border border-white/10 p-3 rounded-xl text-[11px] md:col-span-1" required />
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Kategorija" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" />
                <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Tip" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Standardna Cena" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /><input type="text" value={formData.priceLifetime} onChange={e => setFormData({...formData, priceLifetime: e.target.value})} placeholder="Lifetime Cena" className="bg-black border border-white/10 p-3 rounded-xl text-[11px]" /></div>
             <div className="grid grid-cols-1 gap-4"><input type="text" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} placeholder="Podnaslov" className="bg-black border border-white/10 p-3 rounded-xl text-[11px] w-full" /></div>
             <div className="grid grid-cols-1 gap-4"><input type="text" value={formData.whopLink} onChange={e => setFormData({...formData, whopLink: e.target.value})} placeholder="LINK ZA APLIKACIJU" className="bg-black border border-green-500/50 p-3 rounded-xl text-[11px] outline-none" /></div>
             <div className="bg-black border border-white/10 p-4 rounded-xl">
               <label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">Media (Slike i Video)</label>
               <div className="flex flex-wrap gap-4">
                 {formData.media.map((m, i) => (
                   <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group border border-white/10">
                     {m.type === 'video' ? ( <><video src={`${m.url}#t=0.001`} className="w-full h-full object-cover" /><div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle className="w-8 h-8 text-white opacity-80" /></div></>) : (<img src={m.url} className="w-full h-full object-cover" />)}
                     <button type="button" onClick={() => setFormData({...formData, media: formData.media.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><X className="w-3 h-3" /></button>
                   </div>
                 ))}
                 <label className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-zinc-500 bg-white/[0.02]">{isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><UploadCloud className="w-6 h-6 mb-2" /><span className="text-[8px] uppercase font-black">Upload</span></>}<input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="hidden" /></label>
               </div>
             </div>
             <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Glavni Opis" className="bg-black border border-white/10 p-4 rounded-xl text-[11px] h-96 w-full outline-none font-mono" />
             <div className="bg-black border border-white/10 p-4 rounded-xl"><label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">FAQ</label><div className="space-y-3">{formData.faq.map((f, i) => (<div key={i} className="flex gap-2"><input type="text" value={f.q} onChange={e => { const newFaq = [...formData.faq]; newFaq[i].q = e.target.value; setFormData({...formData, faq: newFaq}); }} placeholder="Pitanje" className="flex-1 bg-black border border-white/5 p-3 rounded-lg text-[10px]" /><input type="text" value={f.a} onChange={e => { const newFaq = [...formData.faq]; newFaq[i].a = e.target.value; setFormData({...formData, faq: newFaq}); }} placeholder="Odgovor" className="flex-[2] bg-black border border-white/5 p-3 rounded-lg text-[10px]" /></div>))}</div></div>
             <div className="flex gap-4 pt-4 border-t border-white/10">
               <button type="submit" disabled={isUploading} className="flex-1 py-5 rounded-2xl font-black uppercase text-[12px] bg-orange-600 hover:bg-orange-500 transition-all flex justify-center items-center gap-2"><Zap className="w-4 h-4"/> {editingId ? "Update Product" : "Save New Product"}</button>
               {editingId && <button type="button" onClick={() => {setFormData(initialForm); setEditingId(null);}} className="px-8 py-5 rounded-2xl bg-zinc-800 uppercase font-black text-[12px] hover:bg-zinc-700">Cancel</button>}
             </div>
        </form>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
           <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">V8 Database ({sortedAppsAdmin.length})</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {sortedAppsAdmin.map(app => (
                 <div key={app.id} className="p-5 bg-black border border-white/10 rounded-[1.5rem] flex flex-col gap-4 shadow-xl group hover:border-orange-500/50 transition-all">
                   <div className="aspect-video relative overflow-hidden rounded-2xl bg-zinc-900">
                     {app.media?.[0]?.type === 'video' ? ( <><video src={`${app.media[0].url}#t=0.001`} className="w-full h-full object-cover" muted /><div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle className="w-10 h-10 text-white opacity-80" /></div></>) : (<img src={data.getMediaThumbnail(app.media?.[0]?.url)} className="w-full h-full object-cover" alt="" />)}
                   </div>
                   <div className="flex justify-between items-start gap-4">
                     <div><span className="text-[13px] font-black uppercase text-white line-clamp-2">{app.name}</span><span className="text-[9px] text-zinc-500 block mt-1">ID: {app.id}</span></div>
                     <div className="flex gap-2">
                       <button type="button" onClick={() => handleEditClick(app)} className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                       <button type="button" onClick={() => handleDeleteAsset(app.id)} className="p-2.5 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   </div>
                 </div>
               ))}
           </div>
        </div>
      </div>
    )}

    {adminTab === 'enhancer' && (
      <div className="bg-[#0a0a0a] border border-purple-500/30 rounded-[2.5rem] p-8 shadow-[0_0_30px_rgba(147,51,234,0.1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div><h2 className="text-xl md:text-2xl font-black text-purple-500 uppercase tracking-widest flex items-center gap-3"><Sparkles className="w-6 h-6" /> 10X Enhancer Reference Gallery</h2></div>
          <label className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-6 py-4 rounded-xl font-black text-[12px] cursor-pointer hover:scale-105"><UploadCloud className="w-5 h-5 inline mr-2" /> UPLOAD NEW IMAGE <input type="file" accept="image/*" onChange={handleUploadGallery} className="hidden" /></label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {gallery.map(img => (
            <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-square bg-[#050505]"><img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all group-hover:scale-105" alt="Ref" /><button type="button" onClick={() => handleDeleteGallery(img.id)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 hover:scale-110"><Trash2 className="w-4 h-4" /></button></div>
          ))}
        </div>
      </div>
    )}

    {adminTab === 'demo' && <AdminDemoProjekti />}
    {adminTab === 'mikroalati' && <AdminMikroAlati />}
    
    {adminTab === 'vip' && (
      <div className="bg-[#0a0a0a] border border-green-500/30 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
         <h2 className="text-xl font-black text-green-500 uppercase tracking-widest flex items-center gap-3"><Lock className="w-6 h-6" /> Premium VIP Baza</h2>
         <form onSubmit={handleAddVip} className="space-y-6 mb-10 max-w-4xl">
           <div className="flex flex-col sm:flex-row gap-4">
             <input type="email" value={vipEmail} onChange={e => setVipEmail(e.target.value)} placeholder="Email korisnika" className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-[13px] outline-none focus:border-green-500" required />
             <button type="submit" className="bg-green-600 text-white px-8 py-4 rounded-xl font-black text-[12px]"><Zap className="w-4 h-4 inline"/> OTKLJUČAJ PRISTUP</button>
           </div>
           <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
             <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Štikliraj šta je kupac platio:</label>
             <div className="flex flex-wrap gap-3">
               {sortedAppsAdmin.map(app => (
                 <button type="button" key={app.id} onClick={() => setSelectedApps(prev => prev.includes(app.id) ? prev.filter(a => a !== app.id) : [...prev, app.id])} className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all border ${selectedApps.includes(app.id) ? 'bg-orange-600 border-orange-500 text-white' : 'bg-black border-white/10 text-zinc-500'}`}>{app.name}</button>
               ))}
               <button type="button" onClick={() => setSelectedApps(prev => prev.includes('FULL_ACCESS') ? prev.filter(a => a !== 'FULL_ACCESS') : [...prev, 'FULL_ACCESS'])} className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedApps.includes('FULL_ACCESS') ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-white/10 text-zinc-500'}`}>SVE OTKLJUČANO (V8 FULL)</button>
             </div>
           </div>
         </form>
         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar max-w-4xl">
           <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Aktivni Premium Korisnici ({vipList.length})</h3>
           {vipList.map(vip => (
             <div key={vip.id} className="flex justify-between items-center bg-black border border-white/5 p-5 rounded-xl hover:border-green-500/30 transition-colors group">
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3"><span className="text-zinc-200 font-mono text-[14px]">{vip.id}</span></div>
                 <div className="flex flex-wrap gap-2 mt-1">
                   {vip.unlockedApps && vip.unlockedApps.map(appId => {
                      if(appId === 'FULL_ACCESS') return <span key="full" className="text-[9px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-md uppercase font-black">V8 FULL ACCESS</span>;
                      const foundApp = sortedAppsAdmin.find(a => a.id === appId);
                      return <span key={appId} className="text-[9px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-md uppercase font-black">{foundApp ? foundApp.name : `ALAT ID: ${appId}`}</span>
                   })}
                 </div>
               </div>
               <button type="button" onClick={() => handleDeleteVip(vip.id)} className="bg-red-600/10 text-red-500 p-3 rounded-lg hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
             </div>
           ))}
         </div>
      </div>
    )}

    {adminTab === 'analytics' && (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-orange-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><Users className="w-8 h-8 text-orange-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Visitors</span><span className="text-3xl font-black text-white">{new Set(analyticsData.map(s => s.sessionId)).size}</span></div>
          <div className="bg-[#0a0a0a] border border-blue-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><MousePointerClick className="w-8 h-8 text-blue-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Clicks</span><span className="text-3xl font-black text-white">{analyticsData.filter(s => s.type === 'click').length}</span></div>
          <div className="bg-[#0a0a0a] border border-amber-500/20 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center items-center text-center"><Zap className="w-8 h-8 text-amber-500 mb-3 opacity-80" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Enhancer Actions</span><span className="text-3xl font-black text-white">{analyticsData.filter(s => s.type === 'enhancer_action').length}</span></div>
        </div>
      </div>
    )}
  </div>
);
};

function TrezorPage({ apps = [] }) {
const [unlockedApps, setUnlockedApps] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
  window.scrollTo(0, 0);
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (user.email === "damnjanovicgoran7@gmail.com") {
        setUnlockedApps(['FULL_ACCESS']);
      } else {
        try {
          const docRef = doc(db, "vip_users", user.email.toLowerCase());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().unlockedApps) { setUnlockedApps(docSnap.data().unlockedApps); } 
          else { setUnlockedApps([]); }
        } catch(e) { setUnlockedApps([]); }
      }
    } else { navigate('/'); }
    setLoading(false);
  });
  return () => unsubscribe();
}, [navigate]);

if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-orange-500"><Loader2 className="w-10 h-10 animate-spin" /></div>;

const hasFullAccess = unlockedApps.includes('FULL_ACCESS');
const myApps = hasFullAccess ? apps : apps.filter(app => unlockedApps.includes(app.id));

return (
  <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-sans text-left text-white min-h-screen">
    <Helmet><title>MOJ TREZOR | AI TOOLS PRO SMART</title></Helmet>
    <div className="flex items-center gap-4 mb-10 border-b border-orange-500/20 pb-6"><Lock className="w-8 h-8 text-orange-500" /><h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white">VIP TREZOR</h1></div>
    {myApps.length === 0 ? (
       <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 text-center shadow-xl"><p className="text-zinc-500 uppercase tracking-widest font-bold text-[12px]">Trenutno nemate otključanih alata.</p><Link to="/" className="inline-block mt-6 bg-orange-600 px-8 py-3 rounded-xl text-white font-black text-[11px] uppercase tracking-widest hover:bg-orange-500">Idi u Prodavnicu</Link></div>
    ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myApps.map((app) => {
             const isVideo = app.media?.[0]?.type === 'video' || app.media?.[0]?.url?.match(/\.(mp4|webm|ogg|mov)$/i);
             const displayUrl = app.media?.[0]?.url || data.bannerUrl;
             const parts = (app.whopLink || "").split("[SPLIT]");
             const mainLink = parts[0] || "";
             return (
               <div key={app.id} className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2rem] p-5 flex flex-col hover:border-orange-500/60 transition-all group">
                 <Link to={`/app/${app.id}`} className="aspect-video relative rounded-xl overflow-hidden mb-4 bg-black block">
                    {isVideo ? <video src={`${displayUrl}#t=0.001`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" muted playsInline /> : <img src={displayUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt={app.name} />}
                 </Link>
                 <h3 className="text-[16px] font-black uppercase text-white mb-2 line-clamp-1">{app.name}</h3>
                 <p className="text-zinc-500 text-[10px] uppercase font-bold mb-6 flex-1 line-clamp-2">{app.headline}</p>
                 {mainLink ? <a href={data.formatExternalLink(mainLink)} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl text-center font-black text-[11px] uppercase tracking-widest hover:scale-105 block">🚀 OTVORI APLIKACIJU</a> : <Link to={`/app/${app.id}`} className="w-full py-3.5 bg-zinc-800 text-white rounded-xl text-center font-black text-[11px] uppercase tracking-widest hover:scale-105 block">POGLEDAJ DETALJE</Link>}
               </div>
             );
          })}
       </div>
    )}
  </div>
);
}

function AppContent({ appsData, refreshData }) {
const [isBooting, setIsBooting] = useState(true); 
const [showBanner, setShowBanner] = useState(false); 
const location = useLocation();
const prevLocation = useRef(location.pathname); 
const entryTime = useRef(Date.now());
const [isVIPLoggedIn, setIsVIPLoggedIn] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);

const [trenutnoVreme, setTrenutnoVreme] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => setTrenutnoVreme(new Date()), 1000);
  return () => clearInterval(timer);
}, []);

const daniUSedmici = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'];
const datumPrikaz = `${daniUSedmici[trenutnoVreme.getDay()]} , ${trenutnoVreme.getDate().toString().padStart(2, '0')}/${(trenutnoVreme.getMonth() + 1).toString().padStart(2, '0')}/${trenutnoVreme.getFullYear()}`;
const vremePrikaz = `${trenutnoVreme.getHours().toString().padStart(2, '0')}:${trenutnoVreme.getMinutes().toString().padStart(2, '0')}:${trenutnoVreme.getSeconds().toString().padStart(2, '0')}`;

useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
     if(user) {
        if (user.email === "damnjanovicgoran7@gmail.com") { setIsAdmin(true); setIsVIPLoggedIn(true); } 
        else { setIsAdmin(false); if((await getDoc(doc(db, "vip_users", user.email.toLowerCase()))).exists()) { setIsVIPLoggedIn(true); } else { setIsVIPLoggedIn(false); } }
     } else { setIsVIPLoggedIn(false); setIsAdmin(false); }
  }); return () => unsub();
}, []);

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
    <V8ToastContainer />
    <AnimatePresence>
      {isBooting && <FullScreenBoot key="boot" onComplete={() => { setIsBooting(false); setShowBanner(true); window.scrollTo(0,0); }} />}
      {!isBooting && showBanner && <WelcomeBanner key="banner" onClose={() => setShowBanner(false)} />}
    </AnimatePresence>
    <div className="fixed top-0 left-0 w-full z-[1000]">
      <nav className="w-full px-4 md:px-8 py-3 md:py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-orange-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 md:gap-3 group shrink-0 mr-2">
  <img src={data.logoUrl} className="h-7 md:h-9 object-contain animate-pulse" alt="logo" />
  <div className="flex flex-col leading-[0.8] whitespace-nowrap">
    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] text-blue-500 italic">AI TOOLS</span>
    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] text-orange-500 italic">PRO SMART</span>
  </div>
</Link>
<div className="flex-1 flex items-center justify-end gap-1 md:gap-1.5 font-black uppercase text-[7px] md:text-[8px] tracking-tighter whitespace-nowrap">
            <Link to="/" onClick={handleHomeClick} className="bg-emerald-900/60 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-emerald-400 border border-emerald-800 shadow-xl hover:bg-emerald-800 transition-all hidden sm:block">Početna</Link>
            {location.pathname !== '/izrada-sajtova' && (<Link to="/izrada-sajtova" className="bg-orange-600/20 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-orange-500 border border-orange-500/30 shadow-xl hover:bg-orange-600 hover:text-white transition-all hidden sm:block">Izrada Sajtova</Link>)}
            <Link to="/#marketplace" className="bg-blue-600 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-white shadow-xl hover:bg-blue-500 transition-all hidden md:block">Prodavnica</Link>
<Link 
  to="/v8-trezor" 
  className="bg-gradient-to-r from-yellow-500 to-orange-600 px-3 md:px-4 py-1.5 rounded-full text-white font-black text-[8px] md:text-[9px] uppercase tracking-wider shadow-[0_0_15px_rgba(234,88,12,0.4)] hover:scale-105 hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] transition-all border border-orange-400/50 hidden lg:flex items-center gap-1.5 whitespace-nowrap"
>
  <Crown className="w-3 h-3" />
  Master Kolekcija
</Link>
            <div className="relative group">
              <button className="bg-gradient-to-r from-orange-600 to-red-600 border border-orange-400 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full font-black tracking-widest text-[10px] md:text-xs shadow-[0_0_20px_rgba(234,88,12,0.6)] flex items-center gap-2 cursor-pointer">
                <Zap className="w-4 h-4" /> 
                V8 ALATI 
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 z-50">
                <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.3)] py-3 flex flex-col overflow-hidden">
                  <Link to="/v8-pametni-alati" className="px-5 py-3 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-600/20 hover:text-orange-400 transition-colors flex items-center gap-3 border-b border-white/5">
                    <Settings className="w-4 h-4 text-orange-500" /> Pametni Alati
                  </Link>
                  <Link to="/v8-kreator-slika" className="px-5 py-3 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-600/20 hover:text-orange-400 transition-colors flex items-center gap-3">
                    <Eye className="w-4 h-4 text-orange-500" /> Kreator Slika
                  </Link>
                  <Link to="/pixar-selfie" className="block px-4 py-2 text-orange-400 hover:text-orange-500 font-bold flex items-center gap-2">
                    Pixar Selfie Mejker <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">Novo</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {location.pathname !== '/enxance' && (<Link to="/enxance" className="bg-transparent border-2 border-orange-600 text-orange-600 px-4 md:px-5 py-1.5 md:py-2 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 10X ENHANCER</Link>)}
            {isVIPLoggedIn ? (
               <div className="flex items-center gap-2 md:gap-3 ml-2">
                  {isAdmin && (<Link to="/admin" className="bg-red-600/20 border border-red-500/50 text-red-400 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-1.5 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)]"><Settings className="w-3.5 h-3.5" /> DASHBOARD</Link>)}
                  <Link to="/trezor" className="bg-orange-600/20 border border-orange-500/50 text-orange-400 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black flex items-center gap-1.5 hover:bg-orange-600 hover:text-white transition-all shadow-[0_0_10px_rgba(234,88,12,0.2)]"><Lock className="w-3.5 h-3.5" /> MOJ TREZOR</Link>
                  <span className="bg-green-900/40 border border-green-500/50 text-green-400 px-3 py-1 rounded-full text-[8px] flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)] hidden sm:flex"><User className="w-3 h-3" /> {isAdmin ? "MASTER" : "PREMIUM"}</span>
                  <button onClick={() => { signOut(auth); v8Toast.success("Uspešno ste odjavljeni."); }} className="text-zinc-500 hover:text-red-500 transition-colors p-1" title="Odjavi se"><LogOut className="w-4 h-4" /></button>
               </div>
            ) : (<Link to="/admin" className="bg-zinc-800 px-4 py-1.5 rounded-full text-zinc-400 shadow-xl hover:bg-zinc-700 hover:text-white transition-all ml-2 hidden sm:block">Admin Login</Link>)}
          </div>
        </div>
      </nav>
    </div>
    <div className="flex-1 text-left pt-20">
     <Routes>
        <Route path="/" element={<HomePage apps={appsData} />} />
        <Route path="/izrada-sajtova" element={<IzradaSajtovaPage />} />
        <Route path="/enxance" element={<V8Enhancer10x />} />
<Route path="/reklama-10x" element={<V8Promo10xPage />} />
        <Route path="/v8-pametni-alati" element={<V8PametniAlatiPage isAdmin={isAdmin} />} />
<Route path="/v8-trezor" element={<V8MasterCollection />} />
        <Route path="/v8-kreator-slika" element={<V8KreatorSlikaPage isAdmin={isAdmin} />} />
        <Route path="/pixar-selfie" element={<V8PixarSelfiePage isAdmin={isAdmin} />} />
        <Route path="/app/:id" element={<SingleProductPage apps={appsData} />} />
        <Route path="/admin" element={<AdminPage apps={appsData} refreshData={refreshData} />} />
        <Route path="/trezor" element={<TrezorPage apps={appsData} />} />
      </Routes>
    </div>
    <SmartScrollButton />
<V8ContactWidget />
    <footer className="flex flex-col items-center gap-6 text-center text-zinc-100 font-black italic uppercase text-[9px] tracking-[0.5em] py-8 mt-8" style={{ borderTop: '0.5px solid #f97316' }}>
      <div className="flex items-center gap-6">
        <a href="https://x.com/AiToolsProSmart" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg></a>
        <a href="https://www.youtube.com/@SmartAiToolsPro-Smart-AI" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><Youtube size={20} className="text-[#FF0000]" /></a>
        <a href="https://www.instagram.com/aitoolsprosmart/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="h-4 w-4 object-contain" /></a>
        <a href="https://www.tiktok.com/@smartaitoolspro" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" className="h-4 w-4 object-contain" /></a>
      </div>
      <div className="w-full px-6 flex flex-col items-center gap-3">
         <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-400 font-mono font-black tracking-widest text-[11px] md:text-[13px]">{datumPrikaz}</div>
            <div className="text-[9px] md:text-[10px]">© 2026 <span className="text-blue-500 font-black">AI TOOLS</span> <span className="text-orange-500 font-black">PRO SMART</span> <span className="mx-1 text-white font-black">|</span> SVA PRAVA ZADRŽANA</div>
            <div className="text-orange-500 font-mono font-black tracking-widest flex items-center justify-center gap-2 text-[12px] md:text-[15px]"><Clock className="w-4 h-4 md:w-5 md:h-5" /> {vremePrikaz}</div>
         </div>
         <div className="text-orange-500/60 font-bold normal-case tracking-[0.2em] text-[11px] mt-2">Premium Solutions for Premium Clients.</div>
      </div>
    </footer>
  </div>
);
}

// 🚀 V8 FIREBASE GLAVNA PETLJA (REPLACES LOCALHOST API)
export default function App() { 
const [appsData, setAppsData] = useState([]); 

const refreshData = useCallback(async () => { 
  try {
    // Povlači proizvode iz Firebase kolekcije 'v8_products' sortirane po datumu (od najnovijeg)
    const q = query(collection(db, "v8_products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAppsData(data);
  } catch (error) {
    console.error("❌ V8 Greška pri učitavanju iz Firebase baze: ", error);
    setAppsData([]); // Fallback u slučaju greške
  }
}, []); 

useEffect(() => { refreshData(); }, [refreshData]);

return (
  <HelmetProvider>
    <Router>
      <AppContent appsData={appsData} refreshData={refreshData} />
      <data.LiveSalesNotification apps={appsData} />
    </Router>
  </HelmetProvider>
); 
}