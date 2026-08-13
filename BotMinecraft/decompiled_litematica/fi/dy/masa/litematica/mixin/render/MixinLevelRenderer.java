/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.sugar.Local
 *  com.mojang.blaze3d.buffers.GpuBufferSlice
 *  com.mojang.blaze3d.framegraph.FrameGraphBuilder
 *  com.mojang.blaze3d.pipeline.RenderTarget
 *  com.mojang.blaze3d.resource.GraphicsResourceAllocator
 *  com.mojang.blaze3d.resource.ResourceHandle
 *  com.mojang.blaze3d.textures.GpuSampler
 *  com.mojang.blaze3d.vertex.PoseStack
 *  net.minecraft.client.DeltaTracker
 *  net.minecraft.client.renderer.LevelRenderer
 *  net.minecraft.client.renderer.LevelTargetBundle
 *  net.minecraft.client.renderer.SubmitNodeCollector
 *  net.minecraft.client.renderer.SubmitNodeStorage
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup
 *  net.minecraft.client.renderer.chunk.ChunkSectionsToRender
 *  net.minecraft.client.renderer.feature.FeatureRenderDispatcher$PreparedFrame
 *  net.minecraft.client.renderer.state.level.CameraRenderState
 *  net.minecraft.client.renderer.state.level.LevelRenderState
 *  net.minecraft.util.profiling.ActiveProfiler
 *  net.minecraft.util.profiling.Profiler
 *  net.minecraft.util.profiling.ProfilerFiller
 *  org.jetbrains.annotations.Nullable
 *  org.joml.Matrix4fc
 *  org.joml.Vector4f
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.Unique
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.At$Shift
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.render;

import com.llamalad7.mixinextras.sugar.Local;
import com.mojang.blaze3d.buffers.GpuBufferSlice;
import com.mojang.blaze3d.framegraph.FrameGraphBuilder;
import com.mojang.blaze3d.pipeline.RenderTarget;
import com.mojang.blaze3d.resource.GraphicsResourceAllocator;
import com.mojang.blaze3d.resource.ResourceHandle;
import com.mojang.blaze3d.textures.GpuSampler;
import com.mojang.blaze3d.vertex.PoseStack;
import fi.dy.masa.litematica.mixin.client.IMixinActiveProfiler;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.renderer.LevelRenderer;
import net.minecraft.client.renderer.LevelTargetBundle;
import net.minecraft.client.renderer.SubmitNodeCollector;
import net.minecraft.client.renderer.SubmitNodeStorage;
import net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup;
import net.minecraft.client.renderer.chunk.ChunkSectionsToRender;
import net.minecraft.client.renderer.feature.FeatureRenderDispatcher;
import net.minecraft.client.renderer.state.level.CameraRenderState;
import net.minecraft.client.renderer.state.level.LevelRenderState;
import net.minecraft.util.profiling.ActiveProfiler;
import net.minecraft.util.profiling.Profiler;
import net.minecraft.util.profiling.ProfilerFiller;
import org.jetbrains.annotations.Nullable;
import org.joml.Matrix4fc;
import org.joml.Vector4f;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={LevelRenderer.class}, priority=850)
public abstract class MixinLevelRenderer {
    @Shadow
    @Final
    private SubmitNodeStorage submitNodeStorage;
    @Shadow
    @Nullable
    private GpuSampler chunkLayerSampler;
    @Shadow
    @Final
    private LevelTargetBundle targets;
    @Unique
    private ProfilerFiller profiler;

    @Unique
    private void litematica$prepareProfiler() {
        ActiveProfiler ps;
        ProfilerFiller profilerFiller;
        if (this.profiler == null) {
            this.profiler = Profiler.get();
        }
        if ((profilerFiller = this.profiler) instanceof ActiveProfiler && !((IMixinActiveProfiler)(ps = (ActiveProfiler)profilerFiller)).litematica_isStarted()) {
            this.profiler.startTick();
        }
    }

    @Inject(method={"render"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/renderer/LevelRenderer;prepareChunkRenders(Lorg/joml/Matrix4fc;)Lnet/minecraft/client/renderer/chunk/ChunkSectionsToRender;", shift=At.Shift.AFTER)})
    private void litematica_onPreRenderMain(GraphicsResourceAllocator resourceAllocator, DeltaTracker deltaTracker, boolean renderOutline, CameraRenderState cameraState, Matrix4fc modelViewMatrix, GpuBufferSlice terrainFog, Vector4f fogColor, boolean shouldRenderSky, CallbackInfo ci, @Local(name={"profiler"}) ProfilerFiller profiler) {
        this.profiler = profiler;
        LitematicaRenderer.getInstance().capturePreMainValues(cameraState, terrainFog, profiler);
    }

    @Inject(method={"prepareChunkRenders"}, at={@At(value="TAIL")})
    private void litematica_onPrepareBlockLayersPost(Matrix4fc modelViewMatrix, CallbackInfoReturnable<ChunkSectionsToRender> cir) {
        this.litematica$prepareProfiler();
        LitematicaRenderer.getInstance().piecewisePrepareBlockLayers(modelViewMatrix, this.profiler);
    }

    @Inject(method={"lambda$addMainPass$0(Lcom/mojang/blaze3d/buffers/GpuBufferSlice;Lnet/minecraft/client/renderer/state/level/LevelRenderState;Lnet/minecraft/util/profiling/ProfilerFiller;Lnet/minecraft/client/renderer/chunk/ChunkSectionsToRender;Lcom/mojang/blaze3d/resource/ResourceHandle;Lnet/minecraft/client/renderer/feature/FeatureRenderDispatcher$PreparedFrame;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;)V"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/renderer/chunk/ChunkSectionsToRender;renderGroup(Lnet/minecraft/client/renderer/chunk/ChunkSectionLayerGroup;Lcom/mojang/blaze3d/textures/GpuSampler;)V", ordinal=0, shift=At.Shift.AFTER)})
    private void litematica_renderMainSection_Opaque(GpuBufferSlice terrainFog, LevelRenderState levelRenderState, ProfilerFiller profiler, ChunkSectionsToRender chunkSectionsToRender, ResourceHandle<RenderTarget> entityOutlineTarget, FeatureRenderDispatcher.PreparedFrame featureFrame, ResourceHandle<RenderTarget> translucentTarget, ResourceHandle<RenderTarget> mainTarget, ResourceHandle<RenderTarget> itemEntityTarget, ResourceHandle<RenderTarget> particleTarget, CallbackInfo ci) {
        LitematicaRenderer.getInstance().piecewiseDrawBlockLayerGroup(ChunkSectionLayerGroup.OPAQUE, this.chunkLayerSampler);
    }

    @Inject(method={"lambda$addMainPass$0(Lcom/mojang/blaze3d/buffers/GpuBufferSlice;Lnet/minecraft/client/renderer/state/level/LevelRenderState;Lnet/minecraft/util/profiling/ProfilerFiller;Lnet/minecraft/client/renderer/chunk/ChunkSectionsToRender;Lcom/mojang/blaze3d/resource/ResourceHandle;Lnet/minecraft/client/renderer/feature/FeatureRenderDispatcher$PreparedFrame;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;Lcom/mojang/blaze3d/resource/ResourceHandle;)V"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/renderer/chunk/ChunkSectionsToRender;renderGroup(Lnet/minecraft/client/renderer/chunk/ChunkSectionLayerGroup;Lcom/mojang/blaze3d/textures/GpuSampler;)V", ordinal=1, shift=At.Shift.AFTER)})
    private void litematica_renderMainSection_Translucent(GpuBufferSlice terrainFog, LevelRenderState levelRenderState, ProfilerFiller profiler, ChunkSectionsToRender chunkSectionsToRender, ResourceHandle<RenderTarget> entityOutlineTarget, FeatureRenderDispatcher.PreparedFrame featureFrame, ResourceHandle<RenderTarget> translucentTarget, ResourceHandle<RenderTarget> mainTarget, ResourceHandle<RenderTarget> itemEntityTarget, ResourceHandle<RenderTarget> particleTarget, CallbackInfo ci) {
        LitematicaRenderer.getInstance().piecewiseDrawBlockLayerGroup(ChunkSectionLayerGroup.TRANSLUCENT, this.chunkLayerSampler);
    }

    @Inject(method={"render"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/renderer/LevelRenderer;addWeatherPass(Lcom/mojang/blaze3d/framegraph/FrameGraphBuilder;Lcom/mojang/blaze3d/buffers/GpuBufferSlice;)V", shift=At.Shift.BEFORE)})
    private void litematica_renderMainPass(GraphicsResourceAllocator resourceAllocator, DeltaTracker deltaTracker, boolean renderOutline, CameraRenderState cameraState, Matrix4fc modelViewMatrix, GpuBufferSlice terrainFog, Vector4f fogColor, boolean shouldRenderSky, CallbackInfo ci, @Local(name={"frame"}) FrameGraphBuilder frame, @Local(name={"featureFrame"}) FeatureRenderDispatcher.PreparedFrame featureFrame, @Local(name={"profiler"}) ProfilerFiller profiler) {
    }

    @Inject(method={"submitEntities"}, at={@At(value="RETURN")})
    private void litematica_onPostRenderEntities(PoseStack poseStack, LevelRenderState levelRenderState, SubmitNodeCollector output, CallbackInfo ci) {
        this.litematica$prepareProfiler();
        LitematicaRenderer.getInstance().piecewiseRenderEntities(poseStack, levelRenderState, output, this.profiler);
    }

    @Inject(method={"submitBlockEntities"}, at={@At(value="RETURN")})
    private void litematica_onPostRenderBlockEntities(PoseStack poseStack, LevelRenderState levelRenderState, SubmitNodeCollector submitNodeCollector, CallbackInfo ci) {
        this.litematica$prepareProfiler();
        LitematicaRenderer.getInstance().piecewiseRenderBlockEntities(poseStack, levelRenderState, this.submitNodeStorage, this.profiler);
    }

    @Inject(method={"endFrame"}, at={@At(value="TAIL")})
    private void litematica_onEndFrame(CallbackInfo ci) {
        LitematicaRenderer.getInstance().onEndFrame();
    }

    @Inject(method={"close"}, at={@At(value="TAIL")})
    private void litematica_onClose(CallbackInfo ci) {
        LitematicaRenderer.getInstance().onClose();
    }
}

