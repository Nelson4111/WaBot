/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 */
package fi.dy.masa.litematica.interfaces;

import fi.dy.masa.litematica.schematic.pickblock.SchematicPickBlockEventResult;
import java.util.function.Supplier;
import net.minecraft.core.BlockPos;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;

public interface ISchematicPickBlockSlotHandler {
    public Supplier<String> getName();

    public SchematicPickBlockEventResult executePickBlock(Level var1, BlockPos var2, ItemStack var3);
}

