package dimensionshard;

import mindustry.type.SectorPreset;

import static dimensionshard.DsPlanets.wrek;

/**
 * 星球预设地区
 *
 * @author abomb4 2022-12-27 00:09:40
 */
public class DsSectorPresets {

    public static SectorPreset
        dimensionFall, hardStuff, dimensionOutpost,
        timeRiver, whiteFlame, dimensionShackles,
        darkGuard, thunderLightning, theBerserker;

    public static void load() {

        dimensionFall = new SectorPreset("dimensionFall", wrek, 89);
        dimensionFall.captureWave = 50;
        dimensionFall.difficulty = 6;

        hardStuff = new SectorPreset("hardStuff", wrek, 3);
        hardStuff.captureWave = 45;
        hardStuff.difficulty = 6;

        dimensionOutpost = new SectorPreset("dimensionOutpost", wrek, 160);
        dimensionOutpost.difficulty = 7;

        timeRiver = new SectorPreset("timeRiver", wrek, 45);
        timeRiver.captureWave = 50;
        timeRiver.difficulty = 7;

        whiteFlame = new SectorPreset("whiteFlame", wrek, 120);
        whiteFlame.captureWave = 45;
        whiteFlame.difficulty = 7;

        dimensionShackles = new SectorPreset("dimensionShackles", wrek, 174);
        dimensionShackles.captureWave = 80;
        dimensionShackles.difficulty = 9;

        darkGuard = new SectorPreset("darkGuard", wrek, 132);
        darkGuard.captureWave = 80;
        darkGuard.difficulty = 10;

        thunderLightning = new SectorPreset("thunderLightning", wrek, 224);
        thunderLightning.captureWave = 80;
        thunderLightning.difficulty = 11;

        theBerserker = new SectorPreset("theBerserker", wrek, 264);
        theBerserker.captureWave = 80;
        theBerserker.difficulty = 12;
    }
}
