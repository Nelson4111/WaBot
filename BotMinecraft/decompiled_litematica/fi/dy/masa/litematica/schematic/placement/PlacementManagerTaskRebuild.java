/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.util.WorldPlacingUtils;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.ProtoChunkSchematic;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.List;
import java.util.function.Supplier;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;

public class PlacementManagerTaskRebuild
extends PlacementManagerTask {
    private final Runnable task = this.buildTask();

    protected PlacementManagerTaskRebuild(Supplier<WorldSchematic> worldSupplier, int chunkX, int chunkZ) {
        super(worldSupplier, chunkX, chunkZ);
    }

    public void run() {
        this.task.run();
    }

    @Override
    protected Runnable buildTask() {
        return () -> {
            SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
            WorldSchematic worldSchematic = this.worldSupplier().get();
            ClientLevel level = Minecraft.getInstance().level;
            if (level == null) {
                PlacementManagerDaemonHandler.INSTANCE.clearAllTasks();
                return;
            }
            if (manager.getAllSchematicsTouchingChunk(this.pos()).isEmpty()) {
                PlacementManagerDaemonHandler.INSTANCE.removeAllTasksFor(this.cx(), this.cz());
                worldSchematic.getChunkSource().unloadChunk(this.cx(), this.cz());
                return;
            }
            if (manager.canHandleChunk(level, this.cx(), this.cz())) {
                if (worldSchematic.getChunkSource().hasChunk(this.cx(), this.cz())) {
                    worldSchematic.unloadEntitiesByChunk(this.cx(), this.cz());
                    worldSchematic.getChunkSource().unloadChunk(this.cx(), this.cz());
                    manager.setVisibleSubChunksNeedsUpdate();
                }
                worldSchematic.getChunkSource().loadChunk(this.cx(), this.cz());
                manager.setVisibleSubChunksNeedsUpdate();
            }
            if (worldSchematic.getChunkSource().hasChunk(this.cx(), this.cz())) {
                ProtoChunkSchematic protoChunk = new ProtoChunkSchematic(new ChunkSchematic(worldSchematic, this.pos()));
                List<SchematicPlacement> placements = manager.getAllSchematicsTouchingChunk(this.pos());
                protoChunk.setState(ChunkSchematicState.PROTO);
                if (!placements.isEmpty()) {
                    for (SchematicPlacement placement : placements) {
                        if (!placement.isEnabled()) continue;
                        WorldPlacingUtils.placeToProtoChunk(protoChunk, this.pos(), placement);
                    }
                    worldSchematic.unloadEntitiesByChunk(this.cx(), this.cz());
                    worldSchematic.getChunkSource().replaceChunk(this.cx(), this.cz(), protoChunk.getWrapped());
                    protoChunk.spawnAllEntitiesNow(worldSchematic);
                }
                protoChunk.clear();
                PlacementManagerDaemonHandler.INSTANCE.removeRebuildTasksFor(this.cx(), this.cz());
                worldSchematic.scheduleChunkRenders(this.cx(), this.cz());
                manager.setVisibleSubChunksNeedsUpdate();
            }
        };
    }
}

