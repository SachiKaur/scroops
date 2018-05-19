let CreepClass = require('class.creep');

const ACTIVITY_SCOUT = 0;
const ACTIVITY_OBSERVE = 1;

class ScoutClass extends CreepClass {

    /**
     * Computes the activity the creep should perform this turn
     */
    get activity () {
        if (this.pos.isEqualTo(this.assignedPosition)) {
            return ACTIVITY_OBSERVE;
        }

        return ACTIVITY_SCOUT;
    }

    /**
     * Assigns the scout a position from which it should observe
     */
    assignPosition() {
        // Find the room the scout should observe
        let RoomHelper = require('helper.room');
        let adjacentRooms = RoomHelper.adjacentRooms;
        let assignedRoom = undefined;

        for (let idxId in adjacentRooms) {
            if (!ScoutClass.isRoomScouted(adjacentRooms[idxId])) {
                assignedRoom = adjacentRooms[idxId]
            }
        }

        if (!assignedRoom) {
            console.log(this.name + ' cannot get a room assignment');
            return false;
        }

        // If the scout is in that room, great! Let its current position be its
        // assignment
        if (this.pos.roomName == assignedRoom) {
            this.gameObject.memory.assignedPosition = this.pos;
            return this.pos;
        }

        // Find a path to that room and assign the end of that path to the scout
        let PathHelper = require('helper.path');
        let destination = PathHelper.findToRoom(this.pos, assignedRoom);
        this.gameObject.memory.assignedPosition = destination;
        return destination;
    }

    /**
     * The position to which this scout is assigned. Unlike similar functions
     * in other creep classes, this function will not automatically assign
     * the scout a position if it doesn't already have one. This is to avoid
     * setting up an infinite recursion, as assigning a position involves
     * getting the assigned positions of other creeps
     */
    get assignedPosition() {
        if (this.gameObject.memory.assignedPosition) {
            return new RoomPosition(
                this.gameObject.memory.assignedPosition.x,
                this.gameObject.memory.assignedPosition.y,
                this.gameObject.memory.assignedPosition.roomName
            );
        }

        return undefined;
    }

    /**
     * The room to which this scout is assigned
     */
    get assignedRoom() {
        let assignedPosition = this.assignedPosition;

        if (assignedPosition) {
            return assignedPosition.roomName;
        }

        return undefined;
    }

    /**
     * The body parts the most simplest version of a harvester should have
     */
    static get bodyBase() {
        return [MOVE];
    }

    /**
     * Do the given activity. This method connects the activity constant values
     * to methods of the creep object
     */
    doActivityMethod(activity) {
        switch (activity) {
            case ACTIVITY_SCOUT:
                return this.doScout();
            case ACTIVITY_OBSERVE:
                return this.doObserve();
        }

        throw new Error(this.name + ' has no method for activity ' + activity);
    }

    doObserve() {
    }

    doScout() {
        let assignedPosition = this.assignedPosition;

        if (assignedPosition) {
            this.goTo(assignedPosition);
        } else {
            this.assignPosition();
        }
    }

    /**
     * Returns true if any scout has the given room as its assigned room
     */
    static isRoomScouted(roomName) {
        let CreepHelper = require('helper.creep');
        let scoutIds = CreepHelper.getCreepIdsByRole(this.role);

        for (let idxId in scoutIds) {
            let scout = CreepHelper.createCreepById(scoutIds[idxId]);

            // I'm not exactly sure how this comes back as undefined, but I can
            // see in the console that it does when new scouts are spawned
            if (scout) {
                if (scout.assignedRoom == roomName) {
                    return true;
                }
            }
        }

        return false;
    }

    static get role() {
        return 'Scout';
    }

    static get shouldSpawn() {
        // At most, there should be one scout for every non-friendly room
        // adjacent to friendly rooms
        let RoomHelper = require('helper.room');
        let adjacentRooms = RoomHelper.adjacentRooms;
        return ScoutClass.count < RoomHelper.adjacentRooms.length;
    }

}

module.exports = ScoutClass;
