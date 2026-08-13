/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskCountBlocksArea;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;

public class MaterialListAreaAnalyzer
extends MaterialListBase {
    private final AreaSelection selection;

    public MaterialListAreaAnalyzer(AreaSelection selection) {
        this.selection = selection;
    }

    @Override
    public String getName() {
        return this.selection.getName();
    }

    @Override
    public String getTitle() {
        return StringUtils.translate((String)"litematica.gui.title.material_list.area_analyzer", (Object[])new Object[]{this.getName()});
    }

    @Override
    public void reCreateMaterialList() {
        TaskCountBlocksArea task = new TaskCountBlocksArea(this.selection, this);
        TaskScheduler.getInstanceClient().scheduleTask(task, 20);
        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
    }
}

