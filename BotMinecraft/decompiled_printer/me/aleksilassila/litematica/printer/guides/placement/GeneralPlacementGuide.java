/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nullable
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.RotatedPillarBlock
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nullable;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.guides.placement.PlacementGuide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.RotatedPillarBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public class GeneralPlacementGuide
extends PlacementGuide {
    public GeneralPlacementGuide(SchematicBlockState state) {
        super(state);
    }

    protected List<Direction> getPossibleSides() {
        return Arrays.asList(Direction.values());
    }

    protected Optional<Direction> getLookDirection() {
        return Optional.empty();
    }

    protected boolean getRequiresSupport() {
        return false;
    }

    protected boolean getRequiresExplicitShift() {
        return false;
    }

    protected Vec3 getHitModifier(Direction validSide) {
        return new Vec3(0.0, 0.0, 0.0);
    }

    private Optional<Direction> getValidSide(SchematicBlockState state) {
        boolean printInAir = Configs.PRINT_IN_AIR.getBooleanValue();
        List<Direction> sides = this.getPossibleSides();
        if (sides.isEmpty()) {
            return Optional.empty();
        }
        if (printInAir && !this.getRequiresSupport()) {
            if (!sides.isEmpty()) {
                return Optional.of(sides.get(0));
            }
            return Optional.of(Direction.UP);
        }
        ArrayList validSides = new ArrayList();
        for (Direction side : sides) {
            SchematicBlockState neighborState = state.offset(side);
            if (GeneralPlacementGuide.getProperty(neighborState.currentState, SlabBlock.TYPE).orElse(null) == SlabType.DOUBLE) {
                validSides.add(side);
                continue;
            }
            if (!GeneralPlacementGuide.canBeClicked(neighborState.world, neighborState.blockPos) || neighborState.currentState.canBeReplaced()) continue;
            validSides.add(side);
        }
        for (Direction validSide : validSides) {
            if (this.isInteractive(state.offset((Direction)validSide).currentState.getBlock())) continue;
            return Optional.of(validSide);
        }
        return validSides.isEmpty() ? Optional.empty() : Optional.of((Direction)validSides.getFirst());
    }

    @Override
    protected boolean getUseShift(SchematicBlockState state) {
        if (this.getRequiresExplicitShift()) {
            return true;
        }
        Direction clickSide = this.getValidSide(state).orElse(null);
        if (clickSide == null) {
            return false;
        }
        return this.isInteractive(state.offset((Direction)clickSide).currentState.getBlock());
    }

    private Optional<Vec3> getHitVector(SchematicBlockState state) {
        boolean printInAir = Configs.PRINT_IN_AIR.getBooleanValue();
        if (printInAir && !this.getRequiresSupport()) {
            return Optional.of(Vec3.atCenterOf((Vec3i)state.blockPos));
        }
        return this.getValidSide(state).map(side -> Vec3.atCenterOf((Vec3i)state.blockPos).add(Vec3.atLowerCornerOf((Vec3i)side.getUnitVec3i()).scale(0.5)).add(this.getHitModifier((Direction)side)));
    }

    @Override
    @Nullable
    public PrinterPlacementContext getPlacementContext(LocalPlayer player) {
        try {
            BlockHitResult blockHitResult;
            Optional<Direction> validSide = this.getValidSide(this.state);
            Optional<Vec3> hitVec = this.getHitVector(this.state);
            Optional<ItemStack> requiredItem = this.getRequiredItem(player);
            int requiredSlot = this.getRequiredItemStackSlot(player);
            if (validSide.isEmpty() || hitVec.isEmpty() || requiredItem.isEmpty() || requiredSlot == -1) {
                return null;
            }
            Optional<Direction> lookDirection = this.getLookDirection();
            boolean requiresShift = this.getUseShift(this.state);
            boolean printInAir = Configs.PRINT_IN_AIR.getBooleanValue();
            if (printInAir && !this.getRequiresSupport()) {
                Direction.Axis axis;
                Direction hitSide = validSide.get().getOpposite();
                hitSide = this.targetState.hasProperty((Property)RotatedPillarBlock.AXIS) ? ((axis = (Direction.Axis)this.targetState.getValue((Property)RotatedPillarBlock.AXIS)) == Direction.Axis.Y ? Direction.DOWN : (axis == Direction.Axis.X ? Direction.WEST : Direction.NORTH)) : Direction.DOWN;
                blockHitResult = new BlockHitResult(hitVec.get(), hitSide, this.state.blockPos, false);
            } else {
                blockHitResult = new BlockHitResult(hitVec.get(), validSide.get().getOpposite(), this.state.blockPos.relative(validSide.get()), false);
            }
            return new PrinterPlacementContext((Player)player, blockHitResult, requiredItem.get(), requiredSlot, lookDirection.orElse(null), requiresShift);
        }
        catch (Exception e) {
            Printer.logger.error("getPlacementContext(): Exception caught: {}", (Object)e.getMessage());
            return null;
        }
    }
}

