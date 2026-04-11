// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './BesaPair.sol';

/**
 * @title BesaFactory
 * @author BesaChain Team
 * @notice DEX factory for creating trading pairs on BesaChain L1/L2
 * @dev Modified UniswapV2Factory for BesaChain with 1B gas limit (L1) and 100M gas limit (L2)
 */
contract BesaFactory {
    address public feeTo;
    address public feeToSetter;
    address public owner;

    /// @notice BesaChain L1 Mainnet Chain ID
    uint256 public constant L1_CHAIN_ID = 1444;

    /// @notice BesaChain L2 Mainnet Chain ID
    uint256 public constant L2_CHAIN_ID = 1912;

    /// @notice BesaChain L1 Testnet Chain ID
    uint256 public constant L1_TESTNET_CHAIN_ID = 14440;

    /// @notice BesaChain L2 Testnet Chain ID
    uint256 public constant L2_TESTNET_CHAIN_ID = 19120;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, 'FORBIDDEN: not owner');
        _;
    }

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
        owner = msg.sender;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), 'ZERO_ADDRESS');
        require(newOwner != feeToSetter, "Already owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Creates a new trading pair
     * @dev Optimized for high gas limits on BesaChain (1B on L1, 100M on L2)
     */
    function createPair(address tokenA, address tokenB) external onlyOwner returns (address pair) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'PAIR_EXISTS');

        bytes memory bytecode = type(BesaPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        BesaPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

    /**
     * @notice Returns the current chain ID
     */
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }

    /**
     * @notice Checks if running on L2 for gas optimization
     */
    function isL2() public view returns (bool) {
        return block.chainid == L2_CHAIN_ID;
    }
}
