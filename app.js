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


const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMzhiZThiMy0zZjYyLTRiM2MtOTE2Mi0wM2VhM2U4N2M1MDMiLCJlbWFpbCI6Indhc3BsaXNiZXRoc2FsYW5kZXI2NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMmM4MTYxNDhiZmIyNGJjMzU1YTQiLCJzY29wZWRLZXlTZWNyZXQiOiI5MDQ2NGIzZjE2YzU0YjExNDU3YmY5M2Y2Yzg0MDhhZTE0YjViNWZiZDc2OTU5MjRiY2RiOTU0M2E0NTc0ZmNiIiwiZXhwIjoxNzkwNTQ0OTgwfQ.S2Ij-j8zKdTvH04VZIXlCrPHqB36M-CQKWJCMPb_58g';
const PINATA_API_KEY = '2c816148bfb24bc355a4';
const PINATA_API_SECRET = '90464b3f16c54b11457bf93f6c8408ae14b5b5fbd7695924bcdb9543a4574fcb';
const INFURA_ENDPOINT = 'https://sepolia.infura.io/v3/38c9f41e70ec4e5d9be4deb54666e0dc';
const CONTRACT_ADDRESS = '0xb98CfaabC11dae6d74890A3714745687FF8f5529';
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
				"name": "ipfsCid",
				"type": "string"
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
		"name": "documents",
		"outputs": [
			{
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "size",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "author",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "blockHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "txHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getDocument",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDocumentCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
<<<<<<< HEAD
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "size",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "author",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "blockHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "txHash",
				"type": "string"
			}
		],
		"name": "uploadDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const PRIVATE_KEY = '0xf141361d6fb18da6e2cf37b53fb373e64c82958bf56d880aa36cfc6155c07ee6';

mongoose.connect('mongodb+srv://aayush:0cP6EZ8RR8OqJdFr@evault.ayq5wuc.mongodb.net/');



const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);


const web3 = new Web3(INFURA_ENDPOINT);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer();


function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// --- Routes ---

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'public', 'search.html')));
app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'public', 'upload.html')));

// --- Auth API ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.passwordHash === hashPassword(password)) {
    const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
  if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'User exists' });
  const user = new User({ name, email, passwordHash: hashPassword(password), role: 'user' });
  await user.save();
  const token = jwt.sign({ email, name, role: 'user' }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ success: true, token, user: { email, name, role: 'user' } });
});

// --- Upload Document (Pinata + Ethereum) ---
app.post('/api/upload', authenticateJWT, upload.single('file'), async (req, res) => {
    const { title, description, tags } = req.body;
    if (!title || !req.file) return res.status(400).json({ success: false, message: 'Missing fields' });

    try {
        // Pinata upload
        const data = new FormData();
        data.append('file', req.file.buffer, req.file.originalname);
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                ...data.getHeaders(),
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_API_SECRET
            }
        });

        const ipfsCid = response.data.IpfsHash;
        const size = req.file.size;
        const timestamp = Math.floor(Date.now() / 1000);
        const author = req.user.name || req.user.email || '';

        // Upload document WITHOUT blockHash and txHash
        const tx = contract.methods.uploadDocument(
            ipfsCid,
            title,
            description || '',
            size,
            timestamp,
            author,
            tags || '',
			'', // blockHash
    		''  // txHash
        );
        const gas = await tx.estimateGas({ from: account.address });
        const receipt = await tx.send({ from: account.address, gas });

        // Return blockHash and txHash from the transaction receipt
        res.json({
            success: true,
            doc: {
                title,
                description,
                tags: tags ? tags.split(',').map(t => t.trim()) : [],
                ipfsCid,
                size: size.toString(),
                author,
                timestamp: timestamp.toString(),
                blockHash: receipt.blockHash,
                txHash: receipt.transactionHash
            }
        });
    } catch (err) {
        console.error('Pinata or Ethereum upload error:', err.response?.data || err.message || err);
        res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
    }
});

// --- Search Documents (from Ethereum) ---
app.get('/api/search', async (req, res) => {
  try {
    const count = await contract.methods.getDocumentCount().call();
    let docs = [];

    // Fetch all DocumentUploaded events
    const events = await contract.getPastEvents('DocumentUploaded', {
      fromBlock: 0,
      toBlock: 'latest'
    });

    // Map event logs by document ID
    const eventMap = {};
    events.forEach(ev => {
      eventMap[ev.returnValues.id] = {
        txHash: ev.transactionHash,
        blockHash: ev.blockHash
      };
    });

    for (let i = 0; i < Number(count); i++) {
      const doc = await contract.methods.getDocument(i).call();
      const eventData = eventMap[i] || {};
      docs.push({
        ipfsCid: doc[0],
        title: doc[1],
        description: doc[2],
        size: typeof doc[3] === 'bigint' ? Number(doc[3]) : doc[3],
        timestamp: typeof doc[4] === 'bigint' ? Number(doc[4]) : doc[4],
        author: doc[5],
        tags: doc[6],
        blockHash: eventData.blockHash || "",
        txHash: eventData.txHash || ""
      });
    }
    res.json(docs);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed', error: err.message });
  }
});

// --- Get Document Details ---
app.get('/api/document/:id', async (req, res) => {
  try {
    const doc = await contract.methods.getDocument(req.params.id).call();
    res.json({
      success: true,
      doc: {
        ipfsCid: doc[0],
        title: doc[1],
        description: doc[2],
        tags: doc[3],
        owner: doc[4],
        timestamp: doc[5]
      }
    });
  } catch (err) {
    res.status(404).json({ success: false, message: 'Not found' });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LegalVault app listening on port ${PORT}`);
});