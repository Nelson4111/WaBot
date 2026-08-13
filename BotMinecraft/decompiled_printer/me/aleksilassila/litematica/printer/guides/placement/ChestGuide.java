/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.ChestType
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.ChestType;

public class ChestGuide
extends GeneralPlacementGuide {
    public ChestGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected boolean getRequiresExplicitShift() {
        return true;
    }

    @Override
    public boolean skipOtherGuides() {
        return true;
    }

    @Override
    protected Optional<Direction> getLookDirection() {
        return ChestGuide.getProperty(this.targetState, ChestBlock.FACING).flatMap(facing -> Optional.of(facing.getOpposite()));
    }

    @Override
    protected List<Direction> getPossibleSides() {
        ChestType targetType = ChestGuide.getProperty(this.targetState, ChestBlock.TYPE).orElse(null);
        Direction targetFacing = ChestGuide.getProperty(this.targetState, ChestBlock.FACING).orElse(null);
        ArrayList<Direction> sides = new ArrayList<Direction>();
        if (targetFacing == null || targetType == null) {
            return sides;
        }
        for (Direction direction : Direction.values()) {
            if (targetType == ChestType.SINGLE && !this.willConnectToSide(this.state, direction)) {
                sides.add(direction);
                continue;
            }
            if (!this.wantsToConnectToSide(this.state, direction) || !this.willConnectToSide(this.state, direction)) continue;
            sides.add(direction);
        }
        if (sides.isEmpty()) {
            for (Direction direction : Direction.values()) {
                if (this.wantsToConnectToSide(this.state, direction) || this.willConnectToSide(this.state, direction)) continue;
                sides.add(direction);
            }
        }
        return sides;
    }

    private boolean willConnectToSide(SchematicBlockState state, Direction neighborDirection) {
        BlockState neighbor = state.offset((Direction)neighborDirection).currentState;
        ChestType neighborType = ChestGuide.getProperty(neighbor, ChestBlock.TYPE).orElse(null);
        Direction neighborFacing = ChestGuide.getProperty(neighbor, ChestBlock.FACING).orElse(null);
        Direction facing = ChestGuide.getProperty(state.targetState, ChestBlock.FACING).orElse(null);
        if (neighborType == null || neighborFacing == null || facing == null) {
            return false;
        }
        if (facing.getAxis() == neighborDirection.getAxis() || neighborDirection.getAxis() == Direction.Axis.Y) {
            return false;
        }
        return neighborType == ChestType.SINGLE && neighborFacing == facing && state.targetState.getBlock() == neighbor.getBlock();
    }

    private boolean wantsToConnectToSide(SchematicBlockState state, Direction direction) {
        ChestType type = ChestGuide.getProperty(state.targetState, ChestBlock.TYPE).orElse(null);
        Direction facing = ChestGuide.getProperty(state.targetState, ChestBlock.FACING).orElse(null);
        if (type == null || facing == null || type == ChestType.SINGLE) {
            return false;
        }
        Direction neighborDirection = type == ChestType.LEFT ? facing.getClockWise() : facing.getCounterClockWise();
        return direction == neighborDirection;
    }
}

