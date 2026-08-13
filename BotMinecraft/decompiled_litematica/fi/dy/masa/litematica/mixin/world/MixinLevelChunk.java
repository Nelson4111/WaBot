/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.wrapoperation.Operation
 *  com.llamalad7.mixinextras.injector.wrapoperation.WrapOperation
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.chunk.LevelChunk
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Slice
 */
package fi.dy.masa.litematica.mixin.world;

import com.llamalad7.mixinextras.injector.wrapoperation.Operation;
import com.llamalad7.mixinextras.injector.wrapoperation.WrapOperation;
import fi.dy.masa.litematica.util.WorldUtils;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.chunk.LevelChunk;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Slice;

@Mixin(value={LevelChunk.class})
public abstract class MixinLevelChunk {
    @WrapOperation(method={"setBlockState"}, slice={@Slice(from=@At(value="INVOKE", target="Lnet/minecraft/world/level/chunk/LevelChunkSection;getBlockState(III)Lnet/minecraft/world/level/block/state/BlockState;"))}, at={@At(value="INVOKE", target="Lnet/minecraft/world/level/Level;isClientSide()Z", ordinal=0)})
    private boolean litematica_redirectIsRemote(Level instance, Operation<Boolean> original) {
        return WorldUtils.shouldPreventBlockUpdates(instance) || (Boolean)original.call(new Object[]{instance}) != false;
    }
}

