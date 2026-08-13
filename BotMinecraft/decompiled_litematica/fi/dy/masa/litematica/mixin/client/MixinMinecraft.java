/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.util.thread.ReentrantBlockableEventLoop
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.client;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import net.minecraft.client.Minecraft;
import net.minecraft.util.thread.ReentrantBlockableEventLoop;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={Minecraft.class})
public abstract class MixinMinecraft
extends ReentrantBlockableEventLoop<Runnable> {
    public MixinMinecraft(String name, boolean propagatesCrashes) {
        super(name, propagatesCrashes);
    }

    @Inject(method={"tick()V"}, at={@At(value="HEAD")})
    private void litematica_onRunTickStart(CallbackInfo ci) {
        DataManager.onClientTickStart();
    }

    @Inject(method={"onResourceLoadFinished"}, at={@At(value="TAIL")})
    private void litematica_onResourceLoadFinished(CallbackInfo ci) {
        BlockModelCacheSchematic.INSTANCE.onReloadResources();
    }

    @Inject(method={"stop"}, at={@At(value="HEAD")})
    private void litematica_onRunStop(CallbackInfo ci) {
        PlacementManagerDaemonHandler.INSTANCE.endAll();
    }
}

