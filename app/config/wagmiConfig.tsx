"use client"

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { Chain, mainnet, sepolia, polygonMumbai, polygon } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const activeChain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN

let chain: Chain[] = []
if(activeChain == "mainnet") {
    chain = [mainnet]
} else if(activeChain == "sepolia") {
    chain = [sepolia]
} else if(activeChain == "polygon") {
    chain = [polygon]
} else if(activeChain == "polygonMumbai") {
    chain = [polygonMumbai]
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
    chain,

    [
        infuraProvider({
            apiKey: process.env.NEXT_PUBLIC_INFURA_KEY != undefined ? process.env.NEXT_PUBLIC_INFURA_KEY : "NO KEY",
        }),
        publicProvider(),
    ],
)



export const rainbowChains = chains;

console.log(process.env.WALLET_CONNECT_API)


const { wallets } = getDefaultWallets({
    appName: "Pretzel Dao Membership Mint",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_API != undefined ? process.env.NEXT_PUBLIC_WALLET_CONNECT_API : "NO KEY",
    chains,
});
const connectors = connectorsForWallets([...wallets]);



const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    webSocketPublicClient,
    publicClient
})



export default function Wagmi({ children,
}: {
    children: React.ReactNode
}) {
    return (<WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider coolMode chains={chains}>{children}
        </RainbowKitProvider>
    </WagmiConfig >
    );
}



