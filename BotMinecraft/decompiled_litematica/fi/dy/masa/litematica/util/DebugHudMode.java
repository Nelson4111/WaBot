/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.config.IConfigOptionListEntry
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nonnull
 *  net.minecraft.util.StringRepresentable
 *  net.minecraft.util.StringRepresentable$EnumCodec
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.malilib.config.IConfigOptionListEntry;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nonnull;
import net.minecraft.util.StringRepresentable;

public enum DebugHudMode implements IConfigOptionListEntry,
StringRepresentable
{
    DEFAULT("default", "litematica.gui.label.debug_info_mode.default"),
    VANILLA("vanilla", "litematica.gui.label.debug_info_mode.vanilla"),
    NONE("none", "litematica.gui.label.debug_info_mode.none");

    public static final StringRepresentable.EnumCodec<DebugHudMode> CODEC;
    public static final ImmutableList<DebugHudMode> VALUES;
    private final String configString;
    private final String translationKey;

    private DebugHudMode(String configString, String translationKey) {
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

    public DebugHudMode cycle(boolean forward) {
        int id = this.ordinal();
        if (forward) {
            if (++id >= DebugHudMode.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = DebugHudMode.values().length - 1;
        }
        return DebugHudMode.values()[id % DebugHudMode.values().length];
    }

    public DebugHudMode fromString(String name) {
        return DebugHudMode.fromStringStatic(name);
    }

    public static DebugHudMode fromStringStatic(String name) {
        for (DebugHudMode val : DebugHudMode.values()) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return DEFAULT;
    }

    static {
        CODEC = StringRepresentable.fromEnum(DebugHudMode::values);
        VALUES = ImmutableList.copyOf((Object[])DebugHudMode.values());
    }
}

