/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.mixin.recipe.IMixinIngredient
 *  fi.dy.masa.malilib.util.game.RecipeBookUtils$Type
 *  javax.annotation.Nullable
 *  net.minecraft.core.Holder
 *  net.minecraft.resources.RegistryOps
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.crafting.Ingredient
 *  net.minecraft.world.item.crafting.display.RecipeDisplayId
 */
package fi.dy.masa.litematica.materials.json;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.materials.json.MaterialListJsonEntry;
import fi.dy.masa.malilib.mixin.recipe.IMixinIngredient;
import fi.dy.masa.malilib.util.game.RecipeBookUtils;
import java.util.HashMap;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.core.Holder;
import net.minecraft.resources.RegistryOps;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.crafting.Ingredient;
import net.minecraft.world.item.crafting.display.RecipeDisplayId;

public class MaterialListJsonBase {
    private final Holder<Item> input;
    private final int count;
    @Nullable
    private MaterialListJsonEntry materialsCrafting;
    @Nullable
    private MaterialListJsonEntry materialsStonecutter;
    @Nullable
    private MaterialListJsonEntry materialsFurnace;
    @Nullable
    private MaterialListJsonEntry materialsRemaining;

    public MaterialListJsonBase(Holder<Item> input, int count, @Nullable Holder<Item> prevItem, boolean craftingOnly) {
        MaterialListJsonEntry entryRemaining;
        MaterialListJsonEntry entryFurnace;
        MaterialListJsonEntry entryCrafting;
        this.input = input;
        this.count = count;
        boolean matched = false;
        MaterialListJsonEntry entryStonecutter = MaterialListJsonEntry.build(input, count, List.of((Object)RecipeBookUtils.Type.STONECUTTER), prevItem, craftingOnly);
        if (entryStonecutter != null && entryStonecutter.hasOutput()) {
            if (this.checkIfLoop(entryStonecutter, input, prevItem)) {
                this.materialsRemaining = MaterialListJsonEntry.build(input, count, List.of(), prevItem, craftingOnly);
                return;
            }
            this.materialsStonecutter = entryStonecutter;
            matched = true;
        }
        if ((entryCrafting = MaterialListJsonEntry.build(input, count, List.of((Object)RecipeBookUtils.Type.SHAPED, (Object)RecipeBookUtils.Type.SHAPELESS), prevItem, craftingOnly)) != null && entryCrafting.hasOutput()) {
            if (this.checkIfLoop(entryCrafting, input, prevItem)) {
                this.materialsRemaining = MaterialListJsonEntry.build(input, count, List.of(), prevItem, craftingOnly);
                return;
            }
            this.materialsCrafting = entryCrafting;
            matched = true;
        }
        if (matched && this.materialsCrafting != null && this.materialsStonecutter != null) {
            if (craftingOnly) {
                this.materialsStonecutter = null;
            } else {
                this.materialsCrafting = null;
            }
        }
        if (!matched && (entryFurnace = MaterialListJsonEntry.build(input, count, List.of((Object)RecipeBookUtils.Type.FURNACE), prevItem, craftingOnly)) != null && entryFurnace.hasOutput()) {
            if (this.checkIfLoop(entryFurnace, input, prevItem)) {
                this.materialsRemaining = MaterialListJsonEntry.build(input, count, List.of(), prevItem, craftingOnly);
                return;
            }
            this.materialsFurnace = entryFurnace;
            matched = true;
        }
        if (!matched && (entryRemaining = MaterialListJsonEntry.build(input, count, List.of(), prevItem, craftingOnly)) != null) {
            this.materialsRemaining = entryRemaining;
        }
    }

    @Nullable
    public MaterialListJsonEntry getMaterialsCrafting() {
        return this.materialsCrafting;
    }

    @Nullable
    public MaterialListJsonEntry getMaterialsStonecutter() {
        return this.materialsStonecutter;
    }

    @Nullable
    public MaterialListJsonEntry getMaterialsFurnace() {
        return this.materialsFurnace;
    }

    @Nullable
    public MaterialListJsonEntry getMaterialsRemaining() {
        return this.materialsRemaining;
    }

    public Holder<Item> getInput() {
        return this.input;
    }

    public int getCount() {
        return this.count;
    }

    private boolean checkIfLoop(MaterialListJsonEntry entry, Holder<Item> inputItem, Holder<Item> prevItem) {
        RecipeDisplayId firstId;
        List<Ingredient> ingredients;
        Ingredient ingredient;
        List ingItems;
        HashMap<RecipeDisplayId, List<Ingredient>> recipeReq = entry.getRecipeRequirements();
        HashMap<RecipeDisplayId, RecipeBookUtils.Type> recipeTypes = entry.getRecipeTypes();
        if (!recipeReq.isEmpty() && !recipeTypes.isEmpty() && ((ingItems = ((IMixinIngredient)(ingredient = (Ingredient)(ingredients = recipeReq.get(firstId = (RecipeDisplayId)recipeTypes.keySet().stream().toList().getFirst())).getFirst())).malilib_getEntries().stream().toList()).contains(inputItem) || ingItems.contains(prevItem))) {
            return true;
        }
        List<MaterialListJsonBase> list = entry.getRequirements();
        for (MaterialListJsonBase eachItem : list) {
            if (eachItem.getInput() == inputItem) {
                return true;
            }
            if (eachItem.getInput() != prevItem) continue;
            return true;
        }
        return inputItem == prevItem;
    }

    public JsonElement toJson(RegistryOps<?> ops) {
        JsonObject obj = new JsonObject();
        obj.add("Item", (JsonElement)new JsonPrimitive(this.getInput().getRegisteredName()));
        obj.add("Count", (JsonElement)new JsonPrimitive((Number)this.getCount()));
        if (this.materialsCrafting != null) {
            obj.add("CraftingMaterials", this.materialsCrafting.toJson(ops));
        }
        if (this.materialsStonecutter != null) {
            obj.add("StonecutterMaterials", this.materialsStonecutter.toJson(ops));
        }
        if (this.materialsFurnace != null) {
            obj.add("FurnaceMaterials", this.materialsFurnace.toJson(ops));
        }
        if (this.materialsRemaining != null) {
            obj.add("RemainingMaterials", this.materialsRemaining.toJson(ops));
        }
        return obj;
    }
}

