/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.tags.TagKey
 *  net.minecraft.world.level.block.Block
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.util.BlockUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import net.minecraft.tags.TagKey;
import net.minecraft.world.level.block.Block;

public class IgnoreBlockRegistry {
    private final List<Block> blocks = new ArrayList<Block>();
    private final List<TagKey<Block>> blockTags = new ArrayList<TagKey<Block>>();

    public boolean hasBlock(Block block) {
        if (this.blocks.contains(block)) {
            return true;
        }
        for (TagKey<Block> tag : this.blockTags) {
            if (!block.defaultBlockState().is(tag)) continue;
            return true;
        }
        return false;
    }

    public boolean isEmpty() {
        return this.blocks.isEmpty() && this.blockTags.isEmpty();
    }

    public IgnoreBlockRegistry() {
        if (Configs.Visuals.IGNORE_EXISTING_BLOCKS.getBooleanValue()) {
            for (String value : Configs.Visuals.IGNORABLE_EXISTING_BLOCKS.getStrings()) {
                String trimmed = value.trim();
                if (trimmed.startsWith("#")) {
                    Optional<TagKey<Block>> tag = BlockUtils.getBlockTagFromString(trimmed);
                    tag.ifPresent(this.blockTags::add);
                    continue;
                }
                Optional<Block> block = BlockUtils.getBlockFromString(trimmed);
                block.ifPresent(this.blocks::add);
            }
        }
    }
}

