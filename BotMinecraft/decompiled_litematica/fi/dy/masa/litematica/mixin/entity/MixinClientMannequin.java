/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.entity.ClientMannequin
 *  net.minecraft.world.entity.EntityType
 *  net.minecraft.world.entity.decoration.Mannequin
 *  net.minecraft.world.level.Level
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package fi.dy.masa.litematica.mixin.entity;

import fi.dy.masa.litematica.util.invoker.IAvatarInvoker;
import net.minecraft.client.entity.ClientMannequin;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.decoration.Mannequin;
import net.minecraft.world.level.Level;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;

@Mixin(value={ClientMannequin.class})
public abstract class MixinClientMannequin
extends Mannequin
implements IAvatarInvoker {
    @Shadow
    protected abstract void updateSkin();

    public MixinClientMannequin(EntityType<Mannequin> entityType, Level level) {
        super(entityType, level);
    }

    @Override
    public void litematica$tryUpdateSkin() {
        this.updateSkin();
    }
}

