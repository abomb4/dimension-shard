package dimensionshard.types.blocks;

import arc.audio.Sound;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.TextureRegion;
import arc.math.Interp;
import arc.math.Mathf;
import arc.struct.Seq;
import arc.util.Tmp;
import dimensionshard.DsGlobal;
import dimensionshard.DsItems;
import dimensionshard.libs.Lib;
import dimensionshard.types.bullets.IonBoltBulletType;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.entities.Effect;
import mindustry.entities.Mover;
import mindustry.entities.bullet.BulletType;
import mindustry.entities.bullet.LightningBulletType;
import mindustry.gen.Sounds;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.world.blocks.defense.turrets.LiquidTurret;
import mindustry.world.meta.BuildVisibility;

/**
 * 离子炮
 *
 * @author abomb4 2022-10-07
 */
@SuppressWarnings("FieldMayBeFinal")
public class IonBoltTurret extends LiquidTurret {

    /** 两侧闪电 */
    public static final LightningBulletType ionBoltTurretLightning = new LightningBulletType() {
        @Override
        public void init() {
            this.lightningLength = 14;
            this.lightningLengthRand = 6;
            this.lightningColor = DsItems.ionLiquid.color;
            this.damage = 20;
            super.init();
        }
    };
    /** 两侧射击效果 */
    public static final Effect lightningBulletTypeShootEffect = Fx.lightningShoot;
    /** 两侧射击声音 */
    public static final Sound lightningBulletShootSound = Sounds.spark;

    /** 液体贴图 */
    private TextureRegion liquidRegion;
    /** 上层贴图 */
    private TextureRegion topRegion;
    /** 液体充能贴图 */
    private Seq<TextureRegion> chargeRegions = new Seq<>(3);

    public IonBoltTurret(String name) {
        super(name);
        this.recoil = 2;
        this.liquidCapacity = 10;
        this.buildVisibility = BuildVisibility.shown;
        this.category = Category.turret;
        this.health = 3000;
        this.size = 4;
        this.reload = 60;
        this.range = 220;
        this.inaccuracy = 2;
        this.shoot.shots = 3;
        this.rotateSpeed = 8;
        this.shoot.shotDelay = 6;
        this.xRand = 0;
        this.shootSound = Lib.loadSound("ion-shot");
        this.loopSound = Sounds.none;
        this.requirements = ItemStack.with(
            Items.lead, 1200,
            Items.metaglass, 400,
            Items.graphite, 500,
            Items.plastanium, 120,
            Items.surgeAlloy, 300,
            DsItems.timeCrystal, 180,
            DsItems.hardThoriumAlloy, 400
        );
        this.ammo(DsItems.ionLiquid, new IonBoltBulletType() {{
            this.ammoMultiplier = 2;
            this.buildingDamageMultiplier = 0.3F;
        }});
    }

    @Override
    public void load() {
        super.load();
        this.liquidRegion = Lib.loadRegion("ion-bolt-turret-liquid");
        this.topRegion = Lib.loadRegion("ion-bolt-turret-top");
        if (!this.chargeRegions.isEmpty()) {
            this.chargeRegions.removeAll(textureRegion -> true);
        }
        this.chargeRegions.add(Lib.loadRegion("ion-bolt-turret-charge-1"));
        this.chargeRegions.add(Lib.loadRegion("ion-bolt-turret-charge-2"));
        this.chargeRegions.add(Lib.loadRegion("ion-bolt-turret-charge-3"));
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

    public class IonBoltTurretBuild extends LiquidTurret.LiquidTurretBuild {

        @Override
        protected void bullet(BulletType type, float xOffset, float yOffset, float angleOffset, Mover mover) {
            super.bullet(type, xOffset, yOffset, angleOffset, mover);
            float angle = this.rotation + angleOffset;
            Tmp.v1.trns(angle + 60, 15);
            Tmp.v2.trns(angle - 60, 15);
            float x1 = this.x + Tmp.v1.x;
            float y1 = this.y + Tmp.v1.y;
            float x2 = this.x + Tmp.v2.x;
            float y2 = this.y + Tmp.v2.y;
            ionBoltTurretLightning.create(this, this.team, x1, y1, angle);
            ionBoltTurretLightning.create(this, this.team, x2, y2, angle);
            lightningBulletTypeShootEffect.at(x1, y1, angle);
            lightningBulletTypeShootEffect.at(x2, y2, angle);
            lightningBulletShootSound.at(this.x, this.y);
        }

        @Override
        public void updateTile() {
            super.updateTile();
            // // Do reload if has ammo.
            // if (this.hasAmmo() && this.reloadCounter < IonBoltTurret.this.reload) {
            //     this.reloadCounter += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
            // }
        }

        // @Override
        // public boolean acceptLiquid(Building source, Liquid liquid) {
        //     var ammoTypes = IonBoltTurret.this.ammoTypes;
        //     var liquids = this.liquids;
        //     return ammoTypes.get(liquid) != null
        //         && (liquids.current() == liquid || (ammoTypes.containsKey(liquid)
        //         && (ammoTypes.get(liquids.current()) != null ||
        //         liquids.get(liquids.current()) <= 1 / ammoTypes.get(liquids.current()).ammoMultiplier + 0.001)
        //     ));
        // }

        @Override
        public void draw() {
            super.draw();
            var tr2 = this.recoilOffset;
            Drawf.liquid(
                IonBoltTurret.this.liquidRegion, this.x + tr2.x, this.y + tr2.y,
                this.liquids.currentAmount() / IonBoltTurret.this.liquidCapacity, this.liquids.current().color,
                this.rotation - 90);
            Draw.rect(IonBoltTurret.this.topRegion, this.x + tr2.x, this.y + tr2.y, this.rotation - 90);

            float loadPercentLen = Math.max(0, (this.reloadCounter / ((IonBoltTurret) this.block).reload * 1.4F - 0.4F))
                * IonBoltTurret.this.chargeRegions.size;

            Draw.z(Layer.turret);
            for (int i = 0; i < IonBoltTurret.this.chargeRegions.size; i++) {
                Draw.alpha(Interp.pow2In.apply(Mathf.clamp(loadPercentLen - i, 0.0F, 1.2F)));
                Draw.rect(IonBoltTurret.this.chargeRegions.get(i), this.x + tr2.x, this.y + tr2.y, this.drawrot());
            }
        }
    }
}
