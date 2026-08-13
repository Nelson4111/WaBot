/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.interfaces.IRangeChangeListener
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.interfaces.IRangeChangeListener;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.ChunkPos;

public class SchematicWorldRefresher
implements IRangeChangeListener {
    public static final SchematicWorldRefresher INSTANCE = new SchematicWorldRefresher();
    private final Minecraft mc = Minecraft.getInstance();

    public void updateAll() {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null) {
            DataManager.getSchematicPlacementManager().setVisibleSubChunksNeedsUpdate();
            int minY = world.getMinY();
            int maxY = world.getMaxY() - 1;
            this.updateBetweenY(minY, maxY);
        }
    }

    public void updateBetweenX(int minX, int maxX) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null) {
            DataManager.getSchematicPlacementManager().setVisibleSubChunksNeedsUpdate();
            ImmutableList<ChunkPos> keySet = world.getChunkSource().getLoadedNonEmptyChunkPosSet();
            int cxMin = Math.min(minX, maxX) >> 4;
            int cxMax = Math.max(minX, maxX) >> 4;
            for (ChunkPos pos : keySet) {
                if (pos.x() < cxMin || pos.x() > cxMax || !WorldUtils.isClientChunkLoaded(this.mc.level, pos.x(), pos.z())) continue;
                world.scheduleChunkRenders(pos.x(), pos.z());
            }
        }
    }

    public void updateBetweenY(int minY, int maxY) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null) {
            DataManager.getSchematicPlacementManager().setVisibleSubChunksNeedsUpdate();
            ImmutableList<ChunkPos> keySet = world.getChunkSource().getLoadedNonEmptyChunkPosSet();
            for (ChunkPos pos : keySet) {
                if (!WorldUtils.isClientChunkLoaded(this.mc.level, pos.x(), pos.z())) continue;
                world.scheduleChunkRenders(pos.x(), pos.z());
            }
        }
    }

    public void updateBetweenZ(int minZ, int maxZ) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null) {
            DataManager.getSchematicPlacementManager().setVisibleSubChunksNeedsUpdate();
            ImmutableList<ChunkPos> keySet = world.getChunkSource().getLoadedNonEmptyChunkPosSet();
            int czMin = Math.min(minZ, maxZ) >> 4;
            int czMax = Math.max(minZ, maxZ) >> 4;
            for (ChunkPos pos : keySet) {
                if (pos.z() < czMin || pos.z() > czMax || !WorldUtils.isClientChunkLoaded(this.mc.level, pos.x(), pos.z())) continue;
                world.scheduleChunkRenders(pos.x(), pos.z());
            }
        }
    }

    public void markSchematicChunksForRenderUpdate(int chunkX, int chunkZ) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null && world.getChunkSource().hasChunk(chunkX, chunkZ) && WorldUtils.isClientChunkLoaded(this.mc.level, chunkX, chunkZ)) {
            world.scheduleChunkRenders(chunkX, chunkZ);
        }
    }

    public void markSchematicChunkForRenderUpdate(BlockPos pos) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world != null && this.mc.level != null) {
            int chunkX = pos.getX() >> 4;
            int chunkZ = pos.getZ() >> 4;
            if (world.getChunkSource().hasChunk(chunkX, chunkZ) && WorldUtils.isClientChunkLoaded(this.mc.level, chunkX, chunkZ)) {
                world.scheduleChunkRenders(chunkX, chunkZ);
            }
        }
    }
}

