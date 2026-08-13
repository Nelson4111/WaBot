/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.gui.GuiConfigs$ConfigGuiTab
 *  net.fabricmc.api.ClientModInitializer
 *  net.minecraft.world.entity.player.Inventory
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.Block
 *  org.slf4j.Logger
 *  org.slf4j.LoggerFactory
 */
package org.uiop.easyplacefix;

import fi.dy.masa.litematica.gui.GuiConfigs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import net.fabricmc.api.ClientModInitializer;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.Block;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.uiop.easyplacefix.command.EasyPlaceFixCommands;
import org.uiop.easyplacefix.config.Hotkeys;
import org.uiop.easyplacefix.config.easyPlaceFixHotkeys;
import org.uiop.easyplacefix.mixin.config.ConfigGuiTabAccessor;

public class EasyPlaceFix
implements ClientModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger((String)"easyplacefix");
    public static final GuiConfigs.ConfigGuiTab EASY_FIX = ConfigGuiTabAccessor.init("EASY_FIX", 6, "litematica.gui.button.config_gui.easy_fix");
    public static List<Boolean> crafterSlot = new ArrayList<Boolean>(Arrays.asList(false, false, false, false, false, false, false, false, false));
    public static boolean crafterOperation = false;
    public static volatile int screenId = 1;

    public void onInitializeClient() {
        Hotkeys.init();
        easyPlaceFixHotkeys.addCallbacks();
        EasyPlaceFixCommands.register();
    }

    public static ItemStack findBlockInInventory(Inventory inv, Predicate<Block> predicate) {
        for (int slot = 0; slot < inv.getContainerSize(); ++slot) {
            Block block;
            ItemStack stack = inv.getItem(slot);
            if (stack.isEmpty() || !predicate.test(block = Block.byItem((Item)stack.getItem()))) continue;
            return stack;
        }
        return null;
    }
}

