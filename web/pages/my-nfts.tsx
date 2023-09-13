import { useContractRead } from "wagmi";
import ContractAbi from "../../NFT-Passport/artifacts/contracts/TestLensApiConsumerContract.sol/TestLensApiConsumerContract.json";
import TravelNFTContractAbi from "../../NFT-Passport/artifacts/contracts/TravelNFT.sol/TravelNFT.json";

import { useContract, useNFT } from "@thirdweb-dev/react";

const CONTRACT_ADDRESS = "0x842216dDE3e9B8c2C4B140124211e4D90D9aeD9d";

const Index = () => {
  const { data: TravelNftAddress } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "travelNft",
  });

  const { data: userToTokenId } = useContractRead({
    address: TravelNftAddress as `0x${string}`,
    abi: TravelNFTContractAbi.abi,
    functionName: "userToTokenId",
  });
  console.log("userToTokenId: ", userToTokenId);
  return <div></div>;
};

export default Index;
