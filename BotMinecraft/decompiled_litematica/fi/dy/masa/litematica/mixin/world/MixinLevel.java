/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.Level
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Unique
 */
package fi.dy.masa.litematica.mixin.world;

import fi.dy.masa.litematica.util.invoker.IWorldUpdateSuppressor;
import net.minecraft.world.level.Level;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;

@Mixin(value={Level.class})
public class MixinLevel
implements IWorldUpdateSuppressor {
    @Unique
    private boolean litematica_preventBlockUpdates;

    @Override
    public boolean litematica_getShouldPreventBlockUpdates() {
        return this.litematica_preventBlockUpdates;
    }

    @Override
    public void litematica_setShouldPreventBlockUpdates(boolean preventUpdates) {
        this.litematica_preventBlockUpdates = preventUpdates;
    }
}

