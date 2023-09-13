import "@phala/pink-env";
import { Coders } from "@phala/ethers";

const DUMMY_FLIGHT_DATA = {
  flight_date: "2023-09-12",
  flight_status: "scheduled",
  departure: {
    airport: "Auckland International",
    timezone: "Pacific/Auckland",
    iata: "AKL",
    icao: "NZAA",
    terminal: "I",
    gate: null,
    delay: null,
    scheduled: "2023-09-12T00:15:00+00:00",
    estimated: "2023-09-12T00:15:00+00:00",
    actual: null,
    estimated_runway: null,
    actual_runway: null,
  },
  arrival: {
    airport: "Kuala Lumpur International Airport (klia)",
    timezone: "Asia/Kuala_Lumpur",
    iata: "KUL",
    icao: "WMKK",
    terminal: "1",
    gate: null,
    baggage: null,
    delay: null,
    scheduled: "2023-09-12T07:40:00+00:00",
    estimated: "2023-09-12T07:40:00+00:00",
    actual: null,
    estimated_runway: null,
    actual_runway: null,
  },
  airline: {
    name: "Qatar Airways",
    iata: "QR",
    icao: "QTR",
  },
  flight: {
    number: "4970",
    iata: "QR4970",
    icao: "QTR4970",
    codeshared: {
      airline_name: "malaysia airlines",
      airline_iata: "mh",
      airline_icao: "mas",
      flight_number: "132",
      flight_iata: "mh132",
      flight_icao: "mas132",
    },
  },
  aircraft: null,
  live: null,
};

type HexString = `0x${string}`;

// eth abi coder
const uintCoder = new Coders.NumberCoder(32, false, "uint256");
const bytesCoder = new Coders.BytesCoder("bytes");
const stringCoder = new Coders.StringCoder("string");

function encodeReply(
  reply: [number, number, string, string, string]
): HexString {
  return Coders.encode(
    [uintCoder, uintCoder, stringCoder, stringCoder, stringCoder],
    reply
  ) as HexString;
}

// Defined in TestLensOracle.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

enum Error {
  BadLensProfileId = "BadLensProfileId",
  FailedToFetchData = "FailedToFetchData",
  FailedToDecode = "FailedToDecode",
  MalformedRequest = "MalformedRequest",
}

function errorToCode(error: Error): number {
  switch (error) {
    case Error.BadLensProfileId:
      return 1;
    case Error.FailedToFetchData:
      return 2;
    case Error.FailedToDecode:
      return 3;
    case Error.MalformedRequest:
      return 4;
    default:
      return 0;
  }
}

const AviationAPI = "http://api.aviationstack.com/v1/flights";
function fetchFlightData(flightNumber: string, date: string): any {
  let response = pink.batchHttpRequest(
    [
      {
        url: AviationAPI + "?access_key=8bd99ce7860afecd6401cbc22cf0c27b",
        method: "GET",
        returnTextBody: true,
      },
    ],
    10000
  )[0];
  let respBody = response.body;

  if (response.statusCode !== 200) {
    // @ts-expect-error
    return JSON.parse(DUMMY_FLIGHT_DATA).data[0];
  }
  // @ts-expect-error
  console.log("res from api: ", JSON.parse(respBody).data[0]);

  // if (typeof respBody !== "object") {
  //   throw Error.FailedToDecode;
  // }
  // @ts-expect-error
  return JSON.parse(respBody).data[0];
}

function checkFlightNumber(flightNumber: string): boolean {
  if (!/^0x0$/i.test(flightNumber)) {
    return false;
  }
  return true
}
//
// Here is what you need to implemented for Phat Function, you can customize your logic with
// JavaScript here.
//
// The function will be called with two parameters:
//
// - request: The raw payload from the contract call `request` (check the `request` function in TestLensApiConsumerConract.sol).
//            In this example, it's a tuple of two elements: [requestId, profileId]
// - settings: The custom settings you set with the `config_core` function of the Action Offchain Rollup Phat Contract. In
//            this example, it just a simple text of the lens api url prefix.
//
// Your returns value MUST be a hex string, and it will send to your contract directly. Check the `_onMessageReceived` function in
// TestLensApiConsumerContract.sol for more details. We suggest a tuple of three elements: [successOrNotFlag, requestId, data] as
// the return value.
//

export default function main(request: HexString): HexString {
  console.log(`handle req: ${request}`);
  let requestId, encodedFlightNumber, encodedDate;
  try {
    [requestId, encodedFlightNumber, encodedDate] = Coders.decode(
      [uintCoder, stringCoder, stringCoder],
      request
    );
    console.log(
      `requestId: ${requestId}, encodedFlightNumber: ${encodedFlightNumber}, encodedDate: ${encodedDate}`
    );
  } catch (error) {
    console.info("Malformed request received", error);
    return encodeReply([
      TYPE_ERROR,
      0,
      `${errorToCode(error as Error)}`,
      "0x0",
      "0x0",
    ]);
  }
  const flightNumber = checkFlightNumber(encodedFlightNumber as string);
  const date = checkFlightNumber(encodedDate as string);
  console.log(`Request received for flightNumber ${flightNumber}`);
  console.log(`Request received for date ${date}`);
  // if (!flightNumber || !date) {
  //   console.info("Malformed request received");
  //   return encodeReply([
  //     TYPE_ERROR,
  //     0,
  //     `${errorToCode(Error.MalformedRequest)}`,
  //     "0x0",
  //     "0x0",
  //   ]);
  // }

  try {
    const res = fetchFlightData(encodedFlightNumber, encodedDate);
    const departureCity = res.departure.timezone;
    const arrivalCity = res.arrival.timezone;
    const airline = res.airline.name;
    return encodeReply([
      TYPE_RESPONSE,
      requestId,
      departureCity,
      arrivalCity,
      airline,
    ]);
    // return encodeReply([
    //   TYPE_RESPONSE,
    //   requestId,
    //   "Hanoi",
    //   "Singapore",
    //   "Emirates",
    // ]);
  } catch (error) {
    if (error === Error.FailedToFetchData) {
      throw error;
    } else {
      // otherwise tell client we cannot process it
      console.log("error:", [TYPE_ERROR, requestId, error]);
      return encodeReply([
        TYPE_ERROR,
        requestId,
        `${errorToCode(error as Error)}`,
        "0x0",
        "0x0",
      ]);
    }
  }
}
