/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.common.collect.ImmutableMap
 *  com.google.common.collect.ImmutableMap$Builder
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils$CoordinateType
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.selection;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.render.infohud.StatusInfoRenderer;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import org.apache.commons.lang3.tuple.Pair;

public class AreaSelection {
    public static final Codec<SubRegionBox> SUB_REGION_BOX_CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.STRING.fieldOf("name").forGetter(get -> get.name), (App)Box.CODEC.fieldOf("box").forGetter(get -> get.box)).apply((Applicative)inst, SubRegionBox::new));
    public static final Codec<AreaSelection> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.STRING.fieldOf("name").forGetter(get -> get.name), (App)Codec.list(SUB_REGION_BOX_CODEC).fieldOf("sub_region_boxes").forGetter(AreaSelection::boxesToList), (App)PrimitiveCodec.BOOL.fieldOf("origin_selected").forGetter(get -> get.originSelected), (App)BlockPos.CODEC.fieldOf("calculated_origin").forGetter(get -> get.calculatedOrigin), (App)BlockPos.CODEC.optionalFieldOf("explicit_origin", null).forGetter(get -> get.explicitOrigin), (App)PrimitiveCodec.STRING.optionalFieldOf("current_box", null).forGetter(get -> get.currentBox)).apply((Applicative)inst, AreaSelection::new));
    protected final Map<String, Box> subRegionBoxes = new HashMap<String, Box>();
    protected String name;
    protected boolean originSelected;
    protected BlockPos calculatedOrigin;
    protected boolean calculatedOriginDirty;
    @Nullable
    protected BlockPos explicitOrigin;
    @Nullable
    protected String currentBox;

    public AreaSelection() {
        this.name = "Unnamed";
        this.calculatedOrigin = BlockPos.ZERO;
        this.calculatedOriginDirty = true;
        this.explicitOrigin = null;
    }

    private AreaSelection(String name, List<SubRegionBox> boxes, boolean originSelected, BlockPos calcOrigin, @Nullable BlockPos explicitOrigin, @Nullable String currentBox) {
        this.name = name;
        this.originSelected = originSelected;
        this.calculatedOrigin = calcOrigin;
        this.calculatedOriginDirty = true;
        this.explicitOrigin = explicitOrigin;
        this.currentBox = currentBox;
        for (SubRegionBox subBox : boxes) {
            this.subRegionBoxes.put(subBox.name(), subBox.box());
        }
    }

    private List<SubRegionBox> boxesToList() {
        if (this.subRegionBoxes.isEmpty()) {
            return List.of();
        }
        ArrayList<SubRegionBox> list = new ArrayList<SubRegionBox>();
        this.subRegionBoxes.forEach((name, box) -> list.add(new SubRegionBox((String)name, (Box)box)));
        return list;
    }

    public static AreaSelection fromPlacement(SchematicPlacement placement) {
        ImmutableMap<String, Box> boxes = placement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        BlockPos origin = placement.getOrigin();
        AreaSelection selection = new AreaSelection();
        selection.setExplicitOrigin(origin);
        selection.name = placement.getName();
        selection.subRegionBoxes.putAll((Map<String, Box>)boxes);
        return selection;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    protected void markDirty() {
        this.calculatedOriginDirty = true;
        if (!Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getBooleanValue()) {
            StatusInfoRenderer.getInstance().startOverrideDelay();
        }
    }

    @Nullable
    public String getCurrentSubRegionBoxName() {
        return this.currentBox;
    }

    public boolean setSelectedSubRegionBox(@Nullable String name) {
        if (name == null || this.subRegionBoxes.containsKey(name)) {
            this.currentBox = name;
            return true;
        }
        return false;
    }

    public boolean isOriginSelected() {
        return this.originSelected;
    }

    public void setOriginSelected(boolean selected) {
        this.originSelected = selected;
    }

    public BlockPos getEffectiveOrigin() {
        if (this.explicitOrigin != null) {
            return this.explicitOrigin;
        }
        if (this.calculatedOriginDirty) {
            this.updateCalculatedOrigin();
        }
        return this.calculatedOrigin;
    }

    @Nullable
    public BlockPos getExplicitOrigin() {
        return this.explicitOrigin;
    }

    public void setExplicitOrigin(@Nullable BlockPos origin) {
        this.explicitOrigin = origin;
        if (origin == null) {
            this.originSelected = false;
        }
    }

    protected void updateCalculatedOrigin() {
        Pair<BlockPos, BlockPos> pair = PositionUtils.getEnclosingAreaCorners(this.subRegionBoxes.values());
        this.calculatedOrigin = pair != null ? (BlockPos)pair.getLeft() : BlockPos.ZERO;
        this.calculatedOriginDirty = false;
    }

    @Nullable
    public Box getSubRegionBox(String name) {
        return this.subRegionBoxes.get(name);
    }

    @Nullable
    public Box getSelectedSubRegionBox() {
        return this.currentBox != null ? this.subRegionBoxes.get(this.currentBox) : null;
    }

    public Collection<String> getAllSubRegionNames() {
        return this.subRegionBoxes.keySet();
    }

    public List<Box> getAllSubRegionBoxes() {
        return ImmutableList.copyOf(this.subRegionBoxes.values());
    }

    public ImmutableMap<String, Box> getAllSubRegions() {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        builder.putAll(this.subRegionBoxes);
        return builder.build();
    }

    @Nullable
    public String createNewSubRegionBox(BlockPos pos1, String nameIn) {
        this.clearCurrentSelectedCorner();
        this.setOriginSelected(false);
        Object name = nameIn;
        int i = 1;
        while (this.subRegionBoxes.containsKey(name)) {
            name = nameIn + " " + i;
            ++i;
        }
        Box box = new Box();
        box.setName((String)name);
        box.setSelectedCorner(PositionUtils.Corner.CORNER_1);
        this.currentBox = name;
        this.subRegionBoxes.put((String)name, box);
        this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, pos1);
        this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, pos1);
        return name;
    }

    public void clearCurrentSelectedCorner() {
        this.setCurrentSelectedCorner(PositionUtils.Corner.NONE);
    }

    public void setCurrentSelectedCorner(PositionUtils.Corner corner) {
        Box box = this.getSelectedSubRegionBox();
        if (box != null) {
            box.setSelectedCorner(corner);
        }
    }

    public boolean addSubRegionBox(Box box, boolean replace) {
        if (replace || !this.subRegionBoxes.containsKey(box.getName())) {
            this.subRegionBoxes.put(box.getName(), box);
            this.markDirty();
            return true;
        }
        return false;
    }

    public void removeAllSubRegionBoxes() {
        this.subRegionBoxes.clear();
        this.markDirty();
    }

    public boolean removeSubRegionBox(String name) {
        boolean success = this.subRegionBoxes.remove(name) != null;
        this.markDirty();
        if (success && name.equals(this.currentBox)) {
            this.currentBox = null;
        }
        return success;
    }

    public boolean removeSelectedSubRegionBox() {
        boolean success = this.currentBox != null ? this.subRegionBoxes.remove(this.currentBox) != null : false;
        this.currentBox = null;
        this.markDirty();
        return success;
    }

    public boolean renameSubRegionBox(String oldName, String newName) {
        return this.renameSubRegionBox(oldName, newName, null);
    }

    public boolean renameSubRegionBox(String oldName, String newName, @Nullable IMessageConsumer feedback) {
        Box box = this.subRegionBoxes.get(oldName);
        if (box != null) {
            if (this.subRegionBoxes.containsKey(newName)) {
                if (feedback != null) {
                    feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_editor.rename_sub_region.exists", new Object[]{newName});
                }
                return false;
            }
            this.subRegionBoxes.remove(oldName);
            box.setName(newName);
            this.subRegionBoxes.put(newName, box);
            if (this.currentBox != null && this.currentBox.equals(oldName)) {
                this.currentBox = newName;
            }
            return true;
        }
        return false;
    }

    public void moveEntireSelectionTo(BlockPos newOrigin, boolean printMessage) {
        BlockPos old = this.getEffectiveOrigin();
        BlockPos diff = newOrigin.subtract((Vec3i)old);
        for (Box box : this.subRegionBoxes.values()) {
            if (box.getPos1() != null) {
                this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, box.getPos1().offset((Vec3i)diff));
            }
            if (box.getPos2() == null) continue;
            this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, box.getPos2().offset((Vec3i)diff));
        }
        if (this.getExplicitOrigin() != null) {
            this.setExplicitOrigin(newOrigin);
        }
        if (printMessage) {
            String oldStr = String.format("x: %d, y: %d, z: %d", old.getX(), old.getY(), old.getZ());
            String newStr = String.format("x: %d, y: %d, z: %d", newOrigin.getX(), newOrigin.getY(), newOrigin.getZ());
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.moved_selection", (Object[])new Object[]{oldStr, newStr});
        }
    }

    public void moveSelectedElement(Direction direction, int amount) {
        Box box = this.getSelectedSubRegionBox();
        if (this.isOriginSelected()) {
            if (this.getExplicitOrigin() != null) {
                this.setExplicitOrigin(this.getExplicitOrigin().relative(direction, amount));
            }
        } else if (box != null) {
            BlockPos pos;
            PositionUtils.Corner corner = box.getSelectedCorner();
            if ((corner == PositionUtils.Corner.NONE || corner == PositionUtils.Corner.CORNER_1) && box.getPos1() != null) {
                pos = this.getSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1).relative(direction, amount);
                this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, pos);
            }
            if ((corner == PositionUtils.Corner.NONE || corner == PositionUtils.Corner.CORNER_2) && box.getPos2() != null) {
                pos = this.getSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2).relative(direction, amount);
                this.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, pos);
            }
        }
    }

    public void setSelectedSubRegionCornerPos(BlockPos pos, PositionUtils.Corner corner) {
        Box box = this.getSelectedSubRegionBox();
        if (box != null) {
            this.setSubRegionCornerPos(box, corner, pos);
        }
    }

    public void setSubRegionCornerPos(Box box, PositionUtils.Corner corner, BlockPos pos) {
        if (corner == PositionUtils.Corner.CORNER_1) {
            box.setPos1(pos);
            this.markDirty();
        } else if (corner == PositionUtils.Corner.CORNER_2) {
            box.setPos2(pos);
            this.markDirty();
        }
    }

    public void setCoordinate(@Nullable Box box, PositionUtils.Corner corner, PositionUtils.CoordinateType type, int value) {
        if (box != null && corner != null && corner != PositionUtils.Corner.NONE) {
            box.setCoordinate(value, corner, type);
            this.markDirty();
        } else if (this.explicitOrigin != null) {
            this.setExplicitOrigin(PositionUtils.getModifiedPosition(this.explicitOrigin, value, type));
        }
    }

    public BlockPos getSubRegionCornerPos(Box box, PositionUtils.Corner corner) {
        return corner == PositionUtils.Corner.CORNER_2 ? box.getPos2() : box.getPos1();
    }

    public AreaSelection copy() {
        return AreaSelection.fromJson(this.toJson());
    }

    public static AreaSelection fromJson(JsonObject obj) {
        BlockPos pos;
        AreaSelection area = new AreaSelection();
        if (JsonUtils.hasArray((JsonObject)obj, (String)"boxes")) {
            JsonArray arr = obj.get("boxes").getAsJsonArray();
            int size = arr.size();
            for (int i = 0; i < size; ++i) {
                Box box;
                JsonElement el = arr.get(i);
                if (!el.isJsonObject() || (box = Box.fromJson(el.getAsJsonObject())) == null) continue;
                area.subRegionBoxes.put(box.getName(), box);
            }
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"name")) {
            area.name = obj.get("name").getAsString();
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"current")) {
            area.currentBox = obj.get("current").getAsString();
        }
        if ((pos = JsonUtils.getBlockPos((JsonObject)obj, (String)"origin")) != null) {
            area.setExplicitOrigin(pos);
        } else {
            area.updateCalculatedOrigin();
        }
        return area;
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        JsonArray arr = new JsonArray();
        for (Box box : this.subRegionBoxes.values()) {
            JsonObject o = box.toJson();
            if (o == null) continue;
            arr.add((JsonElement)o);
        }
        obj.add("name", (JsonElement)new JsonPrimitive(this.name));
        if (arr.size() > 0) {
            if (this.currentBox != null) {
                obj.add("current", (JsonElement)new JsonPrimitive(this.currentBox));
            }
            obj.add("boxes", (JsonElement)arr);
        }
        if (this.getExplicitOrigin() != null) {
            obj.add("origin", (JsonElement)JsonUtils.blockPosToJson((Vec3i)this.getExplicitOrigin()));
        }
        return obj;
    }

    public record SubRegionBox(String name, Box box) {
    }
}

