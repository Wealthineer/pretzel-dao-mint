"use client"
import { use, useEffect, useState } from "react"
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction, useContractEvent } from "wagmi"
import {usdcMockSolABI, erc721MembershipMintSolABI} from "@/src/generated"
import { readContract, writeContract } from "@wagmi/core"
import ConnectWallet from "./ConnectWallet";
import DeployingModal from "./TransactionModal"
import NotificationPopup from "./NotificationPopup"
import TransactionModal from "./TransactionModal"


function MintModule() {
    type PrefixedHexString = `0x${string}`;
    const {address, isConnected} = useAccount()
    const [enoughAllowance, setEnoughAllowance] = useState(false);
    const [isClient, setIsCLient] = useState(false);
    const [isBalanceOk, setIsBalanceOk] = useState(true);
    const [isWhitelisted, setIsWhitelisted] = useState(true);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [mintSuccessNotifyIsOpen, setMintSuccessNotifyIsOpen] = useState(false);
    const [allowanceSuccessNotifyIsOpen, setAllowanceSuccessNotifyIsOpen] = useState(false);
    const [errorNotifyIsOpen, setErrorNotifyIsOpen] = useState(false);
    const [mintModalIsOpen, setMintModalIsOpen] = useState(false);
    const [allowanceModalIsOpen, setAllowanceModalIsOpen] = useState(false);
    const [mintedNftId, setMintedNftId] = useState(0);

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
    const openSeaBaseUrl = process.env.NEXT_PUBLIC_OPEN_SEA_BASE_URL




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
    const {write: allowanceWrite, data: allowanceData, error: allowanceWriteError, isError: allowanceWriteIsError} = useContractWrite(allowanceConfig)

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

    const unwatch =  useContractEvent({
        address: mintContractAddress,
        abi: erc721MembershipMintSolABI,
        eventName: 'Transfer',
        listener: (event) => {
            if(event[0].topics[2].toLowerCase().includes(address ? address.toLowerCase().substring(2) : "address not set")) {
                setMintedNftId(parseInt(event[0].topics[3], 16))
                unwatch?.()
            }
            
        }
    })


    //functions called by the buttons

    async function setAllowance() {
        await checkAllowance()
        if(!enoughAllowance) {
            allowanceWrite?.()
        }

    }

    async function mint() {
        setAllowanceSuccessNotifyIsOpen(false) //close the notification that the allowance was successful so the mint notification will be visible
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
            checkAllowance() //update the enoughAllowance state variable to take the successful transaction into account
            setAllowanceSuccessNotifyIsOpen(true) //show the user a notification that the allowance was successful
            
        }
    }, [allowanceIsSucces])


    useEffect(() => {
        if(mintIsSuccess) {
            setMintSuccess(true) //setting state to give a different message to the user than when visiting the page with already minted membership card
            setMintSuccessNotifyIsOpen(true) //show the user a notification that the mint was successful
            checkBalance() //update the isBalanceOk state variable to take the successful transaction into account
            
        }
    }, [mintIsSuccess])




    //Handle errors in various stages

    useEffect(() => {
        if(allowanceIsError) {
            //handle here what needs to be done if the allowance transaction fails
            setErrorNotifyIsOpen(true)
        }
    }, [allowanceIsError])


    useEffect(() => {
        if(allowanceWriteIsError) {
            //handle here what needs to be done if the allowance transaction fails
            setErrorNotifyIsOpen(true)
        }
    }, [allowanceWriteIsError])

    useEffect(() => {
        if(mintIsError) {
            //handle here what needs to be done if the mint transaction fails
            setErrorNotifyIsOpen(true)
        }
    }, [mintIsError])

    useEffect(() => {
        if(mintWriteError) {
            //handle here what needs to be done if the user e.g. decides to reject the transaction
            setErrorNotifyIsOpen(true)
        }
    }, [mintWriteError])


    //Handle loading effects

    useEffect(() => {
        if(allowanceIsLoading) {
            setAllowanceModalIsOpen(true)
            
        }
        if(!allowanceIsLoading) {
            setAllowanceModalIsOpen(false)
        }
    }, [allowanceIsLoading])

    useEffect(() => {
        if(mintIsLoading) {
            setMintModalIsOpen(true)
        }
        if(!mintIsLoading) {
            setMintModalIsOpen(false)
        }
    }, [mintIsLoading])

    return (
        <>
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
            {isClient && isConnected && !isBalanceOk && mintSuccess && <><p>Congrats on minting your Pretzel DAO membership card</p></> }
            {isClient && isConnected && !isBalanceOk && mintSuccess && mintedNftId>0 && <a className="text-gray-400" href={openSeaBaseUrl + mintContractAddress +"/" + mintedNftId} target="_blank"> (Your NFT on OpenSea)</a>}
            {isClient && isConnected && !isWhitelisted && <p>You need to be whitelisted by the Pretzel DAO leadership team to mint</p>}
        </div>
        </div>
        <NotificationPopup success={true} isActive={mintSuccessNotifyIsOpen} setActive={setMintSuccessNotifyIsOpen} title="Minting Successful" description="You have successfully minted your Pretzel DAO membership card" />
        <NotificationPopup success={true} isActive={allowanceSuccessNotifyIsOpen} setActive={setAllowanceSuccessNotifyIsOpen} title="Allowance Successful" description="You have successfully given the mint contract an allowance of 50 USDC" />
        <NotificationPopup success={false} isActive={errorNotifyIsOpen} setActive={setErrorNotifyIsOpen} title="Error" description="An error occured. Please try again." />
        <TransactionModal open={mintModalIsOpen} setOpen={setMintModalIsOpen} title="Minting Membership Card" description="You are currently minting your Pretzel DAO membership card..." txHash={mintData?.hash} />
        <TransactionModal open={allowanceModalIsOpen} setOpen={setAllowanceModalIsOpen} title="Processing Allowance" description="Transcation for giving the mint contract an allowance of 50 USDC is processing..." txHash={allowanceData?.hash} />
        </>


    )
}

export default MintModule