/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.config.IConfigOptionListEntry
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Schema
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.util.StringRepresentable
 *  net.minecraft.util.StringRepresentable$EnumCodec
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.malilib.config.IConfigOptionListEntry;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Schema;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.util.StringRepresentable;

public enum DataFixerMode implements IConfigOptionListEntry,
StringRepresentable
{
    ALWAYS("always", "litematica.gui.label.data_fixer_mode.always"),
    BELOW_1215("below_1215", "litematica.gui.label.data_fixer_mode.below_1215"),
    BELOW_1205("below_1205", "litematica.gui.label.data_fixer_mode.below_1205"),
    BELOW_120X("below_120X", "litematica.gui.label.data_fixer_mode.below_120X"),
    BELOW_119X("below_119X", "litematica.gui.label.data_fixer_mode.below_119X"),
    BELOW_117X("below_117X", "litematica.gui.label.data_fixer_mode.below_117X"),
    BELOW_116X("below_116X", "litematica.gui.label.data_fixer_mode.below_116X"),
    BELOW_113X("below_113X", "litematica.gui.label.data_fixer_mode.below_113X"),
    BELOW_112X("below_112X", "litematica.gui.label.data_fixer_mode.below_112X"),
    NEVER("never", "litematica.gui.label.data_fixer_mode.never");

    public static final StringRepresentable.EnumCodec<DataFixerMode> CODEC;
    public static final ImmutableList<DataFixerMode> VALUES;
    private final String configString;
    private final String translationKey;

    private DataFixerMode(String configString, String translationKey) {
        this.configString = configString;
        this.translationKey = translationKey;
    }

    @Nonnull
    public String getSerializedName() {
        return this.configString;
    }

    public String getStringValue() {
        return this.configString;
    }

    public String getDisplayName() {
        return StringUtils.translate((String)this.translationKey, (Object[])new Object[0]);
    }

    public IConfigOptionListEntry cycle(boolean forward) {
        int id = this.ordinal();
        if (forward) {
            if (++id >= DataFixerMode.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = DataFixerMode.values().length - 1;
        }
        return DataFixerMode.values()[id % DataFixerMode.values().length];
    }

    public DataFixerMode fromString(String name) {
        return DataFixerMode.fromStringStatic(name);
    }

    public static DataFixerMode fromStringStatic(String name) {
        for (DataFixerMode val : VALUES) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return ALWAYS;
    }

    @Nullable
    public static Schema getEffectiveSchema(int dataVersion) {
        DataFixerMode config = (DataFixerMode)Configs.Generic.DATAFIXER_MODE.getOptionListValue();
        Schema schema = Schema.getSchemaByDataVersion((int)dataVersion);
        switch (config.ordinal()) {
            case 0: {
                return schema;
            }
            case 1: {
                if (dataVersion < Schema.SCHEMA_1_21_05.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 2: {
                if (dataVersion < Schema.SCHEMA_1_20_05.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 3: {
                if (dataVersion < Schema.SCHEMA_1_20_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 4: {
                if (dataVersion < Schema.SCHEMA_1_19_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 5: {
                if (dataVersion < Schema.SCHEMA_1_17_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 6: {
                if (dataVersion < Schema.SCHEMA_1_16_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 7: {
                if (dataVersion < Schema.SCHEMA_1_13_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 8: {
                if (dataVersion < Schema.SCHEMA_1_12_00.getDataVersion()) {
                    return schema;
                }
                return null;
            }
            case 9: {
                return null;
            }
        }
        return Schema.getSchemaByDataVersion((int)Configs.Generic.DATAFIXER_DEFAULT_SCHEMA.getDefaultIntegerValue());
    }

    static {
        CODEC = StringRepresentable.fromEnum(DataFixerMode::values);
        VALUES = ImmutableList.copyOf((Object[])DataFixerMode.values());
    }
}

