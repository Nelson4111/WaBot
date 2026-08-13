/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonArray
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
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.network.codec.ByteBufCodecs
 *  net.minecraft.network.codec.StreamCodec
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 */
package fi.dy.masa.litematica.schematic.placement;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementEventHandler;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import io.netty.buffer.ByteBuf;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;

public class SubRegionPlacement {
    public static final Codec<SubRegionPlacement> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.STRING.fieldOf("Name").forGetter(get -> get.name), (App)BlockPos.CODEC.fieldOf("DefaultPos").forGetter(get -> get.defaultPos), (App)BlockPos.CODEC.fieldOf("Pos").forGetter(get -> get.pos), (App)Rotation.CODEC.fieldOf("Rotation").forGetter(get -> get.rotation), (App)Mirror.CODEC.fieldOf("Mirror").forGetter(get -> get.mirror), (App)PrimitiveCodec.BOOL.fieldOf("Enabled").forGetter(get -> get.enabled), (App)PrimitiveCodec.BOOL.fieldOf("RenderingEnabled").forGetter(get -> get.renderingEnabled), (App)PrimitiveCodec.BOOL.fieldOf("IgnoreEntities").forGetter(get -> get.ignoreEntities), (App)PrimitiveCodec.INT.fieldOf("CoordinateLockMask").forGetter(get -> get.coordinateLockMask)).apply((Applicative)inst, SubRegionPlacement::new));
    public static final StreamCodec<ByteBuf, Mirror> BLOCK_MIRROR_PACKET_CODEC = ByteBufCodecs.STRING_UTF8.map(Mirror::valueOf, Mirror::getSerializedName);
    public static final StreamCodec<ByteBuf, SubRegionPlacement> PACKET_CODEC = new StreamCodec<ByteBuf, SubRegionPlacement>(){

        public void encode(@Nonnull ByteBuf buf, SubRegionPlacement value) {
            ByteBufCodecs.STRING_UTF8.encode((Object)buf, (Object)value.name);
            BlockPos.STREAM_CODEC.encode((Object)buf, (Object)value.defaultPos);
            BlockPos.STREAM_CODEC.encode((Object)buf, (Object)value.pos);
            Rotation.STREAM_CODEC.encode((Object)buf, (Object)value.rotation);
            BLOCK_MIRROR_PACKET_CODEC.encode((Object)buf, (Object)value.mirror);
            ByteBufCodecs.BOOL.encode((Object)buf, (Object)value.enabled);
            ByteBufCodecs.BOOL.encode((Object)buf, (Object)value.renderingEnabled);
            ByteBufCodecs.BOOL.encode((Object)buf, (Object)value.ignoreEntities);
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.coordinateLockMask);
        }

        @Nonnull
        public SubRegionPlacement decode(@Nonnull ByteBuf buf) {
            return new SubRegionPlacement((String)ByteBufCodecs.STRING_UTF8.decode((Object)buf), (BlockPos)BlockPos.STREAM_CODEC.decode((Object)buf), (BlockPos)BlockPos.STREAM_CODEC.decode((Object)buf), (Rotation)Rotation.STREAM_CODEC.decode((Object)buf), (Mirror)BLOCK_MIRROR_PACKET_CODEC.decode((Object)buf), (Boolean)ByteBufCodecs.BOOL.decode((Object)buf), (Boolean)ByteBufCodecs.BOOL.decode((Object)buf), (Boolean)ByteBufCodecs.BOOL.decode((Object)buf), (Integer)ByteBufCodecs.INT.decode((Object)buf));
        }
    };
    private final String name;
    private final BlockPos defaultPos;
    private BlockPos pos;
    private Rotation rotation = Rotation.NONE;
    private Mirror mirror = Mirror.NONE;
    private boolean enabled = true;
    private boolean renderingEnabled = true;
    private boolean ignoreEntities;
    private int coordinateLockMask;

    public SubRegionPlacement(BlockPos pos, String name) {
        this.pos = pos;
        this.defaultPos = pos;
        this.name = name;
        SchematicPlacementEventHandler.getInstance().onSubRegionInit(this);
    }

    private SubRegionPlacement(String name, BlockPos defPos, BlockPos pos, Rotation rot, Mirror mirror, Boolean enabled, Boolean renderingEnabled, Boolean ignoreEntities, Integer coordinateLockMask) {
        this(defPos, name);
        this.pos = pos;
        this.rotation = rot;
        this.mirror = mirror;
        this.enabled = enabled;
        this.renderingEnabled = renderingEnabled;
        this.ignoreEntities = ignoreEntities;
        this.coordinateLockMask = coordinateLockMask;
        SchematicPlacementEventHandler.getInstance().onSubRegionInit(this);
    }

    public boolean isEnabled() {
        return this.enabled;
    }

    public boolean isRenderingEnabled() {
        return this.renderingEnabled;
    }

    public boolean ignoreEntities() {
        return this.ignoreEntities;
    }

    public void setCoordinateLocked(PositionUtils.CoordinateType coord, boolean locked) {
        int mask = 1 << coord.ordinal();
        this.coordinateLockMask = locked ? (this.coordinateLockMask |= mask) : (this.coordinateLockMask &= ~mask);
    }

    public boolean isCoordinateLocked(PositionUtils.CoordinateType coord) {
        int mask = 1 << coord.ordinal();
        return (this.coordinateLockMask & mask) != 0;
    }

    public boolean matchesRequirement(RequiredEnabled required) {
        if (required == RequiredEnabled.ANY) {
            return true;
        }
        if (required == RequiredEnabled.PLACEMENT_ENABLED) {
            return this.isEnabled();
        }
        return this.isEnabled() && this.isRenderingEnabled() && Configs.Visuals.ENABLE_RENDERING.getBooleanValue();
    }

    public String getName() {
        return this.name;
    }

    public BlockPos getDefaultPos() {
        return this.defaultPos;
    }

    public BlockPos getPos() {
        return this.pos;
    }

    public Rotation getRotation() {
        return this.rotation;
    }

    public Mirror getMirror() {
        return this.mirror;
    }

    public void setRenderingEnabled(boolean renderingEnabled) {
        this.renderingEnabled = renderingEnabled;
        SchematicPlacementEventHandler.getInstance().onSetSubRegionRender(this, renderingEnabled);
    }

    public void toggleRenderingEnabled() {
        this.setRenderingEnabled(!this.isRenderingEnabled());
    }

    void setEnabled(boolean enabled) {
        this.enabled = enabled;
        SchematicPlacementEventHandler.getInstance().onSetSubRegionEnabled(this, enabled);
    }

    void toggleEnabled() {
        this.setEnabled(!this.isEnabled());
    }

    void toggleIgnoreEntities() {
        this.ignoreEntities = !this.ignoreEntities;
    }

    void setPos(BlockPos pos) {
        this.pos = PositionUtils.getModifiedPartiallyLockedPosition(this.pos, pos, this.coordinateLockMask);
        SchematicPlacementEventHandler.getInstance().onSetSubRegionOrigin(this, this.pos);
    }

    void setRotation(Rotation rotation) {
        this.rotation = rotation;
        SchematicPlacementEventHandler.getInstance().onSetSubRegionRotation(this, rotation);
    }

    void setMirror(Mirror mirror) {
        this.mirror = mirror;
        SchematicPlacementEventHandler.getInstance().onSetSubRegionMirror(this, mirror);
    }

    void resetToOriginalValues() {
        SchematicPlacementEventHandler.getInstance().onSubRegionReset(this);
        this.pos = this.defaultPos;
        this.rotation = Rotation.NONE;
        this.mirror = Mirror.NONE;
        this.enabled = true;
        this.ignoreEntities = false;
    }

    public boolean isRegionPlacementModifiedFromDefault() {
        return this.isRegionPlacementModified(this.defaultPos);
    }

    public boolean isRegionPlacementModified(BlockPos originalPosition) {
        return !this.isEnabled() || this.ignoreEntities() || this.getMirror() != Mirror.NONE || this.getRotation() != Rotation.NONE || !this.getPos().equals((Object)originalPosition);
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        if (this.pos == null) {
            return obj;
        }
        JsonArray arr = new JsonArray();
        arr.add((Number)this.pos.getX());
        arr.add((Number)this.pos.getY());
        arr.add((Number)this.pos.getZ());
        obj.add("pos", (JsonElement)arr);
        obj.add("name", (JsonElement)new JsonPrimitive(this.getName()));
        obj.add("rotation", (JsonElement)new JsonPrimitive(this.rotation.name()));
        obj.add("mirror", (JsonElement)new JsonPrimitive(this.mirror.name()));
        obj.add("locked_coords", (JsonElement)new JsonPrimitive((Number)this.coordinateLockMask));
        obj.add("enabled", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.enabled)));
        obj.add("rendering_enabled", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.renderingEnabled)));
        obj.add("ignore_entities", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.ignoreEntities)));
        SchematicPlacementEventHandler.getInstance().onSaveSubRegionToJson(this, obj);
        return obj;
    }

    @Nullable
    public static SubRegionPlacement fromJson(JsonObject obj) {
        if (JsonUtils.hasArray((JsonObject)obj, (String)"pos") && JsonUtils.hasString((JsonObject)obj, (String)"name") && JsonUtils.hasString((JsonObject)obj, (String)"rotation") && JsonUtils.hasString((JsonObject)obj, (String)"mirror")) {
            JsonArray posArr = obj.get("pos").getAsJsonArray();
            if (posArr.size() != 3) {
                Litematica.LOGGER.warn("Placement.fromJson(): Failed to load a placement from JSON, invalid position data");
                return null;
            }
            BlockPos pos = new BlockPos(posArr.get(0).getAsInt(), posArr.get(1).getAsInt(), posArr.get(2).getAsInt());
            SubRegionPlacement placement = new SubRegionPlacement(pos, obj.get("name").getAsString());
            placement.setEnabled(JsonUtils.getBoolean((JsonObject)obj, (String)"enabled"));
            placement.setRenderingEnabled(JsonUtils.getBoolean((JsonObject)obj, (String)"rendering_enabled"));
            placement.ignoreEntities = JsonUtils.getBoolean((JsonObject)obj, (String)"ignore_entities");
            placement.coordinateLockMask = JsonUtils.getInteger((JsonObject)obj, (String)"locked_coords");
            try {
                Rotation rotation = Rotation.valueOf((String)obj.get("rotation").getAsString());
                Mirror mirror = Mirror.valueOf((String)obj.get("mirror").getAsString());
                placement.setRotation(rotation);
                placement.setMirror(mirror);
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("Placement.fromJson(): Invalid rotation or mirror value for a placement");
            }
            SchematicPlacementEventHandler.getInstance().onSubRegionCreateFromJson(placement, pos, placement.getName(), placement.getRotation(), placement.getMirror(), placement.isEnabled(), placement.renderingEnabled, obj);
            return placement;
        }
        return null;
    }

    public static enum RequiredEnabled {
        ANY,
        PLACEMENT_ENABLED,
        RENDERING_ENABLED;

    }
}

