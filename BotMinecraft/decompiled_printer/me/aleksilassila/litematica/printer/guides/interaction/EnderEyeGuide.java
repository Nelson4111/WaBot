/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
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
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public class EnderEyeGuide
extends InteractionGuide {
    public EnderEyeGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        if (this.currentState.hasProperty((Property)BlockStateProperties.EYE) && this.targetState.hasProperty((Property)BlockStateProperties.EYE)) {
            return (Boolean)this.currentState.getValue((Property)BlockStateProperties.EYE) == false && (Boolean)this.targetState.getValue((Property)BlockStateProperties.EYE) != false;
        }
        return false;
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Collections.singletonList(new ItemStack((ItemLike)Items.ENDER_EYE));
    }
}

