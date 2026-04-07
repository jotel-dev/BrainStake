"use client";

import { motion } from "framer-motion";
import { Bot, Swords, BrainCircuit, Cpu, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotPage() {
  const router = useRouter();
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const BOTS = [
    { id: 1, name: "Easy Bot", desc: "Slow answers. Ideal for beginners.", icon: Bot, color: "text-green-400", bg: "bg-green-500/20" },
    { id: 2, name: "Smart Bot", desc: "Balanced answers. A solid challenge.", icon: BrainCircuit, color: "text-blue-400", bg: "bg-blue-500/20" },
    { id: 3, name: "Genius Bot", desc: "Fast & accurate. Only for experts.", icon: Cpu, color: "text-rose-400", bg: "bg-rose-500/20" },
  ];

  const handleStart = () => {
    if (!selectedBot) return;
    setIsStarting(true);
    setTimeout(() => {
      router.push(`/game?bot=${selectedBot}&mode=solo`);
    }, 1500);
  };

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-500/20 p-2 rounded-xl">
          <Bot className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Play a Bot</h1>
          <p className="text-xs text-zinc-400 font-medium tracking-wide">Test your skills solo</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Select Difficulty</h3>
        
        <div className="grid gap-3">
          {BOTS.map((bot) => {
            const isSelected = selectedBot === bot.id;
            const Icon = bot.icon;
            
            return (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id)}
                className={`group relative overflow-hidden p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${isSelected ? 'bg-zinc-800 border-white/30 scale-[1.02]' : 'bg-zinc-900/60 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${bot.bg} p-3 rounded-xl transition-transform ${isSelected ? 'scale-110' : ''}`}>
                  <Icon className={`w-6 h-6 ${bot.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">{bot.name}</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">{bot.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#35D07F]' : 'border-zinc-700'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-[#35D07F] rounded-full" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <motion.div className="mt-auto" animate={isStarting ? { y: 20, opacity: 0 } : { y: 0, opacity: 1 }}>
        <button 
          onClick={handleStart}
          disabled={!selectedBot || isStarting}
          className={`w-full font-extrabold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
            selectedBot 
              ? 'bg-gradient-to-r from-[#35D07F] to-[#6C5DD3] text-white shadow-lg active:scale-95' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Starting Engine...
            </>
          ) : (
             <>
               <Swords className="w-5 h-5" /> Challenge Bot
             </>
          )}
        </button>
      </motion.div>
    </main>
  );
}
