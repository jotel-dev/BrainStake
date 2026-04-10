"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

const MOCK_LEADERS = [
  { id: 1, name: "CryptoKing", address: "0x7227...8a19", score: 3, avgTime: 2.1, date: "2024-01-15" },
  { id: 2, name: "BrainApe", address: "0x3184...b23c", score: 3, avgTime: 3.5, date: "2024-01-14" },
  { id: 3, name: "CeloMaxi", address: "0x2070...e4ff", score: 2, avgTime: 1.8, date: "2024-01-15" },
  { id: 4, name: "TriviaGod", address: "0x9912...c11a", score: 2, avgTime: 4.2, date: "2024-01-13" },
  { id: 5, name: "VitalikFan", address: "0x4421...d99b", score: 1, avgTime: 2.5, date: "2024-01-15" },
  { id: 6, name: "Web3Dad", address: "0x1122...aabb", score: 3, avgTime: 5.0, date: "2024-01-12" },
  { id: 7, name: "SatoshiFan", address: "0x3344...ccdd", score: 2, avgTime: 3.1, date: "2024-01-11" },
  { id: 8, name: "EthTrader", address: "0x5566...eeff", score: 1, avgTime: 6.0, date: "2024-01-10" },
];

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<"all" | "week">("all");
  const { address } = useAccount();
  const currentUserAddress = address ? address.slice(0, 6) + "..." + address.slice(-4) : null;

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Leaderboard</h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-8 bg-zinc-900/60 p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => setTimeFilter("all")}
          className={`py-2 text-sm font-bold rounded-xl transition-colors ${
            timeFilter === "all" 
              ? "bg-[#35D07F]/20 text-[#35D07F]" 
              : "text-zinc-500 hover:text-white"
          }`}
        >
          All Time
        </button>
        <button 
          onClick={() => setTimeFilter("week")}
          className={`py-2 text-sm font-bold rounded-xl transition-colors ${
            timeFilter === "week" 
              ? "bg-[#35D07F]/20 text-[#35D07F]" 
              : "text-zinc-500 hover:text-white"
          }`}
        >
          This Week
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-3 mb-10 mt-4 px-2">
        {/* 2nd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-slate-300 flex items-center justify-center text-2xl">
              🐵
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 text-[10px] px-1.5 font-bold rounded-full">2nd</div>
          </div>
          <div className="h-20 w-16 bg-gradient-to-t from-slate-400/20 to-slate-400/5 rounded-t-lg border-t border-slate-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[1].score}/3</span>
            <span className="text-[10px] text-zinc-400">{MOCK_LEADERS[1].avgTime}s</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 z-10" />
            <div className="w-16 h-16 bg-zinc-800 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center text-3xl">
              👑
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-[10px] px-1.5 font-bold rounded-full">1st</div>
          </div>
          <div className="h-28 w-16 bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 rounded-t-lg border-t border-yellow-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[0].score}/3</span>
            <span className="text-[10px] text-zinc-400">{MOCK_LEADERS[0].avgTime}s</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-orange-400 flex items-center justify-center text-2xl">
              🦊
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-950 text-[10px] px-1.5 font-bold rounded-full">3rd</div>
          </div>
          <div className="h-16 w-16 bg-gradient-to-t from-orange-400/20 to-orange-400/5 rounded-t-lg border-t border-orange-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[2].score}/3</span>
            <span className="text-[10px] text-zinc-400">{MOCK_LEADERS[2].avgTime}s</span>
          </div>
        </motion.div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        <div className="col-span-2">Rank</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-3 text-right">Score</div>
        <div className="col-span-2 text-right">Avg</div>
      </div>

      {/* Remaining List */}
      <div className="space-y-2">
        {MOCK_LEADERS.slice(3).map((leader, index) => (
          <div 
            key={leader.id} 
            className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-2xl border items-center ${
              currentUserAddress === leader.address 
                ? "bg-[#35D07F]/10 border-[#35D07F]/30" 
                : "bg-zinc-900/60 border-white/5"
            }`}
          >
            <div className="col-span-2 text-sm font-bold text-zinc-500">{index + 4}</div>
            <div className="col-span-5">
              <p className="text-sm font-bold text-white">{leader.name}</p>
              <p className="text-[10px] text-zinc-400 font-medium">{leader.address}</p>
            </div>
            <div className="col-span-3 text-right">
              <p className="text-sm font-black text-[#35D07F]">{leader.score}/3</p>
            </div>
            <div className="col-span-2 text-right flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400">{leader.avgTime}s</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}