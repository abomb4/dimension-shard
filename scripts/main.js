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
require('ds-common/bullet-types/index')
require('ds-common/overrides')

// dimension technology
// - air support
require('tech-ds/unit/ast4-formula');
require('tech-ds/unit/ast5-equa');
// - air attack
require('tech-ds/unit/aat4-burn');
require('tech-ds/unit/aat5-collapse');
// - ground attack
require('tech-ds/unit/gat4-beat');
require('tech-ds/unit/gat5-rhapsody');

require('tech-ds/wall-buildings')
require('tech-ds/drill-buildings')
require('tech-ds/factory-buildings')
require('tech-ds/liquid-buildings')
require('tech-ds/power-buildings')

require('tech-ds/turret/bomb-teleporter')
require('tech-ds/turret/dc')
require('tech-ds/turret/ion-bolt-turret')
require('tech-ds/turret/electric-storm-turret')

require('tech-ds/distribution/phase-space-bridge')
require('tech-ds/distribution/hard-phase-space-bridge')
require('tech-ds/distribution/space-unloader')
require('tech-ds/distribution/resources-dispatching-center')

require('tech-ds/effect/dimension-technology-core')
require('tech-ds/effect/deflect-force-projector')
require('tech-ds/effect/time-overdrive')

require('tech-ds/unit/t4-factory')
require('tech-ds/unit/t5-factory')
require('tech-ds/unit/unit-teleporter')

require('ds-common/planets')
require('ds-common/research-tree')

// l10n mod name and description
lib.mod.meta.displayName = lib.getMessage('mod', 'displayName');
lib.mod.meta.description = lib.getMessage('mod', 'description');
