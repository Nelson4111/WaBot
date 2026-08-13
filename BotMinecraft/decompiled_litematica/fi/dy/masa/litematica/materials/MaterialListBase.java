/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.materials;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.materials.IMaterialList;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListHudRenderer;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public abstract class MaterialListBase
implements IMaterialList {
    protected final MaterialListHudRenderer hudRenderer = new MaterialListHudRenderer(this);
    protected final Set<MaterialListEntry> ignored = new HashSet<MaterialListEntry>();
    protected final List<MaterialListEntry> materialListPreFiltered = new ArrayList<MaterialListEntry>();
    protected final List<MaterialListEntry> materialListFiltered = new ArrayList<MaterialListEntry>();
    protected ImmutableList<MaterialListEntry> materialListAll = ImmutableList.of();
    @Nullable
    protected ICompletionListener completionListener;
    protected SortCriteria sortCriteria = SortCriteria.CACHE_ORDER;
    protected BlockInfoListType materialListType = BlockInfoListType.ALL;
    protected boolean reverse = false;
    protected boolean hideAvailable;
    protected int multiplier = 1;
    protected long countTotal;
    protected long countMissing;
    protected long countMismatched;

    public abstract String getName();

    public abstract String getTitle();

    public boolean supportsRenderLayers() {
        return false;
    }

    public MaterialListHudRenderer getHudRenderer() {
        return this.hudRenderer;
    }

    public ImmutableList<MaterialListEntry> getMaterialsAll() {
        return this.materialListAll;
    }

    public List<MaterialListEntry> getMaterialsFiltered(boolean refresh) {
        if (this.hideAvailable) {
            return this.getMaterialsMissingOnly(refresh);
        }
        return this.materialListPreFiltered;
    }

    public List<MaterialListEntry> getMaterialsMissingOnly(boolean refresh) {
        if (refresh) {
            this.recreateFilteredList();
        }
        return this.materialListFiltered;
    }

    public void setCompletionListener(@Nonnull ICompletionListener listener) {
        this.completionListener = listener;
    }

    public void recreateFilteredList() {
        this.materialListFiltered.clear();
        for (int i = 0; i < this.materialListPreFiltered.size(); ++i) {
            int countMissing;
            MaterialListEntry entry = this.materialListPreFiltered.get(i);
            int n = countMissing = this.multiplier == 1 ? entry.getCountMissing() : this.multiplier * entry.getCountTotal();
            if (entry.getCountAvailable() < countMissing) {
                this.materialListFiltered.add(entry);
                continue;
            }
            if (!this.hideAvailable) continue;
            this.materialListPreFiltered.remove(i);
            --i;
        }
    }

    public void ignoreEntry(MaterialListEntry entry) {
        this.ignored.add(entry);
        this.materialListPreFiltered.remove(entry);
        this.recreateFilteredList();
    }

    public void clearIgnored() {
        this.ignored.clear();
        this.refreshPreFilteredList();
        this.recreateFilteredList();
    }

    public abstract void reCreateMaterialList();

    @Override
    public void setMaterialListEntries(List<MaterialListEntry> list) {
        this.materialListAll = ImmutableList.copyOf(list);
        this.refreshPreFilteredList();
        this.updateCounts();
        if (this.completionListener != null) {
            this.completionListener.onTaskCompleted();
        }
    }

    @Override
    public BlockInfoListType getMaterialListType() {
        return this.materialListType;
    }

    public void refreshPreFilteredList() {
        this.materialListPreFiltered.clear();
        this.materialListPreFiltered.addAll((Collection<MaterialListEntry>)this.materialListAll);
        this.materialListPreFiltered.removeAll(this.ignored);
    }

    public SortCriteria getSortCriteria() {
        return this.sortCriteria;
    }

    public boolean getSortInReverse() {
        return this.reverse;
    }

    public boolean getHideAvailable() {
        return this.hideAvailable;
    }

    public int getMultiplier() {
        return this.multiplier;
    }

    public void setSortCriteria(SortCriteria criteria) {
        if (this.sortCriteria == criteria) {
            this.reverse = !this.reverse;
        } else {
            this.sortCriteria = criteria;
            this.reverse = criteria == SortCriteria.NAME;
        }
    }

    public void setHideAvailable(boolean hideAvailable) {
        this.hideAvailable = hideAvailable;
    }

    public void setMultiplier(int multiplier) {
        this.multiplier = MathUtils.clamp((int)multiplier, (int)1, (int)Integer.MAX_VALUE);
    }

    public void updateCounts() {
        this.countTotal = 0L;
        this.countMissing = 0L;
        this.countMismatched = 0L;
        for (MaterialListEntry entry : this.materialListAll) {
            this.countTotal += (long)entry.getCountTotal();
            this.countMissing += (long)entry.getCountMissing();
            this.countMismatched += (long)entry.getCountMismatched();
        }
    }

    public long getCountTotal() {
        return this.countTotal;
    }

    public long getCountMissing() {
        return this.countMissing;
    }

    public long getCountMismatched() {
        return this.countMismatched;
    }

    public void setMaterialListType(BlockInfoListType type) {
        this.materialListType = type;
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        obj.add("type", (JsonElement)new JsonPrimitive(this.getMaterialListType().getStringValue()));
        obj.add("sort_criteria", (JsonElement)new JsonPrimitive(this.sortCriteria.name()));
        obj.add("sort_reverse", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.reverse)));
        obj.add("hide_available", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.hideAvailable)));
        obj.add("multiplier", (JsonElement)new JsonPrimitive((Number)this.multiplier));
        return obj;
    }

    public void fromJson(JsonObject obj) {
        if (JsonUtils.hasString((JsonObject)obj, (String)"type")) {
            this.setMaterialListType(BlockInfoListType.fromStringStatic(JsonUtils.getString((JsonObject)obj, (String)"type")));
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"sort_criteria")) {
            this.sortCriteria = SortCriteria.fromStringStatic(JsonUtils.getString((JsonObject)obj, (String)"sort_criteria"));
        }
        this.reverse = JsonUtils.getBooleanOrDefault((JsonObject)obj, (String)"sort_reverse", (boolean)false);
        this.hideAvailable = JsonUtils.getBooleanOrDefault((JsonObject)obj, (String)"hide_available", (boolean)false);
        this.multiplier = JsonUtils.getIntegerOrDefault((JsonObject)obj, (String)"multiplier", (int)1);
    }

    public static enum SortCriteria {
        NAME,
        COUNT_TOTAL,
        COUNT_MISSING,
        COUNT_AVAILABLE,
        CACHE_ORDER;


        public static SortCriteria fromStringStatic(String name) {
            for (SortCriteria mode : SortCriteria.values()) {
                if (!mode.name().equalsIgnoreCase(name)) continue;
                return mode;
            }
            return COUNT_TOTAL;
        }
    }
}

