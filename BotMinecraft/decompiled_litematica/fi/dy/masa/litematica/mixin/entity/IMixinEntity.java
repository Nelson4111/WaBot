/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.storage.ValueInput
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 *  org.spongepowered.asm.mixin.gen.Invoker
 */
package fi.dy.masa.litematica.mixin.entity;

import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.ValueInput;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;
import org.spongepowered.asm.mixin.gen.Invoker;

@Mixin(value={Entity.class})
public interface IMixinEntity {
    @Accessor(value="level")
    public void litematica_setWorld(Level var1);

    @Invoker(value="readAdditionalSaveData")
    public void litematica_readCustomData(ValueInput var1);

    @Accessor(value="wasTouchingWater")
    public boolean litematica_isTouchingWater();
}

