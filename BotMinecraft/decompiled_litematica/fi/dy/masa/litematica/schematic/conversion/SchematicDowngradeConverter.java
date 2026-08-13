/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.GsonBuilder
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonParser
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.DynamicOps
 *  com.mojang.serialization.JsonOps
 *  com.mojang.serialization.codecs.UnboundedMapCodec
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.nbt.NbtBlockUtils
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  it.unimi.dsi.fastutil.objects.Reference2IntOpenHashMap
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.UUIDUtil
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.FloatTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.nbt.NbtOps
 *  net.minecraft.nbt.StringTag
 *  net.minecraft.nbt.Tag
 *  net.minecraft.network.chat.ComponentSerialization
 *  net.minecraft.network.chat.MutableComponent
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.Util
 *  net.minecraft.world.item.DyeColor
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.crafting.Recipe
 */
package fi.dy.masa.litematica.schematic.conversion;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.mojang.serialization.Codec;
import com.mojang.serialization.DynamicOps;
import com.mojang.serialization.JsonOps;
import com.mojang.serialization.codecs.UnboundedMapCodec;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.nbt.NbtBlockUtils;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import it.unimi.dsi.fastutil.objects.Reference2IntOpenHashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.UUIDUtil;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.FloatTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.NbtOps;
import net.minecraft.nbt.StringTag;
import net.minecraft.nbt.Tag;
import net.minecraft.network.chat.ComponentSerialization;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.resources.Identifier;
import net.minecraft.util.Util;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.Recipe;

public class SchematicDowngradeConverter {
    public static CompoundTag downgradeEntity_to_1_20_4(CompoundTag oldEntity, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag newEntity = new CompoundTag();
        if (!oldEntity.contains("id")) {
            return oldEntity;
        }
        Iterator iterator = oldEntity.keySet().iterator();
        block48: while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "x": {
                    newEntity.putInt("x", oldEntity.getIntOr("x", 0));
                    continue block48;
                }
                case "y": {
                    newEntity.putInt("y", oldEntity.getIntOr("y", 0));
                    continue block48;
                }
                case "z": {
                    newEntity.putInt("z", oldEntity.getIntOr("z", 0));
                    continue block48;
                }
                case "id": {
                    newEntity.putString("id", oldEntity.getStringOr("id", ""));
                    continue block48;
                }
                case "attributes": {
                    newEntity.put("Attributes", SchematicDowngradeConverter.processAttributes(oldEntity.get(key), minecraftDataVersion, registryManager));
                    continue block48;
                }
                case "flower_pos": {
                    newEntity.put("FlowerPos", SchematicDowngradeConverter.processFlowerPos(oldEntity, key, minecraftDataVersion, registryManager));
                    continue block48;
                }
                case "hive_pos": {
                    newEntity.put("HivePos", SchematicDowngradeConverter.processFlowerPos(oldEntity, key, minecraftDataVersion, registryManager));
                    continue block48;
                }
                case "ArmorItems": {
                    newEntity.put("ArmorItems", (Tag)SchematicDowngradeConverter.processEntityItems(oldEntity.getListOrEmpty(key), minecraftDataVersion, registryManager, 4));
                    continue block48;
                }
                case "HandItems": {
                    newEntity.put("HandItems", (Tag)SchematicDowngradeConverter.processEntityItems(oldEntity.getListOrEmpty(key), minecraftDataVersion, registryManager, 2));
                    continue block48;
                }
                case "Item": {
                    newEntity.put("Item", SchematicDowngradeConverter.processEntityItem(oldEntity.get(key), minecraftDataVersion, registryManager));
                    continue block48;
                }
                case "Inventory": {
                    newEntity.put("Inventory", (Tag)SchematicDowngradeConverter.processEntityItems(oldEntity.getListOrEmpty(key), minecraftDataVersion, registryManager, 1));
                    continue block48;
                }
                case "equipment": {
                    newEntity.merge(SchematicDowngradeConverter.processEntityEquipment(oldEntity.get(key), minecraftDataVersion, registryManager));
                    continue block48;
                }
                case "drop_chances": {
                    newEntity.merge(SchematicDowngradeConverter.processEntityDropChances(oldEntity.get(key)));
                    continue block48;
                }
                case "fall_distance": {
                    newEntity.putFloat("FallDistance", oldEntity.getFloatOr(key, 0.0f));
                    continue block48;
                }
                case "anchor_pos": {
                    SchematicDowngradeConverter.processBlockPosTag(NbtUtils.readBlockPosFromIntArray((CompoundTag)oldEntity, (String)key), "A", newEntity);
                    continue block48;
                }
                case "block_pos": {
                    SchematicDowngradeConverter.processBlockPosTag(NbtUtils.readBlockPosFromIntArray((CompoundTag)oldEntity, (String)key), "Tile", newEntity);
                    continue block48;
                }
                case "bound_pos": {
                    SchematicDowngradeConverter.processBlockPosTag(NbtUtils.readBlockPosFromIntArray((CompoundTag)oldEntity, (String)key), "Bound", newEntity);
                    continue block48;
                }
                case "home_pos": {
                    SchematicDowngradeConverter.processBlockPosTag(NbtUtils.readBlockPosFromIntArray((CompoundTag)oldEntity, (String)key), "HomePos", newEntity);
                    continue block48;
                }
                case "sleeping_pos": {
                    SchematicDowngradeConverter.processBlockPosTag(NbtUtils.readBlockPosFromIntArray((CompoundTag)oldEntity, (String)key), "Sleeping", newEntity);
                    continue block48;
                }
                case "has_egg": {
                    newEntity.putBoolean("HasEgg", oldEntity.getBooleanOr(key, false));
                    continue block48;
                }
                case "life_ticks": {
                    newEntity.putInt("LifeTicks", oldEntity.getIntOr(key, 0));
                    continue block48;
                }
                case "size": {
                    newEntity.putInt("Size", oldEntity.getIntOr(key, 0));
                    continue block48;
                }
            }
            newEntity.put(key, oldEntity.get(key));
        }
        return newEntity;
    }

    private static void processBlockPosTag(@Nullable BlockPos oldPos, String prefix, CompoundTag newTags) {
        if (oldPos != null) {
            newTags.putInt(prefix + "X", oldPos.getX());
            newTags.putInt(prefix + "Y", oldPos.getY());
            newTags.putInt(prefix + "Z", oldPos.getZ());
        }
    }

    private static CompoundTag processEntityDropChances(Tag nbtElement) {
        int i;
        CompoundTag oldTags = nbtElement.asCompound().orElse(new CompoundTag());
        CompoundTag newTags = new CompoundTag();
        ListTag handDrops = new ListTag();
        ListTag armorDrops = new ListTag();
        for (i = 0; i < 2; ++i) {
            handDrops.add((Object)FloatTag.valueOf((float)0.085f));
        }
        for (i = 0; i < 4; ++i) {
            armorDrops.add((Object)FloatTag.valueOf((float)0.085f));
        }
        Iterator iterator = oldTags.keySet().iterator();
        while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "mainhand": {
                    handDrops.set(0, oldTags.get(key));
                    break;
                }
                case "offhand": {
                    handDrops.set(1, oldTags.get(key));
                    break;
                }
                case "feet": {
                    armorDrops.set(0, oldTags.get(key));
                    break;
                }
                case "legs": {
                    armorDrops.set(1, oldTags.get(key));
                    break;
                }
                case "chest": {
                    armorDrops.set(2, oldTags.get(key));
                    break;
                }
                case "head": {
                    armorDrops.set(3, oldTags.get(key));
                    break;
                }
            }
        }
        newTags.put("HandDropChances", (Tag)handDrops);
        newTags.put("ArmorDropChances", (Tag)armorDrops);
        return newTags;
    }

    private static CompoundTag processEntityEquipment(Tag equipmentEntries, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        int i;
        CompoundTag oldTags = equipmentEntries.asCompound().orElse(new CompoundTag());
        CompoundTag newTags = new CompoundTag();
        ListTag newHandItems = new ListTag();
        ListTag newArmorItems = new ListTag();
        for (i = 0; i < 2; ++i) {
            newHandItems.add((Object)new CompoundTag());
        }
        for (i = 0; i < 4; ++i) {
            newArmorItems.add((Object)new CompoundTag());
        }
        Iterator iterator = oldTags.keySet().iterator();
        while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "mainhand": {
                    newHandItems.set(0, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "offhand": {
                    newHandItems.set(1, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "feet": {
                    newArmorItems.set(0, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "legs": {
                    newArmorItems.set(1, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "chest": {
                    newArmorItems.set(2, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "head": {
                    newArmorItems.set(3, SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "body": {
                    Tag ele = SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager);
                    newArmorItems.set(2, ele);
                    newTags.put("ArmorItem", ele);
                    break;
                }
                case "saddle": {
                    newTags.put("SaddleItem", SchematicDowngradeConverter.processEntityItem(oldTags.get(key), minecraftDataVersion, registryManager));
                    break;
                }
            }
        }
        newTags.put("HandItems", (Tag)newHandItems);
        newTags.put("ArmorItems", (Tag)newArmorItems);
        return newTags;
    }

    private static Tag processEntityItem(Tag itemEntry, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag oldItem = itemEntry.asCompound().orElse(new CompoundTag());
        CompoundTag newItem = new CompoundTag();
        if (!oldItem.contains("id")) {
            return itemEntry;
        }
        String idName = oldItem.getStringOr("id", "");
        newItem.putString("id", idName);
        if (oldItem.contains("count")) {
            newItem.putByte("Count", (byte)oldItem.getIntOr("count", 1));
        }
        if (oldItem.contains("components")) {
            newItem.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(oldItem.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
        } else if (SchematicDowngradeConverter.needsDamageTag(idName)) {
            CompoundTag newTag = new CompoundTag();
            newTag.putInt("Damage", 0);
            newItem.put("tag", (Tag)newTag);
        }
        return newItem;
    }

    private static ListTag processEntityItems(ListTag oldItems, int minecraftDataVersion, RegistryAccess registryManager, int expectedSize) {
        ListTag newItems = new ListTag();
        for (int i = 0; i < oldItems.size(); ++i) {
            CompoundTag itemEntry = oldItems.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            if (itemEntry.contains("id")) {
                String idName = itemEntry.getStringOr("id", "");
                newEntry.putString("id", idName);
                if (itemEntry.contains("count")) {
                    newEntry.putByte("Count", (byte)itemEntry.getIntOr("count", 1));
                } else {
                    newEntry.putByte("Count", (byte)1);
                }
                if (itemEntry.contains("components")) {
                    newEntry.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(itemEntry.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
                } else if (SchematicDowngradeConverter.needsDamageTag(idName)) {
                    CompoundTag newTag = new CompoundTag();
                    newTag.putInt("Damage", 0);
                    newEntry.put("tag", (Tag)newTag);
                }
            }
            newItems.add((Object)newEntry);
        }
        if (newItems.size() < expectedSize) {
            int addTotal = expectedSize - newItems.size();
            for (int i = 0; i < addTotal; ++i) {
                newItems.add(i, (Tag)new CompoundTag());
            }
        }
        return newItems;
    }

    private static Tag processAttributes(Tag attrib, int minecraftDataVersion, RegistryAccess registryManager) {
        ListTag oldAttr = attrib.asList().orElse(new ListTag());
        if (oldAttr.isEmpty()) {
            CompoundTag oldTag = attrib.asCompound().orElse(new CompoundTag());
            if (oldTag.isEmpty()) {
                return attrib;
            }
            for (String key : oldTag.keySet()) {
                if (!key.equals("modifiers")) continue;
                return SchematicDowngradeConverter.processAttributeModifiers(oldTag.getListOrEmpty(key), minecraftDataVersion, registryManager);
            }
        }
        return SchematicDowngradeConverter.processAttributeBase(oldAttr, minecraftDataVersion, registryManager);
    }

    private static Tag processAttributeBase(ListTag oldAttr, int minecraftDataVersion, RegistryAccess registryManager) {
        ListTag newAttr = new ListTag();
        for (int i = 0; i < oldAttr.size(); ++i) {
            CompoundTag attrEntry = oldAttr.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            if (attrEntry.contains("type")) {
                newEntry.putString("Name", SchematicDowngradeConverter.attributeRename(attrEntry.getStringOr("type", "")));
                newEntry.putDouble("Base", attrEntry.getDoubleOr("amount", 0.0));
            } else {
                newEntry.putString("Name", SchematicDowngradeConverter.attributeRename(attrEntry.getStringOr("id", "")));
                newEntry.putDouble("Base", attrEntry.getDoubleOr("base", 0.0));
            }
            ListTag listEntry = attrEntry.getListOrEmpty("modifiers");
            ListTag newMods = SchematicDowngradeConverter.processAttributeModifiers(listEntry, minecraftDataVersion, registryManager);
            if (!newMods.isEmpty()) {
                newEntry.put("Modifiers", (Tag)newMods);
            }
            newAttr.add((Object)newEntry);
        }
        return newAttr;
    }

    private static ListTag processAttributeModifiers(ListTag modifiers, int minecraftDataVersion, RegistryAccess registryManager) {
        ListTag newMods = new ListTag();
        if (modifiers.isEmpty()) {
            return modifiers;
        }
        for (int y = 0; y < modifiers.size(); ++y) {
            CompoundTag modEntry = modifiers.getCompoundOrEmpty(y);
            CompoundTag newMod = new CompoundTag();
            if (modEntry.contains("type")) {
                newMod.putString("Name", SchematicDowngradeConverter.attributeRename(modEntry.getStringOr("type", "")));
                newMod.putDouble("Base", modEntry.getDoubleOr("amount", 0.0));
            } else {
                newMod.putDouble("Amount", modEntry.getDoubleOr("amount", 0.0));
                newMod.putString("Name", SchematicDowngradeConverter.modifierIdToName(modEntry.getStringOr("id", "")));
            }
            newMod.putInt("Operation", SchematicDowngradeConverter.modifierOperationToInt(modEntry.getStringOr("operation", "")));
            newMod.store("UUID", UUIDUtil.AUTHLIB_CODEC, (Object)modEntry.read("UUID", UUIDUtil.AUTHLIB_CODEC, (DynamicOps)registryManager.createSerializationContext((DynamicOps)NbtOps.INSTANCE)).orElse(UUID.randomUUID()));
            newMods.add((Object)newMod);
        }
        return newMods;
    }

    private static String attributeRename(String idIn) {
        switch (idIn) {
            case "minecraft:armor": {
                return "minecraft:generic.armor";
            }
            case "minecraft:armor_toughness": {
                return "minecraft:generic.armor_toughness";
            }
            case "minecraft:attack_damage": {
                return "minecraft:generic.attack_damage";
            }
            case "minecraft:attack_knockback": {
                return "minecraft:generic.attack_knockback";
            }
            case "minecraft:attack_speed": {
                return "minecraft:generic.attack_speed";
            }
            case "minecraft:flying_speed": {
                return "minecraft:generic.flying_speed";
            }
            case "minecraft:follow_range": {
                return "minecraft:generic.follow_range";
            }
            case "minecraft:jump_strength": {
                return "minecraft:horse.jump_strength";
            }
            case "minecraft:knockback_resistance": {
                return "minecraft:generic.knockback_resistance";
            }
            case "minecraft:luck": {
                return "minecraft:generic.luck";
            }
            case "minecraft:max_absorption": {
                return "minecraft:generic.max_absorption";
            }
            case "minecraft:max_health": {
                return "minecraft:generic.max_health";
            }
            case "minecraft:movement_speed": {
                return "minecraft:generic.movement_speed";
            }
            case "minecraft:spawn_reinforcements": {
                return "minecraft:zombie.spawn_reinforcements";
            }
            case "minecraft:block_break_speed": {
                return "minecraft:player.block_break_speed";
            }
            case "minecraft:block_interaction_range": {
                return "minecraft:player.block_interaction_range";
            }
            case "minecraft:burning_time": {
                return "minecraft:generic.burning_time";
            }
            case "minecraft:explosion_knockback_resistance": {
                return "minecraft:generic.explosion_knockback_resistance";
            }
            case "minecraft:entity_interaction_range": {
                return "minecraft:player.entity_interaction_range";
            }
            case "minecraft:fall_damage_multiplier": {
                return "minecraft:generic.fall_damage_multiplier";
            }
            case "minecraft:gravity": {
                return "minecraft:generic.gravity";
            }
            case "minecraft:mining_efficiency": {
                return "minecraft:player.mining_efficiency";
            }
            case "minecraft:movement_efficiency": {
                return "minecraft:generic.movement_efficiency";
            }
            case "minecraft:oxygen_bonus": {
                return "minecraft:generic.oxygen_bonus";
            }
            case "minecraft:safe_fall_distance": {
                return "minecraft:generic.safe_fall_distance";
            }
            case "minecraft:scale": {
                return "minecraft:generic.scale";
            }
            case "minecraft:sneaking_speed": {
                return "minecraft:player.sneaking_speed";
            }
            case "minecraft:step_height": {
                return "minecraft:generic.step_height";
            }
            case "minecraft:submerged_mining_speed": {
                return "minecraft:player.submerged_mining_speed";
            }
            case "minecraft:sweeping_damage_ratio": {
                return "minecraft:player.sweeping_damage_ratio";
            }
            case "minecraft:water_movement_efficiency": {
                return "minecraft:generic.water_movement_efficiency";
            }
        }
        return idIn;
    }

    private static String modifierIdToName(String idIn) {
        if (idIn.equals("minecraft:random_spawn_bonus")) {
            return "Random spawn bonus";
        }
        return "";
    }

    private static int modifierOperationToInt(String op) {
        switch (op) {
            case "add_value": {
                return 0;
            }
            case "add_multiplied_base": {
                return 1;
            }
            case "add_multiplied_total": {
                return 2;
            }
        }
        return 0;
    }

    public static CompoundTag downgradeBlockEntity_to_1_20_4(CompoundTag oldTE, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag newTE = new CompoundTag();
        if (!oldTE.contains("id")) {
            oldTE.merge(SchematicConversionMaps.checkForIdTag(oldTE));
        }
        Iterator iterator = oldTE.keySet().iterator();
        block36: while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "x": {
                    newTE.putInt("x", oldTE.getIntOr("x", 0));
                    continue block36;
                }
                case "y": {
                    newTE.putInt("y", oldTE.getIntOr("y", 0));
                    continue block36;
                }
                case "z": {
                    newTE.putInt("z", oldTE.getIntOr("z", 0));
                    continue block36;
                }
                case "id": {
                    newTE.putString("id", oldTE.getStringOr("id", ""));
                    continue block36;
                }
                case "Items": {
                    newTE.put("Items", (Tag)SchematicDowngradeConverter.processItemsTag(oldTE.getListOrEmpty("Items"), minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "patterns": {
                    newTE.put("Patterns", SchematicDowngradeConverter.processBannerPatterns(oldTE.get(key)));
                    continue block36;
                }
                case "profile": {
                    newTE.put("SkullOwner", SchematicDowngradeConverter.processSkullProfile(oldTE.get(key), newTE, minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "flower_pos": {
                    newTE.put("FlowerPos", SchematicDowngradeConverter.processFlowerPos(oldTE, key, minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "bees": {
                    newTE.put("Bees", SchematicDowngradeConverter.processBeesTag(oldTE.get(key), minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "item": {
                    newTE.put("item", SchematicDowngradeConverter.processDecoratedPot(oldTE.get(key), minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "last_interacted_slot": {
                    newTE.put("last_interacted_slot", oldTE.get(key));
                    continue block36;
                }
                case "ticks_since_song_started": {
                    newTE.putLong("RecordStartTick", 0L);
                    newTE.putLong("TickCount", oldTE.getLongOr(key, 0L));
                    newTE.putByte("IsPlaying", (byte)0);
                    continue block36;
                }
                case "RecordItem": {
                    newTE.put("RecordItem", SchematicDowngradeConverter.processRecordItem(oldTE.get(key), minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "Book": {
                    newTE.put("Book", SchematicDowngradeConverter.processBookTag(oldTE.get(key), minecraftDataVersion, registryManager));
                    continue block36;
                }
                case "CustomName": {
                    newTE.putString("CustomName", SchematicDowngradeConverter.processCustomNameTag(oldTE, key, registryManager));
                    continue block36;
                }
                case "custom_name": {
                    newTE.putString("CustomName", SchematicDowngradeConverter.processCustomNameTag(oldTE, key, registryManager));
                    continue block36;
                }
            }
            newTE.put(key, oldTE.get(key));
        }
        return newTE;
    }

    private static CompoundTag processRecipesUsedTag(Tag nbtIn) {
        CompoundTag oldNbt = nbtIn.asCompound().orElse(new CompoundTag());
        CompoundTag newNbt = new CompoundTag();
        UnboundedMapCodec CODEC = Codec.unboundedMap((Codec)Recipe.KEY_CODEC, (Codec)Codec.INT);
        Reference2IntOpenHashMap recipesUsed = new Reference2IntOpenHashMap();
        recipesUsed.putAll(oldNbt.read("RecipesUsed", (Codec)CODEC).orElse(Map.of()));
        recipesUsed.forEach((id, count) -> newNbt.putInt(id.identifier().toString(), count));
        return newNbt;
    }

    private static ListTag processItemsTag(ListTag oldItems, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        ListTag newItems = new ListTag();
        for (int i = 0; i < oldItems.size(); ++i) {
            CompoundTag itemEntry = oldItems.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            if (!itemEntry.contains("id")) continue;
            String idName = itemEntry.getStringOr("id", "");
            newEntry.putString("id", idName);
            if (itemEntry.contains("count")) {
                newEntry.putByte("Count", (byte)itemEntry.getIntOr("count", 1));
            }
            if (itemEntry.contains("Slot")) {
                newEntry.putByte("Slot", itemEntry.getByteOr("Slot", (byte)1));
            }
            if (itemEntry.contains("components")) {
                newEntry.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(itemEntry.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
            } else if (SchematicDowngradeConverter.needsDamageTag(idName)) {
                CompoundTag newTag = new CompoundTag();
                newTag.putInt("Damage", 0);
                newEntry.put("tag", (Tag)newTag);
            }
            newItems.add((Object)newEntry);
        }
        return newItems;
    }

    private static ListTag processItemsTag_Nested(ListTag oldItems, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        ListTag newItems = new ListTag();
        for (int i = 0; i < oldItems.size(); ++i) {
            CompoundTag itemEntry = oldItems.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            int slotNum = itemEntry.getIntOr("slot", 0);
            CompoundTag itemSlot = itemEntry.getCompoundOrEmpty("item");
            if (!itemSlot.contains("id")) continue;
            String idName = itemSlot.getStringOr("id", "");
            newEntry.putString("id", idName);
            if (itemSlot.contains("count")) {
                newEntry.putByte("Count", (byte)itemSlot.getIntOr("count", 1));
            }
            newEntry.putByte("Slot", (byte)slotNum);
            if (itemSlot.contains("components")) {
                newEntry.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(itemSlot.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
            } else if (SchematicDowngradeConverter.needsDamageTag(idName)) {
                CompoundTag newTag = new CompoundTag();
                newTag.putInt("Damage", 0);
                newEntry.put("tag", (Tag)newTag);
            }
            newItems.add((Object)newEntry);
        }
        return newItems;
    }

    private static CompoundTag processDecoratedPot_Nested(ListTag oldItems, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag itemEntry = oldItems.getCompoundOrEmpty(0);
        CompoundTag newEntry = new CompoundTag();
        int slotNum = itemEntry.getIntOr("slot", 1);
        CompoundTag itemSlot = itemEntry.getCompoundOrEmpty("item");
        if (!itemSlot.contains("id")) {
            return itemEntry;
        }
        String idName = itemSlot.getStringOr("id", "");
        newEntry.putString("id", idName);
        newEntry.putByte("Count", ((Byte)(itemSlot.contains("count") ? itemSlot.getInt("count") : Integer.valueOf(1))).byteValue());
        if (itemSlot.contains("components")) {
            newEntry.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(itemSlot.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
        } else if (SchematicDowngradeConverter.needsDamageTag(idName)) {
            CompoundTag newTag = new CompoundTag();
            newTag.putInt("Damage", 0);
            newEntry.put("tag", (Tag)newTag);
        }
        return newEntry;
    }

    private static boolean needsDamageTag(String id) {
        ItemStack stack = InventoryUtils.getItemStackFromString((String)id);
        return stack != null && !stack.isEmpty() && stack.isDamageableItem();
    }

    private static CompoundTag processComponentsTag(CompoundTag nbt, String itemId, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag outNbt = new CompoundTag();
        CompoundTag beNbt = new CompoundTag();
        CompoundTag dispNbt = new CompoundTag();
        boolean needsDamage = SchematicDowngradeConverter.needsDamageTag(itemId);
        Iterator iterator = nbt.keySet().iterator();
        block88: while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "minecraft:attribute_modifiers": {
                    outNbt.put("AttributeModifiers", SchematicDowngradeConverter.processAttributes(nbt.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "minecraft:banner_patterns": {
                    beNbt.put("Patterns", SchematicDowngradeConverter.processBannerPatterns(nbt.get(key)));
                    beNbt.putString("id", "minecraft:banner");
                    break;
                }
                case "minecraft:bees": {
                    beNbt.put("Bees", SchematicDowngradeConverter.processBeesTag(nbt.get(key), minecraftDataVersion, registryManager));
                    beNbt.putString("id", itemId);
                    break;
                }
                case "minecraft:block_state": {
                    outNbt.put("BlockStateTag", SchematicDowngradeConverter.processBlockState(nbt.get(key)));
                    break;
                }
                case "minecraft:block_entity_data": {
                    SchematicDowngradeConverter.processBlockEntityData(nbt.get(key), beNbt, minecraftDataVersion, registryManager);
                    break;
                }
                case "minecraft:bucket_entity_data": {
                    SchematicDowngradeConverter.processBucketEntityData(nbt.get(key), beNbt, minecraftDataVersion, registryManager);
                    break;
                }
                case "minecraft:bundle_contents": {
                    outNbt.put("Items", (Tag)SchematicDowngradeConverter.processItemsTag(nbt.getListOrEmpty(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "minecraft:can_break": {
                    outNbt.put("CanDestroy", nbt.get(key));
                    break;
                }
                case "minecraft:can_place_on": {
                    outNbt.put("CanPlaceOn", nbt.get(key));
                    break;
                }
                case "minecraft:container": {
                    if (itemId.contains("decorated_pot")) {
                        beNbt.put("item", (Tag)SchematicDowngradeConverter.processDecoratedPot_Nested(nbt.getListOrEmpty(key), minecraftDataVersion, registryManager));
                    } else {
                        beNbt.put("Items", (Tag)SchematicDowngradeConverter.processItemsTag_Nested(nbt.getListOrEmpty(key), minecraftDataVersion, registryManager));
                    }
                    if (itemId.contains("shulker")) {
                        beNbt.putString("id", "minecraft:shulker_box");
                        break;
                    }
                    beNbt.putString("id", itemId);
                    break;
                }
                case "minecraft:charged_projectiles": {
                    outNbt.put("ChargedProjectiles", (Tag)SchematicDowngradeConverter.processChargedProjectile(nbt.get(key), minecraftDataVersion, registryManager));
                    outNbt.putBoolean("Charged", true);
                    break;
                }
                case "minecraft:container_loot": {
                    beNbt.put("LootTable", SchematicDowngradeConverter.processLootTable(nbt.get(key)));
                    beNbt.putString("id", itemId);
                    break;
                }
                case "minecraft:custom_data": {
                    SchematicDowngradeConverter.processCustomData(nbt.get(key), outNbt);
                    break;
                }
                case "minecraft:custom_model_data": {
                    outNbt.putInt("CustomModelData", nbt.getIntOr(key, 0));
                    break;
                }
                case "minecraft:custom_name": {
                    dispNbt.putString("Name", SchematicDowngradeConverter.processCustomNameTag(nbt, key, registryManager));
                    break;
                }
                case "minecraft:damage": {
                    outNbt.putInt("Damage", nbt.getIntOr(key, 0));
                    break;
                }
                case "minecraft:debug_stick_state": {
                    outNbt.put("DebugProperty", nbt.get(key));
                    break;
                }
                case "minecraft:dyed_color": {
                    dispNbt.putInt("color", SchematicDowngradeConverter.processDyedColor(nbt.get(key)));
                    break;
                }
                case "minecraft:enchantments": {
                    outNbt.put("Enchantments", SchematicDowngradeConverter.processEnchantments(nbt.get(key), true, true));
                    break;
                }
                case "minecraft:entity_data": {
                    outNbt.put("EntityTag", (Tag)SchematicDowngradeConverter.downgradeEntity_to_1_20_4((CompoundTag)nbt.get(key), minecraftDataVersion, registryManager));
                    break;
                }
                case "minecraft:stored_enchantments": {
                    outNbt.put("StoredEnchantments", SchematicDowngradeConverter.processEnchantments(nbt.get(key), true, true));
                    break;
                }
                case "minecraft:fireworks": {
                    outNbt.put("Fireworks", SchematicDowngradeConverter.processFireworks(nbt.get(key)));
                    break;
                }
                case "minecraft:firework_explosion": {
                    outNbt.put("Explosion", SchematicDowngradeConverter.processFireworkExplosion(nbt.get(key)));
                    break;
                }
                case "minecraft:instrument": {
                    outNbt.put("instrument", SchematicDowngradeConverter.processInstrument(nbt.get(key)));
                    break;
                }
                case "minecraft:item_name": {
                    dispNbt.putString("Name", SchematicDowngradeConverter.processItemName(nbt.get(key), registryManager));
                    break;
                }
                case "minecraft:lock": {
                    beNbt.put("Lock", nbt.get(key));
                    beNbt.putString("id", itemId);
                    break;
                }
                case "minecraft:lodestone_tracker": {
                    SchematicDowngradeConverter.processLodestoneTracker(nbt.get(key), outNbt);
                    break;
                }
                case "minecraft:lore": {
                    dispNbt.put("Lore", nbt.get(key));
                    break;
                }
                case "minecraft:map_id": {
                    outNbt.put("map", SchematicDowngradeConverter.processMapId(nbt.get(key)));
                    break;
                }
                case "minecraft:map_color": {
                    dispNbt.put("MapColor", nbt.get(key));
                    break;
                }
                case "minecraft:map_decorations": {
                    outNbt.put("Decorations", SchematicDowngradeConverter.processMapDecorations(nbt.get(key)));
                    break;
                }
                case "minecraft:note_block_sound": {
                    beNbt.put("note_block_sound", nbt.get(key));
                    break;
                }
                case "minecraft:pot_decorations": {
                    beNbt.put("sherds", SchematicDowngradeConverter.processSherds(nbt.get(key)));
                    beNbt.putString("id", itemId);
                    break;
                }
                case "minecraft:potion_contents": {
                    SchematicDowngradeConverter.processPotions(nbt.get(key), outNbt);
                    break;
                }
                case "minecraft:profile": {
                    outNbt.put("SkullOwner", SchematicDowngradeConverter.processSkullProfile(nbt.get(key), dispNbt, minecraftDataVersion, registryManager));
                    break;
                }
                case "minecraft:repair_cost": {
                    outNbt.putInt("RepairCost", nbt.getIntOr(key, 0));
                    break;
                }
                case "minecraft:recipes": {
                    outNbt.put("Recipes", SchematicDowngradeConverter.processRecipes(nbt.get(key)));
                    break;
                }
                case "minecraft:suspicious_stew_effects": {
                    outNbt.put("effects", SchematicDowngradeConverter.processSuspiciousStewEffects(nbt.get(key)));
                    break;
                }
                case "minecraft:trim": {
                    outNbt.put("Trim", SchematicDowngradeConverter.processTrim(nbt.get(key)));
                    break;
                }
                case "minecraft:writable_book_content": {
                    CompoundTag bookNbt = nbt.getCompoundOrEmpty(key);
                    bookNbt = SchematicDowngradeConverter.processWritableBookContent(bookNbt, minecraftDataVersion, registryManager);
                    for (String bookKey : bookNbt.keySet()) {
                        outNbt.put(bookKey, bookNbt.get(bookKey));
                    }
                    continue block88;
                }
                case "minecraft:written_book_content": {
                    CompoundTag bookNbt = nbt.getCompoundOrEmpty(key);
                    bookNbt = SchematicDowngradeConverter.processWrittenBookContent(bookNbt, minecraftDataVersion, registryManager);
                    for (String bookKey : bookNbt.keySet()) {
                        outNbt.put(bookKey, bookNbt.get(bookKey));
                    }
                    continue block88;
                }
                case "minecraft:unbreakable": {
                    outNbt.putBoolean("Unbreakable", SchematicDowngradeConverter.processUnbreakable(nbt.get(key)));
                }
            }
        }
        if (!beNbt.isEmpty()) {
            outNbt.put("BlockEntityTag", (Tag)beNbt);
        }
        if (!dispNbt.isEmpty()) {
            outNbt.put("display", (Tag)dispNbt);
        }
        if (!outNbt.contains("RepairCost") && (itemId.equals("minecraft:dragon_head") || needsDamage)) {
            outNbt.putInt("RepairCost", 0);
        }
        if (!outNbt.contains("Damage") && needsDamage) {
            outNbt.putInt("Damage", 0);
        }
        return outNbt;
    }

    private static void processCustomData(Tag oldNbt, CompoundTag outNbt) {
        CompoundTag origData = oldNbt.asCompound().orElse(new CompoundTag());
        for (String keyData : origData.keySet()) {
            outNbt.put(keyData, origData.get(keyData));
        }
    }

    private static void processLodestoneTracker(Tag oldEle, CompoundTag outNbt) {
        CompoundTag oldNbt = oldEle.asCompound().orElse(new CompoundTag());
        if (oldNbt.contains("tracked")) {
            outNbt.putBoolean("LodestoneTracked", oldNbt.getBooleanOr("tracked", false));
        }
        if (oldNbt.contains("target")) {
            CompoundTag target = oldNbt.getCompoundOrEmpty("target");
            outNbt.put("LodestoneDimension", target.get("dimension"));
            outNbt.put("LodestonePos", target.get("pos"));
        }
    }

    private static void processBucketEntityData(Tag oldTags, CompoundTag beNbt, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag oldNbt = oldTags.asCompound().orElse(new CompoundTag());
        for (String key : oldNbt.keySet()) {
            beNbt.put(key, oldNbt.get(key));
        }
    }

    private static void processPotions(Tag oldPots, CompoundTag outNbt) {
        CompoundTag oldNbt = oldPots.asCompound().orElse(new CompoundTag());
        if (oldNbt.contains("potion")) {
            outNbt.putString("Potion", oldNbt.getStringOr("potion", ""));
        }
        if (oldNbt.contains("custom_color")) {
            outNbt.put("CustomPotionColor", Objects.requireNonNull(oldNbt.get("custom_color")));
        }
        if (oldNbt.contains("custom_effects")) {
            outNbt.put("custom_potion_effects", Objects.requireNonNull(oldNbt.get("custom_effects")));
        }
    }

    private static Tag processMapDecorations(Tag oldDeco) {
        CompoundTag oldTag = oldDeco.asCompound().orElse(new CompoundTag());
        ListTag newTags = new ListTag();
        for (String key : oldTag.keySet()) {
            CompoundTag entryOld = oldTag.getCompoundOrEmpty(key);
            CompoundTag entryNew = new CompoundTag();
            entryNew.putString("id", key);
            entryNew.putDouble("x", entryOld.contains("x") ? entryOld.getDoubleOr("x", 0.0) : 0.0);
            entryNew.putDouble("z", entryOld.contains("z") ? entryOld.getDoubleOr("z", 0.0) : 0.0);
            entryNew.putDouble("rot", entryOld.contains("rotation") ? (double)entryOld.getFloatOr("rotation", 0.0f) : 0.0);
            entryNew.putByte("type", (byte)(entryOld.contains("type") ? SchematicDowngradeConverter.convertMapDecoration(entryOld.getStringOr("type", "")) : 0));
            newTags.add((Object)entryNew);
        }
        return newTags;
    }

    private static int convertMapDecoration(String type) {
        return switch (type) {
            case "minecraft:player" -> 0;
            case "minecraft:frame" -> 1;
            case "minecraft:red_marker" -> 2;
            case "minecraft:blue_marker" -> 3;
            case "minecraft:target_x" -> 4;
            case "minecraft:target_point" -> 5;
            case "minecraft:player_off_map" -> 6;
            case "minecraft:player_off_limits" -> 7;
            case "minecraft:mansion" -> 8;
            case "minecraft:monument" -> 9;
            case "minecraft:banner_white" -> 10;
            case "minecraft:banner_orange" -> 11;
            case "minecraft:banner_magenta" -> 12;
            case "minecraft:banner_light_blue" -> 13;
            case "minecraft:banner_yellow" -> 14;
            case "minecraft:banner_lime" -> 15;
            case "minecraft:banner_pink" -> 16;
            case "minecraft:banner_gray" -> 17;
            case "minecraft:banner_light_gray" -> 18;
            case "minecraft:banner_cyan" -> 19;
            case "minecraft:banner_purple" -> 20;
            case "minecraft:banner_blue" -> 21;
            case "minecraft:banner_brown" -> 22;
            case "minecraft:banner_green" -> 23;
            case "minecraft:banner_red" -> 24;
            case "minecraft:banner_black" -> 25;
            case "minecraft:red_x" -> 26;
            case "minecraft:village_desert" -> 27;
            case "minecraft:village_plains" -> 28;
            case "minecraft:village_savanna" -> 29;
            case "minecraft:village_snowy" -> 30;
            case "minecraft:village_taiga" -> 31;
            case "minecraft:jungle_temple" -> 32;
            case "minecraft:swamp_hut" -> 33;
            default -> 0;
        };
    }

    private static Tag processSherds(Tag oldSherds) {
        return oldSherds;
    }

    private static Tag processLootTable(Tag oldLoot) {
        CompoundTag oldTable = oldLoot.asCompound().orElse(new CompoundTag());
        CompoundTag newTable = new CompoundTag();
        if (oldTable.contains("loot_table")) {
            CompoundTag loot = oldTable.getCompoundOrEmpty("loot_table");
            newTable.merge(loot);
        }
        if (oldTable.contains("seed")) {
            newTable.putLong("LootTableSeed", oldTable.getLongOr("seed", 0L));
        }
        return newTable;
    }

    private static String processItemName(Tag oldName, RegistryAccess registryManager) {
        if (oldName != null) {
            return oldName.toString();
        }
        return "minecraft:air";
    }

    private static int processDyedColor(Tag oldDye) {
        CompoundTag oldColor = oldDye.asCompound().orElse(new CompoundTag());
        if (oldColor.contains("rgb")) {
            return oldColor.getIntOr("rgb", 10511680);
        }
        return 10511680;
    }

    private static Tag processRecipes(Tag oldRecipes) {
        return oldRecipes;
    }

    private static Tag processInstrument(Tag oldGoat) {
        return oldGoat;
    }

    private static Tag processSuspiciousStewEffects(Tag oldEffects) {
        return oldEffects;
    }

    private static Tag processMapId(Tag oldMapId) {
        return oldMapId;
    }

    private static Tag processTrim(Tag oldTrim) {
        return oldTrim;
    }

    private static ListTag processChargedProjectile(Tag oldProjectiles, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        ListTag oldNbt = oldProjectiles.asList().orElse(new ListTag());
        ListTag newNbt = new ListTag();
        for (int i = 0; i < oldNbt.size(); ++i) {
            CompoundTag itemEntry = oldNbt.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            if (!itemEntry.contains("id")) continue;
            String idName = itemEntry.getStringOr("id", "");
            newEntry.putString("id", idName);
            newEntry.putByte("Count", ((Byte)(itemEntry.contains("count") ? itemEntry.getInt("count") : Integer.valueOf(1))).byteValue());
            if (itemEntry.contains("components")) {
                newEntry.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(itemEntry.getCompoundOrEmpty("components"), idName, minecraftDataVersion, registryManager));
            }
            newNbt.add((Object)newEntry);
        }
        return newNbt;
    }

    private static boolean processUnbreakable(Tag oldNbt) {
        CompoundTag oldUnbr = oldNbt.asCompound().orElse(new CompoundTag());
        if (oldUnbr.contains("show_in_tooltip")) {
            return oldUnbr.getBooleanOr("show_in_tooltip", false);
        }
        return false;
    }

    private static void processBlockEntityData(Tag oldBeData, CompoundTag beNbt, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag newData = SchematicDowngradeConverter.downgradeBlockEntity_to_1_20_4((CompoundTag)oldBeData, minecraftDataVersion, registryManager);
        for (String key : newData.keySet()) {
            beNbt.put(key, newData.get(key));
        }
    }

    private static Tag processDecoratedPot(Tag oldPot, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag oldNbt = oldPot.asCompound().orElse(new CompoundTag());
        CompoundTag newNbt = new CompoundTag();
        Iterator iterator = oldNbt.keySet().iterator();
        while (iterator.hasNext()) {
            String key;
            switch (key = (String)iterator.next()) {
                case "id": {
                    newNbt.putString("id", oldNbt.getStringOr("id", ""));
                    break;
                }
                case "count": {
                    newNbt.putByte("Count", (byte)oldNbt.getIntOr("count", 1));
                    break;
                }
                case "components": {
                    newNbt.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(oldNbt.getCompoundOrEmpty("components"), oldNbt.getStringOr("id", ""), minecraftDataVersion, registryManager));
                }
            }
        }
        if (!newNbt.contains("tag") && oldNbt.contains("id") && SchematicDowngradeConverter.needsDamageTag(oldNbt.getStringOr("id", ""))) {
            CompoundTag newTag = new CompoundTag();
            newTag.putInt("Damage", 0);
            newNbt.put("tag", (Tag)newTag);
        }
        return newNbt;
    }

    private static Tag processEnchantments(Tag oldNbt, boolean fullId, boolean shortInt) {
        CompoundTag oldEnchants = oldNbt.asCompound().orElse(new CompoundTag());
        CompoundTag oldLevels = oldEnchants.getCompoundOrEmpty("levels");
        ListTag newEnchants = new ListTag();
        boolean showTooltip = false;
        if (oldEnchants.contains("show_in_tooltip")) {
            showTooltip = oldEnchants.getBooleanOr("show_in_tooltip", false);
        }
        for (String key : oldLevels.keySet()) {
            CompoundTag newEntry = new CompoundTag();
            Identifier id = Identifier.parse((String)key);
            if (shortInt) {
                newEntry.putShort("lvl", (short)oldLevels.getIntOr(key, 1));
            } else {
                newEntry.putInt("lvl", oldLevels.getIntOr(key, 1));
            }
            newEntry.putString("id", fullId ? id.toString() : id.getPath());
            newEnchants.add((Object)newEntry);
        }
        return newEnchants;
    }

    private static String processCustomNameTag(CompoundTag nameTag, String key, @Nonnull RegistryAccess registry) {
        MutableComponent oldName = (MutableComponent)NbtBlockUtils.getCustomNameFromNbt((CompoundTag)nameTag, (RegistryAccess)registry, (String)key);
        return SchematicDowngradeConverter.legacyTextDeserializer(oldName, registry);
    }

    private static String legacyTextDeserializer(MutableComponent oldText, @Nonnull RegistryAccess registry) {
        try {
            JsonElement element = (JsonElement)ComponentSerialization.CODEC.encodeStart((DynamicOps)registry.createSerializationContext((DynamicOps)JsonOps.INSTANCE), (Object)oldText).getOrThrow();
            return new GsonBuilder().disableHtmlEscaping().create().toJson(element);
        }
        catch (Exception err) {
            Litematica.LOGGER.error("legacyTextDeserializer: Failed to convert MutableText to JSON; (falling back to just 'getString'); {}", (Object)err.getLocalizedMessage());
            return oldText.getString();
        }
    }

    @Nullable
    private static MutableComponent legacyTextSerializer(String json, @Nonnull RegistryAccess registry) {
        try {
            return (MutableComponent)ComponentSerialization.CODEC.parse((DynamicOps)registry.createSerializationContext((DynamicOps)JsonOps.INSTANCE), (Object)JsonParser.parseString((String)json)).getOrThrow();
        }
        catch (Exception err) {
            Litematica.LOGGER.error("legacyTextSerializer: Failed to convert JSON to MutableText; {}", (Object)err.getLocalizedMessage());
            return null;
        }
    }

    private static Tag processBlockState(Tag bsTag) {
        CompoundTag oldBS = bsTag.asCompound().orElse(new CompoundTag());
        CompoundTag newBS = new CompoundTag();
        for (String key : oldBS.keySet()) {
            newBS.put(key, oldBS.get(key));
        }
        return bsTag;
    }

    private static Tag processFireworks(Tag rocket) {
        CompoundTag oldRocket = rocket.asCompound().orElse(new CompoundTag());
        CompoundTag newRocket = new CompoundTag();
        if (oldRocket.contains("flight_duration")) {
            newRocket.putByte("Flight", oldRocket.getByteOr("flight_duration", (byte)1));
        }
        if (oldRocket.contains("explosions")) {
            ListTag oldExplosions = oldRocket.getListOrEmpty("explosions");
            ListTag newExplosions = new ListTag();
            for (int i = 0; i < oldExplosions.size(); ++i) {
                newExplosions.add((Object)SchematicDowngradeConverter.processFireworkExplosion((Tag)oldExplosions.getCompoundOrEmpty(i)));
            }
            newRocket.put("Explosions", (Tag)newExplosions);
        }
        return newRocket;
    }

    private static Tag processFireworkExplosion(Tag explosion) {
        CompoundTag oldExplosion = explosion.asCompound().orElse(new CompoundTag());
        CompoundTag newExplosion = new CompoundTag();
        if (oldExplosion.contains("shape")) {
            newExplosion.putByte("Type", (byte)SchematicDowngradeConverter.convertFireworkShape(oldExplosion.getStringOr("shape", "")));
        }
        if (oldExplosion.contains("colors")) {
            newExplosion.putIntArray("Colors", oldExplosion.getIntArray("colors").orElse(new int[0]));
        }
        if (oldExplosion.contains("fade_colors")) {
            newExplosion.putIntArray("FadeColors", oldExplosion.getIntArray("fade_colors").orElse(new int[0]));
        }
        if (oldExplosion.contains("has_trail")) {
            newExplosion.putBoolean("Trail", oldExplosion.getBooleanOr("has_trail", false));
        }
        if (oldExplosion.contains("has_twinkle")) {
            newExplosion.putBoolean("Flicker", oldExplosion.getBooleanOr("has_twinkle", false));
        }
        return newExplosion;
    }

    private static int convertFireworkShape(String shape) {
        return switch (shape) {
            case "small_ball" -> 0;
            case "large_ball" -> 1;
            case "star" -> 2;
            case "creeper" -> 3;
            case "burst" -> 4;
            default -> 0;
        };
    }

    private static Tag processRecordItem(Tag itemIn, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag oldRecord = itemIn.asCompound().orElse(new CompoundTag());
        CompoundTag recordOut = new CompoundTag();
        recordOut.putString("id", oldRecord.getStringOr("id", ""));
        recordOut.putByte("Count", (byte)oldRecord.getIntOr("count", 1));
        if (oldRecord.contains("components")) {
            recordOut.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(oldRecord.getCompoundOrEmpty("components"), oldRecord.getStringOr("id", ""), minecraftDataVersion, registryManager));
        }
        return recordOut;
    }

    private static Tag processBookTag(Tag bookNbt, int minecraftDataVersion, RegistryAccess registryManager) {
        CompoundTag oldBook = bookNbt.asCompound().orElse(new CompoundTag());
        CompoundTag newBook = new CompoundTag();
        newBook.putString("id", oldBook.getStringOr("id", ""));
        newBook.putByte("Count", (byte)oldBook.getIntOr("count", 1));
        if (oldBook.contains("Page")) {
            newBook.putInt("Page", oldBook.getIntOr("Page", 1));
        }
        if (oldBook.contains("components")) {
            newBook.put("tag", (Tag)SchematicDowngradeConverter.processComponentsTag(oldBook.getCompoundOrEmpty("components"), oldBook.getStringOr("id", ""), minecraftDataVersion, registryManager));
        }
        return newBook;
    }

    private static CompoundTag processWritableBookContent(CompoundTag bookNbt, int minecraftDataVersion, @Nonnull RegistryAccess registry) {
        CompoundTag newBook = new CompoundTag();
        ListTag newPages = new ListTag();
        if (bookNbt.contains("pages")) {
            ListTag pages = bookNbt.getListOrEmpty("pages");
            for (int i = 0; i < pages.size(); ++i) {
                CompoundTag page = pages.getCompoundOrEmpty(i);
                String oldPage = page.getStringOr("raw", "");
                try {
                    MutableComponent oldText = SchematicDowngradeConverter.legacyTextSerializer(oldPage, registry);
                    String newPage = SchematicDowngradeConverter.legacyTextDeserializer(oldText, registry);
                    newPages.add(i, (Tag)StringTag.valueOf((String)newPage));
                    continue;
                }
                catch (Exception e) {
                    newPages.add(i, (Tag)StringTag.valueOf((String)oldPage));
                }
            }
        }
        if (!newPages.isEmpty()) {
            newBook.put("pages", (Tag)newPages);
        }
        return newBook;
    }

    private static CompoundTag processWrittenBookContent(CompoundTag bookNbt, int minecraftDataVersion, @Nonnull RegistryAccess registry) {
        CompoundTag newBook = new CompoundTag();
        CompoundTag filtered = new CompoundTag();
        ListTag newPages = new ListTag();
        if (bookNbt.contains("author")) {
            newBook.putString("author", bookNbt.getStringOr("author", "?"));
        }
        if (bookNbt.contains("title")) {
            CompoundTag title = bookNbt.getCompoundOrEmpty("title");
            newBook.putString("title", title.getStringOr("raw", ""));
        }
        if (bookNbt.contains("resolved")) {
            newBook.putBoolean("resolved", bookNbt.getBooleanOr("resolved", false));
        }
        if (bookNbt.contains("generation")) {
            newBook.putInt("generation", bookNbt.getIntOr("generation", 1));
        }
        if (bookNbt.contains("pages")) {
            ListTag pages = bookNbt.getListOrEmpty("pages");
            for (int i = 0; i < pages.size(); ++i) {
                CompoundTag page = pages.getCompoundOrEmpty(i);
                String oldPage = page.getStringOr("raw", "");
                if (page.contains("filtered")) {
                    String filterPage = page.getStringOr("filtered", "");
                    try {
                        MutableComponent filteredText = SchematicDowngradeConverter.legacyTextSerializer(filterPage, registry);
                        String newFilterPage = SchematicDowngradeConverter.legacyTextDeserializer(filteredText, registry);
                        filtered.putString(filterPage, newFilterPage);
                    }
                    catch (Exception e) {
                        filtered.putString(filterPage, filterPage);
                    }
                }
                try {
                    MutableComponent oldText = SchematicDowngradeConverter.legacyTextSerializer(oldPage, registry);
                    String newPage = SchematicDowngradeConverter.legacyTextDeserializer(oldText, registry);
                    newPages.add(i, (Tag)StringTag.valueOf((String)newPage));
                    continue;
                }
                catch (Exception e) {
                    newPages.add(i, (Tag)StringTag.valueOf((String)oldPage));
                }
            }
        }
        if (!newPages.isEmpty()) {
            newBook.put("pages", (Tag)newPages);
        }
        if (!filtered.isEmpty()) {
            newBook.put("filtered_pages", (Tag)filtered);
        }
        return newBook;
    }

    private static Tag processBannerPatterns(Tag oldPatterns) {
        ListTag oldList = oldPatterns.asList().orElse(new ListTag());
        ListTag newList = new ListTag();
        for (int i = 0; i < oldList.size(); ++i) {
            CompoundTag oldEntry = oldList.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            String color = oldEntry.getStringOr("color", "");
            String pattern = oldEntry.getStringOr("pattern", "");
            DyeColor dye = DyeColor.byName((String)color, (DyeColor)DyeColor.WHITE);
            newEntry.putString("Pattern", SchematicDowngradeConverter.convertBannerPattern(pattern));
            newEntry.putInt("Color", dye.getId());
            newList.add((Object)newEntry);
        }
        return newList;
    }

    private static String convertBannerPattern(String patternId) {
        return switch (patternId) {
            case "minecraft:base" -> "b";
            case "minecraft:square_bottom_left" -> "bl";
            case "minecraft:square_bottom_right" -> "br";
            case "minecraft:square_top_left" -> "tl";
            case "minecraft:square_top_right" -> "tr";
            case "minecraft:stripe_bottom" -> "bs";
            case "minecraft:stripe_top" -> "ts";
            case "minecraft:stripe_left" -> "ls";
            case "minecraft:stripe_right" -> "rs";
            case "minecraft:stripe_center" -> "cs";
            case "minecraft:stripe_middle" -> "ms";
            case "minecraft:stripe_downright" -> "drs";
            case "minecraft:stripe_downleft" -> "dls";
            case "minecraft:small_stripes" -> "ss";
            case "minecraft:cross" -> "cr";
            case "minecraft:straight_cross" -> "sc";
            case "minecraft:triangle_bottom" -> "bt";
            case "minecraft:triangle_top" -> "tt";
            case "minecraft:triangles_bottom" -> "bts";
            case "minecraft:triangles_top" -> "tts";
            case "minecraft:diagonal_left" -> "ld";
            case "minecraft:diagonal_up_right" -> "rd";
            case "minecraft:diagonal_up_left" -> "lud";
            case "minecraft:diagonal_right" -> "rud";
            case "minecraft:circle" -> "mc";
            case "minecraft:rhombus" -> "mr";
            case "minecraft:half_vertical" -> "vh";
            case "minecraft:half_horizontal" -> "hh";
            case "minecraft:half_vertical_right" -> "vhr";
            case "minecraft:half_horizontal_bottom" -> "hhb";
            case "minecraft:border" -> "bo";
            case "minecraft:curly_border" -> "cbo";
            case "minecraft:gradient" -> "gra";
            case "minecraft:gradient_up" -> "gru";
            case "minecraft:bricks" -> "bri";
            case "minecraft:globe" -> "glb";
            case "minecraft:creeper" -> "cre";
            case "minecraft:skull" -> "sku";
            case "minecraft:flower" -> "flo";
            case "minecraft:mojang" -> "moj";
            case "minecraft:piglin" -> "pig";
            default -> "b";
        };
    }

    private static Tag processSkullProfile(Tag oldProfile, CompoundTag dispNbt, int minecraftDataVersion, @Nonnull RegistryAccess registry) {
        CompoundTag profile = oldProfile.asCompound().orElse(new CompoundTag());
        CompoundTag newProfile = new CompoundTag();
        String customName1 = dispNbt.getStringOr("Name", "");
        String customName2 = dispNbt.getStringOr("CustomName", "");
        String name = profile.getStringOr("name", "");
        UUID uuid = profile.read("id", UUIDUtil.AUTHLIB_CODEC, (DynamicOps)registry.createSerializationContext((DynamicOps)NbtOps.INSTANCE)).orElse(Util.NIL_UUID);
        if (name.isEmpty() && !customName1.isEmpty()) {
            try {
                disp = SchematicDowngradeConverter.legacyTextSerializer(customName1, registry);
                if (disp != null) {
                    name = disp.tryCollapseToString();
                }
                if (name == null) {
                    name = customName1;
                }
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("processSkullProfile(): Exception deserializing CustomName1 for Head Name.");
                name = customName1;
            }
        } else if (name.isEmpty() && !customName2.isEmpty()) {
            try {
                disp = SchematicDowngradeConverter.legacyTextSerializer(customName2, registry);
                if (disp != null) {
                    name = disp.tryCollapseToString();
                }
                if (name == null) {
                    name = customName2;
                }
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("processSkullProfile(): Exception deserializing CustomName2 for Head Name.");
                name = customName2;
            }
        }
        newProfile.putString("Name", name);
        newProfile.store("Id", UUIDUtil.CODEC, (Object)uuid);
        ListTag properties = profile.getListOrEmpty("properties");
        CompoundTag newProperties = new CompoundTag();
        for (int i = 0; i < properties.size(); ++i) {
            CompoundTag property = properties.getCompoundOrEmpty(i);
            String propName = property.getStringOr("name", "");
            String propValue = property.getStringOr("value", "");
            if (!propName.equals("textures")) continue;
            ListTag textures = new ListTag();
            CompoundTag value = new CompoundTag();
            value.putString("Value", propValue);
            textures.add((Object)value);
            newProperties.put("textures", (Tag)textures);
        }
        newProfile.put("Properties", (Tag)newProperties);
        return newProfile;
    }

    private static Tag processFlowerPos(CompoundTag oldNbt, String key, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        CompoundTag flowerOut = new CompoundTag();
        BlockPos flowerPos = oldNbt.read(key, BlockPos.CODEC, (DynamicOps)registryManager.createSerializationContext((DynamicOps)NbtOps.INSTANCE)).orElse(null);
        if (flowerPos != null) {
            flowerOut.putInt("X", flowerPos.getX());
            flowerOut.putInt("Y", flowerPos.getY());
            flowerOut.putInt("Z", flowerPos.getZ());
        }
        return flowerOut;
    }

    private static Tag processBeesTag(Tag beesTag, int minecraftDataVersion, @Nonnull RegistryAccess registryManager) {
        ListTag oldBees = beesTag.asList().orElse(new ListTag());
        ListTag newBees = new ListTag();
        for (int i = 0; i < oldBees.size(); ++i) {
            CompoundTag oldEntry = oldBees.getCompoundOrEmpty(i);
            CompoundTag newEntry = new CompoundTag();
            newEntry.putInt("TicksInHive", oldEntry.getIntOr("ticks_in_hive", 0));
            newEntry.putInt("MinOccupationTicks", oldEntry.getIntOr("min_ticks_in_hive", 0));
            newEntry.put("EntityData", (Tag)SchematicDowngradeConverter.downgradeEntity_to_1_20_4(oldEntry.getCompoundOrEmpty("entity_data"), minecraftDataVersion, registryManager));
            newBees.add((Object)newEntry);
        }
        return newBees;
    }
}

