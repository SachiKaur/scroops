let SpenderClass = require('class.spender');

class BuilderClass extends SpenderClass {

    /**
     * The body parts the simplest version of a builder should have
     */
    static get bodyBase() {
        this.incrementProfilerCount('BuilderClass.bodyBase');

        return [MOVE, CARRY, MOVE, WORK];
    }

    static get bodyImprovement() {
        this.incrementProfilerCount('BuilderClass.bodyImprovement');

        return [MOVE, CARRY, MOVE, WORK];
    }

    /**
     * Finds the construction site that is closest to being finished
     */
    get buildSiteId() {
        this.incrementProfilerCount('BuilderClass.buildSiteId');

        // First check to see if there's a location in the builder's cache
        let buildSiteId = this.cachedActionSiteId;

        if (this.isValidBuildSiteId(buildSiteId)) {
            return buildSiteId;
        }

        // Find all the construction sites in visible rooms
        let LocationHelper = require('helper.location');
        let siteIds = LocationHelper.findIds(FIND_MY_CONSTRUCTION_SITES);

        // Filter out all the valid controllers
        let validSiteIds = [];

        for (let idxId in siteIds) {
            if (this.isValidBuildSiteId(siteIds[idxId])) {
                validSiteIds.push(siteIds[idxId]);
            }
        }

        // Find the closest to being complete among all the valid sites
        let mostCompleteSiteId = false;
        let mostCompleteSiteDeficit = Infinity;

        for (let idxId in validSiteIds) {
            let site = Game.getObjectById(validSiteIds[idxId]);

            if (site.progressTotal - site.progress < mostCompleteSiteDeficit) {
                mostCompleteSiteId = validSiteIds[idxId];
                mostCompleteSiteDeficit = site.progressTotal - site.progress;
            }
        }

        // Save the closest valid site to the upgrader
        this.cacheActionSiteId(mostCompleteSiteId);

        return mostCompleteSiteId;
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to the methods of the creep object
     */
    doActivityMethod(activity) {
        this.incrementProfilerCount('BuilderClass.doActivityMethod');

        switch (activity) {
            case 'Withdraw':
                return this.doWithdraw();
            case 'Work':
                return this.doWork();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    /**
     * Build the room's constructions
     */
    doBuild() {
        this.incrementProfilerCount('BuilderClass.doBuild');

        let buildSite = Game.getObjectById(this.buildSiteId);

        if (!buildSite) {
            return false;
        }

        // If the builder is more than three spaces away from the site, it
        // needs to move to the site
        let PathHelper = require('helper.path');

        if (this.distance(buildSite.pos) > 3) {
            this.goTo(buildSite.pos);
        }

        // If the builder is within three spaces of the controller, it can
        // build it
        if (this.distance(buildSite.pos) <= 3) {
            let buildResult = this.gameObject.build(buildSite);
        }

        // If the building is now complete, clear the action site from cache
        // and clear the location helper's structure cache
        if (buildSite.progress == buildSite.progressTotal) {
            this.clearCachedActionSiteId();
            let LocationHelper = require('helper.location');
            LocationHelper.clearCache([
                FIND_STRUCTURES, FIND_MY_STRUCTURES,
                FIND_CONSTRUCTION_SITES, FIND_MY_CONSTRUCTION_SITES
            ]);
        }

        // If the builder is now out of energy, clear the action site from cache
        if (this.carriedEnergy == 0) {
            this.clearCachedActionSiteId();
        }
    }

    doRepair() {
        this.incrementProfilerCount('BuilderClass.doRepair');

        let repairSite = Game.getObjectById(this.repairSiteId);

        if (!repairSite) {
            return false;
        }

        // If the builder is more than three spaces away from the site, it
        // needs to move to the site
        if (this.distance(repairSite.pos) > 3) {
            this.goTo(repairSite.pos);
        }

        // If the builder is within three spaces of the controller, it can
        // repair it
        if (this.distance(repairSite.pos) <= 3) {
            let repairResult = this.gameObject.repair(repairSite);
        }
    }

    doWork() {
        this.incrementProfilerCount('BuilderClass.doWork');

        // If there are active construction sites, the builder should work on
        // them
        let LocationHelper = require('helper.location');
        let constructionSiteIds = LocationHelper.findIds(FIND_MY_CONSTRUCTION_SITES);

        if (constructionSiteIds.length > 0) {
            this.doBuild();
        }

        // If there are no towers in the builder's room, the builder should
        // work on repair
        let TowerHelper = require('helper.tower');
        let roomTowers = TowerHelper.getFriendlyTowerIdsByRoom(this.pos.roomName);

        if (roomTowers.length == 0) {
            this.doRepair();
        }
    }

    /**
     * Computes whether a given site is valid for building
     */
    isValidBuildSiteId(id) {
        this.incrementProfilerCount('BuilderClass.isValidBuildSiteId');

        let site = Game.getObjectById(id);

        return (site instanceof ConstructionSite && site.my);
    }

    /**
     * The minimum number of creeps of this role that should be in play
     */
    static get minimumCount() {
        this.incrementProfilerCount('BuilderClass.minimumCount');

        return 1;
    }

    get repairSiteId() {
        this.incrementProfilerCount('BuilderClass.repairSiteId');

        let RepairHelper = require('helper.repair');

        // First check to see if there's a location in the builder's cache
        let repairSiteId = this.cachedActionSiteId;

        if (RepairHelper.isValidRepairSiteId(repairSiteId)) {
            return repairSiteId;
        }

        repairSiteId = RepairHelper.weakestDamagedStructureId;

        // Save the repair site to the builder
        this.cacheActionSiteId(repairSiteId);

        return repairSiteId;
    }

    /**
     * The name of this creep's role
     */
    static get role() {
        this.incrementProfilerCount('BuilderClass.role');

        return 'Builder';
    }

    static get spawnPriority() {
        this.incrementProfilerCount('BuilderClass.spawnPriority');

        return 80;
    }

}

module.exports = BuilderClass;
