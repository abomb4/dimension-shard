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
const bulletTypes = require('ds-common/bullet-types/index');

//
// I wrote so much code, just for the coolant multiplier, it's incorrect, so rewrite.
//

const purple = Color.valueOf("a108f5");
const laserColor1 = Color.valueOf("8700d188");
const laserColor2 = Color.valueOf("8700d1aa");
const laserColor3 = Color.valueOf("a108f54d");
const laserColor4 = Color.valueOf("a955d734");
const shootEffect = Fx.hitLancer;
const hitEffect = new Effect(12, cons(e => {
    Draw.color(purple);
    Lines.stroke(e.fout() * 1.5);

    Angles.randLenVectors(e.id, 8, e.finpow() * 17, e.rotation, 360, lib.floatc2((x, y) => {
        var ang = Mathf.angle(x, y);
        Lines.lineAngle(e.x + x, e.y + y, ang, e.fout() * 4 + 1);
    }));
}));
const chargeEffect = new Effect(90, 100, cons(e => {
    Draw.color(purple);
    Lines.stroke(e.fin() * 2);
    Lines.circle(e.x, e.y, 4 + e.fout() * 70);

    Draw.alpha(0.5);
    Fill.circle(e.x, e.y, e.fin() * 15);

    Draw.alpha(1);
    Angles.randLenVectors(e.id, 15, 30 * e.fout(), lib.floatc2((x, y) => {
        Fill.circle(e.x + x, e.y + y, e.fin() * 5);
    }));

    Draw.color(laserColor3);
    Fill.circle(e.x, e.y, e.fin() * 8);
}));
const chargeSound = lib.loadSound("dark-light-charge");
const loopSound = lib.loadSound("dark-light-loop");
const shootSound = lib.loadSound("dark-light-shoot");
const dragRadius = 9 * 8;
const dragPower = 3.8;

const lightningSound = lib.loadSound("dark-light-lightning");
const lightningSpacing = 45;
const lightningLength = 6;
const lightningLengthRand = 12;
const lightningDelay = 1.1;
const lightningAngleRand = 35;
const lightningDamage = 50;
const lightningColor = purple;

const firingMoveFract = 0.25;
const shootDuration = 60 * 5;

const turret = new JavaAdapter(PowerTurret, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
    load() {
        this.super$load();
        this.baseRegion = lib.loadRegion('dark-light-base');
    },
    init() {
        this.consumes.powerCond(this.powerUse, boolf(entity => entity.getBullet() != null || entity.target != null));
        this.super$init();
    },
    setStats() {
        this.super$setStats();
        this.stats.remove(Stat.booster);
        const block = this;
        this.stats.add(Stat.input, new JavaAdapter(StatValue, {
            display(table) {
                const multiplier = block.coolantMultiplier;
                table.row();
                table.table(cons(c => {
                    const len = Vars.content.liquids().size;
                    for (var i = 0; i < len; i++) {
                        var liquid = Vars.content.liquids().get(i);
                        if (!block.consumes.liquidfilters.get(liquid.id)) {
                            continue;
                        }
                        ((liquid, c) => {
                            c.image(liquid.icon(Cicon.medium)).size(3 * 8).padRight(4).right().top();
                            c.add(liquid.localizedName).padRight(10).left().top();
                            c.table(Tex.underline, cons(bt => {
                                bt.left().defaults().padRight(3).left();
                                var result = (1 + (liquid.heatCapacity - Liquids.water.heatCapacity) * multiplier)
                                bt.add(Core.bundle.format("bullet.reload", Strings.autoFixed(result, 2)));
                            })).left().padTop(-9);
                            c.row();
                        })(liquid, c);
                    }
                })).colspan(table.getColumns());
                table.row();
            },
        }));
        this.stats.remove(Stat.damage);
        this.stats.add(Stat.damage, this.shootType.damage * 60 / 5, StatUnit.perSecond);
        this.stats.add(Stat.cooldownTime, this.reloadTime / 60 + " + " + Strings.autoFixed(this.chargeTime / 60, 2) + " s", [null]);
        this.stats.add(Stat.lightningDamage, (lightningDamage), StatUnit.none);
    },
    getTr() { return this.tr; },
    getTr2() { return this.tr2; },
}, 'dark-light');

turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.liquidCapacity = 30;
turret.range = 40 * 8;
turret.shootCone = 8;
turret.canOverdrive = false;
turret.chargeTime = 85;
turret.chargeMaxDelay = 0;
turret.chargeEffects = 0;
turret.chargeSound = chargeSound;
turret.recoilAmount = 2;
turret.reloadTime = 60 * 7.5;
turret.cooldown = 0.04;
turret.powerUse = 90;
turret.shootShake = 3;
turret.shootEffect = shootEffect;
turret.smokeEffect = Fx.none;
turret.chargeEffect = chargeEffect;
turret.chargeBeginEffect = chargeEffect;
turret.heatColor = Color.valueOf("a955f7");;
turret.size = 5;
turret.health = 6000;
turret.shootSound = shootSound;
turret.loopSound = loopSound;
turret.loopSoundVolume = 1;
turret.consumes.add(new ConsumeLiquidFilter(boolf(liquid => liquid.temperature <= 0.5 && liquid.flammability < 0.1), 1)).update(false);
turret.coolantMultiplier = 0.5;

turret.requirements = ItemStack.with(
    Items.copper, 2100,
    Items.lead, 3000,
    Items.graphite, 1800,
    Items.silicon, 1400,
    Items.phaseFabric, 850,
    Items.surgeAlloy, 1150,
    items.spaceCrystal, 1200,
    items.timeCrystal, 400,
    items.hardThoriumAlloy, 850,
    items.dimensionAlloy, 375
);

const Call_DarkLightShot = (() => {
    const TYPE = lib.modName + '-DarkLightShot';
    const DELIMITER = ', ';

    function makePackage(tilePos) {
        const datas = tilePos;
        return datas;
    }

    /**
     * Read packet to objects
     *
     * @param {string} str the packet
     * @returns {{tilePos: number, launchCountBefore: number}}
     */
    function readPackage(str) {
        const datas = str.split(DELIMITER);
        const tilePos = datas[0];
        return {
            tilePos: tilePos
        };
    }

    var inited = false;
    function init() {
        if (inited) { return; }
        /** Client receives skill active packet, deal self */
        if (Vars.netClient) {
            Vars.netClient.addPacketHandler(TYPE, cons(pack => {
                const info = readPackage(pack);
                const tile = Vars.world.tile(info.tilePos)
                if (tile.block() == turret) {
                    const building = tile.build;
                    building.serverShooting();
                }
            }));
        }
    }
    Events.on(ClientLoadEvent, cons(e => {
        init();
    }));
    return (tilePos) => {
        const pack = makePackage(tilePos);
        // Send to EVERY client if i'm server
        Call.clientPacketReliable(TYPE, pack);
    }
})();

turret.shootType = (() => {
    const darkLightFreeze = new StatusEffect("cannotMove");
    darkLightFreeze.speedMultiplier = 0;
    darkLightFreeze.effect = Fx.none;

    const rect = new Rect();
    const tr = new Vec2();
    const tr2 = new Vec2();
    const bt = new JavaAdapter(ContinuousLaserBulletType, {
        update(b) {
            var length = Damage.findLaserLength(b, this.length);
            if (b.timer.get(1, 2)) {
                // Drag them
                // calculate them
                tr.trns(b.rotation(), length);
                rect.setPosition(b.x, b.y).setSize(tr.x, tr.y);

                if (rect.width < 0) {
                    rect.x += rect.width;
                    rect.width *= -1;
                }

                if (rect.height < 0) {
                    rect.y += rect.height;
                    rect.height *= -1;
                }

                var expand = dragRadius * 1.4;

                rect.y -= expand;
                rect.x -= expand;
                rect.width += expand * 2;
                rect.height += expand * 2;

                function rotate(ox, oy, nx, ny, rotation) {
                    tr2.set(nx, ny).sub(ox, oy).rotate(-rotation);
                    return [tr2.x, tr2.y];
                }

                function dragPowerPercent(dst, radius) {
                    var scaled = Interp.sineOut.apply(1 - dst / radius);
                    return scaled;
                }
                Units.nearbyEnemies(b.team, rect, ((length, b) => cons(u => {
                    var rotation = b.rotation();
                    var xy = rotate(b.x, b.y, u.x, u.y, rotation);
                    var x = xy[0];
                    var y = xy[1];
                    var absY = Math.abs(y);
                    if (x < 0 || x > length || absY > dragRadius) {
                        return;
                    }
                    // drag to the line
                    var power = dragPowerPercent(absY, dragRadius);
                    var angle = y > 0 ? rotation - 90 : rotation + 90;
                    Tmp.v3.trns(angle, 80).scl(dragPower * power);
                    // var realPower = Tmp.v3.len() / u.mass();
                    // print('pre power: ' + Tmp.v3.len() + ', real power: ' + realPower);
                    // // If too close, stop it moving
                    // if (absY < 3 && realPower > u.type.speed) {
                    //     print('stop moving: ' + u + ', u.type.speed: ' + u.type.speed + ', realPower: ' + realPower);
                    //     u.vel.limit(0);
                    //     u.apply(darkLightFreeze, 3);
                    // } else {
                        u.impulse(Tmp.v3);
                        u.vel.limit(absY);
                    // }


                }))(length, b));
            }

            if (b.timer.get(2, 5)) {
                Damage.collideLine(b, b.team, this.hitEffect, b.x, b.y, b.rotation(), this.length, this.largeHit);
            }

            if (lightningSpacing > 0 && b.timer.get(3, 59)) {
                var idx = 0;
                var rot = b.rotation();
                // lightningSound.at(b.x + Angles.trnsx(rot, length / 2), b.y + Angles.trnsy(rot, length / 2));
                for (var i = (lightningSpacing + Mathf.random(lightningSpacing)) / 2;
                    i <= length; i += lightningSpacing) {
                    var cx = b.x + Angles.trnsx(rot, i),
                        cy = b.y + Angles.trnsy(rot, i);

                    var f = idx++;

                    for (var s of Mathf.signs) {
                        ((b, s, cx, cy, rot) => {
                            Time.run(f * lightningDelay, run(() => {
                                if (b.isAdded() && b.type == this) {
                                    Lightning.create(b, lightningColor, lightningDamage,
                                        cx, cy, rot + 90 * s + Mathf.range(lightningAngleRand),
                                        lightningLength + Mathf.random(lightningLengthRand));
                                }
                            }));
                        })(b, s, cx, cy, rot);
                    }
                }
            }

            if (this.shake > 0) {
                Effect.shake(this.shake, this.shake, b);
            }
        }
    }, 100);
    bt.shake = 1.5;
    bt.largeHit = true;
    bt.shootEffect = Fx.none;
    bt.hitEffect = hitEffect;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.none;
    // bt.status = StatusEffects.sapped;
    bt.statusDuration = 120;
    bt.length = 42 * 8;
    bt.width = 12;
    bt.width = 12;
    bt.incendChance = 0;
    bt.colors[0] = laserColor1;
    bt.colors[1] = laserColor2;
    bt.colors[2] = laserColor3;
    bt.colors[3] = laserColor4;
    bt.hitColor = bt.colors[2];
    bt.lightColor = bt.colors[2];
    bt.lenscales[1] = 1.1;
    bt.lenscales[2] = 1.12;
    bt.lenscales[3] = 1.16;
    return bt;
})();

lib.setBuildingSimple(turret, PowerTurret.PowerTurretBuild, block => ({
    _bullet: null,
    bulletLife: 0,
    getBullet() {
        return this._bullet;
    },
    serverShooting() {
        this.shoot(this.peekAmmo());
        this.reload = this.block.reloadTime;
    },
    updateCooling() { },
    updateTile() {
        this.super$updateTile();
        if (this.bulletLife > 0 && this._bullet != null) {
            this.wasShooting = true;
            this.block.getTr().trns(this.rotation, this.block.shootLength, 0);
            this._bullet.rotation(this.rotation);
            this._bullet.set(this.x + this.block.getTr().x, this.y + this.block.getTr().y);
            this._bullet.time = 0;
            this.heat = 1;
            this.recoil = this.block.recoilAmount;
            this.bulletLife -= Time.delta / Math.max(this.efficiency(), 0.00001);
            if (this.bulletLife <= 0) {
                this._bullet = null;
            }
        } else if (this.reload > 0 && !this.charging) {
            this.wasShooting = true;
            var liquid = this.liquids.current();
            var maxUsed = this.block.consumes.get(ConsumeType.liquid).amount;

            var used = (this.cheating() ? maxUsed * Time.delta : Math.min(this.liquids.get(liquid), maxUsed * Time.delta)) * (1 + (liquid.heatCapacity - Liquids.water.heatCapacity) * this.block.coolantMultiplier);
            this.reload -= used;
            this.liquids.remove(liquid, used);

            if (Mathf.chance(0.06 * used)) {
                this.block.coolEffect.at(this.x + Mathf.range(this.block.size * Vars.tilesize / 2), this.y + Mathf.range(this.block.size * Vars.tilesize / 2));
            }
        }
    },
    updateShooting() {
        if (this.bulletLife > 0 && this._bullet != null) {
            return;
        }
        if (!Vars.netClient && this.reload <= 0 && (this.consValid() || this.cheating())) {
            var type = this.peekAmmo();
            Call_DarkLightShot(this.tile.pos());
            this.shoot(type);
            this.reload = this.block.reloadTime;
        }
    },
    turnToTarget(targetRot) {
        this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * this.block.rotateSpeed * this.delta() * (this.bulletLife > 0 ? firingMoveFract : 1));
    },
    bullet(type, angle) {
        const tr = this.block.getTr();
        this._bullet = type.create(this.tile.build, this.team, this.x + tr.x, this.y + tr.y, angle);
        this.bulletLife = shootDuration;
    },
    shouldActiveSound() {
        return this.bulletLife > 0 && this._bullet != null;
    },
    shouldTurn() {
        return !this.charging && !this.shouldActiveSound();
    },
}));

exports.darkLight = turret;
