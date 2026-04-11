// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MLDSAAccount.sol";

/**
 * @title MLDSAAccountFactory
 * @notice Factory for deploying ML-DSA smart accounts with CREATE2
 */
contract MLDSAAccountFactory {
    address public immutable entryPoint;

    event AccountCreated(address indexed account, bytes32 indexed publicKeyHash, address indexed owner);

    constructor(address _entryPoint) {
        require(_entryPoint != address(0), "Invalid entry point");
        entryPoint = _entryPoint;
    }

    /**
     * @notice Deploy a new ML-DSA account using CREATE2
     * @param mldsaPublicKey The ML-DSA-65 public key (1952 bytes)
     * @param salt Salt for deterministic address
     * @return account The deployed account address
     */
    function createAccount(bytes calldata mldsaPublicKey, bytes32 salt)
        external
        returns (address account)
    {
        require(mldsaPublicKey.length == 1952, "Invalid ML-DSA key size");

        bytes32 actualSalt = keccak256(abi.encodePacked(salt, keccak256(mldsaPublicKey)));

        account = address(new MLDSAAccount{salt: actualSalt}(entryPoint, mldsaPublicKey));

        emit AccountCreated(account, keccak256(mldsaPublicKey), msg.sender);
        return account;
    }

    /**
     * @notice Compute the counterfactual address of an account
     */
    function getAddress(bytes calldata mldsaPublicKey, bytes32 salt)
        external
        view
        returns (address)
    {
        bytes32 actualSalt = keccak256(abi.encodePacked(salt, keccak256(mldsaPublicKey)));

        bytes32 hash = keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            actualSalt,
            keccak256(abi.encodePacked(
                type(MLDSAAccount).creationCode,
                abi.encode(entryPoint, mldsaPublicKey)
            ))
        ));

        return address(uint160(uint256(hash)));
    }
}
