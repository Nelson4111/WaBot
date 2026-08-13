package me.aleksilassila.litematica.printer.actions;

import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import me.aleksilassila.litematica.printer.util.BlockRotationUtils;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import net.minecraft.network.protocol.game.ServerboundPlayerInputPacket;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Input;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.state.BlockState;

public class PrepareAction
extends Action {
    public final PrinterPlacementContext context;
    public boolean modifyYaw = true;
    public boolean modifyPitch = true;
    public float yaw = 0.0f;
    public float pitch = 0.0f;

    public PrepareAction(PrinterPlacementContext context) {
        this.context = context;
        Direction lookDirection = context.lookDirection;
        if (lookDirection != null && lookDirection.getAxis().isHorizontal()) {
            this.yaw = BlockRotationUtils.getYawForDirection(lookDirection);
        } else {
            this.modifyYaw = false;
        }
        if (lookDirection == Direction.UP) {
            this.pitch = -90.0f;
        } else if (lookDirection == Direction.DOWN) {
            this.pitch = 90.0f;
        } else if (lookDirection != null) {
            this.pitch = 0.0f;
        } else {
            this.modifyPitch = false;
        }

        // Calculate specific block rotation (Pistons, Observers, Dispensers, etc.)
        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        if (schematicWorld != null && context != null && context.hitResult != null) {
            BlockState targetState = schematicWorld.getBlockState(context.hitResult.getBlockPos());
            if (targetState != null) {
                float[] rots = BlockRotationUtils.getYawAndPitchForState(targetState, 0.0f, 0.0f);
                if (rots != null) {
                    this.yaw = rots[0];
                    this.pitch = rots[1];
                    this.modifyYaw = true;
                    this.modifyPitch = true;
                }
            }
        }
    }

    public PrepareAction(PrinterPlacementContext context, float yaw, float pitch) {
        this.context = context;
        this.yaw = yaw;
        this.pitch = pitch;
    }

    @Override
    public void send(Minecraft client, LocalPlayer player) {
        ItemStack itemStack = this.context.getItemInHand();
        int slot = this.context.requiredItemSlot;
        if (itemStack != null && !itemStack.isEmpty() && client.gameMode != null) {
            Printer.printDebug("PrepareAction#send(): slot [{}] // itemStack [{}]", slot, itemStack.toString());
            Inventory inventory = player.getInventory();
            if (player.getAbilities().instabuild) {
                this.addPickBlock(inventory, itemStack);
                client.gameMode.handleCreativeModeItemAdd(player.getItemInHand(InteractionHand.MAIN_HAND), 36 + inventory.getSelectedSlot());
            } else if (slot != -1) {
                if (Inventory.isHotbarSlot((int)slot)) {
                    inventory.setSelectedSlot(slot);
                } else {
                    InventoryUtils.setPickedItemToHand((int)slot, (ItemStack)itemStack, (Minecraft)client);
                }
            }
        }
        if (Configs.ROTATE.getBooleanValue() && (this.modifyPitch || this.modifyYaw)) {
            float packetYaw = this.modifyYaw ? this.yaw : player.getYRot();
            float packetPitch = this.modifyPitch ? this.pitch : player.getXRot();
            ServerboundMovePlayerPacket.Rot packet = new ServerboundMovePlayerPacket.Rot(packetYaw, packetPitch, player.onGround(), player.horizontalCollision);
            player.connection.send((Packet)packet);
        }
        if (this.context.shouldSneak) {
            player.input.keyPresses = new Input(player.input.keyPresses.forward(), player.input.keyPresses.backward(), player.input.keyPresses.left(), player.input.keyPresses.right(), player.input.keyPresses.jump(), true, player.input.keyPresses.sprint());
            player.connection.send((Packet)new ServerboundPlayerInputPacket(player.input.keyPresses));
        } else {
            player.input.keyPresses = new Input(player.input.keyPresses.forward(), player.input.keyPresses.backward(), player.input.keyPresses.left(), player.input.keyPresses.right(), player.input.keyPresses.jump(), false, player.input.keyPresses.sprint());
            player.connection.send((Packet)new ServerboundPlayerInputPacket(player.input.keyPresses));
        }
    }

    private void addPickBlock(Inventory inv, ItemStack stack) {
        int slot = inv.findSlotMatchingItem(stack);
        if (Inventory.isHotbarSlot((int)slot)) {
            inv.setSelectedSlot(slot);
        } else if (slot == -1) {
            int empty;
            inv.setSelectedSlot(inv.getSuitableHotbarSlot());
            if (!((ItemStack)inv.getNonEquipmentItems().get(inv.getSelectedSlot())).isEmpty() && (empty = inv.getFreeSlot()) != -1) {
                inv.getNonEquipmentItems().set(empty, (ItemStack)inv.getNonEquipmentItems().get(inv.getSelectedSlot()));
            }
            inv.getNonEquipmentItems().set(inv.getSelectedSlot(), stack);
        } else {
            inv.pickSlot(slot);
        }
    }

    public String toString() {
        return "PrepareAction{context=" + String.valueOf((Object)this.context) + "}";
    }
}
