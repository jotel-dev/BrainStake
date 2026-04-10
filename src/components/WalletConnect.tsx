"use client";

import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CUSD_ADDRESS, ERC20_ABI } from '@/lib/contract';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  const { data: balanceData } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isConnected && address) {
    const formattedBalance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
    
    return (
      <div className="flex items-center justify-between bg-zinc-900/60 rounded-2xl p-3 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#35D07F]/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-[#35D07F]" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Connected</p>
            <p className="font-semibold text-white text-sm">
              {address.slice(0, 4)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-medium">Balance</p>
            <p className="font-bold text-[#35D07F] text-sm">{formattedBalance} cUSD</p>
          </div>
          <button 
            onClick={() => disconnect()}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="w-full py-3 bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold rounded-xl shadow-[0_4px_12px_rgba(53,208,127,0.25)] transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-sm"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}