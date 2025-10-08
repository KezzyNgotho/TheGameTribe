import { ethers } from 'hardhat';

// Transfers ownership of the deployed AIGeneratedNFT to the BettingPool
// Update addresses if needed
const NFT_ADDRESS = '0x84E18baEd80a10d90e948cbe5aA3B5611108745A';
const POOL_ADDRESS = '0x39f933D41A7249d03df58b5FEc9470fB7e1Fbaf3';

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


