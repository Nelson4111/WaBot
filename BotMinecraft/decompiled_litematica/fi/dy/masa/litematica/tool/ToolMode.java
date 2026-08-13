/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.mojang.serialization.Codec
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.util.StringRepresentable
 *  net.minecraft.util.StringRepresentable$EnumCodec
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.tool;

import com.google.common.collect.ImmutableList;
import com.mojang.serialization.Codec;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.tool.ToolModeData;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.util.StringRepresentable;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.block.state.BlockState;

public enum ToolMode implements StringRepresentable
{
    AREA_SELECTION("area_selection", "litematica.tool_mode.name.area_selection", false, false),
    SCHEMATIC_PLACEMENT("schematic_placement", "litematica.tool_mode.name.schematic_placement", false, true),
    FILL("fill", "litematica.tool_mode.name.fill", true, false, true, false),
    REPLACE_BLOCK("replace_block", "litematica.tool_mode.name.replace_block", true, false, true, true),
    PASTE_SCHEMATIC("paste_schematic", "litematica.tool_mode.name.paste_schematic", true, true),
    GRID_PASTE("grid_paste", "litematica.tool_mode.name.grid_paste", true, true),
    MOVE("move", "litematica.tool_mode.name.move", true, false),
    DELETE("delete", "litematica.tool_mode.name.delete", true, false),
    REBUILD("rebuild", "litematica.tool_mode.name.rebuild", false, true, true, false);

    public static final StringRepresentable.EnumCodec<ToolMode> CODEC;
    public static final ImmutableList<ToolMode> VALUES;
    private final String configString;
    private final String unlocName;
    private final boolean creativeOnly;
    private final boolean usesSchematic;
    private final boolean usesBlockPrimary;
    private final boolean usesBlockSecondary;
    @Nullable
    private BlockState blockPrimary;
    @Nullable
    private BlockState blockSecondary;

    private ToolMode(String configName, String unlocName, boolean creativeOnly, boolean usesSchematic) {
        this(configName, unlocName, creativeOnly, usesSchematic, false, false);
    }

    private ToolMode(String configName, String unlocName, boolean creativeOnly, boolean usesSchematic, boolean usesBlockPrimary, boolean usesBlockSecondary) {
        this.configString = configName;
        this.unlocName = unlocName;
        this.creativeOnly = creativeOnly;
        this.usesSchematic = usesSchematic;
        this.usesBlockPrimary = usesBlockPrimary;
        this.usesBlockSecondary = usesBlockSecondary;
    }

    public Codec<ToolMode> codec() {
        return CODEC;
    }

    @Nonnull
    public String getSerializedName() {
        return this.configString;
    }

    public boolean getUsesSchematic() {
        if (this == DELETE && ToolModeData.DELETE.getUsePlacement()) {
            return true;
        }
        return this.usesSchematic;
    }

    public boolean getUsesAreaSelection() {
        return !this.getUsesSchematic() || DataManager.getSchematicProjectsManager().hasProjectOpen();
    }

    public boolean getUsesBlockPrimary() {
        return this.usesBlockPrimary;
    }

    public boolean getUsesBlockSecondary() {
        return this.usesBlockSecondary;
    }

    @Nullable
    public BlockState getPrimaryBlock() {
        return this.blockPrimary;
    }

    @Nullable
    public BlockState getSecondaryBlock() {
        return this.blockSecondary;
    }

    public void setPrimaryBlock(@Nullable BlockState state) {
        this.blockPrimary = state;
    }

    public void setSecondaryBlock(@Nullable BlockState state) {
        this.blockSecondary = state;
    }

    public String getName() {
        return StringUtils.translate((String)this.unlocName, (Object[])new Object[0]);
    }

    public ToolMode cycle(Player player, boolean forward) {
        ToolMode[] values = ToolMode.values();
        boolean isCreative = EntityUtils.isCreativeMode(player);
        int numModes = values.length;
        int inc = forward ? 1 : -1;
        int nextId = this.ordinal() + inc;
        for (int i = 0; i < numModes; ++i) {
            if (nextId < 0) {
                nextId = numModes - 1;
            } else if (nextId >= numModes) {
                nextId = 0;
            }
            ToolMode mode = values[nextId];
            if (isCreative || !mode.creativeOnly) {
                return mode;
            }
            nextId += inc;
        }
        return this;
    }

    static {
        CODEC = StringRepresentable.fromEnum(ToolMode::values);
        VALUES = ImmutableList.copyOf((Object[])ToolMode.values());
    }
}

