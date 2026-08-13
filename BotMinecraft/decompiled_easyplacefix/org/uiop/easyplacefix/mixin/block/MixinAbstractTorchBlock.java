/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.BaseTorchBlock
 *  net.minecraft.world.level.block.state.BlockState
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
import net.minecraft.world.level.block.BaseTorchBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={BaseTorchBlock.class})
public abstract class MixinAbstractTorchBlock
implements IBlock {
    @Shadow
    protected abstract boolean canSurvive(BlockState var1, LevelReader var2, BlockPos var3);

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

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        return this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos) ? new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 1.0, 0.5), Direction.UP, blockPos.below(), false), 1) : null;
    }
}

