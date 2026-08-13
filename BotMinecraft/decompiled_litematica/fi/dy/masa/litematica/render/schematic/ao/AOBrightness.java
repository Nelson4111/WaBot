/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  it.unimi.dsi.fastutil.longs.Long2FloatLinkedOpenHashMap
 *  it.unimi.dsi.fastutil.longs.Long2IntLinkedOpenHashMap
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.core.BlockPos
 *  net.minecraft.util.Util
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.render.schematic.ao;

import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import it.unimi.dsi.fastutil.longs.Long2FloatLinkedOpenHashMap;
import it.unimi.dsi.fastutil.longs.Long2IntLinkedOpenHashMap;
import java.util.Objects;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.core.BlockPos;
import net.minecraft.util.Util;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.block.state.BlockState;

public class AOBrightness {
    private boolean enabled;
    private final Long2IntLinkedOpenHashMap colors = (Long2IntLinkedOpenHashMap)Util.make(() -> {
        Long2IntLinkedOpenHashMap long2IntLinkedOpenHashMap = new Long2IntLinkedOpenHashMap(this, 100, 0.25f){
            final /* synthetic */ AOBrightness this$0;
            {
                AOBrightness aOBrightness = this$0;
                Objects.requireNonNull(aOBrightness);
                this.this$0 = aOBrightness;
                super(arg0, arg1);
            }

            protected void rehash(int newN) {
            }
        };
        long2IntLinkedOpenHashMap.defaultReturnValue(Integer.MAX_VALUE);
        return long2IntLinkedOpenHashMap;
    });
    private final Long2FloatLinkedOpenHashMap brightness = (Long2FloatLinkedOpenHashMap)Util.make(() -> {
        Long2FloatLinkedOpenHashMap long2FloatLinkedOpenHashMap = new Long2FloatLinkedOpenHashMap(this, 100, 0.25f){
            final /* synthetic */ AOBrightness this$0;
            {
                AOBrightness aOBrightness = this$0;
                Objects.requireNonNull(aOBrightness);
                this.this$0 = aOBrightness;
                super(arg0, arg1);
            }

            protected void rehash(int newN) {
            }
        };
        long2FloatLinkedOpenHashMap.defaultReturnValue(Float.NaN);
        return long2FloatLinkedOpenHashMap;
    });
    private final IWorldSchematicRenderer.LightGetter lightGetter = (world, pos) -> {
        long key = pos.asLong();
        int color = this.colors.get(key);
        if (color != Integer.MAX_VALUE) {
            return color;
        }
        int val = IWorldSchematicRenderer.LightGetter.DEFAULT.packedLight(world, pos);
        if (this.colors.size() == 100) {
            this.colors.removeFirstInt();
        }
        this.colors.put(key, val);
        return val;
    };

    public boolean isEnabled() {
        return this.enabled;
    }

    public void enable() {
        this.enabled = true;
    }

    public void disable() {
        this.enabled = false;
        this.colors.clear();
        this.brightness.clear();
    }

    public int getLight(BlockState state, BlockAndTintGetter world, BlockPos pos) {
        return IWorldSchematicRenderer.getLightmap(this.enabled ? this.lightGetter : IWorldSchematicRenderer.LightGetter.DEFAULT, world, state, pos);
    }

    public float getShade(BlockState state, BlockAndTintGetter blockView, BlockPos pos) {
        float bright;
        long key = pos.asLong();
        if (this.enabled && !Float.isNaN(bright = this.brightness.get(key))) {
            return bright;
        }
        float val = state.getShadeBrightness((BlockGetter)blockView, pos);
        if (this.enabled) {
            if (this.brightness.size() == 100) {
                this.brightness.removeFirstFloat();
            }
            this.brightness.put(key, val);
        }
        return val;
    }
}

