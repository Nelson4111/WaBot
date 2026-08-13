/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.FileNameUtils
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Position
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.selection;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorNormal;
import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorSimple;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.AreaSelectionSimple;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.util.EntityUtils;
import fi.dy.masa.malilib.util.FileNameUtils;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.nio.file.CopyOption;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Position;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;

public class SelectionManager {
    private final Minecraft mc = Minecraft.getInstance();
    private final Map<String, AreaSelection> selections = new HashMap<String, AreaSelection>();
    private final Map<String, AreaSelection> readOnlySelections = new HashMap<String, AreaSelection>();
    @Nullable
    private String currentSelectionId;
    @Nullable
    private GrabbedElement grabbedElement;
    private SelectionMode mode = (SelectionMode)Configs.InfoOverlays.DEFAULT_SELECTION_MODE.getOptionListValue();
    private boolean modeDirty = true;

    public SelectionMode getSelectionMode() {
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            SchematicProject project = DataManager.getSchematicProjectsManager().getCurrentProject();
            return project != null ? project.getSelectionMode() : SelectionMode.SIMPLE;
        }
        return this.mode;
    }

    public void checkSelectionModeConfig() {
        if (this.modeDirty) {
            this.mode = (SelectionMode)Configs.InfoOverlays.DEFAULT_SELECTION_MODE.getOptionListValue();
            this.modeDirty = false;
        }
    }

    public void switchSelectionMode() {
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            SchematicProject project = DataManager.getSchematicProjectsManager().getCurrentProject();
            if (project != null) {
                project.switchSelectionMode();
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.error.schematic_projects.in_projects_mode_but_no_project_open", (Object[])new Object[0]);
            }
        } else {
            this.mode = (SelectionMode)this.mode.cycle(true);
        }
    }

    @Nullable
    public String getCurrentSelectionId() {
        return this.mode == SelectionMode.NORMAL ? this.currentSelectionId : null;
    }

    @Nullable
    public String getCurrentNormalSelectionId() {
        return this.currentSelectionId;
    }

    public boolean hasNormalSelection() {
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            return true;
        }
        return this.getNormalSelection(this.currentSelectionId) != null;
    }

    @Nullable
    public AreaSelection getCurrentSelection() {
        SchematicProject project;
        if (DataManager.getSchematicProjectsManager().hasProjectOpen() && (project = DataManager.getSchematicProjectsManager().getCurrentProject()) != null) {
            return project.getSelection();
        }
        return this.getSelection(this.currentSelectionId);
    }

    @Nullable
    public AreaSelection getSelection(@Nullable String selectionId) {
        if (this.mode == SelectionMode.SIMPLE) {
            return this.getSimpleSelection();
        }
        return this.getNormalSelection(selectionId);
    }

    public AreaSelectionSimple getSimpleSelection() {
        return DataManager.getSimpleArea();
    }

    @Nullable
    protected AreaSelection getNormalSelection(@Nullable String selectionId) {
        return selectionId != null ? this.selections.get(selectionId) : null;
    }

    @Nullable
    public AreaSelection getOrLoadSelection(String selectionId) {
        AreaSelection selection = this.getNormalSelection(selectionId);
        if (selection == null && (selection = this.tryLoadSelectionFromFile(selectionId)) != null) {
            this.selections.put(selectionId, selection);
        }
        return selection;
    }

    @Nullable
    public AreaSelection getOrLoadSelectionReadOnly(String selectionId) {
        AreaSelection selection = this.getNormalSelection(selectionId);
        if (selection == null && (selection = this.readOnlySelections.get(selectionId)) == null && (selection = this.tryLoadSelectionFromFile(selectionId)) != null) {
            this.readOnlySelections.put(selectionId, selection);
        }
        return selection;
    }

    @Nullable
    private AreaSelection tryLoadSelectionFromFile(String selectionId) {
        return SelectionManager.tryLoadSelectionFromFile(Path.of((String)selectionId, (String[])new String[0]));
    }

    @Nullable
    public static AreaSelection tryLoadSelectionFromFile(Path file) {
        JsonElement el = JsonUtils.parseJsonFile((Path)file);
        if (el != null && el.isJsonObject()) {
            return AreaSelection.fromJson(el.getAsJsonObject());
        }
        return null;
    }

    public boolean removeSelection(String selectionId) {
        if (selectionId != null && this.selections.remove(selectionId) != null) {
            Path file = Path.of((String)selectionId, (String[])new String[0]);
            if (Files.exists(file, new LinkOption[0]) && Files.isRegularFile(file, new LinkOption[0])) {
                FileUtils.delete((Path)file);
            }
            return true;
        }
        return false;
    }

    public boolean renameSelection(String selectionId, String newName, IMessageConsumer feedback) {
        Path dir = Path.of((String)selectionId, (String[])new String[0]);
        dir = dir.getParent();
        return this.renameSelection(dir, selectionId, newName, feedback);
    }

    public boolean renameSelection(Path dir, String selectionId, String newName, IMessageConsumer feedback) {
        return this.renameSelection(dir, selectionId, newName, false, feedback);
    }

    public boolean renameSelection(Path dir, String selectionId, String newName, boolean copy, IMessageConsumer feedback) {
        Path file = Path.of((String)selectionId, (String[])new String[0]);
        if (Files.exists(file, new LinkOption[0]) && Files.isRegularFile(file, new LinkOption[0])) {
            String newFileName = FileNameUtils.generateSafeFileName((String)newName);
            if (newFileName.isEmpty()) {
                feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.rename.invalid_safe_file_name", new Object[]{newFileName});
                return false;
            }
            Path newFile = dir.resolve(newFileName + ".json");
            if (!Files.exists(newFile, new LinkOption[0]) && (copy || FileUtils.move((Path)file, (Path)newFile))) {
                AreaSelection selection;
                String newId = newFile.toAbsolutePath().toString();
                if (copy) {
                    try {
                        Files.copy(file, newFile, new CopyOption[0]);
                    }
                    catch (Exception e) {
                        feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.copy_failed", new Object[0]);
                        Litematica.LOGGER.warn("Copy failed", (Throwable)e);
                        return false;
                    }
                    selection = this.getOrLoadSelection(newId);
                } else {
                    selection = this.selections.remove(selectionId);
                }
                if (selection != null) {
                    SelectionManager.renameSubRegionBoxIfSingle(selection, newName);
                    selection.setName(newName);
                    this.selections.put(newId, selection);
                    if (selectionId.equals(this.currentSelectionId)) {
                        this.currentSelectionId = newId;
                    }
                    return true;
                }
            } else {
                feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.rename.already_exists", new Object[]{newFile.getFileName()});
            }
        }
        return false;
    }

    public void setCurrentSelection(@Nullable String selectionId) {
        this.currentSelectionId = selectionId;
        if (this.currentSelectionId != null) {
            this.getOrLoadSelection(this.currentSelectionId);
        }
    }

    public String createNewSelection(Path dir, String nameIn) {
        Object name = nameIn;
        String safeName = FileNameUtils.generateSafeFileName((String)name);
        Path file = dir.resolve(safeName + ".json");
        String selectionId = file.toAbsolutePath().toString();
        for (int i = 1; i < 1000 && (safeName.isEmpty() || this.selections.containsKey(selectionId) || Files.exists(file, new LinkOption[0])); ++i) {
            name = nameIn + " " + i;
            safeName = FileNameUtils.generateSafeFileName((String)name);
            file = dir.resolve(safeName + ".json");
            selectionId = file.toAbsolutePath().toString();
        }
        AreaSelection selection = new AreaSelection();
        selection.setName((String)name);
        BlockPos pos = BlockPos.ZERO;
        if (this.mc.player != null) {
            pos = PositionUtils.getEntityBlockPos((Entity)this.mc.player);
        }
        selection.createNewSubRegionBox(pos, (String)name);
        this.selections.put(selectionId, selection);
        this.currentSelectionId = selectionId;
        JsonUtils.writeJsonToFile((JsonElement)selection.toJson(), (Path)file);
        return this.currentSelectionId;
    }

    public boolean createNewSubRegion(Minecraft mc, boolean printMessage) {
        BlockPos pos;
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection selection = sm.getCurrentSelection();
        if (selection != null && mc.player != null && selection.createNewSubRegionBox(pos = BlockPos.containing((Position)mc.player.position()), selection.getName()) != null) {
            if (printMessage) {
                String posStr = String.format("x: %d, y: %d, z: %d", pos.getX(), pos.getY(), pos.getZ());
                InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.added_selection_box", (Object[])new Object[]{posStr});
            }
            return true;
        }
        return false;
    }

    public boolean createNewSubRegionIfDoesntExist(String name, Minecraft mc, IMessageConsumer feedback) {
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection selection = sm.getCurrentSelection();
        if (selection != null && mc.player != null) {
            if (selection.getSubRegionBox(name) != null) {
                feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_editor.create_sub_region.exists", new Object[]{name});
                return false;
            }
            BlockPos pos = BlockPos.containing((Position)mc.player.position());
            if (selection.createNewSubRegionBox(pos, name) != null) {
                String posStr = String.format("x: %d, y: %d, z: %d", pos.getX(), pos.getY(), pos.getZ());
                feedback.addMessage(Message.MessageType.SUCCESS, "litematica.message.added_selection_box", new Object[]{posStr});
                return true;
            }
        }
        return false;
    }

    public boolean createSelectionFromPlacement(Path dir, SchematicPlacement placement, String name, IMessageConsumer feedback) {
        String safeName = FileNameUtils.generateSafeFileName((String)name);
        if (safeName.isEmpty()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.rename.invalid_safe_file_name", new Object[]{safeName});
            return false;
        }
        Path file = dir.resolve(safeName + ".json");
        String selectionId = file.toAbsolutePath().toString();
        AreaSelection selection = this.getOrLoadSelectionReadOnly(selectionId);
        if (selection == null) {
            selection = AreaSelection.fromPlacement(placement);
            SelectionManager.renameSubRegionBoxIfSingle(selection, name);
            selection.setName(name);
            this.selections.put(selectionId, selection);
            this.currentSelectionId = selectionId;
            JsonUtils.writeJsonToFile((JsonElement)selection.toJson(), (Path)file);
            return true;
        }
        feedback.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.create_failed", new Object[]{safeName});
        return false;
    }

    public boolean changeSelection(Level world, Entity entity, int maxDistance) {
        AreaSelection area = this.getCurrentSelection();
        if (area != null) {
            RayTraceUtils.RayTraceWrapper trace = RayTraceUtils.getWrappedRayTraceFromEntity(world, entity, maxDistance);
            if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_CORNER || trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_BODY || trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_ORIGIN) {
                this.changeSelection(area, trace);
                return true;
            }
            if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.MISS) {
                area.clearCurrentSelectedCorner();
                area.setSelectedSubRegionBox(null);
                area.setOriginSelected(false);
                return true;
            }
        }
        return false;
    }

    private void changeSelection(AreaSelection area, RayTraceUtils.RayTraceWrapper trace) {
        area.clearCurrentSelectedCorner();
        if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_CORNER || trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_BODY) {
            Box box = trace.getHitSelectionBox();
            area.setSelectedSubRegionBox(box.getName());
            area.setOriginSelected(false);
            box.setSelectedCorner(trace.getHitCorner());
        } else if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_ORIGIN) {
            area.setSelectedSubRegionBox(null);
            area.setOriginSelected(true);
        }
    }

    public boolean hasSelectedElement() {
        AreaSelection area = this.getCurrentSelection();
        return area != null && (area.getSelectedSubRegionBox() != null || area.isOriginSelected());
    }

    public boolean hasSelectedOrigin() {
        AreaSelection area = this.getCurrentSelection();
        return area != null && area.isOriginSelected();
    }

    public void moveSelectedElement(Direction direction, int amount) {
        AreaSelection area = this.getCurrentSelection();
        if (area != null) {
            area.moveSelectedElement(direction, amount);
        }
    }

    public boolean hasGrabbedElement() {
        return this.grabbedElement != null;
    }

    public boolean grabElement(Minecraft mc, int maxDistance) {
        ClientLevel world = mc.level;
        Entity entity = EntityUtils.getCameraEntity();
        AreaSelection area = this.getCurrentSelection();
        if (area != null && entity != null && area.getAllSubRegionBoxes().size() > 0) {
            RayTraceUtils.RayTraceWrapper trace = RayTraceUtils.getWrappedRayTraceFromEntity((Level)world, entity, maxDistance);
            if (trace == null) {
                return false;
            }
            if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_CORNER || trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SELECTION_BOX_BODY) {
                this.changeSelection(area, trace);
                this.grabbedElement = new GrabbedElement(area, trace.getHitSelectionBox(), trace.getHitCorner(), trace.getHitVec(), entity.getEyePosition(1.0f).distanceTo(trace.getHitVec()));
                InfoUtils.printActionbarMessage((String)"litematica.message.grabbed_element_for_moving", (Object[])new Object[0]);
                return true;
            }
        }
        return false;
    }

    public void setPositionOfCurrentSelectionToRayTrace(Minecraft mc, PositionUtils.Corner corner, boolean moveEntireSelection, double maxDistance) {
        AreaSelection area = this.getCurrentSelection();
        if (area != null) {
            boolean movingCorner = area.getSelectedSubRegionBox() != null && corner != PositionUtils.Corner.NONE;
            boolean movingOrigin = area.isOriginSelected();
            if (movingCorner || movingOrigin) {
                Entity entity = EntityUtils.getCameraEntity();
                BlockPos pos = RayTraceUtils.getTargetedPosition((Level)mc.level, entity, maxDistance, true);
                if (pos == null) {
                    return;
                }
                if (movingOrigin) {
                    this.moveSelectionOrigin(area, pos, moveEntireSelection);
                } else {
                    int cornerIndex = corner.ordinal();
                    if (corner == PositionUtils.Corner.CORNER_1 || corner == PositionUtils.Corner.CORNER_2) {
                        area.setSelectedSubRegionCornerPos(pos, corner);
                    }
                    if (Configs.Generic.CHANGE_SELECTED_CORNER.getBooleanValue()) {
                        area.getSelectedSubRegionBox().setSelectedCorner(corner);
                    }
                    String posStr = String.format("x: %d, y: %d, z: %d", pos.getX(), pos.getY(), pos.getZ());
                    InfoUtils.printActionbarMessage((String)"litematica.message.set_selection_box_point", (Object[])new Object[]{cornerIndex, posStr});
                }
            }
        }
    }

    public void moveSelectionOrigin(AreaSelection area, BlockPos newOrigin, boolean moveEntireSelection) {
        if (moveEntireSelection) {
            area.moveEntireSelectionTo(newOrigin, true);
        } else {
            BlockPos old = area.getEffectiveOrigin();
            area.setExplicitOrigin(newOrigin);
            String posStrOld = String.format("x: %d, y: %d, z: %d", old.getX(), old.getY(), old.getZ());
            String posStrNew = String.format("x: %d, y: %d, z: %d", newOrigin.getX(), newOrigin.getY(), newOrigin.getZ());
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.moved_area_origin", (Object[])new Object[]{posStrOld, posStrNew});
        }
    }

    public void handleCuboidModeMouseClick(Minecraft mc, double maxDistance, boolean isRightClick, boolean moveEntireSelection) {
        AreaSelection selection = this.getCurrentSelection();
        if (selection != null) {
            if (selection.isOriginSelected()) {
                Entity entity = EntityUtils.getCameraEntity();
                BlockPos newOrigin = RayTraceUtils.getTargetedPosition((Level)mc.level, entity, maxDistance, true);
                if (newOrigin != null) {
                    this.moveSelectionOrigin(selection, newOrigin, moveEntireSelection);
                }
            } else if (isRightClick) {
                this.resetSelectionToClickedPosition(mc, maxDistance);
            } else {
                this.growSelectionToContainClickedPosition(mc, maxDistance);
            }
        }
    }

    private void resetSelectionToClickedPosition(Minecraft mc, double maxDistance) {
        Entity entity;
        BlockPos pos;
        AreaSelection area = this.getCurrentSelection();
        if (area != null && area.getSelectedSubRegionBox() != null && (pos = RayTraceUtils.getTargetedPosition((Level)mc.level, entity = EntityUtils.getCameraEntity(), maxDistance, true)) != null) {
            area.setSelectedSubRegionCornerPos(pos, PositionUtils.Corner.CORNER_1);
            area.setSelectedSubRegionCornerPos(pos, PositionUtils.Corner.CORNER_2);
        }
    }

    private void growSelectionToContainClickedPosition(Minecraft mc, double maxDistance) {
        Entity entity;
        BlockPos pos;
        AreaSelection sel = this.getCurrentSelection();
        if (sel != null && sel.getSelectedSubRegionBox() != null && (pos = RayTraceUtils.getTargetedPosition((Level)mc.level, entity = EntityUtils.getCameraEntity(), maxDistance, true)) != null) {
            Box box = sel.getSelectedSubRegionBox();
            BlockPos pos1 = box.getPos1();
            BlockPos pos2 = box.getPos2();
            if (pos1 == null) {
                pos1 = pos;
            }
            if (pos2 == null) {
                pos2 = pos;
            }
            BlockPos posMin = fi.dy.masa.litematica.util.PositionUtils.getMinCorner(fi.dy.masa.litematica.util.PositionUtils.getMinCorner(pos1, pos2), pos);
            BlockPos posMax = fi.dy.masa.litematica.util.PositionUtils.getMaxCorner(fi.dy.masa.litematica.util.PositionUtils.getMaxCorner(pos1, pos2), pos);
            sel.setSelectedSubRegionCornerPos(posMin, PositionUtils.Corner.CORNER_1);
            sel.setSelectedSubRegionCornerPos(posMax, PositionUtils.Corner.CORNER_2);
        }
    }

    public static void renameSubRegionBoxIfSingle(AreaSelection selection, String newName) {
        List<Box> boxes = selection.getAllSubRegionBoxes();
        if (boxes.size() == 1 && boxes.get(0).getName().equals(selection.getName())) {
            selection.renameSubRegionBox(selection.getName(), newName);
        }
    }

    public void releaseGrabbedElement() {
        this.grabbedElement = null;
    }

    public void changeGrabDistance(Entity entity, double amount) {
        if (this.grabbedElement != null) {
            this.grabbedElement.changeGrabDistance(amount);
            this.grabbedElement.moveElement(entity);
        }
    }

    public void moveGrabbedElement(Entity entity) {
        if (this.grabbedElement != null) {
            this.grabbedElement.moveElement(entity);
        }
    }

    public void clear() {
        this.grabbedElement = null;
        this.currentSelectionId = null;
        this.selections.clear();
        this.readOnlySelections.clear();
    }

    @Nullable
    public GuiBase getEditGui() {
        AreaSelection selection = this.getCurrentSelection();
        if (this.getSelectionMode() == SelectionMode.NORMAL) {
            if (selection != null) {
                return new GuiAreaSelectionEditorNormal(selection);
            }
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.error.area_editor.open_gui.no_selection", (Object[])new Object[0]);
            return null;
        }
        return new GuiAreaSelectionEditorSimple(selection);
    }

    public void openEditGui(@Nullable Screen parent) {
        GuiBase gui = this.getEditGui();
        if (gui != null) {
            gui.setParent(parent);
            GuiBase.openGui((Screen)gui);
        }
    }

    public void loadFromJson(JsonObject obj) {
        String currentId;
        AreaSelection selection;
        this.clear();
        if (JsonUtils.hasString((JsonObject)obj, (String)"current") && (selection = this.tryLoadSelectionFromFile(currentId = obj.get("current").getAsString())) != null) {
            this.selections.put(currentId, selection);
            this.setCurrentSelection(currentId);
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"mode")) {
            this.mode = SelectionMode.fromStringStatic(obj.get("mode").getAsString());
            this.modeDirty = false;
        } else {
            this.mode = (SelectionMode)Configs.InfoOverlays.DEFAULT_SELECTION_MODE.getOptionListValue();
        }
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        obj.add("mode", (JsonElement)new JsonPrimitive(this.mode.name()));
        try {
            for (Map.Entry<String, AreaSelection> entry : this.selections.entrySet()) {
                JsonUtils.writeJsonToFile((JsonElement)entry.getValue().toJson(), (Path)Path.of((String)entry.getKey(), (String[])new String[0]));
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("Exception while writing area selections to disk", (Throwable)e);
        }
        AreaSelection current = this.currentSelectionId != null ? this.selections.get(this.currentSelectionId) : null;
        this.selections.clear();
        this.readOnlySelections.clear();
        if (current != null) {
            obj.add("current", (JsonElement)new JsonPrimitive(this.currentSelectionId));
            this.selections.put(this.currentSelectionId, current);
        }
        return obj;
    }

    private static class GrabbedElement {
        private final AreaSelection area;
        public final Box grabbedBox;
        public final Box originalBox;
        public final Vec3 grabPosition;
        public final PositionUtils.Corner grabbedCorner;
        public double grabDistance;

        private GrabbedElement(AreaSelection area, Box box, PositionUtils.Corner corner, Vec3 grabPosition, double grabDistance) {
            this.area = area;
            this.grabbedBox = box;
            this.grabbedCorner = corner;
            this.grabPosition = grabPosition;
            this.grabDistance = grabDistance;
            this.originalBox = new Box(box.getPos1(), box.getPos2(), "");
        }

        public void changeGrabDistance(double amount) {
            this.grabDistance += amount;
        }

        public void moveElement(Entity entity) {
            BlockPos pos;
            Vec3 newLookPos = entity.getEyePosition(1.0f).add(entity.getViewVector(1.0f).scale(this.grabDistance));
            Vec3 change = newLookPos.subtract(this.grabPosition);
            if ((this.grabbedCorner == PositionUtils.Corner.NONE || this.grabbedCorner == PositionUtils.Corner.CORNER_1) && this.grabbedBox.getPos1() != null) {
                pos = this.originalBox.getPos1().offset((int)Math.floor(change.x), (int)Math.floor(change.y), (int)Math.floor(change.z));
                this.area.setSubRegionCornerPos(this.grabbedBox, PositionUtils.Corner.CORNER_1, pos);
            }
            if ((this.grabbedCorner == PositionUtils.Corner.NONE || this.grabbedCorner == PositionUtils.Corner.CORNER_2) && this.grabbedBox.getPos2() != null) {
                pos = this.originalBox.getPos2().offset((int)Math.floor(change.x), (int)Math.floor(change.y), (int)Math.floor(change.z));
                this.area.setSubRegionCornerPos(this.grabbedBox, PositionUtils.Corner.CORNER_2, pos);
            }
        }
    }
}

