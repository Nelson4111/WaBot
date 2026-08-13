/*
 * Decompiled with CFR 0.152.
 * 
 * GuesserGuide: Brute-force calculation of valid placement contexts.
 * Purely silent calculation — never mutates client player camera.
 */
package me.aleksilassila.litematica.printer.guides.placement;

import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

public class GuesserGuide
extends GeneralPlacementGuide {
    protected static Direction[] directionsToTry = new Direction[]{Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST, Direction.UP, Direction.DOWN};
    protected static Vec3[] hitVecsToTry = new Vec3[]{new Vec3(-0.25, -0.25, -0.25), new Vec3(0.25, -0.25, -0.25), new Vec3(-0.25, 0.25, -0.25), new Vec3(-0.25, -0.25, 0.25), new Vec3(0.25, 0.25, -0.25), new Vec3(-0.25, 0.25, 0.25), new Vec3(0.25, -0.25, 0.25), new Vec3(0.25, 0.25, 0.25)};

    public GuesserGuide(SchematicBlockState state) {
        super(state);
    }

    private BlockState testPlacement(LocalPlayer player, PrinterPlacementContext context) {
        return this.getRequiredItemAsBlock(player).orElse(this.targetState.getBlock())
            .getStateForPlacement((BlockPlaceContext)context);
    }

    @Override
    @Nullable
    public PrinterPlacementContext getPlacementContext(LocalPlayer player) {
        int slot;
        ItemStack requiredItem;
        boolean printInAir = Configs.PRINT_IN_AIR.getBooleanValue();

        if (printInAir && !this.getRequiresSupport()) {
            requiredItem = this.getRequiredItem(player).orElse(ItemStack.EMPTY);
            slot = this.getRequiredItemStackSlot(player);
            if (slot != -1) {
                for (Direction lookDir : directionsToTry) {
                    for (Direction side : directionsToTry) {
                        Vec3 hitVec = Vec3.atCenterOf((Vec3i)this.state.blockPos);
                        BlockHitResult hitResult = new BlockHitResult(hitVec, side.getOpposite(), this.state.blockPos, false);
                        boolean requiresShift = this.getRequiresExplicitShift() || this.isInteractive(this.state.world.getBlockState(this.state.blockPos.relative(side.getOpposite())).getBlock());
                        PrinterPlacementContext context = new PrinterPlacementContext((Player)player, hitResult, requiredItem, slot, lookDir, requiresShift);
                        BlockState result = this.testPlacement(player, context);
                        if (result == null || !this.statesEqual(result, this.targetState) && !this.correctChestPlacement(this.targetState, result)) continue;
                        return context;
                    }
                }
            }
        }

        requiredItem = this.getRequiredItem(player).orElse(ItemStack.EMPTY);
        slot = this.getRequiredItemStackSlot(player);
        if (slot == -1) {
            return null;
        }
        for (Direction lookDirection : directionsToTry) {
            for (Direction side : directionsToTry) {
                boolean requiresShift;
                BlockPos neighborPos = this.state.blockPos.relative(side);
                BlockState neighborState = this.state.world.getBlockState(neighborPos);
                boolean bl = requiresShift = this.getRequiresExplicitShift() || this.isInteractive(neighborState.getBlock());
                if (!GuesserGuide.canBeClicked(this.state.world, neighborPos) || neighborState.canBeReplaced()) continue;
                Vec3 hitVec = Vec3.atCenterOf((Vec3i)this.state.blockPos).add(Vec3.atLowerCornerOf((Vec3i)side.getUnitVec3i()).scale(0.5));
                for (Vec3 hitVecToTry : hitVecsToTry) {
                    Vec3 multiplier = Vec3.atLowerCornerOf((Vec3i)side.getUnitVec3i());
                    multiplier = new Vec3(multiplier.x == 0.0 ? 1.0 : 0.0, multiplier.y == 0.0 ? 1.0 : 0.0, multiplier.z == 0.0 ? 1.0 : 0.0);
                    BlockHitResult hitResult = new BlockHitResult(hitVec.add(hitVecToTry.multiply(multiplier)), side.getOpposite(), neighborPos, false);
                    PrinterPlacementContext context = new PrinterPlacementContext((Player)player, hitResult, requiredItem, slot, lookDirection, requiresShift);
                    BlockState result = this.testPlacement(player, context);
                    if (result == null || !this.statesEqual(result, this.targetState) && !this.correctChestPlacement(this.targetState, result)) continue;
                    return context;
                }
            }
        }
        return null;
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (this.targetState.getBlock() instanceof SlabBlock) {
            return false;
        }
        PrinterPlacementContext ctx = this.getPlacementContext(player);
        if (ctx == null) {
            return false;
        }
        return super.canExecute(player);
    }

    private boolean correctChestPlacement(BlockState targetState, BlockState result) {
        if (targetState.hasProperty((Property)ChestBlock.TYPE) && result.hasProperty((Property)ChestBlock.TYPE) && result.getValue((Property)ChestBlock.FACING) == targetState.getValue((Property)ChestBlock.FACING)) {
            ChestType targetChestType = (ChestType)targetState.getValue((Property)ChestBlock.TYPE);
            ChestType resultChestType = (ChestType)result.getValue((Property)ChestBlock.TYPE);
            return targetChestType != ChestType.SINGLE && resultChestType == ChestType.SINGLE;
        }
        return false;
    }
}
