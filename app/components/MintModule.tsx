"use client"
import { useEffect, useState } from "react"
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"
import {usdcMockSolABI, erc721MembershipMintSolABI} from "@/src/generated"
import { readContract, writeContract } from "@wagmi/core"
import ConnectWallet from "./ConnectWallet";


function MintModule() {
    type PrefixedHexString = `0x${string}`;
    const {address, isConnected} = useAccount()
    const [enoughAllowance, setEnoughAllowance] = useState(false);
    const [isClient, setIsCLient] = useState(false);
    const [isBalanceOk, setIsBalanceOk] = useState(true);
    const [isWhitelisted, setIsWhitelisted] = useState(true);
    const [mintSuccess, setMintSuccess] = useState(false);

    useEffect(() => {
        setIsCLient(true)
    }, [])

    useEffect(() => {
        if (isConnected) {
            checkAllowance()
            checkWhitelist()
            checkBalance()
        } else {
            setEnoughAllowance(false)
        }
    }, [isConnected])

    const paymentTokenContractAddress: PrefixedHexString  = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS
        ? process.env.NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS as PrefixedHexString
        : "0x0";

    const mintContractAddress: PrefixedHexString  = process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT_ADDRESS
        ? process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT_ADDRESS as PrefixedHexString
        : "0x0";
        
    const connectedWallet: PrefixedHexString  = address ? address as PrefixedHexString : "0x0"; 

    const mintPrice: bigint  = process.env.NEXT_PUBLIC_MINT_PRICE ? BigInt(process.env.NEXT_PUBLIC_MINT_PRICE): BigInt(0)


    async function getAvailableAllowance() {
        if(!isConnected) return BigInt(0)
        const data = await readContract({
            abi: usdcMockSolABI,
            address: paymentTokenContractAddress,
            functionName: 'allowance',
            args: [connectedWallet, mintContractAddress]
        })
        return data
    }

    async function checkAllowance() {
        const allowance = await getAvailableAllowance()
        const enoughAllowance = allowance >= mintPrice
        setEnoughAllowance(enoughAllowance)
        return (enoughAllowance) 
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
        if(!isConnected) return true
        const data = await readContract({
            abi: erc721MembershipMintSolABI,
            address: mintContractAddress,
            functionName: 'balanceOf',
            args: [connectedWallet]
        })
        const isBalanceOk = data == BigInt(0)
        setIsBalanceOk(isBalanceOk)
        return isBalanceOk
    }

    const {config: allowanceConfig} = usePrepareContractWrite({
                address: paymentTokenContractAddress,
                abi: usdcMockSolABI,
                functionName: 'approve',
                args:[mintContractAddress, mintPrice]
    })
    const allowanceWrite = useContractWrite(allowanceConfig)

    const {} = useWaitForTransaction({
        hash: allowanceWrite.data?.hash,
        onSuccess(data) {
            console.log(data)
            checkAllowance()
            console.log("Allowance success, update enoughAllowance")
        }

    })

    async function setAllowance() {
        const enoughAllowance = await checkAllowance()
        if(!enoughAllowance) {
            //@ts-ignore
            allowanceWrite?.write()
        }

    }

    const {config: mintConfig} = usePrepareContractWrite({
            address: mintContractAddress,
            abi: erc721MembershipMintSolABI,
            functionName: 'mint',
        })
    const mintWrite = useContractWrite(mintConfig)

    const {} = useWaitForTransaction({
        hash: mintWrite.data?.hash,
        onSuccess(data) {
            console.log(data)
            setMintSuccess(true)
            checkBalance()
            console.log("Mint success, update balance")
        }

    })

    async function mint() {
        const enoughAllowance = await checkAllowance()
        const isWhitelisted = await checkWhitelist()
        const isBalanceOk = await checkBalance()
        if (isWhitelisted && isBalanceOk && enoughAllowance) {
                   //@ts-ignore
        mintWrite?.write()
        }

    }

    return (
        <>
        <div className="flex justify-center ">
        {isClient && !isConnected && <div className="flex"><ConnectWallet /></div>}

        {isClient && isBalanceOk && isConnected && !enoughAllowance && <div className="flex"><button onClick={setAllowance} className={`flex items-center justify-center bg-[#0077FF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out`}> 
               Give Mint Contract Allowance of 50 USDC
            </button></div>}

        {isClient && isBalanceOk && isConnected && enoughAllowance && <button onClick={mint} className={`flex items-center justify-center bg-[#0077FF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out min-w-[150px]`}> 
                Mint
            </button>} 
        </div>
        <div className="flex justify-center">
            {isClient && isConnected && !enoughAllowance && isBalanceOk && <p>You need to set an allowance of 50 USDC for minting the membership card using the button above</p>}
            {isClient && isConnected && !isBalanceOk && <p>You already own a membership card</p>}
            {isClient && isConnected && !isBalanceOk && mintSuccess && <p>Congrats on minting your Pretzel DAO membership card</p>}
            {isClient && isConnected && !isWhitelisted && <p>You need to be whitelisted by the Pretzel DAO leadership team to mint</p>}
        </div>
        </>


    )
}

export default MintModule