pragma solidity >=0.5.0;

interface ERC721 {
    function mint(address to, uint256 tokenId) external returns (bool);
}

interface ITitleEscrowCreator {
  function deployNewTitleEscrow(address tokenRegistry, address beneficiary, address holder) external returns (address);
}

contract Convenience {
    address add1;
    address add2;

    function mintAndTransfer(address beneficiary, address holder, address titleFactory, address tokenAddress, uint256 tokenId) public returns (bool) {
        ITitleEscrowCreator factory = ITitleEscrowCreator(titleFactory);
        address titleEscrowAddress = factory.deployNewTitleEscrow(tokenAddress, beneficiary, holder);
        ERC721 token = ERC721(tokenAddress);
        return token.mint(titleEscrowAddress, tokenId);
    }

    function setAdd1(address add) public {
        add1 = add;
        add2 = add;
    }
}