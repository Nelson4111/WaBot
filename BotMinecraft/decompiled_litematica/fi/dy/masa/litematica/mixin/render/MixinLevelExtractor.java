/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.sugar.Local
 *  fi.dy.masa.malilib.compat.iris.IrisCompat
 *  net.minecraft.client.Camera
 *  net.minecraft.client.DeltaTracker
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.extract.LevelExtractor
 *  net.minecraft.client.renderer.state.level.LevelRenderState
 *  net.minecraft.util.profiling.ActiveProfiler
 *  net.minecraft.util.profiling.Profiler
 *  net.minecraft.util.profiling.ProfilerFiller
 *  org.jspecify.annotations.Nullable
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.Unique
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.At$Shift
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.render;

import com.llamalad7.mixinextras.sugar.Local;
import fi.dy.masa.litematica.mixin.client.IMixinActiveProfiler;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import fi.dy.masa.malilib.compat.iris.IrisCompat;
import net.minecraft.client.Camera;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.extract.LevelExtractor;
import net.minecraft.client.renderer.state.level.LevelRenderState;
import net.minecraft.util.profiling.ActiveProfiler;
import net.minecraft.util.profiling.Profiler;
import net.minecraft.util.profiling.ProfilerFiller;
import org.jspecify.annotations.Nullable;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={LevelExtractor.class}, priority=850)
public abstract class MixinLevelExtractor {
    @Shadow
    private @Nullable ClientLevel level;
    @Shadow
    @Final
    private Minecraft minecraft;
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

    @Inject(method={"allChanged"}, at={@At(value="RETURN")})
    private void litematica_onLoadRenderers(CallbackInfo ci) {
        if (this.level != null && this.level == this.minecraft.level) {
            this.litematica$prepareProfiler();
            LitematicaRenderer.getInstance().loadRenderers(this.profiler);
            SchematicWorldRefresher.INSTANCE.updateAll();
        }
    }

    @Inject(method={"extract"}, at={@At(value="INVOKE", target="Lnet/minecraft/util/profiling/ProfilerFiller;popPush(Ljava/lang/String;)V", ordinal=2, shift=At.Shift.BEFORE)})
    private void litematica_onExtractLevel(DeltaTracker deltaTracker, Camera camera, float deltaPartialTick, CallbackInfo ci, @Local Frustum cullFrustum) {
        this.litematica$prepareProfiler();
        LitematicaRenderer.getInstance().piecewisePrepare(cullFrustum, this.profiler);
        LitematicaRenderer.getInstance().piecewiseUpdate(camera, this.profiler);
        LitematicaRenderer.getInstance().scheduleTranslucentSorting(camera.position(), this.profiler);
    }

    @Inject(method={"extractVisibleEntities"}, at={@At(value="RETURN")})
    private void litematica_onPostPrepareEntities(Camera camera, Frustum frustum, DeltaTracker deltaTracker, LevelRenderState output, CallbackInfo ci) {
        this.litematica$prepareProfiler();
        LitematicaRenderer.getInstance().piecewisePrepareEntities(camera, frustum, output, deltaTracker, this.profiler);
        if (IrisCompat.hasSodium()) {
            LitematicaRenderer.getInstance().piecewisePrepareBlockEntities(camera, output, deltaTracker.getGameTimeDeltaPartialTick(true), this.profiler);
        }
    }

    @Inject(method={"extractVisibleBlockEntities"}, at={@At(value="RETURN")})
    private void litematica_onPostPrepareBlockEntities(Camera camera, float deltaPartialTick, LevelRenderState levelRenderState, CallbackInfo ci) {
        if (!IrisCompat.hasSodium()) {
            this.litematica$prepareProfiler();
            LitematicaRenderer.getInstance().piecewisePrepareBlockEntities(camera, levelRenderState, deltaPartialTick, this.profiler);
        }
    }
}

