package dimensionshard.types.blocks;

import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.TextureRegion;
import arc.math.Mathf;
import arc.math.geom.Point2;
import arc.struct.EnumSet;
import arc.struct.Seq;
import arc.util.Eachable;
import arc.util.Tmp;
import dimensionshard.DsLayers;
import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.core.UI;
import mindustry.entities.units.BuildPlan;
import mindustry.gen.Building;
import mindustry.graphics.Drawf;
import mindustry.graphics.Pal;
import mindustry.input.Placement;
import mindustry.ui.Bar;
import mindustry.world.Block;
import mindustry.world.blocks.power.PowerBlock;
import mindustry.world.blocks.power.PowerNode;
import mindustry.world.draw.DrawBlock;
import mindustry.world.draw.DrawDefault;
import mindustry.world.draw.DrawMulti;
import mindustry.world.meta.BlockFlag;
import mindustry.world.meta.BlockStatus;
import mindustry.world.meta.Stat;
import mindustry.world.meta.StatUnit;

import static mindustry.Vars.indexer;
import static mindustry.Vars.net;
import static mindustry.Vars.tilesize;

/**
 * 能量网络
 *
 * @author abomb4 2023-01-02 00:25:10
 */
public class PowerNetTower extends PowerBlock {

    /** 所有建筑 */
    public Seq<PowerNetTowerBuild> group = new Seq<>(PowerNetTowerBuild.class);

    public float range;
    private Color baseColor = Pal.accent;
    public DrawBlock drawer;

    public PowerNetTower(String name) {
        super(name);

        consumePowerBuffered(50000f);
        flags = EnumSet.of(BlockFlag.battery);
        update = true;
        outputsPower = true;
        consumesPower = true;
        canOverdrive = false;
        destructible = true;

        range = 32;

        drawer = new DrawMulti(
            new DrawDefault(),
            new DrawBlock() {
                public TextureRegion topRegion;

                @Override
                public void load(Block block) {
                    topRegion = Lib.loadRegion(name + "-top");
                }

                @Override
                public TextureRegion[] icons(Block block) {
                    return new TextureRegion[]{topRegion};
                }

                @Override
                public void draw(Building build) {
                    final PowerNetTowerBuild battery = (PowerNetTowerBuild) build;
                    final float status = battery.power.status;
                    Draw.alpha(status);
                    Draw.rect(topRegion, battery.x, battery.y);
                    Draw.reset();
                }
            },
            new DrawPowerNet()
        );
    }

    @Override
    public void load() {
        super.load();
        drawer.load(this);
    }

    @Override
    public void drawPlanRegion(BuildPlan plan, Eachable<BuildPlan> list) {
        drawer.drawPlan(this, plan, list);
    }

    @Override
    public TextureRegion[] icons() {
        return drawer.finalIcons(this);
    }

    @Override
    public void getRegionsToOutline(Seq<TextureRegion> out) {
        drawer.getRegionsToOutline(this, out);
    }

    @Override
    public void setBars() {
        super.setBars();
        addBar("totalpower", PowerNode.makePowerBalance());
        addBar("batteries", PowerNode.makeBatteryBalance());
        addBar("power", entity -> new Bar(
            () -> Lib.getMessage("bar", "battery-power",
                UI.formatAmount((int) (entity.power.status * consPower.capacity))),
            () -> Pal.powerBar,
            () -> entity.power.status
        ));
    }

    @Override
    public void setStats() {
        super.setStats();

        stats.add(Stat.powerRange, range, StatUnit.blocks);
    }

    @Override
    public void drawPlace(int x, int y, int rotation, boolean valid) {
        super.drawPlace(x, y, rotation, valid);
        x *= tilesize;
        y *= tilesize;

        Drawf.dashSquare(baseColor, x, y, range * tilesize);
        indexer.eachBlock(Vars.player.team(), Tmp.r1.setCentered(x, y, range * tilesize), b -> true, t -> {
            Drawf.selected(t, Tmp.c1.set(baseColor).a(Mathf.absin(4f, 1f)));
        });
    }

    @Override
    public void changePlacementPath(Seq<Point2> points, int rotation) {
        Placement.calculateNodes(points, this, rotation, (point, other) ->
            Math.abs(point.x - other.x) < range && Math.abs(point.y - other.y) < range);
    }

    @Override
    public void init() {
        super.init();
        // Events.on(EventType.BlockBuildEndEvent.class, e -> {
        //     if (e.breaking) {
        //         return;
        //     }
        //     if (e.team == Team.derelict) {
        //         return;
        //     }
        //     final Building build = e.tile.build;
        //     if (build == null) {
        //         return;
        //     }
        //     for (PowerNetTowerBuild tower : group) {
        //         tower.tryLink(build);
        //     }
        // });
        updateClipRadius(range);
    }

    public void updateClipRadius(float size) {
        clipSize = Math.max(clipSize, size * tilesize + size * 2f);
    }

    public class PowerNetTowerBuild extends Building {

        public Seq<Building> targets = new Seq<>();

        public int lastChange = -2;

        @Override
        public void draw() {
            drawer.draw(this);
        }

        @Override
        public void drawLight() {
            super.drawLight();
            drawer.drawLight(this);
        }

        @Override
        public void updateTile() {
            //TODO this block technically does not need to update every frame, perhaps put it in a special list.
            if (lastChange != Vars.world.tileChanges) {
                lastChange = Vars.world.tileChanges;
                updateTargets();
            }
        }

        public void updateTargets() {
            targets.clear();
            indexer.eachBlock(team, Tmp.r1.setCentered(x, y, range * tilesize), b -> true, link -> {

                if (!link.block.hasPower) {
                    return;
                }

                if (link == this) {
                    return;
                }

                this.power.links.addUnique(link.pos());
                link.power.links.addUnique(this.pos());
                this.power.graph.addGraph(link.power.graph);
                targets.add(link);
            });
        }

        @Override
        public void placed() {
            if (net.client()) {
                return;
            }

            // final QuadTree<Building> tree = team.data().buildingTree;
            // if (tree != null) {
            //     var worldRange = range * tilesize;
            //     tree.intersect(tile.worldx() - worldRange, tile.worldy() - worldRange, worldRange * 2, worldRange
            //     * 2, this::tryLink);
            // }
            this.updateTargets();

            super.placed();
        }

        @Override
        public void drawSelect() {
            super.drawSelect();

            Drawf.dashSquare(baseColor, x, y, range * tilesize);
            for (var target : targets) {
                Drawf.selected(target, Tmp.c1.set(baseColor).a(Mathf.absin(4f, 1f)));
            }
        }


        @Override
        public void add() {
            if (!this.added) {
                group.add(this);
            }
            super.add();
        }

        @Override
        public void remove() {
            if (this.added) {
                group.remove(this);
            }
            super.remove();
        }

        @Override
        public void dropped() {
            power.links.clear();
            updatePowerGraph();
        }

        @Override
        public BlockStatus status() {
            if (Mathf.equal(power.status, 0f, 0.001f)) {
                return BlockStatus.noInput;
            }
            if (Mathf.equal(power.status, 1f, 0.001f)) {
                return BlockStatus.active;
            }
            return BlockStatus.noOutput;
        }

        // public void tryLink(Building link) {
        //     if (this == link || link == null || !link.block.hasPower || this.team != link.team) {
        //         return;
        //     }
        //
        //     if (Math.abs(link.x - this.x) > range || Math.abs(link.y - this.y) > range) {
        //         return;
        //     }
        //
        //     this.power.links.addUnique(link.pos());
        //     this.power.graph.addGraph(link.power.graph);
        // }
    }

    /**
     * 绘制电力网格，使用 {@link dimensionshard.DsShaders#powerNetShader}
     */
    public static class DrawPowerNet extends DrawBlock {

        public static final Color DEFAULT_MIN_COLOR = Color.valueOf("ff5e1a");
        public static final Color DEFAULT_MAX_COLOR = Color.valueOf("1a9eff");

        public float range;

        public Color minColor;
        public Color maxColor;

        public DrawPowerNet() {
            this(DEFAULT_MIN_COLOR, DEFAULT_MAX_COLOR);
        }

        public DrawPowerNet(Color minColor, Color maxColor) {
            this.minColor = minColor;
            this.maxColor = maxColor;
        }

        @Override
        public void load(Block block) {
            if (block instanceof PowerNetTower) {
                this.range = ((PowerNetTower) block).range;
            }
        }

        @Override
        public void draw(Building b) {
            if (Vars.player == null || Vars.player.team() != b.team()) {
                return;
            }
            final PowerNetTowerBuild build = (PowerNetTowerBuild) b;
            Draw.z(DsLayers.Z_POWER_NET_EFFECT);
            float percent = (build.power.status - 0.25f) * 1.5f;
            Color color = minColor.cpy().lerp(maxColor, percent);
            Draw.color(color);
            Fill.square(build.x, build.y, range * tilesize / 2);
            Draw.reset();
        }
    }
}
