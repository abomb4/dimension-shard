package dimensionshard;

import dimensionshard.types.planets.Wrek;
import mindustry.type.Planet;

/**
 * @author abomb4 2022-12-26 23:48:23
 */
public class DsPlanets {

    public static Planet wrek;

    public static void load() {
        wrek = new Wrek();
    }
}
