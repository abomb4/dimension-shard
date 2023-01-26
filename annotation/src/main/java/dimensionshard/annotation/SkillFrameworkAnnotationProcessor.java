package dimensionshard.annotation;


import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Filer;
import javax.annotation.processing.Messager;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.MirroredTypeException;
import javax.lang.model.type.TypeMirror;
import javax.lang.model.util.Elements;
import javax.lang.model.util.Types;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import java.util.Set;

/**
 * 创建单位的继承类
 *
 * @author abomb4 2022-10-27
 */
@SupportedAnnotationTypes("dimensionshard.annotation.GenerateSkilledUnit")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class SkillFrameworkAnnotationProcessor extends AbstractProcessor {

    private Elements elementUtils;
    private Filer filer;
    private Messager messager;
    private Types typeUtils;
    private Map<String, String> options;

    @Override
    public synchronized void init(ProcessingEnvironment env) {
        this.elementUtils = env.getElementUtils();
        this.filer = env.getFiler();
        this.messager = env.getMessager();
        this.typeUtils = env.getTypeUtils();
        this.options = env.getOptions();
    }

    @Override
    public boolean process(Set<? extends TypeElement> annoations, RoundEnvironment roundEnv) {

        Set<? extends Element> annotated = roundEnv.getElementsAnnotatedWith(GenerateSkilledUnit.class);
        for (Element element : annotated) {
            final GenerateSkilledUnit annotation = element.getAnnotation(GenerateSkilledUnit.class);
            Element enclosingElement = element.getEnclosingElement();
            while (enclosingElement.getKind() != ElementKind.PACKAGE) {
                enclosingElement = enclosingElement.getEnclosingElement();
            }
            final String packageName = enclosingElement.toString();

            final TypeMirror baseUnit = getBaseUnit(annotation);
            final String fullName = element.asType().toString();
            String name = fullName.substring(0, fullName.length() - 1);

            final int i = name.lastIndexOf(".");
            String className = name.substring(i + 1);

            this.createFile(baseUnit, packageName, className, annotation.classId());
        }
        return false;
    }

    private void createFile(TypeMirror unitClass, String packageName, String className, int classId) {
        try {
            JavaFileObject jfo = this.filer.createSourceFile(packageName + "." + className);
            Writer writer = jfo.openWriter();
            writer.write(this.gen(unitClass, packageName, className, classId));
            writer.flush();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private String gen(TypeMirror unitClass, String packageName, String className, int classId) {

        final Javaw w = new Javaw();
        w.l("package %s;", packageName);
        w.l();
        w.l("import arc.Events;");
        w.l("import arc.struct.ObjectMap;");
        w.l("import arc.struct.Seq;");
        w.l("import arc.util.Interval;");
        w.l("import arc.util.Time;");
        w.l("import arc.util.io.Reads;");
        w.l("import arc.util.io.Writes;");
        w.l("import dimensionshard.libs.skill.SkillCall;");
        w.l("import dimensionshard.libs.skill.SkillData;");
        w.l("import dimensionshard.libs.skill.SkillDefinition;");
        w.l("import dimensionshard.libs.skill.SkillEvents;");
        w.l("import dimensionshard.libs.skill.SkillStatus;");
        w.l("import dimensionshard.libs.skill.SkilledUnit;");
        w.l("import dimensionshard.libs.skill.SkilledUnitType;");
        w.l("import mindustry.Vars;");
        w.l("import mindustry.ai.types.LogicAI;");
        w.l("import mindustry.game.EventType;");
        w.l("import mindustry.gen.EntityMapping;");
        w.l("import mindustry.gen.Payloadc;");
        w.l("import mindustry.gen.Unit;");
        w.l("import mindustry.world.blocks.payloads.Payload;");
        w.l();
        w.l("public class %s extends %s implements SkilledUnit {", className, unitClass.toString());
        w.l("    public static boolean loaded = false;");
        w.l("");
        w.l("    public static final int CLASS_ID = %s;", classId);
        w.l("");
        w.l("    public transient Interval timer = new Interval();");
        w.l("");
        w.l("    public static void loadStatic() {");
        w.l("        if (!loaded) {");
        w.l("            Events.on(EventType.UnitDestroyEvent.class, e -> {");
        w.l("                final Unit unit = e.unit;");
        w.l("                if (unit instanceof SkilledUnit sku && unit.classId() == CLASS_ID) {");
        w.l("                    sku.clearSkillData();");
        w.l("                }");
        w.l("                if (unit instanceof Payloadc pu) {");
        w.l("                    for (Payload payload : pu.payloads()) {");
        w.l("                        if (payload instanceof SkilledUnit sku && sku.classId() == CLASS_ID) {");
        w.l("                            sku.clearSkillData();");
        w.l("                        }");
        w.l("                    }");
        w.l("                }");
        w.l("            });");
        w.l("            EntityMapping.idMap[CLASS_ID] = %s::new;", className);
        w.l("            loaded = true;");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    public transient boolean init;");
        w.l("");
        w.l("    public ObjectMap<Integer, SkillStatus> skillStatusMap = new ObjectMap<>(4);");
        w.l("    public Seq<SkillStatus> statusList = new Seq<>(4);");
        w.l("");
        w.l("    /**");
        w.l("     * 初始化技能数据");
        w.l("     */");
        w.l("    @Override");
        w.l("    public void initSkill() {");
        w.l("        if (this.init) {");
        w.l("            return;");
        w.l("        }");
        w.l("        if (this.type instanceof SkilledUnitType sku) {");
        w.l("            final Seq<SkillDefinition> definitions = sku.getSkillDefinitions();");
        w.l("            for (SkillDefinition definition : definitions) {");
        w.l("                SkillStatus skillStatus = new SkillStatus(definition);");
        w.l("                this.statusList.add(skillStatus);");
        w.l("                this.skillStatusMap.put(definition.getSkillId(), skillStatus);");
        w.l("            }");
        w.l("        }");
        w.l("        this.init = true;");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void clearSkillData() {");
        w.l("        this.skillStatusMap.clear();");
        w.l("        this.statusList.clear();");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void add() {");
        w.l("        if (!this.init) {");
        w.l("            this.initSkill();");
        w.l("        }");
        w.l("        super.add();");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public int classId() {");
        w.l("        return CLASS_ID;");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void update() {");
        w.l("        if (this.statusList.isEmpty()) {");
        w.l("            super.update();");
        w.l("        } else {");
        w.l("            for (SkillStatus s : this.statusList) {");
        w.l("                if (!(this.controller instanceof LogicAI) && !this.isPlayer()");
        w.l("                    && timer.get(0, s.def.aiCheckInterval) && s.reload >= s.def.cooldown) {");
        w.l("                    s.def.aiCheck(s, this);");
        w.l("                }");
        w.l("                if (s.active) {");
        w.l("                    s.activeTimeLeft -= Time.delta;");
        w.l("                    s.def.preUpdate(s, this, s.activeTimeLeft <= 0);");
        w.l("                }");
        w.l("            }");
        w.l("");
        w.l("            super.update();");
        w.l("            for (SkillStatus s : this.statusList) {");
        w.l("                if (s.active) {");
        w.l("                    final boolean last = s.activeTimeLeft <= 0;");
        w.l("                    s.def.postUpdate(s, this, last);");
        w.l("                    var tmp = s.active;");
        w.l("                    s.active = !last;");
        w.l("                    if (tmp != s.active && !s.active) {");
        w.l("                        Events.fire(new SkillEvents.ActiveSkillFinishedEvent(this));");
        w.l("                    }");
        w.l("                } else {");
        w.l("                    if (Vars.state.rules.editor) {");
        w.l("                        s.reload = s.def.cooldown;");
        w.l("                    } else {");
        w.l("                        s.reload = Math.min(s.def.cooldown, s.reload + Time.delta);");
        w.l("                    }");
        w.l("                }");
        w.l("            }");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void damage(float amount) {");
        w.l("        for (SkillStatus status : this.statusList) {");
        w.l("            if (status.active) {");
        w.l("                amount = status.def.updateDamage(status, this, amount);");
        w.l("            }");
        w.l("        }");
        w.l("        super.damage(amount);");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public float speed() {");
        w.l("        return super.speed() * this.speedMultiplier;");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void draw() {");
        w.l("        super.draw();");
        w.l("        for (SkillStatus status : this.statusList) {");
        w.l("            if (status.active) {");
        w.l("                status.def.draw(status, this, status.activeTimeLeft <= 0);");
        w.l("            }");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void write(Writes write) {");
        w.l("        super.write(write);");
        w.l("        this.writeSkillStatuses(write);");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public void read(Reads read) {");
        w.l("        super.read(read);");
        w.l("        this.readSkillStatuses(read);");
        w.l("    }");
        w.l("");
        w.l("    /**");
        w.l("     * 是否是技能单位");
        w.l("     *");
        w.l("     * @return 技能单位");
        w.l("     */");
        w.l("    public boolean isSkilled() {");
        w.l("        return this.statusList.size > 0;");
        w.l("    }");
        w.l("");
        w.l("    public void tryActiveSkill(int skillId, SkillData data) {");
        w.l("        for (SkillStatus status : this.statusList) {");
        w.l("            if (status.active && status.def.exclusive && status.def.getSkillId() != skillId) {");
        w.l("                return;");
        w.l("            }");
        w.l("        }");
        w.l("        final SkillStatus status = skillStatusMap.get(skillId);");
        w.l("        if (status == null) {");
        w.l("            return;");
        w.l("        }");
        w.l("        if (status.reload >= status.def.cooldown) {");
        w.l("            SkillCall.callActiveSkill(this, skillId, data);");
        w.l("            this.activeSkill(skillId, data, false);");
        w.l("        } else if (status.def.canActiveAgain(status, this)) {");
        w.l("            SkillCall.callActiveSkillAgain(this, skillId, data);");
        w.l("            this.activeSkillAgain(skillId, data, false);");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    public void activeSkill(int skillId, SkillData data, boolean fromRemote) {");
        w.l("        for (SkillStatus status : this.statusList) {");
        w.l("            if (status.active && status.def.exclusive) {");
        w.l("                return;");
        w.l("            }");
        w.l("        }");
        w.l("        final SkillStatus status = skillStatusMap.get(skillId);");
        w.l("        status.def.active(status, this, data);");
        w.l("        status.reload = 0;");
        w.l("        if (status.def.activeTime > 0) {");
        w.l("            status.activeTimeLeft = status.def.activeTime;");
        w.l("            status.active = true;");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    public void activeSkillAgain(int skillId, SkillData data, boolean fromRemote) {");
        w.l("        final SkillStatus status = skillStatusMap.get(skillId);");
        w.l("        if (status == null) {");
        w.l("            return;");
        w.l("        }");
        w.l("        status.def.activeAgain(status, this, data);");
        w.l("    }");
        w.l("");
        w.l("    @Override");
        w.l("    public Seq<SkillStatus> getSkillList() {");
        w.l("        return this.statusList;");
        w.l("    }");
        w.l("");
        w.l("    protected void writeSkillStatuses(Writes write) {");
        w.l("        if (this.type instanceof SkilledUnitType sku) {");
        w.l("            write.s(this.statusList.size);");
        w.l("            for (SkillStatus s : this.statusList) {");
        w.l("                s.write(write);");
        w.l("            }");
        w.l("        }");
        w.l("    }");
        w.l("");
        w.l("    protected void readSkillStatuses(Reads read) {");
        w.l("        if (this.type instanceof SkilledUnitType sku) {");
        w.l("            this.initSkill();");
        w.l("            final Seq<SkillDefinition> defs = sku.getSkillDefinitions();");
        w.l("            final short count = read.s();");
        w.l("            for (int i = 0; i < count; i++) {");
        w.l("                if (i >= defs.size) {");
        w.l("                    // 默认消化");
        w.l("                    read.f();");
        w.l("                    read.bool();");
        w.l("                    read.f();");
        w.l("                    read.f();");
        w.l("                    read.f();");
        w.l("                    read.f();");
        w.l("                    read.f();");
        w.l("                } else {");
        w.l("                    SkillStatus status = defs.get(i).readStatus(read);");
        w.l("                    SkillStatus existing = this.skillStatusMap.get(status.def.getSkillId());");
        w.l("                    existing.setFrom(status);");
        w.l("                }");
        w.l("            }");
        w.l("        }");
        w.l("    }");
        w.l("}", className);
        return w.toString();
    }

    private static class Javaw {
        final StringBuilder b = new StringBuilder(12000);

        public Javaw l(String line, Object... objs) {
            this.b.append(String.format(line, objs)).append("\n");
            return this;
        }

        public Javaw l() {
            this.b.append("\n");
            return this;
        }

        @Override
        public String toString() {
            return this.b.toString();
        }
    }

    private static TypeMirror getBaseUnit(GenerateSkilledUnit annotation) {
        try {
            annotation.baseUnit(); // this should throw
        } catch (MirroredTypeException mte) {
            return mte.getTypeMirror();
        }
        return null; // can this ever happen ??
    }
}
