const { expect } = require("chai");

describe("WebMessage", function () {
  let webMessage;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const WebMessage = await ethers.getContractFactory("WebMessage");
    webMessage = await WebMessage.deploy();
    await webMessage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await webMessage.getTotalMessageCount()).to.equal(0);
    });
  });

  describe("Send Message", function () {
    it("Should send a message", async function () {
      const contentHash = "QmXxxx..."; // Mock IPFS hash
      const tx = await webMessage
        .connect(addr1)
        .sendMessage(addr2.address, contentHash);

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
      expect(await webMessage.getTotalMessageCount()).to.equal(1);
    });

    it("Should emit MessageSent event", async function () {
      const contentHash = "QmXxxx...";
      await expect(
        webMessage.connect(addr1).sendMessage(addr2.address, contentHash)
      )
        .to.emit(webMessage, "MessageSent")
        .withArgs(1, addr1.address, addr2.address, contentHash, expect.any(Number));
    });

    it("Should not allow sending to self", async function () {
      const contentHash = "QmXxxx...";
      await expect(
        webMessage.connect(addr1).sendMessage(addr1.address, contentHash)
      ).to.be.revertedWith("Cannot send message to yourself");
    });

    it("Should not allow empty content hash", async function () {
      await expect(
        webMessage.connect(addr1).sendMessage(addr2.address, "")
      ).to.be.revertedWith("Content hash cannot be empty");
    });
  });

  describe("Mark as Read", function () {
    beforeEach(async function () {
      const contentHash = "QmXxxx...";
      await webMessage.connect(addr1).sendMessage(addr2.address, contentHash);
    });

    it("Should mark message as read", async function () {
      await webMessage.connect(addr2).markAsRead(1);
      const message = await webMessage.getMessage(1);
      expect(message.isRead).to.be.true;
    });

    it("Should emit MessageRead event", async function () {
      await expect(webMessage.connect(addr2).markAsRead(1))
        .to.emit(webMessage, "MessageRead")
        .withArgs(1, addr2.address);
    });
  });

  describe("Get Messages", function () {
    beforeEach(async function () {
      const contentHash1 = "QmXxxx1...";
      const contentHash2 = "QmXxxx2...";
      await webMessage.connect(addr1).sendMessage(addr2.address, contentHash1);
      await webMessage.connect(addr2).sendMessage(addr1.address, contentHash2);
    });

    it("Should retrieve message details", async function () {
      const message = await webMessage.getMessage(1);
      expect(message.sender).to.equal(addr1.address);
      expect(message.recipient).to.equal(addr2.address);
    });

    it("Should get user messages", async function () {
      const messages = await webMessage.getUserMessages(addr1.address);
      expect(messages.length).to.equal(2);
    });

    it("Should get user message count", async function () {
      const count = await webMessage.getUserMessageCount(addr1.address);
      expect(count).to.equal(2);
    });
  });

  describe("Delete Message", function () {
    beforeEach(async function () {
      const contentHash = "QmXxxx...";
      await webMessage.connect(addr1).sendMessage(addr2.address, contentHash);
    });

    it("Should delete a message", async function () {
      await webMessage.connect(addr1).deleteMessage(1);
      await expect(webMessage.getMessage(1)).to.be.revertedWith(
        "Message does not exist"
      );
    });

    it("Should emit MessageDeleted event", async function () {
      await expect(webMessage.connect(addr1).deleteMessage(1))
        .to.emit(webMessage, "MessageDeleted")
        .withArgs(1);
    });
  });
});
