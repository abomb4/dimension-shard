

const wrek = new JavaAdapter(Planet, {
    load() {
        this.meshLoader = prov(() => new HexMesh(wrek, 4));
        this.super$load();
    }
}, "wrek", Planets.sun, 2, 1);
wrek.generator = new SerpuloPlanetGenerator();
wrek.atmosphereColor = Color.valueOf("1c1b9f");
wrek.atmosphereRadIn = 0.02;
wrek.atmosphereRadOut = 0.1;
wrek.startSector = 12;


const dimensionFall = new SectorPreset("dimensionFall", wrek, 12);
dimensionFall.captureWave = 50;
dimensionFall.difficulty = 8;

exports.dimensionFall = dimensionFall;
