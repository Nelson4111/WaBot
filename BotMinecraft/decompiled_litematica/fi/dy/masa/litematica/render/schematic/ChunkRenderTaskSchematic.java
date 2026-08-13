/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Lists
 *  com.google.common.primitives.Doubles
 *  javax.annotation.Nonnull
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.phys.Vec3
 *  org.apache.logging.log4j.Logger
 */
package fi.dy.masa.litematica.render.schematic;

import com.google.common.collect.Lists;
import com.google.common.primitives.Doubles;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRendererSchematicVbo;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import javax.annotation.Nonnull;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.phys.Vec3;
import org.apache.logging.log4j.Logger;

public class ChunkRenderTaskSchematic
implements Comparable<ChunkRenderTaskSchematic> {
    private final Logger LOGGER = Litematica.LOGGER;
    private final AtomicReference<ChunkRendererSchematicVbo> chunkRenderer;
    private final AtomicReference<ChunkRenderDataSchematic> chunkRenderData;
    private final Type type;
    private final List<Runnable> listFinishRunnables;
    private final ReentrantLock lock;
    private final Supplier<Vec3> cameraPosSupplier;
    private final double distanceSq;
    private Status status;
    private boolean finished;

    public ChunkRenderTaskSchematic(@Nonnull ChunkRendererSchematicVbo renderChunkIn, Type typeIn, Supplier<Vec3> cameraPosSupplier, double distanceSqIn) {
        this.type = typeIn;
        this.listFinishRunnables = Lists.newArrayList();
        this.lock = new ReentrantLock();
        this.cameraPosSupplier = cameraPosSupplier;
        this.distanceSq = distanceSqIn;
        this.status = Status.PENDING;
        this.chunkRenderer = new AtomicReference<ChunkRendererSchematicVbo>(renderChunkIn);
        this.chunkRenderData = new AtomicReference<ChunkRenderDataSchematic>(new ChunkRenderDataSchematic());
    }

    public Supplier<Vec3> getCameraPosSupplier() {
        return this.cameraPosSupplier;
    }

    public Status getStatus() {
        return this.status;
    }

    protected ChunkRendererSchematicVbo getRenderChunk() {
        return this.chunkRenderer.get();
    }

    protected ChunkRenderDataSchematic getChunkRenderData() {
        if (this.chunkRenderData.get() == null || this.chunkRenderData.get().isEmpty()) {
            this.updateChunkRenderData(this.getRenderChunk().getChunkRenderData());
        }
        return this.chunkRenderData.get();
    }

    protected ChunkPos getChunkPos() {
        return this.getRenderChunk().getChunkPos();
    }

    protected void updateChunkRenderData(ChunkRenderDataSchematic data) {
        this.lock.lock();
        try {
            ChunkRenderDataSchematic oldData;
            if (!data.isEmpty() && (oldData = this.chunkRenderData.getAndSet(data)) != null) {
                oldData.clearAll();
            }
        }
        finally {
            this.lock.unlock();
        }
    }

    protected void setStatus(Status statusIn) {
        this.lock.lock();
        try {
            this.status = statusIn;
        }
        finally {
            this.lock.unlock();
        }
    }

    protected void finish() {
        this.lock.lock();
        try {
            if (this.type == Type.REBUILD_CHUNK && this.status != Status.DONE) {
                this.chunkRenderer.get().setNeedsUpdate(false);
            }
            this.finished = true;
            this.status = Status.DONE;
            for (Runnable runnable : this.listFinishRunnables) {
                runnable.run();
            }
        }
        finally {
            this.lock.unlock();
        }
    }

    protected void addFinishRunnable(Runnable runnable) {
        this.lock.lock();
        try {
            this.listFinishRunnables.add(runnable);
            if (this.finished) {
                runnable.run();
            }
        }
        finally {
            this.lock.unlock();
        }
    }

    public ReentrantLock getLock() {
        return this.lock;
    }

    protected Type getType() {
        return this.type;
    }

    protected boolean isFinished() {
        return this.finished;
    }

    @Override
    public int compareTo(ChunkRenderTaskSchematic other) {
        return Doubles.compare((double)this.distanceSq, (double)other.distanceSq);
    }

    public double getDistanceSq() {
        return this.distanceSq;
    }

    public static enum Type {
        REBUILD_CHUNK,
        RESORT_TRANSPARENCY;

    }

    public static enum Status {
        PENDING,
        COMPILING,
        UPLOADING,
        DONE;

    }
}

