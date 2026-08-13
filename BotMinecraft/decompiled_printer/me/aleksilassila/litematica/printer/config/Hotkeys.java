/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.litematica.config.Hotkeys
 *  fi.dy.masa.malilib.config.options.ConfigHotkey
 *  fi.dy.masa.malilib.hotkeys.KeybindSettings
 */
package me.aleksilassila.litematica.printer.config;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.malilib.config.options.ConfigHotkey;
import fi.dy.masa.malilib.hotkeys.KeybindSettings;
import java.util.ArrayList;
import java.util.List;

public class Hotkeys {
    private static final String HOTKEY_KEY = "litematica-printer.config.hotkeys";
    public static final ConfigHotkey PRINT = (ConfigHotkey)new ConfigHotkey("print", "V", KeybindSettings.PRESS_ALLOWEXTRA_EMPTY).apply("litematica-printer.config.hotkeys");
    public static final ConfigHotkey TOGGLE_PRINTING_MODE = (ConfigHotkey)new ConfigHotkey("togglePrintingMode", "CAPS_LOCK", KeybindSettings.PRESS_ALLOWEXTRA_EMPTY).apply("litematica-printer.config.hotkeys");

    public static List<ConfigHotkey> getHotkeyList() {
        ArrayList<ConfigHotkey> list = new ArrayList<ConfigHotkey>(fi.dy.masa.litematica.config.Hotkeys.HOTKEY_LIST);
        list.add(PRINT);
        list.add(TOGGLE_PRINTING_MODE);
        return ImmutableList.copyOf(list);
    }
}

