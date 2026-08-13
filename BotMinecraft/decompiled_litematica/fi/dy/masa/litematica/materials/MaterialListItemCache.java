/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.data.ItemType
 *  net.minecraft.core.NonNullList
 *  net.minecraft.tags.ItemTags
 *  net.minecraft.world.inventory.Slot
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.data.ItemType;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import net.minecraft.core.NonNullList;
import net.minecraft.tags.ItemTags;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;

public class MaterialListItemCache {
    private static final MaterialListItemCache INSTANCE = new MaterialListItemCache();
    private final LinkedHashSet<ItemType> cachedItems = new LinkedHashSet();
    private boolean enabled = true;

    private MaterialListItemCache() {
    }

    public static MaterialListItemCache getInstance() {
        return INSTANCE;
    }

    public void scanContainer(List<Slot> slots) {
        if (!this.enabled) {
            return;
        }
        ArrayList<ItemType> foundItems = new ArrayList<ItemType>();
        for (Slot slot : slots) {
            ItemType itemType;
            NonNullList<ItemStack> storedItems;
            if (!slot.hasItem()) continue;
            ItemStack stack = slot.getItem();
            if (stack.is((Object)Items.SHULKER_BOX) && Configs.Generic.MATERIAL_LIST_CONTAINER_SCAN_SHULKERS.getBooleanValue()) {
                storedItems = this.updateFromShulker(stack);
                for (ItemStack item : storedItems) {
                    itemType = new ItemType(item, false, false);
                    if (foundItems.contains(itemType)) continue;
                    foundItems.add(itemType);
                }
                continue;
            }
            if (stack.is(ItemTags.BUNDLES) && Configs.Generic.MATERIAL_LIST_CONTAINER_SCAN_BUNDLES.getBooleanValue()) {
                storedItems = this.updateFromBundle(stack);
                for (ItemStack item : storedItems) {
                    itemType = new ItemType(item, false, false);
                    if (foundItems.contains(itemType)) continue;
                    foundItems.add(itemType);
                }
                continue;
            }
            ItemType itemType2 = new ItemType(stack, false, false);
            if (foundItems.contains(itemType2)) continue;
            foundItems.add(itemType2);
        }
        for (ItemType itemType : foundItems) {
            this.cachedItems.remove(itemType);
            this.cachedItems.add(itemType);
        }
    }

    private NonNullList<ItemStack> updateFromShulker(ItemStack stack) {
        NonNullList storedItems;
        if (stack.is((Object)Items.SHULKER_BOX) && InventoryUtils.shulkerBoxHasItems((ItemStack)stack) && (storedItems = InventoryUtils.getStoredItems((ItemStack)stack)) != null && !storedItems.isEmpty()) {
            return storedItems;
        }
        return NonNullList.create();
    }

    private NonNullList<ItemStack> updateFromBundle(ItemStack stack) {
        NonNullList storedItems;
        if (stack.is(ItemTags.BUNDLES) && InventoryUtils.bundleHasItems((ItemStack)stack) && (storedItems = InventoryUtils.getBundleItems((ItemStack)stack)) != null && !storedItems.isEmpty()) {
            return storedItems;
        }
        return NonNullList.create();
    }

    public int getCachePriority(ItemStack stack) {
        if (!this.enabled) {
            return Integer.MAX_VALUE;
        }
        ItemType itemType = new ItemType(stack, false, false);
        ArrayList<ItemType> items = new ArrayList<ItemType>(this.cachedItems);
        for (int i = items.size() - 1; i >= 0; --i) {
            if (!((ItemType)items.get(i)).equals((Object)itemType)) continue;
            return items.size() - 1 - i;
        }
        return Integer.MAX_VALUE;
    }

    public void clear() {
        this.cachedItems.clear();
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    public boolean isEnabled() {
        return this.enabled;
    }

    public int getCacheSize() {
        return this.cachedItems.size();
    }
}

