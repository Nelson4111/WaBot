/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.world.SchematicWorldHandler
 *  it.unimi.dsi.fastutil.ints.Int2ObjectMaps
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientPacketListener
 *  net.minecraft.core.Direction
 *  net.minecraft.core.FrontAndTop
 *  net.minecraft.network.HashedStack
 *  net.minecraft.network.protocol.Packet
 *  net.minecraft.network.protocol.game.ServerboundContainerClickPacket
 *  net.minecraft.network.protocol.game.ServerboundContainerClosePacket
 *  net.minecraft.network.protocol.game.ServerboundContainerSlotStateChangedPacket
 *  net.minecraft.network.protocol.game.ServerboundUseItemOnPacket
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.inventory.ContainerInput
 *  net.minecraft.world.level.block.CrafterBlock
 *  net.minecraft.world.level.block.entity.CrafterBlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import com.tick_ins.tick.RunnableWithCountDown;
import com.tick_ins.tick.TickThread;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import it.unimi.dsi.fastutil.ints.Int2ObjectMaps;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.core.Direction;
import net.minecraft.core.FrontAndTop;
import net.minecraft.network.HashedStack;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundContainerClickPacket;
import net.minecraft.network.protocol.game.ServerboundContainerClosePacket;
import net.minecraft.network.protocol.game.ServerboundContainerSlotStateChangedPacket;
import net.minecraft.network.protocol.game.ServerboundUseItemOnPacket;
import net.minecraft.util.Tuple;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.inventory.ContainerInput;
import net.minecraft.world.level.block.CrafterBlock;
import net.minecraft.world.level.block.entity.CrafterBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.EasyPlaceFix;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.IClientWorld;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={CrafterBlock.class})
public class MixinCrafterBlock
implements IBlock {
    @Override
    public boolean HasSleepTime(BlockState blockState) {
        FrontAndTop orientation = (FrontAndTop)blockState.getValue((Property)BlockStateProperties.ORIENTATION);
        Direction facing = orientation.front();
        return facing != Direction.UP && facing != Direction.DOWN;
    }

    @Override
    public void firstAction(BlockState stateSchematic, BlockHitResult blockHitResult) {
        ++PlayerBlockAction.openScreenAction.count;
    }

    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        FrontAndTop orientation = (FrontAndTop)blockState.getValue((Property)BlockStateProperties.ORIENTATION);
        Direction facing = orientation.front();
        Direction rotation = orientation.top();
        return switch (facing) {
            default -> throw new MatchException(null, null);
            case Direction.UP -> {
                switch (rotation) {
                    case SOUTH: {
                        yield new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Down);
                    }
                    case WEST: {
                        yield new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Down);
                    }
                    case EAST: {
                        yield new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Down);
                    }
                }
                yield new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Down);
            }
            case Direction.DOWN -> {
                switch (rotation) {
                    case SOUTH: {
                        yield new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Up);
                    }
                    case WEST: {
                        yield new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Up);
                    }
                    case EAST: {
                        yield new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Up);
                    }
                }
                yield new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Up);
            }
            case Direction.SOUTH -> new Tuple<LookAt, LookAt>(LookAt.North, LookAt.Horizontal);
            case Direction.WEST -> new Tuple<LookAt, LookAt>(LookAt.East, LookAt.Horizontal);
            case Direction.EAST -> new Tuple<LookAt, LookAt>(LookAt.West, LookAt.Horizontal);
            case Direction.NORTH -> new Tuple<LookAt, LookAt>(LookAt.South, LookAt.Horizontal);
        };
    }

    @Override
    public void BlockAction(BlockState blockState, BlockHitResult blockHitResult) {
        ClientPacketListener clientPlayNetworkHandler = Minecraft.getInstance().getConnection();
        if (clientPlayNetworkHandler == null || Minecraft.getInstance().level == null) {
            return;
        }
        EasyPlaceFix.crafterOperation = false;
        CrafterBlockEntity blockEntity = (CrafterBlockEntity)SchematicWorldHandler.getSchematicWorld().getBlockEntity(blockHitResult.getBlockPos());
        if (blockEntity == null) {
            TickThread.addCountDownTask(new RunnableWithCountDown.Builder().setCount(3).build(() -> {
                PlayerBlockAction.openScreenAction.count = Math.max(PlayerBlockAction.openScreenAction.count - 1, 0);
            }));
            return;
        }
        for (int i = 0; i < 9; ++i) {
            boolean isDisabled = blockEntity.isSlotDisabled(i);
            EasyPlaceFix.crafterSlot.set(i, isDisabled);
            if (EasyPlaceFix.crafterOperation || !isDisabled) continue;
            EasyPlaceFix.crafterOperation = true;
        }
        if (EasyPlaceFix.crafterOperation) {
            int sequence = ((IClientWorld)Minecraft.getInstance().level).Sequence();
            clientPlayNetworkHandler.send((Packet)new ServerboundUseItemOnPacket(InteractionHand.MAIN_HAND, blockHitResult, sequence));
            for (short slot = 0; slot < EasyPlaceFix.crafterSlot.size(); slot = (short)((short)(slot + 1))) {
                boolean isDisable = EasyPlaceFix.crafterSlot.get(slot);
                if (!isDisable) continue;
                clientPlayNetworkHandler.send((Packet)new ServerboundContainerSlotStateChangedPacket((int)slot, EasyPlaceFix.screenId, false));
                clientPlayNetworkHandler.send((Packet)new ServerboundContainerClickPacket(EasyPlaceFix.screenId, 1, slot, 0, ContainerInput.PICKUP, Int2ObjectMaps.emptyMap(), HashedStack.EMPTY));
            }
            clientPlayNetworkHandler.send((Packet)new ServerboundContainerClosePacket(EasyPlaceFix.screenId));
        }
        TickThread.addCountDownTask(new RunnableWithCountDown.Builder().setCount(3).build(() -> {
            PlayerBlockAction.openScreenAction.count = Math.max(PlayerBlockAction.openScreenAction.count - 1, 0);
        }));
    }
}

