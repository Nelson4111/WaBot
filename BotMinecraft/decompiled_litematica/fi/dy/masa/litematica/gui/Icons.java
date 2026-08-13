/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  javax.annotation.Nullable
 *  net.minecraft.resources.Identifier
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import java.nio.file.Path;
import javax.annotation.Nullable;
import net.minecraft.resources.Identifier;

public enum Icons implements IGuiIcon,
IFileBrowserIconProvider
{
    DUMMY(0, 0, 0, 0),
    BUTTON_PLUS_MINUS_8(0, 0, 8, 8),
    BUTTON_PLUS_MINUS_12(24, 0, 12, 12),
    BUTTON_PLUS_MINUS_16(0, 128, 16, 16),
    ENCLOSING_BOX_ENABLED(0, 144, 16, 16),
    ENCLOSING_BOX_DISABLED(0, 160, 16, 16),
    FILE_ICON_LITEMATIC(144, 0, 12, 12),
    FILE_ICON_SCHEMATIC(144, 12, 12, 12),
    FILE_ICON_SPONGE_SCH(144, 24, 12, 12),
    FILE_ICON_VANILLA(144, 36, 12, 12),
    FILE_ICON_JSON(144, 48, 12, 12),
    FILE_ICON_TEXT(144, 60, 12, 12),
    FILE_ICON_DIR(156, 0, 12, 12),
    FILE_ICON_DIR_UP(156, 12, 12, 12),
    FILE_ICON_DIR_ROOT(156, 24, 12, 12),
    FILE_ICON_SEARCH(156, 36, 12, 12),
    FILE_ICON_CREATE_DIR(156, 48, 12, 12),
    SCHEMATIC_TYPE_FILE(144, 0, 12, 12),
    SCHEMATIC_TYPE_MEMORY(186, 0, 12, 12),
    INFO_11(168, 18, 11, 11),
    NOTICE_EXCLAMATION_11(168, 29, 11, 11),
    LOCK_LOCKED(168, 51, 11, 11),
    CHECKBOX_UNSELECTED(198, 0, 11, 11),
    CHECKBOX_SELECTED(198, 11, 11, 11),
    ARROW_UP(209, 0, 15, 15),
    ARROW_DOWN(209, 15, 15, 15);

    public static final Identifier TEXTURE;
    private final int u;
    private final int v;
    private final int w;
    private final int h;

    private Icons(int u, int v, int w, int h) {
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
        RenderUtils.drawTexturedRect((GuiContext)ctx, (Identifier)this.getTexture(), (int)x, (int)y, (int)this.u, (int)this.v, (int)this.w, (int)this.h, (float)zLevel);
    }

    public Identifier getTexture() {
        return TEXTURE;
    }

    public IGuiIcon getIconRoot() {
        return FILE_ICON_DIR_ROOT;
    }

    public IGuiIcon getIconUp() {
        return FILE_ICON_DIR_UP;
    }

    public IGuiIcon getIconCreateDirectory() {
        return FILE_ICON_CREATE_DIR;
    }

    public IGuiIcon getIconSearch() {
        return FILE_ICON_SEARCH;
    }

    public IGuiIcon getIconDirectory() {
        return FILE_ICON_DIR;
    }

    @Nullable
    public IGuiIcon getIconForFile(Path file) {
        if (this == DUMMY) {
            return null;
        }
        FileType fileType = FileType.fromFile(file);
        return switch (fileType) {
            case FileType.LITEMATICA_SCHEMATIC -> FILE_ICON_LITEMATIC;
            case FileType.SCHEMATICA_SCHEMATIC -> FILE_ICON_SCHEMATIC;
            case FileType.VANILLA_STRUCTURE -> FILE_ICON_VANILLA;
            case FileType.SPONGE_SCHEMATIC -> FILE_ICON_SPONGE_SCH;
            case FileType.JSON -> FILE_ICON_JSON;
            case FileType.TEXT -> FILE_ICON_TEXT;
            default -> DUMMY;
        };
    }

    static {
        TEXTURE = Identifier.fromNamespaceAndPath((String)"litematica", (String)"textures/gui/gui_widgets.png");
    }
}

