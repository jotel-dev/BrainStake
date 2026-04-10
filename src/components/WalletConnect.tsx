"use client";

import { useAccount, useConnect, useDisconnect, useReadContract, Connector } from 'wagmi';
import { formatUnits } from 'viem';
import { CUSD_ADDRESS, ERC20_ABI } from '@/lib/contract';
import { Wallet, LogOut, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaMaskIcon, PhantomIcon, MiniPayIcon } from './WalletIcons';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, error: connectError, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data: balanceData } = useReadContract({
    address: CUSD_ADDRESS as `0x${string}`,
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

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setShowModal(false);
  };

  const getWalletIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('metamask')) return <MetaMaskIcon className="w-8 h-8" />;
    if (n.includes('phantom') || n.includes('solana')) return <PhantomIcon className="w-8 h-8" />;
    if (n.includes('minipay') || n.includes('rabbit') || n.includes('opera') || n.includes('coinbase')) return <MiniPayIcon className="w-8 h-8" />;
    return <Wallet className="w-8 h-8 text-zinc-400" />;
  };

  const getConnectorForType = (type: string) => {
    return connectors.find(c => c.name.toLowerCase().includes(type));
  };

  const walletOptions = [
    { name: 'MiniPay', type: 'minipay', icon: <MiniPayIcon className="w-8 h-8" /> },
    { name: 'MetaMask', type: 'metamask', icon: <MetaMaskIcon className="w-8 h-8" /> },
    { name: 'Phantom', type: 'phantom', icon: <PhantomIcon className="w-8 h-8" /> },
    { name: 'Coinbase Wallet', type: 'coinbase', icon: <Wallet className="w-8 h-8 text-blue-400" /> },
  ];

  const availableWallets = walletOptions.map(opt => ({
    ...opt,
    connector: getConnectorForType(opt.type)
  })).filter(w => w.connector);

  if (isConnected && address) {
    const formattedBalance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
    
    return (
      <div className="flex items-center justify-between bg-zinc-900/60 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#35D07F]/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#35D07F]" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Connected</p>
            <p className="font-bold text-white text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">cUSD Balance</p>
            <p className="font-black text-[#35D07F] text-sm">{formattedBalance}</p>
          </div>
          <button 
            onClick={() => disconnect()}
            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all active:scale-90 group"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold rounded-2xl shadow-[0_8px_20px_rgba(53,208,127,0.25)] transition-all active:scale-[0.98] flex justify-center items-center gap-2.5 text-base"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#121217] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Select Wallet</h3>
                  <p className="text-xs text-zinc-500 font-medium">Choose a wallet to play BrainStake</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet.connector!)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl border border-white/5 hover:border-[#35D07F]/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform">
                        {wallet.icon}
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-white text-base">{wallet.name}</span>
                        <span className="text-[10px] text-[#35D07F] font-bold uppercase tracking-widest">Available</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-[#35D07F]" />
                    </div>
                  </button>
                ))}

                {connectors.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-200 font-medium">No wallet detected.</p>
                    <p className="text-xs text-amber-400/80 mt-1">Please open this page in MiniPay or install MetaMask.</p>
                  </div>
                )}
              </div>

              {connectError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium animate-pulse">
                  {connectError.message.includes('User rejected') 
                    ? 'Connection rejected. Please try again.' 
                    : 'Failed to connect. Make sure your wallet is unlocked.'}
                </div>
              )}

              <p className="text-[10px] text-center text-zinc-600 font-medium px-4">
                By connecting, you agree to the Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}