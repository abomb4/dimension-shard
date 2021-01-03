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
                { item: Items.copper, amount: 2000 },
                { item: Items.lead, amount: 2000 },
                { item: Items.silicon, amount: 2000 },
            ])
        },
        {
            launchCount: 3,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 3400 },
                { item: Items.lead, amount: 3400 },
                { item: Items.silicon, amount: 2400 },
            ])
        },
        {
            launchCount: 3,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 4000 },
                { item: Items.lead, amount: 4000 },
                { item: Items.silicon, amount: 2600 },
                { item: Items.titanium, amount: 2600 },
            ])
        },
        {
            launchCount: 3,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 5000 },
                { item: Items.lead, amount: 5000 },
                { item: Items.silicon, amount: 3000 },
                { item: Items.titanium, amount: 3000 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 6000 },
                { item: Items.lead, amount: 6000 },
                { item: Items.silicon, amount: 3000 },
                { item: Items.titanium, amount: 3000 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 8000 },
                { item: Items.lead, amount: 8000 },
                { item: Items.silicon, amount: 3500 },
                { item: Items.titanium, amount: 3500 },
                { item: Items.thorium, amount: 2600 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 9000 },
                { item: Items.lead, amount: 9000 },
                { item: Items.silicon, amount: 4000 },
                { item: Items.titanium, amount: 4000 },
                { item: Items.thorium, amount: 3000 },
            ])
        },
        {
            launchCount: 4,
            requirements: defineItemRequirements([
                { item: Items.copper, amount: 12000 },
                { item: Items.lead, amount: 12000 },
                { item: Items.silicon, amount: 6000 },
                { item: Items.titanium, amount: 5000 },
                { item: Items.thorium, amount: 5000 },
                { item: Items.phaseFabric, amount: 1000 },
            ])
        },
        {
            launchCount: 4,
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
            launchCount: 4,
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
            launchCount: 4,
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
        {
            launchCount: 5,
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
    ]
};

/**
 * @returns {RequirementInfo}
 */
function getRequirementInfo(building) {
    const cores = building.team.cores().size;
    if (cores == 0) {
        return options.requirementInfos[0];
    }
    return options.requirementInfos[Math.min(options.requirementInfos.length, cores) - 1];
}
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

block.consumes.power(4.5);

var platformGroup = {};
var mainBuilding = {};
var cores = {};
for (var team of Team.baseTeams) {
    platformGroup[team.id] = new Seq();
    mainBuilding[team.id] = null;
    cores[team.id] = 0;
}
function checkCores() {
    for (var team of Team.baseTeams) {
        const newSize = team.cores().size;
        if (cores[team.id] != newSize && mainBuilding[team.id] != null) {
            mainBuilding[team.id].requirementInfoChanged();
        }
        cores[team.id] = newSize;
    }
}
function checkCoresTask() {
    if (Vars.state.state == GameState.State.menu) {
        return;
    }
    checkCores();
    Time.run(30, run(() => { checkCoresTask() }));
}

function selectMainBuilding(team) {
    // print('select');
    if (mainBuilding[team.id] != null) {
        // print('fuxked');
        return;
    }
    const group = platformGroup[team.id];
    // print('group.isEmpty: ' + group.isEmpty());
    if (!group.isEmpty()) {
        mainBuilding[team.id] = group.get(0);
        mainBuilding[team.id].makeMain();
    }
}

function createPod() {
    return new JavaAdapter(LaunchPayload, {
        toString() {
            return "CoreConstructionPlatformPod#" + this.id;
        },
        remove() {
            if (this.added == false) return;
            Groups.all.remove(this);
            Groups.draw.remove(this);
            this.added = false;
        },
    });
}

lib.setBuilding(block, block => {

    function getDefaultRequirementInfo() {
        return {
            launchCount: 1,
            requirements: {}
        }
    }

    var isMain = false;
    var launchTimes = 0;
    var toCoreDelay = options.becomeCoreDelay;
    var launchDelay = options.launchTime;
    var readyLaunch = false;
    var ready = false;
    /** @type {RequirementInfo} */
    var requirementInfo = getDefaultRequirementInfo();

    function debug(b) {
        print('id: ' + b.id + ', isMain: ' + isMain + ', launchTimes: ' + launchTimes + ', toCoreDelay: ' + toCoreDelay +
            ', launchDelay: ' + launchDelay + ', readyLaunch: ' + readyLaunch + ', ready: ' + ready + ', requirementInfo: ' + JSON.stringify(requirementInfo));
    }
    const building = new JavaAdapter(Building, {
        requirementInfoChanged() {
            if (!isMain) { return; }
            requirementInfo = getRequirementInfo(this);
            if (launchTimes >= requirementInfo.launchCount) {
                this.convertToCore();
            }
        },
        makeMain() {
            mainBuilding[this.team.id] = this;
            isMain = true;
            this.requirementInfoChanged();
        },
        doLaunch() {
            launchTimes += 1;
            this.items.clear();
            readyLaunch = false;
            launchDelay = options.launchTime;

            Fx.launchPod.at(this);
            const entity = createPod();
            entity.set(this);
            entity.lifetime = 120;
            entity.team = this.team;
            entity.add();
            Effect.shake(3, 3, this);
        },
        becomeCore() {
            Fx.placeBlock.at(this.tile, Blocks.coreShard.size);
            Fx.upgradeCore.at(this.tile, Blocks.coreShard.size);
            Fx.launch.at(this.tile);
            Effect.shake(5, 5, this.tile);
            this.tile.setBlock(Blocks.coreShard, this.team);
        },
        fullFilled() {
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
                if (isMain) {
                    this.makeMain();
                }
            }
        },
        getMaxItemCapacity() {
            if (!isMain) {
                return 0;
            }
            var sum = 0;
            for (var key of Object.keys(requirementInfo.requirements)) {
                sum += requirementInfo.requirements[key];
            }
            return sum;
        },
        getLaunchTimes() {
            return launchTimes;
        },
        getRequirementInfo() {
            return getRequirementInfo(this);
        },
        getIsMain() {
            return isMain;
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
            if (isMain) {
                if (!readyLaunch && this.fullFilled()) {
                    readyLaunch = true;
                    launchDelay = options.launchTime;
                }
                if (readyLaunch) {
                    launchDelay -= this.edelta();
                }
                if (launchDelay <= 0) {
                    this.doLaunch();
                }
                if (!ready && launchTimes === requirementInfo.launchCount) {
                    ready = true;
                    toCoreDelay = options.becomeCoreDelay + options.becomeCoreDelayDelay;
                }
                if (ready) {
                    toCoreDelay -= this.delta();
                }
                if (toCoreDelay <= 0) {
                    this.becomeCore();
                }
            }
        },
        draw() {
            this.super$draw();
            if (ready) {
                const region = Blocks.coreShard.region;
                const teamRegion = Blocks.coreShard.teamRegion;
                const percent = (1 - Math.min(1, toCoreDelay / options.becomeCoreDelay))
                const w = region.width * Draw.scl * Draw.xscl * (1 + 2 * (1 - percent));
                const h = region.height * Draw.scl * Draw.xscl * (1 + 2 * (1 - percent));
                const yAddition = 192 * Interp.pow3In.apply(1 - percent);
                Draw.alpha(percent)
                Draw.rect(region, this.x, this.y + yAddition, w, h, toCoreDelay * 2);
                Draw.color(this.team.color);
                Draw.alpha(percent)
                Draw.rect(teamRegion, this.x, this.y + yAddition, w, h, toCoreDelay * 2);
                Draw.color();
            }
        },
        displayConsumption(table) {
            table.left();
            table.table(cons(c => {
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
        },
        read(read, revision) {
            this.super$read(read, revision);
            isMain = read.bool();
            launchTimes = read.i();
            toCoreDelay = read.f();
            ready = read.bool();
            readyLaunch = read.bool();
            launchDelay = read.f();
            this.afterAdded();
            // debug(this);
        },
        write(write) {
            this.super$write(write);
            write.bool(isMain);
            write.i(launchTimes);
            write.f(toCoreDelay);
            write.bool(ready);
            write.bool(readyLaunch);
            write.f(launchDelay);
        },
        getMaximumAccepted(item) {
            if (!isMain) { return 0; }
            if (ready) { return 0; }
            if (readyLaunch) { return 0; }
            return requirementInfo.requirements[item.id] || 0;
        },
        acceptItem(source, item) {
            if (!isMain) { return false; }
            if (ready) { return false; }
            if (readyLaunch) { return false; }
            return this.items.get(item) < this.getMaximumAccepted(item);
        },
    });
    return building;
});

Events.on(BlockBuildEndEvent, cons(e => {
    const team = e.team;
    if (!e.breaking && e.tile.block() == block) {
        selectMainBuilding(team);
    }
}));
Events.on(WorldLoadEvent, cons(e => {
    checkCoresTask();
    for (var team of Team.baseTeams) {
        selectMainBuilding(team);
    }
}));
exports.coreConstructionPlatform = block;
