package dimensionshard.annotation;

import mindustry.gen.Unit;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;

/**
 * 生成带有技能的单位
 *
 * @author abomb4 2022-10-27
 */
@Target({TYPE})
@Retention(RetentionPolicy.SOURCE)
public @interface GenerateSkilledUnit {

    /**
     * 基于哪种单位
     *
     * @return 基于单位的类型
     */
    Class<? extends Unit> baseUnit();

    /**
     * 类型 id
     *
     * @return id
     */
    int classId();
}
