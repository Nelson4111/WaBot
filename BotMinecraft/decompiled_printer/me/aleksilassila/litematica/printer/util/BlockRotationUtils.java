package me.aleksilassila.litematica.printer.util;

import net.minecraft.core.Direction;
import net.minecraft.world.level.block.DispenserBlock;
import net.minecraft.world.level.block.DropperBlock;
import net.minecraft.world.level.block.ObserverBlock;
import net.minecraft.world.level.block.piston.PistonBaseBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Half;

public class BlockRotationUtils {

    /**
     * Computes the exact player yaw and pitch required to place a block state with the desired facing.
     *
     * Rules:
     * - Pistons / Sticky Pistons / Dispensers / Droppers: placed facing AWAY from the player look direction.
     *   Target UP requires looking DOWN (+90 pitch).
     *   Target NORTH requires looking SOUTH (0 yaw).
     * - Observers: placed with output face pointing in look direction.
     *   Target UP requires looking UP (-90 pitch).
     *   Target NORTH requires looking NORTH (180 yaw).
     * - Stairs / Doors / Repeaters / Trapdoors: direct horizontal look direction.
     */
    public static float[] getYawAndPitchForState(BlockState state, float defaultYaw, float defaultPitch) {
        if (state == null) return null;

        var block = state.getBlock();

        // 1. PISTONS, STICKY PISTONS, DISPENSERS, DROPPERS (Opposite Direction)
        if (block instanceof PistonBaseBlock || block instanceof DispenserBlock || block instanceof DropperBlock) {
            if (state.hasProperty(BlockStateProperties.FACING)) {
                Direction facing = state.getValue(BlockStateProperties.FACING);
                switch (facing) {
                    case DOWN: return new float[]{defaultYaw, -90.0f}; // Look UP to place DOWN
                    case UP: return new float[]{defaultYaw, 90.0f};    // Look DOWN to place UP
                    case NORTH: return new float[]{0.0f, 0.0f};       // Look SOUTH (0) to place NORTH
                    case SOUTH: return new float[]{180.0f, 0.0f};     // Look NORTH (180) to place SOUTH
                    case WEST: return new float[]{-90.0f, 0.0f};      // Look EAST (-90) to place WEST
                    case EAST: return new float[]{90.0f, 0.0f};       // Look WEST (90) to place EAST
                }
            }
        }

        // 2. OBSERVERS (Direct Direction)
        if (block instanceof ObserverBlock) {
            if (state.hasProperty(BlockStateProperties.FACING)) {
                Direction facing = state.getValue(BlockStateProperties.FACING);
                switch (facing) {
                    case DOWN: return new float[]{defaultYaw, 90.0f};  // Look DOWN for DOWN
                    case UP: return new float[]{defaultYaw, -90.0f};   // Look UP for UP
                    case SOUTH: return new float[]{0.0f, 0.0f};       // Look SOUTH (0)
                    case WEST: return new float[]{90.0f, 0.0f};       // Look WEST (90)
                    case NORTH: return new float[]{180.0f, 0.0f};     // Look NORTH (180)
                    case EAST: return new float[]{-90.0f, 0.0f};      // Look EAST (-90)
                }
            }
        }

        // 3. GENERAL HORIZONTAL FACING (Stairs, Doors, Repeaters, Trapdoors, etc.)
        if (state.hasProperty(BlockStateProperties.HORIZONTAL_FACING)) {
            Direction facing = state.getValue(BlockStateProperties.HORIZONTAL_FACING);
            float yaw = getYawForDirection(facing);
            float pitch = 0.0f;
            if (state.hasProperty(BlockStateProperties.HALF)) {
                Half half = state.getValue(BlockStateProperties.HALF);
                pitch = (half == Half.TOP) ? -45.0f : 45.0f;
            }
            return new float[]{yaw, pitch};
        }

        // 4. GENERAL FACING
        if (state.hasProperty(BlockStateProperties.FACING)) {
            Direction facing = state.getValue(BlockStateProperties.FACING);
            switch (facing) {
                case DOWN: return new float[]{defaultYaw, 90.0f};
                case UP: return new float[]{defaultYaw, -90.0f};
                default: return new float[]{getYawForDirection(facing), 0.0f};
            }
        }

        return null;
    }

    public static float getYawForDirection(Direction dir) {
        if (dir == null) return 0.0f;
        return switch (dir) {
            case SOUTH -> 0.0f;
            case WEST -> 90.0f;
            case NORTH -> 180.0f;
            case EAST -> -90.0f;
            default -> 0.0f;
        };
    }
}
