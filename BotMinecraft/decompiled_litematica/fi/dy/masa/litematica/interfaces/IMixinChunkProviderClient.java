/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  it.unimi.dsi.fastutil.longs.Long2ObjectMap
 *  net.minecraft.world.level.chunk.ChunkAccess
 */
package fi.dy.masa.litematica.interfaces;

import it.unimi.dsi.fastutil.longs.Long2ObjectMap;
import net.minecraft.world.level.chunk.ChunkAccess;

public interface IMixinChunkProviderClient {
    public Long2ObjectMap<ChunkAccess> getLoadedChunks();
}

