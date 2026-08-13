package me.aleksilassila.litematica.printer.implementation;

import net.minecraft.core.Direction;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.phys.BlockHitResult;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;

public class PrinterPlacementContext
extends BlockPlaceContext {
    @Nullable
    public final Direction lookDirection;
    public final boolean shouldSneak;
    public final BlockHitResult hitResult;
    public final int requiredItemSlot;

    public PrinterPlacementContext(Player player, BlockHitResult hitResult, ItemStack requiredItem, int requiredItemSlot) {
        this(player, hitResult, requiredItem, requiredItemSlot, null, false);
    }

    public PrinterPlacementContext(Player player, BlockHitResult hitResult, ItemStack requiredItem, int requiredItemSlot, @Nullable Direction lookDirection, boolean requiresSneaking) {
        super(player, InteractionHand.MAIN_HAND, requiredItem, hitResult);
        this.lookDirection = lookDirection;
        this.shouldSneak = requiresSneaking;
        this.hitResult = hitResult;
        this.requiredItemSlot = requiredItemSlot;
    }

    @Override
    public @NonNull Direction getNearestLookingDirection() {
        if (this.lookDirection != null) {
            return this.lookDirection;
        }
        return super.getNearestLookingDirection();
    }

    @Override
    public @NonNull Direction getNearestLookingVerticalDirection() {
        if (this.lookDirection != null) {
            if (this.lookDirection == Direction.UP || this.lookDirection == Direction.DOWN) {
                return this.lookDirection;
            }
        }
        return super.getNearestLookingVerticalDirection();
    }

    @Override
    public @NonNull Direction getHorizontalDirection() {
        if (this.lookDirection != null && this.lookDirection.getAxis().isHorizontal()) {
            return this.lookDirection;
        }
        return super.getHorizontalDirection();
    }

    @Override
    public float getRotation() {
        if (this.lookDirection != null && this.lookDirection.getAxis().isHorizontal()) {
            switch (this.lookDirection) {
                case SOUTH: return 0.0f;
                case WEST: return 90.0f;
                case NORTH: return 180.0f;
                case EAST: return -90.0f;
                default: return 0.0f;
            }
        }
        return super.getRotation();
    }

    public String toString() {
        return "PrinterPlacementContext{lookDirection=" + String.valueOf(this.lookDirection) + ", requiresSneaking=" + this.shouldSneak + ", blockPos=" + String.valueOf(this.hitResult.getBlockPos()) + ", side=" + String.valueOf(this.hitResult.getDirection()) + "}";
    }
}
