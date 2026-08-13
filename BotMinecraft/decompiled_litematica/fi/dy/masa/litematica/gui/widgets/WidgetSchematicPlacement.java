/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.ButtonOnOff
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.client.input.MouseButtonEvent
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiPlacementConfiguration;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListSchematicPlacements;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.ButtonOnOff;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;

public class WidgetSchematicPlacement
extends WidgetListEntryBase<SchematicPlacement> {
    public final SchematicPlacementManager manager;
    public final WidgetListSchematicPlacements parent;
    public final SchematicPlacement placement;
    public final boolean isOdd;
    public int buttonsStartX;

    public WidgetSchematicPlacement(int x, int y, int width, int height, boolean isOdd, SchematicPlacement placement, int listIndex, WidgetListSchematicPlacements parent) {
        super(x, y, width, height, (Object)placement, listIndex);
        this.parent = parent;
        this.placement = placement;
        this.isOdd = isOdd;
        this.manager = DataManager.getSchematicPlacementManager();
        int posX = x + width - 2;
        int posY = y + 1;
        posX = this.createButtonGeneric(posX, posY, ButtonListener.ButtonType.REMOVE);
        posX = this.createButtonOnOff(posX, posY, this.placement.isEnabled(), ButtonListener.ButtonType.TOGGLE_ENABLED);
        this.buttonsStartX = posX = this.createButtonGeneric(posX, posY, ButtonListener.ButtonType.CONFIGURE);
    }

    public int createButtonGeneric(int xRight, int y, ButtonListener.ButtonType type) {
        return ((ButtonGeneric)this.addButton((ButtonBase)new ButtonGeneric(xRight, y, -1, true, type.getDisplayName(), new Object[0]), new ButtonListener(type, this))).getX() - 1;
    }

    public int createButtonOnOff(int xRight, int y, boolean isCurrentlyOn, ButtonListener.ButtonType type) {
        ButtonOnOff button = new ButtonOnOff(xRight, y, -1, true, type.getTranslationKey(), isCurrentlyOn, new String[0]);
        return ((ButtonOnOff)this.addButton((ButtonBase)button, new ButtonListener(type, this))).getX() - 2;
    }

    public boolean canSelectAt(MouseButtonEvent click) {
        return click.x() < (double)this.buttonsStartX && super.canSelectAt(click);
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        boolean placementSelected;
        boolean bl = placementSelected = this.manager.getSelectedSchematicPlacement() == this.placement;
        if (selected || placementSelected || this.isMouseOver(mouseX, mouseY)) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1603243920);
        } else if (this.isOdd) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1609560048);
        } else {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1607454672);
        }
        if (placementSelected) {
            RenderUtils.drawOutline((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-2039584);
        }
        String name = this.placement.getName();
        String pre = this.placement.isEnabled() ? GuiBase.TXT_GREEN : GuiBase.TXT_RED;
        this.drawString(ctx, this.x + 20, this.y + 7, -1, pre + name);
        Icons icon = this.placement.getSchematic().getFile() != null ? Icons.SCHEMATIC_TYPE_FILE : Icons.SCHEMATIC_TYPE_MEMORY;
        icon.renderAt(ctx, this.x + 2, this.y + 5, this.zLevel, false, false);
        if (this.placement.isRegionPlacementModified()) {
            icon = Icons.NOTICE_EXCLAMATION_11;
            icon.renderAt(ctx, this.buttonsStartX - 13, this.y + 6, this.zLevel, false, false);
        }
        if (this.placement.isLocked()) {
            icon = Icons.LOCK_LOCKED;
            icon.renderAt(ctx, this.buttonsStartX - 26, this.y + 6, this.zLevel, false, false);
        }
        super.render(ctx, mouseX, mouseY, placementSelected);
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.placement.isLocked() && GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)(this.x + this.buttonsStartX - 38), (int)(this.y + 6), (int)11, (int)11)) {
            String str = StringUtils.translate((String)"litematica.hud.schematic_placement.hover_info.placement_locked", (Object[])new Object[0]);
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, (List)ImmutableList.of((Object)str));
        } else if (this.placement.isRegionPlacementModified() && GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)(this.x + this.buttonsStartX - 25), (int)(this.y + 6), (int)11, (int)11)) {
            String str = StringUtils.translate((String)"litematica.hud.schematic_placement.hover_info.placement_modified", (Object[])new Object[0]);
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, (List)ImmutableList.of((Object)str));
        } else if (GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)this.x, (int)this.y, (int)(this.buttonsStartX - 18), (int)this.height)) {
            Path schematicFile = this.placement.getSchematic().getFile();
            String fileName = schematicFile != null ? schematicFile.getFileName().toString() : StringUtils.translate((String)"litematica.gui.label.schematic_placement.in_memory", (Object[])new Object[0]);
            ArrayList<String> text = new ArrayList<String>();
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.schematic_name", (Object[])new Object[]{this.placement.getSchematic().getMetadata().getName()}));
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.schematic_file", (Object[])new Object[]{fileName}));
            BlockPos o = this.placement.getOrigin();
            String strOrigin = String.format("x: %d, y: %d, z: %d", o.getX(), o.getY(), o.getZ());
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.origin", (Object[])new Object[]{strOrigin}));
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.sub_region_count", (Object[])new Object[]{String.valueOf(this.placement.getSubRegionCount())}));
            Vec3i size = this.placement.getSchematic().getTotalSize();
            String strSize = String.format("%d x %d x %d", size.getX(), size.getY(), size.getZ());
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_placement.enclosing_size", (Object[])new Object[]{strSize}));
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, text);
        }
    }

    public record ButtonListener(ButtonType type, WidgetSchematicPlacement widget) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == ButtonType.CONFIGURE) {
                GuiPlacementConfiguration gui = new GuiPlacementConfiguration(this.widget.placement);
                gui.setParent((Screen)this.widget.parent.getParentGui());
                GuiBase.openGui((Screen)gui);
            } else if (this.type == ButtonType.REMOVE) {
                if (this.widget.placement.isLocked() && !GuiBase.isShiftDown()) {
                    this.widget.parent.getParentGui().addMessage(Message.MessageType.ERROR, "litematica.error.schematic_placements.remove_fail_locked", new Object[0]);
                } else {
                    this.widget.manager.removeSchematicPlacement(this.widget.placement);
                    this.widget.parent.refreshEntries();
                }
            } else if (this.type == ButtonType.TOGGLE_ENABLED) {
                this.widget.placement.toggleEnabled();
                this.widget.parent.refreshEntries();
            }
        }

        public static enum ButtonType {
            CONFIGURE("litematica.gui.button.schematic_placements.configure"),
            REMOVE("litematica.gui.button.schematic_placements.remove"),
            TOGGLE_ENABLED("litematica.gui.button.schematic_placements.placement_enabled");

            private final String translationKey;

            private ButtonType(String translationKey) {
                this.translationKey = translationKey;
            }

            public String getTranslationKey() {
                return this.translationKey;
            }

            public String getDisplayName() {
                return StringUtils.translate((String)this.translationKey, (Object[])new Object[0]);
            }
        }
    }
}

