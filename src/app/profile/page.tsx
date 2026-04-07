"use client";

import { useUserStore } from "@/lib/store";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { User, Medal, Flame, ShieldCheck, Trophy, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { xp, level, winStreak, maxWinStreak, gamesPlayed, wins, matchHistory } = useUserStore();

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile</h1>
        <Link href="/" className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
      </div>

      {/* Avatar & Basic Info */}
      <div className="bg-zinc-900/80 p-6 rounded-[24px] border border-white/5 mb-6 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#35D07F] opacity-10 blur-3xl rounded-full" />
        
        <div className="relative mb-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#35D07F] to-[#6C5DD3] rounded-[20px] flex items-center justify-center p-1 shadow-lg shadow-[#35D07F]/20">
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-[16px]">
              <User className="w-8 h-8 text-[#35D07F]" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-zinc-950 px-2 py-0.5 rounded-full border border-[#35D07F]/30 text-xs font-bold text-[#35D07F]">
            Lvl {level}
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-white mb-1">
          {isConnected && address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Guest Player"}
        </h2>
        {isConnected && (
          <button onClick={copyAddress} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
            <Copy className="w-3 h-3" /> Copy Address
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
          <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
          <span className="text-2xl font-black text-white">{wins}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Total Wins</span>
        </div>
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
          <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
          <span className="text-2xl font-black text-white">{winRate}%</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Win Rate</span>
        </div>
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
          <Flame className="w-5 h-5 text-orange-400 mb-2" />
          <span className="text-2xl font-black text-white">{maxWinStreak}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Best Streak</span>
        </div>
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
          <Medal className="w-5 h-5 text-[#35D07F] mb-2" />
          <span className="text-2xl font-black text-white">{xp}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Total XP</span>
        </div>
      </div>

      {/* Match History */}
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Recent Matches</h3>
      <div className="space-y-2">
        {matchHistory.length === 0 ? (
          <div className="text-center py-6 bg-zinc-900/40 rounded-2xl border border-white/5">
            <p className="text-sm text-zinc-500 font-medium">No matches played yet.</p>
          </div>
        ) : (
          matchHistory.slice(0,5).map((match) => (
            <div key={match.id} className="bg-zinc-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white capitalize">{match.result}</p>
                <p className="text-xs text-zinc-500">{new Date(match.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${match.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {match.result === 'win' ? '+' : ''}{match.earnedCELO} cUSD
                </p>
                <p className="text-xs text-[#35D07F]">+{match.earnedXP} XP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
