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
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin;

import net.minecraft.client.multiplayer.MultiPlayerGameMode;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IClientPlayerInteractionManager;

@Mixin(value={MultiPlayerGameMode.class})
public abstract class MixinClientPlayerInteractionManager
implements IClientPlayerInteractionManager {
    @Shadow
    protected abstract void ensureHasSentCarriedItem();

    @Shadow
    protected abstract InteractionResult performUseItemOn(LocalPlayer var1, InteractionHand var2, BlockHitResult var3);

    @Override
    public void syn2(LocalPlayer player, InteractionHand hand, BlockHitResult hitResult) {
        this.performUseItemOn(player, hand, hitResult);
    }

    @Override
    public void syn() {
        this.ensureHasSentCarriedItem();
    }
}

