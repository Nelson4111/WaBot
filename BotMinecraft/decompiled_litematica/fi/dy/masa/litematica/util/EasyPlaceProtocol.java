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

public enum EasyPlaceProtocol implements IConfigOptionListEntry,
StringRepresentable
{
    AUTO("auto", "litematica.gui.label.easy_place_protocol.auto"),
    V3("v3", "litematica.gui.label.easy_place_protocol.v3"),
    V2("v2", "litematica.gui.label.easy_place_protocol.v2"),
    SLAB_ONLY("slabs_only", "litematica.gui.label.easy_place_protocol.slabs_only"),
    NONE("none", "litematica.gui.label.easy_place_protocol.none");

    public static final StringRepresentable.EnumCodec<EasyPlaceProtocol> CODEC;
    public static final ImmutableList<EasyPlaceProtocol> VALUES;
    private final String configString;
    private final String translationKey;

    private EasyPlaceProtocol(String configString, String translationKey) {
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
            if (++id >= EasyPlaceProtocol.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = EasyPlaceProtocol.values().length - 1;
        }
        return EasyPlaceProtocol.values()[id % EasyPlaceProtocol.values().length];
    }

    public EasyPlaceProtocol fromString(String name) {
        return EasyPlaceProtocol.fromStringStatic(name);
    }

    public static EasyPlaceProtocol fromStringStatic(String name) {
        for (EasyPlaceProtocol val : VALUES) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return AUTO;
    }

    static {
        CODEC = StringRepresentable.fromEnum(EasyPlaceProtocol::values);
        VALUES = ImmutableList.copyOf((Object[])EasyPlaceProtocol.values());
    }
}

