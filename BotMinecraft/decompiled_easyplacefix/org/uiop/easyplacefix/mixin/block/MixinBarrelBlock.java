/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.level.block.BarrelBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.level.block.BarrelBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

@Mixin(value={BarrelBlock.class})
public class MixinBarrelBlock
implements IBlock {
    @Override
    public boolean HasSleepTime(BlockState blockState) {
        Direction facing = (Direction)blockState.getValue((Property)BlockStateProperties.FACING);
        return facing != Direction.UP && facing != Direction.DOWN;
    }

    @Override
    public InteractionResult isWorldTermination(BlockPos pos, BlockState blockState, BlockState worldBlockstate) {
        if (easyPlacefixConfig.Allow_Interaction.getBooleanValue()) {
            return InteractionResult.PASS;
        }
        return null;
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.FACING)) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN -> new Tuple<LookAt, LookAt>(LookAt.PlayerYaw, LookAt.Up);
            case Direction.UP -> new Tuple<LookAt, LookAt>(LookAt.PlayerYaw, LookAt.Down);
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            case Direction.NORTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
        };
    }
}

