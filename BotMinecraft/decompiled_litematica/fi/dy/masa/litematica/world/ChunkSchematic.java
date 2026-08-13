/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Block$UpdateFlags
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.EntityBlock
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.level.chunk.LevelChunkSection
 *  net.minecraft.world.phys.AABB
 *  org.jspecify.annotations.NonNull
 *  org.jspecify.annotations.Nullable
 */
package fi.dy.masa.litematica.world;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import javax.annotation.Nonnull;
import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.EntityBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.LevelChunkSection;
import net.minecraft.world.phys.AABB;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;

public class ChunkSchematic
extends LevelChunk {
    private static final BlockState AIR = Blocks.AIR.defaultBlockState();
    private final long timeCreated;
    private final int bottomY;
    private final int topY;
    private boolean isEmpty = true;
    private ChunkSchematicState state = ChunkSchematicState.NEW;

    public ChunkSchematic(Level worldIn, ChunkPos pos) {
        super(worldIn, pos);
        this.timeCreated = worldIn.getGameTime();
        this.bottomY = worldIn.getMinY();
        this.topY = worldIn.getMaxY();
    }

    public void setState(ChunkSchematicState state) {
        this.state = state;
    }

    public ChunkSchematicState getState() {
        return this.state;
    }

    @Nonnull
    public BlockState getBlockState(BlockPos pos) {
        LevelChunkSection chunkSection;
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        int cy = this.getSectionIndex(y);
        LevelChunkSection[] sections = this.getSections();
        if (cy >= 0 && cy < sections.length && !(chunkSection = sections[cy]).hasOnlyAir()) {
            return chunkSection.getBlockState(x & 0xF, y & 0xF, z & 0xF);
        }
        return AIR;
    }

    public BlockState setBlockState(@Nonnull BlockPos pos, @Nonnull BlockState newState, @Block.UpdateFlags int flags) {
        BlockEntity te;
        BlockState stateOld = this.getBlockState(pos);
        int y = pos.getY();
        if (stateOld == newState || y >= this.topY || y < this.bottomY) {
            return null;
        }
        int x = pos.getX() & 0xF;
        int z = pos.getZ() & 0xF;
        int cy = this.getSectionIndex(y);
        Block blockNew = newState.getBlock();
        Block blockOld = stateOld.getBlock();
        LevelChunkSection section = this.getSections()[cy];
        if (section.hasOnlyAir() && newState.isAir()) {
            return null;
        }
        y &= 0xF;
        if (!newState.isAir()) {
            this.isEmpty = false;
        }
        section.setBlockState(x, y, z, newState);
        if (blockOld != blockNew) {
            this.getLevel().removeBlockEntity(pos);
        }
        if (section.getBlockState(x, y, z).getBlock() != blockNew) {
            return null;
        }
        if (newState.hasBlockEntity() && blockNew instanceof EntityBlock && (te = this.createBlockEntity(pos)) == null && (te = ((EntityBlock)blockNew).newBlockEntity(pos, newState)) != null) {
            this.setBlockEntity(te);
        }
        return stateOld;
    }

    public @Nullable BlockEntity createBlockEntity(BlockPos pos) {
        BlockState state = this.getBlockState(pos);
        return !state.hasBlockEntity() ? null : ((EntityBlock)state.getBlock()).newBlockEntity(pos, state);
    }

    public void setBlockEntity(@NonNull BlockEntity te) {
        BlockPos pos = te.getBlockPos();
        BlockState currState = this.getBlockState(pos);
        if (!currState.hasBlockEntity()) {
            Litematica.LOGGER.error("setBlockEntity: Can't set block entity at pos '{}', because the existing state '{}' doesn't accept block entities", (Object)pos.toShortString(), (Object)currState.toString());
            return;
        }
        BlockState teState = te.getBlockState();
        if (!teState.equals((Object)currState) && te.getType().isValid(currState)) {
            if (!currState.getBlock().equals(teState.getBlock())) {
                Litematica.LOGGER.error("setBlockEntity: Can't set block entity at pos '{}', because the Tile Entities' Block '{}' doesn't match '{}'", (Object)pos.toShortString(), (Object)currState.getBlock().toString(), (Object)teState.getBlock().toString());
                return;
            }
            te.setBlockState(currState);
        }
        te.setLevel(this.getLevel());
        te.clearRemoved();
        BlockEntity oldTe = this.blockEntities.put(pos.immutable(), te);
        if (oldTe != null && oldTe != te) {
            oldTe.setRemoved();
        }
    }

    public AABB getBoundingBox() {
        ChunkPos pos = this.getPos();
        return new AABB((double)pos.getMinBlockX(), (double)this.getMinY(), (double)pos.getMinBlockZ(), (double)pos.getMaxBlockX(), (double)this.getMaxY(), (double)pos.getMaxBlockZ());
    }

    public void addEntity(@Nonnull Entity entity) {
        Level level = this.getLevel();
        if (level instanceof WorldSchematic) {
            WorldSchematic ws = (WorldSchematic)level;
            ws.addFreshEntitySafe(entity);
        } else {
            this.getLevel().addFreshEntity(entity);
        }
    }

    public int getTileEntityCount() {
        return this.blockEntities.size();
    }

    public long getTimeCreated() {
        return this.timeCreated;
    }

    public boolean isEmpty() {
        return this.isEmpty;
    }
}

