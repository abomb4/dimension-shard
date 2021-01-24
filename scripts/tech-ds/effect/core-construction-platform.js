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

/**
 * @typedef {Object} RequirementInfoRequirement - Item requirements
 * @property {Item} item - Item
 * @property {number} amount - Amount
 *
 * @typedef {Object} RequirementInfo - Requirement info for building a core
 * @property {number} launchCount - How many times the platform should launch to build a core
 * @property {{ [key: number]: number }} requirements - Item requirement pre launch
 */

/**
 * @param {RequirementInfoRequirement[]} array
 * @returns {{ [key: number]: number }}
 */
function defineItemRequirements(array) {
    const r = {};
    array.forEach(req => r[req.item.id] = req.amount);
    return r;
}
const options = {
    becomeCoreDelayDelay: 60 * 2.5,
    becomeCoreDelay: 60 * 1.5,
    launchTime: 60 * 4,
    /** @type {RequirementInfo[]} */
    requirementInfos: [
        {
            launchCount: 3,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 3000 },
                { item: Items.lead, amount: 3000 },
                { item: Items.silicon, amount: 2000 },
            ])
        },
        {
            launchCount: 3,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 4400 },
                { item: Items.lead, amount: 4400 },
                { item: Items.silicon, amount: 3200 },
                { item: Items.titanium, amount: 2600 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 4400 },
                { item: Items.lead, amount: 4400 },
                { item: Items.silicon, amount: 3200 },
                { item: Items.titanium, amount: 2600 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 6000 },
                { item: Items.lead, amount: 6000 },
                { item: Items.silicon, amount: 3000 },
                { item: Items.titanium, amount: 3000 },
                { item: Items.thorium, amount: 2600 },
            ])
        },
        {
            launchCount: 5,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 6000 },
                { item: Items.lead, amount: 6000 },
                { item: Items.silicon, amount: 3000 },
                { item: Items.titanium, amount: 3000 },
                { item: Items.thorium, amount: 2600 },
            ])
        },
        {
            launchCount: 5,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 9000 },
                { item: Items.lead, amount: 9000 },
                { item: Items.silicon, amount: 6000 },
                { item: Items.titanium, amount: 5500 },
                { item: Items.thorium, amount: 5000 },
                { item: Items.phaseFabric, amount: 1000 },
            ])
        },
        {
            launchCount: 6,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 9000 },
                { item: Items.lead, amount: 9000 },
                { item: Items.silicon, amount: 6000 },
                { item: Items.titanium, amount: 5500 },
                { item: Items.thorium, amount: 5000 },
                { item: Items.phaseFabric, amount: 1000 },
            ])
        },
        {
            launchCount: 6,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 15000 },
                { item: Items.lead, amount: 15000 },
                { item: Items.silicon, amount: 8000 },
                { item: Items.titanium, amount: 7000 },
                { item: Items.thorium, amount: 7000 },
                { item: Items.phaseFabric, amount: 1500 },
                { item: Items.surgeAlloy, amount: 800 },
            ])
        },
        {
            launchCount: 6,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 18000 },
                { item: Items.lead, amount: 18000 },
                { item: Items.silicon, amount: 10000 },
                { item: Items.pyratite, amount: 300 },
                { item: Items.titanium, amount: 8500 },
                { item: Items.thorium, amount: 8500 },
                { item: Items.phaseFabric, amount: 2000 },
                { item: Items.surgeAlloy, amount: 1200 },
            ])
        },
        {
            launchCount: 7,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 18000 },
                { item: Items.lead, amount: 18000 },
                { item: Items.silicon, amount: 10000 },
                { item: Items.pyratite, amount: 400 },
                { item: Items.titanium, amount: 8500 },
                { item: Items.thorium, amount: 8500 },
                { item: Items.phaseFabric, amount: 2000 },
                { item: Items.surgeAlloy, amount: 1200 },
            ])
        },
    ]
};
const requirementInfoCache = {};
const block = new JavaAdapter(StorageBlock, {
    setStats() {
        this.super$setStats();
    },
    setBars() {
        this.super$setBars();
        this.bars.add("items", func(entity => new Bar(
            prov(() => Core.bundle.format("bar.items", entity.items.total())),
            prov(() => Pal.items),
            floatp(() => entity.items.total() / entity.getMaxItemCapacity())
        )));
        this.bars.add("launchCount", func(entity => new Bar(
            prov(() => lib.getMessage("bar", "coreConstructionPlatformLaunchTimes", [
                entity.getLaunchTimes(),
                entity.getIsMain() ? entity.getRequirementInfo().launchCount : '-'
            ])),
            prov(() => Pal.items),
            floatp(() => entity.getLaunchTimes() / entity.getRequirementInfo().launchCount)
        )));
    },
    outputsItems() {
        return false;
    }
}, 'core-construction-platform');

block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.canOverdrive = false;
block.solid = true;
block.update = true;
block.destructible = true;
block.hasItems = true;
block.size = 3;
block.requirements = ItemStack.with(
    Items.copper, 700,
    Items.lead, 700,
    Items.silicon, 400,
    Items.titanium, 400,
    Items.thorium, 320,
);

block.consumes.powerCond(25, boolf(b => b.getReadyLaunch()));

var platformGroup = {};
var mainBuilding = {};
var cores = {};
for (var team of Team.baseTeams) {
    platformGroup[team.id] = new Seq();
    mainBuilding[team.id] = null;
    cores[team.id] = 0;
}

const Call_Launch = (() => {
    const TYPE = lib.modName + '-CCPLaunch';
    const DELIMITER = ', ';

    function makePackage(tilePos, launchCountBefore) {
        const datas = tilePos + DELIMITER + launchCountBefore
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
        const launchCountBefore = datas[1];
        return {
            tilePos: tilePos,
            launchCountBefore: launchCountBefore,
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
                if (tile.block() == block) {
                    const building = tile.build
                    building.setLaunchTimes(parseInt(info.launchCountBefore));
                    building.doLaunch();
                }
            }));
        }
    }
    Events.on(ClientLoadEvent, cons(e => {
        init();
    }));
    return (tilePos, launchCountBefore) => {
        const pack = makePackage(tilePos, launchCountBefore);
        // Send to EVERY client if i'm server
        Call.clientPacketReliable(TYPE, pack);
    }
})()
const Call_MakeMain = (() => {
    const TYPE = lib.modName + '-CCPMakeMain';
    const DELIMITER = ', ';

    function makePackage(tilePos, cores) {
        const datas = tilePos + DELIMITER + cores
        return datas;
    }

    /**
     * Read packet to objects
     *
     * @param {string} str the packet
     * @returns {{tilePos: number, cores: number}}
     */
    function readPackage(str) {
        const datas = str.split(DELIMITER);
        const tilePos = datas[0];
        const cores = datas[1];
        return {
            tilePos: tilePos,
            cores: cores,
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
                if (tile.block() == block) {
                    const building = tile.build
                    building.makeMain(info.cores);
                }
            }));
        }
    }
    Events.on(ClientLoadEvent, cons(e => {
        init();
    }));
    return (tilePos, cores) => {
        const pack = makePackage(tilePos, cores);
        // Send to EVERY client if i'm server
        Call.clientPacketReliable(TYPE, pack);
    }
})()

function checkCores() {
    for (var team of Team.baseTeams) {
        var newSize = team.cores().size;
        // print('cores[' + team.id + ']: ' + cores[team.id] + ', newSize: ' + newSize + ', mainBuilding[team.id]: ' + mainBuilding[team.id]);
        if (cores[team.id] != newSize && mainBuilding[team.id] != null) {
            mainBuilding[team.id].makeMain(newSize);
        }
        cores[team.id] = newSize;
    }
}

function selectMainBuilding(team) {
    if (Vars.net.client()) { return; }
    // print('select');
    if (mainBuilding[team.id] != null) {
        // print('fuxked');
        return;
    }
    const group = platformGroup[team.id];
    // print('group.isEmpty: ' + group.isEmpty());
    if (!group.isEmpty()) {
        const main = group.get(0);
        mainBuilding[team.id] = main;
        mainBuilding[team.id].makeMain(main.team.cores().size);
    }
}

function createPod() {
    return new JavaAdapter(LaunchPayload, {
        toString() {
            return "CoreConstructionPlatformPod#" + this.id;
        },
        draw() {
            const engineColor = Pal.engine;
            var alpha = this.fout(Interp.pow5Out);
            var scale = (1 - alpha) * 1.3 + 1;
            var cx = this.cx();
            var cy = this.cy();
            var rotation = this.fin() * (130 + Mathf.randomSeedRange(this.id, 50));
            Draw.z(Layer.effect + 0.001);
            Draw.color(engineColor);
            var rad = 0.2 + this.fslope();
            Tmp.c2.set(engineColor).a = alpha;
            Tmp.c1.set(engineColor).a = 0;
            Fill.light(cx, cy, 10, 25 * (rad + scale - 1), Tmp.c2, Tmp.c1);
            Draw.alpha(alpha);
            for (var i = 0; i < 4; i++) {
                Drawf.tri(cx, cy, 6, 40 * (rad + scale - 1), i * 90 + rotation);
            }
            Draw.color();
            Draw.z(Layer.weather - 1);
            var region = lib.loadRegion("core-construction-platform-pod");
            var rw = region.width * Draw.scl * scale;
            var rh = region.height * Draw.scl * scale;
            Draw.alpha(alpha);
            Draw.rect(region, cx, cy, rw, rh, rotation);
            Tmp.v1.trns(225, this.fin(Interp.pow3In) * 250);
            Draw.z(Layer.flyingUnit + 1);
            Draw.color(0, 0, 0, 0.22 * alpha);
            Draw.rect(region, cx + Tmp.v1.x, cy + Tmp.v1.y, rw, rh, rotation);
            Draw.reset();
        },
        remove() {
            if (this.added == false) return;
            Groups.all.remove(this);
            Groups.draw.remove(this);
            this.added = false;
        },
    });
}

const fxGateOpen = new Effect(30, cons(e => {
    Draw.color(Color.red);
    Draw.alpha(e.fout());
    Draw.rect(lib.loadRegion("core-construction-platform-gate-effect"), e.x, e.y);
}));
const fxGateClose = new Effect(30, cons(e => {
    Draw.color(Color.valueOf("#3494c4"));
    Draw.alpha(e.fout());
    Draw.rect(lib.loadRegion("core-construction-platform-gate-effect"), e.x, e.y);
}));

const afterLaunchTimeTotal = 60 * 1.5;
lib.setBuilding(block, block => {

    // var this._isMain = false;
    // var this._launchTimes = 0;
    // var this._toCoreDelay = options.becomeCoreDelay;
    // var this._launchDelay = options.launchTime;
    // var this._readyLaunch = false;
    // var this._ready = false;
    // /** @type {RequirementInfo} */
    // var this._requirementInfoIndex = 0;

    const building = new JavaAdapter(Building, {
        _isMain: false,
        _launchTimes: 0,
        _toCoreDelay: options.becomeCoreDelay,
        _launchDelay: options.launchTime,
        _readyLaunch: false,
        _ready: false,
        _requirementInfoIndex: 0,
        _afterLaunchTime: 0,
        makeMain(cores) {
            Call_MakeMain(this.tile.pos(), cores);
            mainBuilding[this.team.id] = this;
            this._isMain = true;
            this._requirementInfoIndex = cores;
        },
        setLaunchTimes(times) {
            this._launchTimes = times
        },
        getLaunchTimes() {
            return this._launchTimes
        },
        getIsMain() {
            return this._isMain;
        },
        getReadyLaunch() {
            return this._readyLaunch;
        },
        doLaunch() {
            Call_Launch(this.tile.pos(), this._launchTimes);
            this._launchTimes += 1;
            this.items.clear();
            this._readyLaunch = false;
            this._launchDelay = options.launchTime;

            Fx.launchPod.at(this);
            const entity = createPod();
            entity.set(this);
            entity.lifetime = 120;
            entity.team = this.team;
            entity.add();
            Effect.shake(3, 3, this);

            this._afterLaunchTime = afterLaunchTimeTotal;
        },
        becomeCore() {
            Fx.placeBlock.at(this.tile, Blocks.coreShard.size);
            Fx.upgradeCore.at(this.tile, Blocks.coreShard.size);
            Fx.launch.at(this.tile);
            Effect.shake(5, 5, this.tile);
            this.tile.setBlock(Blocks.coreShard, this.team);
            if (!Vars.net.client()) {
                checkCores();
            }
        },
        fullFilled() {
            const requirementInfo = this.getRequirementInfo();
            for (var key of Object.keys(requirementInfo.requirements)) {
                var amount = requirementInfo.requirements[key];
                var item = Vars.content.item(key)
                if (this.items.get(item) < amount) {
                    return false;
                }
            }
            // debug(this);
            return true;
        },
        afterAdded() {
            if (!platformGroup[this.team.id].contains(this)) {
                platformGroup[this.team.id].add(this);
                if (this._isMain && !Vars.net.client()) {
                    this.makeMain(this.team.cores().size);
                }
            }
        },
        getMaxItemCapacity() {
            if (!this._isMain) {
                return 0;
            }
            const requirementInfo = this.getRequirementInfo();
            var sum = 0;
            for (var key of Object.keys(requirementInfo.requirements)) {
                sum += requirementInfo.requirements[key];
            }
            return sum;
        },
        getRequirementInfo() {
            if (this._requirementInfoIndex == 0) {
                return options.requirementInfos[0];
            }
            if (this._requirementInfoIndex >= options.requirementInfos.length) {
                // Too many cores, generate requirement info by last requirements
                var requirementInfo = options.requirementInfos[options.requirementInfos.length - 1];
                var outof = this._requirementInfoIndex - options.requirementInfos.length + 1;

                if (requirementInfoCache[outof]) {
                    return requirementInfoCache[outof];
                }

                var materialMultipler = Math.max(1, Math.pow(1.2, Math.floor((outof + 1) / 2)));
                var launchTimesAddition = Math.floor(outof / 2);
                /** @type {RequirementInfo} */
                var newReq = {};
                newReq.launchCount = requirementInfo.launchCount + launchTimesAddition;
                newReq.requirements = {};
                for (var key of Object.keys(requirementInfo.requirements)) {
                    var v = requirementInfo.requirements[key];
                    newReq.requirements[key] = Math.floor(v * materialMultipler);
                }
                requirementInfoCache[outof] = newReq;
                return newReq;
            } else {
                return options.requirementInfos[this._requirementInfoIndex - 1];
            }
        },
        // -=-=-=-=-=-=-=-=-=- divide -=-=-=-=-=-=-=-=-=-
        created() {
            this.super$created();
            this.afterAdded();
        },
        remove() {
            if (mainBuilding[this.team.id] == this) {
                mainBuilding[this.team.id] = null;
            }
            platformGroup[this.team.id].remove(this);
            this.super$remove();
            selectMainBuilding(this.team);
        },
        canPickup() {
            return false;
        },
        updateTile() {
            this.super$updateTile();
            if (this._isMain && this.consValid()) {
                var requirementInfo = this.getRequirementInfo();
                if (!this._readyLaunch && this.fullFilled()) {
                    this._readyLaunch = true;
                    this._launchDelay = options.launchTime;
                    fxGateOpen.at(this);
                }
                if (this._readyLaunch) {
                    this._launchDelay -= this.edelta();
                }
                if (this._launchDelay <= 0 && !Vars.net.client()) {
                    this.doLaunch();
                }
            }
            if (this._isMain) {
                // If ready, no power needs
                var requirementInfo = this.getRequirementInfo();
                if (!this._ready && this._launchTimes === requirementInfo.launchCount) {
                    this._ready = true;
                    this._toCoreDelay = options.becomeCoreDelay + options.becomeCoreDelayDelay;
                }
                if (this._ready) {
                    this._toCoreDelay -= this.delta();
                }
                if (this._toCoreDelay <= 0) {
                    this.becomeCore();
                }

                // There is only UI effect, no power need
                var before = this._afterLaunchTime;
                this._afterLaunchTime = Math.max(0, this._afterLaunchTime - this.delta());
                if (before != 0 && this._afterLaunchTime == 0) {
                    fxGateClose.at(this);
                }
            }
        },
        draw() {
            const SCL = 32 / 8;
            const DIST2 = 29;
            const DIST1 = 15;
            if (this._readyLaunch && this._launchDelay > 0) {
                // After ready before launch
                var maxTime = Math.min(60 * 1.5, options.launchTime);
                var percent = Mathf.clamp((options.launchTime - this._launchDelay) / maxTime, 0, 1);
                percent = Interp.smooth2.apply(percent);
                Draw.rect(lib.loadRegion("core-construction-platform-bottom"), this.x, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-pod"), this.x, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x - DIST2 * percent / SCL, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x - DIST1 * percent / SCL, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x, this.y - DIST2 * percent / SCL, 90);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x, this.y - DIST1 * percent / SCL, 90);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x + DIST2 * percent / SCL, this.y, 180);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x + DIST1 * percent / SCL, this.y, 180);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x, this.y + DIST2 * percent / SCL, 270);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x, this.y + DIST1 * percent / SCL, 270);
                Draw.rect(lib.loadRegion("core-construction-platform-top"), this.x, this.y);
            } else if (this._afterLaunchTime > 0) {
                // After ready before launch
                var maxTime = afterLaunchTimeTotal;
                var percent = Mathf.clamp((maxTime - this._afterLaunchTime) / maxTime, 0, 1);
                percent = Interp.smooth2.apply(1 - percent);
                Draw.rect(lib.loadRegion("core-construction-platform-bottom"), this.x, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x - DIST2 * percent / SCL, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x - DIST1 * percent / SCL, this.y);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x, this.y - DIST2 * percent / SCL, 90);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x, this.y - DIST1 * percent / SCL, 90);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x + DIST2 * percent / SCL, this.y, 180);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x + DIST1 * percent / SCL, this.y, 180);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left2"), this.x, this.y + DIST2 * percent / SCL, 270);
                Draw.rect(lib.loadRegion("core-construction-platform-gate-left1"), this.x, this.y + DIST1 * percent / SCL, 270);
                Draw.rect(lib.loadRegion("core-construction-platform-top"), this.x, this.y);
            } else {
                this.super$draw();
            }
            if (this._ready) {
                const region = Blocks.coreShard.region;
                const teamRegion = Blocks.coreShard.teamRegion;
                var percent = (1 - Math.min(1, this._toCoreDelay / options.becomeCoreDelay))
                const w = region.width * Draw.scl * Draw.xscl * (1 + 2 * (1 - percent));
                const h = region.height * Draw.scl * Draw.xscl * (1 + 2 * (1 - percent));
                const yAddition = 192 * Interp.pow3In.apply(1 - percent);
                Draw.z(Layer.weather + 1);
                Draw.alpha(percent)
                Draw.rect(region, this.x, this.y + yAddition, w, h, this._toCoreDelay * 2);
                Draw.color(this.team.color);
                Draw.alpha(percent)
                Draw.rect(teamRegion, this.x, this.y + yAddition, w, h, this._toCoreDelay * 2);
                Draw.reset();
            }
        },
        displayConsumption(table) {
            if (this._isMain) {
                table.left();
                table.table(cons(c => {
                    var requirementInfo = this.getRequirementInfo();
                    var i = 0;
                    for (var key of Object.keys(requirementInfo.requirements)) {
                        var item = Vars.content.item(key);
                        var amount = requirementInfo.requirements[key];
                        c.add(new ReqImage(new ItemImage(item.icon(Cicon.medium), amount),
                            ((item, amount) => boolp(() => this.items != null && this.items.has(item) && this.items.get(item) >= amount))(item, amount))
                        ).padRight(8);
                        if (++i % 4 == 0) c.row();
                    }
                })).left()
            }
        },
        read(read, revision) {
            this.super$read(read, revision);
            this._isMain = read.bool();
            this._requirementInfoIndex = read.i();
            this._launchTimes = read.i();
            this._toCoreDelay = read.f();
            this._ready = read.bool();
            this._readyLaunch = read.bool();
            this._launchDelay = read.f();
            this.afterAdded();
            // debug(this);
        },
        write(write) {
            this.super$write(write);
            write.bool(this._isMain);
            write.i(this._requirementInfoIndex);
            write.i(this._launchTimes);
            write.f(this._toCoreDelay);
            write.bool(this._ready);
            write.bool(this._readyLaunch);
            write.f(this._launchDelay);
        },
        getMaximumAccepted(item) {
            if (!this._isMain) { return 0; }
            if (this._ready) { return 0; }
            if (this._readyLaunch) { return 0; }
            var requirementInfo = this.getRequirementInfo();
            return requirementInfo.requirements[item.id] || 0;
        },
        acceptItem(source, item) {
            if (!this._isMain) { return false; }
            if (this._ready) { return false; }
            if (this._readyLaunch) { return false; }
            return this.items.get(item) < this.getMaximumAccepted(item);
        },
    });
    return building;
});

Events.on(BlockBuildEndEvent, cons(e => {
    checkCores();
    const team = e.team;
    if (!e.breaking && e.tile.block() == block) {
        selectMainBuilding(team);
    }
}));
Events.on(BlockDestroyEvent, cons(e => {
    checkCores();
}));
Events.on(WorldLoadEvent, cons(e => {
    checkCores();
    for (var team of Team.baseTeams) {
        selectMainBuilding(team);
    }
}));
exports.coreConstructionPlatform = block;
