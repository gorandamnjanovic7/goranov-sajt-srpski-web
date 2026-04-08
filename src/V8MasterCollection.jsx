import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sun, Film, Copy, Check, Zap } from 'lucide-react';

// BAZA PODATAKA (Izdvojeno iz tvog Ultimate teksta)
const DOP_LIST = ["Roger Deakins", "Emmanuel Lubezki", "Greig Fraser", "Hoyte van Hoytema", "Janusz Kamiński", "Vittorio Storaro", "Robert Richardson", "Darius Khondji", "Bradford Young"];
const LENS_LIST = ["16-35mm", "24mm", "27mm", "35mm", "40mm", "50mm f/1.8", "65mm", "85mm f/1.4", "105mm", "135mm"];
const LIGHTING_LIST = ["Soft natural daylight", "Pure natural light, golden hour", "Atmospheric low-sun", "Clean natural daylight", "Strong backlight, volumetric haze", "Symbolic color-driven lighting", "Aggressive top-lighting", "Deep low-key lighting", "Soft darkness, natural low-light", "Clamshell beauty lighting"];

const NEGATIVE_LOCKS = "NEGATIVE LOCKS: no extra limbs, no distorted anatomy, no warped faces, no cartoon or painterly style, no over-smoothed skin, no plastic textures, no artificial glow, no unrealistic eyes, no duplicated subjects, no watermark, no text artifacts.";

// Početak funkcije: V8PromptVault
const V8PromptVault = () => {
  const [dop, setDop] = useState(DOP_LIST[0]);
  const [lens, setLens] = useState(LENS_LIST[5]);
  const [lighting, setLighting] = useState(LIGHTING_LIST[0]);
  const [copied, setCopied] = useState(false);

  // Početak funkcije: generateFinalPrompt
  const generateFinalPrompt = () => {
    return `Ultra-realistic cinematic scene inspired by ${dop}, shot on a ${lens} prime lens, ${lighting}, controlled contrast, cinematic realism, Nanobanana Pro ultra-quality. ${NEGATIVE_LOCKS}`;
  };
  // Kraj funkcije: generateFinalPrompt

  // Početak funkcije: handleCopy
  const handleCopy = () => {
    navigator.clipboard.writeText(generateFinalPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Kraj funkcije: handleCopy

  return (
    <div className="min-h-screen bg-[#050505] p-8 font-sans text-zinc-200 flex flex-col items-center justify-center">
      
      {/* V8 HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)] flex items-center justify-center gap-4 mb-4">
          <Zap className="w-10 h-10 text-orange-500" /> ULTIMATE PROMPT VAULT
        </h1>
        <p className="text-[12px] uppercase font-black tracking-[0.3em] text-zinc-500">Premium Master Collection • 1000+ Combinations</p>
      </div>
      


      {/* KONTROLNA TABLA */}
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-orange-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_40px_rgba(234,88,12,0.1)] flex flex-col gap-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SELEKTOR 1: DIREKTOR FOTOGRAFIJE */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
              <Film className="w-4 h-4" /> Director of Photography
            </label>
            <select 
              value={dop} 
              onChange={(e) => setDop(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer appearance-none"
            >
              {DOP_LIST.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* SELEKTOR 2: OBJEKTIV */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Lens / Focal Length
            </label>
            <select 
              value={lens} 
              onChange={(e) => setLens(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer appearance-none"
            >
              {LENS_LIST.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* SELEKTOR 3: SVETLO */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
              <Sun className="w-4 h-4" /> Lighting / Mood
            </label>
            <select 
              value={lighting} 
              onChange={(e) => setLighting(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer appearance-none"
            >
              {LIGHTING_LIST.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

        </div>

        {/* IZLAZNI V8 EKRAN */}
        <div className="mt-6 border-t border-orange-500/20 pt-8 relative">
          <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">
            Generated Output:
          </label>
          <div className="bg-black border border-white/5 rounded-2xl p-6 min-h-[150px] font-mono text-[13px] leading-relaxed text-zinc-300">
            {generateFinalPrompt()}
          </div>
          
          <button 
            onClick={handleCopy}
            className={`absolute bottom-6 right-6 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${copied ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]'}`}
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
          </button>
        </div>

      </div>
    </div>
  );
};
// Kraj funkcije: V8PromptVault

export default V8PromptVault;