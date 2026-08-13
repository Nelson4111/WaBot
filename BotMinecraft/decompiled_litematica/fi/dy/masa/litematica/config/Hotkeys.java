/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  fi.dy.masa.malilib.hotkeys.KeybindSettings
 */
package fi.dy.masa.litematica.config;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import fi.dy.masa.malilib.hotkeys.KeybindSettings;
import java.util.List;

public class Hotkeys {
    private static final String HOTKEYS_KEY = "litematica.config.hotkeys";
    public static final ConfigHotkey ADD_SELECTION_BOX = (ConfigHotkey)new ConfigHotkey("addSelectionBox", "M,A").apply("litematica.config.hotkeys");
    public static final ConfigHotkey CLONE_SELECTION = (ConfigHotkey)new ConfigHotkey("cloneSelection", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey DELETE_SELECTION_BOX = (ConfigHotkey)new ConfigHotkey("deleteSelectionBox", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey EASY_PLACE_ACTIVATION = (ConfigHotkey)new ConfigHotkey("easyPlaceUseKey", "BUTTON_2", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey EASY_PLACE_FIRST = (ConfigHotkey)new ConfigHotkey("easyPlaceFirst", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey EASY_PLACE_TOGGLE = (ConfigHotkey)new ConfigHotkey("easyPlaceToggle", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey EXECUTE_OPERATION = (ConfigHotkey)new ConfigHotkey("executeOperation", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey INVERT_GHOST_BLOCK_RENDER_STATE = (ConfigHotkey)new ConfigHotkey("invertGhostBlockRenderState", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey INVERT_OVERLAY_RENDER_STATE = (ConfigHotkey)new ConfigHotkey("invertOverlayRenderState", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey LAYER_MODE_NEXT = (ConfigHotkey)new ConfigHotkey("layerModeNext", "M,PAGE_UP").apply("litematica.config.hotkeys");
    public static final ConfigHotkey LAYER_MODE_PREVIOUS = (ConfigHotkey)new ConfigHotkey("layerModePrevious", "M,PAGE_DOWN").apply("litematica.config.hotkeys");
    public static final ConfigHotkey LAYER_NEXT = (ConfigHotkey)new ConfigHotkey("layerNext", "PAGE_UP").apply("litematica.config.hotkeys");
    public static final ConfigHotkey LAYER_PREVIOUS = (ConfigHotkey)new ConfigHotkey("layerPrevious", "PAGE_DOWN").apply("litematica.config.hotkeys");
    public static final ConfigHotkey LAYER_SET_HERE = (ConfigHotkey)new ConfigHotkey("layerSetHere", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey NUDGE_SELECTION_NEGATIVE = (ConfigHotkey)new ConfigHotkey("nudgeSelectionNegative", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey NUDGE_SELECTION_POSITIVE = (ConfigHotkey)new ConfigHotkey("nudgeSelectionPositive", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey MOVE_ENTIRE_SELECTION = (ConfigHotkey)new ConfigHotkey("moveEntireSelection", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_AREA_SETTINGS = (ConfigHotkey)new ConfigHotkey("openGuiAreaSettings", "KP_MULTIPLY").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_LOADED_SCHEMATICS = (ConfigHotkey)new ConfigHotkey("openGuiLoadedSchematics", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_MAIN_MENU = (ConfigHotkey)new ConfigHotkey("openGuiMainMenu", "M", KeybindSettings.RELEASE_EXCLUSIVE).apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_MATERIAL_LIST = (ConfigHotkey)new ConfigHotkey("openGuiMaterialList", "M,L").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_PLACEMENT_SETTINGS = (ConfigHotkey)new ConfigHotkey("openGuiPlacementSettings", "KP_SUBTRACT").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_SCHEMATIC_PLACEMENTS = (ConfigHotkey)new ConfigHotkey("openGuiSchematicPlacements", "M,P").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_SCHEMATIC_PROJECTS = (ConfigHotkey)new ConfigHotkey("openGuiSchematicProjects", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_SCHEMATIC_VERIFIER = (ConfigHotkey)new ConfigHotkey("openGuiSchematicVerifier", "M,V").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_SELECTION_MANAGER = (ConfigHotkey)new ConfigHotkey("openGuiSelectionManager", "M,S").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPEN_GUI_SETTINGS = (ConfigHotkey)new ConfigHotkey("openGuiSettings", "M,C").apply("litematica.config.hotkeys");
    public static final ConfigHotkey OPERATION_MODE_CHANGE_MODIFIER = (ConfigHotkey)new ConfigHotkey("operationModeChangeModifier", "LEFT_CONTROL", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey PICK_BLOCK_FIRST = (ConfigHotkey)new ConfigHotkey("pickBlockFirst", "BUTTON_3", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey PICK_BLOCK_LAST = (ConfigHotkey)new ConfigHotkey("pickBlockLast", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey PICK_BLOCK_TOGGLE = (ConfigHotkey)new ConfigHotkey("pickBlockToggle", "M,BUTTON_3").apply("litematica.config.hotkeys");
    public static final ConfigHotkey RENDER_INFO_OVERLAY = (ConfigHotkey)new ConfigHotkey("renderInfoOverlay", "I", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey RENDER_OVERLAY_THROUGH_BLOCKS = (ConfigHotkey)new ConfigHotkey("renderOverlayThroughBlocks", "RIGHT_CONTROL", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey RERENDER_SCHEMATIC = (ConfigHotkey)new ConfigHotkey("rerenderSchematic", "F3,M").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SAVE_AREA_AS_IN_MEMORY_SCHEMATIC = (ConfigHotkey)new ConfigHotkey("saveAreaAsInMemorySchematic", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SAVE_AREA_AS_SCHEMATIC_TO_FILE = (ConfigHotkey)new ConfigHotkey("saveAreaAsSchematicToFile", "LEFT_CONTROL,LEFT_ALT,S").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_BREAK_ALL_EXCEPT = (ConfigHotkey)new ConfigHotkey("schematicEditBreakAllExcept", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_BREAK_ALL = (ConfigHotkey)new ConfigHotkey("schematicEditBreakPlaceAll", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_BREAK_DIRECTION = (ConfigHotkey)new ConfigHotkey("schematicEditBreakPlaceDirection", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_REPLACE_ALL = (ConfigHotkey)new ConfigHotkey("schematicEditReplaceAll", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_REPLACE_BLOCK = (ConfigHotkey)new ConfigHotkey("schematicEditReplaceBlock", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_REPLACE_DIRECTION = (ConfigHotkey)new ConfigHotkey("schematicEditReplaceDirection", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_EDIT_REPLACE_SELECTION = (ConfigHotkey)new ConfigHotkey("schematicEditReplaceSelection", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_PLACEMENT_ROTATION = (ConfigHotkey)new ConfigHotkey("schematicPlacementRotation", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_PLACEMENT_MIRROR = (ConfigHotkey)new ConfigHotkey("schematicPlacementMirror", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_VCS_DELETE_BY_PLACEMENT = (ConfigHotkey)new ConfigHotkey("schematicVCSDeleteBlockByPlacement", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_VERSION_CYCLE_MODIFIER = (ConfigHotkey)new ConfigHotkey("schematicVersionCycleModifier", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_VERSION_CYCLE_NEXT = (ConfigHotkey)new ConfigHotkey("schematicVersionCycleNext", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SCHEMATIC_VERSION_CYCLE_PREVIOUS = (ConfigHotkey)new ConfigHotkey("schematicVersionCyclePrevious", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_GRAB_MODIFIER = (ConfigHotkey)new ConfigHotkey("selectionGrabModifier", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_GROW_HOTKEY = (ConfigHotkey)new ConfigHotkey("selectionGrow", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_GROW_MODIFIER = (ConfigHotkey)new ConfigHotkey("selectionGrowModifier", "", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_NUDGE_MODIFIER = (ConfigHotkey)new ConfigHotkey("selectionNudgeModifier", "LEFT_ALT", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_MODE_CYCLE = (ConfigHotkey)new ConfigHotkey("selectionModeCycle", "LEFT_CONTROL,M").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SELECTION_SHRINK_HOTKEY = (ConfigHotkey)new ConfigHotkey("selectionShrink", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SET_AREA_ORIGIN = (ConfigHotkey)new ConfigHotkey("setAreaOrigin", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SET_SELECTION_BOX_POSITION_1 = (ConfigHotkey)new ConfigHotkey("setSelectionBoxPosition1", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey SET_SELECTION_BOX_POSITION_2 = (ConfigHotkey)new ConfigHotkey("setSelectionBoxPosition2", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_ALL_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleAllRendering", "M,R").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_AREA_SELECTION_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleAreaSelectionBoxesRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_SCHEMATIC_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleSchematicRendering", "M,G").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_INFO_OVERLAY_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleInfoOverlayRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_OVERLAY_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleOverlayRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_OVERLAY_OUTLINE_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleOverlayOutlineRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_OVERLAY_SIDE_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleOverlaySideRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_PLACEMENT_BOXES_RENDERING = (ConfigHotkey)new ConfigHotkey("togglePlacementBoxesRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_PLACEMENT_RESTRICTION = (ConfigHotkey)new ConfigHotkey("togglePlacementRestriction", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_SCHEMATIC_BLOCK_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleSchematicBlockRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_SIGN_TEXT_PASTE = (ConfigHotkey)new ConfigHotkey("toggleSignTextPaste", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_TRANSLUCENT_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleTranslucentRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOGGLE_VERIFIER_OVERLAY_RENDERING = (ConfigHotkey)new ConfigHotkey("toggleVerifierOverlayRendering", "").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_ENABLED_TOGGLE = (ConfigHotkey)new ConfigHotkey("toolEnabledToggle", "M,T").apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_PLACE_CORNER_1 = (ConfigHotkey)new ConfigHotkey("toolPlaceCorner1", "BUTTON_1", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_PLACE_CORNER_2 = (ConfigHotkey)new ConfigHotkey("toolPlaceCorner2", "BUTTON_2", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_SELECT_ELEMENTS = (ConfigHotkey)new ConfigHotkey("toolSelectElements", "BUTTON_3", KeybindSettings.PRESS_ALLOWEXTRA).apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_SELECT_MODIFIER_BLOCK_1 = (ConfigHotkey)new ConfigHotkey("toolSelectModifierBlock1", "LEFT_ALT", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey TOOL_SELECT_MODIFIER_BLOCK_2 = (ConfigHotkey)new ConfigHotkey("toolSelectModifierBlock2", "LEFT_SHIFT", KeybindSettings.MODIFIER_INGAME).apply("litematica.config.hotkeys");
    public static final ConfigHotkey UNLOAD_CURRENT_SCHEMATIC = (ConfigHotkey)new ConfigHotkey("unloadCurrentSchematic", "").apply("litematica.config.hotkeys");
    public static final List<ConfigHotkey> HOTKEY_LIST = ImmutableList.of((Object)ADD_SELECTION_BOX, (Object)CLONE_SELECTION, (Object)DELETE_SELECTION_BOX, (Object)EASY_PLACE_ACTIVATION, (Object)EASY_PLACE_FIRST, (Object)EASY_PLACE_TOGGLE, (Object)EXECUTE_OPERATION, (Object)INVERT_GHOST_BLOCK_RENDER_STATE, (Object)INVERT_OVERLAY_RENDER_STATE, (Object)LAYER_MODE_NEXT, (Object)LAYER_MODE_PREVIOUS, (Object)LAYER_NEXT, (Object[])new ConfigHotkey[]{LAYER_PREVIOUS, LAYER_SET_HERE, NUDGE_SELECTION_NEGATIVE, NUDGE_SELECTION_POSITIVE, MOVE_ENTIRE_SELECTION, OPEN_GUI_AREA_SETTINGS, OPEN_GUI_LOADED_SCHEMATICS, OPEN_GUI_MAIN_MENU, OPEN_GUI_MATERIAL_LIST, OPEN_GUI_PLACEMENT_SETTINGS, OPEN_GUI_SCHEMATIC_PLACEMENTS, OPEN_GUI_SCHEMATIC_PROJECTS, OPEN_GUI_SCHEMATIC_VERIFIER, OPEN_GUI_SELECTION_MANAGER, OPEN_GUI_SETTINGS, OPERATION_MODE_CHANGE_MODIFIER, PICK_BLOCK_FIRST, PICK_BLOCK_LAST, PICK_BLOCK_TOGGLE, RENDER_INFO_OVERLAY, RENDER_OVERLAY_THROUGH_BLOCKS, RERENDER_SCHEMATIC, SAVE_AREA_AS_IN_MEMORY_SCHEMATIC, SAVE_AREA_AS_SCHEMATIC_TO_FILE, SCHEMATIC_EDIT_BREAK_ALL, SCHEMATIC_EDIT_BREAK_ALL_EXCEPT, SCHEMATIC_EDIT_BREAK_DIRECTION, SCHEMATIC_EDIT_REPLACE_ALL, SCHEMATIC_EDIT_REPLACE_BLOCK, SCHEMATIC_EDIT_REPLACE_DIRECTION, SCHEMATIC_EDIT_REPLACE_SELECTION, SCHEMATIC_PLACEMENT_ROTATION, SCHEMATIC_PLACEMENT_MIRROR, SCHEMATIC_VCS_DELETE_BY_PLACEMENT, SCHEMATIC_VERSION_CYCLE_MODIFIER, SCHEMATIC_VERSION_CYCLE_NEXT, SCHEMATIC_VERSION_CYCLE_PREVIOUS, SELECTION_GRAB_MODIFIER, SELECTION_GROW_HOTKEY, SELECTION_GROW_MODIFIER, SELECTION_NUDGE_MODIFIER, SELECTION_MODE_CYCLE, SELECTION_SHRINK_HOTKEY, SET_AREA_ORIGIN, SET_SELECTION_BOX_POSITION_1, SET_SELECTION_BOX_POSITION_2, TOGGLE_ALL_RENDERING, TOGGLE_AREA_SELECTION_RENDERING, TOGGLE_INFO_OVERLAY_RENDERING, TOGGLE_OVERLAY_RENDERING, TOGGLE_OVERLAY_OUTLINE_RENDERING, TOGGLE_OVERLAY_SIDE_RENDERING, TOGGLE_PLACEMENT_BOXES_RENDERING, TOGGLE_PLACEMENT_RESTRICTION, TOGGLE_SCHEMATIC_BLOCK_RENDERING, TOGGLE_SCHEMATIC_RENDERING, TOGGLE_SIGN_TEXT_PASTE, TOGGLE_TRANSLUCENT_RENDERING, TOGGLE_VERIFIER_OVERLAY_RENDERING, TOOL_ENABLED_TOGGLE, TOOL_PLACE_CORNER_1, TOOL_PLACE_CORNER_2, TOOL_SELECT_ELEMENTS, TOOL_SELECT_MODIFIER_BLOCK_1, TOOL_SELECT_MODIFIER_BLOCK_2, UNLOAD_CURRENT_SCHEMATIC});
}

