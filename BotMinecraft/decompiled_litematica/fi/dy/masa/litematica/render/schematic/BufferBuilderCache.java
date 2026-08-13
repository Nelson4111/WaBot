/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.PrimitiveTopology
 *  com.mojang.blaze3d.vertex.BufferBuilder
 *  com.mojang.blaze3d.vertex.ByteBufferBuilder
 *  com.mojang.blaze3d.vertex.MeshData
 *  fi.dy.masa.malilib.mixin.render.IMixinBufferBuilder
 *  javax.annotation.Nonnull
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.PrimitiveTopology;
import com.mojang.blaze3d.vertex.BufferBuilder;
import com.mojang.blaze3d.vertex.ByteBufferBuilder;
import com.mojang.blaze3d.vertex.MeshData;
import fi.dy.masa.litematica.render.schematic.ByteBufferBuilderCache;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import fi.dy.masa.malilib.mixin.render.IMixinBufferBuilder;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nonnull;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;

public class BufferBuilderCache
implements AutoCloseable {
    private final ConcurrentHashMap<ChunkSectionLayer, BufferBuilder> blockBufferBuilders = new ConcurrentHashMap(ByteBufferBuilderCache.BLOCK_LAYERS.size(), 0.9f, 1);
    private final ConcurrentHashMap<OverlayRenderType, BufferBuilder> overlayBufferBuilders = new ConcurrentHashMap(ByteBufferBuilderCache.TYPES.size(), 0.9f, 1);

    protected BufferBuilderCache() {
    }

    protected boolean hasBuilder(ChunkSectionLayer layer) {
        return this.blockBufferBuilders.containsKey(layer);
    }

    protected boolean hasBuilder(OverlayRenderType type) {
        return this.overlayBufferBuilders.containsKey((Object)type);
    }

    protected BufferBuilder getBuilder(ChunkSectionLayer layer, @Nonnull ByteBufferBuilder alloc) {
        return this.blockBufferBuilders.computeIfAbsent(layer, key -> new BufferBuilder(alloc, PrimitiveTopology.QUADS, layer.vertexFormat()));
    }

    protected BufferBuilder getBuilder(OverlayRenderType type, @Nonnull ByteBufferBuilder alloc) {
        return this.overlayBufferBuilders.computeIfAbsent(type, key -> new BufferBuilder(alloc, key.topology(), key.vertexFormat()));
    }

    protected void clearAll() {
        MeshData built;
        for (BufferBuilder buffer : this.blockBufferBuilders.values()) {
            if (!((IMixinBufferBuilder)buffer).malilib_isBuilding() || (built = buffer.build()) == null) continue;
            built.close();
        }
        this.blockBufferBuilders.clear();
        for (BufferBuilder buffer : this.overlayBufferBuilders.values()) {
            if (!((IMixinBufferBuilder)buffer).malilib_isBuilding() || (built = buffer.build()) == null) continue;
            built.close();
        }
        this.overlayBufferBuilders.clear();
    }

    @Override
    public void close() throws Exception {
        this.clearAll();
    }
}

