/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 */
package fi.dy.masa.litematica.interfaces;

import fi.dy.masa.litematica.interfaces.ISchematicPlacementEventListener;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementEventFlag;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import java.util.List;
import javax.annotation.Nonnull;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;

public interface ISchematicPlacementEventManager {
    public void registerSchematicPlacementEventListener(@Nonnull ISchematicPlacementEventListener var1, @Nonnull List<SchematicPlacementEventFlag> var2);

    public void invokePrePlacementChange(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SchematicPlacement var2);

    public void invokePostPlacementChange(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SchematicPlacement var2);

    public void invokePlacementModified(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SchematicPlacement var2);

    public void invokeSetSubRegionEnabled(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SubRegionPlacement var2, boolean var3);

    public void invokeSetSubRegionOrigin(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SubRegionPlacement var2, BlockPos var3);

    public void invokeSetSubRegionMirror(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SubRegionPlacement var2, Mirror var3);

    public void invokeSetSubRegionRotation(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SubRegionPlacement var2, Rotation var3);

    public void invokeSubRegionModified(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SchematicPlacement var2, @Nonnull String var3);

    public void invokeResetSubRegion(@Nonnull ISchematicPlacementEventListener var1, @Nonnull SubRegionPlacement var2);
}

