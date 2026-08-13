/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.WallHangingSignBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block.signBlock;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.WallHangingSignBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={WallHangingSignBlock.class})
public abstract class MixinWallHangingSignBlock
implements IBlock {
    @Shadow
    public abstract boolean canPlace(BlockState var1, LevelReader var2, BlockPos var3);

    @Override
    public boolean HasSleepTime(BlockState blockState) {
        return true;
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        ++PlayerBlockAction.openSignEditorAction.count;
    }

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
        Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        return this.canPlace(blockState, (LevelReader)Minecraft.getInstance().level, blockPos) ? new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), direction, blockPos.relative(direction.getOpposite()), false), 1) : null;
    }
}

