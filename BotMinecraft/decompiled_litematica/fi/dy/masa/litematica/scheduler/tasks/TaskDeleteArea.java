/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  net.minecraft.world.level.block.Blocks
 */
package fi.dy.masa.litematica.scheduler.tasks;

import fi.dy.masa.litematica.scheduler.tasks.TaskFillArea;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import java.util.List;
import net.minecraft.world.level.block.Blocks;

public class TaskDeleteArea
extends TaskFillArea {
    public TaskDeleteArea(List<Box> boxes, boolean removeEntities) {
        super(boxes, Blocks.AIR.defaultBlockState(), null, removeEntities, "litematica.gui.label.task_name.delete");
    }

    @Override
    protected void printCompletionMessage() {
        if (this.finished) {
            if (this.printCompletionMessage) {
                InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.area_cleared", (Object[])new Object[0]);
            }
        } else {
            InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.area_deletion_aborted", (Object[])new Object[0]);
        }
    }
}

