/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.network.protocol.Packet
 *  net.minecraft.network.protocol.game.ServerboundPlayerInputPacket
 *  net.minecraft.world.entity.player.Input
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.ChestType
 *  net.minecraft.world.level.block.state.properties.EnumProperty
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundPlayerInputPacket;
import net.minecraft.util.Tuple;
import net.minecraft.world.entity.player.Input;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.EnumProperty;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.PlayerInputAction;

@Mixin(value={ChestBlock.class})
public class MixinChestBlock
implements IBlock {
    @Shadow
    @Final
    public static EnumProperty<ChestType> TYPE;

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        PlayerInputAction.SetShift(true);
    }

    @Override
    public void afterAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        PlayerInputAction.SetShift(false);
    }

    @Override
    public Tuple<RelativeBlockHitResult, Integer> getHitResult(BlockState blockState, BlockPos blockPos, BlockState worldBlockState) {
        ChestType chestType = (ChestType)blockState.getValue((Property)BlockStateProperties.CHEST_TYPE);
        if (chestType == ChestType.SINGLE) {
            Minecraft.getInstance().getConnection().send((Packet)new ServerboundPlayerInputPacket(new Input(false, false, false, false, false, true, false)));
            return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(new Vec3(0.5, 0.5, 0.5), Direction.UP, blockPos, false), 1);
        }
        Direction blockFace = (Direction)blockState.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
        blockFace = chestType == ChestType.LEFT ? blockFace.getCounterClockWise() : blockFace.getClockWise();
        BlockPos offset = blockPos.relative(blockFace.getOpposite());
        return new Tuple<RelativeBlockHitResult, Integer>(new RelativeBlockHitResult(switch (blockFace) {
            case Direction.EAST -> new Vec3(0.9, 0.5, 0.5);
            case Direction.SOUTH -> new Vec3(0.5, 0.5, 0.9);
            case Direction.WEST -> new Vec3(0.1, 0.5, 0.5);
            default -> new Vec3(0.5, 0.5, 0.1);
        }, blockFace, Minecraft.getInstance().level.getBlockState(offset).getBlock() == Blocks.AIR ? blockPos : offset, false), 1);
    }
}

