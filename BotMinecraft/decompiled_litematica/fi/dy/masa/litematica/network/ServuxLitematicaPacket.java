/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.network.IClientPayloadData
 *  io.netty.buffer.Unpooled
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.NbtAccounter
 *  net.minecraft.nbt.Tag
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.network.codec.StreamCodec
 *  net.minecraft.network.protocol.common.custom.CustomPacketPayload
 *  net.minecraft.network.protocol.common.custom.CustomPacketPayload$Type
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.network;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.network.ServuxLitematicaHandler;
import fi.dy.masa.malilib.network.IClientPayloadData;
import io.netty.buffer.Unpooled;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtAccounter;
import net.minecraft.nbt.Tag;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.world.level.ChunkPos;

public class ServuxLitematicaPacket
implements IClientPayloadData {
    private Type packetType;
    private int transactionId;
    private int entityId;
    private BlockPos pos;
    private CompoundTag nbt;
    private ChunkPos chunkPos;
    private FriendlyByteBuf buffer;
    public static final int PROTOCOL_VERSION = 1;

    private ServuxLitematicaPacket(Type type) {
        this.packetType = type;
        this.transactionId = -1;
        this.entityId = -1;
        this.pos = BlockPos.ZERO;
        this.chunkPos = ChunkPos.ZERO;
        this.nbt = new CompoundTag();
        this.clearPacket();
    }

    public static ServuxLitematicaPacket MetadataRequest(@Nullable CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_METADATA_REQUEST);
        if (nbt != null) {
            packet.nbt.merge(nbt);
        }
        return packet;
    }

    public static ServuxLitematicaPacket MetadataResponse(@Nullable CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_S2C_METADATA);
        if (nbt != null) {
            packet.nbt.merge(nbt);
        }
        return packet;
    }

    public static ServuxLitematicaPacket SimpleEntityResponse(int entityId, @Nullable CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_S2C_ENTITY_NBT_RESPONSE_SIMPLE);
        if (nbt != null) {
            packet.nbt.merge(nbt);
        }
        packet.entityId = entityId;
        return packet;
    }

    public static ServuxLitematicaPacket SimpleBlockResponse(BlockPos pos, @Nullable CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_S2C_BLOCK_NBT_RESPONSE_SIMPLE);
        if (nbt != null) {
            packet.nbt.merge(nbt);
        }
        packet.pos = pos.immutable();
        return packet;
    }

    public static ServuxLitematicaPacket BlockEntityRequest(BlockPos pos) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_BLOCK_ENTITY_REQUEST);
        packet.pos = pos.immutable();
        return packet;
    }

    public static ServuxLitematicaPacket EntityRequest(int entityId) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_ENTITY_REQUEST);
        packet.entityId = entityId;
        return packet;
    }

    public static ServuxLitematicaPacket BulkNbtRequest(ChunkPos chunkPos, @Nullable CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_BULK_ENTITY_NBT_REQUEST);
        packet.chunkPos = chunkPos;
        if (nbt != null) {
            packet.nbt.merge(nbt);
        }
        return packet;
    }

    public static ServuxLitematicaPacket ResponseS2CStart(@Nonnull CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_S2C_NBT_RESPONSE_START);
        packet.nbt.merge(nbt);
        return packet;
    }

    public static ServuxLitematicaPacket ResponseS2CData(@Nonnull FriendlyByteBuf buffer) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_S2C_NBT_RESPONSE_DATA);
        packet.buffer = new FriendlyByteBuf(buffer.copy());
        packet.nbt = new CompoundTag();
        return packet;
    }

    public static ServuxLitematicaPacket ResponseC2SStart(@Nonnull CompoundTag nbt) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_NBT_RESPONSE_START);
        packet.nbt.merge(nbt);
        return packet;
    }

    public static ServuxLitematicaPacket ResponseC2SData(@Nonnull FriendlyByteBuf buffer) {
        ServuxLitematicaPacket packet = new ServuxLitematicaPacket(Type.PACKET_C2S_NBT_RESPONSE_DATA);
        packet.buffer = new FriendlyByteBuf(buffer.copy());
        packet.nbt = new CompoundTag();
        return packet;
    }

    private void clearPacket() {
        if (this.buffer != null) {
            this.buffer.clear();
            this.buffer = new FriendlyByteBuf(Unpooled.buffer());
        }
    }

    public int getVersion() {
        return 1;
    }

    public int getPacketType() {
        return this.packetType.get();
    }

    public int getTotalSize() {
        int total = 2;
        if (this.nbt != null && !this.nbt.isEmpty()) {
            total += this.nbt.sizeInBytes();
        }
        if (this.buffer != null) {
            total += this.buffer.readableBytes();
        }
        return total;
    }

    public Type getType() {
        return this.packetType;
    }

    public int getTransactionId() {
        return this.transactionId;
    }

    public int getEntityId() {
        return this.entityId;
    }

    public BlockPos getPos() {
        return this.pos;
    }

    public CompoundTag getCompound() {
        return this.nbt;
    }

    public ChunkPos getChunkPos() {
        return this.chunkPos;
    }

    public FriendlyByteBuf getBuffer() {
        return this.buffer;
    }

    public boolean hasBuffer() {
        return this.buffer != null && this.buffer.isReadable();
    }

    public boolean hasNbt() {
        return this.nbt != null && !this.nbt.isEmpty();
    }

    public boolean isEmpty() {
        return !this.hasBuffer() && !this.hasNbt();
    }

    public void toPacket(FriendlyByteBuf output) {
        output.writeVarInt(this.packetType.get());
        switch (this.packetType.ordinal()) {
            case 2: {
                try {
                    output.writeVarInt(this.transactionId);
                    output.writeBlockPos(this.pos);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing Block Entity Request to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 3: {
                try {
                    output.writeVarInt(this.transactionId);
                    output.writeVarInt(this.entityId);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing Entity Request to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 4: {
                try {
                    output.writeBlockPos(this.pos);
                    output.writeNbt((Tag)this.nbt);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing Block Entity Response to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 5: {
                try {
                    output.writeVarInt(this.entityId);
                    output.writeNbt((Tag)this.nbt);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing Entity Response to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 6: {
                try {
                    output.writeChunkPos(this.chunkPos);
                    output.writeNbt((Tag)this.nbt);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing Bulk Entity Request to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 8: 
            case 10: {
                try {
                    output.writeBytes(this.buffer.copy());
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing buffer data to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            case 0: 
            case 1: {
                try {
                    output.writeNbt((Tag)this.nbt);
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: error writing NBT to packet: [{}]", (Object)e.getLocalizedMessage());
                }
                break;
            }
            default: {
                Litematica.LOGGER.error("ServuxEntitiesPacket#toPacket: Unknown packet type!");
            }
        }
    }

    @Nullable
    public static ServuxLitematicaPacket fromPacket(FriendlyByteBuf input) {
        int i = input.readVarInt();
        Type type = ServuxLitematicaPacket.getType(i);
        if (type == null) {
            Litematica.LOGGER.warn("ServuxEntitiesPacket#fromPacket: invalid packet type received");
            return null;
        }
        switch (type.ordinal()) {
            case 2: {
                try {
                    input.readVarInt();
                    return ServuxLitematicaPacket.BlockEntityRequest(input.readBlockPos());
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Block Entity Request from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 3: {
                try {
                    input.readVarInt();
                    return ServuxLitematicaPacket.EntityRequest(input.readVarInt());
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Entity Request from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 4: {
                try {
                    return ServuxLitematicaPacket.SimpleBlockResponse(input.readBlockPos(), (CompoundTag)input.readNbt(NbtAccounter.unlimitedHeap()));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Block Entity Response from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 5: {
                try {
                    return ServuxLitematicaPacket.SimpleEntityResponse(input.readVarInt(), (CompoundTag)input.readNbt(NbtAccounter.unlimitedHeap()));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Entity Response from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 6: {
                try {
                    return ServuxLitematicaPacket.BulkNbtRequest(input.readChunkPos(), (CompoundTag)input.readNbt(NbtAccounter.unlimitedHeap()));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Bulk Entity Request from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 8: {
                try {
                    return ServuxLitematicaPacket.ResponseS2CData(new FriendlyByteBuf(input.readBytes(input.readableBytes())));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading S2C Bulk Response Buffer from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 10: {
                try {
                    return ServuxLitematicaPacket.ResponseC2SData(new FriendlyByteBuf(input.readBytes(input.readableBytes())));
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading C2S Bulk Response Buffer from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 1: {
                try {
                    return ServuxLitematicaPacket.MetadataRequest(input.readNbt());
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Metadata Request from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            case 0: {
                try {
                    return ServuxLitematicaPacket.MetadataResponse(input.readNbt());
                }
                catch (Exception e) {
                    Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: error reading Metadata Response from packet: [{}]", (Object)e.getLocalizedMessage());
                    break;
                }
            }
            default: {
                Litematica.LOGGER.error("ServuxEntitiesPacket#fromPacket: Unknown packet type!");
            }
        }
        return null;
    }

    public void clear() {
        if (this.nbt != null && !this.nbt.isEmpty()) {
            this.nbt = new CompoundTag();
        }
        this.clearPacket();
        this.transactionId = -1;
        this.entityId = -1;
        this.pos = BlockPos.ZERO;
        this.packetType = null;
    }

    @Nullable
    public static Type getType(int input) {
        for (Type type : Type.values()) {
            if (type.get() != input) continue;
            return type;
        }
        return null;
    }

    public static enum Type {
        PACKET_S2C_METADATA(1),
        PACKET_C2S_METADATA_REQUEST(2),
        PACKET_C2S_BLOCK_ENTITY_REQUEST(3),
        PACKET_C2S_ENTITY_REQUEST(4),
        PACKET_S2C_BLOCK_NBT_RESPONSE_SIMPLE(5),
        PACKET_S2C_ENTITY_NBT_RESPONSE_SIMPLE(6),
        PACKET_C2S_BULK_ENTITY_NBT_REQUEST(7),
        PACKET_S2C_NBT_RESPONSE_START(10),
        PACKET_S2C_NBT_RESPONSE_DATA(11),
        PACKET_C2S_NBT_RESPONSE_START(12),
        PACKET_C2S_NBT_RESPONSE_DATA(13);

        private final int type;

        private Type(int type) {
            this.type = type;
        }

        int get() {
            return this.type;
        }
    }

    public record Payload(ServuxLitematicaPacket data) implements CustomPacketPayload
    {
        public static final CustomPacketPayload.Type<Payload> ID = new CustomPacketPayload.Type(ServuxLitematicaHandler.CHANNEL_ID);
        public static final StreamCodec<FriendlyByteBuf, Payload> CODEC = CustomPacketPayload.codec(Payload::write, Payload::new);

        public Payload(FriendlyByteBuf input) {
            this(ServuxLitematicaPacket.fromPacket(input));
        }

        private void write(FriendlyByteBuf output) {
            this.data.toPacket(output);
        }

        @Nonnull
        public CustomPacketPayload.Type<? extends CustomPacketPayload> type() {
            return ID;
        }
    }
}

