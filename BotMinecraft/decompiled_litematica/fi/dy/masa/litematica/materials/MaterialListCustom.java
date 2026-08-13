/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.gson.Gson
 *  com.google.gson.GsonBuilder
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonParser
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.ItemType
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ItemLike
 */
package fi.dy.masa.litematica.materials;

import com.google.common.collect.ImmutableList;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.ItemType;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.util.Map;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ItemLike;

public class MaterialListCustom
extends MaterialListBase {
    public static final String JSON_FILE_EXTENSION = ".json";
    public static final String TEXT_FILE_EXTENSION = ".txt";
    private final String name;
    private final Path sourceFile;

    public MaterialListCustom(String name, Map<ItemType, Integer> items, @Nullable Path sourceFile) {
        this.name = name;
        this.sourceFile = sourceFile;
        this.materialListAll = ImmutableList.copyOf(MaterialListUtils.createMaterialListFromItems(items, (Player)Minecraft.getInstance().player));
        this.refreshPreFilteredList();
        this.updateCounts();
    }

    @Nullable
    public static MaterialListCustom fromJsonFile(Path file) {
        try {
            String name;
            String content = Files.readString((Path)file);
            JsonElement element = JsonParser.parseString((String)content);
            if (!element.isJsonObject()) {
                Litematica.LOGGER.error("MaterialListCustom#fromJsonFile: Invalid JSON file '{}' - root must be an object", (Object)file);
                return null;
            }
            JsonObject root = element.getAsJsonObject();
            String string = name = root.has("name") ? root.get("name").getAsString() : file.getFileName().toString();
            if (!root.has("items") || !root.get("items").isJsonArray()) {
                Litematica.LOGGER.error("MaterialListCustom#fromJsonFile: JSON file '{}' missing 'items' array", (Object)file);
                return null;
            }
            JsonArray itemsArray = root.getAsJsonArray("items");
            Object2IntOpenHashMap items = new Object2IntOpenHashMap();
            for (JsonElement itemElement : itemsArray) {
                if (!itemElement.isJsonObject()) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromJsonFile: Skipping invalid item entry in '{}'", (Object)file);
                    continue;
                }
                JsonObject itemObj = itemElement.getAsJsonObject();
                if (!itemObj.has("id") || !itemObj.has("count")) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromJsonFile: Skipping item entry missing 'id' or 'count' in '{}'", (Object)file);
                    continue;
                }
                String itemId = itemObj.get("id").getAsString();
                int count = itemObj.get("count").getAsInt();
                if (count <= 0) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromJsonFile: Skipping item '{}' with invalid count {} in '{}'", (Object)itemId, (Object)count, (Object)file);
                    continue;
                }
                Identifier identifier = Identifier.tryParse((String)itemId);
                if (identifier == null) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromJsonFile: Invalid item ID '{}' in '{}'", (Object)itemId, (Object)file);
                    continue;
                }
                Item item = (Item)BuiltInRegistries.ITEM.getValue(identifier);
                if (item == null) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromJsonFile: Unknown item '{}' in '{}'", (Object)itemId, (Object)file);
                    continue;
                }
                ItemStack stack = new ItemStack((ItemLike)item);
                ItemType type = new ItemType(stack, false, false);
                items.addTo((Object)type, count);
            }
            if (items.isEmpty()) {
                Litematica.LOGGER.error("MaterialListCustom#fromJsonFile: No valid items found in '{}'", (Object)file);
                return null;
            }
            Litematica.LOGGER.info("MaterialListCustom#fromJsonFile: Loaded {} item types from '{}'", (Object)items.size(), (Object)file);
            return new MaterialListCustom(name, (Map<ItemType, Integer>)items, file);
        }
        catch (IOException e) {
            Litematica.LOGGER.error("MaterialListCustom#fromJsonFile: Failed to read JSON file '{}': {}", (Object)file, (Object)e.getMessage());
            return null;
        }
        catch (Exception e) {
            Litematica.LOGGER.error("MaterialListCustom#fromJsonFile: Failed to parse JSON file '{}': {}", (Object)file, (Object)e.getMessage());
            return null;
        }
    }

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    @Nullable
    public static MaterialListCustom fromTextFile(Path file) {
        try (BufferedReader reader = Files.newBufferedReader(file);){
            MaterialListCustom materialListCustom;
            String line;
            Object2IntOpenHashMap items = new Object2IntOpenHashMap();
            String name = file.getFileName().toString();
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                int count;
                ++lineNumber;
                if ((line = line.trim()).isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("\\s+");
                if (parts.length != 2) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromTextFile: Invalid line {} in '{}': expected 'item_id count'", (Object)lineNumber, (Object)file);
                    continue;
                }
                String itemId = parts[0];
                try {
                    count = Integer.parseInt(parts[1]);
                }
                catch (NumberFormatException e) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromTextFile: Invalid count '{}' on line {} in '{}'", (Object)parts[1], (Object)lineNumber, (Object)file);
                    continue;
                }
                if (count <= 0) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromTextFile: Invalid count {} on line {} in '{}'", (Object)count, (Object)lineNumber, (Object)file);
                    continue;
                }
                Identifier identifier = Identifier.tryParse((String)itemId);
                if (identifier == null) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromTextFile: Invalid item ID '{}' on line {} in '{}'", (Object)itemId, (Object)lineNumber, (Object)file);
                    continue;
                }
                Item item = (Item)BuiltInRegistries.ITEM.getValue(identifier);
                if (item == null) {
                    Litematica.LOGGER.warn("MaterialListCustom#fromTextFile: Unknown item '{}' on line {} in '{}'", (Object)itemId, (Object)lineNumber, (Object)file);
                    continue;
                }
                ItemStack stack = new ItemStack((ItemLike)item);
                ItemType type = new ItemType(stack, false, false);
                items.addTo((Object)type, count);
            }
            if (items.isEmpty()) {
                Litematica.LOGGER.error("MaterialListCustom#fromTextFile: No valid items found in '{}'", (Object)file);
                materialListCustom = null;
                return materialListCustom;
            }
            Litematica.debugLog("MaterialListCustom#fromTextFile: Loaded {} item types from '{}'", items.size(), file);
            materialListCustom = new MaterialListCustom(name, (Map<ItemType, Integer>)items, file);
            return materialListCustom;
        }
        catch (IOException e) {
            Litematica.LOGGER.error("MaterialListCustom#fromTextFile: Failed to read text file '{}': {}", (Object)file, (Object)e.getMessage());
            return null;
        }
    }

    @Nullable
    public static MaterialListCustom fromFile(Path file) {
        String fileName = file.getFileName().toString().toLowerCase();
        if (fileName.endsWith(JSON_FILE_EXTENSION)) {
            return MaterialListCustom.fromJsonFile(file);
        }
        if (fileName.endsWith(TEXT_FILE_EXTENSION)) {
            return MaterialListCustom.fromTextFile(file);
        }
        Litematica.LOGGER.error("MaterialListCustom#fromFile: Unsupported file format '{}' - expected .json or .txt", (Object)file);
        return null;
    }

    public boolean toJsonFile(Path file, boolean overwrite) {
        boolean exists = Files.exists(file, new LinkOption[0]);
        if (exists && overwrite) {
            try {
                Files.delete(file);
            }
            catch (IOException e) {
                Litematica.LOGGER.error("MaterialListCustom#toJsonFile: Failed to delete file '{}'; {}", (Object)file.getFileName().toString(), (Object)e.getLocalizedMessage());
                return false;
            }
        } else if (exists) {
            Litematica.LOGGER.error("MaterialListCustom#toJsonFile: Failed; file '{}' already exists", (Object)file.getFileName().toString());
            return false;
        }
        try {
            JsonObject root = new JsonObject();
            root.add("name", (JsonElement)new JsonPrimitive(this.name));
            JsonArray itemsArray = new JsonArray();
            for (MaterialListEntry entry : this.materialListAll) {
                JsonObject itemObj = new JsonObject();
                ItemStack stack = entry.getStack();
                String itemId = BuiltInRegistries.ITEM.getKey((Object)stack.getItem()).toString();
                itemObj.add("id", (JsonElement)new JsonPrimitive(itemId));
                itemObj.add("count", (JsonElement)new JsonPrimitive((Number)entry.getCountTotal()));
                itemsArray.add((JsonElement)itemObj);
            }
            root.add("items", (JsonElement)itemsArray);
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            String json = gson.toJson((JsonElement)root);
            Files.writeString((Path)file, (CharSequence)json, (OpenOption[])new OpenOption[0]);
            Litematica.LOGGER.info("MaterialListCustom#toJsonFile: Exported material list to '{}'", (Object)file);
            return true;
        }
        catch (IOException e) {
            Litematica.LOGGER.error("MaterialListCustom#toJsonFile: Failed to write JSON file '{}': {}", (Object)file, (Object)e.getMessage());
            return false;
        }
    }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public String getTitle() {
        if (this.sourceFile != null) {
            return StringUtils.translate((String)"litematica.gui.title.material_list.custom_file", (Object[])new Object[]{this.name, this.sourceFile.getFileName().toString()});
        }
        return StringUtils.translate((String)"litematica.gui.title.material_list.custom", (Object[])new Object[]{this.name});
    }

    @Override
    public void reCreateMaterialList() {
        if (this.sourceFile != null && Files.exists(this.sourceFile, new LinkOption[0])) {
            MaterialListCustom reloaded = MaterialListCustom.fromFile(this.sourceFile);
            if (reloaded != null) {
                this.materialListAll = reloaded.materialListAll;
                this.refreshPreFilteredList();
                this.updateCounts();
                Litematica.debugLog("MaterialListCustom#reCreateMaterialList: Reloaded material list from '{}'", this.sourceFile);
            }
        } else {
            Litematica.LOGGER.warn("MaterialListCustom#reCreateMaterialList: Cannot recreate material list - no source file");
        }
    }
}

