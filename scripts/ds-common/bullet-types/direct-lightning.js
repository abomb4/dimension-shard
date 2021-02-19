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

const createDirectLightning = (() => {
    const random = new Rand();
    const rect = new Rect();
    const entities = new Seq();
    const hit = new IntSet();
    const maxChain = 8;
    const hitRange = 30;
    var bhit = false;
    var lastSeed = 0;

    return (hitter, team, color, damage, x, y, rotation, length) => {

        const originRotation = rotation;
        const originX = x;
        const originY = y;
        const seed = lastSeed++;

        random.setSeed(seed);
        hit.clear();

        var hitCreate = hitter == null || hitter.type.lightningType == null ? Bullets.damageLightning : hitter.type.lightningType;
        var lines = new Seq();
        var hitted = false;
        bhit = false;

        for (var i = 0; i < length / 2; i++) {
            hitCreate.create(null, team, x, y, 0, damage, 1, 1, hitter);
            lines.add(new Vec2(x + Mathf.range(3), y + Mathf.range(3)));

            if (lines.size > 1) {
                bhit = false;
                var from = lines.get(lines.size - 2);
                var to = lines.get(lines.size - 1);
                Vars.world.raycastEach(World.toTile(from.getX()), World.toTile(from.getY()), World.toTile(to.getX()), World.toTile(to.getY()), lib.raycaster((wx, wy) => {

                    var tile = Vars.world.tile(wx, wy);
                    if (tile != null && tile.block().insulated && tile.team() != team) {
                        bhit = true;
                        //snap it instead of removing
                        lines.get(lines.size - 1).set(wx * Vars.tilesize, wy * Vars.tilesize);
                        return true;
                    }
                    return false;
                }));
                if (bhit) break;
            }

            rect.setSize(hitRange).setCenter(x, y);
            entities.clear();
            if (hit.size < maxChain) {
                Units.nearbyEnemies(team, rect, cons(u => {
                    if (!hit.contains(u.id) && (hitter == null || u.checkTarget(hitter.type.collidesAir, hitter.type.collidesGround))) {
                        entities.add(u);
                    }
                }));
            }

            var furthest = Geometry.findFurthest(x, y, entities);

            if (furthest != null) {
                hitted = true;
                hit.add(furthest.id);
                x = furthest.x;
                y = furthest.y;
            } else if (hitted) {
                rotation += random.range(30);
                x += Angles.trnsx(rotation, hitRange / 2);
                y += Angles.trnsy(rotation, hitRange / 2);
            } else {
                // rotation in range
                var randRotate = (() => {
                    // left or right?
                    var nowAngle = Tmp.v1.set(x - originX, y - originY).angle();
                    var angleOffset = nowAngle - originRotation;
                    var length = Tmp.v1.len();

                    var offsetLength = Mathf.sinDeg(angleOffset) * length;
                    // var lengthPercent = Math.min(1, Math.abs(offsetLength) / hitRange) * offsetLength > 0 ? 1 : -1;
                    var lengthPercent = offsetLength / hitRange;

                    return random.range(10) - lengthPercent * 20;
                })();

                rotation += randRotate;
                x += Angles.trnsx(rotation, hitRange / 2);
                y += Angles.trnsy(rotation, hitRange / 2);
            }
        }

        Fx.lightning.at(x, y, rotation, color, lines);
    };
})();

exports.createDirectLightningTeam = (team, color, damage, x, y, targetAngle, length) => createDirectLightning(
    null, team, color, damage, x, y, targetAngle, length
);

exports.createDirectLightning = (bullet, color, damage, x, y, targetAngle, length) => createDirectLightning(
    bullet, bullet.team, color, damage, x, y, targetAngle, length
);
