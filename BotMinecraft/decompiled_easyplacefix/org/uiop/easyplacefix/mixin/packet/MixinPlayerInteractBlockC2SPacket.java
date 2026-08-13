/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.network.protocol.game.ServerboundUseItemOnPacket
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.Unique
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package org.uiop.easyplacefix.mixin.packet;

import net.minecraft.core.BlockPos;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.protocol.game.ServerboundUseItemOnPacket;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.uiop.easyplacefix.IisSimpleHitPos;

@Mixin(value={ServerboundUseItemOnPacket.class})
public class MixinPlayerInteractBlockC2SPacket
implements IisSimpleHitPos {
    @Shadow
    @Final
    private InteractionHand hand;
    @Shadow
    @Final
    private BlockHitResult blockHit;
    @Shadow
    @Final
    private int sequence;
    @Unique
    boolean isSimpleHitPos;

    @Override
    public void setSimpleHitPos() {
        this.isSimpleHitPos = true;
    }

    @Inject(method={"write"}, at={@At(value="HEAD")}, cancellable=true)
    public void operationWrite(FriendlyByteBuf buf, CallbackInfo ci) {
        if (this.isSimpleHitPos) {
            buf.writeEnum((Enum)this.hand);
            BlockPos blockPos = this.blockHit.getBlockPos();
            buf.writeBlockPos(blockPos);
            buf.writeEnum((Enum)this.blockHit.getDirection());
            Vec3 vec3d = this.blockHit.getLocation();
            buf.writeFloat((float)vec3d.x);
            buf.writeFloat((float)vec3d.y);
            buf.writeFloat((float)vec3d.z);
            buf.writeBoolean(this.blockHit.isInside());
            buf.writeVarInt(this.sequence);
            ci.cancel();
        }
    }
}

