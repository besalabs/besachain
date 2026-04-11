// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MLDSAAccount
 * @notice Smart contract account that uses ML-DSA post-quantum signatures
 * @dev Uses BesaChain precompile at 0x0120 for signature verification
 */
contract MLDSAAccount {
    // ML-DSA-65 constants
    uint256 public constant MLDSA_PUBLIC_KEY_SIZE = 1952;
    uint256 public constant MLDSA_SIGNATURE_SIZE = 3309;
    address public constant MLDSA_PRECOMPILE = address(0x0120);

    // Account state
    address public entryPoint;
    bytes public mldsaPublicKey; // 1952 bytes
    uint256 public nonce;

    // Events
    event MLDSAAccountCreated(address indexed account, bytes32 publicKeyHash);
    event Executed(address indexed target, uint256 value, bytes data);
    event EntryPointChanged(address indexed oldEntryPoint, address indexed newEntryPoint);

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "MLDSAAccount: not from EntryPoint");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "MLDSAAccount: not self");
        _;
    }

    constructor(address _entryPoint, bytes memory _mldsaPublicKey) {
        require(_mldsaPublicKey.length == MLDSA_PUBLIC_KEY_SIZE, "Invalid ML-DSA public key size");
        require(_entryPoint != address(0), "Invalid entry point");
        entryPoint = _entryPoint;
        mldsaPublicKey = _mldsaPublicKey;
        emit MLDSAAccountCreated(address(this), keccak256(_mldsaPublicKey));
    }

    /**
     * @notice Validate a UserOperation signature using ML-DSA
     * @param userOpHash Hash of the user operation
     * @param signature ML-DSA signature (3309 bytes)
     * @return validationData 0 if valid, 1 if invalid
     */
    function validateSignature(bytes32 userOpHash, bytes calldata signature)
        external
        view
        returns (uint256 validationData)
    {
        if (signature.length != MLDSA_SIGNATURE_SIZE) {
            return 1; // SIG_VALIDATION_FAILED
        }

        // Pack input for precompile: message (32) + signature (3309) + pubkey (1952)
        bytes memory input = abi.encodePacked(
            userOpHash,      // 32 bytes
            signature,       // 3309 bytes
            mldsaPublicKey   // 1952 bytes
        );

        // Call ML-DSA precompile
        (bool success, bytes memory result) = MLDSA_PRECOMPILE.staticcall(input);

        if (!success || result.length < 32) {
            return 1; // SIG_VALIDATION_FAILED
        }

        // Check last byte of result (1 = valid, 0 = invalid)
        if (uint8(result[31]) == 1) {
            return 0; // SIG_VALIDATION_SUCCESS
        }
        return 1; // SIG_VALIDATION_FAILED
    }

    /**
     * @notice Execute a call from this account
     * @param target Address to call
     * @param value ETH value to send
     * @param data Calldata
     */
    function execute(address target, uint256 value, bytes calldata data)
        external
        onlyEntryPoint
    {
        nonce++;
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, string(abi.encodePacked("Execution failed: ", result)));
        emit Executed(target, value, data);
    }

    /**
     * @notice Execute a batch of calls
     * @param targets Addresses to call
     * @param values ETH values to send
     * @param datas Calldatas
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyEntryPoint {
        require(targets.length == values.length && values.length == datas.length, "Length mismatch");
        nonce++;
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call{value: values[i]}(datas[i]);
            require(success, string(abi.encodePacked("Batch exec failed at ", i)));
        }
    }

    /**
     * @notice Update the entry point (only callable by self via execute)
     */
    function setEntryPoint(address _newEntryPoint) external onlySelf {
        require(_newEntryPoint != address(0), "Invalid entry point");
        emit EntryPointChanged(entryPoint, _newEntryPoint);
        entryPoint = _newEntryPoint;
    }

    /**
     * @notice Get the current nonce
     */
    function getNonce() external view returns (uint256) {
        return nonce;
    }

    /**
     * @notice Get public key hash for identification
     */
    function getPublicKeyHash() external view returns (bytes32) {
        return keccak256(mldsaPublicKey);
    }

    // Allow receiving ETH
    receive() external payable {}
    fallback() external payable {}
}
