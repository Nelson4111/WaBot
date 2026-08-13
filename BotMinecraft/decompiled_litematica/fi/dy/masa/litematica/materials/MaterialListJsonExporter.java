/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.Gson
 *  com.google.gson.GsonBuilder
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.DynamicOps
 *  com.mojang.serialization.JsonOps
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  fi.dy.masa.malilib.util.time.TimeFormat
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Holder
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.world.item.Item
 */
package fi.dy.masa.litematica.materials;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.DynamicOps;
import com.mojang.serialization.JsonOps;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListSorter;
import fi.dy.masa.malilib.util.time.TimeFormat;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.Minecraft;
import net.minecraft.core.Holder;
import net.minecraft.core.RegistryAccess;
import net.minecraft.world.item.Item;

public class MaterialListJsonExporter {
    private final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private final List<Entry> results = new ArrayList<Entry>();
    private String name = "";
    private String title = "";
    private int multiplier = 1;

    public MaterialListJsonExporter(MaterialListBase materialList) {
        this();
        this.readMaterialList(materialList);
    }

    public MaterialListJsonExporter() {
    }

    public void putEntry(Entry entry) {
        this.results.add(entry);
    }

    public boolean isEmpty() {
        return this.results.isEmpty();
    }

    public int size() {
        return this.results.size();
    }

    public void clear() {
        this.results.clear();
    }

    public boolean readMaterialList(MaterialListBase materialList) {
        List<MaterialListEntry> materials = materialList.getMaterialsFiltered(false);
        int mul = materialList.getMultiplier();
        materials.sort(new MaterialListSorter(materialList));
        this.multiplier = mul;
        this.name = materialList.getName();
        this.title = materialList.getTitle();
        if (materials.isEmpty()) {
            return false;
        }
        materials.forEach(entry -> {
            int total = entry.getCountTotal() * mul;
            int missing = mul > 1 ? total : entry.getCountMissing();
            int mismatched = entry.getCountMismatched() * mul;
            int available = entry.getCountAvailable();
            this.putEntry(new Entry((Holder<Item>)entry.getStack().typeHolder(), total, missing, mismatched, available));
        });
        return this.size() > 0;
    }

    public JsonElement toJson(RegistryAccess registry) {
        JsonArray arr = new JsonArray();
        try {
            this.results.forEach(entry -> arr.add((JsonElement)Entry.CODEC.encodeStart((DynamicOps)registry.createSerializationContext((DynamicOps)JsonOps.INSTANCE), (Object)entry).getPartialOrThrow()));
            return arr;
        }
        catch (Exception e) {
            Litematica.LOGGER.error("MaterialListJsonExporter: Exception writing Cache to JSON; {}", (Object)e.getMessage());
            return new JsonArray();
        }
    }

    public boolean writeCacheToFile(Path file) {
        return this.writeCacheToFile(file, Minecraft.getInstance());
    }

    public boolean writeCacheToFile(Path file, Minecraft mc) {
        return this.writeCacheToFile(file, TimeFormat.RFC1123, mc);
    }

    public boolean writeCacheToFile(Path file, TimeFormat fmt, Minecraft mc) {
        if (this.isEmpty() || mc.level == null) {
            return false;
        }
        if (Files.exists(file, new LinkOption[0])) {
            try {
                Files.delete(file);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("MaterialListJsonExporter#writeCacheToFile(): Exception deleting file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return false;
            }
        }
        try {
            JsonElement arr = this.toJson(mc.level.registryAccess());
            JsonObject obj = new JsonObject();
            obj.addProperty("Name", this.name);
            obj.addProperty("Title", this.title);
            obj.addProperty("Multiplier", (Number)this.multiplier);
            obj.addProperty("Date", fmt.formatNow());
            obj.add("Materials", arr);
            Files.writeString((Path)file, (CharSequence)this.GSON.toJson((JsonElement)obj), (OpenOption[])new OpenOption[0]);
            Litematica.LOGGER.info("MaterialListJsonExporter#writeCacheToFile(): Exported Materials file '{}' successfully.", (Object)file.toAbsolutePath().toString());
            return true;
        }
        catch (IOException err) {
            Litematica.LOGGER.error("MaterialListJsonExporter#writeCacheToFile(): Exception writing file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return false;
        }
    }

    public record Entry(Holder<Item> resultItem, int total, int missing, int mismatched, int available) {
        public static final Codec<Entry> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)Item.CODEC.fieldOf("Item").forGetter(get -> get.resultItem), (App)PrimitiveCodec.INT.fieldOf("Total").forGetter(get -> get.total), (App)PrimitiveCodec.INT.fieldOf("Missing").forGetter(get -> get.missing), (App)PrimitiveCodec.INT.fieldOf("Mismatched").forGetter(get -> get.mismatched), (App)PrimitiveCodec.INT.fieldOf("Available").forGetter(get -> get.available)).apply((Applicative)inst, Entry::new));
    }
}

