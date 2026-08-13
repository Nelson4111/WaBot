/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package org.uiop.easyplacefix;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerRotationAction;

public interface IBlock {
    default public boolean hasYawPitch() {
        return false;
    }

    default public boolean HasSleepTime(BlockState blockState) {
        return false;
    }

    default public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return null;
    }

    default public Tuple<Float, Float> getLimitYawAndPitch(BlockState blockState) {
        Tuple<LookAt, LookAt> lookAtPair = this.getYawAndPitch(blockState);
        if (lookAtPair != null) {
            return new Tuple<Float, Float>(PlayerRotationAction.limitYawRotation(Direction.fromYRot((double)lookAtPair.getA().Value())), Float.valueOf(lookAtPair.getB().Value()));
        }
        return null;
    }

    default public Direction getSide(BlockState blockState) {
        return null;
    }

    default public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), Direction.UP, blockPos, false), 1);
    }

    default public void BlockAction(BlockState blockState, BlockHitResult blockHitResult) {
    }

    default public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
    }

    default public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
    }

    default public InteractionResult isSchemaTermination(BlockPos pos, BlockState blockState, BlockState worldBlockstate) {
        return null;
    }

    default public InteractionResult isWorldTermination(BlockPos pos, BlockState blockState, BlockState worldBlockstate) {
        return null;
    }

    default public Item getItemForBlockState(BlockState blockState) {
        return null;
    }
}

