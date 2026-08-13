/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.gui.widgets.WidgetListTasks;
import fi.dy.masa.litematica.scheduler.ITask;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;

public class WidgetTaskEntry
extends WidgetListEntryBase<ITask> {
    private final WidgetListTasks parent;
    private final boolean isOdd;

    public WidgetTaskEntry(int x, int y, int width, int height, boolean isOdd, ITask task, int listIndex, WidgetListTasks parent) {
        super(x, y, width, height, (Object)task, listIndex);
        this.parent = parent;
        this.isOdd = isOdd;
        int posX = x + width;
        ButtonListener listener = new ButtonListener(ButtonListener.Type.REMOVE, this);
        this.addButton((ButtonBase)new ButtonGeneric(posX, y + 1, -1, true, StringUtils.translate((String)"litematica.gui.button.remove", (Object[])new Object[0]), new Object[0]), listener);
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (selected || this.isMouseOver(mouseX, mouseY)) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x70FFFFFF);
        } else if (this.isOdd) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x20FFFFFF);
        } else {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)0x50FFFFFF);
        }
        String name = ((ITask)this.getEntry()).getDisplayName();
        this.drawString(ctx, this.x + 4, this.y + 7, -1, name);
        this.drawSubWidgets(ctx, mouseX, mouseY);
    }

    private record ButtonListener(Type type, WidgetTaskEntry widget) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == Type.REMOVE) {
                ITask task = (ITask)this.widget.getEntry();
                if (!TaskScheduler.getInstanceClient().removeTask(task)) {
                    TaskScheduler.getInstanceServer().removeTask(task);
                }
                this.widget.parent.refreshEntries();
            }
        }

        public static enum Type {
            REMOVE;

        }
    }
}

