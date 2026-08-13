/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.sugar.Local
 *  fi.dy.masa.litematica.util.EasyPlaceProtocol
 *  fi.dy.masa.litematica.util.PlacementHandler
 *  fi.dy.masa.litematica.util.RayTraceUtils$RayTraceWrapper
 *  fi.dy.masa.litematica.util.WorldUtils
 *  net.minecraft.client.Minecraft
 *  net.minecraft.world.InteractionResult
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package org.uiop.easyplacefix.mixin;

import com.llamalad7.mixinextras.sugar.Local;
import fi.dy.masa.litematica.util.EasyPlaceProtocol;
import fi.dy.masa.litematica.util.PlacementHandler;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import net.minecraft.client.Minecraft;
import net.minecraft.world.InteractionResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;
import org.uiop.easyplacefix.config.easyPlacefixConfig;
import org.uiop.easyplacefix.util.EasyPlaceHandler;

@Mixin(value={WorldUtils.class})
public abstract class MixinWorldUtils {
    @Inject(method={"doEasyPlaceAction"}, at={@At(value="INVOKE", target="Lfi/dy/masa/litematica/util/RayTraceUtils$RayTraceWrapper;getHitType()Lfi/dy/masa/litematica/util/RayTraceUtils$RayTraceWrapper$HitType;", ordinal=0)}, cancellable=true, remap=false)
    private static void t1(Minecraft mc, CallbackInfoReturnable<InteractionResult> cir, @Local RayTraceUtils.RayTraceWrapper traceWrapper) {
        if (!easyPlacefixConfig.ENABLE_FIX.getBooleanValue()) {
            return;
        }
        if (EasyPlaceHandler.shouldAllowVanillaInteraction(mc, traceWrapper)) {
            cir.setReturnValue((Object)InteractionResult.PASS);
            return;
        }
        if (PlacementHandler.getEffectiveProtocolVersion() != EasyPlaceProtocol.SLAB_ONLY) {
            return;
        }
        cir.setReturnValue((Object)EasyPlaceHandler.doEasyPlace2(mc, traceWrapper));
    }
}

