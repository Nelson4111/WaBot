/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiTextFieldGeneric
 *  fi.dy.masa.malilib.gui.wrappers.TextFieldType
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorNormal;
import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorSimple;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.GuiTextFieldGeneric;
import fi.dy.masa.malilib.gui.wrappers.TextFieldType;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nullable;

public class GuiAreaSelectionEditorSubRegion
extends GuiAreaSelectionEditorSimple {
    protected final Box box;

    public GuiAreaSelectionEditorSubRegion(AreaSelection selection, Box box) {
        super(selection);
        this.box = box;
        this.title = StringUtils.translate((String)"litematica.gui.title.area_editor_sub_region", (Object[])new Object[0]);
    }

    @Override
    protected void createSelectionEditFields() {
    }

    @Override
    protected int addSubRegionFields(int x, int y) {
        x = 12;
        y = 24;
        String label = StringUtils.translate((String)"litematica.gui.label.area_editor.box_name", (Object[])new Object[0]);
        this.addLabel(x, y, -1, 16, -1, new String[]{label});
        int width = 202;
        this.textFieldBoxName = new GuiTextFieldGeneric(x, (y += 13) + 2, width, 16, this.font);
        this.textFieldBoxName.setValueWrapper(this.getBox().getName());
        this.addTextField(this.textFieldBoxName, new GuiAreaSelectionEditorNormal.TextFieldListenerDummy(), TextFieldType.STRING);
        this.createButton(x + width + 4, y, -1, GuiAreaSelectionEditorNormal.ButtonListener.Type.SET_BOX_NAME);
        x = 12;
        width = 68;
        this.createCoordinateInputs(x, y += 20, width, PositionUtils.Corner.CORNER_1);
        this.createCoordinateInputs(x += width + 42, y, width, PositionUtils.Corner.CORNER_2);
        x += width + 42;
        return y;
    }

    @Override
    @Nullable
    protected Box getBox() {
        return this.box;
    }

    @Override
    protected void renameSubRegion() {
        String oldName = this.box.getName();
        String newName = this.textFieldBoxName.getValueWrapper();
        this.selection.renameSubRegionBox(oldName, newName);
    }

    @Override
    protected void createOrigin() {
    }
}

