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
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  org.apache.commons.lang3.StringUtils
 */
package fi.dy.masa.litematica.schematic.projects;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import org.apache.commons.lang3.StringUtils;

public class SchematicVersion {
    public static final int MAX_DESCRIPTION_LENGTH = 512;
    public static final Codec<SchematicVersion> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.STRING.fieldOf("name").forGetter(get -> get.name), (App)PrimitiveCodec.STRING.fieldOf("file_name").forGetter(get -> get.fileName), (App)PrimitiveCodec.STRING.fieldOf("description").forGetter(get -> get.description), (App)BlockPos.CODEC.fieldOf("area_offset").forGetter(get -> get.areaOffset), (App)PrimitiveCodec.INT.fieldOf("version").forGetter(get -> get.version), (App)PrimitiveCodec.LONG.fieldOf("time_stamp").forGetter(get -> get.timeStamp)).apply((Applicative)inst, SchematicVersion::new));
    private final String name;
    private final String fileName;
    private final String description;
    private final BlockPos areaOffset;
    private final int version;
    private final long timeStamp;

    SchematicVersion(String name, String fileName, String description, BlockPos areaOffset, int version, long timeStamp) {
        this.name = name;
        this.fileName = fileName;
        this.description = description != null ? StringUtils.abbreviate((String)description, (int)512) : "";
        this.areaOffset = areaOffset;
        this.version = version;
        this.timeStamp = timeStamp;
    }

    public String getName() {
        return this.name;
    }

    public String getFileName() {
        return this.fileName;
    }

    public String getDescription() {
        return this.description;
    }

    public BlockPos getAreaOffset() {
        return this.areaOffset;
    }

    public int getVersion() {
        return this.version;
    }

    public long getTimeStamp() {
        return this.timeStamp;
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        obj.add("name", (JsonElement)new JsonPrimitive(this.name));
        obj.add("file_name", (JsonElement)new JsonPrimitive(this.fileName));
        obj.add("description", (JsonElement)new JsonPrimitive(this.description));
        obj.add("area_offset", (JsonElement)JsonUtils.blockPosToJson((Vec3i)this.areaOffset));
        obj.add("version", (JsonElement)new JsonPrimitive((Number)this.version));
        obj.add("timestamp", (JsonElement)new JsonPrimitive((Number)this.timeStamp));
        return obj;
    }

    @Nullable
    public static SchematicVersion fromJson(JsonObject obj) {
        BlockPos areaOffset = JsonUtils.getBlockPos((JsonObject)obj, (String)"area_offset");
        if (areaOffset != null && JsonUtils.hasString((JsonObject)obj, (String)"name") && JsonUtils.hasString((JsonObject)obj, (String)"file_name")) {
            String name = JsonUtils.getString((JsonObject)obj, (String)"name");
            String fileName = JsonUtils.getString((JsonObject)obj, (String)"file_name");
            String desc = "";
            desc = JsonUtils.hasString((JsonObject)obj, (String)"description") ? StringUtils.abbreviate((String)JsonUtils.getString((JsonObject)obj, (String)"description"), (int)512) : name;
            int version = JsonUtils.getInteger((JsonObject)obj, (String)"version");
            long timeStamp = JsonUtils.getLong((JsonObject)obj, (String)"timestamp");
            return new SchematicVersion(name, fileName, desc, areaOffset, version, timeStamp);
        }
        return null;
    }
}

