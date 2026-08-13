/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.interfaces.IWorldLoadListener
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.core.RegistryAccess$Frozen
 *  net.minecraft.util.datafix.fixes.BlockStateData
 */
package fi.dy.masa.litematica.event;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.compat.jade.JadeCompat;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.CachedTagManager;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.render.LitematicaDebugHud;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import fi.dy.masa.litematica.schematic.placement.TemporaryWorldManager;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.malilib.interfaces.IWorldLoadListener;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.RegistryAccess;
import net.minecraft.util.datafix.fixes.BlockStateData;

public class WorldLoadListener
implements IWorldLoadListener {
    public void onWorldLoadImmutable(RegistryAccess.Frozen immutable) {
        SchematicWorldHandler.INSTANCE.setDynamicRegistryManager(immutable);
    }

    public void onWorldLoadPre(@Nullable ClientLevel worldBefore, @Nullable ClientLevel worldAfter, Minecraft mc) {
        if (worldBefore != null) {
            DataManager.save();
        }
        if (worldAfter != null) {
            JadeCompat.checkForJade();
            EntityDataManager.getInstance().onWorldPre();
            DataManager.getInstance().onWorldPre(worldAfter.registryAccess());
        }
    }

    public void onWorldLoadPost(@Nullable ClientLevel worldBefore, @Nullable ClientLevel worldAfter, Minecraft mc) {
        SchematicWorldHandler.INSTANCE.recreateSchematicWorld(worldAfter == null);
        DataManager.getInstance().reset(worldAfter == null);
        EntityDataManager.getInstance().reset(worldAfter == null);
        TemporaryWorldManager.INSTANCE.reset();
        if (worldAfter != null) {
            Litematica.debugLog("onWorldLoadPost(): Init BlockStateFlattening DataFixer [Test: {}]", BlockStateData.upgradeBlock((String)"minecraft:air"));
            SchematicConversionMaps.computeMaps();
            Configs.checkBaseLanguage();
            DataManager.load();
            EntityDataManager.getInstance().onWorldJoin();
            CachedTagManager.startCache();
            LitematicaDebugHud.INSTANCE.checkConfig();
            DataManager.getSchematicPlacementManager().onWorldJoin();
            LitematicaRenderer.getInstance().updateConfigState();
        } else {
            TemporaryWorldManager.INSTANCE.clear();
            DataManager.clear();
        }
    }
}

