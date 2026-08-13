/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.GuiTextFieldGeneric
 *  fi.dy.masa.malilib.gui.GuiTextFieldInteger
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
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils$CoordinateType
 *  java.lang.MatchException
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Position
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.GuiMaterialList;
import fi.dy.masa.litematica.gui.GuiSchematicVerifier;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListPlacementSubRegions;
import fi.dy.masa.litematica.gui.widgets.WidgetPlacementSubRegion;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.GuiTextFieldGeneric;
import fi.dy.masa.malilib.gui.GuiTextFieldInteger;
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
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Position;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;

public class GuiPlacementConfiguration
extends GuiListBase<SubRegionPlacement, WidgetPlacementSubRegion, WidgetListPlacementSubRegions>
implements ISelectionListener<SubRegionPlacement> {
    public final SchematicPlacement placement;
    public ButtonGeneric buttonResetPlacement;
    public GuiTextFieldGeneric textFieldRename;

    public GuiPlacementConfiguration(SchematicPlacement placement) {
        super(10, 62);
        this.placement = placement;
        this.title = StringUtils.translate((String)"litematica.gui.title.configure_schematic_placement", (Object[])new Object[0]);
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 150;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 84;
    }

    public void initGui() {
        super.initGui();
        int scaledWidth = GuiUtils.getScaledWindowWidth();
        int width = Math.min(300, scaledWidth - 200);
        int x = 12;
        int y = 22;
        this.textFieldRename = new GuiTextFieldGeneric(x, y + 2, width, 16, this.font);
        this.textFieldRename.setMaxLengthWrapper(256);
        this.textFieldRename.setValueWrapper(this.placement.getName());
        this.addTextField(this.textFieldRename, null, TextFieldType.STRING);
        this.createButton(x + width + 4, y, -1, ButtonListener.Type.RENAME_PLACEMENT);
        String label = StringUtils.translate((String)"litematica.gui.label.schematic_placement.sub_regions", (Object[])new Object[]{this.placement.getSubRegionCount()});
        this.addLabel(x + 2, y + 26, -1, 20, -1, new String[]{label});
        x = scaledWidth - 154;
        x -= this.createButton(x, y + 22, -1, ButtonListener.Type.TOGGLE_ALL_REGIONS_OFF) + 2;
        this.createButton(x, y + 22, -1, ButtonListener.Type.TOGGLE_ALL_REGIONS_ON);
        width = 120;
        x = this.getScreenWidth() - width - 10;
        this.createButtonOnOff(x, y, width - 22, this.placement.isEnabled(), ButtonListener.Type.TOGGLE_ENABLED);
        this.createButton(x + width - 20, y, 20, ButtonListener.Type.TOGGLE_RENDERING);
        this.createButtonOnOff(x, y += 21, width - 22, this.placement.isLocked(), ButtonListener.Type.TOGGLE_LOCKED);
        this.createButton(x + width - 20, y + 2, 20, ButtonListener.Type.TOGGLE_ENCLOSING_BOX);
        this.createButtonOnOff(x, y += 21, width, this.placement.ignoreEntities(), ButtonListener.Type.TOGGLE_ENTITIES);
        label = StringUtils.translate((String)"litematica.gui.label.placement_settings.placement_origin", (Object[])new Object[0]);
        this.addLabel(x += 2, y += 21, width, 20, -1, new String[]{label});
        this.createCoordinateInput(x, y += 14, 70, PositionUtils.CoordinateType.X);
        this.createButton(x + 85, y + 1, -1, ButtonListener.Type.NUDGE_COORD_X);
        this.createCoordinateInput(x, y += 18, 70, PositionUtils.CoordinateType.Y);
        this.createButton(x + 85, y + 1, -1, ButtonListener.Type.NUDGE_COORD_Y);
        this.createCoordinateInput(x, y += 18, 70, PositionUtils.CoordinateType.Z);
        this.createButton(x + 85, y + 1, -1, ButtonListener.Type.NUDGE_COORD_Z);
        this.createButton(x -= 2, y += 20, width, ButtonListener.Type.MOVE_TO_PLAYER);
        this.createButton(x, y += 21, width, ButtonListener.Type.ROTATE);
        this.createButton(x, y += 21, width, ButtonListener.Type.MIRROR);
        this.createButton(x, y += 21, width, ButtonListener.Type.RESET_SUB_REGIONS);
        if (GuiUtils.getScaledWindowHeight() < 328) {
            x = 10;
            y = this.getScreenHeight() - 22;
            x += this.createButton(x, y, -1, ButtonListener.Type.OPEN_MATERIAL_LIST_GUI) + 1;
            x += this.createButton(x, y, -1, ButtonListener.Type.OPEN_VERIFIER_GUI) + 1;
            GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PLACEMENTS;
            label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
            int buttonWidth = this.getStringWidth(label) + 10;
            ButtonGeneric button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
            this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        } else {
            this.createButton(x, y += 32, width, ButtonListener.Type.OPEN_MATERIAL_LIST_GUI);
            this.createButton(x, y += 21, width, ButtonListener.Type.OPEN_VERIFIER_GUI);
            GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PLACEMENTS;
            label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
            int buttonWidth = this.getStringWidth(label) + 10;
            x = this.getScreenWidth() - buttonWidth - 9;
            ButtonGeneric button = new ButtonGeneric(x, y += 32, buttonWidth, 20, label, new String[0]);
            this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        }
        this.updateElements();
    }

    protected void createCoordinateInput(int x, int y, int width, PositionUtils.CoordinateType type) {
        String label = type.name() + ":";
        this.addLabel(x, y, width, 20, -1, new String[]{label});
        int offset = this.getStringWidth(label) + 4;
        BlockPos pos = this.placement.getOrigin();
        String text = switch (type) {
            default -> throw new MatchException(null, null);
            case PositionUtils.CoordinateType.X -> String.valueOf(pos.getX());
            case PositionUtils.CoordinateType.Y -> String.valueOf(pos.getY());
            case PositionUtils.CoordinateType.Z -> String.valueOf(pos.getZ());
        };
        GuiTextFieldInteger textField = new GuiTextFieldInteger(x + offset, y + 2, width, 14, this.font);
        textField.setValueWrapper(text);
        TextFieldListener listener = new TextFieldListener(type, this.placement, this);
        this.addTextField((GuiTextFieldGeneric)textField, listener, TextFieldType.STRING);
        String hover = StringUtils.translate((String)"litematica.hud.schematic_placement.hover_info.lock_coordinate", (Object[])new Object[0]);
        x = x + offset + width + 20;
        WidgetCheckBox cb = new WidgetCheckBox(x, y + 3, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, "", hover);
        cb.setChecked(this.placement.isCoordinateLocked(type), false);
        cb.setListener((ISelectionListener)new CoordinateLockListener(type, this.placement));
        this.addWidget((WidgetBase)cb);
    }

    public int createButtonOnOff(int x, int y, int width, boolean isCurrentlyOn, ButtonListener.Type type) {
        ButtonOnOff button = new ButtonOnOff(x, y, width, false, type.getTranslationKey(), isCurrentlyOn, new String[0]);
        String hoverString = type.getHoverText();
        if (hoverString != null) {
            button.setHoverStrings(new String[]{hoverString});
        }
        this.addButton((ButtonBase)button, new ButtonListener(type, this.placement, this));
        return button.getWidth();
    }

    public int createButton(int x, int y, int width, ButtonListener.Type type) {
        ButtonListener listener = new ButtonListener(type, this.placement, this);
        Object label = "";
        switch (type.ordinal()) {
            case 11: {
                Icons icon = this.placement.shouldRenderEnclosingBox() ? Icons.ENCLOSING_BOX_ENABLED : Icons.ENCLOSING_BOX_DISABLED;
                boolean enabled = this.placement.shouldRenderEnclosingBox();
                String str = (enabled ? TXT_GREEN : TXT_RED) + StringUtils.translate((String)("litematica.message.value." + (enabled ? "on" : "off")), (Object[])new Object[0]) + TXT_RST;
                String hover = StringUtils.translate((String)"litematica.gui.button.schematic_placement.hover.enclosing_box", (Object[])new Object[]{str});
                this.addButton((ButtonBase)new ButtonGeneric(x, y, (IGuiIcon)icon, new String[]{hover}), listener);
                return icon.getWidth();
            }
            case 8: {
                boolean enabled = this.placement.isRenderingEnabled();
                String pre = enabled ? TXT_GREEN : TXT_RED;
                label = pre + type.getDisplayName(new Object[0]) + TXT_RST;
                String str = pre + StringUtils.translate((String)("litematica.message.value." + (enabled ? "on" : "off")), (Object[])new Object[0]) + TXT_RST;
                String hover = StringUtils.translate((String)"litematica.gui.button.schematic_placement.hover.rendering", (Object[])new Object[]{str});
                this.addButton((ButtonBase)new ButtonGeneric(x, y, width, 20, (String)label, new String[]{hover}), listener);
                break;
            }
            case 1: {
                String value = PositionUtils.getRotationNameShort(this.placement.getRotation());
                label = type.getDisplayName(value);
                break;
            }
            case 2: {
                String value = PositionUtils.getMirrorName(this.placement.getMirror());
                label = type.getDisplayName(value);
                break;
            }
            case 4: 
            case 5: 
            case 6: {
                String hover = StringUtils.translate((String)"litematica.gui.button.hover.plus_minus_tip", (Object[])new Object[0]);
                ButtonGeneric button = new ButtonGeneric(x, y, (IGuiIcon)Icons.BUTTON_PLUS_MINUS_16, new String[]{hover});
                this.addButton((ButtonBase)button, listener);
                return width;
            }
            default: {
                label = type.getDisplayName(new Object[0]);
            }
        }
        if (width == -1) {
            width = this.getStringWidth((String)label) + 10;
        }
        if (type == ButtonListener.Type.TOGGLE_ALL_REGIONS_OFF || type == ButtonListener.Type.TOGGLE_ALL_REGIONS_ON) {
            x -= width;
        }
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, (String)label, new String[0]);
        this.addButton((ButtonBase)button, listener);
        if (type == ButtonListener.Type.RESET_SUB_REGIONS) {
            this.buttonResetPlacement = button;
        }
        return width;
    }

    protected void updateElements() {
        Object label = StringUtils.translate((String)"litematica.gui.button.schematic_placement.reset_sub_region_placements", (Object[])new Object[0]);
        boolean enabled = true;
        if (this.placement.isRegionPlacementModified()) {
            label = TXT_GOLD + (String)label + TXT_RST;
        } else {
            enabled = false;
        }
        this.buttonResetPlacement.setDisplayString((String)label);
        this.buttonResetPlacement.setEnabled(enabled);
    }

    public SchematicPlacement getSchematicPlacement() {
        return this.placement;
    }

    protected ISelectionListener<SubRegionPlacement> getSelectionListener() {
        return this;
    }

    public void onSelectionChange(SubRegionPlacement entry) {
        this.placement.setSelectedSubRegionName(entry != null && !entry.getName().equals(this.placement.getSelectedSubRegionName()) ? entry.getName() : null);
    }

    protected WidgetListPlacementSubRegions createListWidget(int listX, int listY) {
        return new WidgetListPlacementSubRegions(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), this);
    }

    public record ButtonListener(Type type, SchematicPlacement placement, GuiPlacementConfiguration parent) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            int amount;
            Minecraft mc = Minecraft.getInstance();
            if (mc.player == null) {
                return;
            }
            int n = amount = mouseButton == 1 ? -1 : 1;
            if (GuiBase.isShiftDown()) {
                amount *= 8;
            }
            if (GuiBase.isAltDown()) {
                amount *= 4;
            }
            BlockPos oldOrigin = this.placement.getOrigin();
            this.parent.setNextMessageType(Message.MessageType.ERROR);
            switch (this.type.ordinal()) {
                case 0: {
                    this.placement.setName(this.parent.textFieldRename.getValueWrapper());
                    break;
                }
                case 1: {
                    boolean reverse = mouseButton == 1;
                    Rotation rotation = PositionUtils.cycleRotation(this.placement.getRotation(), reverse);
                    this.placement.setRotation(rotation, (IMessageConsumer)this.parent);
                    break;
                }
                case 2: {
                    boolean reverse = mouseButton == 1;
                    Mirror mirror = PositionUtils.cycleMirror(this.placement.getMirror(), reverse);
                    this.placement.setMirror(mirror, (IMessageConsumer)this.parent);
                    break;
                }
                case 3: {
                    BlockPos pos = BlockPos.containing((Position)mc.player.position());
                    this.placement.setOrigin(pos, (IStringConsumer)this.parent);
                    break;
                }
                case 4: {
                    this.placement.setOrigin(oldOrigin.offset(amount, 0, 0), (IStringConsumer)this.parent);
                    break;
                }
                case 5: {
                    this.placement.setOrigin(oldOrigin.offset(0, amount, 0), (IStringConsumer)this.parent);
                    break;
                }
                case 6: {
                    this.placement.setOrigin(oldOrigin.offset(0, 0, amount), (IStringConsumer)this.parent);
                    break;
                }
                case 7: {
                    this.placement.toggleEnabled();
                    break;
                }
                case 8: {
                    this.placement.setRenderSchematic(!this.placement.isRenderingEnabled());
                    break;
                }
                case 9: {
                    this.placement.toggleLocked();
                    break;
                }
                case 10: {
                    this.placement.toggleIgnoreEntities((IMessageConsumer)this.parent);
                    break;
                }
                case 11: {
                    this.placement.toggleRenderEnclosingBox();
                    break;
                }
                case 14: {
                    this.placement.resetAllSubRegionsToSchematicValues((IStringConsumer)this.parent);
                    break;
                }
                case 12: 
                case 13: {
                    boolean state = this.type == Type.TOGGLE_ALL_REGIONS_ON;
                    this.placement.setSubRegionsEnabledState(state, ((WidgetListPlacementSubRegions)this.parent.getListWidget()).getCurrentEntries(), (IMessageConsumer)this.parent);
                    break;
                }
                case 15: {
                    GuiSchematicVerifier gui = new GuiSchematicVerifier(this.placement);
                    gui.setParent((Screen)this.parent);
                    GuiBase.openGui((Screen)gui);
                    break;
                }
                case 16: {
                    MaterialListBase materialList = this.placement.getMaterialList();
                    materialList.reCreateMaterialList();
                    GuiMaterialList gui = new GuiMaterialList(materialList);
                    DataManager.setMaterialList(materialList);
                    gui.setParent((Screen)this.parent);
                    GuiBase.openGui((Screen)gui);
                    break;
                }
            }
            this.parent.initGui();
        }

        public static enum Type {
            RENAME_PLACEMENT("litematica.gui.button.rename"),
            ROTATE("litematica.gui.button.rotation_value"),
            MIRROR("litematica.gui.button.mirror_value"),
            MOVE_TO_PLAYER("litematica.gui.button.move_to_player"),
            NUDGE_COORD_X(""),
            NUDGE_COORD_Y(""),
            NUDGE_COORD_Z(""),
            TOGGLE_ENABLED("litematica.gui.button.schematic_placements.placement_enabled"),
            TOGGLE_RENDERING("litematica.gui.button.schematic_placement.abbr.rendering"),
            TOGGLE_LOCKED("litematica.gui.button.schematic_placements.locked", "litematica.gui.button.schematic_placement.hover.lock"),
            TOGGLE_ENTITIES("litematica.gui.button.schematic_placement.ignore_entities"),
            TOGGLE_ENCLOSING_BOX(""),
            TOGGLE_ALL_REGIONS_ON("litematica.gui.button.schematic_placement.toggle_all_on"),
            TOGGLE_ALL_REGIONS_OFF("litematica.gui.button.schematic_placement.toggle_all_off"),
            RESET_SUB_REGIONS(""),
            OPEN_VERIFIER_GUI("litematica.gui.button.schematic_verifier"),
            OPEN_MATERIAL_LIST_GUI("litematica.gui.button.material_list");

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

            @Nullable
            public String getHoverText() {
                return this.hoverText != null ? StringUtils.translate((String)this.hoverText, (Object[])new Object[0]) : null;
            }
        }
    }

    public record TextFieldListener(PositionUtils.CoordinateType type, SchematicPlacement placement, GuiPlacementConfiguration parent) implements ITextFieldListener<GuiTextFieldInteger>
    {
        public boolean onTextChange(GuiTextFieldInteger textField) {
            try {
                int value = Integer.parseInt(textField.getValueWrapper());
                BlockPos posOld = this.placement.getOrigin();
                this.parent.setNextMessageType(Message.MessageType.ERROR);
                switch (this.type) {
                    case X: {
                        this.placement.setOrigin(new BlockPos(value, posOld.getY(), posOld.getZ()), (IStringConsumer)this.parent);
                        break;
                    }
                    case Y: {
                        this.placement.setOrigin(new BlockPos(posOld.getX(), value, posOld.getZ()), (IStringConsumer)this.parent);
                        break;
                    }
                    case Z: {
                        this.placement.setOrigin(new BlockPos(posOld.getX(), posOld.getY(), value), (IStringConsumer)this.parent);
                    }
                }
                this.parent.updateElements();
            }
            catch (NumberFormatException numberFormatException) {
                // empty catch block
            }
            return false;
        }
    }

    public record CoordinateLockListener(PositionUtils.CoordinateType type, SchematicPlacement placement) implements ISelectionListener<WidgetCheckBox>
    {
        public void onSelectionChange(WidgetCheckBox entry) {
            if (entry == null) {
                return;
            }
            this.placement.setCoordinateLocked(this.type, entry.isChecked());
        }
    }
}

