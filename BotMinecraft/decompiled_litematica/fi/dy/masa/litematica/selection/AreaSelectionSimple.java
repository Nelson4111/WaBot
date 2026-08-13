/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 */
package fi.dy.masa.litematica.selection;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;

public class AreaSelectionSimple
extends AreaSelection {
    public AreaSelectionSimple(boolean createDefaultBox) {
        if (createDefaultBox) {
            this.createDefaultBoxIfNeeded();
        }
    }

    @Override
    public boolean setSelectedSubRegionBox(String name) {
        return false;
    }

    @Override
    @Nullable
    public String createNewSubRegionBox(BlockPos pos1, String nameIn) {
        return null;
    }

    @Override
    public boolean addSubRegionBox(Box box, boolean replace) {
        return false;
    }

    @Override
    public void removeAllSubRegionBoxes() {
    }

    @Override
    public boolean removeSubRegionBox(String name) {
        return false;
    }

    @Override
    public boolean removeSelectedSubRegionBox() {
        return false;
    }

    private void createDefaultBoxIfNeeded() {
        if (this.subRegionBoxes.size() != 1) {
            this.subRegionBoxes.clear();
            Box box = new Box(BlockPos.ZERO, BlockPos.ZERO, this.getName());
            this.subRegionBoxes.put(box.getName(), box);
            this.currentBox = box.getName();
        } else if (this.currentBox == null || this.subRegionBoxes.get(this.currentBox) == null) {
            this.currentBox = (String)this.subRegionBoxes.keySet().iterator().next();
        }
    }

    @Override
    public AreaSelectionSimple copy() {
        return AreaSelectionSimple.fromJson(this.toJson());
    }

    public static AreaSelectionSimple fromJson(JsonObject obj) {
        BlockPos pos;
        Box box;
        JsonElement el;
        JsonArray arr;
        AreaSelectionSimple area = new AreaSelectionSimple(false);
        if (JsonUtils.hasArray((JsonObject)obj, (String)"boxes") && (arr = obj.get("boxes").getAsJsonArray()).size() > 0 && (el = arr.get(0)).isJsonObject() && (box = Box.fromJson(el.getAsJsonObject())) != null) {
            area.subRegionBoxes.put(box.getName(), box);
            area.currentBox = box.getName();
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"name")) {
            area.setName(obj.get("name").getAsString());
        }
        if ((pos = JsonUtils.getBlockPos((JsonObject)obj, (String)"origin")) != null) {
            area.setExplicitOrigin(pos);
        } else {
            area.updateCalculatedOrigin();
        }
        area.createDefaultBoxIfNeeded();
        return area;
    }
}

