/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.Arrays;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;

public class FarmlandGuide
extends GeneralPlacementGuide {
    public static final Block[] TILLABLE_BLOCKS = new Block[]{Blocks.DIRT, Blocks.GRASS_BLOCK, Blocks.COARSE_DIRT, Blocks.ROOTED_DIRT, Blocks.DIRT_PATH};

    public FarmlandGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Arrays.stream(TILLABLE_BLOCKS).map(b -> this.getBlockItem(b.defaultBlockState())).toList();
    }
}

