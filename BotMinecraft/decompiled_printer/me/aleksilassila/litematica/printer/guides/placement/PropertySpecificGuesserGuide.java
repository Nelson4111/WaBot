/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.BambooStalkBlock
 *  net.minecraft.world.level.block.CactusBlock
 *  net.minecraft.world.level.block.CandleBlock
 *  net.minecraft.world.level.block.CrossCollisionBlock
 *  net.minecraft.world.level.block.EndPortalFrameBlock
 *  net.minecraft.world.level.block.LeavesBlock
 *  net.minecraft.world.level.block.PointedDripstoneBlock
 *  net.minecraft.world.level.block.RedStoneWireBlock
 *  net.minecraft.world.level.block.SaplingBlock
 *  net.minecraft.world.level.block.ScaffoldingBlock
 *  net.minecraft.world.level.block.SeaPickleBlock
 *  net.minecraft.world.level.block.SnowLayerBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 */
package me.aleksilassila.litematica.printer.guides.placement;

import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GuesserGuide;
import net.minecraft.world.level.block.BambooStalkBlock;
import net.minecraft.world.level.block.CactusBlock;
import net.minecraft.world.level.block.CandleBlock;
import net.minecraft.world.level.block.CrossCollisionBlock;
import net.minecraft.world.level.block.EndPortalFrameBlock;
import net.minecraft.world.level.block.LeavesBlock;
import net.minecraft.world.level.block.PointedDripstoneBlock;
import net.minecraft.world.level.block.RedStoneWireBlock;
import net.minecraft.world.level.block.SaplingBlock;
import net.minecraft.world.level.block.ScaffoldingBlock;
import net.minecraft.world.level.block.SeaPickleBlock;
import net.minecraft.world.level.block.SnowLayerBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public class PropertySpecificGuesserGuide
extends GuesserGuide {
    protected static Property<?>[] ignoredProperties = new Property[]{RedStoneWireBlock.POWER, RedStoneWireBlock.EAST, RedStoneWireBlock.NORTH, RedStoneWireBlock.SOUTH, RedStoneWireBlock.WEST, BlockStateProperties.POWERED, BlockStateProperties.OPEN, PointedDripstoneBlock.THICKNESS, ScaffoldingBlock.DISTANCE, ScaffoldingBlock.BOTTOM, CactusBlock.AGE, BambooStalkBlock.AGE, BambooStalkBlock.LEAVES, BambooStalkBlock.STAGE, SaplingBlock.STAGE, CrossCollisionBlock.EAST, CrossCollisionBlock.NORTH, CrossCollisionBlock.SOUTH, CrossCollisionBlock.WEST, SnowLayerBlock.LAYERS, SeaPickleBlock.PICKLES, CandleBlock.CANDLES, EndPortalFrameBlock.HAS_EYE, BlockStateProperties.LIT, LeavesBlock.DISTANCE, LeavesBlock.PERSISTENT, BlockStateProperties.ATTACHED, BlockStateProperties.NOTEBLOCK_INSTRUMENT};

    public PropertySpecificGuesserGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected boolean statesEqual(BlockState resultState, BlockState targetState) {
        return this.statesEqualIgnoreProperties(resultState, targetState, ignoredProperties);
    }
}

