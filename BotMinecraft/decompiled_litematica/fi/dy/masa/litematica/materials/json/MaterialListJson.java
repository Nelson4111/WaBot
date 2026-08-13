/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.gson.Gson
 *  com.google.gson.GsonBuilder
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.mojang.serialization.DynamicOps
 *  com.mojang.serialization.JsonOps
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Holder
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.resources.RegistryOps
 *  net.minecraft.world.item.Item
 */
package fi.dy.masa.litematica.materials.json;

import com.google.common.collect.ImmutableList;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.mojang.serialization.DynamicOps;
import com.mojang.serialization.JsonOps;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.json.MaterialListJsonBase;
import fi.dy.masa.litematica.materials.json.MaterialListJsonCache;
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
import net.minecraft.resources.RegistryOps;
import net.minecraft.world.item.Item;

public class MaterialListJson {
    private final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private final List<MaterialListJsonBase> data = new ArrayList<MaterialListJsonBase>();

    public List<MaterialListJsonBase> getMaterials() {
        return this.data;
    }

    public boolean readMaterialListAll(MaterialListBase materialList, MaterialListJsonCache cache, boolean craftingOnly) {
        ImmutableList<MaterialListEntry> materials = materialList.getMaterialsAll();
        if (materials.isEmpty()) {
            return false;
        }
        this.data.clear();
        materials.forEach(entry -> {
            Holder resultItem = entry.getStack().typeHolder();
            int total = entry.getStack().getCount() * entry.getCountTotal();
            MaterialListJsonBase base = new MaterialListJsonBase((Holder<Item>)resultItem, total, null, craftingOnly);
            this.data.add(base);
            cache.buildStepsBase(base, new ArrayList<MaterialListJsonCache.Step>(), new MaterialListJsonCache.Result((Holder<Item>)resultItem, total));
        });
        cache.simplifyFlatEntrySteps();
        cache.repackCombinedEntries();
        return true;
    }

    public boolean readMaterialListMissingOnly(MaterialListBase materialList, MaterialListJsonCache cache, boolean craftingOnly) {
        List<MaterialListEntry> materials = materialList.getMaterialsMissingOnly(false);
        if (materials.isEmpty()) {
            return false;
        }
        this.data.clear();
        materials.forEach(entry -> {
            Holder resultItem = entry.getStack().typeHolder();
            int total = entry.getStack().getCount() * entry.getCountTotal();
            MaterialListJsonBase base = new MaterialListJsonBase((Holder<Item>)resultItem, total, null, craftingOnly);
            this.data.add(base);
            cache.buildStepsBase(base, new ArrayList<MaterialListJsonCache.Step>(), new MaterialListJsonCache.Result((Holder<Item>)resultItem, total));
        });
        cache.simplifyFlatEntrySteps();
        cache.repackCombinedEntries();
        return true;
    }

    public boolean writeRecipeDetailJson(Path file, Minecraft mc) {
        if (this.data.isEmpty() || mc.level == null) {
            return false;
        }
        if (Files.exists(file, new LinkOption[0])) {
            try {
                Files.delete(file);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("MaterialListJson#toJson(): Exception deleting file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return false;
            }
        }
        try {
            Files.writeString((Path)file, (CharSequence)this.GSON.toJson(this.toJson(mc.level.registryAccess())), (OpenOption[])new OpenOption[0]);
            Litematica.LOGGER.info("MaterialListJson#toJson(): Exported Materials file '{}' successfully.", (Object)file.toAbsolutePath().toString());
            return true;
        }
        catch (IOException err) {
            Litematica.LOGGER.error("MaterialListJson#toJson(): Exception writing file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return false;
        }
    }

    public boolean writeCacheFlatJson(MaterialListJsonCache cache, Path file, Minecraft mc) {
        if (cache.isEmptyFlat() || mc.level == null) {
            return false;
        }
        if (Files.exists(file, new LinkOption[0])) {
            try {
                Files.delete(file);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("MaterialListJson#writeCacheFlatJson(): Exception deleting file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return false;
            }
        }
        try {
            Files.writeString((Path)file, (CharSequence)this.GSON.toJson(cache.toFlatJson(mc.level.registryAccess().createSerializationContext((DynamicOps)JsonOps.INSTANCE))), (OpenOption[])new OpenOption[0]);
            Litematica.LOGGER.info("MaterialListJson#writeCacheFlatJson(): Exported Materials Cache file '{}' successfully.", (Object)file.toAbsolutePath().toString());
            return true;
        }
        catch (IOException err) {
            Litematica.LOGGER.error("MaterialListJson#writeCacheFlatJson(): Exception writing file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return false;
        }
    }

    public boolean writeCacheCombinedJson(MaterialListJsonCache cache, Path file, Minecraft mc) {
        if (cache.isEmptyCombined() || mc.level == null) {
            return false;
        }
        if (Files.exists(file, new LinkOption[0])) {
            try {
                Files.delete(file);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("MaterialListJson#writeCacheCombinedJson(): Exception deleting file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return false;
            }
        }
        try {
            Files.writeString((Path)file, (CharSequence)this.GSON.toJson(cache.toCombinedJson(mc.level.registryAccess().createSerializationContext((DynamicOps)JsonOps.INSTANCE))), (OpenOption[])new OpenOption[0]);
            Litematica.LOGGER.info("MaterialListJson#writeCacheCombinedJson(): Exported Materials Cache file '{}' successfully.", (Object)file.toAbsolutePath().toString());
            return true;
        }
        catch (IOException err) {
            Litematica.LOGGER.error("MaterialListJson#writeCacheCombinedJson(): Exception writing file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return false;
        }
    }

    public JsonElement toJson(RegistryAccess registry) {
        RegistryOps ops = registry.createSerializationContext((DynamicOps)JsonOps.INSTANCE);
        JsonArray arr = new JsonArray();
        this.data.forEach(entry -> arr.add(entry.toJson(ops)));
        return arr;
    }

    public void clear() {
        this.data.clear();
    }
}

