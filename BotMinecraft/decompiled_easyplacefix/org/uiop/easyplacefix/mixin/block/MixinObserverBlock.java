/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.world.SchematicWorldHandler
 *  fi.dy.masa.litematica.world.WorldSchematic
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.level.block.ObserverBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Tuple;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.level.block.ObserverBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.config.easyPlacefixConfig;
import org.uiop.easyplacefix.util.EasyPlaceHandler;

@Mixin(value={ObserverBlock.class})
public class MixinObserverBlock
implements IBlock {
    @Override
    public boolean HasSleepTime(BlockState blockState) {
        Direction facing = (Direction)blockState.getValue((Property)BlockStateProperties.FACING);
        return facing != Direction.UP && facing != Direction.DOWN;
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        return switch ((Direction)blockState.getValue((Property)BlockStateProperties.FACING)) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN -> new Tuple<LookAt, LookAt>(LookAt.PlayerYaw, LookAt.Down);
            case Direction.UP -> new Tuple<LookAt, LookAt>(LookAt.PlayerYaw, LookAt.Up);
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            case Direction.NORTH -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
        };
    }

    @Override
    public InteractionResult isSchemaTermination(BlockPos pos, BlockState blockState, BlockState worldBlockstate) {
        if (easyPlacefixConfig.OBSERVER_DETECT.getBooleanValue()) {
            Direction direction = (Direction)blockState.getValue((Property)BlockStateProperties.FACING);
            BlockPos offset = pos.relative(direction);
            WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
            if (EasyPlaceHandler.isSchematicBlock(offset) && schematicWorld != null) {
                BlockState lookBlock = Minecraft.getInstance().level.getBlockState(offset);
                if (!schematicWorld.getBlockState(offset).getBlock().equals(lookBlock.getBlock())) {
                    return InteractionResult.FAIL;
                }
            }
        }
        return null;
    }
}

