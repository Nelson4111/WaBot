/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.SeaPickleBlock
 *  net.minecraft.world.level.block.VegetationBlock
 *  net.minecraft.world.level.block.state.BlockBehaviour$Properties
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.SeaPickleBlock;
import net.minecraft.world.level.block.VegetationBlock;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={SeaPickleBlock.class})
public abstract class MixinSeaPickleBlock
extends VegetationBlock
implements IBlock {
    protected MixinSeaPickleBlock(BlockBehaviour.Properties settings) {
        super(settings);
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        int count;
        if (worldBlockState.getBlock() == blockState.getBlock()) {
            count = (Integer)blockState.getValue((Property)BlockStateProperties.PICKLES) - (Integer)worldBlockState.getValue((Property)BlockStateProperties.PICKLES);
            if (count < 1) {
                return null;
            }
        } else {
            count = (Integer)blockState.getValue((Property)BlockStateProperties.PICKLES);
        }
        return this.canSurvive(blockState, (LevelReader)Minecraft.getInstance().level, blockPos) ? new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), Direction.UP, blockPos, false), count) : null;
    }
}

