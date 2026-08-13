/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Iterables
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.DynamicOps
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  fi.dy.masa.malilib.data.CachedTagKey
 *  fi.dy.masa.malilib.data.CachedTagUtils
 *  fi.dy.masa.malilib.util.game.RecipeBookUtils
 *  fi.dy.masa.malilib.util.game.RecipeBookUtils$Type
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Holder
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.RegistryOps
 *  net.minecraft.resources.ResourceKey
 *  net.minecraft.util.Mth
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.item.crafting.RecipeBookCategory
 *  net.minecraft.world.item.crafting.display.RecipeDisplayId
 *  org.apache.commons.lang3.tuple.Pair
 *  org.apache.commons.lang3.tuple.Triple
 */
package fi.dy.masa.litematica.materials.json;

import com.google.common.collect.Iterables;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.DynamicOps;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.data.CachedTagManager;
import fi.dy.masa.litematica.materials.json.MaterialListJsonBase;
import fi.dy.masa.litematica.materials.json.MaterialListJsonEntry;
import fi.dy.masa.litematica.materials.json.MaterialListJsonOverrides;
import fi.dy.masa.malilib.data.CachedTagKey;
import fi.dy.masa.malilib.data.CachedTagUtils;
import fi.dy.masa.malilib.util.game.RecipeBookUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;
import net.minecraft.client.Minecraft;
import net.minecraft.core.Holder;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.RegistryOps;
import net.minecraft.resources.ResourceKey;
import net.minecraft.util.Mth;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.crafting.RecipeBookCategory;
import net.minecraft.world.item.crafting.display.RecipeDisplayId;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;

public class MaterialListJsonCache {
    private final List<Entry> entriesFlat = new ArrayList<Entry>();
    private final List<Entry> entriesCombined = new ArrayList<Entry>();
    private final String GATHER_KEY = "GATHER";

    public void putFlatEntry(Entry input) {
        List<Result> results = input.results();
        List<Step> steps = input.steps();
        if (!this.entriesFlat.isEmpty() && !results.isEmpty()) {
            Result result = (Result)((Object)results.getFirst());
            for (int i = 0; i < this.entriesFlat.size(); ++i) {
                Entry entry = this.entriesFlat.get(i);
                List<Result> entryResults = entry.results();
                if (entryResults.isEmpty()) continue;
                Result resultEntry = (Result)((Object)entryResults.getFirst());
                List<Step> entrySteps = entry.steps();
                if (!resultEntry.equals(result) || !this.compareSteps(steps, entrySteps)) continue;
                this.entriesFlat.add(new Entry(input.rawItem(), input.total(), List.of(), results));
                return;
            }
        }
        this.entriesFlat.add(input);
    }

    public void putCombinedEntry(Entry input, boolean addResultTotals) {
        if (!this.entriesCombined.isEmpty()) {
            Holder<Item> item = input.rawItem();
            int total = input.total();
            List<Result> results = input.results();
            for (int i = 0; i < this.entriesCombined.size(); ++i) {
                Entry entry = this.entriesCombined.get(i);
                if (!entry.rawItem().equals(item)) continue;
                this.entriesCombined.set(i, new Entry(item, entry.total() + total, List.of(), this.combineResults(results, entry.results(), addResultTotals)));
                return;
            }
        }
        this.entriesCombined.add(new Entry(input.rawItem(), input.total(), List.of(), input.results()));
    }

    public List<Entry> combineUnpackedItems(Entry currentItem) {
        Minecraft mc = Minecraft.getInstance();
        Holder baseItem = currentItem.rawItem();
        if (baseItem == null || mc.level == null) {
            return List.of((Object)((Object)currentItem));
        }
        if (CachedTagUtils.matchItemTag((CachedTagKey)CachedTagManager.UNPACKED_BLOCK_ITEMS_KEY, baseItem)) {
            int remainder;
            float remainCalc;
            int multiplier;
            int floor;
            int total = currentItem.total();
            Triple<Holder<Item>, Float, Integer> pair = MaterialListJsonOverrides.INSTANCE.matchPackingOverride(baseItem, total);
            ResourceKey ironNugget = (ResourceKey)BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.IRON_NUGGET).unwrapKey().orElseThrow();
            ResourceKey goldNugget = (ResourceKey)BuiltInRegistries.ITEM.wrapAsHolder((Object)Items.GOLD_NUGGET).unwrapKey().orElseThrow();
            ArrayList<Entry> list = new ArrayList<Entry>();
            if (baseItem.is(ironNugget.identifier()) || baseItem.is(goldNugget.identifier())) {
                floor = Mth.floor((float)((Float)pair.getMiddle()).floatValue());
                multiplier = (Integer)pair.getRight();
                remainCalc = (float)multiplier * (((Float)pair.getMiddle()).floatValue() - (float)floor);
                remainder = Math.round(remainCalc);
                if (remainder > 0) {
                    list.addLast((Object)new Entry((Holder<Item>)baseItem, remainder, currentItem.steps(), currentItem.results()));
                }
                baseItem = (Holder)pair.getLeft();
                pair = MaterialListJsonOverrides.INSTANCE.matchPackingOverride((Holder<Item>)baseItem, floor);
            }
            if (!((Holder)pair.getLeft()).is((ResourceKey)baseItem.unwrapKey().orElseThrow()) && ((Float)pair.getMiddle()).floatValue() > 0.0f) {
                floor = Mth.floor((float)((Float)pair.getMiddle()).floatValue());
                multiplier = (Integer)pair.getRight();
                remainCalc = (float)multiplier * (((Float)pair.getMiddle()).floatValue() - (float)floor);
                remainder = Math.round(remainCalc);
                if (remainder > 0) {
                    list.addFirst((Object)new Entry((Holder<Item>)baseItem, remainder, list.isEmpty() ? currentItem.steps() : List.of(), currentItem.results()));
                }
                if (floor > 0) {
                    list.addFirst((Object)new Entry((Holder<Item>)((Holder)pair.getLeft()), floor, list.isEmpty() ? currentItem.steps() : List.of(), currentItem.results()));
                }
            }
            if (list.isEmpty()) {
                return List.of((Object)((Object)currentItem));
            }
            return list;
        }
        return List.of((Object)((Object)currentItem));
    }

    public List<Step> combineSteps(List<Step> left, List<Step> right) {
        ArrayList<Step> list = new ArrayList<Step>();
        ArrayList<Integer> ignores = new ArrayList<Integer>();
        if (left.isEmpty() && !right.isEmpty()) {
            return right;
        }
        for (Step entry : left) {
            Holder<Item> item = entry.stepItem();
            int count = entry.count();
            boolean matched = false;
            for (int j = 0; j < right.size(); ++j) {
                Step otherEntry = right.get(j);
                if (!item.equals(otherEntry.stepItem())) continue;
                Step newEntry = new Step(item, count + otherEntry.count(), entry.type(), entry.category(), entry.networkId());
                ignores.add(j);
                list.add(newEntry);
                matched = true;
            }
            if (matched) continue;
            list.add(entry);
        }
        for (int i = 0; i < right.size(); ++i) {
            Step entry;
            entry = right.get(i);
            if (ignores.contains(i)) continue;
            list.add(entry);
        }
        return list;
    }

    public List<Result> combineResults(List<Result> left, List<Result> right, boolean addResultTotals) {
        ArrayList<Result> list = new ArrayList<Result>();
        ArrayList<Integer> ignores = new ArrayList<Integer>();
        if (left.isEmpty() && !right.isEmpty()) {
            return right;
        }
        for (Result entry : left) {
            Holder<Item> item = entry.resultItem();
            int count = entry.total();
            boolean matched = false;
            for (int j = 0; j < right.size(); ++j) {
                Result otherEntry = right.get(j);
                if (!item.equals(otherEntry.resultItem())) continue;
                Result newEntry = new Result(item, addResultTotals ? count + otherEntry.total() : count);
                ignores.add(j);
                list.add(newEntry);
                matched = true;
            }
            if (matched) continue;
            list.add(entry);
        }
        for (int i = 0; i < right.size(); ++i) {
            Result entry;
            entry = right.get(i);
            if (ignores.contains(i)) continue;
            list.add(entry);
        }
        return list;
    }

    public boolean isEmptyFlat() {
        return this.entriesFlat.isEmpty();
    }

    public boolean isEmptyCombined() {
        return this.entriesCombined.isEmpty();
    }

    public int sizeFlat() {
        return this.entriesFlat.size();
    }

    public int sizeCombined() {
        return this.entriesCombined.size();
    }

    public List<Entry> getEntriesFlat() {
        return this.entriesFlat;
    }

    public List<Entry> getEntriesCombined() {
        return this.entriesCombined;
    }

    public Iterable<Entry> iteratorFlat() {
        return Iterables.concat((Iterable[])new Iterable[]{this.entriesFlat});
    }

    public Iterable<Entry> iteratorCombined() {
        return Iterables.concat((Iterable[])new Iterable[]{this.entriesCombined});
    }

    public Stream<Entry> streamFlat() {
        return this.entriesFlat.stream();
    }

    public Stream<Entry> streamCombined() {
        return this.entriesCombined.stream();
    }

    public void clearFlat() {
        this.entriesFlat.clear();
    }

    public void clearCombined() {
        this.entriesCombined.clear();
    }

    public void clearAll() {
        this.clearFlat();
        this.clearCombined();
    }

    public Pair<Step, List<Step>> buildStepsBase(MaterialListJsonBase base, List<Step> lastSteps, Result result) {
        Pair<Step, List<MaterialListJsonBase>> pair;
        Holder<Item> resultItem = base.getInput();
        int total = base.getCount();
        ArrayList requirements = new ArrayList();
        Step finalStep = null;
        if (base.getMaterialsFurnace() != null) {
            pair = this.buildStepsEntryEach(resultItem, base.getMaterialsFurnace(), RecipeBookUtils.Type.FURNACE);
            if (!((List)pair.getRight()).isEmpty()) {
                requirements.addAll((Collection)pair.getRight());
            }
            Step furnaceStep = (Step)((Object)pair.getLeft());
            lastSteps.addFirst((Object)furnaceStep);
        }
        if (base.getMaterialsStonecutter() != null) {
            pair = this.buildStepsEntryEach(resultItem, base.getMaterialsStonecutter(), RecipeBookUtils.Type.STONECUTTER);
            if (!((List)pair.getRight()).isEmpty()) {
                requirements.addAll((Collection)pair.getRight());
            }
            Step stonecutterStep = (Step)((Object)pair.getLeft());
            lastSteps.addFirst((Object)stonecutterStep);
        }
        if (base.getMaterialsCrafting() != null) {
            pair = this.buildStepsEntryEach(resultItem, base.getMaterialsCrafting(), RecipeBookUtils.Type.SHAPELESS);
            if (!((List)pair.getRight()).isEmpty()) {
                requirements.addAll((Collection)pair.getRight());
            }
            Step recipeStep = (Step)((Object)pair.getLeft());
            lastSteps.addFirst((Object)recipeStep);
        }
        if (base.getMaterialsRemaining() != null) {
            pair = this.buildStepsEntryEach(resultItem, base.getMaterialsRemaining(), RecipeBookUtils.Type.UNKNOWN);
            if (!((List)pair.getRight()).isEmpty()) {
                requirements.addAll((Collection)pair.getRight());
            }
            finalStep = (Step)((Object)pair.getLeft());
            lastSteps.addFirst((Object)finalStep);
        }
        if (!requirements.isEmpty()) {
            List<Step> list = new ArrayList<Step>();
            for (MaterialListJsonBase baseEach : requirements) {
                Pair<Step, List<Step>> pair2 = this.buildStepsBaseEach(baseEach, lastSteps, result);
                if (pair2.getRight() != null && !((List)pair2.getRight()).isEmpty()) {
                    list = this.combineSteps(list, (List)pair2.getRight());
                }
                if (pair2.getLeft() == null) continue;
                list.add((Step)((Object)pair2.getLeft()));
                lastSteps = this.combineSteps(list, lastSteps);
                Entry entryOut = new Entry(resultItem, total, lastSteps, result != null ? List.of((Object)((Object)result)) : List.of());
                this.putFlatEntry(entryOut);
                this.putCombinedEntry(entryOut, true);
                return Pair.of(null, (Object)List.of());
            }
        } else if (finalStep != null) {
            Entry entryOut = new Entry(resultItem, total, lastSteps, result != null ? List.of((Object)((Object)result)) : List.of());
            this.putFlatEntry(entryOut);
            this.putCombinedEntry(entryOut, true);
            return Pair.of(null, (Object)List.of());
        }
        return Pair.of(null, (Object)List.of());
    }

    public Pair<Step, List<Step>> buildStepsBaseEach(MaterialListJsonBase base, List<Step> lastSteps, Result result) {
        return this.buildStepsBase(base, lastSteps, result);
    }

    public Pair<Step, List<MaterialListJsonBase>> buildStepsEntryEach(Holder<Item> resultItem, MaterialListJsonEntry materials, RecipeBookUtils.Type typeIn) {
        Holder<Item> stepItem = materials.getInputItem();
        int stepCount = materials.getTotal();
        if (materials.hasOutput()) {
            RecipeDisplayId stepNetworkId = materials.getPrimaryId();
            HashMap<RecipeDisplayId, RecipeBookCategory> stepCats = materials.getRecipeCategory();
            HashMap<RecipeDisplayId, RecipeBookUtils.Type> stepTypes = materials.getRecipeTypes();
            RecipeBookCategory category = stepCats.get(stepNetworkId);
            RecipeBookUtils.Type type = stepTypes.get(stepNetworkId);
            Step stepOut = new Step(stepItem, stepCount, type, RecipeBookUtils.getRecipeCategoryId((RecipeBookCategory)category), stepNetworkId.index());
            return Pair.of((Object)((Object)stepOut), materials.getRequirements());
        }
        Step stepOut = new Step(stepItem, stepCount, typeIn, "GATHER", -1);
        return Pair.of((Object)((Object)stepOut), (Object)List.of());
    }

    public void simplifyFlatEntrySteps() {
        ArrayList<Step> otherSteps = new ArrayList<Step>();
        for (int i = 0; i < this.entriesFlat.size(); ++i) {
            Entry entry = this.entriesFlat.get(i);
            List<Step> entrySteps = entry.steps();
            if (i == 0) {
                otherSteps.addAll(entrySteps);
            }
            if (i == 0) continue;
            if (!otherSteps.isEmpty() && this.compareSteps(entrySteps, otherSteps)) {
                this.entriesFlat.set(i, new Entry(entry.rawItem(), entry.total(), List.of(), entry.results()));
                continue;
            }
            otherSteps.clear();
            otherSteps.addAll(entrySteps);
        }
        this.simplyFlatEntryResults();
    }

    private void simplyFlatEntryResults() {
        for (int i = 0; i < this.entriesFlat.size(); ++i) {
            Entry entry = this.getEntriesFlat().get(i);
            List<Result> entryResults = entry.results();
            List<Step> entrySteps = entry.steps();
            if (entryResults.isEmpty() || entrySteps.isEmpty()) continue;
            Result entryResult = (Result)((Object)entryResults.getFirst());
            for (int j = 0; j < this.entriesFlat.size(); ++j) {
                Result otherResult;
                if (i == j) continue;
                Entry otherEntry = this.entriesFlat.get(j);
                List<Result> otherResults = otherEntry.results();
                List<Step> otherSteps = otherEntry.steps();
                if (otherResults.isEmpty() || otherSteps.isEmpty() || !(otherResult = (Result)((Object)otherResults.getFirst())).equals(entryResult) || !this.compareSteps(otherSteps, entrySteps)) continue;
                this.entriesFlat.set(j, new Entry(otherEntry.rawItem(), otherEntry.total(), List.of(), otherResults));
            }
        }
    }

    private boolean compareSteps(List<Step> left, List<Step> right) {
        if (left.size() != right.size()) {
            return false;
        }
        int lCount = 0;
        for (Step entry : left) {
            if (!this.containsStep(entry, right)) continue;
            ++lCount;
        }
        int rCount = 0;
        for (Step entry : right) {
            if (!this.containsStep(entry, left)) continue;
            ++rCount;
        }
        return lCount == rCount;
    }

    private boolean containsStep(Step left, List<Step> right) {
        for (Step step : right) {
            if (!left.equals(step)) continue;
            return true;
        }
        return false;
    }

    public void repackCombinedEntries() {
        ArrayList<Entry> list = new ArrayList<Entry>();
        for (Entry entry : this.entriesCombined) {
            list.addAll(this.combineUnpackedItems(entry));
        }
        this.clearCombined();
        for (Entry entry : list) {
            this.putCombinedEntry(entry, false);
        }
    }

    public JsonElement toFlatJson(RegistryOps<?> ops) {
        JsonArray arr = new JsonArray();
        if (!this.isEmptyFlat()) {
            this.entriesFlat.forEach(entry -> arr.add((JsonElement)Entry.CODEC.encodeStart((DynamicOps)ops, (Object)entry).getPartialOrThrow()));
        }
        return arr;
    }

    public JsonElement toCombinedJson(RegistryOps<?> ops) {
        JsonArray arr = new JsonArray();
        if (!this.isEmptyCombined()) {
            this.entriesCombined.forEach(entry -> arr.add((JsonElement)Entry.CODEC.encodeStart((DynamicOps)ops, (Object)entry).getPartialOrThrow()));
        }
        return arr;
    }

    public record Entry(Holder<Item> rawItem, Integer total, List<Step> steps, List<Result> results) {
        public static final Codec<Entry> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)Item.CODEC.fieldOf("RawItem").forGetter(get -> get.rawItem), (App)PrimitiveCodec.INT.fieldOf("TotalEstimate").forGetter(get -> get.total), (App)Codec.list(Step.CODEC).fieldOf("Steps").forGetter(get -> get.steps), (App)Codec.list(Result.CODEC).fieldOf("Results").forGetter(get -> get.results)).apply((Applicative)inst, Entry::new));
    }

    public record Result(Holder<Item> resultItem, Integer total) {
        public static final Codec<Result> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)Item.CODEC.fieldOf("ResultItem").forGetter(get -> get.resultItem), (App)PrimitiveCodec.INT.fieldOf("ResultTotal").forGetter(get -> get.total)).apply((Applicative)inst, Result::new));

        public boolean equals(Result otherResult) {
            return Objects.equals(this.resultItem(), otherResult.resultItem()) && Objects.equals(this.total(), otherResult.total());
        }
    }

    public record Step(Holder<Item> stepItem, Integer count, RecipeBookUtils.Type type, String category, Integer networkId) {
        public static final Codec<Step> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)Item.CODEC.fieldOf("StepItem").forGetter(get -> get.stepItem), (App)PrimitiveCodec.INT.fieldOf("StepCount").forGetter(get -> get.count), (App)RecipeBookUtils.Type.CODEC.fieldOf("RecipeType").forGetter(get -> get.type), (App)PrimitiveCodec.STRING.fieldOf("RecipeCategory").forGetter(get -> get.category), (App)PrimitiveCodec.INT.fieldOf("RecipeId").forGetter(get -> get.networkId)).apply((Applicative)inst, Step::new));

        public boolean equals(Step otherStep) {
            return Objects.equals(this.stepItem(), otherStep.stepItem()) && Objects.equals(this.count(), otherStep.count()) && Objects.equals(this.type, otherStep.type()) && Objects.equals(this.category(), otherStep.category()) && Objects.equals(this.networkId(), otherStep.networkId());
        }
    }
}

