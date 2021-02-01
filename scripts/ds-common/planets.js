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


const wrek = new JavaAdapter(Planet, {
    load() {
        this.meshLoader = prov(() => new HexMesh(wrek, 6));
        this.super$load();
    }
}, "wrek", Planets.sun, 3, 1);
wrek.generator = new SerpuloPlanetGenerator();
wrek.atmosphereColor = Color.valueOf("213159");
wrek.atmosphereRadIn = 0.04;
wrek.atmosphereRadOut = 0.1;
wrek.startSector = 12;

const dimensionFall = new SectorPreset("dimensionFall", wrek, 12);
dimensionFall.captureWave = 50;
dimensionFall.difficulty = 8;

exports.dimensionFall = dimensionFall;

const schematicsModifier = (() => {
    function createPart(schem) {
        const part = new BaseRegistry.BasePart(schem);
        Tmp.v1.setZero();
        var drills = 0;
        schem.tiles.each(cons(tile => {
            if (tile.block.priority == TargetPriority.core && tile.block.unitType !== undefined) {
                part.core = tile.block;
            }

            //save the required resource based on item source - multiple sources are not allowed
            if (tile.block instanceof ItemSource) {
                var config = tile.config;
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
        // Core small
        createPart(Schematics.readBase64("bXNjaAF4nF1QS07DMBQc55/0IxA7WNA98oobIDgBJ3CTp7QosSMnBeXsfMq4BSEhy288M2/sJ2ONZYTEml5w/bjvxY57ZzdPVvp582BG2Tz3puuwaGSs/X6Y6AILrNnZ6MG7F6kn53Hb/Gb1uDO+0VvXb/UknQzOT+KReXcIuPJTq1ux4k3IXRjfOy+Nrp19lZlKcbCdMw1b7/7f+ccnqXfWda6dGfSi75GPAyfxgmpwb+K1dY1gtTUTH511Z3wryH8ogBtuJIgD5IgVFCqoiJBBxYiClxAyRIHlYImDFzJlEBOuU8nOLD+zk5eymyVFlvKzooQn6hkKNgcVJfW1SsPTPF2pnL4C/QJlER8/jl9Ijp/E97jkYBXiip/OgRSWYYqUrGDykqElJzpBAfUNi7RgVg==")),
        // Super Spectre
        createPart(Schematics.readBase64("bXNjaAF4nHVSW3LTQBAc62FJlmU55X9KCfxR+oEbUHCCnEBIg70VS6usJCe+AR+cggNwQEyy9EgxVLmgttYz09s925o1bWjjkNcUNVP2UdXcdEo32aeG62P2oeg4ux1aNtlty2VPccVdaVTbg0OU0KvqrMi7XWGqvEed6wObyqgD0+t/npe6bg13HVe56bd0fUnq2qLkfK/uBwVF0dxR0Mn1hmldmFobCEvdHPioDS1a/cAmb3TF9Oay03TnThs11CKpBtVTODR7XVRsKH0oemj5sTdF2aPZzWWDdocRvBj6bFS1ZXp7yflb91zuGr3X2yMuM5y//8+AxAlQcVCao/6ylw+t1SMAondEM5qTM0OIiPA45JLjIgCUPJqqWCpPKod8Sgm5L5UPnhuGUDtY+LVP5FqL4xkIZE80x3bBmgNzAoQI+MYJKYAAZSB4hOAH8ONZa59RgOjL6QKXwJcASwAxVoC/wkwEaQDyN+zvFGLBfYzgCTsc5fGYiW5NS2SwvRTT4iMaGWuS7Nw5QmcYi+hK6oXMIkA4t1q8tAqRpeI5xjmu/4r9A+fxn5bxyMSnIkuE8kvcAYhpJUkyDTmRIQfiaRyJAJjzHABYPkIaivjZPmGjBWbr2BPyE9r59icMJtOrraYnWUnlIY/kWa8k/AbO6ccY")),
        // 3 Ion cannons
        // createPart(Schematics.readBase64("bXNjaAF4nHVS227TQBA9vsRO4iZ20haEkLgIIYSQn/oHCF74C8fetobYDmuHNr/BCxJvfBV8CBKUNl3ObHqRUjVW9szOzpw5M7t4jKkLv84qhf13ZaXqtmzqZ+9rVa2evc1adYCoUG2uy0XHA2Af0+I6LG2PM12kRY6wa5fkKPF0+3DWVLO0U3O1aHSnNJ5vB7SLLFfpvPy8LIu0y+pPiE8yRqbqtNNZ3jUaw0VzQkfdFApjZhfpQjcflT17tc1nl8UxpV9Rz3RZHCmEeVMXy7JD2OZZJ1LupBbqcE7W9LDRzLut8fpO4M0+16u2y+bpzFKu8HI7VAmjLvO0JVOVdkutVYck01WjVZFS1Be1Yo3ktsd0nmkK7i/reZMVFPrm/vqdyo/rZt4crUilVXqAJ9vBHfdSp6CXZDElN4dzmXZVnopjM6BbKS/uYagWWrUtRevuCMAHwIELV5YeHBceYnDxxck3hR1wkc/tMSDoO+bCXCCgHcITGMALCePQGPOD/59MC5AAfQJJfIIHN7A5nkAEb0AYwe2TxIb0BYbkYkgE697BkJ/j0TmGExHo9JjMyIgn3I24o7AxodcfCYk5B8w/CUFA9LmnCPPHnDHeYZZnLs2a3znxzBgWi4QpJIykg+/8/yLxjhDHhLAH7Hkyh1imRClwYmr36Z+wzZjpEMeQjsSZQEQ5U8JIBjOWBRQBDL2YW8mLrCUJkePTiqVUbB2Bs0srkhz5ucymClF2wa3jyqkV+k2Eej1ux/0e25V7MWz+kiMEesaQMrHVEkesa3nJRl6ykTeBL2S/RR4TJjeiJiT29rArjyLG1I4hsY4BeCz9eS72WJgRuwj7A7PmuNccu0Fg+3XskNe0fPOXuvjAnICxvP6YmRvGkJbt56vtJ+B2LOf7G+nW6l3VfiB3KI6BdQS0dkTkQ96VI8DnAkIsk3tE2xPgM/0PtSczfg==")),
        // Super Foreshadow
        createPart(Schematics.readBase64("bXNjaAF4nH1TzW7TQBAe/8Re/8ZJ2yuKAAkB8olXAF6AGzc33jZGiW3WTkufAHHiGThw5+mQ2iYx3+zSlLYqsdYz6/nmm29mN3RERza5dbGSNHtbrWTdVU09e1fL1cXsw7qVava+UbJbFGVzTlEpu7mq2h4YoimlwJd5q5pPct43iqblDUOODFXm5ZzCtjmXKq+bUlJ4csv14gFWnixBkwMzl/+QPrsP7LHP582qBVcny1z1p/T0PqhdFJ3Mu7YA17GqylNJ47m6aE6W66rMV9UXqUis62VTlPCe3083hRaNqtYr1KrLddXTq/+iltVnplbNugfj6wft7fe9nC/qZtmcXoBZyfwNjc8L5OTyS68K3fOTR3quS3yVj8WbM6lKVZ1JStr1spN74dntGeTLQmEWLx+Xhyl1fbHMj4seoi6I6CMWjYgsPAFZFtmUkGORA4fYjMi24fvCHXbDDmAPO4es4Rq+Qz6jXJrAhQnJ4oyEbBc4l5k9QOwRXoh52GX+MAzfsX46zHVAjo9gRho45SD/ds4IclBbkCAf+jLtib0X770EXqy9VH/z4I0hi1zw/AaLwG122KBWCHPIWgPuz4bxBbocrrQfCGgdNthvhi0atIcrPBssND5cUoQnIVAElI2M4gCtwwnogKXvWDtqBShix2jZ52BIAeuxENsgOaQQyRHGGlImwmHgcaLmVtfmofIMeaoudFlaz07ThqaFkFuwKAYGciLSg4xoxAq+Yf1CKIIG1Ir2QiMjNPorlI8djBEL9YC/kxwDSPxVsG4MCq6NlYlAXxQbuK25AsOl1r2F1h3WBv41SsdGacxKU0rRiz2GVsFTSYy0ZC8tMdKSu9ISM8OUtYxhhNlFxuCK+TBjPsmUi3kwh5z/FesHRGY8nhgIwS2MKeRR64PdYW10I65uxgx4g+g1IgOG7gE/uRFjO0x2wGPO+GVBrsfdZTgJvtEU3UC58YyHxSYlO4PJhM38/K9xJkgVpE1gTGiMPsQpxyxUioxJjZmYGAT8AfgCcOQ=")),
        // Core high defence
        createPart(Schematics.readBase64("bXNjaAF4nHVV247jRBAtt+3Et9yTmR0W2EVCQgj5iT9A8CGO3TNjcGzTcWYmz7zv077zUYgvQTywu4w5px1mpexupPapqq7LqepuRZ7LRolXZzst6x/Lna73ZVO//KnWu+PLH7K9lrjQ+9yUbQe7yOcSXTdG72+zormXZfF/RAqLKdIil01bZfsuq8vDLr3PqiqtMnOjJWqbe23Suim0jJCurbS8OA/fNrtt2ulKt43ptJGvzh32bZbrtCp/PZRFiiK/yBfnLpTypqp03jVGvjnftp/2Fp2dkm1NWYDfFG7YMM3PQ+A8Mzs0WiBXfaePsIxMcyCpielu0htda5PRMd436DBts1pX8vVHy3W3jeE4kKo4lJ1MtlmHTMfTaL48D+qgW2dYUXC20/ktBppnVdoedq3McnNsrivOYFc+0OM+Q75UP3Qms+yDQ101WaE/MoBCX3M2KY4R3b9v+LsPHJ/0DvXrpmpujmBldPr9hydHadtUXdodjNHdJ3pq7rQpTHmn5dtPV0NzuD9VehqSjPNjXjW1lqDNDC5U9iAinYgjoShHlPiiFLSpuIT5AEtxXXFlHPhQXCwPX0+o+eI5HuSpUJSFOAp7K1Ej6Eg2xicQFWAvGqMWl4tinsSiImxGjPAZEckImgoB2HMBkwCp+75/xPdt/w5BnhPAPh3D+BrrT5dBM3FiwFwkASwEBVGWlXys2KE6YsjvWH85E6hjcaf4gBkBvceASFwPJvQeQUM6BQCxGR1ETbDni0sYDYAsc0AgCA0G7gG5xwDLJiAb224QWP7M6aIfxVH3/0JyqPX/YAoL+CH/UjgBpAlJKAJYJiGZrGBCkjXrobeRohRCmlspghRbKYaUKHJK2PgbO8QNkqK5GNa5OAlgwZNPyGklHKG6kAnMMMQsl2DP4+ElMmeaV1h/IHBC1zVggjILdYmsyBQCHAahBjlOxSczeYYDgikB+Aybydja7W2hI0RrQBWMVNFge3KvIEWDR2wrUUogTVFlQWprwMgGc9QhSf7Nc0fogqG0xu/vHdWE4mg4CaiTIOzfkAfOR/rH/i3JY/He08Pve56KG8IX/REwvDXfxIn0cpjG0h7JXK6EJ2gBBGaYYyKOA1jxRqyYeg3wT9ErXkIerk2+Gk5mPUxqfZrUZ3IBLlA3T5PacFI+7AmfykamQWQv0jvbiEJL/HkMw+IzerSNefaNXyCHwr8VOOLVX/KdODinkAO7HJ7Xb3xe8hyq9bliJh+Q8D48g8/TFGm16diy+g+TsF4w")),
        // With an Electric Storm and Time Flow
        // createPart(Schematics.readBase64("bXNjaAF4nHVS227TQBA9vsRO4iZ20haEkLgIIYSQn/oHCF74C8fetobYDmuHNr/BCxJvfBV8CBKUNl3ObHqRUjVW9szOzpw5M7t4jKkLv84qhf13ZaXqtmzqZ+9rVa2evc1adYCoUG2uy0XHA2Af0+I6LG2PM12kRY6wa5fkKPF0+3DWVLO0U3O1aHSnNJ5vB7SLLFfpvPy8LIu0y+pPiE8yRqbqtNNZ3jUaw0VzQkfdFApjZhfpQjcflT17tc1nl8UxpV9Rz3RZHCmEeVMXy7JD2OZZJ1LupBbqcE7W9LDRzLut8fpO4M0+16u2y+bpzFKu8HI7VAmjLvO0JVOVdkutVYck01WjVZFS1Be1Yo3ktsd0nmkK7i/reZMVFPrm/vqdyo/rZt4crUilVXqAJ9vBHfdSp6CXZDElN4dzmXZVnopjM6BbKS/uYagWWrUtRevuCMAHwIELV5YeHBceYnDxxck3hR1wkc/tMSDoO+bCXCCgHcITGMALCePQGPOD/59MC5AAfQJJfIIHN7A5nkAEb0AYwe2TxIb0BYbkYkgE697BkJ/j0TmGExHo9JjMyIgn3I24o7AxodcfCYk5B8w/CUFA9LmnCPPHnDHeYZZnLs2a3znxzBgWi4QpJIykg+/8/yLxjhDHhLAH7Hkyh1imRClwYmr36Z+wzZjpEMeQjsSZQEQ5U8JIBjOWBRQBDL2YW8mLrCUJkePTiqVUbB2Bs0srkhz5ucymClF2wa3jyqkV+k2Eej1ux/0e25V7MWz+kiMEesaQMrHVEkesa3nJRl6ykTeBL2S/RR4TJjeiJiT29rArjyLG1I4hsY4BeCz9eS72WJgRuwj7A7PmuNccu0Fg+3XskNe0fPOXuvjAnICxvP6YmRvGkJbt56vtJ+B2LOf7G+nW6l3VfiB3KI6BdQS0dkTkQ96VI8DnAkIsk3tE2xPgM/0PtSczfg==")),
        // Two Dark Light
        createPart(Schematics.readBase64("bXNjaAF4nHVT224TMRCd9V5zv9FL0kIr8YAQ2if+AJX/YJN1k8BmN/JuW/KIxAcg8Qm883s0aZLljJ2mUgptvOOxx2fO8YzpgnqCnDSaSepfTWcyzadZevkxlbPF5Ycol5dXkfpCtVjmIzWdF9gk6lATgXE4V9lnOSoyRd348WiYTyIVh/GILg7XhtlsGBYykfNMFVJR6y6CCeXXQkUapT3P7rCQZrEMk0iNJQ2e4YJNmEzHk4I8ld0wzJvDGP2ZT0A+zOfRSIZDNY0B9vYZ2N4fqUVeREk4jApALuj1YWgBPxxls7mSeS7jUBXj54ljeZ3gPsLrTCHr0+1Un3RRcJMmWRSD96t/5shupYrV9FbSu//TLeRokmZJNl6Ak5Lhezo7DDbKb6ObpKAG2IZjmUoVMR2iTxgkyLbIohom+GuwJ8hlz6KAbA5ACH7UJGHD+GSxqRhTQxhMmyMdRnDwbwdeuaGgXFMV1i3XZUk2ZlRuAOEwvAscDeFSnciDAbzApM3GBxwieVn4ME2/LMufGL/Ay+c0zEMf9HEQXsChApAtNlWwEpzA5oM/MH6LAK7DqBU+WAFzELUR6hkTGFMl28FePWiBPoH6plwx8XJZ3gPnHrMHPefvkhx81+Wf8p5E+QBvC6EPTAEYUFRFrg5ZwCMvsPm6cX6D71rUsea7RE3BSgImikTk6Y3KfqPKGxuMpWCUWmBxkNVgdEJsgxzEtiGvwVfAC55eaOIqKoRPE0vE6y2sdwRfkUt2m2+ay9WG1gCMttCx5R3chMBwdE8IrYv1tHVGqCHSoh7Tdkzazi5thXp8sTXqQrGjG8yFYltrWCGwu1fdhWoWs1Pd3avuQjXXWKt24KIaurss1ITRPD1fIWKJNuOqbGG51bgyqAf2A/D2tb8C7a7prxfcGDYo6qL3TNF7XHQbe3UOOeIW8mF073zf9c6R6Z0jiMXvhHuX6JhJCni6W4/5vA3PZU0nSIi9U75mG6bOoKemk7/tOrkPEHRbHw+Gn0WgewMzHOgblL55dQPz6gbmyQz41Qk6MwU5M0/43Dzac347Fr3k4v0FujBiDA==")),
        // An Electric Storm and a Dark Light, monster like
        createPart(Schematics.readBase64("bXNjaAF4nHVU227kRBAtX8b22J6x5xoS0LIIIYSQn+ALEHyIY3cmZn0Z2p7Nzl8gXhC88VXwAXwCD2zYxJzqSjZRop1R+3SXq0+dqq42vaBTm9w2bxRtvq8a1fZV1778oVXN8eV3ea++pahUfaGr/YAXRCe02dd5P+RtdWiyq7yuszrXO0XJVT4onak3g86LodM0P9dVuVNZ0bXloRpotj/U/cPy0/I+WtZf5rrMzrvmPBtUrfadBhOF++4KhG1XKprDtcz2uvtRGe4vn242j/0lBGf9Pi9UJsHJ74t8YLZnO0p1UYMsu+g03B+ov3rm+H5d6CMSr7NzQ3mkL566KmbUVZH1YGqy4aC1Guizp26isK5+OlRlhkq+ojTXTadVydV5rY6QkT5kf1fg4NDWXV4il68/LHFQxWXb1d3uCCqtsm/oxVPnAWtzCrCCLEFW3UXNUprqDQzLZ+wFJQ9nKfLOnjnl+hVS2l0O9PkHIjZ7rfoeSephR0Q/Y5CNP34uWQyeQCAQCsQCc4Elmd+aHxalbLRoe09lW3i4ZPPc82F0+I3jYOkLBAJTgVAgEogFZuS42LhmZgeaHIZAIBSIBebs6dLCBBEVrqhwRcVEVJgcnQmWUYDkxncYb8cR4wbjlhwMa7zF6nb8DxEnHIABAXzAyofzHxh/2i5eb5hugqtoc8lMPI/jMfhke4CQ93uojxMAlqzFf6yFsDT7A9kfyP6A909RHewPsYrJjjBPyIphXHG1Aw7PBXzEFmIZ8zwUtlDYQmYLAXfvzMbo8cYZllOy54AwSFgM8qfx2hymB3S5HuNbEDGd1OkGhbjhP+bXmF9jfg0NEcfxAUsu1+8Yf9lkYkNLLJJiljQjzsZOAPEEveSwfU3G2RziTPppBqlg+Q3jbyfBcgrvBYrKO4kNCQyptcAMnbgELMlZ4Y3DBUu4n32cYeCb3kYJwDI3LJGZ8fbIsjAz0ecSPZFHYl571hqz1Je2Jxv9kNCCZb3jG2DzW5Pvr5wveiyhVTABG7psHFHLW3QKumUckW9qYqcWz+6lpyI9ZemwQIJN0tEMmG9w7iaRBU050D+cCMgW7+UvIN/Zwg03FmpMUVNjwKW1YDDUS6Fe8QMtTXEwxRG6GB6EcrcSXwG+Q+O/kM23B61gefBFHycIIsQ+ZiblX0zKHpYrDrCWABt+JACTq8Oz8E7Qlj8mbJgbA9+kBV/hE4SCfUv+neMJ+sNiQOevAOZzsxX+E8nilO8o0UdiPJWGPkWXoQHOTL9iNRdIBZYCa4Yz/gQRfcwbGCKBGcMn/NFhwEfnf0NidVA=")),
        // Unbeatable
        // createPart(Schematics.readBase64("bXNjaAF4nH2VDXbaRhDHR0IIffApsMHEsZ2X9vW1r7pFe4QeQKCNoRGIChHH58k9eo2ew23q2oCt/mdnnbyHkxgvP412ZnZmdnah13Rqk7NMForGv8wXarme58uLX5dqcX3x23KikjKZZIrCVK2nxXxVYpboBR2tsmRdJsv5ZhFfJVkWZ0lxqagNB2m8KvLf1bTMC+pcJaUqYvW+LBL94jx9WiNez5IijflpkmdlXG6KQpXPFSb5YhKXKlOrvIAv+u5QQX+Vs7zgWKb5Mt3MSwpW+RUWXuaposbTy5++aZrN/9jM07jIN7zMD1/UXc2StYrXq2Sq4kkxT5FyZ1pc528yNl3M38Oy+3lpU5XgTV4oeEnzKzo79FtC1mHjLazHh/NpUrxFbJezkl4dzkkgJnDsxtvnYafqTYa9iBECVD/vjLdZZnmSYsUfn5l8kpEaNjmLJ0mJmlzTz4eqSCvfwPEaRgimnM7my8t4qpbltx2Xajpb5ll+eY3UC/WVquTvVJEW83eKvj+cV5xUMZ/GaySzeGqe118p7mKFQNcK8ZaX5HKPIryXX2rFaZ5lUqDoWfRTIvqT9F+Nv2yBI3AFniAQNAVtQVcQCQaCY8FIMIZX/ieytP8aoy5oCHyq2UAoaAk6gp6gTzWY0pB92uLTkVDr7KyOhyZH7FDLc6tHsjEcDDxXe4wtpDus5yByDbhndAU9QSToC3Q6Di9mYQ3E7gEe6RV9kQKRQpGaIrVEapNOVOdRlzzq7NoHjhpVVX3A+EvXmdjQFd+uOHXFm8tuWAVROHoragHib5DF8AWhoEWWC3Q8VrRhY+uPVd0Svx94Fgpi1XhWb5HHnkOg7gXVnryqoqB6IAIdbJZTPeCz1bJbbXURXauJRXvSFgipBQmxMHxBKEAs3DK6U5rcUBakIy5nKI0RsHkHc8iJEQp0XzWltVpctBBS3+MtaLI9T+oNaaEXtHddnTY1oNMDO3WCWYSnPmkMWLsttm0po+7aPtQaLmWV/O25/Q0DcAe2jNzW+yPk0SHSNWga+oauIXd7F7ZblsH/2Ab8iPHIMvvFuOOYDG1Dx9AFb838rZm/NfO3Zv7RrLM3fOD4TOzMe8MbY39j/N2YOG5MHB+NjWN81g09LozuETltock5NHXwjf87UzNNE9ve6Hlm7sH43xn/O6PHbBh6hj4T42/dBuLDNntA1gA1brHzDvW8dnXHqXCzIkRXq7n63O/wbov09nC/xecey6JwGDY3dy2CvW6RjrRIRxqqK/dZV+a6POcD+sD+K1clRLTREaYjsiNEA51j6OvLKZJbqS/PEc/xw5g1+yINSPcJ8qizryF6U6sPWGsECafWBmrcUUfkeThanB7vCdKyUZtHrhP6y8Kwkdyu2tWGONUBWT2YNLXjCE84h4w2WTytG/9YLudjXiYAcH22ANzFQ8QCAwcYyUWuAxpKQJxerQdEJuyR3JAj8TdirRM64VPA8DmUEYUmlBEKjBhO+EyzuvZ8wjZDPDc5zBO+K/m+HcnvBhk9Lt2YbwZGh6+EMa6EgOS25d+UOsqDZ+wxlNERFZ733GaQ9rh6xlLNsVwdL9iG4fCdc4rM7RCS77mfakzVPZ8f1Pked+B9rQs1PvWA/iE75XuO0WdPp+zeoZcS+CmvUqMzLpePlz63zj/m6JxJaudcbgdoCjpc9XOUyeI5HeyZ/Mqd61NGF9J5F/Lyle5hwBG4Ak8QCJqCtqAriAQDwbFgRNb/C8OLHg==")),

        // -- Not important --
        // at coal, idiot schematic
        createPart(Schematics.readBase64("bXNjaAF4nF1QS07DMBB9SVra5ldVQqRlyQ4hb7iR41htpCSObFelN+A6nA2JFRBm6gWUxejZ4/cZD3a4jzEbZK8R62dkjXbKtqNvzQCscOOUseqAh6bt9eCoK9xB2kaMB+m0cKNUWtS2bfYa65P02gr94q1U3ljcKtPXR8deYq8HbSV3s9brXjhztEojqzvpvGhs23XYONNJK0Y56E7QiTwf/+f+3pU9Oy87UUtPsWekozlR/GAaDeCJCiUSIEKBJCIoF9M0vVK9Rdxd82PMnBgplkgSgjRAFiAPQPoZQTkH5vGcuhkbZsHwg4PIKSfL5Ia4CxbltDtq5MQBH4D0wtkytWAFjxX9naigYUhZBGURlKDH94ukCpLttWTHfiVHJwQXZRmUK4TgkjMX9NsVc9b0j4ghC5AHoFGWBOUymb4p84vqE/ydDcsYcg66Cxutwkar641WYaNb5vwADDh5kQ==")),
        // at dimension shard
        createPart(Schematics.readBase64("bXNjaAF4nF2Q3Y6bMBCFDzY4hPx3H6BS7y21j+SE0S4VYGScpPvkVbvt0mNoblaWzueZOTNjwBP2CnnvOoGSb9jUMl5CM8TG98Aen+qmk35kZMcXF2pbX/D5Y+7su7ON0srgQ5SAXYjP9ll6CS76gKMLnQ9S24vvb/LKzJePE2aJLz40187WoWlbnEbfumAH10treXsW7IZrO0oaU1+biMPQujG6PvXcHVsOd8f1Vn7E4C5p8+rsIjOvKOrG14Inf5PA8TexQ/DfZTYdB39nV0/D/z2bJkpnR38NFwHwFchQQWVQKKAzaF60oqwSNNZQGjmPzmkwoBTYYrEvoAUoOUfNXZibmSyYpNMQBdSKMNAJqwUldEmfTpZ1sqTIQK0J1iqki05SQRtKkWpVqq2QqllCtWCDrKTMwzbJuSG4b0uU5WH6g2z6Pb1P70DS6ef0l/rG6I23X3x9DsVY0ZGTOWlIQ+44oyqAI6dveZShzO/dLQt3j8ikX7FPH2+IOXlYLIdHZFLtuESnpXZ6RKz9AyACjo0=")),
        // power
        createPart(Schematics.readBase64("bXNjaAF4nD2NwQrDIBBEp0YQLBLaWz/CS//IxqUNJKZoLv37zsZSXPcpOzOLEaOBLWkVGLnjnKVNdX7v81aAAZe2LanGdyqyRL6egmueVymNgtheqeaYJ4RH2nepn58EuAEnHqPN8k84XpbvCAqrEoXlKjbX4TGoK6jvcCkoMYRTg1OJIvwTQRwpvqf4LvE9RbcNCtvhdEPg9JhR8gWHlhuq")),
        // Small DC
        createPart(Schematics.readBase64("bXNjaAF4nGWO3WrDMAyFj3+SNs1grE+wi0HZRS73QF5iloDjBNtl5O0nWYNBZ4QsfTo+Fho8adjoVg/tP9BPPo9p2cuyRaDF8x5cLi4u93X4diHgdVpWHzONhzy7NP3mfXbZi+L2qKipzFtiE1Jshwhf8hZcGnYXfRio+vJ4f3z714/poEXC8OlK8enA9Z90BPCGegwnVQO6hiDACmwEtgJPAs8CO4GXytBD6VopQ1MNY6mz0A3VLQzDTr7qYVQ1UDRmCXc9f2wEGobkINDKUmxnqpwfsEgzrEpLe1bYCjwJPAvsBF7kIs8f0xBIyw==")),
        // at sand
        createPart(Schematics.readBase64("bXNjaAF4nF1PQVLDMBBT7KRNk5QOH+DAjYNPvMhNDPWME2fslNKP8Ra+Qqc0yLnAcNjR7lrSytjiTiAfdG8gzDPqzsQ22HGyfgDucB+900GNejBOsXs1WPF5dMTeDJ0J2J30ZIIy71PQ7eQDHjvLp0gHFQ86dGo86GhUHHVr1D7YbjHxR6pQ28n0KvpjaA223ro/PtXoTzQefGewi9bZNjn2xi1CR8+gumCdQxG1e/PYtV471ZphCvblyCtP/5P8zm04x4nsvZ5odwbwAGSQEBlhgyxBwzUEVlwj5ywEuxxSEkpk7FCt5/l2ZV1EwbGGTJwGcpWIBXUiZ5eTNn+wPuUaBR2zktuqLIH5wjWLh7L5C3K+sK7I5xsZPEo6c2yQ7GVF6SZdXkEky28GLEWNNdWiIVAiCUvkMglT0iVruWSdr+kaH6tkl4DULT2r9NeajUzQpH8kP/kDuuCH0Q==")),
        // Thorium spectre
        createPart(Schematics.readBase64("bXNjaAF4nG1SW07DMBCcOG3TNCmFIs6A+uE/TsEt3MRqI+Ul21XpxTgOVwmzMUIISOTMend29qHgDo8Ki950Fsq+oKitr1wzhmbogQL7uuls73nT/mxcresKD35ojdOj6W2raZ0s9G/a/AnnwTWXTpu2HW76SviiP42t8cH0Evzh3rpw0ifbW2fC4LC7mmCdtm/BmUocmR9tFZxFcZR8XbumbfH8b+3xbLzVfjSV1UfX1JQ//Jnl+165G/tp9dEElryhaILttB8urrIADkCCBVKBLMImwhZpQrhHoiCGUvQTUsyv5CwjMI8WciQiVSJdEXaAIoGP8BToWvKQvOLBmrcNkYqRsZK6OaGEWhO22TRNrzwfTM6iThZ1MtHJCTM1I5XRd6GqFYVZeUPvnsWzdE3HRqQmUVAJ89igkmYx9zyPksdR8jhKLlHFX0R6I31eTxnXU8b1lHE9paznEwZDeNQ=")),
    ];
    var added = false;

    return {
        pre() {
            if (!added) {
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
            var v = wallMap[block];
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
    var res = [];
    tiles.each(lib.intc2((x, y) => {
        var tile = tiles.get(x, y)
        if (tile && tile.block) {
            res.push({ x: x, y: y, block: tile.block().name })
        }
    }));
    return res.map(v => "x: " + v.x + ", y: " + v.y + ", block: " + v.block + "\n");
}
const ass = func => new JavaAdapter(Astar.TileHueristic, { cost: func });
function createWrekGenerator() {
    var rid = new Packages.arc.util.noise.RidgedPerlin(1, 2);
    var basegen = new BaseGenerator();
    var scl = 5;
    var waterOffset = 0.07;
    var ints = new IntSeq();
    var sector;
    var noise = new Packages.arc.util.noise.Simplex();

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
    var arr = [
        [Blocks.water, Blocks.mud, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.darkPanel1, Blocks.sand, Blocks.sand, Blocks.sand, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.mud, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.darksand, Blocks.sand, Blocks.darkPanel2, Blocks.sand, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.darkPanel3, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.sand, Blocks.sand, Blocks.darksand, Blocks.basalt, Blocks.craters, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.deepwater, Blocks.water, Blocks.darksand, Blocks.mud, Blocks.sand, Blocks.sand, Blocks.darksand, Blocks.darkPanel2, Blocks.darksand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.grass, Blocks.mud, Blocks.grass, Blocks.grass, Blocks.dirt, Blocks.grass, Blocks.sand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.grass, Blocks.mud, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.darkPanel3, Blocks.darksand, Blocks.stone, Blocks.stone, Blocks.dacite, Blocks.dacite, Blocks.space],
        [Blocks.water, Blocks.water, Blocks.sand, Blocks.mud, Blocks.grass, Blocks.grass, Blocks.grass, Blocks.sand, Blocks.moss, Blocks.stone, Blocks.snow, Blocks.iceSnow, Blocks.dacite, Blocks.space],
        [Blocks.deepwater, Blocks.sandWater, Blocks.sand, Blocks.dirt, Blocks.grass, Blocks.grass, Blocks.darkPanel4, Blocks.basalt, Blocks.basalt, Blocks.snow, Blocks.snow, Blocks.iceSnow, Blocks.dacite, Blocks.space],
        [Blocks.magmarock, Blocks.hotrock, Blocks.sand, Blocks.sand, Blocks.darkPanel5, Blocks.moss, Blocks.basalt, Blocks.hotrock, Blocks.basalt, Blocks.ice, Blocks.snow, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.hotrock, Blocks.water, Blocks.darksand, Blocks.sand, Blocks.sand, Blocks.sand, Blocks.sporeMoss, Blocks.darkPanel6, Blocks.basalt, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.sandWater, Blocks.sand, Blocks.metalFloor5, Blocks.darksand, Blocks.dirt, Blocks.moss, Blocks.dirt, Blocks.dirt, Blocks.metalFloor, Blocks.snow, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.space],
        [Blocks.taintedWater, Blocks.darksandTaintedWater, Blocks.darksand, Blocks.darksand, Blocks.sand, Blocks.moss, Blocks.sporeMoss, Blocks.snow, Blocks.metalFloor3, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.space],
        [Blocks.darksandTaintedWater, Blocks.darksandTaintedWater, Blocks.sporeMoss, Blocks.sporeMoss, Blocks.moss, Blocks.snow, Blocks.iceSnow, Blocks.metalFloor2, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.ice, Blocks.darkPanel1, Blocks.space],
        [Blocks.darksandWater, Blocks.metalFloorDamaged, Blocks.sporeMoss, Blocks.sporeMoss, Blocks.moss, Blocks.metalFloor2, Blocks.metalFloor3, Blocks.snow, Blocks.ice, Blocks.metalFloor5, Blocks.ice, Blocks.ice, Blocks.metalFloor3, Blocks.space],
    ];

    var dec = ObjectMap.of(
        Blocks.sporeMoss, Blocks.sporeCluster,
        Blocks.moss, Blocks.sporeCluster,
        Blocks.taintedWater, Blocks.water,
        Blocks.darksandTaintedWater, Blocks.darksandWater
    );

    var tars = ObjectMap.of(
        Blocks.sporeMoss, Blocks.shale,
        Blocks.moss, Blocks.shale
    );

    var water = 2 / arr[0].length;

    function rawHeight(position) {
        position = Tmp.v33.set(position).scl(scl);
        return (Mathf.pow(noise.octaveNoise3D(7, 0.5, 1 / 3, position.x, position.y, position.z), 2.3) + waterOffset) / (1 + waterOffset);
    }
    function genNoise(x, y, octaves, falloff, scl, mag) {
        mag = mag === undefined ? 1 : mag;
        var v = sector.rect.project(x, y).scl(5);
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

            var tile = sector.tile;

            var any = false;
            var poles = Math.abs(tile.v.y);
            var noise = Packages.arc.util.noise.Noise.snoise3(tile.v.x, tile.v.y, tile.v.z, 0.001, 0.58);

            if (noise + poles / 5.1 > 0.10 && poles > 0.14) {
                any = true;
            }

            if (noise < 0.20) {
                for (var other of tile.tiles) {
                    var osec = sector.planet.getSector(other);

                    //no sectors near start sector!
                    if (
                        osec.id == sector.planet.startSector || //near starting sector
                        osec.generateEnemyBase && poles < 0.80 // || //near other base
                        // (sector.preset != null && noise < 0.9) //near preset
                    ) {
                        return;
                    }
                }
            }

            sector.generateEnemyBase = any;
        },
        getHeight(position) {
            var height = rawHeight(position);
            return Math.max(height, water);
        },
        getColor(position) {
            var block = this.getBlock(position);
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
            var height = rawHeight(position);
            Tmp.v31.set(position);
            position = Tmp.v33.set(position).scl(scl);
            var rad = scl;
            var temp = Mathf.clamp(Math.abs(position.y * 2) / (rad));
            var tnoise = noise.octaveNoise3D(7, 0.56, 1 / 3, position.x, position.y + 999, position.z);
            temp = Mathf.lerp(temp, tnoise, 0.5);
            height *= 1.2;
            height = Mathf.clamp(height);

            var tar = noise.octaveNoise3D(4, 0.55, 1 / 2, position.x, position.y + 999, position.z) * 0.3 + Tmp.v31.dst(0, 0, 1) * 0.2;

            var res = arr[Mathf.clamp(lib.int(temp * arr.length), 0, arr[0].length - 1)][Mathf.clamp(lib.int(height * arr[0].length), 0, arr[0].length - 1)];
            if (tar > 0.5) {
                return tars.get(res, res);
            } else {
                return res;
            }
        },
        noise(x, y, octaves, falloff, scl, mag) {
            if (scl === undefined && mag === undefined) {
                return genNoise(x, y, 1, 1, octaves, falloff)
            }
            if (mag === undefined) {
                return genNoise(x, y, octaves, falloff, scl, 1)
            }
            return genNoise(x, y, octaves, falloff, scl, mag)
        },
        generate(t, s) {
            wallModifier.pre();
            schematicsModifier.pre();
            if (t !== undefined && s === undefined) {
                this.tiles = t;
                this.width = t.width;
                this.height = t.height;
            } else if (t !== undefined && s !== undefined) {
                sector = s;
                this.rand.setSeed(s.id);

                var gen = new TileGen();
                t.each(lib.intc2((x, y) => {
                    gen.reset();
                    var position = sector.rect.project(x / t.width, y / t.height);

                    this.genTile(position, gen);
                    t.set(x, y, new Tile(x, y, gen.floor, gen.overlay, gen.block));
                }));

                this.tiles = t;
                this.width = t.width;
                this.height = t.height;
            }
            const rand = this.rand;
            const width = this.width;
            const height = this.height;

            const the = this;
            function Room(x, y, radius) {
                var connected = new ObjectSet();
                return {
                    x: x,
                    y: y,
                    radius: radius,
                    connect: to => {
                        if (connected.contains(to)) {
                            return;
                        }
                        connected.add(to);
                        var nscl = rand.random(20, 60);
                        var stroke = rand.random(4, 12);
                        the.brush(the.pathfind(x, y, to.x, to.y, ass(tile => (tile.solid() ? 5 : 0) + genNoise(tile.x, tile.y, 1, 1, 1 / nscl) * 60), Astar.manhattan), stroke);
                    }
                }
            }

            this.cells(4);
            this.distort(10, 12);
            var constraint = 1.3;
            var radius = width / 2 / Mathf.sqrt3;
            var rooms = rand.random(2, 5);
            var roomseq = new Seq();

            for (var i = 0; i < rooms; i++) {
                Tmp.v1.trns(rand.random(360), rand.random(radius / constraint));
                var rx = (width / 2 + Tmp.v1.x);
                var ry = (height / 2 + Tmp.v1.y);
                var maxrad = radius - Tmp.v1.len();
                var rrad = Math.min(rand.random(9, maxrad / 2), 30);
                roomseq.add(new Room(rx, ry, rrad));
            }

            // check positions on the map to place the player spawn. this needs to be in the corner of the map
            var spawn;
            var enemies = new Seq();
            var enemySpawns = rand.random(1, Math.max((sector.threat * 5), 1));
            var offset = rand.nextInt(360);
            var length = width / 2.55 - rand.random(13, 23);
            var angleStep = 5;
            var waterCheckRad = 5;

            for (var i = 0; i < 360; i += angleStep) {
                var angle = offset + i;
                var cx = (width / 2 + Angles.trnsx(angle, length));
                var cy = (height / 2 + Angles.trnsy(angle, length));

                var waterTiles = 0;

                //check for water presence
                for (var rx = -waterCheckRad; rx <= waterCheckRad; rx++) {
                    for (var ry = -waterCheckRad; ry <= waterCheckRad; ry++) {
                        var tile = this.tiles.get(cx + rx, cy + ry);
                        if (tile == null || tile.floor().liquidDrop != null) {
                            waterTiles++;
                        }
                    }
                }

                if (waterTiles <= 4 || (i + angleStep >= 360)) {
                    roomseq.add(spawn = Room(cx, cy, rand.random(8, 15)));

                    for (var j = 0; j < enemySpawns; j++) {
                        var enemyOffset = rand.range(60);
                        Tmp.v1.set(cx - width / 2, cy - height / 2).rotate(180 + enemyOffset).add(width / 2, height / 2);
                        var espawn = Room(Tmp.v1.x, Tmp.v1.y, rand.random(8, 15));
                        roomseq.add(espawn);
                        enemies.add(espawn);
                    }

                    break;
                }
            }

            roomseq.each(cons(room => this.erase(room.x, room.y, room.radius)));

            var connections = rand.random(Math.max(rooms - 1, 1), rooms + 3);
            for (var i = 0; i < connections; i++) {
                roomseq.random(rand).connect(roomseq.random(rand));
            }

            roomseq.each(cons(room => spawn.connect(room)));

            this.cells(1);
            this.distort(10, 6);

            this.inverseFloodFill(this.tiles.getn(spawn.x, spawn.y));

            var ores = Seq.with(Blocks.oreCopper, Blocks.oreLead);
            var poles = Math.abs(sector.tile.v.y);
            var nmag = 0.5;
            var scl = 1;
            var addscl = 1.3;

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

            if (rand.chance(0.45)) {
                ores.add(Blocks.oreScrap);
            }

            var frequencies = new FloatSeq();
            for (var i = 0; i < ores.size; i++) {
                frequencies.add(rand.random(-0.1, 0.01) - i * 0.01 + poles * 0.04);
            }

            this.pass(lib.intc2((x, y) => {
                if (!this.floor.asFloor().hasSurface()) return;

                var offsetX = x - 4, offsetY = y + 23;
                for (var i = ores.size - 1; i >= 0; i--) {
                    var entry = ores.get(i);
                    var freq = frequencies.get(i);
                    if (Math.abs(0.5 - genNoise(offsetX, offsetY + i * 999, 2, 0.7, (40 + i * 2))) > 0.22 + i * 0.01 &&
                        Math.abs(0.5 - genNoise(offsetX, offsetY - i * 999, 1, 1, (30 + i * 4))) > 0.37 + freq) {
                        this.ore = entry;
                        break;
                    }
                }

                if (this.ore == Blocks.oreScrap && rand.chance(0.33)) {
                    this.floor = Blocks.metalFloorDamaged;
                }

                // Walls to space
                if (this.block != Blocks.air && Math.abs(0.5 - genNoise(x, y, 4, 0.7, 50)) < 0.11 && !(roomseq.contains(boolf(r => Mathf.within(x, y, r.x, r.y, 25))))) {
                    this.floor = Blocks.space;
                    this.block = Blocks.air;
                }
            }));

            this.trimDark();

            this.median(2);

            this.tech();

            this.pass(lib.intc2((x, y) => {
                // random moss
                if (this.floor == Blocks.sporeMoss) {
                    if (Math.abs(0.5 - genNoise(x - 90, y, 4, 0.8, 65)) > 0.02) {
                        this.floor = Blocks.moss;
                    }
                }

                // tar
                if (this.floor == Blocks.darksand) {
                    if (Math.abs(0.5 - genNoise(x - 40, y, 2, 0.7, 80)) > 0.25 &&
                        Math.abs(0.5 - genNoise(x, y + sector.id * 10, 1, 1, 60)) > 0.41 && !(roomseq.contains(boolf(r => Mathf.within(x, y, r.x, r.y, 15))))) {
                        this.floor = Blocks.tar;
                        this.ore = Blocks.air;
                    }
                }

                // space corruption
                {
                    if (isMetalFloor(this.floor)) {
                        if (Math.abs(0.5 - genNoise(x, y, 4, 0.7, 50)) > 0.20 && !(roomseq.contains(boolf(r => Mathf.within(x, y, r.x, r.y, 25))))) {
                            this.floor = randomBlock.random();
                            this.ore = this.floor != Blocks.space && rand.chance(0.25) ? dimensionShardOre : Blocks.air;
                        }
                    } else {
                        if (Math.abs(0.5 - genNoise(x, y, 4, 0.6, 60)) > 0.24 && !(roomseq.contains(boolf(r => Mathf.within(x, y, r.x, r.y, 25))))) {
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
                        var all = true;
                        for (var p of Geometry.d4) {
                            var other = this.tiles.get(x + p.x, y + p.y);
                            if (other == null || (other.floor() != Blocks.hotrock && other.floor() != Blocks.magmarock)) {
                                all = false;
                            }
                        }
                        if (all) {
                            this.floor = Blocks.magmarock;
                        }
                    }
                } else if (this.floor != Blocks.basalt && this.floor != Blocks.ice && this.floor.asFloor().hasSurface()) {
                    var n = genNoise(x + 782, y, 5, 0.75, 260, 1);
                    if (n > 0.67 && !enemies.contains(boolf(e => Mathf.within(x, y, e.x, e.y, 8)))) {
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
                    var any = false;
                    var all = true;
                    for (var p of Geometry.d4) {
                        var other = this.tiles.get(x + p.x, y + p.y);
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
                    for (var i = 0; i < 4; i++) {
                        var near = Vars.world.tile(x + Geometry.d4[i].x, y + Geometry.d4[i].y);
                        if (near != null && near.block() != Blocks.air) {
                            break dec;
                        }
                    }

                    if (rand.chance(0.01) && this.floor.asFloor().hasSurface() && this.block == Blocks.air) {
                        this.block = dec.get(this.floor, this.floor.asFloor().decoration);
                    }
                }
            }));


            var difficulty = sector.threat;
            ints.clear();
            ints.ensureCapacity(width * height / 4);
            var ruinCount = rand.random(-2, 4);

            if (ruinCount > 0) {
                var padding = 25;

                //create list of potential positions
                for (var x = padding; x < width - padding; x++) {
                    for (var y = padding; y < height - padding; y++) {
                        var tile = this.tiles.getn(x, y);
                        if (!tile.solid() && (tile.drop() != null || tile.floor().liquidDrop != null)) {
                            ints.add(tile.pos());
                        }
                    }
                }

                ints.shuffle(rand);

                var placed = 0;
                var diffRange = 0.4;
                //try each position
                for (var i = 0; i < ints.size && placed < ruinCount; i++) {
                    var val = ints.items[i];
                    var x = Point2.x(val), y = Point2.y(val);

                    //do not overwrite player spawn
                    if (Mathf.within(x, y, spawn.x, spawn.y, 18)) {
                        continue;
                    }

                    var range = difficulty + rand.random(diffRange);

                    var tile = this.tiles.getn(x, y);
                    var part = null;
                    if (tile.overlay().itemDrop != null) {
                        part = Vars.bases.forResource(tile.drop()).getFrac(range);
                    } else if (tile.floor().liquidDrop != null && rand.chance(0.05)) {
                        part = Vars.bases.forResource(tile.floor().liquidDrop).getFrac(range);
                    } else if (rand.chance(0.05)) { //ore-less parts are less likely to occur.
                        part = Vars.bases.parts.getFrac(range);
                    }

                    //actually place the part
                    if (part != null && BaseGenerator.tryPlace(part, x, y, Team.derelict, lib.intc2((cx, cy) => {
                        var other = this.tiles.getn(cx, cy);
                        if (other.floor().hasSurface()) {
                            other.setOverlay(Blocks.oreScrap);
                            for (var j = 1; j <= 2; j++) {
                                for (var p of Geometry.d8) {
                                    var t = this.tiles.get(cx + p.x * j, cy + p.y * j);
                                    if (t != null && t.floor().hasSurface() && rand.chance(j == 1 ? 0.4 : 0.2)) {
                                        t.setOverlay(Blocks.oreScrap);
                                    }
                                }
                            }
                        }
                    }))) {
                        placed++;

                        var debrisRadius = Math.max(part.schematic.width, part.schematic.height) / 2 + 3;
                        Geometry.circle(x, y, this.tiles.width, this.tiles.height, debrisRadius, lib.intc2((cx, cy) => {
                            var dst = Mathf.dst(cx, cy, x, y);
                            var removeChance = Mathf.lerp(0.05, 0.5, dst / debrisRadius);

                            var other = this.tiles.getn(cx, cy);
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

            var waveTimeDec = 0.4;

            Vars.state.rules.waveSpacing = Mathf.lerp(60 * 65 * 2, 60 * 60 * 1, Math.max(difficulty - waveTimeDec, 0) / 0.8);
            Vars.state.rules.waves = sector.info.waves = true;
            Vars.state.rules.enemyCoreBuildRadius = 600;

            Vars.state.rules.spawns = Waves.generate(difficulty, new Rand(), Vars.state.rules.attackMode);
            wallModifier.post();
            schematicsModifier.post();
        },
        postGenerate(tiles) {
            if (sector.hasEnemyBase()) {
                basegen.postGenerate();
            }
        }
    });
}


wrek.generator = createWrekGenerator();

PlanetDialog.debugSelect = true;
