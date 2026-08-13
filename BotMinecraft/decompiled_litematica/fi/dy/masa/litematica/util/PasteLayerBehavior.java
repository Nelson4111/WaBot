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

public enum PasteLayerBehavior implements IConfigOptionListEntry,
StringRepresentable
{
    ALL("all", "litematica.gui.label.paste_layer_behavior.all"),
    RENDERED_ONLY("rendered_only", "litematica.gui.label.paste_layer_behavior.rendered_only");

    public static final StringRepresentable.EnumCodec<PasteLayerBehavior> CODEC;
    public static final ImmutableList<PasteLayerBehavior> VALUES;
    private final String configString;
    private final String translationKey;

    private PasteLayerBehavior(String configString, String translationKey) {
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
            if (++id >= PasteLayerBehavior.values().length) {
                id = 0;
            }
        } else if (--id < 0) {
            id = PasteLayerBehavior.values().length - 1;
        }
        return PasteLayerBehavior.values()[id % PasteLayerBehavior.values().length];
    }

    public PasteLayerBehavior fromString(String name) {
        return PasteLayerBehavior.fromStringStatic(name);
    }

    public static PasteLayerBehavior fromStringStatic(String name) {
        for (PasteLayerBehavior val : PasteLayerBehavior.values()) {
            if (!val.configString.equalsIgnoreCase(name)) continue;
            return val;
        }
        return ALL;
    }

    static {
        CODEC = StringRepresentable.fromEnum(PasteLayerBehavior::values);
        VALUES = ImmutableList.copyOf((Object[])PasteLayerBehavior.values());
    }
}

