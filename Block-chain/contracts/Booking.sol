// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyRegistry.sol";
import "./Escrow.sol";

contract Booking is ReentrancyGuard {
    PropertyRegistry public immutable PROPERTY_REGISTRY;
    Escrow public immutable ESCROW;
    uint256 public nextBookingId = 1;
    
    enum BookingStatus { 
        PENDING_PAYMENT, PAYMENT_PROCESSING, 
        CONFIRMED, CANCELLED, ACTIVE, COMPLETED, DISPUTED 
    }
    
    struct BookingInfo {
        uint256 bookingId;
        uint256 propertyId;
        address ownerWalletAddress;
        address tenantWalletAddress;
        uint256 startDate;
        uint256 endDate;
        uint128 totalAmount;
        uint128 securityDeposit;
        BookingStatus status;
        bytes32 bookingDataHash;
    }
    
    mapping(uint256 => BookingInfo) public bookings;
    
    event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId);
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCompleted(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId);
    
    constructor(address _registry, address _escrow) {
        PROPERTY_REGISTRY = PropertyRegistry(_registry);
        ESCROW = Escrow(_escrow);
    }
    
    function createBooking(
        uint256 propertyId,
        uint256 startDate,
        uint256 endDate,
        bytes32 bookingDataHash
    ) external returns (uint256 bookingId) {
        PropertyRegistry.Property memory prop = PROPERTY_REGISTRY.getProperty(propertyId);
        require(prop.status == PropertyRegistry.PropertyStatus.AVAILABLE, "not available");
        
        uint256 nights = (endDate - startDate) / 1 days;
        require(nights >= 1, "invalid dates");
        
        uint256 totalAmount = uint256(prop.pricePerNight) * nights;
        
        bookingId = nextBookingId++;
        
        bookings[bookingId] = BookingInfo({
            bookingId: bookingId,
            propertyId: propertyId,
            ownerWalletAddress: prop.ownerWalletAddress,
            tenantWalletAddress: msg.sender,
            startDate: startDate,
            endDate: endDate,
            totalAmount: uint128(totalAmount),
            securityDeposit: prop.securityDeposit,
            status: BookingStatus.PENDING_PAYMENT,
            bookingDataHash: bookingDataHash
        });
        
        PROPERTY_REGISTRY.setPropertyStatus(propertyId, PropertyRegistry.PropertyStatus.LOCKED);
        emit BookingCreated(bookingId, propertyId);
        return bookingId;
    }
    
    function confirmBooking(uint256 bookingId) external payable nonReentrant {
        BookingInfo storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.PENDING_PAYMENT, "invalid status");
        require(msg.sender == booking.tenantWalletAddress, "not tenant");
        
        uint256 totalPayment = booking.totalAmount + booking.securityDeposit;
        require(msg.value == totalPayment, "wrong amount");
        
        booking.status = BookingStatus.CONFIRMED;
        ESCROW.deposit{value: msg.value}(bookingId, booking.ownerWalletAddress);
        
        PROPERTY_REGISTRY.setPropertyStatus(booking.propertyId, PropertyRegistry.PropertyStatus.BOOKED);
        emit BookingConfirmed(bookingId);
    }
    
function completeBooking(uint256 bookingId) external {
    BookingInfo storage booking = bookings[bookingId];
    require(booking.status == BookingStatus.CONFIRMED, "not confirmed");
    require(block.timestamp >= booking.endDate, "not finished");
    
    booking.status = BookingStatus.COMPLETED;
    PROPERTY_REGISTRY.setPropertyStatus(booking.propertyId, PropertyRegistry.PropertyStatus.AVAILABLE);
    
    // 1. LOYER → OWNER
    ESCROW.releaseFunds(bookingId, payable(booking.ownerWalletAddress), booking.totalAmount);
    
    // 2. CAUTION → TENANT (pas de dommages)
    ESCROW.releaseFunds(bookingId, payable(booking.tenantWalletAddress), booking.securityDeposit);
    
    emit BookingCompleted(bookingId);
}

    
    function cancelBooking(uint256 bookingId) external nonReentrant {
        BookingInfo storage booking = bookings[bookingId];
        require(booking.status == BookingStatus.CONFIRMED, "cannot cancel");
        require(msg.sender == booking.ownerWalletAddress || msg.sender == booking.tenantWalletAddress);
        
        uint256 refundAmount = booking.totalAmount + booking.securityDeposit;
        booking.status = BookingStatus.CANCELLED;
        
        PROPERTY_REGISTRY.setPropertyStatus(booking.propertyId, PropertyRegistry.PropertyStatus.AVAILABLE);
        ESCROW.releaseFunds(bookingId, payable(booking.tenantWalletAddress), refundAmount);
        
        emit BookingCancelled(bookingId);
    }
    
    function getBooking(uint256 bookingId) external view returns (BookingInfo memory) {
        return bookings[bookingId];
    }
}
