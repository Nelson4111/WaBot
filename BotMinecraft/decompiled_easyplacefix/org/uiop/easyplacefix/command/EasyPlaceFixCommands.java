/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.brigadier.builder.LiteralArgumentBuilder
 *  net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback
 *  net.fabricmc.fabric.api.client.command.v2.ClientCommands
 *  net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource
 *  net.fabricmc.loader.api.FabricLoader
 *  net.minecraft.ChatFormatting
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.PlayerInfo
 *  net.minecraft.client.multiplayer.ServerData
 *  net.minecraft.network.chat.Component
 */
package org.uiop.easyplacefix.command;

import com.mojang.brigadier.builder.LiteralArgumentBuilder;
import com.tick_ins.packet.Ping2Server;
import java.util.List;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.command.v2.ClientCommands;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.ChatFormatting;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.PlayerInfo;
import net.minecraft.client.multiplayer.ServerData;
import net.minecraft.network.chat.Component;
import org.uiop.easyplacefix.config.PlacementPreset;
import org.uiop.easyplacefix.config.easyPlacefixConfig;
import org.uiop.easyplacefix.util.PlacementDiagnostics;

public final class EasyPlaceFixCommands {
    private EasyPlaceFixCommands() {
    }

    public static void register() {
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> dispatcher.register((LiteralArgumentBuilder)((LiteralArgumentBuilder)((LiteralArgumentBuilder)ClientCommands.literal((String)"easyplacefix").then(ClientCommands.literal((String)"report").executes(context -> EasyPlaceFixCommands.sendReport((FabricClientCommandSource)context.getSource(), false)))).then(ClientCommands.literal((String)"copy-report").executes(context -> EasyPlaceFixCommands.sendReport((FabricClientCommandSource)context.getSource(), true)))).then(ClientCommands.literal((String)"last").executes(context -> EasyPlaceFixCommands.sendLastDiagnostic((FabricClientCommandSource)context.getSource())))));
    }

    private static int sendReport(FabricClientCommandSource source, boolean copyToClipboard) {
        List<Component> lines = EasyPlaceFixCommands.buildReportLines(source.getClient());
        for (Component line : lines) {
            source.sendFeedback(line);
        }
        if (copyToClipboard) {
            source.getClient().keyboardHandler.setClipboard(EasyPlaceFixCommands.buildPlainReport(source.getClient()));
            source.sendFeedback((Component)Component.translatable((String)"easyplacefix.report.copied").withStyle(ChatFormatting.GREEN));
        }
        return 1;
    }

    private static int sendLastDiagnostic(FabricClientCommandSource source) {
        source.sendFeedback((Component)Component.literal((String)"[EasyPlaceFix] ").withStyle(ChatFormatting.GOLD).append(PlacementDiagnostics.getLastEventMessage()));
        return 1;
    }

    private static List<Component> buildReportLines(Minecraft mc) {
        String server = EasyPlaceFixCommands.getServerName(mc);
        int vanillaLatency = EasyPlaceFixCommands.getVanillaLatency(mc);
        return List.of(Component.literal((String)"==== EasyPlaceFix compatibility report ====").withStyle(ChatFormatting.GOLD), EasyPlaceFixCommands.entry("easyplacefix.report.mod", EasyPlaceFixCommands.getModVersion("easyplacefix")), EasyPlaceFixCommands.entry("easyplacefix.report.minecraft", mc.getLaunchedVersion()), EasyPlaceFixCommands.entry("easyplacefix.report.java", System.getProperty("java.version")), EasyPlaceFixCommands.entry("easyplacefix.report.fabric_loader", FabricLoader.getInstance().getModContainer("fabricloader").map(container -> container.getMetadata().getVersion().getFriendlyString()).orElse("unknown")), EasyPlaceFixCommands.entry("easyplacefix.report.fabric_api", EasyPlaceFixCommands.getModVersion("fabric-api")), EasyPlaceFixCommands.entry("easyplacefix.report.litematica", EasyPlaceFixCommands.getModVersion("litematica")), EasyPlaceFixCommands.entry("easyplacefix.report.malilib", EasyPlaceFixCommands.getModVersion("malilib")), EasyPlaceFixCommands.entry("easyplacefix.report.server", server), EasyPlaceFixCommands.entry("easyplacefix.report.ping", EasyPlaceFixCommands.formatPing(vanillaLatency, Ping2Server.getRtt())), EasyPlaceFixCommands.entry("easyplacefix.report.enabled", easyPlacefixConfig.ENABLE_FIX.getBooleanValue()), EasyPlaceFixCommands.entry("easyplacefix.report.preset", ((PlacementPreset)easyPlacefixConfig.PLACEMENT_PRESET.getOptionListValue()).getDisplayName()), EasyPlaceFixCommands.entry("easyplacefix.report.delay", easyPlacefixConfig.getEffectivePlacementDelayTicks()), EasyPlaceFixCommands.entry("easyplacefix.report.diagnostics", easyPlacefixConfig.DIAGNOSTIC_STATUS.getBooleanValue()), Component.literal((String)"[EasyPlaceFix] ").withStyle(ChatFormatting.GOLD).append(PlacementDiagnostics.getLastEventMessage()));
    }

    private static String buildPlainReport(Minecraft mc) {
        int vanillaLatency = EasyPlaceFixCommands.getVanillaLatency(mc);
        PlacementDiagnostics.DiagnosticEvent last = PlacementDiagnostics.getLastEvent();
        return String.join((CharSequence)System.lineSeparator(), "==== EasyPlaceFix compatibility report ====", "EasyPlaceFix: " + EasyPlaceFixCommands.getModVersion("easyplacefix"), "Minecraft: " + mc.getLaunchedVersion(), "Java: " + System.getProperty("java.version"), "Fabric Loader: " + EasyPlaceFixCommands.getModVersion("fabricloader"), "Fabric API: " + EasyPlaceFixCommands.getModVersion("fabric-api"), "Litematica: " + EasyPlaceFixCommands.getModVersion("litematica"), "MaLiLib: " + EasyPlaceFixCommands.getModVersion("malilib"), "Server: " + EasyPlaceFixCommands.getServerName(mc), "Ping: " + EasyPlaceFixCommands.formatPing(vanillaLatency, Ping2Server.getRtt()), "Enable Fix: " + easyPlacefixConfig.ENABLE_FIX.getBooleanValue(), "Placement Preset: " + ((PlacementPreset)easyPlacefixConfig.PLACEMENT_PRESET.getOptionListValue()).getDisplayName(), "Effective Delay: " + easyPlacefixConfig.getEffectivePlacementDelayTicks() + " ticks", "Diagnostics: " + easyPlacefixConfig.DIAGNOSTIC_STATUS.getBooleanValue(), "Last diagnostic: " + (String)(last.isEmpty() ? "none" : last.translationKey() + " (" + last.ageSeconds() + "s ago)"));
    }

    private static Component entry(String key, Object value) {
        return Component.literal((String)"[EasyPlaceFix] ").withStyle(ChatFormatting.GOLD).append((Component)Component.translatable((String)key).withStyle(ChatFormatting.YELLOW)).append((Component)Component.literal((String)": ").withStyle(ChatFormatting.DARK_GRAY)).append((Component)Component.literal((String)String.valueOf(value)).withStyle(ChatFormatting.GRAY));
    }

    private static String getModVersion(String modId) {
        return FabricLoader.getInstance().getModContainer(modId).map(container -> container.getMetadata().getVersion().getFriendlyString()).orElse("not loaded");
    }

    private static String getServerName(Minecraft mc) {
        if (mc.hasSingleplayerServer()) {
            return "Singleplayer";
        }
        ServerData serverData = mc.getCurrentServer();
        if (serverData != null) {
            return serverData.ip;
        }
        return "Not connected";
    }

    private static int getVanillaLatency(Minecraft mc) {
        if (mc.player == null || mc.getConnection() == null) {
            return -1;
        }
        PlayerInfo info = mc.getConnection().getPlayerInfo(mc.player.getUUID());
        return info == null ? -1 : info.getLatency();
    }

    private static String formatPing(int vanillaLatency, long measuredRtt) {
        Object vanilla = vanillaLatency < 0 ? "unknown" : vanillaLatency + " ms";
        return (String)vanilla + " vanilla / " + measuredRtt + " ms measured";
    }
}

