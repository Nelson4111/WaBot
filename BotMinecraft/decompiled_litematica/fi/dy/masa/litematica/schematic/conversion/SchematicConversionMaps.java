/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.datafixers.DataFixUtils
 *  com.mojang.serialization.Dynamic
 *  com.mojang.serialization.DynamicOps
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  it.unimi.dsi.fastutil.ints.Int2ObjectOpenHashMap
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.HolderGetter
 *  net.minecraft.core.Registry
 *  net.minecraft.core.registries.Registries
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.nbt.NbtOps
 *  net.minecraft.nbt.NbtUtils
 *  net.minecraft.nbt.StringTag
 *  net.minecraft.nbt.Tag
 *  net.minecraft.nbt.TagParser
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.datafix.DataFixers
 *  net.minecraft.util.datafix.fixes.References
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.RotatedPillarBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 */
package fi.dy.masa.litematica.schematic.conversion;

import com.mojang.datafixers.DataFixUtils;
import com.mojang.serialization.Dynamic;
import com.mojang.serialization.DynamicOps;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import it.unimi.dsi.fastutil.ints.Int2ObjectOpenHashMap;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.HolderGetter;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.Registries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.NbtOps;
import net.minecraft.nbt.NbtUtils;
import net.minecraft.nbt.StringTag;
import net.minecraft.nbt.Tag;
import net.minecraft.nbt.TagParser;
import net.minecraft.resources.Identifier;
import net.minecraft.util.datafix.DataFixers;
import net.minecraft.util.datafix.fixes.References;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.RotatedPillarBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;

public class SchematicConversionMaps {
    private static final Object2IntOpenHashMap<String> OLD_BLOCK_NAME_TO_SHIFTED_BLOCK_ID = (Object2IntOpenHashMap)DataFixUtils.make((Object)new Object2IntOpenHashMap(), map -> map.defaultReturnValue(-1));
    private static final Int2ObjectOpenHashMap<String> ID_META_TO_UPDATED_NAME = new Int2ObjectOpenHashMap();
    private static final Object2IntOpenHashMap<BlockState> BLOCKSTATE_TO_ID_META = (Object2IntOpenHashMap)DataFixUtils.make((Object)new Object2IntOpenHashMap(), map -> map.defaultReturnValue(-1));
    private static final Int2ObjectOpenHashMap<BlockState> ID_META_TO_BLOCKSTATE = new Int2ObjectOpenHashMap();
    private static final HashMap<String, String> OLD_NAME_TO_NEW_NAME = new HashMap();
    private static final HashMap<String, String> NEW_NAME_TO_OLD_NAME = new HashMap();
    private static final HashMap<CompoundTag, CompoundTag> OLD_STATE_TO_NEW_STATE = new HashMap();
    private static final HashMap<CompoundTag, CompoundTag> NEW_STATE_TO_OLD_STATE = new HashMap();
    private static final ArrayList<ConversionData> CACHED_DATA = new ArrayList();
    private static final ArrayList<ConversionDynamic> CACHED_DYNAMIC = new ArrayList();
    private static boolean initialized;

    public static void addEntry(int idMeta, String newStateString, String ... oldStateStrings) {
        CACHED_DATA.add(new ConversionData(idMeta, newStateString, oldStateStrings));
    }

    public static void addDynamicEntry(int idMeta, Dynamic<?> newState, List<Dynamic<?>> oldStates) {
        CACHED_DYNAMIC.add(new ConversionDynamic(idMeta, newState, oldStates));
    }

    public static void computeMaps() {
        if (initialized) {
            return;
        }
        SchematicConversionMaps.clearMaps();
        SchematicConversionMaps.addOverrides();
        if (!CACHED_DYNAMIC.isEmpty()) {
            SchematicConversionMaps.computeMapsDynamic();
        } else if (!CACHED_DATA.isEmpty()) {
            SchematicConversionMaps.computeMapsLegacy();
        } else {
            throw new RuntimeException("computeMaps(): No Cached Block State Flattening maps has been cached!");
        }
        initialized = true;
    }

    private static void computeMapsLegacy() {
        for (ConversionData data : CACHED_DATA) {
            try {
                CompoundTag newStateTag;
                CompoundTag oldStateTag;
                if (data.oldStateStrings.length > 0 && (oldStateTag = SchematicConversionMaps.getStateTagFromString(data.oldStateStrings[0])) != null) {
                    String name = oldStateTag.getStringOr("Name", "");
                    OLD_BLOCK_NAME_TO_SHIFTED_BLOCK_ID.putIfAbsent((Object)name, data.idMeta & 0xFFF0);
                }
                if ((newStateTag = SchematicConversionMaps.getStateTagFromString(data.newStateString)) == null) continue;
                SchematicConversionMaps.addIdMetaToBlockState(data.idMeta, newStateTag, data.oldStateStrings);
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("computeMapsLegacy(): Exception while adding blockstate conversion map entry for ID '{}' (fixed state: '{}')", (Object)data.idMeta, (Object)data.newStateString, (Object)e);
            }
        }
    }

    private static void computeMapsDynamic() {
        for (ConversionDynamic entry : CACHED_DYNAMIC) {
            try {
                CompoundTag newStateTag;
                String oldName;
                if (!entry.oldStates().isEmpty() && !(oldName = ((Dynamic)entry.oldStates().getFirst()).get("Name").asString("")).isEmpty()) {
                    OLD_BLOCK_NAME_TO_SHIFTED_BLOCK_ID.putIfAbsent((Object)oldName, entry.idMeta() & 0xFFF0);
                }
                if ((newStateTag = (CompoundTag)entry.newState().convert((DynamicOps)NbtOps.INSTANCE).getValue()).isEmpty()) continue;
                SchematicConversionMaps.addIdMetaToBlockStateDynamic(entry.idMeta(), newStateTag, entry.oldStates());
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("computeMapsDynamic(): Exception while adding blockstate conversion map entry for ID '{}' (fixed state: '{}')", (Object)entry.idMeta, (Object)entry.newState.toString(), (Object)e);
            }
        }
    }

    @Nullable
    public static BlockState get_1_13_2_StateForIdMeta(int idMeta) {
        return (BlockState)ID_META_TO_BLOCKSTATE.get(idMeta);
    }

    public static CompoundTag get_1_13_2_StateTagFor_1_12_Tag(CompoundTag oldStateTag) {
        CompoundTag tag = OLD_STATE_TO_NEW_STATE.get(oldStateTag);
        return tag != null ? tag : oldStateTag;
    }

    public static CompoundTag get_1_12_StateTagFor_1_13_2_Tag(CompoundTag newStateTag) {
        CompoundTag tag = NEW_STATE_TO_OLD_STATE.get(newStateTag);
        return tag != null ? tag : newStateTag;
    }

    public static int getOldNameToShiftedBlockId(String oldBlockname) {
        return OLD_BLOCK_NAME_TO_SHIFTED_BLOCK_ID.getInt((Object)oldBlockname);
    }

    private static void addOverrides() {
        BlockState air = Blocks.AIR.defaultBlockState();
        BLOCKSTATE_TO_ID_META.put((Object)air, 0);
        ID_META_TO_BLOCKSTATE.put(0, (Object)air);
        int idOldLog = 284;
        int idNewLog = 2604;
        ID_META_TO_BLOCKSTATE.put(idOldLog | 0, (Object)((BlockState)Blocks.OAK_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_BLOCKSTATE.put(idOldLog | 1, (Object)((BlockState)Blocks.SPRUCE_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_BLOCKSTATE.put(idOldLog | 2, (Object)((BlockState)Blocks.BIRCH_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_BLOCKSTATE.put(idOldLog | 3, (Object)((BlockState)Blocks.JUNGLE_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_BLOCKSTATE.put(idNewLog | 0, (Object)((BlockState)Blocks.ACACIA_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_BLOCKSTATE.put(idNewLog | 1, (Object)((BlockState)Blocks.DARK_OAK_WOOD.defaultBlockState().setValue((Property)RotatedPillarBlock.AXIS, (Comparable)Direction.Axis.Y)));
        ID_META_TO_UPDATED_NAME.put(1648, (Object)"minecraft:melon");
        ID_META_TO_UPDATED_NAME.put(2304, (Object)"minecraft:skeleton_skull");
        ID_META_TO_UPDATED_NAME.put(2305, (Object)"minecraft:skeleton_skull");
        ID_META_TO_UPDATED_NAME.put(2306, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2307, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2308, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2309, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2312, (Object)"minecraft:skeleton_skull");
        ID_META_TO_UPDATED_NAME.put(2313, (Object)"minecraft:skeleton_skull");
        ID_META_TO_UPDATED_NAME.put(2314, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2315, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2316, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(2317, (Object)"minecraft:skeleton_wall_skull");
        ID_META_TO_UPDATED_NAME.put(3664, (Object)"minecraft:shulker_box");
        ID_META_TO_UPDATED_NAME.put(3665, (Object)"minecraft:shulker_box");
        ID_META_TO_UPDATED_NAME.put(3666, (Object)"minecraft:shulker_box");
        ID_META_TO_UPDATED_NAME.put(3667, (Object)"minecraft:shulker_box");
        ID_META_TO_UPDATED_NAME.put(3668, (Object)"minecraft:shulker_box");
        ID_META_TO_UPDATED_NAME.put(3669, (Object)"minecraft:shulker_box");
    }

    private static void clearMaps() {
        OLD_BLOCK_NAME_TO_SHIFTED_BLOCK_ID.clear();
        ID_META_TO_UPDATED_NAME.clear();
        BLOCKSTATE_TO_ID_META.clear();
        ID_META_TO_BLOCKSTATE.clear();
        OLD_NAME_TO_NEW_NAME.clear();
        NEW_NAME_TO_OLD_NAME.clear();
        OLD_STATE_TO_NEW_STATE.clear();
        NEW_STATE_TO_OLD_STATE.clear();
    }

    private static void addIdMetaToBlockState(int idMeta, CompoundTag newStateTag, String ... oldStateStrings) {
        try {
            String newName = newStateTag.getStringOr("Name", "");
            String overriddenName = (String)ID_META_TO_UPDATED_NAME.get(idMeta);
            if (overriddenName != null) {
                newName = overriddenName;
                newStateTag.putString("Name", newName);
            }
            Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
            BlockState state = NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)newStateTag);
            ID_META_TO_BLOCKSTATE.putIfAbsent(idMeta, (Object)state);
            BLOCKSTATE_TO_ID_META.putIfAbsent((Object)state, idMeta);
            if (oldStateStrings.length > 0) {
                CompoundTag oldStateTag = SchematicConversionMaps.getStateTagFromString(oldStateStrings[0]);
                String oldName = oldStateTag.getStringOr("Name", "");
                if (overriddenName == null) {
                    newName = SchematicConversionMaps.updateBlockName(newName, Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue());
                    newStateTag.putString("Name", newName);
                }
                if (!oldName.equals(newName)) {
                    OLD_NAME_TO_NEW_NAME.putIfAbsent(oldName, newName);
                    NEW_NAME_TO_OLD_NAME.putIfAbsent(newName, oldName);
                }
                SchematicConversionMaps.addOldStateToNewState(newStateTag, oldStateStrings);
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("addIdMetaToBlockState(): Exception while adding blockstate conversion map entry for ID '{}'", (Object)idMeta, (Object)e);
        }
    }

    private static void addIdMetaToBlockStateDynamic(int idMeta, CompoundTag newStateTag, List<Dynamic<?>> oldStates) {
        try {
            String newName = newStateTag.getStringOr("Name", "");
            String overriddenName = (String)ID_META_TO_UPDATED_NAME.get(idMeta);
            if (overriddenName != null) {
                newName = overriddenName;
                newStateTag.putString("Name", newName);
            }
            Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
            BlockState state = NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)newStateTag);
            ID_META_TO_BLOCKSTATE.putIfAbsent(idMeta, (Object)state);
            BLOCKSTATE_TO_ID_META.putIfAbsent((Object)state, idMeta);
            if (!oldStates.isEmpty()) {
                String oldName = ((Dynamic)oldStates.getFirst()).get("Name").asString("");
                if (overriddenName == null) {
                    newName = SchematicConversionMaps.updateBlockName(newName, Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getIntegerValue());
                    newStateTag.putString("Name", newName);
                }
                if (!oldName.equals(newName)) {
                    OLD_NAME_TO_NEW_NAME.putIfAbsent(oldName, newName);
                    NEW_NAME_TO_OLD_NAME.putIfAbsent(newName, oldName);
                }
                SchematicConversionMaps.addOldStateToNewStateDynamic(newStateTag, oldStates);
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("addIdMetaToBlockStateDynamic(): Exception while adding blockstate conversion map entry for ID '{}'", (Object)idMeta, (Object)e);
        }
    }

    private static void addOldStateToNewState(CompoundTag newStateTagIn, String ... oldStateStrings) {
        try {
            String oldBlockName;
            String newBlockName;
            CompoundTag oldStateTag;
            if (oldStateStrings.length == 1) {
                CompoundTag oldStateTag2 = SchematicConversionMaps.getStateTagFromString(oldStateStrings[0]);
                if (oldStateTag2 != null) {
                    OLD_STATE_TO_NEW_STATE.putIfAbsent(oldStateTag2, newStateTagIn);
                    NEW_STATE_TO_OLD_STATE.putIfAbsent(newStateTagIn, oldStateTag2);
                }
            } else if (oldStateStrings.length > 1 && (oldStateTag = SchematicConversionMaps.getStateTagFromString(oldStateStrings[0])) != null && newStateTagIn.keySet().equals(oldStateTag.keySet()) && (newBlockName = OLD_NAME_TO_NEW_NAME.get(oldBlockName = oldStateTag.getStringOr("Name", ""))) != null && !newBlockName.equals(oldBlockName)) {
                for (String oldStateString : oldStateStrings) {
                    oldStateTag = SchematicConversionMaps.getStateTagFromString(oldStateString);
                    if (oldStateTag == null) continue;
                    CompoundTag newTag = oldStateTag.copy();
                    newTag.putString("Name", newBlockName);
                    OLD_STATE_TO_NEW_STATE.putIfAbsent(oldStateTag, newTag);
                    NEW_STATE_TO_OLD_STATE.putIfAbsent(newTag, oldStateTag);
                }
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("addOldStateToNewState(): Exception while adding new blockstate to old blockstate conversion map entry for '{}'", (Object)newStateTagIn, (Object)e);
        }
    }

    private static void addOldStateToNewStateDynamic(CompoundTag newStateTagIn, List<Dynamic<?>> oldStates) {
        block11: {
            try {
                String oldBlockName;
                String newBlockName;
                if (oldStates.size() == 1) {
                    CompoundTag oldStateTag = new CompoundTag();
                    try {
                        oldStateTag = (CompoundTag)((Dynamic)oldStates.getFirst()).convert((DynamicOps)NbtOps.INSTANCE).getValue();
                    }
                    catch (Exception err) {
                        Litematica.LOGGER.warn("addOldStateToNewStateDynamic(): Exception while adding new blockstate to old blockstate conversion map entry for '{}'", (Object)newStateTagIn, (Object)err);
                    }
                    if (oldStateTag != null && !oldStateTag.isEmpty()) {
                        OLD_STATE_TO_NEW_STATE.putIfAbsent(oldStateTag, newStateTagIn);
                        NEW_STATE_TO_OLD_STATE.putIfAbsent(newStateTagIn, oldStateTag);
                    }
                    break block11;
                }
                if (oldStates.size() <= 1) break block11;
                CompoundTag oldStateTag = new CompoundTag();
                try {
                    oldStateTag = (CompoundTag)((Dynamic)oldStates.getFirst()).convert((DynamicOps)NbtOps.INSTANCE).getValue();
                }
                catch (Exception err) {
                    Litematica.LOGGER.warn("addOldStateToNewStateDynamic(): Exception while adding new blockstate to old blockstate conversion map entry for '{}'", (Object)newStateTagIn, (Object)err);
                }
                if (oldStateTag == null || !newStateTagIn.keySet().equals(oldStateTag.keySet()) || (newBlockName = OLD_NAME_TO_NEW_NAME.get(oldBlockName = oldStateTag.getStringOr("Name", ""))) == null || newBlockName.equals(oldBlockName)) break block11;
                for (Dynamic<?> entry : oldStates) {
                    try {
                        oldStateTag = (CompoundTag)entry.convert((DynamicOps)NbtOps.INSTANCE).getValue();
                    }
                    catch (Exception err) {
                        Litematica.LOGGER.warn("addOldStateToNewStateDynamic(): Exception while adding new blockstate to old blockstate conversion map entry for '{}'", (Object)newStateTagIn, (Object)err);
                    }
                    if (oldStateTag == null) continue;
                    CompoundTag newTag = oldStateTag.copy();
                    newTag.putString("Name", newBlockName);
                    OLD_STATE_TO_NEW_STATE.putIfAbsent(oldStateTag, newTag);
                    NEW_STATE_TO_OLD_STATE.putIfAbsent(newTag, oldStateTag);
                }
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("addOldStateToNewStateDynamic(): Exception while adding new blockstate to old blockstate conversion map entry for '{}'", (Object)newStateTagIn, (Object)e);
            }
        }
    }

    public static CompoundTag getStateTagFromString(String str) {
        try {
            return TagParser.parseCompoundFully((String)str.replace('\'', '\"'));
        }
        catch (Exception e) {
            return null;
        }
    }

    public static String updateBlockName(String oldName, int oldVersion) {
        StringTag tagStr = StringTag.valueOf((String)oldName);
        try {
            return ((Tag)DataFixers.getDataFixer().update(References.BLOCK_NAME, new Dynamic((DynamicOps)NbtOps.INSTANCE, (Object)tagStr), oldVersion, LitematicaSchematic.MINECRAFT_DATA_VERSION).getValue()).asString().orElse(oldName);
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("updateBlockName: failed to update Block Name [{}], preserving original state (data may become lost)", (Object)oldName);
            return oldName;
        }
    }

    public static CompoundTag updateBlockStates(CompoundTag oldBlockState, int oldVersion) {
        String blockName;
        String oldName;
        if (oldVersion >= 1631 && !(oldName = oldBlockState.getStringOr("Name", "")).equalsIgnoreCase(blockName = SchematicConversionMaps.updateBlockName(oldName, oldVersion))) {
            oldBlockState.putString("Name", blockName);
        }
        try {
            return (CompoundTag)DataFixers.getDataFixer().update(References.BLOCK_STATE, new Dynamic((DynamicOps)NbtOps.INSTANCE, (Object)oldBlockState), oldVersion, LitematicaSchematic.MINECRAFT_DATA_VERSION).getValue();
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("updateBlockStates: failed to update Block State [{}], preserving original state (data may become lost)", (Object)(oldBlockState.contains("Name") ? oldBlockState.getStringOr("Name", "?") : "?"));
            return oldBlockState;
        }
    }

    public static CompoundTag updateBlockEntity(CompoundTag oldBlockEntity, int oldVersion) {
        try {
            return (CompoundTag)DataFixers.getDataFixer().update(References.BLOCK_ENTITY, new Dynamic((DynamicOps)NbtOps.INSTANCE, (Object)oldBlockEntity), oldVersion, LitematicaSchematic.MINECRAFT_DATA_VERSION).getValue();
        }
        catch (Exception e) {
            BlockPos pos = fi.dy.masa.malilib.util.nbt.NbtUtils.readBlockPos((CompoundTag)oldBlockEntity);
            Litematica.LOGGER.warn("updateBlockEntity: failed to update Block Entity [{}] at [{}], preserving original state (data may become lost)", (Object)(oldBlockEntity.contains("id") ? oldBlockEntity.getStringOr("id", "?") : "?"), (Object)(pos != null ? pos.toShortString() : "?"));
            return oldBlockEntity;
        }
    }

    public static CompoundTag updateEntity(CompoundTag oldEntity, int oldVersion) {
        try {
            return (CompoundTag)DataFixers.getDataFixer().update(References.ENTITY, new Dynamic((DynamicOps)NbtOps.INSTANCE, (Object)oldEntity), oldVersion, LitematicaSchematic.MINECRAFT_DATA_VERSION).getValue();
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("updateEntity: failed to update Entity [{}], preserving original state (data may become lost)", (Object)(oldEntity.contains("id") ? oldEntity.getStringOr("id", "?") : "?"));
            return oldEntity;
        }
    }

    public static CompoundTag checkForIdTag(CompoundTag tags) {
        if (tags.contains("id")) {
            return tags;
        }
        if (tags.contains("Id")) {
            tags.putString("id", tags.getStringOr("Id", ""));
            return tags;
        }
        if (tags.contains("Bees") || tags.contains("bees")) {
            tags.putString("id", "minecraft:beehive");
        } else if (tags.contains("TransferCooldown") && tags.contains("Items")) {
            tags.putString("id", "minecraft:hopper");
        } else if (tags.contains("SkullOwner")) {
            tags.putString("id", "minecraft:skull");
        } else if (tags.contains("Patterns") || tags.contains("patterns")) {
            tags.putString("id", "minecraft:banner");
        } else if (tags.contains("Sherds") || tags.contains("sherds")) {
            tags.putString("id", "minecraft:decorated_pot");
        } else if (tags.contains("last_interacted_slot") && tags.contains("Items")) {
            tags.putString("id", "minecraft:chiseled_bookshelf");
        } else if (tags.contains("CookTime") && tags.contains("Items")) {
            tags.putString("id", "minecraft:furnace");
        } else if (tags.contains("RecordItem")) {
            tags.putString("id", "minecraft:jukebox");
        } else if (tags.contains("Book") || tags.contains("book")) {
            tags.putString("id", "minecraft:lectern");
        } else if (tags.contains("front_text")) {
            tags.putString("id", "minecraft:sign");
        } else if (tags.contains("BrewTime") || tags.contains("Fuel")) {
            tags.putString("id", "minecraft:brewing_stand");
        } else if (tags.contains("LootTable") && tags.contains("LootTableSeed") || tags.contains("hit_direction") || tags.contains("item")) {
            tags.putString("id", "minecraft:suspicious_sand");
        } else if (tags.contains("SpawnData") || tags.contains("SpawnPotentials")) {
            tags.putString("id", "minecraft:spawner");
        } else if (tags.contains("normal_config")) {
            tags.putString("id", "minecraft:trial_spawner");
        } else if (tags.contains("shared_data")) {
            tags.putString("id", "minecraft:vault");
        } else if (tags.contains("pool") && tags.contains("final_state") && tags.contains("placement_priority")) {
            tags.putString("id", "minecraft:jigsaw");
        } else if (tags.contains("author") && tags.contains("metadata") && tags.contains("showboundingbox")) {
            tags.putString("id", "minecraft:structure_block");
        } else if (tags.contains("ExactTeleport") && tags.contains("Age")) {
            tags.putString("id", "minecraft:end_gateway");
        } else if (tags.contains("Items")) {
            tags.putString("id", "minecraft:chest");
        } else if (tags.contains("last_vibration_frequency") || tags.contains("listener")) {
            tags.putString("id", "minecraft:sculk_sensor");
        } else if (tags.contains("warning_level") || tags.contains("listener")) {
            tags.putString("id", "minecraft:sculk_shrieker");
        } else if (tags.contains("OutputSignal")) {
            tags.putString("id", "minecraft:comparator");
        } else if (tags.contains("facing") || tags.contains("extending")) {
            tags.putString("id", "minecraft:piston");
        } else if (tags.contains("x") && tags.contains("y") && tags.contains("z")) {
            tags.putString("id", "minecraft:piston");
        }
        if (tags.contains("Items")) {
            ListTag items = SchematicConversionMaps.fixItemsTag(tags.getListOrEmpty("Items"));
            tags.put("Items", (Tag)items);
        }
        return tags;
    }

    private static ListTag fixItemsTag(ListTag items) {
        ListTag newList = new ListTag();
        for (int i = 0; i < items.size(); ++i) {
            CompoundTag itemEntry = SchematicConversionMaps.fixItemTypesFrom1_21_2(items.getCompoundOrEmpty(i));
            if (itemEntry.contains("tag")) {
                CompoundTag tag = null;
                try {
                    tag = itemEntry.getCompoundOrEmpty("tag");
                }
                catch (Exception exception) {
                    // empty catch block
                }
                if (tag == null) {
                    itemEntry.remove("tag");
                } else {
                    if (tag.contains("BlockEntityTag")) {
                        CompoundTag entityEntry = tag.getCompoundOrEmpty("BlockEntityTag");
                        if (entityEntry.contains("Items")) {
                            ListTag nestedItems = SchematicConversionMaps.fixItemsTag(entityEntry.getListOrEmpty("Items"));
                            entityEntry.put("Items", (Tag)nestedItems);
                        }
                        tag.put("BlockEntityTag", (Tag)entityEntry);
                    }
                    itemEntry.put("tag", (Tag)tag);
                }
            }
            newList.add((Object)itemEntry);
        }
        return newList;
    }

    private static CompoundTag fixItemTypesFrom1_21_2(CompoundTag nbt) {
        if (!nbt.contains("id")) {
            return nbt;
        }
        String id = nbt.getStringOr("id", "");
        Identifier newId = null;
        switch (id) {
            case "minecraft:pale_oak_boat": {
                newId = Identifier.withDefaultNamespace((String)"oak_boat");
                break;
            }
            case "minecraft:pale_oak_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"oak_chest_boat");
            }
        }
        if (newId != null) {
            nbt.putString("id", newId.toString());
        }
        return nbt;
    }

    public static CompoundTag fixEntityTypesFrom1_21_2(CompoundTag nbt) {
        if (!nbt.contains("id")) {
            return nbt;
        }
        if (nbt.contains("Items")) {
            ListTag items = SchematicConversionMaps.fixItemsTag(nbt.getListOrEmpty("Items"));
            nbt.put("Items", (Tag)items);
        }
        String id = nbt.getStringOr("id", "");
        Identifier newId = null;
        String type = "";
        boolean boatFix = false;
        switch (id) {
            case "minecraft:oak_boat": 
            case "minecraft:pale_oak_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "oak";
                boatFix = true;
                break;
            }
            case "minecraft:spruce_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "spruce";
                boatFix = true;
                break;
            }
            case "minecraft:birch_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "birch";
                boatFix = true;
                break;
            }
            case "minecraft:jungle_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "jungle";
                boatFix = true;
                break;
            }
            case "minecraft:acacia_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "acacia";
                boatFix = true;
                break;
            }
            case "minecraft:cherry_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "cherry";
                boatFix = true;
                break;
            }
            case "minecraft:dark_oak_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "dark_oak";
                boatFix = true;
                break;
            }
            case "minecraft:mangrove_boat": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "mangrove";
                boatFix = true;
                break;
            }
            case "minecraft:bamboo_raft": {
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "bamboo";
                boatFix = true;
                break;
            }
            case "minecraft:oak_chest_boat": 
            case "minecraft:pale_oak_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "oak";
                boatFix = true;
                break;
            }
            case "minecraft:spruce_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "spruce";
                boatFix = true;
                break;
            }
            case "minecraft:birch_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "birch";
                boatFix = true;
                break;
            }
            case "minecraft:jungle_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "jungle";
                boatFix = true;
                break;
            }
            case "minecraft:acacia_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "acacia";
                boatFix = true;
                break;
            }
            case "minecraft:cherry_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "cherry";
                boatFix = true;
                break;
            }
            case "minecraft:dark_oak_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "dark_oak";
                boatFix = true;
                break;
            }
            case "minecraft:mangrove_chest_boat": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "mangrove";
                boatFix = true;
                break;
            }
            case "minecraft:bamboo_chest_raft": {
                newId = Identifier.withDefaultNamespace((String)"chest_boat");
                type = "bamboo";
                boatFix = true;
                break;
            }
            default: {
                if (id.contains("_chest_boat")) {
                    newId = Identifier.withDefaultNamespace((String)"chest_boat");
                    type = "oak";
                    boatFix = true;
                    break;
                }
                if (!id.contains("_boat")) break;
                newId = Identifier.withDefaultNamespace((String)"boat");
                type = "oak";
                boatFix = true;
            }
        }
        if (newId != null) {
            nbt.putString("id", newId.toString());
        }
        if (boatFix) {
            nbt.putString("Type", type);
        }
        return nbt;
    }

    private record ConversionData(int idMeta, String newStateString, String[] oldStateStrings) {
    }

    public record ConversionDynamic(int idMeta, Dynamic<?> newState, List<Dynamic<?>> oldStates) {
    }
}

