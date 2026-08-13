/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.core.BlockPos
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block$UpdateFlags
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  org.apache.commons.lang3.tuple.Pair
 *  org.jspecify.annotations.Nullable
 */
package fi.dy.masa.litematica.world;

import fi.dy.masa.litematica.util.WorldPlacingUtils;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import javax.annotation.Nonnull;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import org.apache.commons.lang3.tuple.Pair;
import org.jspecify.annotations.Nullable;

public class ProtoChunkSchematic {
    private final CopyOnWriteArrayList<Pair<WorldPlacingUtils.EntityPosAndRot, CompoundTag>> entities = new CopyOnWriteArrayList();
    private final ChunkSchematic wrapped;

    public ProtoChunkSchematic(@Nonnull ChunkSchematic chunk) {
        this.wrapped = chunk;
    }

    @Nonnull
    public ChunkSchematic getWrapped() {
        return this.wrapped;
    }

    @Nonnull
    public BlockState getBlockState(@Nonnull BlockPos pos) {
        return this.getWrapped().getBlockState(pos);
    }

    public BlockState setBlockState(@Nonnull BlockPos pos, @Nonnull BlockState newState, @Block.UpdateFlags int flags) {
        return this.getWrapped().setBlockState(pos, newState, flags);
    }

    public @Nullable BlockEntity getBlockEntity(@Nonnull BlockPos pos) {
        return this.getWrapped().getBlockEntity(pos);
    }

    public void setBlockEntity(@Nonnull BlockEntity te) {
        this.getWrapped().setBlockEntity(te);
    }

    public @Nullable BlockEntity createBlockEntity(BlockPos pos) {
        return this.getWrapped().createBlockEntity(pos);
    }

    public ChunkSchematicState getState() {
        return this.getWrapped().getState();
    }

    public void setState(ChunkSchematicState state) {
        this.getWrapped().setState(state);
    }

    public synchronized void addEntityPairForLater(Pair<WorldPlacingUtils.EntityPosAndRot, CompoundTag> entity) {
        this.entities.add(entity);
    }

    public synchronized void spawnAllEntitiesNow(@Nonnull Level world) {
        this.entities.forEach((Consumer<Pair<WorldPlacingUtils.EntityPosAndRot, CompoundTag>>)((Consumer<Pair>)entityPair -> WorldPlacingUtils.spawnEntityToWorldNow(world, (Pair<WorldPlacingUtils.EntityPosAndRot, CompoundTag>)entityPair)));
        this.entities.clear();
    }

    public int getEntityCount() {
        return this.entities.size();
    }

    public synchronized void clear() {
        this.entities.clear();
    }
}

