/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.item.AxeItem
 *  net.minecraft.world.level.block.Block
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package me.aleksilassila.litematica.printer.mixin;

import java.util.Map;
import net.minecraft.world.item.AxeItem;
import net.minecraft.world.level.block.Block;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={AxeItem.class})
public interface AxeItemAccessor {
    @Accessor(value="STRIPPABLES")
    public static Map<Block, Block> getStrippedBlocks() {
        throw new AssertionError((Object)"Untransformed @Accessor");
    }
}

