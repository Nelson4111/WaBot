/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  net.minecraft.resources.Identifier
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import net.minecraft.resources.Identifier;

public enum ButtonIcons implements IGuiIcon
{
    AREA_EDITOR(102, 70, 14, 14),
    AREA_SELECTION(102, 0, 14, 14),
    CONFIGURATION(102, 84, 14, 14),
    LOADED_SCHEMATICS(102, 14, 14, 14),
    SCHEMATIC_BROWSER(102, 28, 14, 14),
    SCHEMATIC_MANAGER(102, 56, 14, 14),
    SCHEMATIC_PLACEMENTS(102, 42, 14, 14),
    SCHEMATIC_PROJECTS(102, 98, 14, 14),
    TASK_MANAGER(102, 112, 14, 14);

    public static final Identifier TEXTURE;
    private final int u;
    private final int v;
    private final int w;
    private final int h;

    private ButtonIcons(int u, int v, int w, int h) {
        this.u = u;
        this.v = v;
        this.w = w;
        this.h = h;
    }

    public int getWidth() {
        return this.w;
    }

    public int getHeight() {
        return this.h;
    }

    public int getU() {
        return this.u;
    }

    public int getV() {
        return this.v;
    }

    public void renderAt(GuiContext ctx, int x, int y, float zLevel, boolean enabled, boolean selected) {
        int u = this.u;
        if (enabled) {
            u += this.w;
        }
        if (selected) {
            u += this.w;
        }
        RenderUtils.drawTexturedRect((GuiContext)ctx, (Identifier)this.getTexture(), (int)x, (int)y, (int)u, (int)this.v, (int)this.w, (int)this.h, (float)zLevel);
    }

    public Identifier getTexture() {
        return TEXTURE;
    }

    static {
        TEXTURE = Identifier.fromNamespaceAndPath((String)"litematica", (String)"textures/gui/gui_widgets.png");
    }
}

