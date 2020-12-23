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
