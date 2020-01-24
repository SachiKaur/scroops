let CreepEarnerClass = require('CreepEarner');

class CreepHarvester extends CreepEarnerClass
{
    constructor(id) {
        super(id);
        // this.inDebugMode = true;
    }

    static get basicBody() {
        return [WORK, CARRY, MOVE];
    }

    static get bodyIncrement() {
        return [WORK];
    }

    getGiveEnergyTargetId(roomManager) {
        let container;

        for (let idxContainer = 0; idxContainer < roomManager.getContainers().length; idxContainer++) {
            container = roomManager.getContainers()[idxContainer];

            if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.pos.getRangeTo(container) <= 1) {
                return roomManager.getContainers()[idxContainer].id;
            }
        }

        let UtilCreepClass = require('UtilCreep');
        let utilCreep = new UtilCreepClass(this.pos.roomName);

        if (utilCreep.count > 1) {
            this.debug('Returning own id');
            return this.id;
        }

        for (let idxSpawn = 0; idxSpawn < roomManager.getFriendlySpawns().length; idxSpawn++) {
            if (roomManager.getFriendlySpawns()[idxSpawn].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return roomManager.getFriendlySpawns()[idxSpawn].id;
            }
        }

        return undefined;
    }

    getTakeEnergyTargetId(roomManager) {
        for (let idxSource = 0; idxSource < roomManager.getSources().length; idxSource++) {
            if (roomManager.getSources()[idxSource].energy > 0) {
                return roomManager.getSources()[idxSource].id;
            }
        }
    }

    giveEnergy() {
        let giveEnergyTarget = Game.getObjectById(this.giveEnergyTargetId);

        if (giveEnergyTarget instanceof StructureContainer && this.pos.getRangeTo(giveEnergyTarget) > 2) {
            this.gameObject.drop(RESOURCE_ENERGY);
        }

        super.giveEnergy();
    }

    giveEnergyToCreep(creep) {
        this.gameObject.drop(RESOURCE_ENERGY);
    }

    get mode() {
        let mode = this.MODE_TAKE_ENERGY;
        let load = this.gameObject.store.getUsedCapacity(RESOURCE_ENERGY);

        let harvestYield = 0;

        this.gameObject.body.forEach(function(bodyPart) {
            if (bodyPart.type === WORK) {
                harvestYield += 2;
            }
        });

        let capacity = this.gameObject.store.getCapacity(RESOURCE_ENERGY);

        if (load + harvestYield >= capacity) {
            mode = this.MODE_GIVE_ENERGY;
        }

        return mode;
    }

    get movePriority() {
        return 100;
    }
}

module.exports = CreepHarvester;