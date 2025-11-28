// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WebMessageTransfer
 * @dev Smart contract for Web3 messaging with token and NFT transfers
 */
contract WebMessageTransfer is ReentrancyGuard {
    // Transfer types
    enum TransferType {
        TOKEN,
        NFT,
        ETHER
    }

    // Message with transfer structure
    struct MessageWithTransfer {
        uint256 id;
        address sender;
        address recipient;
        string contentHash;
        uint256 timestamp;
        bool isRead;
        TransferType transferType;
        address tokenAddress;
        uint256 tokenAmount; // For ERC20 tokens
        uint256 nftTokenId; // For ERC721 NFTs
        bool transferCompleted;
    }

    // State variables
    mapping(uint256 => MessageWithTransfer) public messagesWithTransfer;
    mapping(address => uint256[]) public userMessages;
    uint256 public messageCount;
    address public owner;

    // Events
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        address indexed recipient,
        string contentHash,
        uint256 timestamp
    );

    event TokenTransferInMessage(
        uint256 indexed messageId,
        address indexed from,
        address indexed to,
        address tokenAddress,
        uint256 amount
    );

    event NFTTransferInMessage(
        uint256 indexed messageId,
        address indexed from,
        address indexed to,
        address nftAddress,
        uint256 tokenId
    );

    event EtherTransferInMessage(
        uint256 indexed messageId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event MessageRead(uint256 indexed messageId, address indexed reader);
    event MessageDeleted(uint256 indexed messageId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMessageParty(uint256 _messageId) {
        require(
            msg.sender == messagesWithTransfer[_messageId].sender ||
                msg.sender == messagesWithTransfer[_messageId].recipient,
            "Only message parties can access this message"
        );
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        messageCount = 0;
    }

    /**
     * @dev Send a message with ERC20 token transfer
     */
    function sendMessageWithToken(
        address _recipient,
        string memory _contentHash,
        address _tokenAddress,
        uint256 _tokenAmount
    ) public nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_tokenAmount > 0, "Token amount must be greater than 0");

        // Transfer tokens from sender to contract
        IERC20 token = IERC20(_tokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), _tokenAmount),
            "Token transfer failed"
        );

        // Create message
        messageCount++;
        MessageWithTransfer memory newMessage = MessageWithTransfer({
            id: messageCount,
            sender: msg.sender,
            recipient: _recipient,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRead: false,
            transferType: TransferType.TOKEN,
            tokenAddress: _tokenAddress,
            tokenAmount: _tokenAmount,
            nftTokenId: 0,
            transferCompleted: false
        });

        messagesWithTransfer[messageCount] = newMessage;
        userMessages[msg.sender].push(messageCount);
        userMessages[_recipient].push(messageCount);

        emit TokenTransferInMessage(
            messageCount,
            msg.sender,
            _recipient,
            _tokenAddress,
            _tokenAmount
        );

        return messageCount;
    }

    /**
     * @dev Send a message with NFT transfer
     */
    function sendMessageWithNFT(
        address _recipient,
        string memory _contentHash,
        address _nftAddress,
        uint256 _tokenId
    ) public nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_nftAddress != address(0), "Invalid NFT address");

        // Transfer NFT from sender to contract
        IERC721 nft = IERC721(_nftAddress);
        nft.transferFrom(msg.sender, address(this), _tokenId);

        // Create message
        messageCount++;
        MessageWithTransfer memory newMessage = MessageWithTransfer({
            id: messageCount,
            sender: msg.sender,
            recipient: _recipient,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRead: false,
            transferType: TransferType.NFT,
            tokenAddress: _nftAddress,
            tokenAmount: 0,
            nftTokenId: _tokenId,
            transferCompleted: false
        });

        messagesWithTransfer[messageCount] = newMessage;
        userMessages[msg.sender].push(messageCount);
        userMessages[_recipient].push(messageCount);

        emit NFTTransferInMessage(messageCount, msg.sender, _recipient, _nftAddress, _tokenId);

        return messageCount;
    }

    /**
     * @dev Send a message with Ether transfer
     */
    function sendMessageWithEther(
        address _recipient,
        string memory _contentHash
    ) public payable nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Ether amount must be greater than 0");

        // Create message
        messageCount++;
        MessageWithTransfer memory newMessage = MessageWithTransfer({
            id: messageCount,
            sender: msg.sender,
            recipient: _recipient,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRead: false,
            transferType: TransferType.ETHER,
            tokenAddress: address(0),
            tokenAmount: msg.value,
            nftTokenId: 0,
            transferCompleted: false
        });

        messagesWithTransfer[messageCount] = newMessage;
        userMessages[msg.sender].push(messageCount);
        userMessages[_recipient].push(messageCount);

        emit EtherTransferInMessage(messageCount, msg.sender, _recipient, msg.value);

        return messageCount;
    }

    /**
     * @dev Claim tokens/NFTs/Ether from a message
     */
    function claimTransfer(uint256 _messageId) public nonReentrant {
        MessageWithTransfer storage message = messagesWithTransfer[_messageId];
        require(message.recipient == msg.sender, "Only recipient can claim");
        require(!message.transferCompleted, "Transfer already claimed");
        require(message.transferType != TransferType.ETHER || address(this).balance >= message.tokenAmount, "Insufficient contract balance");

        message.transferCompleted = true;

        if (message.transferType == TransferType.TOKEN) {
            IERC20 token = IERC20(message.tokenAddress);
            require(
                token.transfer(msg.sender, message.tokenAmount),
                "Token transfer failed"
            );
        } else if (message.transferType == TransferType.NFT) {
            IERC721 nft = IERC721(message.tokenAddress);
            nft.transferFrom(address(this), msg.sender, message.nftTokenId);
        } else if (message.transferType == TransferType.ETHER) {
            (bool success, ) = msg.sender.call{value: message.tokenAmount}("");
            require(success, "Ether transfer failed");
        }
    }

    /**
     * @dev Mark message as read
     */
    function markAsRead(uint256 _messageId)
        public
        onlyMessageParty(_messageId)
    {
        messagesWithTransfer[_messageId].isRead = true;
        emit MessageRead(_messageId, msg.sender);
    }

    /**
     * @dev Get message details
     */
    function getMessage(uint256 _messageId)
        public
        view
        returns (MessageWithTransfer memory)
    {
        return messagesWithTransfer[_messageId];
    }

    /**
     * @dev Get user's messages
     */
    function getUserMessages(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return userMessages[_user];
    }
}
