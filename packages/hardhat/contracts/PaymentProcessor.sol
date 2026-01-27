// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MerchantRegistry.sol";

/**
 * @title PaymentProcessor
 * @dev Handles IDRX payments and invoice generation for ChainPay ID
 */
contract PaymentProcessor is ReentrancyGuard, Ownable {
    // State variables
    IERC20 public idrxToken;
    MerchantRegistry public merchantRegistry;

    uint256 public feePercentage = 50; // 0.5% in basis points (50/10000)
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    address public feeCollector;

    uint256 public transactionCount;
    uint256 public totalVolume;

    // Invoice structure
    struct Invoice {
        address merchant;
        uint256 amount;
        string description;
        uint256 createdAt;
        uint256 expiresAt; // 0 = no expiry
        bool isPaid;
        address paidBy;
        uint256 paidAt;
    }

    // Mappings
    mapping(bytes32 => Invoice) public invoices;
    mapping(address => bytes32[]) public merchantInvoices; // merchant => invoice IDs

    // Events
    event PaymentProcessed(
        address indexed from,
        address indexed merchant,
        uint256 amount,
        uint256 fee,
        uint256 netAmount,
        uint256 timestamp,
        bytes32 indexed paymentId
    );

    event InvoiceCreated(
        bytes32 indexed invoiceId,
        address indexed merchant,
        uint256 amount,
        string description,
        uint256 expiresAt
    );

    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 timestamp
    );

    event InvoiceCancelled(bytes32 indexed invoiceId, address indexed merchant, uint256 timestamp);

    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);

    // Constructor
    constructor(address _idrxToken, address _merchantRegistry, address _feeCollector) Ownable(msg.sender) {
        require(_idrxToken != address(0), "Invalid IDRX address");
        require(_merchantRegistry != address(0), "Invalid registry address");
        require(_feeCollector != address(0), "Invalid fee collector");

        idrxToken = IERC20(_idrxToken);
        merchantRegistry = MerchantRegistry(_merchantRegistry);
        feeCollector = _feeCollector;
    }

    /**
     * @dev Process a direct payment from customer to merchant
     * @param _merchant Merchant wallet address
     * @param _amount Amount in IDRX (smallest unit)
     */
    function processPayment(address _merchant, uint256 _amount) external nonReentrant returns (bytes32) {
        require(merchantRegistry.isActiveMerchant(_merchant), "Merchant not active");
        require(_amount > 0, "Amount must be > 0");
        require(msg.sender != _merchant, "Cannot pay yourself");

        // Calculate fees
        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 merchantAmount = _amount - fee;

        // Generate unique payment ID
        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, _merchant, _amount, block.timestamp, transactionCount)
        );

        // Transfer from customer to merchant
        require(idrxToken.transferFrom(msg.sender, _merchant, merchantAmount), "Transfer to merchant failed");

        // Transfer fee to collector
        if (fee > 0) {
            require(idrxToken.transferFrom(msg.sender, feeCollector, fee), "Fee transfer failed");
        }

        // Update stats
        transactionCount++;
        totalVolume += _amount;
        merchantRegistry.updateStats(_merchant, _amount);

        emit PaymentProcessed(msg.sender, _merchant, _amount, fee, merchantAmount, block.timestamp, paymentId);

        return paymentId;
    }

    /**
     * @dev Create an invoice
     * @param _amount Amount in IDRX
     * @param _description Invoice description
     * @param _expiryMinutes Minutes until expiry (0 = no expiry)
     */
    function createInvoice(
        uint256 _amount,
        string memory _description,
        uint256 _expiryMinutes
    ) external returns (bytes32) {
        require(merchantRegistry.isActiveMerchant(msg.sender), "Merchant not active");
        require(_amount > 0, "Amount must be > 0");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_description).length <= 200, "Description too long");

        // Generate unique invoice ID
        bytes32 invoiceId = keccak256(
            abi.encodePacked(msg.sender, _amount, _description, block.timestamp, merchantInvoices[msg.sender].length)
        );

        uint256 expiresAt = _expiryMinutes > 0 ? block.timestamp + (_expiryMinutes * 1 minutes) : 0;

        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            amount: _amount,
            description: _description,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            isPaid: false,
            paidBy: address(0),
            paidAt: 0
        });

        merchantInvoices[msg.sender].push(invoiceId);

        emit InvoiceCreated(invoiceId, msg.sender, _amount, _description, expiresAt);

        return invoiceId;
    }

    /**
     * @dev Pay an invoice
     * @param _invoiceId Invoice ID to pay
     */
    function payInvoice(bytes32 _invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[_invoiceId];

        require(invoice.merchant != address(0), "Invoice not found");
        require(!invoice.isPaid, "Invoice already paid");
        require(invoice.expiresAt == 0 || block.timestamp <= invoice.expiresAt, "Invoice expired");
        require(msg.sender != invoice.merchant, "Cannot pay own invoice");

        // Mark as paid
        invoice.isPaid = true;
        invoice.paidBy = msg.sender;
        invoice.paidAt = block.timestamp;

        // Calculate fees
        uint256 fee = (invoice.amount * feePercentage) / 10000;
        uint256 merchantAmount = invoice.amount - fee;

        // Transfer tokens
        require(idrxToken.transferFrom(msg.sender, invoice.merchant, merchantAmount), "Transfer to merchant failed");

        if (fee > 0) {
            require(idrxToken.transferFrom(msg.sender, feeCollector, fee), "Fee transfer failed");
        }

        // Update stats
        transactionCount++;
        totalVolume += invoice.amount;
        merchantRegistry.updateStats(invoice.merchant, invoice.amount);

        emit InvoicePaid(_invoiceId, msg.sender, invoice.merchant, invoice.amount, block.timestamp);

        emit PaymentProcessed(
            msg.sender,
            invoice.merchant,
            invoice.amount,
            fee,
            merchantAmount,
            block.timestamp,
            _invoiceId
        );
    }

    /**
     * @dev Cancel an unpaid invoice (only merchant can cancel)
     */
    function cancelInvoice(bytes32 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];

        require(invoice.merchant == msg.sender, "Not invoice owner");
        require(!invoice.isPaid, "Cannot cancel paid invoice");

        // Mark as paid to prevent future payments (simpler than deletion)
        invoice.isPaid = true;
        invoice.paidBy = address(0);
        invoice.paidAt = block.timestamp;

        emit InvoiceCancelled(_invoiceId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get invoice details
     */
    function getInvoice(bytes32 _invoiceId) external view returns (Invoice memory) {
        require(invoices[_invoiceId].merchant != address(0), "Invoice not found");
        return invoices[_invoiceId];
    }

    /**
     * @dev Get all invoices for a merchant
     */
    function getMerchantInvoices(address _merchant) external view returns (bytes32[] memory) {
        return merchantInvoices[_merchant];
    }

    /**
     * @dev Update fee percentage (only owner)
     */
    function updateFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = feePercentage;
        feePercentage = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    /**
     * @dev Update fee collector address (only owner)
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    /**
     * @dev Get platform statistics
     */
    function getStats()
        external
        view
        returns (uint256 _transactionCount, uint256 _totalVolume, uint256 _feePercentage)
    {
        return (transactionCount, totalVolume, feePercentage);
    }
}
