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

const range = 300;
const warmupSpeed = 0.05;

// Must load region in 'load()'
var topRegion;
var bottomRegion;
var rotatorRegion;

const BLUE = Color.valueOf("#0068fc");

const outEffect = lib.newEffect(38, e => {
    Draw.color(BLUE);

    Angles.randLenVectors(e.id, 1, 8 * e.fin(), 0, 360, new Floatc2({
        get: (x, y) => {
            var angle = Angles.angle(0, 0, x, y);
            var trnsx = Angles.trnsx(angle, 2);
            var trnsy = Angles.trnsy(angle, 2);
            var trnsx2 = Angles.trnsx(angle, 4);
            var trnsy2 = Angles.trnsy(angle, 4);
            Fill.circle(
                e.x + trnsx + x + trnsx2 * e.fin(),
                e.y + trnsy + y + trnsy2 * e.fin(),
                e.fslope() * 0.8
            );
        }
    }));
});

const blockType = extend(Block, "space-unloader", {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    load() {
        this.super$load();
        topRegion = lib.loadRegion("space-unloader-top");
        bottomRegion = lib.loadRegion("space-unloader-bottom");
        rotatorRegion = lib.loadRegion("space-unloader-rotator");
    },
    setBars() {
        this.super$setBars();

        this.addBar("capacity", lib.func((e) => new Bar(
            prov(() => Core.bundle.format("bar.capacity", UI.formatAmount(e.block.itemCapacity))),
            prov(() => Pal.items),
            floatp(() => e.items.total() / (e.block.itemCapacity * Vars.content.items().count(boolf(i => i.unlockedNow()))))
        )));
    },
    drawPlace(x, y, rotation, valid) {
        Drawf.dashCircle(x * Vars.tilesize, y * Vars.tilesize, range, Pal.accent);
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
    },
    pointConfig(config, transformer) {
        // Rotate relative points
        if (IntSeq.__javaObject__.isInstance(config)) {
            // ROTATE IT!
            var newSeq = new IntSeq(config.size);
            newSeq.add(config.get(0));
            newSeq.add(config.get(1));
            var linkX = null;
            for (var i = 2; i < config.size; i++) {
                var num = config.get(i);
                if (linkX == null) {
                    linkX = num;
                } else {
                    // The source position is relative to right bottom, transform it.
                    var point = new Point2(linkX * 2 - 1, num * 2 - 1);

                    transformer.get(point);
                    newSeq.add((point.x + 1) / 2);
                    newSeq.add((point.y + 1) / 2);
                    linkX = null;
                }
            }
            return newSeq;
        } else {
            return config;
        }
    },
});

blockType.buildVisibility = BuildVisibility.shown;
blockType.category = Category.distribution;
blockType.size = 2;
blockType.health = 300;

blockType.update = true;
blockType.solid = true;
blockType.hasItems = true;
blockType.configurable = true;
blockType.saveConfig = false;
blockType.itemCapacity = 20;
blockType.noUpdateDisabled = true;
blockType.requirements = ItemStack.with(
    Items.titanium, 130,
    Items.silicon, 150,
    Items.phaseFabric, 80,
    items.spaceCrystal, 80,
    items.hardThoriumAlloy, 40
);
blockType.consumePower(1.5);
blockType.config(IntSeq, lib.cons2((tile, seq) => {
    // This seems only used by coping block
    // Deserialize from IntSeq
    var itemId = seq.get(0)
    var size = seq.get(1);
    var linkX = null;
    var newLinks = new Seq(true, size, java.lang.Integer);
    for (var i = 2; i < seq.size; i++) {
        var num = seq.get(i);
        if (linkX == null) {
            linkX = num;
        } else {
            var point = Point2.pack(linkX + tile.tileX(), num + tile.tileY());
            newLinks.add(lib.int(point));
            linkX = null;
        }
    }
    tile.setItemTypeId(itemId);
    tile.setLink(newLinks);
}));
blockType.config(java.lang.Integer, lib.cons2((tile, int) => {
    tile.setOneLink(int);
}));
blockType.config(Item, lib.cons2((tile, item) => {
    tile.setItemTypeId(item.id);
}));
blockType.configClear(tile => {
    tile.setItemTypeId(null);
});

blockType.buildType = prov(() => {

    var itemType = null;
    var links = new Seq(java.lang.Integer);
    var slowdownDelay = 0;
    var warmup = 0;
    var rotateDeg = 0;
    var rotateSpeed = 0;
    var fairLoopOffset = 0;
    function updateFairLoopOffset(max) {
        fairLoopOffset++;
        if (fairLoopOffset >= max) {
            fairLoopOffset = 0;
        }
    }
    function fairLoopIndex(i, max, offset) {
        return (i + offset) % max;
    }

    function linkValid(the, pos) {
        if (pos === undefined || pos === null || pos == -1) return false;
        var linkTarget = Vars.world.build(pos);
        return linkTarget && linkTarget.team == the.team && the.within(linkTarget, range);
    }

    return extend(Building, {
        getLink() { return links; },
        getItemType() { return itemType; },
        setLink(v) { links = v; },
        setOneLink(v) {
            var int = new java.lang.Integer(v);
            if (!links.remove(boolf(i => i == int))) {
                links.add(int);
            }
        },
        setItemTypeId(v) { itemType = (!v && v !== 0 ? null : Vars.content.items().get(v)) },
        updateTile() {
            var hasItem = false;
            var consValid = this.consValid();
            if (itemType != null && consValid) {
                for (var iloop = 0; iloop < links.size; iloop++) {
                    var i = fairLoopIndex(iloop, links.size, fairLoopOffset);
                    var pos = links.get(i);
                    if (linkValid(this, pos)) {
                        var linkTarget = Vars.world.build(pos);
                        links.set(i, new java.lang.Integer(linkTarget.pos()));

                        if (linkTarget != null && linkTarget.items != null) {
                            if (linkTarget.items.has(itemType) && this.items.get(itemType) < this.getMaximumAccepted(itemType)) {
                                this.handleItem(this, itemType);
                                linkTarget.removeStack(itemType, 1);
                                linkTarget.itemTaken(itemType);
                                hasItem = true;
                            }
                        }
                    } else {
                        // it.remove();
                    }
                }
            }

            if (consValid && hasItem) {
                slowdownDelay = 60;
            } else if (!consValid) {
                slowdownDelay = 0;
            }
            warmup = Mathf.lerpDelta(warmup, consValid ? 1 : 0, warmupSpeed);
            rotateSpeed = Mathf.lerpDelta(rotateSpeed, slowdownDelay > 0 ? 1 : 0, warmupSpeed);
            if (warmup > 0) {
                rotateDeg += rotateSpeed;
            }
            slowdownDelay = Math.max(0, slowdownDelay - 1);
            updateFairLoopOffset(links.size);
            this.dump();

            if (this.enabled && rotateSpeed > 0.5 && Mathf.random(60) > 48) {
                Time.run(Mathf.random(10), run(() => {
                    outEffect.at(this.x, this.y, 0);
                }));
            }
        },
        display(table) {
            this.super$display(table);
            if (this.items != null) {
                table.row();
                table.left();
                table.table(cons(l => {
                    var map = new ObjectMap();
                    l.update(run(() => {
                        l.clearChildren();
                        l.left();
                        var seq = new Seq(Item);
                        this.items.each(new ItemModule.ItemConsumer({
                            accept(item, amount) {
                                map.put(item, amount);
                                seq.add(item);
                            }
                        }));
                        map.each(lib.cons2((item, amount) => {
                            l.image(item.icon(Cicon.small)).padRight(3.0);
                            l.label(prov(() => '  ' + Strings.fixed(seq.contains(item) ? amount : 0, 0))).color(Color.lightGray);
                            l.row();
                        }));
                    }));
                })).left();
            }
        },
        draw() {
            this.super$draw();
            Draw.color(Color.valueOf('#0a156e'));
            Draw.alpha(warmup);
            Draw.rect(bottomRegion, this.x, this.y);
            Draw.color();

            Draw.alpha(warmup);
            Draw.rect(rotatorRegion, this.x, this.y, rotateDeg);

            Draw.alpha(1);
            Draw.rect(topRegion, this.x, this.y);

            Draw.color(itemType == null ? Color.clear : itemType.color);
            Draw.rect("unloader-center", this.x, this.y);
            Draw.color();
        },
        drawConfigure() {
            const tilesize = Vars.tilesize;
            var sin = Mathf.absin(Time.time, 6, 1);

            Draw.color(Pal.accent);
            Lines.stroke(1);
            Drawf.circles(this.x, this.y, (this.tile.block().size / 2 + 1) * Vars.tilesize + sin - 2, Pal.accent);

            for (var i = 0; i < links.size; i++) {
                var pos = links.get(i);
                if (linkValid(this, pos)) {
                    var linkTarget = Vars.world.build(pos);
                    Drawf.square(linkTarget.x, linkTarget.y, linkTarget.block.size * tilesize / 2 + 1, Pal.place);
                }
            }
            Drawf.dashCircle(this.x, this.y, range, Pal.accent);
        },
        onConfigureTileTapped(other) {
            if (this == other) {
                this.configure(-1);
                return false;
            }

            if (this.dst(other) <= range && other.team == this.team) {
                this.configure(new java.lang.Integer(other.pos()));
                return false;
            }

            return true;
        },
        buildConfiguration(table) {
            ItemSelection.buildTable(table, Vars.content.items(), prov(() => itemType), cons(v => {
                this.configure(v);
            }));
        },
        config() {
            // Serialize to IntSeq (I don't know how to serialize to byte[], maybe ByteArrayOutputStream?)
            var seq = new IntSeq(links.size * 2 + 2);
            seq.add(itemType == null ? -1 : itemType.id);
            seq.add(links.size);
            for (var i = 0; i < links.size; i++) {
                var pos = links.get(i);
                var point2 = Point2.unpack(pos).sub(this.tile.x, this.tile.y);
                seq.add(point2.x, point2.y);
            }
            return seq;
        },
        version() {
            return 2;
        },
        canDump(to, item) {
            return !links.contains(boolf(pos => {
                var linkTarget = Vars.world.build(pos);
                return to == linkTarget;
            }));
        },
        write(write) {
            this.super$write(write);
            write.s(itemType == null ? -1 : itemType.id);
            write.s(links.size);
            var it = links.iterator();
            while (it.hasNext()) {
                var pos = it.next();
                write.i(pos);
            }
        },
        read(read, revision) {
            this.super$read(read, revision);
            var id = read.s();
            itemType = id == -1 ? null : Vars.content.items().get(id);
            links = new Seq(java.lang.Integer);
            if (revision == 1) {
                var linkl = read.i();
                links.add(new java.lang.Integer(linkl));
            } else {
                var linkSize = read.s();
                for (var i = 0; i < linkSize; i++) {
                    var pos = read.i();
                    links.add(new java.lang.Integer(pos));
                }
            }
        },
    });
});

exports.spaceUnloader = blockType;
