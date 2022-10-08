package dimensionshard.world.blocks;

import arc.graphics.Color;
import arc.graphics.g2d.TextureRegion;
import arc.math.Mathf;
import dimensionshard.DsGlobal;
import dimensionshard.DsItems;
import dimensionshard.entities.bullets.ElectricStormBulletType;
import dimensionshard.libs.Lib;
import mindustry.content.Items;
import mindustry.entities.Mover;
import mindustry.entities.bullet.BulletType;
import mindustry.entities.pattern.ShootSpread;
import mindustry.gen.Bullet;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.world.blocks.defense.turrets.ItemTurret;
import mindustry.world.meta.BuildVisibility;

/**
 * 闪电风暴炮塔
 *
 * @author abomb4 2022-10-08
 */
public class ElectricStormTurret extends ItemTurret {

    /** 中心 */
    public TextureRegion middleRegion;
    /** 中心发热 */
    public TextureRegion middleHeatRegion;
    /** 垂直方向速度随机 */
    public float velocityInaccuracy = 0.8F;

    public ElectricStormTurret(String name) {
        super(name);
        buildVisibility = BuildVisibility.shown;
        category = Category.turret;
        liquidCapacity = 120;
        health = 7200;
        size = 5;
        reload = 150 - 1;
        range = 400;
        inaccuracy = 6;
        this.shoot = new ShootSpread(8, 45);
        rotateSpeed = 1000;
        // velocityInaccuracy = 0.8;
        shootCone = 360;
        heatColor = Color.valueOf("69dcee");
        shootSound = Lib.loadSound("electric-shot");
        requirements = ItemStack.with(
            Items.copper, 2500,
            Items.lead, 2000,
            Items.metaglass, 1500,
            Items.silicon, 1200,
            Items.plastanium, 1000,
            Items.phaseFabric, 800,
            Items.surgeAlloy, 1000,
            DsItems.dimensionShard, 1600,
            DsItems.hardThoriumAlloy, 800,
            DsItems.dimensionAlloy, 300
        );
        coolantMultiplier = 0.15F;
        consumeCoolant(2);
        ammo(DsItems.dimensionAlloy, new ElectricStormBulletType() {{
            speedStart = 0.8F;
            homingDelay = 30;
            lifetime = 150;
            homingRange = 4000;
            ammoMultiplier = 2;
        }});
        consumePowerDynamic(building -> ((ElectricStormTurretBuild) building).isActive() ? 75 : 0);
    }

    @Override
    public void load() {
        super.load();
        this.middleRegion = Lib.loadRegion("electric-storm-turret-middle");
        this.middleHeatRegion = Lib.loadRegion("electric-storm-turret-middle-heat");
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

    public class ElectricStormTurretBuild extends ItemTurret.ItemTurretBuild {
        /** 旋转角度 */
        public float drawRotate = 0;
        /** 加速度 */
        public float drawRotateAccel = 0;

        @Override
        public void updateTile() {
            super.updateTile();
            // rotate if has ammo
            if (this.hasAmmo()) {
                this.drawRotateAccel = Mathf.lerpDelta(this.drawRotateAccel, 0.4F, 0.02F);
            } else {
                this.drawRotateAccel = Mathf.lerpDelta(this.drawRotateAccel, 0, 0.02F);
            }
            this.drawRotate += this.drawRotateAccel;
        }

        @Override
        protected void bullet(BulletType type, float xOffset, float yOffset, float angleOffset, Mover mover) {
            super.bullet(type, xOffset, yOffset, angleOffset, mover);
        }

        @Override
        protected void handleBullet(Bullet bullet, float offsetX, float offsetY, float angleOffset) {
            if ((targetPos != null && targetPos.getX() != 0 && targetPos.getY() != 0)
                && (this.isControlled() || this.logicShooting)
                && bullet.type instanceof ElectricStormBulletType ebullet) {
                ((ElectricStormBulletType.ElectricStormBulletData) bullet.data).target = targetPos;
            }
        }
    }
}
