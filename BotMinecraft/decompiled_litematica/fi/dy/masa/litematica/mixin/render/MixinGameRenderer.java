/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.sugar.Local
 *  net.minecraft.client.Camera
 *  net.minecraft.client.DeltaTracker
 *  net.minecraft.client.renderer.GameRenderer
 *  net.minecraft.client.renderer.state.level.CameraRenderState
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.render;

import com.llamalad7.mixinextras.sugar.Local;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import net.minecraft.client.Camera;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.renderer.GameRenderer;
import net.minecraft.client.renderer.state.level.CameraRenderState;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={GameRenderer.class})
public abstract class MixinGameRenderer {
    @Shadow
    @Final
    private Camera mainCamera;

    @Inject(method={"extractCamera"}, at={@At(value="TAIL")})
    private void litematica_updateCameraState(DeltaTracker deltaTracker, float worldPartialTicks, float cameraEntityPartialTicks, CallbackInfo ci, @Local(name={"cameraState"}) CameraRenderState cameraState) {
        LitematicaRenderer.getInstance().updateCameraState(this.mainCamera, cameraEntityPartialTicks, cameraState);
    }
}

