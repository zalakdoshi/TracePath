// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TracePath
/// @notice Educational supply-chain tracker with append-only event history.
contract TracePath {
    struct Batch {
        string batchId;
        string product;
        string origin;
        uint256 quantity;
        string harvestDate;
        address currentHolder;
        bool active;
        uint256 eventCount;
    }

    struct HistoryEvent {
        string action;
        address handler;
        string location;
        string note;
        uint256 timestamp;
        bytes32 previousHash;
        bytes32 eventHash;
    }

    address public owner;
    mapping(bytes32 => Batch) private batches;
    mapping(bytes32 => HistoryEvent[]) private histories;
    string[] private batchIds;

    event BatchRegistered(string batchId, address indexed holder, bytes32 eventHash);
    event BatchTransferred(string batchId, address indexed from, address indexed to, bytes32 eventHash);
    event BatchUpdated(string batchId, address indexed handler, bytes32 eventHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract deployer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerBatch(
        string calldata batchId,
        string calldata product,
        string calldata origin,
        uint256 quantity,
        string calldata harvestDate
    ) external {
        bytes32 key = keccak256(bytes(batchId));
        require(bytes(batchId).length > 0, "Batch ID required");
        require(batches[key].currentHolder == address(0), "Batch already exists");
        require(quantity > 0, "Quantity must be positive");

        batches[key] = Batch({
            batchId: batchId,
            product: product,
            origin: origin,
            quantity: quantity,
            harvestDate: harvestDate,
            currentHolder: msg.sender,
            active: true,
            eventCount: 0
        });
        batchIds.push(batchId);
        _append(key, "Created", origin, "Batch registered at origin", msg.sender);
        emit BatchRegistered(batchId, msg.sender, histories[key][0].eventHash);
    }

    function transferBatch(
        string calldata batchId,
        address to,
        string calldata location,
        string calldata note
    ) external {
        bytes32 key = keccak256(bytes(batchId));
        Batch storage b = batches[key];
        require(b.currentHolder != address(0), "Batch not found");
        require(b.active, "Batch inactive");
        require(msg.sender == b.currentHolder, "Only current holder can transfer");
        require(to != address(0), "Invalid recipient");
        b.currentHolder = to;
        _append(key, "Transferred", location, note, msg.sender);
        emit BatchTransferred(batchId, msg.sender, to, histories[key][histories[key].length - 1].eventHash);
    }

    function addUpdate(
        string calldata batchId,
        string calldata location,
        string calldata note
    ) external {
        bytes32 key = keccak256(bytes(batchId));
        Batch storage b = batches[key];
        require(b.currentHolder != address(0), "Batch not found");
        require(b.active, "Batch inactive");
        require(msg.sender == b.currentHolder, "Only current holder can update");
        _append(key, "Status Update", location, note, msg.sender);
        emit BatchUpdated(batchId, msg.sender, histories[key][histories[key].length - 1].eventHash);
    }

    function revokeBatch(string calldata batchId) external onlyOwner {
        bytes32 key = keccak256(bytes(batchId));
        Batch storage b = batches[key];
        require(b.currentHolder != address(0), "Batch not found");
        require(b.active, "Batch already inactive");
        b.active = false;
        _append(key, "Revoked", b.origin, "Batch marked inactive by contract owner", msg.sender);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        bytes32 key = keccak256(bytes(batchId));
        require(batches[key].currentHolder != address(0), "Batch not found");
        return batches[key];
    }

    function getHistory(string calldata batchId) external view returns (HistoryEvent[] memory) {
        bytes32 key = keccak256(bytes(batchId));
        require(batches[key].currentHolder != address(0), "Batch not found");
        return histories[key];
    }

    function getBatchIds() external view returns (string[] memory) {
        return batchIds;
    }

    function _append(
        bytes32 key,
        string memory action,
        string memory location,
        string memory note,
        address handler
    ) internal {
        HistoryEvent[] storage history = histories[key];
        bytes32 previous = history.length == 0
            ? bytes32(0)
            : history[history.length - 1].eventHash;
        uint256 timestamp = block.timestamp;
        bytes32 current = keccak256(abi.encode(
            batches[key].batchId,
            action,
            handler,
            location,
            note,
            timestamp,
            previous
        ));
        history.push(HistoryEvent({
            action: action,
            handler: handler,
            location: location,
            note: note,
            timestamp: timestamp,
            previousHash: previous,
            eventHash: current
        }));
        batches[key].eventCount = history.length;
    }
}
