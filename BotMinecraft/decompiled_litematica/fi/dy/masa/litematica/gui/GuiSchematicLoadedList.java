/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.widgets.WidgetListLoadedSchematics;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicEntry;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.util.StringUtils;

public class GuiSchematicLoadedList
extends GuiListBase<LitematicaSchematic, WidgetSchematicEntry, WidgetListLoadedSchematics> {
    public GuiSchematicLoadedList() {
        super(12, 30);
        this.title = StringUtils.translate((String)"litematica.gui.title.manage_loaded_schematics", (Object[])new Object[0]);
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 68;
    }

    public void initGui() {
        super.initGui();
        int x = 12;
        int y = this.getScreenHeight() - 26;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.LOAD_SCHEMATICS;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 30;
        ButtonGeneric button = new ButtonGeneric(x, y, buttonWidth, 20, label, (IGuiIcon)type.getIcon(), new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        x += buttonWidth + 4;
        type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PLACEMENTS;
        label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        buttonWidth = this.getStringWidth(label) + 30;
        button = new ButtonGeneric(x, y, buttonWidth, 20, label, (IGuiIcon)type.getIcon(), new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        buttonWidth = this.getStringWidth(label) + 20;
        x = this.getScreenWidth() - buttonWidth - 10;
        button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
    }

    protected WidgetListLoadedSchematics createListWidget(int listX, int listY) {
        return new WidgetListLoadedSchematics(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), null);
    }
}

