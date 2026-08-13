/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.item.ItemStack
 */
package me.aleksilassila.litematica.printer.guides;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.guides.Guide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.item.ItemStack;

public class SkipGuide
extends Guide {
    public SkipGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    public boolean skipOtherGuides() {
        return true;
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        return false;
    }

    @Override
    @Nonnull
    public List<Action> execute(LocalPlayer player) {
        return new ArrayList<Action>();
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        return Collections.singletonList(ItemStack.EMPTY);
    }
}

