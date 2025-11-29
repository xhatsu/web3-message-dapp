const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Web3 Message contracts...");

  try {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy WebMessage contract
    const WebMessage = await hre.ethers.getContractFactory("WebMessage");
    const webMessage = await WebMessage.deploy();
    await webMessage.waitForDeployment();
    const webMessageAddress = await webMessage.getAddress();
    console.log("✓ WebMessage deployed to:", webMessageAddress);

    // Deploy WebMessageNFT contract
    const WebMessageNFT = await hre.ethers.getContractFactory("WebMessageNFT");
    const webMessageNFT = await WebMessageNFT.deploy();
    await webMessageNFT.waitForDeployment();
    const nftAddress = await webMessageNFT.getAddress();
    console.log("✓ WebMessageNFT deployed to:", nftAddress);

    // Save deployment info
    const deploymentInfo = {
      webMessage: {
        contractAddress: webMessageAddress,
        deploymentTime: new Date().toISOString(),
      },
      webMessageNFT: {
        contractAddress: nftAddress,
        deploymentTime: new Date().toISOString(),
      },
      deployerAddress: deployer.address,
      network: hre.network.name,
      blockNumber: await hre.ethers.provider.getBlockNumber(),
    };

    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath);
    }

    fs.writeFileSync(
      path.join(deploymentPath, `${hre.network.name}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("✓ Deployment info saved to deployments/" + hre.network.name + ".json");

    // Save ABIs for frontend
    const artifactsPath = path.join(__dirname, "../artifacts");
    
    const webMessageAbiPath = path.join(
      artifactsPath,
      "contracts/WebMessage.sol/WebMessage.json"
    );
    if (fs.existsSync(webMessageAbiPath)) {
      const contractJson = JSON.parse(fs.readFileSync(webMessageAbiPath, "utf8"));
      fs.writeFileSync(
        path.join(deploymentPath, "WebMessage.abi.json"),
        JSON.stringify(contractJson.abi, null, 2)
      );
      console.log("✓ WebMessage ABI saved");
    }

    const nftAbiPath = path.join(
      artifactsPath,
      "contracts/WebMessageNFT.sol/WebMessageNFT.json"
    );
    if (fs.existsSync(nftAbiPath)) {
      const nftJson = JSON.parse(fs.readFileSync(nftAbiPath, "utf8"));
      fs.writeFileSync(
        path.join(deploymentPath, "WebMessageNFT.abi.json"),
        JSON.stringify(nftJson.abi, null, 2)
      );
      console.log("✓ WebMessageNFT ABI saved");
    }

    console.log("\n✅ All contracts deployed successfully!");
    return { webMessageAddress, nftAddress };
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
