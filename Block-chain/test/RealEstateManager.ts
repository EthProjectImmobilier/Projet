import { expect } from "chai";
import { ethers } from "hardhat";
import { PropertyRegistry, PropertyNFT, EscrowPayment, RentalSystem, RealEstateManager } from "../typechain-types";

describe("RealEstateManager", function () {
  let propertyRegistry: PropertyRegistry;
  let propertyNFT: PropertyNFT;
  let escrowPayment: EscrowPayment;
  let rentalSystem: RentalSystem;
  let manager: RealEstateManager;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const PropertyRegistryFactory = await ethers.getContractFactory("PropertyRegistry");
    propertyRegistry = await PropertyRegistryFactory.deploy(owner.address) as PropertyRegistry;
    await propertyRegistry.waitForDeployment();
    console.log("PropertyRegistry deployed to:", await propertyRegistry.getAddress());

    const PropertyNFTFactory = await ethers.getContractFactory("PropertyNFT");
    propertyNFT = await PropertyNFTFactory.deploy(await propertyRegistry.getAddress(), owner.address) as PropertyNFT;
    await propertyNFT.waitForDeployment();
    console.log("PropertyNFT deployed to:", await propertyNFT.getAddress());

    const EscrowPaymentFactory = await ethers.getContractFactory("EscrowPayment");
    escrowPayment = await EscrowPaymentFactory.deploy(owner.address) as EscrowPayment;
    await escrowPayment.waitForDeployment();
    console.log("EscrowPayment deployed to:", await escrowPayment.getAddress());

    const RentalSystemFactory = await ethers.getContractFactory("RentalSystem");
    rentalSystem = await RentalSystemFactory.deploy(
      await propertyRegistry.getAddress(),
      await escrowPayment.getAddress(),
      owner.address
    ) as RentalSystem;
    await rentalSystem.waitForDeployment();
    console.log("RentalSystem deployed to:", await rentalSystem.getAddress());

    const RealEstateManagerFactory = await ethers.getContractFactory("RealEstateManager");
    manager = await RealEstateManagerFactory.deploy(
      await propertyRegistry.getAddress(),
      await propertyNFT.getAddress(),
      await rentalSystem.getAddress(),
      await escrowPayment.getAddress(),
      owner.address
    ) as RealEstateManager;
    await manager.waitForDeployment();
    console.log("RealEstateManager deployed to:", await manager.getAddress());
  });

  it("should register and mint a property", async function () {
    // Register owner as KYC-verified
    await propertyRegistry.connect(owner).registerUser(owner.address, true, true);
    console.log("Owner KYC-verified:", await propertyRegistry.isKYCVerified(owner.address));
    await propertyRegistry.connect(owner).registerUser(user.address, true, true);
    console.log("User KYC-verified:", await propertyRegistry.isKYCVerified(user.address));

    const pricePerMonth = ethers.parseEther("0.5");
    const propertyDataHash = "0x1234";
    await manager.connect(owner).registerAndMintProperty(user.address, pricePerMonth, propertyDataHash);
    const property = await propertyRegistry.properties(1);
    expect(property.ownerAddress).to.equal(user.address);
    expect(property.pricePerMonth).to.equal(pricePerMonth);
    expect(await propertyNFT.ownerOf(1)).to.equal(user.address);
    expect(await propertyNFT.tokenURI(1)).to.equal(propertyDataHash);
    expect(await propertyRegistry.getPropertyOwner(1)).to.equal(user.address);
    expect(await propertyRegistry.getPropertyAvailability(1)).to.be.true;
    expect(await propertyRegistry.getPropertyDataHash(1)).to.equal(propertyDataHash);
  });

  it("should create and sign a rental agreement", async function () {
    // Register owner and user as KYC-verified
    await propertyRegistry.connect(owner).registerUser(owner.address, true, true);
    console.log("Owner KYC-verified:", await propertyRegistry.isKYCVerified(owner.address));
    await propertyRegistry.connect(owner).registerUser(user.address, false, true);
    console.log("User KYC-verified:", await propertyRegistry.isKYCVerified(user.address));

    const pricePerMonth = ethers.parseEther("0.5");
    const deposit = ethers.parseEther("1");
    await manager.connect(owner).registerAndMintProperty(owner.address, pricePerMonth, "0x1234");
    const rentalDataHash = "0x5678";
    await manager.connect(owner).createRentalAgreement(1, user.address, pricePerMonth, deposit, rentalDataHash);
    const rentalAddress = await rentalSystem.rentalContracts(1);
    const rental = await ethers.getContractAt("RentalAgreement", rentalAddress);
    expect(await rental.tenantAddress()).to.equal(user.address);
    expect(await rental.rentAmount()).to.equal(pricePerMonth);

    await rental.connect(user).signRental({ value: deposit });
    expect(await rental.isActive()).to.be.true;
    expect(await escrowPayment.escrowBalances(1)).to.equal(deposit);
    expect(await propertyRegistry.getPropertyAvailability(1)).to.be.false;
    const property = await propertyRegistry.properties(1);
    expect(property.status).to.equal(1); // PropertyStatus.Rented
  });

  it("should pay rent and complete rental", async function () {
    // Register owner and user as KYC-verified
    await propertyRegistry.connect(owner).registerUser(owner.address, true, true);
    console.log("Owner KYC-verified:", await propertyRegistry.isKYCVerified(owner.address));
    await propertyRegistry.connect(owner).registerUser(user.address, false, true);
    console.log("User KYC-verified:", await propertyRegistry.isKYCVerified(user.address));

    const pricePerMonth = ethers.parseEther("0.5");
    const deposit = ethers.parseEther("1");
    await manager.connect(owner).registerAndMintProperty(owner.address, pricePerMonth, "0x1234");
    const rentalDataHash = "0x5678";
    await manager.connect(owner).createRentalAgreement(1, user.address, pricePerMonth, deposit, rentalDataHash);
    const rentalAddress = await rentalSystem.rentalContracts(1);
    const rental = await ethers.getContractAt("RentalAgreement", rentalAddress);

    await rental.connect(user).signRental({ value: deposit });
    await rental.connect(user).payRent({ value: pricePerMonth });

    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    await manager.connect(owner).completeRentalAndRelease(1, 0, deposit);
    expect(await rental.isActive()).to.be.false;
    expect(await escrowPayment.escrowBalances(1)).to.equal(0);
    expect(await propertyRegistry.getPropertyAvailability(1)).to.be.true;
    const property = await propertyRegistry.properties(1);
    expect(property.status).to.equal(0); // PropertyStatus.Available
  });
});