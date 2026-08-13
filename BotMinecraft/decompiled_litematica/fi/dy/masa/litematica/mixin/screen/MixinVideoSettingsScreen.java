/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.compat.iris.IrisCompat
 *  net.minecraft.client.gui.screens.options.VideoSettingsScreen
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.screen;

import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import fi.dy.masa.malilib.compat.iris.IrisCompat;
import net.minecraft.client.gui.screens.options.VideoSettingsScreen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={VideoSettingsScreen.class})
public abstract class MixinVideoSettingsScreen {
    @Inject(method={"removed"}, at={@At(value="TAIL")})
    private void litematica_onVideoSettingsClose(CallbackInfo ci) {
        if (!IrisCompat.hasSodium()) {
            BlockModelCacheSchematic.INSTANCE.onReloadResources();
        }
    }
}

