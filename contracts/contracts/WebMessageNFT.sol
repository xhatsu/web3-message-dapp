// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WebMessageNFT
 * @dev ERC721 NFT contract for Web3 messaging dApp
 * Allows users to mint NFTs with metadata URIs
 */
contract WebMessageNFT is ERC721, Ownable {
    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // Mapping from token ID to minter (creator)
    mapping(uint256 => address) public tokenMinters;

    // NFT metadata structure
    struct NFTMetadata {
        uint256 tokenId;
        address creator;
        string name;
        string symbol;
        string uri;
        uint256 mintedAt;
    }

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string name,
        string symbol,
        string uri,
        uint256 timestamp
    );

    event NFTTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /**
     * @dev Constructor
     */
    constructor() ERC721("WebMessageNFT", "WMNFT") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Mint a new NFT
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _uri Metadata URI (IPFS hash or external URL)
     */
    function mintNFT(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) public returns (uint256) {
        require(bytes(_uri).length > 0, "Metadata URI cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = _uri;
        tokenMinters[tokenId] = msg.sender;

        emit NFTMinted(
            tokenId,
            msg.sender,
            _name,
            _symbol,
            _uri,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @dev Transfer NFT between users
     * @param _from Address of current owner
     * @param _to Address of recipient
     * @param _tokenId Token ID to transfer
     */
    function transferNFT(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        require(_from != address(0), "Invalid sender address");
        require(_to != address(0), "Invalid recipient address");
        require(_from != _to, "Cannot transfer to yourself");

        safeTransferFrom(_from, _to, _tokenId);

        emit NFTTransferred(_tokenId, _from, _to, block.timestamp);
    }

    /**
     * @dev Get token URI
     * @param _tokenId Token ID
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "Token does not exist");
        return _tokenURIs[_tokenId];
    }

    /**
     * @dev Check if token exists
     * @param _tokenId Token ID
     */
    function _exists(uint256 _tokenId) internal view returns (bool) {
        return _ownerOf(_tokenId) != address(0);
    }

    /**
     * @dev Get current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get NFT metadata
     * @param _tokenId Token ID
     */
    function getNFTMetadata(uint256 _tokenId)
        public
        view
        returns (NFTMetadata memory)
    {
        require(_exists(_tokenId), "Token does not exist");

        return
            NFTMetadata({
                tokenId: _tokenId,
                creator: tokenMinters[_tokenId],
                name: "WebMessageNFT",
                symbol: "WMNFT",
                uri: _tokenURIs[_tokenId],
                mintedAt: block.timestamp
            });
    }
}
