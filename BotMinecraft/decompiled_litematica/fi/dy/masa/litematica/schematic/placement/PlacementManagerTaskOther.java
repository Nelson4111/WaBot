/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.function.Supplier;
import javax.annotation.Nonnull;

public class PlacementManagerTaskOther
extends PlacementManagerTask {
    private final Runnable task;

    public PlacementManagerTaskOther(Supplier<WorldSchematic> worldSupplier, int chunkX, int chunkZ, @Nonnull Runnable task) {
        super(worldSupplier, chunkX, chunkZ);
        this.task = task;
        if (worldSupplier == null || worldSupplier.get() == null) {
            this.finish();
        }
    }

    public void run() {
        if (!this.isFinished()) {
            this.task.run();
        }
    }

    @Override
    protected Runnable buildTask() {
        return this.task;
    }
}

