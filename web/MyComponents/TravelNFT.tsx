import { json } from "@helia/json";
import { useContract, useNFT } from "@thirdweb-dev/react";
import { createHelia } from "helia";
import { useEffect } from "react";

export const TravelNFT: React.FC<{
  contractAddress: string;
  tokenId: number;
}> = ({ contractAddress, tokenId }) => {
  const { contract } = useContract(contractAddress);
  const { data: nft, isLoading, error } = useNFT(contract, tokenId);

  console.log("nft: ", nft);
  console.log("isLoading: ", isLoading);
  console.log("error: ", error);

  useEffect(() => {
    if (!nft) return;
    (async () => {})();
  }, [nft]);
  return (
    <div className="flex w-56 p-2 flex-col gap-2 border-2 rounded-md border-b-gray-500">
      <div>Arrival City: Barcelona</div>
      <div>Departure City: London</div>
      <div>Airline: Lufthansa</div>
    </div>
  );
};
