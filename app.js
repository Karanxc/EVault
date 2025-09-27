const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const multer = require('multer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const { Web3 } = require('web3');

// --- Config --
const JWT_SECRET = 'JWT_SECRET_KEY_CHANGE_ME'; ///ADD A STRONG SECRET KEY HERE
const PINATA_API_KEY = 'PINATA_API_KEY_CHANGE_ME'; ///ADD YOUR PINATA API KEY HERE
const PINATA_API_SECRET = 'PINATA_API_SECRET_CHANGE_ME';   ///ADD YOUR PINATA API SECRET HERE
const INFURA_ENDPOINT = 'https://INFURA_ENDPOINT_CHANGE_ME'; ///ADD YOUR INFURA ENDPOINT HERE
const CONTRACT_ADDRESS = 'CONTRACT_ADDRESS_CHANGE_ME';  ///ADD YOUR DEPLOYED CONTRACT ADDRESS HERE
const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "author",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "blockHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "txHash",
				"type": "string"
			}
		],
		"name": "DocumentUploaded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],