"use client"
import { use, useEffect, useState } from "react"
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi"
import {usdcMockSolABI, erc721MembershipMintSolABI} from "@/src/generated"
import { readContract, writeContract } from "@wagmi/core"
import ConnectWallet from "./ConnectWallet";
import DeployingModal from "./Modal"


function MintModule() {
    type PrefixedHexString = `0x${string}`;
    const {address, isConnected} = useAccount()
    const [enoughAllowance, setEnoughAllowance] = useState(false);
    const [isClient, setIsCLient] = useState(false);
    const [isBalanceOk, setIsBalanceOk] = useState(true);
    const [isWhitelisted, setIsWhitelisted] = useState(true);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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




    //Methods reading from smart contracts that are required to determine in which state of the mint the user currently is and what needs to be done

    async function checkAllowance() {
        if(!isConnected) return BigInt(0)

        const allowance = await readContract({
            abi: usdcMockSolABI,
            address: paymentTokenContractAddress,
            functionName: 'allowance',
            args: [connectedWallet, mintContractAddress]
        })

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


    //Set up the transaction to give the required allowance for the mint

    const {config: allowanceConfig} = usePrepareContractWrite({
                address: paymentTokenContractAddress,
                abi: usdcMockSolABI,
                functionName: 'approve',
                args:[mintContractAddress, mintPrice]
    })
    const {write: allowanceWrite, data: allowanceData} = useContractWrite(allowanceConfig)

    const {isSuccess: allowanceIsSucces, isError: allowanceIsError, isLoading: allowanceIsLoading, error: allowanceError} = useWaitForTransaction({
        hash: allowanceData?.hash,

    })


    //Set up the mint transaction

    const {config: mintConfig, refetch: mintPrepareRefetch} = usePrepareContractWrite({
            address: mintContractAddress,
            abi: erc721MembershipMintSolABI,
            functionName: 'mint',
            enabled: false, //since the balance might not be set, this fails most likely on first try
        })
    const {write: mintWrite, data: mintData, reset: mintReset, isError: mintWriteIsError, error: mintWriteError} = useContractWrite(mintConfig)

    const {isSuccess: mintIsSuccess, isError: mintIsError, error: mintError, isLoading: mintIsLoading} = useWaitForTransaction({
        hash: mintData?.hash,

    })


    //functions called by the buttons

    async function setAllowance() {
        await checkAllowance()
        if(!enoughAllowance) {
            allowanceWrite?.()
        }

    }

    async function mint() {
        await checkAllowance()
        await checkWhitelist()
        await checkBalance()
        if (isWhitelisted && isBalanceOk && enoughAllowance) {
            mintWrite?.()
        }

    }



    //Reacting to the change of state variables
    useEffect(() => {
        if(enoughAllowance) {
            //you can do the mint prepare only once the allowance is set  - otherwise it will fail
            //if the allowance is already set on loading you would not populate the fetch when doing this
            //call only in the allowanceIsSuccess check
            mintPrepareRefetch()
        }
    }, [enoughAllowance])



    //Handle successful transcation

    useEffect(() => {
        if(allowanceIsSucces) {
            console.log("Allowance success, update enoughAllowance")
            checkAllowance() //update the enoughAllowance state variable to take the successful transaction into account
            
        }
    }, [allowanceIsSucces])


    useEffect(() => {
        if(mintIsSuccess) {
            setMintSuccess(true) //setting state to give a different message to the user than when visiting the page with already minted membership card
            checkBalance() //update the isBalanceOk state variable to take the successful transaction into account
            console.log("Mint success, update balance")
        }
    }, [mintIsSuccess])




    //Handle errors in various stages

    useEffect(() => {
        if(allowanceIsError) {
            //handle here what needs to be done if the allowance transaction fails
            console.log("Allowance error")
            console.log(allowanceError)
        }
    }, [allowanceIsError])

    useEffect(() => {
        if(mintIsError) {
            //handle here what needs to be done if the mint transaction fails
            console.log("Mint Error")
            console.log(mintError)
        }
    }, [mintIsError])

    useEffect(() => {
        if(mintWriteError) {
            //handle here what needs to be done if the user e.g. decides to reject the transaction
            console.log("mint write error")
            console.log(mintWriteError)
        }
    }, [mintWriteError])


    //Handle loading effects

    useEffect(() => {
        if(allowanceIsLoading) {
            console.log("Allowance is now starting transaction")
            setIsOpen(true)
            
        }
        if(!allowanceIsLoading) {
            console.log("Allowance has ended transaction")
            setIsOpen(false)
        }
    }, [allowanceIsLoading])

    useEffect(() => {
        if(mintIsLoading) {
            console.log("Mint is now starting transaction")
            setIsOpen(true)
        }
        if(!mintIsLoading) {
            console.log("Mint has ended transaction")
            setIsOpen(false)
        }
    }, [mintIsLoading])

    return (
        <>
        < DeployingModal isOpen={isOpen} />
        <div>
        <div className="flex items-center justify-center">
            {isClient && !isConnected && <div className="flex"><ConnectWallet /></div>}

            {isClient && isBalanceOk && isConnected && !enoughAllowance && <div className="flex"><button onClick={setAllowance} disabled={!allowanceWrite} className={`flex items-center justify-center bg-[#0077FF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out`}> 
                Give Mint Contract Allowance of 50 USDC
                </button></div>}

            {isClient && isBalanceOk && isConnected && enoughAllowance && <button onClick={mint} disabled={!mintWrite} className={`flex items-center justify-center bg-[#0077FF] text-white whitespace-nowrap py-[12px] px-[13px] rounded-md text-center text-base cursor-pointer  transition:ease-in-out min-w-[150px]`}> 
                    Mint
                </button>} 
        </div>
        <div className="flex items-center justify-center mt-5">
            {isClient && isConnected && !enoughAllowance && isBalanceOk && <p>You need to set an allowance of 50 USDC for minting the membership card using the button above</p>}
            {isClient && isConnected && !isBalanceOk && !mintSuccess&&  <p>You already own a membership card</p>}
            {isClient && isConnected && !isBalanceOk && mintSuccess && <p>Congrats on minting your Pretzel DAO membership card</p>}
            {isClient && isConnected && !isWhitelisted && <p>You need to be whitelisted by the Pretzel DAO leadership team to mint</p>}
        </div>
        </div>
        
        </>


    )
}

export default MintModule