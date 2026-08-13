/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={SlabBlock.class})
public class MixinSlabBlock
implements IBlock {
    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        SlabType slabType = (SlabType)blockState.getValue((Property)BlockStateProperties.SLAB_TYPE);
        if (blockState.getBlock().equals(worldBlockState.getBlock())) {
            SlabType slabClientType = (SlabType)worldBlockState.getValue((Property)BlockStateProperties.SLAB_TYPE);
            if (slabType == SlabType.DOUBLE) {
                if (slabClientType == SlabType.TOP) {
                    return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.UP, blockPos, false), 1);
                }
                return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.DOWN, blockPos, false), 1);
            }
            return null;
        }
        return switch (slabType) {
            default -> throw new MatchException(null, null);
            case SlabType.TOP -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.DOWN, blockPos, false), 1);
            case SlabType.BOTTOM -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.UP, blockPos, false), 1);
            case SlabType.DOUBLE -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), Direction.UP, blockPos, false), 2);
        };
    }
}

