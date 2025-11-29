# NFT Minting Guide

## Quick Start

### Prerequisites
1. **Hardhat Node Running**
   ```bash
   cd contracts
   npx hardhat node
   ```
   Keep this running in the background

2. **Contracts Deployed**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Method 1: Using Hardhat Script (Recommended)

**Mint an NFT directly:**
```bash
cd contracts
npx hardhat run scripts/mintNFT.js --network localhost "My NFT" "MNFT" "ipfs://QmYourHash"
```

**Example with different URIs:**
```bash
# With IPFS
npx hardhat run scripts/mintNFT.js --network localhost "Digital Art" "ART" "ipfs://QmYourIPFSHash"

# With HTTP URL
npx hardhat run scripts/mintNFT.js --network localhost "Cool NFT" "COOL" "https://example.com/metadata.json"

# With local file (stored as file:// URL)
npx hardhat run scripts/mintNFT.js --network localhost "Local NFT" "LOCAL" "file://./metadata.json"
```

### Method 2: Using Bash Script (Easiest)

**First, make it executable:**
```bash
cd contracts
chmod +x mint-nft.sh
```

**Then mint:**
```bash
./mint-nft.sh "My NFT" "MNFT" "ipfs://QmHash"
```

**Show help:**
```bash
./mint-nft.sh --help
# or
./mint-nft.sh -h
```

### Method 3: Programmatic (Node.js)

Create `mint-example.js`:
```javascript
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function mintNFT() {
  const [signer] = await hre.ethers.getSigners();
  
  // Get contract address
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "deployments/localhost.json"), "utf8")
  );
  const contractAddress = deployment.webMessageNFT?.contractAddress;
  
  // Get contract
  const artifactData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "artifacts/contracts/WebMessageNFT.sol/WebMessageNFT.json"),
      "utf8"
    )
  );
  
  const contract = new hre.ethers.Contract(contractAddress, artifactData.abi, signer);
  
  // Mint
  const tx = await contract.mintNFT("My NFT", "MNFT", "ipfs://QmHash");
  const receipt = await tx.wait();
  
  console.log("✓ NFT Minted!");
  console.log("Transaction:", receipt.hash);
}

mintNFT().catch(console.error);
```

Then run:
```bash
cd contracts
npx hardhat run mint-example.js --network localhost
```

---

## What Happens When You Mint

1. **Script connects to contract** using the signer (first Hardhat account)
2. **Calls mintNFT()** with your parameters
3. **Blockchain creates NFT** with unique token ID
4. **Returns token details**:
   - Token ID (auto-increment starting from 0)
   - Owner address
   - Metadata URI
   - Transaction hash

5. **Mint info saved** to `contracts/mints/mint-TIMESTAMP.json`

---

## Metadata URI Formats

### IPFS (Recommended for Production)
```
ipfs://QmYourIPFSHash
```
Upload your metadata JSON to IPFS first, then use the hash.

### HTTP URL
```
https://example.com/metadata.json
```
Host your metadata on a web server.

### File Reference (Development)
```
file://./metadata.json
```
Store metadata locally in your project.

---

## Metadata JSON Structure

Create a `metadata.json` file:
```json
{
  "name": "My Digital Art #1",
  "description": "A beautiful piece of digital art",
  "image": "ipfs://QmImageHash",
  "external_url": "https://mysite.com/nft/1",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Created",
      "value": "2025"
    }
  ],
  "royalties": 500,
  "royalty_recipient": "0x..."
}
```

---

## View Your Minted NFTs

### Check a Specific Token

**Using Hardhat Console:**
```bash
cd contracts
npx hardhat console --network localhost
```

Then in console:
```javascript
// Get contract address from deployments
const deployment = require("./deployments/localhost.json");
const contractAddr = deployment.webMessageNFT.contractAddress;

// Get contract ABI
const abi = require("./artifacts/contracts/WebMessageNFT.sol/WebMessageNFT.json").abi;

// Connect to contract
const contract = await ethers.getContractAt(abi, contractAddr);

// Get token info
const tokenURI = await contract.tokenURI(0); // Token ID 0
console.log("Token URI:", tokenURI);

const owner = await contract.ownerOf(0);
console.log("Owner:", owner);

// Get current counter
const currentId = await contract.getCurrentTokenId();
console.log("Current Token ID:", currentId);
```

### Check Mint History

**View saved mints:**
```bash
ls -la contracts/mints/
cat contracts/mints/mint-TIMESTAMP.json
```

---

## Transfer an NFT

After minting, transfer it using the frontend:

1. Open the messaging app
2. Start a conversation with another user
3. Click the transfer button
4. Select "NFT" transfer type
5. Enter:
   - Contract address: `0x...` (from mint output)
   - Token ID: `0`, `1`, `2`, etc.
6. Confirm in wallet

Or transfer via Hardhat script:
```javascript
const contract = ... // Get contract as above
const signer = await ethers.getSigner();
const tx = await contract.transferNFT(
  await signer.getAddress(),  // from
  "0xRecipientAddress",        // to
  0                            // tokenId
);
await tx.wait();
console.log("NFT transferred!");
```

---

## Troubleshooting

### "WebMessageNFT artifact not found"
**Solution:** Run `npx hardhat compile` first
```bash
cd contracts
npx hardhat compile
```

### "Deployment file not found"
**Solution:** Deploy contracts first
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### "Connection refused"
**Solution:** Hardhat node not running
```bash
cd contracts
npx hardhat node
# Keep this terminal open
```

### "No accounts found"
**Solution:** Make sure you're using localhost network
```bash
# Check network in hardhat.config.js
# Should have localhost RPC: http://127.0.0.1:8545
```

### "Insufficient balance"
**Solution:** This shouldn't happen on Hardhat (unlimited funds), but if it does:
- Restart Hardhat node
- Redeploy contracts

---

## Script Outputs

When you mint an NFT, you'll see:

```
🚀 NFT Minting Script
====================

NFT Details:
  Name: My Art
  Symbol: ART
  URI: ipfs://QmHash

Signer Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Network: localhost
Block: 15

NFT Contract: 0x...

Current Token ID Counter: 5

⏳ Minting NFT on blockchain...

✓ Transaction sent
  Hash: 0x...

⏳ Waiting for confirmation...
✓ Transaction confirmed in block 16

✅ NFT Minted Successfully!
=============================

Token ID: 5
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Metadata URI: ipfs://QmHash
Contract: 0x...
Transaction: 0x...

Mint info saved to: mints/mint-1234567890.json
```

---

## Advanced: Batch Minting

Create `scripts/batchMint.js`:
```javascript
const hre = require("hardhat");

async function batchMint() {
  const [signer] = await hre.ethers.getSigners();
  
  const nfts = [
    { name: "Art #1", symbol: "ART", uri: "ipfs://Qm1" },
    { name: "Art #2", symbol: "ART", uri: "ipfs://Qm2" },
    { name: "Art #3", symbol: "ART", uri: "ipfs://Qm3" },
  ];

  const deployment = require("./deployments/localhost.json");
  const contract = new hre.ethers.Contract(
    deployment.webMessageNFT.contractAddress,
    require("./artifacts/contracts/WebMessageNFT.sol/WebMessageNFT.json").abi,
    signer
  );

  for (const nft of nfts) {
    console.log(`Minting: ${nft.name}`);
    const tx = await contract.mintNFT(nft.name, nft.symbol, nft.uri);
    const receipt = await tx.wait();
    console.log(`✓ Minted with TX: ${receipt.hash}`);
  }

  console.log("\n✅ Batch minting complete!");
}

batchMint().catch(console.error);
```

Run:
```bash
npx hardhat run scripts/batchMint.js --network localhost
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npx hardhat node` | Start local blockchain |
| `npx hardhat run scripts/deploy.js --network localhost` | Deploy contracts |
| `npx hardhat run scripts/mintNFT.js --network localhost "Name" "SYM" "uri"` | Mint NFT |
| `./mint-nft.sh "Name" "SYM" "uri"` | Mint NFT (bash) |
| `npx hardhat console --network localhost` | Interactive console |
| `ls -la mints/` | View mint history |

