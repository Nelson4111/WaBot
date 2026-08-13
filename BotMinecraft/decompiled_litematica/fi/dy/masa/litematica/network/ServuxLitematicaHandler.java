/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.network.IClientPayloadData
 *  fi.dy.masa.malilib.network.IPluginClientPlayHandler
 *  fi.dy.masa.malilib.network.PacketSplitter
 *  fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt
 *  io.netty.buffer.Unpooled
 *  javax.annotation.Nullable
 *  net.fabricmc.api.EnvType
 *  net.fabricmc.api.Environment
 *  net.fabricmc.fabric.api.client.networking.v1.ClientPlayNetworking$Context
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientPacketListener
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.NbtAccounter
 *  net.minecraft.nbt.Tag
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.network.protocol.common.custom.CustomPacketPayload
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.RandomSource
 *  net.minecraft.util.Util
 *  org.jspecify.annotations.NonNull
 */
package fi.dy.masa.litematica.network;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.network.ServuxLitematicaPacket;
import fi.dy.masa.malilib.network.IClientPayloadData;
import fi.dy.masa.malilib.network.IPluginClientPlayHandler;
import fi.dy.masa.malilib.network.PacketSplitter;
import fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt;
import io.netty.buffer.Unpooled;
import javax.annotation.Nullable;
import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayNetworking;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtAccounter;
import net.minecraft.nbt.Tag;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.resources.Identifier;
import net.minecraft.util.RandomSource;
import net.minecraft.util.Util;
import org.jspecify.annotations.NonNull;

@Environment(value=EnvType.CLIENT)
public abstract class ServuxLitematicaHandler<T extends CustomPacketPayload>
implements IPluginClientPlayHandler<T> {
    private static final ServuxLitematicaHandler<ServuxLitematicaPacket.Payload> INSTANCE = new ServuxLitematicaHandler<ServuxLitematicaPacket.Payload>(){

        public void receive(@NonNull ServuxLitematicaPacket.Payload payload, // Could not load outer class - annotation placement on inner may be incorrect
         @NonNull ClientPlayNetworking.Context context) {
            INSTANCE.receivePlayPayload(payload, context);
        }
    };
    public static final Identifier CHANNEL_ID = Identifier.fromNamespaceAndPath((String)"servux", (String)"litematics");
    private boolean servuxRegistered;
    private boolean payloadRegistered = false;
    private int failures = 0;
    private static final int MAX_FAILURES = 4;
    private long readingSessionKey = -1L;

    public static ServuxLitematicaHandler<ServuxLitematicaPacket.Payload> getInstance() {
        return INSTANCE;
    }

    public Identifier getPayloadChannel() {
        return CHANNEL_ID;
    }

    public boolean isPlayRegistered(Identifier channel) {
        if (channel.equals((Object)CHANNEL_ID)) {
            return this.payloadRegistered;
        }
        return false;
    }

    public void setPlayRegistered(Identifier channel) {
        if (channel.equals((Object)CHANNEL_ID)) {
            this.payloadRegistered = true;
        }
    }

    public <P extends IClientPayloadData> void decodeClientData(Identifier channel, P data) {
        ServuxLitematicaPacket packet = (ServuxLitematicaPacket)data;
        if (!channel.equals((Object)CHANNEL_ID)) {
            return;
        }
        switch (packet.getType()) {
            case PACKET_S2C_METADATA: {
                if (!EntityDataManager.getInstance().receiveServuxMetadata(packet.getCompound())) break;
                this.servuxRegistered = true;
                break;
            }
            case PACKET_S2C_BLOCK_NBT_RESPONSE_SIMPLE: {
                if (!this.servuxRegistered) break;
                EntityDataManager.getInstance().handleBlockEntityData(packet.getPos(), packet.getCompound());
                break;
            }
            case PACKET_S2C_ENTITY_NBT_RESPONSE_SIMPLE: {
                if (!this.servuxRegistered) break;
                EntityDataManager.getInstance().handleEntityData(packet.getEntityId(), packet.getCompound());
                break;
            }
            case PACKET_S2C_NBT_RESPONSE_DATA: {
                FriendlyByteBuf fullPacket;
                if (!this.servuxRegistered) {
                    return;
                }
                if (this.readingSessionKey == -1L) {
                    this.readingSessionKey = RandomSource.create((long)Util.getMillis()).nextLong();
                }
                if ((fullPacket = PacketSplitter.receive((IPluginClientPlayHandler)this, (long)this.readingSessionKey, (FriendlyByteBuf)packet.getBuffer())) == null) break;
                try {
                    this.readingSessionKey = -1L;
                    this.handleBulkData(fullPacket.readVarInt(), (CompoundTag)fullPacket.readNbt(NbtAccounter.unlimitedHeap()));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxLitematicaHandler#decodeClientData(): Entity Data: error reading fullBuffer [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            default: {
                Litematica.LOGGER.warn("ServuxLitematicaHandler#decodeClientData(): received unhandled packetType {} of size {} bytes.", (Object)packet.getPacketType(), (Object)packet.getTotalSize());
            }
        }
    }

    private void handleBulkData(int type, @Nullable CompoundTag nbt) {
        if (nbt == null || nbt.isEmpty()) {
            return;
        }
        String task = nbt.getStringOr("Task", "BulkEntityReply");
        Litematica.debugLog("handleBulkData: received task: {}", task);
        EntityDataManager.getInstance().handleBulkEntityData(type, DataConverterNbt.fromVanillaCompound((CompoundTag)nbt));
    }

    public void reset(Identifier channel) {
        if (channel.equals((Object)CHANNEL_ID) && this.servuxRegistered) {
            this.servuxRegistered = false;
            this.failures = 0;
            this.readingSessionKey = -1L;
        }
    }

    public void resetFailures(Identifier channel) {
        if (channel.equals((Object)CHANNEL_ID) && this.failures > 0) {
            this.failures = 0;
        }
    }

    public void receivePlayPayload(T payload, ClientPlayNetworking.Context ctx) {
        if (payload.type().id().equals((Object)CHANNEL_ID)) {
            INSTANCE.decodeClientData(CHANNEL_ID, ((ServuxLitematicaPacket.Payload)((Object)payload)).data());
        }
    }

    public void encodeWithSplitter(FriendlyByteBuf buffer, ClientPacketListener handler) {
        INSTANCE.sendPlayPayload(new ServuxLitematicaPacket.Payload(ServuxLitematicaPacket.ResponseC2SData(buffer)));
    }

    public <P extends IClientPayloadData> void encodeClientData(P data) {
        ServuxLitematicaPacket packet = (ServuxLitematicaPacket)data;
        if (packet.getType().equals((Object)ServuxLitematicaPacket.Type.PACKET_C2S_NBT_RESPONSE_START)) {
            FriendlyByteBuf buffer = new FriendlyByteBuf(Unpooled.buffer());
            buffer.writeVarInt(packet.getTransactionId());
            buffer.writeNbt((Tag)packet.getCompound());
            PacketSplitter.send((IPluginClientPlayHandler)this, (FriendlyByteBuf)buffer, (ClientPacketListener)Minecraft.getInstance().getConnection());
        } else if (!INSTANCE.sendPlayPayload(new ServuxLitematicaPacket.Payload(packet))) {
            if (this.failures > 4) {
                Litematica.LOGGER.warn("encodeClientData(): encountered [{}] sendPayload failures, cancelling any Servux join attempt(s)", (Object)4);
                this.servuxRegistered = false;
                INSTANCE.unregisterPlayReceiver();
                EntityDataManager.getInstance().onPacketFailure();
            } else {
                ++this.failures;
            }
        }
    }
}

