/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.LeverBlock
 *  net.minecraft.world.level.block.state.BlockState
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
import net.minecraft.world.level.block.LeverBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public class CycleStateGuide
extends InteractionGuide {
    private static final Property<?>[] propertiesToIgnore = new Property[]{BlockStateProperties.POWERED, BlockStateProperties.LIT};

    public CycleStateGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        return this.targetState.getBlock() == this.currentState.getBlock();
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Collections.singletonList(ItemStack.EMPTY);
    }

    @Override
    protected boolean statesEqual(BlockState state1, BlockState state2) {
        if (state2.getBlock() instanceof LeverBlock) {
            return super.statesEqual(state1, state2);
        }
        return this.statesEqualIgnoreProperties(state1, state2, propertiesToIgnore);
    }
}

