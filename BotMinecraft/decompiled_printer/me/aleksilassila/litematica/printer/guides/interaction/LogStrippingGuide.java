/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.block.Block
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.guides.interaction.InteractionGuide;
import me.aleksilassila.litematica.printer.mixin.AxeItemAccessor;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.block.Block;

public class LogStrippingGuide
extends InteractionGuide {
    static final Item[] AXE_ITEMS = new Item[]{Items.NETHERITE_AXE, Items.DIAMOND_AXE, Items.GOLDEN_AXE, Items.IRON_AXE, Items.STONE_AXE, Items.WOODEN_AXE};
    public static final Map<Block, Block> STRIPPED_BLOCKS = AxeItemAccessor.getStrippedBlocks();

    public LogStrippingGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!Configs.STRIP_LOGS.getBooleanValue()) {
            return false;
        }
        if (!super.canExecute(player)) {
            return false;
        }
        Block strippingResult = STRIPPED_BLOCKS.get(this.currentState.getBlock());
        return strippingResult == this.targetState.getBlock();
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Arrays.stream(AXE_ITEMS).map(ItemStack::new).toList();
    }
}

