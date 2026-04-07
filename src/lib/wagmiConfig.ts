import { createConfig, http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celoAlfajores, celo],
  connectors: [
    injected(), // MiniPay compatibility, forces using window.ethereum injected by the environment
  ],
  transports: {
    [celoAlfajores.id]: http(),
    [celo.id]: http(),
  },
});
