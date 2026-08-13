/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ArrayListMultimap
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  net.minecraft.client.server.IntegratedServer
 *  net.minecraft.util.Util
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.ArrayListMultimap;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkBase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.util.SchematicPlacingUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.Collection;
import net.minecraft.client.server.IntegratedServer;
import net.minecraft.util.Util;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.level.ChunkPos;

public class TaskPasteSchematicPerChunkDirect
extends TaskPasteSchematicPerChunkBase {
    private final ArrayListMultimap<ChunkPos, SchematicPlacement> placementsPerChunk = ArrayListMultimap.create();

    public TaskPasteSchematicPerChunkDirect(Collection<SchematicPlacement> placements, LayerRange range, boolean changedBlocksOnly) {
        super(placements, range, changedBlocksOnly);
    }

    @Override
    public boolean canExecute() {
        return super.canExecute() && this.mc.hasSingleplayerServer() && this.world != null && !this.world.isClientSide();
    }

    @Override
    protected void onChunkAddedForHandling(ChunkPos pos, SchematicPlacement placement) {
        super.onChunkAddedForHandling(pos, placement);
        this.placementsPerChunk.put((Object)pos, (Object)placement);
    }

    @Override
    public boolean execute(ProfilerFiller profiler) {
        long currentTime;
        long elapsedTickTime;
        if (this.ignoreBlocks && this.ignoreEntities) {
            return true;
        }
        profiler.push("per_chunk_paste");
        IntegratedServer server = this.mc.getSingleplayerServer();
        if (server == null) {
            return true;
        }
        long vanillaTickTime = server.getTickTimesNanos()[server.getTickCount() % 100];
        long timeStart = Util.getNanos();
        this.sortChunkList();
        for (int chunkIndex = 0; chunkIndex < this.pendingChunks.size() && (elapsedTickTime = vanillaTickTime + ((currentTime = Util.getNanos()) - timeStart)) < 60000000L; ++chunkIndex) {
            profiler.push("process_chunk");
            ChunkPos pos = (ChunkPos)this.pendingChunks.get(chunkIndex);
            if (this.canProcessChunk(pos) && this.processChunk(pos)) {
                this.pendingChunks.remove(chunkIndex);
                --chunkIndex;
            }
            profiler.pop();
        }
        if (this.pendingChunks.isEmpty()) {
            this.finished = true;
            profiler.pop();
            return true;
        }
        this.updateInfoHudLines();
        profiler.pop();
        return false;
    }

    @Override
    protected boolean processChunk(ChunkPos pos) {
        ArrayList placements = new ArrayList(this.placementsPerChunk.get((Object)pos));
        for (SchematicPlacement placement : placements) {
            if (!SchematicPlacingUtils.placeToWorldWithinChunk(this.world, pos, placement, this.replace, this.layerBehavior, false)) continue;
            this.placementsPerChunk.remove((Object)pos, (Object)placement);
        }
        return !this.placementsPerChunk.containsKey((Object)pos);
    }

    @Override
    protected void onStop() {
        if (this.finished) {
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.schematic_pasted", (Object[])new Object[0]);
        } else {
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.schematic_paste_failed", (Object[])new Object[0]);
        }
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        super.onStop();
    }
}

