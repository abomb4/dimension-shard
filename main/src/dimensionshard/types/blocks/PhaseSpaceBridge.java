package dimensionshard.types.blocks;

import arc.Events;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Lines;
import arc.math.Angles;
import arc.math.Mathf;
import arc.math.geom.Point2;
import arc.struct.Seq;
import arc.util.Time;
import arc.util.Tmp;
import mindustry.Vars;
import mindustry.core.Renderer;
import mindustry.game.EventType;
import mindustry.gen.Building;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.graphics.Pal;
import mindustry.input.Placement;
import mindustry.type.Item;
import mindustry.world.Tile;
import mindustry.world.blocks.distribution.ItemBridge;

import static mindustry.Vars.tilesize;
import static mindustry.Vars.world;

/**
 * 相位空间桥，多方向传输物品
 *
 * @author abomb4 2022-10-07
 */
public class PhaseSpaceBridge extends ItemBridge {

    /** 超过 10s 后，再次建造时不会自动连接 */
    public final float lastBuildInvalidate = 60 * 10;
    /** 上次建造时间 */
    public float globalLastBuildTime = 0;

    public PhaseSpaceBridge(String name) {
        super(name);
    }

    @Override
    public void drawPlace(int x, int y, int rotation, boolean valid) {
        // if (!dsGlobal.techDsAvailable()) {
        //     this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        // }
        var range = this.range;
        var tilesize = Vars.tilesize;
        Drawf.dashCircle(x * tilesize, y * tilesize, range * tilesize, Pal.accent);

        // check if a mass driver is selected while placing this driver
        if (!Vars.control.input.config.isShown()) {
            return;
        }
        var selected = Vars.control.input.config.getSelected();
        if (selected == null || (selected.block != this) ||
            !(selected.within(x * tilesize, y * tilesize, range * tilesize))) {
            return;
        }

        // if so, draw a dotted line towards it while it is in range
        float sin = Mathf.absin(Time.time, 6, 1);
        Tmp.v1.set(x * tilesize + this.offset, y * tilesize + this.offset)
            .sub(selected.x, selected.y)
            .limit((this.size / 2F + 1) * tilesize + sin + 0.5F);
        float x2 = x * tilesize - Tmp.v1.x, y2 = y * tilesize - Tmp.v1.y,
            x1 = selected.x + Tmp.v1.x, y1 = selected.y + Tmp.v1.y;
        int segs = (int) (selected.dst(x * tilesize, y * tilesize) / tilesize);

        Lines.stroke(2, Pal.gray);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Lines.stroke(1, Pal.placing);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Draw.reset();
    }

    @Override
    public boolean linkValid(Tile tile, Tile other, boolean checkDouble) {
        if (other == null || tile == null || tile == other || !this.positionsValid(tile.x, tile.y, other.x, other.y)) {
            return false;
        }

        return other.block() == this
            && tile.block() == this
            && (!checkDouble || ((PhaseSpaceBridgeBuild) other.build).link != tile.pos());
    }

    @Override
    public boolean positionsValid(int x1, int y1, int x2, int y2) {
        return Mathf.dst(x1, y1, x2, y2) <= this.range;
    }

    @Override
    public void changePlacementPath(Seq<Point2> points, int rotation) {
        Placement.calculateNodes(points, this, rotation,
            (point, other) -> this.positionsValid(point.x, point.y, other.x, other.y));
    }

    @Override
    public Tile findLink(int x, int y) {
        // 自动链接功能，超过指定时间后再次建造不会自动链接
        if (Time.time - this.globalLastBuildTime > this.lastBuildInvalidate) {
            return null;
        }
        return super.findLink(x, y);
    }

    @Override
    public void load() {
        super.load();

        Events.on(EventType.BlockBuildBeginEvent.class, (e -> {
            if (Vars.player != null && Vars.player.unit() == e.unit && e.tile.block() != this) {
                this.lastBuild = null;
            }
        }));
    }

    /** Instance */
    public class PhaseSpaceBridgeBuild extends ItemBridge.ItemBridgeBuild {

        @Override
        public void playerPlaced(Object config) {
            super.playerPlaced(config);
            PhaseSpaceBridge.this.globalLastBuildTime = Time.time;
        }

        @Override
        public void drawConfigure() {
            Tile tile = this.tile;
            float x = this.x;
            float y = this.y;

            Draw.color(Pal.accent);
            Lines.stroke(1);
            PhaseSpaceBridge block = (PhaseSpaceBridge) this.block;
            Lines.square(x, y, block.size * Vars.tilesize / 2.0F + 1);

            Tile target;
            if (this.link != -1
                && (target = Vars.world.tile(this.link)) != null
                && block.linkValid(tile, target, true)) {
                Draw.color(Pal.place);
                Lines.square(
                    target.x * Vars.tilesize,
                    target.y * Vars.tilesize,
                    block.size * Vars.tilesize / 2.0F + 1 + (Mathf.absin(Time.time, 4, 1)));
            }

            Drawf.dashCircle(x, y, block.range * Vars.tilesize, Pal.accent);
        }

        @Override
        public void draw() {
            Draw.rect(this.block.region, this.x, this.y, this.block.rotate ? this.rotdeg() : 0);
            this.drawTeamTop();
            Draw.z(Layer.power);

            Tile other = world.tile(link);
            if (!linkValid(tile, other)) {
                return;
            }

            if (Mathf.zero(Renderer.bridgeOpacity)) {
                return;
            }

            int i = relativeTo(other.x, other.y);

            if (pulse) {
                Draw.color(Color.white, Color.black, Mathf.absin(Time.time, 6f, 0.07f));
            }

            float warmup = hasPower ? this.warmup : 1f;

            Draw.alpha((fadeIn ? Math.max(warmup, 0.25f) : 1f) * Renderer.bridgeOpacity);

            var angle = Angles.angle(tile.worldx(), tile.worldy(), other.worldx(), other.worldy());

            Draw.rect(endRegion, x, y, angle + 90);
            Draw.rect(endRegion, other.drawx(), other.drawy(), angle + 270);

            Lines.stroke(bridgeWidth);
            Lines.line(bridgeRegion, tile.worldx(), tile.worldy(), other.worldx(), other.worldy(), false);

            int dist = Math.max(Math.abs(other.x - tile.x), Math.abs(other.y - tile.y)) - 1;

            Draw.color();

            int arrows = dist * 2 - 2;

            for (int a = 0; a < arrows; a++) {
                Draw.alpha(Mathf.absin(a - time / arrowTimeScl, arrowPeriod, 1f) * warmup * Renderer.bridgeOpacity);
                Draw.rect(arrowRegion,
                    tile.worldx() + Angles.trnsx(angle, (tilesize / 2f + a * 4 + time % 4)),
                    tile.worldy() + Angles.trnsy(angle, (tilesize / 2f + a * 4 + time % 4)), angle);
            }

            Draw.reset();
        }

        @Override
        public boolean canDump(Building to, Item item) {
            // 4 directions output
            return true;
        }

        @Override
        public boolean acceptItem(Building source, Item item) {
            if (this.team != source.team) {
                return false;
            }

            Tile other = Vars.world.tile(this.link);
            PhaseSpaceBridge block = (PhaseSpaceBridge) this.block;

            if (block.linkValid(this.tile, other)) {
                return this.items.total() < PhaseSpaceBridge.this.itemCapacity;
            } else {
                return source.block == this.block
                    && ((PhaseSpaceBridgeBuild) source).link == this.tile.pos()
                    && this.items.total() < PhaseSpaceBridge.this.itemCapacity;
            }
        }

        @Override
        public void updateTile() {
            super.updateTile();
            // Try dump liquid if not be connected
            Tile other = Vars.world.tile(this.link);
            PhaseSpaceBridge block = (PhaseSpaceBridge) this.block;

            // 如果没去连别人，则 dump liquid
            if (!block.linkValid(this.tile, other)) {
                this.dumpLiquid(this.liquids.current());
            }
        }

        @Override
        protected boolean checkAccept(Building source, Tile other) {
            if (this.tile == null || this.linked(source)) {
                return true;
            }
            return PhaseSpaceBridge.this.linkValid(this.tile, other) || other == this.tile;
        }

        @Override
        public void updateTransport(Building other) {

            this.transportCounter += this.edelta();
            while (this.transportCounter >= PhaseSpaceBridge.this.transportTime) {
                Item item = this.items.take();
                if (item != null && other.acceptItem(this, item)) {
                    other.handleItem(this, item);
                    this.moved = true;
                } else if (item != null) {
                    this.items.add(item, 1);
                    this.items.undoFlow(item);
                }
                this.transportCounter -= PhaseSpaceBridge.this.transportTime;

                // transport liquid
                this.moveLiquid(other, this.liquids.current());
            }
        }

        @Override
        protected boolean checkDump(Building to) {
            Tile other = Vars.world.tile(this.link);
            return (!PhaseSpaceBridge.this.linkValid(this.tile, other, false));
        }
    }
}
