/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.renderer.block.BlockStateModelSet
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.world.level.block.state.BlockState
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.model;

import java.util.Map;
import net.minecraft.client.renderer.block.BlockStateModelSet;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={BlockStateModelSet.class})
public interface IMixinBlockStateModelSet {
    @Accessor(value="modelByState")
    public Map<BlockState, BlockStateModel> litematica_getModelMap();

    @Accessor(value="missingModel")
    public BlockStateModel litematica_getMissingModel();
}

