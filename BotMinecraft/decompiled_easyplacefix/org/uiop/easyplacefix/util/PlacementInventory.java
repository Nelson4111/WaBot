/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.config.Configs$Generic
 *  fi.dy.masa.litematica.util.EntityUtils
 *  fi.dy.masa.litematica.util.InventoryUtils
 *  net.minecraft.client.Minecraft
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.player.Inventory
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.inventory.AbstractContainerMenu
 *  net.minecraft.world.inventory.Slot
 *  net.minecraft.world.item.ItemStack
 */
package org.uiop.easyplacefix.util;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.InventoryUtils;
import net.minecraft.client.Minecraft;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.inventory.AbstractContainerMenu;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.ItemStack;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

public final class PlacementInventory {
    private PlacementInventory() {
    }

    public static ItemStack searchItem(Minecraft mc, ItemStack stack) {
        int slot;
        if (mc.player == null || mc.gameMode == null || mc.level == null || stack.isEmpty()) {
            return null;
        }
        if (EntityUtils.isCreativeMode((Player)mc.player)) {
            return stack.copy();
        }
        Inventory inv = mc.player.getInventory();
        int n = slot = easyPlacefixConfig.IGNORE_NBT.getBooleanValue() ? PlacementInventory.getSlotWithStackWithoutNbt(stack, inv) : PlacementInventory.getSlotWithStack(stack, inv);
        if (slot != -1) {
            return inv.getItem(slot);
        }
        if (Configs.Generic.PICK_BLOCK_SHULKERS.getBooleanValue() && (slot = InventoryUtils.findSlotWithBoxWithItem((AbstractContainerMenu)mc.player.inventoryMenu, (ItemStack)stack, (boolean)false)) != -1) {
            PlacementInventory.pickItem(mc, ((Slot)mc.player.inventoryMenu.slots.get(slot)).getItem());
        }
        return null;
    }

    public static int getSlotWithStackWithoutNbt(ItemStack stack, Inventory inv) {
        for (int i = 0; i < inv.getContainerSize(); ++i) {
            if (inv.getItem(i).isEmpty() || !ItemStack.isSameItem((ItemStack)stack, (ItemStack)inv.getItem(i))) continue;
            return i;
        }
        return -1;
    }

    public static int getSlotWithStack(ItemStack stack, Inventory inv) {
        for (int i = 0; i < inv.getContainerSize(); ++i) {
            if (inv.getItem(i).isEmpty() || !ItemStack.isSameItemSameComponents((ItemStack)stack, (ItemStack)inv.getItem(i))) continue;
            return i;
        }
        return -1;
    }

    public static void pickItem(Minecraft mc, ItemStack stack) {
        if (EntityUtils.isCreativeMode((Player)mc.player)) {
            InventoryUtils.setPickedItemToHand((ItemStack)stack, (Minecraft)mc);
            mc.gameMode.handleCreativeModeItemAdd(mc.player.getItemInHand(InteractionHand.MAIN_HAND), 36 + mc.player.getInventory().getSelectedSlot());
        } else {
            InventoryUtils.setPickedItemToHand((ItemStack)stack, (Minecraft)mc);
        }
    }
}

