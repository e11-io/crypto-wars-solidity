### Crypto Wars's To Do List:


## Solidity


### Migrate data on contract upgrades

  - Contracts version ✓

  - BuildingsData: (migrated by owner)

    - mapping (uint => Building) public buildings;
    - uint[] public buildingIds;

  - BuildingsQueue:

    - mapping (address => Build[]) public userBuildingsQueue;

  - UserBuildings:

    - mapping (address => Building[]) public userBuildings;

  - UserResources:

    -	mapping (address => Resources) public usersResources;
    -	mapping (address => uint) public usersPayoutBlock;

  - UserVault:

    - mapping(address => uint256) public balances;

  - UserVillage:

    -	mapping(address => string) public villages;
    -	mapping(bytes32 => address) public addresses;
    -	uint[] initialBuildingsIds;


---------------

- Village Ownership

- Defenses

- Units

- Research

- Battle

- Trade

- Quantum Dust (Freeze | Burn)

- Advanced upgradeable contracts


## Web

-
