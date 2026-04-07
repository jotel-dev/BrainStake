"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Trophy, Frown, Scale, ArrowLeft, ExternalLink } from "lucide-react";
import { Suspense } from "react";

function ResultComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();

  const winner = searchParams.get("winner");
  const scoresRaw = searchParams.get("scores");

  let scores: Record<string, number> = {};
  if (scoresRaw) {
    try {
      scores = JSON.parse(decodeURIComponent(scoresRaw));
    } catch (e) {
      console.error(e);
    }
  }

  const myAddress = address;
  const opponentAddress = Object.keys(scores).find(k => k !== myAddress) || "Opponent";
  
  const myScore = myAddress ? scores[myAddress] || 0 : 0;
  const opponentScore = scores[opponentAddress] || 0;

  const isWinner = winner === myAddress;
  const isTie = winner === "tie";
  const isLoser = !isWinner && !isTie;

  return (
    <div className="flex flex-col h-full w-full justify-center p-6 text-center overflow-y-auto">
      
      {/* Icon Area */}
      <div className="flex justify-center mb-6">
        {isWinner && (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
            <Trophy className="w-12 h-12 text-emerald-400" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
          </div>
        )}
        {isLoser && (
          <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center">
            <Frown className="w-12 h-12 text-rose-400" />
          </div>
        )}
        {isTie && (
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Scale className="w-12 h-12 text-indigo-400" />
          </div>
        )}
      </div>

      {/* Main Status Text */}
      <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${isWinner ? 'text-emerald-400' : isLoser ? 'text-rose-400' : 'text-indigo-400'}`}>
        {isWinner ? "You Win!" : isLoser ? "You Lost" : "It's a Tie!"}
      </h1>
      
      <p className="text-slate-400 font-medium mb-10 text-lg">
        {isWinner ? "+1.0 cUSD" : isLoser ? "-0.5 cUSD stake lost" : "Refunded 0.5 cUSD"}
      </p>

      {/* Scoreboard */}
      <div className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700/50 mb-8 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700/50">
          <div className="text-left">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">You</p>
            <p className="text-2xl font-mono font-bold text-white">{myScore}</p>
          </div>
          <div className="text-2xl font-black text-slate-600 px-4">VS</div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">
              Opponent
            </p>
            <p className="text-2xl font-mono font-bold text-white">{opponentScore}</p>
          </div>
        </div>
        
        {/* On-chain context */}
        <a 
          href="https://alfajores.celoscan.io/" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          View Payout Tx on Celo Explorer
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <button 
        onClick={() => router.push("/")}
        className="w-full mt-auto py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-slate-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Lobby
      </button>

    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p>Loading Results...</p></div>}>
      <ResultComponent />
    </Suspense>
  );
}
