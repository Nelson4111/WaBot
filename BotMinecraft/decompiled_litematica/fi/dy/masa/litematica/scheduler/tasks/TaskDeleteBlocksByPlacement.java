/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  net.minecraft.commands.arguments.blocks.BlockStateParser
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.Container
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  org.jetbrains.annotations.NotNull
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskFillArea;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkMultiPhase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.PlacementDeletionMode;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.Collection;
import java.util.Set;
import java.util.function.Consumer;
import net.minecraft.commands.arguments.blocks.BlockStateParser;
import net.minecraft.core.BlockPos;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.Container;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.NotNull;

public class TaskDeleteBlocksByPlacement
extends TaskProcessChunkMultiPhase {
    protected static final BlockState AIR = Blocks.AIR.defaultBlockState();
    protected final ImmutableList<@NotNull SchematicPlacement> placements;
    protected final LayerRange layerRange;
    protected final PlacementDeletionMode mode;
    protected final String setBlockCommand;
    protected final String blockString;
    protected long blockCount;
    protected String useStrict;

    public TaskDeleteBlocksByPlacement(Collection<SchematicPlacement> placements, PlacementDeletionMode mode, LayerRange layerRange) {
        super("Delete Blocks");
        this.placements = ImmutableList.copyOf(placements);
        this.mode = mode;
        this.layerRange = layerRange;
        this.setBlockCommand = Configs.Generic.COMMAND_NAME_SETBLOCK.getStringValue();
        this.useStrict = Configs.Generic.COMMAND_USE_STRICT.getBooleanValue() ? " strict" : "";
        this.blockString = BlockStateParser.serialize((BlockState)Blocks.AIR.defaultBlockState());
        this.processBoxBlocksTask = this::sendQueuedCommands;
    }

    @Override
    public boolean canExecute() {
        return super.canExecute() && this.schematicWorld != null;
    }

    protected void onChunkAddedForHandling(ChunkPos pos, SchematicPlacement placement) {
    }

    protected void addPlacement(SchematicPlacement placement, LayerRange range) {
        Set<ChunkPos> touchedChunks = placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        for (ChunkPos pos : touchedChunks) {
            int count = 0;
            for (IntBoundingBox box : placement.getBoxesWithinChunk(pos.x(), pos.z()).values()) {
                if ((box = PositionUtils.getClampedBox(box, range)) == null || (box = PositionUtils.clampBoxToWorldHeightRange(box, (Level)this.clientWorld)) == null) continue;
                this.boxesInChunks.put((Object)pos, (Object)box);
                ++count;
            }
            if (count <= 0) continue;
            this.onChunkAddedForHandling(pos, placement);
        }
    }

    @Override
    public void init() {
        if (this.useWorldEdit && this.isInWorld()) {
            this.sendCommand("/perf neighbors off");
        }
        for (SchematicPlacement placement : this.placements) {
            this.addPlacement(placement, this.layerRange);
        }
        this.pendingChunks.clear();
        this.pendingChunks.addAll(this.boxesInChunks.keySet());
        this.sortChunkList();
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
            this.directRemoveBoxesInChunk(pos);
        }
    }

    protected void queueCommandsForBoxesInChunk(ChunkPos pos) {
        for (IntBoundingBox box : this.getBoxesInChunk(pos)) {
            this.removeEntitiesByCommand(box);
            this.removeBlocksInBox(box, this.mode, this::removeBlockByCommand);
        }
        this.phase = TaskProcessChunkMultiPhase.TaskPhase.PROCESS_BOX_BLOCKS;
    }

    protected void directRemoveBoxesInChunk(ChunkPos pos) {
        for (IntBoundingBox box : this.getBoxesInChunk(pos)) {
            TaskFillArea.directRemoveEntities(box, this.world);
            this.removeBlocksInBox(box, this.mode, this::removeBlockDirect);
        }
        this.finishProcessingChunk(pos);
    }

    protected void removeBlocksInBox(IntBoundingBox box, PlacementDeletionMode mode, Consumer<BlockPos> removeFunc) {
        BlockCheck check = this.getCheckFor(mode);
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        for (int y = box.maxY(); y >= box.minY(); --y) {
            for (int x = box.minX(); x <= box.maxX(); ++x) {
                for (int z = box.minZ(); z <= box.maxZ(); ++z) {
                    posMutable.set(x, y, z);
                    if (this.world.getBlockState((BlockPos)posMutable) == AIR || !check.shouldDelete((BlockPos)posMutable, this.schematicWorld, this.world)) continue;
                    removeFunc.accept((BlockPos)posMutable);
                    this.removeBlockDirect((BlockPos)posMutable);
                    ++this.blockCount;
                }
            }
        }
    }

    protected void removeBlockDirect(BlockPos pos) {
        BlockEntity te = this.world.getBlockEntity(pos);
        if (te instanceof Container) {
            ((Container)te).clearContent();
            this.world.setBlock(pos, Blocks.BARRIER.defaultBlockState(), 50);
        }
        this.world.setBlock(pos, Blocks.AIR.defaultBlockState(), 50);
    }

    protected void removeEntitiesByCommand(IntBoundingBox box) {
        String killCmd = String.format("kill @e[type=!player,x=%d,y=%d,z=%d,dx=%d,dy=%d,dz=%d]", box.minX(), box.minY(), box.minZ(), box.maxX() - box.minX() + 1, box.maxY() - box.minY() + 1, box.maxZ() - box.minZ() + 1);
        this.queuedCommands.offer(killCmd);
    }

    protected void removeBlockByCommand(BlockPos pos) {
        if (this.useWorldEdit) {
            this.queuedCommands.offer(String.format("/pos1 %d,%d,%d", pos.getX(), pos.getY(), pos.getZ()));
            this.queuedCommands.offer(String.format("/pos2 %d,%d,%d", pos.getX(), pos.getY(), pos.getZ()));
            this.queuedCommands.offer("/set " + this.blockString);
        } else {
            String cmdName = this.setBlockCommand;
            String fillCommand = String.format("%s %d %d %d %s%s", cmdName, pos.getX(), pos.getY(), pos.getZ(), this.blockString, this.useStrict);
            this.queuedCommands.offer(fillCommand);
        }
    }

    protected BlockCheck getCheckFor(PlacementDeletionMode mode) {
        return switch (mode) {
            case PlacementDeletionMode.MATCHING_BLOCK -> (pos, sw, w) -> {
                BlockState stateSchematic = sw.getBlockState(pos);
                return stateSchematic != AIR && stateSchematic == w.getBlockState(pos);
            };
            case PlacementDeletionMode.NON_MATCHING_BLOCK -> (pos, sw, w) -> {
                BlockState stateSchematic = sw.getBlockState(pos);
                return stateSchematic != AIR && stateSchematic != w.getBlockState(pos);
            };
            case PlacementDeletionMode.ANY_SCHEMATIC_BLOCK -> (pos, sw, w) -> sw.getBlockState(pos) != Blocks.AIR.defaultBlockState();
            case PlacementDeletionMode.NO_SCHEMATIC_BLOCK -> (pos, sw, w) -> sw.getBlockState(pos) == Blocks.AIR.defaultBlockState();
            default -> (pos, sw, w) -> true;
        };
    }

    @Override
    protected boolean canProcessChunk(ChunkPos pos) {
        if (!this.schematicWorld.getChunkSource().hasChunk(pos.x(), pos.z())) {
            return false;
        }
        return this.areSurroundingChunksLoaded(pos, this.clientWorld, 1);
    }

    @Override
    protected void onStop() {
        if (this.finished) {
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)String.format("Deleted %d blocks", this.blockCount), (Object[])new Object[0]);
        } else {
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.ERROR, (String)"Deletion task failed", (Object[])new Object[0]);
        }
        this.sendTaskEndCommands();
        DataManager.removeChatListener(this.gameRuleListener);
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        super.onStop();
    }

    protected static interface BlockCheck {
        public boolean shouldDelete(BlockPos var1, Level var2, Level var3);
    }
}

