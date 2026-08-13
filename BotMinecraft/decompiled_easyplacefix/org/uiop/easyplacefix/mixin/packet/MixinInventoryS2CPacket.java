/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.v2.WrapWithCondition
 *  net.minecraft.network.protocol.game.ClientGamePacketListener
 *  net.minecraft.network.protocol.game.ClientboundContainerSetContentPacket
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 */
package org.uiop.easyplacefix.mixin.packet;

import com.llamalad7.mixinextras.injector.v2.WrapWithCondition;
import net.minecraft.network.protocol.game.ClientGamePacketListener;
import net.minecraft.network.protocol.game.ClientboundContainerSetContentPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={ClientboundContainerSetContentPacket.class})
public class MixinInventoryS2CPacket {
    @WrapWithCondition(method={"handle(Lnet/minecraft/network/protocol/game/ClientGamePacketListener;)V"}, at={@At(value="INVOKE", target="Lnet/minecraft/network/protocol/game/ClientGamePacketListener;handleContainerContent(Lnet/minecraft/network/protocol/game/ClientboundContainerSetContentPacket;)V")})
    private boolean InventoryFail(ClientGamePacketListener instance, ClientboundContainerSetContentPacket inventoryS2CPacket) {
        return PlayerBlockAction.openScreenAction.run();
    }
}

