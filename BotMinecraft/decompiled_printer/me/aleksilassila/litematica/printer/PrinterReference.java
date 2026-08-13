/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.SharedConstants
 */
package me.aleksilassila.litematica.printer;

import fi.dy.masa.malilib.util.StringUtils;
import net.minecraft.SharedConstants;

public class PrinterReference {
    public static final String MOD_ID = "litematica_printer";
    public static final String MOD_KEY = "litematica-printer";
    public static final String MOD_NAME = "Litematica Printer";
    public static final String MOD_VERSION = StringUtils.getModVersionString((String)"litematica_printer");
    public static final String MC_VERSION = SharedConstants.getCurrentVersion().id();
    public static final String MOD_STRING = "litematica_printer-" + MC_VERSION + "-" + MOD_VERSION;
}

