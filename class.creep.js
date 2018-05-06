var BaseClass = require('class.base');

class CreepClass extends BaseClass {

    act() {
        this.doActivityMethod(this.activity);
    }

    get activity() {
        throw new Error('Base creeps do not have activities');
    }

    static get bodyBase() {
        throw new Error('bodyBase method has not been defined for ' + this.name);
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

    static get minimumCount() {
        return 0;
    }

    moveByPath(path) {
        let moveResult = this.gameObject.moveByPath(path);

        if (moveResult !== OK) {
            console.log(this.name + ' moveByPath result is ' + moveResult);
        }
    }

    static get role() {
        throw new Error('The base creep class does not have a role');
    }

    get role() {
        return this.constructor.role;
    }

}

module.exports = CreepClass;
