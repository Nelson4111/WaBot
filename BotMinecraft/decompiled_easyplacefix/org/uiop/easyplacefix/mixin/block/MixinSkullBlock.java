/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.SkullBlock
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
import net.minecraft.world.level.block.SkullBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={SkullBlock.class})
public class MixinSkullBlock
implements IBlock {
    @Override
    public Tuple<Float, Float> getLimitYawAndPitch(BlockState blockState) {
        Tuple<LookAt, LookAt> lookAtPair = this.getYawAndPitch(blockState);
        return new Tuple<Float, Float>(Float.valueOf(lookAtPair.getA().Value()), Float.valueOf(lookAtPair.getB().Value()));
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return new Tuple<LookAt, LookAt>(LookAt.of((Integer)blockState.getValue((Property)BlockStateProperties.ROTATION_16) * 23), LookAt.Down);
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.0, 0.5), Direction.UP, blockPos, false), 1);
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below());
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(false);
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below());
        if (blockState.getBlock() instanceof ICanUse) {
            PlayerInputAction.SetShift(true);
        }
    }
}

