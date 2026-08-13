/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.multiplayer.MultiPlayerGameMode
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.At$Shift
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.easyplace;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.util.EasyPlaceUtils;
import net.minecraft.client.multiplayer.MultiPlayerGameMode;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={MultiPlayerGameMode.class}, priority=980)
public class MixinClientPlayerInteractionManager_easyPlace {
    @Inject(method={"useItemOn"}, at={@At(value="HEAD")}, cancellable=true)
    private void litematica_onInteractBlock(LocalPlayer player, InteractionHand hand, BlockHitResult blockHit, CallbackInfoReturnable<InteractionResult> cir) {
        if (Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue() && !EasyPlaceUtils.isHandling()) {
            if (EasyPlaceUtils.shouldDoEasyPlaceActions()) {
                if (EasyPlaceUtils.handleEasyPlaceWithMessage()) {
                    cir.setReturnValue((Object)InteractionResult.FAIL);
                }
            } else if (Configs.Generic.PLACEMENT_RESTRICTION.getBooleanValue() && EasyPlaceUtils.handlePlacementRestriction()) {
                cir.setReturnValue((Object)InteractionResult.FAIL);
            }
        }
    }

    @Inject(method={"performUseItemOn"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/player/LocalPlayer;getItemInHand(Lnet/minecraft/world/InteractionHand;)Lnet/minecraft/world/item/ItemStack;", shift=At.Shift.BEFORE)}, cancellable=true)
    private void litematica_onInteractBlockInternal(LocalPlayer player, InteractionHand hand, BlockHitResult blockHit, CallbackInfoReturnable<InteractionResult> cir) {
        if (Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue() && !EasyPlaceUtils.isHandling() && EasyPlaceUtils.shouldDoEasyPlaceActions() && EasyPlaceUtils.handleEasyPlaceWithMessage()) {
            cir.setReturnValue((Object)InteractionResult.FAIL);
        }
    }
}

