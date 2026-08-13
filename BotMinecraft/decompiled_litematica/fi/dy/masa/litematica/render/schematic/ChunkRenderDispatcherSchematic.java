/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.systems.RenderSystem
 *  javax.annotation.Nullable
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.systems.RenderSystem;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuDispatcher;
import fi.dy.masa.litematica.render.schematic.ChunkRendererSchematicVbo;
import fi.dy.masa.litematica.render.schematic.IChunkRendererFactory;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import net.minecraft.world.level.ChunkPos;

public class ChunkRenderDispatcherSchematic {
    protected final ConcurrentHashMap<Long, ChunkRendererSchematicVbo> chunkRenderers;
    protected final ConcurrentHashMap<Long, Boolean> pendingChunks;
    protected final IWorldSchematicRenderer renderer;
    protected final IChunkRendererFactory chunkRendererFactory;
    protected final WorldSchematic world;
    protected int viewDistanceChunks;
    protected int viewDistanceBlocksSq;

    protected ChunkRenderDispatcherSchematic(WorldSchematic world, int viewDistanceChunks, IWorldSchematicRenderer worldRenderer, IChunkRendererFactory factory) {
        this.chunkRendererFactory = factory;
        this.chunkRenderers = new ConcurrentHashMap(1024, 0.9f, 2);
        this.pendingChunks = new ConcurrentHashMap(1024, 0.9f, 2);
        this.renderer = worldRenderer;
        this.world = world;
        this.setViewDistanceChunks(viewDistanceChunks);
    }

    protected void setViewDistanceChunks(int viewDistanceChunks) {
        this.viewDistanceChunks = viewDistanceChunks;
        this.viewDistanceBlocksSq = viewDistanceChunks + 2 << 4;
        this.viewDistanceBlocksSq *= this.viewDistanceBlocksSq;
    }

    protected void delete() {
        RenderSystem.assertOnRenderThread();
        for (ChunkRendererSchematicVbo cr : this.chunkRenderers.values()) {
            if (cr == null) continue;
            cr.deleteGlResources();
        }
        this.chunkRenderers.clear();
    }

    protected void removeOutOfRangeRenderers(@Nullable ChunkRenderGpuDispatcher uploaders) {
        if (!this.chunkRenderers.isEmpty()) {
            int prevCount;
            block4: {
                prevCount = this.chunkRenderers.size();
                try {
                    this.chunkRenderers.entrySet().removeIf(entry -> {
                        ChunkRendererSchematicVbo cr = (ChunkRendererSchematicVbo)entry.getValue();
                        if (cr != null && (cr.getDistanceSq() > (double)this.viewDistanceBlocksSq || cr.isEmpty())) {
                            block4: {
                                if (uploaders != null) {
                                    ChunkPos cp = cr.getChunkPos();
                                    uploaders.removeUploader(cp.x(), cp.z());
                                }
                                try {
                                    cr.close();
                                }
                                catch (Exception e) {
                                    if (!Reference.DEBUG_MODE) break block4;
                                    Litematica.debugLog("removeOutOfRangeRenderers: cr.close() threw an exception; {}", e.getLocalizedMessage());
                                }
                            }
                            return true;
                        }
                        return false;
                    });
                }
                catch (Exception e) {
                    if (!Reference.DEBUG_MODE) break block4;
                    Litematica.debugLog("removeOutOfRangeRenderers: keySet() threw an exception; {}", e.getLocalizedMessage());
                }
            }
            if (Reference.DEBUG_MODE && prevCount != this.chunkRenderers.size()) {
                Litematica.LOGGER.warn("[Dispatch] removeOutOfRangeRenderers: [{}] -> [{}]", (Object)prevCount, (Object)this.chunkRenderers.size());
            }
        }
    }

    protected void scheduleChunkRender(int chunkX, int chunkZ, boolean immediate) {
        this.addPendingChunkRender(ChunkPos.pack((int)chunkX, (int)chunkZ), immediate);
    }

    private void addPendingChunkRender(Long chunk, boolean immediate) {
        this.pendingChunks.putIfAbsent(chunk, immediate);
    }

    private boolean getPendingChunk(Long chunk) {
        if (this.pendingChunks.containsKey(chunk)) {
            return this.pendingChunks.get(chunk);
        }
        return false;
    }

    private void removePendingChunk(Long chunk) {
        this.pendingChunks.remove(chunk);
    }

    private boolean matchPendingChunk(Long chunk) {
        return this.pendingChunks.containsKey(chunk);
    }

    protected int getRendererCount() {
        return this.chunkRenderers.size();
    }

    protected int getPendingChunkCount() {
        return this.pendingChunks.size();
    }

    protected boolean hasRenderer(Long chunk) {
        return this.chunkRenderers.containsKey(chunk);
    }

    protected Optional<ChunkRendererSchematicVbo> getOrCreateChunkRenderer(int chunkX, int chunkZ) {
        long index = ChunkPos.pack((int)chunkX, (int)chunkZ);
        try {
            ChunkRendererSchematicVbo renderer;
            if (!this.chunkRenderers.containsKey(index)) {
                renderer = this.chunkRendererFactory.create(this.world, this.renderer);
                renderer.setPosition(chunkX << 4, this.world.getMinY(), chunkZ << 4);
                renderer.setChunkPosition(chunkX, chunkZ);
                if (this.matchPendingChunk(index)) {
                    renderer.setNeedsUpdate(this.getPendingChunk(index));
                    this.removePendingChunk(index);
                } else {
                    renderer.setNeedsUpdate(false);
                }
                this.chunkRenderers.put(index, renderer);
            }
            if ((renderer = this.chunkRenderers.get(index)) != null && this.matchPendingChunk(index)) {
                renderer.setNeedsUpdate(this.getPendingChunk(index));
                this.removePendingChunk(index);
            }
            return Optional.ofNullable(renderer);
        }
        catch (Exception e) {
            if (Reference.DEBUG_MODE) {
                Litematica.debugLog("getOrCreateChunkRenderer: Exception obtaining a Chunk Renderer; {}", e.getLocalizedMessage());
            }
            return Optional.empty();
        }
    }

    @Nullable
    protected ChunkRendererSchematicVbo getChunkRenderer(int chunkX, int chunkZ) {
        return this.getOrCreateChunkRenderer(chunkX, chunkZ).orElse(null);
    }
}

