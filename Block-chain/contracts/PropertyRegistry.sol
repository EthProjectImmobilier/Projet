// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PropertyRegistry is ReentrancyGuard {
    enum PropertyStatus { AVAILABLE, LOCKED, BOOKED }
    
    struct Property {
        address ownerWalletAddress;
        uint128 pricePerNight;
        uint128 securityDeposit;
        PropertyStatus status;
        bytes32 propertyDataHash;
        uint256 timestampCreated;
    }
    
    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId = 1;
    
    modifier onlyPropertyOwner(uint256 propertyId) {
        require(properties[propertyId].ownerWalletAddress == msg.sender, "not owner");
        _;
    }
    
    event PropertyAdded(uint256 indexed propertyId, address indexed owner);
    event PropertyStatusChanged(uint256 indexed propertyId, PropertyStatus status);
    
    function addProperty(
        uint128 pricePerNight,
        uint128 securityDeposit,
        bytes32 propertyDataHash
    ) external returns (uint256) {
        require(pricePerNight > 0, "invalid price");
        
        uint256 propertyId = nextPropertyId++;
        properties[propertyId] = Property({
            ownerWalletAddress: msg.sender,
            pricePerNight: pricePerNight,
            securityDeposit: securityDeposit,
            status: PropertyStatus.AVAILABLE,
            propertyDataHash: propertyDataHash,
            timestampCreated: block.timestamp
        });
        
        emit PropertyAdded(propertyId, msg.sender);
        return propertyId;
    }
    
    function setPropertyStatus(uint256 propertyId, PropertyStatus status) 
        external onlyPropertyOwner(propertyId) 
    {
        properties[propertyId].status = status;
        emit PropertyStatusChanged(propertyId, status);
    }
    
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }
}
