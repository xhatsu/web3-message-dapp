const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying WebMessage contract...");

  try {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    // Deploy contract
    const WebMessage = await hre.ethers.getContractFactory("WebMessage");
    const webMessage = await WebMessage.deploy();

    await webMessage.waitForDeployment();
    const contractAddress = await webMessage.getAddress();

    console.log("WebMessage deployed to:", contractAddress);

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      deployerAddress: deployer.address,
      deploymentTime: new Date().toISOString(),
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

    console.log("Deployment info saved to deployments/", hre.network.name + ".json");

    // Save ABI and contract info for frontend
    const artifactsPath = path.join(__dirname, "../artifacts");
    const abiPath = path.join(
      artifactsPath,
      "contracts/WebMessage.sol/WebMessage.json"
    );

    if (fs.existsSync(abiPath)) {
      const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
      const abi = contractJson.abi;

      fs.writeFileSync(
        path.join(deploymentPath, "WebMessage.abi.json"),
        JSON.stringify(abi, null, 2)
      );
      console.log("ABI saved to deployments/WebMessage.abi.json");
    }

    return contractAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
