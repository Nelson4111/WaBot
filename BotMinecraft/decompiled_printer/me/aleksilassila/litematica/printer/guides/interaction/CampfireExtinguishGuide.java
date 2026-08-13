/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.CampfireBlock
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.Arrays;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.interaction.InteractionGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.CampfireBlock;

public class CampfireExtinguishGuide
extends InteractionGuide {
    boolean shouldBeLit;
    boolean isLit;

    public CampfireExtinguishGuide(SchematicBlockState state) {
        super(state);
        this.shouldBeLit = CampfireExtinguishGuide.getProperty(this.targetState, CampfireBlock.LIT).orElse(false);
        this.isLit = CampfireExtinguishGuide.getProperty(this.currentState, CampfireBlock.LIT).orElse(false);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        return this.currentState.getBlock() instanceof CampfireBlock && !this.shouldBeLit && this.isLit;
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Arrays.stream(SHOVEL_ITEMS).map(ItemStack::new).toList();
    }
}

