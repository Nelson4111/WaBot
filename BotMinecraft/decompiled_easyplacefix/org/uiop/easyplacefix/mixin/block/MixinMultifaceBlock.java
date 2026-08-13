/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.MultifaceBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.AttachFace
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.BooleanProperty
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
import net.minecraft.world.level.block.MultifaceBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.AttachFace;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.BooleanProperty;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={MultifaceBlock.class})
public abstract class MixinMultifaceBlock
implements IBlock {
    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

    private static Vec3 getFaceCenter(Direction direction) {
        return switch (direction) {
            default -> throw new MatchException(null, null);
            case Direction.EAST -> new Vec3(1.0, 0.5, 0.5);
            case Direction.SOUTH -> new Vec3(0.5, 0.5, 1.0);
            case Direction.WEST -> new Vec3(0.0, 0.5, 0.5);
            case Direction.NORTH -> new Vec3(0.5, 0.5, 0.0);
            case Direction.UP -> new Vec3(0.5, 1.0, 0.5);
            case Direction.DOWN -> new Vec3(0.5, 0.0, 0.5);
        };
    }

    private static Direction findAttachedFace(BlockState blockState) {
        for (Direction direction : Direction.values()) {
            BooleanProperty faceProperty = MultifaceBlock.getFaceProperty((Direction)direction);
            if (!blockState.hasProperty((Property)faceProperty) || !((Boolean)blockState.getValue((Property)faceProperty)).booleanValue()) continue;
            return direction;
        }
        return null;
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        if (!this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos)) {
            return null;
        }
        if (blockState.hasProperty((Property)BlockStateProperties.ATTACH_FACE) && blockState.hasProperty((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            AttachFace blockFace = (AttachFace)blockState.getValue((Property)BlockStateProperties.ATTACH_FACE);
            Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
            int clicks = blockState.hasProperty((Property)BlockStateProperties.POWERED) && (Boolean)blockState.getValue((Property)BlockStateProperties.POWERED) != false ? 2 : 1;
            return switch (blockFace) {
                default -> throw new MatchException(null, null);
                case AttachFace.FLOOR -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.UP, blockPos.below(), false), clicks);
                case AttachFace.CEILING -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.DOWN, blockPos.above(), false), clicks);
                case AttachFace.WALL -> new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(MixinMultifaceBlock.getFaceCenter(direction), direction, blockPos.relative(direction.getOpposite()), false), clicks);
            };
        }
        Direction attachedFace = MixinMultifaceBlock.findAttachedFace(blockState);
        if (attachedFace == null) {
            return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), Direction.UP, blockPos, false), 1);
        }
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(MixinMultifaceBlock.getFaceCenter(attachedFace), attachedFace, blockPos.relative(attachedFace.getOpposite()), false), 1);
    }
}

