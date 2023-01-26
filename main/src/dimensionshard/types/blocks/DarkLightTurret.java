package dimensionshard.types.blocks;

import arc.Core;
import arc.graphics.Color;
import arc.math.Angles;
import arc.math.Mathf;
import arc.util.Nullable;
import arc.util.Strings;
import arc.util.Time;
import dimensionshard.DsCall;
import dimensionshard.DsFx;
import dimensionshard.DsGlobal;
import dimensionshard.DsItems;
import dimensionshard.libs.Lib;
import dimensionshard.types.bullets.DarkLightBulletType;
import mindustry.Vars;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.content.Liquids;
import mindustry.entities.Effect;
import mindustry.entities.bullet.BulletType;
import mindustry.gen.Bullet;
import mindustry.gen.Tex;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.type.Liquid;
import mindustry.world.blocks.defense.turrets.PowerTurret;
import mindustry.world.meta.BuildVisibility;
import mindustry.world.meta.Stat;
import mindustry.world.meta.StatUnit;

import static mindustry.Vars.tilesize;

/**
 * @author abomb4 2022-10-09
 */
public class DarkLightTurret extends PowerTurret {

    public float shootDuration;

    public float chargeEffects;
    public Effect chargeEffect;

    public DarkLightTurret(String name) {
        super(name);
        this.buildVisibility = BuildVisibility.shown;
        this.category = Category.turret;
        this.liquidCapacity = 30;
        this.range = 40 * 8;
        this.shootCone = 4;
        this.canOverdrive = false;
        this.chargeEffects = 0;
        this.chargeEffect = DsFx.fxDarkLightCharge;
        this.recoil = 2;
        this.reload = 60 * 7.5F;
        this.cooldownTime = 60F;
        this.consumePower(90);
        this.shake = 3;
        this.shootEffect = Fx.hitLancer;
        this.smokeEffect = Fx.none;
        this.heatColor = Color.valueOf("a955f7");
        this.shootType = new DarkLightBulletType() {{
            this.buildingDamageMultiplier = 0.3F;
        }};

        this.shoot.firstShotDelay = 80;
        this.shootDuration = 60 * 5F;

        this.size = 5;
        this.health = 6000;
        this.loopSoundVolume = 1;
        this.consumeCoolant(1).update(false);
        this.coolantMultiplier = 0.5F;

        this.requirements = ItemStack.with(
            Items.copper, 2100,
            Items.lead, 2000,
            Items.graphite, 1800,
            Items.silicon, 1000,
            Items.phaseFabric, 850,
            Items.surgeAlloy, 320,
            DsItems.spaceCrystal, 800,
            DsItems.timeCrystal, 220,
            DsItems.hardThoriumAlloy, 600,
            DsItems.dimensionAlloy, 400
        );
    }

    @Override
    public void load() {
        super.load();
        this.chargeSound = Lib.loadSound("dark-light-charge");
        this.loopSound = Lib.loadSound("dark-light-loop");
        this.shootSound = Lib.loadSound("dark-light-shoot");
    }

    @Override
    public void setStats() {
        super.setStats();
        this.stats.remove(Stat.input);
        this.stats.remove(Stat.booster);
        var block = this;
        this.stats.add(Stat.input, table -> {
            var multiplier = block.coolantMultiplier;
            table.row();
            table.table(c -> {
                var len = Vars.content.liquids().size;
                for (var i = 0; i < len; i++) {
                    var liquid = Vars.content.liquids().get(i);
                    if (!block.consumesLiquid(liquid)) {
                        continue;
                    }
                    c.image(liquid.uiIcon).size(3 * 8).padRight(4).right().top();
                    c.add(liquid.localizedName).padRight(10).left().top();
                    c.table(Tex.underline, bt -> {
                        bt.left().defaults().padRight(3).left();
                        var result = 1 + (liquid.heatCapacity - Liquids.water.heatCapacity) * multiplier;
                        bt.add(Core.bundle.format("bullet.reload", Strings.autoFixed(result, 2)));
                    }).left().padTop(-9);
                    c.row();
                }
            }).colspan(table.getColumns());
            table.row();
        });
        this.stats.remove(Stat.ammo);
        this.stats.add(Stat.damage, this.shootType.damage * 60 / 5, StatUnit.perSecond);
        this.stats.add(Stat.cooldownTime,
            this.reload / 60 + " + " + Strings.autoFixed(this.shoot.firstShotDelay / 60, 2) + " s");
        this.stats.add(Stat.lightningDamage, this.shootType.lightningDamage, StatUnit.none);

    }

    @Override
    public boolean isPlaceable() {
        return DsGlobal.techDsAvailable() && super.isPlaceable();
    }

    @Override
    public void drawPlace(int x, int y, int rotation, boolean valid) {
        if (!DsGlobal.techDsAvailable()) {
            this.drawPlaceText(Lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
            return;
        }
        super.drawPlace(x, y, rotation, valid);
    }

    public class DarkLightTurretBuild extends PowerTurret.PowerTurretBuild {

        public BulletEntry bulletEntry;

        public DarkLightTurretBuild() {
            this.reloadCounter = 0.1F;
        }

        @Override
        public boolean shouldTurn() {
            return !this.charging() && !this.shouldActiveSound();
        }

        @Override
        protected void updateCooling() {
            //do nothing, cooling is irrelevant here
        }

        @Override
        public boolean shouldConsume() {
            //still consumes power when bullet is around
            return this.bulletEntry != null || this.isActive() || this.isShooting();
        }

        @Override
        public float progress() {
            return 1f - Mathf.clamp(this.reloadCounter / DarkLightTurret.this.reload);
        }

        @Override
        protected void updateReload() {
            //updated in updateTile() depending on coolant
        }

        @Override
        public void updateTile() {
            super.updateTile();

            if (this.bulletEntry != null) {
                var b = this.bulletEntry;
                if (!b.bullet.isAdded() || b.bullet.type == null || b.life <= 0f || b.bullet.owner != this) {
                    this.bulletEntry = null;
                }
            }
            if (this.bulletEntry != null) {

                float bulletX = this.x + Angles.trnsx(
                    this.rotation - 90, DarkLightTurret.this.shootX + this.bulletEntry.x,
                    DarkLightTurret.this.shootY + this.bulletEntry.y);
                float bulletY = this.y + Angles.trnsy(
                    this.rotation - 90, DarkLightTurret.this.shootX + this.bulletEntry.x,
                    DarkLightTurret.this.shootY + this.bulletEntry.y),
                    angle = this.rotation + this.bulletEntry.rotation;

                this.bulletEntry.bullet.rotation(angle);
                this.bulletEntry.bullet.set(bulletX, bulletY);
                this.bulletEntry.bullet.time =
                    this.bulletEntry.bullet.type.lifetime * this.bulletEntry.bullet.type.optimalLifeFract;
                this.bulletEntry.bullet.keepAlive = true;
                this.bulletEntry.life -= Time.delta / Math.max(this.efficiency, 0.00001f);

                this.wasShooting = true;
                this.heat = 1f;
                this.curRecoil = 1f;
            } else if (this.reloadCounter > 0) {
                this.wasShooting = true;

                if (DarkLightTurret.this.coolant != null) {
                    //TODO does not handle multi liquid req?
                    Liquid liquid = this.liquids.current();
                    float maxUsed = DarkLightTurret.this.coolant.amount;
                    float used =
                        (this.cheating() ? maxUsed : Math.min(this.liquids.get(liquid), maxUsed)) * this.delta();
                    // 此处修改为将 water 视为标准 1 的冷却
                    float reduceHeat = used * (1 + (liquid.heatCapacity - Liquids.water.heatCapacity)) *
                        DarkLightTurret.this.coolantMultiplier;
                    this.reloadCounter -= reduceHeat;
                    this.liquids.remove(liquid, used);

                    if (Mathf.chance(0.06 * used)) {
                        DarkLightTurret.this.coolEffect.at(
                            this.x + Mathf.range(DarkLightTurret.this.size * tilesize / 2f),
                            this.y + Mathf.range(DarkLightTurret.this.size * tilesize / 2f));
                    }
                } else {
                    this.reloadCounter -= this.edelta();
                }
            }
        }

        @Override
        protected void updateShooting() {
            if (this.bulletEntry != null) {
                return;
            }

            if (this.reloadCounter <= 0 && this.efficiency > 0 && !this.charging() &&
                this.shootWarmup >= DarkLightTurret.this.minWarmup) {
                if (Vars.net.client()) {
                    return;
                }
                var type = this.peekAmmo();
                DsCall.darkLightShot(this.tile.pos(), this.rotation);
                this.shoot(type);
                this.reloadCounter = DarkLightTurret.this.reload;
            }
        }

        @Override
        protected void turnToTarget(float targetRot) {
            this.rotation = Angles.moveToward(this.rotation, targetRot,
                DarkLightTurret.this.rotateSpeed * this.delta() * (this.bulletEntry != null ? 0 : 1f));
        }

        @Override
        protected void handleBullet(@Nullable Bullet bullet, float offsetX, float offsetY, float angleOffset) {
            if (bullet != null) {
                this.bulletEntry = new BulletEntry(bullet, offsetX, offsetY, angleOffset,
                    DarkLightTurret.this.shootDuration);
            }
        }

        @Override
        protected void shoot(BulletType type) {
            super.shoot(type);
            float bulletX =
                this.x + Angles.trnsx(this.rotation - 90, DarkLightTurret.this.shootX, DarkLightTurret.this.shootY);
            float bulletY =
                this.y + Angles.trnsy(this.rotation - 90, DarkLightTurret.this.shootX, DarkLightTurret.this.shootY);
            DarkLightTurret.this.chargeEffect.at(bulletX, bulletY, this.rotation);
            DarkLightTurret.this.chargeSound.at(bulletX, bulletY, this.rotation);
        }

        @Override
        public float activeSoundVolume() {
            return DarkLightTurret.this.loopSoundVolume;
        }

        @Override
        public boolean shouldActiveSound() {
            return this.bulletEntry != null;
        }

        /**
         * 接收来自服务端的射击信号
         *
         * @param rotation 射击角度
         */
        public void serverShot(float rotation) {
            this.rotation = rotation;
            this.shoot(this.peekAmmo());
            this.reloadCounter = DarkLightTurret.this.reload;
        }
    }
}
