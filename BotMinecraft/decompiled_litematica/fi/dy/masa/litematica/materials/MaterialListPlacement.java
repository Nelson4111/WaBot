/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskCountBlocksPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;

public class MaterialListPlacement
extends MaterialListBase {
    private final SchematicPlacement placement;

    public MaterialListPlacement(SchematicPlacement placement) {
        this(placement, false);
    }

    public MaterialListPlacement(SchematicPlacement placement, boolean reCreate) {
        this.placement = placement;
        if (reCreate) {
            this.reCreateMaterialList();
        }
    }

    @Override
    public boolean supportsRenderLayers() {
        return true;
    }

    @Override
    public String getName() {
        return this.placement.getName();
    }

    @Override
    public String getTitle() {
        return StringUtils.translate((String)"litematica.gui.title.material_list.placement", (Object[])new Object[]{this.getName()});
    }

    @Override
    public void reCreateMaterialList() {
        boolean ignoreState = Configs.Generic.MATERIAL_LIST_IGNORE_STATE.getBooleanValue();
        TaskCountBlocksPlacement task = new TaskCountBlocksPlacement(this.placement, this, ignoreState);
        TaskScheduler.getInstanceClient().scheduleTask(task, 20);
        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
    }
}

