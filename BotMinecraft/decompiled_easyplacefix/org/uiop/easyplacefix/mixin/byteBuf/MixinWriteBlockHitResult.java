/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.wrapmethod.WrapMethod
 *  com.llamalad7.mixinextras.injector.wrapoperation.Operation
 *  net.minecraft.core.BlockPos
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.byteBuf;

import com.llamalad7.mixinextras.injector.wrapmethod.WrapMethod;
import com.llamalad7.mixinextras.injector.wrapoperation.Operation;
import net.minecraft.core.BlockPos;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

@Mixin(value={FriendlyByteBuf.class})
public abstract class MixinWriteBlockHitResult {
    @Shadow
    public abstract FriendlyByteBuf writeBlockPos(BlockPos var1);

    @Shadow
    public abstract FriendlyByteBuf writeEnum(Enum<?> var1);

    @Shadow
    public abstract FriendlyByteBuf writeFloat(float var1);

    @Shadow
    public abstract FriendlyByteBuf writeBoolean(boolean var1);

    @WrapMethod(method={"writeBlockHitResult"})
    public void w(BlockHitResult hitResult, Operation<Void> original) {
        if (hitResult instanceof RelativeBlockHitResult) {
            this.writeBlockPos(hitResult.getBlockPos());
            this.writeEnum((Enum<?>)hitResult.getDirection());
            Vec3 vec3d = hitResult.getLocation();
            this.writeFloat((float)vec3d.x);
            this.writeFloat((float)vec3d.y);
            this.writeFloat((float)vec3d.z);
            this.writeBoolean(hitResult.isInside());
            this.writeBoolean(hitResult.isWorldBorderHit());
        } else {
            original.call(new Object[]{hitResult});
        }
    }
}

