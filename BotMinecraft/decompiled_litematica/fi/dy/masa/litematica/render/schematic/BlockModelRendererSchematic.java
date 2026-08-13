/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.QuadInstance
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  fi.dy.masa.malilib.util.position.Vec3f
 *  net.minecraft.CrashReport
 *  net.minecraft.CrashReportCategory
 *  net.minecraft.ReportedException
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.level.LevelHeightAccessor
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.vertex.QuadInstance;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.litematica.render.schematic.BlockTintCache;
import fi.dy.masa.litematica.render.schematic.IBlockOutputSchematic;
import fi.dy.masa.litematica.render.schematic.ao.AOLightmap;
import fi.dy.masa.litematica.render.schematic.ao.AOProcessor;
import fi.dy.masa.malilib.util.position.PositionUtils;
import fi.dy.masa.malilib.util.position.Vec3f;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.CrashReport;
import net.minecraft.CrashReportCategory;
import net.minecraft.ReportedException;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.level.LevelHeightAccessor;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.Vec3;

public class BlockModelRendererSchematic {
    private final List<BlockStateModelPart> parts;
    private final QuadInstance quadInst;
    private final BlockTintCache tintCache;
    private final AOLightmap lightmap = new AOLightmap();
    private BlockPos.MutableBlockPos mutablePos;
    private AOProcessor processor;
    private boolean useAO = true;
    private boolean useCulling = true;

    public BlockModelRendererSchematic() {
        this.parts = new ArrayList<BlockStateModelPart>();
        this.mutablePos = new BlockPos.MutableBlockPos();
        this.quadInst = new QuadInstance();
        this.tintCache = new BlockTintCache();
        this.processor = AOProcessor.get(this.lightmap);
    }

    public boolean shouldRenderModelSide(BlockAndTintGetter worldIn, BlockState stateIn, BlockPos posIn, Direction face, BlockPos neighbor) {
        if (!this.useCulling) {
            return true;
        }
        BlockState neighborState = worldIn.getBlockState(neighbor);
        return DataManager.getRenderLayerRange().isPositionAtRenderEdgeOnSide(posIn, face) || Configs.Visuals.RENDER_BLOCKS_AS_TRANSLUCENT.getBooleanValue() && Configs.Visuals.RENDER_TRANSLUCENT_INNER_SIDES.getBooleanValue() || Block.shouldRenderFace((BlockState)stateIn, (BlockState)neighborState, (Direction)face);
    }

    public void toggleAO(boolean toggle) {
        this.useAO = toggle;
    }

    public void toggleCulling(boolean toggle) {
        this.useCulling = toggle;
    }

    public void reload() {
        this.reloadLightmap();
        this.tintCache.onReloadResources();
    }

    protected void resetQuadLight() {
        this.quadInst.setColor(-1);
    }

    public void reloadLightmap() {
        this.lightmap.disableCache();
        this.processor = AOProcessor.get(this.lightmap);
    }

    public void enableCache() {
        this.lightmap.enableCache();
    }

    public void disableCache() {
        this.lightmap.disableCache();
    }

    public boolean tessellateBlock(BlockAndTintGetter worldIn, BlockState stateIn, BlockPos posIn, Vec3 pos, BlockStateModel modelIn, long seed, IBlockOutputSchematic output) {
        BlockModelCacheSchematic.INSTANCE.rand().setSeed(seed);
        modelIn.collectParts(BlockModelCacheSchematic.INSTANCE.rand(), this.parts);
        this.mutablePos = posIn.mutable();
        if (!this.parts.isEmpty()) {
            boolean ao = this.useAO && stateIn.getLightEmission() == 0 && ((BlockStateModelPart)this.parts.getFirst()).useAmbientOcclusion();
            Vec3 offset = stateIn.getOffset(posIn);
            Vec3f v3 = new Vec3f(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
            try {
                if (ao) {
                    boolean bl = this.tessellateModelSmooth(worldIn, this.parts, stateIn, posIn, v3, output);
                    return bl;
                }
                boolean bl = this.tessellateModelFlat(worldIn, this.parts, stateIn, posIn, v3, output);
                return bl;
            }
            catch (Throwable throwable) {
                CrashReport crashreport = CrashReport.forThrowable((Throwable)throwable, (String)"Tesselating block model");
                CrashReportCategory crashreportcategory = crashreport.addCategory("Block model being tesselated");
                CrashReportCategory.populateBlockDetails((CrashReportCategory)crashreportcategory, (LevelHeightAccessor)worldIn, (BlockPos)posIn, (BlockState)stateIn);
                crashreportcategory.setDetail("Using AO", (Object)ao);
                throw new ReportedException(crashreport);
            }
            finally {
                this.parts.clear();
                this.tintCache.resetTintCache();
                this.lightmap.disableCache();
            }
        }
        return false;
    }

    public boolean tessellateModelFlat(BlockAndTintGetter worldIn, List<BlockStateModelPart> modelParts, BlockState stateIn, BlockPos posIn, Vec3f v3, IBlockOutputSchematic out) {
        boolean renderedSomething = false;
        int isValid = 0;
        int shouldRenderFace = 0;
        for (BlockStateModelPart part : modelParts) {
            for (Direction side : PositionUtils.ALL_DIRECTIONS) {
                List quads;
                boolean shouldRender;
                int mask = 1 << side.ordinal();
                boolean valid = (isValid & mask) == 1;
                boolean bl = shouldRender = (shouldRenderFace & mask) == 1;
                if (valid && !shouldRender || (quads = part.getQuads(side)).isEmpty()) continue;
                BlockPos relPos = this.mutablePos.setWithOffset((Vec3i)posIn, side).immutable();
                if (!valid) {
                    shouldRender = this.shouldRenderModelSide(worldIn, stateIn, posIn, side, relPos);
                    isValid |= mask;
                    if (shouldRender) {
                        isValid |= mask;
                    }
                }
                if (!shouldRender) continue;
                int light = this.lightmap.brightnessCache.getLight(stateIn, worldIn, relPos);
                this.tessellateQuadsFlat(worldIn, stateIn, posIn, quads, light, v3, out);
                renderedSomething = true;
            }
            List quads = part.getQuads(null);
            if (quads.isEmpty()) continue;
            this.tessellateQuadsFlat(worldIn, stateIn, posIn, quads, -1, v3, out);
            renderedSomething = true;
        }
        return renderedSomething;
    }

    public boolean tessellateModelSmooth(BlockAndTintGetter worldIn, List<BlockStateModelPart> modelParts, BlockState stateIn, BlockPos posIn, Vec3f v3, IBlockOutputSchematic out) {
        boolean renderedSomething = false;
        int isValid = 0;
        int shouldRenderFace = 0;
        for (BlockStateModelPart part : modelParts) {
            for (Direction side : PositionUtils.ALL_DIRECTIONS) {
                List quads;
                boolean shouldRender;
                int mask = 1 << side.ordinal();
                boolean valid = (isValid & mask) == 1;
                boolean bl = shouldRender = (shouldRenderFace & mask) == 1;
                if (valid && !shouldRender || (quads = part.getQuads(side)).isEmpty()) continue;
                BlockPos relPos = this.mutablePos.setWithOffset((Vec3i)posIn, side).immutable();
                if (!valid) {
                    shouldRender = this.shouldRenderModelSide(worldIn, stateIn, posIn, side, relPos);
                    isValid |= mask;
                    if (shouldRender) {
                        shouldRenderFace |= mask;
                    }
                }
                if (!shouldRender) continue;
                this.tessellateQuadsSmooth(worldIn, stateIn, posIn, quads, v3, out);
                renderedSomething = true;
            }
            List quads = part.getQuads(null);
            if (quads.isEmpty()) continue;
            this.tessellateQuadsSmooth(worldIn, stateIn, posIn, quads, v3, out);
            renderedSomething = true;
        }
        return renderedSomething;
    }

    private void tessellateQuadsFlat(BlockAndTintGetter world, BlockState state, BlockPos pos, List<BakedQuad> quads, int light, Vec3f v3, IBlockOutputSchematic out) {
        for (BakedQuad quad : quads) {
            this.resetQuadLight();
            this.processor.prepareFlat(world, state, pos, light, quad, this.quadInst);
            this.tessellateQuad(world, state, pos, quad, v3, out);
        }
    }

    private void tessellateQuadsSmooth(BlockAndTintGetter world, BlockState state, BlockPos pos, List<BakedQuad> quads, Vec3f v3, IBlockOutputSchematic out) {
        for (BakedQuad bakedQuad : quads) {
            this.resetQuadLight();
            this.processor.prepareSmooth(world, state, pos, bakedQuad, this.quadInst);
            this.tessellateQuad(world, state, pos, bakedQuad, v3, out);
        }
    }

    private void tessellateQuad(BlockAndTintGetter world, BlockState state, BlockPos pos, BakedQuad bakedQuad, Vec3f v3, IBlockOutputSchematic out) {
        int tintColor;
        int tint = bakedQuad.materialInfo().tintIndex();
        if (tint != -1 && (tintColor = this.tintCache.get(world, state, pos, tint)) != -1) {
            this.quadInst.multiplyColor(tintColor);
        }
        out.put(v3.x(), v3.y(), v3.z(), bakedQuad, this.quadInst);
    }
}

