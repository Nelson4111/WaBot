/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.gui.GuiConfigs$ConfigGuiTab
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Invoker
 */
package org.uiop.easyplacefix.mixin.config;

import fi.dy.masa.litematica.gui.GuiConfigs;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Invoker;

@Mixin(value={GuiConfigs.ConfigGuiTab.class}, remap=false)
public interface ConfigGuiTabAccessor {
    @Invoker(value="<init>")
    public static GuiConfigs.ConfigGuiTab init(String name, int ordinal, String translationKey) {
        throw new AssertionError();
    }
}

