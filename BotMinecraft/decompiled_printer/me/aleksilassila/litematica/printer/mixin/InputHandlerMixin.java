/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.event.InputHandler
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Redirect
 */
package me.aleksilassila.litematica.printer.mixin;

import fi.dy.masa.litematica.event.InputHandler;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import java.util.List;
import me.aleksilassila.litematica.printer.config.Hotkeys;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

@Mixin(value={InputHandler.class}, remap=false)
public class InputHandlerMixin {
    @Redirect(method={"addHotkeys"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Hotkeys;HOTKEY_LIST:Ljava/util/List;", opcode=178))
    private List<ConfigHotkey> moreHotkeys() {
        return Hotkeys.getHotkeyList();
    }

    @Redirect(method={"addKeysToMap"}, at=@At(value="FIELD", target="Lfi/dy/masa/litematica/config/Hotkeys;HOTKEY_LIST:Ljava/util/List;", opcode=178))
    private List<ConfigHotkey> moreeHotkeys() {
        return Hotkeys.getHotkeyList();
    }
}

