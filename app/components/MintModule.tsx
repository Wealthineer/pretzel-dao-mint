"use client"
import { useAccount } from "wagmi"
import {usdcMockSolABI, erc721MembershipMintSolABI} from "@/src/generated"
import { readContract, writeContract } from "@wagmi/core"


function MintModule() {
    type PrefixedHexString = `0x${string}`;
    const {address, isConnected} = useAccount()

    const paymentTokenContractAddress: PrefixedHexString  = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS
        ? process.env.NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS as PrefixedHexString
        : "0x0";

    const mintContractAddress: PrefixedHexString  = process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT_ADDRESS
        ? process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT_ADDRESS as PrefixedHexString
        : "0x0";
        
    const connectedWallet: PrefixedHexString  = address ? address as PrefixedHexString : "0x0"; 

    async function getDecimalsForPaymentTokenContract() {
        const data = await readContract({
            abi: usdcMockSolABI,
            address: paymentTokenContractAddress,
            functionName: 'decimals'
        })
        return data
    }

    async function getMintPrice() {
        const data = await readContract({
            abi: erc721MembershipMintSolABI,
            address: mintContractAddress,
            functionName: 'price'
        })
        return data
    }

    async function getAllowance() {
        const data = await readContract({
            abi: usdcMockSolABI,
            address: paymentTokenContractAddress,
            functionName: 'allowance',
            args: [connectedWallet, mintContractAddress]
        })
        return data
    }

    async function checkAllowance() {
        const price = await getMintPrice()
        const decimals = BigInt(await getDecimalsForPaymentTokenContract())
        const amount: bigint = price * BigInt(10) ** decimals
        const allowance = await getAllowance()
        return (allowance >= amount) 
    }

    async function checkWhitelist() {
        const data = await readContract({
            abi: erc721MembershipMintSolABI,
            address: mintContractAddress,
            functionName: 'whitelistWithId',
            args: [connectedWallet]
        })
        return data > BigInt(0)
    }

    async function checkBalance() {
        const data = await readContract({
            abi: erc721MembershipMintSolABI,
            address: mintContractAddress,
            functionName: 'balanceOf',
            args: [connectedWallet]
        })
        return data == BigInt(0)
    }

    async function mint() {
        const {hash} =  await writeContract({
            address: mintContractAddress,
            abi: erc721MembershipMintSolABI,
            functionName: 'mint',

        })

    }

    async function setAllowance() {
        const decimals = BigInt(await getDecimalsForPaymentTokenContract())
        const price = await getMintPrice()
        const amount: bigint = price * BigInt(10) ** decimals
        const enoughAllowance = await checkAllowance()
        if(!enoughAllowance) {
            const {hash} =  await writeContract({
                address: paymentTokenContractAddress,
                abi: usdcMockSolABI,
                functionName: 'approve',
                args:[mintContractAddress, amount]
            })   
        }

    }

    async function buttonClicked() {
        const enoughAllowance = await checkAllowance()
        const isWhitelisted = await checkWhitelist()
        const balanceOk = await checkBalance()
        if (isWhitelisted && balanceOk && enoughAllowance) {
            await mint()
        }
 

    }

    return (
        <>
        <div>
            <button onClick={setAllowance} className={`flex items-center justify-center bg-[#318DFF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out`}> 
                Give Mint Contract Allowance of 50 USDC
            </button>
        </div>
        <div>
            <button onClick={buttonClicked} className={`flex items-center justify-center bg-[#318DFF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out`}> 
                Test
            </button>
        </div>


        
        </>

    )
}

export default MintModule