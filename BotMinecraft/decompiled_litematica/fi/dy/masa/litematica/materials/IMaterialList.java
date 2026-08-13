/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.util.BlockInfoListType;
import java.util.List;

public interface IMaterialList {
    public BlockInfoListType getMaterialListType();

    public void setMaterialListEntries(List<MaterialListEntry> var1);
}

