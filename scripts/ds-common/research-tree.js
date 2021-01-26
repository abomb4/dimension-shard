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

const lib = require('abomb4/lib');
const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');

const {
    shardPhaseWall, shardPhaseWallLarge, hardThoriumAlloyWall, hardThoriumAlloyWallLarge
} = require('tech-ds/wall-buildings')
const { hardThoriumDrill } = require('tech-ds/drill-buildings')
const {
    spaceCrystallizer, hardThoriumAlloySmelter, timeCrystallizer,
    radioisotopeWeaver, dimensionAlloySmelter, timeCondenser,
    ionCollector, shardReceiver
} = require('tech-ds/factory-buildings')
const { hardThoriumConduit, hardThoriumLiquidRouter, spaceLiquidTank, spacePump } = require('tech-ds/liquid-buildings')
const { dimensionCrystalBattery, timeCompressedRtg } = require('tech-ds/power-buildings')

const { dc } = require('tech-ds/turret/dc')
const { bombTeleporter } = require('tech-ds/turret/bomb-teleporter')
const { ionBoltTurret } = require('tech-ds/turret/ion-bolt-turret')
const { electricStormTurret } = require('tech-ds/turret/electric-storm-turret')

const { phaseSpaceBridge } = require('tech-ds/distribution/phase-space-bridge')
const { spaceUnloader } = require('tech-ds/distribution/space-unloader')
const { resourcesDispatchingCenter } = require('tech-ds/distribution/resources-dispatching-center')

const { deflectForceProjector } = require('tech-ds/effect/deflect-force-projector')
const { spaceVault } = require('tech-ds/effect/space-vault');
const { timeOverdrive } = require('tech-ds/effect/time-overdrive')
const { dimensionTechnologyCore3 } = require('tech-ds/effect/dimension-technology-core-3');
const { dimensionTechnologyCore4 } = require('tech-ds/effect/dimension-technology-core')

const { formula } = require('tech-ds/unit/ast4-formula');
const { equa } = require('tech-ds/unit/ast5-equa');
const { burn } = require('tech-ds/unit/aat4-burn');
const { collapse } = require('tech-ds/unit/aat5-collapse');
const { beat } = require('tech-ds/unit/gat4-beat');

const { t4Factory } = require('tech-ds/unit/t4-factory')
const { t5Factory } = require('tech-ds/unit/t5-factory')
const { unitTeleporter } = require('tech-ds/unit/unit-teleporter')

const { dimensionFall } = require('ds-common/planets');
const { rhapsody } = require('tech-ds/unit/gat5-rhapsody');
const { coreConstructionPlatform } = require('tech-ds/effect/core-construction-platform');

// -=-=-=-=-=-=-=-=-=-=-=- No core needed -=-=-=-=-=-=-=-=-=-=-=-
lib.addToResearch(phaseSpaceBridge, { parent: 'phase-conveyor', });
lib.addToResearch(shardPhaseWall, { parent: 'phase-wall-large', });
lib.addToResearch(shardPhaseWallLarge, { parent: shardPhaseWall.name, });
lib.addToResearch(dimensionTechnologyCore3, { parent: 'core-nucleus', });
lib.addToResearch(dimensionTechnologyCore4, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(coreConstructionPlatform, { parent: 'launch-pad' });

// -=-=-=-=-=-=-=-=-=-=-=- After core -=-=-=-=-=-=-=-=-=-=-=-
// factory line
lib.addToResearch(shardReceiver, {
    parent: 'phase-weaver',
    requirements: ItemStack.with(
        Items.silicon, 200 * 30,
        Items.thorium, 320 * 30,
        Items.phaseFabric, 330 * 30,
        Items.surgeAlloy, 100 * 30,
    ),
    objectives: Seq.with(
        new Objectives.SectorComplete(SectorPresets.nuclearComplex),
        new Objectives.SectorComplete(SectorPresets.overgrowth),
    )
});
lib.addToResearch(spaceCrystallizer, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(hardThoriumAlloySmelter, { parent: spaceCrystallizer.name, });
lib.addToResearch(timeCondenser, { parent: hardThoriumAlloySmelter.name, });
lib.addToResearch(timeCrystallizer, { parent: timeCondenser.name, });
lib.addToResearch(radioisotopeWeaver, { parent: hardThoriumAlloySmelter.name, });
lib.addToResearch(ionCollector, { parent: timeCondenser.name, });
lib.addToResearch(dimensionAlloySmelter, { parent: ionCollector.name, });

// distribution line
lib.addToResearch(spaceUnloader, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(resourcesDispatchingCenter, { parent: spaceUnloader.name, });

// power line
lib.addToResearch(dimensionCrystalBattery, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(timeCompressedRtg, { parent: dimensionCrystalBattery.name, });

// defence line
lib.addToResearch(hardThoriumAlloyWall, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(hardThoriumAlloyWallLarge, { parent: hardThoriumAlloyWall.name, });

// liquid line
lib.addToResearch(hardThoriumConduit, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(hardThoriumLiquidRouter, { parent: hardThoriumConduit.name, });
lib.addToResearch(spaceLiquidTank, { parent: hardThoriumLiquidRouter.name, });
lib.addToResearch(spacePump, { parent: hardThoriumLiquidRouter.name, });

// drill line
lib.addToResearch(hardThoriumDrill, { parent: dimensionTechnologyCore3.name, });

// turret line
lib.addToResearch(bombTeleporter, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(dc, { parent: bombTeleporter.name, });
lib.addToResearch(ionBoltTurret, { parent: bombTeleporter.name, });
lib.addToResearch(electricStormTurret, { parent: ionBoltTurret.name, });

// effect line
lib.addToResearch(deflectForceProjector, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(spaceVault, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(unitTeleporter, { parent: deflectForceProjector.name, });
lib.addToResearch(timeOverdrive, { parent: deflectForceProjector.name, });

// unit line
lib.addToResearch(t4Factory, { parent: dimensionTechnologyCore3.name, });
lib.addToResearch(t5Factory, { parent: t4Factory.name, });

lib.addToResearch(formula, { parent: t4Factory.name, });
lib.addToResearch(equa, { parent: formula.name, objectives: Seq.with( new Objectives.Research(t5Factory) ) });

lib.addToResearch(burn, { parent: t4Factory.name, });
lib.addToResearch(collapse, { parent: burn.name, objectives: Seq.with( new Objectives.Research(t5Factory) ) });

lib.addToResearch(beat, { parent: t4Factory.name, });
lib.addToResearch(rhapsody, { parent: beat.name, objectives: Seq.with( new Objectives.Research(t5Factory) ) });

// zones
lib.addToResearch(dimensionFall, {
    parent: SectorPresets.planetaryTerminal.name,
    objectives: Seq.with(
        new Objectives.SectorComplete(SectorPresets.planetaryTerminal),
        lib.objectivePlanetaryTerminalActivated
    )
});
