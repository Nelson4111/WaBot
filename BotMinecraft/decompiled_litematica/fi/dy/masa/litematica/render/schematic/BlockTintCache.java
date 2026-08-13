/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  it.unimi.dsi.fastutil.ints.IntArrayList
 *  it.unimi.dsi.fastutil.ints.IntList
 *  it.unimi.dsi.fastutil.objects.ObjectArrayList
 *  net.minecraft.client.color.block.BlockColors
 *  net.minecraft.client.color.block.BlockTintSource
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.render.schematic.BlockModelCacheSchematic;
import it.unimi.dsi.fastutil.ints.IntArrayList;
import it.unimi.dsi.fastutil.ints.IntList;
import it.unimi.dsi.fastutil.objects.ObjectArrayList;
import java.util.List;
import net.minecraft.client.color.block.BlockColors;
import net.minecraft.client.color.block.BlockTintSource;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.state.BlockState;

public class BlockTintCache {
    private final List<BlockTintSource> tintSources = new ObjectArrayList();
    private final IntList tintValues = new IntArrayList();
    private BlockColors blockColors;
    private int lastTintIndex = -1;
    private int lastTintValue = -1;
    private boolean initialized = false;

    protected BlockTintCache() {
    }

    protected void onReloadResources() {
        this.blockColors = BlockModelCacheSchematic.INSTANCE.blockColors();
    }

    private BlockColors blockColors() {
        if (this.blockColors == null) {
            this.blockColors = BlockModelCacheSchematic.INSTANCE.blockColors();
        }
        return this.blockColors;
    }

    protected int get(BlockAndTintGetter world, BlockState state, BlockPos pos, int tintIndex) {
        if (this.lastTintIndex == tintIndex) {
            return this.lastTintValue;
        }
        int tint = this.calculate(world, state, pos, tintIndex);
        this.lastTintIndex = tintIndex;
        this.lastTintValue = tint;
        return tint;
    }

    private void configure(BlockState state) {
        List sources = this.blockColors().getTintSources(state);
        int count = sources.size();
        if (count > 0) {
            this.tintSources.addAll(sources);
            for (int i = 0; i < count; ++i) {
                this.tintValues.add(-1);
            }
        }
    }

    private int calculate(BlockAndTintGetter world, BlockState state, BlockPos pos, int tintIndex) {
        if (!this.initialized) {
            this.configure(state);
            this.initialized = true;
        }
        if (tintIndex >= this.tintSources.size()) {
            return -1;
        }
        BlockTintSource source = this.tintSources.set(tintIndex, null);
        if (source != null) {
            int value = source.colorInWorld(state, world, pos);
            this.tintValues.set(tintIndex, value);
            return value;
        }
        return this.tintValues.getInt(tintIndex);
    }

    protected void resetTintCache() {
        this.lastTintIndex = -1;
        if (this.initialized) {
            this.tintSources.clear();
            this.tintValues.clear();
            this.lastTintValue = -1;
            this.initialized = false;
        }
    }
}

