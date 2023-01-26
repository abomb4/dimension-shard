package dimensionshard.libs.skill;

/**
 * 事件
 *
 * @author abomb4 2023-01-27
 */
public class SkillEvents {

    /** 开启式技能的结束 */
    public static class ActiveSkillFinishedEvent {

        public final SkilledUnit unit;

        public ActiveSkillFinishedEvent(SkilledUnit unit) {
            this.unit = unit;
        }
    }
}
