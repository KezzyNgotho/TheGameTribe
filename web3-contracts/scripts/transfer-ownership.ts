import { ethers } from 'hardhat';

// Transfers ownership of the deployed AIGeneratedNFT to the BettingPool
// Update addresses if needed
const NFT_ADDRESS = '0x1652FC1a8dAA76B5cb70D05bC96BD9bdDc6D50b0';
const POOL_ADDRESS = '0x66aDA2b13F8813FDd38c0A2e23F9a8e4BfCE5510';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Using signer:', deployer.address);

  const nft = await ethers.getContractAt('AIGeneratedNFT', NFT_ADDRESS, deployer);
  const currentOwner = await nft.owner();
  console.log('Current NFT owner:', currentOwner);
  if (currentOwner.toLowerCase() === POOL_ADDRESS.toLowerCase()) {
    console.log('Ownership already transferred.');
    return;
  }

  const tx = await nft.transferOwnership(POOL_ADDRESS);
  console.log('transferOwnership tx:', tx.hash);
  await tx.wait();
  console.log('Ownership transferred to pool:', POOL_ADDRESS);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


