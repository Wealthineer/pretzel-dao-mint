import './globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Wagmi from './config/wagmiConfig'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PretzelDAO Membership Card',
  description: 'Mint your PretzelDAO Membership Card',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-jura bg-[#0E1234] text-white">
        <Wagmi>
          <div>{children}</div>
        </Wagmi>
      </body>
    </html>
  )
}
