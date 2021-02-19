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

const TURRET_PROPERTIES = [
    'absorbLasers', 'acceptCoolant', 'acceptsItems', 'albedo', 'alternate',
    'alwaysReplace', 'alwaysUnlocked', 'ambientSound', 'ambientSoundVolume', 'ammoEjectBack',
    'ammoPerShot', 'ammoUseEffect', 'autoResetEnabled', 'baseExplosiveness', 'baseRegion',
    'breakSound', 'breakable', 'buildCost', 'buildCostMultiplier', 'buildType',
    'buildVisibility', 'burstSpacing', 'cacheLayer', 'canOverdrive', 'category',
    'chargeBeginEffect', 'chargeEffect', 'chargeEffects', 'chargeMaxDelay', 'chargeSound',
    'chargeTime', 'configurable', 'configurations', 'consumesPower', 'consumesTap',
    'conveyorPlacement', 'coolEffect', 'coolantMultiplier', 'coolantUsage', 'cooldown',
    'deconstructThreshold', 'description', 'destructible', 'details', 'displayFlow',
    'drawDisabled', 'drawLiquidLight', 'drawer', 'editorIcon', 'editorVariantRegions',
    'emitLight', 'enableDrawStatus', 'expanded', 'fillsTile', 'flags',
    'floating', 'generatedIcons', 'group', 'hasColor', 'hasItems',
    'hasLiquids', 'hasPower', 'hasShadow', 'health', 'heatColor',
    'heatDrawer', 'heatRegion', 'iconId', 'inEditor', 'inaccuracy',
    'inlineDescription', 'instantTransfer', 'insulated', 'itemCapacity', 'lastConfig',
    'lightColor', 'lightRadius', 'liquidCapacity', 'liquidPressure', 'localizedName',
    'logicConfigurable', 'loopSound', 'loopSoundVolume', 'mapColor', 'maxAmmo',
    'minRange', 'minfo', 'noUpdateDisabled', 'offset', 'outlineColor',
    'outlineIcon', 'outputFacing', 'outputsLiquid', 'outputsPayload', 'outputsPower',
    'placeableLiquid', 'placeableOn', 'priority', 'quickRotate', 'range',
    'rebuildable', 'recoilAmount', 'region', 'reloadTime', 'requirements',
    'requiresWater', 'researchCostMultiplier', 'restitution', 'rotate', 'rotateSpeed',
    'saveConfig', 'saveData', 'shootCone', 'shootEffect', 'shootShake',
    'shootSound', 'shots', 'size', 'smokeEffect', 'solid',
    'solidifes', 'spread', 'squareSprite', 'stats', 'subclass',
    'sync', 'targetAir', 'targetGround', 'targetInterval', 'targetable',
    'teamRegion', 'teamRegions', 'timers', 'tr', 'tr2',
    'unitCapModifier', 'unitSort', 'unloadable', 'update', 'useColor',
    'variantRegions', 'velocityInaccuracy', 'xRand',
];
exports.TURRET_PROPERTIES = TURRET_PROPERTIES;
const LIQUID_CONVERTER_PROPERTIES = [
    'absorbLasers', 'acceptsItems', 'albedo', 'alwaysReplace', 'alwaysUnlocked',
    'ambientSound', 'ambientSoundVolume', 'autoResetEnabled', 'baseExplosiveness',
    'breakable', 'breakSound', 'buildCost', 'buildCostMultiplier',
    'buildType', 'buildVisibility', 'cacheLayer', 'canOverdrive', 'category',
    'configurable', 'configurations', 'consumesPower', 'consumesTap',
    'conveyorPlacement', 'craftEffect', 'craftTime', 'deconstructThreshold', 'description',
    'destructible', 'details', 'displayFlow', 'drawDisabled',
    'drawer', 'drawLiquidLight', 'editorIcon', 'emitLight', 'enableDrawStatus',
    'expanded', 'fillsTile', 'flags', 'floating', 'group',
    'hasColor', 'hasItems', 'hasLiquids', 'hasPower', 'hasShadow',
    'health', 'iconId', 'id', 'inEditor', 'inlineDescription',
    'instantTransfer', 'insulated', 'itemCapacity', 'lastConfig', 'lightColor',
    'lightRadius', 'liquidCapacity', 'liquidPressure', 'localizedName', 'logicConfigurable',
    'loopSound', 'loopSoundVolume', 'mapColor', 'minfo',
    'noUpdateDisabled', 'offset', 'outlineColor', 'outlineIcon',
    'outputFacing', 'outputItem', 'outputLiquid', 'outputsLiquid', 'outputsPayload',
    'outputsPower', 'placeableLiquid', 'placeableOn', 'priority', 'quickRotate',
    'rebuildable', 'region', 'requirements', 'requiresWater', 'researchCostMultiplier',
    'rotate', 'saveConfig', 'saveData', 'size', 'solid',
    'solidifes', 'squareSprite', 'stats', 'subclass', 'swapDiagonalPlacement',
    'sync', 'targetable', 'teamRegion', 'teamRegions', 'timers',
    'unitCapModifier', 'unloadable', 'update', 'updateEffect', 'updateEffectChance',
    'useColor'
];
exports.LIQUID_CONVERTER_PROPERTIES = LIQUID_CONVERTER_PROPERTIES;

/**
 * 无需旋转的炮塔
 *
 * @param {object} requestOptions
 */
exports.newNoRotatingTurret = (requestOptions) => {
    const options = Object.assign({
        turretType: ItemTurret,
        buildVisibility: BuildVisibility.shown,
        shootCone: 360,
        buildingOverrides: () => ({}),
        blockOverrides: {},
        drawer: cons(building => Draw.rect(building.block.region, building.x, building.y)),
        heatDrawer: cons(building => {
            if (building.heat <= 0.00001) return;

            Draw.color(building.block.heatColor, building.heat);
            Draw.blend(Blending.additive);
            Draw.rect(building.block.heatRegion, building.x, building.y);
            Draw.blend();
            Draw.color();
        }),
    }, requestOptions);

    if (!options.name) {
        throw 'Name not defined.';
    }

    let buildingType;
    switch (options.turretType) {
        case ItemTurret:
            buildingType = ItemTurret.ItemTurretBuild;
            break;
        case LaserTurret:
            buildingType = LaserTurret.LaserTurretBuild;
            break;
        case PowerTurret:
            buildingType = PowerTurret.PowerTurretBuild;
            break;
        case LiquidTurret:
            buildingType = LiquidTurret.LiquidTurretBuild;
            break;
        default:
            throw 'Turret type ' + options.turretType + ' is not supported.';
    }

    const block = extend(options.turretType, options.name, Object.assign({
    }, options.blockOverrides));

    lib.setBuilding(block, block => {
        const overrides = options.buildingOverrides();
        return new JavaAdapter(buildingType, Object.assign({
            turnToTarget(targetRot) {
                this.rotation = targetRot;
            },
            // I think the default udpatShooting and updateCooling is wrong, so modify it.
            updateShooting() {
                if (this.reload >= this.block.reloadTime) {
                    let type = this.peekAmmo();
                    this.shoot(type);
                    this.reload -= this.block.reloadTime;
                }
            },
            updateTile() {
                this.super$updateTile();
                // Do reload if has ammo.
                if (this.hasAmmo() && this.reload < this.block.reloadTime) {
                    this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
                }
            },
            draw() {
                const {
                    baseRegion, region, size, drawer, heatRegion, heatDrawer
                } = this.block;
                const { x, y } = this;
                Draw.rect(baseRegion, x, y);
                Draw.color();

                Draw.z(Layer.turret);

                // Drawf.shadow(region, x - (size / 2), y - (size / 2), 0);
                drawer.get(this);

                if (heatRegion != Core.atlas.find("error")) {
                    heatDrawer.get(this);
                }
            },
        }, overrides), block)
    });

    for (let p of TURRET_PROPERTIES) {
        let value = options[p];
        if (value !== undefined && value !== null) {
            block[p] = value;
        }
    }
    return block;
};

/**
 * Liquid converter with convert ratio
 *
 * @param {object} requestOptions
 */
exports.newLiquidConverter = (requestOptions) => {
    const options = Object.assign({
        buildVisibility: BuildVisibility.shown,
        convertRatio: 1,
        drawLiquidLight: true,
        consumes: consumes => {},
        buildingOverrides: () => ({}),
        blockOverrides: {},
    }, requestOptions);

    if (!options.name) {
        throw 'Name not defined.';
    }

    const block = extend(LiquidConverter, options.name, Object.assign({
        init() {
            this.super$init();
            let cl = this.consumes.get(ConsumeType.liquid);
            this.outputLiquid.amount = cl.amount * options.convertRatio;
        },
    }, options.blockOverrides));

    lib.setBuildingSimple(block, LiquidConverter.LiquidConverterBuild, block => Object.assign({
        updateTile() {
            let cl = this.block.consumes.get(ConsumeType.liquid);
            if (this.cons.valid()) {
                let use = Math.min(cl.amount * this.edelta(), this.block.liquidCapacity - this.liquids.get(this.block.outputLiquid.liquid));
                this.liquids.remove(cl.liquid, Math.min(use, this.liquids.get(cl.liquid)));
                this.progress += use / cl.amount;
                this.liquids.add(this.block.outputLiquid.liquid, use * options.convertRatio);
                if (this.progress >= this.block.craftTime) {
                    this.consume();
                    this.progress %= this.block.craftTime;
                }
            }
            this.dumpLiquid(this.block.outputLiquid.liquid);
        }
    }, options.buildingOverrides()));

    options.consumes(block.consumes);

    for (let p of LIQUID_CONVERTER_PROPERTIES) {
        let value = options[p];
        if (value !== undefined && value !== null) {
            block[p] = value;
        }
    }
    return block;
}
