package dimensionshard.types.planets;

import arc.func.Intc;
import arc.math.Mathf;
import arc.math.Rand;
import arc.struct.Seq;
import arc.util.Structs;
import mindustry.content.StatusEffects;
import mindustry.game.SpawnGroup;
import mindustry.type.UnitType;

import static dimensionshard.DsUnits.beat;
import static dimensionshard.DsUnits.burn;
import static dimensionshard.DsUnits.collapse;
import static dimensionshard.DsUnits.rhapsody;
import static mindustry.content.UnitTypes.*;

/**
 * Generate waves contains dimension-shard units.
 * <p>
 * Copied from Waves
 *
 * @author abomb4 2023-08-03
 */
public class WrekWaveGenerator {

    public static Seq<SpawnGroup> generate(float difficulty, Rand rand, boolean attack, boolean airOnly,
                                           boolean naval) {
        UnitType[][] species = {
            {dagger, mace, fortress, scepter, reign},
            {dagger, mace, fortress, beat, rhapsody},
            {nova, pulsar, quasar, vela, corvus},
            {nova, pulsar, quasar, beat, rhapsody},
            {crawler, atrax, spiroct, arkyid, toxopid},
            {risso, minke, bryde, sei, omura},
            {risso, oxynoe, cyerce, aegires, navanax},
            //retusa intentionally left out as it cannot damage the core properly
            {flare, horizon, zenith, rand.chance(0.5) ? quad : antumbra,
                rand.chance(0.1) ? quad : rand.chance(0.1) ? collapse : eclipse},
            {flare, horizon, zenith, burn, collapse},
        };

        if (airOnly) {
            species = Structs.filter(UnitType[].class, species, v -> v[0].flying);
        }

        if (naval) {
            species = Structs.filter(UnitType[].class, species, v -> v[0].flying || v[0].naval);
        } else {
            species = Structs.filter(UnitType[].class, species, v -> !v[0].naval);
        }

        UnitType[][] fspec = species;

        //required progression:
        //- extra periodic patterns

        Seq<SpawnGroup> out = new Seq<>();

        //max reasonable wave, after which everything gets boring
        int cap = 150;

        float shieldStart = 30, shieldsPerWave = 20 + difficulty * 30f;
        float[] scaling = {1, 2f, 3f, 4f, 5f};

        Intc createProgression = start -> {
            //main sequence
            UnitType[] curSpecies = Structs.random(fspec);
            int curTier = 0;

            for (int i = start; i < cap; ) {
                int f = i;
                int next = rand.random(8, 16) + (int) Mathf.lerp(5f, 0f, difficulty) + curTier * 4;

                float shieldAmount = Math.max((i - shieldStart) * shieldsPerWave, 0);
                int space = start == 0 ? 1 : rand.random(1, 2);
                int ctier = curTier;

                //main progression
                out.add(new SpawnGroup(curSpecies[Math.min(curTier, curSpecies.length - 1)]) {{
                    unitAmount = f == start ? 1 : 6 / (int) scaling[ctier];
                    begin = f;
                    end = f + next >= cap ? never : f + next;
                    max = 13;
                    unitScaling = (difficulty < 0.4f ? rand.random(2.5f, 5f) : rand.random(1f, 4f)) * scaling[ctier];
                    shields = shieldAmount;
                    shieldScaling = shieldsPerWave;
                    spacing = space;
                }});

                //extra progression that tails out, blends in
                out.add(new SpawnGroup(curSpecies[Math.min(curTier, curSpecies.length - 1)]) {{
                    unitAmount = 3 / (int) scaling[ctier];
                    begin = f + next - 1;
                    end = f + next + rand.random(6, 10);
                    max = 6;
                    unitScaling = rand.random(2f, 4f);
                    spacing = rand.random(2, 4);
                    shields = shieldAmount / 2f;
                    shieldScaling = shieldsPerWave;
                }});

                i += next + 1;
                if (curTier < 3 || (rand.chance(0.05) && difficulty > 0.8)) {
                    curTier++;
                }

                //do not spawn bosses
                curTier = Math.min(curTier, 3);

                //small chance to switch species
                if (rand.chance(0.3)) {
                    curSpecies = Structs.random(fspec);
                }
            }
        };

        createProgression.get(0);

        int step = 5 + rand.random(5);

        while (step <= cap) {
            createProgression.get(step);
            step += (int) (rand.random(15, 30) * Mathf.lerp(1f, 0.5f, difficulty));
        }

        int bossWave = (int) (rand.random(50, 70) * Mathf.lerp(1f, 0.7f, difficulty));
        int bossSpacing = (int) (rand.random(25, 40) * Mathf.lerp(1f, 0.6f, difficulty));

        int bossTier = difficulty < 0.6 ? 3 : 4;

        //main boss progression
        out.add(new SpawnGroup(Structs.random(species)[bossTier]) {{
            unitAmount = 1;
            begin = bossWave;
            spacing = bossSpacing;
            end = never;
            max = 16;
            unitScaling = bossSpacing;
            shieldScaling = shieldsPerWave;
            effect = StatusEffects.boss;
        }});

        //alt boss progression
        out.add(new SpawnGroup(Structs.random(species)[bossTier]) {{
            unitAmount = 1;
            begin = bossWave + rand.random(3, 5) * bossSpacing;
            spacing = bossSpacing;
            end = never;
            max = 16;
            unitScaling = bossSpacing;
            shieldScaling = shieldsPerWave;
            effect = StatusEffects.boss;
        }});

        int finalBossStart = 120 + rand.random(30);

        //final boss waves
        out.add(new SpawnGroup(Structs.random(species)[bossTier]) {{
            unitAmount = 1;
            begin = finalBossStart;
            spacing = bossSpacing / 2;
            end = never;
            unitScaling = bossSpacing;
            shields = 500;
            shieldScaling = shieldsPerWave * 4;
            effect = StatusEffects.boss;
        }});

        //final boss waves (alt)
        out.add(new SpawnGroup(Structs.random(species)[bossTier]) {{
            unitAmount = 1;
            begin = finalBossStart + 15;
            spacing = bossSpacing / 2;
            end = never;
            unitScaling = bossSpacing;
            shields = 500;
            shieldScaling = shieldsPerWave * 4;
            effect = StatusEffects.boss;
        }});

        //add megas to heal the base.
        if (attack && difficulty >= 0.5) {
            int amount = Mathf.random(1, 3 + (int) (difficulty * 2));

            for (int i = 0; i < amount; i++) {
                int wave = Mathf.random(3, 20);
                out.add(new SpawnGroup(mega) {{
                    unitAmount = 1;
                    begin = wave;
                    end = wave;
                    max = 16;
                }});
            }
        }

        //shift back waves on higher difficulty for a harder start
        int shift = Math.max((int) (difficulty * 14 - 5), 0);

        for (SpawnGroup group : out) {
            group.begin -= shift;
            group.end -= shift;
        }

        return out;
    }
}
