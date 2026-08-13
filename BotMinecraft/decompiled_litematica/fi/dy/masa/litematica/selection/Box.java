/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils$CoordinateType
 *  io.netty.buffer.ByteBuf
 *  java.lang.MatchException
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.network.codec.ByteBufCodecs
 *  net.minecraft.network.codec.StreamCodec
 */
package fi.dy.masa.litematica.selection;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import io.netty.buffer.ByteBuf;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;

public class Box {
    public static final Codec<Box> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)BlockPos.CODEC.fieldOf("pos1").forGetter(get -> get.pos1 != null ? get.pos1 : BlockPos.ZERO), (App)BlockPos.CODEC.fieldOf("pos2").forGetter(get -> get.pos2 != null ? get.pos2 : BlockPos.ZERO), (App)PrimitiveCodec.STRING.fieldOf("name").forGetter(get -> get.name)).apply((Applicative)inst, Box::new));
    public static final StreamCodec<ByteBuf, Box> PACKET_CODEC = new StreamCodec<ByteBuf, Box>(){

        @Nonnull
        public Box decode(@Nonnull ByteBuf buf) {
            return new Box((BlockPos)BlockPos.STREAM_CODEC.decode((Object)buf), (BlockPos)BlockPos.STREAM_CODEC.decode((Object)buf), (String)ByteBufCodecs.STRING_UTF8.decode((Object)buf));
        }

        public void encode(@Nonnull ByteBuf buf, Box value) {
            BlockPos.STREAM_CODEC.encode((Object)buf, (Object)(value.pos1 != null ? value.pos1 : BlockPos.ZERO));
            BlockPos.STREAM_CODEC.encode((Object)buf, (Object)(value.pos2 != null ? value.pos2 : BlockPos.ZERO));
            ByteBufCodecs.STRING_UTF8.encode((Object)buf, (Object)value.name);
        }
    };
    @Nullable
    private BlockPos pos1;
    @Nullable
    private BlockPos pos2;
    private BlockPos size = BlockPos.ZERO;
    private String name = "Unnamed";
    private PositionUtils.Corner selectedCorner = PositionUtils.Corner.NONE;

    public Box() {
        this.pos1 = BlockPos.ZERO;
        this.pos2 = BlockPos.ZERO;
        this.updateSize();
    }

    public Box(@Nullable BlockPos pos1, @Nullable BlockPos pos2, String name) {
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.name = name;
        this.updateSize();
    }

    public Box copy() {
        Box box = new Box(this.pos1, this.pos2, this.name);
        box.setSelectedCorner(this.selectedCorner);
        return box;
    }

    @Nullable
    public BlockPos getPos1() {
        return this.pos1;
    }

    @Nullable
    public BlockPos getPos2() {
        return this.pos2;
    }

    public BlockPos getSize() {
        return this.size;
    }

    public String getName() {
        return this.name;
    }

    public PositionUtils.Corner getSelectedCorner() {
        return this.selectedCorner;
    }

    public void setPos1(@Nullable BlockPos pos) {
        this.pos1 = pos;
        this.updateSize();
    }

    public void setPos2(@Nullable BlockPos pos) {
        this.pos2 = pos;
        this.updateSize();
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSelectedCorner(PositionUtils.Corner corner) {
        this.selectedCorner = corner;
    }

    private void updateSize() {
        this.size = this.pos1 != null && this.pos2 != null ? PositionUtils.getAreaSizeFromRelativeEndPosition(this.pos2.subtract((Vec3i)this.pos1)) : (this.pos1 == null && this.pos2 == null ? BlockPos.ZERO : new BlockPos(1, 1, 1));
    }

    public BlockPos getPosition(PositionUtils.Corner corner) {
        return corner == PositionUtils.Corner.CORNER_1 ? this.getPos1() : this.getPos2();
    }

    public int getCoordinate(PositionUtils.Corner corner, PositionUtils.CoordinateType type) {
        BlockPos pos = this.getPosition(corner);
        return switch (type) {
            default -> throw new MatchException(null, null);
            case PositionUtils.CoordinateType.X -> pos.getX();
            case PositionUtils.CoordinateType.Y -> pos.getY();
            case PositionUtils.CoordinateType.Z -> pos.getZ();
        };
    }

    protected void setPosition(BlockPos pos, PositionUtils.Corner corner) {
        if (corner == PositionUtils.Corner.CORNER_1) {
            this.setPos1(pos);
        } else if (corner == PositionUtils.Corner.CORNER_2) {
            this.setPos2(pos);
        }
    }

    public void setCoordinate(int value, PositionUtils.Corner corner, PositionUtils.CoordinateType type) {
        BlockPos pos = this.getPosition(corner);
        pos = PositionUtils.getModifiedPosition(pos, value, type);
        this.setPosition(pos, corner);
    }

    public String toString() {
        return "Box[name='" + this.name + "',,pos1={" + (this.pos1 != null ? this.pos1.toString() : "<>") + "},,pos2={" + (this.pos2 != null ? this.pos2.toString() : "<>") + "}]";
    }

    @Nullable
    public static Box fromJson(JsonObject obj) {
        if (JsonUtils.hasString((JsonObject)obj, (String)"name")) {
            BlockPos pos1 = JsonUtils.getBlockPos((JsonObject)obj, (String)"pos1");
            BlockPos pos2 = JsonUtils.getBlockPos((JsonObject)obj, (String)"pos2");
            if (pos1 != null || pos2 != null) {
                Box box = new Box();
                box.setName(obj.get("name").getAsString());
                if (pos1 != null) {
                    box.setPos1(pos1);
                }
                if (pos2 != null) {
                    box.setPos2(pos2);
                }
                return box;
            }
        }
        return null;
    }

    @Nullable
    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        if (this.pos1 != null) {
            obj.add("pos1", (JsonElement)JsonUtils.blockPosToJson((Vec3i)this.pos1));
        }
        if (this.pos2 != null) {
            obj.add("pos2", (JsonElement)JsonUtils.blockPosToJson((Vec3i)this.pos2));
        }
        obj.add("name", (JsonElement)new JsonPrimitive(this.name));
        return this.pos1 != null || this.pos2 != null ? obj : null;
    }
}

