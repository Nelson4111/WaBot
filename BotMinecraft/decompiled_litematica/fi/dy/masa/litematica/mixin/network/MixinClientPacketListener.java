/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.multiplayer.ClientPacketListener
 *  net.minecraft.network.protocol.common.custom.CustomPacketPayload
 *  net.minecraft.network.protocol.game.ClientboundForgetLevelChunkPacket
 *  net.minecraft.network.protocol.game.ClientboundLevelChunkWithLightPacket
 *  net.minecraft.network.protocol.game.ClientboundSystemChatPacket
 *  net.minecraft.network.protocol.game.ClientboundTagQueryPacket
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.network;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.network.protocol.game.ClientboundForgetLevelChunkPacket;
import net.minecraft.network.protocol.game.ClientboundLevelChunkWithLightPacket;
import net.minecraft.network.protocol.game.ClientboundSystemChatPacket;
import net.minecraft.network.protocol.game.ClientboundTagQueryPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={ClientPacketListener.class})
public abstract class MixinClientPacketListener {
    @Inject(method={"handleLevelChunkWithLight"}, at={@At(value="RETURN")})
    private void litematica_onUpdateChunk(ClientboundLevelChunkWithLightPacket packet, CallbackInfo ci) {
        int chunkX = packet.getX();
        int chunkZ = packet.getZ();
        if (Configs.Visuals.ENABLE_RENDERING.getBooleanValue() && Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue()) {
            SchematicWorldRefresher.INSTANCE.markSchematicChunksForRenderUpdate(chunkX, chunkZ);
        }
        DataManager.getSchematicPlacementManager().onClientChunkLoad(chunkX, chunkZ);
    }

    @Inject(method={"handleForgetLevelChunk"}, at={@At(value="RETURN")})
    private void litematica_onChunkUnload(ClientboundForgetLevelChunkPacket packet, CallbackInfo ci) {
        if (!Configs.Generic.LOAD_ENTIRE_SCHEMATICS.getBooleanValue()) {
            DataManager.getSchematicPlacementManager().onClientChunkUnload(packet.pos().x(), packet.pos().z());
        }
    }

    @Inject(method={"handleSystemChat"}, cancellable=true, at={@At(value="INVOKE", target="Lnet/minecraft/client/multiplayer/chat/ChatListener;handleSystemMessage(Lnet/minecraft/network/chat/Component;Z)V")})
    private void litematica_onGameMessage(ClientboundSystemChatPacket packet, CallbackInfo ci) {
        if (DataManager.onChatMessage(packet.content())) {
            ci.cancel();
        }
    }

    @Inject(method={"handleCustomPayload"}, at={@At(value="HEAD")})
    private void litematica_onCustomPayload(CustomPacketPayload payload, CallbackInfo ci) {
        if (payload.type().id().equals((Object)DataManager.CARPET_HELLO)) {
            Litematica.debugLog("MixinClientPlayNetworkHandler#litematica_onCustomPayload(): received carpet hello packet", new Object[0]);
            DataManager.setIsCarpetServer(true);
        } else if (payload.type().id().getNamespace().equals("servux")) {
            DataManager.setHasServuxServer(true);
        }
    }

    @Inject(method={"handleTagQueryPacket"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/DebugQueryHandler;handleResponse(ILnet/minecraft/nbt/CompoundTag;)Z")})
    private void litematica_onQueryResponse(ClientboundTagQueryPacket packet, CallbackInfo ci) {
        if (Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
            EntityDataManager.getInstance().handleVanillaQueryNbt(packet.getTransactionId(), packet.getTag());
        }
    }

    @Inject(method={"handleCommands"}, at={@At(value="RETURN")})
    private void minihud_onCommandTree(CallbackInfo ci) {
        if (Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
            EntityDataManager.getInstance().resetOpCheck();
        }
    }
}

