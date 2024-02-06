package dimensionshard.types.blocks;

import arc.Core;
import arc.Events;
import arc.func.Cons;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.graphics.g2d.TextureRegion;
import arc.math.Angles;
import arc.math.Mathf;
import arc.math.geom.Point2;
import arc.scene.ui.layout.Table;
import arc.struct.IntIntMap;
import arc.struct.IntSeq;
import arc.struct.Seq;
import arc.util.Interval;
import arc.util.Strings;
import arc.util.Time;
import arc.util.io.Reads;
import arc.util.io.Writes;
import dimensionshard.DsGlobal;
import dimensionshard.DsItems;
import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.content.Items;
import mindustry.core.UI;
import mindustry.ctype.UnlockableContent;
import mindustry.entities.Effect;
import mindustry.entities.EntityGroup;
import mindustry.game.EventType;
import mindustry.gen.Building;
import mindustry.gen.Teamc;
import mindustry.graphics.Drawf;
import mindustry.graphics.Pal;
import mindustry.type.Category;
import mindustry.type.Item;
import mindustry.type.ItemStack;
import mindustry.ui.Bar;
import mindustry.world.blocks.ItemSelection;
import mindustry.world.blocks.storage.StorageBlock;

/**
 * 空间提取器，直接从远程提取资源
 *
 * @author abomb4 2022-12-10 10:16:40
 */
public class SpaceUnloader extends StorageBlock {

    public static final Color BLUE = Color.valueOf("0068fc");

    public static final Effect IN_EFFECT = new Effect(38, e -> {
        Draw.color(BLUE);
        Angles.randLenVectors(e.id, 1, 8 * e.fout(), 0, 360, (x, y) -> {
            var angle = Angles.angle(0, 0, x, y);
            var trnsx = Angles.trnsx(angle, 2);
            var trnsy = Angles.trnsy(angle, 2);
            var trnsx2 = Angles.trnsx(angle, 4);
            var trnsy2 = Angles.trnsy(angle, 4);
            Fill.circle(
                e.x + trnsx + x + trnsx2 * e.fout(),
                e.y + trnsy + y + trnsy2 * e.fout(),
                e.fslope() * 0.8F
            );
        });
    });
    public static final EntityGroup<Building> suGroup = new EntityGroup<>(Building.class, false, false);

    /** max loop per frame */
    public int maxLoop = 8;
    /** 间隔几帧执行一次提取 */
    public int frameDelay = 5;
    /** 连接数限制 */
    public int linkLimit;

    public int range;
    public float warmupSpeed;

    public TextureRegion topRegion;
    public TextureRegion bottomRegion;
    public TextureRegion rotatorRegion;

    public SpaceUnloader(String name) {
        super(name);
        range = 300;
        warmupSpeed = 0.05F;

        requirements(Category.distribution, ItemStack.with(
            Items.titanium, 130,
            Items.silicon, 150,
            Items.phaseFabric, 80,
            DsItems.spaceCrystal, 80,
            DsItems.hardThoriumAlloy, 40
        ));
        size = 2;
        linkLimit = 32;
        health = 300;
        canOverdrive = false;
        update = true;
        solid = true;
        hasItems = true;
        configurable = true;
        saveConfig = false;
        itemCapacity = 60;
        noUpdateDisabled = true;
        consumePower(1.5F);

        config(IntSeq.class, (tileObj, seq) -> {
            // This seems only used by coping block
            // Deserialize from IntSeq
            SpaceUnloaderBuild tile = (SpaceUnloaderBuild) tileObj;
            var itemId = seq.get(0);
            var size = seq.get(1);
            final IntSeq links = new IntSeq();
            int linkX = -999;
            for (int i = 2; i < seq.size; i++) {
                var num = seq.get(i);
                if (linkX == -999) {
                    linkX = num;
                } else {
                    final int pos = Point2.pack(linkX + tile.tileX(), num + tile.tileY());
                    links.add(pos);
                    linkX = -999;
                }
            }
            tile.setItemTypeId(itemId);
            tile.setLink(links);
        });

        config(Integer.class, (tileObj, v) -> {
            SpaceUnloaderBuild tile = (SpaceUnloaderBuild) tileObj;
            tile.setOneLink(v);
        });

        config(Item.class, (tileObj, v) -> {
            SpaceUnloaderBuild tile = (SpaceUnloaderBuild) tileObj;
            tile.setItemTypeId(v.id);
        });

        configClear(tile -> ((SpaceUnloaderBuild) tile).setLink(new IntSeq()));
    }

    @Override
    public boolean isPlaceable() {
        return DsGlobal.techDsAvailable() && super.isPlaceable();
    }

    @Override
    public void drawPlace(int x, int y, int rotation, boolean valid) {
        Drawf.dashCircle(x * Vars.tilesize, y * Vars.tilesize, range, Pal.accent);
        if (!DsGlobal.techDsAvailable()) {
            this.drawPlaceText(Lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
            return;
        }
        super.drawPlace(x, y, rotation, valid);
    }

    @Override
    public void load() {
        super.load();
        topRegion = Lib.loadRegion("space-unloader-top");
        bottomRegion = Lib.loadRegion("space-unloader-bottom");
        rotatorRegion = Lib.loadRegion("space-unloader-rotator");
    }

    @Override
    public void init() {
        super.init();
        Events.on(EventType.BlockBuildEndEvent.class, e -> {
            if (!e.breaking) {
                suGroup.each(cen -> ((SpaceUnloaderBuild) cen).tryResumeDeadLink(e.tile.pos()));
            }
        });
    }

    @Override
    public void setBars() {
        super.setBars();
        addBar("capacity", e -> new Bar(
            () -> Core.bundle.format("bar.capacity", UI.formatAmount(e.block.itemCapacity)),
            () -> Pal.items,
            () -> (float) e.items.total() /
                (e.block.itemCapacity * Vars.content.items().count(UnlockableContent::unlockedNow))
        ));
        addBar("connections", e -> new Bar(
            () -> Core.bundle.format("bar.powerlines", linkLimit),
            () -> Pal.items,
            () -> ((SpaceUnloaderBuild) e).links.size / (float) linkLimit
        ));
    }

    @Override
    public boolean outputsItems() {
        return true;
    }

    @Override
    public Object pointConfig(Object config, Cons<Point2> transformer) {
        if (config instanceof IntSeq seq) {
            var newSeq = new IntSeq(seq.size);
            newSeq.add(seq.get(0));
            newSeq.add(seq.get(1));
            boolean linkXed = false;
            int linkX = 0;
            for (int i = 2; i < seq.size; i++) {
                final int num = seq.get(i);
                if (linkXed) {
                    linkX = num;
                } else {
                    // The source position is relative to right bottom, transform it.
                    var point = new Point2(linkX * 2 - 1, num * 2 - 1);
                    transformer.get(point);
                    newSeq.add((point.x + 1) / 2);
                    newSeq.add((point.y + 1) / 2);
                }
                linkXed = !linkXed;
            }
            return newSeq;
        } else {
            return config;
        }
    }

    /**
     * 判断 target 是否在 the 的影响范围内
     *
     * @param the    建筑
     * @param target 建筑
     * @return 是否在影响范围内
     */
    public boolean linkValidTarget(Building the, Building target) {
        return target != null && target.team == the.team && the.within(target, range);
    }

    /**
     * 判断 pos 是否在 the 的影响范围内
     *
     * @param the 建筑
     * @param pos 指定位置
     * @return 是否在影响范围内
     */
    public boolean linkValid(Building the, int pos) {
        if (pos == -1) {
            return false;
        }
        final Building build = Vars.world.build(pos);
        return linkValidTarget(the, build);
    }

    public class SpaceUnloaderBuild extends StorageBuild {
        public Interval timer = new Interval(6);
        public IntSeq links = new IntSeq();
        public IntSeq deadLinks = new IntSeq(100);
        public float slowdownDelay = 0;
        public float warmup = 0;
        public float rotateDeg = 0;
        public float rotateSpeed = 0;

        public boolean itemSent = false;
        public Item itemType;

        public int loopIndex = 0;

        /**
         * 批量设置
         *
         * @param linkSeq 列表
         */
        public void setLink(IntSeq linkSeq) {
            this.links = linkSeq;
            for (int i = this.links.size - 1; i >= 0; i--) {
                final int link = this.links.get(i);
                this.links.set(i, link);
                // final Building linkTarget = Vars.world.build(link);
                // if (linkValidTarget(this, linkTarget)) {
                //     this.links.set(i, linkTarget.pos());
                // }
            }
        }

        /**
         * Toggle
         *
         * @param pos pos
         */
        public void setOneLink(int pos) {
            if (!links.removeValue(pos)) {
                links.add(pos);
            }
        }

        /**
         * 将某个位置挪动到 'deadLink' 中，指定位置重建了建筑时进行位置修正
         *
         * @param pos 位置
         */
        public void deadLink(int pos) {
            if (Vars.net.client()) {
                return;
            }
            if (links.contains(pos)) {
                this.configure(pos);
            }
            deadLinks.add(pos);
            if (deadLinks.size >= 100) {
                // 太多了就清掉一些
                deadLinks.removeRange(0, 50);
            }
        }

        /**
         * 尝试恢复
         *
         * @param pos 位置代码
         */
        public void tryResumeDeadLink(int pos) {
            if (Vars.net.client()) {
                return;
            }
            if (!deadLinks.removeValue(pos)) {
                return;
            }
            final Building linkTarget = Vars.world.build(pos);
            if (linkValid(this, pos)) {
                this.configure(linkTarget.pos());
            }
        }

        public void setItemTypeId(int v) {
            itemType = v < 0 ? null : Vars.content.items().get(v);
        }

        @Override
        public void updateTile() {
            super.updateTile();
            var hasItem = false;
            final boolean valid = this.efficiency > 0.4F;
            if (timer.get(1, frameDelay)) {
                itemSent = false;
                if (valid && itemType != null) {
                    int max = links.size;
                    for (int i = 0; i < Math.min(maxLoop, max); i++) {
                        if (loopIndex < 0) {
                            loopIndex = max - 1;
                        }
                        int index = loopIndex;
                        loopIndex -= 1;
                        final int pos = links.get(index);
                        if (pos == -1) {
                            // delete
                            this.configure(pos);
                            continue;
                        }

                        final Building linkTarget = Vars.world.build(pos);
                        if (!linkValidTarget(this, linkTarget)) {
                            this.deadLink(pos);
                            max -= 1;
                            if (max <= 0) {
                                break;
                            }
                            continue;
                        }

                        if (linkTarget.items == null) {
                            continue;
                        }

                        final int count = linkTarget.items.get(itemType);
                        final int accept =
                            Math.min(count, this.acceptStack(itemType, Math.min(count, frameDelay), linkTarget));
                        if (accept > 0) {
                            this.handleStack(itemType, accept, linkTarget);
                            linkTarget.removeStack(itemType, accept);
                            for (var tmpi = accept; tmpi > 0; tmpi--) {
                                linkTarget.itemTaken(itemType);
                            }
                            hasItem = true;
                        }
                    }
                }

                if (valid && hasItem) {
                    slowdownDelay = 60;
                } else if (!valid) {
                    slowdownDelay = 0;
                }

                if (warmup > 0) {
                    rotateDeg += rotateSpeed;
                }

                if (this.enabled && rotateSpeed > 0.5 && Mathf.random(60) > 12) {
                    Time.run(Mathf.random(10), () -> IN_EFFECT.at(this.x, this.y, 0));
                }
                for (var i = 0; i < frameDelay; i++) {
                    this.dump();
                }
            }

            warmup = Mathf.lerpDelta(warmup, valid ? 1 : 0, warmupSpeed);
            rotateSpeed = Mathf.lerpDelta(rotateSpeed, slowdownDelay > 0 ? 1 : 0, warmupSpeed);
            slowdownDelay = Math.max(0, slowdownDelay - 1);
            if (warmup > 0) {
                rotateDeg += rotateSpeed;
            }
        }

        @Override
        public void display(Table table) {
            super.display(table);
            if (this.team == Vars.player.team() && this.items != null) {
                table.row();
                table.left();
                table.table(l -> {
                    var map = new IntIntMap();
                    l.update(() -> {
                        l.clearChildren();
                        l.left();
                        var seq = new Seq<>(Item.class);
                        this.items.each((item, amount) -> {
                            map.put(item.id, amount);
                            seq.add(item);
                        });
                        for (IntIntMap.Entry entry : map.entries()) {
                            final int id = entry.key;
                            final int amount = entry.value;
                            final Item item = Vars.content.item(id);
                            l.image(item.uiIcon).padRight(3.0F);
                            l.label(() -> "  " + Strings.fixed(seq.contains(item) ? amount : 0, 0))
                                .color(Color.lightGray);
                            l.row();
                        }
                    });
                }).left();
            }
        }

        @Override
        public void draw() {
            super.draw();
            Draw.color(Color.valueOf("#0a156e"));
            Draw.alpha(warmup);
            Draw.rect(bottomRegion, this.x, this.y);
            Draw.color();

            Draw.alpha(warmup);
            Draw.rect(rotatorRegion, this.x, this.y, rotateDeg);

            Draw.alpha(1);
            Draw.rect(topRegion, this.x, this.y);

            Draw.color(itemType == null ? Color.clear : itemType.color);
            Draw.rect("unloader-center", this.x, this.y);
            Draw.color();
        }

        @Override
        public void drawConfigure() {
            final int tilesize = Vars.tilesize;
            final float sin = Mathf.absin(Time.time, 6, 1);

            Draw.color(Pal.accent);
            Lines.stroke(1);
            Drawf.circles(this.x, this.y, (this.tile.block().size / 2.0F + 1) * tilesize + sin - 2, Pal.accent);

            for (int i = 0; i < links.size; i++) {
                final int pos = links.get(i);
                if (linkValid(this, pos)) {
                    final Building linkTarget = Vars.world.build(pos);
                    Drawf.square(linkTarget.x, linkTarget.y, linkTarget.block.size * tilesize / 2.0F + 1, Pal.place);
                }
            }

            Drawf.dashCircle(this.x, this.y, range, Pal.accent);
        }

        @Override
        public boolean onConfigureBuildTapped(Building other) {
            if (this == other) {
                this.configure(-1);
                return false;
            }
            if (this.dst(other) <= range && other.team == this.team) {
                this.configure(other.pos());
                return false;
            }
            return true;
        }

        @Override
        public void buildConfiguration(Table table) {
            ItemSelection.buildTable(table, Vars.content.items(), () -> itemType, this::configure);
        }

        @Override
        public Object config() {
            final IntSeq seq = new IntSeq(links.size * 2 + 2);
            seq.add(itemType == null ? -1 : itemType.id);
            seq.add(links.size);
            for (int i = 0; i < links.size; i++) {
                final int pos = links.get(i);
                final Point2 point2 = Point2.unpack(pos).sub(this.tile.x, this.tile.y);
                seq.add(point2.x, point2.y);
            }
            return seq;
        }

        @Override
        public void add() {
            if (this.added) {
                return;
            }
            suGroup.add(this);
            super.add();
        }

        @Override
        public void remove() {
            if (!this.added) {
                return;
            }
            suGroup.remove(this);
            super.remove();
        }

        @Override
        public boolean canDump(Building to, Item item) {
            if (this.linkedCore != null) {
                return false;
            }
            for (int i = 0; i < links.size; i++) {
                final int pos = links.get(i);
                final Building linkTarget = Vars.world.build(pos);
                if (to == linkTarget) {
                    return false;
                }
            }
            return true;
        }

        @Override
        public boolean acceptItem(Building source, Item item) {
            return this.linkedCore != null;
        }

        @Override
        public int acceptStack(Item item, int amount, Teamc source) {
            if (this.linkedCore != null) {
                return this.linkedCore.acceptStack(item, amount, source);
            } else {
                if (source == null || source.team() == this.team) {
                    return Math.min(this.getMaximumAccepted(item) - this.items.get(item), amount);
                } else {
                    return 0;
                }
            }
        }

        @Override
        public void write(Writes write) {
            super.write(write);
            write.s(itemType == null ? -1 : itemType.id);
            final int s = links.size;
            write.s(s);
            for (int i = 0; i < s; i++) {
                write.i(links.get(i));
            }
        }

        @Override
        public void read(Reads read, byte revision) {
            super.read(read, revision);
            var id = read.s();
            itemType = id == -1 ? null : Vars.content.items().get(id);
            links = new IntSeq();
            final short linkSize = read.s();
            for (int i = 0; i < linkSize; i++) {
                final int pos = read.i();
                links.add(pos);
            }
        }
    }
}
