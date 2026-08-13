/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableMap
 *  com.google.common.collect.ImmutableMap$Builder
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  fi.dy.masa.malilib.util.position.PositionUtils$CoordinateType
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.Tag
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.schematic.placement;

import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.SchematicHolder;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListPlacement;
import fi.dy.masa.litematica.render.OverlayRenderer;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementEventHandler;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.Tag;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings;
import org.apache.commons.lang3.tuple.Pair;

public class SchematicPlacement {
    private static final Set<Integer> USED_COLORS = new HashSet<Integer>();
    private static int nextColorIndex;
    private final UUID hashId;
    protected final SchematicPlacementManager placementManager;
    private final Map<String, SubRegionPlacement> relativeSubRegionPlacements = new HashMap<String, SubRegionPlacement>();
    private final int subRegionCount;
    private SchematicVerifier verifier;
    private final LitematicaSchematic schematic;
    private BlockPos origin;
    private String name;
    private Rotation rotation;
    private Mirror mirror;
    private BlockInfoListType verifierType;
    private boolean ignoreEntities;
    private boolean enabled;
    private boolean enableRender;
    private boolean renderEnclosingBox;
    private boolean regionPlacementsModified;
    private boolean locked;
    private boolean shouldBeSaved;
    private int coordinateLockMask;
    private int boxesBBColor;
    private Color4f boxesBBColorVec;
    @Nullable
    private Box enclosingBox;
    @Nullable
    private final Path schematicFile;
    @Nullable
    private String selectedSubRegionName;
    @Nullable
    private MaterialListBase materialList;

    public SchematicPlacement(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender) {
        this(schematic, origin, name, enabled, enableRender, DataManager.getSchematicPlacementManager(), null);
    }

    public SchematicPlacement(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender, UUID hash) {
        this(schematic, origin, name, enabled, enableRender, DataManager.getSchematicPlacementManager(), hash);
    }

    public SchematicPlacement(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender, SchematicPlacementManager placementManager) {
        this(schematic, origin, name, enabled, enableRender, placementManager, null);
    }

    public SchematicPlacement(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender, SchematicPlacementManager placementManager, @Nullable UUID hash) {
        this.hashId = hash != null ? hash : UUID.randomUUID();
        this.schematic = schematic;
        this.schematicFile = schematic.getFile();
        this.origin = origin;
        this.name = name;
        this.rotation = Rotation.NONE;
        this.mirror = Mirror.NONE;
        this.verifierType = BlockInfoListType.ALL;
        this.subRegionCount = schematic.getSubRegionCount();
        this.enabled = enabled;
        this.enableRender = enableRender;
        this.shouldBeSaved = true;
        this.boxesBBColorVec = new Color4f(255.0f, 255.0f, 255.0f);
        this.placementManager = placementManager;
        SchematicPlacementEventHandler.getInstance().onPlacementInit(this);
    }

    public static SchematicPlacement createFor(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender) {
        return SchematicPlacement.createFor(schematic, origin, name, enabled, enableRender, null);
    }

    public static SchematicPlacement createFor(LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender, UUID hash) {
        SchematicPlacement placement = new SchematicPlacement(schematic, origin, name, enabled, enableRender, hash);
        placement.setBoxesBBColorNext();
        placement.resetAllSubRegionsToSchematicValues(InfoUtils.INFO_MESSAGE_CONSUMER);
        SchematicPlacementEventHandler.getInstance().onPlacementCreateFor(placement, schematic, origin, name, enabled, enableRender);
        return placement;
    }

    public static SchematicPlacement createForSchematicConversion(LitematicaSchematic schematic, BlockPos origin) {
        Pair<BlockPos, BlockPos> pair = PositionUtils.getEnclosingAreaCorners(schematic.getAreas().values());
        BlockPos originAdjusted = pair != null ? origin.subtract((Vec3i)pair.getLeft()) : origin;
        return SchematicPlacement.createTemporary(schematic, originAdjusted);
    }

    public static SchematicPlacement createTemporary(LitematicaSchematic schematic, BlockPos origin) {
        return SchematicPlacement.createTemporary(schematic, origin, null);
    }

    public static SchematicPlacement createTemporary(LitematicaSchematic schematic, BlockPos origin, UUID hash) {
        SchematicPlacement placement = new SchematicPlacement(schematic, origin, "?", true, true, hash);
        placement.resetAllSubRegionsToSchematicValues(InfoUtils.INFO_MESSAGE_CONSUMER, false);
        SchematicPlacementEventHandler.getInstance().onPlacementCreateForConversion(placement, schematic, origin);
        return placement;
    }

    public boolean isEnabled() {
        return this.enabled;
    }

    public boolean isRenderingEnabled() {
        return this.isEnabled() && this.enableRender;
    }

    public boolean isLocked() {
        return this.locked;
    }

    public boolean shouldRenderEnclosingBox() {
        return this.renderEnclosingBox;
    }

    public boolean shouldBeSaved() {
        return this.shouldBeSaved;
    }

    public void setShouldBeSaved(boolean shouldbeSaved) {
        this.shouldBeSaved = shouldbeSaved;
    }

    public boolean matchesRequirement(SubRegionPlacement.RequiredEnabled required) {
        return switch (required) {
            case SubRegionPlacement.RequiredEnabled.ANY -> true;
            case SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED -> this.isEnabled();
            default -> this.isEnabled() && this.enableRender && Configs.Visuals.ENABLE_RENDERING.getBooleanValue();
        };
    }

    public boolean isRegionPlacementModified() {
        return this.regionPlacementsModified;
    }

    public boolean ignoreEntities() {
        return this.ignoreEntities;
    }

    public void toggleIgnoreEntities(IMessageConsumer feedback) {
        this.placementManager.onPrePlacementChange(this);
        this.ignoreEntities = !this.ignoreEntities;
        this.onModified(this.placementManager);
    }

    public void toggleRenderEnclosingBox() {
        boolean bl = this.renderEnclosingBox = !this.renderEnclosingBox;
        if (this.shouldRenderEnclosingBox()) {
            this.updateEnclosingBox();
        }
    }

    public void toggleLocked() {
        this.locked = !this.locked;
        SchematicPlacementEventHandler.getInstance().onToggleLocked(this, this.locked);
    }

    public void setCoordinateLocked(PositionUtils.CoordinateType coord, boolean locked) {
        int mask = 1 << coord.ordinal();
        this.coordinateLockMask = locked ? (this.coordinateLockMask |= mask) : (this.coordinateLockMask &= ~mask);
    }

    public boolean isCoordinateLocked(PositionUtils.CoordinateType coord) {
        int mask = 1 << coord.ordinal();
        return (this.coordinateLockMask & mask) != 0;
    }

    public String getName() {
        return this.name;
    }

    public LitematicaSchematic getSchematic() {
        return this.schematic;
    }

    @Nullable
    public Path getSchematicFile() {
        return this.schematicFile;
    }

    @Nullable
    public Box getEclosingBox() {
        return this.enclosingBox;
    }

    public void setName(String name) {
        this.name = name;
        SchematicPlacementEventHandler.getInstance().onSetName(this, name);
    }

    public SchematicPlacement setBoxesBBColor(int color) {
        this.boxesBBColor = color;
        this.boxesBBColorVec = Color4f.fromColor((int)color, (float)1.0f);
        USED_COLORS.add(color);
        return this;
    }

    public UUID getHashId() {
        return this.hashId;
    }

    public BlockPos getOrigin() {
        return this.origin;
    }

    public Rotation getRotation() {
        return this.rotation;
    }

    public Mirror getMirror() {
        return this.mirror;
    }

    public Color4f getBoxesBBColor() {
        return this.boxesBBColorVec;
    }

    public int getSubRegionCount() {
        return this.subRegionCount;
    }

    public BlockInfoListType getSchematicVerifierType() {
        return this.verifierType;
    }

    public void setSchematicVerifierType(BlockInfoListType type) {
        this.verifierType = type;
    }

    public MaterialListBase getMaterialList() {
        if (this.materialList == null) {
            this.materialList = new MaterialListPlacement(this, true);
        }
        return this.materialList;
    }

    public boolean hasVerifier() {
        return this.verifier != null;
    }

    public SchematicVerifier getSchematicVerifier() {
        if (this.verifier == null) {
            this.verifier = new SchematicVerifier();
        }
        return this.verifier;
    }

    public StructurePlaceSettings getPlacementSettings() {
        StructurePlaceSettings placement = new StructurePlaceSettings();
        placement.setMirror(this.mirror);
        placement.setRotation(this.rotation);
        placement.setIgnoreEntities(this.ignoreEntities);
        return placement;
    }

    @Nullable
    public String getSelectedSubRegionName() {
        return this.selectedSubRegionName;
    }

    public void setSelectedSubRegionName(@Nullable String name) {
        this.selectedSubRegionName = name;
    }

    @Nullable
    public SubRegionPlacement getSelectedSubRegionPlacement() {
        return this.selectedSubRegionName != null ? this.relativeSubRegionPlacements.get(this.selectedSubRegionName) : null;
    }

    @Nullable
    public SubRegionPlacement getRelativeSubRegionPlacement(String areaName) {
        return this.relativeSubRegionPlacements.get(areaName);
    }

    public Collection<SubRegionPlacement> getAllSubRegionsPlacements() {
        return this.relativeSubRegionPlacements.values();
    }

    public ImmutableMap<String, SubRegionPlacement> getEnabledRelativeSubRegionPlacements() {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        for (Map.Entry<String, SubRegionPlacement> entry : this.relativeSubRegionPlacements.entrySet()) {
            SubRegionPlacement placement = entry.getValue();
            if (!placement.matchesRequirement(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED)) continue;
            builder.put((Object)entry.getKey(), (Object)entry.getValue());
        }
        return builder.build();
    }

    private void updateEnclosingBox() {
        if (this.shouldRenderEnclosingBox()) {
            ImmutableMap<String, Box> boxes = this.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.ANY);
            BlockPos pos1 = null;
            BlockPos pos2 = null;
            for (Box box : boxes.values()) {
                BlockPos tmp = PositionUtils.getMinCorner(box.getPos1(), box.getPos2());
                if (pos1 == null) {
                    pos1 = tmp;
                } else if (tmp.getX() < pos1.getX() || tmp.getY() < pos1.getY() || tmp.getZ() < pos1.getZ()) {
                    pos1 = PositionUtils.getMinCorner(tmp, pos1);
                }
                tmp = PositionUtils.getMaxCorner(box.getPos1(), box.getPos2());
                if (pos2 == null) {
                    pos2 = tmp;
                    continue;
                }
                if (tmp.getX() <= pos2.getX() && tmp.getY() <= pos2.getY() && tmp.getZ() <= pos2.getZ()) continue;
                pos2 = PositionUtils.getMaxCorner(tmp, pos2);
            }
            if (pos1 != null && pos2 != null) {
                this.enclosingBox = new Box(pos1, pos2, "Enclosing Box");
            }
        }
    }

    public ImmutableMap<String, Box> getSubRegionBoxes(SubRegionPlacement.RequiredEnabled required) {
        if (!this.matchesRequirement(required)) {
            return ImmutableMap.of();
        }
        ImmutableMap.Builder builder = ImmutableMap.builder();
        Map<String, BlockPos> areaSizes = this.schematic.getAreaSizes();
        for (Map.Entry<String, SubRegionPlacement> entry : this.relativeSubRegionPlacements.entrySet()) {
            String name = entry.getKey();
            BlockPos areaSize = areaSizes.get(name);
            if (areaSize == null) {
                Litematica.LOGGER.warn("SchematicPlacement.getSubRegionBoxes(): Size for sub-region '{}' not found in the schematic '{}'", (Object)name, (Object)this.schematic.getMetadata().getName());
                continue;
            }
            SubRegionPlacement placement = entry.getValue();
            if (!placement.matchesRequirement(required)) continue;
            BlockPos boxOriginRelative = placement.getPos();
            BlockPos boxOriginAbsolute = PositionUtils.getTransformedBlockPos(boxOriginRelative, this.mirror, this.rotation).offset((Vec3i)this.origin);
            BlockPos pos2 = PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)areaSize);
            pos2 = PositionUtils.getTransformedBlockPos(pos2, this.mirror, this.rotation);
            pos2 = PositionUtils.getTransformedBlockPos(pos2, placement.getMirror(), placement.getRotation()).offset((Vec3i)boxOriginAbsolute);
            builder.put((Object)name, (Object)new Box(boxOriginAbsolute, pos2, name));
        }
        return builder.build();
    }

    public ImmutableMap<String, Box> getSubRegionBoxFor(String regionName, SubRegionPlacement.RequiredEnabled required) {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        Map<String, BlockPos> areaSizes = this.schematic.getAreaSizes();
        SubRegionPlacement placement = this.relativeSubRegionPlacements.get(regionName);
        if (placement != null && placement.matchesRequirement(required)) {
            BlockPos areaSize = areaSizes.get(regionName);
            if (areaSize != null) {
                BlockPos boxOriginRelative = placement.getPos();
                BlockPos boxOriginAbsolute = PositionUtils.getTransformedBlockPos(boxOriginRelative, this.mirror, this.rotation).offset((Vec3i)this.origin);
                BlockPos pos2 = PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)areaSize);
                pos2 = PositionUtils.getTransformedBlockPos(pos2, this.mirror, this.rotation);
                pos2 = PositionUtils.getTransformedBlockPos(pos2, placement.getMirror(), placement.getRotation()).offset((Vec3i)boxOriginAbsolute);
                builder.put((Object)regionName, (Object)new Box(boxOriginAbsolute, pos2, regionName));
            } else {
                Litematica.LOGGER.warn("SchematicPlacement.getSubRegionBoxFor(): Size for sub-region '{}' not found in the schematic '{}'", (Object)regionName, (Object)this.schematic.getMetadata().getName());
            }
        }
        return builder.build();
    }

    public Set<String> getRegionsTouchingChunk(int chunkX, int chunkZ) {
        return this.getRegionsTouchingChunk(chunkX, chunkZ, SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
    }

    public Set<String> getRegionsTouchingChunk(int chunkX, int chunkZ, SubRegionPlacement.RequiredEnabled required) {
        ImmutableMap<String, Box> map = this.getSubRegionBoxes(required);
        int chunkXMin = chunkX << 4;
        int chunkZMin = chunkZ << 4;
        int chunkXMax = chunkXMin + 15;
        int chunkZMax = chunkZMin + 15;
        HashSet<String> set = new HashSet<String>();
        for (Map.Entry entry : map.entrySet()) {
            Box box = (Box)entry.getValue();
            int boxXMin = Math.min(box.getPos1().getX(), box.getPos2().getX());
            int boxZMin = Math.min(box.getPos1().getZ(), box.getPos2().getZ());
            int boxXMax = Math.max(box.getPos1().getX(), box.getPos2().getX());
            int boxZMax = Math.max(box.getPos1().getZ(), box.getPos2().getZ());
            boolean notOverlapping = boxXMin > chunkXMax || boxZMin > chunkZMax || boxXMax < chunkXMin || boxZMax < chunkZMin;
            if (notOverlapping) continue;
            set.add((String)entry.getKey());
        }
        return set;
    }

    public ImmutableMap<String, IntBoundingBox> getBoxesWithinChunk(int chunkX, int chunkZ) {
        return this.getBoxesWithinChunk(chunkX, chunkZ, SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
    }

    public ImmutableMap<String, IntBoundingBox> getBoxesWithinChunk(int chunkX, int chunkZ, SubRegionPlacement.RequiredEnabled required) {
        ImmutableMap<String, Box> subRegions = this.getSubRegionBoxes(required);
        return PositionUtils.getBoxesWithinChunk(chunkX, chunkZ, subRegions);
    }

    @Nullable
    public IntBoundingBox getBoxWithinChunkForRegion(String regionName, int chunkX, int chunkZ) {
        return this.getBoxWithinChunkForRegion(regionName, chunkX, chunkZ, SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
    }

    @Nullable
    public IntBoundingBox getBoxWithinChunkForRegion(String regionName, int chunkX, int chunkZ, SubRegionPlacement.RequiredEnabled required) {
        Box box = (Box)this.getSubRegionBoxFor(regionName, required).get((Object)regionName);
        return box != null ? PositionUtils.getBoundsWithinChunkForBox(box, chunkX, chunkZ) : null;
    }

    public Set<ChunkPos> getTouchedChunks() {
        return this.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
    }

    public Set<ChunkPos> getTouchedChunks(SubRegionPlacement.RequiredEnabled required) {
        if (this.matchesRequirement(required)) {
            return PositionUtils.getTouchedChunks(this.getSubRegionBoxes(required));
        }
        return new HashSet<ChunkPos>();
    }

    public Set<ChunkPos> getTouchedChunksForRegion(String regionName) {
        return this.getTouchedChunksForRegion(regionName, SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
    }

    public Set<ChunkPos> getTouchedChunksForRegion(String regionName, SubRegionPlacement.RequiredEnabled required) {
        if (this.matchesRequirement(required)) {
            return PositionUtils.getTouchedChunks(this.getSubRegionBoxFor(regionName, required));
        }
        return new HashSet<ChunkPos>();
    }

    private void checkAreSubRegionsModified() {
        Map<String, BlockPos> areaPositions = this.schematic.getAreaPositions();
        if (areaPositions.size() != this.relativeSubRegionPlacements.size()) {
            this.regionPlacementsModified = true;
            return;
        }
        for (Map.Entry<String, BlockPos> entry : areaPositions.entrySet()) {
            SubRegionPlacement placement = this.relativeSubRegionPlacements.get(entry.getKey());
            if (placement != null && !placement.isRegionPlacementModified(entry.getValue())) continue;
            this.regionPlacementsModified = true;
            return;
        }
        this.regionPlacementsModified = false;
    }

    public void moveSubRegionTo(String regionName, BlockPos newPos, IStringConsumer feedback) {
        if (this.isLocked()) {
            feedback.setString("litematica.message.placement.cant_modify_is_locked");
            return;
        }
        if (this.relativeSubRegionPlacements.containsKey(regionName)) {
            this.placementManager.onPrePlacementChange(this);
            newPos = newPos.subtract((Vec3i)this.origin);
            newPos = PositionUtils.getReverseTransformedBlockPos(newPos, this.mirror, this.rotation);
            this.relativeSubRegionPlacements.get(regionName).setPos(newPos);
            this.onModified(regionName, this.placementManager);
        }
    }

    public void setSubRegionRotation(String regionName, Rotation rotation, IMessageConsumer feedback) {
        if (this.isLocked()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.message.placement.cant_modify_is_locked", new Object[0]);
            return;
        }
        if (this.relativeSubRegionPlacements.containsKey(regionName)) {
            this.placementManager.onPrePlacementChange(this);
            SubRegionPlacement placement = this.relativeSubRegionPlacements.get(regionName);
            placement.setRotation(rotation);
            this.onModified(regionName, this.placementManager);
        }
    }

    public void setSubRegionMirror(String regionName, Mirror mirror, IMessageConsumer feedback) {
        if (this.isLocked()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.message.placement.cant_modify_is_locked", new Object[0]);
            return;
        }
        if (this.relativeSubRegionPlacements.containsKey(regionName)) {
            this.placementManager.onPrePlacementChange(this);
            this.relativeSubRegionPlacements.get(regionName).setMirror(mirror);
            this.onModified(regionName, this.placementManager);
        }
    }

    public void setSubRegionsEnabledState(boolean state, Collection<SubRegionPlacement> subRegions, IMessageConsumer feedback) {
        this.placementManager.onPrePlacementChange(this);
        for (SubRegionPlacement placement : subRegions) {
            if ((placement = this.relativeSubRegionPlacements.get(placement.getName())) == null || placement.isEnabled() == state) continue;
            placement.setEnabled(state);
        }
        this.checkAreSubRegionsModified();
        this.onModified(this.placementManager);
    }

    public void toggleSubRegionEnabled(String regionName, IMessageConsumer feedback) {
        if (this.relativeSubRegionPlacements.containsKey(regionName)) {
            this.placementManager.onPrePlacementChange(this);
            this.relativeSubRegionPlacements.get(regionName).toggleEnabled();
            this.onModified(regionName, this.placementManager);
        }
    }

    public void toggleSubRegionIgnoreEntities(String regionName, IMessageConsumer feedback) {
        if (this.relativeSubRegionPlacements.containsKey(regionName)) {
            this.placementManager.onPrePlacementChange(this);
            this.relativeSubRegionPlacements.get(regionName).toggleIgnoreEntities();
            this.onModified(regionName, this.placementManager);
        }
    }

    public void resetAllSubRegionsToSchematicValues(IStringConsumer feedback) {
        this.resetAllSubRegionsToSchematicValues(feedback, true);
    }

    public void resetAllSubRegionsToSchematicValues(IStringConsumer feedback, boolean updatePlacementManager) {
        if (this.isLocked()) {
            feedback.setString("litematica.message.placement.cant_modify_is_locked");
            return;
        }
        if (updatePlacementManager) {
            this.placementManager.onPrePlacementChange(this);
        }
        SchematicPlacementEventHandler.getInstance().onPlacementReset(this);
        Map<String, BlockPos> areaPositions = this.schematic.getAreaPositions();
        this.relativeSubRegionPlacements.clear();
        this.regionPlacementsModified = false;
        for (Map.Entry<String, BlockPos> entry : areaPositions.entrySet()) {
            String name = entry.getKey();
            this.relativeSubRegionPlacements.put(name, new SubRegionPlacement(entry.getValue(), name));
        }
        if (updatePlacementManager) {
            this.onModified(this.placementManager);
        }
    }

    public void resetSubRegionToSchematicValues(String regionName, IMessageConsumer feedback) {
        if (this.isLocked()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.message.placement.cant_modify_is_locked", new Object[0]);
            return;
        }
        BlockPos pos = this.schematic.getSubRegionPosition(regionName);
        SubRegionPlacement placement = this.relativeSubRegionPlacements.get(regionName);
        if (pos != null && placement != null) {
            this.placementManager.onPrePlacementChange(this);
            placement.resetToOriginalValues();
            this.onModified(regionName, this.placementManager);
        }
    }

    public void setEnabled(boolean enabled) {
        if (enabled != this.enabled) {
            this.placementManager.onPrePlacementChange(this);
            this.enabled = enabled;
            SchematicPlacementEventHandler.getInstance().onSetEnabled(this, enabled);
            this.onModified(this.placementManager);
        }
    }

    public void toggleEnabled() {
        this.setEnabled(!this.enabled);
    }

    public void setRenderSchematic(boolean render) {
        if (render != this.enableRender) {
            this.placementManager.onPrePlacementChange(this);
            this.enableRender = render;
            SchematicPlacementEventHandler.getInstance().onSetRender(this, render);
            this.onModified(this.placementManager);
        }
    }

    public void toggleSubRegionRenderingEnabled(String regionName) {
        SubRegionPlacement placement = this.relativeSubRegionPlacements.get(regionName);
        if (placement != null) {
            placement.toggleRenderingEnabled();
        }
    }

    public SchematicPlacement setOrigin(BlockPos origin, IStringConsumer feedback) {
        if (this.isLocked()) {
            feedback.setString("litematica.message.placement.cant_modify_is_locked");
            return this;
        }
        if (!this.origin.equals((Object)(origin = PositionUtils.getModifiedPartiallyLockedPosition(this.origin, origin, this.coordinateLockMask)))) {
            this.placementManager.onPrePlacementChange(this);
            this.origin = origin;
            SchematicPlacementEventHandler.getInstance().onSetOrigin(this, origin);
            this.onModified(this.placementManager);
        }
        return this;
    }

    public SchematicPlacement setRotation(Rotation rotation, IMessageConsumer feedback) {
        if (this.isLocked()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.message.placement.cant_modify_is_locked", new Object[0]);
            return this;
        }
        if (this.rotation != rotation) {
            this.placementManager.onPrePlacementChange(this);
            this.rotation = rotation;
            SchematicPlacementEventHandler.getInstance().onSetRotation(this, rotation);
            this.onModified(this.placementManager);
        }
        return this;
    }

    public SchematicPlacement setMirror(Mirror mirror, IMessageConsumer feedback) {
        if (this.isLocked()) {
            feedback.addMessage(Message.MessageType.ERROR, "litematica.message.placement.cant_modify_is_locked", new Object[0]);
            return this;
        }
        if (this.mirror != mirror) {
            this.placementManager.onPrePlacementChange(this);
            this.mirror = mirror;
            SchematicPlacementEventHandler.getInstance().onSetMirror(this, mirror);
            this.onModified(this.placementManager);
        }
        return this;
    }

    private SchematicPlacement setBoxesBBColorNext() {
        return this.setBoxesBBColor(SchematicPlacement.getNextBoxColor());
    }

    protected void onModified(SchematicPlacementManager manager) {
        this.updateEnclosingBox();
        manager.onPostPlacementChange(this);
        OverlayRenderer.getInstance().updatePlacementCache();
    }

    protected void onModified(String regionName, SchematicPlacementManager manager) {
        this.checkAreSubRegionsModified();
        this.updateEnclosingBox();
        manager.onPostPlacementChange(this);
        OverlayRenderer.getInstance().updatePlacementCache();
    }

    public void onRemoved() {
        SchematicPlacementEventHandler.getInstance().onPlacementRemoved(this);
        USED_COLORS.remove(this.boxesBBColor);
        if (USED_COLORS.isEmpty()) {
            nextColorIndex = 0;
        }
    }

    @Nullable
    public JsonObject toJson() {
        if (this.schematic.getFile() != null) {
            JsonObject obj = new JsonObject();
            JsonArray arr = new JsonArray();
            arr.add((Number)this.origin.getX());
            arr.add((Number)this.origin.getY());
            arr.add((Number)this.origin.getZ());
            obj.add("schematic", (JsonElement)new JsonPrimitive(this.schematic.getFile().toAbsolutePath().toString()));
            obj.add("name", (JsonElement)new JsonPrimitive(this.name));
            obj.add("origin", (JsonElement)arr);
            obj.add("rotation", (JsonElement)new JsonPrimitive(this.rotation.name()));
            obj.add("mirror", (JsonElement)new JsonPrimitive(this.mirror.name()));
            obj.add("ignore_entities", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.ignoreEntities())));
            obj.add("enabled", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.isEnabled())));
            obj.add("enable_render", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.enableRender)));
            obj.add("render_enclosing_box", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.shouldRenderEnclosingBox())));
            obj.add("locked", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.isLocked())));
            obj.add("locked_coords", (JsonElement)new JsonPrimitive((Number)this.coordinateLockMask));
            obj.add("bb_color", (JsonElement)new JsonPrimitive((Number)this.boxesBBColor));
            obj.add("verifier_type", (JsonElement)new JsonPrimitive(this.verifierType.getStringValue()));
            obj.add("hash_code", (JsonElement)new JsonPrimitive(this.hashId.toString()));
            if (this.selectedSubRegionName != null) {
                obj.add("selected_region", (JsonElement)new JsonPrimitive(this.selectedSubRegionName));
            }
            if (this.materialList != null) {
                obj.add("material_list", (JsonElement)this.materialList.toJson());
            }
            if (!this.relativeSubRegionPlacements.isEmpty()) {
                arr = new JsonArray();
                for (Map.Entry<String, SubRegionPlacement> entry : this.relativeSubRegionPlacements.entrySet()) {
                    JsonObject placementObj = new JsonObject();
                    JsonObject subPlacement = entry.getValue().toJson();
                    if (subPlacement == null || subPlacement.isEmpty()) continue;
                    placementObj.add("name", (JsonElement)new JsonPrimitive(entry.getKey()));
                    placementObj.add("placement", (JsonElement)subPlacement);
                    arr.add((JsonElement)placementObj);
                }
                obj.add("placements", (JsonElement)arr);
            }
            SchematicPlacementEventHandler.getInstance().onSavePlacementToJson(this, obj);
            return obj;
        }
        return null;
    }

    @Nullable
    public static SchematicPlacement fromJson(JsonObject obj) {
        if (JsonUtils.hasString((JsonObject)obj, (String)"schematic") && JsonUtils.hasString((JsonObject)obj, (String)"name") && JsonUtils.hasArray((JsonObject)obj, (String)"origin") && JsonUtils.hasString((JsonObject)obj, (String)"rotation") && JsonUtils.hasString((JsonObject)obj, (String)"mirror") && JsonUtils.hasArray((JsonObject)obj, (String)"placements")) {
            Path file = Path.of((String)obj.get("schematic").getAsString(), (String[])new String[0]);
            LitematicaSchematic schematic = SchematicHolder.getInstance().getOrLoad(file);
            if (schematic == null) {
                Litematica.LOGGER.warn("Failed to load schematic '{}'", (Object)file.toAbsolutePath());
                return null;
            }
            JsonArray posArr = obj.get("origin").getAsJsonArray();
            if (posArr.size() != 3) {
                Litematica.LOGGER.warn("Failed to load schematic placement for '{}', invalid origin position", (Object)file.toAbsolutePath());
                return null;
            }
            UUID hashCode = JsonUtils.hasString((JsonObject)obj, (String)"hash_code") ? UUID.fromString(JsonUtils.getString((JsonObject)obj, (String)"hash_code")) : null;
            String name = obj.get("name").getAsString();
            BlockPos pos = new BlockPos(posArr.get(0).getAsInt(), posArr.get(1).getAsInt(), posArr.get(2).getAsInt());
            Rotation rotation = Rotation.valueOf((String)obj.get("rotation").getAsString());
            Mirror mirror = Mirror.valueOf((String)obj.get("mirror").getAsString());
            boolean enabled = JsonUtils.getBoolean((JsonObject)obj, (String)"enabled");
            boolean enableRender = JsonUtils.getBoolean((JsonObject)obj, (String)"enable_render");
            SchematicPlacement schematicPlacement = new SchematicPlacement(schematic, pos, name, enabled, enableRender, hashCode);
            schematicPlacement.rotation = rotation;
            schematicPlacement.mirror = mirror;
            schematicPlacement.ignoreEntities = JsonUtils.getBoolean((JsonObject)obj, (String)"ignore_entities");
            schematicPlacement.renderEnclosingBox = JsonUtils.getBoolean((JsonObject)obj, (String)"render_enclosing_box");
            schematicPlacement.locked = JsonUtils.getBoolean((JsonObject)obj, (String)"locked");
            schematicPlacement.coordinateLockMask = JsonUtils.getInteger((JsonObject)obj, (String)"locked_coords");
            if (JsonUtils.hasInteger((JsonObject)obj, (String)"bb_color")) {
                schematicPlacement.setBoxesBBColor(JsonUtils.getInteger((JsonObject)obj, (String)"bb_color"));
            } else {
                schematicPlacement.setBoxesBBColorNext();
            }
            if (JsonUtils.hasObject((JsonObject)obj, (String)"material_list")) {
                schematicPlacement.materialList = new MaterialListPlacement(schematicPlacement);
                schematicPlacement.materialList.fromJson(JsonUtils.getNestedObject((JsonObject)obj, (String)"material_list", (boolean)false));
            }
            if (JsonUtils.hasString((JsonObject)obj, (String)"verifier_type")) {
                schematicPlacement.verifierType = BlockInfoListType.fromStringStatic(JsonUtils.getString((JsonObject)obj, (String)"verifier_type"));
            }
            if (JsonUtils.hasString((JsonObject)obj, (String)"selected_region")) {
                schematicPlacement.selectedSubRegionName = JsonUtils.getString((JsonObject)obj, (String)"selected_region");
            }
            JsonArray placementArr = obj.get("placements").getAsJsonArray();
            for (int i = 0; i < placementArr.size(); ++i) {
                SubRegionPlacement placement;
                JsonObject placementObj;
                JsonElement el = placementArr.get(i);
                if (!el.isJsonObject() || !JsonUtils.hasString((JsonObject)(placementObj = el.getAsJsonObject()), (String)"name") || !JsonUtils.hasObject((JsonObject)placementObj, (String)"placement") || (placement = SubRegionPlacement.fromJson(placementObj.get("placement").getAsJsonObject())) == null) continue;
                String placementName = placementObj.get("name").getAsString();
                schematicPlacement.relativeSubRegionPlacements.put(placementName, placement);
            }
            SchematicPlacementEventHandler.getInstance().onPlacementCreateFromJson(schematicPlacement, schematic, pos, name, rotation, mirror, enabled, enableRender, obj);
            schematicPlacement.checkAreSubRegionsModified();
            schematicPlacement.updateEnclosingBox();
            return schematicPlacement;
        }
        return null;
    }

    private static int getNextBoxColor() {
        int length = OverlayRenderer.KELLY_COLORS.length;
        int color = OverlayRenderer.KELLY_COLORS[nextColorIndex];
        nextColorIndex = (nextColorIndex + 1) % length;
        for (int i = 0; i < length; ++i) {
            if (!USED_COLORS.contains(color)) {
                return color;
            }
            color = OverlayRenderer.KELLY_COLORS[nextColorIndex];
            nextColorIndex = (nextColorIndex + 1) % length;
        }
        return color;
    }

    public CompoundTag toNbt(boolean withSchematic) {
        CompoundTag compound = new CompoundTag();
        compound.putString("Name", this.name);
        compound.putString("HashCode", this.hashId.toString());
        if (withSchematic) {
            compound.put("Schematics", (Tag)this.schematic.writeToNBT());
        }
        NbtUtils.writeBlockPosToArrayTag((Vec3i)this.origin, (CompoundTag)compound, (String)"Origin");
        compound.putInt("Rotation", this.rotation.ordinal());
        compound.putInt("Mirror", this.mirror.ordinal());
        CompoundTag subs = new CompoundTag();
        for (String name : this.relativeSubRegionPlacements.keySet()) {
            CompoundTag sub = new CompoundTag();
            SubRegionPlacement subRegionPlacement = this.relativeSubRegionPlacements.get(name);
            subs.put(name, (Tag)sub);
            NbtUtils.writeBlockPosToArrayTag((Vec3i)subRegionPlacement.getPos(), (CompoundTag)sub, (String)"Pos");
            sub.putInt("Rotation", subRegionPlacement.getRotation().ordinal());
            sub.putInt("Mirror", subRegionPlacement.getMirror().ordinal());
            sub.putString("Name", subRegionPlacement.getName());
            sub.putBoolean("Enabled", subRegionPlacement.isEnabled());
            sub.putBoolean("IgnoreEntities", subRegionPlacement.ignoreEntities());
        }
        compound.put("SubRegions", (Tag)subs);
        compound.putString("ReplaceMode", Configs.Generic.PASTE_REPLACE_BEHAVIOR.getStringValue());
        compound.putString("PasteLayerBehavior", Configs.Generic.PASTE_LAYER_BEHAVIOR.getStringValue());
        compound.store("RenderLayerRange", LayerRange.CODEC, (Object)DataManager.getRenderLayerRange());
        SchematicPlacementEventHandler.getInstance().onSavePlacementToNbt(this, compound);
        return compound;
    }

    @Nullable
    public static SchematicPlacement createFromNbt(CompoundTag nbt) {
        String name = nbt.getStringOr("Name", "?");
        UUID hashCode = nbt.contains("HashCode") ? UUID.fromString(nbt.getStringOr("HashCode", "")) : null;
        LitematicaSchematic schematic = new LitematicaSchematic(Path.of((String)name, (String[])new String[0]), nbt.getCompoundOrEmpty("Schematics"), FileType.LITEMATICA_SCHEMATIC);
        BlockPos origin = NbtUtils.readBlockPosFromArrayTag((CompoundTag)nbt, (String)"Origin");
        Rotation rot = Rotation.values()[nbt.getIntOr("Rotation", 0)];
        Mirror mirror = Mirror.values()[nbt.getIntOr("Mirror", 0)];
        SchematicPlacement placement = SchematicPlacement.createFor(schematic, origin, name, true, true, hashCode);
        placement.rotation = rot;
        placement.mirror = mirror;
        CompoundTag subs = nbt.getCompoundOrEmpty("SubRegions");
        for (String key : subs.keySet()) {
            CompoundTag entry = subs.getCompoundOrEmpty(key);
            if (entry.isEmpty() || !entry.contains("Pos")) continue;
            name = entry.getStringOr("Name", "?");
            origin = NbtUtils.readBlockPosFromArrayTag((CompoundTag)entry, (String)"Pos");
            rot = Rotation.values()[entry.getIntOr("Rotation", 0)];
            mirror = Mirror.values()[entry.getIntOr("Mirror", 0)];
            boolean enabled = entry.getBooleanOr("Enabled", true);
            boolean ignore = entry.getBooleanOr("IgnoreEntities", false);
            SubRegionPlacement subRegion = new SubRegionPlacement(origin, name);
            subRegion.setMirror(mirror);
            subRegion.setRotation(rot);
            subRegion.setEnabled(enabled);
            if (ignore) {
                subRegion.toggleIgnoreEntities();
            }
            placement.relativeSubRegionPlacements.put(key, subRegion);
        }
        SchematicPlacementEventHandler.getInstance().onPlacementCreateFromNbt(placement, schematic, origin, name, rot, mirror, placement.enabled, placement.enableRender, nbt);
        placement.checkAreSubRegionsModified();
        placement.updateEnclosingBox();
        return placement;
    }

    @Nullable
    public static SchematicPlacement createFromNbt(@Nonnull LitematicaSchematic schematic, CompoundTag nbt) {
        String name = nbt.getStringOr("Name", "?");
        UUID hashCode = nbt.contains("HashCode") ? UUID.fromString(nbt.getStringOr("HashCode", "")) : null;
        BlockPos origin = NbtUtils.readBlockPosFromArrayTag((CompoundTag)nbt, (String)"Origin");
        Rotation rot = Rotation.values()[nbt.getIntOr("Rotation", 0)];
        Mirror mirror = Mirror.values()[nbt.getIntOr("Mirror", 0)];
        SchematicPlacement placement = SchematicPlacement.createFor(schematic, origin, name, true, true, hashCode);
        placement.rotation = rot;
        placement.mirror = mirror;
        CompoundTag subs = nbt.getCompoundOrEmpty("SubRegions");
        for (String key : subs.keySet()) {
            CompoundTag entry = subs.getCompoundOrEmpty(key);
            if (entry.isEmpty() || !entry.contains("Pos")) continue;
            name = entry.getStringOr("Name", "?");
            origin = NbtUtils.readBlockPosFromArrayTag((CompoundTag)entry, (String)"Pos");
            rot = Rotation.values()[entry.getIntOr("Rotation", 0)];
            mirror = Mirror.values()[entry.getIntOr("Mirror", 0)];
            boolean enabled = entry.getBooleanOr("Enabled", true);
            boolean ignore = entry.getBooleanOr("IgnoreEntities", false);
            SubRegionPlacement subRegion = new SubRegionPlacement(origin, name);
            subRegion.setMirror(mirror);
            subRegion.setRotation(rot);
            subRegion.setEnabled(enabled);
            if (ignore) {
                subRegion.toggleIgnoreEntities();
            }
            placement.relativeSubRegionPlacements.put(key, subRegion);
        }
        SchematicPlacementEventHandler.getInstance().onPlacementCreateFromNbt(placement, schematic, origin, name, rot, mirror, placement.enabled, placement.enableRender, nbt);
        placement.checkAreSubRegionsModified();
        placement.updateEnclosingBox();
        return placement;
    }
}

