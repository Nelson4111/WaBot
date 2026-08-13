/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.widgets.WidgetListTasks;
import fi.dy.masa.litematica.gui.widgets.WidgetTaskEntry;
import fi.dy.masa.litematica.scheduler.ITask;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.util.StringUtils;

public class GuiTaskManager
extends GuiListBase<ITask, WidgetTaskEntry, WidgetListTasks> {
    public GuiTaskManager() {
        super(12, 30);
        this.title = StringUtils.translate((String)"litematica.gui.title.task_manager", (Object[])new Object[0]);
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 68;
    }

    public void initGui() {
        super.initGui();
        int y = this.getScreenHeight() - 26;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        ButtonGeneric button = new ButtonGeneric(this.getScreenWidth() - 10, y, -1, true, StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]), new Object[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
    }

    protected WidgetListTasks createListWidget(int listX, int listY) {
        return new WidgetListTasks(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), null);
    }
}

