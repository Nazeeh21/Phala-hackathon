// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PhatRollupAnchor.sol";

contract TestLensApiConsumerContract is PhatRollupAnchor, Ownable {
    event ResponseReceived(
        uint reqId,
        string pair,
        string departureCity,
        string arrivalCity,
        string airline
    );
    event ErrorReceived(
        uint reqId,
        string pair,
        string departureCity,
        string arrivalCity,
        string airline
    );

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    mapping(uint => string) requests;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(
        string calldata flightNumber,
        string memory date,
        string memory currentTimeStamp
    ) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = currentTimeStamp;
        _pushMessage(abi.encode(id, flightNumber, date));
        nextRequest += 1;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id] = "malformed_req";
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        require(action.length == 32 * 5, "cannot parse action");
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
