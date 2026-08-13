/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.Arrays;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.interaction.InteractionGuide;
import me.aleksilassila.litematica.printer.guides.placement.FarmlandGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;

public class TillingGuide
extends InteractionGuide {
    public static final Item[] HOE_ITEMS = new Item[]{Items.NETHERITE_HOE, Items.DIAMOND_HOE, Items.GOLDEN_HOE, Items.IRON_HOE, Items.STONE_HOE, Items.WOODEN_HOE};

    public TillingGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        return Arrays.stream(FarmlandGuide.TILLABLE_BLOCKS).anyMatch(b -> b == this.currentState.getBlock());
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Arrays.stream(HOE_ITEMS).map(ItemStack::new).toList();
    }
}

