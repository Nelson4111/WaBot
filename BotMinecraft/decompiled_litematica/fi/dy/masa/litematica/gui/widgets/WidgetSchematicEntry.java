/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Position
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.SchematicHolder;
import fi.dy.masa.litematica.gui.GuiSchematicSave;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListLoadedSchematics;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Position;

public class WidgetSchematicEntry
extends WidgetListEntryBase<LitematicaSchematic> {
    private final WidgetListLoadedSchematics parent;
    private final LitematicaSchematic schematic;
    private final int typeIconX;
    private final int typeIconY;
    private final boolean isOdd;
    private final int buttonsStartX;

    public WidgetSchematicEntry(int x, int y, int width, int height, boolean isOdd, LitematicaSchematic schematic, int listIndex, WidgetListLoadedSchematics parent) {
        super(x, y, width, height, (Object)schematic, listIndex);
        this.parent = parent;
        this.schematic = schematic;
        this.isOdd = isOdd;
        int posX = x + width;
        posX -= this.addButton(posX, ++y, ButtonListener.Type.UNLOAD);
        posX -= this.addButton(posX, y, ButtonListener.Type.RELOAD);
        posX -= this.addButton(posX, y, ButtonListener.Type.SAVE_TO_FILE);
        posX -= this.addButton(posX, y, ButtonListener.Type.CREATE_PLACEMENT);
        this.buttonsStartX = posX;
        this.typeIconX = this.x + 2;
        this.typeIconY = y + 4;
    }

    private int addButton(int x, int y, ButtonListener.Type type) {
        ButtonListener listener = new ButtonListener(type, this);
        ButtonGeneric button = new ButtonGeneric(x, y, -1, true, type.getDisplayName(), new Object[0]);
        if (type.getHoverKey() != null) {
            button.setHoverStrings(new String[]{type.getHoverKey()});
        }
        this.addButton((ButtonBase)button, listener);
        return button.getWidth() + 2;
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (selected || this.isMouseOver(mouseX, mouseY)) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x70FFFFFF);
        } else if (this.isOdd) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x20FFFFFF);
        } else {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x50FFFFFF);
        }
        boolean modified = this.schematic.getMetadata().wasModifiedSinceSaved();
        String schematicName = this.schematic.getMetadata().getName();
        int color = modified ? -28656 : -1;
        this.drawString(ctx, this.x + 20, this.y + 7, color, schematicName);
        Path schematicFile = this.schematic.getFile();
        String fileName = schematicFile != null ? schematicFile.getFileName().toString() : null;
        Icons icon = fileName != null ? Icons.SCHEMATIC_TYPE_FILE : Icons.SCHEMATIC_TYPE_MEMORY;
        icon.renderAt(ctx, this.typeIconX, this.typeIconY, this.zLevel, false, false);
        if (modified) {
            Icons.NOTICE_EXCLAMATION_11.renderAt(ctx, this.buttonsStartX - 13, this.y + 6, this.zLevel, false, false);
        }
        this.drawSubWidgets(ctx, mouseX, mouseY);
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.schematic.getMetadata().wasModifiedSinceSaved() && GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)(this.buttonsStartX - 13), (int)(this.y + 6), (int)11, (int)11)) {
            String str = WidgetFileBrowserBase.DATE_FORMAT.format(new Date(this.schematic.getMetadata().getTimeModified()));
            ImmutableList strs = ImmutableList.of((Object)StringUtils.translate((String)"litematica.gui.label.loaded_schematic.modified_on", (Object[])new Object[]{str}));
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, (List)strs);
        } else if (GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)this.x, (int)this.y, (int)(this.buttonsStartX - 12), (int)this.height)) {
            String fileName;
            ArrayList<String> lines = new ArrayList<String>();
            Path schematicFile = this.schematic.getFile();
            String string = fileName = schematicFile != null ? schematicFile.getFileName().toString() : null;
            if (fileName != null) {
                lines.add(fileName);
            } else {
                lines.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.in_memory", (Object[])new Object[0]));
            }
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, lines);
        }
        super.postRenderHovered(ctx, mouseX, mouseY, selected);
    }

    private record ButtonListener(Type type, WidgetSchematicEntry widget) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == Type.CREATE_PLACEMENT && ((WidgetSchematicEntry)this.widget).mc.player != null) {
                BlockPos pos = BlockPos.containing((Position)((WidgetSchematicEntry)this.widget).mc.player.position());
                LitematicaSchematic entry = this.widget.schematic;
                String name = entry.getMetadata().getName();
                boolean enabled = !GuiBase.isShiftDown();
                SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
                SchematicPlacement placement = SchematicPlacement.createFor(entry, pos, name, enabled, enabled);
                manager.addSchematicPlacement(placement, true);
                manager.setSelectedSchematicPlacement(placement);
            } else if (this.type == Type.SAVE_TO_FILE) {
                GuiSchematicSave gui = new GuiSchematicSave(this.widget.schematic);
                gui.setParent(GuiUtils.getCurrentScreen());
                GuiBase.openGui((Screen)gui);
            } else if (this.type == Type.RELOAD) {
                boolean result = this.widget.schematic.readFromFile();
                if (result) {
                    SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
                    manager.getAllPlacementsOfSchematic(this.widget.schematic).forEach(manager::markChunksForRebuild);
                }
            } else if (this.type == Type.UNLOAD) {
                SchematicHolder.getInstance().removeSchematic(this.widget.schematic);
                this.widget.parent.refreshEntries();
            }
        }

        public static enum Type {
            CREATE_PLACEMENT("litematica.gui.button.create_placement"),
            RELOAD("litematica.gui.button.reload", "litematica.gui.button.hover.schematic_list.reload_schematic"),
            SAVE_TO_FILE("litematica.gui.button.save_to_file"),
            UNLOAD("litematica.gui.button.unload");

            private final String translationKey;
            @Nullable
            private final String hoverKey;

            private Type(String translationKey) {
                this(translationKey, null);
            }

            private Type(String translationKey, String hoverKey) {
                this.translationKey = translationKey;
                this.hoverKey = hoverKey;
            }

            @Nullable
            public String getHoverKey() {
                return this.hoverKey;
            }

            public String getDisplayName() {
                return StringUtils.translate((String)this.translationKey, (Object[])new Object[0]);
            }
        }
    }
}

