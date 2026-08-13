/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.CardinalLighting
 *  net.minecraft.world.level.ColorResolver
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.level.chunk.LevelChunk$EntityCreationType
 *  net.minecraft.world.level.chunk.LightChunk
 *  net.minecraft.world.level.chunk.LightChunkGetter
 *  net.minecraft.world.level.lighting.LevelLightEngine
 *  net.minecraft.world.level.material.FluidState
 *  org.jspecify.annotations.NonNull
 */
package fi.dy.masa.litematica.render.schematic;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.CardinalLighting;
import net.minecraft.world.level.ColorResolver;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.LightChunk;
import net.minecraft.world.level.chunk.LightChunkGetter;
import net.minecraft.world.level.lighting.LevelLightEngine;
import net.minecraft.world.level.material.FluidState;
import org.jspecify.annotations.NonNull;

public class ChunkCacheSchematic
implements BlockAndTintGetter,
LightChunkGetter {
    private static final BlockState AIR = Blocks.AIR.defaultBlockState();
    protected final Level world;
    protected final ClientLevel worldClient;
    protected int chunkStartX;
    protected int chunkStartZ;
    protected LevelChunk[][] chunkArray;
    protected boolean empty;

    public ChunkCacheSchematic(@Nonnull Level worldIn, @Nonnull ClientLevel clientWorld, @Nonnull BlockPos pos, int expand) {
        this.world = worldIn;
        this.worldClient = clientWorld;
        int chunkX = pos.getX() >> 4;
        int chunkZ = pos.getZ() >> 4;
        this.chunkStartX = pos.getX() - expand >> 4;
        this.chunkStartZ = pos.getZ() - expand >> 4;
        int chunkEndX = pos.getX() + expand + 15 >> 4;
        int chunkEndZ = pos.getZ() + expand + 15 >> 4;
        this.chunkArray = new LevelChunk[chunkEndX - this.chunkStartX + 1][chunkEndZ - this.chunkStartZ + 1];
        this.empty = true;
        for (int cx = this.chunkStartX; cx <= chunkEndX; ++cx) {
            for (int cz = this.chunkStartZ; cz <= chunkEndZ; ++cz) {
                LevelChunk chunk;
                this.chunkArray[cx - this.chunkStartX][cz - this.chunkStartZ] = chunk = worldIn.getChunk(cx, cz);
                if (cx != chunkX || cz != chunkZ || chunk.isYSpaceEmpty(worldIn.getMinY(), worldIn.getMaxY() - 1)) continue;
                this.empty = false;
            }
        }
    }

    @Nonnull
    public BlockGetter getLevel() {
        return this.world;
    }

    public LightChunk getChunkForLighting(int chunkX, int chunkZ) {
        return this.worldClient.getChunk(chunkX, chunkZ);
    }

    public boolean isEmpty() {
        return this.empty;
    }

    @Nonnull
    public BlockState getBlockState(BlockPos pos) {
        LevelChunk chunk;
        int cx = (pos.getX() >> 4) - this.chunkStartX;
        int cz = (pos.getZ() >> 4) - this.chunkStartZ;
        if (cx >= 0 && cx < this.chunkArray.length && cz >= 0 && cz < this.chunkArray[cx].length && (chunk = this.chunkArray[cx][cz]) != null) {
            return chunk.getBlockState(pos);
        }
        return AIR;
    }

    @Nullable
    public BlockEntity getBlockEntity(@NonNull BlockPos pos) {
        return this.getBlockEntity(pos, LevelChunk.EntityCreationType.CHECK);
    }

    @Nullable
    public BlockEntity getBlockEntity(BlockPos pos, LevelChunk.EntityCreationType type) {
        int i = (pos.getX() >> 4) - this.chunkStartX;
        int j = (pos.getZ() >> 4) - this.chunkStartZ;
        return this.chunkArray[i][j].getBlockEntity(pos, type);
    }

    public void addBlockEntity(BlockPos pos, BlockEntity te) {
        int i = (pos.getX() >> 4) - this.chunkStartX;
        int j = (pos.getZ() >> 4) - this.chunkStartZ;
        this.chunkArray[i][j].addAndRegisterBlockEntity(te);
    }

    @Nonnull
    public FluidState getFluidState(@Nonnull BlockPos pos) {
        return this.getBlockState(pos).getFluidState();
    }

    @Nonnull
    public LevelLightEngine getLightEngine() {
        return this.world.getLightEngine();
    }

    public @NonNull CardinalLighting cardinalLighting() {
        return this.worldClient.cardinalLighting();
    }

    public int getBlockTint(@NonNull BlockPos pos, @NonNull ColorResolver colorResolver) {
        return this.worldClient.getBlockTint(pos, colorResolver);
    }

    public int getHeight() {
        return this.world.getHeight();
    }

    public int getMinY() {
        return this.world.getMinY();
    }
}

