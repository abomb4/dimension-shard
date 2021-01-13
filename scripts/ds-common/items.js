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

const floatc2 = (func) => new Floatc2({ get: (v1, v2) => func(v1, v2) });
exports.dimensionShardColor = Color.valueOf("165282");
exports.dimensionShardColorLight = Color.valueOf("719ec1");
exports.dimensionShard = (() => {
    const v = new Item("dimension-shard", exports.dimensionShardColor);
    v.explosiveness = 0.2;
    v.hardness = 5;
    v.radioactivity = 1.4;
    v.cost = 1;

    const ore = new OreBlock(v);
    ore.oreDefault = true;
    ore.oreThreshold = 0.92;
    ore.oreScale = 26;
    return v;
})();
exports.fxDimensionShardExplosion = new Effect(24, cons(e => {
    Draw.color(exports.dimensionShardColorLight);

    e.scaled(7, cons(i => {
        Lines.stroke(3 * i.fout());
        Lines.circle(e.x, e.y, 3 + i.fin() * 24);
    }));

    Draw.color(Color.gray);

    Angles.randLenVectors(e.id, 7, 2 + 28 * e.finpow(), floatc2((x, y) => {
        Fill.circle(e.x + x, e.y + y, e.fout() * 4 + 0.5);
    }));

    Draw.color(exports.dimensionShardColor);
    Lines.stroke(1 * e.fout());

    Angles.randLenVectors(e.id + 1, 4, 1 + 25 * e.finpow(), floatc2((x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 3);
    }));
}));

exports.spaceCrystalColor = Color.valueOf("4064e9");
exports.spaceCrystalColorLight = Color.valueOf("92a2dc");
exports.spaceCrystal = (() => {
    const v = new Item("space-crystal", exports.spaceCrystalColor);
    v.explosiveness = 0.5;
    v.hardness = 6;
    v.cost = 1;
    return v;
})();

exports.timeCrystal = (() => {
    const v = new Item("time-crystal", Color.valueOf("9b3db0"));
    v.hardness = 7;
    v.radioactivity = 0.7;
    v.cost = 1;
    return v;
})();

exports.hardThoriumAlloyColor = Color.valueOf("993a3a");
exports.hardThoriumAlloyColorLight = Color.valueOf("d97368");
exports.hardThoriumAlloy = (() => {
    const v = new Item("hard-thorium-alloy", exports.hardThoriumAlloyColor);
    v.hardness = 8;
    v.radioactivity = 0.8;
    v.cost = 1.1;
    return v;
})();

exports.dimensionAlloyColor = Color.valueOf("20c0d6");
exports.dimensionAlloyColorLight = Color.valueOf("69dcee");
exports.dimensionAlloy = (() => {
    const v = new Item("dimension-alloy", exports.dimensionAlloyColor);
    v.hardness = 12;
    v.cost = 1.2;
    return v;
})();


exports.timeFreezingEffect = (() => {
    const fxTimeFreezing = new Effect(40, cons(e => {
        Draw.color(Color.valueOf("5b2467"));

        Angles.randLenVectors(e.id, 2, 1 + e.fin() * 2, new Floatc2({ get: (x, y) => {
            Fill.circle(e.x + x, e.y + y, e.fout() * 1.2);
        }}));
    }));

    const v = new JavaAdapter(StatusEffect, {
    }, "time-freezing");

    v.color = Color.valueOf("6ecdec");
    v.speedMultiplier = 0.4;
    v.effect = fxTimeFreezing;

    v.init(run(() => {
        v.opposite(StatusEffects.melting, StatusEffects.burning);
    }));

    return v;
})();

exports.timeFlow = (() => {
    const v = new Liquid("time-flow", Color.valueOf("a76ab3"));
    v.heatCapacity = 2;
    v.temperature = 0.1;
    v.viscosity = 0.85;
    v.effect = exports.timeFreezingEffect;
    v.lightColor = Color.valueOf("a76ab333");
    return v;
})();

exports.ionBurningEffect = (() => {
    const fxIonBurning = new Effect(35, cons(e => {
        Draw.color(Color.valueOf("cee0e9"));

        Lines.stroke(0.3 + e.fout() * 0.5);

        Angles.randLenVectors(e.id, 5, e.fin() * 22, new Floatc2({ get: (x, y) => {
            var ang = Mathf.angle(x, y);
            Lines.lineAngle(e.x + x, e.y + y, ang, e.fin() * 0.5 + 1);
        }}));
    }));

    const v = new JavaAdapter(StatusEffect, {
    }, "ion-burning");

    v.color = Color.valueOf("cee0e9");
    v.damage = 0.6;
    v.healthMultiplier = 0.75;
    v.effect = fxIonBurning;

    v.init(run(() => {
        v.opposite(StatusEffects.wet, StatusEffects.freezing, exports.timeFreezingEffect);
    }));

    return v;
})();
exports.ionLiquid = (() => {
    const v = new Liquid("ion-liquid", Color.valueOf("cee0e9"));
    v.heatCapacity = 2;
    v.temperature = 2;
    v.flammability = 2;
    v.explosiveness = 3;
    v.viscosity = 0.3;
    v.lightColor = Color.valueOf("cee0e988");
    v.effect = exports.ionBurningEffect;
    return v;
})();
