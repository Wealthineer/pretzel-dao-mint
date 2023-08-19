import ConnectWallet from './components/ConnectWallet'
import MintModule from './components/MintModule'

export default function Home() {
  return (
    <main className="">
      <div className='flex justify-end items-center mt-[19px] font-semibold mr-[58px]'>
        <ConnectWallet />
      </div>
      <div>
        <MintModule />
      </div>
    </main>
  )
}
