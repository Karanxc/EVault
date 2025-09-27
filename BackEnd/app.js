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
