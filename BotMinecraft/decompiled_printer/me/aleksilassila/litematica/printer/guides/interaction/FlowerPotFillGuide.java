/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.FlowerPotBlock
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.interaction.InteractionGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.FlowerPotBlock;

public class FlowerPotFillGuide
extends InteractionGuide {
    private final Block content;

    public FlowerPotFillGuide(SchematicBlockState state) {
        super(state);
        Block targetBlock = state.targetState.getBlock();
        this.content = targetBlock instanceof FlowerPotBlock ? ((FlowerPotBlock)targetBlock).getPotted() : null;
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (this.content == null) {
            return false;
        }
        if (!(this.currentState.getBlock() instanceof FlowerPotBlock)) {
            return false;
        }
        return super.canExecute(player);
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        if (this.content == null) {
            return Collections.emptyList();
        }
        return Collections.singletonList(new ItemStack((ItemLike)this.content));
    }
}

