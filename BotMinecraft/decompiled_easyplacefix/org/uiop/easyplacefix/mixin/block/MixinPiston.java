/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.piston.PistonBaseBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.piston.PistonBaseBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;

@Mixin(value={PistonBaseBlock.class})
public class MixinPiston
implements IBlock {
    @Override
    public boolean HasSleepTime(BlockState blockState) {
        Direction facing = (Direction)blockState.getValue((Property)BlockStateProperties.FACING);
        return facing != Direction.UP && facing != Direction.DOWN;
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

