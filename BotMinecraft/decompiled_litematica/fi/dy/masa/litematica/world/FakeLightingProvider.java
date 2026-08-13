/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.SectionPos
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.LightLayer
 *  net.minecraft.world.level.chunk.DataLayer
 *  net.minecraft.world.level.chunk.LightChunkGetter
 *  net.minecraft.world.level.lighting.LayerLightEventListener
 *  net.minecraft.world.level.lighting.LayerLightSectionStorage$SectionType
 *  net.minecraft.world.level.lighting.LevelLightEngine
 */
package fi.dy.masa.litematica.world;

import fi.dy.masa.litematica.config.Configs;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.SectionPos;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.LightLayer;
import net.minecraft.world.level.chunk.DataLayer;
import net.minecraft.world.level.chunk.LightChunkGetter;
import net.minecraft.world.level.lighting.LayerLightEventListener;
import net.minecraft.world.level.lighting.LayerLightSectionStorage;
import net.minecraft.world.level.lighting.LevelLightEngine;

public class FakeLightingProvider
extends LevelLightEngine {
    private final FakeLightingView lightingView = new FakeLightingView();
    private static final DataLayer chunkNibbleArray = new DataLayer(15);

    public FakeLightingProvider(LightChunkGetter chunkProvider) {
        super(chunkProvider, false, false);
    }

    @Nonnull
    public LayerLightEventListener getLayerListener(@Nonnull LightLayer type) {
        return this.lightingView;
    }

    public int getRawBrightness(@Nonnull BlockPos pos, int ambientDarkness) {
        return Configs.Visuals.RENDER_FAKE_LIGHTING_LEVEL.getIntegerValue();
    }

    public static DataLayer getChunkNibbleArray() {
        return chunkNibbleArray;
    }

    public boolean lightOnInColumn(long sectionPos) {
        return true;
    }

    @Nonnull
    public LayerLightSectionStorage.SectionType getDebugSectionType(@Nonnull LightLayer lightType, @Nonnull SectionPos pos) {
        return LayerLightSectionStorage.SectionType.LIGHT_ONLY;
    }

    @Nonnull
    public String getDebugData(@Nonnull LightLayer lightType, @Nonnull SectionPos pos) {
        return Integer.toString(1);
    }

    public static class FakeLightingView
    implements LayerLightEventListener {
        @Nullable
        public DataLayer getDataLayerData(@Nonnull SectionPos pos) {
            return FakeLightingProvider.getChunkNibbleArray();
        }

        public int getLightValue(@Nonnull BlockPos pos) {
            return Configs.Visuals.RENDER_FAKE_LIGHTING_LEVEL.getIntegerValue();
        }

        public void checkBlock(@Nonnull BlockPos pos) {
        }

        public void propagateLightSources(@Nonnull ChunkPos chunkPos) {
        }

        public boolean hasLightWork() {
            return false;
        }

        public int runLightUpdates() {
            return 0;
        }

        public void updateSectionStatus(@Nonnull SectionPos pos, boolean notReady) {
        }

        public void setLightEnabled(@Nonnull ChunkPos chunkPos, boolean bl) {
        }
    }
}

