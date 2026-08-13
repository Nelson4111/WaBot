/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.BannerBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.StandingSignBlock
 *  net.minecraft.world.level.block.WallBannerBlock
 *  net.minecraft.world.level.block.WallSignBlock
 *  net.minecraft.world.level.block.WallSkullBlock
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.actions.PrepareAction;
import me.aleksilassila.litematica.printer.guides.placement.GeneralPlacementGuide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.BannerBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.StandingSignBlock;
import net.minecraft.world.level.block.WallBannerBlock;
import net.minecraft.world.level.block.WallSignBlock;
import net.minecraft.world.level.block.WallSkullBlock;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;

public class RotatingBlockGuide
extends GeneralPlacementGuide {
    public RotatingBlockGuide(SchematicBlockState state) {
        super(state);
    }

    @Override
    protected List<Direction> getPossibleSides() {
        Block block = this.state.targetState.getBlock();
        if (block instanceof WallSkullBlock || block instanceof WallSignBlock || block instanceof WallBannerBlock) {
            Optional<Direction> side = RotatingBlockGuide.getProperty(this.state.targetState, BlockStateProperties.HORIZONTAL_FACING).map(Direction::getOpposite);
            return side.map(Collections::singletonList).orElseGet(Collections::emptyList);
        }
        return Collections.singletonList(Direction.DOWN);
    }

    @Override
    public boolean skipOtherGuides() {
        return true;
    }

    @Override
    @Nonnull
    public List<Action> execute(LocalPlayer player) {
        PrinterPlacementContext ctx = this.getPlacementContext(player);
        if (ctx == null) {
            return new ArrayList<Action>();
        }
        int rotation = RotatingBlockGuide.getProperty(this.state.targetState, BlockStateProperties.ROTATION_16).orElse(0);
        if (this.targetState.getBlock() instanceof BannerBlock || this.targetState.getBlock() instanceof StandingSignBlock) {
            rotation = (rotation + 8) % 16;
        }
        int distTo0 = rotation > 8 ? 16 - rotation : rotation;
        float yaw = Math.round((float)distTo0 / 8.0f * 180.0f * (float)(rotation > 8 ? -1 : 1));
        List<Action> actions = super.execute(player);
        actions.set(0, new PrepareAction(ctx, yaw, 0.0f));
        return actions;
    }
}

