/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.renderer.block.FluidRenderer$Output
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.material.FluidState
 */
package fi.dy.masa.litematica.util.invoker;

import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.renderer.block.FluidRenderer;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.FluidState;

public interface IFluidRendererInvoker {
    public void litematica$setOffsetY(float var1);

    public void litematica$tesselate(BlockAndTintGetter var1, BlockPos var2, FluidRenderer.Output var3, BlockState var4, FluidState var5);
}

