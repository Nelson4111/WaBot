/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.phys.BlockHitResult
 */
package me.aleksilassila.litematica.printer.actions;

import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.phys.BlockHitResult;

public abstract class InteractAction
extends Action {
    public final PrinterPlacementContext context;

    public InteractAction(PrinterPlacementContext context) {
        this.context = context;
    }

    protected abstract void interact(Minecraft var1, LocalPlayer var2, InteractionHand var3, BlockHitResult var4);

    @Override
    public void send(Minecraft client, LocalPlayer player) {
        this.interact(client, player, InteractionHand.MAIN_HAND, this.context.hitResult);
        Printer.printDebug("InteractAction.send: Blockpos: {} Side: {} HitPos: {}", this.context.getClickedPos(), this.context.getClickedFace(), this.context.getClickLocation());
    }

    public String toString() {
        return "InteractAction{context=" + String.valueOf((Object)this.context) + "}";
    }
}

