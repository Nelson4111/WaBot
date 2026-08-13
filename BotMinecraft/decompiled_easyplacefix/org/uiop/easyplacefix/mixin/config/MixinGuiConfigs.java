/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.data.DataManager
 *  fi.dy.masa.litematica.gui.GuiConfigs
 *  fi.dy.masa.litematica.gui.GuiConfigs$ConfigGuiTab
 *  fi.dy.masa.malilib.config.IConfigBase
 *  fi.dy.masa.malilib.gui.GuiConfigsBase$ConfigOptionWrapper
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package org.uiop.easyplacefix.mixin.config;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.malilib.config.IConfigBase;
import fi.dy.masa.malilib.gui.GuiConfigsBase;
import java.util.Arrays;
import java.util.List;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;
import org.uiop.easyplacefix.EasyPlaceFix;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

@Mixin(value={GuiConfigs.class})
public abstract class MixinGuiConfigs {
    @Inject(at={@At(value="HEAD")}, method={"getConfigs"}, cancellable=true, remap=false)
    private void getConfigs(CallbackInfoReturnable<List<GuiConfigsBase.ConfigOptionWrapper>> cir) {
        GuiConfigs.ConfigGuiTab tab = DataManager.getConfigGuiTab();
        if (EasyPlaceFix.EASY_FIX.equals((Object)tab)) {
            List<IConfigBase> list1 = Arrays.asList(easyPlacefixConfig.getExtraGenericConfigs());
            cir.setReturnValue((Object)GuiConfigsBase.ConfigOptionWrapper.createFor(list1));
        }
    }
}

