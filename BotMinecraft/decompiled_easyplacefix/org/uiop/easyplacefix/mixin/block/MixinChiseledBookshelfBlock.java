/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.ChiseledBookShelfBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.ChiseledBookShelfBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={ChiseledBookShelfBlock.class})
public class MixinChiseledBookshelfBlock
implements IBlock {
    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            default -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
        };
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        PlayerInputAction.SetShift(true);
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        PlayerInputAction.SetShift(false);
    }
}

