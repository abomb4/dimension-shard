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
import mindustry.world.blocks.storage.StorageBlock;

/**
 * 资源分发中心，直接向目标建筑输送资源
 *
 * @author abomb4 2022-12-08 21:16:40
 */
public class ResourcesDispatchingCenter extends StorageBlock {

    public static final Color ORANGE = Color.valueOf("fea947");

    public static final Effect OUT_EFFECT = new Effect(38, e -> {
        Draw.color(ORANGE);
        Angles.randLenVectors(e.id, 1, 8 * e.fout(), 0, 360, (x, y) -> {
            var angle = Angles.angle(0, 0, x, y);
            var trnsx = Angles.trnsx(angle, 2);
            var trnsy = Angles.trnsy(angle, 2);
            var trnsx2 = Angles.trnsx(angle, 4);
            var trnsy2 = Angles.trnsy(angle, 4);
            Fill.circle(
                e.x + trnsx + x + trnsx2 * e.fin(),
                e.y + trnsy + y + trnsy2 * e.fin(),
                e.fslope() * 0.8F
            );
        });
    });
    public static final EntityGroup<Building> rdcGroup = new EntityGroup<>(Building.class, false, false);

    /** max loop per frame */
    public int maxLoop = 50;
    /** 间隔几帧执行一次分发 */
    public int frameDelay = 5;

    public int range;
    public float warmupSpeed;

    public TextureRegion topRegion;
    public TextureRegion bottomRegion;
    public TextureRegion rotatorRegion;

    public Seq<ItemHave> tmpWhatHave = new Seq<>(32);

    public ResourcesDispatchingCenter(String name) {
        super(name);
        range = 80 * 8;
        warmupSpeed = 0.05F;

        requirements(Category.distribution, ItemStack.with(
            Items.copper, 4200,
            Items.metaglass, 1600,
            Items.silicon, 1200,
            Items.phaseFabric, 2200,
            DsItems.spaceCrystal, 1800,
            DsItems.timeCrystal, 800,
            DsItems.hardThoriumAlloy, 1200,
            DsItems.dimensionAlloy, 200
        ));
        size = 6;
        health = 4000;
        canOverdrive = false;
        update = true;
        solid = true;
        hasItems = true;
        configurable = true;
        saveConfig = false;
        itemCapacity = 500;
        noUpdateDisabled = true;
        consumePower(100);

        config(IntSeq.class, (tileObj, sq) -> {
            ResourcesDispatchingCenterBuild tile = (ResourcesDispatchingCenterBuild) tileObj;
            final IntSeq links = new IntSeq();
            int linkX = -999;
            for (int i = 0; i < sq.size; i++) {
                var num = sq.get(i);
                if (linkX == -999) {
                    linkX = num;
                } else {
                    final int pos = Point2.pack(linkX + tile.tileX(), num + tile.tileY());
                    links.add(pos);
                    linkX = -999;
                }
            }
            tile.setLinks(links);
        });

        config(Integer.class, (tileObj, v) -> {
            ResourcesDispatchingCenterBuild tile = (ResourcesDispatchingCenterBuild) tileObj;
            tile.setOneLink(v);
        });

        configClear(tile -> ((ResourcesDispatchingCenterBuild) tile).setLinks(new IntSeq()));
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
        topRegion = Lib.loadRegion("resources-dispatching-center-top");
        bottomRegion = Lib.loadRegion("resources-dispatching-center-bottom");
        rotatorRegion = Lib.loadRegion("resources-dispatching-center-rotator");
    }

    @Override
    public void init() {
        super.init();
        Events.on(EventType.BlockBuildEndEvent.class, (e -> {
            if (!e.breaking) {
                rdcGroup.each((cen -> ((ResourcesDispatchingCenterBuild) cen).tryResumeDeadLink(e.tile.pos())));
            }
        }));
    }

    @Override
    public void setBars() {
        super.setBars();
        addBar("capacity", e -> new Bar(
            () -> Core.bundle.format("bar.capacity", UI.formatAmount(e.block.itemCapacity)),
            () -> Pal.items,
            () -> ((float) e.items.total()) /
                (e.block.itemCapacity * Vars.content.items().count(UnlockableContent::unlockedNow))
        ));
    }

    @Override
    public boolean outputsItems() {
        return false;
    }

    @Override
    public Object pointConfig(Object config, Cons<Point2> transformer) {
        if (config instanceof IntSeq seq) {
            var newSeq = new IntSeq(seq.size);
            boolean linkXed = false;
            int linkX = 0;
            for (int i = 0; i < seq.size; i++) {
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

    public class ResourcesDispatchingCenterBuild extends StorageBlock.StorageBuild {
        public Interval timer = new Interval(6);
        public IntSeq links = new IntSeq();
        public IntSeq deadLinks = new IntSeq(100);
        public float warmup = 0;
        public float rotateDeg = 0;
        public float rotateSpeed = 0;

        public boolean itemSent = false;

        public int loopIndex = 0;

        /**
         * 批量设置
         *
         * @param linkSeq 列表
         */
        public void setLinks(IntSeq linkSeq) {
            this.links = linkSeq;
            for (int i = this.links.size - 1; i >= 0; i--) {
                final int link = this.links.get(i);
                final Building linkTarget = Vars.world.build(link);
                if (!linkValidTarget(this, linkTarget)) {
                    this.links.removeIndex(i);
                } else {
                    this.links.set(i, linkTarget.pos());
                }
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

        /**
         * 向目标输送资源
         *
         * @param target    目标
         * @param whatIHave 已有资源
         * @return 发送是否成功
         */
        public boolean sendItems(Building target, Seq<ItemHave> whatIHave) {
            var s = false;
            for (int i = whatIHave.size - 1; i >= 0; i--) {
                final ItemHave have = whatIHave.get(i);
                final Item item = have.item;
                final int count = have.count;
                final int accept = Math.min(count, target.acceptStack(item, Math.min(count, frameDelay), this));
                if (accept > 0) {
                    s = true;
                    target.handleStack(item, accept, this);
                    this.items.remove(item, accept);
                    have.count -= accept;
                    if (have.count <= 0) {
                        whatIHave.remove(i);
                    }
                }
            }
            return s;
        }

        @Override
        public void updateTile() {
            super.updateTile();
            tmpWhatHave.clear();
            final boolean valid = this.efficiency > 0.4F;
            if (timer.get(1, frameDelay)) {
                itemSent = false;
                if (valid) {
                    for (Item item : Vars.content.items()) {
                        final int count = this.items.get(item);
                        if (count > 0) {
                            tmpWhatHave.add(new ItemHave(item, count));
                        }
                    }

                    int max = links.size;
                    for (int i = 0; i < Math.min(maxLoop, max); i++) {
                        if (loopIndex < 0) {
                            loopIndex = max - 1;
                        }
                        int index = loopIndex;
                        loopIndex -= 1;
                        final int pos = links.get(index);
                        if (pos == -1) {
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
                        if (this.sendItems(linkTarget, tmpWhatHave)) {
                            itemSent = true;
                        }
                    }
                }
            }

            if (valid) {
                warmup = Mathf.lerpDelta(warmup, links.isEmpty() ? 0 : 1, warmupSpeed);
                rotateSpeed = Mathf.lerpDelta(rotateSpeed, itemSent ? 1 : 0, warmupSpeed);
            } else {
                warmup = Mathf.lerpDelta(warmup, 0, warmupSpeed);
                rotateSpeed = Mathf.lerpDelta(rotateSpeed, 0, warmupSpeed);
            }

            if (warmup > 0) {
                rotateDeg += rotateSpeed;
            }

            if (this.enabled && rotateSpeed > 0.5 && Mathf.random(60) > 48) {
                Time.run(Mathf.random(10), () -> OUT_EFFECT.at(this.x, this.y, 0));
            }
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
        public void draw() {
            super.draw();
            Draw.alpha(warmup);
            Draw.rect(bottomRegion, this.x, this.y);
            Draw.color();

            Draw.alpha(warmup);
            Draw.rect(rotatorRegion, this.x, this.y, -rotateDeg);

            Draw.alpha(1);
            Draw.rect(topRegion, this.x, this.y);
        }

        @Override
        public void display(Table table) {
            super.display(table);
            if (this.items != null) {
                table.row();
                table.left();
                table.table((l -> {
                    var map = new IntIntMap();
                    l.update((() -> {
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
                            l.label((() -> "  " + Strings.fixed(seq.contains(item) ? amount : 0, 0)))
                                .color(Color.lightGray);
                            l.row();
                        }
                    }));
                })).left();
            }
        }

        @Override
        public boolean onConfigureBuildTapped(Building other) {
            if (this == other) {
                return false;
            }
            if (this.dst(other) <= range && other.team == this.team) {
                this.configure(other.pos());
                return false;
            }
            return true;
        }

        @Override
        public Object config() {
            final IntSeq output = new IntSeq(links.size * 2);
            for (int i = 0; i < links.size; i++) {
                final int pos = links.get(i);
                final Point2 point2 = Point2.unpack(pos).sub(this.tile.x, this.tile.y);
                output.add(point2.x, point2.y);
            }
            return output;
        }

        @Override
        public int acceptStack(Item item, int amount, Teamc source) {
            return this.linkedCore == null
                ? super.acceptStack(item, amount, source)
                : this.linkedCore.acceptStack(item, amount, source);
        }

        @Override
        public void add() {
            if (this.added) {
                return;
            }
            rdcGroup.add(this);
            super.add();
        }

        @Override
        public void remove() {
            if (!this.added) {
                return;
            }
            rdcGroup.remove(this);
            super.remove();
        }

        @Override
        public void write(Writes write) {
            super.write(write);
            final int s = links.size;
            write.s(s);
            for (int i = 0; i < s; i++) {
                write.i(links.get(i));
            }
        }

        @Override
        public void read(Reads read, byte revision) {
            super.read(read, revision);
            links = new IntSeq();
            final short linkSize = read.s();
            for (int i = 0; i < linkSize; i++) {
                final int pos = read.i();
                links.add(pos);
            }
        }
    }

    public static class ItemHave {
        public Item item;
        public int count;

        public ItemHave(Item item, int count) {
            this.item = item;
            this.count = count;
        }
    }
}
