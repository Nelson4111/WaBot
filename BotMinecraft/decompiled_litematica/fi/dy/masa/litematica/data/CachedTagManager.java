/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.data.CachedItemTags
 *  fi.dy.masa.malilib.data.CachedTagKey
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.Items
 */
package fi.dy.masa.litematica.data;

import fi.dy.masa.malilib.data.CachedItemTags;
import fi.dy.masa.malilib.data.CachedTagKey;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Items;

public class CachedTagManager {
    public static final CachedTagKey GLASS_ITEMS_KEY = new CachedTagKey("litematica", "glass_items");
    public static final CachedTagKey GLASS_PANE_ITEMS_KEY = new CachedTagKey("litematica", "glass_pane_items");
    public static final CachedTagKey PACKED_BLOCK_ITEMS_KEY = new CachedTagKey("litematica", "packed_block_items");
    public static final CachedTagKey UNPACKED_BLOCK_ITEMS_KEY = new CachedTagKey("litematica", "unpacked_block_items");

    public List<CachedTagKey> getKeys() {
        ArrayList<CachedTagKey> list = new ArrayList<CachedTagKey>();
        list.add(GLASS_ITEMS_KEY);
        list.add(GLASS_PANE_ITEMS_KEY);
        list.add(PACKED_BLOCK_ITEMS_KEY);
        list.add(UNPACKED_BLOCK_ITEMS_KEY);
        return list;
    }

    public static void startCache() {
        CachedTagManager.clearCache();
        CachedItemTags.getInstance().build(GLASS_ITEMS_KEY, CachedTagManager.buildGlassItemCache());
        CachedItemTags.getInstance().build(GLASS_PANE_ITEMS_KEY, CachedTagManager.buildGlassPanesItemCache());
        CachedItemTags.getInstance().build(PACKED_BLOCK_ITEMS_KEY, CachedTagManager.buildPackedBlockItemCache());
        CachedItemTags.getInstance().build(UNPACKED_BLOCK_ITEMS_KEY, CachedTagManager.buildUnpackedBlockItemCache());
    }

    private static List<String> buildGlassItemCache() {
        ArrayList<String> list = new ArrayList<String>();
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GLASS).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.black())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.blue())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.brown())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.cyan())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.gray())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.green())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.lightBlue())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.lightGray())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.lime())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.magenta())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.orange())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.pink())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.purple())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.red())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.yellow())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS.white())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.TINTED_GLASS).toString());
        return list;
    }

    private static List<String> buildGlassPanesItemCache() {
        ArrayList<String> list = new ArrayList<String>();
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GLASS_PANE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.black())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.blue())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.brown())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.cyan())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.gray())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.green())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.lightBlue())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.lightGray())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.lime())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.magenta())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.orange())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.pink())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.purple())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.red())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.yellow())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.STAINED_GLASS_PANE.white())).toString());
        return list;
    }

    private static List<String> buildPackedBlockItemCache() {
        ArrayList<String> list = new ArrayList<String>();
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.BONE_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.CLAY).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.COAL_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)((Item)Items.COPPER_BLOCK.weathering().unaffected())).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.DIAMOND_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.EMERALD_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GOLD_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.HAY_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.HONEY_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.IRON_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.LAPIS_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.MELON).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.NETHERITE_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RAW_COPPER_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RAW_GOLD_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RAW_IRON_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.REDSTONE_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RESIN_BLOCK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RESIN_BRICKS).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.SLIME_BLOCK).toString());
        return list;
    }

    private static List<String> buildUnpackedBlockItemCache() {
        ArrayList<String> list = new ArrayList<String>();
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.BONE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.CLAY_BALL).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.COAL).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.COPPER_INGOT).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.DIAMOND).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.EMERALD).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GLOWSTONE_DUST).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GOLD_INGOT).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.GOLD_NUGGET).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.HONEY_BOTTLE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.ICE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.IRON_INGOT).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.IRON_NUGGET).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.LAPIS_LAZULI).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.MELON_SLICE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.NETHERITE_INGOT).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.NETHER_WART).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.PACKED_ICE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.REDSTONE).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RESIN_BRICK).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.RESIN_CLUMP).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.SLIME_BALL).toString());
        list.add(BuiltInRegistries.ITEM.getKey((Object)Items.WHEAT).toString());
        return list;
    }

    private static void clearCache() {
        CachedItemTags.getInstance().clearEntry(GLASS_ITEMS_KEY);
        CachedItemTags.getInstance().clearEntry(GLASS_PANE_ITEMS_KEY);
        CachedItemTags.getInstance().clearEntry(PACKED_BLOCK_ITEMS_KEY);
        CachedItemTags.getInstance().clearEntry(UNPACKED_BLOCK_ITEMS_KEY);
    }
}

