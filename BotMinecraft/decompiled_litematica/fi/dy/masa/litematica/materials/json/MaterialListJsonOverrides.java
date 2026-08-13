/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.data.CachedTagKey
 *  fi.dy.masa.malilib.data.CachedTagUtils
 *  net.minecraft.core.Holder
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.ResourceKey
 *  net.minecraft.tags.ItemTags
 *  net.minecraft.world.item.DyeColor
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.item.crafting.Ingredient
 *  net.minecraft.world.level.block.WeatheringCopperCollection
 *  org.apache.commons.lang3.math.Fraction
 *  org.apache.commons.lang3.tuple.Pair
 *  org.apache.commons.lang3.tuple.Triple
 */
package fi.dy.masa.litematica.materials.json;

import fi.dy.masa.litematica.data.CachedTagManager;
import fi.dy.masa.malilib.data.CachedTagKey;
import fi.dy.masa.malilib.data.CachedTagUtils;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import net.minecraft.core.Holder;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.tags.ItemTags;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.crafting.Ingredient;
import net.minecraft.world.level.block.WeatheringCopperCollection;
import org.apache.commons.lang3.math.Fraction;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;

public class MaterialListJsonOverrides {
    public static final MaterialListJsonOverrides INSTANCE = new MaterialListJsonOverrides();
    private final Set<ResultOverride> overrides = new HashSet<ResultOverride>();
    private final Set<ResultOverride> packingOverrides = new HashSet<ResultOverride>();

    protected MaterialListJsonOverrides() {
        this.initOverrides();
        this.initPackingOverrides();
    }

    private Holder<Item> add(Item item) {
        return BuiltInRegistries.ITEM.wrapAsHolder((Object)item);
    }

    private void initOverrides() {
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.COPPER_BLOCK);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.COPPER_GRATE);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.CUT_COPPER);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.CHISELED_COPPER);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.COPPER_BULB);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.CUT_COPPER_SLAB);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.CUT_COPPER_STAIRS);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.COPPER_DOOR);
        this.addCopperOverrides((WeatheringCopperCollection<Item>)Items.COPPER_TRAPDOOR);
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_ACACIA_LOG), this.add(Items.ACACIA_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_BAMBOO_BLOCK), this.add(Items.BAMBOO), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_BIRCH_LOG), this.add(Items.BIRCH_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_CHERRY_LOG), this.add(Items.CHERRY_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_CRIMSON_STEM), this.add(Items.CRIMSON_STEM), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_DARK_OAK_LOG), this.add(Items.DARK_OAK_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_JUNGLE_LOG), this.add(Items.JUNGLE_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_MANGROVE_LOG), this.add(Items.MANGROVE_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_OAK_LOG), this.add(Items.OAK_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_PALE_OAK_LOG), this.add(Items.PALE_OAK_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_SPRUCE_LOG), this.add(Items.SPRUCE_LOG), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.STRIPPED_WARPED_STEM), this.add(Items.WARPED_STEM), Fraction.ONE));
        for (DyeColor color : DyeColor.VALUES) {
            this.overrides.add(new ResultOverride(this.add((Item)Items.CONCRETE.pick(color)), this.add((Item)Items.CONCRETE_POWDER.pick(color)), Fraction.ONE));
        }
        this.overrides.add(new ResultOverride(this.add(Items.CHIPPED_ANVIL), this.add(Items.ANVIL), Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add(Items.DAMAGED_ANVIL), this.add(Items.ANVIL), Fraction.ONE));
    }

    private void addCopperOverrides(WeatheringCopperCollection<Item> collection) {
        Holder<Item> unwaxedBase = this.add((Item)collection.weathering().unaffected());
        this.overrides.add(new ResultOverride(this.add((Item)collection.weathering().exposed()), unwaxedBase, Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add((Item)collection.weathering().weathered()), unwaxedBase, Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add((Item)collection.weathering().oxidized()), unwaxedBase, Fraction.ONE));
        Holder<Item> waxedBase = this.add((Item)collection.waxed().unaffected());
        this.overrides.add(new ResultOverride(this.add((Item)collection.waxed().exposed()), waxedBase, Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add((Item)collection.waxed().weathered()), waxedBase, Fraction.ONE));
        this.overrides.add(new ResultOverride(this.add((Item)collection.waxed().oxidized()), waxedBase, Fraction.ONE));
    }

    private void initPackingOverrides() {
        Fraction by9 = Fraction.getFraction((int)1, (int)9);
        this.packingOverrides.add(new ResultOverride(this.add(Items.CLAY_BALL), this.add(Items.CLAY), Fraction.ONE_QUARTER));
        this.packingOverrides.add(new ResultOverride(this.add(Items.HONEY_BOTTLE), this.add(Items.HONEY_BLOCK), Fraction.ONE_QUARTER));
        this.packingOverrides.add(new ResultOverride(this.add(Items.BONE_MEAL), this.add(Items.BONE_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.COAL), this.add(Items.COAL_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.COPPER_INGOT), this.add((Item)Items.COPPER_BLOCK.weathering().unaffected()), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.DIAMOND), this.add(Items.DIAMOND_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.EMERALD), this.add(Items.EMERALD_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.GOLD_INGOT), this.add(Items.GOLD_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.GOLD_NUGGET), this.add(Items.GOLD_INGOT), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.IRON_INGOT), this.add(Items.IRON_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.IRON_NUGGET), this.add(Items.IRON_INGOT), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.LAPIS_LAZULI), this.add(Items.LAPIS_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.MELON_SLICE), this.add(Items.MELON), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.NETHERITE_INGOT), this.add(Items.NETHERITE_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.REDSTONE), this.add(Items.REDSTONE_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.RESIN_BRICK), this.add(Items.RESIN_BRICKS), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.RESIN_CLUMP), this.add(Items.RESIN_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.SLIME_BALL), this.add(Items.SLIME_BLOCK), by9));
        this.packingOverrides.add(new ResultOverride(this.add(Items.WHEAT), this.add(Items.HAY_BLOCK), by9));
    }

    protected Pair<Holder<Item>, Integer> matchOverride(Holder<Item> result, Integer total) {
        for (ResultOverride map : this.overrides) {
            if (!map.match(result)) continue;
            return Pair.of(map.result(), (Object)map.mulInt(total));
        }
        return Pair.of(result, (Object)total);
    }

    protected Triple<Holder<Item>, Float, Integer> matchPackingOverride(Holder<Item> result, Integer total) {
        for (ResultOverride map : this.packingOverrides) {
            if (!map.match(result)) continue;
            return Triple.of(map.result(), (Object)map.mulFloat(total), (Object)map.divisor());
        }
        return Triple.of(result, (Object)Float.valueOf(total.floatValue()), (Object)1);
    }

    protected Holder<Item> overridePrimaryMaterial(Holder<Item> firstItem) {
        if (firstItem.is(ItemTags.WOOL)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.WOOL.white()));
        }
        if (firstItem.is(ItemTags.WOOL_CARPETS)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.CARPET.white()));
        }
        if (firstItem.is(ItemTags.BEDS)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.BED.white()));
        }
        if (firstItem.is(ItemTags.CANDLES)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.CANDLE);
        }
        if (firstItem.is(ItemTags.SHULKER_BOXES)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.SHULKER_BOX);
        }
        if (firstItem.is(ItemTags.BANNERS)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.BANNER.white()));
        }
        if (firstItem.is(ItemTags.TERRACOTTA)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.TERRACOTTA);
        }
        if (firstItem.is(ItemTags.BUNDLES)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.BUNDLE);
        }
        if (firstItem.is(ItemTags.HARNESSES)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.HARNESS.white()));
        }
        if (CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.GLASS_ITEMS_KEY, firstItem)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.GLASS);
        }
        if (CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.GLASS_PANE_ITEMS_KEY, firstItem)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.GLASS_PANE);
        }
        if (firstItem.is(ItemTags.CONCRETE_POWDERS)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.CONCRETE_POWDER.white()));
        }
        if (firstItem.is(ItemTags.CONCRETE)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.CONCRETE.white()));
        }
        if (firstItem.is(ItemTags.GLAZED_TERRACOTTA)) {
            return BuiltInRegistries.ITEM.wrapAsHolder((Object)((Item)Items.GLAZED_TERRACOTTA.white()));
        }
        return (Holder)this.matchOverride(firstItem, 1).getLeft();
    }

    protected boolean overrideShouldSkipRecipe(Holder<Item> input, List<Ingredient> ingredients) {
        for (Ingredient ing : ingredients) {
            if (!(input.is(ItemTags.BEDS) ? ing.test(((Item)Items.BED.white()).getDefaultInstance()) || ing.test(((Item)Items.BED.black()).getDefaultInstance()) : (input.is(ItemTags.WOOL) ? ing.test(((Item)Items.WOOL.white()).getDefaultInstance()) || ing.test(((Item)Items.WOOL.black()).getDefaultInstance()) : (input.is(ItemTags.WOOL_CARPETS) ? ing.test(((Item)Items.CARPET.white()).getDefaultInstance()) || ing.test(((Item)Items.CARPET.black()).getDefaultInstance()) : (input.is(ItemTags.CANDLES) ? ing.test(((Item)Items.DYED_CANDLE.white()).getDefaultInstance()) || ing.test(((Item)Items.DYED_CANDLE.black()).getDefaultInstance()) : (input.is(ItemTags.SHULKER_BOXES) ? ing.test(((Item)Items.DYED_SHULKER_BOX.white()).getDefaultInstance()) || ing.test(((Item)Items.DYED_SHULKER_BOX.black()).getDefaultInstance()) : (input.is(ItemTags.BANNERS) ? ing.test(((Item)Items.BANNER.white()).getDefaultInstance()) || ing.test(((Item)Items.BANNER.black()).getDefaultInstance()) : (input.is(ItemTags.TERRACOTTA) ? ing.test(((Item)Items.DYED_TERRACOTTA.white()).getDefaultInstance()) || ing.test(((Item)Items.DYED_TERRACOTTA.black()).getDefaultInstance()) : (CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.GLASS_ITEMS_KEY, input) ? ing.test(((Item)Items.STAINED_GLASS.white()).getDefaultInstance()) || ing.test(((Item)Items.STAINED_GLASS.black()).getDefaultInstance()) : (CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.GLASS_PANE_ITEMS_KEY, input) ? ing.test(((Item)Items.STAINED_GLASS_PANE.white()).getDefaultInstance()) || ing.test(((Item)Items.STAINED_GLASS_PANE.black()).getDefaultInstance()) : (input.is(ItemTags.CONCRETE) ? ing.test(((Item)Items.CONCRETE.white()).getDefaultInstance()) || ing.test(((Item)Items.CONCRETE.black()).getDefaultInstance()) : (input.is(ItemTags.CONCRETE_POWDERS) ? ing.test(((Item)Items.CONCRETE_POWDER.white()).getDefaultInstance()) || ing.test(((Item)Items.CONCRETE_POWDER.black()).getDefaultInstance()) : input.is(ItemTags.GLAZED_TERRACOTTA) && (ing.test(((Item)Items.GLAZED_TERRACOTTA.white()).getDefaultInstance()) || ing.test(((Item)Items.GLAZED_TERRACOTTA.black()).getDefaultInstance())))))))))))))) continue;
            return true;
        }
        return false;
    }

    protected boolean shouldKeepItemOrBlock(Holder<Item> input) {
        return CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.UNPACKED_BLOCK_ITEMS_KEY, input);
    }

    public record ResultOverride(Holder<Item> input, Holder<Item> result, Fraction multiplier) {
        public boolean match(Holder<Item> otherItem) {
            return this.input().is((ResourceKey)otherItem.unwrapKey().orElseThrow());
        }

        public Integer mulInt(Integer totalIn) {
            return totalIn * this.multiplier().intValue();
        }

        public Float mulFloat(Integer totalIn) {
            return Float.valueOf((float)totalIn.intValue() * this.multiplier().floatValue());
        }

        public Integer divisor() {
            return this.multiplier().getDenominator();
        }
    }
}

