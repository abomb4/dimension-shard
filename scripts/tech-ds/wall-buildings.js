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

const lib = require('abomb4/lib');
const items = require('ds-common/items');

const dsGlobal = require('ds-common/ds-global');

var shardWall = extend(Wall, 'shard-phase-wall', {});
shardWall.size = 1;
shardWall.health = Blocks.phaseWall.health * (9 / 8);
shardWall.requirements = ItemStack.with(Items.phaseFabric, 4, items.dimensionShard, 2);
shardWall.buildVisibility = BuildVisibility.shown;
shardWall.category = Category.defense;
shardWall.buildCostMultiplier = 6.6;
shardWall.flashHit = true;
shardWall.chanceDeflect = Blocks.phaseWall.chanceDeflect * 1.2;

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

var wall = (() => {
    const armor = 5;
    const block = extend(Wall, 'hard-thorium-alloy-wall', {
        isHidden() { return !dsGlobal.techDsAvailable(); },
        setStats() {
            this.super$setStats();
            if (armor > 0) this.stats.add(Stat.abilities, lib.getMessage('stat', 'blockArmor', armor));
        },
    })
    lib.setBuildingSimple(block, Wall.WallBuild, block => ({
        damage(amount) {
            amount = Math.max(amount - armor, Vars.minArmorDamage * amount);
            this.super$damage(amount);
        },
    }));
    block.size = 1;
    block.health = 950;
    block.requirements = ItemStack.with(items.hardThoriumAlloy, 6);
    block.buildVisibility = BuildVisibility.shown;
    block.category = Category.defense;
    block.buildCostMultiplier = 6;
    return block;
})();

var wallLarge = (() => {
    const armor = 7;
    const block = extend(Wall, 'hard-thorium-alloy-wall-large', {
        isHidden() { return !dsGlobal.techDsAvailable(); },
        setStats() {
            this.super$setStats();
            if (armor > 0) this.stats.add(Stat.abilities, lib.getMessage('stat', 'blockArmor', armor));
        },
    })
    lib.setBuildingSimple(block, Wall.WallBuild, block => ({
        damage(amount) {
            amount = Math.max(amount - armor, Vars.minArmorDamage * amount);
            this.super$damage(amount);
        },
    }));
    block.size = 2;
    block.health = wall.health * 4;
    block.requirements = ItemStack.mult(wall.requirements, 4);
    block.buildVisibility = wall.buildVisibility;
    block.category = wall.category;
    block.buildCostMultiplier = wall.buildCostMultiplier;
    return block;
})();

exports.hardThoriumAlloyWall = wall;
exports.hardThoriumAlloyWallLarge = wallLarge;
