import { defineConfig } from '@wagmi/cli'


import { erc721MembershipMintAbi } from './constants/abis'
import { usdcMockAbi } from './constants/abis'

// @ts-ignore
export default defineConfig({
  out: 'src/generated.ts',
  contracts: [{
    name: "Erc721MembershipMint.sol",
    // @ts-ignore
    abi: erc721MembershipMintAbi
  },
  {
    name: "UsdcMock.sol",
    // @ts-ignore
    abi: usdcMockAbi
  }]
})