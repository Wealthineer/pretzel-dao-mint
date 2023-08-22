import ConnectWallet from './components/ConnectWallet'
import MintModule from './components/MintModule'
import Navbar from './components/Navbar'
import HowTo from './sections/HowTo'
import About from './sections/About'
import Minting from './sections/Minting'

export default function Home() {
  return (
    <main >
      <div className="relative">
        <Navbar />
        <div className="flex justify-center">
          <About />  
          <div className="gradient-01 z-0" />
        </div>
      </div>
      <div className="relative flex justify-center mt-20">
          <div className="gradient-01 z-0" />
          <HowTo />
  
      </div>
      
      <div className="relative">
        <Minting />
        <div className="gradient-02 z-0" />
      </div>
    </main>
  )
}
