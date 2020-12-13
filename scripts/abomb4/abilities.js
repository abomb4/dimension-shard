const lib = require('abomb4/lib')
const items = require('ds-common/items')

exports.newDeflectForceFieldAbility = (() => {

    var realRad;
    var paramUnit;
    var paramField;
    var paramOptions;

    function deflect(paramUnit, chanceDeflect, bullet) {
        //deflect bullets if necessary
        if (chanceDeflect > 0) {
            var { team } = paramUnit;
            var { deflectAngle, deflectSound } = paramOptions;
            //slow bullets are not deflected
            if (bullet.vel.len() <= 0.1 || !bullet.type.reflectable) return false;

            //bullet reflection chance depends on bullet damage
            if (!Mathf.chance(chanceDeflect / bullet.damage)) return false;

            //make sound
            deflectSound.at(paramUnit, Mathf.random(0.9, 1.1));

            //translate bullet back to where it was upon collision
            bullet.vel.x *= -1;
            bullet.vel.y *= -1;
            // Add a random angle
            bullet.vel.setAngle(Mathf.random(deflectAngle) - deflectAngle / 2 + bullet.vel.angle());

            bullet.owner = paramUnit;
            bullet.team = team;
            bullet.time = (bullet.time + 1);

            return true;
        }
        return false;
    }

    const shieldConsumer = cons(trait => {
        if (paramUnit && paramField && paramUnit
            && trait.team != paramUnit.team
            && trait.type.absorbable
            && paramUnit.shield > 0
            && Intersector.isInsideHexagon(paramUnit.x, paramUnit.y, realRad * 2, trait.x, trait.y)) {
            if (!deflect(paramUnit, paramOptions.chanceDeflect, trait)) {
                trait.absorb();
                Fx.absorb.at(trait);
            }
            //break shield
            if (paramUnit.shield <= trait.damage) {
                paramUnit.shield -= paramOptions.cooldown * paramOptions.regen;
                Fx.shieldBreak.at(paramUnit.x, paramUnit.y, paramOptions.radius || 0, paramUnit.team.color);
            }

            paramUnit.shield -= trait.damage;
            paramField.setAlpha(1);
        }
    });

    const createAbility = (originOptions) => {

        const options = Object.assign({
            radius: 60,
            regen: 0.1,
            max: 200,
            cooldown: 60 * 5,
            chanceDeflect: 10,
            deflectAngle: 60,
            deflectSound: Sounds.none,
            shieldColor: items.spaceCrystalColorLight,
        }, originOptions);

        var radiusScale = 0;
        var alpha = 0;

        function checkRadius(unit) {
            var r = radiusScale * options.radius;
            realRad = r;
            return r;
        }

        return new JavaAdapter(Ability, {
            setAlpha(a) { alpha = a; },
            localized() {
                return lib.getMessage('ability', 'deflect-force-field');
            },
            update(unit) {
                if (unit.shield < options.max) {
                    unit.shield += Time.delta * options.regen;
                }
                alpha = Math.max(alpha - Time.delta / 10, 0);
                if (unit.shield > 0) {
                    radiusScale = Mathf.lerpDelta(radiusScale, 1, 0.06);
                    paramUnit = unit;
                    paramField = this;
                    paramOptions = options;
                    checkRadius(unit);

                    Groups.bullet.intersect(unit.x - realRad, unit.y - realRad, realRad * 2, realRad * 2, shieldConsumer);
                } else {
                    radiusScale = 0;
                }
            },
            draw(unit) {
                var r = checkRadius(unit);
                if (unit.shield > 0) {
                    Draw.z(Layer.shields);
                    Draw.color(options.shieldColor, Color.white, Mathf.clamp(alpha));
                    if (Core.settings.getBool("animatedshields")) {
                        Fill.poly(unit.x, unit.y, 6, r);
                    } else {
                        Lines.stroke(1.5);
                        Draw.alpha(0.09);
                        Fill.poly(unit.x, unit.y, 6, options.radius);
                        Draw.alpha(1);
                        Lines.poly(unit.x, unit.y, 6, options.radius);
                    }
                }
            },
            copy() {
                return createAbility(options);
            },
        });
    };
    return createAbility;
})();
