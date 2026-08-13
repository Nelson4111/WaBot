/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.MaLiLibReference
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.SharedConstants
 */
package fi.dy.masa.litematica;

import fi.dy.masa.malilib.MaLiLibReference;
import fi.dy.masa.malilib.util.StringUtils;
import net.minecraft.SharedConstants;

public class Reference {
    public static final String MOD_ID = "litematica";
    public static final String MOD_NAME = "Litematica";
    public static final String MOD_VERSION = StringUtils.getModVersionString((String)"litematica");
    public static final String MC_VERSION = SharedConstants.getCurrentVersion().id();
    public static final String MOD_TYPE = "fabric";
    public static final String MOD_STRING = "litematica-fabric-" + MC_VERSION + "-" + MOD_VERSION;
    public static final boolean LOCAL_DEBUG = false;
    public static final boolean DEBUG_MODE = Reference.isDebug();

    private static boolean isDebug() {
        return MaLiLibReference.DEBUG_MODE || MaLiLibReference.RUNNING_IN_IDE;
    }
}

