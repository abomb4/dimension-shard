const lib = require('abomb4/lib');
const items = require('ds-common/items');

var shardWall = extend(Wall, 'shard-phase-wall', {});
shardWall.size = 1;
shardWall.health = Blocks.phaseWall.health * (9 / 8);
shardWall.requirements = ItemStack.with(Items.phaseFabric, 6, items.dimensionShard, 6);
shardWall.buildVisibility = BuildVisibility.shown;
shardWall.category = Category.defense;
shardWall.buildCostMultiplier = 6.5;
shardWall.flashHit = true;
shardWall.chanceDeflect = Blocks.phaseWall.chanceDeflect * 2;

var shardWallLarge = extend(Wall, 'shard-phase-wall-large', {});
shardWallLarge.size = 2;
shardWallLarge.health = shardWall.health * 4;
shardWallLarge.requirements = ItemStack.mult(shardWall.requirements, 4);
shardWallLarge.buildVisibility = shardWall.buildVisibility;
shardWallLarge.category = shardWall.category;
shardWallLarge.buildCostMultiplier = shardWall.buildCostMultiplier;
shardWallLarge.flashHit = shardWall.flashHit;
shardWallLarge.chanceDeflect = shardWall.chanceDeflect;

exports.shardPhaseWall = shardWall;
exports.shardPhaseWallLarge = shardWallLarge;

lib.addToResearch(shardWall, { parent: 'phase-wall-large' });
lib.addToResearch(shardWallLarge, { parent: shardWall.name });

var wall = extend(Wall, 'hard-thorium-alloy-wall', {});
wall.size = 1;
wall.health = 1100;
wall.requirements = ItemStack.with(items.hardThoriumAlloy, 6);
wall.buildVisibility = BuildVisibility.shown;
wall.category = Category.defense;
wall.buildCostMultiplier = 6.2;

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
