/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Queues
 *  com.google.common.primitives.Doubles
 *  com.google.common.util.concurrent.Futures
 *  com.google.common.util.concurrent.ListenableFuture
 *  com.google.common.util.concurrent.ListenableFutureTask
 *  com.mojang.blaze3d.vertex.ByteBufferBuilder
 *  com.mojang.blaze3d.vertex.ByteBufferBuilder$Result
 *  com.mojang.blaze3d.vertex.MeshData
 *  com.mojang.blaze3d.vertex.MeshData$SortState
 *  com.mojang.blaze3d.vertex.VertexSorting
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.world.phys.Vec3
 *  org.apache.logging.log4j.Logger
 */
package fi.dy.masa.litematica.render.schematic;

import com.google.common.collect.Queues;
import com.google.common.primitives.Doubles;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListenableFutureTask;
import com.mojang.blaze3d.vertex.ByteBufferBuilder;
import com.mojang.blaze3d.vertex.MeshData;
import com.mojang.blaze3d.vertex.VertexSorting;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.render.schematic.ChunkMeshDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherBuffers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuUploader;
import fi.dy.masa.litematica.render.schematic.ChunkRenderTaskSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderWorkerLitematica;
import fi.dy.masa.litematica.render.schematic.ChunkRendererSchematicVbo;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import java.util.Queue;
import java.util.concurrent.PriorityBlockingQueue;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.world.phys.Vec3;
import org.apache.logging.log4j.Logger;

public class ChunkRenderDispatcherLitematica {
    private static final Logger LOGGER = Litematica.LOGGER;
    private final PriorityBlockingQueue<ChunkRenderTaskSchematic> queueChunkUpdates = Queues.newPriorityBlockingQueue();
    private final Queue<PendingUpload> queueChunkUploads = Queues.newPriorityQueue();
    private final Queue<ChunkRenderDispatcherBuffers> freeBufferPacks = Queues.newConcurrentLinkedQueue();
    private final ChunkRenderWorkerLitematica renderWorker;
    private Vec3 cameraPos = Vec3.ZERO;

    protected ChunkRenderDispatcherLitematica() {
        this.renderWorker = new ChunkRenderWorkerLitematica(this);
    }

    protected ChunkRenderDispatcherBuffers allocateBufferPack() {
        ChunkRenderDispatcherBuffers pack = this.freeBufferPacks.poll();
        return pack != null ? pack : new ChunkRenderDispatcherBuffers();
    }

    protected void freeBufferPack(ChunkRenderDispatcherBuffers pack) {
        pack.reset();
        this.freeBufferPacks.offer(pack);
    }

    protected void setCameraPosition(Vec3 cameraPos) {
        this.cameraPos = cameraPos;
    }

    public Vec3 getCameraPos() {
        return this.cameraPos;
    }

    protected String getDebugInfo() {
        return String.format("pC: %03d, aB: %1d", this.queueChunkUpdates.size(), this.freeBufferPacks.size());
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected boolean runChunkUploads(long finishTimeNano) {
        boolean processedTask;
        boolean ranTasks = false;
        do {
            processedTask = false;
            ChunkRenderTaskSchematic generator = this.queueChunkUpdates.poll();
            if (generator != null) {
                try {
                    this.renderWorker.processTask(generator);
                    processedTask = true;
                }
                catch (InterruptedException e) {
                    LOGGER.warn("runChunkUploads(): Process Interrupted; error message: [{}]", (Object)e.getLocalizedMessage());
                }
            }
            Queue<PendingUpload> queue = this.queueChunkUploads;
            synchronized (queue) {
                if (!this.queueChunkUploads.isEmpty()) {
                    PendingUpload upload = this.queueChunkUploads.poll();
                    if (upload != null) {
                        upload.uploadTask.run();
                        processedTask = true;
                    }
                    ranTasks = true;
                }
            }
        } while (finishTimeNano != 0L && processedTask && finishTimeNano >= System.nanoTime());
        return ranTasks;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected boolean updateChunkLater(ChunkRendererSchematicVbo renderChunk) {
        boolean flag1;
        renderChunk.getLockCompileTask().lock();
        try {
            ChunkRenderTaskSchematic generator = renderChunk.makeCompileTaskChunkSchematic(this::getCameraPos);
            generator.addFinishRunnable(() -> this.queueChunkUpdates.remove(generator));
            boolean flag = this.queueChunkUpdates.offer(generator);
            if (!flag) {
                generator.finish();
            }
            flag1 = flag;
        }
        finally {
            renderChunk.getLockCompileTask().unlock();
        }
        return flag1;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected boolean updateChunkNow(ChunkRendererSchematicVbo chunkRenderer) {
        boolean flag;
        chunkRenderer.getLockCompileTask().lock();
        try {
            ChunkRenderTaskSchematic generator = chunkRenderer.makeCompileTaskChunkSchematic(this::getCameraPos);
            try {
                this.renderWorker.processTask(generator);
            }
            catch (InterruptedException interruptedException) {
                // empty catch block
            }
            flag = true;
        }
        finally {
            chunkRenderer.getLockCompileTask().unlock();
        }
        return flag;
    }

    protected void stopChunkUpdates() {
        this.clearChunkUpdates();
        this.runChunkUploads(Long.MAX_VALUE);
    }

    protected ChunkRenderTaskSchematic getNextChunkUpdate() throws InterruptedException {
        return this.queueChunkUpdates.take();
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected boolean updateTransparencyLater(ChunkRendererSchematicVbo renderChunk) {
        boolean flag;
        renderChunk.getLockCompileTask().lock();
        try {
            ChunkRenderTaskSchematic generator = renderChunk.makeCompileTaskTransparencySchematic(this::getCameraPos);
            if (generator == null) {
                boolean flag2;
                boolean bl = flag2 = true;
                return bl;
            }
            generator.addFinishRunnable(() -> this.queueChunkUpdates.remove(generator));
            flag = this.queueChunkUpdates.offer(generator);
        }
        finally {
            renderChunk.getLockCompileTask().unlock();
        }
        return flag;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected ListenableFuture<Object> uploadChunkBlocks(ChunkSectionLayer layer, ChunkRenderDataSchematic compiledChunk, ChunkRenderDispatcherBuffers pack, ChunkRenderGpuUploader uploader, double distanceSq, boolean resortOnly) {
        if (Minecraft.getInstance().isSameThread()) {
            try {
                this.uploadVertexBufferByBlockLayer(layer, compiledChunk, pack, uploader, uploader.createVertexSorter(this.getCameraPos(), uploader.origin()), resortOnly);
            }
            catch (Exception e) {
                LOGGER.warn("uploadChunkBlocks(): [Dispatch] Error uploading Vertex Buffer for layer [{}], Caught error: [{}]", (Object)layer.label(), (Object)e.toString());
            }
            return Futures.immediateFuture(null);
        }
        ListenableFutureTask futureTask = ListenableFutureTask.create(() -> {
            try {
                this.uploadVertexBufferByBlockLayer(layer, compiledChunk, pack, uploader, uploader.createVertexSorter(this.getCameraPos(), uploader.origin()), resortOnly);
            }
            catch (Exception e) {
                LOGGER.error("uploadChunkBlocks() -> [Dispatch] uploadVertexBufferByBlockLayer: Exception: {}", (Object)e.getLocalizedMessage());
            }
        }, null);
        Queue<PendingUpload> queue = this.queueChunkUploads;
        synchronized (queue) {
            this.queueChunkUploads.add(new PendingUpload((ListenableFutureTask<Object>)futureTask, distanceSq));
            return futureTask;
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected ListenableFuture<Object> uploadChunkOverlay(OverlayRenderType type, ChunkRenderDataSchematic compiledChunk, ChunkRenderDispatcherBuffers pack, ChunkRenderGpuUploader uploader, double distanceSq, boolean resortOnly) {
        if (Minecraft.getInstance().isSameThread()) {
            try {
                this.uploadVertexBufferByType(type, compiledChunk, pack, uploader, uploader.createVertexSorter(this.getCameraPos(), uploader.origin()), resortOnly);
            }
            catch (Exception e) {
                LOGGER.error("uploadChunkOverlay(): [Dispatch] Error uploading Vertex Buffer for overlay type [{}], Caught error: [{}]", (Object)type.name(), (Object)e.toString());
            }
            return Futures.immediateFuture(null);
        }
        ListenableFutureTask futureTask = ListenableFutureTask.create(() -> {
            try {
                this.uploadVertexBufferByType(type, compiledChunk, pack, uploader, uploader.createVertexSorter(this.getCameraPos(), uploader.origin()), resortOnly);
            }
            catch (Exception e) {
                LOGGER.error("uploadChunkOverlay() -> [Dispatch] uploadVertexBufferByType: Exception: {}", (Object)e.getLocalizedMessage());
            }
        }, null);
        Queue<PendingUpload> queue = this.queueChunkUploads;
        synchronized (queue) {
            this.queueChunkUploads.add(new PendingUpload((ListenableFutureTask<Object>)futureTask, distanceSq));
            return futureTask;
        }
    }

    private void uploadVertexBufferByBlockLayer(ChunkSectionLayer layer, ChunkRenderDataSchematic compiledChunk, ChunkRenderDispatcherBuffers pack, ChunkRenderGpuUploader uploader, VertexSorting sorter, boolean resortOnly) throws InterruptedException {
        ByteBufferBuilder allocator = pack.allocatorCache().getAllocator(layer);
        ChunkMeshDataSchematic chunkMeshData = compiledChunk.getMeshDataCache();
        MeshData meshData = chunkMeshData.getMeshDataOrNull(layer);
        boolean useResorting = Configs.Visuals.RENDER_ENABLE_TRANSLUCENT_RESORTING.getBooleanValue();
        if (allocator == null) {
            LOGGER.error("[Dispatch] uploadVertexBufferByBlockLayer layer [{}] --> ALLOC NULL", (Object)layer.label());
            pack.allocatorCache().closeByBlockLayer(layer);
            compiledChunk.setBlockLayerUnused(layer);
            throw new InterruptedException("BufferAllocators are invalid");
        }
        if (meshData == null) {
            LOGGER.error("[Dispatch] uploadVertexBufferByBlockLayer layer [{}] --> MESHDATA NULL", (Object)layer.label());
            compiledChunk.setBlockLayerUnused(layer);
            return;
        }
        if (!resortOnly) {
            uploader.uploadBuffersByLayer(layer, meshData, useResorting);
        }
        if (layer == ChunkSectionLayer.TRANSLUCENT && useResorting) {
            ByteBufferBuilder.Result result;
            MeshData.SortState sorting = chunkMeshData.getTransparentSortingDataForBlockLayer(layer);
            if (sorting == null) {
                sorting = meshData.sortQuads(allocator, sorter);
                if (sorting == null) {
                    LOGGER.error("[Dispatch] uploadVertexBufferByBlockLayer layer [{}] --> SORT FAILURE", (Object)layer.label());
                    throw new InterruptedException("Sort State failed to sortQuads()");
                }
                chunkMeshData.setTransparentSortingDataForBlockLayer(layer, sorting);
            }
            if ((result = sorting.buildSortedIndexBuffer(allocator, sorter)) != null) {
                uploader.uploadIndexByBlockLayer(layer, result);
                result.close();
            }
        }
    }

    private void uploadVertexBufferByType(OverlayRenderType type, ChunkRenderDataSchematic compiledChunk, ChunkRenderDispatcherBuffers pack, ChunkRenderGpuUploader uploader, VertexSorting sorter, boolean resortOnly) throws InterruptedException {
        ByteBufferBuilder allocator = pack.allocatorCache().getAllocator(type);
        ChunkMeshDataSchematic chunkMeshData = compiledChunk.getMeshDataCache();
        MeshData meshData = chunkMeshData.getMeshDataOrNull(type);
        boolean useResorting = false;
        if (allocator == null) {
            LOGGER.error("[Dispatch] uploadVertexBufferByType type [{}] --> ALLOC NULL", (Object)type.name());
            pack.allocatorCache().closeByType(type);
            compiledChunk.setOverlayTypeUnused(type);
            throw new InterruptedException("BufferAllocators are invalid");
        }
        if (meshData == null) {
            LOGGER.error("[Dispatch] uploadVertexBufferByType type [{}] --> MESHDATA NULL", (Object)type.name());
            compiledChunk.setOverlayTypeUnused(type);
            return;
        }
        if (!resortOnly) {
            uploader.uploadBuffersByType(type, meshData, useResorting);
        }
        if (type.translucent() && useResorting) {
            ByteBufferBuilder.Result result;
            MeshData.SortState sorting = chunkMeshData.getTransparentSortingDataForOverlay(type);
            if (sorting == null) {
                sorting = meshData.sortQuads(allocator, sorter);
                if (sorting == null) {
                    throw new InterruptedException("Sort State failed to sortQuads()");
                }
                chunkMeshData.setTransparentSortingDataForOverlay(type, sorting);
            }
            if ((result = sorting.buildSortedIndexBuffer(allocator, sorter)) != null) {
                uploader.uploadIndexByType(type, result);
                result.close();
            }
        }
    }

    protected void clearChunkUpdates() {
        while (!this.queueChunkUpdates.isEmpty()) {
            ChunkRenderTaskSchematic generator = this.queueChunkUpdates.poll();
            if (generator == null) continue;
            generator.finish();
        }
    }

    public boolean hasChunkUpdates() {
        return this.queueChunkUpdates.isEmpty() && this.queueChunkUploads.isEmpty();
    }

    protected void stopWorkerThreads() {
        this.clearChunkUpdates();
    }

    protected static class PendingUpload
    implements Comparable<PendingUpload> {
        private final ListenableFutureTask<Object> uploadTask;
        private final double distanceSq;

        public PendingUpload(ListenableFutureTask<Object> uploadTaskIn, double distanceSqIn) {
            this.uploadTask = uploadTaskIn;
            this.distanceSq = distanceSqIn;
        }

        @Override
        public int compareTo(PendingUpload other) {
            return Doubles.compare((double)this.distanceSq, (double)other.distanceSq);
        }
    }
}

