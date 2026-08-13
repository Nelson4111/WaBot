/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.litematica.config.Configs
 *  fi.dy.masa.malilib.config.IConfigBase
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Redirect
 */
package me.aleksilassila.litematica.printer.mixin;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.malilib.config.IConfigBase;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import java.util.List;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.config.Hotkeys;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

@Mixin(value={fi.dy.masa.litematica.config.Configs.class}, remap=false)
public class ConfigsMixin {
    @Redirect(method={"loadFromFile"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Configs$Generic;OPTIONS:Lcom/google/common/collect/ImmutableList;", opcode=178))
    private static ImmutableList<IConfigBase> moreOptions() {
        return Configs.getConfigList();
    }

    @Redirect(method={"saveToFile"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Configs$Generic;OPTIONS:Lcom/google/common/collect/ImmutableList;", opcode=178))
    private static ImmutableList<IConfigBase> moreeOptions() {
        return Configs.getConfigList();
    }

    @Redirect(method={"loadFromFile"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Hotkeys;HOTKEY_LIST:Ljava/util/List;", opcode=178))
    private static List<ConfigHotkey> moreHotkeys() {
        return Hotkeys.getHotkeyList();
    }

    @Redirect(method={"saveToFile"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Hotkeys;HOTKEY_LIST:Ljava/util/List;", opcode=178))
    private static List<ConfigHotkey> moreeHotkeys() {
        return Hotkeys.getHotkeyList();
    }
}

