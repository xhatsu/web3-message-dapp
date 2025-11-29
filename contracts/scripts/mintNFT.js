const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper to read deployment info
function getDeploymentInfo() {
  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Deployment file not found. Run deploy.js first.");
  }
  return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
}

// Helper to format transaction output
function logTransaction(name, tx) {
  console.log(`\n✓ ${name}`);
  console.log(`  Hash: ${tx.hash}`);
  if (tx.from) console.log(`  From: ${tx.from}`);
  if (tx.to) console.log(`  To: ${tx.to}`);
}

async function main() {
  // Get arguments after the "--" separator
  // When run as: npx hardhat run script.js -- arg1 arg2 arg3
  // process.argv will be: [..., '--', 'arg1', 'arg2', 'arg3']
  const separatorIndex = process.argv.indexOf('--');
  const args = separatorIndex !== -1 ? process.argv.slice(separatorIndex + 1) : [];

  try {
    const name = "MyNFT";   
    const symbol = "TEST";  
    const uri = "https://maroon-past-rabbit-425.mypinata.cloud/ipfs/bafybeifgfc4lmpxqalrsisro3bhyevjkuh5x4lv7uspukwvk4tohoi4v5u";

    if (!name || !symbol || !uri) {
      console.error("❌ Error: All three parameters required (name, symbol, uri)");
      process.exit(1);
    }

    console.log("\n🚀 NFT Minting Script");
    console.log("====================\n");
    console.log(`NFT Details:`);
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  URI: ${uri}\n`);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`Signer Address: ${signer.address}\n`);

    // Get deployment info
    const deployment = getDeploymentInfo();
    console.log(`Network: ${deployment.network}`);
    console.log(`Block: ${deployment.blockNumber}\n`);

    // Get contract address
    let nftContractAddress;
    if (deployment.webMessageNFT?.contractAddress) {
      nftContractAddress = deployment.webMessageNFT.contractAddress;
    } else if (deployment.contractAddress) {
      // Fallback to old format
      nftContractAddress = deployment.contractAddress;
    } else {
      throw new Error("NFT contract address not found in deployment");
    }

    console.log(`NFT Contract: ${nftContractAddress}\n`);

    // Get contract ABI
    const abiPath = path.join(__dirname, "../artifacts/contracts/WebMessageNFT.sol/WebMessageNFT.json");
    if (!fs.existsSync(abiPath)) {
      throw new Error("WebMessageNFT artifact not found. Make sure to compile contracts with: npx hardhat compile");
    }

    const artifactData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    const abi = artifactData.abi;

    // Connect to contract
    const nftContract = new hre.ethers.Contract(nftContractAddress, abi, signer);

    // Get current token ID before minting
    const currentIdBefore = await nftContract.getCurrentTokenId();
    console.log(`Current Token ID Counter: ${currentIdBefore}\n`);

    // Mint NFT
    console.log("⏳ Minting NFT on blockchain...\n");
    const tx = await nftContract.mintNFT(name, symbol, uri);
    logTransaction("Transaction sent", tx);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`✓ Transaction confirmed in block ${receipt.blockNumber}`);

    // Get token ID from event
    let tokenId = null;
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          // ERC721 Transfer event
          if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daf51a3d1a4cbf4b4d99e1bb891c0e5f03a") {
            tokenId = BigInt(log.topics[3]).toString();
            break;
          }
        } catch (e) {
          // Continue if event parsing fails
        }
      }
    }

    // If not found in logs, calculate from counter
    if (!tokenId) {
      const currentIdAfter = await nftContract.getCurrentTokenId();
      tokenId = (BigInt(currentIdAfter) - BigInt(1)).toString();
    }

    // Verify the mint
    const owner = await nftContract.ownerOf(tokenId);
    const tokenUri = await nftContract.tokenURI(tokenId);

    console.log("\n✅ NFT Minted Successfully!");
    console.log("=============================\n");
    console.log(`Token ID: ${tokenId}`);
    console.log(`Owner: ${owner}`);
    console.log(`Metadata URI: ${tokenUri}`);
    console.log(`Contract: ${nftContractAddress}`);
    console.log(`Transaction: ${receipt.hash}\n`);

    // Save mint info to file
    const mintInfoPath = path.join(__dirname, "../mints/", `mint-${Date.now()}.json`);
    const mintDir = path.dirname(mintInfoPath);
    if (!fs.existsSync(mintDir)) {
      fs.mkdirSync(mintDir, { recursive: true });
    }

    const mintInfo = {
      timestamp: new Date().toISOString(),
      tokenId,
      name,
      symbol,
      metadataUri: uri,
      owner: signer.address,
      contractAddress: nftContractAddress,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      network: deployment.network,
    };

    fs.writeFileSync(mintInfoPath, JSON.stringify(mintInfo, null, 2));
    console.log(`Mint info saved to: mints/mint-${Date.now()}.json\n`);

    return tokenId;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("artifact not found")) {
      console.log("\n💡 Solution: Run 'npx hardhat compile' first");
    }
    if (error.message.includes("Deployment file not found")) {
      console.log("\n💡 Solution: Run 'npx hardhat run scripts/deploy.js --network localhost' first");
    }
    process.exitCode = 1;
  }
}

main();
