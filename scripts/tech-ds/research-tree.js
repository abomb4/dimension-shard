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
    ionCollector,
} = require('tech-ds/factory-buildings')
const { hardThoriumConduit, hardThoriumLiquidRouter, spaceLiquidTank } = require('tech-ds/liquid-buildings')
const { dimensionCrystalBattery, timeCompressedRtg } = require('tech-ds/power-buildings')

const { bombTeleporter } = require('tech-ds/turret/bomb-teleporter')
const { ionBoltTurret } = require('tech-ds/turret/ion-bolt-turret')
const { electricStormTurret } = require('tech-ds/turret/electric-storm-turret')

const { phaseSpaceBridge } = require('tech-ds/distribution/phase-space-bridge')
const { spaceUnloader } = require('tech-ds/distribution/space-unloader')

const { deflectForceProjector } = require('tech-ds/effect/deflect-force-projector')
const { timeOverdrive } = require('tech-ds/effect/time-overdrive')
const { dimensionTechnologyCore } = require('tech-ds/effect/dimension-technology-core')

// -=-=-=-=-=-=-=-=-=-=-=- No core needed -=-=-=-=-=-=-=-=-=-=-=-
lib.addToResearch(phaseSpaceBridge, { parent: 'phase-conveyor', });
lib.addToResearch(shardPhaseWall, { parent: 'phase-wall-large', });
lib.addToResearch(shardPhaseWallLarge, { parent: shardPhaseWall.name, });
lib.addToResearch(dimensionTechnologyCore, { parent: 'core-nucleus', });

// -=-=-=-=-=-=-=-=-=-=-=- After core -=-=-=-=-=-=-=-=-=-=-=-
// factory line
lib.addToResearch(spaceCrystallizer, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(hardThoriumAlloySmelter, { parent: spaceCrystallizer.name, });
lib.addToResearch(timeCondenser, { parent: hardThoriumAlloySmelter.name, });
lib.addToResearch(timeCrystallizer, { parent: timeCondenser.name, });
lib.addToResearch(radioisotopeWeaver, { parent: hardThoriumAlloySmelter.name, });
lib.addToResearch(ionCollector, { parent: timeCondenser.name, });
lib.addToResearch(dimensionAlloySmelter, { parent: ionCollector.name, });

// distribution line
lib.addToResearch(spaceUnloader, { parent: dimensionTechnologyCore.name, });

// power line
lib.addToResearch(dimensionCrystalBattery, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(timeCompressedRtg, { parent: dimensionCrystalBattery.name, });

// defence line
lib.addToResearch(hardThoriumAlloyWall, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(hardThoriumAlloyWallLarge, { parent: hardThoriumAlloyWall.name, });

// liquid line
lib.addToResearch(hardThoriumConduit, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(hardThoriumLiquidRouter, { parent: hardThoriumConduit.name, });
lib.addToResearch(spaceLiquidTank, { parent: hardThoriumLiquidRouter.name, });

// drill line
lib.addToResearch(hardThoriumDrill, { parent: dimensionTechnologyCore.name, });

// turret line
lib.addToResearch(bombTeleporter, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(ionBoltTurret, { parent: bombTeleporter.name, });
lib.addToResearch(electricStormTurret, { parent: ionBoltTurret.name, });

// effect line
lib.addToResearch(deflectForceProjector, { parent: dimensionTechnologyCore.name, });
lib.addToResearch(timeOverdrive, { parent: deflectForceProjector.name, });
