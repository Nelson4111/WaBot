/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.level.BlockGetter
 */
package fi.dy.masa.litematica.schematic.conversion;

import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.BlockGetter;

public interface IBlockReaderWithData
extends BlockGetter {
    @Nullable
    public CompoundTag getBlockEntityData(BlockPos var1);

    default public int getHeight() {
        return 384;
    }

    default public int getMinY() {
        return -64;
    }
}

