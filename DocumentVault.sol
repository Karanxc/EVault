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
    function uploadDocument(
        string memory ipfsCid,
        string memory title,
        string memory description,
        uint256 size,
        uint256 timestamp,
        string memory author,
        string memory tags,
        string memory blockHash,
        string memory txHash
    ) public {
        documents.push(Document(
            ipfsCid, title, description, size, timestamp, author, tags, blockHash, txHash
        ));
        emit DocumentUploaded(
            documents.length - 1, ipfsCid, title, author, timestamp, blockHash, txHash
        );
    }
}