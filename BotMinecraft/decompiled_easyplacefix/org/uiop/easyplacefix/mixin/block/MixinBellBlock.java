/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.BellBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BellAttachType
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.BellBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BellAttachType;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={BellBlock.class})
public abstract class MixinBellBlock
implements IBlock {
    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        BellAttachType attachment = (BellAttachType)blockState.getValue((Property)BlockStateProperties.BELL_ATTACHMENT);
        if (attachment == BellAttachType.DOUBLE_WALL || attachment == BellAttachType.SINGLE_WALL) {
            return null;
        }
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            default -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
        };
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState;
        BellAttachType attachment = (BellAttachType)stateSchematic.getValue((Property)BlockStateProperties.BELL_ATTACHMENT);
        BlockPos pos = blockHitResult.getBlockPos();
        switch (attachment) {
            case CEILING: {
                BlockState blockState2 = Minecraft.getInstance().level.getBlockState(pos.above());
                break;
            }
            case FLOOR: {
                BlockState blockState2 = Minecraft.getInstance().level.getBlockState(pos.below());
                break;
            }
            default: {
                BlockState blockState2 = blockState = Minecraft.getInstance().level.getBlockState(pos.relative((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)));
            }
        }
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(false);
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState;
        BellAttachType attachment = (BellAttachType)stateSchematic.getValue((Property)BlockStateProperties.BELL_ATTACHMENT);
        BlockPos pos = blockHitResult.getBlockPos();
        switch (attachment) {
            case CEILING: {
                BlockState blockState2 = Minecraft.getInstance().level.getBlockState(pos.above());
                break;
            }
            case FLOOR: {
                BlockState blockState2 = Minecraft.getInstance().level.getBlockState(pos.below());
                break;
            }
            default: {
                BlockState blockState2 = blockState = Minecraft.getInstance().level.getBlockState(pos.relative((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)));
            }
        }
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(true);
        }
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        Tuple<RelativeBlockHitResult, Integer> tuple;
        Direction facing = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        if (this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
            tuple = new Tuple<RelativeBlockHitResult, Integer>(switch ((BellAttachType)blockState.getValue((Property)BlockStateProperties.BELL_ATTACHMENT)) {
                default -> throw new MatchException(null, null);
                case BellAttachType.CEILING -> new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.DOWN, blockPos.above(), false);
                case BellAttachType.FLOOR -> new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.UP, blockPos.below(), false);
                case BellAttachType.SINGLE_WALL, BellAttachType.DOUBLE_WALL -> {
                    Vec3 v1 = switch (facing) {
                        case Direction.EAST -> new Vec3(1.0, 0.5, 0.5);
                        case Direction.SOUTH -> new Vec3(0.5, 0.5, 1.0);
                        case Direction.WEST -> new Vec3(0.0, 0.5, 0.5);
                        default -> new Vec3(0.5, 0.5, 0.0);
                    };
                    yield new RelativeBlockHitResult(v1, facing.getOpposite(), blockPos.relative(facing), false);
                }
            }, 1);
        } else {
            tuple = null;
        }
        return tuple;
    }
}

