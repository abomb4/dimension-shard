package dimensionshard.libs;

import arc.math.Mathf;
import arc.util.Time;
import mindustry.content.Fx;
import mindustry.gen.Building;
import mindustry.type.Liquid;

/**
 * 液体工具类
 *
 * @author abomb4 2022-10-07
 */
public final class LiquidUtils {

    /**
     * moveLiquid 不着火
     *
     * @param source 来源
     * @param next   下一个目标
     * @param liquid 液体类型
     * @return 数值
     */
    public static float moveLiquidWithoutFire(Building source, Building next, Liquid liquid) {

        if (next == null) {
            return 0.0F;
        } else {
            next = next.getLiquidDestination(source, liquid);
            if (next.team == source.team && next.block.hasLiquids && source.liquids.get(liquid) > 0.0F) {
                float ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
                float fract = source.liquids.get(liquid) / source.block.liquidCapacity * source.block.liquidPressure;
                float flow =
                    Math.min(Mathf.clamp(fract - ofract) * source.block.liquidCapacity, source.liquids.get(liquid));
                flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));
                if (flow > 0.0F && ofract <= fract && next.acceptLiquid(source, liquid)) {
                    next.handleLiquid(source, liquid, flow);
                    source.liquids.remove(liquid, flow);
                    return flow;
                }

                if (!next.block.consumesLiquid(liquid) &&
                    next.liquids.currentAmount() / next.block.liquidCapacity > 0.1F && fract > 0.1F) {
                    float fx = (source.x + next.x) / 2.0F;
                    float fy = (source.y + next.y) / 2.0F;
                    Liquid other = next.liquids.current();
                    if (other.blockReactive && liquid.blockReactive) {
                        if ((!(other.flammability > 0.3F) || !(liquid.temperature > 0.7F)) &&
                            (!(liquid.flammability > 0.3F) || !(other.temperature > 0.7F))) {
                            if (liquid.temperature > 0.7F && other.temperature < 0.55F ||
                                other.temperature > 0.7F && liquid.temperature < 0.55F) {
                                source.liquids.remove(liquid, Math.min(source.liquids.get(liquid), 0.7F * Time.delta));
                                if (Mathf.chanceDelta(0.20000000298023224)) {
                                    Fx.steam.at(fx, fy);
                                }
                            }
                            // there was a fire logic, removed
                        }
                    }
                }
            }

            return 0.0F;
        }
    }
}
