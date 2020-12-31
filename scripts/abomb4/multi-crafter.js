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


/**
 * @typedef {Object} Liquid - Java type Liquid
 * @typedef {Object} Item - Java type Item
 * @typedef {Object} Effect - Java type Effect
 * @typedef {Object} Attribute - Java enum Attrubite
 *
 * @typedef {Object} Consume - Info of resources to consume
 * @property {number} power - Power consume, 1 = 60/s
 * @property {{ item: Item, amount: number }[]} items - Consume items, can be empty list, not nullable
 * @property {{ liquid: Liquid, amount: number }[]} liquids - Consume liquids, can be empty list, not nullable
 *
 * @typedef {Object} Output - Info of resources to output
 * @property {number} power - Power output, 1 = 60/s
 * @property {{ item: Item, amount: number }[]} items - Output items, can be empty list, not nullable
 * @property {{ liquid: Liquid, amount: number }[]} liquids - Output liquids, can be empty list, not nullable
 *
 * @typedef {Object} Plan - Crafting plan
 * @property {Consume} consume - Resources to consume
 * @property {Output} output - Resources to produce
 * @property {Effect} craftEffect - Craft effect, fire when crafted
 * @property {number} craftTime - Craft time
 * @property {number} boostScale - Attribute boost scale
 * @property {Attribute} attribute - Attribute required to boost
 *
 * @typedef {Object} MultiCrafterConfig - Multi Crafter definition configuration
 * @property {string} name - 方块名称
 * @property {number} unlinearEffectUp - 非线性并发效率提升比例，默认 0；并发可提高整体效率到接近 200% ，但永远达不到
 * @property {number} itemCapacity - 物品容量
 * @property {number} liquidCapacity - 液体容量
 * @property {number} updateEffectChance - 生产效果几率，建议 0.15
 * @property {Effect} updateEffect - 生产效果
 * @property {Sound} ambientSound - 生产声音
 * @property {number} ambientSoundVolume - 生产声音大小
 * @property {function(building): any} draw - 自定义绘图方法
 * @property {Plan[]} plans - 方案列表
 */

/**
 * 定义一个多合成工厂 Block 。
 *
 * 资源消耗方面，多合成工厂会直接吞噬材料而不是生产完成后再吞噬材料。
 *
 * @param {MultiCrafterConfig} originConfig 配置项
 *
 * @author 滞人<abomb4@163.com> 2020-11-21
 */
exports.defineMultiCrafter = function (originConfig) {
    function unlinear(ratio, count) {
        if (ratio == 0) {
            return 1;
        }
        if (ratio < 0 || ratio > 1) {
            throw new Error('Ratio cannot lesser than 0 or greeter than 1')
        }
        var rt = 0;
        for (var i = 0; i < count; i++) {
            rt += (1 - rt) * ratio;
        }
        return rt;
    }
    function func(getter) { return new Func({ get: getter }); }
    function cons2(fun) { return new Cons2({ get: (v1, v2) => fun(v1, v2) }); }
    function randomLoop(list, func) {
        var randStart = Math.floor(Math.random() * (list.length - 1))
        for (var i = randStart; i < list.length; i++) {
            (v => func(v))(list[i]);
        }
        for (var i = 0; i < randStart; i++) {
            (v => func(v))(list[i]);
        }
    }
    /** @type {MultiCrafterConfig} */
    const config = Object.assign({
        unlinearEffectUp: 0,
        itemCapacity: 10,
        liquidCapacity: 10,
        updateEffectChance: 0,
        updateEffect: Fx.none,
        ambientSound: Sound.none,
        ambientSoundVolume: 0.05,
        plans: []
    }, originConfig);

    (function validate() {
        function check(val, checker, msg) {
            if (!checker(val)) {
                throw new Error(msg(val));
            }
        }
        check(config.unlinearEffectUp, v => v >= 0 && v <= 1, v => 'unlinearEffectUp must in [0, 1], it was ' + v);
        check(config.itemCapacity, v => typeof v === 'number' && v >= 0, v => 'itemCapacity must be number and greeter equals to 0, it was ' + v);
        check(config.liquidCapacity, v => typeof v === 'number' && v >= 0, v => 'liquidCapacity must be number and greeter equals to 0, it was ' + v);
        check(config.updateEffectChance, v => typeof v === 'number' && v >= 0, v => 'updateEffectChance must be number and in [0, 1], it was ' + v);
        check(config.updateEffect, v => v && v.render, v => 'updateEffect must be a Effect instance, it was ' + v);
        check(config.ambientSoundVolume, v => typeof v === 'number' && v >= 0, v => 'ambientSoundVolume must be number and in [0, 1], it was ' + v);
        check(config.ambientSound, v => v && v.at, v => 'ambientSound must be a Sound instance, it was ' + v);
        check(config.plans, v => Array.isArray(v), v => 'plans must be an array, it was ' + v);

        for (var i = 0; i < config.plans.length; i++) {
            var plan = config.plans[i];
            check(plan.attribute, v => !v || v.env, v => 'plans[' + i + '].attribute must be null or Attribute, it was ' + v);
            check(plan.boostScale, v => typeof v === 'number' && v > 0, v => 'plans[' + i + '].boostScale must be number and greeter than 0, it was ' + v);
            check(plan.craftEffect, v => v && v.render, v => 'plans[' + i + '].craftEffect must be a Effect instance, it was ' + v);
            check(plan.craftTime, v => typeof v === 'number' && v > 0, v => 'plans[' + i + '].craftTime must be number and greeter than 0, it was ' + v);
            check(plan.consume, v => v != undefined, v => 'plans[' + i + '].consume must be a js object, it was ' + v);
            check(plan.consume.items, v => Array.isArray(v), v => 'plans[' + i + '].consume.items must be an array, it was ' + v);
            check(plan.consume.liquids, v => Array.isArray(v), v => 'plans[' + i + '].consume.liquids must be an array, it was ' + v);
            check(plan.consume.power, v => typeof v === 'number' && v >= 0, v => 'plans[' + i + '].consume.power must be number and greeter equals to 0, it was ' + v);
            check(plan.output, v => v != undefined, v => 'plans[' + i + '].output must be a js object, it was ' + v);
            check(plan.output.items, v => Array.isArray(v), v => 'plans[' + i + '].output.items must be an array, it was ' + v);
            check(plan.output.liquids, v => Array.isArray(v), v => 'plans[' + i + '].output.liquids must be an array, it was ' + v);
            check(plan.output.power, v => typeof v === 'number' && v >= 0, v => 'plans[' + i + '].output.power must be number and greeter equals to 0, it was ' + v);

            for (var j = 0; j < plan.consume.items.length; j++) {
                var itemInfo = plan.consume.items[j];
                check(itemInfo.item, v => v != undefined && v.flammability != undefined,
                    v => 'plans[' + i + '].consume.items[' + j + '].item must be a Item instance, it was ' + v);
                check(itemInfo.number, v => typeof v === 'number' && v > 0,
                    v => 'plans[' + i + '].consume.items[' + j + '].number must be number and greeter than 0, it was ' + v);
            }
            for (var j = 0; j < plan.consume.liquids.length; j++) {
                var liquidInfo = plan.consume.liquids[j];
                check(liquidInfo.liquid, v => v != undefined && v.temperature != undefined,
                    v => 'plans[' + i + '].consume.liquids[' + j + '].liquid must be a Liquid instance, it was ' + v);
                check(liquidInfo.number, v => typeof v === 'number' && v > 0,
                    v => 'plans[' + i + '].consume.liquids[' + j + '].number must be number and greeter than 0, it was ' + v);
            }
        }
    })();

    const plans = [];

    var idGen = 0;
    var block;

    const dumpItems = [];
    const dumpLiquids = [];
    for (var i in config.plans) {
        const plan = config.plans[i];
        for (var j in plan.output.items) {
            const item = plan.output.items[j].item;
            if (dumpItems.indexOf(item) < 0) {
                dumpItems.push(item);
            }
        }
        for (var j in plan.output.liquids) {
            const liquid = plan.output.liquids[j].liquid;
            if (dumpLiquids.indexOf(liquid) < 0) {
                dumpLiquids.push(liquid);
            }
        }
    }
    const inputItems = [];
    const inputLiquids = [];
    for (var i in config.plans) {
        const plan = config.plans[i];
        for (var j in plan.consume.items) {
            const item = plan.consume.items[j].item;
            if (inputItems.indexOf(item) < 0) {
                inputItems.push(item);
            }
        }
        for (var j in plan.consume.liquids) {
            const liquid = plan.consume.liquids[j].liquid;
            if (inputLiquids.indexOf(liquid) < 0) {
                inputLiquids.push(liquid);
            }
        }
    }

    /** 初始化 plan 封装结构 */
    function initPlan(plan) {
        const craftEffect = plan.craftEffect;
        const craftTime = plan.craftTime;
        const boostScale = plan.boostScale;
        const attribute = plan.attribute;

        var id = ++idGen;

        function getData(entity) {
            return entity.getData().planDatas[id];
        }
        function setData(entity, data) {
            return entity.getData().planDatas[id] = data;
        }

        function getAttributeEfficiency(entity) {
            const data = getData(entity);
            const attrSum = data.attrSum;

            if (attribute && boostScale) {
                return 1 + attrSum * boostScale;
            } else {
                return 1;
            }
        }

        function getProgressEfficiency(entity) {
            return entity.edelta() * getAttributeEfficiency(entity);
        }

        function getProgressAddition(entity, craftTime) {
            return 1 / craftTime * getProgressEfficiency(entity);
        }

        function getPowerProgressEfficiency(entity) {
            return entity.delta() * getAttributeEfficiency(entity);
        }

        function eat(entity) {
            const data = getData(entity);

            if (data.itemsEaten) { return true; }
            const consumeItems = plan.consume.items;
            if (!consumeItems || consumeItems.length == 0) {
                return true;
            }
            const items = entity.items;

            var fail = false;
            for (var consume of consumeItems) {
                var r = (consume => {
                    let item = consume.item;
                    if (!items.has(item, consume.amount)) {
                        fail = true;
                        return fail;
                    }
                })(consume)
                if (!r) {
                    break;
                }
            }
            if (!fail) {
                for (var consume of consumeItems) {
                    (consume => {
                        let item = consume.item;
                        items.remove(item, consume.amount);

                    })(consume)
                }
                data.itemsEaten = true;
                return true;
            }
            return false;
        }

        function drink(entity) {
            const consumeLiquids = plan.consume.liquids;
            if (!consumeLiquids || consumeLiquids.length == 0) {
                return true;
            }

            for (var consume of consumeLiquids) {

                var fls = (consume => {
                    const liquid = consume.liquid;
                    const use = Math.min(consume.amount * getProgressAddition(entity, craftTime), entity.block.liquidCapacity);
                    if (entity.liquids == null || entity.liquids.get(liquid) < use) {
                        return false;
                    }
                })(consume);
                if (fls) { return false; }
            }

            for (var consume of consumeLiquids) {

                (consume => {
                    const liquid = consume.liquid;
                    const use = Math.min(consume.amount * getProgressAddition(entity, craftTime), entity.block.liquidCapacity);
                    entity.liquids.remove(liquid, Math.min(use, entity.liquids.get(liquid)));
                })(consume)
            }
            return true;
        }

        function doProduce(entity) {
            const data = getData(entity);

            craftEffect.at(entity.getX() + Mathf.range(entity.block.size * 4), entity.getY() + Mathf.range(entity.block.size * 4));
            const outputItems = plan.output.items;
            const outputLiquids = plan.output.liquids;
            const outputPower = plan.output.power;
            if (outputItems) {
                for (var output of outputItems) {
                    (output => {
                        const item = output.item;
                        const amount = output.amount;
                        for (var j = 0; j < amount; j++) {
                            entity.offload(item);
                        }
                    })(output)
                }
            }

            if (outputLiquids) {
                for (var output of outputLiquids) {
                    (output => {
                        const liquid = output.liquid;
                        const amount = output.amount;
                        entity.handleLiquid(entity, liquid, amount);
                    })(output)
                }
            }

            if (outputPower) {
                data.powerProduceTime += craftTime;
            }

            data.progress = 0;
            data.itemsEaten = false;
        }

        return {
            getId() { return id; },
            getData() { return plan; },
            update(entity) {
                const data = getData(entity);
                data.running = false;

                // if any outputs full, don't update
                const outputItems = plan.output.items;
                const outputLiquids = plan.output.liquids;
                if (outputItems) {
                    for (var item of outputItems) {
                        if (entity.items.get(item.item) >= entity.block.itemCapacity) {
                            return false;
                        }
                    }
                }
                if (outputLiquids) {
                    for (var liquid of outputLiquids) {
                        if (entity.liquids.get(liquid.liquid) >= (entity.block.liquidCapacity - 0.001)) {
                            return false;
                        }
                    }
                }

                data.powerProduceTime = Math.max(0, data.powerProduceTime - getPowerProgressEfficiency(entity));
                if (eat(entity) && drink(entity)) {
                    data.running = true;
                    data.progress += getProgressAddition(entity, craftTime);
                    if (data.progress >= 1) {
                        doProduce(entity);
                    }
                    return true;
                } else {
                    return false;
                }
            },
            shouldConsumePower(entity) {
                const data = getData(entity);
                const running = data.running;

                return (plan.consume.power && running) && entity.enabled;
            },
            getPowerProducing(entity) {
                const data = getData(entity);
                const powerProduceTime = data.powerProduceTime;

                return powerProduceTime > 0 && plan.output.power ? plan.output.power * getPowerProgressEfficiency(entity) : 0;
            },
            init(entity) {
                var data = {
                    progress: 0,
                    running: false,
                    powerProduceTime: 0,
                    attrSum: 0,
                    itemsEaten: false,
                };
                if (attribute) {
                    data.attrSum = block.sumAttribute(attribute, entity.tile.x, entity.tile.y);
                }
                setData(entity, data);
            }
        };
    }

    config.plans.forEach(v => plans.push(initPlan(v)));

    block = new JavaAdapter(Block, {
        init() {
            plans.forEach(plan => {
                const power = plan.getData().consume.power;
                if (power) {
                    this.consumes.powerCond(power, (p => boolf(entity => p.shouldConsumePower(entity)))(plan));
                }
            });
            this.super$init();
        },
        setStats() {
            this.stats.add(Stat.size, "@x@", this.size, this.size);
            this.stats.add(Stat.health, this.health, StatUnit.none);
            if (this.canBeBuilt()) {
                this.stats.add(Stat.buildTime, this.buildCost / 60, StatUnit.seconds);
                this.stats.add(Stat.buildCost, new ItemListValue(false, this.requirements));
            }
            // this.consumes.display(this.stats);

            // Note: Power stats are added by the consumers.
            if (this.hasLiquids) this.stats.add(Stat.liquidCapacity, this.liquidCapacity, StatUnit.liquidUnits);
            if (this.hasItems && this.itemCapacity > 0) this.stats.add(Stat.itemCapacity, this.itemCapacity, StatUnit.items);

            this.stats.add(Stat.output, new JavaAdapter(StatValue, {
                display: (table) => {
                    table.defaults().padLeft(30).left();
                    for (var plan of config.plans) {
                        ((plan) => {
                            table.row();
                            table.table(cons(table => {
                                var first = true;
                                if (plan.consume.items) for (var consume of plan.consume.items) {
                                    if (!first) { table.add(" + ").padRight(4).center().top(); }
                                    (consume => {
                                        const item = consume.item;
                                        const amount = consume.amount;
                                        table.add(amount + '').padRight(4).right().top();
                                        table.image(item.icon(Cicon.medium)).padRight(4).size(3 * 8).left().top();
                                        // table.add(item.localizedName).padRight(4).left().top();
                                    })(consume)
                                    first = false;
                                }
                                if (plan.consume.liquids) for (var consume of plan.consume.liquids) {
                                    if (!first) { table.add(" + ").padRight(4).center().top(); }
                                    (consume => {
                                        const liquid = consume.liquid;
                                        const amount = consume.amount;
                                        table.add(amount + '').padRight(4).right().top();
                                        table.image(liquid.icon(Cicon.medium)).padRight(4).size(3 * 8).left().top();
                                        // table.add(liquid.localizedName).padRight(4).left().top();
                                    })(consume);
                                    first = false;
                                }
                                if (plan.consume.power) {
                                    if (!first) { table.add(" + ").padRight(4).left().top(); }
                                    table.image(Icon.powerSmall).padRight(4).size(3 * 8).right().top();
                                    table.add(plan.consume.power * 60 + '/s').padRight(4).left().top();
                                }
                                table.add(" --> ").padRight(4).left().top();

                                first = true;
                                if (plan.output.items) for (var consume of plan.output.items) {
                                    if (!first) { table.add(" + ").padRight(4).center().top(); }
                                    (consume => {
                                        const item = consume.item;
                                        const amount = consume.amount;
                                        table.add(amount + '').padRight(4).right().top();
                                        table.image(item.icon(Cicon.medium)).padRight(4).size(3 * 8).left().top();
                                        // table.add(item.localizedName).padRight(4).left().top();
                                    })(consume)
                                    first = false;
                                }
                                if (plan.output.liquids) for (var consume of plan.output.liquids) {
                                    if (!first) { table.add(" + ").padRight(4).center().top(); }
                                    (consume => {
                                        const liquid = consume.liquid;
                                        const amount = consume.amount;
                                        table.add(amount + '').padRight(4).right().top();
                                        table.image(liquid.icon(Cicon.medium)).padRight(4).size(3 * 8).left().top();
                                        // table.add(liquid.localizedName).padRight(4).left().top();
                                    })(consume)
                                    first = false;
                                }
                                if (plan.output.power) {
                                    if (!first) { table.add(" + ").padRight(4).center().top(); }
                                    table.image(Icon.powerSmall).padRight(4).size(3 * 8).left().top();
                                    table.add(plan.output.power * 60 + '/s').padRight(4).left().top();
                                }

                                table.add(" (").padRight(4).center().top()
                                table.add((plan.craftTime / 60).toFixed(2)).padRight(4).center().top()
                                table.add("s)").padRight(4).center().top()
                            }));
                            if (plan.attribute && plan.boostScale) {
                                table.row();

                                const stackTable = new Table();
                                Vars.content.blocks()
                                    .select(boolf(f => f.attributes !== undefined && f.attributes.get(plan.attribute) != 0))
                                    .as().with(cons(s => s.sort(floatf(f => f.attributes.get(plan.attribute)))))
                                    .each(cons(block => {
                                        ((block, plan) => {
                                            const multipler = ((block.attributes.get(plan.attribute) * plan.boostScale) * 100)
                                            stackTable.stack(new Image(block.icon(Cicon.medium)).setScaling(Scaling.fit), new Table(cons(t => {
                                                t.top().right().add((multipler < 0 ? "[scarlet]" : "[accent]+") + multipler.toFixed(2) + "%").style(Styles.outlineLabel);
                                            })));
                                        })(block, plan);
                                    }));
                                stackTable.pack();
                                table.add(stackTable);
                                table.row();
                                table.add('').size(8);
                            }
                        })(plan);
                    }
                }
            }));
        },
        setBars() {
            this.bars.add("health", func(e => new Bar("stat.health", Pal.health, floatp(() => e.healthf())).blink(Color.white)));

            if (this.hasPower && this.consumes.hasPower()) {
                var cons = this.consumes.getPower();
                var buffered = cons.buffered;
                var capacity = cons.capacity;

                this.bars.add("power", func(entity => new Bar(
                    prov(() => buffered ? Core.bundle.format("bar.poweramount", Float.isNaN(entity.power.status * capacity) ? "<ERROR>" : parseInt(entity.power.status * capacity)) : Core.bundle.get("bar.power")),
                    prov(() => Pal.powerBar),
                    floatp(() => Mathf.zero(cons.requestedPower(entity)) && entity.power.graph.getPowerProduced() + entity.power.graph.getBatteryStored() > 0 ? 1 : entity.power.status)
                )));
            }

            const liquids = new Set(dumpLiquids.concat(inputLiquids));
            if (liquids && liquids.size > 0) {
                liquids.forEach(liquid => {
                    ((liquid) => {
                        this.bars.add(liquid.name, func((e) => new Bar(
                            // prov(() => liquid.localizedName + ": " + UI.formatAmount(e.liquids.get(liquid)) + ' / ' + UI.formatAmount(e.block.liquidapacity)),
                            // prov(() => Color.acid),
                            liquid.localizedName,
                            liquid.barColor == null ? liquid.color : liquid.barColor,
                            floatp(() => e.liquids.get(liquid) / e.block.liquidCapacity)
                        )));
                    })(liquid);
                });
            }
        },
    }, config.name);
    block.hasItems = true;
    block.hasLiquids = true;
    block.hasPower = true;
    block.update = true;
    block.solid = true;
    block.outputsLiquid = true;
    block.outputsPower = true;
    block.consumesPower = true;
    block.ambientSound = config.ambientSound || Sounds.machine;
    block.ambientSoundVolume = config.ambientSound || 0.05;
    block.sync = true;
    block.itemCapacity = config.itemCapacity;
    block.liquidCapacity = config.liquidCapacity;
    block.flags = EnumSet.of(BlockFlag.factory);

    const updateEffectChance = config.updateEffectChance || 0.04;
    const updateEffect = config.updateEffect || Fx.none;

    block.buildType = prov(() => {
        var data = {
            warmup: 0,
            planDatas: {},
        };
        var updated = false;

        const entity = new JavaAdapter(Building, {
            getData() { return data; },
            init(tile, team, shouldAdd, rotation) {
                this.super$init(tile, team, shouldAdd, rotation);
                plans.forEach(plan => plan.init(this));
                return this;
            },
            draw() {
                if (config.draw) {
                    config.draw(this);
                } else {
                    this.super$draw();
                }
            },
            // display(table) {
            //     // Show item count
            //     this.super$display(table);
            //     if (this.items != null) {
            //         table.row();
            //         table.left();
            //         table.table(cons(l => {
            //             var map = new ObjectMap();
            //             l.update(run(() => {
            //                 l.clearChildren();
            //                 l.left();
            //                 var seq = new Seq(Item);
            //                 this.items.each(new ItemModule.ItemConsumer({
            //                     accept(item, amount) {
            //                         map.put(item, amount);
            //                         seq.add(item);
            //                     }
            //                 }));
            //                 map.each(cons2((item, amount) => {
            //                     l.image(item.icon(Cicon.small)).padRight(3.0);
            //                     l.label(prov(() => '  ' + Strings.fixed(seq.contains(item) ? amount : 0, 0))).color(Color.lightGray);
            //                     l.row();
            //                 }));
            //             }));
            //         })).left();
            //     }
            // },
            acceptItem(source, item) {
                return inputItems.indexOf(item) >= 0 && this.items.get(item) < this.getMaximumAccepted(item);
            },
            acceptLiquid(source, liquid) {
                return inputLiquids.indexOf(liquid) >= 0;
            },
            shouldAmbientSound() {
                return updated;
            },
            updateTile() {
                var updated = false;
                if (this.consValid()) {
                    randomLoop(plans, plan => {
                        if (plan.update(this)) {
                            updated = true;
                        }
                    });
                    if (updated) {
                        // This should be only power
                        this.consume();
                        data.warmup = Mathf.lerpDelta(data.warmup, 1, 0.02);
                        if (Mathf.chanceDelta(updateEffectChance)) {
                            updateEffect.at(this.getX() + Mathf.range(block.size * 4), this.getY() + Mathf.range(block.size * 4));
                        }
                    } else {
                        data.warmup = Mathf.lerp(data.warmup, 0, 0.02);
                    }

                    for (var i in dumpItems) {
                        const item = dumpItems[i];
                        this.dump(item);
                    }
                    for (var i in dumpLiquids) {
                        const liquid = dumpLiquids[i];
                        this.dumpLiquid(liquid);
                    }
                }
            },
            getPowerProduction() {
                return plans.map(plan => plan.getPowerProducing(this)).reduce((v1, v2) => v1 + v2);
            },
            write(write) {
                this.super$write(write);
                write.f(data.warmup);
                var len = 0;
                for (var i in data.planDatas) {
                    len++
                }
                write.s(len);
                for (var id in data.planDatas) {
                    const d = data.planDatas[id];
                    write.s(id);
                    write.f(d.progress);
                    write.bool(d.running);
                    write.f(d.powerProduceTime);
                    write.f(d.attrSum);
                    write.bool(d.itemsEaten);
                }
            },
            read(read, revision) {
                this.super$read(read, revision);
                data.warmup = read.f();
                const length = read.s();
                for (var i = 0; i < length; i++) {
                    const d = {};
                    const id = read.s();
                    d.progress = read.f();
                    d.running = read.bool();
                    d.powerProduceTime = read.f();
                    d.attrSum = read.f();
                    d.itemsEaten = read.bool();
                    data.planDatas[id] = d;
                }
            },
        });
        return entity;
    });
}
/*
defineMultiCrafter({
    name: 'mc-test',
    itemCapacity: 100,
    liquidCapacity: 100,
    updateEffectChance: 0.05,
    updateEffect: Fx.none,
    ambientSound: Sounds.machine,
    ambientSoundVolume: 0.5,
    plans: [
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.blastCompound, amount: 1 }
                ],
                liquids: [
                    { liquid: Liquids.cryofluid, amount: 6 }
                ]
            },
            output: {
                power: 50,
                items: [
                    { item: Items.pyratite, amount: 1 },
                    { item: Items.sporePod, amount: 1 },
                ],
                liquids: [
                    { liquid: Liquids.oil, amount: 3 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 120,
            attribute: Attribute.oil,
            boostScale: 0.5
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.copper, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.sand, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.lead, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.silicon, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.coal, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.titanium, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.scrap, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.thorium, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.sporePod, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.plastanium, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
        {
            consume: {
                power: 0.5,
                items: [
                    { item: Items.pyratite, amount: 1 }
                ]
            },
            output: {
                items: [
                    { item: Items.surgeAlloy, amount: 1 }
                ]
            },
            craftEffect: Fx.flakExplosion,
            craftTime: 1,
        },
    ]
});
*/
