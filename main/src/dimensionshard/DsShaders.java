package dimensionshard;

import arc.Core;
import arc.Events;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.gl.FrameBuffer;
import arc.graphics.gl.Shader;
import arc.scene.ui.layout.Scl;
import arc.util.Time;
import mindustry.Vars;
import mindustry.game.EventType;

import static arc.Core.graphics;

/**
 * ?
 *
 * @author abomb4 2023-01-02 21:41:57
 */
public class DsShaders {

    public static Shader powerNetShader;
    public static FrameBuffer effectBuffer = new FrameBuffer();

    public static void load() {
        powerNetShader = new Shader(
            Core.files.internal("shaders/screenspace.vert"),
            Vars.tree.get("shaders/powernet.frag")) {

            @Override
            public void apply() {
                setUniformf("u_dp", Scl.scl(1f));
                setUniformf("u_time", Time.time / Scl.scl(1f));
                setUniformf("u_offset",
                    Core.camera.position.x - Core.camera.width / 2,
                    Core.camera.position.y - Core.camera.height / 2);
                setUniformf("u_texsize", Core.camera.width, Core.camera.height);
                setUniformf("u_invsize", 1f / Core.camera.width, 1f / Core.camera.height);
            }
        };

        Events.run(EventType.Trigger.drawOver, () -> {
            final FrameBuffer effectBuffer = Vars.renderer.effectBuffer;
            effectBuffer.resize(graphics.getWidth(), graphics.getHeight());
            // effectBuffer.begin(Color.clear);
            Draw.drawRange(26f, () -> {
                effectBuffer.begin(Color.clear);
            }, () -> {
                effectBuffer.end();
                effectBuffer.blit(powerNetShader);
            });
        });
    }
}
