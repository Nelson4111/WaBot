/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.debug.EntityHitboxDebugRenderer
 *  net.minecraft.util.debug.DebugValueAccess
 *  net.minecraft.util.profiling.ActiveProfiler
 *  net.minecraft.util.profiling.Profiler
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.entity.Entity
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.render;

import fi.dy.masa.litematica.mixin.client.IMixinActiveProfiler;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.util.invoker.IEntityHitboxDebugRendererInvoker;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.debug.EntityHitboxDebugRenderer;
import net.minecraft.util.debug.DebugValueAccess;
import net.minecraft.util.profiling.ActiveProfiler;
import net.minecraft.util.profiling.Profiler;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.Entity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={EntityHitboxDebugRenderer.class})
public abstract class MixinEntityHitboxDebugRenderer
implements IEntityHitboxDebugRendererInvoker {
    @Shadow
    protected abstract void showHitboxes(Entity var1, float var2, boolean var3);

    @Inject(method={"emitGizmos"}, at={@At(value="TAIL")})
    private void litematica_renderEntityHitboxes(double camX, double camY, double camZ, DebugValueAccess debugValues, Frustum frustum, float partialTicks, CallbackInfo ci) {
        ActiveProfiler ps;
        ProfilerFiller profiler = Profiler.get();
        if (profiler instanceof ActiveProfiler && !((IMixinActiveProfiler)(ps = (ActiveProfiler)profiler)).litematica_isStarted()) {
            profiler.startTick();
        }
        LitematicaRenderer.getInstance().renderEntityDebugHitboxes(this, camX, camY, camZ, debugValues, frustum, partialTicks, profiler);
    }

    @Override
    public void litematica$addEntityHitbox(Entity entity, float partialTicks, boolean serverEntity) {
        this.showHitboxes(entity, partialTicks, serverEntity);
    }
}

