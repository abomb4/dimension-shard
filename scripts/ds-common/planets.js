// Copyright (C) 2020 abomb4
//
// This file is part of Dimension Shard.
//
// Dimension Shard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dimension Shard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dimension Shard.  If not, see <http://www.gnu.org/licenses/>.

const lib = require("abomb4/lib");
const { dimensionShardOre } = require("ds-common/items");
const { burn } = require("tech-ds/unit/aat4-burn");
const { collapse } = require("tech-ds/unit/aat5-collapse");
const { beat } = require("tech-ds/unit/gat4-beat");
const { rhapsody } = require("tech-ds/unit/gat5-rhapsody");


const wrek = new JavaAdapter(Planet, {
    load() {
        this.meshLoader = prov(() => new HexMesh(wrek, 6));
        this.super$load();
    }
}, "wrek", Planets.sun, 3, 1);
wrek.generator = new SerpuloPlanetGenerator();
wrek.atmosphereColor = Color.valueOf("213159");
wrek.atmosphereRadIn = 0.06;
wrek.atmosphereRadOut = 0.1;
wrek.startSector = 151;

const dimensionFall = new SectorPreset("dimensionFall", wrek, 89);
dimensionFall.captureWave = 50;
dimensionFall.difficulty = 6;
exports.dimensionFall = dimensionFall;

const hardStuff = new SectorPreset("hardStuff", wrek, 3);
hardStuff.captureWave = 45;
hardStuff.difficulty = 6;
exports.hardStuff = hardStuff;

const dimensionOutpost = new SectorPreset("dimensionOutpost", wrek, 160);
dimensionOutpost.difficulty = 7;
exports.dimensionOutpost = dimensionOutpost;

const timeRiver = new SectorPreset("timeRiver", wrek, 45);
timeRiver.captureWave = 50;
timeRiver.difficulty = 7;
exports.timeRiver = timeRiver;

const whiteFlame = new SectorPreset("whiteFlame", wrek, 120);
whiteFlame.captureWave = 45;
whiteFlame.difficulty = 7;
exports.whiteFlame = whiteFlame;

const dimensionShackles = new SectorPreset("dimensionShackles", wrek, 174);
dimensionShackles.captureWave = 80;
dimensionShackles.difficulty = 9;
exports.dimensionShackles = dimensionShackles;

const darkGuard = new SectorPreset("darkGuard", wrek, 132);
darkGuard.captureWave = 80;
darkGuard.difficulty = 10;
exports.darkGuard = darkGuard;

const thunderAndLightning = new SectorPreset("thunderAndLightning", wrek, 224);
thunderAndLightning.captureWave = 80;
thunderAndLightning.difficulty = 11;
exports.thunderAndLightning = thunderAndLightning;

const theBerserker = new SectorPreset("theBerserker", wrek, 264);
theBerserker.captureWave = 80;
theBerserker.difficulty = 12;
exports.theBerserker = theBerserker;

function generateWaves(difficulty, rand, attack) {
    const never = Packages.java.lang.Integer.MAX_VALUE;
    const {
        dagger, mace, fortress, scepter, reign,
        nova, pulsar, quasar, vela, corvus,
        crawler, atrax, spiroct, arkyid, toxopid,
        flare, horizon, zenith, mega, quad, antumbra, eclipse
    } = UnitTypes;
    let species = [
        [ dagger, mace, fortress, scepter, reign ],
        [ dagger, mace, fortress, beat, rhapsody ],
        [ nova, pulsar, quasar, vela, corvus ],
        [ nova, pulsar, quasar, beat, rhapsody ],
        [ crawler, atrax, spiroct, arkyid, toxopid ],
        [ flare, horizon, zenith, rand.chance(0.5) ? quad : antumbra, rand.chance(0.1) ? collapse : eclipse ],
        [ flare, horizon, zenith, burn, collapse ],
    ];

    //required progression:
    //- extra periodic patterns

    let out = Seq.of(SpawnGroup);

    //max reasonable wave, after which everything gets boring
    let cap = 150;

    let shieldStart = 30, shieldsPerWave = 20 + difficulty*30;
    let scaling = [1, 2, 3, 4, 5];

    let createProgression = lib.intc(start => {
        //main sequence
        let curSpecies = Structs.random(species);
        let curTier = 0;

        for(let i = start; i < cap;){
            let f = i;
            let next = rand.random(8, 16) + Mathf.lerp(5, 0, difficulty) + curTier * 4;

            let shieldAmount = Math.max((i - shieldStart) * shieldsPerWave, 0);
            let space = start == 0 ? 1 : rand.random(1, 2);
            let ctier = curTier;

            //main progression
            out.add((() => {
                let g = new SpawnGroup(curSpecies[Math.min(curTier, curSpecies.length - 1)]);
                g.unitAmount = f == start ? 1 : 6 / scaling[ctier];
                g.begin = f;
                g.end = f + next >= cap ? never : f + next;
                g.max = 13;
                g.unitScaling = (difficulty < 0.4 ? rand.random(2.5, 5) : rand.random(1, 4)) * scaling[ctier];
                g.shields = shieldAmount;
                g.shieldScaling = shieldsPerWave;
                g.spacing = space;
                return g;
            })());

            //extra progression that tails out, blends in
            out.add((() => {
                let g = new SpawnGroup(curSpecies[Math.min(curTier, curSpecies.length - 1)]);
                g.unitAmount = 3 / scaling[ctier];
                g.begin = f + next - 1;
                g.end = f + next + rand.random(6, 10);
                g.max = 6;
                g.unitScaling = rand.random(2, 4);
                g.spacing = rand.random(2, 4);
                g.shields = shieldAmount/2;
                g.shieldScaling = shieldsPerWave;
                return g;
            })());

            i += next + 1;
            if(curTier < 3 || (rand.chance(0.05) && difficulty > 0.8)){
                curTier ++;
            }

            //do not spawn bosses
            curTier = Math.min(curTier, 3);

            //small chance to switch species
            if(rand.chance(0.3)){
                curSpecies = Structs.random(species);
            }
        }
    });

    createProgression.get(0);

    let step = 5 + rand.random(5);

    while(step <= cap){
        createProgression.get(step);
        step += lib.int(rand.random(15, 30) * Mathf.lerp(1, 0.5, difficulty));
    }

    let bossWave = lib.int(rand.random(50, 70) * Mathf.lerp(1, 0.7, difficulty));
    let bossSpacing = lib.int(rand.random(25, 40) * Mathf.lerp(1, 0.6, difficulty));

    let bossTier = difficulty < 0.6 ? 3 : 4;

    //main boss progression
    out.add((() => {
        let g = new SpawnGroup(Structs.random(species)[bossTier]);
        g.unitAmount = 1;
        g.begin = bossWave;
        g.spacing = bossSpacing;
        g.end = never;
        g.max = 16;
        g.unitScaling = bossSpacing;
        g.shieldScaling = shieldsPerWave;
        g.effect = StatusEffects.boss;
        return g;
    })());

    //alt boss progression
    out.add((() => {
        let g = new SpawnGroup(Structs.random(species)[bossTier]);
        g.unitAmount = 1;
        g.begin = bossWave + rand.random(3, 5) * bossSpacing;
        g.spacing = bossSpacing;
        g.end = never;
        g.max = 16;
        g.unitScaling = bossSpacing;
        g.shieldScaling = shieldsPerWave;
        g.effect = StatusEffects.boss;
        return g;
    })());

    let finalBossStart = 120 + rand.random(30);

    //final boss waves
    out.add((() => {
        let g = new SpawnGroup(Structs.random(species)[bossTier]);
        g.unitAmount = 1;
        g.begin = finalBossStart;
        g.spacing = bossSpacing/2;
        g.end = never;
        g.unitScaling = bossSpacing;
        g.shields = 500;
        g.shieldScaling = shieldsPerWave * 4;
        g.effect = StatusEffects.boss;
        return g;
    })());

    //final boss waves (alt)
    out.add((() => {
        let g = new SpawnGroup(Structs.random(species)[bossTier]);
        g.unitAmount = 1;
        g.begin = finalBossStart + 15;
        g.spacing = bossSpacing/2;
        g.end = never;
        g.unitScaling = bossSpacing;
        g.shields = 500;
        g.shieldScaling = shieldsPerWave * 4;
        g.effect = StatusEffects.boss;
        return g;
    })());

    //add megas to heal the base.
    if(attack && difficulty >= 0.5){
        let amount = Mathf.random(1, 3 + (difficulty*2));

        for(let i = 0; i < amount; i++){
            let wave = Mathf.random(3, 20);
            out.add((() => {
                let g = new SpawnGroup(mega)
                g.unitAmount = 1;
                g.begin = wave;
                g.end = wave;
                g.max = 16;
                return g;
            })());
        }
    }

    //shift back waves on higher difficulty for a harder start
    let shift = Math.max((difficulty * 14 - 5), 0);

    out.each(cons(group => {
        group.begin -= shift;
        group.end -= shift;
    }));

    return out;
}
const schematicsModifier = (() => {
    function createPart(schem) {
        const part = new BaseRegistry.BasePart(schem);
        Tmp.v1.setZero();
        let drills = 0;
        schem.tiles.each(cons(tile => {
            if (tile.block.priority == TargetPriority.core && tile.block.unitType !== undefined) {
                part.core = tile.block;
            }

            //save the required resource based on item source - multiple sources are not allowed
            if (tile.block instanceof ItemSource) {
                let config = tile.config;
                if (config != null) part.required = config;
            }

            if(tile.block instanceof Drill || tile.block instanceof Pump){
                Tmp.v1.add(tile.x * Vars.tilesize + tile.block.offset, tile.y * Vars.tilesize + tile.block.offset);
                drills++;
            }
        }));
        schem.tiles.removeAll(boolf(s => s.block.buildVisibility == BuildVisibility.sandboxOnly));

        part.tier = schem.tiles.sumf(floatf(s => Mathf.pow(s.block.buildCost / s.block.buildCostMultiplier, 1.4)));

        if (drills > 0) {
            Tmp.v1.scl(1 / drills).scl(1 / Vars.tilesize);
            part.centerX = Tmp.v1.x;
            part.centerY = Tmp.v1.y;
        } else {
            part.centerX = part.schematic.width / 2;
            part.centerY = part.schematic.height / 2;
        }
        return part;
    }
    const parts = [
        // Dimension Enemy Base Small
        createPart(Schematics.readBase64("bXNjaAF4nF1PyU7DMBB9NM7eVpyQgAO9Ix/5AQRfwBFxcJJRWuTY0SQF5dtZyjilQiJR/OYtM55gjWUE5UxHuHrYdeSGnXebR0fdtLk3A22eOmMtyoaGmnf9KC6AxJqK7IDF80uJtXQ1umf/SvXoGTfNaY4etoYbXfmu0iNZ6j2PxEjY7wOueGx1S47YhL5zw51nanTt3RtNomR7Z71pJHr7f+YfH6neOm99O0kjk75DOvSyCROK3r8Ta+cbwqoyo1w6aWu4JaS/VH7mWj4ozE8KnMlbAAuBBItIChXsxYmlwYuERUogD6I6RtQxokIksNmLJS1HjCQGSlHjoCfIJBxU5KKvpUoRSXUpmMvV4mfIs+jwefiGOnwJfohRhNWKeY6ElscZJTLpvJD1l7LRDBnwA3mkY4A=")),
        // DE Square Defence
        createPart(Schematics.readBase64("bXNjaAF4nHVSwZLTMAxVkzSNk82WvXBlbwzD+MgfLAfOHBkObqJty6RxcFKYfg0fyB8AS3iSp1tmZ7at/Szp6UmWSzdUp5T17sB0c/f+9uPXowt8e8f33DdMVctjE/bDtPc9EeWd23A3UvLp8xW9avcH7kdE7LhzobUbf9jYiTsefJg40DXCrR2C/8LN5APlEBo6BvqjxF8/FdBt2LmR7Ti4hu0m7NstUx2mrd1yz8GJzgsXDj5waxvff+MTPKuNm6B4ouLYd961EH/7VPxiT9zset/57QkKge07evM8uQmncXKdPVcoB/+dg+19yxjIB6IFvvKjLMKKKMGhIkoBOS0y2OlqnuffJIwlTFBzAJZYK8lNyAjnB9ZPeCRXIYmQkm7IEMtEZxkBpQiympAJcwnQElkskUkJiZnIrMRaCrMA5EuCRxxGHDmlcLyEIWfdjDpEJbnco5DaCFzryehJKKVSsGYl4VMCEqlRUFqUGqH5YX7A/gcpC9jp/FeKoaVs/iU5sIRvhA+GcqWwRhMduszmnIfOtEwZO6tIL4tZyXWjzzx2ax67NehWKLEnpC1IReIE5BSvLiEdWhXHW8l4pUyc3VLnp2F9mSth5YA8Wuqs4wPV8UXrKFSLUArQqddRpT4nlBEqufFa0jN0/d9fKYeZR6+5TJ3ArSS8juJr4YgF8X8lh7f1")),
        // DE Super Spectre
        // createPart(Schematics.readBase64("bXNjaAF4nH1TS47TQBCtOIndtuPYkyAkNmgESAiQl9wATjBihVh47J6JwXGbtjOfEyBWnIEFe87BgVgwyZhX3ZkPMwq22lXdVf3q1es2zenBkEZ1tpSUvHm7f7BqpN4/aGTeaUlhIdtcl01XqpqI3Co7lFVLzvsPc5ouZV2kjVYfkas0zYoSKy0y03aR6SItcvLaLdDze0F5VCGUHimdy1soT+8mdpinuVo2WratLFLdHVPQqFOp01oVkp7c3dAsslambZMB91CXxbGkONfn6qhalUW6LM+kJrGqK5UV8J7d3W6LLpQuV0vUrYtV2dHL/2ZV5WeG1mrVAfFeq7tYvbqnyfW8k/miVpU6PgcFLdPXFJ9mAE/lWaczI9TjHULVBVblrrg6kbrQ5YmkqFlVrbzuMLmRNK0yDXovdtODnG2XVelh1oHUOW7GO+LrQTTAm7A/IJ/IwTshGpqXRvggZYxFIRxYswPLI851EY29vu+/Yfwg3jUj8hCMOTiiPQ7ycwlwFwNrvE4CUK41njUhsB8abwLvkfEis+bCm3pcFUC/UXdMezRkM6NhADMng+aKABXAv19jXNLQjB6kBjTuNxg9UX9hOuR8T+An4pjtkUJ8BdcRqLMGAZf8MbczgT8hsxCPuTEPI2HHpRl3eMktgpgLKk5kwibLoA22aJ5BC03HsQiYGEgxWer/IGvNhJG7IXskA3MCfCaebdTjRqdAchhd0IhLf8X4CUzIJSAxUCP4gszniq2wbMWWLZ81YAWzRY+3gSIjL3dOHpNHKbQ+xjQWPqgNoN8NPYfVNE30yBxt6fqWrs90YzSMa5QQ04c0gaUWXFMLLLXgX2qBFZLFQjy0e0MsE5sJH0oIKZAZcjEXZs77v2B8R86EbxVuEvksdL/uN5B2A7vG7AJez5Kb17HSw7rIT65YcOMRlw+MJgiC/FXQx4SJGBMRrmMEfchs2SNDzWj6CeMXCE6ZzsycnTG+NQGXSfh3YKE8a0IyvyNU+QsvFG89")),
        // DE Ion Cannon 2
        createPart(Schematics.readBase64("bXNjaAF4nHVUS3LTQBBtS9Ynsh3ZDiFs+C8oitKGKk4ALDgDxUK2JomJrDEj5eM1J2DBBYAqOCEF+SDeGykm5ZBSzUz3dE/36zc9kjsycqVbpHMl8avXD97o4sHLtCiwPJdepsqpmS2qmS5ExM/TicpLcd6+uyX3s9lcFSUsSbmfmiyhNNF5lVSHxqhKnqw72Gmxn5YqKRfpVCUTM8v2lDxad/yPz3jdJ5vK3f8hmOo8V9NKG7m3bq6gw15k2FVG4qlZ6t38cJYl89kJNh6uH2gQ5LMP9KnS4kA24QB8Rr9vcsTHaaVMok4qk9qNYWrm2qiMeY7UEjvRQh/DpdCZkqfXqljpAFNWaZ5M0goRl/L4BvTzhVFliQSm2pPwsMh1mgH7s5sjV2q6X+hc7y1x3KjkxQ3M6CNlMjM7UtevdqLnE8TJ1UIboJMBkid7qlAmZdHXbjpTu7yEZFcbEPiPLpFMpCN9Th1xA2x0MQJxoHpBXde/MWqr+lQ/Y/ywanCpfrdq+M/ZxddhIJfBPJj9RttAx0LwmcBjUhdLLBJaJ5g9HuASEpAnEYN+wvgmEY754vQwBWFEd6aF6aI+5ywOpIv6TKQ+I2Ard4T+UdhFXAfxBBbmYALWCHMgXUA/RYhThPsjfv0Hs4P5HEE9jL5FCwABAVADTVwAcoApItZA+iQPNVlgoXQtH0IbVe9SdeEfMhB3g6sMh1c5hMJgIdgAzE0sXY/hKXkryffIKKXAYzGUQki3bRowG8MRdA9hi8RiRdARpg7de+KGjuWepGxi27WHKfWtNIY0YP7ByjSQqDUNEABTzGCb+Nx2nyjsMiDOGFggx6sC4lUB8aqAeFVA3BZAqcHQB3yXpA5Bqm3OhtQhSG1VVjtkodwN7G5L6hCkrtQe1A3oLgxsUpc3DKtnb/oMsi9boKfHSxwBAhgbUeZiu2WEbvERqWOficPWhib1edspo6ZTRsRCLWiWkF095pkIi89IY7YxOo09J+w5fERRW0Suxdu1j8CzL2fMID3A45Wxm7stXL/ZjkK8NnYu79K2/pb0WPZHjK9W7V+qX3B4m2i4bJDC7eY1brNnXHDe4bvdZuyO7OC/gEPnlgcHqneV4B38F6AetP+FnYb+g/a/sHOVfoayL/onxi/5CzMarn0=")),
        // With an Electric Storm and Time Flow
        createPart(Schematics.readBase64("bXNjaAF4nHVWW3LjRBS9elhqyw/Z8iPJQA2hKIqiKH2xhZkPqtiEYnccM7JlZHky2QY/FPyxCbYCC2AJ/CSTRJzTN1Nhkpq4Wkfdun3P6fvoiryUE1/CbbGxMn/1+vR1aRdNvV6cvirqN6c//rC6aKS3tPtFvd4162orciyzXVnsm2K7Pmzyy6Is87KoV1bSy6KxdW7fNXWxaKpahmf1ermy+aLaLg/rRga7Q7l/nH6xXG/sdg+n+f6iqJf5WbU5yxtb2l1Vw5N8+9Tgcb6or6CgzM+KBpZXkuyqS3Bvq6WVIYyW+a6ufrJOxjdP3bjH7qKAlv2uWNhcdUq8Xzh3z3cs7Tnjkp9XNcwfXX/91NA+hC/f4/Mmbw51bRv58qmZ0pbrnw/rZY5IvpFRUW+q2i4Znbf2Cr5Hj0d6CLA5bMuqWELgd5+OTGMXF9uqrFZXcFXb/Ht5+dS4wdxlAatwliKY1XlJKZv1Oyxkz7wvJH3Mpcp78cwIBYMjsWAGdbPKV3Zr64JR+uoTAja72u73ODPMReRPDPHxw18oHiFSMAqJQl9hqJCJ+5vy4cmIi57MP7jyPTxC8fkexVgM+CUIMI0VjEJXIVHoKfQVBhKE2Dil5wCaAoJRSBT6CkNahjJ2JKoiVBWhquioCnfGoINprGAUuuIT4DQC9EzStu11e4dxLwGG195jdt++b1voIIfXXmPcwk+HIggQYQCTGJv/wPjLD2E8I2VHjsgdqaaImggxaSOyx4CEbiKEMugCMsqOP5Ydq9CYqSAMFJAR+kpNB1JDSoSwjoQuaB42x0pvlN4ovSF9Ao8JXRv49Ht4T8XrY3HChBqqZ44+UtGlKavCeUvUW6KHST58cxt7/984wBTyh4DEpO17kfZGfIwQ7xHCybjduV/b3uB5gwBz3InnyCJXNWF7DQ098hhAxl2/Y/ztc3XCiPRQMp44JVDWV4F9ChwIz+angH4HxRsweRn39LmVVlPK7WsNDbScBzgGGH7D+CdIMe1i7xiJoh/hQoqFkTfGGxohA2QSTPAlYDBTZsEgSyZ2rYXwwMvQeem5N27vgX2o7ENlT7VyUi3SlK2SAmgceVO8jWLtQfFReKmMKfKW7ejzq4vMr4wMijqViTHtLWpDXDnfgcdzkQ+w1uGAGxafQRW1KPR719cesoJ8AEHnFI88vqlixsAdeMQD4xuE+6JtSMD7DHF1xx9Ll4L+5fGRgPFDzDy8TXm+DOfD9gyppniXnzg4wvYh80MOZzVmx2fKlynfhA80Hj1EgL7p4oAhRuSaAb3LYsOhbh8uBnadeDFsndepck+Ve8qGNgAXwV9cBGNMJ6ScKuVMKWe6caZ1MOMVwI5PDa+/TkCDEbt6RtkhurDDs8z19plrYudMLCFRwB14BEv04QTg7te5kh4p6RG2ewSj0FVIFHoKfQV3Qxwr37HyHSvfMfkmcsLD8p8Lx3CivXrCu2MiL0jE2VBhpJApuB57QWcin7nLBtBTGBA+55VNAO1/1mmXWw==")),
        // Dimension Enemy Base Dark
        // createPart(Schematics.readBase64("bXNjaAF4nHVU247TMBCdzaVx06a3vbYL7Eo8IIT8yA+g5SsQD2njbQtpUjnZXfqIxAcg8Qm883vspSWcsbtdqYVG9tjj8cw5M+PSGe275GXxTFH/YjpTWTHNs/P3mZotzt/FhTq/iPVnaiSqGOnpvMQhEdXSeKjSgpwPH3vUwqVEznX+SY3KXFMveXQji0msE5mM6GxbN8xnQ1mqVM1zXSpNr3cubfYjvSjKOJXDuITlgto3MaRUX0odm4CdeX4DRZYnSqaxHisa7HgDCZlOx5OSajq/4oivtm3MNJ+Asyzm8UjJoZ4mcPZy27DEXo7y2VyrolCJ1OV411uiLlPkQ17mGq6eshM+gSVxlaV5nADMi3/GyK+VTvT0WtGb/6enVKNJlqf5eAFMWsm3dLptbOlcx1dpSRHQyrHKlI4Zzk5h1vBUKUteodgxBjlEe/gaZH4R7xzyeb1Hwho4PLnUIkwOdYg8LAIr6laY6y6f8R4/n9UiqFYkqiWFkH61rCpysSKMiEJYeBypBl/GjU9NwtpHJMeBusNxA7jFWY0tBUQrqKrqB8ZPYmMTL7AXA4bowcrni3VqswjBA6o6uXzxO8YvA9tj0zpfrAO92YVwb4SwImQaDWqKDigQ4K+qewZf3VW38HOL1YNZ83xHHuZl9bu6Jad6wO4PyD4QEwEC+AG4EPG6vG5STXCeHPhYYV4iErNoUgDwLSBokmDA9/wozUF9cxDywQrjznhqCMcY+YgVce4Iyog82B+BasTpYEXNKFpIC7LdxiKy+jb0xyZdpuxsgNR32E8XX8TKji1tlyem8Oi8a513187rtM+pbFAP/HzTPD74uQbtPcrPHHsbjj1wNNAtx96GYw8cuaEMR8LWtMIBJ9JDiJoVwoqQxQFX0qFDBi8gTLW/rat9aOt7aLuNuRKjNfiObX8d8X0PO5876RgoXIdObLOf8JmAML33dd17fUbjQ7iCG1mYSuIfF/Xn1u5bT33bkwP7Xga20Qf8Xhw65TOCMG/wmU3/M7bco+ds8hc3xU1k")),
        // DE Electric Dark LIght
        createPart(Schematics.readBase64("bXNjaAF4nHVV23LjRBBtX2TJ8kW2ZcvO7tYSiqIoitIjf7D7QBV/QPGg2JPErGwZWSab3+CFgjd+gl+BD+ATeNlsEnG6j6mwSa1d4zMzmu4+faZblpdy0pL2Nts4SV69Pn2du2VVrpenr7Lyzem331xcVtJbuf2yXO+qdbEVkU6enbl8L83vvl/IbJdn+yrbrg+b9CrL8zTPygsn0VVWuTJ1b6syW1ZFKcOzcr26cOmy2K4O60oGu0O+f1h+slpv3HaPAOn+MitX6VmxOUsrl7tdUcKTfPn4wMN6WV6DQZ6eZRVOXku4K64Qe1usnAxxaJXuyuIHZzS+eOzGfnaXGbjsd9nSpeQp/n5p7p5arNy5apSeFyWOP7j+/PFBd5Qy3ePxJq0OZekq+fTxMYbN1z8e1qsUSr6RUVZuitKtVJ2f3DV8jx5SOgocHLZ5ka1A8KuPK1O55eW2yIuLa7gqXfq1vHx8uMLabgG7cBZBzOI8Vyqb9VtsTJ54X0r0cJek9+zJIRQPUtLiGZTVRXrhtq7MVKXPPkJgsyvdfo+ccRw19geGNMU+bUKHEBBCQp8wJEwIU/1pyIiQ0FVT5011pvOOj82WnW5h6UtLISB0CSGhR+gTBtJqw2Sq3lrKSSEghIQ+YajM2zJmjISZGIs2WXhkwSw9fH1CQOgSQs3ck14Q1nX9rr7DuJcWRqO+x+q+fl/Xpk0LO+8wbuHHUxIKQxXMk9iH8e8YfyJ0R2aMOKesxqmjnBSMREej+4CQACm7gImYVh/Q9knU14gKA8JQzFcUeKDaVoog5knbRGuIup3zOi18wPCBhg/hMRQTAj57mEd60V2JaTATu6MPWHRZCSG9hfQWMpnwv2dm2Pu/4QDLrjSHGiWI6vci9Y00MdqYdyCn6nZn37q+we8NBNZxZ+6bph644ySuSOMEgIla/Ybxl+3GYjBlvRrBPgn2leDAcmtGgL4n8swubyIGMU8dTRNSNvYDpIEIv2L8DX0G0oXtHBelfmwjwkaC8hvo7U0A8BnjSUtdRVoyAW4p8I+tpSoPzUvPZpHNGphN2WEWPaLcEYs00ruP9OupkylmI589aLpEMlaSt9aH+tSU+cWU6WAZB0F9i9oQK+c72DRM+Rb2PB3GbSRBgApCod+bowaeNDSUsU1sRrZjzCzZEV8FI5Iek9FYtZ9BA0t9LF0l888x9fFRrwZmU81torklgFBTnNjdaM3GWtqexTAYK6UJ400YL9ZAaDr10AH0gy6Sa2N0rBHQt1poSOj2+FLw7Ap8nDWvU8aeMvaUdTWlej+bej6WMd91FnLGkDMazlgDM3bhDF3YsCB6YKRxZko7RjaeWiXsk4SXmrChE/ZgAllxbq43rwZWDAmDzhl0TvM5zec0n9N8ruYKfYK9HRY0WNBgQYOFGsRywmZdMMIJ+/RE2yVGa/hcDQkjwoRgzJ6pM5Hn/NN4rtEVrGle8C/khYb9Fz53l44=")),
        // Dimension Enemy Unbeatable
        // createPart(Schematics.readBase64("bXNjaAF4nH1VWXLbRhQcrgAIEtwlipYtoZxUKgt+c4LkCPlK5QMkxhJjkGBA0LLOk8vkBjmHssiWTAnpNz2SXJIdssDGm3lLv2WG6qU6rKn6Kl5qNf1hsdSrzSJbHf+40svz459WMx0X8SzVyk/0Zp4v1gV2lVLNNJ7pdKOqP/9yqMbrNN4U8WqxXUZncZpGaZyfaBXAWRKt8+xXPS+yXHXP4kLnkX5b5LFZOEru4kWb0zhPInmbZWkRFds818VThVm2nEWFTvU6y+FLffFYwfwUp1kuXObZKtkuCtVaZ2cIvMoSrZy7xW/+1zRd/LZdJFGebSXMV5/UXZ/GGx1t1vFcR7N8kSDl7jw/z16lYrpcvIVl61WWa9gk2ZnqPdCwFXrx2G8B2dDGKqy/frz/ICMQSp5Gs7gAw3M1faIa56+Rxslp8ZR+ol+l6EkEcuD+0KHwsSKTs8VAh18/bYlNSqNp8qbc7SrN4gRv3z1WRSWyLSJukAc8F/PTxeokmuuV1Pjbz+da6PnpKkuzk3PUJtfR958pXPZG50m+eKPVl4/3teSbL+bRBnku7+br5Wfqv1yD6kaDcXGimjLGIPj8U9M6z9KUtRs84T/HOflDPXyqhDqhSXAJLUKbEBB6hAFhRNgjTAjTe8cVQI3QIDgETxSqyid0CF1CnzBUMK2pfTqb3rOswxWcNfDSFsZ11XGd8lZV8dTxNMvbcofnGtJ7pFJHzLqwF+iqmkCP0CcMCEPCSBjXJWAFQapSjYZURKJ6qiZSi5JPqU2pQylQJtkuoU9ALh5g7JRl+TueP+9q3QC4hBahTQjYjqlQcYVRC/wdgkfwCSieD5W+qDtq5EodwLy8MZZ7kobDzrjsJli6rXKnXKiosoRaBaW6wffayM3y2pSvyQpDHyw6iOoQPIJP6MhkeAxgBqYLo7pYtaQIPeiNJQn/TgXO+oaFAZ8QyES1JYn7eWuzBR1OgK1HoBy3hlbvkCCaDHcBvvA1BHQxFvtmYSSWgQQWS1PEnhRxhAhOUyUlPzs8yFn1ge+EOvAfPLci2/334sNi1WLdYhN4afcv7f6l3b+0+zs5M8AboQK8sHoX1u7Cxruw8ST+B3t+enZMpCyexbZFKYhv0bXYkHdJzK5V7ZqZNIljY++srWvzbtk6BJZ33+r2bNyPY/mWQ8vm1LJ8fXs+PSu7Fh2LTYsNi/WP9HboVF8mqY2R6bttM5RNQ79pTvQ1SrODq2t8r+ACJPFUObiGWFfOmIBpfZdD02P/e9zryZ4HMMfwX3W3uUfVqVxjA7nYApAZySgN6WbAa2coExRAGnFxKtKQkvmR935D3EyQ0JDr0DqAVJVujOlhLE0VcKS9Y+W6LVWR8ypFR1Gq5QeMBIqDplTwVJH1B3zfmXO2J8dsCLO2CSV+OnQXKLNtsjZJHQCqcub2ZAw6AEdU9mmwJ0p1SBMaGKb7ZLovTCX9gc1nwhQndDsRrSlemgRPlCfKt4wmcvInWO/Txng+EJsKoMaltnA4EM3AEDV3rvE/ZZCpGMjpDQhd3glD11e8ceW/Re45vGMq8J9RvsfkNMzlUMolUf5l7sIpL4IpL5Rn5PFMprWvDqUkbUie6943QJVXmJArNOEKt+IVzqprbsQe1Lvi6lB+KgCfMCSYi+45kziUaDX1QtL1sOjJ0P1tDk8A0XTgOUfrhfw8U0dCJYDkiZsjKZBAlzCgypgGpkRHohkAzJQe85wfcy/kH3DI/8yQ/zYh/wJCXtQhb9qQd2vIuQlJKWS7Q85RKCn9B1uHlek=")),

        // -- Not important --
        // at titanium, plastanium ripple
        createPart(Schematics.readBase64("bXNjaAF4nF1PQVLDMBBT7KRNk5QOH+DAjYNPvMhNDPWME2fslNKP8Ra+Qqc0yLnAcNjR7lrSytjiTiAfdG8gzDPqzsQ22HGyfgDucB+900GNejBOsXs1WPF5dMTeDJ0J2J30ZIIy71PQ7eQDHjvLp0gHFQ86dGo86GhUHHVr1D7YbjHxR6pQ28n0KvpjaA223ro/PtXoTzQefGewi9bZNjn2xi1CR8+gumCdQxG1e/PYtV471ZphCvblyCtP/5P8zm04x4nsvZ5odwbwAGSQEBlhgyxBwzUEVlwj5ywEuxxSEkpk7FCt5/l2ZV1EwbGGTJwGcpWIBXUiZ5eTNn+wPuUaBR2zktuqLIH5wjWLh7L5C3K+sK7I5xsZPEo6c2yQ7GVF6SZdXkEky28GLEWNNdWiIVAiCUvkMglT0iVruWSdr+kaH6tkl4DULT2r9NeajUzQpH8kP/kDuuCH0Q==")),
        // at dimension shard
        createPart(Schematics.readBase64("bXNjaAF4nF2Q3Y6bMBCFDzY4hPx3H6BS7y21j+SE0S4VYGScpPvkVbvt0mNoblaWzueZOTNjwBP2CnnvOoGSb9jUMl5CM8TG98Aen+qmk35kZMcXF2pbX/D5Y+7su7ON0srgQ5SAXYjP9ll6CS76gKMLnQ9S24vvb/LKzJePE2aJLz40187WoWlbnEbfumAH10treXsW7IZrO0oaU1+biMPQujG6PvXcHVsOd8f1Vn7E4C5p8+rsIjOvKOrG14Inf5PA8TexQ/DfZTYdB39nV0/D/z2bJkpnR38NFwHwFchQQWVQKKAzaF60oqwSNNZQGjmPzmkwoBTYYrEvoAUoOUfNXZibmSyYpNMQBdSKMNAJqwUldEmfTpZ1sqTIQK0J1iqki05SQRtKkWpVqq2QqllCtWCDrKTMwzbJuSG4b0uU5WH6g2z6Pb1P70DS6ef0l/rG6I23X3x9DsVY0ZGTOWlIQ+44oyqAI6dveZShzO/dLQt3j8ikX7FPH2+IOXlYLIdHZFLtuESnpXZ6RKz9AyACjo0=")),
        // at dimension shard, power + bomb teleporter
        createPart(Schematics.readBase64("bXNjaAF4nB2OwXLDIAxE15jYadw66anHfgHX/g+2Na5nMHgEbZq/75JBo7eIlRBuuBjY6HeByV8YFsmzbkfZUgTOeM8peHWHjxIc1SoY8g/hSrqLop98KaIPfC7bLjGzzeVvr4ub0j65IkGOpHTgTcvqVomiviTFzeueVBY3p/grD1aGKfhc3KJbCLjePZuc/BX1c/UDH0ADC9NQd2cYg7og0VQALYVpib5qy8M4sch0QgdTb3zrmCzanmjQWlTBwkt1VvS14cIRjIGSeK3zQTw/GlnkFiOa5/cjDcS14h9k5Tnc")),
        // Dimension Shard Power Center
        createPart(Schematics.readBase64("bXNjaAF4nG1Sy27TQBS98SR+No7jhLRFCKqyYuGvQOz5BBx7lFqyPdHYSenfc84MsAgoke499zzm4ZEPUgayHOtBS/7t6bt51fbpqx5nbSVr9dTY7jx3ZhTZSNl2gx4noGp6qW1btY1k08WedDXTJ9GxnmF8k+1k+tpW53rUfYXupOXTrflohmM1616fjeVqm9capdI/Z1s3s0FaY8b20s0SWnOhoqjtYKxuKxBX/QZJfBl7U7fgPt/Gz8AQDmerpwkeO5/kyz8H+Isb+zbNdV/9OcHzrdSHvhjbXYaqtV3fy8f/rmmu2oK/asm6WQ/VZC620SLyQ2QhSwkE/4Uvd6LYhbGoADUWRySACkpoA1Gcst/QsqJgBRSSW4JzKJFAgbuTIESBQUlE+wq6kMOQQyIoI5RcFktICmbGzAyBnC9mSgyU0x57e+ztsbfHtCtJuQITwSX45SuRIkgxL0SlkiF2sQJyCalPSJlADotkQDm5zCdkPkElvBbXpbKGB3DNgxJtRNG7FajXuNPARciCxUWuPZeTY3Fo45UFwxKg/Hd64Xe65U4T9m6+QhcJtl1ws0SpuNw1I7e4I+x5Sy6R0nsw2yEc4tJbS28taRVwBb/hHuuA3kENyc5/tT3PEaMo3s/e2/fevqc9knfklBy4/RAo4Vc7+Mx7/yoO3nfwvgN9Ctyaj+zeGx4hw2t7kMi9tgdOCdOY8Y+MC1Cc9j3PmqNk7nS/AGWNi0o=")),
        // Sun Power
        createPart(Schematics.readBase64("bXNjaAF4nD2NUQrCMBBExzYQSAlF//zrBXIM/wVPEJtFC21akoh4e3cbkWz2JezMLHr0DVT0C6G7DLdXHK7rmxK6QHlM01amNQItjnmdfXKbjzQ7fj0IpzAtFDMLXH76FFwYYe++FEqfnwQ4Awc+jTTFf4bmy2UqrECJRKB4FTddYdCKy4pvdwlY0jC0GLRIBPafCMaeYmqKqRJTU2RbK1AVWjZYnu4zlnwBzx4e5A==")),
        // Shard Receiver Power
        createPart(Schematics.readBase64("bXNjaAF4nGWQzU7DMBCEx/kpEW3VUHFuK3Hi4MfgjsQTOM4qREriaG1AfXt2E4lDsKWdnc+7czDO2GcoJjcSjm+3j0/H7e09/BBj31L03M+pDxPwgHPbjzRFcTbqmG09rlvWhLGxiQaaAycNiV/ckU1L4uu/hD/v+R6TG2zjkqzdcdmOrpXJU/8tUU8xDI7t7CYarHQd4WW7ksRbH8aZKUaS5dQBeAYMMi0GFaQzKCrkuegOyAWIFHINUIqUyNTJ6E4+YXGVvqks8HGFhxUeFJY4KjSoFWY4Ia80+yRUTi1B4mp1v2n7VWA=")),
        // Small DC
        createPart(Schematics.readBase64("bXNjaAF4nGWO3WrDMAyFj3+SNs1grE+wi0HZRS73QF5iloDjBNtl5O0nWYNBZ4QsfTo+Fho8adjoVg/tP9BPPo9p2cuyRaDF8x5cLi4u93X4diHgdVpWHzONhzy7NP3mfXbZi+L2qKipzFtiE1Jshwhf8hZcGnYXfRio+vJ4f3z714/poEXC8OlK8enA9Z90BPCGegwnVQO6hiDACmwEtgJPAs8CO4GXytBD6VopQ1MNY6mz0A3VLQzDTr7qYVQ1UDRmCXc9f2wEGobkINDKUmxnqpwfsEgzrEpLe1bYCjwJPAvsBF7kIs8f0xBIyw==")),
        // at sand
        createPart(Schematics.readBase64("bXNjaAF4nF1PQVLDMBBT7KRNk5QOH+DAjYNPvMhNDPWME2fslNKP8Ra+Qqc0yLnAcNjR7lrSytjiTiAfdG8gzDPqzsQ22HGyfgDucB+900GNejBOsXs1WPF5dMTeDJ0J2J30ZIIy71PQ7eQDHjvLp0gHFQ86dGo86GhUHHVr1D7YbjHxR6pQ28n0KvpjaA223ro/PtXoTzQefGewi9bZNjn2xi1CR8+gumCdQxG1e/PYtV471ZphCvblyCtP/5P8zm04x4nsvZ5odwbwAGSQEBlhgyxBwzUEVlwj5ywEuxxSEkpk7FCt5/l2ZV1EwbGGTJwGcpWIBXUiZ5eTNn+wPuUaBR2zktuqLIH5wjWLh7L5C3K+sK7I5xsZPEo6c2yQ7GVF6SZdXkEky28GLEWNNdWiIVAiCUvkMglT0iVruWSdr+kaH6tkl4DULT2r9NeajUzQpH8kP/kDuuCH0Q==")),
        // Scrap Foreshadow
        createPart(Schematics.readBase64("bXNjaAF4nHVV7W7cRBS99ther71ee7/yWdqmLVT88GPAC/AErtdNXXltY3sTwh+Q+AP8QAgeiVcAhBAS4hUQArVpspwzTrpJEIlmzpzxnTv33jkzK/dl1xSrTFaZTD94+FHaJPXDD6sma18ky+pU/GXWpk1ed3lVijyVSVsVSRPXSZkVMUbHmYSnSZc1cfZJ1yRpVzXy/jJfZWWLFTG8NMt4y9PmrO2SIn6WdFhzJl5dnWJtWS0zGT9r8uVxFqdVuVznncyqk6xZNvlJFtdN9TLTvv28TPMyaxKS+3c36vsmSzOsaiTMS0CX4UMFaGS0zNukbbPVswLMQV51kcmju27qF0mbxW2dpFncByVP79r8n+F/nOmue1E1+XoVI52ikMd3bTpw5L2qUfcW4TbdsbjrsqiSJeNcZQWjn9VFguqVdIQinWRnqEG4rVo/4aXrostPdIEmXX7XPijyj9c5tqjW9BltD+DqOP28y1Yo2LpJQVZ0Fuu4xLmqYnjl4uW6TLUuhm1WJ/2RLG7F2CeE6ShpVhDVchuH39aYuPIcphVEkWZl1+TP1wgiqNdFu5VCQCk8L6rT+BhaE+/5VqCD9CwtqhIybPMiT1nSq3IFSVFUZ2+pB5fwkn+KscgPIoYoMQyMbTFNwEBMMldMBfBcXIvNJdq5nvbF5JJITAswGGCKi3rqbakNGnBsykyUAdDuzd692bs34d65dr+53Fyg4V+MzUaUNvNprfAvFrpb26mb2/F7SOC+WGJxOwUYuENx4HSzeSMmmqXbJUwtbWsRMceRywgt8UQzbI3YkARCtmUqeoHFLVkXUaS3ArJvBuSCBjbWIneHKwg2zZx+laHNOOv2s97tWWw/xM5jUR4sDDGQC1Yike/RfjVJvS31QRf0wKm/1QhrFIffof1hMLcboRvC8MxAhhgImS/GGGwixgAwpyCGNA4BTMM1I4zGjM/vK+zRwwQAThj1EPQASx8QMoRv0X4yFAwVTpvHaelIlK4JDgeelMmC3wrRp+cQ3fX+Pr0OsVHE/Uc0nALs7aIZqMMTYPoIYCRDfhxT3GoCiqOdAxAkQacTYKYPWNQCDFntAFyXckKQFKcIUjiHfs43b4BDqhnobF6h3OfiwoYaoZIu+5RQmYC7KYDvDjCtIDIq3tpcaNFRwDbcXqLwY6rMRTdFqg5OC6f+Nish1ZURLZAFKMxmAOQ6AXiia+Oz2N+g/aJc0JDqM3YwiniHcaleiY28x9SygZPV9Qtv1s8EReEifexIIaRrMn0XQt6wObopjSPWbRdsRx/PHrUjaop5++0twIFEDHIhVI+ivuBpHyzQic4xGouGkDlEEjGHr9F+FM7qWzfplfwVlawOQFE6AlRzCHApFpbbvCcM2XwHgDVzdFNR99kxsCkCg4sv0X5XCnTg2vqlMTf8e40Tes3nwRjh20RfI7Q/DZYaqT4AQPgPATZjnYlDm3+Q5tDYBx2w3qjPjBEdAYaimdczJP4IfnDQj4WhmQ8Aig7nfIh8gHb4ho8uyBySgqe5DOF3ZHLk69ETlNPg47YQ2x30etIv6AZ6uqCm9EvFO+XAxmHBFzo6y3xXduAcKe0wpScAxSB3aH0EcHo2oB52ESSsdrnZFGBeS1ApUvs2dRn7F2i/QXy7MmKoxhFGuGuHgDEPZK8PfA8PATfaQ6AabE7s9ZkKRzpToeXIhSD5kyD88TB4WHpkXl0n3FHlwC5gyPvMag6A3XsAfPYBWj6f89z1rNXb4KIfAYYQIgBCJ/Mp7H39Ygg1hvAOem8H9LYPUIjNMDihHR3Q0SHAZaIHfLQiQECNHMj4euufNdXvIf/+gugP6ZhgsjaHVCmBD4Pc47WxwPQT/xmfeEUa6KqDXqgIFFX9FwNODGQ=")),
        // Thorium spectre
        createPart(Schematics.readBase64("bXNjaAF4nG1SW07DMBCcOG3TNCmFIs6A+uE/TsEt3MRqI+Ul21XpxTgOVwmzMUIISOTMend29qHgDo8Ki950Fsq+oKitr1wzhmbogQL7uuls73nT/mxcresKD35ojdOj6W2raZ0s9G/a/AnnwTWXTpu2HW76SviiP42t8cH0Evzh3rpw0ifbW2fC4LC7mmCdtm/BmUocmR9tFZxFcZR8XbumbfH8b+3xbLzVfjSV1UfX1JQ//Jnl+165G/tp9dEElryhaILttB8urrIADkCCBVKBLMImwhZpQrhHoiCGUvQTUsyv5CwjMI8WciQiVSJdEXaAIoGP8BToWvKQvOLBmrcNkYqRsZK6OaGEWhO22TRNrzwfTM6iThZ1MtHJCTM1I5XRd6GqFYVZeUPvnsWzdE3HRqQmUVAJ89igkmYx9zyPksdR8jhKLlHFX0R6I31eTxnXU8b1lHE9paznEwZDeNQ=")),
        // At thorium, Dark Light
        createPart(Schematics.readBase64("bXNjaAF4nGWQzU7DMBCEJ85vnYaIK6dKnDj4LeDGS7iJlUbkT7ar0rdnlhwqgWLttxPP7tpGi1YhW+zscPw4vVv/dfoch0tE3bvQ+XGL47oANZ7DOllvNru4yTAbHOpwJUxcb85TPPbx2o+zWwJLTbhY35tIbbp13rwLwfXGxwFvf00P3fl7iHYyZxuj83e0N0sa9x297eLq0bCBGdzivBX58q8VL2Km/SLnyYZoej9OE/QmhzXL2vP4Y3SzCevVdw7ACUigJSTIKv6AQgmliCNSQbPjCWmKDCmUhBwqJw5IBPWOBklBC1NBiVRyWkrmR6gCBfukFVUOiKqQ5gxKCip+iTw5g3TMwKVp4tIs4QS9z9P7PC3zDsyL32M34hHoHdwUR85RJX4AQWFd4g==")),
    ];
    let added = false;
    let removed = [];
    return {
        pre() {
            if (!added) {
                while (Vars.bases.cores.size > 0) {
                    removed.push(Vars.bases.cores.pop());
                }

                parts.forEach(part => {
                    if (part.core != null) {
                        Vars.bases.cores.add(part);
                    } else if (part.required == null) {
                        Vars.bases.parts.add(part);
                    }

                    if (part.required != null && part.core == null) {
                        Vars.bases.reqParts.get(part.required, prov(() => Seq.of(BaseRegistry.BasePart))).add(part);
                    }
                });
                Vars.bases.cores.sort(floatf(b => b.tier));
            }
            added = true;
        },
        post() {
            if (added) {
                parts.forEach(part => {
                    if (part.core != null) {
                        Vars.bases.cores.remove(part);
                    } else if (part.required == null) {
                        Vars.bases.parts.remove(part);
                    }
                    if (part.required != null && part.core == null) {
                        Vars.bases.reqParts.get(part.required, prov(() => Seq.of(BaseRegistry.BasePart))).remove(part);
                    }
                });
                while (removed.length > 0) {
                    Vars.bases.cores.add(removed.pop())
                }
                Vars.bases.cores.sort(floatf(b => b.tier));
            }
            added = false;
        },
    };
})();

const randomBlock = (() => {
    const v = lib.createProbabilitySelector();
    v.add(Blocks.space, 600);
    v.add(Blocks.basalt, 100);
    v.add(Blocks.charr, 100);
    v.add(Blocks.craters, 100);
    v.add(Blocks.dacite, 100);
    v.add(Blocks.darkPanel1, 8);
    v.add(Blocks.darkPanel2, 8);
    v.add(Blocks.darkPanel3, 8);
    v.add(Blocks.darkPanel4, 8);
    v.add(Blocks.darkPanel5, 8);
    v.add(Blocks.darkPanel6, 8);
    v.add(Blocks.darksand, 100);
    v.add(Blocks.darksandTaintedWater, 100);
    v.add(Blocks.darksandWater, 100);
    v.add(Blocks.dirt, 100);
    v.add(Blocks.grass, 100);
    v.add(Blocks.hotrock, 100);
    v.add(Blocks.ice, 100);
    v.add(Blocks.iceSnow, 100);
    v.add(Blocks.magmarock, 100);
    v.add(Blocks.metalFloor, 8);
    v.add(Blocks.metalFloor2, 8);
    v.add(Blocks.metalFloor3, 8);
    v.add(Blocks.metalFloor5, 8);
    v.add(Blocks.metalFloorDamaged, 15);
    v.add(Blocks.moss, 100);
    v.add(Blocks.mud, 100);
    v.add(Blocks.sand, 100);
    v.add(Blocks.sandWater, 100);
    v.add(Blocks.snow, 100);
    v.add(Blocks.sporeMoss, 100);
    v.add(Blocks.stone, 100);
    v.add(Blocks.water, 100);
    return v;
})();
const isMetalFloor = (() => {
    const M = {};
    M[Blocks.darkPanel1] = true;
    M[Blocks.darkPanel2] = true;
    M[Blocks.darkPanel3] = true;
    M[Blocks.darkPanel4] = true;
    M[Blocks.darkPanel5] = true;
    M[Blocks.darkPanel6] = true;
    M[Blocks.metalFloor] = true;
    M[Blocks.metalFloorDamaged] = true;
    M[Blocks.metalFloor2] = true;
    M[Blocks.metalFloor3] = true;
    M[Blocks.metalFloor5] = true;
    return block => M[block]
})();
const wallModifier = (() => {
    const maps = [
        [Blocks.darkPanel1, Blocks.darkMetal],
        [Blocks.darkPanel2, Blocks.darkMetal],
        [Blocks.darkPanel3, Blocks.darkMetal],
        [Blocks.darkPanel4, Blocks.darkMetal],
        [Blocks.darkPanel5, Blocks.darkMetal],
        [Blocks.darkPanel6, Blocks.darkMetal],
        [Blocks.metalFloor, Blocks.darkMetal],
        [Blocks.metalFloorDamaged, Blocks.darkMetal],
        [Blocks.metalFloor2, Blocks.darkMetal],
        [Blocks.metalFloor3, Blocks.darkMetal],
        [Blocks.metalFloor5, Blocks.darkMetal],
        [Blocks.grass, Blocks.shrubs],
        [Blocks.mud, Blocks.dirtWall],
        [Blocks.dirt, Blocks.dirtWall],
        [Blocks.dacite, Blocks.daciteWall],
        [Blocks.craters, Blocks.stoneWall],
        [Blocks.basalt, Blocks.stoneWall],
        [Blocks.charr, Blocks.stoneWall],
        [Blocks.hotrock, Blocks.stoneWall],
        [Blocks.magmarock, Blocks.stoneWall],
    ];
    const previous = maps.map(ar => [ar[0], ar[0].wall]);
    const wallMap = {};
    maps.forEach(ar => wallMap[ar[0]] = ar[1]);
    return {
        pre() {
            maps.forEach(ar => ar[0].wall = ar[1]);
        },
        post() {
            previous.forEach(ar => ar[0].wall = ar[1]);
        },
        getWall(block) {
            let v = wallMap[block];
            if (v) {
                return v;
            }
            return block.wall;
        },
    };
})();
// Copy SerpuloPlanetGenerator.java
function dumpTiles(tiles) {
    if (!tiles) { return ""; }
    let res = [];
    tiles.each(lib.intc2((x, y) => {
        let tile = tiles.get(x, y)
        if (tile && tile.block) {
            res.push({ x: x, y: y, block: tile.block().name })
        }
    }));
    return res.map(v => "x: " + v.x + ", y: " + v.y + ", block: " + v.block + "\n");
}
// (() => {
//     let rand = new Rand();
//     let l = 10;
//     print("Length: " + l);
//     for (let i = 0; i < 100; i++) {
//         print("Rand: " + Math.floor(rand.random(lib.int(l))))
//     }
// })();
const ass = func => new JavaAdapter(Astar.TileHueristic, { cost: func });
function createWrekGenerator() {
    let rid = new Packages.arc.util.noise.RidgedPerlin(1, 2);
    let basegen = new BaseGenerator();
    let scl = 5;
    let waterOffset = 0.07;
    let ints = new IntSeq();
    let sector;
    let noise = new Packages.arc.util.noise.Simplex();

    // TODO Add Dimension Shard Schematics to Vars.bases, and remove when generate progress done

    // Avaliable:
    // water taintedWater
    // darksandWater darksandTaintedWater darksand
    // sandWater sand
    // basalt stone hotrock magmarock charr craters dacite(white)
    // snow iceSnow ice
    // grass dirt mud moss sporeMoss
    // darkPanel1 darkPanel2 darkPanel3 darkPanel4 darkPanel5 darkPanel6
    // metalFloor metalFloorDamaged metalFloor2 metalFloor3 metalFloor5
    // 赤道 洼地 ---------> 高山
    //  |
    //  |
    //  v
    // 两极
    let arr = [
        [Blocks.water, Blocks.mud, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.sand, Blocks.sand, Blocks.sand, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.mud, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.darksand, Blocks.sand, Blocks.darkPanel2, Blocks.sand, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.darkPanel3, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.dirt, Blocks.sand, Blocks.darksand, Blocks.darksand, Blocks.basalt, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.deepwater, Blocks.water, Blocks.darksand, Blocks.mud, Blocks.dirt, Blocks.sand, Blocks.darksand, Blocks.darkPanel2, Blocks.darksand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.grass, Blocks.grass, Blocks.mud, Blocks.grass, Blocks.dirt, Blocks.grass, Blocks.sand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.grass, Blocks.grass, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.darkPanel3, Blocks.darksand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.sand, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.mud, Blocks.sand, Blocks.moss, Blocks.stone, Blocks.snow, Blocks.iceSnow, Blocks.dacite, Blocks.space],
        [Blocks.deepwater, Blocks.sandWater, Blocks.sand, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.darkPanel4, Blocks.basalt, Blocks.basalt, Blocks.snow, Blocks.snow, Blocks.iceSnow, Blocks.dacite, Blocks.space],
        [Blocks.magmarock, Blocks.hotrock, Blocks.sand, Blocks.dirt, Blocks.darkPanel5, Blocks.moss, Blocks.basalt, Blocks.hotrock, Blocks.basalt, Blocks.ice, Blocks.snow, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.hotrock, Blocks.water, Blocks.sand, Blocks.sand, Blocks.darksand, Blocks.darksand, Blocks.sporeMoss, Blocks.darkPanel6, Blocks.basalt, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.metalFloor5, Blocks.darksandWater, Blocks.darksand, Blocks.dirt, Blocks.snow, Blocks.moss, Blocks.snow, Blocks.snow, Blocks.metalFloor, Blocks.snow, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.space],
        [Blocks.taintedWater, Blocks.darksandTaintedWater, Blocks.snow, Blocks.ice, Blocks.iceSnow, Blocks.ice, Blocks.sporeMoss, Blocks.snow, Blocks.metalFloor3, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.darksandTaintedWater, Blocks.darksand, Blocks.snow, Blocks.snow, Blocks.ice, Blocks.iceSnow, Blocks.sporeMoss, Blocks.snow, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.ice],
        [Blocks.darksandWater, Blocks.darksand, Blocks.snow, Blocks.ice, Blocks.iceSnow, Blocks.snow, Blocks.darkPanel4, Blocks.snow, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.ice, Blocks.ice],
    ];

    let dec = ObjectMap.of(
        Blocks.sporeMoss, Blocks.sporeCluster,
        Blocks.moss, Blocks.sporeCluster,
        Blocks.taintedWater, Blocks.water,
        Blocks.darksandTaintedWater, Blocks.darksandWater
    );

    let tars = ObjectMap.of(
        Blocks.sporeMoss, Blocks.shale,
        Blocks.moss, Blocks.shale
    );

    let water = 2 / arr[0].length;

    function rawHeight(position) {
        position = Tmp.v33.set(position).scl(scl);
        return (Mathf.pow(noise.octaveNoise3D(7, 0.5, 1 / 3, position.x, position.y, position.z), 2.3) + waterOffset) / (1 + waterOffset);
    }
    function genNoise(x, y, octaves, falloff, scl, mag) {
        mag = mag === undefined ? 1 : mag;
        let v = sector.rect.project(x, y).scl(5);
        return noise.octaveNoise3D(octaves, falloff, 1 / scl, v.x, v.y, v.z) * mag;
    }

    function getWall(block) {
        return wallModifier.getWall(block);
    }
    return new JavaAdapter(PlanetGenerator, HexMesher, {
        generateSector(sector) {
            if (sector.id == 0) {
                sector.generateEnemyBase = true;
                return;
            }

            let tile = sector.tile;

            let any = false;
            let poles = Math.abs(tile.v.y);
            let noise = Packages.arc.util.noise.Noise.snoise3(tile.v.x, tile.v.y, tile.v.z, 0.001, 0.58);

            if (noise + poles / 5.1 > 0.10 && poles > 0.14) {
                any = true;
            }

            if (noise < 0.20) {
                for (let other of tile.tiles) {
                    let osec = sector.planet.getSector(other);

                    //no sectors near start sector!
                    if (
                        osec.id == sector.planet.startSector || //near starting sector
                        osec.generateEnemyBase && poles < 0.85 // || //near other base
                        // (sector.preset != null && noise < 0.9) //near preset
                    ) {
                        return;
                    }
                }
            }

            sector.generateEnemyBase = any;
        },
        getHeight(position) {
            let height = rawHeight(position);
            return Math.max(height, water);
        },
        getColor(position) {
            let block = this.getBlock(position);
            // replace salt with sand color
            if (block == Blocks.salt) {
                return Blocks.sand.mapColor;
            }
            Tmp.c1.set(block.mapColor).a = (1 - block.albedo);
            return Tmp.c1;
        },
        genTile(position, tile) {
            tile.floor = this.getBlock(position);
            // tile.block = tile.floor.asFloor().wall;
            tile.block = getWall(tile.floor);

            //if(noise.octaveNoise3D(5, 0.6, 8.0, position.x, position.y, position.z) > 0.65){
            //tile.block = Blocks.air;
            //}

            if (tile.block != Blocks.space && rid.getValue(position.x, position.y, position.z, 22) > 0.32) {
                tile.block = Blocks.air;
            }
        },
        getBlock(position) {
            const noise = this.noise;
            let height = rawHeight(position);
            Tmp.v31.set(position);
            position = Tmp.v33.set(position).scl(scl);
            let rad = scl;
            let temp = Mathf.clamp(Math.abs(position.y * 2) / (rad));
            let tnoise = noise.octaveNoise3D(7, 0.56, 1 / 3, position.x, position.y + 999, position.z);
            temp = Mathf.lerp(temp, tnoise, 0.5);
            height *= 1.2;
            height = Mathf.clamp(height);

            let tar = noise.octaveNoise3D(4, 0.55, 1 / 2, position.x, position.y + 999, position.z) * 0.3 + Tmp.v31.dst(0, 0, 1) * 0.2;

            let res = arr[Mathf.clamp(lib.int(temp * arr.length), 0, arr[0].length - 1)][Mathf.clamp(lib.int(height * arr[0].length), 0, arr[0].length - 1)];
            if (tar > 0.5) {
                return tars.get(res, res);
            } else {
                return res;
            }
        },
        generate(t, s) {
            const executeTimer = lib.executeTimer();
            wallModifier.pre();
            schematicsModifier.pre();
            executeTimer.printDuration("wallModifier.pre() and schematicsModifier.pre(): ");
            if (t !== undefined && s === undefined) {
                this.tiles = t;
                this.width = t.width;
                this.height = t.height;
            } else if (t !== undefined && s !== undefined) {
                sector = s;
                this.sector = s;
                this.rand.setSeed(s.id);

                let gen = new TileGen();
                t.each(lib.intc2((x, y) => {
                    gen.reset();
                    let position = sector.rect.project(x / t.width, y / t.height);

                    this.genTile(position, gen);
                    t.set(x, y, new Tile(x, y, gen.floor, gen.overlay, gen.block));
                }));

                this.tiles = t;
                this.width = t.width;
                this.height = t.height;
            }
            executeTimer.printDuration("into main: ");
            const rand = this.rand;
            const width = this.width;
            const height = this.height;

            const the = this;
            let asdoifjaisodfjoiqwejiofjwqefjq = 0;
            function Room(x, y, radius) {
                this.id = asdoifjaisodfjoiqwejiofjwqefjq++;
                this.connected = {};
                this.x = Math.floor(x);
                this.y = Math.floor(y);
                this.radius = Math.floor(radius);
                this.connect = function(to) {
                    if (this.connected[to.id]) {
                        return;
                    }
                    this.connected[to.id] = true;
                    let nscl = rand.random(20, 60);
                    let stroke = Math.floor(rand.random(8, 16));
                    the.brush(the.pathfind(x, y, to.x, to.y, ass(tile => (tile.solid() ? 6 : 0) + genNoise(tile.x, tile.y, 1, 1, 1 / nscl) * 60), Astar.manhattan), stroke);
                }
                this.connected[this.id] = true;
                return this;
                // let r = {
                //     connected: {},
                //     x: Math.floor(x),
                //     y: Math.floor(y),
                //     radius: Math.floor(radius),
                //     connect(to) {
                //         if (this.connected[to]) {
                //             return;
                //         }
                //         this.connected[to] = true;
                //         let nscl = rand.random(20, 60);
                //         let stroke = Math.floor(rand.random(6, 16));
                //         print("pathfind x: "+x+", y: "+y+", to.x: "+to.x+", to.y: "+to.y+", stroke: " + stroke);
                //         the.brush(the.pathfind(x, y, to.x, to.y, ass(tile => (tile.solid() ? 6 : 0) + genNoise(tile.x, tile.y, 1, 1, 1 / nscl) * 60), Astar.manhattan), stroke);
                //     }
                // }
                // r.connected[r] = true;
                // return r;
            }

            this.cells(4);
            this.distort(10, 12);
            let constraint = 1.3;
            let radius = width / 2 / Mathf.sqrt3;
            let rooms = rand.random(2, 5);
            let roomseq = [];

            for (let i = 0; i < rooms; i++) {
                Tmp.v1.trns(rand.random(360 / rooms * i, 360 / rooms * (i + 1)), rand.random(radius / constraint));
                let rx = (width / 2 + Tmp.v1.x);
                let ry = (height / 2 + Tmp.v1.y);
                let maxrad = radius - Tmp.v1.len();
                let rrad = Math.min(rand.random(16, maxrad / 2), 32);
                roomseq.push(new Room(rx, ry, rrad));
            }

            // check positions on the map to place the player spawn. this needs to be in the corner of the map
            let spawn;
            let enemies = new Seq();
            let enemySpawns = rand.random(1, Math.max((sector.threat * 5), 1));
            let offset = rand.nextInt(360);
            let length = width / 2.55 - rand.random(13, 23);
            let angleStep = 5;
            let waterCheckRad = 10;

            for (let i = 0; i < 360; i += angleStep) {
                let angle = offset + i;
                let cx = Math.floor(width / 2 + Angles.trnsx(angle, length));
                let cy = Math.floor(height / 2 + Angles.trnsy(angle, length));

                let waterTiles = 0;

                //check for water presence
                for (let rx = -waterCheckRad; rx <= waterCheckRad; rx++) {
                    for (let ry = -waterCheckRad; ry <= waterCheckRad; ry++) {
                        let tile = this.tiles.get(cx + rx, cy + ry);
                        if (tile == null || tile.floor().liquidDrop != null) {
                            waterTiles++;
                        }
                    }
                }

                if (waterTiles <= 4 || (i + angleStep >= 360)) {
                    roomseq.push(spawn = new Room(cx, cy, rand.random(16, 32)));

                    let previous = -85;
                    const angleStep2 = 12;
                    for (let j = 0; j < enemySpawns; j++) {
                        let enemyOffset = previous + angleStep2 + rand.random(12);
                        previous = enemyOffset;
                        Tmp.v1.set(cx - width / 2, cy - height / 2).rotate(180 + enemyOffset).add(width / 2, height / 2);
                        let espawn = new Room(Tmp.v1.x, Tmp.v1.y, rand.random(16, 32));
                        roomseq.push(espawn);
                        enemies.add(espawn);
                    }

                    break;
                }
            }
            for (let room of roomseq) {
                this.erase(room.x, room.y, room.radius);
            }

            let connections = rand['random(int,int)'](Math.max(rooms - 1, 1), rooms + 3);
            for (let i = 0; i < connections; i++) {
                let ran1 = rand["random(int,int)"](0, roomseq.length - 1);
                let ran2 = rand["random(int,int)"](0, roomseq.length - 1);
                let r1 = roomseq[ran1];
                let r2 = roomseq[ran2];
                r1.connect(r2);
            }

            roomseq.forEach(room => spawn.connect(room));

            executeTimer.printDuration("Rooms created: ");
            this.cells(1);
            this.distort(10, 6);
            executeTimer.printDuration("this.cells(1) and this.distort(10, 6): ");

            this.inverseFloodFill(this.tiles.getn(spawn.x, spawn.y));
            executeTimer.printDuration("this.inverseFloodFill(this.tiles.getn(spawn.x, spawn.y)): ");

            let ores = Seq.with(Blocks.oreCopper, Blocks.oreLead);
            let poles = Math.abs(sector.tile.v.y);
            let nmag = 0.5;
            let scl = 1;
            let addscl = 1.3;

            if (noise.octaveNoise3D(2, 0.5, scl, sector.tile.v.x, sector.tile.v.y, sector.tile.v.z) * nmag + poles > 0.25 * addscl) {
                ores.add(Blocks.oreCoal);
            }

            if (noise.octaveNoise3D(2, 0.5, scl, sector.tile.v.x + 1, sector.tile.v.y, sector.tile.v.z) * nmag + poles > 0.5 * addscl) {
                ores.add(Blocks.oreTitanium);
            }

            if (noise.octaveNoise3D(2, 0.5, scl, sector.tile.v.x + 2, sector.tile.v.y, sector.tile.v.z) * nmag + poles > 0.65 * addscl) {
                ores.add(Blocks.oreThorium);
            }

            if (noise.octaveNoise3D(2, 0.5, scl, sector.tile.v.x + 2, sector.tile.v.y, sector.tile.v.z) * nmag + poles > 0.74 * addscl) {
                ores.add(dimensionShardOre);
            }

            // More scarp at Pole
            if (rand.chance(0.35 + sector.tile.v.y * 0.65)) {
                ores.add(Blocks.oreScrap);
            }

            let frequencies = new FloatSeq();
            for (let i = 0; i < ores.size; i++) {
                frequencies.add(rand.random(-0.1, 0.01) - i * 0.01 + poles * 0.04);
            }

            executeTimer.printDuration("before ores: ");
            this.pass(lib.intc2((x, y) => {
                if (!this.floor.asFloor().hasSurface()) return;

                let offsetX = x - 4, offsetY = y + 23;
                for (let i = ores.size - 1; i >= 0; i--) {
                    let entry = ores.get(i);
                    let freq = frequencies.get(i);
                    if (Math.abs(0.5 - genNoise(offsetX, offsetY + i * 999, 2, 0.7, (40 + i * 2))) > 0.22 + i * 0.01 &&
                        Math.abs(0.5 - genNoise(offsetX, offsetY - i * 999, 1, 1, (30 + i * 4))) > 0.37 + freq) {
                        this.ore = entry;
                        break;
                    }
                }

                if (this.ore == Blocks.oreScrap && rand.chance(0.33)) {
                    this.floor = Blocks.metalFloorDamaged;
                }
            }));
            executeTimer.printDuration("ores: ");

            this.trimDark();

            this.median(2);

            this.tech();

            executeTimer.printDuration("this.trimDark(); this.median(2); this.tech();: ");

            this.pass(lib.intc2((x, y) => {

                // Walls to space
                if (this.block != Blocks.air && Math.abs(0.5 - genNoise(x, y, 4, 0.7, 50)) < 0.11 && !(roomseq.findIndex(r => Mathf.within(x, y, r.x, r.y, 25)) >= 0)) {
                    this.floor = Blocks.space;
                    this.block = Blocks.space;
                }

                // random moss
                if (this.floor == Blocks.sporeMoss) {
                    if (Math.abs(0.5 - genNoise(x - 90, y, 4, 0.8, 65)) > 0.02) {
                        this.floor = Blocks.moss;
                    }
                }

                // tar
                if (this.floor == Blocks.darksand) {
                    if (Math.abs(0.5 - genNoise(x - 40, y, 2, 0.7, 80)) > 0.25 &&
                        Math.abs(0.5 - genNoise(x, y + sector.id * 10, 1, 1, 60)) > 0.41 && !(roomseq.findIndex(r => Mathf.within(x, y, r.x, r.y, 15)) >= 0)) {
                        this.floor = Blocks.tar;
                        this.ore = Blocks.air;
                    }
                }

                // space corruption
                if (this.block == Blocks.air && this.floor != Blocks.space) {
                    if (isMetalFloor(this.floor)) {
                        if (Math.abs(0.5 - genNoise(x, y, 4, 0.7, 50)) > 0.20 && !(roomseq.findIndex(r => Mathf.within(x, y, r.x, r.y, 25)) >= 0)) {
                            this.floor = randomBlock.random();
                            this.ore = this.floor != Blocks.space && rand.chance(0.25) ? dimensionShardOre : Blocks.air;
                        }
                    } else {
                        if (Math.abs(0.5 - genNoise(x, y, 4, 0.6, 60)) > 0.24 && !(roomseq.findIndex(r => Mathf.within(x, y, r.x, r.y, 25)) >= 0)) {
                            this.floor = randomBlock.random();
                            this.ore = this.floor != Blocks.space && rand.chance(0.25) ? dimensionShardOre : Blocks.air;
                        }
                    }
                }

                //hotrock tweaks
                if (this.floor == Blocks.hotrock) {
                    if (Math.abs(0.5 - genNoise(x - 90, y, 4, 0.8, 80)) > 0.035) {
                        this.floor = Blocks.basalt;
                    } else {
                        this.ore = Blocks.air;
                        let all = true;
                        for (let p of Geometry.d4) {
                            let other = this.tiles.get(x + p.x, y + p.y);
                            if (other == null || (other.floor() != Blocks.hotrock && other.floor() != Blocks.magmarock)) {
                                all = false;
                            }
                        }
                        if (all) {
                            this.floor = Blocks.magmarock;
                        }
                    }
                } else if (this.floor != Blocks.basalt && this.floor != Blocks.ice && this.floor.asFloor().hasSurface()) {
                    let n = genNoise(x + 782, y, 5, 0.75, 260, 1);
                    if (n > 0.67 && roomseq.findIndex(e => Mathf.within(x, y, e.x, e.y, 14)) < 0) {
                        if (n > 0.72) {
                            this.floor = n > 0.78 ? Blocks.taintedWater : (this.floor == Blocks.sand ? Blocks.sandWater : Blocks.darksandTaintedWater);
                        } else {
                            this.floor = (this.floor == Blocks.sand ? this.floor : Blocks.darksand);
                        }
                        this.ore = Blocks.air;
                    }
                }

                if (rand.chance(0.0075)) {
                    //random spore trees
                    let any = false;
                    let all = true;
                    for (let p of Geometry.d4) {
                        let other = this.tiles.get(x + p.x, y + p.y);
                        if (other != null && other.block() == Blocks.air) {
                            any = true;
                        } else {
                            all = false;
                        }
                    }
                    if (any && ((this.block == Blocks.snowWall || this.block == Blocks.iceWall) || (all && this.block == Blocks.air && this.floor == Blocks.snow && rand.chance(0.03)))) {
                        this.block = rand.chance(0.5) ? Blocks.whiteTree : Blocks.whiteTreeDead;
                    }
                }

                //random stuff
                dec: {
                    for (let i = 0; i < 4; i++) {
                        let near = Vars.world.tile(x + Geometry.d4[i].x, y + Geometry.d4[i].y);
                        if (near != null && near.block() != Blocks.air) {
                            break dec;
                        }
                    }

                    if (rand.chance(0.01) && this.floor.asFloor().hasSurface() && this.block == Blocks.air) {
                        this.block = dec.get(this.floor, this.floor.asFloor().decoration);
                    }
                }
            }));
            executeTimer.printDuration("Main loop: ");

            let difficulty = sector.threat;
            ints.clear();
            ints.ensureCapacity(width * height / 4);
            let ruinCount = rand.random(-2, 4);

            if (ruinCount > 0) {
                let padding = 25;

                //create list of potential positions
                for (let x = padding; x < width - padding; x++) {
                    for (let y = padding; y < height - padding; y++) {
                        let tile = this.tiles.getn(x, y);
                        if (!tile.solid() && (tile.drop() != null || tile.floor().liquidDrop != null)) {
                            ints.add(tile.pos());
                        }
                    }
                }

                ints.shuffle(rand);

                let placed = 0;
                let diffRange = 0.4;
                //try each position
                for (let i = 0; i < ints.size && placed < ruinCount; i++) {
                    let val = ints.items[i];
                    let x = Point2.x(val), y = Point2.y(val);

                    //do not overwrite player spawn
                    if (Mathf.within(x, y, spawn.x, spawn.y, 18)) {
                        continue;
                    }

                    let range = difficulty + rand.random(diffRange);

                    let tile = this.tiles.getn(x, y);
                    let part = null;
                    if (tile.overlay().itemDrop != null) {
                        part = Vars.bases.forResource(tile.drop()).getFrac(range);
                    } else if (tile.floor().liquidDrop != null && rand.chance(0.05)) {
                        part = Vars.bases.forResource(tile.floor().liquidDrop).getFrac(range);
                    } else if (rand.chance(0.05)) { //ore-less parts are less likely to occur.
                        part = Vars.bases.parts.getFrac(range);
                    }

                    //actually place the part
                    if (part != null && BaseGenerator.tryPlace(part, x, y, Team.derelict, lib.intc2((cx, cy) => {
                        let other = this.tiles.getn(cx, cy);
                        if (other.floor().hasSurface()) {
                            other.setOverlay(Blocks.oreScrap);
                            for (let j = 1; j <= 2; j++) {
                                for (let p of Geometry.d8) {
                                    let t = this.tiles.get(cx + p.x * j, cy + p.y * j);
                                    if (t != null && t.floor().hasSurface() && rand.chance(j == 1 ? 0.4 : 0.2)) {
                                        t.setOverlay(Blocks.oreScrap);
                                    }
                                }
                            }
                        }
                    }))) {
                        placed++;

                        let debrisRadius = Math.max(part.schematic.width, part.schematic.height) / 2 + 3;
                        Geometry.circle(x, y, this.tiles.width, this.tiles.height, debrisRadius, lib.intc2((cx, cy) => {
                            let dst = Mathf.dst(cx, cy, x, y);
                            let removeChance = Mathf.lerp(0.05, 0.5, dst / debrisRadius);

                            let other = this.tiles.getn(cx, cy);
                            if (other.build != null && other.isCenter()) {
                                if (other.team() == Team.derelict && rand.chance(removeChance)) {
                                    other.remove();
                                } else if (rand.chance(0.5)) {
                                    other.build.health = other.build.health - rand.random(other.build.health * 0.9);
                                }
                            }
                        }));
                    }
                }
            }

            Schematics.placeLaunchLoadout(spawn.x, spawn.y);

            enemies.each(espawn => this.tiles.getn(espawn.x, espawn.y).setOverlay(Blocks.spawn))

            if (sector.hasEnemyBase()) {
                basegen.generate(this.tiles, enemies.map(lib.func(r => this.tiles.getn(r.x, r.y))), this.tiles.get(spawn.x, spawn.y), Vars.state.rules.waveTeam, sector, difficulty);

                Vars.state.rules.attackMode = sector.info.attack = true;
            } else {
                Vars.state.rules.winWave = sector.info.winWave = 10 + 5 * Math.max(difficulty * 10, 1);
            }

            let waveTimeDec = 0.4;

            Vars.state.rules.waveSpacing = Mathf.lerp(60 * 65 * 2, 60 * 60 * 1, Math.max(difficulty - waveTimeDec, 0) / 0.8);
            Vars.state.rules.waves = sector.info.waves = true;
            Vars.state.rules.enemyCoreBuildRadius = 600;

            Vars.state.rules.spawns = generateWaves(difficulty, new Rand(), Vars.state.rules.attackMode);
            wallModifier.post();
            schematicsModifier.post();
            executeTimer.printDuration("Done: ");
        },
        postGenerate(tiles) {
            if (sector.hasEnemyBase()) {
                basegen.postGenerate();
            }
        }
    });
}


wrek.generator = createWrekGenerator();

if (lib.isDev()) {
    PlanetDialog.debugSelect = true;
}
