/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.render.schematic.ByteBufferBuilderCache;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuBuffers;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;

public class GpuBufferCache
implements AutoCloseable {
    private final ConcurrentHashMap<ChunkSectionLayer, ChunkRenderGpuBuffers> blockBuffers = new ConcurrentHashMap(ByteBufferBuilderCache.BLOCK_LAYERS.size(), 0.9f, 1);
    private final ConcurrentHashMap<OverlayRenderType, ChunkRenderGpuBuffers> overlayBuffers = new ConcurrentHashMap(ByteBufferBuilderCache.TYPES.size(), 0.9f, 1);

    protected GpuBufferCache() {
    }

    protected boolean hasBuffers(ChunkSectionLayer layer) {
        return this.blockBuffers.containsKey(layer);
    }

    protected boolean hasBuffers(OverlayRenderType type) {
        return this.overlayBuffers.containsKey((Object)type);
    }

    protected void saveBuffers(ChunkSectionLayer layer, @Nonnull ChunkRenderGpuBuffers newBuffer) {
        ChunkRenderGpuBuffers remove = this.blockBuffers.put(layer, newBuffer);
        if (remove != null) {
            try {
                remove.close();
            }
            catch (Exception err) {
                throw new RuntimeException("Exception closing Block Layer " + layer.label() + " Buffers; " + err.getMessage());
            }
        }
    }

    protected void saveBuffers(OverlayRenderType type, @Nonnull ChunkRenderGpuBuffers newBuffer) {
        ChunkRenderGpuBuffers remove = this.overlayBuffers.put(type, newBuffer);
        if (remove != null) {
            try {
                remove.close();
            }
            catch (Exception err) {
                throw new RuntimeException("Exception closing Overlay Type " + type.name() + " Buffers; " + err.getMessage());
            }
        }
    }

    @Nullable
    protected ChunkRenderGpuBuffers getBuffersOrNull(ChunkSectionLayer layer) {
        return this.blockBuffers.get(layer);
    }

    @Nullable
    protected ChunkRenderGpuBuffers getBuffersOrNull(OverlayRenderType type) {
        return this.overlayBuffers.get((Object)type);
    }

    protected void clearAll() {
        this.blockBuffers.forEach((layer, buffers) -> {
            try {
                buffers.close();
            }
            catch (Exception err) {
                throw new RuntimeException("Exception closing Block Layer " + layer.label() + " Buffers; " + err.getMessage());
            }
        });
        this.blockBuffers.clear();
        this.overlayBuffers.forEach((type, buffers) -> {
            try {
                buffers.close();
            }
            catch (Exception err) {
                throw new RuntimeException("Exception closing Overlay Type " + type.name() + " Buffers; " + err.getMessage());
            }
        });
        this.overlayBuffers.clear();
    }

    protected boolean isEmpty() {
        return this.blockBuffers.isEmpty() && this.overlayBuffers.isEmpty();
    }

    @Override
    public void close() throws Exception {
        this.clearAll();
    }
}

