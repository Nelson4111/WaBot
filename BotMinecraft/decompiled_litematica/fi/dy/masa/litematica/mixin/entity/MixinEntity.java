/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.entity.Entity
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package fi.dy.masa.litematica.mixin.entity;

import fi.dy.masa.litematica.util.invoker.IEntityInvoker;
import net.minecraft.world.entity.Entity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;

@Mixin(value={Entity.class})
public abstract class MixinEntity
implements IEntityInvoker {
    @Shadow
    protected boolean wasTouchingWater;

    @Override
    public void litematica$toggleTouchingWater(boolean toggle) {
        if (toggle != this.wasTouchingWater) {
            this.wasTouchingWater = toggle;
        }
    }
}

