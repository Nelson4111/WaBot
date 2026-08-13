/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.compat.jade;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.Objects;

public class JadeCompat {
    private static final String JADE_ID = "jade";
    private static final int jadeShift = 35;
    private static boolean hasJade;

    public static void checkForJade() {
        String jadeVer = StringUtils.getModVersionString((String)JADE_ID);
        if (!Objects.equals(jadeVer, "?")) {
            Litematica.debugLog("Detected Jade version {}.", jadeVer);
            hasJade = true;
        } else {
            hasJade = false;
        }
    }

    public static boolean hasJade() {
        return hasJade;
    }

    public static int getJadeShift() {
        if (JadeCompat.hasJade()) {
            return 35;
        }
        return 0;
    }
}

