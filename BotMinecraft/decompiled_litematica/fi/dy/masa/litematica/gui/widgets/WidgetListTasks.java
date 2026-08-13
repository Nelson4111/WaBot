/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListBase
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.gui.widgets.WidgetTaskEntry;
import fi.dy.masa.litematica.scheduler.ITask;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import java.util.ArrayList;
import java.util.Collection;
import javax.annotation.Nullable;

public class WidgetListTasks
extends WidgetListBase<ITask, WidgetTaskEntry> {
    public WidgetListTasks(int x, int y, int width, int height, @Nullable ISelectionListener<ITask> selectionListener) {
        super(x, y, width, height, selectionListener);
        this.browserEntryHeight = 22;
    }

    protected Collection<ITask> getAllEntries() {
        ArrayList<ITask> list = new ArrayList<ITask>();
        list.addAll((Collection<ITask>)TaskScheduler.getInstanceClient().getAllTasks());
        list.addAll((Collection<ITask>)TaskScheduler.getInstanceServer().getAllTasks());
        return list;
    }

    protected WidgetTaskEntry createListEntryWidget(int x, int y, int listIndex, boolean isOdd, ITask entry) {
        return new WidgetTaskEntry(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, entry, listIndex, this);
    }
}

