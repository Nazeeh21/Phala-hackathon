import { Inter } from "next/font/google";
import { useState } from "react";
import {
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { useDebounce } from "usehooks-ts";
import ContractAbi from "../../NFT-Passport/artifacts/contracts/TestLensApiConsumerContract.sol/TestLensApiConsumerContract.json";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  const [fligthNumber, setFlightNumber] = useState<string>();
  const [departureDate, setDepartureDate] = useState<string>();
  const debouncedFlightNumber = useDebounce(fligthNumber, 500);
  const debouncedDepartureDate = useDebounce(departureDate, 500);

  const responseEvent = useContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    eventName: "ResponseReceived",
    listener(log) {
      console.log("ResponseReceived: ", log);
    },
  });

  const errorEvent = useContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    eventName: "ErrorReceived",
    listener(log) {
      console.log("ErrorReceived: ", log);
    },
  });

  // const { config, error: isPrepareError } = usePrepareContractWrite({
  //   address: CONTRACT_ADDRESS,
  //   abi: ContractAbi.abi,
  //   functionName: "request",
  //   args: [debouncedFlightNumber, debouncedDepartureDate, new Date()],
  // });

  const { write, error: writeError } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "request",
    args: [debouncedFlightNumber, debouncedDepartureDate, new Date()],
  });

  return (
    <main
      className={`flex min-h-screen flex-col items-center ${inter.className}`}
    >
      <div className="text-xl mb-2 font-medium">Add flights</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          write?.();
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium">Flight number: </label>
          <input
            value={fligthNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            type="text"
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium">Departure Date: </label>
          <input
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            type="date"
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          disabled={!write}
          type="submit"
          className={clsx(
            "p-2 bg-slate-200 border-2 border-blue-700 rounded-md",
            !write && "opacity-50 cursor-not-allowed"
          )}
        >
          Fetch Flight Data
        </button>
      </form>

      {writeError && <div>Error: {writeError?.message}</div>}
    </main>
  );
}
