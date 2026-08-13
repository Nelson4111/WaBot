/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.compat.iris.IrisCompat
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.Options
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.client;

import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.malilib.compat.iris.IrisCompat;
import net.minecraft.client.Minecraft;
import net.minecraft.client.Options;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={Options.class})
public abstract class MixinOptions {
    @Shadow
    protected Minecraft minecraft;

    @Inject(method={"save"}, at={@At(value="TAIL")})
    private void litematica_onOptionsSave(CallbackInfo ci) {
        if (IrisCompat.hasSodium() && this.minecraft.level != null) {
            BlockModelCacheSchematic.INSTANCE.onReloadResources();
        }
    }
}

