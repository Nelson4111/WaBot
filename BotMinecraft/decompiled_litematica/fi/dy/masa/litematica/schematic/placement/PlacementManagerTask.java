/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.thread.ThreadTaskBase
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.thread.ThreadTaskBase;
import java.util.function.Supplier;
import net.minecraft.world.level.ChunkPos;

public abstract class PlacementManagerTask
extends ThreadTaskBase {
    private final Supplier<WorldSchematic> worldSupplier;
    private final int chunkX;
    private final int chunkZ;
    private final ChunkPos chunkPos;
    private final Long chunkLong;

    protected PlacementManagerTask(Supplier<WorldSchematic> worldSupplier, int chunkX, int chunkZ) {
        this.worldSupplier = worldSupplier;
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.chunkPos = new ChunkPos(chunkX, chunkZ);
        this.chunkLong = this.chunkPos.pack();
    }

    protected PlacementManagerTask(Supplier<WorldSchematic> worldSupplier, ChunkPos chunkPos) {
        this.worldSupplier = worldSupplier;
        this.chunkX = chunkPos.x();
        this.chunkZ = chunkPos.z();
        this.chunkPos = chunkPos;
        this.chunkLong = chunkPos.pack();
    }

    protected PlacementManagerTask(Supplier<WorldSchematic> worldSupplier, Long longPos) {
        this.worldSupplier = worldSupplier;
        this.chunkX = ChunkPos.getX((long)longPos);
        this.chunkZ = ChunkPos.getZ((long)longPos);
        this.chunkPos = new ChunkPos(this.chunkX, this.chunkZ);
        this.chunkLong = longPos;
    }

    protected Supplier<WorldSchematic> worldSupplier() {
        return this.worldSupplier;
    }

    protected int cx() {
        return this.chunkX;
    }

    protected int cz() {
        return this.chunkZ;
    }

    protected ChunkPos pos() {
        return this.chunkPos;
    }

    protected Long asLong() {
        return this.chunkLong;
    }

    protected abstract Runnable buildTask();
}

