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
        buildingOverrides: {},
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

    var buildingType;
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

    lib.setBuildingSimple(block, buildingType, Object.assign({
        turnToTarget(targetRot) {
            this.rotation = targetRot;
        },
        // I think the default udpatShooting and updateCooling is wrong, so modify it.
        updateShooting() {
            if (this.reload >= this.block.reloadTime) {
                var type = this.peekAmmo();
                this.shoot(type);
                this.reload = 0;
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
    }, options.buildingOverrides));

    for (var p of TURRET_PROPERTIES) {
        var value = options[p];
        if (value !== undefined && value !== null) {
            block[p] = value;
        }
    }
    return block;
};
