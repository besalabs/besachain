// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MLDSAEntryPoint
 * @notice Processes UserOperations for ML-DSA accounts
 * @dev Simplified ERC-4337 EntryPoint adapted for ML-DSA
 */
contract MLDSAEntryPoint {
    // UserOperation structure
    struct UserOperation {
        address sender;          // MLDSAAccount address
        uint256 nonce;           // Account nonce
        bytes callData;          // Encoded execute() call
        uint256 callGasLimit;    // Gas for execution
        uint256 verificationGasLimit; // Gas for signature verification
        uint256 maxFeePerGas;
        uint256 maxPriorityFeePerGas;
        bytes signature;         // ML-DSA signature (3309 bytes)
    }

    // Events
    event UserOperationEvent(
        bytes32 indexed userOpHash,
        address indexed sender,
        bool success,
        uint256 actualGasCost
    );
    event AccountDeployed(address indexed account, address indexed factory);

    // State
    mapping(address => uint256) public balances; // Deposit balances for gas
    mapping(address => bool) public registeredAccounts;

    /**
     * @notice Execute a batch of UserOperations
     */
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external {
        uint256 totalGas = gasleft();

        for (uint256 i = 0; i < ops.length; i++) {
            _handleOp(ops[i]);
        }

        // Pay beneficiary for gas
        uint256 gasUsed = totalGas - gasleft();
        uint256 gasCost = gasUsed * tx.gasprice;
        if (gasCost > 0 && beneficiary != address(0)) {
            (bool success,) = beneficiary.call{value: gasCost}("");
            require(success, "Beneficiary payment failed");
        }
    }

    /**
     * @notice Execute a single UserOperation
     */
    function handleOp(UserOperation calldata op) external {
        _handleOp(op);
    }

    function _handleOp(UserOperation calldata op) internal {
        // 1. Compute UserOp hash
        bytes32 userOpHash = getUserOpHash(op);

        // 2. Validate signature via MLDSAAccount
        uint256 validationData = MLDSAAccountInterface(op.sender)
            .validateSignature(userOpHash, op.signature);
        require(validationData == 0, "MLDSAEntryPoint: invalid signature");

        // 3. Validate nonce
        uint256 accountNonce = MLDSAAccountInterface(op.sender).getNonce();
        require(op.nonce == accountNonce, "MLDSAEntryPoint: invalid nonce");

        // 4. Execute the operation
        (bool success,) = op.sender.call{gas: op.callGasLimit}(op.callData);

        emit UserOperationEvent(userOpHash, op.sender, success, 0);
    }

    /**
     * @notice Compute the hash of a UserOperation
     */
    function getUserOpHash(UserOperation calldata op) public view returns (bytes32) {
        return keccak256(abi.encode(
            op.sender,
            op.nonce,
            keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            block.chainid,
            address(this)
        ));
    }

    /**
     * @notice Deposit ETH for gas payments
     */
    function depositTo(address account) external payable {
        balances[account] += msg.value;
    }

    /**
     * @notice Withdraw deposited ETH
     */
    function withdrawTo(address payable target, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success,) = target.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice Register an ML-DSA account
     */
    function registerAccount(address account) external {
        registeredAccounts[account] = true;
        emit AccountDeployed(account, msg.sender);
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}

interface MLDSAAccountInterface {
    function validateSignature(bytes32 userOpHash, bytes calldata signature) external view returns (uint256);
    function getNonce() external view returns (uint256);
}
