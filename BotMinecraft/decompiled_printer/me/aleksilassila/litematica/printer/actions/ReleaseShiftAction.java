/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.network.protocol.Packet
 *  net.minecraft.network.protocol.game.ServerboundPlayerInputPacket
 *  net.minecraft.world.entity.player.Input
 */
package me.aleksilassila.litematica.printer.actions;

import me.aleksilassila.litematica.printer.actions.Action;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundPlayerInputPacket;
import net.minecraft.world.entity.player.Input;

public class ReleaseShiftAction
extends Action {
    @Override
    public void send(Minecraft client, LocalPlayer player) {
        player.input.keyPresses = new Input(player.input.keyPresses.forward(), player.input.keyPresses.backward(), player.input.keyPresses.left(), player.input.keyPresses.right(), player.input.keyPresses.jump(), false, player.input.keyPresses.sprint());
        player.connection.send((Packet)new ServerboundPlayerInputPacket(player.input.keyPresses));
    }
}

