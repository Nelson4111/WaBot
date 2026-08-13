/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.tags.BlockTags
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.IronBarsBlock
 *  net.minecraft.world.level.block.WallBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.WallSide
 *  net.minecraft.world.level.material.FluidState
 *  net.minecraft.world.level.material.Fluids
 *  net.minecraft.world.phys.shapes.BooleanOp
 *  net.minecraft.world.phys.shapes.Shapes
 *  net.minecraft.world.phys.shapes.VoxelShape
 */
package fi.dy.masa.litematica.schematic.conversion;

import fi.dy.masa.litematica.schematic.conversion.IBlockReaderWithData;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionFixers;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.IronBarsBlock;
import net.minecraft.world.level.block.WallBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.WallSide;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.level.material.Fluids;
import net.minecraft.world.phys.shapes.BooleanOp;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;

public class WallStateFixer
implements SchematicConversionFixers.IStateFixer {
    public static final WallStateFixer INSTANCE = new WallStateFixer();
    private static final VoxelShape SHAPE_PILLAR = Block.box((double)7.0, (double)0.0, (double)7.0, (double)9.0, (double)16.0, (double)9.0);
    private static final VoxelShape SHAPE_NORTH = Block.box((double)7.0, (double)0.0, (double)0.0, (double)9.0, (double)16.0, (double)9.0);
    private static final VoxelShape SHAPE_SOUTH = Block.box((double)7.0, (double)0.0, (double)7.0, (double)9.0, (double)16.0, (double)16.0);
    private static final VoxelShape SHAPE_WEST = Block.box((double)0.0, (double)0.0, (double)7.0, (double)9.0, (double)16.0, (double)9.0);
    private static final VoxelShape SHAPE_EAST = Block.box((double)7.0, (double)0.0, (double)7.0, (double)16.0, (double)16.0, (double)9.0);

    @Override
    public BlockState fixState(IBlockReaderWithData reader, BlockState state, BlockPos pos) {
        IBlockReaderWithData world = reader;
        FluidState fluidState = state.getFluidState();
        BlockPos posNorth = pos.north();
        BlockPos posEast = pos.east();
        BlockPos posSouth = pos.south();
        BlockPos posWest = pos.west();
        BlockPos posUp = pos.above();
        BlockState stateNorth = world.getBlockState(posNorth);
        BlockState stateEast = world.getBlockState(posEast);
        BlockState stateSouth = world.getBlockState(posSouth);
        BlockState stateWest = world.getBlockState(posWest);
        BlockState stateUp = world.getBlockState(posUp);
        boolean connectNorth = this.shouldConnectTo(stateNorth, stateNorth.isFaceSturdy((BlockGetter)world, posNorth, Direction.SOUTH), Direction.SOUTH);
        boolean connectEast = this.shouldConnectTo(stateEast, stateEast.isFaceSturdy((BlockGetter)world, posEast, Direction.WEST), Direction.WEST);
        boolean connectSouth = this.shouldConnectTo(stateSouth, stateSouth.isFaceSturdy((BlockGetter)world, posSouth, Direction.NORTH), Direction.NORTH);
        boolean connectWest = this.shouldConnectTo(stateWest, stateWest.isFaceSturdy((BlockGetter)world, posWest, Direction.EAST), Direction.EAST);
        BlockState baseState = (BlockState)state.getBlock().defaultBlockState().setValue((Property)WallBlock.WATERLOGGED, (Comparable)Boolean.valueOf(fluidState.getType() == Fluids.WATER));
        return this.getWallStateWithConnections(world, baseState, posUp, stateUp, connectNorth, connectEast, connectSouth, connectWest);
    }

    private BlockState getWallStateWithConnections(BlockGetter worldView, BlockState baseState, BlockPos pos, BlockState stateUp, boolean canConnectNorth, boolean canConnectEast, boolean canConnectSouth, boolean canConnectWest) {
        VoxelShape shapeAbove = stateUp.getCollisionShape(worldView, pos).getFaceShape(Direction.DOWN);
        BlockState stateWithSides = this.getWallSideConnections(baseState, canConnectNorth, canConnectEast, canConnectSouth, canConnectWest, shapeAbove);
        return (BlockState)stateWithSides.setValue((Property)WallBlock.UP, (Comparable)Boolean.valueOf(this.shouldConnectUp(stateWithSides, stateUp, shapeAbove)));
    }

    private BlockState getWallSideConnections(BlockState blockState, boolean canConnectNorth, boolean canConnectEast, boolean canConnectSouth, boolean canConnectWest, VoxelShape shapeAbove) {
        return (BlockState)((BlockState)((BlockState)((BlockState)blockState.setValue((Property)WallBlock.NORTH, (Comparable)this.getConnectionShape(canConnectNorth, shapeAbove, SHAPE_NORTH))).setValue((Property)WallBlock.EAST, (Comparable)this.getConnectionShape(canConnectEast, shapeAbove, SHAPE_EAST))).setValue((Property)WallBlock.SOUTH, (Comparable)this.getConnectionShape(canConnectSouth, shapeAbove, SHAPE_SOUTH))).setValue((Property)WallBlock.WEST, (Comparable)this.getConnectionShape(canConnectWest, shapeAbove, SHAPE_WEST));
    }

    private boolean shouldConnectTo(BlockState state, boolean faceFullSquare, Direction side) {
        Block block = state.getBlock();
        return state.is(BlockTags.WALLS) || !Block.isExceptionForConnection((BlockState)state) && faceFullSquare || block instanceof IronBarsBlock || block instanceof FenceGateBlock && FenceGateBlock.connectsToDirection((BlockState)state, (Direction)side);
    }

    private boolean shouldConnectUp(BlockState blockState, BlockState stateUp, VoxelShape shapeAbove) {
        boolean inTallLine;
        boolean isPillarOrWallEnd;
        boolean isUpConnectedWallAbove;
        boolean bl = isUpConnectedWallAbove = stateUp.getBlock() instanceof WallBlock && (Boolean)stateUp.getValue((Property)WallBlock.UP) != false;
        if (isUpConnectedWallAbove) {
            return true;
        }
        WallSide shapeNorth = (WallSide)blockState.getValue((Property)WallBlock.NORTH);
        WallSide shapeSouth = (WallSide)blockState.getValue((Property)WallBlock.SOUTH);
        WallSide shapeEast = (WallSide)blockState.getValue((Property)WallBlock.EAST);
        WallSide shapeWest = (WallSide)blockState.getValue((Property)WallBlock.WEST);
        boolean unconnectedNorth = shapeNorth == WallSide.NONE;
        boolean unconnectedSouth = shapeSouth == WallSide.NONE;
        boolean unconnectedEast = shapeEast == WallSide.NONE;
        boolean unconnectedWest = shapeWest == WallSide.NONE;
        boolean bl2 = isPillarOrWallEnd = unconnectedNorth && unconnectedSouth && unconnectedWest && unconnectedEast || unconnectedNorth != unconnectedSouth || unconnectedWest != unconnectedEast;
        if (isPillarOrWallEnd) {
            return true;
        }
        boolean bl3 = inTallLine = shapeNorth == WallSide.TALL && shapeSouth == WallSide.TALL || shapeEast == WallSide.TALL && shapeWest == WallSide.TALL;
        if (inTallLine) {
            return false;
        }
        return stateUp.is(BlockTags.WALL_POST_OVERRIDE) || this.shapesDoNotIntersect(shapeAbove, SHAPE_PILLAR);
    }

    private WallSide getConnectionShape(boolean canConnect, VoxelShape shapeAbove, VoxelShape shapeSideClearance) {
        if (canConnect) {
            return this.shapesDoNotIntersect(shapeAbove, shapeSideClearance) ? WallSide.TALL : WallSide.LOW;
        }
        return WallSide.NONE;
    }

    private boolean shapesDoNotIntersect(VoxelShape voxelShape, VoxelShape voxelShape2) {
        return !Shapes.joinIsNotEmpty((VoxelShape)voxelShape2, (VoxelShape)voxelShape, (BooleanOp)BooleanOp.ONLY_FIRST);
    }
}

