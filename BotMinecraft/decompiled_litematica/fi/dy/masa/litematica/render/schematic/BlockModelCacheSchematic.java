/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.color.block.BlockColors
 *  net.minecraft.client.model.geom.EntityModelSet
 *  net.minecraft.client.renderer.PlayerSkinRenderCache
 *  net.minecraft.client.renderer.block.BlockModelRenderState
 *  net.minecraft.client.renderer.block.BlockModelResolver
 *  net.minecraft.client.renderer.block.BlockModelSet
 *  net.minecraft.client.renderer.block.BlockStateModelSet
 *  net.minecraft.client.renderer.block.FluidModel
 *  net.minecraft.client.renderer.block.FluidStateModelSet
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.renderer.block.model.BlockDisplayContext
 *  net.minecraft.client.renderer.block.model.BlockModel
 *  net.minecraft.client.renderer.block.model.BlockStateModelWrapper
 *  net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher
 *  net.minecraft.client.renderer.entity.EntityRenderDispatcher
 *  net.minecraft.client.renderer.entity.ItemFrameRenderer
 *  net.minecraft.client.renderer.fog.FogRenderer
 *  net.minecraft.client.renderer.item.ItemModelResolver
 *  net.minecraft.client.resources.model.BlockStateDefinitions
 *  net.minecraft.client.resources.model.ModelManager
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.client.resources.model.sprite.SpriteGetter
 *  net.minecraft.core.Direction
 *  net.minecraft.util.RandomSource
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.levelgen.SingleThreadedRandomSource
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.level.material.FluidState
 *  org.joml.Matrix4f
 *  org.joml.Matrix4fc
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.mixin.model.IMixinBlockModelSet;
import fi.dy.masa.litematica.mixin.model.IMixinBlockStateModelSet;
import fi.dy.masa.litematica.mixin.model.IMixinEntityRenderDispatcher;
import fi.dy.masa.litematica.mixin.model.IMixinFluidStateModelSet;
import fi.dy.masa.litematica.mixin.model.IMixinMinecraft;
import fi.dy.masa.litematica.mixin.model.IMixinModelManager;
import fi.dy.masa.litematica.mixin.render.IMixinGameRenderer;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.color.block.BlockColors;
import net.minecraft.client.model.geom.EntityModelSet;
import net.minecraft.client.renderer.PlayerSkinRenderCache;
import net.minecraft.client.renderer.block.BlockModelRenderState;
import net.minecraft.client.renderer.block.BlockModelResolver;
import net.minecraft.client.renderer.block.BlockModelSet;
import net.minecraft.client.renderer.block.BlockStateModelSet;
import net.minecraft.client.renderer.block.FluidModel;
import net.minecraft.client.renderer.block.FluidStateModelSet;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.renderer.block.model.BlockDisplayContext;
import net.minecraft.client.renderer.block.model.BlockModel;
import net.minecraft.client.renderer.block.model.BlockStateModelWrapper;
import net.minecraft.client.renderer.blockentity.BlockEntityRenderDispatcher;
import net.minecraft.client.renderer.entity.EntityRenderDispatcher;
import net.minecraft.client.renderer.entity.ItemFrameRenderer;
import net.minecraft.client.renderer.fog.FogRenderer;
import net.minecraft.client.renderer.item.ItemModelResolver;
import net.minecraft.client.resources.model.BlockStateDefinitions;
import net.minecraft.client.resources.model.ModelManager;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.client.resources.model.sprite.SpriteGetter;
import net.minecraft.core.Direction;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.levelgen.SingleThreadedRandomSource;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.material.FluidState;
import org.joml.Matrix4f;
import org.joml.Matrix4fc;

public class BlockModelCacheSchematic {
    public static final BlockModelCacheSchematic INSTANCE = new BlockModelCacheSchematic();
    private static final SingleThreadedRandomSource RAND = new SingleThreadedRandomSource(0L);
    private static final Matrix4fc MATRIX = new Matrix4f();
    private final ConcurrentHashMap<BlockState, BlockStateModel> blockStateModelCache = new ConcurrentHashMap(256, 0.9f, 1);
    private final ConcurrentHashMap<BlockState, BlockModel> blockModelCache = new ConcurrentHashMap(256, 0.9f, 1);
    private final ConcurrentHashMap<Fluid, FluidModel> fluidModelCache = new ConcurrentHashMap(32, 0.9f, 1);
    private final Minecraft mc = Minecraft.getInstance();
    private ModelManager modelManager;
    private BlockModelResolver blockModelResolver;
    private ItemModelResolver itemModelResolver;
    private BlockStateModelSet blockStateModelSet;
    private BlockModelSet blockModelSet;
    private BlockColors blockColors;
    private FluidStateModelSet fluidStateModelSet;
    private EntityModelSet entityModelSet;
    private SpriteGetter spriteGetter;
    private PlayerSkinRenderCache skinCache;
    private BlockEntityRenderDispatcher blockEntityRenderDispatcher;
    private EntityRenderDispatcher entityRenderDispatcher;
    private FogRenderer fogRenderer;

    private BlockModelCacheSchematic() {
    }

    protected RandomSource rand() {
        return RAND;
    }

    protected ModelManager modelManager() {
        return this.modelManager;
    }

    protected BlockModelResolver blockModelResolver() {
        return this.blockModelResolver;
    }

    protected ItemModelResolver itemModelResolver() {
        return this.itemModelResolver;
    }

    protected BlockStateModelSet blockStateModelSet() {
        return this.blockStateModelSet;
    }

    protected BlockModelSet blockModelSet() {
        return this.blockModelSet;
    }

    protected BlockColors blockColors() {
        if (this.blockColors == null) {
            this.blockColors = BlockColors.createDefault();
        }
        return this.blockColors;
    }

    protected FluidStateModelSet fluidStateModelSet() {
        return this.fluidStateModelSet;
    }

    protected EntityModelSet entityModelSet() {
        return this.entityModelSet;
    }

    protected SpriteGetter spriteGetter() {
        return this.spriteGetter;
    }

    protected PlayerSkinRenderCache skinCache() {
        return this.skinCache;
    }

    protected BlockEntityRenderDispatcher blockEntityRenderer() {
        if (this.blockEntityRenderDispatcher == null) {
            this.blockEntityRenderDispatcher = this.mc.getBlockEntityRenderDispatcher();
        }
        return this.blockEntityRenderDispatcher;
    }

    protected EntityRenderDispatcher entityRenderer() {
        if (this.entityRenderDispatcher == null) {
            this.entityRenderDispatcher = this.mc.getEntityRenderDispatcher();
        }
        return this.entityRenderDispatcher;
    }

    protected FogRenderer fogRenderer() {
        if (this.fogRenderer == null) {
            this.fogRenderer = ((IMixinGameRenderer)this.mc.gameRenderer).litematica_getFogRenderer();
        }
        return this.fogRenderer;
    }

    private void refresh() {
        Litematica.LOGGER.info("BlockModelCacheSchematic: refreshing model cache");
        this.modelManager = this.mc.getModelManager();
        this.blockModelResolver = ((IMixinEntityRenderDispatcher)this.mc.getEntityRenderDispatcher()).litematica_getBlockModelResolver();
        this.itemModelResolver = ((IMixinMinecraft)this.mc).litematica_getItemModelResolver();
        this.blockStateModelSet = this.modelManager.getBlockStateModelSet();
        this.blockModelSet = this.modelManager.getBlockModelSet();
        this.blockColors = BlockColors.createDefault();
        this.fluidStateModelSet = this.modelManager.getFluidStateModelSet();
        this.entityModelSet = (EntityModelSet)this.modelManager.entityModels().get();
        this.spriteGetter = ((IMixinModelManager)this.modelManager).litematica_getAtlasManager();
        this.skinCache = ((IMixinModelManager)this.modelManager).litematica_getPlayerSkinRenderCache();
        this.rebuildCache();
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    private void rebuildCache() {
        ConcurrentHashMap<BlockState, BlockStateModel> concurrentHashMap = this.blockStateModelCache;
        synchronized (concurrentHashMap) {
            this.blockStateModelCache.clear();
            this.blockStateModelCache.putAll(((IMixinBlockStateModelSet)this.blockStateModelSet).litematica_getModelMap());
        }
        concurrentHashMap = this.blockModelCache;
        synchronized (concurrentHashMap) {
            this.blockModelCache.clear();
            this.blockModelCache.putAll(((IMixinBlockModelSet)this.blockModelSet).litematica_getBlockModelCache());
        }
        concurrentHashMap = this.fluidModelCache;
        synchronized (concurrentHashMap) {
            this.fluidModelCache.clear();
            this.fluidModelCache.putAll(((IMixinFluidStateModelSet)this.fluidStateModelSet).litematica_getModelByFluid());
        }
    }

    private void refreshRenderers() {
        this.entityRenderDispatcher = this.mc.getEntityRenderDispatcher();
        this.blockEntityRenderDispatcher = this.mc.getBlockEntityRenderDispatcher();
        this.fogRenderer = ((IMixinGameRenderer)this.mc.gameRenderer).litematica_getFogRenderer();
    }

    protected void onLoadRenderers() {
        if (this.modelManager == null) {
            this.refresh();
        }
        this.refreshRenderers();
    }

    public void onReloadResources() {
        this.refresh();
    }

    public int stateModelSize() {
        return this.blockStateModelCache.size();
    }

    public int modelSize() {
        return this.blockModelCache.size();
    }

    public int fluidSize() {
        return this.fluidModelCache.size();
    }

    @Nullable
    public BlockStateModel fetchBlockStateModel(BlockState state) {
        BlockStateModel model = this.blockStateModelCache.computeIfAbsent(state, k -> this.blockStateModelSet.get(k));
        if (model != null && this.checkBlockStateModel(model)) {
            return model;
        }
        if (!state.hasBlockEntity()) {
            if (Reference.DEBUG_MODE) {
                Litematica.LOGGER.warn("fetchBlockStateModel: Block State Model not found for state [{}]", (Object)state.toString());
            }
            return ((IMixinBlockStateModelSet)this.blockStateModelSet).litematica_getMissingModel();
        }
        return null;
    }

    public boolean checkBlockStateModel(BlockStateModel model) {
        List<BlockStateModelPart> parts = this.getBlockStateModelParts(model);
        if (parts.isEmpty()) {
            return false;
        }
        int totalSize = 0;
        for (BlockStateModelPart part : parts) {
            for (Direction face : PositionUtils.ALL_DIRECTIONS) {
                totalSize += this.getBlockStateModelPartFace(part, face).size();
            }
            totalSize += this.getBlockStateModelPartFace(part, null).size();
        }
        return totalSize > 0;
    }

    public List<BlockStateModelPart> getBlockStateModelParts(BlockStateModel model) {
        ArrayList<BlockStateModelPart> parts = new ArrayList<BlockStateModelPart>();
        model.collectParts((RandomSource)RAND, parts);
        return parts;
    }

    public List<BakedQuad> getBlockStateModelPartFace(BlockStateModelPart part, @Nullable Direction face) {
        return part.getQuads(face);
    }

    @Nullable
    public BlockModel fetchBlockModel(BlockState state) {
        BlockModel model = this.blockModelCache.computeIfAbsent(state, k -> this.blockModelSet.get(k));
        if (model != null) {
            return model;
        }
        BlockStateModel stateModel = this.fetchBlockStateModel(state);
        if (stateModel != null) {
            return new BlockStateModelWrapper(stateModel, this.blockColors().getTintSources(state), MATRIX);
        }
        if (Reference.DEBUG_MODE) {
            Litematica.LOGGER.warn("fetchBlockModel: Block Model not found for state [{}]", (Object)state.toString());
        }
        return null;
    }

    public void updateBlockRenderState(BlockModelRenderState renderState, BlockState state, BlockDisplayContext context) {
        renderState.clear();
        BlockModel model = this.fetchBlockModel(state);
        if (model != null) {
            model.update(renderState, state, context, 42L);
        }
    }

    public void updateItemFrameRenderState(BlockModelRenderState renderState, boolean glowing, boolean map) {
        this.updateBlockRenderState(renderState, BlockStateDefinitions.getItemFrameFakeState((boolean)glowing, (boolean)map), ItemFrameRenderer.BLOCK_DISPLAY_CONTEXT);
    }

    @Nullable
    public FluidModel fetchFluidModel(FluidState state) {
        Fluid fluid = state.getType();
        FluidModel model = this.fluidModelCache.computeIfAbsent(fluid, k -> this.fluidStateModelSet.get(state));
        if (model != null) {
            return model;
        }
        if (Reference.DEBUG_MODE) {
            Litematica.LOGGER.warn("fetchFluidModel: Fluid Model not found for state [{}]", (Object)state.toString());
        }
        return ((IMixinFluidStateModelSet)this.fluidStateModelSet).litematica_getMissingModel();
    }
}

