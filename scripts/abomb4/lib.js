
exports.modName = "dimension-shard";

exports.defineMultiCrafter = require('abomb4/multi-crafter').defineMultiCrafter;

exports.loadSound = (path) => Vars.mods.scripts.loadSound(path)

exports.newEffect = (lifetime, renderer) => new Effect(lifetime, cons(renderer));

exports.cons2 = (func) => new Cons2({ get: (v1, v2) => func(v1, v2) });
exports.floatc2 = (func) => new Floatc2({ get: (v1, v2) => func(v1, v2) });
exports.func = (getter) => new Func({ get: getter });

exports.loadRegion = (name) => Core.atlas.find(exports.modName + '-' + name, Core.atlas.find("clear"));

exports.int = (v) => new java.lang.Integer(v);

/**
 * Get message from bundle, 'type.mod-name.key'
 * @param {string} type the prefix such as block, unit, mech
 * @param {string} key  the suffix
 */
exports.getMessage = (type, key) => Core.bundle.get(type + "." + exports.modName + "." + key);

/**
 * lib.setBuilding(extend(CoreBlock, "my-core", {}), () => extend(CoreBlock.CoreBuilding, {}))
 *
 * @param {Block} blockType The block type
 * @param {(block: Block) => Building} buildingCreator
 *        A function receives block type, return Building instance;
 *        don't use prov (this function will use prov once)
 */
exports.setBuilding = function(blockType, buildingCreator) {
    blockType.buildType = prov(() => buildingCreator(blockType));
}

/**
 * lib.setBuildingSimple(extend(CoreBlock, "my-core", {}), CoreBlock.CoreBuilding, {})
 *
 * @param {Block} blockType The block type
 * @param {Class<Building>} buildingType The building type
 * @param {Object} overrides Object that as second parameter of extend()
 */
exports.setBuildingSimple = function(blockType, buildingType, overrides) {
    blockType.buildType = prov(() => new JavaAdapter(buildingType, overrides, blockType));
}

/** Random item picker, use add() to add items with integer probability */
exports.createProbabilitySelector = function() {
    const objects = [];
    const probabilities = [];
    var maxProbabilitySum = 0;

    return {
        showProbabilities() {
            const p = [];
            var previous = 0;
            for (var i = 0; i < probabilities.length; i++) {
                var current = probabilities[i];
                p.push(parseFloat(((current - previous) / maxProbabilitySum).toFixed(5)))
                previous = current;
            }
            return p;
        },
        add(obj, probability) {
            if (!Number.isInteger(probability)) {
                throw "'probability' have to be integer."
            }
            maxProbabilitySum += probability;
            objects.push(obj);
            probabilities.push(maxProbabilitySum);
        },
        random: function() {
            const random = Math.floor(Math.random() * maxProbabilitySum);
            // Can use binary search
            for (var i = 0; i < probabilities.length; i++) {
                var max = probabilities[i];
                if (random < max) {
                    return objects[i];
                }
            }
            throw "IMPOSSIBLE!!! THIS IS A BUG"
        }
    }
}
