console.log('======= Beginning tick ' + Game.time + ' =======');

// Clear memory allocated for dead creeps
for (let name in Memory.creeps) {
    if (Game.creeps[name] === undefined) {
        delete Memory.creeps[name];
    }
}

// Iterate through the player's spawns and spawn creeps
let WorldManagerClass = require('WorldManager');
let worldManager = new WorldManagerClass();

let UtilCreepClass = require('UtilCreep');
let utilCreep = new UtilCreepClass(Game.creeps);

let UtilSpawnClass = require('UtilSpawn');
let utilSpawn;

for (let spawnName in Game.spawns) {
    // roomManager = worldManager.getRoomManager(Game.spawns[spawnName].pos.roomName);
    utilSpawn = new UtilSpawnClass(spawnName);
    utilSpawn.spawnCreep(worldManager, utilCreep);
}

let UtilPathClass = require('UtilPath');
let utilPath = new UtilPathClass();

let Role = require('Role');
let GameObjectClass = require('GameObject');
let gameObject;

let roleClass;
let creeps = [];

for (let creepName in Game.creeps) {
    roleClass = Role.getCreepClassByCreepId(Game.creeps[creepName].id);

    if (roleClass === undefined) {
        continue;
    }

    creeps.push(new roleClass(Game.creeps[creepName].id));
}

let UtilSortClass = require('UtilSort');
let utilSort = new UtilSortClass();
utilSort.sort(creeps, 'movePriority', utilSort.SORT_DESCENDING);

let workGroup;
let creep;

while (creeps.length > 0) {
    creep = creeps.shift();

    workGroup = [creep];

    while (creeps.length > 0 && creeps[0].movePriority === workGroup[0].movePriority) {
        creep = creeps.shift();
        workGroup.push(creep);
    }

    utilSort.sort(workGroup, 'energy', utilSort.SORT_DESCENDING);

    for (let idxCreep = 0; idxCreep < workGroup.length; idxCreep++) {
        creep = workGroup[idxCreep];
        creep.debug('******* Beginning turn for tick ' + Game.time + ' *******');
        creep.setTakeEnergyTargetId(creep.getTakeEnergyTargetId(worldManager));
        creep.takeEnergyPos = creep.getTakeEnergyPos(worldManager);

        creep.setGiveEnergyTargetId(creep.getGiveEnergyTargetId(worldManager));


        if (creep.giveEnergyTargetId !== undefined) {
            gameObject = new GameObjectClass(creep.giveEnergyTargetId);
            creep.debug('Giving energy to ' + gameObject.name);
            creep.giveEnergyPos = creep.getClosestInteractionPositionById(creep.giveEnergyTargetId, worldManager);
            creep.debug('Give energy position is ' + creep.giveEnergyPos);
        } else {
            creep.debug('Object to give energy to is undefined');
        }

        creep.work(worldManager, utilPath);

        creep.debug('------- Ending turn for tick ' + Game.time + ' -------');
    }
}

// Iterate through each of the game's towers
let TowerClass = require('Tower');
let tower;

for (let roomName in Game.rooms) {
    let towers = worldManager.getTowers(roomName);

    for (let idxTower = 0; idxTower < towers.length; idxTower++) {
        tower = new TowerClass(towers[idxTower].id);
        tower.debug('******* Beginning turn for tick ' + Game.time + ' *******');

        tower.giveEnergyTargetId = tower.getGiveEnergyTargetId(worldManager);
        tower.debug('giveEnergyTargetId is ' + tower.giveEnergyTargetId);
        tower.work();
        tower.debug('------- Ending turn for tick ' + Game.time + ' -------');
    }
}