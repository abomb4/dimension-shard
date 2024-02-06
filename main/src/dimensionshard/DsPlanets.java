package dimensionshard;

import arc.Events;
import arc.graphics.Color;
import arc.math.geom.Vec3;
import dimensionshard.types.planets.Wrek;
import mindustry.Vars;
import mindustry.content.Planets;
import mindustry.game.EventType;
import mindustry.graphics.g3d.PlanetParams;
import mindustry.graphics.g3d.SunMesh;
import mindustry.type.Planet;

/**
 * @author abomb4 2022-12-26 23:48:23
 */
public class DsPlanets {

    /** sun -> nus */
    public static Planet nus;

    public static Planet wrek;

    public static void load() {
        nus = new Planet("nus", null, 4f) {
            {
                bloom = true;
                accessible = false;
                position = new Vec3(0, 0, 100f);

                meshLoader = () -> new SunMesh(
                    this, 4,
                    5, 0.3, 1.7, 1.2, 1,
                    1.1f,
                    Color.valueOf("ff2a08"),
                    Color.valueOf("ff4608"),
                    Color.valueOf("ff760c"),
                    Color.valueOf("ff760c"),
                    Color.valueOf("ff8331"),
                    Color.valueOf("ff8e4e")
                );
            }

            @Override
            public Vec3 addParentOffset(Vec3 in) {
                float distanceWithSun = Planets.sun.totalRadius + this.totalRadius + 10;
                Vec3 vec = Planets.sun.position.cpy().add(distanceWithSun, 0, 0);
                this.position.set(vec);
                return vec;
            }
        };

        // update solar system like sun
        Events.run(EventType.Trigger.update, () -> {
            updatePlanet(nus);
        });
        Events.run(EventType.Trigger.universeDraw, () -> {
            PlanetParams params = Vars.ui.planet.state;
            Planet tmp = params.solarSystem;
            params.solarSystem = nus;
            Vars.ui.planet.planets.renderPlanet(nus, params);
            Vars.ui.planet.planets.renderTransparent(nus, params);
            params.solarSystem = tmp;
        });

        wrek = new Wrek(nus);
    }

    public static void updatePlanet(Planet planet) {
        planet.position.setZero();
        planet.addParentOffset(planet.position);
        if (planet == nus) {
            float distanceWithSun = Planets.sun.totalRadius * 2;
            Vec3 vec = Planets.sun.position.cpy().add(distanceWithSun, 0, 0);
            nus.position.set(vec);
        }
        if (planet.parent != null) {
            planet.position.add(planet.parent.position);
        }
        for (Planet child : planet.children) {
            updatePlanet(child);
        }
    }
}
