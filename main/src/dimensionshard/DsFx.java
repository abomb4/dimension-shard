package dimensionshard;

import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Angles;
import arc.math.Mathf;
import mindustry.entities.Effect;
import mindustry.graphics.Drawf;
import mindustry.graphics.Pal;

/**
 * 特效
 *
 * @author abomb4 2022-10-07
 */
public final class DsFx {

    /** 次元碎片破片武器爆炸 */
    public static final Effect fxDimensionShardExplosion = new Effect(24, e -> {
        Draw.color(DsColors.dimensionShardColorLight);

        e.scaled(7, i -> {
            Lines.stroke(3 * i.fout());
            Lines.circle(e.x, e.y, 3 + i.fin() * 24);
        });

        Draw.color(Color.gray);

        Angles.randLenVectors(e.id, 7, 2 + 28 * e.finpow(), (x, y) -> {
            Fill.circle(e.x + x, e.y + y, e.fout() * 4 + 0.5F);
        });

        Draw.color(DsColors.dimensionShardColor);
        Lines.stroke(1 * e.fout());

        Angles.randLenVectors(e.id + 1, 4, 1 + 25 * e.finpow(), (x, y) -> {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 3);
        });
    });

    /** 单位身上挂时间流体 */
    public static final Effect fxTimeFreezing = new Effect(40, e -> {
        Draw.color(Color.valueOf("5b2467"));

        Angles.randLenVectors(e.id, 2, 1 + e.fin() * 2, (x, y) -> {
            Fill.circle(e.x + x, e.y + y, e.fout() * 1.2F);
        });
    });

    /** 单位离子灼烧 */
    public static final Effect fxIonBurning = new Effect(35, e -> {
        Draw.color(Color.valueOf("cee0e9"));

        Lines.stroke(0.3F + e.fout() * 0.5F);
        Angles.randLenVectors(e.id, 5, e.fin() * 22, (x, y) -> {
            var ang = Mathf.angle(x, y);
            Lines.lineAngle(e.x + x, e.y + y, ang, e.fin() * 0.5F + 1);
        });
    });

    /** 白色电弧效果数据类 */
    public static class FxLightningLineEffectData {
        /** 起点 x */
        public float p1x;
        /** 起点 y */
        public float p1y;
        /** 终点 x */
        public float p2x;
        /** 终点 y */
        public float p2y;

        public FxLightningLineEffectData(float p1x, float p1y, float p2x, float p2y) {
            this.p1x = p1x;
            this.p1y = p1y;
            this.p2x = p2x;
            this.p2y = p2y;
        }
    }

    /** 白色电弧 */
    public static final Effect fxLightningLine = new Effect(8, 500, e -> {
        if (e.data instanceof FxLightningLineEffectData data) {
            Lines.stroke(3 * e.fout());
            Draw.color(e.color, Color.white, e.fin());

            Lines.line(data.p1x, data.p1y, data.p2x, data.p2y, false);
            Fill.circle(data.p1x, data.p1y, Lines.getStroke() / 2);
            Fill.circle(data.p2x, data.p2y, Lines.getStroke() / 2);
        }
    });

    /** ‘黑洞’ */
    public static final Effect fxBlackHoleExplode = new Effect(8, 80, e -> {
        e.scaled(7, (i -> {
            Lines.stroke(3 * i.fout());
            Lines.circle(e.x, e.y, 3 + i.fin() * 60);
        }));

        Draw.color(DsColors.spaceCrystalColor);

        Angles.randLenVectors(e.id, 6, 2 + 19 * e.finpow(), (x, y) -> {
            Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5F);
            Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
        });

        Draw.color(DsColors.spaceCrystalColor, DsColors.spaceCrystalColorLight, DsColors.spaceCrystalColorLight,
            e.fin());
        Lines.stroke(1.5F * e.fout());

        Angles.randLenVectors(e.id + 1, 8, 1 + 46 * e.finpow(), (x, y) -> {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
        });
    });

    /** 伤害型‘黑洞’ */
    public static final Effect fxBlackHoleExplodeDamaged = new Effect(14, 160, e -> {
        e.scaled(7, (i -> {
            Lines.stroke(3 * i.fout());
            Lines.circle(e.x, e.y, 3 + i.fin() * 60);
        }));

        Draw.color(DsColors.spaceCrystalColor);

        Angles.randLenVectors(e.id, 6, 2 + 119 * e.finpow(), (x, y) -> {
            Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5F);
            Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
        });

        Draw.color(DsColors.spaceCrystalColor, DsColors.spaceCrystalColorLight, DsColors.spaceCrystalColorLight,
            e.fin());
        Lines.stroke(1.5F * e.fout());

        Angles.randLenVectors(e.id + 1, 8, 1 + 146 * e.finpow(), (x, y) -> {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
        });
    });

    /** 黑光击中 */
    public static final Effect fxDarkLightHit = new Effect(12, e -> {

        Draw.color(Color.valueOf("a108f5"));
        Lines.stroke(e.fout() * 1.5F);

        Angles.randLenVectors(e.id, 8, e.finpow() * 17, e.rotation, 360, ((x, y) -> {
            var ang = Mathf.angle(x, y);
            Lines.lineAngle(e.x + x, e.y + y, ang, e.fout() * 4 + 1);
        }));
    });

    /** 黑光憋气 */
    public static final Effect fxDarkLightCharge = new Effect(90, 100, e -> {
        Draw.color(DsColors.purple);
        Lines.stroke(e.fin() * 2);
        Lines.circle(e.x, e.y, 4 + e.fout() * 70);

        Draw.alpha(0.5F);
        Fill.circle(e.x, e.y, e.fin() * 15);

        Draw.alpha(1);
        Angles.randLenVectors(e.id, 15, 30 * e.fout(), (x, y) ->
            Fill.circle(e.x + x, e.y + y, e.fin() * 5));

        Draw.color(DsColors.laserColor3);
        Fill.circle(e.x, e.y, e.fin() * 8);

    });

    /** 呃罩打空间结晶射击轨道 */
    public static final Effect fxForeshadowSpaceShootTrial = new Effect(24, e -> {
        for (var i = 0; i < 2; i++) {
            Draw.color(i == 0 ? DsColors.spaceCrystalColor : DsColors.spaceCrystalColorLight);

            float m = i == 0 ? 1 : 0.5F;

            float rot = e.rotation + 180;
            float w = 15F * e.fout() * m;
            Drawf.tri(e.x, e.y, w, (30 + Mathf.randomSeedRange(e.id, 15)) * m, rot);
            Drawf.tri(e.x, e.y, w, 10 * m, rot + 180);
        }
    });

    /** 呃罩打空间结晶 */
    public static final Effect fxForeshadowSpaceShoot = new Effect(24, e -> {
        e.scaled(10, (b -> {
            Draw.color(DsColors.spaceCrystalColor, DsColors.spaceCrystalColorLight, b.fin());
            Lines.stroke(b.fout() * 3 + 0.2F);
            Lines.circle(b.x, b.y, b.fin() * 50);
        }));

        Draw.color(DsColors.spaceCrystalColor);

        for (var i : Mathf.signs) {
            Drawf.tri(e.x, e.y, 13 * e.fout(), 85, e.rotation + 90 * i);
            Drawf.tri(e.x, e.y, 13 * e.fout(), 50, e.rotation + 20 * i);
        }
    });

    /** 过载动画 */
    public static Effect hyperSpeed1Effect = new Effect(40, e -> {
        Draw.color(Pal.accent);

        Fill.square(e.x, e.y, e.fslope() * 2, 45);
        Fill.square(e.x, e.y, e.fslope() * 2, 35);
    });

    /** 过载动画 */
    public static Effect hyperSpeed2Effect = new Effect(40, e -> {
        Draw.color(Pal.accent);

        Fill.square(e.x, e.y, e.fslope() * 2, 45);
        Fill.square(e.x, e.y, e.fslope() * 2.1F, 35);
        Fill.square(e.x, e.y, e.fslope() * 1.9F, 25);
    });
}
