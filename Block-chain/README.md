🏡 Real Estate Rental dApp
A fully decentralized Web3 platform for peer-to-peer property rentals
antiersolutions.comantiersolutions.comalwin.io



📘 Overview
This project is a fully decentralized application (dApp) for peer-to-peer real estate rentals on the Ethereum blockchain. Users (property owners and tenants) interact directly with smart contracts via their wallets (e.g., MetaMask), eliminating intermediaries, admins, or hot-wallets.
The platform leverages NFTs for property ownership, factory-pattern contracts for rentals, and direct on-chain escrow to ensure security, transparency, and trustless execution.
All on-chain actions (register property, mint NFT, create rental, sign & pay) are performed directly by users through the frontend.

🧱 Architecture Summary
researchgate.netmdpi.comresearchgate.net


The platform consists of 4 core smart contracts (no central orchestrator):
🔹 1. PropertyRegistry
Central registry for properties:

Monthly rental price
Status (Available / Rented / Unlisted)
Off-chain metadata hash (IPFS/S3 – photos, documents, etc.)

🔹 2. PropertyNFT (ERC-721)
Each registered property is tokenized as a unique NFT. Owners can mint their own NFT directly.
🔹 3. RentalSystem
Factory contract that allows property owners to create individual rental agreements. Tracks all active rentals and deploys a new RentalAgreement instance per rental.
🔹 4. EscrowPayment
Decentralized escrow:

Holds security deposits
Releases funds directly (full return to tenant by default, controlled by owner)

🔹 RentalAgreement (deployed dynamically)
One instance per rental (created by RentalSystem):

Tenant signs by paying deposit
Monthly rent paid directly to owner
Owner completes rental and releases deposit


🧩 Smart Contract Folder Structure
textcontracts/
│── PropertyRegistry.sol
│── PropertyNFT.sol
│── RentalSystem.sol
│── EscrowPayment.sol
│── RentalAgreement.sol   # Template used by RentalSystem (factory pattern)

🚀 Tech Stack
On-chain

Solidity ^0.8.28
Hardhat (deployment, testing, verification)
OpenZeppelin (ERC-721, ReentrancyGuard)
