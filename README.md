# GameTribe

## Features 🚀

### 1. **NFT-Powered Content**
- Videos uploaded by users are automatically minted as NFTs.
- NFTs can be auctioned in a decentralized betting pool, with the highest or smartest bidder winning the asset.
- Live story-like features enable dynamic viewing experiences for fans.

### 2. **AI-Generated Quizzes**
- Quizzes are generated based on real-time NBA TopShots matches, focusing on the players and teams participating in the current game.
- Fans can win NFTs and other rewards by participating in these interactive quizzes.

### 3. **Unified Token Economy**
- Transactions are powered by **$GTB (GameTribe Token)** on Push Chain Donut Testnet.
- Simplifies transactions across features and promotes ecosystem interoperability.

### 4. **Decentralized Betting Pool**
- Fair and transparent NFT auctions ensure trust among bidders.
- Smart contracts govern the auction process to ensure security.

### 5. **Social Connectivity**
- Invite friends using **On-chain wallet ping**.
- Real-time leaderboard displays top-performing players in live quizzes.
- View the average market value of NFTs on the platform.

## Deployed Contracts (Push Chain Donut Testnet - chainId 42101)

| Contract Name        | Description                                   | Address | Explorer |
|----------------------|-----------------------------------------------|---------|----------|
| `DunkVerse.sol`      | ERC-20 token contract for $GTB.               | `0xA2B74d35e1352f77cafCaB676f39424fD8e3D690` | https://donut.push.network/address/0xA2B74d35e1352f77cafCaB676f39424fD8e3D690 |
| `BettingPool.sol`    | Handles GameFi betting logic.                 | `0xA67264D67Ea9fa84c820004E32d45B93c9C0CE65` | https://donut.push.network/address/0xA67264D67Ea9fa84c820004E32d45B93c9C0CE65 |
| `AIGeneratedNFT.sol` | Manages NFT generation, supply, and transfers.| `0x5C6d74D06aE7695f63A75529D2E271f08d0a28E6` | https://donut.push.network/address/0x5C6d74D06aE7695f63A75529D2E271f08d0a28E6 |
| `InviteFriends.sol`  | Manages on-chain invitation and rewards.      | `0x214B59e60Dd6DaF6E648fE1A9C32b005f01BC9E4` | https://donut.push.network/address/0x214B59e60Dd6DaF6E648fE1A9C32b005f01BC9E4 |

## Key Technologies

- **Blockchain**: Push Chain Donut Testnet (EVM L1)
- **AI**: DALL-E3 GPT OpenAI Models for real-time quiz generation
- **Oracles**: Third-party oracles API for live Top Shots NBA match data
- **Smart Contracts**: Solidity
- **Frontend**: React.js, TypeScript, TailwindCSS
- **Storage**: Pinata
- **Wallet Integration**: RainbowKit, Wagmi, Metamask APIs
- **Tokenomics**: ERC-20, ERC-721 standards for $GTB token and NFTs

## Tokenomics 📊

- **Symbol**: $GTB (GameTribe Token)
- **Supply**: 10 billion tokens
- **Utility**:
  - Place bids in NFT auctions.
  - Participate in quizzes.
  - Peer-to-peer transactions for social and gaming features.

## How It Works

1. **User Onboarding**:
   - Connect Wallet via MetaMask.
   - Receive $GTB tokens if you have a metamask-to-metamask invitation.

2. **Participation**:
   - Join AI-generated quizzes.
   - Bet on outcomes using $GTB.

3. **Rewards**:
   - Win AI-generated NFTs and leaderboard points.
   - Redeem rewards directly in the ecosystem.

4. **Social Engagement**:
   - Invite friends and earn rewards.
   - Compete on the leaderboard.

## Getting Started (Local)

1. Clone the repository:
   ```bash
   git clone https://github.com/KezzyNgotho/TheGameTribe.git
   cd TheGameTribe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3000`.

Environment variables (optional):
- `NEXT_PUBLIC_APP_NAME=GameTribe`

## **Future Enhancements**
- Expand betting logic and Universal App features on Push Chain.
- Onramp integrations for GTB via card providers.
- Partnerships and additional league coverage beyond NBA.
- Enhanced onboarding and mobile UX.

## Connect. Play. Win.

GameTribe on Push Chain blends sports fandom with on-chain innovation. Join and experience the future of multichain fan engagement!
