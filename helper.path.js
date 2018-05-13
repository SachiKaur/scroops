class PathHelper {

    static find(start, end) {
        if (!start) {
            throw new Error('Start position must be supplied to find');
        }

        if (!end) {
            throw new Error('End position must be supplied to find');
        }

        let path;

        try {
            path = this.readFromCache(start, end);
        } catch(error) {
            path = undefined;
        }

        if (path) {
            return path;
        }

        path = start.findPathTo(end, { ignoreCreeps: true });
        this.writeToCache(start, end, path);

        return path;
    }

    static getPosByDirection(position, direction) {
        switch (direction) {
            case TOP:
                return new RoomPosition(position.x, position.y-1, position.roomName);
            case TOP_RIGHT:
                return new RoomPosition(position.x+1, position.y-1, position.roomName);
            case RIGHT:
                return new RoomPosition(position.x+1, position.y, position.roomName);
            case BOTTOM_RIGHT:
                return new RoomPosition(position.x+1, position.y+1, position.roomName);
            case BOTTOM:
                return new RoomPosition(position.x, position.y+1, position.roomName);
            case BOTTOM_LEFT:
                return new RoomPosition(position.x-1, position.y+1, position.roomName);
            case LEFT:
                return new RoomPosition(position.x-1, position.y, position.roomName);
            case TOP_LEFT:
                return new RoomPosition(position.x-1, position.y-1, position.roomName);
            default:
                throw new Error('Direction ' + direction + ' given to getPosByDirection is not valid');
        }
    }

    static isSpaceOpen(position) {
        if (!this.isSpaceWalkable(position)) {
            return false;
        }

        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let object = objects[idxObjects];

            if (['creep'].indexOf(object.type) !== -1) {
                return false;
            }
        }

        return true;
    }

    static isSpaceWalkable(position) {
        let objects = Game.rooms[position.roomName].lookAt(position.x, position.y);

        for (let idxObjects in objects) {
            let object = objects[idxObjects];

            if (['creep','resource','tombstone'].indexOf(object.type) !== -1) {
                return true;
            }

            if (object.type == 'structure') {
                if (['constructedWall','controller','wall'].indexOf(object.structure.structureType) !== -1) {
                    return false;
                }

                if (['container','road'].indexOf(object.structure.structureType) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of structure ' + object.structure.structureType);
            }

            if (object.type == 'terrain') {
                if (['wall'].indexOf(object.terrain) !== -1) {
                    return false;
                }

                if (['plain','swamp'].indexOf(object.terrain) !== -1) {
                    return true;
                }

                console.log('Unsure of passability of terrain ' + object.terrain);
            }
        }

        return false;
    }

    static readFromCache(start, end) {
        if (!start) {
            throw new Error('Start position must be supplied to readFromCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to readFromCache');
        }

        if (!Memory.pathResults) {
            return undefined;
        }

        if (!Memory.pathResults[start.x]) {
            return undefined;
        }

        if (!Memory.pathResults[start.x][start.y]) {
            return undefined;
        }

        if (!Memory.pathResults[start.x][start.y][end.x]) {
            return undefined;
        }

        return Memory.pathResults[start.x][start.y][end.x][end.y];
    }

    static writeToCache(start, end, path) {
        if (!start) {
            throw new Error('Start position must be supplied to writeToCache');
        }

        if (!end) {
            throw new Error('End position must be supplied to writeToCache');
        }

        if (!Memory.pathResults) {
            Memory.pathResults = {};
        }

        if (!Memory.pathResults[start.x]) {
            Memory.pathResults[start.x] = {};
        }

        if (!Memory.pathResults[start.x][start.y]) {
            Memory.pathResults[start.x][start.y] = {};
        }

        if (!Memory.pathResults[start.x][start.y][end.x]) {
            Memory.pathResults[start.x][start.y][end.x] = {};
        }

        if (!Memory.pathResults[start.x][start.y][end.x][end.y]) {
            Memory.pathResults[start.x][start.y][end.x][end.y] = {};
        }

        Memory.pathResults[start.x][start.y][end.x][end.y] = path;
    }

}

module.exports = PathHelper;
