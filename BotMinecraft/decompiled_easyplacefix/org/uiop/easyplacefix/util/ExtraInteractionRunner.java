/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.MultiPlayerGameMode
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.TrapDoorBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.BlockHitResult
 */
package org.uiop.easyplacefix.util;

import com.tick_ins.tick.RunnableWithCountDown;
import com.tick_ins.tick.TickThread;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.MultiPlayerGameMode;
import net.minecraft.core.BlockPos;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.TrapDoorBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;

public final class ExtraInteractionRunner {
    private ExtraInteractionRunner() {
    }

    public static void run(Minecraft mc, MultiPlayerGameMode interactionManager, InteractionHand usedHand, RelativeBlockHitResult hitResult, int totalClicks, Block block, BlockPos targetPos) {
        int extraClicks = Math.max(0, totalClicks - 1);
        if (extraClicks == 0) {
            return;
        }
        if (block instanceof TrapDoorBlock) {
            ExtraInteractionRunner.delayTrapdoorToggles(mc, interactionManager, usedHand, hitResult, extraClicks, targetPos);
            return;
        }
        for (int i = 1; i < totalClicks; ++i) {
            interactionManager.useItemOn(mc.player, usedHand, (BlockHitResult)hitResult);
            mc.player.swing(usedHand);
        }
    }

    private static void delayTrapdoorToggles(Minecraft mc, MultiPlayerGameMode interactionManager, InteractionHand usedHand, RelativeBlockHitResult hitResult, int extraClicks, BlockPos targetPos) {
        int i = 1;
        while (i <= extraClicks) {
            int delay = i++;
            TickThread.addCountDownTask(new RunnableWithCountDown.Builder().setCount(delay).build(() -> {
                if (mc.player == null || mc.level == null) {
                    return;
                }
                BlockState current = mc.level.getBlockState(targetPos);
                if (!(current.getBlock() instanceof TrapDoorBlock)) {
                    return;
                }
                interactionManager.useItemOn(mc.player, usedHand, (BlockHitResult)hitResult);
                mc.player.swing(usedHand);
            }));
        }
    }
}

