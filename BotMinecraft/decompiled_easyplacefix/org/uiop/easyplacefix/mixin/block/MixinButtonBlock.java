/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.ButtonBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.AttachFace
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.ButtonBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.AttachFace;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.ICanUse;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={ButtonBlock.class})
public class MixinButtonBlock
implements IBlock {
    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.CEILING) {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().above());
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(false);
            }
        } else if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.FLOOR) {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below());
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(false);
            }
        } else {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().relative(((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)).getOpposite()));
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(false);
            }
        }
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.CEILING) {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().above());
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(true);
            }
        } else if (stateSchematic.getValue((Property)BlockStateProperties.ATTACH_FACE) == AttachFace.FLOOR) {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().below());
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(true);
            }
        } else {
            BlockState blockState = Minecraft.getInstance().level.getBlockState(blockHitResult.getBlockPos().relative(((Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)).getOpposite()));
            if (blockState.getBlock() instanceof ICanUse) {
                PlayerInputAction.SetShift(true);
            }
        }
    }
}

