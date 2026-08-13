/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonObject
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 */
package fi.dy.masa.litematica.interfaces;

import com.google.gson.JsonObject;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;

public interface ISchematicPlacementEventListener {
    default public void onPlacementInit(SchematicPlacement placement) {
    }

    default public void onSubRegionInit(SubRegionPlacement subRegion) {
    }

    default public void onPlacementCreateFor(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender) {
    }

    default public void onPlacementCreateForConversion(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin) {
    }

    default public void onPlacementCreateFromJson(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, JsonObject obj) {
    }

    default public void onPlacementCreateFromNbt(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, CompoundTag nbt) {
    }

    default public void onSavePlacementToJson(SchematicPlacement placement, JsonObject json) {
    }

    default public void onSavePlacementToNbt(SchematicPlacement placement, CompoundTag nbt) {
    }

    default public void onSubRegionCreateFromJson(SubRegionPlacement subRegion, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, JsonObject obj) {
    }

    default public void onSaveSubRegionToJson(SubRegionPlacement subRegion, JsonObject json) {
    }

    default public void onToggleLocked(SchematicPlacement placement, boolean toggle) {
    }

    default public void onSetEnabled(SchematicPlacement placement, boolean toggle) {
    }

    default public void onSetRender(SchematicPlacement placement, boolean toggle) {
    }

    default public void onSetName(SchematicPlacement placement, String name) {
    }

    default public void onSetOrigin(SchematicPlacement placement, BlockPos origin) {
    }

    default public void onSetMirror(SchematicPlacement placement, Mirror mirror) {
    }

    default public void onSetRotation(SchematicPlacement placement, Rotation rotation) {
    }

    default public void onPlacementReset(SchematicPlacement placement) {
    }

    default public void onSetSubRegionEnabled(SubRegionPlacement subRegion, boolean toggle) {
    }

    default public void onSetSubRegionRender(SubRegionPlacement subRegion, boolean toggle) {
    }

    default public void onSetSubRegionOrigin(SubRegionPlacement subRegion, BlockPos origin) {
    }

    default public void onSetSubRegionMirror(SubRegionPlacement subRegion, Mirror mirror) {
    }

    default public void onSetSubRegionRotation(SubRegionPlacement subRegion, Rotation rotation) {
    }

    default public void onSubRegionReset(SubRegionPlacement subRegion) {
    }

    default public void onPlacementSelected(@Nullable SchematicPlacement prevPlacement, @Nullable SchematicPlacement selected) {
    }

    public void onPlacementAdded(SchematicPlacement var1);

    public void onPlacementRemoved(SchematicPlacement var1);

    default public void onPlacementUpdated(SchematicPlacement placement) {
    }
}

