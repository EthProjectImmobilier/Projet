// scripts/deploy.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying Booking dApp Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("🧑‍💻 Deployer:", deployer.address);

  // 1. PropertyRegistry
  console.log("📦 1. PropertyRegistry...");
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.waitForDeployment();  // ✅ NO ARGUMENTS
  const registryAddr = await propertyRegistry.getAddress();
  console.log("✅ PropertyRegistry:", registryAddr);

  // 2. Escrow
  console.log("📦 2. Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();  // ✅ NO ARGUMENTS
  const escrowAddr = await escrow.getAddress();
  console.log("✅ Escrow:", escrowAddr);

  // 3. Booking
  console.log("📦 3. Booking...");
  const Booking = await ethers.getContractFactory("Booking");
  const booking = await Booking.deploy(registryAddr, escrowAddr);
  await booking.waitForDeployment();  // ✅ NO ARGUMENTS
  const bookingAddr = await booking.getAddress();
  console.log("✅ Booking:", bookingAddr);

  // Test property
  console.log("\n🧪 Test property...");
  const testPrice = ethers.parseEther("0.1");
  const testDeposit = ethers.parseEther("0.2");
  const testHash = ethers.id("ipfs://QmTest");

  const tx1 = await propertyRegistry.addProperty(testPrice, testDeposit, testHash);
  await tx1.wait();  // Transaction wait
  console.log("✅ Property ID 1 created");

  console.log("\n📋 SUMMARY:");
  console.log("PropertyRegistry:", registryAddr);
  console.log("Escrow:",            escrowAddr);
  console.log("Booking:",           bookingAddr);

  // Save frontend config
  const config = {
    31337: {
      PropertyRegistry: registryAddr,
      Escrow: escrowAddr,
      Booking: bookingAddr,
    }
  };

  const frontendPath = path.join(__dirname, "../frontend_PACKAGE/adresses.json");
  fs.writeFileSync(frontendPath, JSON.stringify(config, null, 2));
  console.log("\n💾 adresses.json saved!");

  console.log("\n🎉 SUCCESS!");
}

main().catch((error) => {
  console.error("❌ ERROR:", error);
  process.exit(1);
});
