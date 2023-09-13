// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./PhatRollupAnchor.sol";
import "./TravelNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestLensApiConsumerContract is PhatRollupAnchor, Ownable {
    struct RequestStruct {
        address requester;
        string date;
        uint requestid;
        bool malformed;
    }

    event ResponseReceived(
        uint reqId,
        RequestStruct requestStruct,
        string departureCity,
        string arrivalCity,
        string airline
    );
    event ErrorReceived(
        uint reqId,
        RequestStruct requestStruct,
        string departureCity,
        string arrivalCity,
        string airline
    );

    

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;
    TravelNFT public travelNft;

    mapping(uint => RequestStruct) requests;
    mapping(address => uint256[]) userToTokenId;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
        travelNft = new TravelNFT();
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(
        string calldata flightNumber,
        string memory date
    ) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = RequestStruct(msg.sender, date, id, false);
        _pushMessage(abi.encode(id, flightNumber, date));
        nextRequest += 1;
    }

    function saveDetails(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = travelNft.mint(msg.sender, tokenURI);
        userToTokenId[msg.sender].push(tokenId);
        return tokenId;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id].malformed = true;
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        // require(action.length == 32 * 5, "cannot parse action");
        (
            uint respType,
            uint id,
            string memory departureCity,
            string memory arrivalCity,
            string memory airline
        ) = abi.decode(action, (uint, uint, string, string, string));
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(
                id,
                requests[id],
                departureCity,
                arrivalCity,
                airline
            );
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(
                id,
                requests[id],
                departureCity,
                arrivalCity,
                airline
            );
            delete requests[id];
        }
    }
}
