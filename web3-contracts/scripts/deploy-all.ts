import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  // Deploy ERC20 GameTribe (GTB)
  const Token = await ethers.getContractFactory('DunkVerse');
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('Token (GTB) deployed at:', tokenAddress);

  // Deploy AIGeneratedNFT
  const AINFT = await ethers.getContractFactory('AIGeneratedNFT');
  const ainft = await AINFT.deploy('ipfs://');
  await ainft.waitForDeployment();
  const ainftAddress = await ainft.getAddress();
  console.log('AIGeneratedNFT deployed at:', ainftAddress);

  // Deploy BettingPool (requires token + nft)
  const BettingPool = await ethers.getContractFactory('BettingPool');
  const pool = await BettingPool.deploy(tokenAddress, ainftAddress, deployer.address);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log('BettingPool deployed at:', poolAddress);

  // Deploy InviteFriends (requires token)
  const InviteFriends = await ethers.getContractFactory('InviteFriends');
  const invite = await InviteFriends.deploy(tokenAddress);
  await invite.waitForDeployment();
  const inviteAddress = await invite.getAddress();
  console.log('InviteFriends deployed at:', inviteAddress);

  console.log('\nAddresses:');
  console.log('TOKEN:', tokenAddress);
  console.log('AIGeneratedNFT:', ainftAddress);
  console.log('BettingPool:', poolAddress);
  console.log('InviteFriends:', inviteAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


