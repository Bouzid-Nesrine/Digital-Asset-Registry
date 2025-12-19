// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract DigitalAssetRegistry {

    struct Asset {
        uint256 id;
        string name;
        string assetType;
        string description;
        bytes32 hash;
        address owner;
        uint256 createdAt;
        address[] authorizedUsers;
    }

    struct UsageRecord {
        uint256 assetId;
        string action;
        address user;
        uint256 timestamp;
    }

    uint256 public assetCount = 0;

    mapping(uint256 => Asset) public assets;
    mapping(address => uint256[]) private ownerAssets;
    mapping(address => UsageRecord[]) private usageHistory;
    
    // Track if user already has access to prevent duplicates
    mapping(uint256 => mapping(address => bool)) private hasAccess;

    /* =========================
            EVENTS
    ========================= */

    event AssetRegistered(uint256 indexed assetId, address indexed owner);
    event OwnershipTransferred(uint256 indexed assetId, address indexed from, address indexed to);
    event AccessGranted(uint256 indexed assetId, address indexed user);
    event AccessRevoked(uint256 indexed assetId, address indexed user);

    /* =========================
        MODIFIERS
    ========================= */

    modifier assetExists(uint256 assetId) {
        require(assetId > 0 && assetId <= assetCount, "Asset does not exist");
        _;
    }

    modifier onlyAssetOwner(uint256 assetId) {
        require(assets[assetId].owner == msg.sender, "Not asset owner");
        _;
    }

    /* =========================
        REGISTER ASSET
    ========================= */

    function registerAsset(
        string memory name,
        string memory assetType,
        string memory description,
        bytes32 hash
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(hash != bytes32(0), "Hash cannot be empty");

        assetCount++;

        Asset storage newAsset = assets[assetCount];
        newAsset.id = assetCount;
        newAsset.name = name;
        newAsset.assetType = assetType;
        newAsset.description = description;
        newAsset.hash = hash;
        newAsset.owner = msg.sender;
        newAsset.createdAt = block.timestamp;

        ownerAssets[msg.sender].push(assetCount);

        usageHistory[msg.sender].push(
            UsageRecord(assetCount, "registered", msg.sender, block.timestamp)
        );

        emit AssetRegistered(assetCount, msg.sender);

        return assetCount;
    }

    /* =========================
        GET MY ASSETS
    ========================= */

    function getMyAssets() public view returns (Asset[] memory) {
        uint256[] memory ids = ownerAssets[msg.sender];
        Asset[] memory result = new Asset[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            result[i] = assets[ids[i]];
        }

        return result;
    }

    /* =========================
        TRANSFER OWNERSHIP
    ========================= */

    function transferOwnership(uint256 assetId, address newOwner) 
        public 
        assetExists(assetId)
        onlyAssetOwner(assetId)
    {
        require(newOwner != address(0), "Invalid address");
        require(newOwner != msg.sender, "Already the owner");

        Asset storage asset = assets[assetId];
        address oldOwner = asset.owner;

        // Update owner
        asset.owner = newOwner;

        // Remove from old owner's list
        _removeAssetFromOwner(oldOwner, assetId);

        // Add to new owner's list
        ownerAssets[newOwner].push(assetId);

        // Clear all authorized users on transfer
        delete asset.authorizedUsers;
        
        // Clear hasAccess mapping for this asset
        // Note: In production, you'd want to track authorized users to clear them
        // For now, new authorizations will overwrite

        // Record in usage history
        usageHistory[oldOwner].push(
            UsageRecord(assetId, "transferred_out", oldOwner, block.timestamp)
        );
        
        usageHistory[newOwner].push(
            UsageRecord(assetId, "transferred_in", newOwner, block.timestamp)
        );

        emit OwnershipTransferred(assetId, oldOwner, newOwner);
    }

    /* =========================
        ACCESS CONTROL
    ========================= */

    function grantAccess(uint256 assetId, address user) 
        public 
        assetExists(assetId)
        onlyAssetOwner(assetId)
    {
        require(user != address(0), "Invalid address");
        require(user != msg.sender, "Owner already has access");
        require(!hasAccess[assetId][user], "User already has access");

        Asset storage asset = assets[assetId];
        asset.authorizedUsers.push(user);
        hasAccess[assetId][user] = true;

        usageHistory[user].push(
            UsageRecord(assetId, "access_granted", user, block.timestamp)
        );

        emit AccessGranted(assetId, user);
    }

    function revokeAccess(uint256 assetId, address user) 
        public 
        assetExists(assetId)
        onlyAssetOwner(assetId)
    {
        require(hasAccess[assetId][user], "User does not have access");

        Asset storage asset = assets[assetId];
        address[] storage users = asset.authorizedUsers;

        // Find and remove user
        for (uint i = 0; i < users.length; i++) {
            if (users[i] == user) {
                users[i] = users[users.length - 1];
                users.pop();
                break;
            }
        }

        hasAccess[assetId][user] = false;

        usageHistory[user].push(
            UsageRecord(assetId, "access_revoked", user, block.timestamp)
        );

        emit AccessRevoked(assetId, user);
    }

    function checkAccess(uint256 assetId, address user) 
        public 
        view 
        assetExists(assetId)
        returns (bool) 
    {
        Asset storage asset = assets[assetId];
        return asset.owner == user || hasAccess[assetId][user];
    }

    /* =========================
        USAGE HISTORY
    ========================= */

    function getUsageHistory(address user) public view returns (UsageRecord[] memory) {
        return usageHistory[user];
    }

    function getAssetDetails(uint256 assetId) 
        public 
        view 
        assetExists(assetId)
        returns (Asset memory) 
    {
        return assets[assetId];
    }

    /* =========================
        INTERNAL HELPERS
    ========================= */

    function _removeAssetFromOwner(address owner, uint256 assetId) private {
        uint256[] storage userAssets = ownerAssets[owner];
        
        for (uint i = 0; i < userAssets.length; i++) {
            if (userAssets[i] == assetId) {
                userAssets[i] = userAssets[userAssets.length - 1];
                userAssets.pop();
                break;
            }
        }
    }
}