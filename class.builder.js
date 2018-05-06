let SpenderClass = require('class.spender');

class BuilderClass extends SpenderClass {

    /**
     * The body parts the simplest version of a builder should have
     */
    static get bodyBase() {
        return [MOVE, CARRY, MOVE, WORK];
    }

    /**
     * Finds the construction site that is closest to being finished
     */
    get buildSiteId() {
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
        switch (activity) {
            case 'Withdraw':
                return this.doWithdraw();
            case 'Work':
                return this.doBuild();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    /**
     * Build the room's constructions
     */
    doBuild() {
        let buildSite = Game.getObjectById(this.buildSiteId);

        if (!buildSite) {
            return false;
        }

        // If the builder is more than three spaces away from the site, it
        // needs to move to the site
        if (this.pos.getRangeTo(buildSite.pos) > 3) {
            let PathHelper = require('helper.path');
            this.moveByPath(PathHelper.find(this.pos, buildSite.pos));
        }

        // If the builder is within three spaces of the controller, it can
        // build it
        if (this.pos.getRangeTo(buildSite.pos) <= 3) {
            let buildResult = this.gameObject.build(buildSite);
        }

        // If the builder is now out of energy, clear the action site from cache
        if (this.carriedEnergy == 0) {
            this.clearCachedActionSiteId();
        }
    }

    /**
     * Computes whether a given site is valid for building
     */
    isValidBuildSiteId(id) {
        let site = Game.getObjectById(id);

        return (site instanceof ConstructionSite && site.my);
    }

    /**
     * The minimum number of creeps of this role that should be in play
     */
    static get minimumCount() {
        return 0;
    }

    /**
     * The name of this creep's role
     */
    static get role() {
        return 'Builder';
    }

}

module.exports = BuilderClass;
