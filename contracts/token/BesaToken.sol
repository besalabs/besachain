// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Besa Token
 * @author BesaChain Team
 * @notice Governance token for the BesaChain ecosystem
 * @dev Implements ERC20 with voting, permits, burning, and pausability
 *
 * Features:
 * - ERC20Votes for governance voting power
 * - ERC20Permit for gasless approvals
 * - ERC20Burnable for deflationary mechanics
 * - ERC20Pausable for emergency stops
 * - AccessControl for role-based permissions
 * - Maximum supply cap of 1 billion tokens
 * 
 * Chain Configuration:
 * - L1 Mainnet (BesaChain L1): Chain ID 1444, 1B gas limit
 * - L2 Mainnet (BesaChain L2): Chain ID 1912, 100M gas limit
 * - L1 Testnet: Chain ID 14440
 * - L2 Testnet: Chain ID 19120
 */
contract BesaToken is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    ERC20Permit,
    ERC20Votes,
    AccessControl
{
    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Maximum supply: 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Role that can mint new tokens (up to MAX_SUPPLY)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role that can pause/unpause transfers
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice BesaChain L1 Mainnet Chain ID
    uint256 public constant L1_CHAIN_ID = 1444;

    /// @notice BesaChain L2 Mainnet Chain ID
    uint256 public constant L2_CHAIN_ID = 1912;

    /// @notice BesaChain L1 Testnet Chain ID
    uint256 public constant L1_TESTNET_CHAIN_ID = 14440;

    /// @notice BesaChain L2 Testnet Chain ID
    uint256 public constant L2_TESTNET_CHAIN_ID = 19120;


    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event TokensMinted(address indexed to, uint256 amount, string reason);
    event EmergencyPause(address indexed by, string reason);
    event EmergencyUnpause(address indexed by);
    event CrossChainTransfer(address indexed from, address indexed to, uint256 amount, uint256 targetChainId);

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Deploys the BESA token
     * @param admin Address that receives DEFAULT_ADMIN_ROLE
     * @param treasury Address to receive initial treasury allocation
     * @param ecosystemFund Address for ecosystem development fund
     * @param liquidityMining Address for MasterChef rewards (minted later)
     */
    constructor(
        address admin,
        address treasury,
        address ecosystemFund,
        address liquidityMining
    )
        ERC20("Besa Token", "BESA")
        ERC20Permit("Besa Token")
    {
        require(admin != address(0), "Invalid admin");
        require(treasury != address(0), "Invalid treasury");
        require(ecosystemFund != address(0), "Invalid ecosystem fund");
        require(liquidityMining != address(0), "Invalid liquidity mining");

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        // MasterChef will be the minter
        _grantRole(MINTER_ROLE, liquidityMining);

        // Initial distribution (excluding liquidity mining - minted by MasterChef)
        // Treasury: 15% = 150M
        _mint(treasury, 150_000_000 * 10**18);
        emit TokensMinted(treasury, 150_000_000 * 10**18, "Treasury allocation");

        // Ecosystem Fund: 30% = 300M
        _mint(ecosystemFund, 300_000_000 * 10**18);
        emit TokensMinted(ecosystemFund, 300_000_000 * 10**18, "Ecosystem fund");

        // Public Sale: 10% = 100M (to treasury for distribution)
        _mint(treasury, 100_000_000 * 10**18);
        emit TokensMinted(treasury, 100_000_000 * 10**18, "Public sale allocation");

        // Airdrop: 5% = 50M (to ecosystem fund for distribution)
        _mint(ecosystemFund, 50_000_000 * 10**18);
        emit TokensMinted(ecosystemFund, 50_000_000 * 10**18, "Airdrop allocation");

        // Team & Advisors: 15% = 150M (to treasury, will be vested)
        _mint(treasury, 150_000_000 * 10**18);
        emit TokensMinted(treasury, 150_000_000 * 10**18, "Team vesting allocation");

        // Remaining 25% = 250M reserved for liquidity mining (minted by MasterChef)
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MINTING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Mints new tokens (only for liquidity mining rewards)
     * @dev Only callable by MINTER_ROLE (MasterChef)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAUSE FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Pauses all token transfers
     * @dev Only callable by PAUSER_ROLE
     * @param reason Reason for pausing (for event logging)
     */
    function pause(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @notice Unpauses token transfers
     * @dev Only callable by PAUSER_ROLE
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CROSS-CHAIN COMPATIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Returns the current chain ID
     */
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }

    /**
     * @notice Checks if current chain is L1
     */
    function isL1() public view returns (bool) {
        return block.chainid == L1_CHAIN_ID;
    }

    /**
     * @notice Checks if current chain is L2
     */
    function isL2() public view returns (bool) {
        return block.chainid == L2_CHAIN_ID;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLOCK (FOR GOVERNANCE)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Returns the current timepoint for voting
     * @dev Uses block number for BesaChain (1 second blocks on L2)
     */
    function clock() public view override returns (uint48) {
        return uint48(block.number);
    }

    /**
     * @notice Returns the clock mode
     * @dev EIP-6372: mode=blocknumber
     */
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=blocknumber&from=default";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OVERRIDES (REQUIRED BY SOLIDITY)
    // ═══════════════════════════════════════════════════════════════════════

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
