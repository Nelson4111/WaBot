package me.aleksilassila.litematica.printer.config;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.malilib.config.IConfigBase;
import fi.dy.masa.malilib.config.options.ConfigBoolean;
import fi.dy.masa.malilib.config.options.ConfigDouble;
import fi.dy.masa.malilib.config.options.ConfigInteger;
import java.util.ArrayList;

public class Configs {
    private static final String GENERIC_KEY = "litematica-printer.config.generic";
    public static final ConfigInteger PRINTING_INTERVAL = (ConfigInteger)new ConfigInteger("printingInterval", 12, 1, 40).apply("litematica-printer.config.generic");
    public static final ConfigDouble PRINTING_RANGE = (ConfigDouble)new ConfigDouble("printingRange", 5.0, 2.5, 5.0).apply("litematica-printer.config.generic");
    public static final ConfigBoolean PRINT_MODE = (ConfigBoolean)new ConfigBoolean("printingMode", false).apply("litematica-printer.config.generic");
    public static final ConfigBoolean PRINT_DEBUG = (ConfigBoolean)new ConfigBoolean("printingDebug", false).apply("litematica-printer.config.generic");
    public static final ConfigBoolean REPLACE_FLUIDS_SOURCE_BLOCKS = (ConfigBoolean)new ConfigBoolean("replaceFluidSourceBlocks", true).apply("litematica-printer.config.generic");
    public static final ConfigBoolean STRIP_LOGS = (ConfigBoolean)new ConfigBoolean("stripLogs", true).apply("litematica-printer.config.generic");
    public static final ConfigBoolean INTERACT_BLOCKS = (ConfigBoolean)new ConfigBoolean("interactBlocks", true).apply("litematica-printer.config.generic");
    public static final ConfigBoolean PRINT_IN_AIR = (ConfigBoolean)new ConfigBoolean("printInAir", false).apply("litematica-printer.config.generic");
    public static final ConfigBoolean ROTATE = (ConfigBoolean)new ConfigBoolean("rotate", true).apply("litematica-printer.config.generic");
    public static final ConfigBoolean MANUAL_CLICK_ASSIST = (ConfigBoolean)new ConfigBoolean("manualClickAssist", true).apply("litematica-printer.config.generic");
    public static final ConfigBoolean PLACE_WATER = (ConfigBoolean)new ConfigBoolean("placeWater", false).apply("litematica-printer.config.generic");

    public static ImmutableList<IConfigBase> getConfigList() {
        ArrayList<IConfigBase> list = new ArrayList<IConfigBase>(fi.dy.masa.litematica.config.Configs.Generic.OPTIONS);
        list.add(PRINT_MODE);
        list.add(PRINT_DEBUG);
        list.add(PRINTING_INTERVAL);
        list.add(PRINTING_RANGE);
        list.add(REPLACE_FLUIDS_SOURCE_BLOCKS);
        list.add(STRIP_LOGS);
        list.add(INTERACT_BLOCKS);
        list.add(PRINT_IN_AIR);
        list.add(ROTATE);
        list.add(MANUAL_CLICK_ASSIST);
        list.add(PLACE_WATER);
        return ImmutableList.copyOf(list);
    }
}
