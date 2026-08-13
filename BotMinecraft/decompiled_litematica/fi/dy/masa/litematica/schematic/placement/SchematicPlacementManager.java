/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.common.collect.ImmutableMap
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiConfirmAction
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.IConfirmationListener
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.LayerMode
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.components.ChatComponent
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.HitResult
 *  net.minecraft.world.phys.HitResult$Type
 */
package fi.dy.masa.litematica.schematic.placement;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.data.SchematicHolder;
import fi.dy.masa.litematica.network.ServuxLitematicaHandler;
import fi.dy.masa.litematica.network.ServuxLitematicaPacket;
import fi.dy.masa.litematica.render.OverlayRenderer;
import fi.dy.masa.litematica.render.infohud.StatusInfoRenderer;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkCommand;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkDirect;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicSetblockToMcfunction;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTaskFixer;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTaskRebuild;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementEventHandler;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiConfirmAction;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.IConfirmationListener;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.LayerMode;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.ChatComponent;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;

public class SchematicPlacementManager {
    protected final CopyOnWriteArrayList<SchematicPlacement> schematicPlacements = new CopyOnWriteArrayList();
    protected final ConcurrentHashMap<ChunkPos, CopyOnWriteArrayList<SchematicPlacement>> schematicsTouchingChunk = new ConcurrentHashMap(4096, 0.9f, 2);
    protected final ConcurrentHashMap<Long, CopyOnWriteArrayList<PlacementPart>> touchedVolumesInChunk = new ConcurrentHashMap(4096, 0.9f, 2);
    protected final Set<ChunkPos> chunksPreChange = new HashSet<ChunkPos>();
    protected final List<ChunkPos> visibleChunks = new ArrayList<ChunkPos>();
    protected final Supplier<WorldSchematic> worldSupplier;
    protected final LinkedBlockingQueue<PlacementManagerTask> pendingTasks = new LinkedBlockingQueue();
    protected ChunkPos lastVisibleChunksSortPos = ChunkPos.ZERO;
    protected volatile boolean visibleChunksNeedsUpdate;
    private final int tickRate = 7;
    private long lastTick;
    private long lastEmptyCheck;
    private long lastSchematicChange;
    @Nullable
    private SchematicPlacement selectedPlacement;

    public SchematicPlacementManager() {
        this(SchematicWorldHandler::getSchematicWorld);
    }

    protected SchematicPlacementManager(Supplier<WorldSchematic> worldSupplier) {
        this.worldSupplier = worldSupplier;
        this.lastTick = System.currentTimeMillis();
        this.lastEmptyCheck = System.currentTimeMillis();
        this.lastSchematicChange = -1L;
    }

    public void setVisibleSubChunksNeedsUpdate() {
        this.visibleChunksNeedsUpdate = true;
    }

    protected boolean hasTimeToExecuteMoreTasks() {
        return System.nanoTime() - DataManager.getClientTickStartTime() <= 35000000L;
    }

    protected boolean canHandleChunk(ClientLevel clientWorld, int chunkX, int chunkZ) {
        return Configs.Generic.LOAD_ENTIRE_SCHEMATICS.getBooleanValue() || WorldUtils.isClientChunkLoaded(clientWorld, chunkX, chunkZ);
    }

    public void onWorldJoin() {
        PlacementManagerDaemonHandler.INSTANCE.resetForceStop();
        PlacementManagerDaemonHandler.INSTANCE.checkThreadCount(false);
        PlacementManagerDaemonHandler.INSTANCE.start();
        if (this.schematicPlacements.isEmpty()) {
            return;
        }
        if (this.schematicsTouchingChunk.isEmpty() && !this.schematicPlacements.isEmpty()) {
            this.schematicPlacements.forEach(this::addTouchedChunksFor);
            this.lastSchematicChange = System.currentTimeMillis();
            this.setVisibleSubChunksNeedsUpdate();
        }
    }

    private long getTickRateMs() {
        Objects.requireNonNull(this);
        return 7L * 1000L;
    }

    public void onClientTick(Minecraft mc) {
        long now = System.currentTimeMillis();
        if (!this.pendingTasks.isEmpty()) {
            PlacementManagerTask task;
            while ((task = this.pendingTasks.poll()) != null) {
                PlacementManagerDaemonHandler.INSTANCE.addTask(task);
            }
            this.pendingTasks.clear();
        }
        if (now - this.lastTick > this.getTickRateMs()) {
            if (this.hasTimeToExecuteMoreTasks() && !PlacementManagerDaemonHandler.INSTANCE.hasAnyTasks()) {
                if (!this.checkIfAnyPlacementsShouldRender()) {
                    if (this.lastEmptyCheck < 0L) {
                        this.lastEmptyCheck = now;
                    }
                    if ((double)(now - this.lastEmptyCheck) > (double)this.getTickRateMs() * 2.5) {
                        this.lastTick = now;
                        return;
                    }
                } else if (this.lastEmptyCheck > 0L) {
                    this.lastEmptyCheck = -1L;
                }
                if (this.lastSchematicChange > 0L) {
                    if ((double)(now - this.lastSchematicChange) > (double)this.getTickRateMs() * 1.5) {
                        this.lastSchematicChange = -1L;
                    }
                } else {
                    this.lastTick = now;
                    return;
                }
                this.checkNearbyChunksAreLoaded(mc, mc.options.getEffectiveRenderDistance());
            }
            this.lastTick = now;
        }
    }

    private void checkNearbyChunksAreLoaded(Minecraft mc, int offset) {
        if (mc.level == null) {
            return;
        }
        ChunkPos cc = mc.getCameraEntity().chunkPosition();
        if (!Configs.Visuals.ENABLE_RENDERING.getBooleanValue()) {
            return;
        }
        PlacementManagerDaemonHandler.INSTANCE.addTask(new PlacementManagerTaskFixer(this.worldSupplier, cc.x(), cc.z(), offset));
    }

    protected void schedulePendingTaskForNextTick(PlacementManagerTask task) {
        this.pendingTasks.offer(task);
    }

    public void onToggleMainRendering(boolean toggle) {
        PlacementManagerDaemonHandler.INSTANCE.clearAllTasks();
        if (!this.schematicPlacements.isEmpty()) {
            this.schematicPlacements.forEach(pl -> {
                if (toggle) {
                    this.addTouchedChunksFor((SchematicPlacement)pl);
                } else {
                    this.removeTouchedChunksFor((SchematicPlacement)pl);
                }
            });
        }
        if (!toggle) {
            this.visibleChunks.clear();
        }
    }

    public void onClientChunkLoad(int chunkX, int chunkZ) {
        if (this.schematicsTouchingChunk.containsKey(new ChunkPos(chunkX, chunkZ))) {
            this.markChunkForRebuild(chunkX, chunkZ);
        }
    }

    public void onClientChunkUnload(int chunkX, int chunkZ) {
        if (!Configs.Generic.LOAD_ENTIRE_SCHEMATICS.getBooleanValue()) {
            if (this.schematicPlacements.isEmpty() || this.worldSupplier.get().getChunkSource().getLoadedChunksCount() == 0) {
                return;
            }
            this.unloadSchematicChunk(this.worldSupplier.get(), chunkX, chunkZ);
        }
    }

    protected boolean checkIfAnyPlacementsShouldRender() {
        if (!Configs.Visuals.ENABLE_RENDERING.getBooleanValue() || this.schematicPlacements.isEmpty()) {
            return false;
        }
        AtomicBoolean shouldRender = new AtomicBoolean(false);
        this.schematicPlacements.forEach(pl -> {
            SubRegionPlacement.RequiredEnabled re = SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED;
            if (pl.matchesRequirement(re)) {
                Set<ChunkPos> touchedChunks = pl.getTouchedChunks(re);
                for (ChunkPos cp : touchedChunks) {
                    if (!this.canHandleChunk(Minecraft.getInstance().level, cp.x(), cp.z())) continue;
                    shouldRender.set(true);
                    break;
                }
            }
        });
        return shouldRender.get();
    }

    public boolean checkIfChunkShouldRender(ChunkPos chunkPos) {
        return this.checkIfChunkShouldRender(chunkPos.x(), chunkPos.z());
    }

    public boolean checkIfChunkShouldRender(int chunkX, int chunkZ) {
        if (!Configs.Visuals.ENABLE_RENDERING.getBooleanValue()) {
            return false;
        }
        List<PlacementPart> parts = this.getPlacementPartsInChunk(chunkX, chunkZ);
        for (PlacementPart p : parts) {
            if (!p.placement.matchesRequirement(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED)) continue;
            return true;
        }
        return false;
    }

    private void unloadSchematicChunk(WorldSchematic worldSchematic, int chunkX, int chunkZ) {
        if (worldSchematic.getChunkSource().hasChunk(chunkX, chunkZ)) {
            PlacementManagerDaemonHandler.INSTANCE.removeAllTasksFor(chunkX, chunkZ);
            worldSchematic.unloadEntitiesByChunk(chunkX, chunkZ);
            worldSchematic.getChunkSource().unloadChunk(chunkX, chunkZ);
            this.setVisibleSubChunksNeedsUpdate();
        }
    }

    public int getLastVisibleChunksCount() {
        return this.visibleChunks.size();
    }

    public List<ChunkPos> getAndUpdateVisibleChunks(ChunkPos viewChunk) {
        if (this.visibleChunksNeedsUpdate) {
            this.visibleChunks.clear();
            WorldSchematic worldSchematic = this.worldSupplier.get();
            LayerRange range = DataManager.getRenderLayerRange();
            if (worldSchematic != null) {
                int minY = worldSchematic.getMinY();
                int maxY = worldSchematic.getMaxY() - 1;
                ImmutableList<ChunkSchematic> values = worldSchematic.getChunkSource().getLoadedValueSet();
                for (ChunkSchematic entry : values) {
                    int maxZ;
                    int maxX;
                    int minZ;
                    ChunkPos pos = entry.getPos();
                    int minX = pos.getMinBlockX();
                    if (!range.intersectsBox(minX, minY, minZ = pos.getMinBlockZ(), maxX = pos.getMaxBlockX(), maxY, maxZ = pos.getMaxBlockZ()) || !entry.getState().atLeast(ChunkSchematicState.LOADED)) continue;
                    this.visibleChunks.add(pos);
                }
                this.visibleChunks.sort(new PositionUtils.ChunkPosDistanceComparator(viewChunk));
                this.lastVisibleChunksSortPos = viewChunk;
            }
            this.visibleChunksNeedsUpdate = false;
        } else if (!viewChunk.equals((Object)this.lastVisibleChunksSortPos)) {
            this.visibleChunks.sort(new PositionUtils.ChunkPosDistanceComparator(viewChunk));
            this.lastVisibleChunksSortPos = viewChunk;
        }
        return this.visibleChunks;
    }

    public List<SchematicPlacement> getAllSchematicsPlacements() {
        return this.schematicPlacements;
    }

    protected List<SchematicPlacement> getAllSchematicsTouchingChunk(ChunkPos pos) {
        return this.schematicsTouchingChunk.getOrDefault(pos, new CopyOnWriteArrayList());
    }

    public List<PlacementPart> getPlacementPartsInChunk(int chunkX, int chunkZ) {
        return this.touchedVolumesInChunk.getOrDefault(ChunkPos.pack((int)chunkX, (int)chunkZ), new CopyOnWriteArrayList());
    }

    public List<PlacementPart> getAllPlacementsTouchingChunk(BlockPos pos) {
        return this.touchedVolumesInChunk.getOrDefault(ChunkPos.pack((int)(pos.getX() >> 4), (int)(pos.getZ() >> 4)), new CopyOnWriteArrayList());
    }

    public int getPlacementPartsInChunkCount(int chunkX, int chunkZ) {
        long longPos = ChunkPos.pack((int)chunkX, (int)chunkZ);
        if (this.touchedVolumesInChunk.containsKey(longPos)) {
            return this.touchedVolumesInChunk.get(longPos).size();
        }
        return 0;
    }

    public int getTouchedChunksCount() {
        return this.touchedVolumesInChunk.size();
    }

    protected void onPlacementAdded() {
        StatusInfoRenderer.getInstance().startOverrideDelay();
        this.lastSchematicChange = System.currentTimeMillis();
    }

    public void addSchematicPlacement(SchematicPlacement placement, boolean printMessages) {
        if (!this.schematicPlacements.contains(placement)) {
            this.schematicPlacements.add(placement);
            this.addTouchedChunksFor(placement);
            SchematicPlacementEventHandler.getInstance().onPlacementAdded(placement);
            this.onPlacementAdded();
            if (this.selectedPlacement == null) {
                this.setSelectedSchematicPlacement(placement);
            }
            if (printMessages) {
                InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)StringUtils.translate((String)"litematica.message.schematic_placement_created", (Object[])new Object[]{placement.getName()}), (Object[])new Object[0]);
                if (Configs.InfoOverlays.WARN_DISABLED_RENDERING.getBooleanValue()) {
                    String hotkeyVal;
                    String hotkeyName;
                    String configName;
                    ConfigHotkey hotkey;
                    LayerMode mode = DataManager.getRenderLayerRange().getLayerMode();
                    if (mode != LayerMode.ALL) {
                        InfoUtils.showGuiAndInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.layer_mode_currently_at", (Object[])new Object[]{mode.getDisplayName()});
                    }
                    if (!Configs.Visuals.ENABLE_RENDERING.getBooleanValue()) {
                        hotkey = Hotkeys.TOGGLE_ALL_RENDERING;
                        configName = Configs.Visuals.ENABLE_RENDERING.getName();
                        hotkeyName = hotkey.getName();
                        hotkeyVal = hotkey.getKeybind().getKeysDisplayString();
                        InfoUtils.showGuiAndInGameMessage((Message.MessageType)Message.MessageType.WARNING, (int)8000, (String)"litematica.message.warn.main_rendering_disabled", (Object[])new Object[]{configName, hotkeyName, hotkeyVal});
                    }
                    if (!Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue()) {
                        hotkey = Hotkeys.TOGGLE_SCHEMATIC_RENDERING;
                        configName = Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getName();
                        hotkeyName = hotkey.getName();
                        hotkeyVal = hotkey.getKeybind().getKeysDisplayString();
                        InfoUtils.showGuiAndInGameMessage((Message.MessageType)Message.MessageType.WARNING, (int)8000, (String)"litematica.message.warn.schematic_rendering_disabled", (Object[])new Object[]{configName, hotkeyName, hotkeyVal});
                    }
                    if (!Configs.Visuals.ENABLE_SCHEMATIC_BLOCKS.getBooleanValue()) {
                        hotkey = Hotkeys.TOGGLE_SCHEMATIC_BLOCK_RENDERING;
                        configName = Configs.Visuals.ENABLE_SCHEMATIC_BLOCKS.getName();
                        hotkeyName = hotkey.getName();
                        hotkeyVal = hotkey.getKeybind().getKeysDisplayString();
                        InfoUtils.showGuiAndInGameMessage((Message.MessageType)Message.MessageType.WARNING, (int)8000, (String)"litematica.message.warn.schematic_blocks_rendering_disabled", (Object[])new Object[]{configName, hotkeyName, hotkeyVal});
                    }
                }
            }
        } else if (printMessages) {
            InfoUtils.showGuiAndInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.duplicate_schematic_placement", (Object[])new Object[0]);
        }
    }

    public boolean removeSchematicPlacement(SchematicPlacement placement) {
        return this.removeSchematicPlacement(placement, true);
    }

    public boolean removeSchematicPlacement(SchematicPlacement placement, boolean update) {
        if (this.selectedPlacement == placement) {
            this.setSelectedSchematicPlacement(null);
        }
        if (placement.hasVerifier()) {
            placement.getSchematicVerifier().reset();
        }
        boolean ret = this.schematicPlacements.remove(placement);
        this.removeTouchedChunksFor(placement);
        if (ret) {
            placement.onRemoved();
            if (update) {
                this.onPlacementModified(placement);
            }
        }
        if (!this.schematicPlacements.isEmpty() && this.selectedPlacement == null) {
            this.setSelectedSchematicPlacement((SchematicPlacement)this.schematicPlacements.getFirst());
        }
        return ret;
    }

    public List<SchematicPlacement> getAllPlacementsOfSchematic(LitematicaSchematic schematic) {
        ArrayList<SchematicPlacement> list = new ArrayList<SchematicPlacement>();
        for (SchematicPlacement placement : this.schematicPlacements) {
            if (placement.getSchematic() != schematic) continue;
            list.add(placement);
        }
        return list;
    }

    public void removeAllPlacementsOfSchematic(LitematicaSchematic schematic) {
        boolean removed = false;
        for (int i = 0; i < this.schematicPlacements.size(); ++i) {
            SchematicPlacement placement = this.schematicPlacements.get(i);
            if (placement.getSchematic() != schematic) continue;
            if (placement.hasVerifier()) {
                placement.getSchematicVerifier().reset();
            }
            removed |= this.removeSchematicPlacement(placement, false);
            --i;
        }
        if (removed) {
            OverlayRenderer.getInstance().updatePlacementCache();
            this.lastSchematicChange = System.currentTimeMillis();
        }
    }

    @Nullable
    public SchematicPlacement getSelectedSchematicPlacement() {
        return this.selectedPlacement;
    }

    public void setSelectedSchematicPlacement(@Nullable SchematicPlacement placement) {
        if (placement == null || this.schematicPlacements.contains(placement)) {
            SchematicPlacementEventHandler.getInstance().onPlacementSelected(this.selectedPlacement, placement);
            this.selectedPlacement = placement;
            OverlayRenderer.getInstance().updatePlacementCache();
            DataManager.setMaterialList(null);
        }
    }

    protected void addTouchedChunksFor(SchematicPlacement placement) {
        Set<ChunkPos> chunks = placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        for (ChunkPos pos : chunks) {
            CopyOnWriteArrayList list = this.schematicsTouchingChunk.computeIfAbsent(pos, k -> new CopyOnWriteArrayList());
            if (!list.addIfAbsent(placement)) continue;
            this.updateTouchedBoxesInChunk(pos);
        }
        this.markChunksForRebuild(placement);
        this.onPlacementModified(placement);
    }

    protected void removeTouchedChunksFor(SchematicPlacement placement) {
        Set<ChunkPos> chunks = placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.ANY);
        HashSet<ChunkPos> toUnload = new HashSet<ChunkPos>();
        for (ChunkPos pos : chunks) {
            CopyOnWriteArrayList<SchematicPlacement> list = this.schematicsTouchingChunk.get(pos);
            if (list != null) {
                list.remove(placement);
                if (list.isEmpty()) {
                    this.schematicsTouchingChunk.remove(pos);
                    toUnload.add(pos);
                }
            }
            this.updateTouchedBoxesInChunk(pos);
        }
        this.markChunksForUnload(toUnload);
        this.markChunksForRebuild(chunks);
    }

    void onPrePlacementChange(SchematicPlacement placement) {
        this.chunksPreChange.clear();
        this.chunksPreChange.addAll(placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED));
    }

    void onPostPlacementChange(SchematicPlacement placement) {
        CopyOnWriteArrayList list;
        Set<ChunkPos> chunksPost = placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        HashSet<ChunkPos> toRebuild = new HashSet<ChunkPos>(chunksPost);
        HashSet<ChunkPos> toUnload = new HashSet<ChunkPos>();
        boolean changed = chunksPost.size() != this.chunksPreChange.size();
        this.chunksPreChange.removeAll(chunksPost);
        for (ChunkPos pos : this.chunksPreChange) {
            list = this.schematicsTouchingChunk.get(pos);
            if (list != null) {
                list.remove(placement);
                if (list.isEmpty()) {
                    this.schematicsTouchingChunk.remove(pos);
                    toUnload.add(pos);
                } else {
                    toRebuild.add(pos);
                }
            } else {
                toUnload.add(pos);
            }
            this.updateTouchedBoxesInChunk(pos);
        }
        this.markChunksForUnload(toUnload);
        this.markChunksForRebuild(toRebuild);
        for (ChunkPos pos : chunksPost) {
            list = this.schematicsTouchingChunk.computeIfAbsent(pos, k -> new CopyOnWriteArrayList());
            list.addIfAbsent(placement);
            this.updateTouchedBoxesInChunk(pos);
        }
        if (changed) {
            this.lastSchematicChange = System.currentTimeMillis();
            this.lastTick -= this.getTickRateMs();
        }
        this.onPlacementModified(placement);
    }

    protected void updateTouchedBoxesInChunk(ChunkPos pos) {
        long chunkPosLong = pos.pack();
        this.touchedVolumesInChunk.remove(chunkPosLong);
        CopyOnWriteArrayList<SchematicPlacement> placements = this.schematicsTouchingChunk.get(pos);
        if (placements != null && !placements.isEmpty()) {
            for (SchematicPlacement placement : placements) {
                ImmutableMap<String, IntBoundingBox> boxMap;
                if (!placement.matchesRequirement(SubRegionPlacement.RequiredEnabled.RENDERING_ENABLED) || (boxMap = placement.getBoxesWithinChunk(pos.x(), pos.z())).isEmpty()) continue;
                List list = this.touchedVolumesInChunk.computeIfAbsent(chunkPosLong, p -> new CopyOnWriteArrayList());
                for (Map.Entry entry : boxMap.entrySet()) {
                    list.add(new PlacementPart(placement, (String)entry.getKey(), (IntBoundingBox)entry.getValue()));
                }
            }
        }
    }

    public void markAllPlacementsOfSchematicForRebuild(LitematicaSchematic schematic) {
        for (SchematicPlacement placement : this.schematicPlacements) {
            if (placement.getSchematic() != schematic) continue;
            this.markChunksForRebuild(placement);
        }
    }

    public void markChunksForRebuild(SchematicPlacement placement) {
        SubRegionPlacement.RequiredEnabled re = SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED;
        if (placement.matchesRequirement(re)) {
            this.markChunksForRebuild(placement.getTouchedChunks(re));
        }
    }

    public void markChunkForUnload(ChunkPos pos) {
        this.markChunkForUnload(pos.x(), pos.z());
    }

    private void markChunksForUnload(Collection<ChunkPos> chunks) {
        for (ChunkPos pos : chunks) {
            this.markChunkForUnload(pos);
        }
    }

    public void markChunkForUnload(int cx, int cz) {
        PlacementManagerDaemonHandler.INSTANCE.removeAllTasksFor(cx, cz);
        this.unloadSchematicChunk(this.worldSupplier.get(), cx, cz);
    }

    private void markChunksForRebuild(Collection<ChunkPos> chunks) {
        chunks.forEach(pos -> this.markChunkForRebuild((ChunkPos)pos));
    }

    public void markChunkForRebuild(ChunkPos pos) {
        this.markChunkForRebuild(pos.x(), pos.z());
    }

    public void markChunkForRebuild(int cx, int cz) {
        PlacementManagerDaemonHandler.INSTANCE.removeAllTasksFor(cx, cz);
        PlacementManagerDaemonHandler.INSTANCE.addTask(new PlacementManagerTaskRebuild(this.worldSupplier, cx, cz));
    }

    protected void onPlacementModified(SchematicPlacement placement) {
        SchematicPlacementEventHandler.getInstance().onPlacementUpdated(placement);
        if (placement.isEnabled()) {
            OverlayRenderer.getInstance().updatePlacementCache();
        }
        this.lastSchematicChange = System.currentTimeMillis();
    }

    public boolean changeSelection(Level world, Entity entity, int maxDistance) {
        if (this.schematicPlacements.size() > 0) {
            RayTraceUtils.RayTraceWrapper trace = RayTraceUtils.getWrappedRayTraceFromEntity(world, entity, maxDistance);
            SchematicPlacement placement = this.getSelectedSchematicPlacement();
            if (placement != null) {
                placement.setSelectedSubRegionName(null);
            }
            if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.PLACEMENT_SUBREGION || trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.PLACEMENT_ORIGIN) {
                this.setSelectedSchematicPlacement(trace.getHitSchematicPlacement());
                boolean selectSubRegion = Hotkeys.SELECTION_GRAB_MODIFIER.getKeybind().isKeybindHeld();
                String subRegionName = selectSubRegion ? trace.getHitSchematicPlacementRegionName() : null;
                this.getSelectedSchematicPlacement().setSelectedSubRegionName(subRegionName);
                return true;
            }
            if (trace.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.MISS) {
                this.setSelectedSchematicPlacement(null);
                return true;
            }
        }
        return false;
    }

    public void setPositionOfCurrentSelectionToRayTrace(Minecraft mc, double maxDistance) {
        SchematicPlacement schematicPlacement = this.getSelectedSchematicPlacement();
        if (schematicPlacement != null) {
            Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
            HitResult trace = RayTraceUtils.getRayTraceFromEntity((Level)mc.level, entity, false, maxDistance);
            if (trace.getType() != HitResult.Type.BLOCK) {
                return;
            }
            BlockPos pos = ((BlockHitResult)trace).getBlockPos();
            if (!mc.player.isShiftKeyDown()) {
                pos = pos.relative(((BlockHitResult)trace).getDirection());
            }
            this.setPositionOfCurrentSelectionTo(pos, mc);
        }
    }

    public void setPositionOfCurrentSelectionTo(BlockPos pos, Minecraft mc) {
        SchematicPlacement schematicPlacement = this.getSelectedSchematicPlacement();
        if (schematicPlacement != null) {
            boolean movingBox;
            if (schematicPlacement.isLocked()) {
                InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.placement.cant_modify_is_locked", (Object[])new Object[0]);
                return;
            }
            boolean bl = movingBox = schematicPlacement.getSelectedSubRegionPlacement() != null;
            if (movingBox) {
                schematicPlacement.moveSubRegionTo(schematicPlacement.getSelectedSubRegionName(), pos, InfoUtils.INFO_MESSAGE_CONSUMER);
                String posStr = String.format("x: %d, y: %d, z: %d", pos.getX(), pos.getY(), pos.getZ());
                InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.placement.moved_subregion_to", (Object[])new Object[]{posStr});
            } else {
                BlockPos old = schematicPlacement.getOrigin();
                schematicPlacement.setOrigin(pos, InfoUtils.INFO_MESSAGE_CONSUMER);
                if (!old.equals((Object)schematicPlacement.getOrigin())) {
                    String posStrOld = String.format("x: %d, y: %d, z: %d", old.getX(), old.getY(), old.getZ());
                    String posStrNew = String.format("x: %d, y: %d, z: %d", pos.getX(), pos.getY(), pos.getZ());
                    InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.placement.moved_placement_origin", (Object[])new Object[]{posStrOld, posStrNew});
                }
            }
        }
    }

    public void nudgePositionOfCurrentSelection(Direction direction, int amount) {
        SchematicPlacement schematicPlacement = this.getSelectedSchematicPlacement();
        if (schematicPlacement != null) {
            if (schematicPlacement.isLocked()) {
                InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.placement.cant_modify_is_locked", (Object[])new Object[0]);
                return;
            }
            SubRegionPlacement placement = schematicPlacement.getSelectedSubRegionPlacement();
            if (placement != null) {
                BlockPos old = PositionUtils.getTransformedBlockPos(placement.getPos(), schematicPlacement.getMirror(), schematicPlacement.getRotation());
                old = old.offset((Vec3i)schematicPlacement.getOrigin());
                schematicPlacement.moveSubRegionTo(placement.getName(), old.relative(direction, amount), InfoUtils.INFO_MESSAGE_CONSUMER);
            } else {
                BlockPos old = schematicPlacement.getOrigin();
                schematicPlacement.setOrigin(old.relative(direction, amount), InfoUtils.INFO_MESSAGE_CONSUMER);
            }
        }
    }

    public void pasteCurrentPlacementToWorld(Minecraft mc) {
        this.pastePlacementToWorld(this.getSelectedSchematicPlacement(), mc);
    }

    public void pastePlacementToWorld(SchematicPlacement schematicPlacement, Minecraft mc) {
        this.pastePlacementToWorld(schematicPlacement, true, mc);
    }

    public void pastePlacementToWorld(SchematicPlacement schematicPlacement, boolean changedBlocksOnly, Minecraft mc) {
        this.pastePlacementToWorld(schematicPlacement, changedBlocksOnly, true, mc);
    }

    public void displayChunkDebugCmd(int cx, int cz, ChatComponent chat) {
        if (this.worldSupplier.get() != null) {
            ChunkSchematic chunk = this.worldSupplier.get().getChunkSource().getChunkIfExists(cx, cz);
            if (chunk != null) {
                int entCount = this.worldSupplier.get().getEntitiesByChunk(cx, cz, EntityUtils.NOT_PLAYER).size();
                int teCount = chunk.getTileEntityCount();
                int sectCount = chunk.getSectionsCount();
                int height = chunk.getHeight();
                int minY = chunk.getMinY();
                long timeCreated = chunk.getTimeCreated();
                int schemCount = this.getAllSchematicsTouchingChunk(new ChunkPos(cx, cz)).size();
                int partsCount = this.getPlacementPartsInChunkCount(cx, cz);
                boolean tasks = PlacementManagerDaemonHandler.INSTANCE.hasAnyTasksFor(cx, cz);
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.display_chunk_debug.base", (Object[])new Object[]{cx, cz, chunk.getState(), timeCreated}));
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.display_chunk_debug.entities", (Object[])new Object[]{entCount, teCount}));
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.display_chunk_debug.sections", (Object[])new Object[]{sectCount, height, minY}));
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.display_chunk_debug.schematics", (Object[])new Object[]{schemCount, partsCount, tasks}));
            } else {
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.display_chunk_debug.not_loaded", (Object[])new Object[]{cx, cz}));
            }
        }
    }

    public void markChunkForRebuildCmd(int cx, int cz, ChatComponent chat) {
        if (this.worldSupplier.get() != null) {
            chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.mark_chunk_for_rebuild", (Object[])new Object[]{cx, cz}));
            this.markChunkForRebuild(cx, cz);
        }
    }

    public void pastePlacementToWorld(SchematicPlacement schematicPlacement, boolean changedBlocksOnly, boolean printMessage, Minecraft mc) {
        if (mc.player != null && EntityUtils.isCreativeMode((Player)mc.player)) {
            if (schematicPlacement != null) {
                if (!schematicPlacement.isEnabled()) {
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.placement_paste_rendering_disabled", (Object[])new Object[0]);
                    return;
                }
                LayerRange range = DataManager.getRenderLayerRange();
                if (Configs.Generic.PASTE_TO_MCFUNCTION.getBooleanValue()) {
                    PasteToCommandsListener cl = new PasteToCommandsListener(schematicPlacement, changedBlocksOnly);
                    GuiConfirmAction screen = new GuiConfirmAction(320, "Confirm paste to command files", (IConfirmationListener)cl, null, "Are you sure you want to paste the current placement as setblock commands into command/mcfunction files?", new Object[0]);
                    GuiBase.openGui((Screen)screen);
                } else if (!mc.hasSingleplayerServer() || Configs.Generic.PASTE_USING_COMMANDS_IN_SP.getBooleanValue()) {
                    if (EntityDataManager.getInstance().hasServuxServer() && Configs.Generic.PASTE_USING_SERVUX.getBooleanValue()) {
                        Litematica.debugLog("Found a Servux server, I am sending the Schematic Placement to it.", new Object[0]);
                        InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.paste_with_servux", (Object[])new Object[0]);
                        CompoundTag nbt = schematicPlacement.toNbt(true);
                        int maxSize = 0x3FFF000;
                        if (nbt.sizeInBytes() > 0x3FFF000) {
                            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.placement_paste_too_large_for_servux", (Object[])new Object[0]);
                        } else {
                            nbt.putString("Task", "LitematicaPaste");
                            ServuxLitematicaHandler.getInstance().encodeClientData(ServuxLitematicaPacket.ResponseC2SStart(nbt));
                        }
                    } else {
                        TaskPasteSchematicPerChunkCommand task = new TaskPasteSchematicPerChunkCommand(Collections.singletonList(schematicPlacement), range, changedBlocksOnly);
                        TaskScheduler.getInstanceClient().scheduleTask(task, Configs.Generic.COMMAND_TASK_INTERVAL.getIntegerValue());
                        if (printMessage) {
                            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
                        }
                    }
                } else if (mc.hasSingleplayerServer()) {
                    TaskPasteSchematicPerChunkDirect task = new TaskPasteSchematicPerChunkDirect(Collections.singletonList(schematicPlacement), range, changedBlocksOnly);
                    TaskScheduler.getInstanceServer().scheduleTask(task, Configs.Generic.COMMAND_TASK_INTERVAL.getIntegerValue());
                    if (printMessage) {
                        InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.scheduled_task_added", (Object[])new Object[0]);
                    }
                }
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_placement_selected", (Object[])new Object[0]);
            }
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.generic.creative_mode_only", (Object[])new Object[0]);
        }
    }

    public void clear() {
        PlacementManagerDaemonHandler.INSTANCE.reset();
        this.pendingTasks.clear();
        this.schematicPlacements.clear();
        this.selectedPlacement = null;
        this.schematicsTouchingChunk.clear();
        this.touchedVolumesInChunk.clear();
        this.chunksPreChange.clear();
        this.visibleChunks.clear();
        SchematicHolder.getInstance().clearLoadedSchematics();
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        if (this.schematicPlacements.size() > 0) {
            JsonArray arr = new JsonArray();
            int selectedIndex = 0;
            boolean indexValid = false;
            for (SchematicPlacement placement : this.schematicPlacements) {
                JsonObject objPlacement;
                if (!placement.shouldBeSaved() || (objPlacement = placement.toJson()) == null) continue;
                arr.add((JsonElement)objPlacement);
                if (this.selectedPlacement == placement) {
                    indexValid = true;
                    continue;
                }
                if (indexValid) continue;
                ++selectedIndex;
            }
            obj.add("placements", (JsonElement)arr);
            if (indexValid) {
                obj.add("selected", (JsonElement)new JsonPrimitive((Number)selectedIndex));
                obj.add("origin_selected", (JsonElement)new JsonPrimitive(Boolean.valueOf(true)));
            }
        }
        return obj;
    }

    public void loadFromJson(JsonObject obj) {
        this.clear();
        if (JsonUtils.hasArray((JsonObject)obj, (String)"placements")) {
            JsonArray arr = obj.get("placements").getAsJsonArray();
            int index = JsonUtils.hasInteger((JsonObject)obj, (String)"selected") ? obj.get("selected").getAsInt() : -1;
            int size = arr.size();
            for (int i = 0; i < size; ++i) {
                JsonElement el = arr.get(i);
                if (el.isJsonObject()) {
                    SchematicPlacement placement = SchematicPlacement.fromJson(el.getAsJsonObject());
                    if (placement == null) continue;
                    this.addSchematicPlacement(placement, false);
                    continue;
                }
                index = -1;
            }
            if (index >= 0 && index < this.schematicPlacements.size()) {
                this.selectedPlacement = this.schematicPlacements.get(index);
            }
        }
        OverlayRenderer.getInstance().updatePlacementCache();
    }

    public static class PlacementPart {
        public final SchematicPlacement placement;
        public final String subRegionName;
        public final IntBoundingBox bb;

        public PlacementPart(SchematicPlacement placement, String subRegionName, IntBoundingBox bb) {
            this.placement = placement;
            this.subRegionName = subRegionName;
            this.bb = bb;
        }

        public SchematicPlacement getPlacement() {
            return this.placement;
        }

        public String getSubRegionName() {
            return this.subRegionName;
        }

        public IntBoundingBox getBox() {
            return this.bb;
        }
    }

    private static class PasteToCommandsListener
    implements IConfirmationListener {
        private final SchematicPlacement schematicPlacement;
        private final boolean changedBlocksOnly;

        public PasteToCommandsListener(SchematicPlacement schematicPlacement, boolean changedBlocksOnly) {
            this.schematicPlacement = schematicPlacement;
            this.changedBlocksOnly = changedBlocksOnly;
        }

        public boolean onActionConfirmed() {
            LayerRange range = DataManager.getRenderLayerRange();
            TaskPasteSchematicSetblockToMcfunction task = new TaskPasteSchematicSetblockToMcfunction(Collections.singletonList(this.schematicPlacement), range, this.changedBlocksOnly);
            TaskScheduler.getInstanceClient().scheduleTask(task, 1);
            return true;
        }

        public boolean onActionCancelled() {
            return true;
        }
    }
}

