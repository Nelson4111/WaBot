/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.FallingBlock
 *  net.minecraft.world.level.block.state.BlockState
 */
package me.aleksilassila.litematica.printer.guides.placement;

import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GuesserGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.FallingBlock;
import net.minecraft.world.level.block.state.BlockState;

public class FallingBlockGuide
extends GuesserGuide {
    public FallingBlockGuide(SchematicBlockState state) {
        super(state);
    }

    boolean blockPlacement() {
        if (this.targetState.getBlock() instanceof FallingBlock) {
            BlockState below = this.state.world.getBlockState(this.state.blockPos.relative(Direction.DOWN));
            return FallingBlock.isFree((BlockState)below);
        }
        return false;
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (this.blockPlacement()) {
            return false;
        }
        return super.canExecute(player);
    }

    @Override
    public boolean skipOtherGuides() {
        if (this.blockPlacement()) {
            return true;
        }
        return super.skipOtherGuides();
    }
}

