/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.phys.Vec3
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.List;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.Vec3;

public class SlabGuide
extends GeneralPlacementGuide {
    public SlabGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected List<Direction> getPossibleSides() {
        Direction[] directionsToCheck;
        ArrayList<Direction> resultList = new ArrayList<Direction>();
        SlabType targetSlabType = SlabGuide.getProperty(this.state.targetState, SlabBlock.TYPE).orElse(SlabType.DOUBLE);
        if (targetSlabType == SlabType.DOUBLE) {
            return super.getPossibleSides();
        }
        for (Direction direction : directionsToCheck = new Direction[]{Direction.NORTH, Direction.SOUTH, Direction.WEST, Direction.EAST}) {
            SlabType neighborSlabType = SlabGuide.getProperty(this.state.offset((Direction)direction).currentState, SlabBlock.TYPE).orElse(SlabType.DOUBLE);
            if (neighborSlabType != SlabType.DOUBLE && neighborSlabType != targetSlabType) continue;
            resultList.add(direction);
        }
        if (targetSlabType == SlabType.TOP || targetSlabType == SlabType.BOTTOM) {
            Direction verticalDirection = targetSlabType == SlabType.TOP ? Direction.UP : Direction.DOWN;
            SlabType neighborSlabType = SlabGuide.getProperty(this.state.offset((Direction)verticalDirection).currentState, SlabBlock.TYPE).orElse(SlabType.DOUBLE);
            if (neighborSlabType == SlabType.DOUBLE || neighborSlabType != targetSlabType) {
                resultList.add(verticalDirection);
            }
        }
        return resultList;
    }

    @Override
    protected Vec3 getHitModifier(Direction validSide) {
        Direction requiredHalf = this.getRequiredHalf(this.state);
        if (validSide.get2DDataValue() != -1) {
            return new Vec3(0.0, (double)requiredHalf.getStepY() * 0.25, 0.0);
        }
        return new Vec3(0.0, 0.0, 0.0);
    }

    private Direction getRequiredHalf(SchematicBlockState state) {
        BlockState targetState = state.targetState;
        BlockState currentState = state.currentState;
        if (!currentState.hasProperty((Property)SlabBlock.TYPE)) {
            return targetState.getValue((Property)SlabBlock.TYPE) == SlabType.TOP ? Direction.UP : Direction.DOWN;
        }
        if (currentState.getValue((Property)SlabBlock.TYPE) != targetState.getValue((Property)SlabBlock.TYPE)) {
            return currentState.getValue((Property)SlabBlock.TYPE) == SlabType.TOP ? Direction.DOWN : Direction.UP;
        }
        return Direction.DOWN;
    }
}

