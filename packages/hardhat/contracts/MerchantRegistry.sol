// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerchantRegistry
 * @dev Manages merchant registration and profiles for ChainPay ID
 */
contract MerchantRegistry is Ownable {
    struct Merchant {
        address walletAddress;
        string businessName;
        string category;
        string logoURI; // IPFS hash or URL
        uint256 registeredAt;
        bool isActive;
        uint256 totalTransactions;
        uint256 totalVolume; // in IDRX (smallest unit)
    }

    // Mappings
    mapping(address => Merchant) public merchants;
    mapping(address => bool) public isRegistered;

    // Events
    event MerchantRegistered(address indexed merchantAddress, string businessName, uint256 timestamp);

    event MerchantUpdated(address indexed merchantAddress, string businessName);

    event MerchantDeactivated(address indexed merchantAddress, uint256 timestamp);

    event MerchantReactivated(address indexed merchantAddress, uint256 timestamp);

    // Constructor
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register as a new merchant
     * @param _businessName Name of the business
     * @param _category Business category (e.g., "Food & Beverage")
     * @param _logoURI IPFS hash or URL of business logo
     */
    function register(string memory _businessName, string memory _category, string memory _logoURI) external {
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(_businessName).length > 0, "Business name required");
        require(bytes(_businessName).length <= 100, "Name too long");

        merchants[msg.sender] = Merchant({
            walletAddress: msg.sender,
            businessName: _businessName,
            category: _category,
            logoURI: _logoURI,
            registeredAt: block.timestamp,
            isActive: true,
            totalTransactions: 0,
            totalVolume: 0
        });

        isRegistered[msg.sender] = true;

        emit MerchantRegistered(msg.sender, _businessName, block.timestamp);
    }

    /**
     * @dev Update merchant profile
     */
    function updateProfile(string memory _businessName, string memory _category, string memory _logoURI) external {
        require(isRegistered[msg.sender], "Not registered");
        require(bytes(_businessName).length > 0, "Business name required");
        require(bytes(_businessName).length <= 100, "Name too long");

        Merchant storage merchant = merchants[msg.sender];
        merchant.businessName = _businessName;
        merchant.category = _category;
        merchant.logoURI = _logoURI;

        emit MerchantUpdated(msg.sender, _businessName);
    }

    /**
     * @dev Get merchant details
     */
    function getMerchant(address _merchant) external view returns (Merchant memory) {
        require(isRegistered[_merchant], "Merchant not found");
        return merchants[_merchant];
    }

    /**
     * @dev Deactivate merchant account
     */
    function deactivate() external {
        require(isRegistered[msg.sender], "Not registered");
        require(merchants[msg.sender].isActive, "Already deactivated");

        merchants[msg.sender].isActive = false;
        emit MerchantDeactivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Reactivate merchant account
     */
    function reactivate() external {
        require(isRegistered[msg.sender], "Not registered");
        require(!merchants[msg.sender].isActive, "Already active");

        merchants[msg.sender].isActive = true;
        emit MerchantReactivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Update merchant stats (only callable by PaymentProcessor)
     * @param _merchant Merchant address
     * @param _amount Transaction amount
     */
    function updateStats(address _merchant, uint256 _amount) external {
        require(isRegistered[_merchant], "Merchant not found");
        // Note: In production, add access control (only PaymentProcessor can call)

        merchants[_merchant].totalTransactions += 1;
        merchants[_merchant].totalVolume += _amount;
    }

    /**
     * @dev Check if merchant is active and registered
     */
    function isActiveMerchant(address _merchant) external view returns (bool) {
        return isRegistered[_merchant] && merchants[_merchant].isActive;
    }
}
