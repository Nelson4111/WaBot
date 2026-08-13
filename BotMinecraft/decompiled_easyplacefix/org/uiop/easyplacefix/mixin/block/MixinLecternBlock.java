/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.ModifyReturnValue
 *  net.minecraft.core.Direction
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.block.LecternBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 */
package org.uiop.easyplacefix.mixin.block;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.block.LecternBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.util.PlayerBlockAction;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={LecternBlock.class})
public class MixinLecternBlock
implements IBlock {
    @ModifyReturnValue(method={"getStateForPlacement"}, at={@At(value="RETURN")})
    private BlockState easyplacefix$overridePlacementState(BlockState original, BlockPlaceContext context) {
        BlockState override = PlayerBlockAction.useItemOnAction.consumePlacementStateOverrideFor(LecternBlock.class, context.getClickedPos());
        if (override == null || original == null) {
            return original;
        }
        if (original.hasProperty((Property)BlockStateProperties.HORIZONTAL_FACING) && override.hasProperty((Property)BlockStateProperties.HORIZONTAL_FACING)) {
            return (BlockState)original.setValue((Property)BlockStateProperties.HORIZONTAL_FACING, (Comparable)((Direction)override.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)));
        }
        return original;
    }

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

