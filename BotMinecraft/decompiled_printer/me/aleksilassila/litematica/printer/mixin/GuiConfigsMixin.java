/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.litematica.gui.GuiConfigs
 *  fi.dy.masa.malilib.config.IConfigBase
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Redirect
 */
package me.aleksilassila.litematica.printer.mixin;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.malilib.config.IConfigBase;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import java.util.List;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.config.Hotkeys;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

@Mixin(value={GuiConfigs.class}, remap=false)
public class GuiConfigsMixin {
    @Redirect(method={"getConfigs"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Configs$Generic;OPTIONS:Lcom/google/common/collect/ImmutableList;", opcode=178))
    private ImmutableList<IConfigBase> moreOptions() {
        return Configs.getConfigList();
    }

    @Redirect(method={"getConfigs"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Hotkeys;HOTKEY_LIST:Ljava/util/List;", opcode=178))
    private List<ConfigHotkey> moreHotkeys() {
        return Hotkeys.getHotkeyList();
    }
}

