import { Inter } from "next/font/google";
import { useState } from "react";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { useDebounce } from "usehooks-ts";
import ContractAbi from "../artifacts/contracts/TestLensApiConsumerContract.sol/TestLensApiConsumerContract.json";
import clsx from "clsx";
import { createHelia } from "helia";
import { json } from "@helia/json";

const inter = Inter({ subsets: ["latin"] });

const CONTRACT_ADDRESS = "0x80FEa1f8F3964c06E38DBB4714D04dE80C8a5FCf";

type AirlineDataType = {
  airline: string;
  arrivalCity: string;
  departureCity: string;
};

export default function Home() {
  const { address } = useAccount();
  const [fligthNumber, setFlightNumber] = useState<string>();
  const [departureDate, setDepartureDate] = useState<string>();
  const debouncedFlightNumber = useDebounce(fligthNumber, 500);
  const debouncedDepartureDate = useDebounce(departureDate, 500);
  const [airlineData, setAirlineData] = useState<AirlineDataType>();

  useContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    eventName: "ResponseReceived",
    listener(log) {
      console.log("ResponseReceived: ", log);
      // @ts-expect-error
      const data = log[0].args;

      data &&
        data.requestStruct.requester === address &&
        setAirlineData({
          airline: data.airline,
          departureCity: data.departureCity,
          arrivalCity: data.arrivalCity,
        });
    },
  });

  useContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    eventName: "ErrorReceived",
    listener(log) {
      console.log("ErrorReceived: ", log);
    },
  });

  const { write, error: writeError } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "request",
    // args: [debouncedFlightNumber, debouncedDepartureDate, new Date()],
  });

  const {
    write: writeSaveDetails,
    error: saveDetailsError,
    isSuccess,
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ContractAbi.abi,
    functionName: "saveDetails",
  });

  const insideData = () => {
    if (airlineData) {
      return (
        <div className="flex flex-col gap-4">
          <div className="text-xl pb-2 font-medium">Your Flight Data:</div>
          <div className="">Airline: {airlineData.airline}</div>
          <div>Departure City: {airlineData.departureCity}</div>
          <div>Arrival City: {airlineData.arrivalCity}</div>
          <button
            className={clsx(
              "p-2 bg-slate-200 border-2 border-blue-700 rounded-md",
              !writeSaveDetails && "opacity-50 cursor-not-allowed"
            )}
            disabled={!writeSaveDetails}
            onClick={async () => {
              let req = new XMLHttpRequest();

              req.onreadystatechange = () => {
                if (req.readyState == XMLHttpRequest.DONE) {
                  console.log(req.responseText);
                  writeSaveDetails?.({
                    args: [req?.response.data?.metadata?.id],
                  });
                }
              };

              req.open("POST", "https://api.jsonbin.io/v3/b", true);
              req.setRequestHeader("Content-Type", "application/json");
              req.setRequestHeader(
                "X-Master-Key",
                process.env.NEXT_PUBLIC_MASTER_KEY!
              );
              req.send("${airlineData}");
            }}
          >
            Mint NFT
          </button>
          {saveDetailsError && (
            <div>Error while Minting NFT: {saveDetailsError?.message}</div>
          )}
          {isSuccess && <div>NFT Minted Successfully</div>}
        </div>
      );
    }

    return (
      <>
        <div className="text-xl mb-2 font-medium">Add flights</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            write?.({
              args: [debouncedFlightNumber, debouncedDepartureDate],
            });
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
      </>
    );
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center ${inter.className}`}
    >
      {insideData()}
    </main>
  );
}
