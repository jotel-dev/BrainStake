"use client";

import { useAccount, useConnect, useDisconnect, useReadContract, Connector } from 'wagmi';
import { formatUnits } from 'viem';
import { CUSD_ADDRESS, ERC20_ABI } from '@/lib/contract';
import { Wallet, LogOut, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaMaskIcon, PhantomIcon, MiniPayIcon } from './WalletIcons';

export default function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
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

  const getWalletIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('metamask')) return <MetaMaskIcon className="w-8 h-8" />;
    if (n.includes('phantom') || n.includes('solana')) return <PhantomIcon className="w-8 h-8" />;
    if (n.includes('minipay') || n.includes('rabbit') || n.includes('opera') || n.includes('coinbase') || n.includes('wallet')) return <MiniPayIcon className="w-8 h-8" />;
    return <Wallet className="w-8 h-8 text-zinc-400" />;
  };

  const formatWalletName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('metamask')) return 'MetaMask';
    if (n.includes('phantom') || n.includes('solana')) return 'Phantom';
    if (n.includes('minipay')) return 'MiniPay';
    if (n.includes('rabbit')) return 'Rabbit';
    if (n.includes('coinbase')) return 'Coinbase';
    return name;
  };

  const currentWalletName = formatWalletName(connector?.name || '');

  if (!mounted) return null;

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setShowModal(false);
  };

  const availableWallets = connectors.map(connector => ({
    name: formatWalletName(connector.name),
    icon: getWalletIcon(connector.name),
    connector
  }));

  if (isConnected && address) {
    const formattedBalance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
    const walletIcon = getWalletIcon(connector?.name || '');
    
    return (
      <div className="flex items-center justify-between bg-gradient-to-r from-zinc-900/80 to-zinc-800/60 rounded-2xl p-4 border border-white/10 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35D07F]/20 to-[#35D07F]/5 border border-[#35D07F]/20 flex items-center justify-center shadow-lg">
            {walletIcon}
          </div>
          <div>
            <p className="text-[10px] text-[#35D07F] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F] animate-pulse"></span>
              Connected
            </p>
            <p className="font-bold text-white text-sm mt-0.5">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium">{currentWalletName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="text-right bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">cUSD</p>
            <p className="font-black text-[#35D07F] text-lg leading-none">{formattedBalance}</p>
          </div>
          <button 
            onClick={() => disconnect()}
            className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all active:scale-90 group"
          >
            <LogOut className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 bg-gradient-to-r from-[#35D07F] to-[#2bb36f] hover:from-[#35D07F]/90 hover:to-[#2bb36f]/90 text-black font-extrabold rounded-2xl shadow-[0_8px_30px_rgba(53,208,127,0.35)] hover:shadow-[0_8px_40px_rgba(53,208,127,0.45)] transition-all active:scale-[0.98] flex justify-center items-center gap-3 text-base border border-[#35D07F]/20"
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
                {availableWallets.length > 0 ? (
                  availableWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet.connector!)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl border border-white/5 hover:border-[#35D07F]/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
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
                  ))
                ) : (
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