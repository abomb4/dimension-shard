package dimensionshard;

import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Angles;
import arc.math.Mathf;
import mindustry.entities.Effect;

/**
 * 特效
 *
 * @author abomb4 2022-10-07
 */
public final class DsFx {

    /** 次元碎片破片武器爆炸 */
    public static final Effect fxDimensionShardExplosion = new Effect(24, e -> {
        Draw.color(DsItems.dimensionShardColorLight);

        e.scaled(7, i -> {
            Lines.stroke(3 * i.fout());
            Lines.circle(e.x, e.y, 3 + i.fin() * 24);
        });

        Draw.color(Color.gray);

        Angles.randLenVectors(e.id, 7, 2 + 28 * e.finpow(), (x, y) -> {
            Fill.circle(e.x + x, e.y + y, e.fout() * 4 + 0.5F);
        });

        Draw.color(DsItems.dimensionShardColor);
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
}
