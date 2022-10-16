package dimensionshard.libs;

import arc.struct.IntFloatMap;
import mindustry.gen.Unit;

/**
 * 拖拽
 *
 * @author abomb4 2022-10-16
 */
public class DraggingUtils {

    public static IntFloatMap enginePowerMap = new IntFloatMap();

    public static float enginePower(Unit unit) {
        // dagger, 		mass: 201.06194, 	acc: 0.5, 	enginePower: 100.53097
        // mace, 		mass: 314.15927, 	acc: 0.5, 	enginePower: 157.07964
        // fortress, 	mass: 530.9292, 	acc: 0.5, 	enginePower: 265.4646
        // scepter, 	mass: 1520.5309, 	acc: 0.5, 	enginePower: 760.26544
        // reign, 		mass: 2123.7168, 	acc: 0.5, 	enginePower: 1061.8584
        //
        // nova, 		mass: 201.06194, 	acc: 0.5, 	enginePower: 100.53097
        // pulsar, 		mass: 380.13272, 	acc: 0.5, 	enginePower: 190.06636
        // quasar, 		mass: 530.9292, 	acc: 0.5, 	enginePower: 265.4646
        // vela, 		mass: 1809.5574, 	acc: 0.5, 	enginePower: 904.7787
        // corvus, 		mass: 2642.0796, 	acc: 0.5, 	enginePower: 1321.0398
        //
        // crawler, 	mass: 201.06194, 	acc: 0.5, 	enginePower: 100.53097
        // atrax, 		mass: 530.9292, 	acc: 0.5, 	enginePower: 265.4646
        // spiroct, 	mass: 706.85834, 	acc: 0.5, 	enginePower: 353.42917
        // arkyid, 		mass: 1661.9026, 	acc: 0.5, 	enginePower: 830.9513
        // toxopid, 	mass: 2123.7168, 	acc: 0.5, 	enginePower: 1061.8584
        //
        // flare, 		mass: 254.46901, 	acc: 0.08, 	enginePower: 20.357521
        // horizon, 	mass: 314.15927, 	acc: 0.08, 	enginePower: 25.132742
        // zenith, 		mass: 1256.6371, 	acc: 0.04, 	enginePower: 50.265484
        // antumbra, 	mass: 6647.6104, 	acc: 0.04, 	enginePower: 265.90442
        // eclipse, 	mass: 10568.318, 	acc: 0.04, 	enginePower: 422.73273
        //
        // mono, 		mass: 113.097336, 	acc: 0.12, 	enginePower: 13.57168
        // poly, 		mass: 254.46901, 	acc: 0.1, 	enginePower: 25.446901
        // mega, 		mass: 809.2821, 	acc: 0.06, 	enginePower: 48.556927
        // quad, 		mass: 4071.5042, 	acc: 0.05, 	enginePower: 203.57521
        // oct, 		mass: 13684.778, 	acc: 0.04, 	enginePower: 547.3911
        //
        // risso, 		mass: 314.15927, 	acc: 0.4, 	enginePower: 125.66371
        // minke, 		mass: 530.9292, 	acc: 0.3, 	enginePower: 159.27876
        // bryde, 		mass: 1256.6371, 	acc: 0.2, 	enginePower: 251.32742
        // sei, 		mass: 4778.363, 	acc: 0.2, 	enginePower: 955.67255
        // omura, 		mass: 10568.318, 	acc: 0.19, 	enginePower: 2007.9805
        //
        // retusa, 		mass: 380.13272, 	acc: 0.4, 	enginePower: 152.05309
        // oxynoe, 		mass: 615.7522, 	acc: 0.4, 	enginePower: 246.30089
        // cyerce, 		mass: 1256.6371, 	acc: 0.22, 	enginePower: 276.46014
        // aegires, 	mass: 6082.1235, 	acc: 0.2, 	enginePower: 1216.4247
        // navanax, 	mass: 10568.318, 	acc: 0.2, 	enginePower: 2113.6638
        //
        // alpha, 		mass: 201.06194, 	acc: 0.1, 	enginePower: 20.106194
        // beta, 		mass: 254.46901, 	acc: 0.1, 	enginePower: 25.446901
        // gamma, 		mass: 380.13272, 	acc: 0.11, 	enginePower: 41.814598
        //
        // stell, 		mass: 452.38934, 	acc: 0.5, 	enginePower: 226.19467
        // locus, 		mass: 1017.87604, 	acc: 0.5, 	enginePower: 508.93802
        // precept, 	mass: 2123.7168, 	acc: 0.5, 	enginePower: 1061.8584
        // vanquish, 	mass: 2463.0088, 	acc: 0.5, 	enginePower: 1231.5044
        // conquer, 	mass: 6647.6104, 	acc: 0.5, 	enginePower: 3323.8052
        //
        // merui, 		mass: 254.46901, 	acc: 0.5, 	enginePower: 127.234505
        // cleroi, 		mass: 615.7522, 	acc: 0.5, 	enginePower: 307.8761
        // anthicus, 	mass: 1385.4424, 	acc: 0.5, 	enginePower: 692.7212
        // tecta, 		mass: 1661.9026, 	acc: 0.5, 	enginePower: 830.9513
        // collaris, 	mass: 6082.1235, 	acc: 0.5, 	enginePower: 3041.0618
        //
        // elude, 		mass: 380.13272, 	acc: 0.09, 	enginePower: 34.211945
        // avert, 		mass: 452.38934, 	acc: 0.09, 	enginePower: 40.715042
        // obviate, 	mass: 1963.4955, 	acc: 0.09, 	enginePower: 176.7146
        // quell, 		mass: 4071.5042, 	acc: 0.1, 	enginePower: 407.15042
        // disrupt, 	mass: 6647.6104, 	acc: 0.1, 	enginePower: 664.76105
        //
        // renale, 		mass: 254.46901, 	acc: 0.5, 	enginePower: 127.234505
        // latum, 		mass: 7238.2295, 	acc: 0.5, 	enginePower: 3619.1147
        // evoke, 		mass: 254.46901, 	acc: 0.09, 	enginePower: 22.902212
        // incite, 		mass: 380.13272, 	acc: 0.09, 	enginePower: 34.211945
        // emanate, 	mass: 452.38934, 	acc: 0.08, 	enginePower: 36.191147
        // manifold, 	mass: 380.13272, 	acc: 0.1, 	enginePower: 38.01327


        return enginePowerMap.get(
    }
}
