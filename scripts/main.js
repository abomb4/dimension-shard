
/*
Directory structure:
abomb4: My common lib
ds-common: Common staff in this mod, such as items, fx.
tech-*: Specific technology
*/

// common
const lib = require('abomb4/lib')

require('ds-common/items')
require('ds-common/ds-global')
require('ds-common/overrides')
require('ds-common/bullet-types')

// dimension technology
require('tech-ds/unit/equa');

require('tech-ds/wall-buildings')
require('tech-ds/drill-buildings')
require('tech-ds/factory-buildings')
require('tech-ds/liquid-buildings')
require('tech-ds/power-buildings')

require('tech-ds/turret/bomb-teleporter')
require('tech-ds/turret/ion-bolt-turret')
require('tech-ds/turret/electric-storm-turret')

require('tech-ds/distribution/phase-space-bridge')
require('tech-ds/distribution/space-unloader')
require('tech-ds/distribution/resources-dispatching-center')

require('tech-ds/effect/dimension-technology-core')
require('tech-ds/effect/deflect-force-projector')
require('tech-ds/effect/time-overdrive')

require('tech-ds/unit/t5-factory')

require('tech-ds/campaign')

require('tech-ds/research-tree')

lib.mod.meta.displayName = lib.getMessage('mod', 'displayName');
lib.mod.meta.description = lib.getMessage('mod', 'description');
