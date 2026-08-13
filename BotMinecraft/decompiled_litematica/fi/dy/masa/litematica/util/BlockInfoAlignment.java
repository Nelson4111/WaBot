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

public enum BlockInfoAlignment implements IConfigOptionListEntry,
StringRepresentable
{
    CENTER("center", "litematica.label.alignment.center"),
    TOP_CENTER("top_center", "litematica.label.alignment.top_center");

    public static final StringRepresentable.EnumCodec<BlockInfoAlignment> CODEC;
    public static final ImmutableList<BlockInfoAlignment> VALUES;
    private final String configString;
    private final String unlocName;

    private BlockInfoAlignment(String configString, String unlocName) {
        this.configString = configString;
        this.unlocName = unlocName;
    }

    @Nonnull
    public String getSerializedName() {
        return this.configString;
    }

    public String getStringValue() {
        return this.configString;
    }

    public String getDisplayName() {
        return StringUtils.translate((String)this.unlocName, (Object[])new Object[0]);
    }

    public IConfigOptionListEntry cycle(boolean forward) {
        int id = this.ordinal();
        if (forward) {
            if (++id >= BlockInfoAlignment.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = BlockInfoAlignment.values().length - 1;
        }
        return BlockInfoAlignment.values()[id % BlockInfoAlignment.values().length];
    }

    public BlockInfoAlignment fromString(String name) {
        return BlockInfoAlignment.fromStringStatic(name);
    }

    public static BlockInfoAlignment fromStringStatic(String name) {
        for (BlockInfoAlignment aligment : BlockInfoAlignment.values()) {
            if (!aligment.configString.equalsIgnoreCase(name)) continue;
            return aligment;
        }
        return CENTER;
    }

    static {
        CODEC = StringRepresentable.fromEnum(BlockInfoAlignment::values);
        VALUES = ImmutableList.copyOf((Object[])BlockInfoAlignment.values());
    }
}

