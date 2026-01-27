import { expect } from "chai";
import { ethers } from "hardhat";
import { MerchantRegistry, PaymentProcessor, MockIDRX } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Log } from "ethers";

describe("ChainPay ID", function () {
  let merchantRegistry: MerchantRegistry;
  let paymentProcessor: PaymentProcessor;
  let mockIDRX: MockIDRX;

  let merchant: SignerWithAddress;
  let customer: SignerWithAddress;
  let feeCollector: SignerWithAddress;

  const INITIAL_BALANCE = ethers.parseUnits("10000", 6); // 10,000 IDRX

  beforeEach(async function () {
    [, merchant, customer, feeCollector] = await ethers.getSigners();

    // Deploy MockIDRX
    const MockIDRXFactory = await ethers.getContractFactory("MockIDRX");
    mockIDRX = await MockIDRXFactory.deploy();
    await mockIDRX.waitForDeployment();

    // Deploy MerchantRegistry
    const MerchantRegistryFactory = await ethers.getContractFactory("MerchantRegistry");
    merchantRegistry = await MerchantRegistryFactory.deploy();
    await merchantRegistry.waitForDeployment();

    // Deploy PaymentProcessor
    const PaymentProcessorFactory = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessorFactory.deploy(
      await mockIDRX.getAddress(),
      await merchantRegistry.getAddress(),
      feeCollector.address,
    );
    await paymentProcessor.waitForDeployment();

    // Fund customer
    await mockIDRX.mint(customer.address, INITIAL_BALANCE);

    // Approve processor
    await mockIDRX.connect(customer).approve(await paymentProcessor.getAddress(), ethers.MaxUint256);
  });

  describe("MerchantRegistry", function () {
    it("registers a merchant", async function () {
      await merchantRegistry
        .connect(merchant)
        .register("Warung Makan Sederhana", "Food & Beverage", "ipfs://QmHash123");

      expect(await merchantRegistry.isRegistered(merchant.address)).to.equal(true);

      const merchantData = await merchantRegistry.getMerchant(merchant.address);

      expect(merchantData.businessName).to.equal("Warung Makan Sederhana");
      expect(merchantData.isActive).to.equal(true);
    });

    it("prevents duplicate registration", async function () {
      await merchantRegistry.connect(merchant).register("Business 1", "Category", "");

      await expect(merchantRegistry.connect(merchant).register("Business 2", "Category", "")).to.be.revertedWith(
        "Already registered",
      );
    });

    it("updates merchant profile", async function () {
      await merchantRegistry.connect(merchant).register("Old Name", "Category", "");

      await merchantRegistry.connect(merchant).updateProfile("New Name", "New Category", "ipfs://newHash");

      const merchantData = await merchantRegistry.getMerchant(merchant.address);
      expect(merchantData.businessName).to.equal("New Name");
    });
  });

  describe("PaymentProcessor", function () {
    beforeEach(async function () {
      await merchantRegistry.connect(merchant).register("Test Merchant", "Retail", "");
    });

    it("processes a direct payment", async function () {
      const paymentAmount = ethers.parseUnits("100", 6);

      const before = await mockIDRX.balanceOf(merchant.address);

      await paymentProcessor.connect(customer).processPayment(merchant.address, paymentAmount);

      const after = await mockIDRX.balanceOf(merchant.address);

      const expected = ethers.parseUnits("99.5", 6);
      expect(after - before).to.equal(expected);
    });

    it("creates an invoice", async function () {
      const tx = await paymentProcessor
        .connect(merchant)
        .createInvoice(ethers.parseUnits("50", 6), "Nasi Goreng + Es Teh", 30);

      const receipt = await tx.wait();

      const event = receipt!.logs.find((log: Log) => {
        try {
          return paymentProcessor.interface.parseLog(log)?.name === "InvoiceCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.equal(undefined);
    });

    it("pays an invoice", async function () {
      const createTx = await paymentProcessor
        .connect(merchant)
        .createInvoice(ethers.parseUnits("75", 6), "Test Invoice", 30);

      const receipt = await createTx.wait();

      const event = receipt!.logs.find((log: Log) => {
        try {
          return paymentProcessor.interface.parseLog(log)?.name === "InvoiceCreated";
        } catch {
          return false;
        }
      });

      const parsed = paymentProcessor.interface.parseLog(event!);
      if (!parsed) {
        throw new Error("InvoiceCreated event not found");
      }
      const invoiceId = parsed.args[0];

      const before = await mockIDRX.balanceOf(merchant.address);

      await paymentProcessor.connect(customer).payInvoice(invoiceId);

      const after = await mockIDRX.balanceOf(merchant.address);

      const expected = ethers.parseUnits("74.625", 6);
      expect(after - before).to.equal(expected);

      const invoice = await paymentProcessor.getInvoice(invoiceId);
      expect(invoice.isPaid).to.equal(true);
      expect(invoice.paidBy).to.equal(customer.address);
    });

    it("prevents double payment", async function () {
      const tx = await paymentProcessor.connect(merchant).createInvoice(ethers.parseUnits("50", 6), "Test", 30);

      const receipt = await tx.wait();

      const event = receipt!.logs.find((log: Log) => {
        try {
          return paymentProcessor.interface.parseLog(log)?.name === "InvoiceCreated";
        } catch {
          return false;
        }
      });

      const parsed = paymentProcessor.interface.parseLog(event!);
      if (!parsed) {
        throw new Error("InvoiceCreated event not found");
      }
      const invoiceId = parsed.args[0];

      await paymentProcessor.connect(customer).payInvoice(invoiceId);

      await expect(paymentProcessor.connect(customer).payInvoice(invoiceId)).to.be.revertedWith("Invoice already paid");
    });

    it("collects fees correctly", async function () {
      const amount = ethers.parseUnits("1000", 6);

      const before = await mockIDRX.balanceOf(feeCollector.address);

      await paymentProcessor.connect(customer).processPayment(merchant.address, amount);

      const after = await mockIDRX.balanceOf(feeCollector.address);

      const expectedFee = ethers.parseUnits("5", 6);
      expect(after - before).to.equal(expectedFee);
    });
  });
});
