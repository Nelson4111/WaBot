/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.hotkeys.IHotkey
 *  fi.dy.masa.malilib.hotkeys.IKeybindManager
 *  fi.dy.masa.malilib.hotkeys.IKeybindProvider
 *  fi.dy.masa.malilib.hotkeys.IKeyboardInputHandler
 *  fi.dy.masa.malilib.hotkeys.IMouseInputHandler
 *  fi.dy.masa.malilib.hotkeys.KeybindMulti
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  net.minecraft.client.KeyMapping
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.input.KeyEvent
 *  net.minecraft.client.input.MouseButtonEvent
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.player.Player
 */
package fi.dy.masa.litematica.event;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiSchematicManager;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.util.EasyPlaceUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.SchematicUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.hotkeys.IHotkey;
import fi.dy.masa.malilib.hotkeys.IKeybindManager;
import fi.dy.masa.malilib.hotkeys.IKeybindProvider;
import fi.dy.masa.malilib.hotkeys.IKeyboardInputHandler;
import fi.dy.masa.malilib.hotkeys.IMouseInputHandler;
import fi.dy.masa.malilib.hotkeys.KeybindMulti;
import fi.dy.masa.malilib.util.EntityUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;

public class InputHandler
implements IKeybindProvider,
IKeyboardInputHandler,
IMouseInputHandler {
    private static final InputHandler INSTANCE = new InputHandler();

    private InputHandler() {
    }

    public static InputHandler getInstance() {
        return INSTANCE;
    }

    public void addKeysToMap(IKeybindManager manager) {
        for (IHotkey iHotkey : Hotkeys.HOTKEY_LIST) {
            manager.addKeybindToMap(iHotkey.getKeybind());
        }
        for (IHotkey iHotkey : Configs.Generic.HOTKEY_LIST) {
            manager.addKeybindToMap(iHotkey.getKeybind());
        }
        for (IHotkey iHotkey : Configs.Visuals.HOTKEY_LIST) {
            manager.addKeybindToMap(iHotkey.getKeybind());
        }
    }

    public void addHotkeys(IKeybindManager manager) {
        manager.addHotkeysForCategory("Litematica", "litematica.hotkeys.category.generic_hotkeys", Hotkeys.HOTKEY_LIST);
        manager.addHotkeysForCategory("Litematica", "litematica.hotkeys.category.config_generic_hotkeys", Configs.Generic.HOTKEY_LIST);
        manager.addHotkeysForCategory("Litematica", "litematica.hotkeys.category.config_visuals_hotkeys", Configs.Visuals.HOTKEY_LIST);
    }

    public boolean onKeyInput(KeyEvent input, boolean eventKeyState) {
        if (eventKeyState) {
            Minecraft mc = Minecraft.getInstance();
            if (mc.options.keyUse.matches(input)) {
                return this.handleUseKey(mc);
            }
            if (mc.options.keyAttack.matches(input)) {
                return this.handleAttackKey(mc);
            }
            if (mc.options.keyScreenshot.matches(input) && GuiSchematicManager.hasPendingPreviewTask()) {
                return GuiSchematicManager.setPreviewImage();
            }
        }
        return false;
    }

    public boolean onMouseClick(MouseButtonEvent click, boolean eventButtonState) {
        Minecraft mc = Minecraft.getInstance();
        if (GuiUtils.getCurrentScreen() == null && mc.level != null && mc.player != null && eventButtonState) {
            if (mc.options.keyUse.matchesMouse(click)) {
                return this.handleUseKey(mc);
            }
            if (mc.options.keyAttack.matchesMouse(click)) {
                return this.handleAttackKey(mc);
            }
        }
        return false;
    }

    public boolean onMouseScroll(double mouseX, double mouseY, double dWheel) {
        Minecraft mc = Minecraft.getInstance();
        if (GuiUtils.getCurrentScreen() == null && mc.level != null && mc.player != null) {
            return this.handleMouseScroll(dWheel, mc);
        }
        return false;
    }

    private boolean handleMouseScroll(double dWheel, Minecraft mc) {
        boolean toolEnabled;
        boolean bl = toolEnabled = Configs.Visuals.ENABLE_RENDERING.getBooleanValue() && Configs.Generic.TOOL_ITEM_ENABLED.getBooleanValue();
        if (!toolEnabled || !fi.dy.masa.litematica.util.EntityUtils.hasToolItem((LivingEntity)mc.player)) {
            return false;
        }
        int amount = dWheel > 0.0 ? 1 : -1;
        ToolMode mode = DataManager.getToolMode();
        Entity entity = EntityUtils.getCameraEntity();
        if (Hotkeys.SELECTION_GRAB_MODIFIER.getKeybind().isKeybindHeld() && entity != null && mode.getUsesAreaSelection()) {
            SelectionManager sm = DataManager.getSelectionManager();
            if (sm.hasGrabbedElement()) {
                sm.changeGrabDistance(entity, amount);
                return true;
            }
            if (sm.hasSelectedOrigin()) {
                AreaSelection area = sm.getCurrentSelection();
                BlockPos old = area.getEffectiveOrigin();
                area.moveEntireSelectionTo(old.relative(fi.dy.masa.litematica.util.EntityUtils.getClosestLookingDirection(entity), amount), false);
                return true;
            }
            if (mode == ToolMode.MOVE) {
                SchematicUtils.moveCurrentlySelectedWorldRegionToLookingDirection(amount, entity, mc);
                return true;
            }
        }
        if (Hotkeys.SELECTION_GROW_MODIFIER.getKeybind().isKeybindHeld()) {
            return this.growOrShrinkSelection(amount, mode);
        }
        if (Hotkeys.SELECTION_NUDGE_MODIFIER.getKeybind().isKeybindHeld()) {
            return InputHandler.nudgeSelection(amount, mode, entity);
        }
        if (Hotkeys.OPERATION_MODE_CHANGE_MODIFIER.getKeybind().isKeybindHeld()) {
            boolean forward = amount < 0;
            boolean reverseOperationModeDirection = Configs.Generic.REVERSE_OP_MODE_DIRECTION.getBooleanValue();
            if (reverseOperationModeDirection) {
                forward = !forward;
            }
            DataManager.setToolMode(DataManager.getToolMode().cycle((Player)mc.player, forward));
            return true;
        }
        if (Hotkeys.SCHEMATIC_VERSION_CYCLE_MODIFIER.getKeybind().isKeybindHeld()) {
            if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
                DataManager.getSchematicProjectsManager().cycleVersion(amount * -1);
            }
            return true;
        }
        return false;
    }

    public static boolean nudgeSelection(int amount, ToolMode mode, Entity entity) {
        if (mode.getUsesAreaSelection()) {
            SelectionManager sm = DataManager.getSelectionManager();
            if (sm.hasSelectedElement()) {
                sm.moveSelectedElement(fi.dy.masa.litematica.util.EntityUtils.getClosestLookingDirection(entity), amount);
                return true;
            }
        } else if (mode.getUsesSchematic()) {
            Direction direction = fi.dy.masa.litematica.util.EntityUtils.getClosestLookingDirection(entity);
            DataManager.getSchematicPlacementManager().nudgePositionOfCurrentSelection(direction, amount);
            return true;
        }
        return false;
    }

    private boolean growOrShrinkSelection(int amount, ToolMode mode) {
        if (mode.getUsesAreaSelection()) {
            SelectionManager sm = DataManager.getSelectionManager();
            AreaSelection area = sm.getCurrentSelection();
            if (area != null) {
                Box box = area.getSelectedSubRegionBox();
                if (box != null) {
                    Box newBox = PositionUtils.growOrShrinkBox(box, amount);
                    area.setSelectedSubRegionCornerPos(newBox.getPos1(), PositionUtils.Corner.CORNER_1);
                    area.setSelectedSubRegionCornerPos(newBox.getPos2(), PositionUtils.Corner.CORNER_2);
                } else {
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.area_selection.grow.no_sub_region_selected", (Object[])new Object[0]);
                }
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_area_selected", (Object[])new Object[0]);
            }
        }
        return true;
    }

    private boolean handleAttackKey(Minecraft mc) {
        if (mc.player != null && DataManager.getToolMode() == ToolMode.REBUILD && KeybindMulti.getTriggeredCount() == 0) {
            if (Hotkeys.SCHEMATIC_EDIT_BREAK_DIRECTION.getKeybind().isKeybindHeld()) {
                return SchematicUtils.breakSchematicBlocks(mc);
            }
            if (Hotkeys.SCHEMATIC_EDIT_BREAK_ALL_EXCEPT.getKeybind().isKeybindHeld()) {
                return SchematicUtils.breakAllSchematicBlocksExceptTargeted(mc);
            }
            if (Hotkeys.SCHEMATIC_EDIT_BREAK_ALL.getKeybind().isKeybindHeld()) {
                return SchematicUtils.breakAllIdenticalSchematicBlocks(mc);
            }
            return SchematicUtils.breakSchematicBlock(mc);
        }
        return false;
    }

    private boolean handleUseKey(Minecraft mc) {
        if (mc.player != null) {
            if (DataManager.getToolMode() == ToolMode.REBUILD) {
                if (Hotkeys.SCHEMATIC_EDIT_REPLACE_DIRECTION.getKeybind().isKeybindHeld()) {
                    return SchematicUtils.replaceSchematicBlocksInDirection(mc);
                }
                if (Hotkeys.SCHEMATIC_EDIT_REPLACE_ALL.getKeybind().isKeybindHeld()) {
                    return SchematicUtils.replaceAllIdenticalSchematicBlocks(mc);
                }
                if (Hotkeys.SCHEMATIC_EDIT_REPLACE_BLOCK.getKeybind().isKeybindHeld()) {
                    return SchematicUtils.replaceBlocksKeepingProperties(mc);
                }
                if (Hotkeys.SCHEMATIC_EDIT_BREAK_DIRECTION.getKeybind().isKeybindHeld()) {
                    return SchematicUtils.placeSchematicBlocksInDirection(mc);
                }
                if (Hotkeys.SCHEMATIC_EDIT_BREAK_ALL.getKeybind().isKeybindHeld()) {
                    return SchematicUtils.fillAirWithBlocks(mc);
                }
                return SchematicUtils.placeSchematicBlock(mc);
            }
            if (Configs.Generic.PICK_BLOCK_ENABLED.getBooleanValue() && KeybindMulti.hotkeyMatchesKeybind((IHotkey)Hotkeys.PICK_BLOCK_LAST, (KeyMapping)mc.options.keyUse)) {
                WorldUtils.doSchematicWorldPickBlock(false, mc);
            }
            if (Configs.Generic.PLACEMENT_RESTRICTION.getBooleanValue()) {
                if (Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue()) {
                    return EasyPlaceUtils.handlePlacementRestriction();
                }
                return EasyPlaceUtils.handlePlacementRestriction(mc);
            }
        }
        return false;
    }
}

