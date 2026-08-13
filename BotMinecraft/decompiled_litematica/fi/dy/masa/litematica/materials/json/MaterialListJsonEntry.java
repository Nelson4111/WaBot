/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.mixin.recipe.IMixinIngredient
 *  fi.dy.masa.malilib.util.game.RecipeBookUtils
 *  fi.dy.masa.malilib.util.game.RecipeBookUtils$Type
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Holder
 *  net.minecraft.core.HolderSet
 *  net.minecraft.resources.RegistryOps
 *  net.minecraft.util.Mth
 *  net.minecraft.util.context.ContextMap
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.crafting.Ingredient
 *  net.minecraft.world.item.crafting.RecipeBookCategory
 *  net.minecraft.world.item.crafting.display.RecipeDisplay
 *  net.minecraft.world.item.crafting.display.RecipeDisplayEntry
 *  net.minecraft.world.item.crafting.display.RecipeDisplayId
 *  net.minecraft.world.item.crafting.display.SlotDisplay
 *  net.minecraft.world.item.crafting.display.SlotDisplay$ItemSlotDisplay
 *  org.apache.commons.lang3.math.Fraction
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.materials.json;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.materials.json.MaterialListJsonBase;
import fi.dy.masa.litematica.materials.json.MaterialListJsonOverrides;
import fi.dy.masa.malilib.mixin.recipe.IMixinIngredient;
import fi.dy.masa.malilib.util.game.RecipeBookUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderSet;
import net.minecraft.resources.RegistryOps;
import net.minecraft.util.Mth;
import net.minecraft.util.context.ContextMap;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.Ingredient;
import net.minecraft.world.item.crafting.RecipeBookCategory;
import net.minecraft.world.item.crafting.display.RecipeDisplay;
import net.minecraft.world.item.crafting.display.RecipeDisplayEntry;
import net.minecraft.world.item.crafting.display.RecipeDisplayId;
import net.minecraft.world.item.crafting.display.SlotDisplay;
import org.apache.commons.lang3.math.Fraction;
import org.apache.commons.lang3.tuple.Pair;

public class MaterialListJsonEntry {
    private final List<MaterialListJsonBase> requirements = new ArrayList<MaterialListJsonBase>();
    private final Holder<Item> inputItem;
    private final int total;
    private final Type type;
    private boolean hasOutput = false;
    private RecipeDisplayId primaryId;
    private HashMap<RecipeDisplayId, List<Ingredient>> recipeRequirements;
    private HashMap<RecipeDisplayId, RecipeBookCategory> recipeCategory;
    private HashMap<RecipeDisplayId, RecipeBookUtils.Type> recipeTypes;

    private MaterialListJsonEntry(Holder<Item> inputItem, int total, Type type) {
        this.inputItem = inputItem;
        this.total = total;
        this.type = type;
    }

    @Nullable
    public static MaterialListJsonEntry build(Holder<Item> input, int total, List<RecipeBookUtils.Type> types, @Nullable Holder<Item> prevItem, boolean craftingOnly) {
        Minecraft mc = Minecraft.getInstance();
        if (input == null || mc.level == null) {
            return null;
        }
        Pair<Holder<Item>, Integer> itemOverride = MaterialListJsonOverrides.INSTANCE.matchOverride(input, total);
        if (types.isEmpty()) {
            return new MaterialListJsonEntry((Holder<Item>)((Holder)itemOverride.getLeft()), (Integer)itemOverride.getRight(), Type.EMPTY);
        }
        ItemStack shadow = new ItemStack((Holder)itemOverride.getLeft());
        List lookup = RecipeBookUtils.getDisplayEntryFromRecipeBook((ItemStack)shadow, types);
        ContextMap map = RecipeBookUtils.getMap((Minecraft)mc);
        if (lookup.isEmpty() || MaterialListJsonOverrides.INSTANCE.shouldKeepItemOrBlock((Holder<Item>)((Holder)itemOverride.getLeft()))) {
            return new MaterialListJsonEntry((Holder<Item>)((Holder)itemOverride.getLeft()), (Integer)itemOverride.getRight(), Type.LAST);
        }
        int lookupCount = lookup.size();
        Type outType = lookupCount > 1 ? Type.MULTI : Type.ONE;
        MaterialListJsonEntry result = new MaterialListJsonEntry((Holder<Item>)((Holder)itemOverride.getLeft()), (Integer)itemOverride.getRight(), outType);
        result.recipeRequirements = new HashMap();
        result.recipeCategory = new HashMap();
        result.recipeTypes = new HashMap();
        result.hasOutput = true;
        Pair pair = (Pair)lookup.getFirst();
        RecipeDisplayId id = (RecipeDisplayId)pair.getLeft();
        RecipeDisplayEntry entry = (RecipeDisplayEntry)pair.getRight();
        List resultStacks = entry.resultItems(map);
        ItemStack resultStack = (ItemStack)resultStacks.getFirst();
        int resultCount = resultStack.getCount();
        RecipeBookCategory category = entry.category();
        RecipeBookUtils.Type type = RecipeBookUtils.Type.fromRecipeDisplay((RecipeDisplay)entry.display());
        if (lookup.size() > 1) {
            RecipeBookUtils.Type altType;
            RecipeDisplayEntry altEntry;
            Pair altPair;
            if (craftingOnly && type == RecipeBookUtils.Type.STONECUTTER) {
                altPair = (Pair)lookup.get(1);
                altEntry = (RecipeDisplayEntry)altPair.getRight();
                altType = RecipeBookUtils.Type.fromRecipeDisplay((RecipeDisplay)altEntry.display());
                if (altType == RecipeBookUtils.Type.SHAPED || altType == RecipeBookUtils.Type.SHAPELESS) {
                    id = (RecipeDisplayId)altPair.getLeft();
                    entry = altEntry;
                    resultStacks = entry.resultItems(map);
                    resultStack = (ItemStack)resultStacks.getFirst();
                    resultCount = resultStack.getCount();
                    category = entry.category();
                    type = altType;
                }
            } else if (!(craftingOnly || type != RecipeBookUtils.Type.SHAPED && type != RecipeBookUtils.Type.SHAPELESS || (altType = RecipeBookUtils.Type.fromRecipeDisplay((RecipeDisplay)(altEntry = (RecipeDisplayEntry)(altPair = (Pair)lookup.get(1)).getRight()).display())) != RecipeBookUtils.Type.STONECUTTER)) {
                id = (RecipeDisplayId)altPair.getLeft();
                entry = altEntry;
                resultStacks = entry.resultItems(map);
                resultStack = (ItemStack)resultStacks.getFirst();
                resultCount = resultStack.getCount();
                category = entry.category();
                type = altType;
            }
        }
        if (entry.craftingRequirements().isPresent()) {
            List ingredients = (List)entry.craftingRequirements().get();
            if (lookupCount > 1 && MaterialListJsonOverrides.INSTANCE.overrideShouldSkipRecipe((Holder<Item>)((Holder)itemOverride.getLeft()), ingredients)) {
                pair = (Pair)lookup.get(1);
                id = (RecipeDisplayId)pair.getLeft();
                entry = (RecipeDisplayEntry)pair.getRight();
                if (entry.craftingRequirements().isPresent()) {
                    resultStacks = entry.resultItems(map);
                    resultStack = (ItemStack)resultStacks.getFirst();
                    resultCount = resultStack.getCount();
                    category = entry.category();
                    type = RecipeBookUtils.Type.fromRecipeDisplay((RecipeDisplay)entry.display());
                    ingredients = (List)entry.craftingRequirements().get();
                } else {
                    pair = (Pair)lookup.getFirst();
                    id = (RecipeDisplayId)pair.getLeft();
                    entry = (RecipeDisplayEntry)pair.getRight();
                }
            }
            result.recipeRequirements.put(id, ingredients);
            result.recipeCategory.put(id, category);
            result.recipeTypes.put(id, type);
            result.primaryId = id;
            HashMap<Object, Integer> ded = new HashMap<Object, Integer>();
            for (Ingredient ing : ingredients) {
                SlotDisplay display = ing.display();
                List displayStacks = display.resolveForStacks(map);
                ItemStack displayStack = (ItemStack)displayStacks.getFirst();
                Holder<Item> itemEntry = displayStack.typeHolder();
                HolderSet ingEntries = ((IMixinIngredient)ing).malilib_getEntries();
                if (ingEntries.size() > 1) {
                    itemEntry = MaterialListJsonOverrides.INSTANCE.overridePrimaryMaterial((Holder<Item>)ingEntries.get(0));
                    display = new SlotDisplay.ItemSlotDisplay(itemEntry);
                    displayStacks = display.resolveForStacks(map);
                    displayStack = (ItemStack)displayStacks.getFirst();
                }
                if (prevItem != null && prevItem == itemEntry) continue;
                int adjustedTotal = (Integer)itemOverride.getRight();
                if (resultCount > 1) {
                    Fraction adjusted = Fraction.getFraction((int)((Integer)itemOverride.getRight()), (int)resultCount);
                    int floor = Mth.floor((float)adjusted.floatValue());
                    float remainderCalc = (float)resultCount * (adjusted.floatValue() - (float)floor);
                    int remainderCount = Math.round(remainderCalc);
                    adjustedTotal = Math.max(floor + (remainderCount > 0 ? 1 : 0), remainderCount > 0 ? 1 : 0);
                }
                if (ded.containsKey(itemEntry)) {
                    int count2 = (Integer)ded.get(itemEntry) + adjustedTotal;
                    ded.put(itemEntry, count2);
                    continue;
                }
                ded.put(itemEntry, adjustedTotal);
            }
            ded.forEach((key, count) -> result.requirements.add(new MaterialListJsonBase((Holder<Item>)key, (int)count, (Holder<Item>)((Holder)itemOverride.getLeft()), craftingOnly)));
        }
        return result;
    }

    public Type getType() {
        return this.type;
    }

    public Holder<Item> getInputItem() {
        return this.inputItem;
    }

    public List<MaterialListJsonBase> getRequirements() {
        return this.requirements;
    }

    public RecipeDisplayId getPrimaryId() {
        return this.primaryId;
    }

    public HashMap<RecipeDisplayId, List<Ingredient>> getRecipeRequirements() {
        return this.recipeRequirements;
    }

    public HashMap<RecipeDisplayId, RecipeBookCategory> getRecipeCategory() {
        return this.recipeCategory;
    }

    public HashMap<RecipeDisplayId, RecipeBookUtils.Type> getRecipeTypes() {
        return this.recipeTypes;
    }

    public boolean hasOutput() {
        return this.hasOutput;
    }

    public int getTotal() {
        return this.total;
    }

    public JsonElement toJson(RegistryOps<?> ops) {
        JsonObject obj = new JsonObject();
        obj.add("Item", (JsonElement)new JsonPrimitive(this.getInputItem().getRegisteredName()));
        obj.add("Count", (JsonElement)new JsonPrimitive((Number)this.getTotal()));
        obj.add("Type", (JsonElement)new JsonPrimitive(this.type.name()));
        if (this.hasOutput()) {
            obj.add("PrimaryId", (JsonElement)new JsonPrimitive((Number)this.getPrimaryId().index()));
            obj.add("Recipes", (JsonElement)this.lookupResultsToJson(ops));
        }
        return obj;
    }

    private JsonArray lookupResultsToJson(RegistryOps<?> ops) {
        JsonArray arr = new JsonArray();
        for (RecipeDisplayId id : this.recipeRequirements.keySet()) {
            List<Ingredient> requires = this.recipeRequirements.get(id);
            RecipeBookCategory category = this.recipeCategory.get(id);
            RecipeBookUtils.Type type = this.recipeTypes.get(id);
            JsonObject obj = new JsonObject();
            obj.add("NetworkId", (JsonElement)new JsonPrimitive((Number)id.index()));
            obj.add("Category", (JsonElement)new JsonPrimitive(RecipeBookUtils.getRecipeCategoryId((RecipeBookCategory)category)));
            obj.add("Type", (JsonElement)new JsonPrimitive(type.name()));
            JsonArray itemArr = new JsonArray();
            for (Ingredient ing : requires) {
                itemArr.add((JsonElement)Ingredient.CODEC.encodeStart(ops, (Object)ing).getPartialOrThrow());
            }
            obj.add("Ingredients", (JsonElement)itemArr);
            JsonArray outputArr = new JsonArray();
            for (MaterialListJsonBase jsonEntry : this.requirements) {
                outputArr.add(jsonEntry.toJson(ops));
            }
            obj.add("Requirements", (JsonElement)outputArr);
            arr.add((JsonElement)obj);
        }
        return arr;
    }

    public static enum Type {
        LAST,
        EMPTY,
        ONE,
        MULTI;

    }
}

