/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.phys.BlockHitResult
 */
package org.uiop.easyplacefix;

import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.phys.BlockHitResult;

public interface IClientPlayerInteractionManager {
    default public void syn() {
    }

    default public void syn2(LocalPlayer player, InteractionHand hand, BlockHitResult hitResult) {
    }
}

