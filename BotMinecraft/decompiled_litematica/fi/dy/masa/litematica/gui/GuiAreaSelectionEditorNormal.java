/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.GuiTextFieldGeneric
 *  fi.dy.masa.malilib.gui.GuiTextFieldInteger
 *  fi.dy.masa.malilib.gui.GuiTextInput
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.ButtonOnOff
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.interfaces.ITextFieldListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetCheckBox
 *  fi.dy.masa.malilib.gui.wrappers.TextFieldType
 *  fi.dy.masa.malilib.interfaces.IStringConsumerFeedback
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils$CoordinateType
 *  javax.annotation.Nullable
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.entity.Entity
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.GuiMaterialList;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListSelectionSubRegions;
import fi.dy.masa.litematica.gui.widgets.WidgetSelectionSubRegion;
import fi.dy.masa.litematica.materials.MaterialListAreaAnalyzer;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.SchematicUtils;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.GuiTextFieldGeneric;
import fi.dy.masa.malilib.gui.GuiTextFieldInteger;
import fi.dy.masa.malilib.gui.GuiTextInput;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.ButtonOnOff;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.interfaces.ITextFieldListener;
import fi.dy.masa.malilib.gui.widgets.WidgetBase;
import fi.dy.masa.malilib.gui.widgets.WidgetCheckBox;
import fi.dy.masa.malilib.gui.wrappers.TextFieldType;
import fi.dy.masa.malilib.interfaces.IStringConsumerFeedback;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.util.ArrayList;
import javax.annotation.Nullable;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.Entity;

public class GuiAreaSelectionEditorNormal
extends GuiListBase<String, WidgetSelectionSubRegion, WidgetListSelectionSubRegions>
implements ISelectionListener<String> {
    protected final AreaSelection selection;
    protected GuiTextFieldGeneric textFieldSelectionName;
    protected WidgetCheckBox checkBoxOrigin;
    protected WidgetCheckBox checkBoxCorner1;
    protected WidgetCheckBox checkBoxCorner2;
    protected int xNext;
    protected int yNext;
    protected int xOrigin;
    protected int xSet;
    @Nullable
    protected String selectionId;

    public GuiAreaSelectionEditorNormal(AreaSelection selection) {
        super(8, 116);
        this.selection = selection;
        this.selectionId = DataManager.getSelectionManager().getCurrentSelectionId();
        this.useTitleHierarchy = false;
        this.title = DataManager.getSchematicProjectsManager().hasProjectOpen() ? StringUtils.translate((String)"litematica.gui.title.area_editor_normal_schematic_projects", (Object[])new Object[0]) : StringUtils.translate((String)"litematica.gui.title.area_editor_normal", (Object[])new Object[0]);
    }

    public void setSelectionId(@Nullable String selectionId) {
        this.selectionId = selectionId;
    }

    public void initGui() {
        super.initGui();
        if (this.selection != null) {
            this.createSelectionEditFields();
            this.addSubRegionFields(this.xOrigin, this.yNext);
            this.updateCheckBoxes();
        } else {
            this.addLabel(20, 30, 120, 12, -22016, new String[]{StringUtils.translate((String)"litematica.error.area_editor.no_selection", (Object[])new Object[0])});
        }
    }

    protected void createSelectionEditFields() {
        int xLeft = 12;
        int x = xLeft - 2;
        int y = 24;
        x += this.createButton(x, y, -1, ButtonListener.Type.CHANGE_SELECTION_MODE) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.CHANGE_CORNER_MODE) + 4;
        this.xOrigin = x;
        x = xLeft;
        this.addLabel(x, y += 20, -1, 16, -1, new String[]{StringUtils.translate((String)"litematica.gui.label.area_editor.selection_name", (Object[])new Object[0])});
        int width = 202;
        this.textFieldSelectionName = new GuiTextFieldGeneric(x, (y += 13) + 2, width, 16, this.font);
        this.textFieldSelectionName.setValueWrapper(this.selection.getName());
        this.addTextField(this.textFieldSelectionName, new TextFieldListenerDummy(), TextFieldType.STRING);
        x += width + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_SELECTION_NAME) + 10;
        this.xSet = x;
        this.yNext = y += 20;
    }

    protected int addSubRegionFields(int x, int y) {
        int width = 68;
        int xSave = 10;
        int ySave = y + 4;
        xSave += this.createButton(xSave, ySave, -1, ButtonListener.Type.CREATE_SUB_REGION) + 4;
        boolean currentlyOn = this.selection.getExplicitOrigin() != null;
        xSave += this.createButtonOnOff(xSave, ySave, -1, currentlyOn, ButtonListener.Type.TOGGLE_ORIGIN_ENABLED) + 4;
        xSave += this.createButton(xSave, ySave, -1, ButtonListener.Type.CREATE_SCHEMATIC) + 4;
        if (this.selection.getExplicitOrigin() != null) {
            if (this.xSet - xSave > 5) {
                xSave = this.xSet + 5;
            }
            x = Math.max(xSave, this.xOrigin);
            this.createCoordinateInputs(x, 5, width, PositionUtils.Corner.NONE);
        }
        x = 12;
        y = this.getListY() - 12;
        String str = String.valueOf(this.selection.getAllSubRegionNames().size());
        this.addLabel(x, y, -1, 16, -1, new String[]{GuiBase.TXT_BOLD + StringUtils.translate((String)"litematica.gui.label.area_editor.sub_regions", (Object[])new Object[]{str})});
        this.addRenderingDisabledWarning(120, y + 2);
        y = this.getScreenHeight() - 26;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.AREA_SELECTION_BROWSER;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        ButtonGeneric button = new ButtonGeneric(x, y, -1, 20, label, (IGuiIcon)type.getIcon(), new String[0]);
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            button.setEnabled(false);
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.schematic_projects.area_browser_disabled_currently_in_projects_mode"});
        }
        this.createButton(x += ((ButtonGeneric)this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()))).getWidth() + 4, y, -1, ButtonListener.Type.ANALYZE_AREA);
        type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 10;
        x = this.getScreenWidth() - buttonWidth - 10;
        button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        return y;
    }

    protected void addRenderingDisabledWarning(int x, int y) {
        if (!Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getBooleanValue()) {
            ConfigHotkey hotkey = Hotkeys.TOGGLE_AREA_SELECTION_RENDERING;
            String configName = Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getName();
            String hotkeyName = hotkey.getName();
            String hotkeyVal = hotkey.getKeybind().getKeysDisplayString();
            String str = StringUtils.translate((String)"litematica.warning.area_editor.area_rendering_disabled", (Object[])new Object[]{configName, hotkeyName, hotkeyVal});
            ArrayList lines = new ArrayList();
            int maxLineLength = this.getScreenWidth() - x - 20;
            StringUtils.splitTextToLines(lines, (String)str, (int)maxLineLength);
            this.addLabel(x, y, maxLineLength, lines.size() * (StringUtils.getFontHeight() + 1), -22016, lines);
        }
    }

    protected void renameSubRegion() {
    }

    protected void createOrigin() {
        BlockPos origin = PositionUtils.getEntityBlockPos((Entity)this.mc.player);
        this.selection.setExplicitOrigin(origin);
    }

    protected int createCoordinateInputs(int x, int y, int width, PositionUtils.Corner corner) {
        String label = "";
        WidgetCheckBox widget = null;
        switch (corner) {
            case CORNER_1: {
                label = StringUtils.translate((String)"litematica.gui.label.area_editor.corner_1", (Object[])new Object[0]);
                this.checkBoxCorner1 = widget = new WidgetCheckBox(x, y + 3, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, label);
                break;
            }
            case CORNER_2: {
                label = StringUtils.translate((String)"litematica.gui.label.area_editor.corner_2", (Object[])new Object[0]);
                this.checkBoxCorner2 = widget = new WidgetCheckBox(x, y + 3, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, label);
                break;
            }
            case NONE: {
                label = StringUtils.translate((String)"litematica.gui.label.area_editor.origin", (Object[])new Object[0]);
                this.checkBoxOrigin = widget = new WidgetCheckBox(x, y + 3, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, label);
            }
        }
        if (widget != null) {
            widget.setListener((ISelectionListener)new CheckBoxListener(corner, this));
            this.addWidget((WidgetBase)widget);
        }
        this.createCoordinateInput(x, y += 14, width, PositionUtils.CoordinateType.X, corner);
        this.createCoordinateInput(x, y += 20, width, PositionUtils.CoordinateType.Y, corner);
        this.createCoordinateInput(x, y += 20, width, PositionUtils.CoordinateType.Z, corner);
        this.createButton(x + 10, y += 22, -1, corner, ButtonListener.Type.MOVE_TO_PLAYER);
        return y += 22;
    }

    protected void createCoordinateInput(int x, int y, int width, PositionUtils.CoordinateType coordType, PositionUtils.Corner corner) {
        String label = coordType.name() + ":";
        this.addLabel(x, y, 20, 20, -1, new String[]{label});
        int offset = 12;
        y += 2;
        BlockPos pos = corner == PositionUtils.Corner.NONE ? this.selection.getEffectiveOrigin() : this.getBox().getPosition(corner);
        String text = "";
        ButtonListener.Type type = null;
        switch (coordType) {
            case X: {
                text = String.valueOf(pos.getX());
                type = ButtonListener.Type.NUDGE_COORD_X;
                break;
            }
            case Y: {
                text = String.valueOf(pos.getY());
                type = ButtonListener.Type.NUDGE_COORD_Y;
                break;
            }
            case Z: {
                text = String.valueOf(pos.getZ());
                type = ButtonListener.Type.NUDGE_COORD_Z;
            }
        }
        GuiTextFieldInteger textField = new GuiTextFieldInteger(x + offset, y, width, 16, this.font);
        TextFieldListener listener = new TextFieldListener(coordType, corner, this);
        textField.setValueWrapper(text);
        this.addTextField((GuiTextFieldGeneric)textField, listener);
        this.createCoordinateButton(x + offset + width + 4, y, corner, coordType, type);
    }

    protected int createButtonOnOff(int x, int y, int width, boolean isCurrentlyOn, ButtonListener.Type type) {
        ButtonOnOff button = new ButtonOnOff(x, y, width, false, type.getTranslationKey(), isCurrentlyOn, new String[0]);
        this.addButton((ButtonBase)button, new ButtonListener(type, null, null, this));
        return button.getWidth();
    }

    protected int createButton(int x, int y, int width, ButtonListener.Type type) {
        return this.createButton(x, y, width, null, type);
    }

    protected int createButton(int x, int y, int width, @Nullable PositionUtils.Corner corner, ButtonListener.Type type) {
        String label;
        boolean projectsMode = DataManager.getSchematicProjectsManager().hasProjectOpen();
        if (type == ButtonListener.Type.CHANGE_SELECTION_MODE) {
            SelectionMode mode = DataManager.getSelectionManager().getSelectionMode();
            label = type.getDisplayName(mode.getDisplayName());
        } else if (type == ButtonListener.Type.CHANGE_CORNER_MODE) {
            String name = Configs.Generic.SELECTION_CORNERS_MODE.getOptionListValue().getDisplayName();
            label = type.getDisplayName(name);
        } else {
            label = type == ButtonListener.Type.CREATE_SCHEMATIC && projectsMode ? StringUtils.translate((String)"litematica.gui.button.save_new_schematic_version", (Object[])new Object[0]) : type.getDisplayName(new Object[0]);
        }
        if (width == -1) {
            width = this.getStringWidth(label) + 10;
        }
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, label, new String[0]);
        ButtonListener listener = new ButtonListener(type, corner, null, this);
        this.addButton((ButtonBase)button, listener);
        if (type == ButtonListener.Type.CREATE_SCHEMATIC && !projectsMode) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.area_editor.shift_for_in_memory"});
        }
        return width;
    }

    protected void createCoordinateButton(int x, int y, PositionUtils.Corner corner, PositionUtils.CoordinateType coordType, ButtonListener.Type type) {
        String hover = StringUtils.translate((String)"litematica.gui.button.hover.plus_minus_tip_ctrl_alt_shift", (Object[])new Object[0]);
        ButtonGeneric button = new ButtonGeneric(x, y, (IGuiIcon)Icons.BUTTON_PLUS_MINUS_16, new String[]{hover});
        ButtonListener listener = new ButtonListener(type, corner, coordType, this);
        this.addButton((ButtonBase)button, listener);
    }

    protected void updateCheckBoxes() {
        boolean checked;
        if (this.checkBoxOrigin != null) {
            this.checkBoxOrigin.setChecked(this.selection.isOriginSelected(), false);
        }
        if (this.checkBoxCorner1 != null) {
            checked = this.selection.getSelectedSubRegionBox() != null && this.selection.getSelectedSubRegionBox().getSelectedCorner() == PositionUtils.Corner.CORNER_1;
            this.checkBoxCorner1.setChecked(checked, false);
        }
        if (this.checkBoxCorner2 != null) {
            checked = this.selection.getSelectedSubRegionBox() != null && this.selection.getSelectedSubRegionBox().getSelectedCorner() == PositionUtils.Corner.CORNER_2;
            this.checkBoxCorner2.setChecked(checked, false);
        }
    }

    @Nullable
    protected Box getBox() {
        return null;
    }

    protected void updatePosition(String numberString, PositionUtils.Corner corner, PositionUtils.CoordinateType type) {
        try {
            int value = Integer.parseInt(numberString);
            this.selection.setCoordinate(this.getBox(), corner, type, value);
        }
        catch (Exception exception) {
            // empty catch block
        }
    }

    protected void moveCoordinate(int amount, PositionUtils.Corner corner, PositionUtils.CoordinateType type) {
        int oldValue = 0;
        if (corner == PositionUtils.Corner.NONE) {
            oldValue = fi.dy.masa.litematica.util.PositionUtils.getCoordinate(this.selection.getEffectiveOrigin(), type);
        } else if (this.getBox() != null) {
            oldValue = this.getBox().getCoordinate(corner, type);
        }
        this.selection.setCoordinate(this.getBox(), corner, type, oldValue + amount);
    }

    protected void renameSelection() {
        String newName = this.textFieldSelectionName.getValueWrapper();
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            SelectionManager.renameSubRegionBoxIfSingle(this.selection, newName);
            this.selection.setName(newName);
        } else {
            this.renameSelection(newName);
        }
    }

    protected void renameSelection(String newName) {
        if (this.selectionId != null) {
            DataManager.getSelectionManager().renameSelection(this.selectionId, newName, (IMessageConsumer)this);
            this.selectionId = DataManager.getSelectionManager().getCurrentSelectionId();
        }
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 146;
    }

    protected ISelectionListener<String> getSelectionListener() {
        return this;
    }

    public void onSelectionChange(String entry) {
        if (entry != null && entry.equals(this.selection.getCurrentSubRegionBoxName())) {
            this.selection.setSelectedSubRegionBox(null);
        } else {
            this.selection.setSelectedSubRegionBox(entry);
        }
    }

    protected WidgetListSelectionSubRegions createListWidget(int listX, int listY) {
        return new WidgetListSelectionSubRegions(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), this.selection, this);
    }

    protected static class ButtonListener
    implements IButtonActionListener {
        private final GuiAreaSelectionEditorNormal parent;
        private final Type type;
        @Nullable
        private final PositionUtils.Corner corner;
        @Nullable
        private final PositionUtils.CoordinateType coordinateType;

        public ButtonListener(Type type, @Nullable PositionUtils.Corner corner, @Nullable PositionUtils.CoordinateType coordinateType, GuiAreaSelectionEditorNormal parent) {
            this.type = type;
            this.corner = corner;
            this.coordinateType = coordinateType;
            this.parent = parent;
        }

        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            int amount;
            int n = amount = mouseButton == 1 ? -1 : 1;
            if (GuiBase.isCtrlDown()) {
                amount *= 100;
            }
            if (GuiBase.isShiftDown()) {
                amount *= 10;
            }
            if (GuiBase.isAltDown()) {
                amount *= 5;
            }
            this.parent.setNextMessageType(Message.MessageType.ERROR);
            switch (this.type.ordinal()) {
                case 9: {
                    this.parent.moveCoordinate(amount, this.corner, this.coordinateType);
                    break;
                }
                case 10: {
                    this.parent.moveCoordinate(amount, this.corner, this.coordinateType);
                    break;
                }
                case 11: {
                    this.parent.moveCoordinate(amount, this.corner, this.coordinateType);
                    break;
                }
                case 6: {
                    SelectionManager manager = DataManager.getSelectionManager();
                    SelectionMode newMode = (SelectionMode)manager.getSelectionMode().cycle(true);
                    if (newMode == SelectionMode.NORMAL && !manager.hasNormalSelection()) {
                        this.parent.addMessage(Message.MessageType.WARNING, "litematica.error.area_editor.switch_mode.no_selection", new Object[0]);
                        break;
                    }
                    manager.switchSelectionMode();
                    manager.openEditGui(null);
                    return;
                }
                case 7: {
                    Configs.Generic.SELECTION_CORNERS_MODE.setOptionListValue(Configs.Generic.SELECTION_CORNERS_MODE.getOptionListValue().cycle(false));
                    break;
                }
                case 4: {
                    SchematicUtils.saveSchematic(GuiBase.isShiftDown());
                    break;
                }
                case 5: {
                    MaterialListAreaAnalyzer list = new MaterialListAreaAnalyzer(this.parent.selection);
                    DataManager.setMaterialList(list);
                    GuiMaterialList gui = new GuiMaterialList(list);
                    GuiBase.openGui((Screen)gui);
                    list.reCreateMaterialList();
                    return;
                }
                case 3: {
                    GuiTextInput gui = new GuiTextInput(512, "litematica.gui.title.area_editor.sub_region_name", "", null, (IStringConsumerFeedback)new SubRegionCreator(this.parent));
                    gui.setParent((Screen)this.parent);
                    GuiBase.openGui((Screen)gui);
                    break;
                }
                case 0: {
                    this.parent.renameSelection();
                    break;
                }
                case 1: {
                    this.parent.renameSubRegion();
                    break;
                }
                case 8: {
                    if (this.parent.mc.player == null) break;
                    BlockPos pos = PositionUtils.getEntityBlockPos((Entity)this.parent.mc.player);
                    if (this.corner == PositionUtils.Corner.NONE) {
                        this.parent.selection.setExplicitOrigin(pos);
                        break;
                    }
                    this.parent.selection.setSelectedSubRegionCornerPos(pos, this.corner);
                    break;
                }
                case 2: {
                    BlockPos origin = this.parent.selection.getExplicitOrigin();
                    if (origin == null) {
                        this.parent.createOrigin();
                        break;
                    }
                    this.parent.selection.setExplicitOrigin(null);
                }
            }
            this.parent.initGui();
        }

        public static enum Type {
            SET_SELECTION_NAME("litematica.gui.button.area_editor.set_selection_name"),
            SET_BOX_NAME("litematica.gui.button.area_editor.set_box_name"),
            TOGGLE_ORIGIN_ENABLED("litematica.gui.button.area_editor.origin_enabled"),
            CREATE_SUB_REGION("litematica.gui.button.area_editor.create_sub_region"),
            CREATE_SCHEMATIC("litematica.gui.button.area_editor.create_schematic"),
            ANALYZE_AREA("litematica.gui.button.area_editor.analyze_area"),
            CHANGE_SELECTION_MODE("litematica.gui.button.area_editor.change_selection_mode"),
            CHANGE_CORNER_MODE("litematica.gui.button.area_editor.change_corner_mode"),
            MOVE_TO_PLAYER("litematica.gui.button.move_to_player"),
            NUDGE_COORD_X(""),
            NUDGE_COORD_Y(""),
            NUDGE_COORD_Z("");

            private final String translationKey;
            @Nullable
            private final String hoverText;

            private Type(String translationKey) {
                this(translationKey, null);
            }

            private Type(String translationKey, String hoverText) {
                this.translationKey = translationKey;
                this.hoverText = hoverText;
            }

            public String getTranslationKey() {
                return this.translationKey;
            }

            public String getDisplayName(Object ... args) {
                return StringUtils.translate((String)this.translationKey, (Object[])args);
            }
        }
    }

    public static class TextFieldListenerDummy
    implements ITextFieldListener<GuiTextFieldGeneric> {
        public boolean onTextChange(GuiTextFieldGeneric textField) {
            return false;
        }
    }

    protected static class CheckBoxListener
    implements ISelectionListener<WidgetCheckBox> {
        private final GuiAreaSelectionEditorNormal gui;
        private final PositionUtils.Corner corner;

        public CheckBoxListener(PositionUtils.Corner corner, GuiAreaSelectionEditorNormal gui) {
            this.gui = gui;
            this.corner = corner;
        }

        public void onSelectionChange(WidgetCheckBox entry) {
            if (entry == null) {
                return;
            }
            if (entry.isChecked()) {
                if (this.corner == PositionUtils.Corner.NONE) {
                    this.gui.selection.setOriginSelected(true);
                    this.gui.selection.clearCurrentSelectedCorner();
                } else {
                    this.gui.selection.setOriginSelected(false);
                    this.gui.selection.setCurrentSelectedCorner(this.corner);
                }
            } else if (this.corner == PositionUtils.Corner.NONE) {
                this.gui.selection.setOriginSelected(false);
            } else {
                this.gui.selection.clearCurrentSelectedCorner();
            }
            this.gui.updateCheckBoxes();
        }
    }

    protected static class TextFieldListener
    implements ITextFieldListener<GuiTextFieldGeneric> {
        private final GuiAreaSelectionEditorNormal parent;
        private final PositionUtils.CoordinateType type;
        private final PositionUtils.Corner corner;

        public TextFieldListener(PositionUtils.CoordinateType type, PositionUtils.Corner corner, GuiAreaSelectionEditorNormal parent) {
            this.type = type;
            this.corner = corner;
            this.parent = parent;
        }

        public boolean onTextChange(GuiTextFieldGeneric textField) {
            this.parent.updatePosition(textField.getValueWrapper(), this.corner, this.type);
            return false;
        }
    }

    protected static class SubRegionCreator
    implements IStringConsumerFeedback {
        private final GuiAreaSelectionEditorNormal gui;

        private SubRegionCreator(GuiAreaSelectionEditorNormal gui) {
            this.gui = gui;
        }

        public boolean setString(String string) {
            return DataManager.getSelectionManager().createNewSubRegionIfDoesntExist(string, this.gui.mc, (IMessageConsumer)this.gui);
        }
    }
}

