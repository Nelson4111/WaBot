/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.item.ItemStack
 */
package fi.dy.masa.litematica.interfaces;

import fi.dy.masa.litematica.interfaces.ISchematicPickBlockEventListener;
import fi.dy.masa.litematica.interfaces.ISchematicPickBlockSlotHandler;
import fi.dy.masa.litematica.schematic.pickblock.SchematicPickBlockEventResult;
import java.util.function.Supplier;
import net.minecraft.world.item.ItemStack;

public interface ISchematicPickBlockEventManager {
    public void registerSchematicPickBlockEventListener(ISchematicPickBlockEventListener var1);

    public SchematicPickBlockEventResult invokeRedirectPickBlockStack(ISchematicPickBlockEventListener var1, ItemStack var2);

    public SchematicPickBlockEventResult invokeRedirectPickBlockSlotHandler(ISchematicPickBlockEventListener var1, ISchematicPickBlockSlotHandler var2);

    public boolean hasPickStack();

    public boolean hasSlotHandler();

    public ItemStack getPickStack();

    public boolean isProcessingCancelled();

    public void resetCancelled();

    public Supplier<String> getProcessingCancelledBy();
}

