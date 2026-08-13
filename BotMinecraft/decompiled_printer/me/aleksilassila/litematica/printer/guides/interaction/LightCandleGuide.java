/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.block.AbstractCandleBlock
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.interaction.InteractionGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.block.AbstractCandleBlock;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;

public class LightCandleGuide
extends InteractionGuide {
    boolean shouldBeLit;
    boolean isLit;

    public LightCandleGuide(SchematicBlockState state) {
        super(state);
        this.shouldBeLit = LightCandleGuide.getProperty(this.targetState, BlockStateProperties.LIT).orElse(false);
        this.isLit = LightCandleGuide.getProperty(this.currentState, BlockStateProperties.LIT).orElse(false);
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Collections.singletonList(new ItemStack((ItemLike)Items.FLINT_AND_STEEL));
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        return this.currentState.getBlock() instanceof AbstractCandleBlock && this.shouldBeLit && !this.isLit;
    }
}

