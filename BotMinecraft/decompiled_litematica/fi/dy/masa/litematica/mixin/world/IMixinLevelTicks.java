/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  it.unimi.dsi.fastutil.longs.Long2ObjectMap
 *  net.minecraft.world.ticks.LevelChunkTicks
 *  net.minecraft.world.ticks.LevelTicks
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.world;

import it.unimi.dsi.fastutil.longs.Long2ObjectMap;
import net.minecraft.world.ticks.LevelChunkTicks;
import net.minecraft.world.ticks.LevelTicks;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={LevelTicks.class})
public interface IMixinLevelTicks<T> {
    @Accessor(value="allContainers")
    public Long2ObjectMap<LevelChunkTicks<T>> litematica_getChunkTickSchedulers();
}

