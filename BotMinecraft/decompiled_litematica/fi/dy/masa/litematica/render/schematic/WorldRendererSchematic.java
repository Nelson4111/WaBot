/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.mojang.blaze3d.IndexType
 *  com.mojang.blaze3d.PrimitiveTopology
 *  com.mojang.blaze3d.buffers.GpuBuffer
 *  com.mojang.blaze3d.buffers.GpuBufferSlice
 *  com.mojang.blaze3d.pipeline.RenderPipeline
 *  com.mojang.blaze3d.pipeline.RenderTarget
 *  com.mojang.blaze3d.systems.RenderPass
 *  com.mojang.blaze3d.systems.RenderPass$Draw
 *  com.mojang.blaze3d.systems.RenderSystem
 *  com.mojang.blaze3d.systems.RenderSystem$AutoStorageIndexBuffer
 *  com.mojang.blaze3d.textures.AddressMode
 *  com.mojang.blaze3d.textures.FilterMode
 *  com.mojang.blaze3d.textures.GpuSampler
 *  com.mojang.blaze3d.textures.GpuTextureView
 *  com.mojang.blaze3d.vertex.PoseStack
 *  com.mojang.blaze3d.vertex.VertexFormat
 *  fi.dy.masa.malilib.compat.iris.IrisCompat
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.render.uniform.ChunkFixUniform
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  javax.annotation.Nullable
 *  net.minecraft.SharedConstants
 *  net.minecraft.client.Camera
 *  net.minecraft.client.CameraType
 *  net.minecraft.client.DeltaTracker
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.entity.ClientMannequin
 *  net.minecraft.client.player.AbstractClientPlayer
 *  net.minecraft.client.renderer.DynamicUniforms$Transform
 *  net.minecraft.client.renderer.SubmitNodeCollector
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.renderer.block.FluidModel
 *  net.minecraft.client.renderer.block.FluidRenderer$Output
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher
 *  net.minecraft.client.renderer.blockentity.state.BlockEntityRenderState
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.entity.EntityRenderDispatcher
 *  net.minecraft.client.renderer.entity.state.EntityRenderState
 *  net.minecraft.client.renderer.fog.FogRenderer
 *  net.minecraft.client.renderer.fog.FogRenderer$FogMode
 *  net.minecraft.client.renderer.state.level.CameraRenderState
 *  net.minecraft.client.renderer.state.level.LevelRenderState
 *  net.minecraft.client.renderer.texture.TextureAtlas
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.ARGB
 *  net.minecraft.util.RandomSource
 *  net.minecraft.util.debug.DebugValueAccess
 *  net.minecraft.util.profiling.Profiler
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.entity.Avatar
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.EntityTypes
 *  net.minecraft.world.entity.animal.AgeableWaterCreature
 *  net.minecraft.world.entity.animal.equine.AbstractHorse
 *  net.minecraft.world.entity.animal.fish.Cod
 *  net.minecraft.world.entity.animal.fish.Salmon
 *  net.minecraft.world.entity.animal.fish.TropicalFish
 *  net.minecraft.world.entity.animal.frog.Tadpole
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragon
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragonPart
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.level.material.FluidState
 *  net.minecraft.world.level.material.Fluids
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  org.apache.logging.log4j.Logger
 *  org.joml.Matrix4f
 *  org.joml.Matrix4fStack
 *  org.joml.Matrix4fc
 *  org.joml.Vector3f
 *  org.joml.Vector3fc
 *  org.joml.Vector4f
 *  org.joml.Vector4fc
 */
package fi.dy.masa.litematica.render.schematic;

import com.google.common.collect.ImmutableList;
import com.mojang.blaze3d.IndexType;
import com.mojang.blaze3d.PrimitiveTopology;
import com.mojang.blaze3d.buffers.GpuBuffer;
import com.mojang.blaze3d.buffers.GpuBufferSlice;
import com.mojang.blaze3d.pipeline.RenderPipeline;
import com.mojang.blaze3d.pipeline.RenderTarget;
import com.mojang.blaze3d.systems.RenderPass;
import com.mojang.blaze3d.systems.RenderSystem;
import com.mojang.blaze3d.textures.AddressMode;
import com.mojang.blaze3d.textures.FilterMode;
import com.mojang.blaze3d.textures.GpuSampler;
import com.mojang.blaze3d.textures.GpuTextureView;
import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.blaze3d.vertex.VertexFormat;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.compat.iris.IrisRenderingFix;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.mixin.entity.IMixinEntity;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.litematica.render.schematic.BlockModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkMeshDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderBatchDraw;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherLitematica;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuBuffers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuDispatcher;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuUploader;
import fi.dy.masa.litematica.render.schematic.ChunkRendererSchematicVbo;
import fi.dy.masa.litematica.render.schematic.FallbackBlocks;
import fi.dy.masa.litematica.render.schematic.FluidModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.IBlockOutputSchematic;
import fi.dy.masa.litematica.render.schematic.IChunkRendererFactory;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import fi.dy.masa.litematica.render.schematic.SchematicRenderState;
import fi.dy.masa.litematica.util.invoker.IAvatarInvoker;
import fi.dy.masa.litematica.util.invoker.IEntityHitboxDebugRendererInvoker;
import fi.dy.masa.litematica.util.invoker.IEntityInvoker;
import fi.dy.masa.litematica.util.invoker.IEntityRendererInvoker;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.compat.iris.IrisCompat;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.render.uniform.ChunkFixUniform;
import fi.dy.masa.malilib.util.EntityUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.Set;
import java.util.UUID;
import javax.annotation.Nullable;
import net.minecraft.SharedConstants;
import net.minecraft.client.Camera;
import net.minecraft.client.CameraType;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.entity.ClientMannequin;
import net.minecraft.client.player.AbstractClientPlayer;
import net.minecraft.client.renderer.DynamicUniforms;
import net.minecraft.client.renderer.SubmitNodeCollector;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.renderer.block.FluidModel;
import net.minecraft.client.renderer.block.FluidRenderer;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher;
import net.minecraft.client.renderer.blockentity.state.BlockEntityRenderState;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.entity.EntityRenderDispatcher;
import net.minecraft.client.renderer.entity.state.EntityRenderState;
import net.minecraft.client.renderer.fog.FogRenderer;
import net.minecraft.client.renderer.state.level.CameraRenderState;
import net.minecraft.client.renderer.state.level.LevelRenderState;
import net.minecraft.client.renderer.texture.TextureAtlas;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.resources.Identifier;
import net.minecraft.util.ARGB;
import net.minecraft.util.RandomSource;
import net.minecraft.util.debug.DebugValueAccess;
import net.minecraft.util.profiling.Profiler;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.Avatar;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityTypes;
import net.minecraft.world.entity.animal.AgeableWaterCreature;
import net.minecraft.world.entity.animal.equine.AbstractHorse;
import net.minecraft.world.entity.animal.fish.Cod;
import net.minecraft.world.entity.animal.fish.Salmon;
import net.minecraft.world.entity.animal.fish.TropicalFish;
import net.minecraft.world.entity.animal.frog.Tadpole;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.entity.boss.enderdragon.EnderDragonPart;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.level.material.Fluids;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import org.apache.logging.log4j.Logger;
import org.joml.Matrix4f;
import org.joml.Matrix4fStack;
import org.joml.Matrix4fc;
import org.joml.Vector3f;
import org.joml.Vector3fc;
import org.joml.Vector4f;
import org.joml.Vector4fc;

public class WorldRendererSchematic
implements IWorldSchematicRenderer {
    private static final Logger LOGGER = Litematica.LOGGER;
    private final Minecraft mc;
    private final List<ChunkRendererSchematicVbo> renderInfos;
    private SchematicRenderState schematicRenderState;
    private Set<ChunkRendererSchematicVbo> chunksToUpdate;
    private WorldSchematic world;
    private ChunkRenderDispatcherSchematic chunkRendererDispatcher;
    private ChunkRenderGpuDispatcher chunkRendererGpuDispatcher;
    private GpuBufferSlice vanillaFogBuffer;
    private GpuSampler gpuSampler;
    private ProfilerFiller profiler;
    private double lastCameraChunkUpdateX;
    private double lastCameraChunkUpdateY;
    private double lastCameraChunkUpdateZ;
    private double lastCameraX;
    private double lastCameraY;
    private double lastCameraZ;
    private float lastCameraPitch;
    private float lastCameraYaw;
    private ChunkRenderDispatcherLitematica renderDispatcher;
    private final IChunkRendererFactory renderChunkFactory;
    private final HashMap<Vec3, UUID> renderedEntities;
    private int renderDistanceChunks;
    private int renderEntitiesStartupCounter;
    private int countEntitiesTotal;
    private int countEntitiesRendered;
    private int countEntitiesHidden;
    private double lastTranslucentSortX;
    private double lastTranslucentSortY;
    private double lastTranslucentSortZ;
    private boolean needsUpdate;
    private boolean shouldDraw;

    public WorldRendererSchematic(Minecraft mc) {
        this.mc = mc;
        this.renderChunkFactory = ChunkRendererSchematicVbo::new;
        this.renderInfos = new ArrayList<ChunkRendererSchematicVbo>(1024);
        this.renderedEntities = new HashMap();
        this.schematicRenderState = this.getSchematicRenderState();
        this.chunksToUpdate = new LinkedHashSet<ChunkRendererSchematicVbo>();
        this.profiler = null;
        this.vanillaFogBuffer = null;
        this.gpuSampler = null;
        this.shouldDraw = false;
        this.lastCameraChunkUpdateX = Double.MIN_VALUE;
        this.lastCameraChunkUpdateY = Double.MIN_VALUE;
        this.lastCameraChunkUpdateZ = Double.MIN_VALUE;
        this.lastCameraX = Double.MIN_VALUE;
        this.lastCameraY = Double.MIN_VALUE;
        this.lastCameraZ = Double.MIN_VALUE;
        this.lastCameraPitch = Float.MIN_VALUE;
        this.lastCameraYaw = Float.MIN_VALUE;
        this.renderDistanceChunks = -1;
        this.renderEntitiesStartupCounter = 2;
        this.needsUpdate = true;
    }

    @Override
    public void markNeedsUpdate() {
        this.needsUpdate = true;
    }

    @Override
    public boolean hasWorld() {
        return this.world != null;
    }

    @Override
    public String getDebugInfoRenders() {
        int rcTotal = this.chunkRendererDispatcher != null ? this.chunkRendererDispatcher.getRendererCount() : 0;
        int rcGpuTotal = this.chunkRendererGpuDispatcher != null ? this.chunkRendererGpuDispatcher.size() : 0;
        int rcRendered = this.chunkRendererDispatcher != null ? this.getRenderedChunks() : 0;
        return String.format("C: %02d/%02d gU: %02d, %sD: %02d, L: %02d, %s", rcRendered, rcTotal, rcGpuTotal, this.mc.smartCull ? "(s) " : "", this.renderDistanceChunks, 0, this.renderDispatcher == null ? "null" : this.renderDispatcher.getDebugInfo());
    }

    @Override
    public String getDebugInfoEntities() {
        return String.format("E: %02d/%02d, B: %02d", this.countEntitiesRendered, this.countEntitiesTotal, this.countEntitiesHidden);
    }

    protected ChunkRenderDispatcherLitematica getRenderDispatcher() {
        return this.renderDispatcher;
    }

    protected int getRenderedChunks() {
        int count = 0;
        for (ChunkRendererSchematicVbo chunkRenderer : this.renderInfos) {
            ChunkRenderDataSchematic data = chunkRenderer.chunkRenderData;
            if (data.isEmpty()) continue;
            ++count;
        }
        return count;
    }

    @Override
    public ProfilerFiller getProfiler() {
        if (this.profiler == null) {
            this.profiler = Profiler.get();
            this.profiler.startTick();
        }
        return this.profiler;
    }

    @Override
    @Nullable
    public ChunkRenderGpuDispatcher getChunkRendererGpuDispatcher() {
        return this.chunkRendererGpuDispatcher;
    }

    @Override
    public BlockEntityRenderDispatcher getBlockEntityRenderer() {
        return BlockModelCacheSchematic.INSTANCE.blockEntityRenderer();
    }

    @Override
    public EntityRenderDispatcher getEntityRenderer() {
        return BlockModelCacheSchematic.INSTANCE.entityRenderer();
    }

    @Override
    public FogRenderer getFogRenderer() {
        return BlockModelCacheSchematic.INSTANCE.fogRenderer();
    }

    @Override
    public SchematicRenderState getSchematicRenderState() {
        if (this.schematicRenderState == null) {
            this.schematicRenderState = new SchematicRenderState();
        }
        return this.schematicRenderState;
    }

    @Override
    public <T extends Comparable<T>> BlockState getFallbackState(BlockState origState) {
        Collection props = origState.getProperties();
        Block block = origState.getBlock();
        if (FallbackBlocks.BLOCK_TO_ID.containsKey(block)) {
            Identifier id = FallbackBlocks.BLOCK_TO_ID.get(block);
            LOGGER.warn("getFallbackState: Invalid Block State/Block Model for block [{}]; but we found a matching Litematica fallback block state that you can use.  Perhaps you have the Fusion mod installed?", (Object)origState.getBlock().getName().getString());
            BlockState newState = (BlockState)FallbackBlocks.ID_TO_STATE_MANAGER.get(id).any();
            for (Property entry : props) {
                Property p = entry;
                if (!newState.hasProperty(p)) continue;
                Comparable value = origState.getValue(p);
                if (newState.getValue(p).equals(value)) continue;
                newState = (BlockState)newState.setValue(p, value);
            }
            Litematica.debugLog("Fallback Block State -- OLD: [{}] --> NEW: [{}]", origState.toString(), newState.toString());
            return newState;
        }
        return origState;
    }

    protected GpuBufferSlice getEmptyFogBuffer() {
        return this.getFogRenderer().getBuffer(FogRenderer.FogMode.NONE);
    }

    @Override
    public void setWorldAndLoadRenderers(@Nullable WorldSchematic worldSchematic) {
        this.lastCameraChunkUpdateX = Double.MIN_VALUE;
        this.lastCameraChunkUpdateY = Double.MIN_VALUE;
        this.lastCameraChunkUpdateZ = Double.MIN_VALUE;
        this.world = worldSchematic;
        if (worldSchematic != null) {
            this.loadRenderers(this.profiler);
        } else {
            this.chunksToUpdate.forEach(ChunkRendererSchematicVbo::deleteGlResources);
            this.chunksToUpdate.clear();
            this.renderInfos.forEach(ChunkRendererSchematicVbo::deleteGlResources);
            this.renderInfos.clear();
            if (this.chunkRendererDispatcher != null) {
                this.chunkRendererDispatcher.delete();
                this.chunkRendererDispatcher = null;
            }
            if (this.chunkRendererGpuDispatcher != null) {
                this.chunkRendererGpuDispatcher.destroy();
                this.chunkRendererGpuDispatcher = null;
            }
            if (this.renderDispatcher != null) {
                this.renderDispatcher.stopWorkerThreads();
            }
            this.renderDispatcher = null;
            this.profiler = null;
            this.clearWorldRenderStates();
            this.getSchematicRenderState().clearChunkFixUniform();
            if (this.vanillaFogBuffer != null) {
                this.vanillaFogBuffer = null;
            }
            this.closeGpuSampler();
        }
    }

    @Override
    public void loadRenderers(@Nullable ProfilerFiller profiler) {
        if (this.hasWorld()) {
            if (profiler == null) {
                profiler = Profiler.get();
            }
            this.profiler = profiler;
            profiler.push("load_renderers");
            if (this.renderDispatcher == null) {
                this.renderDispatcher = new ChunkRenderDispatcherLitematica();
            }
            this.needsUpdate = true;
            this.renderDistanceChunks = (Integer)this.mc.options.renderDistance().get() + 2;
            if (this.chunkRendererDispatcher != null) {
                this.chunkRendererDispatcher.delete();
            }
            if (this.chunkRendererGpuDispatcher != null) {
                this.chunkRendererGpuDispatcher.destroy();
                this.chunkRendererGpuDispatcher = null;
            }
            this.stopChunkUpdates(profiler);
            this.clearWorldRenderStates();
            BlockModelCacheSchematic.INSTANCE.onLoadRenderers();
            this.chunkRendererDispatcher = new ChunkRenderDispatcherSchematic(this.world, this.renderDistanceChunks, this, this.renderChunkFactory);
            this.chunkRendererGpuDispatcher = new ChunkRenderGpuDispatcher(this.world, this);
            this.renderEntitiesStartupCounter = 2;
            profiler.pop();
        }
    }

    protected void stopChunkUpdates(ProfilerFiller profiler) {
        if (!this.chunksToUpdate.isEmpty()) {
            this.chunksToUpdate.forEach(ChunkRendererSchematicVbo::deleteGlResources);
        }
        this.chunksToUpdate.clear();
        this.renderDispatcher.stopChunkUpdates();
        this.profiler = null;
        this.clearWorldRenderStates();
        this.vanillaFogBuffer = null;
    }

    @Override
    public void setupTerrain(Camera camera, Frustum frustum, int frameCount, boolean playerSpectator, ProfilerFiller profiler) {
        this.profiler = profiler;
        profiler.push("setup_terrain");
        if (this.chunkRendererDispatcher == null || (Integer)this.mc.options.renderDistance().get() + 2 != this.renderDistanceChunks) {
            this.loadRenderers(profiler);
        }
        Entity entity = EntityUtils.getCameraEntity();
        if (this.mc.player == null) {
            return;
        }
        if (entity == null) {
            entity = this.mc.player;
        }
        profiler.popPush("setup_camera");
        double entityX = entity.getX();
        double entityY = entity.getY();
        double entityZ = entity.getZ();
        double diffX = entityX - this.lastCameraChunkUpdateX;
        double diffY = entityY - this.lastCameraChunkUpdateY;
        double diffZ = entityZ - this.lastCameraChunkUpdateZ;
        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 256.0) {
            this.lastCameraChunkUpdateX = entityX;
            this.lastCameraChunkUpdateY = entityY;
            this.lastCameraChunkUpdateZ = entityZ;
            this.chunkRendererDispatcher.removeOutOfRangeRenderers(this.chunkRendererGpuDispatcher);
        }
        Vec3 cameraPos = camera.position();
        double cameraX = cameraPos.x;
        double cameraY = cameraPos.y;
        double cameraZ = cameraPos.z;
        this.renderDispatcher.setCameraPosition(cameraPos);
        profiler.popPush("culling");
        BlockPos viewPos = BlockPos.containing((double)cameraX, (double)(cameraY + (double)entity.getEyeHeight()), (double)cameraZ);
        int centerChunkX = viewPos.getX() >> 4;
        int centerChunkZ = viewPos.getZ() >> 4;
        int renderDistance = (Integer)this.mc.options.renderDistance().get() + 2;
        ChunkPos viewChunk = ChunkPos.containing((BlockPos)viewPos);
        this.needsUpdate = this.needsUpdate || !this.chunksToUpdate.isEmpty() || entityX != this.lastCameraX || entityY != this.lastCameraY || entityZ != this.lastCameraZ || entity.getXRot() != this.lastCameraPitch || entity.getYRot() != this.lastCameraYaw;
        this.lastCameraX = cameraX;
        this.lastCameraY = cameraY;
        this.lastCameraZ = cameraZ;
        this.lastCameraPitch = camera.xRot();
        this.lastCameraYaw = camera.yRot();
        profiler.popPush("update");
        if (this.needsUpdate) {
            this.needsUpdate = false;
            this.renderInfos.clear();
            profiler.push("update_sort");
            List<ChunkPos> positions = DataManager.getSchematicPlacementManager().getAndUpdateVisibleChunks(viewChunk);
            int count = 0;
            profiler.popPush("update_iteration");
            for (ChunkPos chunkPos : positions) {
                ChunkRendererSchematicVbo chunkRenderer;
                int cx = chunkPos.x();
                int cz = chunkPos.z();
                if (Math.abs(cx - centerChunkX) <= renderDistance && Math.abs(cz - centerChunkZ) <= renderDistance && this.world.getChunkSource().hasChunk(cx, cz) && (chunkRenderer = this.chunkRendererDispatcher.getChunkRenderer(cx, cz)) != null && frustum.isVisible(chunkRenderer.getBoundingBox())) {
                    if (chunkRenderer.needsUpdate() && chunkPos.equals((Object)viewChunk)) {
                        chunkRenderer.setNeedsUpdate(true);
                    }
                    this.renderInfos.add(chunkRenderer);
                }
                ++count;
            }
            profiler.pop();
        }
        profiler.popPush("rebuild_near");
        Set<ChunkRendererSchematicVbo> set = this.chunksToUpdate;
        this.chunksToUpdate = new LinkedHashSet<ChunkRendererSchematicVbo>();
        for (ChunkRendererSchematicVbo chunkRendererTmp : this.renderInfos) {
            boolean isNear;
            if (!chunkRendererTmp.needsUpdate() && !set.contains(chunkRendererTmp)) continue;
            this.needsUpdate = true;
            BlockPos pos = chunkRendererTmp.getOrigin().offset(8, 8, 8);
            boolean bl = isNear = pos.distSqr((Vec3i)viewPos) < 1024.0;
            if (!chunkRendererTmp.needsImmediateUpdate() && !isNear) {
                this.chunksToUpdate.add(chunkRendererTmp);
                continue;
            }
            profiler.push("update_now");
            this.profiler = profiler;
            this.renderDispatcher.updateChunkNow(chunkRendererTmp);
            chunkRendererTmp.clearNeedsUpdate();
            profiler.pop();
        }
        this.chunksToUpdate.addAll(set);
        if (Reference.DEBUG_MODE && !this.chunksToUpdate.isEmpty()) {
            Litematica.LOGGER.warn("[WorldRenderer] setupTerrain / chunksToUpdate: {}", (Object)this.chunksToUpdate.size());
        }
        this.clearWorldRenderStates();
        profiler.pop();
    }

    @Override
    public void updateChunks(long finishTimeNano, ProfilerFiller profiler) {
        this.profiler = profiler;
        profiler.push("run_chunk_uploads");
        this.needsUpdate |= this.renderDispatcher.runChunkUploads(finishTimeNano);
        if (this.profiler == null) {
            this.profiler = profiler;
        }
        profiler.popPush("check_updates");
        if (!this.chunksToUpdate.isEmpty()) {
            ChunkRendererSchematicVbo renderChunk;
            boolean immediate;
            boolean flag;
            Iterator<ChunkRendererSchematicVbo> iterator = this.chunksToUpdate.iterator();
            int index = 0;
            while (iterator.hasNext() && (flag = (immediate = (renderChunk = iterator.next()).needsImmediateUpdate()) ? this.renderDispatcher.updateChunkNow(renderChunk) : this.renderDispatcher.updateChunkLater(renderChunk))) {
                renderChunk.clearNeedsUpdate();
                iterator.remove();
                long i = finishTimeNano - System.nanoTime();
                if (i < 0L) break;
                ++index;
            }
            if (Reference.DEBUG_MODE && index > 0) {
                LOGGER.info("[WorldRenderer] updateChunks(): {} Chunks updated.", (Object)index);
            }
        }
        profiler.pop();
    }

    @Override
    public void capturePreMainValues(CameraRenderState camera, GpuBufferSlice fogBuffer, ProfilerFiller profiler) {
        this.vanillaFogBuffer = fogBuffer;
        this.profiler = profiler;
    }

    @Override
    public void uploadRemainingBuffers(long finishTimeNano, DeltaTracker deltaTracker, double cameraX, double cameraY, double cameraZ, ProfilerFiller profiler) {
        this.profiler = profiler;
        if (RenderSystem.isOnRenderThread()) {
            profiler.push("upload_remaining_buffers");
            this.needsUpdate |= this.renderDispatcher.runChunkUploads(finishTimeNano);
            profiler.pop();
        }
    }

    @Override
    public int prepareBlockLayers(Matrix4fc matrix4fc, double cameraX, double cameraY, double cameraZ, ProfilerFiller profiler) {
        this.profiler = profiler;
        profiler.push("layer_multi_phase");
        ArrayList<DynamicUniforms.Transform> transformValues = new ArrayList<DynamicUniforms.Transform>();
        EnumMap<ChunkSectionLayer, List<RenderPass.Draw<GpuBufferSlice[]>>> renderMap = new EnumMap<ChunkSectionLayer, List<RenderPass.Draw<GpuBufferSlice[]>>>(ChunkSectionLayer.class);
        for (ChunkSectionLayer layer : ChunkSectionLayer.values()) {
            renderMap.put(layer, new ArrayList());
        }
        profiler.popPush("layer_setup");
        int startIndex = 0;
        int stopIndex = this.renderInfos.size();
        int increment = 1;
        int indexCount = 0;
        int count = 0;
        boolean renderAsTranslucent = Configs.Visuals.RENDER_BLOCKS_AS_TRANSLUCENT.getBooleanValue();
        boolean renderCollidingBlocks = Configs.Visuals.RENDER_COLLIDING_SCHEMATIC_BLOCKS.getBooleanValue();
        GpuTextureView blockAtlas = this.mc.getTextureManager().getTexture(TextureAtlas.LOCATION_BLOCKS).getTextureView();
        int atlasWidth = blockAtlas.getWidth(0);
        int atlasHeight = blockAtlas.getHeight(0);
        Vector4f colorMod = new Vector4f(1.0f, 1.0f, 1.0f, 1.0f);
        Matrix4f texMatrix = new Matrix4f();
        if (renderAsTranslucent) {
            colorMod = new Vector4f(1.0f, 1.0f, 1.0f, (float)Configs.Visuals.GHOST_BLOCK_ALPHA.getDoubleValue());
        }
        boolean startedDrawing = false;
        profiler.popPush("layer_iteration");
        this.profiler = profiler;
        for (int i = startIndex; i != stopIndex; i += increment) {
            ChunkRendererSchematicVbo renderer = this.renderInfos.get(i);
            ChunkRenderDataSchematic data = renderer.getChunkRenderData();
            ChunkMeshDataSchematic chunkMeshData = data.getMeshDataCache();
            BlockPos chunkOrigin = renderer.getOrigin();
            ChunkPos chunkPos = renderer.getChunkPos();
            ChunkRenderGpuUploader gpuUploader = this.chunkRendererGpuDispatcher.addOrGetUploader(chunkPos.x(), chunkPos.z());
            for (ChunkSectionLayer layer : ChunkSectionLayer.values()) {
                IndexType indexType;
                GpuBuffer indexBuffer;
                ChunkRenderGpuBuffers buffers;
                profiler.popPush("layer_" + layer.label());
                if (data.isBlockLayerEmpty(layer) || (buffers = gpuUploader.buffersOrNull(layer)) == null || buffers.isClosed() || !chunkMeshData.hasMeshData(layer)) continue;
                if (buffers.getIndexBuffer() == null) {
                    if (buffers.getIndexCount() > indexCount) {
                        indexCount = buffers.getIndexCount();
                    }
                    indexBuffer = null;
                    indexType = null;
                } else {
                    indexBuffer = buffers.getIndexBuffer();
                    indexType = buffers.getIndexType();
                }
                int pos = transformValues.size();
                VertexFormat vf = layer.pipeline().getVertexFormatBinding(0);
                transformValues.add(new DynamicUniforms.Transform(matrix4fc, (Vector4fc)colorMod, (Vector3fc)new Vector3f((float)((double)chunkOrigin.getX() - cameraX), (float)((double)chunkOrigin.getY() - cameraY), (float)((double)chunkOrigin.getZ() - cameraZ)), (Matrix4fc)texMatrix));
                renderMap.get(layer).add((RenderPass.Draw<GpuBufferSlice[]>)new RenderPass.Draw(0, buffers.getVertexBuffer(), indexBuffer, indexType, 0, buffers.getIndexCount(), 0, (slices, uploader) -> uploader.upload("DynamicTransforms", slices[pos])));
                startedDrawing = true;
                ++count;
            }
        }
        if (startedDrawing) {
            profiler.popPush("fill_uniforms");
            this.getSchematicRenderState().chunkFixUniform.updateBuffer(atlasWidth, atlasHeight, 1.0f);
            GpuBufferSlice[] transformSlices = RenderSystem.getDynamicUniforms().writeTransforms(transformValues.toArray(new DynamicUniforms.Transform[0]));
            profiler.popPush("fill_batch_draw");
            this.getSchematicRenderState().batchDraw = new ChunkRenderBatchDraw(blockAtlas, renderMap, renderCollidingBlocks, renderAsTranslucent, indexCount, transformSlices, this.getSchematicRenderState().chunkFixUniform.getCurrentBufferSlice());
            this.shouldDraw = true;
        }
        profiler.pop();
        return count;
    }

    @Override
    public void drawBlockLayerGroup(ChunkSectionLayerGroup group, @Nullable GpuSampler sampler) {
        if (this.getSchematicRenderState().hasBatchDraw() && this.shouldDraw) {
            this.profiler.push("litematica_batch_draw_" + group.label());
            RenderSystem.setShaderFog((GpuBufferSlice)this.getEmptyFogBuffer());
            sampler = this.getGpuSampler();
            if (IrisCompat.isShaderActive() && !IrisRenderingFix.INSTANCE.wasWarned) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.shaders_on", (Object[])new Object[0]);
                IrisRenderingFix.INSTANCE.wasWarned = true;
            }
            this.getSchematicRenderState().getBatchDraw().draw(group, sampler, this.profiler);
            RenderSystem.setShaderFog((GpuBufferSlice)this.vanillaFogBuffer);
            this.profiler.pop();
        }
    }

    @Override
    public ChunkFixUniform getChunkFixUniform() {
        return this.getSchematicRenderState().chunkFixUniform;
    }

    @Override
    public void clearChunkFixUniform() {
        this.getSchematicRenderState().clearChunkFixUniform();
    }

    @Override
    public void clearWorldRenderStates() {
        this.getSchematicRenderState().clear();
    }

    @Override
    @Nullable
    public GpuSampler getGpuSampler() {
        if (this.gpuSampler == null && RenderSystem.isOnRenderThread()) {
            this.gpuSampler = RenderSystem.getDevice().createSampler(AddressMode.CLAMP_TO_EDGE, AddressMode.CLAMP_TO_EDGE, FilterMode.LINEAR, FilterMode.LINEAR, 1, OptionalDouble.empty());
        }
        return this.gpuSampler;
    }

    @Override
    public void closeGpuSampler() {
        if (this.gpuSampler != null) {
            this.gpuSampler.close();
        }
        this.gpuSampler = null;
    }

    @Override
    public void renderEntityDebugHitboxes(IEntityHitboxDebugRendererInvoker invoker, double cameraX, double cameraY, double cameraZ, DebugValueAccess debugValueAccess, Frustum frustum, float ticks) {
        if (this.hasWorld()) {
            for (Entity e : this.world.getEntities().getAll()) {
                if (e.isInvisible() || !frustum.isVisible(e.getBoundingBox()) || e == this.mc.getCameraEntity() && this.mc.options.getCameraType() == CameraType.FIRST_PERSON) continue;
                float entityTicks = this.mc.getDeltaTracker().getGameTimeDeltaPartialTick(true);
                invoker.litematica$addEntityHitbox(e, entityTicks, false);
                if (!SharedConstants.DEBUG_SHOW_LOCAL_SERVER_ENTITY_HIT_BOXES) continue;
                invoker.litematica$addEntityHitbox(e, entityTicks, true);
            }
        }
    }

    @Override
    public void updateCameraState(Camera camera, float tickProgress, CameraRenderState cameraState) {
        this.getSchematicRenderState().cameraState.initialized = cameraState.initialized;
        this.getSchematicRenderState().cameraState.blockPos = cameraState.blockPos;
        this.getSchematicRenderState().cameraState.pos = cameraState.pos;
        this.getSchematicRenderState().cameraState.xRot = cameraState.xRot;
        this.getSchematicRenderState().cameraState.yRot = cameraState.yRot;
        this.getSchematicRenderState().cameraState.orientation = cameraState.orientation;
        this.getSchematicRenderState().cameraState.isPanoramicMode = cameraState.isPanoramicMode;
        this.getSchematicRenderState().cameraState.cullFrustum = cameraState.cullFrustum;
        this.getSchematicRenderState().cameraState.fogType = cameraState.fogType;
        this.getSchematicRenderState().cameraState.fogData = cameraState.fogData;
        this.getSchematicRenderState().cameraState.hudFov = cameraState.hudFov;
        this.getSchematicRenderState().cameraState.depthFar = cameraState.depthFar;
        this.getSchematicRenderState().cameraState.projectionMatrix = cameraState.projectionMatrix;
        this.getSchematicRenderState().cameraState.viewRotationMatrix = cameraState.viewRotationMatrix;
        this.getSchematicRenderState().cameraState.entityRenderState = cameraState.entityRenderState;
    }

    @Override
    public void scheduleTranslucentSorting(Vec3 cameraPos, ProfilerFiller profiler) {
        double x = cameraPos.x();
        double y = cameraPos.y();
        double z = cameraPos.z();
        this.profiler = profiler;
        double diffX = x - this.lastTranslucentSortX;
        double diffY = y - this.lastTranslucentSortY;
        double diffZ = z - this.lastTranslucentSortZ;
        if (diffX * diffX + diffY * diffY + diffZ * diffZ > 1.0) {
            this.lastTranslucentSortX = x;
            this.lastTranslucentSortY = y;
            this.lastTranslucentSortZ = z;
            int h = 0;
            for (ChunkRendererSchematicVbo chunkRenderer : this.renderInfos) {
                if (!chunkRenderer.getChunkRenderData().isBlockLayerStarted(ChunkSectionLayer.TRANSLUCENT) && (chunkRenderer.getChunkRenderData().isEmpty() || !chunkRenderer.hasOverlay()) || h++ >= 15) continue;
                this.renderDispatcher.updateTransparencyLater(chunkRenderer);
            }
        }
    }

    @Override
    public void renderBlockOverlays(Camera camera, float lineWidth, ProfilerFiller profiler) {
        this.profiler = profiler;
        this.renderBlockOverlay(OverlayRenderType.OUTLINE, camera, lineWidth, profiler);
        this.renderBlockOverlay(OverlayRenderType.QUAD, camera, lineWidth, profiler);
    }

    protected void renderBlockOverlay(OverlayRenderType type, Camera camera, float lineWidth, ProfilerFiller profiler) {
        profiler.push("overlay_" + type.name());
        this.profiler = profiler;
        Vec3 cameraPos = camera.position();
        double x = cameraPos.x;
        double y = cameraPos.y;
        double z = cameraPos.z;
        boolean renderThrough = Configs.Visuals.SCHEMATIC_OVERLAY_RENDER_THROUGH.getBooleanValue() || Hotkeys.RENDER_OVERLAY_THROUGH_BLOCKS.getKeybind().isKeybindHeld();
        RenderPipeline pipeline = renderThrough ? type.renderThrough() : type.pipeline();
        float[] offset = new float[]{0.3f, 0.0f, 0.6f};
        Matrix4fStack matrix4fStack = RenderSystem.getModelViewStack();
        profiler.popPush("overlay_iterate");
        this.profiler = profiler;
        for (int i = this.renderInfos.size() - 1; i >= 0; --i) {
            ChunkRenderGpuBuffers buffers;
            ChunkRendererSchematicVbo renderer = this.renderInfos.get(i);
            if (renderer.getChunkRenderData().isEmpty() || !renderer.hasOverlay()) continue;
            ChunkRenderDataSchematic compiledChunk = renderer.getChunkRenderData();
            ChunkMeshDataSchematic chunkMeshData = compiledChunk.getMeshDataCache();
            BlockPos chunkOrigin = renderer.getOrigin();
            ChunkPos cp = renderer.getChunkPos();
            ChunkRenderGpuUploader gpuUploader = this.chunkRendererGpuDispatcher.addOrGetUploader(cp.x(), cp.z());
            if (compiledChunk.isOverlayTypeEmpty(type) || (buffers = gpuUploader.buffersOrNull(type)) == null || buffers.isClosed() || !chunkMeshData.hasMeshData(type)) continue;
            matrix4fStack.pushMatrix();
            matrix4fStack.translate((float)((double)chunkOrigin.getX() - x), (float)((double)chunkOrigin.getY() - y), (float)((double)chunkOrigin.getZ() - z));
            this.drawOverlayInternal(type, pipeline, buffers, -1, offset, false, false);
            matrix4fStack.popMatrix();
        }
        profiler.pop();
    }

    @Override
    public boolean renderBlock(BlockModelRendererSchematic renderer, BlockAndTintGetter world, BlockState state, BlockPos pos, Vec3 offset, IBlockOutputSchematic output) {
        try {
            this.getProfiler().push("render_block");
            BlockStateModel model = this.getModelForState(state);
            boolean result = model != null ? renderer.tessellateBlock(world, state, pos, offset, model, state.getSeed(pos), output) : false;
            this.getProfiler().pop();
            return result;
        }
        catch (Throwable e) {
            LOGGER.error("renderBlock(): Exception rendering block at pos {} [{}]; {}", (Object)pos.toShortString(), (Object)state.toString(), (Object)e.getLocalizedMessage());
            return false;
        }
    }

    @Override
    public boolean renderFluid(FluidModelRendererSchematic renderer, BlockAndTintGetter world, BlockState blockState, FluidState fluidState, BlockPos pos, FluidRenderer.Output output, float offsetY) {
        try {
            this.getProfiler().push("render_fluid");
            FluidModel model = BlockModelCacheSchematic.INSTANCE.fetchFluidModel(fluidState);
            if (model != null) {
                renderer.setYOffset(offsetY);
                renderer.tesselate(world, pos, output, blockState, fluidState);
                return true;
            }
            this.getProfiler().pop();
        }
        catch (Throwable e) {
            LOGGER.error("renderFluid(): Exception rendering fluid at pos {} [{}]; {}", (Object)pos.toShortString(), (Object)fluidState.toString(), (Object)e.getLocalizedMessage());
        }
        return false;
    }

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    private void drawOverlayInternal(OverlayRenderType type, RenderPipeline pipeline, ChunkRenderGpuBuffers buffers, int color, float[] offset, boolean useColor, boolean useOffset) throws RuntimeException {
        IndexType indexType;
        GpuBuffer indexBuffer;
        if (!RenderSystem.isOnRenderThread()) return;
        Vector4f colorMod = new Vector4f(1.0f, 1.0f, 1.0f, 1.0f);
        Vector3f modelOffset = new Vector3f();
        Matrix4f texMatrix = new Matrix4f();
        if (useOffset) {
            modelOffset.set(offset);
        }
        if (useColor) {
            float[] rgba = new float[]{ARGB.redFloat((int)color), ARGB.greenFloat((int)color), ARGB.blueFloat((int)color), ARGB.alphaFloat((int)color)};
            colorMod.set(rgba);
        }
        RenderTarget mainFb = RenderUtils.mainTarget();
        GpuTextureView texture1 = mainFb.getColorTextureView();
        GpuTextureView texture2 = mainFb.useDepth ? mainFb.getDepthTextureView() : null;
        RenderSystem.AutoStorageIndexBuffer shapeIndexBuffer = RenderSystem.getSequentialBuffer((PrimitiveTopology)type.topology());
        if (buffers.getIndexBuffer() == null) {
            if (buffers.getIndexCount() <= 0) {
                LOGGER.error("WorldRendererSchematic#drawInternal() [{}] --> setup IndexBuffer --> NO INDEX COUNT!", (Object)buffers.getName());
                return;
            }
            indexBuffer = shapeIndexBuffer.getBuffer(buffers.getIndexCount());
            indexType = shapeIndexBuffer.type();
        } else {
            indexBuffer = buffers.getIndexBuffer();
            indexType = buffers.getIndexType();
        }
        GpuBufferSlice gpuSlice = RenderSystem.getDynamicUniforms().writeTransform(RenderSystem.getModelViewMatrixCopy(), colorMod, modelOffset, texMatrix);
        try (RenderPass pass = RenderSystem.getDevice().createCommandEncoder().createRenderPass(() -> "litematica:drawInternal/schematic_overlay", texture1, Optional.empty(), texture2, OptionalDouble.empty());){
            pass.setPipeline(pipeline);
            RenderSystem.bindDefaultUniforms((RenderPass)pass);
            pass.setUniform("DynamicTransforms", gpuSlice);
            pass.setVertexBuffer(0, buffers.getVertexBuffer().slice());
            pass.setIndexBuffer(indexBuffer, indexType);
            pass.drawIndexed(buffers.getIndexCount(), 1, 0, 0, 0);
            return;
        }
    }

    @Override
    @Nullable
    public BlockStateModel getModelForState(BlockState state) {
        return BlockModelCacheSchematic.INSTANCE.fetchBlockStateModel(state);
    }

    @Override
    public List<BlockStateModelPart> getModelParts(BlockPos pos, BlockState state, RandomSource rand) {
        ArrayList<BlockStateModelPart> parts = new ArrayList<BlockStateModelPart>();
        BlockStateModel model = this.getModelForState(state);
        if (model != null) {
            model.collectParts(rand, parts);
            if (parts.isEmpty() && (model = this.getModelForState(this.getFallbackState(state))) != null) {
                model.collectParts(rand, parts);
            }
            if (parts.isEmpty()) {
                model = this.getModelForState(state.getBlock().defaultBlockState());
                if (model != null) {
                    model.collectParts(rand, parts);
                }
                LOGGER.warn("getModelParts: Invalid Block Model for block at [{}] with state [{}]; Attempting to reset to default.", (Object)pos.toShortString(), (Object)state.toString());
            }
        }
        return parts;
    }

    @Override
    public void prepareEntities(Camera camera, Frustum frustum, LevelRenderState renderStates, DeltaTracker tickCounter, ProfilerFiller profiler) {
        this.profiler = profiler;
        if (this.renderEntitiesStartupCounter > 0) {
            --this.renderEntitiesStartupCounter;
        } else {
            profiler.push("entities_prepare");
            double cameraX = camera.position().x;
            double cameraY = camera.position().y;
            double cameraZ = camera.position().z;
            this.getEntityRenderer().prepare(camera, this.mc.crosshairPickEntity);
            this.countEntitiesTotal = 0;
            this.countEntitiesRendered = 0;
            this.countEntitiesHidden = 0;
            this.countEntitiesTotal = this.world.getRegularEntityCount();
            this.renderedEntities.clear();
            LayerRange layerRange = DataManager.getRenderLayerRange();
            profiler.popPush("entities_iterate");
            this.getSchematicRenderState().entityStates.clear();
            for (ChunkRendererSchematicVbo chunkRenderer : this.renderInfos) {
                BlockPos pos = chunkRenderer.getOrigin();
                ChunkPos chunkPos = chunkRenderer.getChunkPos();
                ChunkSchematic chunk = this.world.getChunkSource().getChunkIfExists(chunkPos.x(), chunkPos.z());
                if (chunk == null || chunk.isEmpty() || !DataManager.getSchematicPlacementManager().checkIfChunkShouldRender(chunkPos.x(), chunkPos.z())) continue;
                AABB bb = chunkRenderer.getBoundingBox();
                ImmutableList<Entity> list = this.world.getEntitiesByChunk(chunkPos.x(), chunkPos.z(), fi.dy.masa.litematica.util.EntityUtils.NOT_PLAYER);
                for (Entity entityTmp : list) {
                    BlockState state;
                    boolean shouldRender;
                    if (this.renderedEntities.containsKey(entityTmp.position()) && this.renderedEntities.get(entityTmp.position()).equals(entityTmp.getUUID()) || !layerRange.isPositionWithinRange(MathUtils.floor((double)entityTmp.getX()), MathUtils.floor((double)entityTmp.getY()), MathUtils.floor((double)entityTmp.getZ()))) continue;
                    float tickProgress = tickCounter.getGameTimeDeltaPartialTick(false);
                    if (entityTmp instanceof Avatar) {
                        EntityRenderState state2;
                        Avatar avatar = (Avatar)entityTmp;
                        if (avatar.getType().equals(EntityTypes.MANNEQUIN)) {
                            try {
                                ClientMannequin cm = (ClientMannequin)avatar;
                                ((IAvatarInvoker)cm).litematica$tryUpdateSkin();
                                state2 = ((IEntityRendererInvoker)this.getEntityRenderer()).litematica_getRenderStateNullSafe(cm, tickProgress);
                                if (state2 == null || !(shouldRender = ((IEntityRendererInvoker)this.getEntityRenderer()).litematica_shouldRender(cm, frustum, cameraX, cameraY, cameraZ))) continue;
                                this.getSchematicRenderState().entityStates.add(state2);
                                this.renderedEntities.put(cm.position(), cm.getUUID());
                                ++this.countEntitiesRendered;
                            }
                            catch (Exception ex) {
                                LOGGER.error("Exception rendering Mannequin [{}]; {}", (Object)avatar.getClass().getName(), (Object)ex.getLocalizedMessage());
                            }
                            continue;
                        }
                        if (!avatar.getType().equals(EntityTypes.PLAYER)) continue;
                        try {
                            AbstractClientPlayer acp = (AbstractClientPlayer)avatar;
                            state2 = ((IEntityRendererInvoker)this.getEntityRenderer()).litematica_getRenderStateNullSafe(acp, tickProgress);
                            if (state2 == null || !(shouldRender = ((IEntityRendererInvoker)this.getEntityRenderer()).litematica_shouldRender(acp, frustum, cameraX, cameraY, cameraZ))) continue;
                            this.getSchematicRenderState().entityStates.add(state2);
                            this.renderedEntities.put(acp.position(), acp.getUUID());
                            ++this.countEntitiesRendered;
                        }
                        catch (Exception ex) {
                            LOGGER.error("Exception rendering Player [{}]; {}", (Object)avatar.getClass().getName(), (Object)ex.getLocalizedMessage());
                        }
                        continue;
                    }
                    shouldRender = entityTmp instanceof EnderDragon || entityTmp instanceof EnderDragonPart ? true : ((IEntityRendererInvoker)this.getEntityRenderer()).litematica_shouldRender(entityTmp, frustum, cameraX, cameraY, cameraZ);
                    if (!shouldRender) continue;
                    if (entityTmp instanceof Salmon || entityTmp instanceof Cod || entityTmp instanceof Tadpole || entityTmp instanceof AbstractHorse || entityTmp instanceof TropicalFish || entityTmp instanceof AgeableWaterCreature) {
                        Fluid fluid;
                        state = this.world.getBlockState(entityTmp.blockPosition());
                        Fluid fluid2 = fluid = state.getFluidState() != null ? state.getFluidState().getType() : Fluids.EMPTY;
                        if (!(fluid != Fluids.WATER && fluid != Fluids.FLOWING_WATER || ((IMixinEntity)entityTmp).litematica_isTouchingWater())) {
                            ((IEntityInvoker)entityTmp).litematica$toggleTouchingWater(true);
                        }
                    }
                    state = this.getEntityRenderer().extractEntity(entityTmp, tickProgress);
                    this.getSchematicRenderState().entityStates.add((EntityRenderState)state);
                    this.renderedEntities.put(entityTmp.position(), entityTmp.getUUID());
                    ++this.countEntitiesRendered;
                }
            }
            profiler.pop();
        }
    }

    @Override
    public void renderEntities(Camera camera, Frustum frustum, PoseStack matrices, LevelRenderState renderStates, SubmitNodeCollector queue, ProfilerFiller profiler) {
        if (this.getSchematicRenderState().entityStates.isEmpty()) {
            return;
        }
        Vec3 pos = camera.position();
        double cameraX = pos.x();
        double cameraY = pos.y();
        double cameraZ = pos.z();
        profiler.push("render_entities");
        for (EntityRenderState state : this.getSchematicRenderState().entityStates) {
            if (state == null) continue;
            this.getEntityRenderer().submit(state, this.getSchematicRenderState().cameraState, state.x - cameraX, state.y - cameraY, state.z - cameraZ, matrices, queue);
        }
        profiler.pop();
    }

    @Override
    public void prepareBlockEntities(Camera camera, Frustum frustum, LevelRenderState renderStates, PoseStack matrices, float tickProgress, ProfilerFiller profiler) {
        this.profiler = profiler;
        profiler.push("block_entities_prepare");
        double cameraX = camera.position().x;
        double cameraY = camera.position().y;
        double cameraZ = camera.position().z;
        this.getBlockEntityRenderer().prepare(camera.position());
        LayerRange layerRange = DataManager.getRenderLayerRange();
        this.profiler = profiler;
        this.getSchematicRenderState().blockEntityStates.clear();
        profiler.popPush("block_entities_iteration");
        for (ChunkRendererSchematicVbo chunkRenderer : this.renderInfos) {
            BlockEntityRenderState state;
            BlockPos pos;
            ChunkPos chunkPos = chunkRenderer.getChunkPos();
            ChunkSchematic chunk = this.world.getChunkSource().getChunkForLighting(chunkPos.x(), chunkPos.z());
            if (chunk == null || chunk.isEmpty() || !DataManager.getSchematicPlacementManager().checkIfChunkShouldRender(chunkPos.x(), chunkPos.z())) continue;
            ChunkRenderDataSchematic data = chunkRenderer.getChunkRenderData();
            if (!chunk.getState().atLeast(ChunkSchematicState.LOADED) || data.getTimeBuilt() < chunk.getTimeCreated()) continue;
            ChunkMeshDataSchematic chunkMeshData = data.getMeshDataCache();
            List<BlockEntity> tiles = chunkMeshData.getBlockEntities();
            List<BlockEntity> noCullTiles = chunkMeshData.getNoCullBlockEntities();
            if (!tiles.isEmpty()) {
                for (BlockEntity te : tiles) {
                    pos = te.getBlockPos();
                    if (!layerRange.isPositionWithinRange(pos.getX(), pos.getY(), pos.getZ())) continue;
                    try {
                        matrices.pushPose();
                        matrices.translate((double)pos.getX() - cameraX, (double)pos.getY() - cameraY, (double)pos.getZ() - cameraZ);
                        state = this.getBlockEntityRenderer().tryExtractRenderState(te, tickProgress, null, false);
                        this.getSchematicRenderState().blockEntityStates.add(state);
                        matrices.popPose();
                    }
                    catch (Exception err) {
                        LOGGER.error("[Pass 1] Error rendering blockEntities; Exception: {}", (Object)err.getLocalizedMessage());
                    }
                }
            }
            if (noCullTiles.isEmpty()) continue;
            for (BlockEntity te : noCullTiles) {
                pos = te.getBlockPos();
                if (!layerRange.isPositionWithinRange(pos.getX(), pos.getY(), pos.getZ())) continue;
                try {
                    matrices.pushPose();
                    matrices.translate((double)pos.getX() - cameraX, (double)pos.getY() - cameraY, (double)pos.getZ() - cameraZ);
                    state = this.getBlockEntityRenderer().tryExtractRenderState(te, tickProgress, null, true);
                    this.getSchematicRenderState().blockEntityStates.add(state);
                    matrices.popPose();
                }
                catch (Exception err) {
                    LOGGER.error("[Pass 2] Error rendering blockEntities; Exception: {}", (Object)err.getLocalizedMessage());
                }
            }
        }
        profiler.pop();
    }

    @Override
    public void renderBlockEntities(Camera camera, Frustum frustum, PoseStack matrices, LevelRenderState renderStates, SubmitNodeCollector queue, ProfilerFiller profiler) {
        if (this.getSchematicRenderState().blockEntityStates.isEmpty()) {
            return;
        }
        Vec3 cameraPos = camera.position();
        double cameraX = cameraPos.x();
        double cameraY = cameraPos.y();
        double cameraZ = cameraPos.z();
        profiler.push("render_block_entities");
        for (BlockEntityRenderState state : this.getSchematicRenderState().blockEntityStates) {
            if (state == null) continue;
            BlockPos pos = state.blockPos;
            matrices.pushPose();
            matrices.translate((double)pos.getX() - cameraX, (double)pos.getY() - cameraY, (double)pos.getZ() - cameraZ);
            this.getBlockEntityRenderer().submit(state, matrices, queue, this.getSchematicRenderState().cameraState);
            matrices.popPose();
        }
        profiler.pop();
    }

    @Override
    public void scheduleChunkRenders(int chunkX, int chunkZ, boolean immediate) {
        if (Configs.Visuals.ENABLE_RENDERING.getBooleanValue() && Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue()) {
            this.chunkRendererDispatcher.scheduleChunkRender(chunkX, chunkZ, immediate);
        }
    }

    @Override
    public ChunkSchematicState getChunkSchematicState(int chunkX, int chunkZ) {
        if (this.hasWorld()) {
            return this.world.getChunkSource().getChunkState(chunkX, chunkZ);
        }
        return ChunkSchematicState.NO_WORLD_EXCEPTION;
    }

    @Override
    public void setChunkSchematicState(int chunkX, int chunkZ, ChunkSchematicState state) {
        if (this.hasWorld()) {
            this.world.getChunkSource().setChunkState(chunkX, chunkZ, state);
        }
    }

    @Override
    public void reloadBlockRenderManager() {
        BlockModelCacheSchematic.INSTANCE.onReloadResources();
    }
}

