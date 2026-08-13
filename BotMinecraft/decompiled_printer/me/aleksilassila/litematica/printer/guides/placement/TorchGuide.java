/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.HorizontalDirectionalBlock
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.HorizontalDirectionalBlock;

public class TorchGuide
extends GeneralPlacementGuide {
    public TorchGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected List<Direction> getPossibleSides() {
        Optional<Direction> facing = TorchGuide.getProperty(this.targetState, HorizontalDirectionalBlock.FACING);
        return facing.map(direction -> Collections.singletonList(direction.getOpposite())).orElseGet(() -> Collections.singletonList(Direction.DOWN));
    }

    @Override
    protected Optional<Block> getRequiredItemAsBlock(LocalPlayer player) {
        return Optional.of(this.state.targetState.getBlock());
    }
}

