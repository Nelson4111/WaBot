/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.buffers.GpuBufferSlice
 *  com.mojang.blaze3d.textures.GpuSampler
 *  com.mojang.blaze3d.vertex.PoseStack
 *  fi.dy.masa.malilib.render.uniform.ChunkFixUniform
 *  net.minecraft.client.Camera
 *  net.minecraft.client.DeltaTracker
 *  net.minecraft.client.renderer.SubmitNodeCollector
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.renderer.block.FluidRenderer$Output
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.entity.EntityRenderDispatcher
 *  net.minecraft.client.renderer.fog.FogRenderer
 *  net.minecraft.client.renderer.state.level.CameraRenderState
 *  net.minecraft.client.renderer.state.level.LevelRenderState
 *  net.minecraft.core.BlockPos
 *  net.minecraft.util.LightCoordsUtil
 *  net.minecraft.util.RandomSource
 *  net.minecraft.util.debug.DebugValueAccess
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.level.LightLayer
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.material.FluidState
 *  net.minecraft.world.phys.Vec3
 *  org.joml.Matrix4fc
 *  org.jspecify.annotations.Nullable
 */
package fi.dy.masa.litematica.render;

import com.mojang.blaze3d.buffers.GpuBufferSlice;
import com.mojang.blaze3d.textures.GpuSampler;
import com.mojang.blaze3d.vertex.PoseStack;
import fi.dy.masa.litematica.render.schematic.BlockModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuDispatcher;
import fi.dy.masa.litematica.render.schematic.FluidModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.IBlockOutputSchematic;
import fi.dy.masa.litematica.render.schematic.SchematicRenderState;
import fi.dy.masa.litematica.util.invoker.IEntityHitboxDebugRendererInvoker;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.render.uniform.ChunkFixUniform;
import java.util.List;
import net.minecraft.client.Camera;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.renderer.SubmitNodeCollector;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.renderer.block.FluidRenderer;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher;
import net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.entity.EntityRenderDispatcher;
import net.minecraft.client.renderer.fog.FogRenderer;
import net.minecraft.client.renderer.state.level.CameraRenderState;
import net.minecraft.client.renderer.state.level.LevelRenderState;
import net.minecraft.core.BlockPos;
import net.minecraft.util.LightCoordsUtil;
import net.minecraft.util.RandomSource;
import net.minecraft.util.debug.DebugValueAccess;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.level.LightLayer;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.phys.Vec3;
import org.joml.Matrix4fc;
import org.jspecify.annotations.Nullable;

public interface IWorldSchematicRenderer {
    public void markNeedsUpdate();

    public boolean hasWorld();

    public String getDebugInfoRenders();

    public String getDebugInfoEntities();

    public ProfilerFiller getProfiler();

    public ChunkRenderGpuDispatcher getChunkRendererGpuDispatcher();

    public BlockEntityRenderDispatcher getBlockEntityRenderer();

    public EntityRenderDispatcher getEntityRenderer();

    public FogRenderer getFogRenderer();

    public SchematicRenderState getSchematicRenderState();

    public void setWorldAndLoadRenderers(@Nullable WorldSchematic var1);

    public void loadRenderers(@Nullable ProfilerFiller var1);

    public void reloadBlockRenderManager();

    public void updateCameraState(Camera var1, float var2, CameraRenderState var3);

    public void setupTerrain(Camera var1, Frustum var2, int var3, boolean var4, ProfilerFiller var5);

    public void updateChunks(long var1, ProfilerFiller var3);

    public void capturePreMainValues(CameraRenderState var1, GpuBufferSlice var2, ProfilerFiller var3);

    public void uploadRemainingBuffers(long var1, DeltaTracker var3, double var4, double var6, double var8, ProfilerFiller var10);

    public int prepareBlockLayers(Matrix4fc var1, double var2, double var4, double var6, ProfilerFiller var8);

    public <T extends Comparable<T>> BlockState getFallbackState(BlockState var1);

    public @Nullable BlockStateModel getModelForState(BlockState var1);

    public List<BlockStateModelPart> getModelParts(BlockPos var1, BlockState var2, RandomSource var3);

    public boolean renderBlock(BlockModelRendererSchematic var1, BlockAndTintGetter var2, BlockState var3, BlockPos var4, Vec3 var5, IBlockOutputSchematic var6);

    public boolean renderFluid(FluidModelRendererSchematic var1, BlockAndTintGetter var2, BlockState var3, FluidState var4, BlockPos var5, FluidRenderer.Output var6, float var7);

    public void drawBlockLayerGroup(ChunkSectionLayerGroup var1, @Nullable GpuSampler var2);

    public void scheduleTranslucentSorting(Vec3 var1, ProfilerFiller var2);

    public void prepareEntities(Camera var1, Frustum var2, LevelRenderState var3, DeltaTracker var4, ProfilerFiller var5);

    public void renderEntities(Camera var1, Frustum var2, PoseStack var3, LevelRenderState var4, SubmitNodeCollector var5, ProfilerFiller var6);

    public void prepareBlockEntities(Camera var1, Frustum var2, LevelRenderState var3, PoseStack var4, float var5, ProfilerFiller var6);

    public void renderBlockEntities(Camera var1, Frustum var2, PoseStack var3, LevelRenderState var4, SubmitNodeCollector var5, ProfilerFiller var6);

    public void renderBlockOverlays(Camera var1, float var2, ProfilerFiller var3);

    public void scheduleChunkRenders(int var1, int var2, boolean var3);

    public ChunkSchematicState getChunkSchematicState(int var1, int var2);

    public void setChunkSchematicState(int var1, int var2, ChunkSchematicState var3);

    public ChunkFixUniform getChunkFixUniform();

    public GpuSampler getGpuSampler();

    public void closeGpuSampler();

    public void clearChunkFixUniform();

    public void clearWorldRenderStates();

    public void renderEntityDebugHitboxes(IEntityHitboxDebugRendererInvoker var1, double var2, double var4, double var6, DebugValueAccess var8, Frustum var9, float var10);

    public static int getLightmap(BlockAndTintGetter world, BlockPos pos) {
        return IWorldSchematicRenderer.getLightmap(LightGetter.DEFAULT, world, world.getBlockState(pos), pos);
    }

    public static int getLightmap(LightGetter getter, BlockAndTintGetter world, BlockState state, BlockPos pos) {
        int luminance;
        if (state.emissiveRendering()) {
            return 0xF000F0;
        }
        int light = getter.packedLight(world, pos);
        int blockLight = LightCoordsUtil.block((int)light);
        if (blockLight < (luminance = state.getLightEmission())) {
            return LightCoordsUtil.withBlock((int)light, (int)luminance);
        }
        return light;
    }

    @FunctionalInterface
    public static interface LightGetter {
        public static final LightGetter DEFAULT = (world, pos) -> LightCoordsUtil.pack((int)world.getBrightness(LightLayer.BLOCK, pos), (int)world.getBrightness(LightLayer.SKY, pos));

        public int packedLight(BlockAndTintGetter var1, BlockPos var2);
    }
}

