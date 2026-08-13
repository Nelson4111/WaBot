/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.v2.WrapWithCondition
 *  net.minecraft.network.protocol.game.ClientGamePacketListener
 *  net.minecraft.network.protocol.game.ClientboundOpenScreenPacket
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 */
package org.uiop.easyplacefix.mixin.packet;

import com.llamalad7.mixinextras.injector.v2.WrapWithCondition;
import net.minecraft.network.protocol.game.ClientGamePacketListener;
import net.minecraft.network.protocol.game.ClientboundOpenScreenPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.uiop.easyplacefix.EasyPlaceFix;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={ClientboundOpenScreenPacket.class})
public class MixinOpenScreenS2CPacket {
    @WrapWithCondition(method={"handle(Lnet/minecraft/network/protocol/game/ClientGamePacketListener;)V"}, at={@At(value="INVOKE", target="Lnet/minecraft/network/protocol/game/ClientGamePacketListener;handleOpenScreen(Lnet/minecraft/network/protocol/game/ClientboundOpenScreenPacket;)V")})
    private boolean OpenScreenFail(ClientGamePacketListener instance, ClientboundOpenScreenPacket openScreenS2CPacket) {
        EasyPlaceFix.screenId = openScreenS2CPacket.getContainerId() + 1;
        return PlayerBlockAction.openScreenAction.run();
    }
}

