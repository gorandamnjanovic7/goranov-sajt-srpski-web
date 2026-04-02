import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Phone, X, Zap, MessageSquare } from 'lucide-react';

const V8ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // PROMENJENO: left-6 i items-start (da stoji levo i otvara se na desno)
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: 0, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-orange-500/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(234,88,12,0.2)] mb-4 w-[280px] md:w-80 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center border-b border-orange-500/20 pb-3">
              <span className="text-white font-black uppercase tracking-widest text-[12px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" /> V8 Direktni Kontakt
              </span>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WHATSAPP DUGME */}
            <a 
              href="https://wa.me/381648201496?text=Pozdrav,%20zainteresovan%20sam%20za%20V8%20Premium%20Alate!" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] text-white p-3 rounded-xl flex items-center gap-4 transition-all group"
            >
              <div className="bg-[#25D366] p-2.5 rounded-lg group-hover:bg-white transition-colors shadow-lg">
                <Phone className="w-5 h-5 text-white group-hover:text-[#25D366]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-widest">WhatsApp</span>
                <span className="text-[9px] text-zinc-400 group-hover:text-white/90">+381 64 820 1496</span>
              </div>
            </a>

            {/* VIBER DUGME */}
            <a 
              href="viber://chat?number=381648201496" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#7360f2]/10 border border-[#7360f2]/30 hover:bg-[#7360f2] text-white p-3 rounded-xl flex items-center gap-4 transition-all group"
            >
              <div className="bg-[#7360f2] p-2.5 rounded-lg group-hover:bg-white transition-colors shadow-lg">
                <MessageSquare className="w-5 h-5 text-white group-hover:text-[#7360f2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-widest">Viber</span>
                <span className="text-[9px] text-zinc-400 group-hover:text-white/90">+381 64 820 1496</span>
              </div>
            </a>

            {/* EMAIL DUGME */}
            <a 
              href="mailto:aitoolsprosmart@gmail.com?subject=Upit za V8 Premium Alate" 
              className="bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 text-white p-3 rounded-xl flex items-center gap-4 transition-all group"
            >
              <div className="bg-blue-600 p-2.5 rounded-lg group-hover:bg-white transition-colors shadow-lg">
                <Mail className="w-5 h-5 text-white group-hover:text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-widest">Email Podrška</span>
                <span className="text-[9px] text-zinc-400 group-hover:text-white/90 truncate max-w-[150px]">aitoolsprosmart@gmail.com</span>
              </div>
            </a>

            {/* VIP PREPORUKA ZA EMAIL */}
            <div className="mt-2 border-t border-orange-500/20 pt-4 text-center bg-orange-500/5 rounded-xl p-3 border border-dashed border-orange-500/30">
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
                Za najbrži odgovor
              </span>
              <span className="block text-[13px] font-black text-orange-500 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]">
                Preporučujemo Mail
              </span>
              <span className="block text-[10px] text-white mt-1 font-mono">
                aitoolsprosmart@gmail.com
              </span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* GLAVNO PLIVAJUĆE DUGME */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-orange-600 to-red-600 p-4 rounded-full text-white shadow-[0_0_25px_rgba(234,88,12,0.6)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 group-hover:animate-pulse" />}
      </button>
    </div>
  );
};

export default V8ContactWidget;