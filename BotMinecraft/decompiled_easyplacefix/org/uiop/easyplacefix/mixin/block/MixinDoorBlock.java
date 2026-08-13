/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockSetType
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.DoorHingeSide
 *  net.minecraft.world.level.block.state.properties.DoubleBlockHalf
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockSetType;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.DoorHingeSide;
import net.minecraft.world.level.block.state.properties.DoubleBlockHalf;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={DoorBlock.class})
public abstract class MixinDoorBlock
implements IBlock {
    @Shadow
    @Final
    private BlockSetType type;

    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.PlayerPitch);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.PlayerPitch);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.PlayerPitch);
            default -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.PlayerPitch);
        };
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        Tuple<RelativeBlockHitResult, Integer> tuple;
        Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        DoorHingeSide doorHinge = (DoorHingeSide)blockState.getValue((Property)BlockStateProperties.DOOR_HINGE);
        if (blockState.getValue((Property)BlockStateProperties.DOUBLE_BLOCK_HALF) == DoubleBlockHalf.UPPER) {
            blockPos = blockPos.below();
            blockState = (BlockState)blockState.setValue((Property)BlockStateProperties.DOUBLE_BLOCK_HALF, (Comparable)DoubleBlockHalf.LOWER);
        }
        if (this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
            tuple = new Tuple<RelativeBlockHitResult, Integer>(switch (direction) {
                case Direction.SOUTH -> {
                    if (doorHinge == DoorHingeSide.LEFT) {
                        yield new RelativeBlockHitResult(new Vec3(0.8, 1.0, 0.0), Direction.UP, blockPos.below(), false);
                    }
                    yield new RelativeBlockHitResult(new Vec3(0.2, 1.0, 0.0), Direction.UP, blockPos.below(), false);
                }
                case Direction.WEST -> {
                    if (doorHinge == DoorHingeSide.LEFT) {
                        yield new RelativeBlockHitResult(new Vec3(0.0, 1.0, 0.8), Direction.UP, blockPos.below(), false);
                    }
                    yield new RelativeBlockHitResult(new Vec3(0.0, 1.0, 0.2), Direction.UP, blockPos.below(), false);
                }
                case Direction.EAST -> {
                    if (doorHinge == DoorHingeSide.LEFT) {
                        yield new RelativeBlockHitResult(new Vec3(0.0, 1.0, 0.2), Direction.UP, blockPos.below(), false);
                    }
                    yield new RelativeBlockHitResult(new Vec3(0.0, 1.0, 0.8), Direction.UP, blockPos.below(), false);
                }
                default -> doorHinge == DoorHingeSide.LEFT ? new RelativeBlockHitResult(new Vec3(0.2, 0.0, 0.0), Direction.UP, blockPos, false) : new RelativeBlockHitResult(new Vec3(0.8, 0.0, 0.0), Direction.UP, blockPos, false);
            }, (Boolean)blockState.getValue((Property)BlockStateProperties.OPEN) != false && this.type.canOpenByHand() ? 2 : 1);
        } else {
            tuple = null;
        }
        return tuple;
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        DoubleBlockHalf doorHinge = (DoubleBlockHalf)stateSchematic.getValue((Property)BlockStateProperties.DOUBLE_BLOCK_HALF);
        BlockState blockState = doorHinge == DoubleBlockHalf.LOWER ? Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below()) : Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below(2));
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(false);
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        DoubleBlockHalf doorHinge = (DoubleBlockHalf)stateSchematic.getValue((Property)BlockStateProperties.DOUBLE_BLOCK_HALF);
        BlockState blockState = doorHinge == DoubleBlockHalf.LOWER ? Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below()) : Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below(2));
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(true);
        }
    }
}

