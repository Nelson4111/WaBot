/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.data.ItemType
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.NonNullList
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.BlockItem
 *  net.minecraft.world.item.BundleItem
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.block.ShulkerBoxBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.materials.MaterialCache;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.data.ItemType;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import net.minecraft.client.Minecraft;
import net.minecraft.core.NonNullList;
import net.minecraft.core.Vec3i;
import net.minecraft.world.Container;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.BundleItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.block.ShulkerBoxBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public class MaterialListUtils {
    public static List<MaterialListEntry> createMaterialListFor(LitematicaSchematic schematic) {
        return MaterialListUtils.createMaterialListFor(schematic, schematic.getAreas().keySet());
    }

    public static List<MaterialListEntry> createMaterialListFromItems(Map<ItemType, Integer> items, Player player) {
        ArrayList<MaterialListEntry> list = new ArrayList<MaterialListEntry>();
        if (items.isEmpty()) {
            return list;
        }
        Object2IntOpenHashMap<ItemType> playerInvItems = null;
        if (player != null) {
            playerInvItems = MaterialListUtils.getInventoryItemCounts((Container)player.getInventory());
        }
        for (Map.Entry<ItemType, Integer> entry : items.entrySet()) {
            ItemType type = entry.getKey();
            int count = entry.getValue();
            int countAvailable = playerInvItems != null ? playerInvItems.getInt((Object)type) : 0;
            list.add(new MaterialListEntry(type.getStack().copy(), count, count, 0, countAvailable));
        }
        return list;
    }

    public static List<MaterialListEntry> createMaterialListFor(LitematicaSchematic schematic, Collection<String> subRegions) {
        Object2IntOpenHashMap countsTotal = new Object2IntOpenHashMap();
        for (String regionName : subRegions) {
            LitematicaBlockStateContainer container = schematic.getSubRegionContainer(regionName);
            if (container == null) continue;
            Vec3i size = container.getSize();
            int sizeX = size.getX();
            int sizeY = size.getY();
            int sizeZ = size.getZ();
            for (int y = 0; y < sizeY; ++y) {
                for (int z = 0; z < sizeZ; ++z) {
                    for (int x = 0; x < sizeX; ++x) {
                        BlockState state = container.get(x, y, z);
                        countsTotal.addTo((Object)state, 1);
                    }
                }
            }
        }
        Minecraft mc = Minecraft.getInstance();
        return MaterialListUtils.getMaterialList((Object2IntOpenHashMap<BlockState>)countsTotal, (Object2IntOpenHashMap<BlockState>)countsTotal.clone(), (Object2IntOpenHashMap<BlockState>)new Object2IntOpenHashMap(), (Player)mc.player);
    }

    public static List<MaterialListEntry> getMaterialList(Object2IntOpenHashMap<BlockState> countsTotal, Object2IntOpenHashMap<BlockState> countsMissing, Object2IntOpenHashMap<BlockState> countsMismatch, Player player) {
        ArrayList<MaterialListEntry> list;
        block4: {
            list = new ArrayList<MaterialListEntry>();
            if (countsTotal.isEmpty()) break block4;
            MaterialCache cache = MaterialCache.getInstance();
            Object2IntOpenHashMap itemTypesTotal = new Object2IntOpenHashMap();
            Object2IntOpenHashMap itemTypesMissing = new Object2IntOpenHashMap();
            Object2IntOpenHashMap itemTypesMismatch = new Object2IntOpenHashMap();
            MaterialListUtils.convertStatesToStacks(countsTotal, (Object2IntOpenHashMap<ItemType>)itemTypesTotal, cache);
            MaterialListUtils.convertStatesToStacks(countsMissing, (Object2IntOpenHashMap<ItemType>)itemTypesMissing, cache);
            MaterialListUtils.convertStatesToStacks(countsMismatch, (Object2IntOpenHashMap<ItemType>)itemTypesMismatch, cache);
            if (player != null) {
                Object2IntOpenHashMap<ItemType> playerInvItems = MaterialListUtils.getInventoryItemCounts((Container)player.getInventory());
                for (ItemType type : itemTypesTotal.keySet()) {
                    list.add(new MaterialListEntry(type.getStack().copy(), itemTypesTotal.getInt((Object)type), itemTypesMissing.getInt((Object)type), itemTypesMismatch.getInt((Object)type), playerInvItems.getInt((Object)type)));
                }
            } else {
                for (ItemType type : itemTypesTotal.keySet()) {
                    list.add(new MaterialListEntry(type.getStack().copy(), itemTypesTotal.getInt((Object)type), itemTypesMissing.getInt((Object)type), itemTypesMismatch.getInt((Object)type), 0));
                }
            }
        }
        return list;
    }

    private static void convertStatesToStacks(Object2IntOpenHashMap<BlockState> blockStatesIn, Object2IntOpenHashMap<ItemType> itemTypesOut, MaterialCache cache) {
        for (BlockState state : blockStatesIn.keySet()) {
            BlockState stateToConvert;
            int count = blockStatesIn.getInt((Object)state);
            BlockState blockState = stateToConvert = MaterialListUtils.isWaterloggedBlock(state) ? MaterialListUtils.getBaseBlockState(state) : state;
            if (MaterialListUtils.isWaterloggedBlock(state)) {
                itemTypesOut.addTo((Object)new ItemType(new ItemStack((ItemLike)Items.WATER_BUCKET), false, false), count);
            }
            if (cache.requiresMultipleItems(stateToConvert)) {
                for (ItemStack stack : cache.getItems(stateToConvert)) {
                    if (stack.isEmpty()) continue;
                    itemTypesOut.addTo((Object)new ItemType(stack, true, false), count * stack.getCount());
                }
                continue;
            }
            ItemStack stack = cache.getRequiredBuildItemForState(stateToConvert);
            if (stack.isEmpty()) continue;
            itemTypesOut.addTo((Object)new ItemType(stack, true, false), count * stack.getCount());
        }
    }

    public static void updateAvailableCounts(List<MaterialListEntry> list, Player player) {
        if (player == null) {
            return;
        }
        Object2IntOpenHashMap<ItemType> playerInvItems = MaterialListUtils.getInventoryItemCounts((Container)player.getInventory());
        for (MaterialListEntry entry : list) {
            ItemType type = new ItemType(entry.getStack(), true, false);
            int countAvailable = playerInvItems.getInt((Object)type);
            entry.setCountAvailable(countAvailable);
        }
    }

    public static Object2IntOpenHashMap<ItemType> getInventoryItemCounts(Container inv) {
        Object2IntOpenHashMap map = new Object2IntOpenHashMap();
        int slots = inv.getContainerSize();
        for (int slot = 0; slot < slots; ++slot) {
            ItemStack stack = inv.getItem(slot);
            if (stack.isEmpty()) continue;
            Item item = stack.getItem();
            if (item instanceof BlockItem && ((BlockItem)stack.getItem()).getBlock() instanceof ShulkerBoxBlock && InventoryUtils.shulkerBoxHasItems((ItemStack)stack)) {
                Object2IntOpenHashMap<ItemType> boxCounts = MaterialListUtils.getStoredItemCounts(stack);
                for (ItemType boxType : boxCounts.keySet()) {
                    map.addTo((Object)boxType, boxCounts.getInt((Object)boxType));
                }
                boxCounts.clear();
                continue;
            }
            if (item instanceof BundleItem && InventoryUtils.bundleHasItems((ItemStack)stack)) {
                Object2IntOpenHashMap<ItemType> bundleCounts = MaterialListUtils.getBundleItemCounts(stack);
                for (ItemType bundleType : bundleCounts.keySet()) {
                    map.addTo((Object)bundleType, bundleCounts.getInt((Object)bundleType));
                }
                bundleCounts.clear();
                continue;
            }
            map.addTo((Object)new ItemType(stack, true, false), stack.getCount());
        }
        return map;
    }

    public static Object2IntOpenHashMap<ItemType> getStoredItemCounts(ItemStack stackShulkerBox) {
        Object2IntOpenHashMap map = new Object2IntOpenHashMap();
        NonNullList items = InventoryUtils.getStoredItems((ItemStack)stackShulkerBox);
        for (ItemStack boxStack : items) {
            Object2IntOpenHashMap<ItemType> bundleMap;
            if (boxStack.isEmpty()) continue;
            if (boxStack.getItem() instanceof BundleItem && InventoryUtils.bundleHasItems((ItemStack)boxStack) && !(bundleMap = MaterialListUtils.getBundleItemCounts(boxStack)).isEmpty()) {
                bundleMap.forEach((arg_0, arg_1) -> ((Object2IntOpenHashMap)map).addTo(arg_0, arg_1));
            }
            map.addTo((Object)new ItemType(boxStack, false, false), boxStack.getCount());
        }
        return map;
    }

    public static Object2IntOpenHashMap<ItemType> getBundleItemCounts(ItemStack stackBundle) {
        Object2IntOpenHashMap map = new Object2IntOpenHashMap();
        NonNullList items = InventoryUtils.getBundleItems((ItemStack)stackBundle);
        for (ItemStack bundleStack : items) {
            Object2IntOpenHashMap<ItemType> bundleMap;
            if (bundleStack.isEmpty()) continue;
            if (bundleStack.getItem() instanceof BundleItem && InventoryUtils.bundleHasItems((ItemStack)bundleStack) && !(bundleMap = MaterialListUtils.getBundleItemCounts(bundleStack)).isEmpty()) {
                bundleMap.forEach((arg_0, arg_1) -> ((Object2IntOpenHashMap)map).addTo(arg_0, arg_1));
            }
            map.addTo((Object)new ItemType(bundleStack, false, false), bundleStack.getCount());
        }
        return map;
    }

    private static boolean isWaterloggedBlock(BlockState state) {
        return state.hasProperty((Property)BlockStateProperties.WATERLOGGED) && (Boolean)state.getValue((Property)BlockStateProperties.WATERLOGGED) != false;
    }

    private static BlockState getBaseBlockState(BlockState state) {
        if (state.hasProperty((Property)BlockStateProperties.WATERLOGGED)) {
            return (BlockState)state.setValue((Property)BlockStateProperties.WATERLOGGED, (Comparable)Boolean.valueOf(false));
        }
        return state;
    }
}

