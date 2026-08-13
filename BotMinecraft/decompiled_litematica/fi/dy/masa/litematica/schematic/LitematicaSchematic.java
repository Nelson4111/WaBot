/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableMap
 *  com.google.common.collect.ImmutableMap$Builder
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.util.FileNameUtils
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Schema
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  it.unimi.dsi.fastutil.longs.Long2ObjectMap
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.SharedConstants
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Holder$Reference
 *  net.minecraft.core.HolderGetter
 *  net.minecraft.core.HolderLookup$Provider
 *  net.minecraft.core.Registry
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.SectionPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.core.registries.Registries
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.nbt.LongArrayTag
 *  net.minecraft.nbt.NbtUtils
 *  net.minecraft.nbt.Tag
 *  net.minecraft.resources.Identifier
 *  net.minecraft.server.level.ServerLevel
 *  net.minecraft.tags.BlockTags
 *  net.minecraft.util.Mth
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.EntityType
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragonPart
 *  net.minecraft.world.entity.decoration.BlockAttachedEntity
 *  net.minecraft.world.entity.decoration.HangingEntity
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.CarpetBlock
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.level.material.Fluids
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  net.minecraft.world.ticks.LevelChunkTicks
 *  net.minecraft.world.ticks.ScheduledTick
 *  net.minecraft.world.ticks.TickPriority
 *  org.apache.commons.lang3.tuple.Pair
 *  org.jetbrains.annotations.ApiStatus$Experimental
 *  org.jetbrains.annotations.VisibleForTesting
 */
package fi.dy.masa.litematica.schematic;

import com.google.common.collect.ImmutableMap;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.mixin.world.IMixinLevelTicks;
import fi.dy.masa.litematica.network.ServuxLitematicaHandler;
import fi.dy.masa.litematica.network.ServuxLitematicaPacket;
import fi.dy.masa.litematica.schematic.SchematicMetadata;
import fi.dy.masa.litematica.schematic.SchematicSchema;
import fi.dy.masa.litematica.schematic.SchematicaSchematic;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePalette;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionFixers;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import fi.dy.masa.litematica.schematic.conversion.SchematicConverter;
import fi.dy.masa.litematica.schematic.conversion.SchematicDowngradeConverter;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.transmit.SchematicBufferManager;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.BlockUtils;
import fi.dy.masa.litematica.util.DataFixerMode;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.litematica.util.SchematicPlacingUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.util.FileNameUtils;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Schema;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import fi.dy.masa.malilib.util.nbt.NbtView;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.PositionUtils;
import it.unimi.dsi.fastutil.longs.Long2ObjectMap;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.SharedConstants;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderGetter;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.Registry;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.SectionPos;
import net.minecraft.core.Vec3i;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.LongArrayTag;
import net.minecraft.nbt.Tag;
import net.minecraft.resources.Identifier;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.Mth;
import net.minecraft.world.Container;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.boss.enderdragon.EnderDragonPart;
import net.minecraft.world.entity.decoration.BlockAttachedEntity;
import net.minecraft.world.entity.decoration.HangingEntity;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CarpetBlock;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.material.Fluids;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.ticks.LevelChunkTicks;
import net.minecraft.world.ticks.ScheduledTick;
import net.minecraft.world.ticks.TickPriority;
import org.apache.commons.lang3.tuple.Pair;
import org.jetbrains.annotations.ApiStatus;
import org.jetbrains.annotations.VisibleForTesting;

public class LitematicaSchematic {
    public static final String FILE_EXTENSION = ".litematic";
    public static final int SCHEMATIC_VERSION_1_13_2 = 5;
    public static final int MINECRAFT_DATA_VERSION_1_12 = 1139;
    public static final int MINECRAFT_DATA_VERSION_1_13_2 = 1631;
    public static final int MINECRAFT_DATA_VERSION_1_20_4 = 3700;
    public static final int MINECRAFT_DATA_VERSION = SharedConstants.getCurrentVersion().dataVersion().version();
    public static final int SCHEMATIC_VERSION = 7;
    public static final int SCHEMATIC_VERSION_SUB = 1;
    private final Map<String, LitematicaBlockStateContainer> blockContainers = new HashMap<String, LitematicaBlockStateContainer>();
    private final Map<String, Map<BlockPos, CompoundTag>> tileEntities = new HashMap<String, Map<BlockPos, CompoundTag>>();
    private final Map<String, Map<BlockPos, ScheduledTick<Block>>> pendingBlockTicks = new HashMap<String, Map<BlockPos, ScheduledTick<Block>>>();
    private final Map<String, Map<BlockPos, ScheduledTick<Fluid>>> pendingFluidTicks = new HashMap<String, Map<BlockPos, ScheduledTick<Fluid>>>();
    private final Map<String, List<EntityInfo>> entities = new HashMap<String, List<EntityInfo>>();
    private final Map<String, BlockPos> subRegionPositions = new HashMap<String, BlockPos>();
    private final Map<String, BlockPos> subRegionSizes = new HashMap<String, BlockPos>();
    private final SchematicMetadata metadata = new SchematicMetadata();
    private final SchematicConverter converter;
    private int totalBlocksReadFromWorld;
    @Nullable
    private final Path schematicFile;
    private final FileType schematicType;

    public LitematicaSchematic(Path file, CompoundTag nbt, FileType type) {
        this.readFromNBT(nbt);
        this.schematicFile = file;
        this.schematicType = type;
        this.converter = SchematicConverter.createForLitematica();
    }

    private LitematicaSchematic(@Nullable Path file) {
        this(file, FileType.LITEMATICA_SCHEMATIC);
    }

    private LitematicaSchematic(@Nullable Path file, FileType schematicType) {
        this.schematicFile = file;
        this.schematicType = schematicType;
        this.converter = SchematicConverter.createForLitematica();
    }

    @Nullable
    public Path getFile() {
        return this.schematicFile;
    }

    public Vec3i getTotalSize() {
        return this.metadata.getEnclosingSize();
    }

    public int getTotalBlocksReadFromWorld() {
        return this.totalBlocksReadFromWorld;
    }

    public SchematicMetadata getMetadata() {
        return this.metadata;
    }

    public int getSubRegionCount() {
        return this.blockContainers.size();
    }

    @Nullable
    public BlockPos getSubRegionPosition(String areaName) {
        return this.subRegionPositions.get(areaName);
    }

    public Map<String, BlockPos> getAreaPositions() {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        for (String name : this.subRegionPositions.keySet()) {
            BlockPos pos = this.subRegionPositions.get(name);
            builder.put((Object)name, (Object)pos);
        }
        return builder.build();
    }

    public Map<String, BlockPos> getAreaSizes() {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        for (String name : this.subRegionSizes.keySet()) {
            BlockPos pos = this.subRegionSizes.get(name);
            builder.put((Object)name, (Object)pos);
        }
        return builder.build();
    }

    @Nullable
    public BlockPos getAreaSize(String regionName) {
        return this.subRegionSizes.get(regionName);
    }

    @Nullable
    public Vec3i getAreaSizeAsVec3i(String regionName) {
        return (Vec3i)this.subRegionSizes.get(regionName);
    }

    public Map<String, Box> getAreas() {
        ImmutableMap.Builder builder = ImmutableMap.builder();
        for (String name : this.subRegionPositions.keySet()) {
            BlockPos pos = this.subRegionPositions.get(name);
            BlockPos posEndRel = fi.dy.masa.litematica.util.PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)this.subRegionSizes.get(name));
            Box box = new Box(pos, pos.offset((Vec3i)posEndRel), name);
            builder.put((Object)name, (Object)box);
        }
        return builder.build();
    }

    @Nullable
    public static LitematicaSchematic createFromWorld(Level world, AreaSelection area, SchematicSaveInfo info, String author, IStringConsumer feedback) {
        List<Box> boxes = fi.dy.masa.litematica.util.PositionUtils.getValidBoxes(area);
        if (boxes.isEmpty()) {
            feedback.setString(StringUtils.translate((String)"litematica.error.schematic.create.no_selections", (Object[])new Object[0]));
            return null;
        }
        LitematicaSchematic schematic = new LitematicaSchematic(null);
        long time = System.currentTimeMillis();
        BlockPos origin = area.getEffectiveOrigin();
        schematic.setSubRegionPositions(boxes, origin);
        schematic.setSubRegionSizes(boxes);
        schematic.takeBlocksFromWorld(world, boxes, info);
        if (!info.ignoreEntities) {
            schematic.takeEntitiesFromWorld(world, boxes, origin);
        }
        schematic.metadata.setAuthor(author);
        schematic.metadata.setName(area.getName());
        schematic.metadata.setTimeCreated(time);
        schematic.metadata.setTimeModified(time);
        schematic.metadata.setRegionCount(boxes.size());
        schematic.metadata.setTotalVolume(fi.dy.masa.litematica.util.PositionUtils.getTotalVolume(boxes));
        schematic.metadata.setEnclosingSize(fi.dy.masa.litematica.util.PositionUtils.getEnclosingAreaSize(boxes));
        schematic.metadata.setTotalBlocks(schematic.totalBlocksReadFromWorld);
        schematic.metadata.setSchematicVersion(7);
        schematic.metadata.setMinecraftDataVersion(MINECRAFT_DATA_VERSION);
        schematic.metadata.setFileType(FileType.LITEMATICA_SCHEMATIC);
        return schematic;
    }

    public static LitematicaSchematic createEmptySchematic(AreaSelection area, String author) {
        List<Box> boxes = fi.dy.masa.litematica.util.PositionUtils.getValidBoxes(area);
        if (boxes.isEmpty()) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)StringUtils.translate((String)"litematica.error.schematic.create.no_selections", (Object[])new Object[0]), (Object[])new Object[0]);
            return null;
        }
        LitematicaSchematic schematic = new LitematicaSchematic(null);
        schematic.setSubRegionPositions(boxes, area.getEffectiveOrigin());
        schematic.setSubRegionSizes(boxes);
        schematic.metadata.setAuthor(author);
        schematic.metadata.setName(area.getName());
        schematic.metadata.setRegionCount(boxes.size());
        schematic.metadata.setTotalVolume(fi.dy.masa.litematica.util.PositionUtils.getTotalVolume(boxes));
        schematic.metadata.setEnclosingSize(fi.dy.masa.litematica.util.PositionUtils.getEnclosingAreaSize(boxes));
        schematic.metadata.setSchematicVersion(7);
        schematic.metadata.setMinecraftDataVersion(MINECRAFT_DATA_VERSION);
        schematic.metadata.setFileType(FileType.LITEMATICA_SCHEMATIC);
        for (Box box : boxes) {
            String regionName = box.getName();
            BlockPos size = box.getSize();
            int sizeX = Math.abs(size.getX());
            int sizeY = Math.abs(size.getY());
            int sizeZ = Math.abs(size.getZ());
            LitematicaBlockStateContainer container = new LitematicaBlockStateContainer(sizeX, sizeY, sizeZ);
            schematic.blockContainers.put(regionName, container);
            schematic.tileEntities.put(regionName, new HashMap());
            schematic.entities.put(regionName, new ArrayList());
            schematic.pendingBlockTicks.put(regionName, new HashMap());
            schematic.pendingFluidTicks.put(regionName, new HashMap());
        }
        return schematic;
    }

    public static LitematicaSchematic createEmptySchematicFromExisting(@Nonnull LitematicaSchematic existing, String newAuthor) {
        LitematicaSchematic newSchematic = new LitematicaSchematic(null, existing.schematicType);
        if (!newAuthor.isEmpty()) {
            newSchematic.metadata.setAuthor(newAuthor);
        } else {
            newSchematic.metadata.setAuthor(existing.getMetadata().getAuthor());
        }
        newSchematic.metadata.setName(existing.getMetadata().getName());
        newSchematic.metadata.setDescription(existing.getMetadata().getDescription());
        newSchematic.metadata.setTimeCreated(existing.getMetadata().getTimeCreated());
        newSchematic.metadata.setTimeModifiedToNow();
        newSchematic.metadata.setRegionCount(existing.getMetadata().getRegionCount());
        newSchematic.metadata.setTotalVolume(existing.getMetadata().getTotalVolume());
        newSchematic.metadata.setTotalBlocks(existing.getMetadata().getTotalBlocks());
        newSchematic.metadata.setEnclosingSize(existing.getMetadata().getEnclosingSize());
        newSchematic.metadata.setSchematicVersion(existing.getMetadata().getSchematicVersion());
        newSchematic.metadata.setMinecraftDataVersion(existing.getMetadata().getMinecraftDataVersion());
        newSchematic.metadata.setFileType(existing.getMetadata().getFileType());
        return newSchematic;
    }

    public boolean downgradeV7toV6Schematic(LitematicaSchematic v7Schematic) {
        Map<String, Box> areas = v7Schematic.getAreas();
        for (Box box : areas.values()) {
            String regionName = box.getName();
            BlockPos size = box.getSize();
            int sizeX = Math.abs(size.getX());
            int sizeY = Math.abs(size.getY());
            int sizeZ = Math.abs(size.getZ());
            this.blockContainers.put(regionName, v7Schematic.blockContainers.get(regionName));
            this.tileEntities.put(regionName, this.downgradeTileEntities_to_1_20_4(v7Schematic.tileEntities.get(regionName), MINECRAFT_DATA_VERSION));
            ListTag list = this.writeEntitiesToNBT(v7Schematic.entities.get(regionName));
            list = this.downgradeEntities_to_1_20_4(list, MINECRAFT_DATA_VERSION);
            this.entities.put(regionName, this.readEntitiesFromNBT(list));
            this.pendingBlockTicks.put(regionName, v7Schematic.pendingBlockTicks.get(regionName));
            this.pendingFluidTicks.put(regionName, v7Schematic.pendingFluidTicks.get(regionName));
            this.subRegionPositions.put(regionName, v7Schematic.subRegionPositions.get(regionName));
            this.subRegionSizes.put(regionName, v7Schematic.subRegionSizes.get(regionName));
        }
        return false;
    }

    public void takeEntityDataFromSchematicaSchematic(SchematicaSchematic schematic, String subRegionName) {
        this.tileEntities.put(subRegionName, schematic.getTiles());
        this.entities.put(subRegionName, schematic.getEntities());
    }

    public boolean placeToWorld(Level world, SchematicPlacement schematicPlacement, boolean notifyNeighbors) {
        return this.placeToWorld(world, schematicPlacement, notifyNeighbors, false);
    }

    public boolean placeToWorld(Level world, SchematicPlacement schematicPlacement, boolean notifyNeighbors, boolean ignoreEntities) {
        WorldUtils.setShouldPreventBlockUpdates(world, true);
        ImmutableMap<String, SubRegionPlacement> relativePlacements = schematicPlacement.getEnabledRelativeSubRegionPlacements();
        BlockPos origin = schematicPlacement.getOrigin();
        for (String regionName : relativePlacements.keySet()) {
            SubRegionPlacement placement = (SubRegionPlacement)relativePlacements.get((Object)regionName);
            if (placement == null || !placement.isEnabled()) continue;
            BlockPos regionPos = placement.getPos();
            BlockPos regionSize = this.subRegionSizes.get(regionName);
            LitematicaBlockStateContainer container = this.blockContainers.get(regionName);
            Map<BlockPos, CompoundTag> tileMap = this.tileEntities.get(regionName);
            List<EntityInfo> entityList = this.entities.get(regionName);
            Map<BlockPos, ScheduledTick<Block>> scheduledBlockTicks = this.pendingBlockTicks.get(regionName);
            Map<BlockPos, ScheduledTick<Fluid>> scheduledFluidTicks = this.pendingFluidTicks.get(regionName);
            if (regionPos != null && regionSize != null && container != null && tileMap != null) {
                this.placeBlocksToWorld(world, origin, regionPos, regionSize, schematicPlacement, placement, container, tileMap, scheduledBlockTicks, scheduledFluidTicks, notifyNeighbors);
            } else {
                Litematica.LOGGER.warn("Invalid/missing schematic data in schematic '{}' for sub-region '{}'", (Object)this.metadata.getName(), (Object)regionName);
            }
            if (!(ignoreEntities || schematicPlacement.ignoreEntities() || placement.ignoreEntities() || entityList == null)) {
                this.placeEntitiesToWorld(world, origin, regionPos, regionSize, schematicPlacement, placement, entityList);
                continue;
            }
            Litematica.LOGGER.error("[Schem] Unable to place entites to world. (Ignore entities on?)");
        }
        WorldUtils.setShouldPreventBlockUpdates(world, false);
        return true;
    }

    private boolean placeBlocksToWorld(Level world, BlockPos origin, BlockPos regionPos, BlockPos regionSize, SchematicPlacement schematicPlacement, SubRegionPlacement placement, LitematicaBlockStateContainer container, Map<BlockPos, CompoundTag> tileMap, @Nullable Map<BlockPos, ScheduledTick<Block>> scheduledBlockTicks, @Nullable Map<BlockPos, ScheduledTick<Fluid>> scheduledFluidTicks, boolean notifyNeighbors) {
        BlockPos posEndRelSub = fi.dy.masa.litematica.util.PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)regionSize);
        BlockPos posEndRel = posEndRelSub.offset((Vec3i)regionPos);
        BlockPos posMinRel = fi.dy.masa.litematica.util.PositionUtils.getMinCorner(regionPos, posEndRel);
        BlockPos regionPosTransformed = fi.dy.masa.litematica.util.PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        BlockPos regionPosAbs = regionPosTransformed.offset((Vec3i)origin);
        int sizeX = Math.abs(regionSize.getX());
        int sizeY = Math.abs(regionSize.getY());
        int sizeZ = Math.abs(regionSize.getZ());
        BlockState barrier = Blocks.BARRIER.defaultBlockState();
        boolean ignoreInventories = Configs.Generic.PASTE_IGNORE_INVENTORY.getBooleanValue();
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        ReplaceBehavior replace = (ReplaceBehavior)Configs.Generic.PASTE_REPLACE_BEHAVIOR.getOptionListValue();
        Rotation rotationCombined = schematicPlacement.getRotation().getRotated(placement.getRotation());
        Mirror mirrorMain = schematicPlacement.getMirror();
        Mirror mirrorSub = placement.getMirror();
        if (mirrorSub != Mirror.NONE && (schematicPlacement.getRotation() == Rotation.CLOCKWISE_90 || schematicPlacement.getRotation() == Rotation.COUNTERCLOCKWISE_90)) {
            mirrorSub = mirrorSub == Mirror.FRONT_BACK ? Mirror.LEFT_RIGHT : Mirror.FRONT_BACK;
        }
        int bottomY = world.getMinY();
        int topY = world.getMaxY() + 1;
        int tmp = posMinRel.getY() - regionPos.getY() + regionPosTransformed.getY() + origin.getY();
        int startY = 0;
        int endY = sizeY;
        if (tmp < bottomY) {
            startY += bottomY - tmp;
        }
        if ((tmp = posMinRel.getY() - regionPos.getY() + regionPosTransformed.getY() + origin.getY() + (endY - 1)) > topY) {
            endY -= tmp - topY;
        }
        for (int y = startY; y < endY; ++y) {
            for (int z = 0; z < sizeZ; ++z) {
                for (int x = 0; x < sizeX; ++x) {
                    BlockEntity te;
                    BlockState state = container.get(x, y, z);
                    if (state.getBlock() == Blocks.STRUCTURE_VOID) continue;
                    posMutable.set(x, y, z);
                    CompoundTag teNBT = tileMap.get(posMutable);
                    posMutable.set(posMinRel.getX() + x - regionPos.getX(), posMinRel.getY() + y - regionPos.getY(), posMinRel.getZ() + z - regionPos.getZ());
                    BlockPos pos = fi.dy.masa.litematica.util.PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                    pos = pos.offset((Vec3i)regionPosTransformed).offset((Vec3i)origin);
                    BlockState stateOld = world.getBlockState(pos);
                    if (replace == ReplaceBehavior.NONE && !stateOld.isAir() || replace == ReplaceBehavior.WITH_NON_AIR && state.isAir()) continue;
                    if (mirrorMain != Mirror.NONE) {
                        state = state.mirror(mirrorMain);
                    }
                    if (mirrorSub != Mirror.NONE) {
                        state = state.mirror(mirrorSub);
                    }
                    if (rotationCombined != Rotation.NONE) {
                        state = state.rotate(rotationCombined);
                    }
                    if (stateOld == state && !state.hasBlockEntity()) continue;
                    BlockEntity teOld = world.getBlockEntity(pos);
                    if (teOld != null) {
                        if (teOld instanceof Container) {
                            ((Container)teOld).clearContent();
                        }
                        world.setBlock(pos, barrier, 20);
                    }
                    if (!world.setBlock(pos, state, 18) || teNBT == null || (te = world.getBlockEntity(pos)) == null) continue;
                    teNBT = teNBT.copy();
                    teNBT.putInt("x", pos.getX());
                    teNBT.putInt("y", pos.getY());
                    teNBT.putInt("z", pos.getZ());
                    if (ignoreInventories) {
                        teNBT.remove("Items");
                    }
                    try {
                        NbtView view = NbtView.getReader((CompoundTag)teNBT, (RegistryAccess)world.registryAccess());
                        te.loadWithComponents(view.getReader());
                        if (!ignoreInventories || !(te instanceof Container)) continue;
                        ((Container)te).clearContent();
                        continue;
                    }
                    catch (Exception e) {
                        Litematica.LOGGER.warn("Failed to load TileEntity data for {} @ {}", (Object)state, (Object)pos);
                    }
                }
            }
        }
        return true;
    }

    private void placeEntitiesToWorld(Level world, BlockPos origin, BlockPos regionPos, BlockPos regionSize, SchematicPlacement schematicPlacement, SubRegionPlacement placement, List<EntityInfo> entityList) {
        BlockPos regionPosRelTransformed = fi.dy.masa.litematica.util.PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        int offX = regionPosRelTransformed.getX() + origin.getX();
        int offY = regionPosRelTransformed.getY() + origin.getY();
        int offZ = regionPosRelTransformed.getZ() + origin.getZ();
        Rotation rotationCombined = schematicPlacement.getRotation().getRotated(placement.getRotation());
        Mirror mirrorMain = schematicPlacement.getMirror();
        Mirror mirrorSub = placement.getMirror();
        if (mirrorSub != Mirror.NONE && (schematicPlacement.getRotation() == Rotation.CLOCKWISE_90 || schematicPlacement.getRotation() == Rotation.COUNTERCLOCKWISE_90)) {
            mirrorSub = mirrorSub == Mirror.FRONT_BACK ? Mirror.LEFT_RIGHT : Mirror.FRONT_BACK;
        }
        Litematica.LOGGER.warn("[Schem] placeEntitiesToWorld: entityList size [{}]", (Object)entityList.size());
        for (EntityInfo info : entityList) {
            Entity entity = EntityUtils.createEntityAndPassengersFromNBT(info.nbt, world);
            if (entity != null) {
                Vec3 pos = info.posVec;
                pos = fi.dy.masa.litematica.util.PositionUtils.getTransformedPosition(pos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
                pos = fi.dy.masa.litematica.util.PositionUtils.getTransformedPosition(pos, placement.getMirror(), placement.getRotation());
                double x = pos.x + (double)offX;
                double y = pos.y + (double)offY;
                double z = pos.z + (double)offZ;
                Litematica.LOGGER.warn("[Schem] placeEntitiesToWorld: entity [{}]", (Object)entity.getType().getDescription().getString());
                SchematicPlacingUtils.rotateEntity(entity, x, y, z, rotationCombined, mirrorMain, mirrorSub);
                EntityUtils.spawnEntityAndPassengersInWorld(entity, world);
                continue;
            }
            Litematica.LOGGER.error("[Schem] placeEntitiesToWorld: entity == null!");
        }
    }

    private void takeEntitiesFromWorld(Level world, List<Box> boxes, BlockPos origin) {
        for (Box box : boxes) {
            AABB bb = fi.dy.masa.litematica.util.PositionUtils.createEnclosingAABB(box.getPos1(), box.getPos2());
            BlockPos regionPosAbs = box.getPos1();
            ArrayList<EntityInfo> list = new ArrayList<EntityInfo>();
            List entities = world.getEntities((Entity)null, bb, EntityUtils.NOT_PLAYER);
            for (Entity entity : entities) {
                if (entity instanceof EnderDragonPart) continue;
                NbtView view = NbtView.getWriter((RegistryAccess)world.registryAccess());
                entity.saveWithoutId(view.getWriter());
                CompoundTag tag = view.readNbt();
                Identifier id = EntityType.getKey((EntityType)entity.getType());
                if (tag == null || id == null) continue;
                Vec3 posVec = new Vec3(entity.getX() - (double)regionPosAbs.getX(), entity.getY() - (double)regionPosAbs.getY(), entity.getZ() - (double)regionPosAbs.getZ());
                tag.putString("id", id.toString());
                NbtUtils.putVec3dCodec((CompoundTag)tag, (Vec3)posVec, (String)"Pos");
                list.add(new EntityInfo(posVec, tag));
            }
            this.entities.put(box.getName(), list);
        }
    }

    public void takeEntitiesFromWorldWithinChunk(Level world, int chunkX, int chunkZ, ImmutableMap<String, IntBoundingBox> volumes, ImmutableMap<String, Box> boxes, Set<UUID> existingEntities, BlockPos origin) {
        for (Map.Entry entry : volumes.entrySet()) {
            String regionName = (String)entry.getKey();
            List<EntityInfo> list = this.entities.get(regionName);
            Box box = (Box)boxes.get((Object)regionName);
            if (box == null || list == null) continue;
            AABB bb = fi.dy.masa.litematica.util.PositionUtils.createAABBFrom((IntBoundingBox)entry.getValue());
            List entities = world.getEntities((Entity)null, bb, EntityUtils.NOT_PLAYER);
            BlockPos regionPosAbs = box.getPos1();
            for (Entity entity : entities) {
                BlockPos p;
                UUID uuid;
                if (entity instanceof EnderDragonPart || existingEntities.contains(uuid = entity.getUUID())) continue;
                CompoundTag tag = new CompoundTag();
                if (EntityDataManager.getInstance().hasServuxServer() || EntityDataManager.getInstance().hasBackupStatus()) {
                    CompoundTag serverTags = EntityDataManager.getInstance().getFromEntityCacheNbt(entity.getId());
                    if (serverTags != null && !serverTags.isEmpty()) {
                        tag.merge(serverTags);
                    }
                } else {
                    NbtView view = NbtView.getWriter((RegistryAccess)world.registryAccess());
                    if (entity.save(view.getWriter())) {
                        tag = view.readNbt() != null ? view.readNbt() : new CompoundTag();
                        Identifier id = EntityType.getKey((EntityType)entity.getType());
                        if (tag != null && id != null) {
                            tag.putString("id", id.toString());
                            tag.putInt("LastEntityID", entity.getId());
                        }
                    }
                }
                if (tag.isEmpty()) continue;
                Vec3 posVec = new Vec3(entity.getX() - (double)regionPosAbs.getX(), entity.getY() - (double)regionPosAbs.getY(), entity.getZ() - (double)regionPosAbs.getZ());
                if (entity instanceof HangingEntity) {
                    HangingEntity decorationEntity = (HangingEntity)entity;
                    p = decorationEntity.blockPosition();
                    tag.putInt("TileX", p.getX() - regionPosAbs.getX());
                    tag.putInt("TileY", p.getY() - regionPosAbs.getY());
                    tag.putInt("TileZ", p.getZ() - regionPosAbs.getZ());
                }
                if (entity instanceof BlockAttachedEntity) {
                    BlockAttachedEntity bae = (BlockAttachedEntity)entity;
                    p = bae.getPos();
                    BlockPos pAdj = new BlockPos(p.getX() - regionPosAbs.getX(), p.getY() - regionPosAbs.getY(), p.getZ() - regionPosAbs.getZ());
                    tag.store("block_pos", BlockPos.CODEC, (Object)pAdj);
                }
                NbtUtils.putVec3dCodec((CompoundTag)tag, (Vec3)posVec, (String)"Pos");
                list.add(new EntityInfo(posVec, tag));
                existingEntities.add(uuid);
            }
        }
    }

    private void takeBlocksFromWorld(Level world, List<Box> boxes, SchematicSaveInfo info) {
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos(0, 0, 0);
        for (Box box : boxes) {
            BlockPos size = box.getSize();
            int sizeX = Math.abs(size.getX());
            int sizeY = Math.abs(size.getY());
            int sizeZ = Math.abs(size.getZ());
            LitematicaBlockStateContainer container = new LitematicaBlockStateContainer(sizeX, sizeY, sizeZ);
            HashMap<BlockPos, CompoundTag> tileEntityMap = new HashMap<BlockPos, CompoundTag>();
            HashMap blockTickMap = new HashMap();
            HashMap fluidTickMap = new HashMap();
            BlockPos minCorner = fi.dy.masa.litematica.util.PositionUtils.getMinCorner(box.getPos1(), box.getPos2());
            int startX = minCorner.getX();
            int startY = minCorner.getY();
            int startZ = minCorner.getZ();
            boolean visibleOnly = info.visibleOnly;
            boolean includeSupport = info.includeSupportBlocks;
            for (int y = 0; y < sizeY; ++y) {
                for (int z = 0; z < sizeZ; ++z) {
                    for (int x = 0; x < sizeX; ++x) {
                        BlockEntity te;
                        posMutable.set(x + startX, y + startY, z + startZ);
                        if (visibleOnly && !LitematicaSchematic.isExposed(world, (BlockPos)posMutable) && (!includeSupport || !LitematicaSchematic.isSupport(world, (BlockPos)posMutable))) continue;
                        BlockState state = world.getBlockState((BlockPos)posMutable);
                        container.set(x, y, z, state);
                        if (!state.isAir()) {
                            ++this.totalBlocksReadFromWorld;
                        }
                        if (!state.hasBlockEntity() || (te = world.getBlockEntity((BlockPos)posMutable)) == null) continue;
                        BlockPos pos = new BlockPos(x, y, z);
                        CompoundTag tag = te.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess());
                        NbtUtils.writeBlockPosToTag((BlockPos)pos, (CompoundTag)tag);
                        tileEntityMap.put(pos, tag);
                    }
                }
            }
            if (world instanceof ServerLevel) {
                ServerLevel serverWorld = (ServerLevel)world;
                IntBoundingBox tickBox = IntBoundingBox.createProper((int)startX, (int)startY, (int)startZ, (int)(startX + sizeX), (int)(startY + sizeY), (int)(startZ + sizeZ));
                long currentTick = world.getGameTime();
                this.getTicksFromScheduler(((IMixinLevelTicks)serverWorld.getBlockTicks()).litematica_getChunkTickSchedulers(), blockTickMap, tickBox, minCorner, currentTick);
                this.getTicksFromScheduler(((IMixinLevelTicks)serverWorld.getFluidTicks()).litematica_getChunkTickSchedulers(), fluidTickMap, tickBox, minCorner, currentTick);
            }
            this.blockContainers.put(box.getName(), container);
            this.tileEntities.put(box.getName(), tileEntityMap);
            this.pendingBlockTicks.put(box.getName(), blockTickMap);
            this.pendingFluidTicks.put(box.getName(), fluidTickMap);
        }
    }

    private <T> void getTicksFromScheduler(Long2ObjectMap<LevelChunkTicks<T>> chunkTickSchedulers, Map<BlockPos, ScheduledTick<T>> outputMap, IntBoundingBox box, BlockPos minCorner, long currentTick) {
        int minCX = SectionPos.blockToSectionCoord((int)box.minX());
        int minCZ = SectionPos.blockToSectionCoord((int)box.minZ());
        int maxCX = SectionPos.blockToSectionCoord((int)box.maxX());
        int maxCZ = SectionPos.blockToSectionCoord((int)box.maxZ());
        for (int cx = minCX; cx <= maxCX; ++cx) {
            for (int cz = minCZ; cz <= maxCZ; ++cz) {
                long cp = ChunkPos.pack((int)cx, (int)cz);
                LevelChunkTicks chunkTickScheduler = (LevelChunkTicks)chunkTickSchedulers.get(cp);
                if (chunkTickScheduler == null) continue;
                chunkTickScheduler.getAll().filter(t -> box.contains((Vec3i)t.pos())).forEach(t -> this.addRelativeTickToMap(outputMap, (ScheduledTick)t, minCorner, currentTick));
            }
        }
    }

    private <T> void addRelativeTickToMap(Map<BlockPos, ScheduledTick<T>> outputMap, ScheduledTick<T> tick, BlockPos minCorner, long currentTick) {
        BlockPos pos = tick.pos();
        BlockPos relativePos = new BlockPos(pos.getX() - minCorner.getX(), pos.getY() - minCorner.getY(), pos.getZ() - minCorner.getZ());
        ScheduledTick newTick = new ScheduledTick(tick.type(), relativePos, tick.triggerTick() - currentTick, tick.priority(), tick.subTickOrder());
        outputMap.put(relativePos, newTick);
    }

    public static boolean isExposed(Level world, BlockPos pos) {
        for (Direction dir : PositionUtils.ALL_DIRECTIONS) {
            BlockPos posAdj = pos.relative(dir);
            BlockState stateAdj = world.getBlockState(posAdj);
            if (stateAdj.canOcclude() && stateAdj.isFaceSturdy((BlockGetter)world, posAdj, dir.getOpposite())) continue;
            return true;
        }
        return false;
    }

    public static boolean isGravityBlock(BlockState state) {
        return state.is(BlockTags.SAND) || state.is(BlockTags.CONCRETE_POWDERS) || state.getBlock() == Blocks.GRAVEL;
    }

    public static boolean isGravityBlock(Level world, BlockPos pos) {
        return LitematicaSchematic.isGravityBlock(world.getBlockState(pos));
    }

    public static boolean supportsExposedBlocks(Level world, BlockPos pos) {
        BlockPos posUp = pos.relative(Direction.UP);
        BlockState stateUp = world.getBlockState(posUp);
        while (true) {
            if (LitematicaSchematic.needsSupportNonGravity(stateUp)) {
                return true;
            }
            if (!LitematicaSchematic.isGravityBlock(stateUp)) break;
            if (LitematicaSchematic.isExposed(world, posUp)) {
                return true;
            }
            if ((posUp = posUp.relative(Direction.UP)).getY() >= world.getMaxY() + 1) break;
            stateUp = world.getBlockState(posUp);
        }
        return false;
    }

    public static boolean needsSupportNonGravity(BlockState state) {
        Block block = state.getBlock();
        return block == Blocks.REPEATER || block == Blocks.COMPARATOR || block == Blocks.SNOW || block instanceof CarpetBlock;
    }

    public static boolean isSupport(Level world, BlockPos pos) {
        BlockPos posUp = pos.relative(Direction.UP);
        BlockState stateUp = world.getBlockState(posUp);
        if (LitematicaSchematic.needsSupportNonGravity(stateUp)) {
            return true;
        }
        return LitematicaSchematic.isGravityBlock(stateUp) && (LitematicaSchematic.isExposed(world, posUp) || LitematicaSchematic.supportsExposedBlocks(world, posUp));
    }

    public void takeBlocksFromWorldWithinChunk(Level world, ImmutableMap<String, IntBoundingBox> volumes, ImmutableMap<String, Box> boxes, SchematicSaveInfo info) {
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos(0, 0, 0);
        for (Map.Entry volumeEntry : volumes.entrySet()) {
            String regionName = (String)volumeEntry.getKey();
            IntBoundingBox bb = (IntBoundingBox)volumeEntry.getValue();
            Box box = (Box)boxes.get((Object)regionName);
            if (box == null) {
                Litematica.LOGGER.error("null Box for sub-region '{}' while trying to save chunk-wise schematic", (Object)regionName);
                continue;
            }
            LitematicaBlockStateContainer container = this.blockContainers.get(regionName);
            Map<BlockPos, CompoundTag> tileEntityMap = this.tileEntities.get(regionName);
            Map blockTickMap = this.pendingBlockTicks.get(regionName);
            Map fluidTickMap = this.pendingFluidTicks.get(regionName);
            if (container == null || tileEntityMap == null || blockTickMap == null || fluidTickMap == null) {
                Litematica.LOGGER.error("null map(s) for sub-region '{}' while trying to save chunk-wise schematic", (Object)regionName);
                continue;
            }
            BlockPos minCorner = fi.dy.masa.litematica.util.PositionUtils.getMinCorner(box.getPos1(), box.getPos2());
            int offsetX = minCorner.getX();
            int offsetY = minCorner.getY();
            int offsetZ = minCorner.getZ();
            int startX = bb.minX() - minCorner.getX();
            int startY = bb.minY() - minCorner.getY();
            int startZ = bb.minZ() - minCorner.getZ();
            int endX = startX + (bb.maxX() - bb.minX());
            int endY = startY + (bb.maxY() - bb.minY());
            int endZ = startZ + (bb.maxZ() - bb.minZ());
            boolean visibleOnly = info.visibleOnly;
            boolean includeSupport = info.includeSupportBlocks;
            for (int y = startY; y <= endY; ++y) {
                for (int z = startZ; z <= endZ; ++z) {
                    for (int x = startX; x <= endX; ++x) {
                        posMutable.set(x + offsetX, y + offsetY, z + offsetZ);
                        if (visibleOnly && !LitematicaSchematic.isExposed(world, (BlockPos)posMutable) && (!includeSupport || !LitematicaSchematic.isSupport(world, (BlockPos)posMutable))) continue;
                        BlockState state = world.getBlockState((BlockPos)posMutable);
                        container.set(x, y, z, state);
                        if (!state.isAir()) {
                            ++this.totalBlocksReadFromWorld;
                        }
                        if (!state.hasBlockEntity()) continue;
                        BlockEntity te = world.getBlockEntity((BlockPos)posMutable);
                        if (EntityDataManager.getInstance().hasServuxServer()) {
                            BlockPos pos;
                            CompoundTag tag = EntityDataManager.getInstance().getFromBlockEntityCacheNbt(posMutable.immutable());
                            if (tag != null && !tag.isEmpty()) {
                                pos = new BlockPos(x, y, z);
                                NbtUtils.writeBlockPosToTag((BlockPos)pos, (CompoundTag)tag);
                                tileEntityMap.put(pos, tag);
                                continue;
                            }
                            if (te == null) continue;
                            pos = new BlockPos(x, y, z);
                            tag = te.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess());
                            NbtUtils.writeBlockPosToTag((BlockPos)pos, (CompoundTag)tag);
                            tileEntityMap.put(pos, tag);
                            continue;
                        }
                        if (te == null) continue;
                        BlockPos pos = new BlockPos(x, y, z);
                        CompoundTag tag = te.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess());
                        NbtUtils.writeBlockPosToTag((BlockPos)pos, (CompoundTag)tag);
                        tileEntityMap.put(pos, tag);
                    }
                }
            }
            if (!(world instanceof ServerLevel)) continue;
            ServerLevel serverWorld = (ServerLevel)world;
            IntBoundingBox tickBox = IntBoundingBox.createProper((int)(offsetX + startX), (int)(offsetY + startY), (int)(offsetZ + startZ), (int)(offsetX + endX + 1), (int)(offsetY + endY + 1), (int)(offsetZ + endZ + 1));
            long currentTick = world.getGameTime();
            this.getTicksFromScheduler(((IMixinLevelTicks)serverWorld.getBlockTicks()).litematica_getChunkTickSchedulers(), blockTickMap, tickBox, minCorner, currentTick);
            this.getTicksFromScheduler(((IMixinLevelTicks)serverWorld.getFluidTicks()).litematica_getChunkTickSchedulers(), fluidTickMap, tickBox, minCorner, currentTick);
        }
    }

    private void setSubRegionPositions(List<Box> boxes, BlockPos areaOrigin) {
        for (Box box : boxes) {
            this.subRegionPositions.put(box.getName(), box.getPos1().subtract((Vec3i)areaOrigin));
        }
    }

    private void setSubRegionSizes(List<Box> boxes) {
        for (Box box : boxes) {
            this.subRegionSizes.put(box.getName(), box.getSize());
        }
    }

    @Nullable
    public LitematicaBlockStateContainer getSubRegionContainer(String regionName) {
        return this.blockContainers.get(regionName);
    }

    @Nullable
    public Map<BlockPos, CompoundTag> getBlockEntityMapForRegion(String regionName) {
        return this.tileEntities.get(regionName);
    }

    @Nullable
    public List<EntityInfo> getEntityListForRegion(String regionName) {
        return this.entities.get(regionName);
    }

    @Nullable
    public Map<BlockPos, ScheduledTick<Block>> getScheduledBlockTicksForRegion(String regionName) {
        return this.pendingBlockTicks.get(regionName);
    }

    @Nullable
    public Map<BlockPos, ScheduledTick<Fluid>> getScheduledFluidTicksForRegion(String regionName) {
        return this.pendingFluidTicks.get(regionName);
    }

    public CompoundTag writeToNBT() {
        CompoundTag nbt = new CompoundTag();
        nbt.putInt("MinecraftDataVersion", MINECRAFT_DATA_VERSION);
        nbt.putInt("Version", 7);
        nbt.putInt("SubVersion", 1);
        nbt.put("Metadata", (Tag)this.metadata.writeToNBT());
        nbt.put("Regions", (Tag)this.writeSubRegionsToNBT());
        return nbt;
    }

    public CompoundTag writeToNBT_v6() {
        CompoundTag nbt = new CompoundTag();
        nbt.putInt("MinecraftDataVersion", 3700);
        nbt.putInt("Version", 6);
        nbt.putInt("SubVersion", 1);
        nbt.put("Metadata", (Tag)this.metadata.writeToNBT());
        nbt.put("Regions", (Tag)this.writeSubRegionsToNBT());
        return nbt;
    }

    private CompoundTag writeSubRegionsToNBT() {
        CompoundTag wrapper = new CompoundTag();
        if (!this.blockContainers.isEmpty()) {
            for (String regionName : this.blockContainers.keySet()) {
                LitematicaBlockStateContainer blockContainer = this.blockContainers.get(regionName);
                Map<BlockPos, CompoundTag> tileMap = this.tileEntities.get(regionName);
                List<EntityInfo> entityList = this.entities.get(regionName);
                Map pendingBlockTicks = this.pendingBlockTicks.get(regionName);
                Map pendingFluidTicks = this.pendingFluidTicks.get(regionName);
                CompoundTag tag = new CompoundTag();
                tag.put("BlockStatePalette", (Tag)blockContainer.getPalette().writeToNBT());
                tag.put("BlockStates", (Tag)new LongArrayTag(blockContainer.getBackingLongArray()));
                tag.put("TileEntities", (Tag)this.writeTileEntitiesToNBT(tileMap));
                if (pendingBlockTicks != null) {
                    tag.put("PendingBlockTicks", (Tag)this.writePendingTicksToNBT(pendingBlockTicks, (Registry)BuiltInRegistries.BLOCK, "Block"));
                }
                if (pendingFluidTicks != null) {
                    tag.put("PendingFluidTicks", (Tag)this.writePendingTicksToNBT(pendingFluidTicks, (Registry)BuiltInRegistries.FLUID, "Fluid"));
                }
                if (entityList != null) {
                    tag.put("Entities", (Tag)this.writeEntitiesToNBT(entityList));
                }
                BlockPos pos = this.subRegionPositions.get(regionName);
                tag.put("Position", (Tag)NbtUtils.createBlockPosTag((BlockPos)pos));
                pos = this.subRegionSizes.get(regionName);
                tag.put("Size", (Tag)NbtUtils.createBlockPosTag((BlockPos)pos));
                wrapper.put(regionName, (Tag)tag);
            }
        }
        return wrapper;
    }

    private ListTag writeEntitiesToNBT(List<EntityInfo> entityList) {
        ListTag tagList = new ListTag();
        if (!entityList.isEmpty()) {
            for (EntityInfo info : entityList) {
                tagList.add((Object)info.nbt);
            }
        }
        return tagList;
    }

    private <T> ListTag writePendingTicksToNBT(Map<BlockPos, ScheduledTick<T>> tickMap, Registry<T> registry, String tagName) {
        ListTag tagList = new ListTag();
        if (!tickMap.isEmpty()) {
            for (ScheduledTick<T> entry : tickMap.values()) {
                Object target = entry.type();
                Identifier id = registry.getKey(target);
                if (id == null) continue;
                CompoundTag tag = new CompoundTag();
                tag.putString(tagName, id.toString());
                tag.putInt("Priority", entry.priority().getValue());
                tag.putLong("SubTick", entry.subTickOrder());
                tag.putInt("Time", (int)entry.triggerTick());
                tag.putInt("x", entry.pos().getX());
                tag.putInt("y", entry.pos().getY());
                tag.putInt("z", entry.pos().getZ());
                tagList.add((Object)tag);
            }
        }
        return tagList;
    }

    private ListTag writeTileEntitiesToNBT(Map<BlockPos, CompoundTag> tileMap) {
        ListTag tagList = new ListTag();
        if (!tileMap.isEmpty()) {
            tagList.addAll(tileMap.values());
        }
        return tagList;
    }

    @Deprecated(forRemoval=true)
    @ApiStatus.Experimental
    public void sendTransmitFile(CompoundTag nbtIn, long sessionKey, boolean printMessage) {
        int totalSlices;
        long totalBytes;
        if (!EntityDataManager.getInstance().hasServuxServer()) {
            if (printMessage) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.schematic_transmit_not_available", (Object[])new Object[0]);
            }
            Litematica.LOGGER.error("sendTransmitFile: Cannot transmit a Litematic without having Servux present.");
            return;
        }
        if (printMessage) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.schematic_transmit_start", (Object[])new Object[0]);
        }
        Path file = this.getFile();
        CompoundTag output = new CompoundTag();
        int bufferSize = 16384;
        try {
            totalBytes = Files.size(file);
            totalSlices = (int)((totalBytes + 16384L - 1L) / 16384L);
        }
        catch (IOException e) {
            Litematica.LOGGER.error("sendTransmitFile: Unable to read file size; {}", (Object)e.getLocalizedMessage());
            return;
        }
        output.putString("Task", "Litematic-TransmitStart");
        output.store("FileType", FileType.CODEC, (Object)this.schematicType);
        output.putLong("SliceKey", sessionKey);
        output.putInt("TotalSlices", totalSlices);
        output.putLong("TotalSize", totalBytes);
        if (!nbtIn.isEmpty()) {
            output.put("PlacementData", (Tag)nbtIn);
        }
        ServuxLitematicaHandler.getInstance().encodeClientData(ServuxLitematicaPacket.ResponseC2SStart(output));
        output.putLong("SliceKey", sessionKey);
        byte[] buffer = new byte[16384];
        int currentSlice = 0;
        try (InputStream is = Files.newInputStream(file, new OpenOption[0]);){
            int bytesRead = 0;
            output.putString("Task", "Litematic-TransmitData");
            while ((bytesRead = is.read(buffer, 0, 16384)) != -1) {
                output.remove("Slice");
                output.remove("Size");
                output.remove("Data");
                output.putInt("Slice", totalSlices);
                output.putInt("Size", bytesRead);
                byte[] correctedData = new byte[bytesRead];
                System.arraycopy(buffer, 0, correctedData, 0, bytesRead);
                output.putByteArray("Data", correctedData);
                ServuxLitematicaHandler.getInstance().encodeClientData(ServuxLitematicaPacket.ResponseC2SStart(output));
                ++currentSlice;
            }
        }
        catch (Exception err) {
            if (printMessage) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.schematic_transmit_fail", (Object[])new Object[0]);
            }
            output = new CompoundTag();
            output.putLong("SliceKey", sessionKey);
            output.putString("Task", "Litematic-TransmitCancel");
            ServuxLitematicaHandler.getInstance().encodeClientData(ServuxLitematicaPacket.ResponseC2SStart(output));
            Litematica.LOGGER.error("sendTransmitFile: Exception reading file; {}", (Object)err.getLocalizedMessage());
            return;
        }
        output.remove("Slice");
        output.remove("Size");
        output.remove("Data");
        output.putString("Task", "Litematic-TransmitEnd");
        ServuxLitematicaHandler.getInstance().encodeClientData(ServuxLitematicaPacket.ResponseC2SStart(output));
        Litematica.debugLog("sendTransmitFile: Transmitted file '{}', [tS: {}, tB: {}]", file.toAbsolutePath().toString(), totalSlices, totalBytes);
        if (printMessage) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.schematic_transmit_complete", (Object[])new Object[]{totalBytes});
        }
    }

    @Deprecated(forRemoval=true)
    @Nullable
    @ApiStatus.Experimental
    public static Pair<LitematicaSchematic, CompoundTag> receiveFileTransmit(CompoundTag nbt) {
        SchematicBufferManager manager = DataManager.getSchematicBufferManager();
        String task = nbt.getStringOr("Task", "");
        long key = nbt.getLongOr("SliceKey", -1L);
        if (task.isEmpty() || key == -1L) {
            Litematica.LOGGER.error("receiveFileTransmit: Invalid sessionKey or Task received.");
            return null;
        }
        switch (task) {
            case "Litematic-TransmitStart": {
                FileType type = nbt.read("FileType", FileType.CODEC).orElse(FileType.LITEMATICA_SCHEMATIC);
                int totalSlices = nbt.getIntOr("TotalSlices", 1);
                long totalSize = nbt.getLongOr("TotalSize", -1L);
                manager.createBuffer(totalSlices, totalSize, type, key, nbt.getCompoundOrEmpty("PlacementData"));
                break;
            }
            case "Litematic-TransmitData": {
                int slice = nbt.getIntOr("Slice", -1);
                int size = nbt.getIntOr("Size", -1);
                byte[] data = nbt.getByteArray("Data").orElse(new byte[0]);
                if (slice < 0 || size < 0 || data.length == 0) {
                    Litematica.LOGGER.error("receiveFileTransmit: Invalid Slice Data received for session key [{}]", (Object)key);
                    return null;
                }
                manager.receiveSlice(key, slice, data, size);
                break;
            }
            case "Litematic-TransmitCancel": {
                Litematica.LOGGER.warn("receiveFileTransmit: Cancel received for session key [{}]", (Object)key);
                manager.cancelBuffer(key);
                break;
            }
            case "Litematic-TransmitEnd": {
                int totalSlices = nbt.getIntOr("TotalSlices", -1);
                long totalSize = nbt.getLongOr("TotalSize", -1L);
                Path dir = DataManager.getSchematicTransmitDirectory();
                CompoundTag optional = manager.getOptionalNbt(key);
                LitematicaSchematic schematic = manager.finishBuffer(key, dir);
                if (schematic == null) {
                    Litematica.LOGGER.warn("receiveFileTransmit: Failed to create Schematic for finishing session key [{}]", (Object)key);
                    return null;
                }
                Litematica.LOGGER.warn("receiveFileTransmit: Received file '{}', [tS: {}, tB: {}]", (Object)schematic.getFile().getFileName().toString(), (Object)totalSlices, (Object)totalSize);
                return Pair.of((Object)schematic, (Object)optional);
            }
            default: {
                Litematica.LOGGER.error("receiveFileTransmit: Invalid sessionKey or Task received.");
            }
        }
        return null;
    }

    private boolean readFromNBT(CompoundTag nbt) {
        this.blockContainers.clear();
        this.tileEntities.clear();
        this.entities.clear();
        this.pendingBlockTicks.clear();
        this.subRegionPositions.clear();
        this.subRegionSizes.clear();
        if (nbt.contains("Version")) {
            int minecraftDataVersion;
            int version = nbt.getIntOr("Version", -1);
            int n = minecraftDataVersion = nbt.contains("MinecraftDataVersion") ? nbt.getIntOr("MinecraftDataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
            if (version >= 1 && version <= 7) {
                if (minecraftDataVersion - MINECRAFT_DATA_VERSION > 100) {
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.error.schematic_load.newer_minecraft_version", (Object[])new Object[]{minecraftDataVersion, MINECRAFT_DATA_VERSION});
                }
                this.metadata.readFromNBT(nbt.getCompoundOrEmpty("Metadata"));
                this.metadata.setSchematicVersion(version);
                this.metadata.setMinecraftDataVersion(minecraftDataVersion);
                this.metadata.setFileType(FileType.LITEMATICA_SCHEMATIC);
                try {
                    this.readSubRegionsFromNBT(nbt.getCompoundOrEmpty("Regions"), version, minecraftDataVersion);
                }
                catch (OutOfMemoryError e) {
                    this.blockContainers.clear();
                    this.tileEntities.clear();
                    this.entities.clear();
                    this.pendingBlockTicks.clear();
                    this.subRegionPositions.clear();
                    this.subRegionSizes.clear();
                    System.gc();
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_load.out_of_memory", (Object[])new Object[]{e.getLocalizedMessage()});
                    return false;
                }
                return true;
            }
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_load.unsupported_schematic_version", (Object[])new Object[]{version});
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_load.no_schematic_version_information", (Object[])new Object[0]);
        }
        return false;
    }

    private void readSubRegionsFromNBT(CompoundTag tag, int version, int minecraftDataVersion) {
        for (String regionName : tag.keySet()) {
            Tag nbtBase;
            ListTag list;
            if (tag.get(regionName).getId() != 10) continue;
            CompoundTag regionTag = tag.getCompoundOrEmpty(regionName);
            BlockPos regionPos = NbtUtils.readBlockPos((CompoundTag)regionTag.getCompoundOrEmpty("Position"));
            BlockPos regionSize = NbtUtils.readBlockPos((CompoundTag)regionTag.getCompoundOrEmpty("Size"));
            Map<BlockPos, CompoundTag> tiles = null;
            if (regionPos == null || regionSize == null) continue;
            this.subRegionPositions.put(regionName, regionPos);
            this.subRegionSizes.put(regionName, regionSize);
            if (version >= 2) {
                tiles = this.readTileEntitiesFromNBT(regionTag.getListOrEmpty("TileEntities"));
                tiles = this.convertTileEntities_to_1_20_5(tiles, minecraftDataVersion);
                this.tileEntities.put(regionName, tiles);
                ListTag entities = regionTag.getListOrEmpty("Entities");
                entities = this.convertEntities_to_1_20_5(entities, minecraftDataVersion);
                this.entities.put(regionName, this.readEntitiesFromNBT(entities));
            } else if (version == 1) {
                tiles = this.readTileEntitiesFromNBT_v1(regionTag.getListOrEmpty("TileEntities"));
                this.tileEntities.put(regionName, tiles);
                this.entities.put(regionName, this.readEntitiesFromNBT_v1(regionTag.getListOrEmpty("Entities")));
            }
            if (version >= 3) {
                list = regionTag.getListOrEmpty("PendingBlockTicks");
                this.pendingBlockTicks.put(regionName, this.readPendingTicksFromNBT(list, (Registry)BuiltInRegistries.BLOCK, "Block", (Object)Blocks.AIR));
            }
            if (version >= 5) {
                list = regionTag.getListOrEmpty("PendingFluidTicks");
                this.pendingFluidTicks.put(regionName, this.readPendingTicksFromNBT(list, (Registry)BuiltInRegistries.FLUID, "Fluid", (Object)Fluids.EMPTY));
            }
            if ((nbtBase = regionTag.get("BlockStates")) == null || nbtBase.getId() != 12) continue;
            ListTag palette = regionTag.getListOrEmpty("BlockStatePalette");
            long[] blockStateArr = ((LongArrayTag)nbtBase).getAsLongArray();
            BlockPos posEndRel = fi.dy.masa.litematica.util.PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)regionSize).offset((Vec3i)regionPos);
            BlockPos posMin = fi.dy.masa.litematica.util.PositionUtils.getMinCorner(regionPos, posEndRel);
            BlockPos posMax = fi.dy.masa.litematica.util.PositionUtils.getMaxCorner(regionPos, posEndRel);
            BlockPos size = posMax.subtract((Vec3i)posMin).offset(1, 1, 1);
            palette = this.convertBlockStatePalette_1_12_to_1_13_2(palette, version, minecraftDataVersion);
            palette = this.convertBlockStatePalette_to_1_20_5(palette, minecraftDataVersion);
            LitematicaBlockStateContainer container = LitematicaBlockStateContainer.createFrom(palette, blockStateArr, size);
            if (minecraftDataVersion < MINECRAFT_DATA_VERSION) {
                this.postProcessContainerIfNeeded(palette, container, tiles);
            }
            this.blockContainers.put(regionName, container);
        }
    }

    public static boolean isSizeValid(@Nullable Vec3i size) {
        return size != null && size.getX() > 0 && size.getY() > 0 && size.getZ() > 0;
    }

    @Nullable
    private static Vec3i readSizeFromTagImpl(CompoundTag tag) {
        ListTag tagList;
        if (tag.contains("size") && (tagList = tag.getListOrEmpty("size")).size() == 3) {
            return new Vec3i(tagList.getIntOr(0, 0), tagList.getIntOr(1, 0), tagList.getIntOr(2, 0));
        }
        return null;
    }

    @Nullable
    public static BlockPos readBlockPosFromNbtList(CompoundTag tag, String tagName) {
        ListTag tagList;
        if (tag.contains(tagName) && (tagList = tag.getListOrEmpty(tagName)).size() == 3) {
            return new BlockPos(tagList.getIntOr(0, 0), tagList.getIntOr(1, 0), tagList.getIntOr(2, 0));
        }
        return null;
    }

    protected boolean readPaletteFromLitematicaFormatTag(ListTag tagList, ILitematicaBlockStatePalette palette) {
        int size = tagList.size();
        ArrayList<BlockState> list = new ArrayList<BlockState>(size);
        Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
        for (int id = 0; id < size; ++id) {
            CompoundTag tag = tagList.getCompoundOrEmpty(id);
            BlockState state = net.minecraft.nbt.NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)tag);
            list.add(state);
        }
        return palette.setMapping(list);
    }

    public static boolean isValidSpongeSchematic(CompoundTag tag) {
        if (tag.contains("Width") && tag.contains("Height") && tag.contains("Length") && tag.contains("Version") && tag.contains("Palette") && tag.contains("BlockData")) {
            return LitematicaSchematic.isSizeValid(LitematicaSchematic.readSizeFromTagSponge(tag));
        }
        return false;
    }

    public static boolean isValidSpongeSchematicv3(CompoundTag tag) {
        CompoundTag nbtV3;
        if (tag.contains("Schematic") && (nbtV3 = tag.getCompoundOrEmpty("Schematic")).contains("Width") && nbtV3.contains("Height") && nbtV3.contains("Length") && nbtV3.contains("Version") && nbtV3.getIntOr("Version", -1) >= 3 && nbtV3.contains("Blocks") && nbtV3.contains("DataVersion")) {
            return LitematicaSchematic.isSizeValid(LitematicaSchematic.readSizeFromTagSponge(nbtV3));
        }
        return false;
    }

    public static Vec3i readSizeFromTagSponge(CompoundTag tag) {
        return new Vec3i(tag.getIntOr("Width", 0), tag.getIntOr("Height", 0), tag.getIntOr("Length", 0));
    }

    protected boolean readSpongePaletteFromTag(CompoundTag tag, ILitematicaBlockStatePalette palette, int minecraftDataVersion) {
        int size = tag.keySet().size();
        ArrayList<BlockState> list = new ArrayList<BlockState>(size);
        BlockState air = Blocks.AIR.defaultBlockState();
        for (int i = 0; i < size; ++i) {
            list.add(air);
        }
        for (String key : tag.keySet()) {
            BlockState state;
            int id = tag.getIntOr(key, 0);
            Optional<BlockState> stateOptional = BlockUtils.getBlockStateFromString(key, minecraftDataVersion);
            if (stateOptional.isPresent()) {
                state = stateOptional.get();
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)("Unknown block in the Sponge schematic palette: '" + key + "'"), (Object[])new Object[0]);
                state = LitematicaBlockStateContainer.AIR_BLOCK_STATE;
            }
            if (id < 0 || id >= size) {
                String msg = "Invalid ID in the Sponge schematic palette: '" + id + "'";
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)msg, (Object[])new Object[0]);
                Litematica.LOGGER.error(msg);
                return false;
            }
            list.set(id, state);
        }
        return palette.setMapping(list);
    }

    /*
     * Enabled force condition propagation
     * Lifted jumps to return sites
     */
    protected boolean readSpongeBlocksFromTagMetadataOnly(CompoundTag tag, String schematicName, Vec3i size, int minecraftDataVersion, int spongeVersion) {
        CompoundTag blocksTag = new CompoundTag();
        if (spongeVersion >= 3 && tag.contains("Blocks")) {
            blocksTag = tag.getCompoundOrEmpty("Blocks");
            if (!blocksTag.contains("Palette") || !blocksTag.contains("Data")) return false;
            byte[] blockData = blocksTag.getByteArray("Data").orElse(new byte[0]);
            this.totalBlocksReadFromWorld = blockData.length;
            return true;
        } else {
            if (!tag.contains("Palette") || !tag.contains("BlockData")) return false;
            byte[] blockData = tag.getByteArray("BlockData").orElse(new byte[0]);
            this.totalBlocksReadFromWorld = blockData.length;
        }
        return true;
    }

    /*
     * Enabled force condition propagation
     * Lifted jumps to return sites
     */
    protected boolean readSpongeBlocksFromTag(CompoundTag tag, String schematicName, Vec3i size, int minecraftDataVersion, int spongeVersion) {
        int paletteSize;
        byte[] blockData;
        CompoundTag paletteTag;
        CompoundTag blocksTag = new CompoundTag();
        if (spongeVersion >= 3 && tag.contains("Blocks")) {
            blocksTag = tag.getCompoundOrEmpty("Blocks");
            if (!blocksTag.contains("Palette") || !blocksTag.contains("Data")) return false;
            paletteTag = blocksTag.getCompoundOrEmpty("Palette");
            blockData = blocksTag.getByteArray("Data").orElse(new byte[0]);
            paletteSize = paletteTag.keySet().size();
        } else {
            if (!tag.contains("Palette") || !tag.contains("BlockData")) return false;
            paletteTag = tag.getCompoundOrEmpty("Palette");
            blockData = tag.getByteArray("BlockData").orElse(new byte[0]);
            paletteSize = paletteTag.keySet().size();
        }
        LitematicaBlockStateContainer container = LitematicaBlockStateContainer.createContainer(paletteSize, blockData, size);
        if (container == null) {
            String msg = "Failed to read blocks from Sponge schematic";
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)msg, (Object[])new Object[0]);
            Litematica.LOGGER.error(msg);
            return false;
        }
        this.blockContainers.put(schematicName, container);
        if (!this.readSpongePaletteFromTag(paletteTag, container.getPalette(), minecraftDataVersion)) {
            return false;
        }
        if (spongeVersion < 3) return true;
        if (blocksTag.isEmpty()) return false;
        Map<BlockPos, CompoundTag> tileEntities = this.readSpongeBlockEntitiesFromTag(blocksTag, spongeVersion);
        tileEntities = this.convertTileEntities_to_1_20_5(tileEntities, minecraftDataVersion);
        this.tileEntities.put(schematicName, tileEntities);
        return true;
    }

    protected Map<BlockPos, CompoundTag> readSpongeBlockEntitiesFromTag(CompoundTag tag, int spongeVersion) {
        String tagName;
        HashMap<BlockPos, CompoundTag> blockEntities = new HashMap<BlockPos, CompoundTag>();
        String string = tagName = spongeVersion == 1 ? "TileEntities" : "BlockEntities";
        if (!tag.contains(tagName)) {
            return blockEntities;
        }
        ListTag tagList = tag.getListOrEmpty(tagName);
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag beTag = tagList.getCompoundOrEmpty(i);
            BlockPos pos = NbtUtils.readBlockPosFromArrayTag((CompoundTag)beTag, (String)"Pos");
            if (pos == null || beTag.isEmpty()) continue;
            beTag.putString("id", beTag.getStringOr("Id", ""));
            beTag.remove("Id");
            beTag.remove("Pos");
            if (spongeVersion == 1) {
                beTag.remove("ContentVersion");
            }
            if (spongeVersion >= 3) {
                CompoundTag beData = beTag.getCompoundOrEmpty("Data");
                blockEntities.put(pos, beData);
                continue;
            }
            blockEntities.put(pos, beTag);
        }
        return blockEntities;
    }

    protected List<EntityInfo> readSpongeEntitiesFromTag(CompoundTag tag, Vec3i offset, int spongeVersion) {
        ArrayList<EntityInfo> entities = new ArrayList<EntityInfo>();
        ListTag tagList = tag.getListOrEmpty("Entities");
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag entityEntry = tagList.getCompoundOrEmpty(i);
            Vec3 pos = NbtUtils.getVec3dCodec((CompoundTag)entityEntry, (String)"Pos");
            if (pos == null || entityEntry.isEmpty()) continue;
            entityEntry.putString("id", entityEntry.getStringOr("Id", ""));
            entityEntry.remove("Id");
            if (spongeVersion >= 3) {
                CompoundTag entityData = entityEntry.getCompoundOrEmpty("Data");
                if (!entityData.contains("id")) {
                    entityData.putString("id", entityEntry.getStringOr("id", ""));
                }
                entities.add(new EntityInfo(pos, entityData));
                continue;
            }
            pos = new Vec3(pos.x - (double)offset.getX(), pos.y - (double)offset.getY(), pos.z - (double)offset.getZ());
            entities.add(new EntityInfo(pos, entityEntry));
        }
        return entities;
    }

    public boolean readFromSpongeSchematicMetadataOnly(String name, CompoundTag tag) {
        if (LitematicaSchematic.isValidSpongeSchematicv3(tag)) {
            CompoundTag spongeTag = tag.getCompoundOrEmpty("Schematic");
            tag.remove("Schematic");
            tag.merge(spongeTag);
        } else if (!LitematicaSchematic.isValidSpongeSchematic(tag)) {
            return false;
        }
        int spongeVersion = tag.contains("Version") ? tag.getIntOr("Version", -1) : -1;
        int minecraftDataVersion = tag.contains("DataVersion") ? tag.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        Vec3i size = LitematicaSchematic.readSizeFromTagSponge(tag);
        if (!this.readSpongeBlocksFromTagMetadataOnly(tag, name, size, minecraftDataVersion, spongeVersion)) {
            return false;
        }
        if (tag.contains("Metadata")) {
            CompoundTag metadata = tag.getCompoundOrEmpty("Metadata");
            this.metadata.setName(metadata.contains("Name") ? metadata.getStringOr("Name", "?") : name);
            this.metadata.setAuthor(metadata.contains("Author") ? metadata.getStringOr("Author", "?") : "unknown");
            this.metadata.setTimeCreated(metadata.contains("Date") ? metadata.getLongOr("Date", System.currentTimeMillis()) : System.currentTimeMillis());
        } else {
            this.metadata.setAuthor("unknown");
            this.metadata.setName(name);
            this.metadata.setTimeCreated(System.currentTimeMillis());
        }
        if (tag.contains("author")) {
            this.metadata.setAuthor(tag.getStringOr("author", "?"));
        }
        this.metadata.setRegionCount(1);
        this.metadata.setTotalVolume(size.getX() * size.getY() * size.getZ());
        this.metadata.setEnclosingSize(size);
        this.metadata.setTimeModified(this.metadata.getTimeCreated());
        this.metadata.setTotalBlocks(this.totalBlocksReadFromWorld);
        this.metadata.setSchematicVersion(spongeVersion);
        this.metadata.setMinecraftDataVersion(minecraftDataVersion);
        this.metadata.setFileType(FileType.SPONGE_SCHEMATIC);
        return true;
    }

    public boolean readFromSpongeSchematic(String name, CompoundTag tag) {
        if (LitematicaSchematic.isValidSpongeSchematicv3(tag)) {
            CompoundTag spongeTag = tag.getCompoundOrEmpty("Schematic");
            tag.remove("Schematic");
            tag.merge(spongeTag);
        } else if (!LitematicaSchematic.isValidSpongeSchematic(tag)) {
            return false;
        }
        int spongeVersion = tag.contains("Version") ? tag.getIntOr("Version", -1) : -1;
        int minecraftDataVersion = tag.contains("DataVersion") ? tag.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        Vec3i size = LitematicaSchematic.readSizeFromTagSponge(tag);
        if (!this.readSpongeBlocksFromTag(tag, name, size, minecraftDataVersion, spongeVersion)) {
            return false;
        }
        Vec3i offset = NbtUtils.readVec3iFromIntArray((CompoundTag)tag, (String)"Offset");
        if (offset == null) {
            offset = Vec3i.ZERO;
        }
        if (spongeVersion < 3) {
            Map<BlockPos, CompoundTag> tileEntities = this.readSpongeBlockEntitiesFromTag(tag, spongeVersion);
            tileEntities = this.convertTileEntities_to_1_20_5(tileEntities, minecraftDataVersion);
            this.tileEntities.put(name, tileEntities);
        }
        List<EntityInfo> entities = this.readSpongeEntitiesFromTag(tag, offset, spongeVersion);
        entities = this.convertSpongeEntities_to_1_20_5(entities, minecraftDataVersion);
        this.entities.put(name, entities);
        if (tag.contains("Metadata")) {
            CompoundTag metadata = tag.getCompoundOrEmpty("Metadata");
            this.metadata.setName(metadata.contains("Name") ? metadata.getStringOr("Name", "?") : name);
            this.metadata.setAuthor(metadata.contains("Author") ? metadata.getStringOr("Author", "?") : "unknown");
            this.metadata.setTimeCreated(metadata.contains("Date") ? metadata.getLongOr("Date", System.currentTimeMillis()) : System.currentTimeMillis());
        } else {
            this.metadata.setAuthor("unknown");
            this.metadata.setName(name);
            this.metadata.setTimeCreated(System.currentTimeMillis());
        }
        if (tag.contains("author")) {
            this.metadata.setAuthor(tag.getStringOr("author", "?"));
        }
        this.subRegionPositions.put(name, BlockPos.ZERO);
        this.subRegionSizes.put(name, new BlockPos(size));
        this.metadata.setRegionCount(1);
        this.metadata.setTotalVolume(size.getX() * size.getY() * size.getZ());
        this.metadata.setEnclosingSize(size);
        this.metadata.setTimeModified(this.metadata.getTimeCreated());
        this.metadata.setTotalBlocks(this.totalBlocksReadFromWorld);
        this.metadata.setSchematicVersion(spongeVersion);
        this.metadata.setMinecraftDataVersion(minecraftDataVersion);
        this.metadata.setFileType(FileType.SPONGE_SCHEMATIC);
        return true;
    }

    public boolean readFromVanillaStructureMetadataOnly(String name, CompoundTag tag) {
        Vec3i size = LitematicaSchematic.readSizeFromTagImpl(tag);
        if ((tag.contains("palette") || tag.contains("palettes")) && tag.contains("blocks") && LitematicaSchematic.isSizeValid(size)) {
            int minecraftDataVersion;
            int n = minecraftDataVersion = tag.contains("DataVersion") ? tag.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
            if (tag.contains("author")) {
                this.getMetadata().setAuthor(tag.getStringOr("author", "?"));
            }
            this.metadata.setName(name);
            this.metadata.setRegionCount(1);
            this.metadata.setTotalVolume(size.getX() * size.getY() * size.getZ());
            this.metadata.setEnclosingSize(size);
            this.metadata.setTimeCreated(System.currentTimeMillis());
            this.metadata.setTimeModified(this.metadata.getTimeCreated());
            this.metadata.setSchematicVersion(0);
            this.metadata.setMinecraftDataVersion(minecraftDataVersion);
            this.metadata.setFileType(FileType.VANILLA_STRUCTURE);
            ListTag blockList = tag.getListOrEmpty("blocks");
            this.metadata.setTotalBlocks(blockList.size());
            return true;
        }
        return false;
    }

    public boolean readFromVanillaStructure(String name, CompoundTag tag) {
        Vec3i size = LitematicaSchematic.readSizeFromTagImpl(tag);
        if ((tag.contains("palette") || tag.contains("palettes")) && tag.contains("blocks") && LitematicaSchematic.isSizeValid(size)) {
            ListTag paletteTag;
            if (tag.contains("palette")) {
                paletteTag = tag.getListOrEmpty("palette");
            } else if (tag.contains("palettes")) {
                ListTag palettes = tag.getListOrEmpty("palettes");
                int pSize = palettes.size();
                Random rand = new Random();
                int seed = rand.nextInt(0, pSize - 1);
                paletteTag = palettes.getListOrEmpty(seed);
            } else {
                return false;
            }
            int minecraftDataVersion = tag.contains("DataVersion") ? tag.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
            HashMap<BlockPos, CompoundTag> tileMap = new HashMap<BlockPos, CompoundTag>();
            this.tileEntities.put(name, tileMap);
            BlockState air = Blocks.AIR.defaultBlockState();
            int paletteSize = paletteTag.size();
            ArrayList<BlockState> list = new ArrayList<BlockState>(paletteSize);
            Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
            Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
            if (minecraftDataVersion < MINECRAFT_DATA_VERSION && effective != null) {
                Litematica.LOGGER.info("VanillaStructure: executing Vanilla DataFixer for Block State Palette DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
            } else if (effective == null) {
                Litematica.LOGGER.warn("readFromVanillaStructure(): Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Block State Palette DataVersion {}", (Object)minecraftDataVersion);
            }
            for (int id = 0; id < paletteSize; ++id) {
                CompoundTag t = paletteTag.getCompoundOrEmpty(id);
                if (minecraftDataVersion < MINECRAFT_DATA_VERSION && effective != null) {
                    t = SchematicConversionMaps.updateBlockStates(t, minecraftDataVersion);
                }
                BlockState state = net.minecraft.nbt.NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)t);
                list.add(state);
            }
            BlockState zeroState = (BlockState)list.get(0);
            int airId = -1;
            for (int i = 0; i < paletteSize; ++i) {
                if (list.get(i) != air) continue;
                airId = i;
                break;
            }
            if (airId != 0) {
                if (airId == -1) {
                    list.add(0, air);
                    ++paletteSize;
                } else {
                    list.set(0, air);
                    list.set(airId, zeroState);
                }
            }
            int bits = Math.max(2, 32 - Integer.numberOfLeadingZeros(paletteSize - 1));
            LitematicaBlockStateContainer container = new LitematicaBlockStateContainer(size.getX(), size.getY(), size.getZ(), bits, null);
            ILitematicaBlockStatePalette palette = container.getPalette();
            palette.setMapping(list);
            this.blockContainers.put(name, container);
            if (tag.contains("author")) {
                this.getMetadata().setAuthor(tag.getStringOr("author", "?"));
            }
            this.subRegionPositions.put(name, BlockPos.ZERO);
            this.subRegionSizes.put(name, new BlockPos(size));
            this.metadata.setName(name);
            this.metadata.setRegionCount(1);
            this.metadata.setTotalVolume(size.getX() * size.getY() * size.getZ());
            this.metadata.setEnclosingSize(size);
            this.metadata.setTimeCreated(System.currentTimeMillis());
            this.metadata.setTimeModified(this.metadata.getTimeCreated());
            this.metadata.setSchematicVersion(0);
            this.metadata.setMinecraftDataVersion(minecraftDataVersion);
            this.metadata.setFileType(FileType.VANILLA_STRUCTURE);
            ListTag blockList = tag.getListOrEmpty("blocks");
            int count = blockList.size();
            int totalBlocks = 0;
            for (int i = 0; i < count; ++i) {
                CompoundTag blockTag = blockList.getCompoundOrEmpty(i);
                BlockPos pos = LitematicaSchematic.readBlockPosFromNbtList(blockTag, "pos");
                if (pos == null) {
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"Failed to read block position for vanilla structure", (Object[])new Object[0]);
                    return false;
                }
                int id = blockTag.getIntOr("state", 0);
                BlockState state = airId == -1 ? palette.getBlockState(id + 1) : (airId != 0 ? (id == 0 ? zeroState : (id == airId ? air : palette.getBlockState(id))) : palette.getBlockState(id));
                if (state == null) {
                    state = air;
                } else if (state != air) {
                    ++totalBlocks;
                }
                container.set(pos.getX(), pos.getY(), pos.getZ(), state);
                if (!blockTag.contains("nbt")) continue;
                tileMap.put(pos, blockTag.getCompoundOrEmpty("nbt"));
            }
            this.metadata.setTotalBlocks(totalBlocks);
            this.entities.put(name, this.readEntitiesFromVanillaStructure(tag, minecraftDataVersion));
            return true;
        }
        return false;
    }

    protected List<EntityInfo> readEntitiesFromVanillaStructure(CompoundTag tag, int minecraftDataVersion) {
        ArrayList<EntityInfo> entities = new ArrayList<EntityInfo>();
        ListTag tagList = tag.getListOrEmpty("entities");
        int size = tagList.size();
        Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
        if (minecraftDataVersion < MINECRAFT_DATA_VERSION && effective != null) {
            Litematica.LOGGER.info("VanillaStructure: executing Vanilla DataFixer for Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
        } else if (effective == null) {
            Litematica.LOGGER.warn("readEntitiesFromVanillaStructure(): Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Entities DataVersion {}", (Object)minecraftDataVersion);
        }
        for (int i = 0; i < size; ++i) {
            Vec3 pos;
            CompoundTag entityData = tagList.getCompoundOrEmpty(i);
            CompoundTag nbtData = entityData.getCompoundOrEmpty("nbt");
            if (minecraftDataVersion < MINECRAFT_DATA_VERSION && effective != null) {
                nbtData = SchematicConversionMaps.updateEntity(nbtData, minecraftDataVersion);
            }
            if ((pos = NbtUtils.getVec3dCodec((CompoundTag)entityData, (String)"pos")) == null || nbtData.isEmpty()) continue;
            entities.add(new EntityInfo(pos, nbtData));
        }
        return entities;
    }

    @Nullable
    public static Vec3 readVec3dFromNbtList(@Nullable CompoundTag tag, String tagName) {
        ListTag tagList;
        if (tag != null && tag.contains(tagName) && (tagList = tag.getListOrEmpty(tagName)).getId() == 6 && tagList.size() == 3) {
            return new Vec3(tagList.getDoubleOr(0, 0.0), tagList.getDoubleOr(1, 0.0), tagList.getDoubleOr(2, 0.0));
        }
        return null;
    }

    private void postProcessContainerIfNeeded(ListTag palette, LitematicaBlockStateContainer container, @Nullable Map<BlockPos, CompoundTag> tiles) {
        List<BlockState> states = LitematicaSchematic.getStatesFromPaletteTag(palette);
        if (this.converter.createPostProcessStateFilter(states)) {
            IdentityHashMap<BlockState, SchematicConversionFixers.IStateFixer> postProcessingFilter = this.converter.getPostProcessStateFilter();
            SchematicConverter.postProcessBlocks(container, tiles, postProcessingFilter);
        }
    }

    public static List<BlockState> getStatesFromPaletteTag(ListTag palette) {
        ArrayList<BlockState> states = new ArrayList<BlockState>();
        Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
        int size = palette.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = palette.getCompoundOrEmpty(i);
            BlockState state = net.minecraft.nbt.NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)tag);
            if (i <= 0 && state == LitematicaBlockStateContainer.AIR_BLOCK_STATE) continue;
            states.add(state);
        }
        return states;
    }

    private ListTag convertBlockStatePalette_1_12_to_1_13_2(ListTag oldPalette, int version, int minecraftDataVersion) {
        if (version < 5 || minecraftDataVersion < 1631 && minecraftDataVersion > 0) {
            ListTag newPalette = new ListTag();
            int count = oldPalette.size();
            for (int i = 0; i < count; ++i) {
                newPalette.add((Object)SchematicConversionMaps.get_1_13_2_StateTagFor_1_12_Tag(oldPalette.getCompoundOrEmpty(i)));
            }
            return newPalette;
        }
        return oldPalette;
    }

    private ListTag convertBlockStatePalette_to_1_20_5(ListTag oldPalette, int minecraftDataVersion) {
        if (minecraftDataVersion < Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) {
            minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        }
        if (minecraftDataVersion < MINECRAFT_DATA_VERSION) {
            Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
            if (effective == null) {
                Litematica.LOGGER.warn("LitematicaSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Block State Palette DataVersion {}", (Object)minecraftDataVersion);
                return oldPalette;
            }
            ListTag newPalette = new ListTag();
            int count = oldPalette.size();
            Litematica.LOGGER.info("LitematicaSchematic: executing Vanilla DataFixer for Block State Palette DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
            for (int i = 0; i < count; ++i) {
                newPalette.add((Object)SchematicConversionMaps.updateBlockStates(oldPalette.getCompoundOrEmpty(i), minecraftDataVersion));
            }
            return newPalette;
        }
        return oldPalette;
    }

    private Map<BlockPos, CompoundTag> convertTileEntities_to_1_20_5(Map<BlockPos, CompoundTag> oldTE, int minecraftDataVersion) {
        if (minecraftDataVersion < Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) {
            minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        }
        if (minecraftDataVersion < MINECRAFT_DATA_VERSION) {
            Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
            if (effective == null) {
                Litematica.LOGGER.warn("LitematicaSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Tile Entities DataVersion {}", (Object)minecraftDataVersion);
                return oldTE;
            }
            HashMap<BlockPos, CompoundTag> newTE = new HashMap<BlockPos, CompoundTag>();
            Litematica.LOGGER.info("LitematicaSchematic: executing Vanilla DataFixer for Tile Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
            for (BlockPos key : oldTE.keySet()) {
                newTE.put(key, SchematicConversionMaps.updateBlockEntity(SchematicConversionMaps.checkForIdTag(oldTE.get(key)), minecraftDataVersion));
            }
            return newTE;
        }
        return oldTE;
    }

    private ListTag convertEntities_to_1_20_5(ListTag oldEntitiesList, int minecraftDataVersion) {
        if (minecraftDataVersion < Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) {
            minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        }
        if (minecraftDataVersion < MINECRAFT_DATA_VERSION) {
            Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
            if (effective == null) {
                Litematica.LOGGER.warn("LitematicaSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Entities DataVersion {}", (Object)minecraftDataVersion);
                return oldEntitiesList;
            }
            ListTag newEntitiesList = new ListTag();
            int size = oldEntitiesList.size();
            Litematica.LOGGER.info("LitematicaSchematic: executing Vanilla DataFixer for Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
            for (int i = 0; i < size; ++i) {
                newEntitiesList.add((Object)SchematicConversionMaps.updateEntity(oldEntitiesList.getCompoundOrEmpty(i), minecraftDataVersion));
            }
            return newEntitiesList;
        }
        return oldEntitiesList;
    }

    private List<EntityInfo> convertSpongeEntities_to_1_20_5(List<EntityInfo> oldEntitiesList, int minecraftDataVersion) {
        if (minecraftDataVersion < Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) {
            minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        }
        if (minecraftDataVersion < MINECRAFT_DATA_VERSION) {
            Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
            if (effective == null) {
                Litematica.LOGGER.warn("SpongeSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Entities DataVersion {}", (Object)minecraftDataVersion);
                return oldEntitiesList;
            }
            ArrayList<EntityInfo> newEntitiesList = new ArrayList<EntityInfo>();
            Litematica.LOGGER.info("SpongeSchematic: executing Vanilla DataFixer for Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)MINECRAFT_DATA_VERSION);
            for (EntityInfo oldEntityInfo : oldEntitiesList) {
                newEntitiesList.add(new EntityInfo(oldEntityInfo.posVec, SchematicConversionMaps.updateEntity(oldEntityInfo.nbt, minecraftDataVersion)));
            }
            return newEntitiesList;
        }
        return oldEntitiesList;
    }

    private Map<BlockPos, CompoundTag> downgradeTileEntities_to_1_20_4(Map<BlockPos, CompoundTag> oldTE, int minecraftDataVersion) {
        HashMap<BlockPos, CompoundTag> newTE = new HashMap<BlockPos, CompoundTag>();
        Litematica.LOGGER.info("LitematicaSchematic: Downgrade Tile Entities from DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)3700);
        for (BlockPos key : oldTE.keySet()) {
            newTE.put(key, SchematicDowngradeConverter.downgradeBlockEntity_to_1_20_4(oldTE.get(key), minecraftDataVersion, Minecraft.getInstance().level.registryAccess()));
        }
        return newTE;
    }

    private ListTag downgradeEntities_to_1_20_4(ListTag oldEntitiesList, int minecraftDataVersion) {
        ListTag newEntitiesList = new ListTag();
        int size = oldEntitiesList.size();
        Litematica.LOGGER.info("LitematicaSchematic: Downgrade Entities from DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)3700);
        for (int i = 0; i < size; ++i) {
            newEntitiesList.add((Object)SchematicDowngradeConverter.downgradeEntity_to_1_20_4(SchematicConversionMaps.fixEntityTypesFrom1_21_2(oldEntitiesList.getCompoundOrEmpty(i)), minecraftDataVersion, Minecraft.getInstance().level.registryAccess()));
        }
        return newEntitiesList;
    }

    private List<EntityInfo> readEntitiesFromNBT(ListTag tagList) {
        ArrayList<EntityInfo> entityList = new ArrayList<EntityInfo>();
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag entityData = tagList.getCompoundOrEmpty(i);
            Vec3 posVec = NbtUtils.getVec3dCodec((CompoundTag)entityData, (String)"Pos");
            if (posVec == null || entityData.isEmpty()) continue;
            entityList.add(new EntityInfo(posVec, entityData));
        }
        return entityList;
    }

    private Map<BlockPos, CompoundTag> readTileEntitiesFromNBT(ListTag tagList) {
        HashMap<BlockPos, CompoundTag> tileMap = new HashMap<BlockPos, CompoundTag>();
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            BlockPos pos = NbtUtils.readBlockPos((CompoundTag)tag);
            if (pos == null || tag.isEmpty()) continue;
            tileMap.put(pos, tag);
        }
        return tileMap;
    }

    private <T> Map<BlockPos, ScheduledTick<T>> readPendingTicksFromNBT(ListTag tagList, Registry<T> registry, String tagName, T emptyValue) {
        HashMap<BlockPos, ScheduledTick<T>> tickMap = new HashMap<BlockPos, ScheduledTick<T>>();
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            if (!tag.contains("Time")) continue;
            Object target = null;
            try {
                Optional opt = registry.get(Identifier.tryParse((String)tag.getStringOr(tagName, "")));
                if (!opt.isPresent() || !((Holder.Reference)opt.get()).isBound()) continue;
                target = ((Holder.Reference)opt.get()).value();
            }
            catch (Exception opt) {
                // empty catch block
            }
            if (target == null) continue;
            BlockPos pos = new BlockPos(tag.getIntOr("x", 0), tag.getIntOr("y", 0), tag.getIntOr("z", 0));
            TickPriority priority = TickPriority.byValue((int)tag.getIntOr("Priority", 0));
            int scheduledTime = tag.getIntOr("Time", 0);
            long subTick = tag.getLongOr("SubTick", 0L);
            tickMap.put(pos, new ScheduledTick(target, pos, (long)scheduledTime, priority, subTick));
        }
        return tickMap;
    }

    private List<EntityInfo> readEntitiesFromNBT_v1(ListTag tagList) {
        ArrayList<EntityInfo> entityList = new ArrayList<EntityInfo>();
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            Vec3 posVec = NbtUtils.readVec3d((CompoundTag)tag);
            CompoundTag entityData = tag.getCompoundOrEmpty("EntityData");
            if (posVec == null || entityData.isEmpty()) continue;
            NbtUtils.putVec3dCodec((CompoundTag)entityData, (Vec3)posVec, (String)"Pos");
            entityList.add(new EntityInfo(posVec, entityData));
        }
        return entityList;
    }

    private Map<BlockPos, CompoundTag> readTileEntitiesFromNBT_v1(ListTag tagList) {
        HashMap<BlockPos, CompoundTag> tileMap = new HashMap<BlockPos, CompoundTag>();
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            CompoundTag tileNbt = tag.getCompoundOrEmpty("TileNBT");
            BlockPos pos = NbtUtils.readBlockPos((CompoundTag)tag);
            if (pos == null || tileNbt.isEmpty()) continue;
            NbtUtils.writeBlockPos((BlockPos)pos, (CompoundTag)tileNbt);
            tileMap.put(pos, tileNbt);
        }
        return tileMap;
    }

    public boolean writeToFile(Path dir, String fileNameIn, boolean override) {
        return this.writeToFile(dir, fileNameIn, override, false);
    }

    public boolean writeToFile(Path dir, String fileNameIn, boolean override, boolean downgrade) {
        Object fileName = FileNameUtils.generateSimpleUnicodeSafeFileName((String)fileNameIn);
        if (!((String)fileName).endsWith(FILE_EXTENSION)) {
            fileName = (String)fileName + FILE_EXTENSION;
        }
        Path fileSchematic = dir.resolve(FileNameUtils.generateSafeFileName((String)fileName)).normalize();
        try {
            if (!Files.exists(dir, new LinkOption[0])) {
                FileUtils.createDirectoriesIfMissing((Path)dir);
            }
            if (!Files.isDirectory(dir, new LinkOption[0])) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_write_to_file_failed.directory_creation_failed", (Object[])new Object[]{dir.toAbsolutePath()});
                return false;
            }
            if (!override && Files.exists(fileSchematic, new LinkOption[0])) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_write_to_file_failed.exists", (Object[])new Object[]{fileSchematic.toAbsolutePath()});
                return false;
            }
            if (downgrade) {
                NbtUtils.writeCompoundTagToCompressedFile((CompoundTag)this.writeToNBT_v6(), (Path)fileSchematic);
            } else {
                NbtUtils.writeCompoundTagToCompressedFile((CompoundTag)this.writeToNBT(), (Path)fileSchematic);
            }
            return true;
        }
        catch (Throwable e) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_write_to_file_failed.exception", (Object[])new Object[]{fileSchematic.toAbsolutePath()});
            Litematica.LOGGER.error(StringUtils.translate((String)"litematica.error.schematic_write_to_file_failed.exception", (Object[])new Object[]{fileSchematic.toAbsolutePath()}), e);
            Litematica.LOGGER.error(e.getLocalizedMessage());
            return false;
        }
    }

    public boolean readFromFile() {
        return this.readFromFile(this.schematicType);
    }

    private boolean readFromFile(FileType schematicType) {
        try {
            CompoundTag nbt = LitematicaSchematic.readNbtFromFile(this.schematicFile);
            if (nbt != null) {
                if (schematicType == FileType.SPONGE_SCHEMATIC) {
                    String name = FileUtils.getNameWithoutExtension((String)this.schematicFile.getFileName().toString()) + " (Converted Sponge)";
                    return this.readFromSpongeSchematic(name, nbt);
                }
                if (schematicType == FileType.VANILLA_STRUCTURE) {
                    String name = FileUtils.getNameWithoutExtension((String)this.schematicFile.getFileName().toString()) + " (Converted Structure)";
                    return this.readFromVanillaStructure(name, nbt);
                }
                if (schematicType == FileType.LITEMATICA_SCHEMATIC) {
                    return this.readFromNBT(nbt);
                }
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_read_from_file_failed.cant_read", (Object[])new Object[]{this.schematicFile.toAbsolutePath()});
            }
        }
        catch (Exception e) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_read_from_file_failed.exception", (Object[])new Object[]{this.schematicFile.toAbsolutePath()});
            Litematica.LOGGER.error((Object)e);
        }
        return false;
    }

    public static CompoundTag readNbtFromFile(Path file) {
        if (file == null) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_read_from_file_failed.no_file", (Object[])new Object[0]);
            return null;
        }
        if (!Files.exists(file, new LinkOption[0]) || !Files.isReadable(file)) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_read_from_file_failed.cant_read", (Object[])new Object[]{file.toAbsolutePath()});
            return null;
        }
        return NbtUtils.readNbtFromFile((Path)file);
    }

    public static Path fileFromDirAndName(Path dir, String fileNameIn, FileType schematicType) {
        Object fileName = FileNameUtils.generateSimpleUnicodeSafeFileName((String)fileNameIn);
        if (FileNameUtils.doesFileNameContainIllegalCharacters((String)fileName)) {
            fileName = FileNameUtils.generateSafeFileName((String)fileName);
        }
        if (!((String)fileName).endsWith(FILE_EXTENSION) && schematicType == FileType.LITEMATICA_SCHEMATIC) {
            fileName = (String)fileName + FILE_EXTENSION;
        }
        return dir.resolve((String)fileName).normalize();
    }

    public static void updateMetadataWithFileTime(Path file, SchematicMetadata metadata) {
        try {
            BasicFileAttributes attr = Files.readAttributes(file, BasicFileAttributes.class, new LinkOption[0]);
            metadata.setTimeCreated(attr.creationTime().toMillis());
            metadata.setTimeModified(attr.lastModifiedTime().toMillis());
        }
        catch (Exception err) {
            Litematica.LOGGER.error("getFileCreatedTime(): Exception reading file '{}'; {}", (Object)file.getFileName().toString(), (Object)err.getLocalizedMessage());
        }
    }

    @Nullable
    public static SchematicMetadata readMetadataFromFile(Path dir, String fileName) {
        if (dir == null) {
            Litematica.LOGGER.error("LitematicaSchematic#readMetadataFromFile(): dir is NULL; please correct this when loading files.");
            return null;
        }
        Path file = dir.resolve(fileName);
        FileType type = FileType.fromFile(file);
        if (type == FileType.INVALID) {
            file = LitematicaSchematic.fileFromDirAndName(dir, fileName, FileType.LITEMATICA_SCHEMATIC);
            type = FileType.fromFile(file);
        }
        if (type == FileType.INVALID) {
            return null;
        }
        CompoundTag nbt = LitematicaSchematic.readNbtFromFile(file);
        if (nbt != null) {
            switch (type) {
                case LITEMATICA_SCHEMATIC: {
                    int version;
                    SchematicMetadata metadata = new SchematicMetadata();
                    if (!nbt.contains("Version") || (version = nbt.getIntOr("Version", -1)) < 1 || version > 7) break;
                    metadata.readFromNBT(nbt.getCompoundOrEmpty("Metadata"));
                    metadata.setFileType(type);
                    return metadata;
                }
                case SPONGE_SCHEMATIC: {
                    LitematicaSchematic schem = new LitematicaSchematic(file, type);
                    if (!schem.readFromSpongeSchematicMetadataOnly(fileName, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return meta;
                }
                case VANILLA_STRUCTURE: {
                    LitematicaSchematic schem = new LitematicaSchematic(file, type);
                    if (!schem.readFromVanillaStructureMetadataOnly(fileName, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return meta;
                }
                case SCHEMATICA_SCHEMATIC: {
                    SchematicaSchematic schem = new SchematicaSchematic();
                    if (!schem.readBlocksFromNBTMetadataOnly(file, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return meta;
                }
            }
        }
        return null;
    }

    @Nullable
    public static Pair<SchematicSchema, SchematicMetadata> readMetadataAndVersionFromFile(Path dir, String fileName) {
        if (dir == null) {
            Litematica.LOGGER.error("LitematicaSchematic#readMetadataAndVersionFromFile(): dir is NULL; please correct this when loading files.");
            return null;
        }
        Path file = dir.resolve(fileName);
        FileType type = FileType.fromFile(file);
        if (type == FileType.INVALID) {
            file = LitematicaSchematic.fileFromDirAndName(dir, fileName, FileType.LITEMATICA_SCHEMATIC);
            type = FileType.fromFile(file);
        }
        if (type == FileType.INVALID || type == FileType.TEXT || type == FileType.JSON) {
            return null;
        }
        CompoundTag nbt = LitematicaSchematic.readNbtFromFile(file);
        if (nbt != null) {
            switch (type) {
                case LITEMATICA_SCHEMATIC: {
                    int dataVersion;
                    SchematicMetadata metadata = new SchematicMetadata();
                    if (!nbt.contains("Version")) break;
                    int version = nbt.getIntOr("Version", -1);
                    int n = dataVersion = nbt.contains("MinecraftDataVersion") ? nbt.getIntOr("MinecraftDataVersion", -1) : -1;
                    if (version < 1 || version > 7) break;
                    metadata.readFromNBT(nbt.getCompoundOrEmpty("Metadata"));
                    metadata.setFileType(type);
                    return Pair.of((Object)((Object)new SchematicSchema(version, dataVersion)), (Object)metadata);
                }
                case SPONGE_SCHEMATIC: {
                    LitematicaSchematic schem = new LitematicaSchematic(file, type);
                    if (!schem.readFromSpongeSchematicMetadataOnly(fileName, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return Pair.of((Object)((Object)meta.getSchematicSchema()), (Object)meta);
                }
                case VANILLA_STRUCTURE: {
                    LitematicaSchematic schem = new LitematicaSchematic(file, type);
                    if (!schem.readFromVanillaStructureMetadataOnly(fileName, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return Pair.of((Object)((Object)meta.getSchematicSchema()), (Object)meta);
                }
                case SCHEMATICA_SCHEMATIC: {
                    SchematicaSchematic schem = new SchematicaSchematic();
                    if (!schem.readBlocksFromNBTMetadataOnly(file, nbt)) break;
                    SchematicMetadata meta = schem.getMetadata();
                    LitematicaSchematic.updateMetadataWithFileTime(file, meta);
                    return Pair.of((Object)((Object)meta.getSchematicSchema()), (Object)meta);
                }
            }
        }
        return null;
    }

    @Nullable
    public static SchematicSchema readDataVersionFromFile(Path dir, String fileName) {
        if (dir == null) {
            Litematica.LOGGER.error("LitematicaSchematic#readDataVersionFromFile(): dir is NULL; please correct this when loading files.");
            return null;
        }
        Path file = dir.resolve(fileName);
        FileType type = FileType.fromFile(file);
        if (type == FileType.INVALID) {
            file = LitematicaSchematic.fileFromDirAndName(dir, fileName, FileType.LITEMATICA_SCHEMATIC);
            type = FileType.fromFile(file);
        }
        if (type == FileType.INVALID) {
            return null;
        }
        CompoundTag nbt = LitematicaSchematic.readNbtFromFile(file);
        if (nbt != null) {
            switch (type) {
                case LITEMATICA_SCHEMATIC: {
                    int dataVersion;
                    if (!nbt.contains("Version")) break;
                    int version = nbt.getIntOr("Version", -1);
                    int n = dataVersion = nbt.contains("MinecraftDataVersion") ? nbt.getIntOr("MinecraftDataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
                    if (version < 1) break;
                    return new SchematicSchema(version, dataVersion);
                }
                case SPONGE_SCHEMATIC: {
                    CompoundTag spongeTag = new CompoundTag();
                    if (LitematicaSchematic.isValidSpongeSchematicv3(nbt)) {
                        spongeTag.merge(nbt.getCompoundOrEmpty("Schematic"));
                    } else if (LitematicaSchematic.isValidSpongeSchematic(nbt)) {
                        spongeTag.merge(nbt);
                    }
                    int spongeVersion = spongeTag.contains("Version") ? spongeTag.getIntOr("Version", -1) : -1;
                    int minecraftDataVersion = spongeTag.contains("DataVersion") ? spongeTag.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
                    return new SchematicSchema(spongeVersion, minecraftDataVersion);
                }
                case VANILLA_STRUCTURE: {
                    int minecraftDataVersion = nbt.contains("DataVersion") ? nbt.getIntOr("DataVersion", Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue()) : Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
                    return new SchematicSchema(0, minecraftDataVersion);
                }
            }
        }
        return null;
    }

    @Nullable
    public static LitematicaSchematic createFromFile(Path dir, String fileName) {
        return LitematicaSchematic.createFromFile(dir, fileName, FileType.LITEMATICA_SCHEMATIC);
    }

    @Nullable
    public static LitematicaSchematic createFromFile(Path dir, String fileName, FileType schematicType) {
        if (dir == null) {
            Litematica.LOGGER.error("LitematicaSchematic#createFromFile(): dir is NULL; please correct this when loading files.");
            return null;
        }
        Path file = LitematicaSchematic.fileFromDirAndName(dir, fileName, schematicType);
        LitematicaSchematic schematic = new LitematicaSchematic(file, schematicType);
        return schematic.readFromFile(schematicType) ? schematic : null;
    }

    @VisibleForTesting
    public String toString() {
        CompoundTag nbt = new CompoundTag();
        CompoundTag list = new CompoundTag();
        if (this.schematicFile != null) {
            nbt.putString("FileName", this.schematicFile.toAbsolutePath().toString());
        }
        if (this.schematicType != null) {
            nbt.putString("FileType", this.schematicType.name());
        }
        nbt.putInt("TotalBlocksRead", this.totalBlocksReadFromWorld);
        if (this.blockContainers != null) {
            for (String key : this.blockContainers.keySet()) {
                CompoundTag sub = new CompoundTag();
                if (this.blockContainers.get(key) != null) {
                    sub.store("BlockStateContainerSize", Vec3i.CODEC, (Object)this.blockContainers.get(key).getSize());
                } else {
                    sub.store("BlockStateContainerSize", Vec3i.CODEC, (Object)Vec3i.ZERO);
                }
                if (this.subRegionPositions.get(key) != null) {
                    sub.store("SubRegionPositions", BlockPos.CODEC, (Object)this.subRegionPositions.get(key));
                } else {
                    sub.store("SubRegionPositions", BlockPos.CODEC, (Object)BlockPos.ZERO);
                }
                if (this.subRegionSizes.get(key) != null) {
                    sub.store("SubRegionSizes", BlockPos.CODEC, (Object)this.subRegionSizes.get(key));
                } else {
                    sub.store("SubRegionSizes", BlockPos.CODEC, (Object)BlockPos.ZERO);
                }
                if (this.tileEntities.get(key) != null) {
                    sub.putInt("TileEntityCount", this.tileEntities.get(key).size());
                }
                if (this.entities.get(key) != null) {
                    sub.putInt("EntityCount", this.entities.get(key).size());
                }
                if (this.pendingBlockTicks.get(key) != null) {
                    sub.putInt("PendingBlockTicks", this.pendingBlockTicks.get(key).size());
                }
                if (this.pendingFluidTicks.get(key) != null) {
                    sub.putInt("PendingFluidTicks", this.pendingFluidTicks.get(key).size());
                }
                list.store(key, CompoundTag.CODEC, (Object)sub);
            }
        }
        nbt.store("Regions", CompoundTag.CODEC, (Object)list);
        nbt.store("Metadata", CompoundTag.CODEC, (Object)this.metadata.writeToNbtExtra());
        return "LitematicaSchematic[" + nbt.toString() + "]";
    }

    public record SchematicSaveInfo(boolean visibleOnly, boolean includeSupportBlocks, boolean ignoreEntities, boolean fromSchematicWorld) {
        public SchematicSaveInfo(boolean visibleOnly, boolean ignoreEntities) {
            this(visibleOnly, false, ignoreEntities, false);
        }
    }

    public record EntityInfo(Vec3 posVec, CompoundTag nbt) {
        public EntityInfo(Vec3 posVec, CompoundTag nbt) {
            this.posVec = posVec;
            if (nbt.contains("SleepingX")) {
                nbt.putInt("SleepingX", Mth.floor((double)posVec.x));
            }
            if (nbt.contains("SleepingY")) {
                nbt.putInt("SleepingY", Mth.floor((double)posVec.y));
            }
            if (nbt.contains("SleepingZ")) {
                nbt.putInt("SleepingZ", Mth.floor((double)posVec.z));
            }
            this.nbt = nbt;
        }

        public Vec3 toVanilla() {
            return this.posVec;
        }
    }
}

