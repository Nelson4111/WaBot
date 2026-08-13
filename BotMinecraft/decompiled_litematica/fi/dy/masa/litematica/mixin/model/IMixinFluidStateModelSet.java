/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.renderer.block.FluidModel
 *  net.minecraft.client.renderer.block.FluidStateModelSet
 *  net.minecraft.world.level.material.Fluid
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.model;

import java.util.Map;
import net.minecraft.client.renderer.block.FluidModel;
import net.minecraft.client.renderer.block.FluidStateModelSet;
import net.minecraft.world.level.material.Fluid;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={FluidStateModelSet.class})
public interface IMixinFluidStateModelSet {
    @Accessor(value="modelByFluid")
    public Map<Fluid, FluidModel> litematica_getModelByFluid();

    @Accessor(value="missingModel")
    public FluidModel litematica_getMissingModel();
}

