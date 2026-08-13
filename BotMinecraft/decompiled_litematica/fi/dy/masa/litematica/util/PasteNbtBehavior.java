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

public enum PasteNbtBehavior implements IConfigOptionListEntry,
StringRepresentable
{
    NONE("none", "litematica.gui.label.paste_nbt_behavior.none"),
    PLACE_MODIFY("place_data_modify", "litematica.gui.label.paste_nbt_behavior.place_data_modify"),
    PLACE_CLONE("place_clone", "litematica.gui.label.paste_nbt_behavior.place_clone");

    public static final StringRepresentable.EnumCodec<PasteNbtBehavior> CODEC;
    public static final ImmutableList<PasteNbtBehavior> VALUES;
    private final String configString;
    private final String translationKey;

    private PasteNbtBehavior(String configString, String translationKey) {
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
            if (++id >= PasteNbtBehavior.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = PasteNbtBehavior.values().length - 1;
        }
        return PasteNbtBehavior.values()[id % PasteNbtBehavior.values().length];
    }

    public PasteNbtBehavior fromString(String name) {
        return PasteNbtBehavior.fromStringStatic(name);
    }

    public static PasteNbtBehavior fromStringStatic(String name) {
        for (PasteNbtBehavior val : PasteNbtBehavior.values()) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return NONE;
    }

    static {
        CODEC = StringRepresentable.fromEnum(PasteNbtBehavior::values);
        VALUES = ImmutableList.copyOf((Object[])PasteNbtBehavior.values());
    }
}

