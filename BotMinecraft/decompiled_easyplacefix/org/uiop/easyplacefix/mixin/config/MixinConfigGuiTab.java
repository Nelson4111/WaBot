/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.gui.GuiConfigs$ConfigGuiTab
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package org.uiop.easyplacefix.mixin.config;

import fi.dy.masa.litematica.gui.GuiConfigs;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;
import org.uiop.easyplacefix.EasyPlaceFix;

@Mixin(value={GuiConfigs.ConfigGuiTab.class})
public class MixinConfigGuiTab {
    @Inject(method={"values"}, at={@At(value="RETURN")}, cancellable=true, remap=false)
    private static void values(CallbackInfoReturnable<GuiConfigs.ConfigGuiTab[]> cir) {
        GuiConfigs.ConfigGuiTab[] returnValue;
        for (GuiConfigs.ConfigGuiTab tab : returnValue = (GuiConfigs.ConfigGuiTab[])cir.getReturnValue()) {
            if (!EasyPlaceFix.EASY_FIX.equals((Object)tab)) continue;
            return;
        }
        GuiConfigs.ConfigGuiTab[] arr = new GuiConfigs.ConfigGuiTab[returnValue.length + 1];
        System.arraycopy(returnValue, 0, arr, 0, returnValue.length);
        arr[arr.length - 1] = EasyPlaceFix.EASY_FIX;
        cir.setReturnValue((Object)arr);
    }
}

