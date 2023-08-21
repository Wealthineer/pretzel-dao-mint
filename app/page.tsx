import ConnectWallet from './components/ConnectWallet'
import MintModule from './components/MintModule'
import Navbar from './components/Navbar'

export default function Home() {
  return (
    <main className="">
      <Navbar />
        
      <div>
        <MintModule />
      </div>
    </main>
  )
}
