/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;

public class FlowerPotGuide
extends GeneralPlacementGuide {
    public FlowerPotGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Collections.singletonList(new ItemStack((ItemLike)Items.FLOWER_POT));
    }
}

