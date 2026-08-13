/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.GrindstoneBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.AttachFace
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
import net.minecraft.world.level.block.GrindstoneBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.AttachFace;
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

@Mixin(value={GrindstoneBlock.class})
public abstract class MixinGrindstoneBlock
implements IBlock {
    @Override
    public boolean HasSleepTime(BlockState blockState) {
        return blockState.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.WALL;
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        if (blockState.getValue((Property)BlockStateProperties.ATTACH_FACE) != AttachFace.WALL) {
            return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
                case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
                case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
                case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
                default -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
            };
        }
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            default -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
        };
    }

    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        AttachFace blockFace = (AttachFace)blockState.getValue((Property)BlockStateProperties.ATTACH_FACE);
        Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        return switch (blockFace) {
            default -> throw new MatchException(null, null);
            case AttachFace.FLOOR -> {
                if (this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
                    yield new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.UP, blockPos.below(), false), 1);
                }
                yield null;
            }
            case AttachFace.CEILING -> {
                if (this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
                    yield new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.DOWN, blockPos.above(), false), 1);
                }
                yield null;
            }
            case AttachFace.WALL -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), direction, blockPos, false), 1);
        };
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState;
        if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.CEILING) {
            BlockState blockState2 = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().above());
            if (blockState2.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(false);
            }
        } else if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.FLOOR && (blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below())).getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(false);
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState;
        if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.CEILING) {
            BlockState blockState2 = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().above());
            if (blockState2.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(true);
            }
        } else if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.FLOOR && (blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below())).getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(true);
        }
    }
}

