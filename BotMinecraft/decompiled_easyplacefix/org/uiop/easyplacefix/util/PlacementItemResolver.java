/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.DecoratedPotBlock
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.entity.DecoratedPotBlockEntity
 *  net.minecraft.world.level.block.entity.PotDecorations
 *  net.minecraft.world.level.block.state.BlockState
 */
package org.uiop.easyplacefix.util;

import net.minecraft.core.BlockPos;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.DecoratedPotBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.DecoratedPotBlockEntity;
import net.minecraft.world.level.block.entity.PotDecorations;
import net.minecraft.world.level.block.state.BlockState;
import org.uiop.easyplacefix.IBlock;

public final class PlacementItemResolver {
    private PlacementItemResolver() {
    }

    public static ItemStack getPlacementStack(BlockState stateSchematic, BlockPos pos, Level schematicWorld) {
        BlockEntity blockEntity;
        if (stateSchematic.getBlock() instanceof DecoratedPotBlock && (blockEntity = schematicWorld.getBlockEntity(pos)) instanceof DecoratedPotBlockEntity) {
            DecoratedPotBlockEntity decoratedPotBlockEntity = (DecoratedPotBlockEntity)blockEntity;
            return DecoratedPotBlockEntity.createDecoratedPotInstance((PotDecorations)decoratedPotBlockEntity.getDecorations());
        }
        return new ItemStack((ItemLike)((IBlock)stateSchematic.getBlock()).getItemForBlockState(stateSchematic));
    }
}

