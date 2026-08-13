/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.widgets.WidgetListSchematicPlacements;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nullable;

public class GuiSchematicPlacementsList
extends GuiListBase<SchematicPlacement, WidgetSchematicPlacement, WidgetListSchematicPlacements>
implements ISelectionListener<SchematicPlacement> {
    public final SchematicPlacementManager manager;

    public GuiSchematicPlacementsList() {
        super(12, 30);
        this.title = StringUtils.translate((String)"litematica.gui.title.manage_schematic_placements", (Object[])new Object[0]);
        this.manager = DataManager.getSchematicPlacementManager();
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 64;
    }

    public void initGui() {
        super.initGui();
        int x = 12;
        int y = this.getScreenHeight() - 26;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.LOADED_SCHEMATICS;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 30;
        ButtonGeneric button = new ButtonGeneric(x, y, buttonWidth, 20, label, (IGuiIcon)type.getIcon(), new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        buttonWidth = this.getStringWidth(label) + 20;
        x = this.getScreenWidth() - buttonWidth - 10;
        button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
    }

    public void onSelectionChange(@Nullable SchematicPlacement entry) {
        this.manager.setSelectedSchematicPlacement(entry != this.manager.getSelectedSchematicPlacement() ? entry : null);
    }

    protected ISelectionListener<SchematicPlacement> getSelectionListener() {
        return this;
    }

    protected WidgetListSchematicPlacements createListWidget(int listX, int listY) {
        return new WidgetListSchematicPlacements(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), this);
    }
}

