/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.QuadInstance
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.render.schematic.ao;

import com.mojang.blaze3d.vertex.QuadInstance;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.render.schematic.ao.AOLightmap;
import fi.dy.masa.litematica.render.schematic.ao.AOProcessorLegacy;
import fi.dy.masa.litematica.render.schematic.ao.AOProcessorModern;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.state.BlockState;

public abstract class AOProcessor {
    protected final BlockPos.MutableBlockPos scratchPos = new BlockPos.MutableBlockPos();
    protected AOLightmap lightmap;
    protected boolean cubic;
    protected boolean hasNeighbors;

    public static AOProcessor get(AOLightmap lightmap) {
        if (Configs.Visuals.RENDER_AO_MODERN_ENABLE.getBooleanValue()) {
            AOProcessorModern ao = new AOProcessorModern();
            ao.lightmap = lightmap;
            return ao;
        }
        AOProcessorLegacy ao = new AOProcessorLegacy();
        ao.lightmap = lightmap;
        return ao;
    }

    public int getLight(BlockAndTintGetter world, BlockState state, BlockPos pos) {
        return this.lightmap.brightnessCache.getLight(state, world, pos);
    }

    public abstract void prepareSmooth(BlockAndTintGetter var1, BlockState var2, BlockPos var3, BakedQuad var4, QuadInstance var5);

    public abstract void prepareFlat(BlockAndTintGetter var1, BlockState var2, BlockPos var3, int var4, BakedQuad var5, QuadInstance var6);

    public abstract void prepareShape(BlockAndTintGetter var1, BlockState var2, BlockPos var3, BakedQuad var4, boolean var5);
}

