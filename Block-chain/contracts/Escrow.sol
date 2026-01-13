// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Escrow is ReentrancyGuard {
    mapping(uint256 => uint256) public bookingBalances;
    mapping(uint256 => address) public bookingOwners;
    
    event DepositMade(uint256 indexed bookingId, uint256 amount);
    event FundsReleased(uint256 indexed bookingId, address indexed to, uint256 amount);
    
    function deposit(uint256 bookingId, address owner) external payable nonReentrant {
        require(msg.value > 0, "zero deposit");
        bookingBalances[bookingId] += msg.value;
        bookingOwners[bookingId] = owner;
        emit DepositMade(bookingId, msg.value);
    }
    
    function releaseFunds(uint256 bookingId, address payable to, uint256 amount) 
        external nonReentrant 
    {
        require(msg.sender == bookingOwners[bookingId], "not owner");
        require(bookingBalances[bookingId] >= amount, "insufficient");
        
        bookingBalances[bookingId] -= amount;
        Address.sendValue(to, amount);
        emit FundsReleased(bookingId, to, amount);
    }
}
