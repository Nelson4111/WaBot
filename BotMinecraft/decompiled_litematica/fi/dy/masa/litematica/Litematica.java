/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.event.InitializationHandler
 *  fi.dy.masa.malilib.interfaces.IInitializationHandler
 *  net.fabricmc.api.ModInitializer
 *  org.apache.logging.log4j.LogManager
 *  org.apache.logging.log4j.Logger
 */
package fi.dy.masa.litematica;

import fi.dy.masa.litematica.InitHandler;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.malilib.event.InitializationHandler;
import fi.dy.masa.malilib.interfaces.IInitializationHandler;
import net.fabricmc.api.ModInitializer;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Litematica
implements ModInitializer {
    public static final Logger LOGGER = LogManager.getLogger((String)"litematica");

    public void onInitialize() {
        InitializationHandler.getInstance().registerInitializationHandler((IInitializationHandler)new InitHandler());
    }

    public static void debugLog(String msg, Object ... args) {
        if (Configs.Generic.DEBUG_LOGGING.getBooleanValue() || Reference.DEBUG_MODE) {
            String message = "[DEBUG] " + msg;
            LOGGER.info(message, args);
        }
    }
}

