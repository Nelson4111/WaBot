/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.color.block.BlockColors
 *  net.minecraft.client.renderer.block.BlockModelSet
 *  net.minecraft.client.renderer.block.BlockStateModelSet
 *  net.minecraft.client.renderer.block.model.BlockModel
 *  net.minecraft.world.level.block.state.BlockState
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.model;

import java.util.Map;
import net.minecraft.client.color.block.BlockColors;
import net.minecraft.client.renderer.block.BlockModelSet;
import net.minecraft.client.renderer.block.BlockStateModelSet;
import net.minecraft.client.renderer.block.model.BlockModel;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={BlockModelSet.class})
public interface IMixinBlockModelSet {
    @Accessor(value="blockModelByStateCache")
    public Map<BlockState, BlockModel> litematica_getBlockModelCache();

    @Accessor(value="fallback")
    public BlockStateModelSet litematica_getFallback();

    @Accessor(value="blockColors")
    public BlockColors litematica_getBlockColors();
}

