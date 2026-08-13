/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Lists
 *  com.google.common.util.concurrent.FutureCallback
 *  com.google.common.util.concurrent.Futures
 *  com.google.common.util.concurrent.ListenableFuture
 *  com.google.common.util.concurrent.MoreExecutors
 *  javax.annotation.Nullable
 *  net.minecraft.CrashReport
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.ChunkPos
 *  org.apache.logging.log4j.Logger
 *  org.jetbrains.annotations.NotNull
 */
package fi.dy.masa.litematica.render.schematic;

import com.google.common.collect.Lists;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.MoreExecutors;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherBuffers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherLitematica;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuUploader;
import fi.dy.masa.litematica.render.schematic.ChunkRenderLayers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderTaskSchematic;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CancellationException;
import java.util.concurrent.Executor;
import javax.annotation.Nullable;
import net.minecraft.CrashReport;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.ChunkPos;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;

public class ChunkRenderWorkerLitematica {
    private static final Logger LOGGER = Litematica.LOGGER;
    private final ChunkRenderDispatcherLitematica chunkRenderDispatcher;

    public ChunkRenderWorkerLitematica(ChunkRenderDispatcherLitematica chunkRenderDispatcherIn) {
        this.chunkRenderDispatcher = chunkRenderDispatcherIn;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void processTask(final ChunkRenderTaskSchematic task) throws InterruptedException {
        task.getLock().lock();
        try {
            if (task.getStatus() != ChunkRenderTaskSchematic.Status.PENDING) {
                if (!task.isFinished()) {
                    LOGGER.warn("Chunk render task was {} when I expected it to be pending; ignoring task", (Object)task.getStatus());
                }
                return;
            }
            task.setStatus(ChunkRenderTaskSchematic.Status.COMPILING);
        }
        finally {
            task.getLock().unlock();
        }
        Entity entity = Minecraft.getInstance().getCameraEntity();
        if (entity == null) {
            task.finish();
        } else {
            ChunkRenderTaskSchematic.Type taskType = task.getType();
            final ChunkRenderDispatcherBuffers pack = this.chunkRenderDispatcher.allocateBufferPack();
            ChunkPos cp = task.getChunkPos();
            ChunkRenderGpuUploader uploader = LitematicaRenderer.getInstance().getWorldRenderer().getChunkRendererGpuDispatcher().addOrGetUploader(cp.x(), cp.z());
            if (taskType == ChunkRenderTaskSchematic.Type.REBUILD_CHUNK) {
                if (!uploader.isEmpty()) {
                    uploader.clear();
                }
                task.getRenderChunk().rebuildChunk(task, pack);
            } else if (taskType == ChunkRenderTaskSchematic.Type.RESORT_TRANSPARENCY) {
                task.getRenderChunk().resortTransparency(task, pack);
            }
            task.getLock().lock();
            try {
                if (task.getStatus() != ChunkRenderTaskSchematic.Status.COMPILING) {
                    if (!task.isFinished()) {
                        LOGGER.warn("Chunk render task was {} when I expected it to be compiling; aborting task", (Object)task.getStatus());
                    }
                    return;
                }
                task.setStatus(ChunkRenderTaskSchematic.Status.UPLOADING);
            }
            finally {
                task.getLock().unlock();
            }
            ArrayList futuresList = Lists.newArrayList();
            final ChunkRenderDataSchematic compiledChunk = task.getChunkRenderData();
            if (taskType == ChunkRenderTaskSchematic.Type.REBUILD_CHUNK) {
                for (ChunkSectionLayer layer : ChunkRenderLayers.BLOCK_RENDER_LAYERS) {
                    if (compiledChunk.isBlockLayerEmpty(layer)) continue;
                    futuresList.add(this.chunkRenderDispatcher.uploadChunkBlocks(layer, compiledChunk, pack, uploader, task.getDistanceSq(), false));
                }
                for (OverlayRenderType type : ChunkRenderLayers.TYPES) {
                    if (compiledChunk.isOverlayTypeEmpty(type)) continue;
                    futuresList.add(this.chunkRenderDispatcher.uploadChunkOverlay(type, compiledChunk, pack, uploader, task.getDistanceSq(), false));
                }
            } else if (taskType == ChunkRenderTaskSchematic.Type.RESORT_TRANSPARENCY) {
                ChunkSectionLayer layer = ChunkSectionLayer.TRANSLUCENT;
                if (!compiledChunk.isBlockLayerEmpty(layer)) {
                    futuresList.add(this.chunkRenderDispatcher.uploadChunkBlocks(layer, compiledChunk, pack, uploader, task.getDistanceSq(), true));
                }
                if (!compiledChunk.isOverlayTypeEmpty(OverlayRenderType.QUAD)) {
                    futuresList.add(this.chunkRenderDispatcher.uploadChunkOverlay(OverlayRenderType.QUAD, compiledChunk, pack, uploader, task.getDistanceSq(), true));
                }
            }
            final ListenableFuture listenablefuture = Futures.allAsList((Iterable)futuresList);
            task.addFinishRunnable(new Runnable(){
                {
                    Objects.requireNonNull(this$0);
                }

                @Override
                public void run() {
                    listenablefuture.cancel(false);
                }
            });
            Futures.addCallback((ListenableFuture)listenablefuture, (FutureCallback)new FutureCallback<List<Object>>(this){
                final /* synthetic */ ChunkRenderWorkerLitematica this$0;
                {
                    ChunkRenderWorkerLitematica chunkRenderWorkerLitematica = this$0;
                    Objects.requireNonNull(chunkRenderWorkerLitematica);
                    this.this$0 = chunkRenderWorkerLitematica;
                }

                public void onSuccess(@Nullable List<Object> list) {
                    block6: {
                        this.this$0.chunkRenderDispatcher.freeBufferPack(pack);
                        task.getLock().lock();
                        try {
                            if (task.getStatus() == ChunkRenderTaskSchematic.Status.UPLOADING) {
                                task.setStatus(ChunkRenderTaskSchematic.Status.DONE);
                                break block6;
                            }
                            if (!task.isFinished()) {
                                LOGGER.warn("Chunk render task was {} when I expected it to be uploading; aborting task", (Object)task.getStatus());
                            }
                        }
                        finally {
                            task.getLock().unlock();
                        }
                        return;
                    }
                    task.getRenderChunk().updateChunkRenderData(compiledChunk);
                }

                public void onFailure(@NotNull Throwable throwable) {
                    this.this$0.chunkRenderDispatcher.freeBufferPack(pack);
                    if (!(throwable instanceof CancellationException) && !(throwable instanceof InterruptedException)) {
                        Minecraft.getInstance().delayCrash(CrashReport.forThrowable((Throwable)throwable, (String)"Rendering Litematica chunk"));
                    }
                }
            }, (Executor)MoreExecutors.directExecutor());
        }
    }
}

