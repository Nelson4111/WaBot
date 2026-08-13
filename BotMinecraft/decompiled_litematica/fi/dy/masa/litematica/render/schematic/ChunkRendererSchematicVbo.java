/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.BufferBuilder
 *  com.mojang.blaze3d.vertex.ByteBufferBuilder
 *  com.mojang.blaze3d.vertex.MeshData
 *  com.mojang.blaze3d.vertex.MeshData$SortState
 *  com.mojang.blaze3d.vertex.VertexSorting
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.renderer.block.FluidRenderer$Output
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.renderer.blockentity.BlockEntityRenderer
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.client.renderer.chunk.VisGraph
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Vec3i
 *  net.minecraft.tags.BlockTags
 *  net.minecraft.util.RandomSource
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.EntityBlock
 *  net.minecraft.world.level.block.RenderShape
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.chunk.LevelChunk$EntityCreationType
 *  net.minecraft.world.level.material.FluidState
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  net.minecraft.world.phys.shapes.VoxelShape
 *  org.apache.logging.log4j.Logger
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.vertex.BufferBuilder;
import com.mojang.blaze3d.vertex.ByteBufferBuilder;
import com.mojang.blaze3d.vertex.MeshData;
import com.mojang.blaze3d.vertex.VertexSorting;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.RenderUtils;
import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.litematica.render.schematic.BlockModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkCacheSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkMeshDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDataSchematic;
import fi.dy.masa.litematica.render.schematic.ChunkRenderDispatcherBuffers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderLayers;
import fi.dy.masa.litematica.render.schematic.ChunkRenderTaskSchematic;
import fi.dy.masa.litematica.render.schematic.FluidModelRendererSchematic;
import fi.dy.masa.litematica.render.schematic.IBlockOutputSchematic;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.util.IgnoreBlockRegistry;
import fi.dy.masa.litematica.util.OverlayType;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.EntityUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.block.FluidRenderer;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.renderer.blockentity.BlockEntityRenderer;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.client.renderer.chunk.VisGraph;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.RandomSource;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.EntityBlock;
import net.minecraft.world.level.block.RenderShape;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.phys.shapes.VoxelShape;
import org.apache.logging.log4j.Logger;

public class ChunkRendererSchematicVbo
implements AutoCloseable {
    private static final Logger LOGGER = Litematica.LOGGER;
    protected static int schematicRenderChunksUpdated;
    protected volatile WorldSchematic world;
    protected final IWorldSchematicRenderer worldRenderer;
    private final RandomSource rand;
    protected final ReentrantLock chunkRenderLock;
    protected final ReentrantLock chunkRenderDataLock;
    protected ProfilerFiller profiler;
    protected final BlockPos.MutableBlockPos position;
    protected final BlockPos.MutableBlockPos chunkRelativePos;
    protected ChunkPos chunkPosition;
    protected final List<IntBoundingBox> boxes;
    protected final EnumSet<OverlayRenderType> existingOverlays;
    private AABB boundingBox;
    protected Color4f overlayColor;
    protected boolean hasOverlay;
    private boolean ignoreClientWorldFluids;
    private IgnoreBlockRegistry ignoreBlockRegistry;
    protected ChunkCacheSchematic schematicWorldView;
    protected ChunkCacheSchematic clientWorldView;
    protected volatile ChunkRenderTaskSchematic compileTask;
    protected volatile ChunkRenderDataSchematic chunkRenderData;
    private boolean needsUpdate;
    private boolean needsImmediateUpdate;

    protected ChunkRendererSchematicVbo(WorldSchematic world, IWorldSchematicRenderer worldRenderer) {
        this.world = world;
        this.worldRenderer = worldRenderer;
        this.rand = RandomSource.create();
        this.chunkRenderData = new ChunkRenderDataSchematic();
        this.chunkRenderLock = new ReentrantLock();
        this.chunkRenderDataLock = new ReentrantLock();
        this.position = new BlockPos.MutableBlockPos();
        this.chunkRelativePos = new BlockPos.MutableBlockPos();
        this.boxes = new ArrayList<IntBoundingBox>();
        this.existingOverlays = EnumSet.noneOf(OverlayRenderType.class);
        this.hasOverlay = false;
    }

    public boolean hasOverlay() {
        return this.hasOverlay;
    }

    public boolean isEmpty() {
        return this.boxes.isEmpty() && this.getPartsCount() == 0;
    }

    protected ProfilerFiller getProfiler() {
        if (this.profiler == null) {
            this.profiler = this.worldRenderer.getProfiler();
        }
        return this.profiler;
    }

    public EnumSet<OverlayRenderType> getOverlayTypes() {
        return this.existingOverlays;
    }

    protected ChunkRenderDataSchematic getChunkRenderData() {
        return this.chunkRenderData;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void updateChunkRenderData(ChunkRenderDataSchematic data) {
        this.chunkRenderDataLock.lock();
        try {
            if (this.chunkRenderData != null && !this.chunkRenderData.isEmpty()) {
                ChunkMeshDataSchematic oldData;
                int comparator = ChunkRenderDataSchematic.COMPARATOR.compare(this.chunkRenderData, data);
                ChunkMeshDataSchematic oldMeshDataCache = this.chunkRenderData.getMeshDataCache();
                if (comparator > 0) {
                    this.chunkRenderData.clearAll();
                    this.chunkRenderData = data;
                }
                if (!oldMeshDataCache.isEmpty() && (oldData = this.chunkRenderData.updateMeshDataCache(oldMeshDataCache)) != null) {
                    oldData.clearAll();
                }
            } else {
                this.chunkRenderData = data;
            }
        }
        finally {
            this.chunkRenderDataLock.unlock();
        }
    }

    public BlockPos getOrigin() {
        return this.position;
    }

    protected ChunkPos getChunkPos() {
        if (this.chunkPosition == null) {
            this.chunkPosition = ChunkPos.containing((BlockPos)this.position.immutable());
        }
        return this.chunkPosition;
    }

    public AABB getBoundingBox() {
        if (this.boundingBox == null) {
            int x = this.position.getX();
            int y = this.position.getY();
            int z = this.position.getZ();
            this.boundingBox = new AABB((double)x, (double)y, (double)z, (double)(x + 16), (double)(y + this.world.getHeight()), (double)(z + 16));
        }
        return this.boundingBox;
    }

    protected void setPosition(int x, int y, int z) {
        if (x != this.position.getX() || y != this.position.getY() || z != this.position.getZ()) {
            this.clear();
            this.boundingBox = null;
            this.chunkPosition = null;
            this.position.set(x, y, z);
        }
    }

    protected void setChunkPosition(int chunkX, int chunkZ) {
        this.chunkPosition = new ChunkPos(chunkX, chunkZ);
    }

    protected double getDistanceSq() {
        Entity entity = EntityUtils.getCameraEntity();
        if (entity == null) {
            return 0.0;
        }
        double x = (double)this.position.getX() + 8.0 - entity.getX();
        double z = (double)this.position.getZ() + 8.0 - entity.getZ();
        return x * x + z * z;
    }

    protected void deleteGlResources() {
        this.clear();
    }

    protected void resortTransparency(ChunkRenderTaskSchematic task, ChunkRenderDispatcherBuffers pack) {
        boolean resortOverlay;
        this.getProfiler().push("resort_task");
        ChunkRenderDataSchematic data = task.getChunkRenderData();
        Vec3 cameraPos = task.getCameraPosSupplier().get();
        ChunkSectionLayer layerTranslucent = ChunkSectionLayer.TRANSLUCENT;
        ChunkMeshDataSchematic chunkMeshData = data.getMeshDataCache();
        float x = (float)cameraPos.x - (float)this.position.getX();
        float y = (float)cameraPos.y - (float)this.position.getY();
        float z = (float)cameraPos.z - (float)this.position.getZ();
        boolean resortBlocks = Configs.Visuals.RENDER_ENABLE_TRANSLUCENT_RESORTING.getBooleanValue();
        if (!data.isBlockLayerEmpty(layerTranslucent) && resortBlocks) {
            this.getProfiler().popPush("resort_blocks");
            if (chunkMeshData.hasMeshData(layerTranslucent)) {
                try {
                    this.resortRenderBlocks(layerTranslucent, x, y, z, data, chunkMeshData, pack);
                    ChunkMeshDataSchematic oldData = data.updateMeshDataCache(chunkMeshData);
                    if (oldData != null) {
                        oldData.clearAll();
                    }
                }
                catch (Exception e) {
                    LOGGER.error("resortTransparency() [VBO] caught exception for layer [{}] // {}", (Object)layerTranslucent.label(), (Object)e.getLocalizedMessage());
                }
            }
        }
        if (Configs.Visuals.ENABLE_SCHEMATIC_OVERLAY.getBooleanValue()) {
            // empty if block
        }
        if (resortOverlay = false) {
            this.getProfiler().popPush("resort_overlay");
            OverlayRenderType type = OverlayRenderType.QUAD;
            if (!data.isOverlayTypeEmpty(type) && chunkMeshData.hasMeshData(type)) {
                try {
                    this.resortRenderOverlay(type, x, y, z, data, chunkMeshData, pack);
                    ChunkMeshDataSchematic oldData = data.updateMeshDataCache(chunkMeshData);
                    if (oldData != null) {
                        oldData.clearAll();
                    }
                }
                catch (Exception e) {
                    LOGGER.error("resortTransparency() [VBO] caught exception for overlay type [{}] // {}", (Object)type.name(), (Object)e.getLocalizedMessage());
                }
            }
        }
        this.getProfiler().pop();
        this.profiler = null;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void rebuildChunk(ChunkRenderTaskSchematic task, ChunkRenderDispatcherBuffers pack) {
        this.getProfiler().push("rebuild_chunk");
        ChunkRenderDataSchematic data = new ChunkRenderDataSchematic();
        task.getLock().lock();
        try {
            if (task.getStatus() != ChunkRenderTaskSchematic.Status.COMPILING) {
                return;
            }
            if (task.getChunkRenderData() != null) {
                task.getChunkRenderData().clearAll();
            }
            task.updateChunkRenderData(data);
        }
        finally {
            task.getLock().unlock();
        }
        pack.builderCache().clearAll();
        BlockPos.MutableBlockPos posChunk = this.position;
        LayerRange range = DataManager.getRenderLayerRange();
        ChunkMeshDataSchematic chunkMeshData = new ChunkMeshDataSchematic();
        if (!pack.allocatorCache().isClear()) {
            pack.allocatorCache().resetAll();
        }
        chunkMeshData.clearTileCache();
        this.existingOverlays.clear();
        this.hasOverlay = false;
        this.getProfiler().popPush("rebuild_chunk_start");
        List<IntBoundingBox> list = this.boxes;
        synchronized (list) {
            int minX = posChunk.getX();
            int minY = posChunk.getY();
            int minZ = posChunk.getZ();
            int maxX = minX + 15;
            int maxY = minY + this.world.getHeight();
            int maxZ = minZ + 15;
            if (!(this.boxes.isEmpty() || this.schematicWorldView.isEmpty() && this.clientWorldView.isEmpty() || !range.intersectsBox(minX, minY, minZ, maxX, maxY, maxZ))) {
                ++schematicRenderChunksUpdated;
                Vec3 cameraPos = task.getCameraPosSupplier().get();
                float x = (float)cameraPos.x - (float)this.position.getX();
                float y = (float)cameraPos.y - (float)this.position.getY();
                float z = (float)cameraPos.z - (float)this.position.getZ();
                int bottomY = this.position.getY();
                this.getProfiler().popPush("rebuild_chunk_boxes");
                IBlockOutputSchematic blockOutput = (bx, by, bz, quad, inst) -> {
                    boolean translucent = Configs.Visuals.RENDER_BLOCKS_AS_TRANSLUCENT.getBooleanValue();
                    ChunkSectionLayer layer = translucent ? ChunkSectionLayer.TRANSLUCENT : quad.materialInfo().layer();
                    BufferBuilder builder = this.preRenderBlocks(pack, layer);
                    if (!data.isBlockLayerStarted(layer)) {
                        data.setBlockLayerStarted(layer);
                    }
                    builder.putBlockBakedQuad(bx, by, bz, quad, inst);
                };
                VisGraph visGraph = new VisGraph();
                BlockModelRendererSchematic blockRenderer = new BlockModelRendererSchematic();
                FluidModelRendererSchematic fluidRenderer = new FluidModelRendererSchematic(BlockModelCacheSchematic.INSTANCE.fluidStateModelSet());
                blockRenderer.toggleAO(true);
                blockRenderer.toggleCulling(true);
                blockRenderer.reload();
                blockRenderer.enableCache();
                for (IntBoundingBox box : this.boxes) {
                    if ((box = range.getClampedRenderBoundingBox(box)) == null) continue;
                    BlockPos posFrom = new BlockPos(box.minX(), box.minY(), box.minZ());
                    BlockPos posTo = new BlockPos(box.maxX(), box.maxY(), box.maxZ());
                    for (BlockPos posMutable : BlockPos.MutableBlockPos.betweenClosed((BlockPos)posFrom, (BlockPos)posTo)) {
                        Vec3 offset = new Vec3((double)(posMutable.getX() & 0xF), (double)(posMutable.getY() - bottomY), (double)(posMutable.getZ() & 0xF));
                        this.renderBlocksAndOverlay(blockRenderer, fluidRenderer, posMutable, data, chunkMeshData, pack, blockOutput, offset, visGraph);
                    }
                }
                blockRenderer.disableCache();
                HashSet<ChunkSectionLayer> usedBlockLayers = new HashSet<ChunkSectionLayer>();
                this.getProfiler().popPush("rebuild_chunk_layers");
                for (ChunkSectionLayer layerTmp : ChunkRenderLayers.BLOCK_RENDER_LAYERS) {
                    if (!data.isBlockLayerStarted(layerTmp)) continue;
                    try {
                        data.setBlockLayerUsed(layerTmp);
                        usedBlockLayers.add(layerTmp);
                        this.postRenderBlocks(layerTmp, x, y, z, data, chunkMeshData, pack);
                    }
                    catch (Exception e) {
                        LOGGER.error("rebuildChunk() [VBO] failed to postRenderBlocks() for layer [{}] --> {}", (Object)layerTmp.label(), (Object)e.toString());
                    }
                }
                if (this.hasOverlay) {
                    this.getProfiler().popPush("rebuild_chunk_overlays");
                    for (OverlayRenderType type : this.existingOverlays) {
                        if (!data.isOverlayTypeStarted(type)) continue;
                        try {
                            data.setOverlayTypeUsed(type);
                            this.postRenderOverlay(type, x, y, z, data, chunkMeshData, pack);
                        }
                        catch (Exception e) {
                            LOGGER.error("rebuildChunk() [VBO] failed to postRenderOverlay() for overlay type [{}] --> {}", (Object)type.name(), (Object)e.toString());
                        }
                    }
                }
                chunkMeshData.updateVisibility(visGraph);
                chunkMeshData.compileLayerDrawStates(usedBlockLayers);
                chunkMeshData.compileOverlayDrawStates(this.existingOverlays);
            }
        }
        this.getProfiler().pop();
        this.profiler = null;
        this.chunkRenderDataLock.lock();
        try {
            ChunkMeshDataSchematic oldData;
            chunkMeshData.setTimeBuilt(this.world.getGameTime());
            data.setTimeBuilt(this.world.getGameTime());
            if (!chunkMeshData.isEmpty() && (oldData = data.updateMeshDataCache(chunkMeshData)) != null) {
                oldData.clearAll();
            }
        }
        finally {
            this.updateChunkRenderData(data);
            this.chunkRenderDataLock.unlock();
        }
        if (this.worldRenderer.getChunkSchematicState(this.chunkPosition.x(), this.chunkPosition.z()).atLeast(ChunkSchematicState.RENDERED)) {
            this.worldRenderer.setChunkSchematicState(this.chunkPosition.x(), this.chunkPosition.z(), ChunkSchematicState.RENDERED);
        }
    }

    protected void renderBlocksAndOverlay(BlockModelRendererSchematic blockRenderer, FluidModelRendererSchematic fluidRenderer, BlockPos pos, @Nonnull ChunkRenderDataSchematic data, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack, IBlockOutputSchematic blockOutput, Vec3 offset, VisGraph visGraph) {
        BlockState stateSchematic = this.schematicWorldView.getBlockState(pos);
        BlockState stateClient = this.clientWorldView.getBlockState(pos);
        boolean clientHasAir = stateClient.isAir();
        boolean schematicHasAir = stateSchematic.isAir();
        boolean missing = false;
        if (clientHasAir && schematicHasAir) {
            return;
        }
        this.getProfiler().push("render_build");
        this.overlayColor = null;
        if (clientHasAir || stateSchematic != stateClient && Configs.Visuals.RENDER_COLLIDING_SCHEMATIC_BLOCKS.getBooleanValue()) {
            FluidState fluidState;
            boolean hasTE = stateSchematic.hasBlockEntity();
            if (stateSchematic.isSolidRender()) {
                visGraph.setOpaque(pos);
            }
            if (hasTE) {
                this.addBlockEntity(stateSchematic, pos, chunkMeshData);
            }
            if (!(fluidState = stateSchematic.getFluidState()).isEmpty() && Configs.Visuals.ENABLE_SCHEMATIC_FLUIDS.getBooleanValue()) {
                this.getProfiler().popPush("render_build_fluids");
                int offsetY = (pos.getY() >> 4 << 4) - this.position.getY();
                FluidRenderer.Output fluidOutput = fluidLayer -> {
                    BufferBuilder builder = this.preRenderBlocks(pack, fluidLayer);
                    if (!data.isBlockLayerStarted(fluidLayer)) {
                        data.setBlockLayerStarted(fluidLayer);
                    }
                    return builder;
                };
                this.worldRenderer.renderFluid(fluidRenderer, this.schematicWorldView, stateSchematic, fluidState, pos, fluidOutput, offsetY);
            }
            if (stateSchematic.getRenderShape() == RenderShape.MODEL) {
                this.getProfiler().popPush("render_build_blocks");
                this.worldRenderer.renderBlock(blockRenderer, this.schematicWorldView, stateSchematic, pos, offset, blockOutput);
                if (clientHasAir) {
                    missing = true;
                }
            }
        }
        if (Configs.Visuals.ENABLE_SCHEMATIC_OVERLAY.getBooleanValue()) {
            this.getProfiler().popPush("render_build_overlays");
            OverlayType type = this.getOverlayType(stateSchematic, stateClient);
            this.overlayColor = ChunkRendererSchematicVbo.getOverlayColor(type);
            if (this.overlayColor != null) {
                if (this.shouldCullOverlayPos(pos, stateSchematic, stateClient)) {
                    this.getProfiler().pop();
                    return;
                }
                this.renderOverlay(type, pos, stateSchematic, missing, data, chunkMeshData, pack);
            }
        }
        this.getProfiler().pop();
    }

    private boolean shouldCullOverlayPos(BlockPos posIn, BlockState stateSchematic, BlockState stateClient) {
        if (!stateSchematic.getFluidState().isEmpty() && !Configs.Visuals.ENABLE_SCHEMATIC_FLUIDS.getBooleanValue()) {
            return true;
        }
        if (Configs.Visuals.RENDER_BLOCKS_AS_TRANSLUCENT.getBooleanValue() && Configs.Visuals.RENDER_TRANSLUCENT_INNER_SIDES.getBooleanValue()) {
            return false;
        }
        if (Configs.Visuals.ENABLE_SCHEMATIC_OVERLAY_CULLING.getBooleanValue() && stateClient.is(BlockTags.AIR)) {
            int count = 0;
            for (Direction side : PositionUtils.ALL_DIRECTIONS) {
                if (!DataManager.getRenderLayerRange().isPositionAtRenderEdgeOnSide(posIn, side) && !Block.shouldRenderFace((BlockState)stateSchematic, (BlockState)this.schematicWorldView.getBlockState(posIn.relative(side)), (Direction)side)) continue;
                ++count;
            }
            if (count == 0) {
                return true;
            }
        }
        return false;
    }

    protected void renderOverlay(OverlayType type, BlockPos pos, BlockState stateSchematic, boolean missing, @Nonnull ChunkRenderDataSchematic data, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack) {
        OverlayRenderType overlayType;
        this.getProfiler().push("render_overlay");
        boolean useDefault = false;
        BlockPos.MutableBlockPos relPos = this.getChunkRelativePosition(pos);
        if (Configs.Visuals.SCHEMATIC_OVERLAY_ENABLE_SIDES.getBooleanValue()) {
            this.getProfiler().push("overlay_sides");
            overlayType = OverlayRenderType.QUAD;
            BufferBuilder bufferOverlayQuads = this.preRenderOverlay(pack, overlayType);
            if (!data.isOverlayTypeStarted(overlayType)) {
                data.setOverlayTypeStarted(overlayType);
            }
            if (Configs.Visuals.OVERLAY_REDUCED_INNER_SIDES.getBooleanValue()) {
                this.getProfiler().popPush("cull_inner_sides");
                BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
                List<BlockStateModelPart> modelParts = this.worldRenderer.getModelParts((BlockPos)relPos, stateSchematic, this.rand);
                if (RenderUtils.hasQuads(modelParts)) {
                    VoxelShape shape = stateSchematic.getCollisionShape((BlockGetter)this.schematicWorldView, pos);
                    for (int i = 0; i < 6; ++i) {
                        Direction side = PositionUtils.ALL_DIRECTIONS[i];
                        posMutable.set(pos.getX() + side.getStepX(), pos.getY() + side.getStepY(), pos.getZ() + side.getStepZ());
                        BlockState adjStateSchematic = this.schematicWorldView.getBlockState((BlockPos)posMutable);
                        BlockState adjStateClient = this.clientWorldView.getBlockState((BlockPos)posMutable);
                        OverlayType typeAdj = this.getOverlayType(adjStateSchematic, adjStateClient);
                        boolean fullSquareSide = Block.isFaceFull((VoxelShape)shape, (Direction)side);
                        if (missing && Configs.Visuals.SCHEMATIC_OVERLAY_MODEL_SIDES.getBooleanValue()) {
                            this.getProfiler().popPush("cull_render_model_sides");
                            if (type.getRenderPriority() > typeAdj.getRenderPriority() || !fullSquareSide) {
                                this.getProfiler().popPush("cull_render_model");
                                for (BlockStateModelPart part : modelParts) {
                                    RenderUtils.drawBlockModelQuadOverlayBatched(part, stateSchematic, (BlockPos)relPos, side, this.overlayColor, 0.0, bufferOverlayQuads);
                                }
                                continue;
                            }
                            useDefault = true;
                            continue;
                        }
                        if (type.getRenderPriority() > typeAdj.getRenderPriority()) {
                            this.getProfiler().popPush("cull_render_default");
                            RenderUtils.drawBlockBoxSideBatchedQuads((BlockPos)relPos, side, this.overlayColor, 0.0, bufferOverlayQuads);
                            continue;
                        }
                        useDefault = true;
                    }
                } else {
                    useDefault = true;
                }
            } else if (missing && Configs.Visuals.SCHEMATIC_OVERLAY_MODEL_SIDES.getBooleanValue()) {
                this.getProfiler().popPush("render_model_sides");
                List<BlockStateModelPart> modelParts = this.worldRenderer.getModelParts((BlockPos)relPos, stateSchematic, this.rand);
                if (RenderUtils.hasQuads(modelParts)) {
                    RenderUtils.drawBlockModelQuadOverlayBatched(modelParts, stateSchematic, (BlockPos)relPos, this.overlayColor, 0.0, bufferOverlayQuads);
                } else {
                    useDefault = true;
                }
            } else {
                this.getProfiler().popPush("render_batched");
                RenderUtils.drawBlockBoxBatchedQuads((BlockPos)relPos, this.overlayColor, 0.0, bufferOverlayQuads);
            }
            if (useDefault) {
                try {
                    this.getProfiler().popPush("render_batched_default");
                    RenderUtils.drawBlockBoxBatchedQuads((BlockPos)relPos, this.overlayColor, 0.0, bufferOverlayQuads);
                }
                catch (Exception modelParts) {
                    // empty catch block
                }
            }
            this.getProfiler().pop();
        }
        if (Configs.Visuals.SCHEMATIC_OVERLAY_ENABLE_OUTLINES.getBooleanValue()) {
            this.getProfiler().push("overlay_outlines");
            useDefault = false;
            overlayType = OverlayRenderType.OUTLINE;
            BufferBuilder bufferOverlayOutlines = this.preRenderOverlay(pack, overlayType);
            if (!data.isOverlayTypeStarted(overlayType)) {
                data.setOverlayTypeStarted(overlayType);
            }
            Color4f overlayColor = new Color4f(this.overlayColor.r, this.overlayColor.g, this.overlayColor.b, 1.0f);
            float lineWidth = 1.0f;
            this.getProfiler().popPush("cull_inner_sides");
            if (Configs.Visuals.OVERLAY_REDUCED_INNER_SIDES.getBooleanValue()) {
                OverlayType[][][] adjTypes = new OverlayType[3][3][3];
                BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
                for (int y = 0; y <= 2; ++y) {
                    for (int z = 0; z <= 2; ++z) {
                        for (int x = 0; x <= 2; ++x) {
                            if (x != 1 || y != 1 || z != 1) {
                                posMutable.set(pos.getX() + x - 1, pos.getY() + y - 1, pos.getZ() + z - 1);
                                BlockState adjStateSchematic = this.schematicWorldView.getBlockState((BlockPos)posMutable);
                                BlockState adjStateClient = this.clientWorldView.getBlockState((BlockPos)posMutable);
                                adjTypes[x][y][z] = this.getOverlayType(adjStateSchematic, adjStateClient);
                                continue;
                            }
                            adjTypes[x][y][z] = type;
                        }
                    }
                }
                if (missing && Configs.Visuals.SCHEMATIC_OVERLAY_MODEL_OUTLINE.getBooleanValue()) {
                    if (stateSchematic.canOcclude()) {
                        useDefault = true;
                    } else {
                        this.getProfiler().popPush("render_model_batched");
                        List<BlockStateModelPart> modelParts = this.worldRenderer.getModelParts((BlockPos)relPos, stateSchematic, this.rand);
                        if (RenderUtils.hasQuads(modelParts)) {
                            RenderUtils.drawDebugBlockModelOutlinesBatched(modelParts, stateSchematic, (BlockPos)relPos, overlayColor, 0.0, lineWidth, bufferOverlayOutlines);
                        } else {
                            useDefault = true;
                        }
                    }
                } else {
                    this.getProfiler().popPush("render_reduced_edges");
                    this.renderOverlayReducedEdges(pos, adjTypes, type, lineWidth, bufferOverlayOutlines);
                }
            } else {
                this.getProfiler().popPush("render_fallback");
                if (missing && Configs.Visuals.SCHEMATIC_OVERLAY_MODEL_OUTLINE.getBooleanValue()) {
                    this.getProfiler().popPush("render_model_batched");
                    List<BlockStateModelPart> modelParts = this.worldRenderer.getModelParts((BlockPos)relPos, stateSchematic, this.rand);
                    if (RenderUtils.hasQuads(modelParts)) {
                        RenderUtils.drawDebugBlockModelOutlinesBatched(modelParts, stateSchematic, (BlockPos)relPos, overlayColor, 0.0, lineWidth, bufferOverlayOutlines);
                    } else {
                        useDefault = true;
                    }
                } else {
                    useDefault = true;
                }
            }
            if (useDefault) {
                try {
                    this.getProfiler().popPush("render_batched_box");
                    RenderUtils.drawBlockBoundingBoxOutlinesBatchedDebugLines((BlockPos)relPos, overlayColor, 0.0, lineWidth, bufferOverlayOutlines);
                }
                catch (Exception exception) {
                    // empty catch block
                }
            }
            this.getProfiler().pop();
        }
        this.getProfiler().pop();
    }

    protected BlockPos.MutableBlockPos getChunkRelativePosition(BlockPos pos) {
        return this.chunkRelativePos.set(pos.getX() & 0xF, pos.getY() - this.position.getY(), pos.getZ() & 0xF);
    }

    protected void renderOverlayReducedEdges(BlockPos pos, OverlayType[][][] adjTypes, OverlayType typeSelf, float lineWidth, BufferBuilder bufferOverlayOutlines) {
        OverlayType[] neighborTypes = new OverlayType[4];
        Vec3i[] neighborPositions = new Vec3i[4];
        int lines = 0;
        this.getProfiler().push("overlay_reduced_edges");
        for (Direction.Axis axis : fi.dy.masa.litematica.util.PositionUtils.AXES_ALL) {
            for (int corner = 0; corner < 4; ++corner) {
                Vec3i[] offsets = fi.dy.masa.litematica.util.PositionUtils.getEdgeNeighborOffsets(axis, corner);
                int index = -1;
                boolean hasCurrent = false;
                if (offsets == null) continue;
                for (int i = 0; i < 4; ++i) {
                    Vec3i offset = offsets[i];
                    OverlayType type = adjTypes[offset.getX() + 1][offset.getY() + 1][offset.getZ() + 1];
                    if (type == OverlayType.NONE || index != -1 && type.getRenderPriority() < neighborTypes[index - 1].getRenderPriority()) continue;
                    if (index < 0 || type.getRenderPriority() > neighborTypes[index - 1].getRenderPriority()) {
                        index = 0;
                    }
                    neighborPositions[index] = new Vec3i(pos.getX() + offset.getX(), pos.getY() + offset.getY(), pos.getZ() + offset.getZ());
                    neighborTypes[index] = type;
                    hasCurrent |= i == 0;
                    ++index;
                }
                this.getProfiler().popPush("edges_plop");
                if (index <= 0 || !hasCurrent) continue;
                Vec3i posTmp = new Vec3i(pos.getX(), pos.getY(), pos.getZ());
                int ind = -1;
                for (int i = 0; i < index; ++i) {
                    Vec3i tmp = neighborPositions[i];
                    if (tmp.getX() > posTmp.getX() || tmp.getY() > posTmp.getY() || tmp.getZ() > posTmp.getZ()) continue;
                    posTmp = tmp;
                    ind = i;
                }
                if (posTmp.getX() != pos.getX() || posTmp.getY() != pos.getY() || posTmp.getZ() != pos.getZ()) continue;
                try {
                    this.getProfiler().popPush("render_batched");
                    RenderUtils.drawBlockBoxEdgeBatchedDebugLines((BlockPos)this.getChunkRelativePosition(pos), axis, corner, this.overlayColor, lineWidth, bufferOverlayOutlines);
                }
                catch (IllegalStateException ignored) {
                    this.getProfiler().pop();
                    return;
                }
                ++lines;
            }
        }
        this.getProfiler().pop();
    }

    protected OverlayType getOverlayType(BlockState stateSchematic, BlockState stateClient) {
        if (stateSchematic == stateClient) {
            return OverlayType.NONE;
        }
        boolean clientHasAir = stateClient.isAir();
        boolean schematicHasAir = stateSchematic.isAir();
        if (schematicHasAir) {
            if (clientHasAir) {
                return OverlayType.NONE;
            }
            if (this.ignoreClientWorldFluids && stateClient.liquid()) {
                return OverlayType.NONE;
            }
            if (this.ignoreBlockRegistry.hasBlock(stateClient.getBlock())) {
                return OverlayType.NONE;
            }
            return OverlayType.EXTRA;
        }
        if (clientHasAir || this.ignoreClientWorldFluids && stateClient.liquid()) {
            return OverlayType.MISSING;
        }
        if (stateSchematic.getBlock() != stateClient.getBlock()) {
            if (Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue() && BlockUtils.isInSameGroup((BlockState)stateSchematic, (BlockState)stateClient)) {
                if (BlockUtils.matchPropertiesOnly((BlockState)stateSchematic, (BlockState)stateClient)) {
                    return OverlayType.DIFF_BLOCK;
                }
                return OverlayType.WRONG_STATE;
            }
            return OverlayType.WRONG_BLOCK;
        }
        return OverlayType.WRONG_STATE;
    }

    @Nullable
    protected static Color4f getOverlayColor(OverlayType overlayType) {
        Color4f overlayColor = null;
        switch (overlayType) {
            case MISSING: {
                if (!Configs.Visuals.SCHEMATIC_OVERLAY_TYPE_MISSING.getBooleanValue()) break;
                overlayColor = Configs.Colors.SCHEMATIC_OVERLAY_COLOR_MISSING.getColor();
                break;
            }
            case EXTRA: {
                if (!Configs.Visuals.SCHEMATIC_OVERLAY_TYPE_EXTRA.getBooleanValue()) break;
                overlayColor = Configs.Colors.SCHEMATIC_OVERLAY_COLOR_EXTRA.getColor();
                break;
            }
            case WRONG_BLOCK: {
                if (!Configs.Visuals.SCHEMATIC_OVERLAY_TYPE_WRONG_BLOCK.getBooleanValue()) break;
                overlayColor = Configs.Colors.SCHEMATIC_OVERLAY_COLOR_WRONG_BLOCK.getColor();
                break;
            }
            case WRONG_STATE: {
                if (!Configs.Visuals.SCHEMATIC_OVERLAY_TYPE_WRONG_STATE.getBooleanValue()) break;
                overlayColor = Configs.Colors.SCHEMATIC_OVERLAY_COLOR_WRONG_STATE.getColor();
                break;
            }
            case DIFF_BLOCK: {
                if (!Configs.Visuals.SCHEMATIC_OVERLAY_TYPE_DIFF_BLOCK.getBooleanValue()) break;
                overlayColor = Configs.Colors.SCHEMATIC_OVERLAY_COLOR_DIFF_BLOCK.getColor();
                break;
            }
        }
        return overlayColor;
    }

    private <T extends BlockEntity> void addBlockEntity(BlockState state, BlockPos pos, ChunkMeshDataSchematic chunkMeshData) {
        BlockEntityRenderer tesr;
        BlockEntity te = this.schematicWorldView.getBlockEntity(pos, LevelChunk.EntityCreationType.CHECK);
        if (te == null && (te = ((EntityBlock)state.getBlock()).newBlockEntity(pos, state)) != null) {
            this.schematicWorldView.world.getChunkAt(pos).addAndRegisterBlockEntity(te);
            this.schematicWorldView.addBlockEntity(pos, te);
        }
        if (te != null && (tesr = this.worldRenderer.getBlockEntityRenderer().getRenderer(te)) != null) {
            if (tesr.shouldRenderOffScreen()) {
                chunkMeshData.addNoCullBlockEntity(te);
            } else {
                chunkMeshData.addBlockEntity(te);
            }
        }
    }

    private BufferBuilder preRenderBlocks(ChunkRenderDispatcherBuffers pack, ChunkSectionLayer layer) {
        return pack.getBuilder(layer);
    }

    private BufferBuilder preRenderOverlay(ChunkRenderDispatcherBuffers pack, OverlayRenderType type) {
        this.existingOverlays.add(type);
        this.hasOverlay = true;
        return pack.getBuilder(type);
    }

    private void postRenderBlocks(ChunkSectionLayer layer, float x, float y, float z, @Nonnull ChunkRenderDataSchematic chunkRenderData, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack) throws RuntimeException {
        if (!chunkRenderData.isBlockLayerEmpty(layer)) {
            MeshData meshData;
            MeshData oldMesh;
            if (chunkMeshData.hasMeshData(layer) && (oldMesh = chunkMeshData.getMeshDataOrNull(layer)) != null) {
                oldMesh.close();
            }
            if (pack.builderCache().hasBuilder(layer)) {
                BufferBuilder builder = pack.getBuilder(layer);
                meshData = builder.build();
                if (meshData == null) {
                    LOGGER.error("[VBO] postRenderBlocks(): layer: [{}] -- Mesh is null!", (Object)layer.label());
                    chunkRenderData.setBlockLayerUnused(layer);
                    return;
                }
            } else {
                LOGGER.error("[VBO] postRenderBlocks(): layer: [{}] -- Invalid Builder", (Object)layer.label());
                chunkRenderData.setBlockLayerUnused(layer);
                return;
            }
            chunkMeshData.saveMeshData(layer, meshData);
            boolean resortBlocks = Configs.Visuals.RENDER_ENABLE_TRANSLUCENT_RESORTING.getBooleanValue();
            if (layer == ChunkSectionLayer.TRANSLUCENT && resortBlocks) {
                try {
                    this.resortRenderBlocks(layer, x, y, z, chunkRenderData, chunkMeshData, pack);
                }
                catch (Exception e) {
                    LOGGER.error("[VBO] postRenderBlocks(): layer: [{}] -- resortRenderBlocks() Exception: {}", (Object)layer.label(), (Object)e.getLocalizedMessage());
                    throw new RuntimeException(e.toString());
                }
            }
        } else {
            LOGGER.error("[VBO] postRenderBlocks(): layer: [{}] -- Layer not started!", (Object)layer.label());
        }
    }

    private void postRenderOverlay(OverlayRenderType type, float x, float y, float z, @Nonnull ChunkRenderDataSchematic chunkRenderData, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack) throws RuntimeException {
        if (!chunkRenderData.isOverlayTypeEmpty(type)) {
            MeshData meshData;
            MeshData oldMesh;
            if (chunkMeshData.hasMeshData(type) && (oldMesh = chunkMeshData.getMeshDataOrNull(type)) != null) {
                oldMesh.close();
            }
            if (pack.builderCache().hasBuilder(type)) {
                BufferBuilder builder = pack.getBuilder(type);
                meshData = builder.build();
                if (meshData == null) {
                    chunkRenderData.setOverlayTypeUnused(type);
                    return;
                }
            } else {
                chunkRenderData.setOverlayTypeUnused(type);
                return;
            }
            chunkMeshData.saveMeshData(type, meshData);
            boolean resortOverlays = false;
            if (type.translucent() && resortOverlays) {
                try {
                    this.resortRenderOverlay(type, x, y, z, chunkRenderData, chunkMeshData, pack);
                }
                catch (Exception e) {
                    throw new RuntimeException(e.toString());
                }
            }
        }
    }

    private void resortRenderBlocks(ChunkSectionLayer layer, float x, float y, float z, @Nonnull ChunkRenderDataSchematic chunkRenderData, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack) throws InterruptedException {
        if (!chunkRenderData.isBlockLayerEmpty(layer)) {
            ByteBufferBuilder allocator = pack.allocatorCache().getAllocator(layer);
            if (allocator == null) {
                chunkRenderData.setBlockLayerUnused(layer);
                return;
            }
            if (!chunkMeshData.hasMeshData(layer)) {
                chunkRenderData.setBlockLayerUnused(layer);
                return;
            }
            MeshData meshData = chunkMeshData.getMeshDataOrNull(layer);
            if (meshData == null) {
                chunkRenderData.setBlockLayerUnused(layer);
                return;
            }
            boolean resortBlocks = Configs.Visuals.RENDER_ENABLE_TRANSLUCENT_RESORTING.getBooleanValue();
            if (layer == ChunkSectionLayer.TRANSLUCENT && resortBlocks) {
                MeshData.SortState sortingData;
                VertexSorting sorter = VertexSorting.byDistance((float)x, (float)y, (float)z);
                if (!chunkMeshData.hasTransparentSortingDataForBlockLayer(layer)) {
                    sortingData = meshData.sortQuads(allocator, sorter);
                    if (sortingData == null) {
                        throw new InterruptedException("Sort State failure");
                    }
                    chunkMeshData.setTransparentSortingDataForBlockLayer(layer, sortingData);
                } else {
                    sortingData = chunkMeshData.getTransparentSortingDataForBlockLayer(layer);
                }
                if (sortingData == null) {
                    throw new InterruptedException("Sorting Data failure");
                }
            }
        }
    }

    @Deprecated
    private void resortRenderOverlay(OverlayRenderType type, float x, float y, float z, @Nonnull ChunkRenderDataSchematic chunkRenderData, @Nonnull ChunkMeshDataSchematic chunkMeshData, ChunkRenderDispatcherBuffers pack) throws InterruptedException {
        if (!chunkRenderData.isOverlayTypeEmpty(type)) {
            ByteBufferBuilder allocator = pack.allocatorCache().getAllocator(type);
            if (allocator == null) {
                chunkRenderData.setOverlayTypeUnused(type);
                return;
            }
            if (!chunkMeshData.hasMeshData(type)) {
                chunkRenderData.setOverlayTypeUnused(type);
                return;
            }
            MeshData meshData = chunkMeshData.getMeshDataOrNull(type);
            if (meshData == null) {
                chunkRenderData.setOverlayTypeUnused(type);
                return;
            }
            boolean resortOverlays = false;
            if (type.translucent() && resortOverlays) {
                MeshData.SortState sortingData;
                VertexSorting sorter = VertexSorting.byDistance((float)x, (float)y, (float)z);
                if (!chunkMeshData.hasTransparentSortingDataForOverlay(type)) {
                    sortingData = meshData.sortQuads(allocator, sorter);
                    if (sortingData == null) {
                        throw new InterruptedException("Sort State failure");
                    }
                    chunkMeshData.setTransparentSortingDataForOverlay(type, sortingData);
                } else {
                    sortingData = chunkMeshData.getTransparentSortingDataForOverlay(type);
                }
                if (sortingData == null) {
                    throw new InterruptedException("Sorting Data failure");
                }
            }
        }
    }

    protected ChunkRenderTaskSchematic makeCompileTaskChunkSchematic(Supplier<Vec3> cameraPosSupplier) {
        ChunkRenderTaskSchematic generator;
        this.chunkRenderLock.lock();
        try {
            this.finishCompileTask();
            this.rebuildWorldView();
            generator = this.compileTask = new ChunkRenderTaskSchematic(this, ChunkRenderTaskSchematic.Type.REBUILD_CHUNK, cameraPosSupplier, this.getDistanceSq());
        }
        finally {
            this.chunkRenderLock.unlock();
        }
        return generator;
    }

    @Nullable
    protected ChunkRenderTaskSchematic makeCompileTaskTransparencySchematic(Supplier<Vec3> cameraPosSupplier) {
        this.chunkRenderLock.lock();
        try {
            if (this.compileTask == null || this.compileTask.getStatus() != ChunkRenderTaskSchematic.Status.PENDING) {
                if (this.compileTask != null && this.compileTask.getStatus() != ChunkRenderTaskSchematic.Status.DONE) {
                    this.compileTask.finish();
                }
                if (!this.chunkRenderData.isEmpty()) {
                    this.compileTask = new ChunkRenderTaskSchematic(this, ChunkRenderTaskSchematic.Type.RESORT_TRANSPARENCY, cameraPosSupplier, this.getDistanceSq());
                    this.compileTask.updateChunkRenderData(this.chunkRenderData);
                    ChunkRenderTaskSchematic chunkRenderTaskSchematic = this.compileTask;
                    return chunkRenderTaskSchematic;
                }
            }
        }
        finally {
            this.chunkRenderLock.unlock();
        }
        return null;
    }

    protected void finishCompileTask() {
        this.chunkRenderLock.lock();
        try {
            if (this.compileTask != null && this.compileTask.getStatus() != ChunkRenderTaskSchematic.Status.DONE) {
                this.compileTask.finish();
                this.compileTask = null;
            }
        }
        finally {
            this.chunkRenderLock.unlock();
        }
    }

    protected ReentrantLock getLockCompileTask() {
        return this.chunkRenderLock;
    }

    protected void clear() {
        this.chunkRenderLock.lock();
        try {
            this.finishCompileTask();
        }
        finally {
            this.chunkRenderDataLock.lock();
            try {
                if (this.chunkRenderData != null) {
                    this.chunkRenderData.clearAll();
                }
                this.chunkRenderData = new ChunkRenderDataSchematic();
            }
            finally {
                this.chunkRenderDataLock.unlock();
            }
            this.existingOverlays.clear();
            this.hasOverlay = false;
            this.chunkRenderLock.unlock();
        }
    }

    protected void setNeedsUpdate(boolean immediate) {
        if (this.needsUpdate) {
            immediate |= this.needsImmediateUpdate;
        }
        this.needsUpdate = true;
        this.needsImmediateUpdate = immediate;
    }

    protected void clearNeedsUpdate() {
        this.needsUpdate = false;
        this.needsImmediateUpdate = false;
    }

    protected boolean needsUpdate() {
        return this.needsUpdate;
    }

    protected boolean needsImmediateUpdate() {
        return this.needsUpdate && this.needsImmediateUpdate;
    }

    protected int getPartsCount() {
        int chunkX = this.position.getX() / 16;
        int chunkZ = this.position.getZ() / 16;
        return DataManager.getSchematicPlacementManager().getPlacementPartsInChunkCount(chunkX, chunkZ);
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    private void rebuildWorldView() {
        List<IntBoundingBox> list = this.boxes;
        synchronized (list) {
            this.ignoreClientWorldFluids = Configs.Visuals.IGNORE_EXISTING_FLUIDS.getBooleanValue();
            this.ignoreBlockRegistry = new IgnoreBlockRegistry();
            ClientLevel worldClient = Minecraft.getInstance().level;
            assert (worldClient != null);
            this.schematicWorldView = new ChunkCacheSchematic(this.world, worldClient, (BlockPos)this.position, 2);
            this.clientWorldView = new ChunkCacheSchematic((Level)worldClient, worldClient, (BlockPos)this.position, 2);
            this.boxes.clear();
            int chunkX = this.position.getX() / 16;
            int chunkZ = this.position.getZ() / 16;
            for (SchematicPlacementManager.PlacementPart part : DataManager.getSchematicPlacementManager().getPlacementPartsInChunk(chunkX, chunkZ)) {
                this.boxes.add(part.bb);
            }
        }
    }

    @Override
    public void close() throws Exception {
        this.deleteGlResources();
    }
}

