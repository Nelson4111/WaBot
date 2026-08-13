/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.IConfigOptionListEntry
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.MessageOutputType
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.WorldUtils
 *  fi.dy.masa.malilib.util.game.wrap.GameWrap
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.NbtIo
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.InteractionResult$SwingSource
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.item.context.UseOnContext
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.entity.SignBlockEntity
 *  net.minecraft.world.level.block.entity.SignText
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.level.chunk.ChunkAccess
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.level.chunk.status.ChunkStatus
 *  net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings
 *  net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplate
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.HitResult
 *  net.minecraft.world.phys.HitResult$Type
 *  net.minecraft.world.phys.Vec3
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.materials.MaterialCache;
import fi.dy.masa.litematica.mixin.entity.IMixinSignBlockEntity;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.SchematicMetadata;
import fi.dy.masa.litematica.schematic.SchematicaSchematic;
import fi.dy.masa.litematica.schematic.pickblock.SchematicPickBlockEventHandler;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.schematic.placement.TemporaryWorldHolder;
import fi.dy.masa.litematica.schematic.placement.TemporaryWorldManager;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.util.DataFixerMode;
import fi.dy.masa.litematica.util.EasyPlaceProtocol;
import fi.dy.masa.litematica.util.EasyPlaceUtils;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.PlacementHandler;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.util.invoker.IWorldUpdateSuppressor;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.config.IConfigOptionListEntry;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.MessageOutputType;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.game.wrap.GameWrap;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtIo;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.item.context.UseOnContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.SignBlockEntity;
import net.minecraft.world.level.block.entity.SignText;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.status.ChunkStatus;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplate;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;
import org.apache.commons.lang3.tuple.Pair;

public class WorldUtils {
    public static double getValidBlockRange(Minecraft mc) {
        return Configs.Generic.EASY_PLACE_VANILLA_REACH.getBooleanValue() ? mc.player.blockInteractionRange() : mc.player.blockInteractionRange() + 1.0;
    }

    public static boolean shouldPreventBlockUpdates(Level world) {
        return ((IWorldUpdateSuppressor)world).litematica_getShouldPreventBlockUpdates();
    }

    public static void setShouldPreventBlockUpdates(Level world, boolean preventUpdates) {
        ((IWorldUpdateSuppressor)world).litematica_setShouldPreventBlockUpdates(preventUpdates);
    }

    public static boolean convertLitematicaSchematicToLitematicaSchematic(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        LitematicaSchematic litematicaSchematic = WorldUtils.convertLitematicaSchematicToLitematicaSchematic(inputDir, inputFileName, outputFileName, feedback);
        return litematicaSchematic != null && litematicaSchematic.writeToFile(outputDir, outputFileName, override);
    }

    public static boolean convertSpongeSchematicToLitematicaSchematic(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        DataFixerMode oldMode = (DataFixerMode)Configs.Generic.DATAFIXER_MODE.getOptionListValue();
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)DataFixerMode.ALWAYS);
        LitematicaSchematic origSchematic = WorldUtils.convertSpongeSchematicToLitematicaSchematic(inputDir, inputFileName);
        if (origSchematic == null) {
            feedback.setString("litematica.error.schematic_conversion.sponge_to_litematica.failed_to_read_sponge");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return false;
        }
        BlockPos size = new BlockPos(origSchematic.getTotalSize());
        TemporaryWorldHolder holder = TemporaryWorldManager.INSTANCE.getTemporaryWorld("sponge_to_litematica", BlockPos.ZERO, (Vec3i)size);
        SchematicPlacement schematicPlacement = SchematicPlacement.createForSchematicConversion(origSchematic, BlockPos.ZERO);
        origSchematic.placeToWorld(holder.world(), schematicPlacement, false);
        String subRegionName = FileUtils.getNameWithoutExtension((String)inputFileName);
        AreaSelection area = new AreaSelection();
        area.setName(subRegionName);
        subRegionName = area.createNewSubRegionBox(BlockPos.ZERO, subRegionName);
        area.setSelectedSubRegionBox(subRegionName);
        Box box = area.getSelectedSubRegionBox();
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, BlockPos.ZERO);
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, size.offset(-1, -1, -1));
        LitematicaSchematic.SchematicSaveInfo info = new LitematicaSchematic.SchematicSaveInfo(false, false);
        LitematicaSchematic newSchem = LitematicaSchematic.createFromWorld(holder.world(), area, info, "?", feedback);
        if (newSchem == null) {
            feedback.setString("litematica.error.schematic_conversion.sponge_to_litematica.failed_to_create_litematic");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return false;
        }
        SchematicMetadata origMetadata = origSchematic.getMetadata();
        if (origMetadata.getAuthor().isEmpty() || origMetadata.getAuthor() == "?") {
            newSchem.getMetadata().setAuthor(GameWrap.getPlayerName());
        } else {
            newSchem.getMetadata().setAuthor(origMetadata.getAuthor());
        }
        if (origMetadata.getName().isEmpty() || origMetadata.getName() == "?") {
            newSchem.getMetadata().setName(subRegionName);
        } else {
            newSchem.getMetadata().setName(origMetadata.getName());
        }
        newSchem.getMetadata().setDescription("Converted Sponge V" + origMetadata.getSchematicVersion() + ", Schema " + origMetadata.getSchemaString());
        newSchem.getMetadata().setTimeCreated(origMetadata.getTimeCreated());
        newSchem.getMetadata().setTimeModifiedToNow();
        TemporaryWorldManager.INSTANCE.removeTemporaryWorld("sponge_to_litematica");
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
        return newSchem.writeToFile(outputDir, outputFileName, override);
    }

    public static boolean convertSchematicaSchematicToLitematicaSchematic(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        LitematicaSchematic litematicaSchematic = WorldUtils.convertSchematicaSchematicToLitematicaSchematic(inputDir, inputFileName, ignoreEntities, feedback);
        return litematicaSchematic != null && litematicaSchematic.writeToFile(outputDir, outputFileName, override);
    }

    @Nullable
    public static LitematicaSchematic convertLitematicaSchematicToLitematicaSchematic(Path inputDir, String inputFileName, String outputFilename, IStringConsumer feedback) {
        DataFixerMode oldMode = (DataFixerMode)Configs.Generic.DATAFIXER_MODE.getOptionListValue();
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)DataFixerMode.ALWAYS);
        LitematicaSchematic newSchematic = LitematicaSchematic.createFromFile(inputDir, inputFileName, FileType.LITEMATICA_SCHEMATIC);
        if (newSchematic == null) {
            feedback.setString("litematica.error.schematic_conversion.litematic_to_litematica.failed_to_read_litematic");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return null;
        }
        SchematicMetadata origMetadata = newSchematic.getMetadata();
        if (origMetadata.getAuthor().isEmpty() || origMetadata.getAuthor() == "?") {
            newSchematic.getMetadata().setAuthor(GameWrap.getPlayerName());
        } else {
            newSchematic.getMetadata().setAuthor(origMetadata.getAuthor());
        }
        if (origMetadata.getName().isEmpty() || origMetadata.getName() == "?") {
            newSchematic.getMetadata().setName(outputFilename);
        } else {
            newSchematic.getMetadata().setName(origMetadata.getName());
        }
        newSchematic.getMetadata().setDescription("Converted Litematic V" + origMetadata.getSchematicVersion() + ", Schema " + origMetadata.getSchemaString());
        newSchematic.getMetadata().setTimeCreated(origMetadata.getTimeCreated());
        newSchematic.getMetadata().setTimeModifiedToNow();
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
        return newSchematic;
    }

    @Nullable
    public static LitematicaSchematic convertSchematicaSchematicToLitematicaSchematic(Path inputDir, String inputFileName, boolean ignoreEntities, IStringConsumer feedback) {
        DataFixerMode oldMode = (DataFixerMode)Configs.Generic.DATAFIXER_MODE.getOptionListValue();
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)DataFixerMode.ALWAYS);
        SchematicaSchematic schematic = SchematicaSchematic.createFromFile(inputDir.resolve(inputFileName));
        if (schematic == null) {
            feedback.setString("litematica.error.schematic_conversion.schematic_to_litematica.failed_to_read_schematic");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return null;
        }
        TemporaryWorldHolder holder = TemporaryWorldManager.INSTANCE.getTemporaryWorld("schematic_to_litematica", BlockPos.ZERO, schematic.getSize());
        StructurePlaceSettings placementSettings = new StructurePlaceSettings();
        placementSettings.setIgnoreEntities(ignoreEntities);
        schematic.placeSchematicDirectlyToChunks(holder.world(), BlockPos.ZERO, placementSettings);
        Object subRegionName = FileUtils.getNameWithoutExtension((String)inputFileName) + " (Converted Schematic)";
        AreaSelection area = new AreaSelection();
        area.setName((String)subRegionName);
        subRegionName = area.createNewSubRegionBox(BlockPos.ZERO, (String)subRegionName);
        area.setSelectedSubRegionBox((String)subRegionName);
        Box box = area.getSelectedSubRegionBox();
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, BlockPos.ZERO);
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, new BlockPos(schematic.getSize()).offset(-1, -1, -1));
        LitematicaSchematic.SchematicSaveInfo info = new LitematicaSchematic.SchematicSaveInfo(false, false);
        LitematicaSchematic newSchematic = LitematicaSchematic.createFromWorld(holder.world(), area, info, "?", feedback);
        if (newSchematic != null && !ignoreEntities) {
            newSchematic.takeEntityDataFromSchematicaSchematic(schematic, (String)subRegionName);
        } else {
            feedback.setString("litematica.error.schematic_conversion.schematic_to_litematica.failed_to_create_schematic");
        }
        newSchematic.getMetadata().setName((String)subRegionName);
        newSchematic.getMetadata().setAuthor(GameWrap.getPlayerName());
        newSchematic.getMetadata().setDescription("Converted Schematica Schematic, Schema " + String.valueOf(schematic.getMetadata().getSchema()));
        newSchematic.getMetadata().setTimeCreated(System.currentTimeMillis());
        newSchematic.getMetadata().setTimeModifiedToNow();
        TemporaryWorldManager.INSTANCE.removeTemporaryWorld("schematic_to_litematica");
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
        return newSchematic;
    }

    public static boolean convertStructureToLitematicaSchematic(Path structureDir, String structureFileName, Path outputDir, String outputFileName, boolean override) {
        LitematicaSchematic litematicaSchematic = WorldUtils.convertStructureToLitematicaSchematic(structureDir, structureFileName);
        return litematicaSchematic != null && litematicaSchematic.writeToFile(outputDir, outputFileName, override);
    }

    public static boolean convertStructureToLitematicaSchematic(Path structureDir, String structureFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        DataFixerMode oldMode = (DataFixerMode)Configs.Generic.DATAFIXER_MODE.getOptionListValue();
        Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)DataFixerMode.ALWAYS);
        LitematicaSchematic origStructure = WorldUtils.convertStructureToLitematicaSchematic(structureDir, structureFileName);
        if (origStructure == null) {
            feedback.setString("litematica.error.schematic_conversion.structure_to_litematica.failed_to_read_structure");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return false;
        }
        BlockPos size = new BlockPos(origStructure.getTotalSize());
        TemporaryWorldHolder holder = TemporaryWorldManager.INSTANCE.getTemporaryWorld("structure_to_litematica", BlockPos.ZERO, (Vec3i)size);
        SchematicPlacement schematicPlacement = SchematicPlacement.createForSchematicConversion(origStructure, BlockPos.ZERO);
        origStructure.placeToWorld(holder.world(), schematicPlacement, false);
        String subRegionName = FileUtils.getNameWithoutExtension((String)structureFileName);
        AreaSelection area = new AreaSelection();
        area.setName(subRegionName);
        subRegionName = area.createNewSubRegionBox(BlockPos.ZERO, subRegionName);
        area.setSelectedSubRegionBox(subRegionName);
        Box box = area.getSelectedSubRegionBox();
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_1, BlockPos.ZERO);
        area.setSubRegionCornerPos(box, PositionUtils.Corner.CORNER_2, size.offset(-1, -1, -1));
        LitematicaSchematic.SchematicSaveInfo info = new LitematicaSchematic.SchematicSaveInfo(false, false);
        LitematicaSchematic newSchem = LitematicaSchematic.createFromWorld(holder.world(), area, info, "?", feedback);
        if (newSchem == null) {
            feedback.setString("litematica.error.schematic_conversion.structure_to_litematica.failed_to_create_litematic");
            Configs.Generic.DATAFIXER_MODE.setOptionListValue((IConfigOptionListEntry)oldMode);
            return false;
        }
        SchematicMetadata origMetadata = origStructure.getMetadata();
        if (origMetadata.getAuthor().isEmpty() || origMetadata.getAuthor() == "?") {
            newSchem.getMetadata().setAuthor(GameWrap.getPlayerName());
        } else {
            newSchem.getMetadata().setAuthor(origMetadata.getAuthor());
        }
        if (origMetadata.getName().isEmpty() || origMetadata.getName() == "?") {
            newSchem.getMetadata().setName(subRegionName);
        } else {
            newSchem.getMetadata().setName(origMetadata.getName());
        }
        newSchem.getMetadata().setDescription("Converted Vanilla Strucutre, Schema " + origMetadata.getSchemaString());
        newSchem.getMetadata().setTimeCreated(origMetadata.getTimeCreated());
        newSchem.getMetadata().setTimeModifiedToNow();
        boolean result = newSchem.writeToFile(outputDir, outputFileName, override);
        TemporaryWorldManager.INSTANCE.removeTemporaryWorld("structure_to_litematica");
        return result;
    }

    @Nullable
    public static LitematicaSchematic convertSpongeSchematicToLitematicaSchematic(Path dir, String fileName) {
        try {
            LitematicaSchematic schematic = LitematicaSchematic.createFromFile(dir, fileName, FileType.SPONGE_SCHEMATIC);
            if (schematic == null) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)("Failed to read the Sponge schematic from '" + fileName + "\""), (Object[])new Object[0]);
            }
            return schematic;
        }
        catch (Exception e) {
            String msg = "Exception while trying to load the Sponge schematic: " + e.getMessage();
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)msg, (Object[])new Object[0]);
            Litematica.LOGGER.error(msg);
            return null;
        }
    }

    @Nullable
    public static LitematicaSchematic convertStructureToLitematicaSchematic(Path structureDir, String structureFileName) {
        try {
            LitematicaSchematic litematicaSchematic = LitematicaSchematic.createFromFile(structureDir, structureFileName, FileType.VANILLA_STRUCTURE);
            if (litematicaSchematic == null) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)("Failed to read the vanilla structure template from '" + structureFileName + "\""), (Object[])new Object[0]);
            }
            return litematicaSchematic;
        }
        catch (Exception e) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)("Exception while trying to load the vanilla structure: " + e.getMessage()), (Object[])new Object[0]);
            Litematica.LOGGER.error("Exception while trying to load the vanilla structure: " + e.getMessage());
            return null;
        }
    }

    public static boolean convertLitematicaSchematicToSchematicaSchematic(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        return false;
    }

    public static boolean convertLitematicaSchematicToV6LitematicaSchematic(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        LitematicaSchematic v7LitematicaSchematic = LitematicaSchematic.createFromFile(inputDir, inputFileName, FileType.LITEMATICA_SCHEMATIC);
        if (v7LitematicaSchematic == null) {
            feedback.setString("litematica.error.schematic_conversion.litematic_to_litematica.failed_to_read_schematic");
            return false;
        }
        LitematicaSchematic v6LitematicaSchematic = LitematicaSchematic.createEmptySchematicFromExisting(v7LitematicaSchematic, Minecraft.getInstance().player.getName().getString());
        v6LitematicaSchematic.downgradeV7toV6Schematic(v7LitematicaSchematic);
        if (v6LitematicaSchematic.writeToFile(outputDir, outputFileName, override, true)) {
            return true;
        }
        feedback.setString("litematica.error.schematic_conversion.litematic_to_litematica.failed_to_downgrade_litematic");
        return false;
    }

    public static boolean convertLitematicaSchematicToVanillaStructure(Path inputDir, String inputFileName, Path outputDir, String outputFileName, boolean ignoreEntities, boolean override, IStringConsumer feedback) {
        StructureTemplate template = WorldUtils.convertLitematicaSchematicToVanillaStructure(inputDir, inputFileName, ignoreEntities, feedback);
        return WorldUtils.writeVanillaStructureToFile(template, outputDir, outputFileName, override, feedback);
    }

    @Nullable
    public static StructureTemplate convertLitematicaSchematicToVanillaStructure(Path inputDir, String inputFileName, boolean ignoreEntities, IStringConsumer feedback) {
        LitematicaSchematic litematicaSchematic = LitematicaSchematic.createFromFile(inputDir, inputFileName);
        if (litematicaSchematic == null) {
            feedback.setString("litematica.error.schematic_conversion.litematic_to_structure.failed_to_read_litematic");
            return null;
        }
        BlockPos size = new BlockPos(litematicaSchematic.getTotalSize());
        SchematicPlacement schematicPlacement = SchematicPlacement.createForSchematicConversion(litematicaSchematic, BlockPos.ZERO);
        TemporaryWorldHolder holder = TemporaryWorldManager.INSTANCE.getTemporaryWorld("litematic_to_structure", BlockPos.ZERO, (Vec3i)size);
        litematicaSchematic.placeToWorld(holder.world(), schematicPlacement, false);
        StructureTemplate template = new StructureTemplate();
        template.fillFromWorld((Level)holder.world(), BlockPos.ZERO, (Vec3i)size, !ignoreEntities, List.of((Object)Blocks.STRUCTURE_VOID));
        TemporaryWorldManager.INSTANCE.removeTemporaryWorld("litematic_to_structure");
        return template;
    }

    private static boolean writeVanillaStructureToFile(StructureTemplate template, Path dir, String fileNameIn, boolean override, IStringConsumer feedback) {
        Object fileName = fileNameIn;
        String extension = ".nbt";
        if (!((String)fileName).endsWith(extension)) {
            fileName = (String)fileName + extension;
        }
        Path file = dir.resolve((String)fileName);
        Object os = null;
        try {
            if (!Files.exists(dir, new LinkOption[0])) {
                FileUtils.createDirectoriesIfMissing((Path)dir);
            }
            if (!Files.isDirectory(dir, new LinkOption[0])) {
                feedback.setString(StringUtils.translate((String)"litematica.error.schematic_write_to_file_failed.directory_creation_failed", (Object[])new Object[]{dir.toAbsolutePath()}));
                return false;
            }
            if (!override && Files.exists(file, new LinkOption[0])) {
                feedback.setString(StringUtils.translate((String)"litematica.error.structure_write_to_file_failed.exists", (Object[])new Object[]{file.toAbsolutePath()}));
                return false;
            }
            NbtIo.writeCompressed((CompoundTag)template.save(new CompoundTag()), (Path)file);
            return true;
        }
        catch (Exception e) {
            feedback.setString(StringUtils.translate((String)"litematica.error.structure_write_to_file_failed.exception", (Object[])new Object[]{file.toAbsolutePath()}));
            return false;
        }
    }

    public static boolean isClientChunkLoaded(ClientLevel world, int chunkX, int chunkZ) {
        boolean test = world.getChunkSource().getChunk(chunkX, chunkZ, ChunkStatus.FULL, false) != null;
        return test;
    }

    @Deprecated(forRemoval=true)
    public static List<Pair<Integer, Integer>> loadChunksSchematicWorld(WorldSchematic world, BlockPos origin, Vec3i areaSize) {
        ArrayList<Pair<Integer, Integer>> chunks = new ArrayList<Pair<Integer, Integer>>();
        BlockPos posEnd = origin.offset((Vec3i)PositionUtils.getRelativeEndPositionFromAreaSize(areaSize));
        BlockPos posMin = PositionUtils.getMinCorner(origin, posEnd);
        BlockPos posMax = PositionUtils.getMaxCorner(origin, posEnd);
        int cxMin = posMin.getX() >> 4;
        int czMin = posMin.getZ() >> 4;
        int cxMax = posMax.getX() >> 4;
        int czMax = posMax.getZ() >> 4;
        for (int cz = czMin; cz <= czMax; ++cz) {
            for (int cx = cxMin; cx <= cxMax; ++cx) {
                world.getChunkSource().loadChunk(cx, cz);
                chunks.add((Pair<Integer, Integer>)Pair.of((Object)cx, (Object)cz));
            }
        }
        return chunks;
    }

    public static void setToolModeBlockState(ToolMode mode, boolean primary, Minecraft mc) {
        BlockHitResult trace;
        BlockState state = Blocks.AIR.defaultBlockState();
        Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
        RayTraceUtils.RayTraceWrapper wrapper = RayTraceUtils.getGenericTrace((Level)mc.level, entity, WorldUtils.getValidBlockRange(mc));
        if (wrapper != null && (trace = wrapper.getBlockHitResult()) != null && trace.getType() == HitResult.Type.BLOCK) {
            BlockPos pos = trace.getBlockPos();
            if (wrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
                state = SchematicWorldHandler.getSchematicWorld().getBlockState(pos);
            } else if (wrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.VANILLA_BLOCK) {
                state = mc.level.getBlockState(pos);
            }
        }
        if (primary) {
            mode.setPrimaryBlock(state);
        } else {
            mode.setSecondaryBlock(state);
        }
    }

    public static boolean doSchematicWorldPickBlock(boolean closest, Minecraft mc) {
        WorldSchematic world;
        SchematicPickBlockEventHandler.getInstance().resetCancelled();
        if (SchematicPickBlockEventHandler.getInstance().onSchematicPickBlockStart(closest)) {
            return true;
        }
        BlockPos pos = closest ? RayTraceUtils.getSchematicWorldTraceIfClosestNoFluids((Level)mc.level, (Entity)mc.player, WorldUtils.getValidBlockRange(mc)) : RayTraceUtils.getFurthestSchematicWorldBlockBeforeVanilla((Level)mc.level, (Entity)mc.player, WorldUtils.getValidBlockRange(mc), true);
        if (pos != null && (world = SchematicWorldHandler.getSchematicWorld()) != null) {
            BlockState state = world.getBlockState(pos);
            if (SchematicPickBlockEventHandler.getInstance().onSchematicPickBlockPreGather(world, pos, state)) {
                return true;
            }
            ItemStack stack = SchematicPickBlockEventHandler.getInstance().hasPickStack() ? SchematicPickBlockEventHandler.getInstance().getPickStack() : MaterialCache.getInstance().getRequiredBuildItemForState(state, world, pos);
            if (SchematicPickBlockEventHandler.getInstance().onSchematicPickBlockPrePick(world, pos, state, stack)) {
                return true;
            }
            if (SchematicPickBlockEventHandler.getInstance().hasSlotHandler() && SchematicPickBlockEventHandler.getInstance().executePickBlockHandler(world, pos, stack)) {
                SchematicPickBlockEventHandler.getInstance().onSchematicPickBlockSuccess();
                return true;
            }
            InventoryUtils.schematicWorldPickBlock(stack, pos, world, mc);
            SchematicPickBlockEventHandler.getInstance().onSchematicPickBlockSuccess();
            return true;
        }
        return false;
    }

    public static void insertSignTextFromSchematic(SignBlockEntity beClient, String[] screenTextArr, boolean front) {
        BlockEntity beSchem;
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        if (worldSchematic != null && (beSchem = worldSchematic.getBlockEntity(beClient.getBlockPos())) instanceof SignBlockEntity) {
            SignText textSchematic;
            IMixinSignBlockEntity beMixinSchem = (IMixinSignBlockEntity)beSchem;
            SignText signText = textSchematic = front ? beMixinSchem.litematica_getFrontText() : beMixinSchem.litematica_getBackText();
            if (textSchematic != null) {
                for (int i = 0; i < screenTextArr.length; ++i) {
                    screenTextArr[i] = textSchematic.getMessage(i, false).getString();
                }
                beClient.setText(textSchematic, front);
            }
        }
    }

    @Deprecated
    public static void easyPlaceOnUseTick(Minecraft mc) {
        if (mc.player != null && DataManager.getToolMode() != ToolMode.REBUILD && Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && Configs.Generic.EASY_PLACE_HOLD_ENABLED.getBooleanValue() && Hotkeys.EASY_PLACE_ACTIVATION.getKeybind().isKeybindHeld() && !Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue()) {
            WorldUtils.doEasyPlaceAction(mc);
        }
    }

    @Deprecated
    public static boolean handleEasyPlace(Minecraft mc) {
        if (Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && !Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue() && DataManager.getToolMode() != ToolMode.REBUILD) {
            InteractionResult result = WorldUtils.doEasyPlaceAction(mc);
            if (result == InteractionResult.FAIL) {
                MessageOutputType type = (MessageOutputType)Configs.Generic.PLACEMENT_RESTRICTION_WARN.getOptionListValue();
                if (type == MessageOutputType.MESSAGE) {
                    InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.easy_place_fail", (Object[])new Object[0]);
                } else if (type == MessageOutputType.ACTIONBAR) {
                    InfoUtils.printActionbarMessage((String)"litematica.message.easy_place_fail", (Object[])new Object[0]);
                }
                return true;
            }
            return result != InteractionResult.PASS;
        }
        return false;
    }

    @Deprecated
    private static InteractionResult doEasyPlaceAction(Minecraft mc) {
        RayTraceUtils.RayTraceWrapper traceWrapper;
        double traceMaxRange = WorldUtils.getValidBlockRange(mc);
        if (Configs.Generic.EASY_PLACE_FIRST.getBooleanValue()) {
            boolean targetFluids = Configs.InfoOverlays.INFO_OVERLAYS_TARGET_FLUIDS.getBooleanValue();
            traceWrapper = RayTraceUtils.getGenericTrace((Level)mc.level, (Entity)mc.player, traceMaxRange, true, targetFluids, false);
        } else {
            traceWrapper = RayTraceUtils.getFurthestSchematicWorldTraceBeforeVanilla((Level)mc.level, (Entity)mc.player, traceMaxRange);
            if (traceWrapper == null && EasyPlaceUtils.placementRestrictionInEffect(mc)) {
                return InteractionResult.FAIL;
            }
        }
        if (traceWrapper == null) {
            return InteractionResult.PASS;
        }
        if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = traceWrapper.getBlockHitResult();
            HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity((Level)mc.level, (Entity)mc.player, false, traceMaxRange);
            BlockPos pos = trace.getBlockPos();
            WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
            BlockState stateSchematic = world.getBlockState(pos);
            ItemStack stack = MaterialCache.getInstance().getRequiredBuildItemForState(stateSchematic, world, pos);
            if (EasyPlaceUtils.easyPlaceIsPositionCached(pos)) {
                return InteractionResult.FAIL;
            }
            if (EasyPlaceUtils.easyPlaceIsTooFast()) {
                return InteractionResult.FAIL;
            }
            if (!stack.isEmpty()) {
                BlockState stateClient = mc.level.getBlockState(pos);
                if (stateSchematic == stateClient) {
                    return InteractionResult.FAIL;
                }
                if (EasyPlaceUtils.easyPlaceBlockChecksCancel(stateSchematic, stateClient, (Player)mc.player, traceVanilla, stack)) {
                    return InteractionResult.FAIL;
                }
                InventoryUtils.schematicWorldPickBlock(stack, pos, world, mc);
                InteractionHand hand = EntityUtils.getUsedHandForItem((Player)mc.player, stack);
                if (hand == null) {
                    return InteractionResult.FAIL;
                }
                Vec3 hitPos = trace.getLocation();
                Direction sideOrig = trace.getDirection();
                EasyPlaceProtocol protocol = PlacementHandler.getEffectiveProtocolVersion();
                if ((protocol == EasyPlaceProtocol.NONE || protocol == EasyPlaceProtocol.SLAB_ONLY) && traceVanilla != null && traceVanilla.getType() == HitResult.Type.BLOCK) {
                    BlockHitResult hitResult = (BlockHitResult)traceVanilla;
                    BlockPos posVanilla = hitResult.getBlockPos();
                    Direction sideVanilla = hitResult.getDirection();
                    BlockState stateVanilla = mc.level.getBlockState(posVanilla);
                    Vec3 hit = traceVanilla.getLocation();
                    BlockPlaceContext ctx = new BlockPlaceContext(new UseOnContext((Player)mc.player, hand, hitResult));
                    if (!stateVanilla.canBeReplaced(ctx) && pos.equals((Object)(posVanilla = posVanilla.relative(sideVanilla)))) {
                        hitPos = hit;
                        sideOrig = sideVanilla;
                    }
                }
                Direction side = EasyPlaceUtils.applyPlacementFacing(stateSchematic, sideOrig, stateClient);
                EasyPlaceUtils.PlacementProtocolData placementData = EasyPlaceUtils.applyPlacementProtocolAll(pos, stateSchematic, hitPos);
                if (placementData.mustFail) {
                    return InteractionResult.FAIL;
                }
                if (placementData.handled) {
                    pos = placementData.pos;
                    side = placementData.side;
                    hitPos = placementData.hitVec;
                }
                if (protocol == EasyPlaceProtocol.V3) {
                    hitPos = EasyPlaceUtils.applyPlacementProtocolV3(pos, stateSchematic, hitPos);
                } else if (protocol == EasyPlaceProtocol.V2) {
                    hitPos = EasyPlaceUtils.applyCarpetProtocolHitVec(pos, stateSchematic, hitPos);
                } else if (protocol == EasyPlaceProtocol.SLAB_ONLY) {
                    hitPos = EasyPlaceUtils.applyBlockSlabProtocol(pos, stateSchematic, hitPos);
                }
                EasyPlaceUtils.cacheEasyPlacePosition(pos);
                BlockHitResult hitResult = new BlockHitResult(hitPos, side, pos, false);
                InteractionResult result = mc.gameMode.useItemOn(mc.player, hand, hitResult);
                if (InteractionResult.SUCCESS.swingSource().equals((Object)InteractionResult.SwingSource.CLIENT) && Configs.Generic.EASY_PLACE_SWING_HAND.getBooleanValue()) {
                    mc.player.swing(hand);
                }
                if (stateSchematic.getBlock() instanceof SlabBlock && stateSchematic.getValue((Property)SlabBlock.TYPE) == SlabType.DOUBLE && (stateClient = mc.level.getBlockState(pos)).getBlock() instanceof SlabBlock && stateClient.getValue((Property)SlabBlock.TYPE) != SlabType.DOUBLE) {
                    side = EasyPlaceUtils.applyPlacementFacing(stateSchematic, sideOrig, stateClient);
                    hitResult = new BlockHitResult(hitPos, side, pos, false);
                    mc.gameMode.useItemOn(mc.player, hand, hitResult);
                }
            }
            return InteractionResult.SUCCESS;
        }
        if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.VANILLA_BLOCK) {
            return EasyPlaceUtils.placementRestrictionInEffect(mc) ? InteractionResult.FAIL : InteractionResult.PASS;
        }
        return InteractionResult.PASS;
    }

    public static boolean isPositionWithinRangeOfSchematicRegions(BlockPos pos, int range) {
        SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        int minCX = x - range >> 4;
        int minCZ = z - range >> 4;
        int maxCX = x + range >> 4;
        int maxCZ = z + range >> 4;
        for (int cz = minCZ; cz <= maxCZ; ++cz) {
            for (int cx = minCX; cx <= maxCX; ++cx) {
                List<SchematicPlacementManager.PlacementPart> parts = manager.getPlacementPartsInChunk(cx, cz);
                for (SchematicPlacementManager.PlacementPart part : parts) {
                    IntBoundingBox box = part.bb;
                    if (x < box.minX() - range || x > box.maxX() + range || y < box.minY() - range || y > box.maxY() + range || z < box.minZ() - range || z > box.maxZ() + range) continue;
                    return true;
                }
            }
        }
        return false;
    }

    public static boolean isSliceEmpty(Level world, Direction.Axis axis, BlockPos pos1, BlockPos pos2) {
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        switch (axis) {
            case Z: {
                int x1 = Math.min(pos1.getX(), pos2.getX());
                int x2 = Math.max(pos1.getX(), pos2.getX());
                int y1 = Math.min(pos1.getY(), pos2.getY());
                int y2 = Math.max(pos1.getY(), pos2.getY());
                int z = pos1.getZ();
                int cxMin = x1 >> 4;
                int cxMax = x2 >> 4;
                for (int cx = cxMin; cx <= cxMax; ++cx) {
                    LevelChunk chunk = world.getChunk(cx, z >> 4);
                    int xMin = Math.max(x1, cx << 4);
                    int xMax = Math.min(x2, (cx << 4) + 15);
                    int yMax = Math.min(y2, fi.dy.masa.malilib.util.WorldUtils.getHighestSectionYOffset((ChunkAccess)chunk) + 15);
                    for (int x = xMin; x <= xMax; ++x) {
                        for (int y = y1; y <= yMax; ++y) {
                            if (chunk.getBlockState((BlockPos)posMutable.set(x, y, z)).isAir()) continue;
                            return false;
                        }
                    }
                }
                break;
            }
            case Y: {
                int x1 = Math.min(pos1.getX(), pos2.getX());
                int x2 = Math.max(pos1.getX(), pos2.getX());
                int y = pos1.getY();
                int z1 = Math.min(pos1.getZ(), pos2.getZ());
                int z2 = Math.max(pos1.getZ(), pos2.getZ());
                int cxMin = x1 >> 4;
                int cxMax = x2 >> 4;
                int czMin = z1 >> 4;
                int czMax = z2 >> 4;
                for (int cz = czMin; cz <= czMax; ++cz) {
                    for (int cx = cxMin; cx <= cxMax; ++cx) {
                        LevelChunk chunk = world.getChunk(cx, cz);
                        if (y > fi.dy.masa.malilib.util.WorldUtils.getHighestSectionYOffset((ChunkAccess)chunk) + 15) continue;
                        int xMin = Math.max(x1, cx << 4);
                        int xMax = Math.min(x2, (cx << 4) + 15);
                        int zMin = Math.max(z1, cz << 4);
                        int zMax = Math.min(z2, (cz << 4) + 15);
                        for (int z = zMin; z <= zMax; ++z) {
                            for (int x = xMin; x <= xMax; ++x) {
                                if (chunk.getBlockState((BlockPos)posMutable.set(x, y, z)).isAir()) continue;
                                return false;
                            }
                        }
                    }
                }
                break;
            }
            case X: {
                int x = pos1.getX();
                int z1 = Math.min(pos1.getZ(), pos2.getZ());
                int z2 = Math.max(pos1.getZ(), pos2.getZ());
                int y1 = Math.min(pos1.getY(), pos2.getY());
                int y2 = Math.max(pos1.getY(), pos2.getY());
                int czMin = z1 >> 4;
                int czMax = z2 >> 4;
                for (int cz = czMin; cz <= czMax; ++cz) {
                    LevelChunk chunk = world.getChunk(x >> 4, cz);
                    int zMin = Math.max(z1, cz << 4);
                    int zMax = Math.min(z2, (cz << 4) + 15);
                    int yMax = Math.min(y2, fi.dy.masa.malilib.util.WorldUtils.getHighestSectionYOffset((ChunkAccess)chunk) + 15);
                    for (int z = zMin; z <= zMax; ++z) {
                        for (int y = y1; y <= yMax; ++y) {
                            if (chunk.getBlockState((BlockPos)posMutable.set(x, y, z)).isAir()) continue;
                            return false;
                        }
                    }
                }
                break;
            }
        }
        return true;
    }
}

