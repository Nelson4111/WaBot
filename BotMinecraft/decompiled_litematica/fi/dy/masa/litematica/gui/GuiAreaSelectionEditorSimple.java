/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiTextFieldGeneric
 *  fi.dy.masa.malilib.gui.wrappers.TextFieldType
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorNormal;
import fi.dy.masa.litematica.gui.widgets.WidgetListSelectionSubRegions;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.GuiTextFieldGeneric;
import fi.dy.masa.malilib.gui.wrappers.TextFieldType;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;

public class GuiAreaSelectionEditorSimple
extends GuiAreaSelectionEditorNormal {
    protected GuiTextFieldGeneric textFieldBoxName;

    public GuiAreaSelectionEditorSimple(AreaSelection selection) {
        super(selection);
        this.title = DataManager.getSchematicProjectsManager().hasProjectOpen() ? StringUtils.translate((String)"litematica.gui.title.area_editor_normal_schematic_projects", (Object[])new Object[0]) : StringUtils.translate((String)"litematica.gui.title.area_editor_simple", (Object[])new Object[0]);
    }

    @Override
    protected int addSubRegionFields(int x, int y) {
        x = 12;
        String label = StringUtils.translate((String)"litematica.gui.label.area_editor.box_name", (Object[])new Object[0]);
        this.addLabel(x, y, -1, 16, -1, new String[]{label});
        boolean currentlyOn = this.selection.getExplicitOrigin() != null;
        this.createButtonOnOff(this.xOrigin, 24, -1, currentlyOn, GuiAreaSelectionEditorNormal.ButtonListener.Type.TOGGLE_ORIGIN_ENABLED);
        int width = 202;
        this.textFieldBoxName = new GuiTextFieldGeneric(x, (y += 13) + 2, width, 16, this.font);
        this.textFieldBoxName.setValueWrapper(this.getBox().getName());
        this.addTextField(this.textFieldBoxName, new GuiAreaSelectionEditorNormal.TextFieldListenerDummy(), TextFieldType.STRING);
        this.createButton(x + width + 4, y, -1, GuiAreaSelectionEditorNormal.ButtonListener.Type.SET_BOX_NAME);
        x = 12;
        width = 68;
        int nextY = 0;
        this.createCoordinateInputs(x, y += 20, width, PositionUtils.Corner.CORNER_1);
        nextY = this.createCoordinateInputs(x += width + 42, y, width, PositionUtils.Corner.CORNER_2);
        this.createButton(x + 10, nextY, -1, GuiAreaSelectionEditorNormal.ButtonListener.Type.ANALYZE_AREA);
        x += width + 42;
        if (this.selection.getExplicitOrigin() != null) {
            this.createCoordinateInputs(x, y, width, PositionUtils.Corner.NONE);
        }
        x = this.createButton(22, nextY, -1, GuiAreaSelectionEditorNormal.ButtonListener.Type.CREATE_SCHEMATIC) + 26;
        this.addRenderingDisabledWarning(250, 48);
        return y;
    }

    @Override
    @Nullable
    protected Box getBox() {
        return this.selection.getSelectedSubRegionBox();
    }

    @Override
    protected void renameSubRegion() {
        String oldName = this.selection.getCurrentSubRegionBoxName();
        String newName = this.textFieldBoxName.getValueWrapper();
        this.selection.renameSubRegionBox(oldName, newName);
    }

    @Override
    protected void renameSelection(String newName) {
        SelectionManager.renameSubRegionBoxIfSingle(this.selection, newName);
        this.selection.setName(newName);
    }

    @Override
    protected void createOrigin() {
        if (this.getBox() != null) {
            BlockPos pos1 = this.getBox().getPos1();
            BlockPos pos2 = this.getBox().getPos2();
            BlockPos origin = PositionUtils.getMinCorner(pos1, pos2);
            this.selection.setExplicitOrigin(origin);
        }
    }

    protected WidgetListSelectionSubRegions getListWidget() {
        return null;
    }

    protected void reCreateListWidget() {
    }
}

