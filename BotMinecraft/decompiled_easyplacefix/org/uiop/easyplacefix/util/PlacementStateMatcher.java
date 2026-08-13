/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.LecternBlock
 *  net.minecraft.world.level.block.ShelfBlock
 *  net.minecraft.world.level.block.StairBlock
 *  net.minecraft.world.level.block.TrapDoorBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 */
package org.uiop.easyplacefix.util;

import net.minecraft.world.level.block.LecternBlock;
import net.minecraft.world.level.block.ShelfBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.TrapDoorBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public final class PlacementStateMatcher {
    private PlacementStateMatcher() {
    }

    public static boolean isSatisfied(BlockState schematic, BlockState world) {
        if (schematic.getBlock() != world.getBlock()) {
            return false;
        }
        if (schematic.getBlock() instanceof StairBlock) {
            return PlacementStateMatcher.hasSameHorizontalFacing(schematic, world) && schematic.getValue((Property)BlockStateProperties.HALF) == world.getValue((Property)BlockStateProperties.HALF);
        }
        if (schematic.getBlock() instanceof TrapDoorBlock) {
            boolean worldPowered;
            if (!PlacementStateMatcher.hasSameHorizontalFacing(schematic, world) || schematic.getValue((Property)BlockStateProperties.HALF) != world.getValue((Property)BlockStateProperties.HALF)) {
                return false;
            }
            boolean schematicPowered = schematic.hasProperty((Property)BlockStateProperties.POWERED) && (Boolean)schematic.getValue((Property)BlockStateProperties.POWERED) != false;
            boolean bl = worldPowered = world.hasProperty((Property)BlockStateProperties.POWERED) && (Boolean)world.getValue((Property)BlockStateProperties.POWERED) != false;
            if (schematicPowered || worldPowered) {
                return true;
            }
            return schematic.getValue((Property)BlockStateProperties.OPEN) == world.getValue((Property)BlockStateProperties.OPEN);
        }
        if (schematic.getBlock() instanceof ShelfBlock || schematic.getBlock() instanceof LecternBlock) {
            return PlacementStateMatcher.hasSameHorizontalFacing(schematic, world);
        }
        return schematic.equals((Object)world);
    }

    public static boolean shouldUsePlacementOverride(BlockState blockState) {
        return blockState.getBlock() instanceof StairBlock || blockState.getBlock() instanceof TrapDoorBlock || blockState.getBlock() instanceof ShelfBlock || blockState.getBlock() instanceof LecternBlock;
    }

    private static boolean hasSameHorizontalFacing(BlockState schematic, BlockState world) {
        return schematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING) == world.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
    }
}

