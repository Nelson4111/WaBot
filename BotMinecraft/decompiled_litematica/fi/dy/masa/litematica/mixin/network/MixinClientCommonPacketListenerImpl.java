/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.multiplayer.ClientCommonPacketListenerImpl
 *  net.minecraft.network.protocol.common.ClientboundCustomPayloadPacket
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.network;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.data.DataManager;
import net.minecraft.client.multiplayer.ClientCommonPacketListenerImpl;
import net.minecraft.network.protocol.common.ClientboundCustomPayloadPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={ClientCommonPacketListenerImpl.class})
public class MixinClientCommonPacketListenerImpl {
    @Inject(method={"handleCustomPayload(Lnet/minecraft/network/protocol/common/ClientboundCustomPayloadPacket;)V"}, at={@At(value="HEAD")})
    private void litematica_onCustomPayload(ClientboundCustomPayloadPacket packet, CallbackInfo ci) {
        if (packet.payload().type().id().equals((Object)DataManager.CARPET_HELLO)) {
            Litematica.debugLog("ClientCommonNetworkHandler#litematica_onCustomPayload(): received carpet hello packet", new Object[0]);
            DataManager.setIsCarpetServer(true);
        } else if (packet.payload().type().id().getNamespace().equals("servux")) {
            DataManager.setHasServuxServer(true);
        }
    }
}

