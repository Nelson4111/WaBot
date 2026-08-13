/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonObject
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  org.jetbrains.annotations.ApiStatus$Internal
 */
package fi.dy.masa.litematica.schematic.placement;

import com.google.gson.JsonObject;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.interfaces.ISchematicPlacementEventListener;
import fi.dy.masa.litematica.interfaces.ISchematicPlacementEventManager;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementEventFlag;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import org.jetbrains.annotations.ApiStatus;

public class SchematicPlacementEventHandler
implements ISchematicPlacementEventManager {
    private static final SchematicPlacementEventHandler INSTANCE = new SchematicPlacementEventHandler();
    private final HashMap<ISchematicPlacementEventListener, List<SchematicPlacementEventFlag>> handlers = new HashMap();

    public static SchematicPlacementEventHandler getInstance() {
        return INSTANCE;
    }

    @Override
    public void registerSchematicPlacementEventListener(@Nonnull ISchematicPlacementEventListener listener, @Nonnull List<SchematicPlacementEventFlag> flags) {
        if (flags.isEmpty()) {
            Litematica.LOGGER.warn("registerSchematicPlacementEventListener: provided event flags for '{}' are empty.  Ignoring.", (Object)(listener.getClass().getCanonicalName() != null ? listener.getClass().getCanonicalName() : listener.getClass().getName()));
            return;
        }
        if (!this.handlers.containsKey(listener)) {
            if (flags.contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
                this.handlers.put(listener, Arrays.stream(SchematicPlacementEventFlag.values()).toList());
            } else {
                this.handlers.put(listener, flags);
            }
        }
    }

    @Override
    public void invokePrePlacementChange(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SchematicPlacement placement) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.placementManager.onPrePlacementChange(placement);
        }
    }

    @Override
    public void invokePostPlacementChange(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SchematicPlacement placement) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.placementManager.onPostPlacementChange(placement);
        }
    }

    @Override
    public void invokePlacementModified(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SchematicPlacement placement) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.onModified(placement.placementManager);
        }
    }

    @Override
    public void invokeSetSubRegionEnabled(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SubRegionPlacement placement, boolean toggle) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.setEnabled(toggle);
        }
    }

    @Override
    public void invokeSetSubRegionOrigin(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SubRegionPlacement placement, BlockPos pos) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.setPos(pos);
        }
    }

    @Override
    public void invokeSetSubRegionMirror(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SubRegionPlacement placement, Mirror mirror) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.setMirror(mirror);
        }
    }

    @Override
    public void invokeSetSubRegionRotation(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SubRegionPlacement placement, Rotation rot) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.setRotation(rot);
        }
    }

    @Override
    public void invokeResetSubRegion(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SubRegionPlacement placement) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.resetToOriginalValues();
        }
    }

    @Override
    public void invokeSubRegionModified(@Nonnull ISchematicPlacementEventListener listener, @Nonnull SchematicPlacement placement, @Nonnull String regionName) {
        if (this.handlers.containsKey(listener) && this.handlers.get(listener).contains((Object)SchematicPlacementEventFlag.ALL_EVENTS)) {
            placement.onModified(regionName, placement.placementManager);
        }
    }

    @ApiStatus.Internal
    public void onPlacementInit(SchematicPlacement placement) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.INIT)) {
                handler.onPlacementInit(placement);
            }
        });
    }

    @ApiStatus.Internal
    public void onSubRegionInit(SubRegionPlacement subRegion) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.INIT_SUBREGION)) {
                handler.onSubRegionInit(subRegion);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementCreateFor(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, boolean enabled, boolean enableRender) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.CREATE_FOR)) {
                handler.onPlacementCreateFor(placement, schematic, origin, name, enabled, enableRender);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementCreateForConversion(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.FOR_CONVERSION)) {
                handler.onPlacementCreateForConversion(placement, schematic, origin);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementCreateFromJson(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, JsonObject obj) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.FROM_JSON)) {
                handler.onPlacementCreateFromJson(placement, schematic, origin, name, rotation, mirror, enabled, enableRender, obj);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementCreateFromNbt(SchematicPlacement placement, LitematicaSchematic schematic, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, CompoundTag nbt) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.FROM_NBT)) {
                handler.onPlacementCreateFromNbt(placement, schematic, origin, name, rotation, mirror, enabled, enableRender, nbt);
            }
        });
    }

    @ApiStatus.Internal
    public void onSavePlacementToJson(SchematicPlacement placement, JsonObject jsonObject) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.TO_JSON)) {
                handler.onSavePlacementToJson(placement, jsonObject);
            }
        });
    }

    @ApiStatus.Internal
    public void onSavePlacementToNbt(SchematicPlacement placement, CompoundTag nbt) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.TO_NBT)) {
                handler.onSavePlacementToNbt(placement, nbt);
            }
        });
    }

    @ApiStatus.Internal
    public void onSubRegionCreateFromJson(SubRegionPlacement subRegion, BlockPos origin, String name, Rotation rotation, Mirror mirror, boolean enabled, boolean enableRender, JsonObject obj) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SUBREGION_FROM_JSON)) {
                handler.onSubRegionCreateFromJson(subRegion, origin, name, rotation, mirror, enabled, enableRender, obj);
            }
        });
    }

    @ApiStatus.Internal
    public void onSaveSubRegionToJson(SubRegionPlacement subRegion, JsonObject jsonObject) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SUBREGION_TO_JSON)) {
                handler.onSaveSubRegionToJson(subRegion, jsonObject);
            }
        });
    }

    @ApiStatus.Internal
    public void onToggleLocked(SchematicPlacement placement, boolean toggle) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.TOGGLE_LOCKED)) {
                handler.onToggleLocked(placement, toggle);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetName(SchematicPlacement placement, String name) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_NAME)) {
                handler.onSetName(placement, name);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetEnabled(SchematicPlacement placement, boolean enabled) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_ENABLED)) {
                handler.onSetEnabled(placement, enabled);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetRender(SchematicPlacement placement, boolean enabled) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_RENDER)) {
                handler.onSetRender(placement, enabled);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetOrigin(SchematicPlacement placement, BlockPos origin) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_ORIGIN)) {
                handler.onSetOrigin(placement, origin);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetMirror(SchematicPlacement placement, Mirror mirror) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_MIRROR)) {
                handler.onSetMirror(placement, mirror);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetRotation(SchematicPlacement placement, Rotation rotation) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_ROTATION)) {
                handler.onSetRotation(placement, rotation);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementReset(SchematicPlacement placement) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_RESET)) {
                handler.onPlacementReset(placement);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetSubRegionEnabled(SubRegionPlacement subRegion, boolean enabled) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_SUBREGION_ENABLED)) {
                handler.onSetSubRegionEnabled(subRegion, enabled);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetSubRegionRender(SubRegionPlacement subRegion, boolean enabled) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_SUBREGION_RENDER)) {
                handler.onSetSubRegionRender(subRegion, enabled);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetSubRegionOrigin(SubRegionPlacement subRegion, BlockPos origin) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_SUBREGION_ORIGIN)) {
                handler.onSetSubRegionOrigin(subRegion, origin);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetSubRegionMirror(SubRegionPlacement subRegion, Mirror mirror) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_SUBREGION_MIRROR)) {
                handler.onSetSubRegionMirror(subRegion, mirror);
            }
        });
    }

    @ApiStatus.Internal
    public void onSetSubRegionRotation(SubRegionPlacement subRegion, Rotation rotation) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.SET_SUBREGION_ROTATION)) {
                handler.onSetSubRegionRotation(subRegion, rotation);
            }
        });
    }

    @ApiStatus.Internal
    public void onSubRegionReset(SubRegionPlacement subRegion) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_SUBREGION_RESET)) {
                handler.onSubRegionReset(subRegion);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementSelected(@Nullable SchematicPlacement prevPlacement, @Nullable SchematicPlacement selected) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_SELECTED)) {
                handler.onPlacementSelected(prevPlacement, selected);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementAdded(SchematicPlacement placement) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_ADDED)) {
                handler.onPlacementAdded(placement);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementRemoved(SchematicPlacement placement) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_REMOVED)) {
                handler.onPlacementRemoved(placement);
            }
        });
    }

    @ApiStatus.Internal
    public void onPlacementUpdated(SchematicPlacement placement) {
        this.handlers.forEach((handler, list) -> {
            if (list.contains((Object)SchematicPlacementEventFlag.ON_UPDATED)) {
                handler.onPlacementUpdated(placement);
            }
        });
    }
}

