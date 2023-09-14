import { useAccount, useContractRead } from "wagmi";
import ContractAbi from "../../NFT-Passport/artifacts/contracts/TestLensApiConsumerContract.sol/TestLensApiConsumerContract.json";
import TravelNFTContractAbi from "../../NFT-Passport/artifacts/contracts/TravelNFT.sol/TravelNFT.json";

import { useContract, useNFT } from "@thirdweb-dev/react";
import { TravelNFT } from "@/MyComponents/TravelNFT";

const CONTRACT_ADDRESS = "0x80FEa1f8F3964c06E38DBB4714D04dE80C8a5FCf";

const Index = () => {
  const { address } = useAccount();
  const { data: TravelNftAddress } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "travelNft",
  });

  const { data: userToTokenId } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "getUserTokenIds",
    args: [address],
  });
  console.log(
    "userToTokenId: ",
    //   @ts-expect-error
    userToTokenId?.map((id: BigInt) => +id.toLocaleString())
  );
  return (
    <div  className="grid grid-cols-4 gap-2 p-3">
      {/* @ts-expect-error */}
      {userToTokenId?.map((id: BigInt) => (
        <div key={id.toLocaleString()}>
          <TravelNFT
            contractAddress={TravelNftAddress as unknown as string}
            tokenId={+id.toLocaleString()}
          />
        </div>
      ))}
    </div>
  );
};

export default Index;
