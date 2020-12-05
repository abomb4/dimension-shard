/*
 * WHY NOT JSON? Because I cannot sort json items.
 */

const lib = require('abomb4/lib');
const items = require('ds-common/items');

var wall = extend(Wall, 'hard-thorium-alloy-wall', {});
wall.size = 1;
wall.health = 1100;
wall.requirements = ItemStack.with(items.hardThoriumAlloy, 3);
wall.buildVisibility = BuildVisibility.shown;
wall.category = Category.defense;
wall.buildCostMultiplier = 14;

var wallLarge = extend(Wall, 'hard-thorium-alloy-wall-large', {});
wallLarge.size = 2;
wallLarge.health = wall.health * 4;
wallLarge.requirements = ItemStack.mult(wall.requirements, 4);
wallLarge.buildVisibility = wall.buildVisibility;
wallLarge.category = wall.category;
wallLarge.buildCostMultiplier = wall.buildCostMultiplier;

exports.hardThoriumAlloyWall = wall;
exports.hardThoriumAlloyWallLarge = wallLarge;

lib.addToResearch(wall, { parent: 'thorium-wall-large' });
lib.addToResearch(wallLarge, { parent: wall.name });
