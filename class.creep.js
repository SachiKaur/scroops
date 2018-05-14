var ActiveClass = require('class.active');

class CreepClass extends ActiveClass {

    static get bodyBase() {
        throw new Error('bodyBase method has not been defined for ' + this.name);
    }

    static get bodyImprovement() {
        throw new Error('bodyImprovement method has not been defined for ' + this.name);
    }

    /**
     * Returns an array of body parts on the creep
     */
    get body() {
        let body = [];

        for (let idxBody in this.gameObject.body) {
            body.push(this.gameObject.body[idxBody].type);
        }

        return body;
    }

    static bodyByEnergy(energy) {
        let CreepHelper = require('helper.creep');
        let body = this.bodyBase;

        if (CreepHelper.bodyCost(body) > energy) {
            return false;
        }

        while (CreepHelper.bodyCost(body.concat(this.bodyImprovement)) <= energy) {
            body = body.concat(this.bodyImprovement);
        }

        return body;
    }

    cacheActionSiteId(id) {
        this.gameObject.memory.actionSiteId = id;
    }

    get cachedActionSiteId() {
        return this.gameObject.memory.actionSiteId;
    }

    get carriedEnergy() {
        return this.gameObject.carry [RESOURCE_ENERGY];
    }

    clearCachedActionSiteId() {
        this.gameObject.memory.actionSiteId = undefined;
    }

    /**
     * Returns the current number of creeps with this creep's role
     */
    static get count() {
        let CreepHelper = require('helper.creep');
        let count = 0;

        for (let creepName in Game.creeps) {
            // A creep's role is defined by the non-numeric part of its name.
            // A creep whose name contains "Harvester" is a Harvester
            if (CreepHelper.getRoleByName(creepName) == this.role) {
                count++;
            }
        }

        return count;
    }

    goTo(destinationPos) {
        let priorPosition = this.pos;
        this.debugLog('Prior position is ' + priorPosition);

        let PathHelper = require('helper.path');
        let path = PathHelper.find(this.pos, destinationPos);
        this.debugLog('Direction to move toward ' + destinationPos + ' is ' + path[0].direction);

        let resultPosition = PathHelper.getPosByDirection(this.pos, path[0].direction);
        this.debugLog('Resulting position will be ' + resultPosition);

        if (!PathHelper.isSpaceOpen(resultPosition)) {
            this.debugLog('Resulting position is not open');

            let LocationHelper = require('helper.location');
            let blockingCreepIds = LocationHelper.getCreepIdsByPosition(resultPosition);

            for (let idxId in blockingCreepIds) {
                let blockingCreep = Game.getObjectById(blockingCreepIds[idxId]);
                blockingCreep.move((path[0].direction + 4) % 8);
            }

        }

        let moveResult = this.gameObject.move(path[0].direction);
    }

    static get minimumCount() {
        return 0;
    }

    static get role() {
        throw new Error('The base creep class does not have a role');
    }

    get role() {
        return this.constructor.role;
    }

    static get shouldSpawn() {
        if (this.count < this.minimumCount) {
            return true;
        }

        return false;
    }

}

module.exports = CreepClass;
