/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.TripWireHookBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.TripWireHookBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={TripWireHookBlock.class})
public class MixinTripwireHookBlock
implements IBlock {
    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(switch (direction) {
            case Direction.EAST -> new Vec3(1.0, 0.5, 0.5);
            case Direction.SOUTH -> new Vec3(0.5, 0.5, 1.0);
            case Direction.WEST -> new Vec3(0.0, 0.5, 0.5);
            default -> new Vec3(0.5, 0.5, 0.0);
        }, direction, blockPos.relative(direction.getOpposite()), false), 1);
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().relative(((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)).getOpposite()));
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(false);
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().relative(((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)).getOpposite()));
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(true);
        }
    }
}

