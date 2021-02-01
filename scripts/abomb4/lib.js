// Copyright (C) 2020 abomb4
//
// This file is part of Dimension Shard.
//
// Dimension Shard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dimension Shard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dimension Shard.  If not, see <http://www.gnu.org/licenses/>.


exports.modName = "dimension-shard";

exports.mod = Vars.mods.locateMod(exports.modName);

exports.loadSound = (() => {
    const cache = {};
    return (path) => {
        const c = cache[path];
        if (c === undefined) {
            return cache[path] = Vars.mods.scripts.loadSound(path);
        }
        return c;
    }
})();

exports.newEffect = (lifetime, renderer) => new Effect(lifetime, cons(renderer));

exports.cons2 = (func) => new Cons2({ get: (v1, v2) => func(v1, v2) });
exports.floatc2 = (func) => new Floatc2({ get: (v1, v2) => func(v1, v2) });
exports.boolf2 = (func) => new Boolf2({ get: (v1, v2) => func(v1, v2) });
exports.func = (getter) => new Func({ get: getter });
exports.raycaster = (func) => new World.Raycaster({ accept: func });
exports.intc = (func) => new Intc({ get: func });
exports.intc2 = (func) => new Intc2({ get: func });
exports.floatf = (func) => new Floatf({ get: func });

exports.loadRegion = (name) => Vars.headless ? null : Core.atlas.find(exports.modName + '-' + name, Core.atlas.find("clear"));
exports.int = (v) => new java.lang.Integer(v);

/**
 * Get message from bundle, 'type.mod-name.key'
 * @param {string} type the prefix such as block, unit, mech
 * @param {string} key  the suffix
 * @param {string} msgs  messages
 */
exports.getMessage = (type, key, msgs) =>
    Vars.headless
        ? ''
        : Core.bundle.format(type + "." + exports.modName + "." + key, msgs || []);

/** Cannot use java.lang.reflect.Array, but Arrays.copyOf available! Lucky! */
exports.createUnitPlan = (unitFrom, unitTo) => {
    var a = java.util.Arrays.copyOf(Blocks.tetrativeReconstructor.upgrades.get(0), 2);
    a[0] = unitFrom;
    a[1] = unitTo;
    return a;
}

/**
 * Add content to research tree
 *
 * @param {Content} content Such as Block, Turret
 * @param {{parent: string, requirements: ItemStack[], objectives: Seq<Objective>}} research
 *        Research Info is an object with parent and requirements
 */
exports.addToResearch = (content, research) => {
    if (!content) {
        throw new Error('content is null!');
    }
    if (!research.parent) {
        throw new Error('research.parent is empty!');
    }
    var researchName = research.parent;
    var customRequirements = research.requirements;
    var objectives = research.objectives;

    var lastNode = TechTree.all.find(boolf(t => t.content == content));
    if (lastNode != null) {
        lastNode.remove();
    }

    var node = new TechTree.TechNode(null, content, customRequirements !== undefined ? customRequirements : content.researchRequirements());
    var currentMod = exports.mod;
    if (objectives) {
        node.objectives.addAll(objectives);
    }

    if (node.parent != null) {
        node.parent.children.remove(node);
    }

    // find parent node.
    var parent = TechTree.all.find(boolf(t => t.content.name.equals(researchName) || t.content.name.equals(currentMod.name + "-" + researchName)));

    if (parent == null) {
        throw new Error("Content '" + researchName + "' isn't in the tech tree, but '" + content.name + "' requires it to be researched.");
    }

    // add this node to the parent
    if (!parent.children.contains(node)) {
        parent.children.add(node);
    }
    // reparent the node
    node.parent = parent;
};
/** An objective */
exports.objectivePlanetaryTerminalActivated = (() => {
    const SETTING_KEY = 'planetary-terminal-activated';
    const objective = new Objectives.Objective({
        complete() { return Core.settings.getBool(SETTING_KEY, false); },
        display() { return exports.getMessage("msg", "planetaryTerminalActivated"); }
    });
    function contentUnlocked(content) {
        if (typeof content.unlocked === "boolean") {
            return content.unlocked;
        } else {
            return content.unlocked();
        }
    }
    Events.run(Trigger.acceleratorUse, run(() => {
        // Control.java void checkAutoUnlcoks
        if (Vars.net.client()) return;
        Core.settings.put(SETTING_KEY, true)
        TechTree.all.each(cons(node => {
            if (!contentUnlocked(node.content) && node.requirements.length == 0 && !node.objectives.contains(boolf(o => !o.complete()))) {
                node.content.unlock();
            }
        }));
    }));
    return objective;
})();

/**
 * lib.setBuilding(extend(CoreBlock, "my-core", {}), () => extend(CoreBlock.CoreBuilding, {}))
 *
 * @param {Block} blockType The block type
 * @param {(block: Block) => Building} buildingCreator
 *        A function receives block type, return Building instance;
 *        don't use prov (this function will use prov once)
 */
exports.setBuilding = function (blockType, buildingCreator) {
    blockType.buildType = prov(() => buildingCreator(blockType));
}

/**
 * lib.setBuildingSimple(extend(CoreBlock, "my-core", {}), CoreBlock.CoreBuilding, block => {})
 *
 * @param {Block} blockType The block type
 * @param {Class<Building>} buildingType The building type
 * @param {() => Object} overridesGetter Object that as second parameter of extend()
 */
exports.setBuildingSimple = function (blockType, buildingType, overridesGetter) {
    blockType.buildType = prov(() => new JavaAdapter(buildingType, overridesGetter(blockType), blockType));
}

/** Random item picker, use add() to add items with integer probability */
exports.createProbabilitySelector = function () {
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
        random: function () {
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

/**
 * Damage line, three modes:
 * - "normal": Normal laser
 * - "pierce":Ignore plastic wall
 * - "blocking":Block by any enemy
 */
exports.damageLine = (() => {
    var tr = new Vec2();
    var collidedBlocks = new IntSet();
    var seg1 = new Vec2();
    var seg2 = new Vec2();
    var rect = new Rect();
    var units = new Seq();
    var hitrect = new Rect();
    return (hitter, team, effect, x, y, angle, length, large, mode) => {
        if (!mode || (mode != "pierce" && mode != "blocking")) {
            mode = "normal";
        }
        if (mode == "normal") {
            Damage.collideLine(hitter, team, effect, x, y, angle, length, large);
        } else if (mode == "blocking") {
            // TODO
            // Tmp.v1.trns(hitter.rotation(), length);
            // // Find block
            // var building;
            // var buildingFound = Vars.world.raycast(b.tileX(), b.tileY(), World.toTile(b.x + Tmp.v1.x), World.toTile(b.y + Tmp.v1.y),
            //     this.raycaster((x, y) => { (building = Vars.world.tile(x, y)) != null && building.team() != b.team }));
            // var dstBuilding = buildingFound ? Tmp.v2.set(x, y).dst(building) : Infinity;
            // // Find unit
        } else {
            collidedBlocks.clear();
            tr.trns(angle, length);
            var collider = exports.intc2((cx, cy) => {
                var tile = Vars.world.build(cx, cy);
                var collide = tile != null && collidedBlocks.add(tile.pos());
                if (hitter.damage > 0) {
                    var health = !collide ? 0 : tile.health;
                    if (collide && tile.team != team && tile.collide(hitter)) {
                        tile.collision(hitter);
                        hitter.type.hit(hitter, tile.x, tile.y);
                    }

                    if (collide && hitter.type.testCollision(hitter, tile)) {
                        hitter.type.hitTile(hitter, tile, health, false);
                    }
                }
            });

            if (hitter.type.collidesGround) {
                seg1.set(x, y);
                seg2.set(seg1).add(tr);
                Vars.world.raycastEachWorld(x, y, seg2.x, seg2.y, exports.raycaster((cx, cy) => {
                    collider.get(cx, cy);
                    for (var p of Geometry.d4) {
                        var other = Vars.world.tile(p.x + cx, p.y + cy);
                        if (other != null && (large || Intersector.intersectSegmentRectangle(seg1, seg2, other.getBounds(Tmp.r1)))) {
                            collider.get(cx + p.x, cy + p.y);
                        }
                    }
                    return false;
                }));
            }

            rect.setPosition(x, y).setSize(tr.x, tr.y);
            var x2 = tr.x + x;
            var y2 = tr.y + y;
            if (rect.width < 0) {
                rect.x += rect.width;
                rect.width *= -1;
            }

            if (rect.height < 0) {
                rect.y += rect.height;
                rect.height *= -1;
            }

            const expand = 3;
            rect.y -= expand;
            rect.x -= expand;
            rect.width += expand * 2;
            rect.height += expand * 2;

            var con = cons(e => {
                e.hitbox(hitrect);

                var vec = Geometry.raycastRect(x, y, x2, y2, hitrect.grow(expand * 2));

                if (vec != null && hitter.damage > 0) {
                    effect.at(vec.x, vec.y);
                    e.collision(hitter, vec.x, vec.y);
                    hitter.collision(e, vec.x, vec.y);
                }
            });

            units.clear();

            Units.nearbyEnemies(team, rect, cons(u => {
                if (u.checkTarget(hitter.type.collidesAir, hitter.type.collidesGround)) {
                    units.add(u);
                }
            }));

            units.sort(exports.floatf(u => u.dst2(hitter)));
            units.each(con);
        }
    }
})();
