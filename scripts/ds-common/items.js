
exports.dimensionShardColor = Color.valueOf("165282");
exports.dimensionShardColorLight = Color.valueOf("719ec1");
exports.dimensionShard = (() => {
    const v = new Item("dimension-shard", exports.dimensionShardColor);
    v.explosiveness = 0.2;
    v.hardness = 5;
    v.radioactivity = 1.8;
    v.cost = 1;

    const ore = new OreBlock(v);
    ore.oreDefault = true;
    ore.oreThreshold = 0.92;
    ore.oreScale = 26;
    return v;
})();

exports.spaceCrystalColor = Color.valueOf("4064e9");
exports.spaceCrystalColorLight = Color.valueOf("92a2dc");
exports.spaceCrystal = (() => {
    const v = new Item("space-crystal", exports.spaceCrystalColor);
    v.explosiveness = 0.5;
    v.hardness = 6;
    v.radioactivity = 0.8;
    v.cost = 1;
    return v;
})();

exports.timeCrystal = (() => {
    const v = new Item("time-crystal", Color.valueOf("9b3db0"));
    v.hardness = 7;
    v.radioactivity = 0.2;
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
    v.radioactivity = 1.2;
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
    const v = new Liquid("time-flow", Color.valueOf("5b2467"));
    v.heatCapacity = 2;
    v.temperature = 0.1;
    v.viscosity = 0.85;
    v.effect = exports.timeFreezingEffect;
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
    v.effect = exports.ionBurningEffect;
    return v;
})();
