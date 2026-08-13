/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.IConfigBoolean
 *  fi.dy.masa.malilib.hotkeys.IHotkeyCallback
 *  fi.dy.masa.malilib.hotkeys.KeyCallbackToggleBooleanConfigWithMessage
 *  net.minecraft.client.Minecraft
 */
package me.aleksilassila.litematica.printer.event;

import fi.dy.masa.malilib.config.IConfigBoolean;
import fi.dy.masa.malilib.hotkeys.IHotkeyCallback;
import fi.dy.masa.malilib.hotkeys.KeyCallbackToggleBooleanConfigWithMessage;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.config.Hotkeys;
import net.minecraft.client.Minecraft;

public class KeyCallbacks {
    public static void init(Minecraft mc) {
        Hotkeys.TOGGLE_PRINTING_MODE.getKeybind().setCallback((IHotkeyCallback)new KeyCallbackToggleBooleanConfigWithMessage((IConfigBoolean)Configs.PRINT_MODE));
    }
}

