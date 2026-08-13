/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  javax.annotation.Nullable
 *  net.minecraft.commands.arguments.blocks.BlockStateParser
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.AABB
 */
package fi.dy.masa.litematica.scheduler.tasks;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkMultiPhase;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.commands.arguments.blocks.BlockStateParser;
import net.minecraft.core.BlockPos;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.Container;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.AABB;

public class TaskFillArea
extends TaskProcessChunkMultiPhase {
    protected final String fillCommand;
    protected final BlockState fillState;
    protected final String blockString;
    @Nullable
    protected final BlockState replaceState;
    @Nullable
    protected final String replaceBlockString;
    protected final int maxBoxVolume;
    protected final boolean removeEntities;
    protected final String useStrict;

    public TaskFillArea(List<Box> boxes, BlockState fillState, @Nullable BlockState replaceState, boolean removeEntities) {
        this(boxes, fillState, replaceState, removeEntities, "litematica.gui.label.task_name.fill");
    }

    protected TaskFillArea(List<Box> boxes, BlockState fillState, @Nullable BlockState replaceState, boolean removeEntities, String nameOnHud) {
        super(nameOnHud);
        this.fillState = fillState;
        this.replaceState = replaceState;
        this.removeEntities = removeEntities;
        this.maxBoxVolume = Configs.Generic.COMMAND_FILL_MAX_VOLUME.getIntegerValue();
        this.maxCommandsPerTick = Configs.Generic.COMMAND_LIMIT.getIntegerValue();
        this.fillCommand = Configs.Generic.COMMAND_NAME_FILL.getStringValue();
        this.useStrict = Configs.Generic.COMMAND_USE_STRICT.getBooleanValue() ? " strict" : "";
        this.blockString = BlockStateParser.serialize((BlockState)fillState);
        this.replaceBlockString = replaceState != null ? BlockStateParser.serialize((BlockState)replaceState) : null;
        this.processBoxBlocksTask = this::sendQueuedCommands;
        if (Configs.Generic.COMMAND_FILL_NO_CHUNK_CLAMP.getBooleanValue()) {
            this.addNonChunkClampedBoxes(boxes);
        } else {
            this.addPerChunkBoxes(boxes);
        }
    }

    @Override
    public boolean canExecute() {
        return super.canExecute() && this.blockString != null;
    }

    @Override
    protected boolean canProcessChunk(ChunkPos pos) {
        return this.areSurroundingChunksLoaded(pos, this.clientWorld, 0);
    }

    @Override
    public void init() {
        super.init();
        if (this.useWorldEdit && this.isInWorld()) {
            this.sendCommand("/perf neighbors off");
        }
    }

    @Override
    public boolean execute(ProfilerFiller profiler) {
        return this.executeMultiPhase(profiler);
    }

    @Override
    protected void onNextChunkFetched(ChunkPos pos) {
        if (this.isClientWorld) {
            this.queueCommandsForBoxesInChunk(pos);
        } else {
            this.directFillBoxesInChunk(pos);
        }
    }

    protected void queueCommandsForBoxesInChunk(ChunkPos pos) {
        for (IntBoundingBox box : this.getBoxesInChunk(pos)) {
            this.queueFillCommandsForBox(box, this.removeEntities);
        }
        this.phase = TaskProcessChunkMultiPhase.TaskPhase.PROCESS_BOX_BLOCKS;
    }

    protected void directFillBoxesInChunk(ChunkPos pos) {
        for (IntBoundingBox box : this.getBoxesInChunk(pos)) {
            this.directFillBox(box, this.removeEntities);
        }
        this.finishProcessingChunk(pos);
    }

    protected void directFillBox(IntBoundingBox box, boolean removeEntities) {
        if (removeEntities) {
            TaskFillArea.directRemoveEntities(box, this.world);
        }
        WorldUtils.setShouldPreventBlockUpdates(this.world, true);
        BlockState barrier = Blocks.BARRIER.defaultBlockState();
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        for (int z = box.minZ(); z <= box.maxZ(); ++z) {
            for (int x = box.minX(); x <= box.maxX(); ++x) {
                for (int y = box.maxY(); y >= box.minY(); --y) {
                    posMutable.set(x, y, z);
                    BlockState oldState = this.world.getBlockState((BlockPos)posMutable);
                    if ((this.replaceState != null || oldState == this.fillState) && oldState != this.replaceState) continue;
                    BlockEntity te = this.world.getBlockEntity((BlockPos)posMutable);
                    if (te instanceof Container) {
                        ((Container)te).clearContent();
                        this.world.setBlock((BlockPos)posMutable, barrier, 50);
                    }
                    this.world.setBlock((BlockPos)posMutable, this.fillState, 50);
                }
            }
        }
        WorldUtils.setShouldPreventBlockUpdates(this.world, false);
    }

    public static void directRemoveEntities(IntBoundingBox box, Level world) {
        AABB aabb = new AABB((double)box.minX(), (double)box.minY(), (double)box.minZ(), (double)(box.maxX() + 1), (double)(box.maxY() + 1), (double)(box.maxZ() + 1));
        List entities = world.getEntities((Entity)null, aabb, EntityUtils.NOT_PLAYER);
        for (Entity entity : entities) {
            if (entity instanceof Player) continue;
            entity.discard();
        }
    }

    protected void queueFillCommandsForBox(IntBoundingBox box, boolean removeEntities) {
        int totalVolume;
        AABB aabb;
        if (removeEntities && this.world.getEntities((Entity)this.mc.player, aabb = new AABB((double)box.minX(), (double)box.minY(), (double)box.minZ(), (double)(box.maxX() + 1), (double)(box.maxY() + 1), (double)(box.maxZ() + 1)), EntityUtils.NOT_PLAYER).size() > 0) {
            String killCmd = String.format("kill @e[type=!player,x=%d,y=%d,z=%d,dx=%d,dy=%d,dz=%d]", box.minX(), box.minY(), box.minZ(), box.maxX() - box.minX() + 1, box.maxY() - box.minY() + 1, box.maxZ() - box.minZ() + 1);
            this.queuedCommands.offer(killCmd);
        }
        if ((totalVolume = (box.maxX() - box.minX() + 1) * (box.maxY() - box.minY() + 1) * (box.maxZ() - box.minZ() + 1)) <= this.maxBoxVolume || this.useWorldEdit) {
            this.queueFillCommandForBox(box.minX(), box.minY(), box.minZ(), box.maxX(), box.maxY(), box.maxZ());
        } else {
            int singleLayerVolume = (box.maxX() - box.minX() + 1) * (box.maxZ() - box.minZ() + 1);
            int singleBoxHeight = this.maxBoxVolume / singleLayerVolume;
            if (singleBoxHeight < 1) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"Error: Calculated single box height was less than 1 block", (Object[])new Object[0]);
                return;
            }
            for (int y = box.minY(); y <= box.maxY(); y += singleBoxHeight) {
                int maxY = Math.min(y + singleBoxHeight - 1, box.maxY());
                this.queueFillCommandForBox(box.minX(), y, box.minZ(), box.maxX(), maxY, box.maxZ());
            }
        }
    }

    protected void queueFillCommandForBox(int minX, int minY, int minZ, int maxX, int maxY, int maxZ) {
        if (this.useWorldEdit) {
            this.queuedCommands.offer(String.format("/pos1 %d,%d,%d", minX, minY, minZ));
            this.queuedCommands.offer(String.format("/pos2 %d,%d,%d", maxX, maxY, maxZ));
            if (this.replaceState != null) {
                this.queuedCommands.offer(String.format("/replace %s %s", this.replaceBlockString, this.blockString));
            } else {
                this.queuedCommands.offer("/set " + this.blockString);
            }
        } else {
            String fillCmd = this.replaceState != null ? String.format("%s %d %d %d %d %d %d %s replace %s%s", this.fillCommand, minX, minY, minZ, maxX, maxY, maxZ, this.blockString, this.replaceBlockString, this.useStrict) : String.format("%s %d %d %d %d %d %d %s%s", this.fillCommand, minX, minY, minZ, maxX, maxY, maxZ, this.blockString, this.useStrict);
            this.queuedCommands.offer(fillCmd);
        }
    }

    @Override
    protected void onStop() {
        this.printCompletionMessage();
        this.sendTaskEndCommands();
        DataManager.removeChatListener(this.gameRuleListener);
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        super.onStop();
    }

    protected void printCompletionMessage() {
        if (this.finished) {
            if (this.printCompletionMessage) {
                InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.area_filled", (Object[])new Object[0]);
            }
        } else {
            InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.area_fill_fail", (Object[])new Object[0]);
        }
    }
}

