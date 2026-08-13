/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.RotatedPillarBlock
 *  net.minecraft.world.level.block.state.properties.Property
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.guides.interaction.LogStrippingGuide;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.RotatedPillarBlock;
import net.minecraft.world.level.block.state.properties.Property;

public class LogGuide
extends GeneralPlacementGuide {
    public LogGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected List<Direction> getPossibleSides() {
        if (this.targetState.hasProperty((Property)RotatedPillarBlock.AXIS)) {
            Direction.Axis axis = (Direction.Axis)this.targetState.getValue((Property)RotatedPillarBlock.AXIS);
            return Arrays.stream(Direction.values()).filter(d -> d.getAxis() == axis).toList();
        }
        return new ArrayList<Direction>();
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        for (Block log : LogStrippingGuide.STRIPPED_BLOCKS.keySet()) {
            if (this.targetState.getBlock() != LogStrippingGuide.STRIPPED_BLOCKS.get(log)) continue;
            return Collections.singletonList(new ItemStack((ItemLike)log));
        }
        return super.getRequiredItems();
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!Configs.STRIP_LOGS.getBooleanValue()) {
            return false;
        }
        if (LogStrippingGuide.STRIPPED_BLOCKS.containsValue(this.targetState.getBlock())) {
            return super.canExecute(player);
        }
        return false;
    }
}

