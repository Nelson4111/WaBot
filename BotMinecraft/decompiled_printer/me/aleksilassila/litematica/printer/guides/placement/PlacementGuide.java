/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.util.ItemUtils
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.item.BlockItem
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.LiquidBlock
 *  net.minecraft.world.level.block.LiquidBlockContainer
 *  net.minecraft.world.level.block.SignBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.shapes.Shapes
 *  net.minecraft.world.phys.shapes.VoxelShape
 */
package me.aleksilassila.litematica.printer.guides.placement;

import fi.dy.masa.litematica.util.ItemUtils;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.actions.PrepareAction;
import me.aleksilassila.litematica.printer.actions.ReleaseShiftAction;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.guides.Guide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import me.aleksilassila.litematica.printer.implementation.actions.InteractActionImpl;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.LiquidBlock;
import net.minecraft.world.level.block.LiquidBlockContainer;
import net.minecraft.world.level.block.SignBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;

public abstract class PlacementGuide
extends Guide {
    public PlacementGuide(SchematicBlockState state) {
        super(state);
    }

    protected ItemStack getBlockItem(BlockState state) {
        return ItemUtils.getItemForBlock((Level)this.state.world, (BlockPos)this.state.blockPos, (BlockState)state, (boolean)true);
    }

    protected Optional<Block> getRequiredItemAsBlock(LocalPlayer player) {
        Optional<ItemStack> requiredItem = this.getRequiredItem(player);
        if (requiredItem.isEmpty()) {
            return Optional.empty();
        }
        ItemStack itemStack = requiredItem.get();
        if (itemStack.getItem() instanceof BlockItem) {
            return Optional.of(((BlockItem)itemStack.getItem()).getBlock());
        }
        return Optional.empty();
    }

    @Override
    @Nonnull
    protected List<ItemStack> getRequiredItems() {
        Printer.printDebug("PlacementGuide#getRequiredItems() - target state [{}]", this.state.targetState.toString());
        return Collections.singletonList(this.getBlockItem(this.state.targetState));
    }

    protected abstract boolean getUseShift(SchematicBlockState var1);

    @Nullable
    public abstract PrinterPlacementContext getPlacementContext(LocalPlayer var1);

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (!super.canExecute(player)) {
            return false;
        }
        List<ItemStack> requiredItems = this.getRequiredItems();
        if (requiredItems.isEmpty() || requiredItems.stream().allMatch(i -> i.is((Object)Items.AIR))) {
            return false;
        }
        PrinterPlacementContext ctx = this.getPlacementContext(player);
        if (ctx == null || !ctx.canPlace()) {
            return false;
        }
        if (!Configs.REPLACE_FLUIDS_SOURCE_BLOCKS.getBooleanValue() && PlacementGuide.getProperty(this.state.currentState, LiquidBlock.LEVEL).orElse(1) == 0) {
            return false;
        }
        BlockState resultState = this.getRequiredItemAsBlock(player).orElse(this.targetState.getBlock()).getStateForPlacement((BlockPlaceContext)ctx);
        if (resultState != null) {
            if (!resultState.canSurvive((LevelReader)this.state.world, this.state.blockPos)) {
                return false;
            }
            return !(this.currentState.getBlock() instanceof LiquidBlock) || this.canPlaceInWater(resultState);
        }
        return false;
    }

    @Override
    @Nonnull
    public List<Action> execute(LocalPlayer player) {
        ArrayList<Action> actions = new ArrayList<Action>();
        PrinterPlacementContext ctx = this.getPlacementContext(player);
        if (ctx == null) {
            return actions;
        }
        actions.add(new PrepareAction(ctx));
        actions.add(new InteractActionImpl(ctx));
        if (ctx.shouldSneak) {
            actions.add(new ReleaseShiftAction());
        }
        return actions;
    }

    protected static boolean canBeClicked(Level world, BlockPos pos) {
        return PlacementGuide.getOutlineShape(world, pos) != Shapes.empty() && !(world.getBlockState(pos).getBlock() instanceof SignBlock);
    }

    private static VoxelShape getOutlineShape(Level world, BlockPos pos) {
        return world.getBlockState(pos).getShape((BlockGetter)world, pos);
    }

    public boolean isInteractive(Block block) {
        for (Class clazz : interactiveBlocks) {
            if (!clazz.isInstance(block)) continue;
            return true;
        }
        return false;
    }

    private boolean canPlaceInWater(BlockState blockState) {
        Block block = blockState.getBlock();
        if (block instanceof LiquidBlockContainer) {
            return true;
        }
        if (!(block instanceof DoorBlock || blockState.getBlock() instanceof SignBlock || blockState.is((Object)Blocks.LADDER) || blockState.is((Object)Blocks.SUGAR_CANE) || blockState.is((Object)Blocks.BUBBLE_COLUMN))) {
            return blockState.blocksMotion();
        }
        return true;
    }
}

