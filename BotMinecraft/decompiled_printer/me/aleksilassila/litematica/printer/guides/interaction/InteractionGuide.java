/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package me.aleksilassila.litematica.printer.guides.interaction;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.actions.PrepareAction;
import me.aleksilassila.litematica.printer.actions.ReleaseShiftAction;
import me.aleksilassila.litematica.printer.guides.Guide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import me.aleksilassila.litematica.printer.implementation.actions.InteractActionImpl;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public abstract class InteractionGuide
extends Guide {
    public InteractionGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    @Nonnull
    public List<Action> execute(LocalPlayer player) {
        ArrayList<Action> actions = new ArrayList<Action>();
        BlockHitResult hitResult = new BlockHitResult(Vec3.atCenterOf((Vec3i)this.state.blockPos), Direction.UP, this.state.blockPos, false);
        ItemStack requiredItem = this.getRequiredItem(player).orElse(ItemStack.EMPTY);
        int requiredSlot = this.getRequiredItemStackSlot(player);
        if (requiredSlot == -1) {
            return actions;
        }
        PrinterPlacementContext ctx = new PrinterPlacementContext((Player)player, hitResult, requiredItem, requiredSlot);
        actions.add(new ReleaseShiftAction());
        actions.add(new PrepareAction(ctx));
        actions.add(new InteractActionImpl(ctx));
        return actions;
    }

    @Override
    @Nonnull
    protected abstract List<ItemStack> getRequiredItems();
}

