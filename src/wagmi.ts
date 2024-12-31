import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import {
  base,
  mainnet,
} from 'wagmi/chains';

const testnet = {
  id: 84532,
  name: 'Base Sepolia Testnet',
  iconBackground: '#ffc431',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'base', url: 'https://sepolia.basescan.org' },
  },
  
} as const satisfies Chain;


export const config = getDefaultConfig({
  appName: 'virtuals',
  projectId: '332e2c7e370d564a788b928d45b787a5',
  chains: [
    testnet,
    mainnet,
    base,
  ],
  ssr: true,
});
