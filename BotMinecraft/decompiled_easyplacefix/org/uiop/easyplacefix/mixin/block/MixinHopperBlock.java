/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.HopperBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.HopperBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={HopperBlock.class})
public class MixinHopperBlock
implements IBlock {
    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        Vec3 vec3 = new Vec3(0.5, 0.5, 0.5);
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(vec3, switch ((Direction)blockState.getValue((Property)BlockStateProperties.FACING_HOPPER)) {
            case Direction.SOUTH -> Direction.NORTH;
            case Direction.EAST -> Direction.WEST;
            case Direction.WEST -> Direction.EAST;
            case Direction.NORTH -> Direction.SOUTH;
            default -> Direction.UP;
        }, blockPos, false), 1);
    }
}

