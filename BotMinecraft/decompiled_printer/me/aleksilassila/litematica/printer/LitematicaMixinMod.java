/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.fabricmc.api.ModInitializer
 *  net.minecraft.client.Minecraft
 */
package me.aleksilassila.litematica.printer;

import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.PrinterReference;
import me.aleksilassila.litematica.printer.event.KeyCallbacks;
import net.fabricmc.api.ModInitializer;
import net.minecraft.client.Minecraft;

public class LitematicaMixinMod
implements ModInitializer {
    public static Printer printer;

    public void onInitialize() {
        KeyCallbacks.init(Minecraft.getInstance());
        Printer.logger.info("{} initialized.", (Object)PrinterReference.MOD_STRING);
    }
}

