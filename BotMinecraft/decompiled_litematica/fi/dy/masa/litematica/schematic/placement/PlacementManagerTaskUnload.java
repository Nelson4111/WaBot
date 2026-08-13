/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.function.Supplier;

@Deprecated
public class PlacementManagerTaskUnload
extends PlacementManagerTask {
    private final Runnable task = this.buildTask();

    protected PlacementManagerTaskUnload(Supplier<WorldSchematic> worldSupplier, int chunkX, int chunkZ) {
        super(worldSupplier, chunkX, chunkZ);
    }

    public void run() {
        this.task.run();
    }

    @Override
    protected Runnable buildTask() {
        return () -> {
            WorldSchematic worldSchematic = this.worldSupplier().get();
            SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
            if (worldSchematic.getChunkSource().hasChunk(this.cx(), this.cz())) {
                PlacementManagerDaemonHandler.INSTANCE.removeAllTasksFor(this.cx(), this.cz());
                worldSchematic.unloadEntitiesByChunk(this.cx(), this.cz());
                worldSchematic.getChunkSource().unloadChunk(this.cx(), this.cz());
                manager.setVisibleSubChunksNeedsUpdate();
            }
        };
    }
}

