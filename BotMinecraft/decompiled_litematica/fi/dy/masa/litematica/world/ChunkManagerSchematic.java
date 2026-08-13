/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.common.collect.ImmutableList$Builder
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.chunk.ChunkSource
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.level.chunk.LightChunkGetter
 *  net.minecraft.world.level.chunk.status.ChunkStatus
 *  net.minecraft.world.level.lighting.LevelLightEngine
 */
package fi.dy.masa.litematica.world;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.FakeLightingProvider;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.Collection;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BooleanSupplier;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.ChunkSource;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.LightChunkGetter;
import net.minecraft.world.level.chunk.status.ChunkStatus;
import net.minecraft.world.level.lighting.LevelLightEngine;

public class ChunkManagerSchematic
extends ChunkSource {
    private final WorldSchematic world;
    private final ConcurrentHashMap<Long, ChunkSchematic> loadedChunks;
    private final ChunkSchematic blankChunk;
    private final LevelLightEngine lightingProvider;
    private final FakeLightingProvider fakeLightingProvider;

    public ChunkManagerSchematic(WorldSchematic world) {
        this.world = world;
        this.loadedChunks = new ConcurrentHashMap(4096, 0.9f, 2);
        this.blankChunk = new ChunkSchematic(world, new ChunkPos(0, 0));
        this.blankChunk.setState(ChunkSchematicState.EMPTY);
        this.lightingProvider = new LevelLightEngine((LightChunkGetter)this, true, world.dimensionType().hasSkyLight());
        this.fakeLightingProvider = new FakeLightingProvider((LightChunkGetter)this);
    }

    @Nonnull
    public WorldSchematic getLevel() {
        return this.world;
    }

    public void loadChunk(int chunkX, int chunkZ) {
        ChunkSchematic chunk = new ChunkSchematic(this.world, new ChunkPos(chunkX, chunkZ));
        chunk.setState(ChunkSchematicState.LOADED);
        this.loadedChunks.put(ChunkPos.pack((int)chunkX, (int)chunkZ), chunk);
    }

    public boolean hasChunk(int chunkX, int chunkZ) {
        return this.loadedChunks.containsKey(ChunkPos.pack((int)chunkX, (int)chunkZ));
    }

    public ChunkSchematicState getChunkState(int chunkX, int chunkZ) {
        long key = ChunkPos.pack((int)chunkX, (int)chunkZ);
        if (this.loadedChunks.containsKey(key)) {
            return this.loadedChunks.get(key).getState();
        }
        return ChunkSchematicState.UNLOADED;
    }

    public void setChunkState(int chunkX, int chunkZ, ChunkSchematicState state) {
        long key = ChunkPos.pack((int)chunkX, (int)chunkZ);
        if (this.loadedChunks.containsKey(key)) {
            this.loadedChunks.get(key).setState(state);
        }
    }

    @Nonnull
    public String gatherStats() {
        return "Schematic Chunk Manager: " + this.getLoadedChunksCount();
    }

    public int getLoadedChunksCount() {
        return this.loadedChunks.size();
    }

    public ImmutableList<Long> getLoadedKeySet() {
        return ImmutableList.copyOf((Collection)this.loadedChunks.keySet());
    }

    public ImmutableList<ChunkSchematic> getLoadedValueSet() {
        return ImmutableList.copyOf(this.loadedChunks.values());
    }

    public ImmutableList<ChunkPos> getLoadedNonEmptyChunkPosSet() {
        ImmutableList.Builder builder = ImmutableList.builder();
        this.loadedChunks.forEach((key, chunk) -> {
            if (!chunk.isEmpty()) {
                builder.add((Object)chunk.getPos());
            }
        });
        return builder.build();
    }

    public LevelChunk getChunk(int chunkX, int chunkZ, @Nonnull ChunkStatus status, boolean fallbackToEmpty) {
        ChunkSchematic chunk = this.getChunkForLighting(chunkX, chunkZ);
        return chunk == null && fallbackToEmpty ? this.blankChunk : chunk;
    }

    public ChunkSchematic getChunkForLighting(int chunkX, int chunkZ) {
        ChunkSchematic chunk = this.loadedChunks.get(ChunkPos.pack((int)chunkX, (int)chunkZ));
        return chunk == null ? this.blankChunk : chunk;
    }

    @Nullable
    public ChunkSchematic getChunkIfExists(int chunkX, int chunkZ) {
        return this.loadedChunks.get(ChunkPos.pack((int)chunkX, (int)chunkZ));
    }

    public void unloadChunk(int chunkX, int chunkZ) {
        ChunkSchematic chunk = this.loadedChunks.remove(ChunkPos.pack((int)chunkX, (int)chunkZ));
        if (chunk != null) {
            this.world.unloadEntitiesByChunk(chunkX, chunkZ);
            chunk.setState(ChunkSchematicState.UNLOADED);
        }
    }

    public boolean replaceChunk(int chunkX, int chunkZ, @Nonnull ChunkSchematic newChunk) {
        ChunkPos pos = new ChunkPos(chunkX, chunkZ);
        if (!newChunk.getPos().equals((Object)pos)) {
            Litematica.LOGGER.error("replaceChunk: Position of new Chunk is mismatched: '{}' != '{}' -- Please fix", (Object)pos.toString(), (Object)newChunk.getPos().toString());
            return false;
        }
        if (this.hasChunk(chunkX, chunkZ)) {
            this.world.unloadEntitiesByChunk(chunkX, chunkZ);
            this.unloadChunk(chunkX, chunkZ);
        }
        if (!newChunk.getState().atLeast(ChunkSchematicState.LOADED)) {
            newChunk.setState(ChunkSchematicState.LOADED);
        }
        this.loadedChunks.put(ChunkPos.pack((int)chunkX, (int)chunkZ), newChunk);
        return true;
    }

    @Nonnull
    public LevelLightEngine getLightEngine() {
        if (Configs.Visuals.ENABLE_SCHEMATIC_FAKE_LIGHTING.getBooleanValue()) {
            return this.fakeLightingProvider;
        }
        return this.lightingProvider;
    }

    public void tick(@Nonnull BooleanSupplier shouldKeepTicking, boolean tickChunks) {
    }

    public int getTileEntityCount() {
        int count = 0;
        Iterator iter = this.loadedChunks.values().stream().iterator();
        while (iter.hasNext()) {
            count += ((ChunkSchematic)((Object)iter.next())).getTileEntityCount();
        }
        return count;
    }
}

