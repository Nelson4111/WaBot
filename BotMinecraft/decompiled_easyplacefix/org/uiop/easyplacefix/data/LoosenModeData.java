/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.reflect.TypeToken
 *  com.google.gson.Gson
 *  com.google.gson.GsonBuilder
 *  com.google.gson.JsonSyntaxException
 *  net.fabricmc.loader.api.FabricLoader
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 */
package org.uiop.easyplacefix.data;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.HashSet;
import java.util.stream.Collectors;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import org.uiop.easyplacefix.EasyPlaceFix;

public class LoosenModeData {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final File CONFIG_FILE = new File(FabricLoader.getInstance().getConfigDir().toFile(), "loosenMode.json");
    private static final Type ITEM_SET_TYPE = new TypeToken<HashSet<Integer>>(){}.getType();
    public static HashSet<Item> items = new HashSet();

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    public static HashSet<ItemStack> loadFromFile() {
        if (!CONFIG_FILE.exists()) {
            LoosenModeData.saveToFile(new HashSet<ItemStack>());
            return new HashSet<ItemStack>();
        }
        try (FileReader reader = new FileReader(CONFIG_FILE);){
            HashSet itemStackHashSet;
            HashSet itemIds = (HashSet)GSON.fromJson((Reader)reader, ITEM_SET_TYPE);
            items.clear();
            if (itemIds == null) {
                HashSet<ItemStack> hashSet = new HashSet<ItemStack>();
                return hashSet;
            }
            HashSet hashSet = itemStackHashSet = itemIds.stream().map(id -> {
                Item item = Item.byId((int)id);
                if (item == null) {
                    return null;
                }
                items.add(item);
                return item.getDefaultInstance();
            }).filter(itemStack -> itemStack != null && !itemStack.isEmpty()).collect(Collectors.toCollection(HashSet::new));
            return hashSet;
        }
        catch (JsonSyntaxException | IOException e) {
            EasyPlaceFix.LOGGER.warn("Failed to load loosen mode config file {}", (Object)CONFIG_FILE, (Object)e);
            return new HashSet<ItemStack>();
        }
    }

    public static void saveToFile(Collection<ItemStack> itemHashSet) {
        items.clear();
        HashSet itemIds = itemHashSet.stream().map(itemStack -> {
            Item item = itemStack.getItem();
            items.add(item);
            return Item.getId((Item)item);
        }).collect(Collectors.toCollection(HashSet::new));
        try (FileWriter writer = new FileWriter(CONFIG_FILE);){
            GSON.toJson((Object)itemIds, (Appendable)writer);
        }
        catch (IOException e) {
            EasyPlaceFix.LOGGER.warn("Failed to save loosen mode config file {}", (Object)CONFIG_FILE, (Object)e);
        }
    }

    static {
        LoosenModeData.loadFromFile();
    }
}

