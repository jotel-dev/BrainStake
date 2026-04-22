import { createConfig, http, createStorage } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celo, celoAlfajores],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({
      target: 'coinbaseWallet',
    }),
    injected({
      target: 'metaMask',
    }),
    coinbaseWallet({
      projectId: 'brainstake',
      appName: 'BrainStake',
    }),
  ],
  storage: typeof window !== 'undefined' ? createStorage({
    storage: window.localStorage,
  }) : undefined,
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'),
    [celoAlfajores.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org'),
  },
});