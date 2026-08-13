/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.gui.interfaces.IDirectoryCache
 *  fi.dy.masa.malilib.interfaces.IRangeChangeListener
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.network.chat.Component
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 */
package fi.dy.masa.litematica.data;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListHudRenderer;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.schematic.projects.SchematicProjectsManager;
import fi.dy.masa.litematica.schematic.transmit.SchematicBufferManager;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.selection.AreaSelectionSimple;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.tool.ToolModeData;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import fi.dy.masa.litematica.util.ToBooleanFunction;
import fi.dy.masa.malilib.gui.interfaces.IDirectoryCache;
import fi.dy.masa.malilib.interfaces.IRangeChangeListener;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.FileAttribute;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;

public class DataManager
implements IDirectoryCache {
    private static final DataManager INSTANCE = new DataManager();
    private static final Map<String, Path> LAST_DIRECTORIES = new HashMap<String, Path>();
    private static final ArrayList<ToBooleanFunction<Component>> CHAT_LISTENERS = new ArrayList();
    public static final Identifier CARPET_HELLO = Identifier.fromNamespaceAndPath((String)"carpet", (String)"hello");
    private static ItemStack toolItem;
    private ItemStack toolItemComponents = null;
    private static GuiConfigs.ConfigGuiTab configGuiTab;
    private static boolean createPlacementOnLoad;
    private static boolean canSave;
    private static boolean isCarpetServer;
    private static boolean hasServuxServer;
    private static long clientTickStart;
    private boolean hasIntegratedServer = false;
    private final SelectionManager selectionManager = new SelectionManager();
    private final SchematicPlacementManager schematicPlacementManager = new SchematicPlacementManager();
    private final SchematicProjectsManager schematicProjectsManager = new SchematicProjectsManager();
    private final SchematicBufferManager schematicBufferManager = new SchematicBufferManager();
    private LayerRange renderRange = new LayerRange((IRangeChangeListener)SchematicWorldRefresher.INSTANCE);
    private ToolMode operationMode = ToolMode.SCHEMATIC_PLACEMENT;
    private AreaSelectionSimple areaSimple = new AreaSelectionSimple(true);
    @Nullable
    private MaterialListBase materialList;

    private DataManager() {
    }

    public static DataManager getInstance() {
        return INSTANCE;
    }

    public void reset(boolean isLogout) {
        if (isLogout) {
            Litematica.debugLog("DataManager#reset() - log-out", new Object[0]);
            this.hasIntegratedServer = false;
            this.toolItemComponents = null;
        } else {
            Litematica.debugLog("DataManager#reset() - dimension change or log-in", new Object[0]);
        }
    }

    public static IDirectoryCache getDirectoryCache() {
        return INSTANCE;
    }

    public static void onClientTickStart() {
        clientTickStart = System.nanoTime();
    }

    public static long getClientTickStartTime() {
        return clientTickStart;
    }

    public void onWorldPre(@Nonnull RegistryAccess registryManager) {
        Litematica.debugLog("DataManager#onWorldPre()", new Object[0]);
        this.setToolItemComponents(Configs.Generic.TOOL_ITEM_COMPONENTS.getStringValue(), registryManager);
    }

    public static ItemStack getToolItem() {
        if (toolItem == null) {
            toolItem = new ItemStack((ItemLike)Items.STICK);
        }
        return toolItem;
    }

    public boolean hasToolItemComponents() {
        return this.toolItemComponents != null;
    }

    public ItemStack getToolItemComponents() {
        return this.toolItemComponents;
    }

    public static void setIsCarpetServer(boolean isCarpetServer) {
        DataManager.isCarpetServer = isCarpetServer;
    }

    public static boolean isCarpetServer() {
        return isCarpetServer;
    }

    public static void setHasServuxServer(boolean hasServuxServer) {
        DataManager.hasServuxServer = hasServuxServer;
    }

    public static boolean hasServuxServer() {
        return hasServuxServer;
    }

    public boolean hasIntegratedServer() {
        return this.hasIntegratedServer;
    }

    public void setHasIntegratedServer(boolean toggle) {
        this.hasIntegratedServer = toggle;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static void addChatListener(ToBooleanFunction<Component> listener) {
        ArrayList<ToBooleanFunction<Component>> arrayList = CHAT_LISTENERS;
        synchronized (arrayList) {
            CHAT_LISTENERS.add(listener);
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static void removeChatListener(ToBooleanFunction<Component> listener) {
        ArrayList<ToBooleanFunction<Component>> arrayList = CHAT_LISTENERS;
        synchronized (arrayList) {
            CHAT_LISTENERS.remove(listener);
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static void clearChatListeners() {
        ArrayList<ToBooleanFunction<Component>> arrayList = CHAT_LISTENERS;
        synchronized (arrayList) {
            CHAT_LISTENERS.clear();
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static boolean onChatMessage(Component text) {
        ArrayList<ToBooleanFunction<Component>> arrayList = CHAT_LISTENERS;
        synchronized (arrayList) {
            boolean cancel = false;
            for (ToBooleanFunction<Component> listener : CHAT_LISTENERS) {
                cancel |= listener.applyAsBoolean(text);
            }
            return cancel;
        }
    }

    public static boolean getCreatePlacementOnLoad() {
        return createPlacementOnLoad;
    }

    public static void setCreatePlacementOnLoad(boolean create) {
        createPlacementOnLoad = create;
    }

    public static GuiConfigs.ConfigGuiTab getConfigGuiTab() {
        return configGuiTab;
    }

    public static void setConfigGuiTab(GuiConfigs.ConfigGuiTab tab) {
        configGuiTab = tab;
    }

    public static SelectionManager getSelectionManager() {
        return DataManager.getInstance().selectionManager;
    }

    public static SchematicPlacementManager getSchematicPlacementManager() {
        return DataManager.getInstance().schematicPlacementManager;
    }

    public static SchematicProjectsManager getSchematicProjectsManager() {
        return DataManager.getInstance().schematicProjectsManager;
    }

    public static SchematicBufferManager getSchematicBufferManager() {
        return DataManager.getInstance().schematicBufferManager;
    }

    @Nullable
    public static MaterialListBase getMaterialList() {
        return DataManager.getInstance().materialList;
    }

    public static void setMaterialList(@Nullable MaterialListBase materialList) {
        MaterialListHudRenderer renderer;
        MaterialListBase old = DataManager.getInstance().materialList;
        if (old != null && (renderer = old.getHudRenderer()).getShouldRenderCustom()) {
            renderer.toggleShouldRender();
            InfoHud.getInstance().removeInfoHudRenderer(renderer, false);
        }
        DataManager.getInstance().materialList = materialList;
    }

    public static ToolMode getToolMode() {
        return DataManager.getInstance().operationMode;
    }

    public static void setToolMode(ToolMode mode) {
        DataManager.getInstance().operationMode = mode;
    }

    public static LayerRange getRenderLayerRange() {
        return DataManager.getInstance().renderRange;
    }

    public static AreaSelectionSimple getSimpleArea() {
        return DataManager.getInstance().areaSimple;
    }

    @Nullable
    public Path getCurrentDirectoryForContext(String context) {
        return LAST_DIRECTORIES.get(context);
    }

    public void setCurrentDirectoryForContext(String context, Path dir) {
        LAST_DIRECTORIES.put(context, dir);
    }

    public static void load() {
        DataManager.getInstance().loadPerDimensionData();
        Path file = DataManager.getCurrentStorageFile(true);
        JsonElement element = JsonUtils.parseJsonFile((Path)file);
        if (element != null && element.isJsonObject()) {
            LAST_DIRECTORIES.clear();
            JsonObject root = element.getAsJsonObject();
            if (JsonUtils.hasObject((JsonObject)root, (String)"last_directories")) {
                JsonObject obj = root.get("last_directories").getAsJsonObject();
                for (Map.Entry entry : obj.entrySet()) {
                    Path dir;
                    String name = (String)entry.getKey();
                    JsonElement el = (JsonElement)entry.getValue();
                    if (!el.isJsonPrimitive() || !Files.exists(dir = Path.of((String)el.getAsString(), (String[])new String[0]), new LinkOption[0]) || !Files.isDirectory(dir, new LinkOption[0])) continue;
                    LAST_DIRECTORIES.put(name, dir);
                }
            }
            if (JsonUtils.hasString((JsonObject)root, (String)"config_gui_tab")) {
                try {
                    configGuiTab = GuiConfigs.ConfigGuiTab.valueOf(root.get("config_gui_tab").getAsString());
                }
                catch (Exception exception) {
                    // empty catch block
                }
                if (configGuiTab == null) {
                    configGuiTab = GuiConfigs.ConfigGuiTab.GENERIC;
                }
            }
            createPlacementOnLoad = JsonUtils.getBooleanOrDefault((JsonObject)root, (String)"create_placement_on_load", (boolean)true);
        }
        canSave = true;
    }

    public static void save() {
        DataManager.save(false);
    }

    public static void save(boolean forceSave) {
        if (!canSave && !forceSave) {
            return;
        }
        DataManager.getInstance().savePerDimensionData();
        JsonObject root = new JsonObject();
        JsonObject objDirs = new JsonObject();
        for (Map.Entry<String, Path> entry : LAST_DIRECTORIES.entrySet()) {
            objDirs.add(entry.getKey(), (JsonElement)new JsonPrimitive(entry.getValue().toAbsolutePath().toString()));
        }
        root.add("last_directories", (JsonElement)objDirs);
        root.add("create_placement_on_load", (JsonElement)new JsonPrimitive(Boolean.valueOf(createPlacementOnLoad)));
        root.add("config_gui_tab", (JsonElement)new JsonPrimitive(configGuiTab.name()));
        Path file = DataManager.getCurrentStorageFile(true);
        JsonUtils.writeJsonToFile((JsonElement)root, (Path)file);
        canSave = false;
    }

    public static void clear() {
        TaskScheduler.getInstanceClient().clearTasks();
        SchematicVerifier.clearActiveVerifiers();
        DataManager.getSchematicPlacementManager().clear();
        DataManager.getSchematicProjectsManager().clear();
        DataManager.getSelectionManager().clear();
        DataManager.setMaterialList(null);
        DataManager.clearChatListeners();
        InfoHud.getInstance().reset();
        DataManager.setIsCarpetServer(false);
        DataManager.setHasServuxServer(false);
    }

    private void savePerDimensionData() {
        this.schematicProjectsManager.saveCurrentProject();
        JsonObject root = this.toJson();
        root.add("block_entities", (JsonElement)EntityDataManager.getInstance().toJson());
        Path file = DataManager.getCurrentStorageFile(false);
        JsonUtils.writeJsonToFile((JsonElement)root, (Path)file);
    }

    private void loadPerDimensionData() {
        this.selectionManager.clear();
        this.schematicPlacementManager.clear();
        this.schematicProjectsManager.clear();
        this.materialList = null;
        Path file = DataManager.getCurrentStorageFile(false);
        JsonElement element = JsonUtils.parseJsonFile((Path)file);
        if (element != null && element.isJsonObject()) {
            JsonObject root = element.getAsJsonObject();
            this.fromJson(root);
            if (JsonUtils.hasObject((JsonObject)root, (String)"block_entities")) {
                EntityDataManager.getInstance().fromJson(JsonUtils.getNestedObject((JsonObject)root, (String)"block_entities", (boolean)false));
            }
        }
    }

    private void fromJson(JsonObject obj) {
        if (JsonUtils.hasObject((JsonObject)obj, (String)"selections")) {
            this.selectionManager.loadFromJson(obj.get("selections").getAsJsonObject());
        }
        if (JsonUtils.hasObject((JsonObject)obj, (String)"placements")) {
            this.schematicPlacementManager.loadFromJson(obj.get("placements").getAsJsonObject());
        }
        if (JsonUtils.hasObject((JsonObject)obj, (String)"schematic_projects_manager")) {
            this.schematicProjectsManager.loadFromJson(obj.get("schematic_projects_manager").getAsJsonObject());
        }
        if (JsonUtils.hasObject((JsonObject)obj, (String)"render_range")) {
            this.renderRange = LayerRange.createFromJson((JsonObject)JsonUtils.getNestedObject((JsonObject)obj, (String)"render_range", (boolean)false), (IRangeChangeListener)SchematicWorldRefresher.INSTANCE);
        }
        if (JsonUtils.hasString((JsonObject)obj, (String)"operation_mode")) {
            try {
                this.operationMode = ToolMode.valueOf(obj.get("operation_mode").getAsString());
            }
            catch (Exception exception) {
                // empty catch block
            }
            if (this.operationMode == null) {
                this.operationMode = ToolMode.AREA_SELECTION;
            }
        }
        if (JsonUtils.hasObject((JsonObject)obj, (String)"area_simple")) {
            this.areaSimple = AreaSelectionSimple.fromJson(obj.get("area_simple").getAsJsonObject());
        }
        if (JsonUtils.hasObject((JsonObject)obj, (String)"tool_mode_data")) {
            this.toolModeDataFromJson(obj.get("tool_mode_data").getAsJsonObject());
        }
    }

    private JsonObject toJson() {
        JsonObject obj = new JsonObject();
        obj.add("selections", (JsonElement)this.selectionManager.toJson());
        obj.add("placements", (JsonElement)this.schematicPlacementManager.toJson());
        obj.add("schematic_projects_manager", (JsonElement)this.schematicProjectsManager.toJson());
        obj.add("operation_mode", (JsonElement)new JsonPrimitive(this.operationMode.name()));
        obj.add("render_range", (JsonElement)this.renderRange.toJson());
        obj.add("area_simple", (JsonElement)this.areaSimple.toJson());
        obj.add("tool_mode_data", (JsonElement)this.toolModeDataToJson());
        return obj;
    }

    private JsonObject toolModeDataToJson() {
        JsonObject obj = new JsonObject();
        obj.add("delete", (JsonElement)ToolModeData.DELETE.toJson());
        return obj;
    }

    private void toolModeDataFromJson(JsonObject obj) {
        if (JsonUtils.hasObject((JsonObject)obj, (String)"delete")) {
            ToolModeData.DELETE.fromJson(obj.get("delete").getAsJsonObject());
        }
    }

    public static Path getDefaultBaseSchematicDirectory() {
        return FileUtils.getRealPathIfPossible((Path)FileUtils.getMinecraftDirectory().resolve("schematics"));
    }

    public static Path getCurrentConfigDirectory() {
        return FileUtils.getConfigDirectory().resolve("litematica");
    }

    public static Path getSchematicsBaseDirectory() {
        Path dir = Configs.Generic.CUSTOM_SCHEMATIC_BASE_DIRECTORY_ENABLED.getBooleanValue() ? Path.of((String)Configs.Generic.CUSTOM_SCHEMATIC_BASE_DIRECTORY.getStringValue(), (String[])new String[0]) : DataManager.getDefaultBaseSchematicDirectory();
        if (!Files.exists(dir, new LinkOption[0]) || !Files.isDirectory(dir, new LinkOption[0])) {
            try {
                if (Files.exists(dir, new LinkOption[0])) {
                    Files.delete(dir);
                }
                Files.createDirectory(dir, new FileAttribute[0]);
                Litematica.LOGGER.warn("getSchematicsBaseDirectory(): Created schematic directory '{}'", (Object)dir.toAbsolutePath().toString());
            }
            catch (Exception err) {
                Litematica.LOGGER.error("Failed to create the schematic directory '{}'; {}", (Object)dir.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            }
        }
        if (!Files.isDirectory(dir, new LinkOption[0])) {
            Litematica.LOGGER.error("Failed to create the schematic directory '{}'", (Object)dir.toAbsolutePath().toString());
        }
        if (!Files.isWritable(dir)) {
            Litematica.LOGGER.error("Schematic directory '{}'; is not writeable.", (Object)dir.toAbsolutePath().toString());
        }
        return dir;
    }

    public static Path getSchematicTransmitDirectory() {
        Path dir = DataManager.getSchematicsBaseDirectory().resolve("transmit");
        if (!Files.exists(dir, new LinkOption[0]) || !Files.isDirectory(dir, new LinkOption[0])) {
            try {
                if (Files.exists(dir, new LinkOption[0])) {
                    Files.delete(dir);
                }
                Files.createDirectory(dir, new FileAttribute[0]);
                Litematica.LOGGER.warn("getSchematicTransmitDirectory(): Created schematic transmit directory '{}'", (Object)dir.toAbsolutePath().toString());
            }
            catch (Exception err) {
                Litematica.LOGGER.error("Failed to create the schematic transmit directory '{}'; {}", (Object)dir.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            }
        }
        if (!Files.isDirectory(dir, new LinkOption[0])) {
            Litematica.LOGGER.error("Failed to create the schematic transmit directory '{}'", (Object)dir.toAbsolutePath().toString());
        }
        if (!Files.isWritable(dir)) {
            Litematica.LOGGER.error("Schematic transmit directory '{}'; is not writeable.", (Object)dir.toAbsolutePath().toString());
        }
        return dir;
    }

    public static Path getAreaSelectionsBaseDirectory() {
        String name = StringUtils.getWorldOrServerName();
        Path dir = Configs.Generic.AREAS_PER_WORLD.getBooleanValue() && name != null ? FileUtils.getRealPathIfPossible((Path)DataManager.getCurrentConfigDirectory().resolve("area_selections_per_world").resolve(name).resolve("area_selections")) : FileUtils.getRealPathIfPossible((Path)DataManager.getCurrentConfigDirectory().resolve("area_selections"));
        if (!Files.exists(dir, new LinkOption[0])) {
            FileUtils.createDirectoriesIfMissing((Path)dir);
        }
        if (!Files.isDirectory(dir, new LinkOption[0])) {
            Litematica.LOGGER.warn("Failed to create the area selections base directory '{}'", (Object)dir.toAbsolutePath());
        }
        return dir;
    }

    private static Path getCurrentStorageFile(boolean globalData) {
        Path dir = DataManager.getCurrentConfigDirectory();
        if (!Files.exists(dir, new LinkOption[0])) {
            FileUtils.createDirectoriesIfMissing((Path)dir);
        }
        if (!Files.isDirectory(dir, new LinkOption[0])) {
            Litematica.LOGGER.warn("Failed to create the config directory '{}'", (Object)dir.toAbsolutePath());
        }
        return dir.resolve(StringUtils.getStorageFileName((boolean)globalData, (String)"litematica_", (String)".json", (String)"default"));
    }

    public static void setToolItem(String itemNameIn) {
        toolItem = InventoryUtils.getItemStackFromString((String)itemNameIn);
        if (toolItem == null) {
            toolItem = new ItemStack((ItemLike)Items.STICK);
            Configs.Generic.TOOL_ITEM.setValueFromString(BuiltInRegistries.ITEM.getKey((Object)Items.STICK).toString());
        }
    }

    public void setToolItemComponents(String toolItemString, @Nonnull RegistryAccess registryManager) {
        this.toolItemComponents = registryManager.equals((Object)RegistryAccess.EMPTY) || toolItemString.isEmpty() || toolItemString.equals("empty") ? null : InventoryUtils.getItemStackFromString((String)toolItemString, (RegistryAccess)registryManager);
        if (this.toolItemComponents == null) {
            Configs.Generic.TOOL_ITEM_COMPONENTS.setValueFromString("empty");
        }
    }

    static {
        configGuiTab = GuiConfigs.ConfigGuiTab.GENERIC;
        createPlacementOnLoad = true;
    }
}

