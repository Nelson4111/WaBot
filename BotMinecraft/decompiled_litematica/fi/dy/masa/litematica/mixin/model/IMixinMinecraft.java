/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.renderer.item.ItemModelResolver
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.model;

import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.item.ItemModelResolver;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={Minecraft.class})
public interface IMixinMinecraft {
    @Accessor(value="itemModelResolver")
    public ItemModelResolver litematica_getItemModelResolver();
}

