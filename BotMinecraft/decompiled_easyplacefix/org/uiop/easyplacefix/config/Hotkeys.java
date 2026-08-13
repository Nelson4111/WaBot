/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.event.InputEventHandler
 *  fi.dy.masa.malilib.hotkeys.IKeybindManager
 *  fi.dy.masa.malilib.hotkeys.IKeybindProvider
 */
package org.uiop.easyplacefix.config;

import fi.dy.masa.malilib.event.InputEventHandler;
import fi.dy.masa.malilib.hotkeys.IKeybindManager;
import fi.dy.masa.malilib.hotkeys.IKeybindProvider;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

public class Hotkeys {
    public static void init() {
        InputEventHandler.getKeybindManager().registerKeybindProvider(new IKeybindProvider(){

            public void addKeysToMap(IKeybindManager iKeybindManager) {
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.OBSERVER_DETECT.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.ENABLE_FIX.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.IGNORE_NBT.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.LOOSEN_MODE.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.Allow_Interaction.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.CLIENT_ROTATION_REVERT.getKeybind());
                iKeybindManager.addKeybindToMap(easyPlacefixConfig.DIAGNOSTIC_STATUS.getKeybind());
            }

            public void addHotkeys(IKeybindManager iKeybindManager) {
            }
        });
    }
}

