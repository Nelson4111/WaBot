/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  fi.dy.masa.malilib.config.ConfigUtils
 *  fi.dy.masa.malilib.config.HudAlignment
 *  fi.dy.masa.malilib.config.IConfigBase
 *  fi.dy.masa.malilib.config.IConfigHandler
 *  fi.dy.masa.malilib.config.IConfigOptionListEntry
 *  fi.dy.masa.malilib.config.options.ConfigBoolean
 *  fi.dy.masa.malilib.config.options.ConfigBooleanHotkeyed
 *  fi.dy.masa.malilib.config.options.ConfigColor
 *  fi.dy.masa.malilib.config.options.ConfigDouble
 *  fi.dy.masa.malilib.config.options.ConfigFloat
 *  fi.dy.masa.malilib.config.options.ConfigInteger
 *  fi.dy.masa.malilib.config.options.ConfigOptionList
 *  fi.dy.masa.malilib.config.options.ConfigString
 *  fi.dy.masa.malilib.config.options.ConfigStringList
 *  fi.dy.masa.malilib.hotkeys.IHotkey
 *  fi.dy.masa.malilib.registry.Registry
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.MessageOutputType
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.i18n.i18nConfig
 *  fi.dy.masa.malilib.util.i18n.i18nManager
 *  fi.dy.masa.malilib.util.i18n.i18nMode
 *  fi.dy.masa.malilib.util.i18n.i18nOption
 *  net.minecraft.client.Minecraft
 */
package fi.dy.masa.litematica.config;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.LitematicaDebugHud;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.selection.CornerSelectionMode;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.util.BlockInfoAlignment;
import fi.dy.masa.litematica.util.DataFixerMode;
import fi.dy.masa.litematica.util.DebugHudMode;
import fi.dy.masa.litematica.util.EasyPlaceProtocol;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.PasteLayerBehavior;
import fi.dy.masa.litematica.util.PasteNbtBehavior;
import fi.dy.masa.litematica.util.PlacementDeletionMode;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.malilib.config.ConfigUtils;
import fi.dy.masa.malilib.config.HudAlignment;
import fi.dy.masa.malilib.config.IConfigBase;
import fi.dy.masa.malilib.config.IConfigHandler;
import fi.dy.masa.malilib.config.IConfigOptionListEntry;
import fi.dy.masa.malilib.config.options.ConfigBoolean;
import fi.dy.masa.malilib.config.options.ConfigBooleanHotkeyed;
import fi.dy.masa.malilib.config.options.ConfigColor;
import fi.dy.masa.malilib.config.options.ConfigDouble;
import fi.dy.masa.malilib.config.options.ConfigFloat;
import fi.dy.masa.malilib.config.options.ConfigInteger;
import fi.dy.masa.malilib.config.options.ConfigOptionList;
import fi.dy.masa.malilib.config.options.ConfigString;
import fi.dy.masa.malilib.config.options.ConfigStringList;
import fi.dy.masa.malilib.hotkeys.IHotkey;
import fi.dy.masa.malilib.registry.Registry;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.MessageOutputType;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.i18n.i18nConfig;
import fi.dy.masa.malilib.util.i18n.i18nManager;
import fi.dy.masa.malilib.util.i18n.i18nMode;
import fi.dy.masa.malilib.util.i18n.i18nOption;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import net.minecraft.client.Minecraft;

public class Configs
implements IConfigHandler {
    private static final String CONFIG_FILE_NAME = "litematica.json";
    public static final Optional<i18nManager> LANG = Optional.ofNullable(i18nManager.create((String)"litematica"));
    private static final String GENERIC_KEY = "litematica.config.generic";
    private static final String VISUALS_KEY = "litematica.config.visuals";
    private static final String INFO_OVERLAYS_KEY = "litematica.config.info_overlays";
    private static final String COLORS_KEY = "litematica.config.colors";

    public static void loadFromFile() {
        Path configFile = FileUtils.getConfigDirectory().resolve(CONFIG_FILE_NAME);
        if (Files.exists(configFile, new LinkOption[0]) && Files.isReadable(configFile)) {
            JsonElement element = JsonUtils.parseJsonFile((Path)configFile);
            if (element != null && element.isJsonObject()) {
                JsonObject root = element.getAsJsonObject();
                ConfigUtils.readConfigBase((JsonObject)root, (String)"Colors", Colors.OPTIONS);
                ConfigUtils.readConfigBase((JsonObject)root, (String)"Generic", Generic.OPTIONS);
                ConfigUtils.readConfigBase((JsonObject)root, (String)"Hotkeys", Hotkeys.HOTKEY_LIST);
                ConfigUtils.readConfigBase((JsonObject)root, (String)"InfoOverlays", InfoOverlays.OPTIONS);
                ConfigUtils.readConfigBase((JsonObject)root, (String)"Visuals", Visuals.OPTIONS);
                Litematica.debugLog("loadFromFile(): Successfully loaded config file '{}'.", configFile.toAbsolutePath());
            } else {
                Litematica.LOGGER.error("loadFromFile(): Failed to load config file '{}'.", (Object)configFile.toAbsolutePath());
            }
        }
        Configs.checkBaseLanguage();
        if (Minecraft.getInstance().level != null) {
            PlacementManagerDaemonHandler.INSTANCE.checkThreadCount(true);
            DataManager.setToolItem(Generic.TOOL_ITEM.getStringValue());
            DataManager.getInstance().setToolItemComponents(Generic.TOOL_ITEM_COMPONENTS.getStringValue(), Minecraft.getInstance().level.registryAccess());
        }
        InventoryUtils.setPickBlockableSlots(Generic.PICK_BLOCKABLE_SLOTS.getStringValue());
        DataManager.getSelectionManager().checkSelectionModeConfig();
        LitematicaDebugHud.INSTANCE.checkConfig();
    }

    public static void saveToFile() {
        Path dir = FileUtils.getConfigDirectory();
        if (!Files.exists(dir, new LinkOption[0])) {
            FileUtils.createDirectoriesIfMissing((Path)dir);
            Litematica.debugLog("saveToFile(): Creating directory '{}'.", dir.toAbsolutePath());
        }
        if (Files.isDirectory(dir, new LinkOption[0])) {
            JsonObject root = new JsonObject();
            ConfigUtils.writeConfigBase((JsonObject)root, (String)"Colors", Colors.OPTIONS);
            ConfigUtils.writeConfigBase((JsonObject)root, (String)"Generic", Generic.OPTIONS);
            ConfigUtils.writeConfigBase((JsonObject)root, (String)"Hotkeys", Hotkeys.HOTKEY_LIST);
            ConfigUtils.writeConfigBase((JsonObject)root, (String)"InfoOverlays", InfoOverlays.OPTIONS);
            ConfigUtils.writeConfigBase((JsonObject)root, (String)"Visuals", Visuals.OPTIONS);
            JsonUtils.writeJsonToFile((JsonElement)root, (Path)dir.resolve(CONFIG_FILE_NAME));
        } else {
            Litematica.LOGGER.error("saveToFile(): Config Folder '{}' does not exist!", (Object)dir.toAbsolutePath());
        }
    }

    public void load() {
        Configs.loadFromFile();
    }

    public void save() {
        Configs.saveToFile();
    }

    public void onLanguageChanged(String newLang) {
        Configs.checkBaseLanguage();
    }

    public static void checkBaseLanguage() {
        i18nMode mode = (i18nMode)Generic.TRANSLATION_MODE.getOptionListValue();
        if (mode == i18nMode.FOLLOW_MALILIB) {
            LANG.ifPresent(i18nManager2 -> {
                String baseKey = Registry.TRANSLATION_OVERRIDE_MANAGER.getBaseLanguageCode();
                if (!i18nManager2.getLang().getLangCode().equalsIgnoreCase(baseKey)) {
                    List list = i18nManager2.getLanguageOptions();
                    boolean found = false;
                    for (i18nOption entry : list) {
                        if (!entry.getKey().equalsIgnoreCase(baseKey)) continue;
                        i18nManager2.setLang(baseKey);
                        i18nConfig newConfig = new i18nConfig(i18nManager2).fromString(baseKey);
                        Generic.TRANSLATION_LANGUAGE.setOptionListValue((IConfigOptionListEntry)newConfig);
                        found = true;
                        break;
                    }
                    if (!found) {
                        i18nManager2.resetLangToDefault();
                        Generic.TRANSLATION_LANGUAGE.resetToDefault();
                    }
                }
            });
        } else if (mode == i18nMode.FOLLOW_VANILLA) {
            LANG.ifPresent(i18nManager2 -> {
                String vanCode = Registry.TRANSLATION_OVERRIDE_MANAGER.getVanillaLanguageCode();
                if (!i18nManager2.getLang().getLangCode().equalsIgnoreCase(vanCode)) {
                    List list = i18nManager2.getLanguageOptions();
                    boolean found = false;
                    for (i18nOption entry : list) {
                        if (!entry.getKey().equalsIgnoreCase(vanCode)) continue;
                        i18nManager2.setLang(vanCode);
                        i18nConfig newConfig = new i18nConfig(i18nManager2).fromString(vanCode);
                        Generic.TRANSLATION_LANGUAGE.setOptionListValue((IConfigOptionListEntry)newConfig);
                        found = true;
                        break;
                    }
                    if (!found) {
                        i18nManager2.resetLangToDefault();
                        Generic.TRANSLATION_LANGUAGE.resetToDefault();
                    }
                }
            });
        }
    }

    public static class Colors {
        public static final ConfigColor AREA_SELECTION_BOX_SIDE_COLOR = new ConfigColor("areaSelectionBoxSideColor", "#30FFFFFF").apply("litematica.config.colors");
        public static final ConfigColor HIGHTLIGHT_BLOCK_IN_INV_COLOR = new ConfigColor("hightlightBlockInInventoryColor", "#30FF30FF").apply("litematica.config.colors");
        public static final ConfigColor MATERIAL_LIST_HUD_ITEM_COUNTS = new ConfigColor("materialListHudItemCountsColor", "#FFFFAA00").apply("litematica.config.colors");
        public static final ConfigColor REBUILD_BREAK_OVERLAY_COLOR = new ConfigColor("schematicRebuildBreakPlaceOverlayColor", "#4C33CC33").apply("litematica.config.colors");
        public static final ConfigColor REBUILD_BREAK_EXCEPT_OVERLAY_COLOR = new ConfigColor("schematicRebuildBreakExceptPlaceOverlayColor", "#4CF03030").apply("litematica.config.colors");
        public static final ConfigColor REBUILD_REPLACE_OVERLAY_COLOR = new ConfigColor("schematicRebuildReplaceOverlayColor", "#4CF0A010").apply("litematica.config.colors");
        public static final ConfigColor SCHEMATIC_OVERLAY_COLOR_DIFF_BLOCK = new ConfigColor("schematicOverlayColorDiffBlock", "#30F8D650").apply("litematica.config.colors");
        public static final ConfigColor SCHEMATIC_OVERLAY_COLOR_EXTRA = new ConfigColor("schematicOverlayColorExtra", "#4CFF4CE6").apply("litematica.config.colors");
        public static final ConfigColor SCHEMATIC_OVERLAY_COLOR_MISSING = new ConfigColor("schematicOverlayColorMissing", "#2C33B3E6").apply("litematica.config.colors");
        public static final ConfigColor SCHEMATIC_OVERLAY_COLOR_WRONG_BLOCK = new ConfigColor("schematicOverlayColorWrongBlock", "#4CFF3333").apply("litematica.config.colors");
        public static final ConfigColor SCHEMATIC_OVERLAY_COLOR_WRONG_STATE = new ConfigColor("schematicOverlayColorWrongState", "#4CFF9010").apply("litematica.config.colors");
        public static final ImmutableList<IConfigBase> OPTIONS = ImmutableList.of((Object)AREA_SELECTION_BOX_SIDE_COLOR, (Object)HIGHTLIGHT_BLOCK_IN_INV_COLOR, (Object)MATERIAL_LIST_HUD_ITEM_COUNTS, (Object)REBUILD_BREAK_OVERLAY_COLOR, (Object)REBUILD_BREAK_EXCEPT_OVERLAY_COLOR, (Object)REBUILD_REPLACE_OVERLAY_COLOR, (Object)SCHEMATIC_OVERLAY_COLOR_DIFF_BLOCK, (Object)SCHEMATIC_OVERLAY_COLOR_EXTRA, (Object)SCHEMATIC_OVERLAY_COLOR_MISSING, (Object)SCHEMATIC_OVERLAY_COLOR_WRONG_BLOCK, (Object)SCHEMATIC_OVERLAY_COLOR_WRONG_STATE);
    }

    public static class Generic {
        public static final ConfigOptionList DEBUG_HUD_MODE = (ConfigOptionList)new ConfigOptionList("debugHudMode", (IConfigOptionListEntry)DebugHudMode.DEFAULT).apply("litematica.config.generic");
        public static final ConfigOptionList EASY_PLACE_PROTOCOL = (ConfigOptionList)new ConfigOptionList("easyPlaceProtocolVersion", (IConfigOptionListEntry)EasyPlaceProtocol.AUTO).apply("litematica.config.generic");
        public static final ConfigOptionList PASTE_NBT_BEHAVIOR = (ConfigOptionList)new ConfigOptionList("pasteNbtRestoreBehavior", (IConfigOptionListEntry)PasteNbtBehavior.NONE).apply("litematica.config.generic");
        public static final ConfigOptionList PASTE_REPLACE_BEHAVIOR = (ConfigOptionList)new ConfigOptionList("pasteReplaceBehavior", (IConfigOptionListEntry)ReplaceBehavior.NONE).apply("litematica.config.generic");
        public static final ConfigOptionList PASTE_LAYER_BEHAVIOR = (ConfigOptionList)new ConfigOptionList("pasteLayerBehavior", (IConfigOptionListEntry)PasteLayerBehavior.ALL).apply("litematica.config.generic");
        public static final ConfigOptionList PLACEMENT_REPLACE_BEHAVIOR = (ConfigOptionList)new ConfigOptionList("placementReplaceBehavior", (IConfigOptionListEntry)ReplaceBehavior.ALL).apply("litematica.config.generic");
        public static final ConfigOptionList PLACEMENT_RESTRICTION_WARN = (ConfigOptionList)new ConfigOptionList("placementRestrictionWarn", (IConfigOptionListEntry)MessageOutputType.ACTIONBAR).apply("litematica.config.generic");
        public static final ConfigOptionList SCHEMATIC_VCS_DELETE_MODE = (ConfigOptionList)new ConfigOptionList("schematicVcsDeleteMode", (IConfigOptionListEntry)PlacementDeletionMode.MATCHING_BLOCK).apply("litematica.config.generic");
        public static final ConfigOptionList SELECTION_CORNERS_MODE = (ConfigOptionList)new ConfigOptionList("selectionCornersMode", (IConfigOptionListEntry)CornerSelectionMode.CORNERS).apply("litematica.config.generic");
        public static final ConfigBoolean CUSTOM_SCHEMATIC_BASE_DIRECTORY_ENABLED = (ConfigBoolean)new ConfigBoolean("customSchematicBaseDirectoryEnabled", false).apply("litematica.config.generic");
        public static final ConfigString CUSTOM_SCHEMATIC_BASE_DIRECTORY = (ConfigString)new ConfigString("customSchematicBaseDirectory", DataManager.getDefaultBaseSchematicDirectory().toAbsolutePath().toString()).apply("litematica.config.generic");
        public static final ConfigBoolean AREAS_PER_WORLD = (ConfigBoolean)new ConfigBoolean("areaSelectionsPerWorld", true).apply("litematica.config.generic");
        public static final ConfigBoolean CHANGE_SELECTED_CORNER = (ConfigBoolean)new ConfigBoolean("changeSelectedCornerOnMove", true).apply("litematica.config.generic");
        public static final ConfigBoolean CLONE_AT_ORIGINAL_POS = (ConfigBoolean)new ConfigBoolean("cloneAtOriginalPosition", false).apply("litematica.config.generic");
        public static final ConfigBoolean COMMAND_DISABLE_FEEDBACK = (ConfigBoolean)new ConfigBoolean("commandDisableFeedback", true).apply("litematica.config.generic");
        public static final ConfigInteger COMMAND_FILL_MAX_VOLUME = (ConfigInteger)new ConfigInteger("commandFillMaxVolume", 32768, 256, 10000000).apply("litematica.config.generic");
        public static final ConfigBoolean COMMAND_FILL_NO_CHUNK_CLAMP = (ConfigBoolean)new ConfigBoolean("commandFillNoChunkClamp", false).apply("litematica.config.generic");
        public static final ConfigInteger COMMAND_LIMIT = (ConfigInteger)new ConfigInteger("commandLimitPerTick", 8, 1, 256).apply("litematica.config.generic");
        public static final ConfigString COMMAND_NAME_CLONE = (ConfigString)new ConfigString("commandNameClone", "clone").apply("litematica.config.generic");
        public static final ConfigString COMMAND_NAME_FILL = (ConfigString)new ConfigString("commandNameFill", "fill").apply("litematica.config.generic");
        public static final ConfigString COMMAND_NAME_SETBLOCK = (ConfigString)new ConfigString("commandNameSetblock", "setblock").apply("litematica.config.generic");
        public static final ConfigString COMMAND_NAME_SUMMON = (ConfigString)new ConfigString("commandNameSummon", "summon").apply("litematica.config.generic");
        public static final ConfigInteger COMMAND_TASK_INTERVAL = (ConfigInteger)new ConfigInteger("commandTaskInterval", 1, 1, 1000).apply("litematica.config.generic");
        public static final ConfigBoolean COMMAND_USE_WORLDEDIT = (ConfigBoolean)new ConfigBoolean("commandUseWorldEdit", false).apply("litematica.config.generic");
        public static final ConfigBoolean COMMAND_USE_STRICT = (ConfigBoolean)new ConfigBoolean("commandUseStrict", true).apply("litematica.config.generic");
        public static final ConfigBoolean DEBUG_HUD_PM_THREADS = (ConfigBoolean)new ConfigBoolean("debugHudPMThreads", false).apply("litematica.config.generic");
        public static final ConfigBoolean DEBUG_HUD_WORLD = (ConfigBoolean)new ConfigBoolean("debugHudWorld", true).apply("litematica.config.generic");
        public static final ConfigBoolean DEBUG_LOGGING = (ConfigBoolean)new ConfigBoolean("debugLogging", false).apply("litematica.config.generic");
        public static final ConfigBoolean DEDUPLICATE_SCHEMATIC_ENTITIES = (ConfigBoolean)new ConfigBoolean("deduplicateSchematicEntities", false).apply("litematica.config.generic");
        public static final ConfigOptionList DATAFIXER_MODE = (ConfigOptionList)new ConfigOptionList("datafixerMode", (IConfigOptionListEntry)DataFixerMode.ALWAYS).apply("litematica.config.generic");
        public static final ConfigInteger DATAFIXER_DEFAULT_SCHEMA = (ConfigInteger)new ConfigInteger("datafixerDefaultSchema", 1139, 99, 2724, true).apply("litematica.config.generic");
        public static final ConfigBoolean DISPLAY_FILE_OPS_FEEDBACK = (ConfigBoolean)new ConfigBoolean("displayFileOpsFeedback", false).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_CLICK_ADJACENT = (ConfigBoolean)new ConfigBoolean("easyPlaceClickAdjacent", false).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_FIRST = (ConfigBoolean)new ConfigBoolean("easyPlaceFirst", true).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_HOLD_ENABLED = (ConfigBoolean)new ConfigBoolean("easyPlaceHoldEnabled", true).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_MODE = (ConfigBoolean)new ConfigBoolean("easyPlaceMode", false).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_POST_REWRITE = (ConfigBoolean)new ConfigBoolean("easyPlacePostRewrite", false).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_SP_HANDLING = (ConfigBoolean)new ConfigBoolean("easyPlaceSinglePlayerHandling", true).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_SP_VALIDATION = (ConfigBoolean)new ConfigBoolean("easyPlaceSinglePlayerValidation", true).apply("litematica.config.generic");
        public static final ConfigInteger EASY_PLACE_SWAP_INTERVAL = (ConfigInteger)new ConfigInteger("easyPlaceSwapInterval", 0, 0, 10000).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_SWING_HAND = (ConfigBoolean)new ConfigBoolean("easyPlaceSwingHand", true).apply("litematica.config.generic");
        public static final ConfigBoolean EASY_PLACE_VANILLA_REACH = (ConfigBoolean)new ConfigBoolean("easyPlaceVanillaReach", false).apply("litematica.config.generic");
        public static final ConfigBoolean ENABLE_DIFFERENT_BLOCKS = (ConfigBoolean)new ConfigBoolean("enableDifferentBlocks", false).apply("litematica.config.generic");
        public static final ConfigBooleanHotkeyed ENTITY_DATA_SYNC = new ConfigBooleanHotkeyed("entityDataSync", false, "").apply("litematica.config.generic");
        public static final ConfigBoolean ENTITY_DATA_SYNC_BACKUP = (ConfigBoolean)new ConfigBoolean("entityDataSyncBackup", false).apply("litematica.config.generic");
        public static final ConfigFloat ENTITY_DATA_SYNC_CACHE_TIMEOUT = (ConfigFloat)new ConfigFloat("entityDataSyncCacheTimeout", 2.75f, 1.0f, 100.0f).apply("litematica.config.generic");
        public static final ConfigBoolean EXECUTE_REQUIRE_TOOL = (ConfigBoolean)new ConfigBoolean("executeRequireHoldingTool", true).apply("litematica.config.generic");
        public static final ConfigBoolean FIX_CHEST_MIRROR = (ConfigBoolean)new ConfigBoolean("fixChestMirror", true).apply("litematica.config.generic");
        public static final ConfigBoolean FIX_RAIL_ROTATION = (ConfigBoolean)new ConfigBoolean("fixRailRotation", true).apply("litematica.config.generic");
        public static final ConfigBoolean FIX_STAIRS_MIRROR = (ConfigBoolean)new ConfigBoolean("fixStairsMirror", true).apply("litematica.config.generic");
        public static final ConfigBoolean GENERATE_LOWERCASE_NAMES = (ConfigBoolean)new ConfigBoolean("generateLowercaseNames", false).apply("litematica.config.generic");
        public static final ConfigBoolean HIGHLIGHT_BLOCK_IN_INV = (ConfigBoolean)new ConfigBoolean("highlightBlockInInventory", false).apply("litematica.config.generic");
        public static final ConfigBoolean ITEM_USE_PACKET_CHECK_BYPASS = (ConfigBoolean)new ConfigBoolean("itemUsePacketCheckBypass", true).apply("litematica.config.generic");
        public static final ConfigBoolean LAYER_MODE_DYNAMIC = (ConfigBoolean)new ConfigBoolean("layerModeFollowsPlayer", false).apply("litematica.config.generic");
        public static final ConfigBoolean LOAD_ENTIRE_SCHEMATICS = (ConfigBoolean)new ConfigBoolean("loadEntireSchematics", false).apply("litematica.config.generic");
        public static final ConfigBoolean MATERIAL_LIST_CONTAINER_SCAN = (ConfigBoolean)new ConfigBoolean("materialListContainerScan", false).apply("litematica.config.generic");
        public static final ConfigBoolean MATERIAL_LIST_CONTAINER_SCAN_SHULKERS = (ConfigBoolean)new ConfigBoolean("materialListContainerScanShulkers", false).apply("litematica.config.generic");
        public static final ConfigBoolean MATERIAL_LIST_CONTAINER_SCAN_BUNDLES = (ConfigBoolean)new ConfigBoolean("materialListContainerScanBundles", false).apply("litematica.config.generic");
        public static final ConfigBoolean MATERIAL_LIST_IGNORE_STATE = (ConfigBoolean)new ConfigBoolean("materialListIgnoreState", false).apply("litematica.config.generic");
        public static final ConfigBoolean MATERIAL_LIST_RECIPE_DETAILS = (ConfigBoolean)new ConfigBoolean("materialListRecipeDetails", true).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_ALWAYS_USE_FILL = (ConfigBoolean)new ConfigBoolean("pasteAlwaysUseFill", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_IGNORE_BE_ENTIRELY = (ConfigBoolean)new ConfigBoolean("pasteIgnoreBlockEntitiesEntirely", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_IGNORE_BE_IN_FILL = (ConfigBoolean)new ConfigBoolean("pasteIgnoreBlockEntitiesFromFill", true).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_IGNORE_CMD_LIMIT = (ConfigBoolean)new ConfigBoolean("pasteIgnoreCommandLimitWithNbtRestore", true).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_IGNORE_ENTITIES = (ConfigBoolean)new ConfigBoolean("pasteIgnoreEntities", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_IGNORE_INVENTORY = (ConfigBoolean)new ConfigBoolean("pasteIgnoreInventories", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_TO_MCFUNCTION = (ConfigBoolean)new ConfigBoolean("pasteToMcFunctionFiles", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_USE_FILL_COMMAND = (ConfigBoolean)new ConfigBoolean("pasteUseFillCommand", true).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_USING_COMMANDS_IN_SP = (ConfigBoolean)new ConfigBoolean("pasteUsingCommandsInSp", false).apply("litematica.config.generic");
        public static final ConfigBoolean PASTE_USING_SERVUX = (ConfigBoolean)new ConfigBoolean("pasteUsingServux", true).apply("litematica.config.generic");
        public static final ConfigBoolean PICK_BLOCK_AVOID_DAMAGEABLE = (ConfigBoolean)new ConfigBoolean("pickBlockAvoidDamageable", true).apply("litematica.config.generic");
        public static final ConfigBoolean PICK_BLOCK_AVOID_TOOLS = (ConfigBoolean)new ConfigBoolean("pickBlockAvoidTools", false).apply("litematica.config.generic");
        public static final ConfigBoolean PICK_BLOCK_ENABLED = (ConfigBoolean)new ConfigBoolean("pickBlockEnabled", true).apply("litematica.config.generic");
        public static final ConfigBoolean PICK_BLOCK_SHULKERS = (ConfigBoolean)new ConfigBoolean("pickBlockShulkers", false).apply("litematica.config.generic");
        public static final ConfigString PICK_BLOCKABLE_SLOTS = (ConfigString)new ConfigString("pickBlockableSlots", "1,2,3,4,5").apply("litematica.config.generic");
        public static final ConfigBoolean PLACEMENT_RESTRICTION = (ConfigBoolean)new ConfigBoolean("placementRestriction", false).apply("litematica.config.generic");
        public static final ConfigInteger PLACEMENT_MANAGER_THREAD_COUNT = (ConfigInteger)new ConfigInteger("placementManagerThreadCount", 2, 2, MathUtils.max((int)PlacementManagerDaemonHandler.MAX_PLATFORM_THREADS, (int)2)).apply("litematica.config.generic");
        public static final ConfigBoolean RENDER_MATERIALS_IN_GUI = (ConfigBoolean)new ConfigBoolean("renderMaterialListInGuis", true).apply("litematica.config.generic");
        public static final ConfigBoolean RENDER_THREAD_NO_TIMEOUT = (ConfigBoolean)new ConfigBoolean("renderThreadNoTimeout", true).apply("litematica.config.generic");
        public static final ConfigBoolean REVERSE_OP_MODE_DIRECTION = (ConfigBoolean)new ConfigBoolean("reverseOperationModeDirection", false).apply("litematica.config.generic");
        public static final ConfigInteger SERVER_NBT_REQUEST_RATE = (ConfigInteger)new ConfigInteger("serverNbtRequestRate", 2).apply("litematica.config.generic");
        public static final ConfigBoolean SIGN_TEXT_PASTE = (ConfigBoolean)new ConfigBoolean("signTextPaste", true).apply("litematica.config.generic");
        public static final ConfigString TOOL_ITEM = (ConfigString)new ConfigString("toolItem", "minecraft:stick").apply("litematica.config.generic");
        public static final ConfigBoolean TOOL_ITEM_ENABLED = (ConfigBoolean)new ConfigBoolean("toolItemEnabled", true).apply("litematica.config.generic");
        public static final ConfigString TOOL_ITEM_COMPONENTS = (ConfigString)new ConfigString("toolItemComponents", "empty").apply("litematica.config.generic");
        public static final ConfigOptionList TRANSLATION_LANGUAGE = (ConfigOptionList)new ConfigOptionList("translationLanguage", (IConfigOptionListEntry)new i18nConfig((i18nManager)LANG.orElseThrow())).apply("litematica.config.generic");
        public static final ConfigOptionList TRANSLATION_MODE = (ConfigOptionList)new ConfigOptionList("translationMode", (IConfigOptionListEntry)i18nMode.FOLLOW_VANILLA).apply("litematica.config.generic");
        public static final ConfigBoolean UNHIDE_SCHEMATIC_PROJECTS = (ConfigBoolean)new ConfigBoolean("unhideSchematicVCS", false).apply("litematica.config.generic");
        public static final ImmutableList<IConfigBase> OPTIONS = ImmutableList.of((Object)PLACEMENT_MANAGER_THREAD_COUNT, (Object)AREAS_PER_WORLD, (Object)CHANGE_SELECTED_CORNER, (Object)CLONE_AT_ORIGINAL_POS, (Object)COMMAND_DISABLE_FEEDBACK, (Object)COMMAND_FILL_NO_CHUNK_CLAMP, (Object)COMMAND_USE_WORLDEDIT, (Object)COMMAND_USE_STRICT, (Object)CUSTOM_SCHEMATIC_BASE_DIRECTORY_ENABLED, (Object)DEBUG_HUD_MODE, (Object)DEBUG_HUD_WORLD, (Object)DEBUG_HUD_PM_THREADS, (Object[])new IConfigBase[]{DEBUG_LOGGING, DISPLAY_FILE_OPS_FEEDBACK, DATAFIXER_MODE, DATAFIXER_DEFAULT_SCHEMA, DEDUPLICATE_SCHEMATIC_ENTITIES, EASY_PLACE_CLICK_ADJACENT, EASY_PLACE_FIRST, EASY_PLACE_HOLD_ENABLED, EASY_PLACE_MODE, EASY_PLACE_POST_REWRITE, EASY_PLACE_SP_HANDLING, EASY_PLACE_SP_VALIDATION, EASY_PLACE_PROTOCOL, EASY_PLACE_SWING_HAND, EASY_PLACE_VANILLA_REACH, ENABLE_DIFFERENT_BLOCKS, ENTITY_DATA_SYNC, ENTITY_DATA_SYNC_BACKUP, ENTITY_DATA_SYNC_CACHE_TIMEOUT, EXECUTE_REQUIRE_TOOL, FIX_CHEST_MIRROR, FIX_RAIL_ROTATION, FIX_STAIRS_MIRROR, GENERATE_LOWERCASE_NAMES, HIGHLIGHT_BLOCK_IN_INV, ITEM_USE_PACKET_CHECK_BYPASS, LAYER_MODE_DYNAMIC, MATERIAL_LIST_CONTAINER_SCAN, MATERIAL_LIST_CONTAINER_SCAN_SHULKERS, MATERIAL_LIST_CONTAINER_SCAN_BUNDLES, MATERIAL_LIST_IGNORE_STATE, MATERIAL_LIST_RECIPE_DETAILS, PASTE_ALWAYS_USE_FILL, PASTE_IGNORE_BE_ENTIRELY, PASTE_IGNORE_BE_IN_FILL, PASTE_IGNORE_CMD_LIMIT, PASTE_IGNORE_ENTITIES, PASTE_IGNORE_INVENTORY, PASTE_NBT_BEHAVIOR, PASTE_TO_MCFUNCTION, PASTE_USE_FILL_COMMAND, PASTE_USING_COMMANDS_IN_SP, PASTE_USING_SERVUX, PICK_BLOCK_AVOID_DAMAGEABLE, PICK_BLOCK_AVOID_TOOLS, PICK_BLOCK_ENABLED, PICK_BLOCK_SHULKERS, PLACEMENT_REPLACE_BEHAVIOR, PLACEMENT_RESTRICTION, PLACEMENT_RESTRICTION_WARN, REVERSE_OP_MODE_DIRECTION, RENDER_MATERIALS_IN_GUI, RENDER_THREAD_NO_TIMEOUT, SERVER_NBT_REQUEST_RATE, SIGN_TEXT_PASTE, TOOL_ITEM_ENABLED, UNHIDE_SCHEMATIC_PROJECTS, PASTE_REPLACE_BEHAVIOR, PASTE_LAYER_BEHAVIOR, SCHEMATIC_VCS_DELETE_MODE, SELECTION_CORNERS_MODE, COMMAND_FILL_MAX_VOLUME, COMMAND_LIMIT, COMMAND_NAME_CLONE, COMMAND_NAME_FILL, COMMAND_NAME_SETBLOCK, COMMAND_NAME_SUMMON, COMMAND_TASK_INTERVAL, CUSTOM_SCHEMATIC_BASE_DIRECTORY, EASY_PLACE_SWAP_INTERVAL, PICK_BLOCKABLE_SLOTS, TOOL_ITEM, TOOL_ITEM_COMPONENTS, TRANSLATION_LANGUAGE, TRANSLATION_MODE});
        public static final List<IHotkey> HOTKEY_LIST = ImmutableList.of((Object)ENTITY_DATA_SYNC);
    }

    public static class InfoOverlays {
        public static final ConfigOptionList BLOCK_INFO_LINES_ALIGNMENT = (ConfigOptionList)new ConfigOptionList("blockInfoLinesAlignment", (IConfigOptionListEntry)HudAlignment.TOP_RIGHT).apply("litematica.config.info_overlays");
        public static final ConfigOptionList BLOCK_INFO_OVERLAY_ALIGNMENT = (ConfigOptionList)new ConfigOptionList("blockInfoOverlayAlignment", (IConfigOptionListEntry)BlockInfoAlignment.TOP_CENTER).apply("litematica.config.info_overlays");
        public static final ConfigOptionList DEFAULT_SELECTION_MODE = (ConfigOptionList)new ConfigOptionList("defaultSelectionMode", (IConfigOptionListEntry)SelectionMode.SIMPLE).apply("litematica.config.info_overlays");
        public static final ConfigOptionList INFO_HUD_ALIGNMENT = (ConfigOptionList)new ConfigOptionList("infoHudAlignment", (IConfigOptionListEntry)HudAlignment.BOTTOM_RIGHT).apply("litematica.config.info_overlays");
        public static final ConfigOptionList TOOL_HUD_ALIGNMENT = (ConfigOptionList)new ConfigOptionList("toolHudAlignment", (IConfigOptionListEntry)HudAlignment.BOTTOM_LEFT).apply("litematica.config.info_overlays");
        public static final ConfigBoolean BLOCK_INFO_LINES_ENABLED = (ConfigBoolean)new ConfigBoolean("blockInfoLinesEnabled", true).apply("litematica.config.info_overlays");
        public static final ConfigDouble BLOCK_INFO_LINES_FONT_SCALE = (ConfigDouble)new ConfigDouble("blockInfoLinesFontScale", 0.5, 0.0, 10.0).apply("litematica.config.info_overlays");
        public static final ConfigInteger BLOCK_INFO_LINES_OFFSET_X = (ConfigInteger)new ConfigInteger("blockInfoLinesOffsetX", 4, 0, 2000).apply("litematica.config.info_overlays");
        public static final ConfigInteger BLOCK_INFO_LINES_OFFSET_Y = (ConfigInteger)new ConfigInteger("blockInfoLinesOffsetY", 4, 0, 2000).apply("litematica.config.info_overlays");
        public static final ConfigInteger BLOCK_INFO_OVERLAY_OFFSET_Y = (ConfigInteger)new ConfigInteger("blockInfoOverlayOffsetY", 6, -2000, 2000).apply("litematica.config.info_overlays");
        public static final ConfigBoolean BLOCK_INFO_OVERLAY_ENABLED = (ConfigBoolean)new ConfigBoolean("blockInfoOverlayEnabled", true).apply("litematica.config.info_overlays");
        public static final ConfigInteger INFO_HUD_MAX_LINES = (ConfigInteger)new ConfigInteger("infoHudMaxLines", 10, 1, 128).apply("litematica.config.info_overlays");
        public static final ConfigInteger INFO_HUD_OFFSET_X = (ConfigInteger)new ConfigInteger("infoHudOffsetX", 1, 0, 32000).apply("litematica.config.info_overlays");
        public static final ConfigInteger INFO_HUD_OFFSET_Y = (ConfigInteger)new ConfigInteger("infoHudOffsetY", 1, 0, 32000).apply("litematica.config.info_overlays");
        public static final ConfigDouble INFO_HUD_SCALE = (ConfigDouble)new ConfigDouble("infoHudScale", 1.0, 0.1, 4.0).apply("litematica.config.info_overlays");
        public static final ConfigBoolean INFO_OVERLAYS_TARGET_FLUIDS = (ConfigBoolean)new ConfigBoolean("infoOverlaysTargetFluids", false).apply("litematica.config.info_overlays");
        public static final ConfigInteger MATERIAL_LIST_HUD_MAX_LINES = (ConfigInteger)new ConfigInteger("materialListHudMaxLines", 10, 1, 128).apply("litematica.config.info_overlays");
        public static final ConfigDouble MATERIAL_LIST_HUD_SCALE = (ConfigDouble)new ConfigDouble("materialListHudScale", 1.0, 0.1, 4.0).apply("litematica.config.info_overlays");
        public static final ConfigBoolean STATUS_INFO_HUD = (ConfigBoolean)new ConfigBoolean("statusInfoHud", false).apply("litematica.config.info_overlays");
        public static final ConfigBoolean STATUS_INFO_HUD_AUTO = (ConfigBoolean)new ConfigBoolean("statusInfoHudAuto", true).apply("litematica.config.info_overlays");
        public static final ConfigInteger TOOL_HUD_OFFSET_X = (ConfigInteger)new ConfigInteger("toolHudOffsetX", 1, 0, 32000).apply("litematica.config.info_overlays");
        public static final ConfigInteger TOOL_HUD_OFFSET_Y = (ConfigInteger)new ConfigInteger("toolHudOffsetY", 1, 0, 32000).apply("litematica.config.info_overlays");
        public static final ConfigDouble TOOL_HUD_SCALE = (ConfigDouble)new ConfigDouble("toolHudScale", 1.0, 0.1, 4.0).apply("litematica.config.info_overlays");
        public static final ConfigDouble VERIFIER_ERROR_HILIGHT_ALPHA = (ConfigDouble)new ConfigDouble("verifierErrorHilightAlpha", 0.2, 0.0, 1.0).apply("litematica.config.info_overlays");
        public static final ConfigInteger VERIFIER_ERROR_HILIGHT_MAX_POSITIONS = (ConfigInteger)new ConfigInteger("verifierErrorHilightMaxPositions", 1000, 1, 1000000).apply("litematica.config.info_overlays");
        public static final ConfigBoolean VERIFIER_OVERLAY_ENABLED = (ConfigBoolean)new ConfigBoolean("verifierOverlayEnabled", true).apply("litematica.config.info_overlays");
        public static final ConfigBoolean WARN_DISABLED_RENDERING = (ConfigBoolean)new ConfigBoolean("warnDisabledRendering", true).apply("litematica.config.info_overlays");
        public static final ImmutableList<IConfigBase> OPTIONS = ImmutableList.of((Object)DEFAULT_SELECTION_MODE, (Object)BLOCK_INFO_LINES_ENABLED, (Object)BLOCK_INFO_OVERLAY_ENABLED, (Object)INFO_OVERLAYS_TARGET_FLUIDS, (Object)STATUS_INFO_HUD, (Object)STATUS_INFO_HUD_AUTO, (Object)VERIFIER_OVERLAY_ENABLED, (Object)WARN_DISABLED_RENDERING, (Object)BLOCK_INFO_LINES_ALIGNMENT, (Object)BLOCK_INFO_OVERLAY_ALIGNMENT, (Object)INFO_HUD_ALIGNMENT, (Object)TOOL_HUD_ALIGNMENT, (Object[])new IConfigBase[]{BLOCK_INFO_LINES_OFFSET_X, BLOCK_INFO_LINES_OFFSET_Y, BLOCK_INFO_LINES_FONT_SCALE, BLOCK_INFO_OVERLAY_OFFSET_Y, INFO_HUD_MAX_LINES, INFO_HUD_OFFSET_X, INFO_HUD_OFFSET_Y, INFO_HUD_SCALE, MATERIAL_LIST_HUD_MAX_LINES, MATERIAL_LIST_HUD_SCALE, TOOL_HUD_OFFSET_X, TOOL_HUD_OFFSET_Y, TOOL_HUD_SCALE, VERIFIER_ERROR_HILIGHT_ALPHA, VERIFIER_ERROR_HILIGHT_MAX_POSITIONS});
    }

    public static class Visuals {
        public static final ConfigBooleanHotkeyed ENABLE_AREA_SELECTION_RENDERING = new ConfigBooleanHotkeyed("enableAreaSelectionBoxesRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_PLACEMENT_BOXES_RENDERING = new ConfigBooleanHotkeyed("enablePlacementBoxesRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_RENDERING = new ConfigBooleanHotkeyed("enableRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_BLOCKS = new ConfigBooleanHotkeyed("enableSchematicBlocksRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_FLUIDS = new ConfigBooleanHotkeyed("enableSchematicFluidRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_OVERLAY = new ConfigBooleanHotkeyed("enableSchematicOverlay", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_OVERLAY_CULLING = new ConfigBooleanHotkeyed("enableSchematicOverlayCulling", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_RENDERING = new ConfigBooleanHotkeyed("enableSchematicRendering", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_ENTITY_HITBOXES = new ConfigBooleanHotkeyed("enableSchematicEntityHitboxes", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed ENABLE_SCHEMATIC_FAKE_LIGHTING = new ConfigBooleanHotkeyed("enableSchematicFakeLighting", true, "").apply("litematica.config.visuals");
        public static final ConfigDouble GHOST_BLOCK_ALPHA = (ConfigDouble)new ConfigDouble("ghostBlockAlpha", 0.5, 0.0, 1.0).apply("litematica.config.visuals");
        public static final ConfigBoolean IGNORE_EXISTING_FLUIDS = (ConfigBoolean)new ConfigBoolean("ignoreExistingFluids", false).apply("litematica.config.visuals");
        public static final ConfigBoolean IGNORE_EXISTING_BLOCKS = (ConfigBoolean)new ConfigBoolean("ignoreExistingBlocks", false).apply("litematica.config.visuals");
        public static final ConfigStringList IGNORABLE_EXISTING_BLOCKS = (ConfigStringList)new ConfigStringList("ignorableExistingBlocks", ImmutableList.of()).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed OVERLAY_REDUCED_INNER_SIDES = new ConfigBooleanHotkeyed("overlayReducedInnerSides", false, "").apply("litematica.config.visuals");
        public static final ConfigDouble PLACEMENT_BOX_SIDE_ALPHA = (ConfigDouble)new ConfigDouble("placementBoxSideAlpha", 0.2, 0.0, 1.0).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_AO_MODERN_ENABLE = new ConfigBooleanHotkeyed("renderAOModernEnable", false, "").apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_AREA_SELECTION_BOX_SIDES = (ConfigBoolean)new ConfigBoolean("renderAreaSelectionBoxSides", true).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_BLOCKS_AS_TRANSLUCENT = new ConfigBooleanHotkeyed("renderBlocksAsTranslucent", false, "").apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_ENABLE_TRANSLUCENT_RESORTING = (ConfigBoolean)new ConfigBoolean("renderEnableTranslucentResorting", true).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_COLLIDING_SCHEMATIC_BLOCKS = new ConfigBooleanHotkeyed("renderCollidingSchematicBlocks", false, "").apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_ERROR_MARKER_CONNECTIONS = (ConfigBoolean)new ConfigBoolean("renderErrorMarkerConnections", false).apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_ERROR_MARKER_SIDES = (ConfigBoolean)new ConfigBoolean("renderErrorMarkerSides", true).apply("litematica.config.visuals");
        public static final ConfigInteger RENDER_FAKE_LIGHTING_LEVEL = (ConfigInteger)new ConfigInteger("renderFakeLightingLevel", 15, 0, 15).apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_PLACEMENT_BOX_SIDES = (ConfigBoolean)new ConfigBoolean("renderPlacementBoxSides", false).apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_PLACEMENT_ENCLOSING_BOX = (ConfigBoolean)new ConfigBoolean("renderPlacementEnclosingBox", true).apply("litematica.config.visuals");
        public static final ConfigBoolean RENDER_PLACEMENT_ENCLOSING_BOX_SIDES = (ConfigBoolean)new ConfigBoolean("renderPlacementEnclosingBoxSides", false).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_SCHEMATIC_ENTITIES = new ConfigBooleanHotkeyed("renderSchematicEntities", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_SCHEMATIC_TILE_ENTITIES = new ConfigBooleanHotkeyed("renderSchematicTileEntities", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed RENDER_TRANSLUCENT_INNER_SIDES = new ConfigBooleanHotkeyed("renderTranslucentBlockInnerSides", false, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_ENABLE_OUTLINES = new ConfigBooleanHotkeyed("schematicOverlayEnableOutlines", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_ENABLE_SIDES = new ConfigBooleanHotkeyed("schematicOverlayEnableSides", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_MODEL_OUTLINE = new ConfigBooleanHotkeyed("schematicOverlayModelOutline", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_MODEL_SIDES = new ConfigBooleanHotkeyed("schematicOverlayModelSides", true, "").apply("litematica.config.visuals");
        public static final ConfigDouble SCHEMATIC_OVERLAY_OUTLINE_WIDTH = (ConfigDouble)new ConfigDouble("schematicOverlayOutlineWidth", 1.0, 0.0, 64.0).apply("litematica.config.visuals");
        public static final ConfigDouble SCHEMATIC_OVERLAY_OUTLINE_WIDTH_THROUGH = (ConfigDouble)new ConfigDouble("schematicOverlayOutlineWidthThrough", 3.0, 0.0, 64.0).apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_RENDER_THROUGH = new ConfigBooleanHotkeyed("schematicOverlayRenderThroughBlocks", false, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_TYPE_DIFF_BLOCK = new ConfigBooleanHotkeyed("schematicOverlayTypeDiffBlock", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_TYPE_EXTRA = new ConfigBooleanHotkeyed("schematicOverlayTypeExtra", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_TYPE_MISSING = new ConfigBooleanHotkeyed("schematicOverlayTypeMissing", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_TYPE_WRONG_BLOCK = new ConfigBooleanHotkeyed("schematicOverlayTypeWrongBlock", true, "").apply("litematica.config.visuals");
        public static final ConfigBooleanHotkeyed SCHEMATIC_OVERLAY_TYPE_WRONG_STATE = new ConfigBooleanHotkeyed("schematicOverlayTypeWrongState", true, "").apply("litematica.config.visuals");
        public static final ImmutableList<IConfigBase> OPTIONS = ImmutableList.of((Object)ENABLE_RENDERING, (Object)ENABLE_SCHEMATIC_RENDERING, (Object)ENABLE_AREA_SELECTION_RENDERING, (Object)ENABLE_PLACEMENT_BOXES_RENDERING, (Object)ENABLE_SCHEMATIC_BLOCKS, (Object)ENABLE_SCHEMATIC_FLUIDS, (Object)ENABLE_SCHEMATIC_ENTITY_HITBOXES, (Object)ENABLE_SCHEMATIC_FAKE_LIGHTING, (Object)ENABLE_SCHEMATIC_OVERLAY, (Object)ENABLE_SCHEMATIC_OVERLAY_CULLING, (Object)IGNORE_EXISTING_FLUIDS, (Object)IGNORE_EXISTING_BLOCKS, (Object[])new IConfigBase[]{IGNORABLE_EXISTING_BLOCKS, OVERLAY_REDUCED_INNER_SIDES, RENDER_AO_MODERN_ENABLE, RENDER_AREA_SELECTION_BOX_SIDES, RENDER_BLOCKS_AS_TRANSLUCENT, RENDER_ENABLE_TRANSLUCENT_RESORTING, RENDER_COLLIDING_SCHEMATIC_BLOCKS, RENDER_ERROR_MARKER_CONNECTIONS, RENDER_ERROR_MARKER_SIDES, RENDER_FAKE_LIGHTING_LEVEL, RENDER_PLACEMENT_BOX_SIDES, RENDER_PLACEMENT_ENCLOSING_BOX, RENDER_PLACEMENT_ENCLOSING_BOX_SIDES, RENDER_SCHEMATIC_ENTITIES, RENDER_SCHEMATIC_TILE_ENTITIES, RENDER_TRANSLUCENT_INNER_SIDES, SCHEMATIC_OVERLAY_ENABLE_OUTLINES, SCHEMATIC_OVERLAY_ENABLE_SIDES, SCHEMATIC_OVERLAY_MODEL_OUTLINE, SCHEMATIC_OVERLAY_MODEL_SIDES, SCHEMATIC_OVERLAY_RENDER_THROUGH, SCHEMATIC_OVERLAY_TYPE_DIFF_BLOCK, SCHEMATIC_OVERLAY_TYPE_EXTRA, SCHEMATIC_OVERLAY_TYPE_MISSING, SCHEMATIC_OVERLAY_TYPE_WRONG_BLOCK, SCHEMATIC_OVERLAY_TYPE_WRONG_STATE, GHOST_BLOCK_ALPHA, PLACEMENT_BOX_SIDE_ALPHA, SCHEMATIC_OVERLAY_OUTLINE_WIDTH, SCHEMATIC_OVERLAY_OUTLINE_WIDTH_THROUGH});
        public static final List<IHotkey> HOTKEY_LIST = ImmutableList.of((Object)ENABLE_RENDERING, (Object)ENABLE_SCHEMATIC_RENDERING, (Object)ENABLE_AREA_SELECTION_RENDERING, (Object)ENABLE_PLACEMENT_BOXES_RENDERING, (Object)ENABLE_SCHEMATIC_BLOCKS, (Object)ENABLE_SCHEMATIC_FLUIDS, (Object)ENABLE_SCHEMATIC_ENTITY_HITBOXES, (Object)ENABLE_SCHEMATIC_FAKE_LIGHTING, (Object)ENABLE_SCHEMATIC_OVERLAY, (Object)ENABLE_SCHEMATIC_OVERLAY_CULLING, (Object)OVERLAY_REDUCED_INNER_SIDES, (Object)RENDER_AO_MODERN_ENABLE, (Object[])new IHotkey[]{RENDER_BLOCKS_AS_TRANSLUCENT, RENDER_COLLIDING_SCHEMATIC_BLOCKS, RENDER_SCHEMATIC_ENTITIES, RENDER_SCHEMATIC_TILE_ENTITIES, RENDER_TRANSLUCENT_INNER_SIDES, SCHEMATIC_OVERLAY_ENABLE_OUTLINES, SCHEMATIC_OVERLAY_ENABLE_SIDES, SCHEMATIC_OVERLAY_MODEL_OUTLINE, SCHEMATIC_OVERLAY_MODEL_SIDES, SCHEMATIC_OVERLAY_RENDER_THROUGH, SCHEMATIC_OVERLAY_TYPE_DIFF_BLOCK, SCHEMATIC_OVERLAY_TYPE_EXTRA, SCHEMATIC_OVERLAY_TYPE_MISSING, SCHEMATIC_OVERLAY_TYPE_WRONG_BLOCK, SCHEMATIC_OVERLAY_TYPE_WRONG_STATE});
    }
}

