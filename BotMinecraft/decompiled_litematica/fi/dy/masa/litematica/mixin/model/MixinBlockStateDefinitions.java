/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableMap$Builder
 *  net.minecraft.client.resources.model.BlockStateDefinitions
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.StateDefinition
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Mutable
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.model;

import com.google.common.collect.ImmutableMap;
import fi.dy.masa.litematica.render.schematic.FallbackBlocks;
import java.util.Map;
import net.minecraft.client.resources.model.BlockStateDefinitions;
import net.minecraft.resources.Identifier;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.StateDefinition;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Mutable;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={BlockStateDefinitions.class})
public class MixinBlockStateDefinitions {
    @Mutable
    @Final
    @Shadow
    private static Map<Identifier, StateDefinition<Block, BlockState>> STATIC_DEFINITIONS;

    @Inject(method={"<clinit>"}, at={@At(value="RETURN")})
    private static void litematica$fillFallbackBlocks(CallbackInfo ci) {
        FallbackBlocks.register();
        ImmutableMap.Builder builder = new ImmutableMap.Builder();
        builder.putAll(STATIC_DEFINITIONS);
        for (Identifier id : FallbackBlocks.ID_TO_STATE_MANAGER.keySet()) {
            builder.put((Object)id, FallbackBlocks.ID_TO_STATE_MANAGER.get(id));
        }
        STATIC_DEFINITIONS = builder.build();
    }
}

