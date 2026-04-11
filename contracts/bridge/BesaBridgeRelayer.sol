// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BesaBridgeRelayer
 * @author BesaChain Team
 * @notice M-of-N multi-signature validation for the BesaChain bridge (L1 <-> L2).
 *
 * @dev Manages a set of authorized relayer addresses and validates that
 *      a sufficient number (threshold) have signed a given message before
 *      allowing bridge operations between L1 (Chain 1444) and L2 (Chain 1912).
 *
 * Signature format:
 *   - Signatures are concatenated 65-byte ECDSA signatures (r, s, v)
 *   - Each signature must come from a unique authorized relayer
 *   - Signers must be sorted in ascending address order to prevent
 *     duplicate checking without extra storage
 *
 * Chain Configuration:
 *   - L1 Mainnet: Chain ID 1444 (1B gas limit)
 *   - L2 Mainnet: Chain ID 1912 (100M gas limit)
 *   - L1 Testnet: Chain ID 14440
 *   - L2 Testnet: Chain ID 19120
 */
contract BesaBridgeRelayer is Ownable {
    using ECDSA for bytes32;

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    /// @notice BesaChain L1 Mainnet Chain ID
    uint256 public constant L1_CHAIN_ID = 1444;

    /// @notice BesaChain L2 Mainnet Chain ID
    uint256 public constant L2_CHAIN_ID = 1912;

    /// @notice BesaChain L1 Testnet Chain ID
    uint256 public constant L1_TESTNET_CHAIN_ID = 14440;

    /// @notice BesaChain L2 Testnet Chain ID
    uint256 public constant L2_TESTNET_CHAIN_ID = 19120;

    // =========================================================================
    // EVENTS
    // =========================================================================

    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event CrossChainValidation(bytes32 indexed messageHash, uint256 sourceChainId, uint256 targetChainId);

    // =========================================================================
    // STATE
    // =========================================================================

    /// @notice Set of authorized relayer addresses
    mapping(address => bool) public isRelayer;

    /// @notice List of all relayer addresses (for enumeration)
    address[] public relayers;

    /// @notice Minimum number of valid signatures required (M in M-of-N)
    uint256 public threshold;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @param _relayers   Initial set of relayer addresses
     * @param _threshold  Initial M-of-N threshold (must be >= 1 and <= _relayers.length)
     */
    constructor(address[] memory _relayers, uint256 _threshold) {
        require(_relayers.length > 0, "BesaBridgeRelayer: empty relayer set");
        require(
            _threshold > 0 && _threshold <= _relayers.length,
            "BesaBridgeRelayer: invalid threshold"
        );

        for (uint256 i = 0; i < _relayers.length; i++) {
            address r = _relayers[i];
            require(r != address(0), "BesaBridgeRelayer: zero address");
            require(!isRelayer[r], "BesaBridgeRelayer: duplicate relayer");
            isRelayer[r] = true;
            relayers.push(r);
            emit RelayerAdded(r);
        }

        threshold = _threshold;
        emit ThresholdUpdated(0, _threshold);
    }

    // =========================================================================
    // SIGNATURE VALIDATION
    // =========================================================================

    /**
     * @notice Validate that `signatures` contains at least `threshold` valid
     *         signatures from distinct authorized relayers.
     *
     * @dev Called by BesaBridgeVault.unlock() or other bridge contracts.
     *      Reverts if validation fails.
     *
     *      IMPORTANT: Signatures MUST be sorted by signer address in ascending order
     *      to prevent duplicate signer detection. The function verifies this ordering
     *      and rejects any out-of-order signatures. This design avoids the need for
     *      additional storage to track seen signers.
     *
     * @param ethSignedHash The EIP-191 signed message hash to verify against
     * @param signatures    Concatenated 65-byte ECDSA signatures. Each signature is
     *                      exactly 65 bytes (r, s, v format). Signatures MUST be
     *                      sorted by recovered signer address in ascending order.
     * @param sourceChainId The source chain ID (L1=1444 or L2=1912)
     * @param targetChainId The target chain ID (L1=1444 or L2=1912)
     */
    function validateSignatures(
        bytes32 ethSignedHash,
        bytes calldata signatures,
        uint256 sourceChainId,
        uint256 targetChainId
    ) external view {
        // Validate chain IDs
        require(
            (sourceChainId == L1_CHAIN_ID && targetChainId == L2_CHAIN_ID) ||
            (sourceChainId == L2_CHAIN_ID && targetChainId == L1_CHAIN_ID),
            "BesaBridgeRelayer: invalid chain pair"
        );
        
        require(signatures.length >= threshold * 65, "BesaBridgeRelayer: insufficient signatures");
        require(signatures.length % 65 == 0, "BesaBridgeRelayer: invalid signature length");

        uint256 sigCount = signatures.length / 65;
        address lastSigner = address(0);

        uint256 validCount = 0;

        for (uint256 i = 0; i < sigCount; i++) {
            bytes calldata sig = signatures[i * 65:(i + 1) * 65];
            address signer = ethSignedHash.recover(sig);

            // Signers must be in ascending order to prevent duplicates
            require(signer > lastSigner, "BesaBridgeRelayer: duplicate or unordered signer");
            lastSigner = signer;

            if (isRelayer[signer]) {
                validCount++;
            }
        }

        require(validCount >= threshold, "BesaBridgeRelayer: not enough valid signatures");
    }

    /**
     * @notice Simple validation without chain IDs (backward compatible)
     */
    function validateSignatures(
        bytes32 ethSignedHash,
        bytes calldata signatures
    ) external view {
        require(signatures.length >= threshold * 65, "BesaBridgeRelayer: insufficient signatures");
        require(signatures.length % 65 == 0, "BesaBridgeRelayer: invalid signature length");

        uint256 sigCount = signatures.length / 65;
        address lastSigner = address(0);
        uint256 validCount = 0;

        for (uint256 i = 0; i < sigCount; i++) {
            bytes calldata sig = signatures[i * 65:(i + 1) * 65];
            address signer = ethSignedHash.recover(sig);
            require(signer > lastSigner, "BesaBridgeRelayer: duplicate or unordered signer");
            lastSigner = signer;
            if (isRelayer[signer]) {
                validCount++;
            }
        }

        require(validCount >= threshold, "BesaBridgeRelayer: not enough valid signatures");
    }

    // =========================================================================
    // ADMIN
    // =========================================================================

    /// @notice Add a new relayer to the authorized set
    function addRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "BesaBridgeRelayer: zero address");
        require(!isRelayer[_relayer], "BesaBridgeRelayer: already a relayer");

        isRelayer[_relayer] = true;
        relayers.push(_relayer);

        emit RelayerAdded(_relayer);
    }

    /// @notice Remove a relayer from the authorized set
    function removeRelayer(address _relayer) external onlyOwner {
        require(isRelayer[_relayer], "BesaBridgeRelayer: not a relayer");

        isRelayer[_relayer] = false;

        // Remove from array (swap with last element)
        for (uint256 i = 0; i < relayers.length; i++) {
            if (relayers[i] == _relayer) {
                relayers[i] = relayers[relayers.length - 1];
                relayers.pop();
                break;
            }
        }

        // Ensure threshold is still valid
        require(
            relayers.length >= threshold,
            "BesaBridgeRelayer: would break threshold"
        );

        emit RelayerRemoved(_relayer);
    }

    /// @notice Update the signature threshold
    function setThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0, "BesaBridgeRelayer: zero threshold");
        require(
            _threshold <= relayers.length,
            "BesaBridgeRelayer: threshold exceeds relayer count"
        );

        uint256 old = threshold;
        threshold = _threshold;

        emit ThresholdUpdated(old, _threshold);
    }

    // =========================================================================
    // VIEW
    // =========================================================================

    /// @notice Get the total number of authorized relayers
    function getRelayerCount() external view returns (uint256) {
        return relayers.length;
    }

    /// @notice Get all authorized relayer addresses
    function getRelayers() external view returns (address[] memory) {
        return relayers;
    }

    /// @notice Returns the current chain ID
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }

    /// @notice Checks if current chain is L1
    function isL1() public view returns (bool) {
        return block.chainid == L1_CHAIN_ID;
    }

    /// @notice Checks if current chain is L2
    function isL2() public view returns (bool) {
        return block.chainid == L2_CHAIN_ID;
    }
}
