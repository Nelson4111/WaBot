/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.HudAlignment
 *  net.minecraft.client.gui.GuiGraphicsExtractor
 */
package fi.dy.masa.litematica.render.infohud;

import fi.dy.masa.litematica.render.infohud.RenderPhase;
import fi.dy.masa.malilib.config.HudAlignment;
import java.util.List;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public interface IInfoHudRenderer {
    public boolean getShouldRenderText(RenderPhase var1);

    default public boolean getShouldRenderCustom() {
        return false;
    }

    default public boolean shouldRenderInGuis() {
        return false;
    }

    public List<String> getText(RenderPhase var1);

    default public int render(GuiGraphicsExtractor drawContext, int xOffset, int yOffset, HudAlignment alignment) {
        return 0;
    }
}

