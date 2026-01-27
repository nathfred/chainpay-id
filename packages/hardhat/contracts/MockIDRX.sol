// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockIDRX
 * @dev Mock IDRX token for testing purposes
 * In production, use the real IDRX contract on Base
 */
contract MockIDRX is ERC20, Ownable {
    uint8 private _decimals = 6; // IDRX uses 6 decimals

    constructor() ERC20("Mock IDRX", "mIDRX") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000000 * 10 ** 6); // 1 billion IDRX
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens to an address (for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function - anyone can get 10,000 test IDRX
     */
    function faucet() external {
        uint256 amount = 10000 * 10 ** 6; // 10,000 IDRX
        _mint(msg.sender, amount);
    }
}
