/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.InfoUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskDeleteArea;
import fi.dy.masa.litematica.scheduler.tasks.TaskDeleteBlocksByPlacement;
import fi.dy.masa.litematica.scheduler.tasks.TaskFillArea;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.tool.ToolModeData;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PlacementDeletionMode;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.InfoUtils;
import java.util.Collection;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.block.state.BlockState;

public class ToolUtils {
    public static void fillSelectionVolumes(Minecraft mc, BlockState state, @Nullable BlockState stateToReplace) {
        if (mc.player != null && EntityUtils.isCreativeMode((Player)mc.player)) {
            AreaSelection area = DataManager.getSelectionManager().getCurrentSelection();
            if (area == null) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_area_selected", (Object[])new Object[0]);
                return;
            }
            if (area.getAllSubRegionBoxes().size() > 0) {
                Box currentBox = area.getSelectedSubRegionBox();
                ImmutableList boxes = currentBox != null ? ImmutableList.of((Object)currentBox) : ImmutableList.copyOf(area.getAllSubRegionBoxes());
                TaskFillArea task = new TaskFillArea((List<Box>)boxes, state, stateToReplace, false);
                int interval = Configs.Generic.COMMAND_TASK_INTERVAL.getIntegerValue();
                TaskScheduler.getServerInstanceIfExistsOrClient().scheduleTask(task, interval);
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.empty_area_selection", (Object[])new Object[0]);
            }
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.generic.creative_mode_only", (Object[])new Object[0]);
        }
    }

    public static void deleteSelectionVolumes(boolean removeEntities, Minecraft mc) {
        AreaSelection area = null;
        if (DataManager.getToolMode() == ToolMode.DELETE && ToolModeData.DELETE.getUsePlacement()) {
            SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
            if (placement != null) {
                area = AreaSelection.fromPlacement(placement);
            }
        } else {
            area = DataManager.getSelectionManager().getCurrentSelection();
        }
        ToolUtils.deleteSelectionVolumes(area, removeEntities, mc);
    }

    public static void deleteSelectionVolumes(@Nullable AreaSelection area, boolean removeEntities, Minecraft mc) {
        ToolUtils.deleteSelectionVolumes(area, removeEntities, null, mc);
    }

    public static void deleteSelectionVolumes(@Nullable AreaSelection area, boolean removeEntities, @Nullable ICompletionListener listener, Minecraft mc) {
        if (mc.player != null && EntityUtils.isCreativeMode((Player)mc.player)) {
            if (area == null) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_area_selected", (Object[])new Object[0]);
                return;
            }
            if (area.getAllSubRegionBoxes().size() > 0) {
                Box currentBox = area.getSelectedSubRegionBox();
                ImmutableList boxes = currentBox != null ? ImmutableList.of((Object)currentBox) : ImmutableList.copyOf(area.getAllSubRegionBoxes());
                TaskDeleteArea task = new TaskDeleteArea((List<Box>)boxes, removeEntities);
                if (listener != null) {
                    task.setCompletionListener(listener);
                }
                int interval = Configs.Generic.COMMAND_TASK_INTERVAL.getIntegerValue();
                TaskScheduler.getServerInstanceIfExistsOrClient().scheduleTask(task, interval);
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.empty_area_selection", (Object[])new Object[0]);
            }
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.generic.creative_mode_only", (Object[])new Object[0]);
        }
    }

    public static void deleteBlocksByPlacement() {
        if (DataManager.getToolMode() == ToolMode.DELETE && ToolModeData.DELETE.getUsePlacement()) {
            SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
            if (placement != null) {
                PlacementDeletionMode mode = (PlacementDeletionMode)Configs.Generic.SCHEMATIC_VCS_DELETE_MODE.getOptionListValue();
                ToolUtils.deleteBlocksByPlacement(placement, mode, null);
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_placement_selected", (Object[])new Object[0]);
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"Select a placement either by looking at one in the world, holding the tool item and using the \u00a7etoolSelectElements\u00a7r hotkey (middle click by default), or alternatively by clicking on a placement in the Schematic Placements menu, so that it has the white outline indicating it's selected. The selected placement's name will also appear on the Tool HUD.", (Object[])new Object[0]);
            }
        }
    }

    public static void deleteBlocksByPlacement(SchematicPlacement placement, PlacementDeletionMode mode, @Nullable ICompletionListener listener) {
        int interval = Configs.Generic.COMMAND_TASK_INTERVAL.getIntegerValue();
        TaskDeleteBlocksByPlacement task = new TaskDeleteBlocksByPlacement((Collection<SchematicPlacement>)ImmutableList.of((Object)placement), mode, DataManager.getRenderLayerRange());
        if (listener != null) {
            task.setCompletionListener(listener);
        }
        TaskScheduler.getServerInstanceIfExistsOrClient().scheduleTask(task, interval);
        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
    }
}

