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

function getDocument(uint256 id) public view returns (
        string memory, string memory, string memory, uint256, uint256, string memory, string memory, string memory, string memory
    ) {
        require(id < documents.length, "Invalid document ID");
        Document memory doc = documents[id];
        return (
            doc.ipfsCid, doc.title, doc.description, doc.size, doc.timestamp, doc.author, doc.tags, doc.blockHash, doc.txHash
        );
    }

    function getDocumentCount() public view returns (uint256) {
        return documents.length;
    }