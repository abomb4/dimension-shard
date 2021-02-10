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

const chanceDeflect = 10;
const deflectAngle = 60;
var deflectSound = Sounds.none;
const shieldColor = items.spaceCrystalColorLight;

function deflect(building, chanceDeflect, bullet) {
    //deflect bullets if necessary
    if (chanceDeflect > 0) {
        const { x, y, team, tile } = building;
        //slow bullets are not deflected
        if (bullet.vel.len() <= 0.1 || !bullet.type.reflectable) return false;

        //bullet reflection chance depends on bullet damage
        if (!Mathf.chance(chanceDeflect / bullet.damage)) return false;

        //make sound
        deflectSound.at(tile, Mathf.random(0.9, 1.1));

        //translate bullet back to where it was upon collision
        bullet.vel.x *= -1;
        bullet.vel.y *= -1;
        // Add a random angle
        bullet.vel.setAngle(Mathf.random(deflectAngle) - deflectAngle / 2 + bullet.vel.angle());

        bullet.owner = building;
        bullet.team = team;
        bullet.time = (bullet.time + 1);

        return true;
    }
    return false;
}

const block = new JavaAdapter(ForceProjector, {
    load() {
        this.super$load();
        deflectSound = Sounds.none;
    },
    setStats() {
        this.super$setStats();
        if (chanceDeflect > 0) this.stats.add(Stat.baseDeflectChance, chanceDeflect, StatUnit.none);
    },
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
}, 'deflect-force-projector');

block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.size = 3;
block.requirements = ItemStack.with(
    Items.lead, 120,
    Items.silicon, 150,
    Items.titanium, 100,
    Items.phaseFabric, 80,
    items.spaceCrystal, 40,
);

block.size = 3;
block.radius = 100;
block.phaseRadiusBoost = 100;
block.phaseShieldBoost = 500;
block.shieldHealth = 700;
block.cooldownNormal = 1.5;
block.cooldownLiquid = 1.2;
block.cooldownBrokenBase = 0.35;
block.consumes.item(items.spaceCrystal).boost();
block.consumes.power(12);

const shieldConsumer = (paramEntity) => cons(trait => {
    if (trait.team != paramEntity.team
        && trait.type.absorbable
        && Intersector.isInsideHexagon(paramEntity.x, paramEntity.y, paramEntity.realRadius() * 2, trait.x, trait.y)) {
        if (!deflect(paramEntity, chanceDeflect, trait)) {
            trait.absorb();
            Fx.absorb.at(trait);
        }
        paramEntity.hit = 1;
        paramEntity.buildup += trait.damage * paramEntity.warmup;
    }
});
lib.setBuildingSimple(block, ForceProjector.ForceBuild, block => ({

    updateTile() {
        const {
            consumes, shieldHealth, phaseShieldBoost, cooldownNormal, cooldownBrokenBase, cooldownLiquid, timerUse, phaseUseTime
        } = this.block;
        const {
            buildup, phaseHeat, broken, team, x, y, warmup
        } = this;

        var phaseValid = consumes.get(ConsumeType.item).valid(this);

        this.phaseHeat = Mathf.lerpDelta(this.phaseHeat, Mathf.num(phaseValid), 0.1);

        if (phaseValid && !this.broken && this.timer.get(timerUse, phaseUseTime) && this.efficiency() > 0) {
            this.consume();
        }

        this.radscl = Mathf.lerpDelta(this.radscl, this.broken ? 0 : this.warmup, 0.05);

        if (Mathf.chanceDelta(this.buildup / this.breakage * 0.1)) {
            Fx.reactorsmoke.at(this.x + Mathf.range(tilesize / 2), this.y + Mathf.range(tilesize / 2));
        }

        this.warmup = Mathf.lerpDelta(this.warmup, this.efficiency(), 0.1);

        if (this.buildup > 0) {
            var scale = !this.broken ? cooldownNormal : cooldownBrokenBase;
            var cons = consumes.get(ConsumeType.liquid);
            if (cons.valid(this)) {
                cons.update(this);
                scale *= (cooldownLiquid * (1 + (this.liquids.current().heatCapacity - 0.4) * 0.9));
            }

            this.buildup -= this.delta() * scale;
        }

        if (this.broken && this.buildup <= 0) {
            this.broken = false;
        }

        if(buildup >= shieldHealth + phaseShieldBoost * phaseHeat && !broken){
            this.broken = true;
            this.buildup = shieldHealth;
            // Fx.shieldBreak.at(x, y, this.realRadius(), team.color);
            Fx.shieldBreak.at(x, y, this.realRadius(), shieldColor);
        }

        if (this.hit > 0) {
            this.hit -= 1 / 5 * Time.delta;
        }

        var realRadius = this.realRadius();

        if (realRadius > 0 && !this.broken) {
            Groups.bullet.intersect(this.x - realRadius, this.y - realRadius, realRadius * 2, realRadius * 2, shieldConsumer(this));
        }
    },
    drawShield() {
        var x = this.x;
        var y = this.y;
        var hit = this.hit;
        if (!this.broken) {
            var radius = this.realRadius();
            Draw.z(Layer.shields);
            Draw.color(shieldColor, Color.white, Mathf.clamp(hit));
            if (Core.settings.getBool("animatedshields")) {
                Fill.poly(x, y, 6, radius);
            } else {
                Lines.stroke(1.5);
                Draw.alpha(0.09 + Mathf.clamp(0.08 * hit));
                Fill.poly(x, y, 6, radius);
                Draw.alpha(1);
                Lines.poly(x, y, 6, radius);
                Draw.reset();
            }
        }
        Draw.reset();
    },
}));

exports.deflectForceProjector = block;
