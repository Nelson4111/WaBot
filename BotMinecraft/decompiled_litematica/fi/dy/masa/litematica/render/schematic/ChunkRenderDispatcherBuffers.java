/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.BufferBuilder
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.vertex.BufferBuilder;
import fi.dy.masa.litematica.render.schematic.BufferBuilderCache;
import fi.dy.masa.litematica.render.schematic.ByteBufferBuilderCache;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;

public class ChunkRenderDispatcherBuffers {
    private final ByteBufferBuilderCache allocatorCache = new ByteBufferBuilderCache();
    private final BufferBuilderCache builderCache = new BufferBuilderCache();

    protected ChunkRenderDispatcherBuffers() {
    }

    protected ByteBufferBuilderCache allocatorCache() {
        return this.allocatorCache;
    }

    protected BufferBuilderCache builderCache() {
        return this.builderCache;
    }

    protected BufferBuilder getBuilder(ChunkSectionLayer layer) {
        return this.builderCache().getBuilder(layer, this.allocatorCache.getAllocator(layer));
    }

    protected BufferBuilder getBuilder(OverlayRenderType type) {
        return this.builderCache().getBuilder(type, this.allocatorCache.getAllocator(type));
    }

    protected void reset() {
        if (!this.allocatorCache.isClear()) {
            this.allocatorCache.resetAll();
        }
        this.builderCache.clearAll();
    }
}

