/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.server.MinecraftServer
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.server;

import fi.dy.masa.litematica.scheduler.TaskScheduler;
import net.minecraft.server.MinecraftServer;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={MinecraftServer.class})
public abstract class MixinMinecraftServer {
    @Shadow
    public abstract boolean isDedicatedServer();

    @Shadow
    public abstract boolean shouldInformAdmins();

    @Inject(method={"logTickMethodTime"}, at={@At(value="HEAD")})
    private void litematica_onServerTickOmegaHackFixBecauseLunarBreaksMinecraftEvenThoughABooleanSupplierIsAlwaysSupposedToBeThereEvenAccordingToMojangMappingsButIsNotWhenYouAreRunningLunarAndTheyCannotExplainWhyThisWouldBreakButItDoesEvenThoughNothingHasChangedInMinecraftUnlessYouArePlayingWithLunar(long tickStartTime, CallbackInfo ci) {
        if (!this.isDedicatedServer() && this.shouldInformAdmins()) {
            TaskScheduler.getInstanceServer().runTasks();
        }
    }
}

