/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.RailShape
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GuesserGuide;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.RailShape;

public class RailGuesserGuide
extends GuesserGuide {
    static final RailShape[] STRAIGHT_RAIL_SHAPES = new RailShape[]{RailShape.NORTH_SOUTH, RailShape.EAST_WEST};

    public RailGuesserGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean skipOtherGuides() {
        return true;
    }

    @Override
    protected boolean statesEqual(BlockState resultState, BlockState targetState) {
        if (!this.wouldConnectCorrectly()) {
            return false;
        }
        if (this.getRailShape(resultState).isPresent() && Arrays.stream(STRAIGHT_RAIL_SHAPES).anyMatch(shape -> shape == this.getRailShape(resultState).orElse(null))) {
            return super.statesEqualIgnoreProperties(resultState, targetState, new Property[]{BlockStateProperties.RAIL_SHAPE, BlockStateProperties.RAIL_SHAPE_STRAIGHT, BlockStateProperties.POWERED});
        }
        return super.statesEqual(resultState, targetState);
    }

    private boolean wouldConnectCorrectly() {
        RailShape targetShape = this.getRailShape(this.state.targetState).orElse(null);
        if (targetShape == null) {
            return false;
        }
        List<Direction> allowedConnections = this.getRailDirections(targetShape);
        ArrayList<Direction> possibleConnections = new ArrayList<Direction>();
        for (Direction d : Direction.values()) {
            SchematicBlockState neighbor;
            if (d.getAxis().isVertical() || !this.hasFreeConnections(neighbor = this.state.offset(d))) continue;
            possibleConnections.add(d);
        }
        if (possibleConnections.size() > 2) {
            return false;
        }
        return new HashSet<Direction>(allowedConnections).containsAll(possibleConnections);
    }

    private boolean hasFreeConnections(SchematicBlockState state) {
        List<Direction> possibleConnections = this.getRailDirections(state);
        if (possibleConnections.isEmpty()) {
            return false;
        }
        for (Direction d : possibleConnections) {
            SchematicBlockState neighbor = state.offset(d);
            if (neighbor.currentState.getBlock() == neighbor.currentState.getBlock()) continue;
            return false;
        }
        return possibleConnections.stream().anyMatch(possibleDirection -> {
            SchematicBlockState neighbor = state.offset((Direction)possibleDirection);
            return !this.getRailDirections(neighbor).contains(possibleDirection.getOpposite());
        });
    }

    private List<Direction> getRailDirections(SchematicBlockState state) {
        RailShape shape = this.getRailShape(state.currentState).orElse(null);
        if (shape == null) {
            return new ArrayList<Direction>();
        }
        return this.getRailDirections(shape);
    }

    private List<Direction> getRailDirections(RailShape railShape) {
        String name = railShape.getName();
        if (railShape.isSlope()) {
            Direction d = Direction.valueOf((String)name.replace("ascending_", "").toUpperCase());
            return Arrays.asList(d, d.getOpposite());
        }
        Direction d1 = Direction.valueOf((String)name.split("_")[0].toUpperCase());
        Direction d2 = Direction.valueOf((String)name.split("_")[1].toUpperCase());
        return Arrays.asList(d1, d2);
    }

    Optional<RailShape> getRailShape(BlockState state) {
        Optional<RailShape> shape = RailGuesserGuide.getProperty(state, BlockStateProperties.RAIL_SHAPE);
        if (shape.isEmpty()) {
            return RailGuesserGuide.getProperty(state, BlockStateProperties.RAIL_SHAPE_STRAIGHT);
        }
        return shape;
    }
}

