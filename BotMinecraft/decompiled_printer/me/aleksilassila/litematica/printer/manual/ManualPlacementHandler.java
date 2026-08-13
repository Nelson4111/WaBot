package me.aleksilassila.litematica.printer.manual;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.util.BlockRotationUtils;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.DispenserBlock;
import net.minecraft.world.level.block.DropperBlock;
import net.minecraft.world.level.block.ObserverBlock;
import net.minecraft.world.level.block.piston.PistonBaseBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Half;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;

public class ManualPlacementHandler {

    public static boolean onManualRightClick(Minecraft client) {
        if (!Configs.MANUAL_CLICK_ASSIST.getBooleanValue()) {
            return false;
        }

        LocalPlayer player = client.player;
        if (player == null || client.level == null || client.gameMode == null) {
            return false;
        }

        HitResult hit = client.hitResult;
        if (!(hit instanceof BlockHitResult blockHit)) {
            return false;
        }

        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        if (schematicWorld == null) {
            return false;
        }

        BlockPos targetPos = PlacementOverrideHandler.getTargetPlacementPos(client.level, schematicWorld, blockHit);
        if (targetPos == null || !DataManager.getRenderLayerRange().isPositionWithinRange(targetPos)) {
            return false;
        }

        BlockState targetState = schematicWorld.getBlockState(targetPos);
        if (targetState == null || targetState.isAir()) {
            return false;
        }

        ItemStack requiredItem = ItemUtils.getItemForBlock(client.level, targetPos, targetState, true);
        if (requiredItem == null || requiredItem.isEmpty()) {
            return false;
        }

        int slot = player.getInventory().findSlotMatchingItem(requiredItem);
        if (slot != -1) {
            if (Inventory.isHotbarSlot(slot)) {
                player.getInventory().setSelectedSlot(slot);
            } else {
                InventoryUtils.setPickedItemToHand(slot, requiredItem, client);
            }
        }

        PlacementOverrideHandler.setOverrideState(targetPos, targetState, blockHit);

        float origYaw = player.getYRot();
        float origPitch = player.getXRot();
        float origYHead = player.getYHeadRot();
        float origYRotO = player.yRotO;
        float origXRotO = player.xRotO;
        boolean rotated = false;

        float[] rotations = calculateRotationsForState(targetState, blockHit.getDirection());
        if (rotations != null) {
            float targetYaw = rotations[0];
            float targetPitch = rotations[1];

            player.setYRot(targetYaw);
            player.setXRot(targetPitch);
            player.setYHeadRot(targetYaw);
            player.yRotO = targetYaw;
            player.xRotO = targetPitch;
            rotated = true;

            ServerboundMovePlayerPacket.PosRot packet = new ServerboundMovePlayerPacket.PosRot(
                player.getX(), player.getY(), player.getZ(),
                targetYaw, targetPitch,
                player.onGround(), player.horizontalCollision
            );
            player.connection.send((Packet<?>) packet);
        }

        try {
            client.gameMode.useItemOn(player, InteractionHand.MAIN_HAND, blockHit);
            client.gameMode.useItem(player, InteractionHand.MAIN_HAND);
        } finally {
            PlacementOverrideHandler.clearAll();
            if (rotated) {
                player.setYRot(origYaw);
                player.setXRot(origPitch);
                player.setYHeadRot(origYHead);
                player.yRotO = origYRotO;
                player.xRotO = origXRotO;
            }
        }

        Printer.printDebug("Manual placement assist executed for {} at {}", targetState, targetPos);
        return true;
    }

    public static float[] calculateRotationsForState(BlockState state, Direction hitSide) {
        if (state == null) return null;

        var block = state.getBlock();

        // 1. PISTONS, DISPENSERS, DROPPERS (Reverse Direction)
        if (block instanceof PistonBaseBlock || block instanceof DispenserBlock || block instanceof DropperBlock) {
            if (state.hasProperty(BlockStateProperties.FACING)) {
                Direction facing = state.getValue(BlockStateProperties.FACING);
                switch (facing) {
                    case DOWN: return new float[]{0.0f, -90.0f}; // Look UP to place DOWN
                    case UP: return new float[]{0.0f, 90.0f};    // Look DOWN to place UP
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
                    case DOWN: return new float[]{0.0f, 90.0f};  // Look DOWN for DOWN
                    case UP: return new float[]{0.0f, -90.0f};   // Look UP for UP
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
            float yaw = BlockRotationUtils.getYawForDirection(facing);
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
                case DOWN: return new float[]{0.0f, 90.0f};
                case UP: return new float[]{0.0f, -90.0f};
                default: return new float[]{BlockRotationUtils.getYawForDirection(facing), 0.0f};
            }
        }

        // 5. AXIS (Logs, Wood, Basalt)
        if (state.hasProperty(BlockStateProperties.AXIS)) {
            Direction.Axis axis = state.getValue(BlockStateProperties.AXIS);
            if (axis == Direction.Axis.X) {
                return new float[]{90.0f, 0.0f};
            } else if (axis == Direction.Axis.Z) {
                return new float[]{0.0f, 0.0f};
            } else {
                return new float[]{0.0f, 90.0f};
            }
        }

        if (state.hasProperty(BlockStateProperties.SLAB_TYPE)) {
            SlabType type = state.getValue(BlockStateProperties.SLAB_TYPE);
            float pitch = (type == SlabType.TOP) ? -45.0f : 45.0f;
            return new float[]{0.0f, pitch};
        }

        return null;
    }
}
