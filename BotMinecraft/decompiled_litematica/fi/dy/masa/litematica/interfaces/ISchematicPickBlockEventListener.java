/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.interfaces;

import fi.dy.masa.litematica.schematic.pickblock.SchematicPickBlockEventResult;
import java.util.function.Supplier;
import net.minecraft.core.BlockPos;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;

public interface ISchematicPickBlockEventListener {
    public Supplier<String> getName();

    public void onSchematicPickBlockCancelled(Supplier<String> var1);

    public SchematicPickBlockEventResult onSchematicPickBlockStart(boolean var1);

    public SchematicPickBlockEventResult onSchematicPickBlockPreGather(Level var1, BlockPos var2, BlockState var3);

    public SchematicPickBlockEventResult onSchematicPickBlockPrePick(Level var1, BlockPos var2, BlockState var3, ItemStack var4);

    public void onSchematicPickBlockSuccess();
}

