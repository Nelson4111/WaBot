/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.BambooSaplingBlock
 *  net.minecraft.world.level.block.BambooStalkBlock
 *  net.minecraft.world.level.block.BigDripleafBlock
 *  net.minecraft.world.level.block.BigDripleafStemBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.HorizontalDirectionalBlock
 *  net.minecraft.world.level.block.TripWireBlock
 *  net.minecraft.world.level.block.TwistingVinesBlock
 *  net.minecraft.world.level.block.TwistingVinesPlantBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 */
package me.aleksilassila.litematica.printer.guides.placement;

import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GuesserGuide;
import net.minecraft.world.level.block.BambooSaplingBlock;
import net.minecraft.world.level.block.BambooStalkBlock;
import net.minecraft.world.level.block.BigDripleafBlock;
import net.minecraft.world.level.block.BigDripleafStemBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.HorizontalDirectionalBlock;
import net.minecraft.world.level.block.TripWireBlock;
import net.minecraft.world.level.block.TwistingVinesBlock;
import net.minecraft.world.level.block.TwistingVinesPlantBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;

public class BlockIndifferentGuesserGuide
extends GuesserGuide {
    public BlockIndifferentGuesserGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected boolean statesEqual(BlockState resultState, BlockState targetState) {
        Block targetBlock = targetState.getBlock();
        Block resultBlock = resultState.getBlock();
        if (targetBlock instanceof BambooStalkBlock) {
            return resultBlock instanceof BambooStalkBlock || resultBlock instanceof BambooSaplingBlock;
        }
        if (targetBlock instanceof BigDripleafStemBlock && (resultBlock instanceof BigDripleafBlock || resultBlock instanceof BigDripleafStemBlock)) {
            return resultState.getValue((Property)HorizontalDirectionalBlock.FACING) == targetState.getValue((Property)HorizontalDirectionalBlock.FACING);
        }
        if (targetBlock instanceof TwistingVinesPlantBlock) {
            if (resultBlock instanceof TwistingVinesBlock) {
                return true;
            }
            if (resultBlock instanceof TwistingVinesPlantBlock) {
                return this.statesEqualIgnoreProperties(resultState, targetState, new Property[]{TwistingVinesBlock.AGE});
            }
        }
        if (targetBlock instanceof TripWireBlock && resultBlock instanceof TripWireBlock) {
            return this.statesEqualIgnoreProperties(resultState, targetState, new Property[]{TripWireBlock.ATTACHED, TripWireBlock.DISARMED, TripWireBlock.POWERED, TripWireBlock.NORTH, TripWireBlock.EAST, TripWireBlock.SOUTH, TripWireBlock.WEST});
        }
        return super.statesEqual(resultState, targetState);
    }
}

