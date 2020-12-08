const lib = require('abomb4/lib');
const items = require('ds-common/items');

const dsGlobal = require('ds-common/ds-global');

var hardThoriumConduit = extend(ArmoredConduit, 'hard-thorium-conduit', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
hardThoriumConduit.buildVisibility = BuildVisibility.shown;
hardThoriumConduit.size = 1;
hardThoriumConduit.health = 300;
hardThoriumConduit.liquidPressure = 1.05;
hardThoriumConduit.requirements = ItemStack.with(
    Items.metaglass, 4,
    Items.plastanium, 2,
    items.hardThoriumAlloy, 2
);
hardThoriumConduit.category = Category.liquid;

lib.setBuildingSimple(hardThoriumConduit, ArmoredConduit.ArmoredConduitBuild, {
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            var ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            var fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            var flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                var fx = (this.x + next.x) / 2.0;
                var fy = (this.y + next.y) / 2.0;
                var other = next.liquids.current();
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
});

exports.hardThoriumConduit = hardThoriumConduit;


var hardThoriumLiquidRouter = extend(LiquidRouter, 'hard-thorium-liquid-router', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
hardThoriumLiquidRouter.buildVisibility = BuildVisibility.shown;
hardThoriumLiquidRouter.size = 1;
hardThoriumLiquidRouter.health = 300;
hardThoriumLiquidRouter.liquidCapacity = 20;
hardThoriumLiquidRouter.requirements = ItemStack.with(
    Items.graphite, 12,
    Items.metaglass, 6,
    Items.plastanium, 3,
    items.hardThoriumAlloy, 3
);
hardThoriumLiquidRouter.category = Category.liquid;

lib.setBuildingSimple(hardThoriumLiquidRouter, LiquidRouter.LiquidRouterBuild, {
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            var ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            var fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            var flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                var fx = (this.x + next.x) / 2.0;
                var fy = (this.y + next.y) / 2.0;
                var other = next.liquids.current();
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
});

exports.hardThoriumLiquidRouter = hardThoriumLiquidRouter;


var spaceLiquidTank = extend(LiquidRouter, 'space-liquid-tank', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
spaceLiquidTank.buildVisibility = BuildVisibility.shown;
spaceLiquidTank.size = 3;
spaceLiquidTank.health = 1400;
spaceLiquidTank.liquidCapacity = Blocks.liquidTank.liquidCapacity * 3;
spaceLiquidTank.requirements = ItemStack.with(
    Items.metaglass, 150,
    Items.plastanium, 75,
    items.spaceCrystal, 30,
    items.hardThoriumAlloy, 50
);
spaceLiquidTank.category = Category.liquid;

lib.setBuildingSimple(spaceLiquidTank, LiquidRouter.LiquidRouterBuild, {
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            var ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            var fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            var flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                var fx = (this.x + next.x) / 2.0;
                var fy = (this.y + next.y) / 2.0;
                var other = next.liquids.current();
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
});

exports.spaceLiquidTank = spaceLiquidTank;
