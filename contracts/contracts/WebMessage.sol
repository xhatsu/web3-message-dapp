// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WebMessage
 * @dev Smart contract for Web3 messaging dApp
 * Stores message metadata on-chain and emits events for off-chain storage
 */
contract WebMessage {
    // Message structure
    struct Message {
        uint256 id;
        address sender;
        address recipient;
        string contentHash;
        uint256 timestamp;
        bool isRead;
    }

    // State variables
    mapping(uint256 => Message) public messages;
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

    event MessageRead(uint256 indexed messageId, address indexed reader);
    event MessageDeleted(uint256 indexed messageId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMessageParty(uint256 _messageId) {
        require(
            msg.sender == messages[_messageId].sender ||
                msg.sender == messages[_messageId].recipient,
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
     * @dev Send a message
     * @param _recipient Address of the message recipient
     * @param _contentHash IPFS hash or content hash stored off-chain
     */
    function sendMessage(address _recipient, string memory _contentHash)
        public
        returns (uint256)
    {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.sender != _recipient, "Cannot send message to yourself");
        require(bytes(_contentHash).length > 0, "Content hash cannot be empty");

        messageCount++;
        uint256 messageId = messageCount;
        uint256 timestamp = block.timestamp;

        messages[messageId] = Message({
            id: messageId,
            sender: msg.sender,
            recipient: _recipient,
            contentHash: _contentHash,
            timestamp: timestamp,
            isRead: false
        });

        userMessages[msg.sender].push(messageId);
        userMessages[_recipient].push(messageId);

        emit MessageSent(
            messageId,
            msg.sender,
            _recipient,
            _contentHash,
            timestamp
        );

        return messageId;
    }

    /**
     * @dev Mark message as read
     * @param _messageId ID of the message to mark as read
     */
    function markAsRead(uint256 _messageId)
        public
        onlyMessageParty(_messageId)
    {
        require(
            messages[_messageId].id != 0,
            "Message does not exist"
        );
        messages[_messageId].isRead = true;
        emit MessageRead(_messageId, msg.sender);
    }

    /**
     * @dev Delete a message
     * @param _messageId ID of the message to delete
     */
    function deleteMessage(uint256 _messageId) public onlyMessageParty(_messageId) {
        require(messages[_messageId].id != 0, "Message does not exist");
        delete messages[_messageId];
        emit MessageDeleted(_messageId);
    }

    /**
     * @dev Get message details
     * @param _messageId ID of the message
     */
    function getMessage(uint256 _messageId)
        public
        view
        returns (Message memory)
    {
        require(messages[_messageId].id != 0, "Message does not exist");
        return messages[_messageId];
    }

    /**
     * @dev Get all messages for a user
     * @param _user Address of the user
     */
    function getUserMessages(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return userMessages[_user];
    }

    /**
     * @dev Get message count for a user
     * @param _user Address of the user
     */
    function getUserMessageCount(address _user) public view returns (uint256) {
        return userMessages[_user].length;
    }

    /**
     * @dev Get total message count on-chain
     */
    function getTotalMessageCount() public view returns (uint256) {
        return messageCount;
    }

    /**
     * @dev Emergency function to withdraw funds (if any)
     */
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
