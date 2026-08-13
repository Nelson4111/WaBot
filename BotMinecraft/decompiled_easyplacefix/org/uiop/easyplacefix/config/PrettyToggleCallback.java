/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.IConfigBoolean
 *  fi.dy.masa.malilib.hotkeys.IHotkeyCallback
 *  fi.dy.masa.malilib.hotkeys.IKeybind
 *  fi.dy.masa.malilib.hotkeys.KeyAction
 *  net.minecraft.ChatFormatting
 *  net.minecraft.client.Minecraft
 *  net.minecraft.network.chat.Component
 *  net.minecraft.network.chat.MutableComponent
 */
package org.uiop.easyplacefix.config;

import fi.dy.masa.malilib.config.IConfigBoolean;
import fi.dy.masa.malilib.hotkeys.IHotkeyCallback;
import fi.dy.masa.malilib.hotkeys.IKeybind;
import fi.dy.masa.malilib.hotkeys.KeyAction;
import net.minecraft.ChatFormatting;
import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.MutableComponent;

public class PrettyToggleCallback
implements IHotkeyCallback {
    private final IConfigBoolean config;
    private final String labelKey;

    public PrettyToggleCallback(IConfigBoolean config, String labelKey) {
        this.config = config;
        this.labelKey = labelKey;
    }

    public boolean onKeyAction(KeyAction action, IKeybind keybind) {
        this.config.toggleBooleanValue();
        Minecraft mc = Minecraft.getInstance();
        if (mc.player != null) {
            boolean enabled = this.config.getBooleanValue();
            MutableComponent state = Component.translatable((String)(enabled ? "easyplacefix.message.state.on" : "easyplacefix.message.state.off")).withStyle(enabled ? ChatFormatting.GREEN : ChatFormatting.RED);
            MutableComponent message = Component.literal((String)"EasyPlaceFix ").withStyle(ChatFormatting.GOLD).append((Component)Component.literal((String)":: ").withStyle(ChatFormatting.DARK_GRAY)).append((Component)Component.translatable((String)this.labelKey).withStyle(ChatFormatting.YELLOW)).append((Component)Component.literal((String)" -> ").withStyle(ChatFormatting.GRAY)).append((Component)state);
            mc.player.sendOverlayMessage((Component)message);
        }
        return true;
    }
}

