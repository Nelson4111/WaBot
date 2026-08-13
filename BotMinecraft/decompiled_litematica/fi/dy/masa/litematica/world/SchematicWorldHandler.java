/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.multiplayer.ClientLevel$ClientLevelData
 *  net.minecraft.core.Holder
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.RegistryAccess$Frozen
 *  net.minecraft.world.Difficulty
 *  net.minecraft.world.level.dimension.DimensionType
 *  net.minecraft.world.level.storage.WritableLevelData
 */
package fi.dy.masa.litematica.world;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.function.Supplier;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.Holder;
import net.minecraft.core.RegistryAccess;
import net.minecraft.world.Difficulty;
import net.minecraft.world.level.dimension.DimensionType;
import net.minecraft.world.level.storage.WritableLevelData;

public class SchematicWorldHandler {
    public static final SchematicWorldHandler INSTANCE = new SchematicWorldHandler(LitematicaRenderer.getInstance()::getWorldRenderer);
    protected final Supplier<IWorldSchematicRenderer> rendererSupplier;
    @Nullable
    protected WorldSchematic world;
    @Nullable
    protected RegistryAccess.Frozen dynamicRegistryManager = RegistryAccess.EMPTY;

    public SchematicWorldHandler(Supplier<IWorldSchematicRenderer> rendererSupplier) {
        this.rendererSupplier = rendererSupplier;
    }

    @Nullable
    public static WorldSchematic getSchematicWorld() {
        return INSTANCE.getWorld();
    }

    @Nullable
    public WorldSchematic getWorld() {
        if (this.world == null) {
            this.world = SchematicWorldHandler.createSchematicWorld(this.rendererSupplier.get());
        }
        return this.world;
    }

    public void setDynamicRegistryManager(@Nullable RegistryAccess.Frozen immutable) {
        if (immutable == null) {
            return;
        }
        this.dynamicRegistryManager = immutable;
    }

    public RegistryAccess getRegistryManager() {
        return this.dynamicRegistryManager;
    }

    public static WorldSchematic createSchematicWorld(@Nullable IWorldSchematicRenderer worldRenderer) {
        ClientLevel world = Minecraft.getInstance().level;
        if (world == null) {
            return null;
        }
        ClientLevel.ClientLevelData levelInfo = new ClientLevel.ClientLevelData(Difficulty.PEACEFUL, false, true);
        return new WorldSchematic((WritableLevelData)levelInfo, world.registryAccess(), (Holder<DimensionType>)world.dimensionTypeRegistration(), worldRenderer);
    }

    public void recreateSchematicWorld(boolean remove) {
        if (remove) {
            Litematica.debugLog("Removing the schematic world...", new Object[0]);
            if (this.world != null) {
                this.world.clearEntities();
                try {
                    this.world.close();
                }
                catch (Exception exception) {
                    // empty catch block
                }
            }
            this.world = null;
            LitematicaRenderer.getInstance().onSchematicWorldChanged(null);
        } else {
            Litematica.debugLog("(Re-)creating the schematic world...", new Object[0]);
            IWorldSchematicRenderer worldRenderer = this.world != null ? this.world.worldRenderer : LitematicaRenderer.getInstance().resetWorldRenderer();
            this.world = SchematicWorldHandler.createSchematicWorld(worldRenderer);
            Litematica.debugLog("Schematic world (re-)created: {}", new Object[]{this.world});
        }
        LitematicaRenderer.getInstance().onSchematicWorldChanged(this.world);
    }
}

