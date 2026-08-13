/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.ModifyReturnValue
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.block.StairBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Half
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 */
package org.uiop.easyplacefix.mixin.block;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Half;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={StairBlock.class})
public class MixinStairsBlock
implements IBlock {
    @ModifyReturnValue(method={"getStateForPlacement"}, at={@At(value="RETURN")})
    private BlockState easyplacefix$overridePlacementState(BlockState original, BlockPlaceContext context) {
        BlockState override = PlayerBlockAction.useItemOnAction.consumePlacementStateOverrideFor(StairBlock.class, context.getClickedPos());
        if (override == null || original == null) {
            return original;
        }
        BlockState result = original;
        if (result.hasProperty((Property)BlockStateProperties.HORIZONTAL_FACING) && override.hasProperty((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            result = (BlockState)result.setValue((Property)BlockStateProperties.HORIZONTAL_FACING, (Comparable)((Direction)override.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)));
        }
        if (result.hasProperty((Property)BlockStateProperties.HALF) && override.hasProperty((Property)BlockStateProperties.HALF)) {
            result = (BlockState)result.setValue((Property)BlockStateProperties.HALF, (Comparable)((Half)override.getValue((Property)BlockStateProperties.HALF)));
        }
        return result;
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            default -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
        };
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        Half blockHalf = (Half)blockState.getValue((Property)BlockStateProperties.HALF);
        return switch (blockHalf) {
            default -> throw new MatchException(null, null);
            case Half.TOP -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0625, 0.5), Direction.DOWN, blockPos, false), 1);
            case Half.BOTTOM -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.9375, 0.5), Direction.UP, blockPos, false), 1);
        };
    }
}

