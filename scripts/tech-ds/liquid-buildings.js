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

let hardThoriumConduit = extend(ArmoredConduit, 'hard-thorium-conduit', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
            return;
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
hardThoriumConduit.buildVisibility = BuildVisibility.shown;
hardThoriumConduit.size = 1;
hardThoriumConduit.health = 300;
hardThoriumConduit.liquidCapacity = 24;
hardThoriumConduit.liquidPressure = 1.05;
hardThoriumConduit.requirements = ItemStack.with(
    Items.metaglass, 4,
    Items.plastanium, 2,
    items.hardThoriumAlloy, 2
);
hardThoriumConduit.category = Category.liquid;

lib.setBuildingSimple(hardThoriumConduit, ArmoredConduit.ArmoredConduitBuild, block => ({
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            let ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            let fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            let flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                let fx = (this.x + next.x) / 2.0;
                let fy = (this.y + next.y) / 2.0;
                let other = next.liquids.current();
                // There was flammability logics, removed
                if ((liquid.temperature > hotLine && other.temperature < coldLine) || (other.temperature > hotLine && liquid.temperature < coldLine)) {
                    this.liquids.remove(liquid, Math.min(this.liquids.get(liquid), hotLine * Time.delta));
                    if (Mathf.chance(0.2 * Time.delta)) {
                        Fx.steam.at(fx, fy);
                    }
                }
            }
        }
    }
}));

exports.hardThoriumConduit = hardThoriumConduit;


let hardThoriumLiquidRouter = extend(LiquidRouter, 'hard-thorium-liquid-router', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
hardThoriumLiquidRouter.buildVisibility = BuildVisibility.shown;
hardThoriumLiquidRouter.size = 1;
hardThoriumLiquidRouter.health = 300;
hardThoriumLiquidRouter.liquidCapacity = 30;
hardThoriumLiquidRouter.requirements = ItemStack.with(
    Items.graphite, 12,
    Items.metaglass, 6,
    Items.plastanium, 3,
    items.hardThoriumAlloy, 3
);
hardThoriumLiquidRouter.category = Category.liquid;

lib.setBuildingSimple(hardThoriumLiquidRouter, LiquidRouter.LiquidRouterBuild, block => ({
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            let ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            let fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            let flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                let fx = (this.x + next.x) / 2.0;
                let fy = (this.y + next.y) / 2.0;
                let other = next.liquids.current();
                // There was flammability logics, removed
                if ((liquid.temperature > hotLine && other.temperature < coldLine) || (other.temperature > hotLine && liquid.temperature < coldLine)) {
                    this.liquids.remove(liquid, Math.min(this.liquids.get(liquid), hotLine * Time.delta));
                    if (Mathf.chance(0.2 * Time.delta)) {
                        Fx.steam.at(fx, fy);
                    }
                }
            }
        }
    }
}));

exports.hardThoriumLiquidRouter = hardThoriumLiquidRouter;


let spaceLiquidTank = extend(LiquidRouter, 'space-liquid-tank', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
spaceLiquidTank.buildVisibility = BuildVisibility.shown;
spaceLiquidTank.size = 3;
spaceLiquidTank.health = 1400;
spaceLiquidTank.liquidCapacity = Blocks.liquidTank.liquidCapacity * 5;
spaceLiquidTank.requirements = ItemStack.with(
    Items.metaglass, 150,
    Items.plastanium, 75,
    items.spaceCrystal, 30,
    items.hardThoriumAlloy, 50
);
spaceLiquidTank.category = Category.liquid;

lib.setBuildingSimple(spaceLiquidTank, LiquidRouter.LiquidRouterBuild, block => ({
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            let ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            let fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            let flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                let fx = (this.x + next.x) / 2.0;
                let fy = (this.y + next.y) / 2.0;
                let other = next.liquids.current();
                // There was flammability logics, removed
                if ((liquid.temperature > hotLine && other.temperature < coldLine) || (other.temperature > hotLine && liquid.temperature < coldLine)) {
                    this.liquids.remove(liquid, Math.min(this.liquids.get(liquid), hotLine * Time.delta));
                    if (Mathf.chance(0.2 * Time.delta)) {
                        Fx.steam.at(fx, fy);
                    }
                }
            }
        }
    }
}));

exports.spaceLiquidTank = spaceLiquidTank;

let spacePump = extend(Pump, 'space-pump', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
spacePump.buildVisibility = BuildVisibility.shown;
spacePump.size = 3;
spacePump.health = 500;
spacePump.liquidCapacity = Blocks.thermalPump.liquidCapacity * 2;
spacePump.requirements = ItemStack.with(
    Items.copper, 100,
    Items.metaglass, 120,
    Items.plastanium, 45,
    items.spaceCrystal, 60,
    items.hardThoriumAlloy, 50
);
spacePump.category = Category.liquid;
spacePump.pumpAmount = 0.3;
spacePump.consumes.power(2.8);
spacePump.hasPower = true;
exports.spacePump = spacePump;
