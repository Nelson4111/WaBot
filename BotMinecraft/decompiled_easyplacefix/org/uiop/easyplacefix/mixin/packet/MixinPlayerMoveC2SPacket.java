/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.network.protocol.game.ServerboundMovePlayerPacket
 *  net.minecraft.network.protocol.game.ServerboundMovePlayerPacket$PosRot
 *  net.minecraft.network.protocol.game.ServerboundMovePlayerPacket$Rot
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Mutable
 *  org.spongepowered.asm.mixin.gen.Accessor
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package org.uiop.easyplacefix.mixin.packet;

import com.tick_ins.tick.TickThread;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Mutable;
import org.spongepowered.asm.mixin.gen.Accessor;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={ServerboundMovePlayerPacket.class})
public interface MixinPlayerMoveC2SPacket {
    @Mutable
    @Accessor
    public void setYRot(float var1);

    @Mutable
    @Accessor
    public void setXRot(float var1);

    @Mixin(value={ServerboundMovePlayerPacket.Rot.class})
    public static class LookAndOnGround {
        @Inject(method={"write"}, at={@At(value="HEAD")})
        private void lockLook(FriendlyByteBuf buf, CallbackInfo ci) {
            if (TickThread.notChangPlayerLook) {
                ((MixinPlayerMoveC2SPacket)((Object)this)).setYRot(TickThread.yawLock);
                ((MixinPlayerMoveC2SPacket)((Object)this)).setXRot(TickThread.pitchLock);
            }
        }
    }

    @Mixin(value={ServerboundMovePlayerPacket.PosRot.class})
    public static class Full {
        @Inject(method={"write"}, at={@At(value="HEAD")})
        private void lockLook(FriendlyByteBuf buf, CallbackInfo ci) {
            if (TickThread.notChangPlayerLook) {
                ((MixinPlayerMoveC2SPacket)((Object)this)).setYRot(TickThread.yawLock);
                ((MixinPlayerMoveC2SPacket)((Object)this)).setXRot(TickThread.pitchLock);
            }
        }
    }
}

