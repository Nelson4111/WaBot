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

public enum ReplaceBehavior implements IConfigOptionListEntry,
StringRepresentable
{
    NONE("none", "litematica.gui.label.replace_behavior.none"),
    ALL("all", "litematica.gui.label.replace_behavior.all"),
    WITH_NON_AIR("with_non_air", "litematica.gui.label.replace_behavior.with_non_air");

    public static final StringRepresentable.EnumCodec<ReplaceBehavior> CODEC;
    public static final ImmutableList<ReplaceBehavior> VALUES;
    private final String configString;
    private final String translationKey;

    private ReplaceBehavior(String configString, String translationKey) {
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
            if (++id >= ReplaceBehavior.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = ReplaceBehavior.values().length - 1;
        }
        return ReplaceBehavior.values()[id % ReplaceBehavior.values().length];
    }

    public ReplaceBehavior fromString(String name) {
        return ReplaceBehavior.fromStringStatic(name);
    }

    public static ReplaceBehavior fromStringStatic(String name) {
        for (ReplaceBehavior val : VALUES) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return NONE;
    }

    static {
        CODEC = StringRepresentable.fromEnum(ReplaceBehavior::values);
        VALUES = ImmutableList.copyOf((Object[])ReplaceBehavior.values());
    }
}

