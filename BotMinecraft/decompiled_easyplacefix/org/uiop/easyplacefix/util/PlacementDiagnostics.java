/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.ChatFormatting
 *  net.minecraft.client.Minecraft
 *  net.minecraft.network.chat.Component
 *  net.minecraft.network.chat.MutableComponent
 */
package org.uiop.easyplacefix.util;

import com.tick_ins.packet.Ping2Server;
import net.minecraft.ChatFormatting;
import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.MutableComponent;
import org.uiop.easyplacefix.config.PlacementPreset;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

public final class PlacementDiagnostics {
    private static final long MESSAGE_INTERVAL_MS = 650L;
    private static long lastMessageTime;
    private static String lastMessageKey;
    private static DiagnosticEvent lastEvent;

    private PlacementDiagnostics() {
    }

    public static void report(String translationKey, Object ... args) {
        PlacementDiagnostics.record(translationKey, args);
        if (!easyPlacefixConfig.DIAGNOSTIC_STATUS.getBooleanValue()) {
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null) {
            return;
        }
        long now = System.currentTimeMillis();
        if (translationKey.equals(lastMessageKey) && now - lastMessageTime < 650L) {
            return;
        }
        lastMessageKey = translationKey;
        lastMessageTime = now;
        MutableComponent message = Component.literal((String)"EasyPlaceFix ").withStyle(ChatFormatting.GOLD).append((Component)Component.literal((String)" | ").withStyle(ChatFormatting.DARK_GRAY)).append((Component)Component.translatable((String)translationKey, (Object[])args).withStyle(ChatFormatting.AQUA)).append((Component)Component.literal((String)" | ").withStyle(ChatFormatting.DARK_GRAY)).append((Component)Component.translatable((String)"easyplacefix.diagnostic.context", (Object[])new Object[]{PlacementDiagnostics.getPresetName(), easyPlacefixConfig.getEffectivePlacementDelayTicks(), Ping2Server.getRtt()}).withStyle(ChatFormatting.GRAY));
        mc.player.sendOverlayMessage((Component)message);
    }

    public static DiagnosticEvent getLastEvent() {
        return lastEvent;
    }

    public static Component getLastEventMessage() {
        DiagnosticEvent event = PlacementDiagnostics.getLastEvent();
        if (event.isEmpty()) {
            return Component.translatable((String)"easyplacefix.report.last.none").withStyle(ChatFormatting.GRAY);
        }
        return Component.translatable((String)"easyplacefix.report.last.entry", (Object[])new Object[]{Component.translatable((String)event.translationKey(), (Object[])event.args()), event.ageSeconds()}).withStyle(ChatFormatting.GRAY);
    }

    private static void record(String translationKey, Object ... args) {
        lastEvent = new DiagnosticEvent(translationKey, args, System.currentTimeMillis());
    }

    private static String getPresetName() {
        return ((PlacementPreset)easyPlacefixConfig.PLACEMENT_PRESET.getOptionListValue()).getDisplayName();
    }

    static {
        lastMessageKey = "";
        lastEvent = DiagnosticEvent.empty();
    }

    public record DiagnosticEvent(String translationKey, Object[] args, long timestampMs) {
        private static DiagnosticEvent empty() {
            return new DiagnosticEvent("", new Object[0], 0L);
        }

        public boolean isEmpty() {
            return this.translationKey.isEmpty();
        }

        public long ageSeconds() {
            if (this.isEmpty()) {
                return 0L;
            }
            return Math.max(0L, (System.currentTimeMillis() - this.timestampMs) / 1000L);
        }
    }
}

