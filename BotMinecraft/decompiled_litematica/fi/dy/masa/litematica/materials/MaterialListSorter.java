/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListItemCache;
import java.util.Comparator;

public class MaterialListSorter
implements Comparator<MaterialListEntry> {
    private final MaterialListBase materialList;

    public MaterialListSorter(MaterialListBase materialList) {
        this.materialList = materialList;
    }

    @Override
    public int compare(MaterialListEntry entry1, MaterialListEntry entry2) {
        boolean reverse = this.materialList.getSortInReverse();
        MaterialListBase.SortCriteria sortCriteria = this.materialList.getSortCriteria();
        int nameCompare = entry1.getStack().getHoverName().getString().compareTo(entry2.getStack().getHoverName().getString());
        if (sortCriteria == MaterialListBase.SortCriteria.COUNT_TOTAL) {
            return entry1.getCountTotal() == entry2.getCountTotal() ? nameCompare : (entry1.getCountTotal() > entry2.getCountTotal() != reverse ? -1 : 1);
        }
        if (sortCriteria == MaterialListBase.SortCriteria.COUNT_MISSING) {
            return entry1.getCountMissing() == entry2.getCountMissing() ? nameCompare : (entry1.getCountMissing() > entry2.getCountMissing() != reverse ? -1 : 1);
        }
        if (sortCriteria == MaterialListBase.SortCriteria.COUNT_AVAILABLE) {
            return entry1.getCountAvailable() == entry2.getCountAvailable() ? nameCompare : (entry1.getCountAvailable() > entry2.getCountAvailable() != reverse ? -1 : 1);
        }
        if (sortCriteria == MaterialListBase.SortCriteria.CACHE_ORDER) {
            int priority2;
            MaterialListItemCache cache = MaterialListItemCache.getInstance();
            int priority1 = cache.getCachePriority(entry1.getStack());
            if (priority1 == (priority2 = cache.getCachePriority(entry2.getStack()))) {
                return nameCompare;
            }
            return priority1 < priority2 != reverse ? -1 : 1;
        }
        return !reverse ? nameCompare * -1 : nameCompare;
    }
}

