/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.util.profiling.ActiveProfiler
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.client;

import net.minecraft.util.profiling.ActiveProfiler;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={ActiveProfiler.class})
public interface IMixinActiveProfiler {
    @Accessor(value="started")
    public boolean litematica_isStarted();
}

