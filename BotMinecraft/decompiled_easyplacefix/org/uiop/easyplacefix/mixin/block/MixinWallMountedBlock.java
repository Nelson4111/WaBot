/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.FaceAttachedHorizontalDirectionalBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.AttachFace
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
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
import net.minecraft.world.level.block.FaceAttachedHorizontalDirectionalBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.AttachFace;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={FaceAttachedHorizontalDirectionalBlock.class})
public abstract class MixinWallMountedBlock
implements IBlock {
    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

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
        Tuple<RelativeBlockHitResult, Integer> tuple;
        AttachFace blockFace = (AttachFace)blockState.getValue((Property)BlockStateProperties.ATTACH_FACE);
        Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        if (this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
            switch (blockFace) {
                default: {
                    throw new MatchException(null, null);
                }
                case FLOOR: {
                    tuple = new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.UP, blockPos.below(), false), 1);
                    break;
                }
                case CEILING: {
                    tuple = new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.DOWN, blockPos.above(), false), 1);
                    break;
                }
                case WALL: {
                    tuple = new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(switch (direction) {
                        case Direction.EAST -> new Vec3(1.0, 0.5, 0.5);
                        case Direction.SOUTH -> new Vec3(0.5, 0.5, 1.0);
                        case Direction.WEST -> new Vec3(0.0, 0.5, 0.5);
                        default -> new Vec3(0.5, 0.5, 0.0);
                    }, direction, blockPos.relative(direction.getOpposite()), false), 1);
                    break;
                }
            }
        } else {
            tuple = null;
        }
        return tuple;
    }
}

