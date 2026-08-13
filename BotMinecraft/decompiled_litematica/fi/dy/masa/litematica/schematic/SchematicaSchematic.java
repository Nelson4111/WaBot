/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.data.Schema
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.HolderLookup$Provider
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.EntityType
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragonPart
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.StructureMode
 *  net.minecraft.world.level.chunk.LevelChunk$EntityCreationType
 *  net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings
 *  net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplate
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.schematic;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.SchematicMetadata;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionFixers;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import fi.dy.masa.litematica.schematic.conversion.SchematicConverter;
import fi.dy.masa.litematica.util.DataFixerMode;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.Schema;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import fi.dy.masa.malilib.util.nbt.NbtView;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.resources.Identifier;
import net.minecraft.world.Container;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.boss.enderdragon.EnderDragonPart;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.StructureMode;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplate;
import net.minecraft.world.phys.Vec3;

public class SchematicaSchematic {
    public static final String FILE_EXTENSION = ".schematic";
    private final SchematicMetadata metadata = new SchematicMetadata();
    private final SchematicConverter converter;
    private final BlockState[] palette = new BlockState[65536];
    private LitematicaBlockStateContainer blocks;
    private final Map<BlockPos, CompoundTag> tiles = new HashMap<BlockPos, CompoundTag>();
    private final List<CompoundTag> entities = new ArrayList<CompoundTag>();
    private Vec3i size = Vec3i.ZERO;
    private String fileName;
    private IdentityHashMap<BlockState, SchematicConversionFixers.IStateFixer> postProcessingFilter;
    private boolean needsConversionPostProcessing;

    protected SchematicaSchematic() {
        this.converter = SchematicConverter.createForSchematica();
    }

    public SchematicMetadata getMetadata() {
        return this.metadata;
    }

    public Vec3i getSize() {
        return this.size;
    }

    public Map<BlockPos, CompoundTag> getTiles() {
        return this.tiles;
    }

    public List<LitematicaSchematic.EntityInfo> getEntities() {
        ArrayList<LitematicaSchematic.EntityInfo> entityList = new ArrayList<LitematicaSchematic.EntityInfo>();
        int size = this.entities.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag entityData = this.entities.get(i);
            Vec3 posVec = NbtUtils.getVec3dCodec((CompoundTag)entityData, (String)"Pos");
            if (posVec == null || entityData.isEmpty()) continue;
            entityList.add(new LitematicaSchematic.EntityInfo(posVec, entityData));
        }
        return entityList;
    }

    public void placeSchematicToWorld(Level world, BlockPos posStart, StructurePlaceSettings placement, int setBlockStateFlags) {
        int width = this.size.getX();
        int height = this.size.getY();
        int length = this.size.getZ();
        int numBlocks = width * height * length;
        if (this.blocks != null && numBlocks > 0 && this.blocks.getSize().equals((Object)this.size)) {
            int x;
            int z;
            int y;
            Rotation rotation = placement.getRotation();
            Mirror mirror = placement.getMirror();
            for (y = 0; y < height; ++y) {
                for (z = 0; z < length; ++z) {
                    for (x = 0; x < width; ++x) {
                        BlockEntity te;
                        BlockState state = this.blocks.get(x, y, z);
                        BlockPos pos = new BlockPos(x, y, z);
                        CompoundTag teNBT = this.tiles.get(pos);
                        pos = StructureTemplate.calculateRelativePosition((StructurePlaceSettings)placement, (BlockPos)pos).offset((Vec3i)posStart);
                        state = state.mirror(mirror);
                        state = state.rotate(rotation);
                        if (teNBT != null && (te = world.getBlockEntity(pos)) != null) {
                            if (te instanceof Container) {
                                ((Container)te).clearContent();
                            }
                            world.setBlock(pos, Blocks.BARRIER.defaultBlockState(), 20);
                        }
                        if (!world.setBlock(pos, state, setBlockStateFlags) || teNBT == null || (te = world.getBlockEntity(pos)) == null) continue;
                        teNBT.putInt("x", pos.getX());
                        teNBT.putInt("y", pos.getY());
                        teNBT.putInt("z", pos.getZ());
                        try {
                            NbtView view = NbtView.getReader((CompoundTag)teNBT, (RegistryAccess)world.registryAccess());
                            te.loadWithComponents(view.getReader());
                            continue;
                        }
                        catch (Exception e) {
                            Litematica.LOGGER.warn("Failed to load TileEntity data for {} @ {}", (Object)state, (Object)pos);
                        }
                    }
                }
            }
            if ((setBlockStateFlags & 1) != 0) {
                for (y = 0; y < height; ++y) {
                    for (z = 0; z < length; ++z) {
                        for (x = 0; x < width; ++x) {
                            BlockEntity te;
                            BlockPos pos = new BlockPos(x, y, z);
                            CompoundTag teNBT = this.tiles.get(pos);
                            pos = StructureTemplate.calculateRelativePosition((StructurePlaceSettings)placement, (BlockPos)pos).offset((Vec3i)posStart);
                            world.updateNeighborsAt(pos, world.getBlockState(pos).getBlock());
                            if (teNBT == null || (te = world.getBlockEntity(pos)) == null) continue;
                            te.setChanged();
                        }
                    }
                }
            }
            if (!placement.isIgnoreEntities()) {
                this.addEntitiesToWorld(world, posStart, placement);
            }
        }
    }

    public void placeSchematicDirectlyToChunks(WorldSchematic world, BlockPos posStart, StructurePlaceSettings placement) {
        int width = this.size.getX();
        int height = this.size.getY();
        int length = this.size.getZ();
        int numBlocks = width * height * length;
        BlockPos posEnd = posStart.offset(this.size).offset(-1, -1, -1);
        if (this.blocks != null && numBlocks > 0 && this.blocks.getSize().equals((Object)this.size) && PositionUtils.arePositionsWithinWorld(world, posStart, posEnd)) {
            BlockPos posMin = PositionUtils.getMinCorner(posStart, posEnd);
            BlockPos posMax = PositionUtils.getMaxCorner(posStart, posEnd);
            int cxStart = posMin.getX() >> 4;
            int czStart = posMin.getZ() >> 4;
            int cxEnd = posMax.getX() >> 4;
            int czEnd = posMax.getZ() >> 4;
            BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
            for (int cz = czStart; cz <= czEnd; ++cz) {
                for (int cx = cxStart; cx <= cxEnd; ++cx) {
                    int xMinChunk = Math.max(cx << 4, posMin.getX());
                    int zMinChunk = Math.max(cz << 4, posMin.getZ());
                    int xMaxChunk = Math.min((cx << 4) + 15, posMax.getX());
                    int zMaxChunk = Math.min((cz << 4) + 15, posMax.getZ());
                    ChunkSchematic chunk = world.getChunk(cx, cz);
                    if (chunk == null) continue;
                    int y = posMin.getY();
                    for (int ySrc = 0; ySrc < height; ++ySrc) {
                        int z = zMinChunk;
                        int zSrc = zMinChunk - posStart.getZ();
                        while (z <= zMaxChunk) {
                            int x = xMinChunk;
                            int xSrc = xMinChunk - posStart.getX();
                            while (x <= xMaxChunk) {
                                BlockEntity te;
                                BlockState state = this.blocks.get(xSrc, ySrc, zSrc);
                                posMutable.set(xSrc, ySrc, zSrc);
                                CompoundTag teNBT = this.tiles.get(posMutable);
                                BlockPos pos = new BlockPos(x, y, z);
                                if (teNBT != null && (te = chunk.getBlockEntity(pos, LevelChunk.EntityCreationType.CHECK)) != null) {
                                    if (te instanceof Container) {
                                        ((Container)te).clearContent();
                                    }
                                    world.setBlock(pos, Blocks.BARRIER.defaultBlockState(), 20);
                                }
                                chunk.setBlockState(pos, state, 3);
                                if (teNBT != null && (te = chunk.getBlockEntity(pos, LevelChunk.EntityCreationType.CHECK)) != null) {
                                    teNBT.putInt("x", pos.getX());
                                    teNBT.putInt("y", pos.getY());
                                    teNBT.putInt("z", pos.getZ());
                                    try {
                                        NbtView view = NbtView.getReader((CompoundTag)teNBT, (RegistryAccess)world.registryAccess());
                                        te.loadWithComponents(view.getReader());
                                    }
                                    catch (Exception e) {
                                        Litematica.LOGGER.warn("Failed to load TileEntity data for {} @ {}", (Object)state, (Object)pos);
                                    }
                                }
                                ++x;
                                ++xSrc;
                            }
                            ++z;
                            ++zSrc;
                        }
                        ++y;
                    }
                    if (chunk.getState().atLeast(ChunkSchematicState.FILLED)) continue;
                    chunk.setState(ChunkSchematicState.FILLED);
                }
            }
            if (!placement.isIgnoreEntities()) {
                this.addEntitiesToWorld(world, posStart, placement);
            }
        }
    }

    private void addEntitiesToWorld(Level world, BlockPos posStart, StructurePlaceSettings placement) {
        Mirror mirror = placement.getMirror();
        Rotation rotation = placement.getRotation();
        for (CompoundTag tag : this.entities) {
            Vec3 relativePos = NbtUtils.getVec3dCodec((CompoundTag)tag, (String)"Pos");
            if (relativePos == null) continue;
            Vec3 transformedRelativePos = PositionUtils.getTransformedPosition(relativePos, mirror, rotation);
            Vec3 realPos = transformedRelativePos.add((double)posStart.getX(), (double)posStart.getY(), (double)posStart.getZ());
            Entity entity = EntityUtils.createEntityAndPassengersFromNBT(tag, world);
            if (entity == null) continue;
            float rotationYaw = entity.mirror(mirror);
            entity.snapTo(realPos.x, realPos.y, realPos.z, rotationYaw += entity.getYRot() - entity.rotate(rotation), entity.getXRot());
            EntityUtils.spawnEntityAndPassengersInWorld(entity, world);
        }
    }

    public Map<BlockPos, String> getDataStructureBlocks(BlockPos posStart, StructurePlaceSettings placement) {
        HashMap<BlockPos, String> map = new HashMap<BlockPos, String>();
        for (Map.Entry<BlockPos, CompoundTag> entry : this.tiles.entrySet()) {
            CompoundTag tag = entry.getValue();
            if (!tag.getStringOr("id", "?").equals("minecraft:structure_block") || StructureMode.valueOf((String)tag.getStringOr("mode", "?")) != StructureMode.DATA) continue;
            BlockPos pos = entry.getKey();
            pos = StructureTemplate.calculateRelativePosition((StructurePlaceSettings)placement, (BlockPos)pos).offset((Vec3i)posStart);
            map.put(pos, tag.getStringOr("metadata", "?"));
        }
        return map;
    }

    private void readBlocksFromWorld(Level world, BlockPos posStart, BlockPos size) {
        int startX = posStart.getX();
        int startY = posStart.getY();
        int startZ = posStart.getZ();
        int endX = startX + size.getX();
        int endY = startY + size.getY();
        int endZ = startZ + size.getZ();
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos(0, 0, 0);
        this.blocks = new LitematicaBlockStateContainer(size.getX(), size.getY(), size.getZ());
        this.tiles.clear();
        this.size = size;
        for (int y = startY; y < endY; ++y) {
            for (int z = startZ; z < endZ; ++z) {
                for (int x = startX; x < endX; ++x) {
                    int relX = x - startX;
                    int relY = y - startY;
                    int relZ = z - startZ;
                    posMutable.set(x, y, z);
                    BlockState state = world.getBlockState((BlockPos)posMutable);
                    this.blocks.set(relX, relY, relZ, state);
                    BlockEntity te = world.getBlockEntity((BlockPos)posMutable);
                    if (te == null) continue;
                    try {
                        CompoundTag nbt = te.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess());
                        BlockPos pos = new BlockPos(relX, relY, relZ);
                        NbtUtils.writeBlockPosToTag((BlockPos)pos, (CompoundTag)nbt);
                        this.tiles.put(pos, nbt);
                        continue;
                    }
                    catch (Exception e) {
                        Litematica.LOGGER.warn("SchematicaSchematic: Exception while trying to store TileEntity data for block '{}' at {}", (Object)state, (Object)posMutable.toString(), (Object)e);
                    }
                }
            }
        }
    }

    private void readEntitiesFromWorld(Level world, BlockPos posStart, BlockPos size) {
        this.entities.clear();
        List entities = world.getEntities((Entity)null, PositionUtils.createEnclosingAABB(posStart, posStart.offset((Vec3i)size)), EntityUtils.NOT_PLAYER);
        for (Entity entity : entities) {
            if (entity instanceof EnderDragonPart) continue;
            NbtView view = NbtView.getWriter((RegistryAccess)world.registryAccess());
            entity.saveWithoutId(view.getWriter());
            CompoundTag nbt = view.readNbt();
            Identifier id = EntityType.getKey((EntityType)entity.getType());
            if (nbt == null || id == null) continue;
            Vec3 pos = new Vec3(entity.getX() - (double)posStart.getX(), entity.getY() - (double)posStart.getY(), entity.getZ() - (double)posStart.getZ());
            nbt.putString("id", id.toString());
            NbtUtils.putVec3dCodec((CompoundTag)nbt, (Vec3)pos, (String)"Pos");
            this.entities.add(nbt);
        }
    }

    public static SchematicaSchematic createFromWorld(Level world, BlockPos posStart, BlockPos size, boolean ignoreEntities) {
        SchematicaSchematic schematic = new SchematicaSchematic();
        schematic.readBlocksFromWorld(world, posStart, size);
        if (!ignoreEntities) {
            schematic.readEntitiesFromWorld(world, posStart, size);
        }
        return schematic;
    }

    @Nullable
    public static SchematicaSchematic createFromFile(Path file) {
        SchematicaSchematic schematic = new SchematicaSchematic();
        if (schematic.readFromFile(file)) {
            schematic.metadata.setName(file.getFileName().toString());
            return schematic;
        }
        return null;
    }

    public boolean readFromNBT(CompoundTag nbt) {
        if (this.readBlocksFromNBT(nbt)) {
            this.readEntitiesFromNBT(nbt);
            this.readTileEntitiesFromNBT(nbt);
            try {
                this.postProcessBlocks();
            }
            catch (Exception e) {
                Litematica.LOGGER.error("SchematicaSchematic: Exception while post-processing blocks for '{}'", (Object)this.fileName, (Object)e);
            }
            return true;
        }
        Litematica.LOGGER.error("SchematicaSchematic: Missing block data in the schematic '{}'", (Object)this.fileName);
        return false;
    }

    private boolean readPaletteFromNBT(CompoundTag nbt) {
        Arrays.fill(this.palette, Blocks.AIR.defaultBlockState());
        if (nbt.contains("SchematicaMapping")) {
            CompoundTag tag = nbt.getCompoundOrEmpty("SchematicaMapping");
            Set keys = tag.keySet();
            for (String key : keys) {
                String str;
                short id = tag.getShortOr(key, (short)-1);
                if (id < 0 || id >= 4096) {
                    str = String.format("SchematicaSchematic: Invalid ID '%d' in SchematicaMapping for block '%s', range: 0 - 4095", id, key);
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
                    Litematica.LOGGER.warn(str);
                    return false;
                }
                if (this.converter.getConvertedStatesForBlock(id, key, this.palette)) continue;
                str = String.format("SchematicaSchematic: Missing/non-existing block '%s' in SchematicaMapping", key);
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
                Litematica.LOGGER.warn(str);
            }
        } else if (nbt.contains("BlockIDs")) {
            CompoundTag tag = nbt.getCompoundOrEmpty("BlockIDs");
            Set keys = tag.keySet();
            for (String idStr : keys) {
                String str;
                int id;
                String key = tag.getStringOr(idStr, "");
                try {
                    id = Integer.parseInt(idStr);
                }
                catch (NumberFormatException e) {
                    String str2 = String.format("SchematicaSchematic: Invalid ID '%d' (not a number) in MCEdit2 palette for block '%s'", idStr, key);
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str2, (Object[])new Object[0]);
                    Litematica.LOGGER.warn(str2);
                    return false;
                }
                if (id < 0 || id >= 4096) {
                    str = String.format("SchematicaSchematic: Invalid ID '%d' in MCEdit2 palette for block '%s', range: 0 - 4095", id, key);
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
                    Litematica.LOGGER.warn(str);
                    return false;
                }
                if (this.converter.getConvertedStatesForBlock(id, key, this.palette)) continue;
                str = String.format("SchematicaSchematic: Missing/non-existing block '%s' in MCEdit2 palette", key);
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
                Litematica.LOGGER.warn(str);
            }
        } else {
            this.converter.getVanillaBlockPalette(this.palette);
        }
        if (this.converter.createPostProcessStateFilter(this.palette)) {
            this.postProcessingFilter = this.converter.getPostProcessStateFilter();
            this.needsConversionPostProcessing = true;
        }
        return true;
    }

    protected boolean readBlocksFromNBTMetadataOnly(Path file, CompoundTag nbt) {
        if (!(nbt.contains("Blocks") && nbt.contains("Data") && nbt.contains("Width") && nbt.contains("Height") && nbt.contains("Length"))) {
            return false;
        }
        this.fileName = file.getFileName().toString();
        short sizeX = nbt.getShortOr("Width", (short)0);
        short sizeY = nbt.getShortOr("Height", (short)0);
        short sizeZ = nbt.getShortOr("Length", (short)0);
        byte[] blockIdsByte = nbt.getByteArray("Blocks").orElse(new byte[0]);
        byte[] metaArr = nbt.getByteArray("Data").orElse(new byte[0]);
        int numBlocks = blockIdsByte.length;
        int layerSize = sizeX * sizeZ;
        if (numBlocks != sizeX * sizeY * sizeZ) {
            String str = String.format("SchematicaSchematic: Mismatched block array size compared to the width/height/length,\nblocks: %d, W x H x L: %d x %d x %d", numBlocks, (int)sizeX, (int)sizeY, (int)sizeZ);
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
            return false;
        }
        if (numBlocks != metaArr.length) {
            String str = String.format("SchematicaSchematic: Mismatched block ID and metadata array sizes, blocks: %d, meta: %d", numBlocks, metaArr.length);
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
            return false;
        }
        this.size = new Vec3i((int)sizeX, (int)sizeY, (int)sizeZ);
        this.metadata.setEnclosingSize(this.size);
        this.metadata.setTotalBlocks(numBlocks);
        this.metadata.setTotalVolume(sizeX * sizeY * sizeZ);
        this.metadata.setRegionCount(1);
        this.metadata.setFileType(FileType.SCHEMATICA_SCHEMATIC);
        return true;
    }

    private boolean readBlocksFromNBT(CompoundTag nbt) {
        int z;
        int y;
        int x;
        BlockState state;
        byte addValue;
        int expectedAddLength;
        if (!(nbt.contains("Blocks") && nbt.contains("Data") && nbt.contains("Width") && nbt.contains("Height") && nbt.contains("Length"))) {
            return false;
        }
        short sizeX = nbt.getShortOr("Width", (short)0);
        short sizeY = nbt.getShortOr("Height", (short)0);
        short sizeZ = nbt.getShortOr("Length", (short)0);
        byte[] blockIdsByte = nbt.getByteArray("Blocks").orElse(new byte[0]);
        byte[] metaArr = nbt.getByteArray("Data").orElse(new byte[0]);
        int numBlocks = blockIdsByte.length;
        int layerSize = sizeX * sizeZ;
        if (numBlocks != sizeX * sizeY * sizeZ) {
            String str = String.format("SchematicaSchematic: Mismatched block array size compared to the width/height/length,\nblocks: %d, W x H x L: %d x %d x %d", numBlocks, (int)sizeX, (int)sizeY, (int)sizeZ);
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
            return false;
        }
        if (numBlocks != metaArr.length) {
            String str = String.format("SchematicaSchematic: Mismatched block ID and metadata array sizes, blocks: %d, meta: %d", numBlocks, metaArr.length);
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
            return false;
        }
        if (!this.readPaletteFromNBT(nbt)) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"SchematicaSchematic: Failed to read the block palette", (Object[])new Object[0]);
            return false;
        }
        this.size = new Vec3i((int)sizeX, (int)sizeY, (int)sizeZ);
        this.blocks = new LitematicaBlockStateContainer(sizeX, (int)sizeY, sizeZ);
        this.metadata.setEnclosingSize(this.size);
        this.metadata.setTotalBlocks(numBlocks);
        this.metadata.setTotalVolume(sizeX * sizeY * sizeZ);
        this.metadata.setRegionCount(1);
        this.metadata.setFileType(FileType.SCHEMATICA_SCHEMATIC);
        if (nbt.contains("Add")) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"SchematicaSchematic: Old Schematica format detected, not currently implemented...", (Object[])new Object[0]);
            return false;
        }
        byte[] add = null;
        if (nbt.contains("AddBlocks") && (add = nbt.getByteArray("AddBlocks").orElse(new byte[0])).length != (expectedAddLength = (int)Math.ceil((double)blockIdsByte.length / 2.0))) {
            String str = String.format("SchematicaSchematic: Add array size mismatch, blocks: %d, add: %d, expected add: %d", numBlocks, add.length, expectedAddLength);
            if (add.length < expectedAddLength) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)str, (Object[])new Object[0]);
                return false;
            }
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)str, (Object[])new Object[0]);
        }
        int loopMax = numBlocks % 2 == 0 ? numBlocks - 1 : numBlocks - 2;
        int bi = 0;
        int ai = 0;
        while (bi < loopMax) {
            addValue = add != null ? add[ai] : (byte)0;
            int byteId = blockIdsByte[bi] & 0xFF;
            state = this.palette[(addValue & 0xF0) << 8 | byteId << 4 | metaArr[bi]];
            x = bi % sizeX;
            y = bi / layerSize;
            z = bi % layerSize / sizeX;
            this.blocks.set(x, y, z, state);
            x = (bi + 1) % sizeX;
            y = (bi + 1) / layerSize;
            z = (bi + 1) % layerSize / sizeX;
            byteId = blockIdsByte[bi + 1] & 0xFF;
            state = this.palette[(addValue & 0xF) << 12 | byteId << 4 | metaArr[bi + 1]];
            this.blocks.set(x, y, z, state);
            bi += 2;
            ++ai;
        }
        if (numBlocks % 2 != 0) {
            addValue = add != null ? add[ai] : (byte)0;
            int byteId = blockIdsByte[bi] & 0xFF;
            state = this.palette[(addValue & 0xF0) << 8 | byteId << 4 | metaArr[bi]];
            x = bi % sizeX;
            y = bi / layerSize;
            z = bi % layerSize / sizeX;
            this.blocks.set(x, y, z, state);
        }
        return true;
    }

    private void postProcessBlocks() {
        if (this.needsConversionPostProcessing) {
            SchematicConverter.postProcessBlocks(this.blocks, this.tiles, this.postProcessingFilter);
        }
    }

    private void readEntitiesFromNBT(CompoundTag nbt) {
        this.entities.clear();
        ListTag tagList = nbt.getListOrEmpty("Entities");
        int minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
        this.metadata.setSchematicVersion(-1);
        this.metadata.setMinecraftDataVersion(minecraftDataVersion);
        this.metadata.setSchema();
        if (effective != null) {
            Litematica.LOGGER.info("SchematicaSchematic: executing Vanilla DataFixer for Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)LitematicaSchematic.MINECRAFT_DATA_VERSION);
        } else {
            Litematica.LOGGER.warn("SchematicaSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Entities DataVersion {}", (Object)minecraftDataVersion);
        }
        for (int i = 0; i < tagList.size(); ++i) {
            if (effective != null) {
                this.entities.add(SchematicConversionMaps.updateEntity(tagList.getCompoundOrEmpty(i), minecraftDataVersion));
                continue;
            }
            this.entities.add(tagList.getCompoundOrEmpty(i));
        }
    }

    private void readTileEntitiesFromNBT(CompoundTag nbt) {
        this.tiles.clear();
        ListTag tagList = nbt.getListOrEmpty("TileEntities");
        int minecraftDataVersion = Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue();
        Schema effective = DataFixerMode.getEffectiveSchema(minecraftDataVersion);
        if (effective != null) {
            Litematica.LOGGER.info("SchematicaSchematic: executing Vanilla DataFixer for Tile Entities DataVersion {} -> {}", (Object)minecraftDataVersion, (Object)LitematicaSchematic.MINECRAFT_DATA_VERSION);
        } else {
            Litematica.LOGGER.warn("SchematicaSchematic: Effective Schema has been bypassed.  Not applying Vanilla Data Fixer for Tile Entities DataVersion {}", (Object)minecraftDataVersion);
        }
        for (int i = 0; i < tagList.size(); ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            BlockPos pos = new BlockPos(tag.getIntOr("x", 0), tag.getIntOr("y", 0), tag.getIntOr("z", 0));
            Vec3i size = this.blocks.getSize();
            if (pos.getX() < 0 || pos.getX() >= size.getX() || pos.getY() < 0 || pos.getY() >= size.getY() || pos.getZ() < 0 || pos.getZ() >= size.getZ()) continue;
            if (effective != null) {
                this.tiles.put(pos, SchematicConversionMaps.updateBlockEntity(SchematicConversionMaps.checkForIdTag(tag), minecraftDataVersion));
                continue;
            }
            this.tiles.put(pos, SchematicConversionMaps.checkForIdTag(tag));
        }
    }

    @Deprecated
    public boolean readFromFile(File file) {
        return this.readFromFile(file.toPath());
    }

    public boolean readFromFile(Path file) {
        if (Files.exists(file, new LinkOption[0]) && Files.isRegularFile(file, new LinkOption[0]) && Files.isReadable(file)) {
            this.fileName = file.getFileName().toString();
            try {
                CompoundTag nbt = NbtUtils.readNbtFromFile((Path)file);
                return this.readFromNBT(nbt);
            }
            catch (Exception e) {
                Litematica.LOGGER.error("SchematicaSchematic: Failed to read Schematic data from file '{}'", (Object)file.toAbsolutePath());
            }
        }
        return false;
    }
}

