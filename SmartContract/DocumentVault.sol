// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVault {
    struct Document {
        string ipfsCid;
        string title;
        string description;
        uint256 size;
        uint256 timestamp;
        string author;
        string tags;
        string blockHash;
        string txHash;
    }

    Document[] public documents;

    event DocumentUploaded(
        uint256 indexed id,
        string ipfsCid,
        string title,
        string author,
        uint256 timestamp,
        string blockHash,
        string txHash
    );
