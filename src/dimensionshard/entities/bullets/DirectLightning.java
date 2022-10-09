package dimensionshard.entities.bullets;

import arc.graphics.Color;
import arc.math.Angles;
import arc.math.Mathf;
import arc.math.Rand;
import arc.math.geom.Geometry;
import arc.math.geom.Rect;
import arc.math.geom.Vec2;
import arc.struct.IntSet;
import arc.struct.Seq;
import arc.util.Nullable;
import arc.util.Tmp;
import mindustry.content.Bullets;
import mindustry.content.Fx;
import mindustry.core.World;
import mindustry.entities.Units;
import mindustry.entities.bullet.BulletType;
import mindustry.game.Team;
import mindustry.gen.Bullet;
import mindustry.gen.Unitc;
import mindustry.world.Tile;

import static mindustry.Vars.tilesize;
import static mindustry.Vars.world;

/**
 * 直的电
 *
 * @author abomb4 2022-10-09
 */
public class DirectLightning {

    // non thread safe

    private static final Rand random = new Rand();
    private static final Rect rect = new Rect();
    private static final Seq<Unitc> entities = new Seq<>();
    private static final IntSet hit = new IntSet();
    private static final int maxChain = 8;
    private static final int hitRange = 30;

    private static boolean bhit = false;
    private static int lastSeed = 0;

    /**
     * 计算直流随机偏转量
     *
     * @param x              当前 x
     * @param y              当前 y
     * @param originX        初始 x
     * @param originY        初始 y
     * @param originRotation 初始偏转量
     * @return 随机偏转量
     */
    public static float randomRotate(float x, float y, float originX, float originY, float originRotation) {
        // left or right?
        var nowAngle = Tmp.v1.set(x - originX, y - originY).angle();
        var angleOffset = nowAngle - originRotation;
        var length = Tmp.v1.len();

        var offsetLength = Mathf.sinDeg(angleOffset) * length;
        // var lengthPercent = Math.min(1, Math.abs(offsetLength) / hitRange) * offsetLength > 0 ? 1 : -1;
        var lengthPercent = offsetLength / hitRange;

        return random.range(10) - lengthPercent * 20;
    }

    /**
     * 创建直的电
     *
     * @param hitter         子弹
     * @param team           当前 team
     * @param color          颜色
     * @param damage         伤害
     * @param originX        发射点 x
     * @param originY        发射点 y
     * @param originRotation 射击方向
     * @param length         总长度
     */
    public static void createDirectLightning(@Nullable Bullet hitter,
                                             Team team, Color color, float damage, float originX, float originY,
                                             float originRotation,
                                             float length) {
        float rotation = originRotation;
        float x = originX;
        float y = originY;
        final int seed = lastSeed++;

        BulletType hitCreate =
            hitter == null || hitter.type.lightningType == null ? Bullets.damageLightning : hitter.type.lightningType;

        random.setSeed(seed);
        hit.clear();

        Seq<Vec2> lines = new Seq<>();
        // 是否已经击中过目标，击中过之后采用普通的闪电模式
        boolean hitted = false;
        bhit = false;

        for (int i = 0; i < length / 2; i++) {
            hitCreate.create(null, team, x, y, rotation, damage, 1F, 1F, hitter);
            lines.add(new Vec2(x + Mathf.range(3F), y + Mathf.range(3F)));

            if (lines.size > 1) {
                bhit = false;
                Vec2 from = lines.get(lines.size - 2);
                Vec2 to = lines.get(lines.size - 1);
                World.raycastEach(World.toTile(from.getX()), World.toTile(from.getY()), World.toTile(to.getX()),
                    World.toTile(to.getY()), (wx, wy) -> {

                        Tile tile = world.tile(wx, wy);
                        if (tile != null && (tile.build != null && tile.build.isInsulated()) && tile.team() != team) {
                            bhit = true;
                            //snap it instead of removing
                            lines.get(lines.size - 1).set(wx * tilesize, wy * tilesize);
                            return true;
                        }
                        return false;
                    });
                if (bhit) {
                    break;
                }
            }

            rect.setSize(hitRange).setCenter(x, y);
            entities.clear();
            if (hit.size < maxChain) {
                Units.nearbyEnemies(team, rect, u -> {
                    if (!hit.contains(u.id()) &&
                        (hitter == null || u.checkTarget(hitter.type.collidesAir, hitter.type.collidesGround))) {
                        entities.add(u);
                    }
                });
            }

            Unitc furthest = Geometry.findFurthest(x, y, entities);

            if (furthest != null) {
                hitted = true;
                hit.add(furthest.id());
                x = furthest.x();
                y = furthest.y();
            } else if (hitted) {
                // 是否已经击中过目标，击中过之后采用普通的闪电模式
                rotation += random.range(30);
                x += Angles.trnsx(rotation, hitRange / 2F);
                y += Angles.trnsy(rotation, hitRange / 2F);
            } else {
                // 未击中过时采用直流走向
                rotation += randomRotate(x, y, originX, originY, originRotation);
                x += Angles.trnsx(rotation, hitRange / 2F);
                y += Angles.trnsy(rotation, hitRange / 2F);
            }
        }

        Fx.lightning.at(x, y, rotation, color, lines);

    }
}
