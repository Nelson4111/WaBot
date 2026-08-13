package me.aleksilassila.litematica.printer.implementation.actions;

import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import me.aleksilassila.litematica.printer.actions.InteractAction;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import me.aleksilassila.litematica.printer.manual.ManualPlacementHandler;
import me.aleksilassila.litematica.printer.manual.PlacementOverrideHandler;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;

public class InteractActionImpl
extends InteractAction {
    public InteractActionImpl(PrinterPlacementContext context) {
        super(context);
    }

    @Override
    protected void interact(Minecraft client, LocalPlayer player, InteractionHand hand, BlockHitResult hitResult) {
        if (client.gameMode != null) {
            float origYaw = player.getYRot();
            float origPitch = player.getXRot();
            float origYHead = player.getYHeadRot();
            float origYRotO = player.yRotO;
            float origXRotO = player.xRotO;
            boolean rotated = false;
            BlockPos targetPos = null;

            if (Configs.ROTATE.getBooleanValue() && hitResult != null) {
                WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
                if (schematicWorld != null) {
                    targetPos = PlacementOverrideHandler.getTargetPlacementPos(client.level, schematicWorld, hitResult);
                    BlockState targetState = (targetPos != null) ? schematicWorld.getBlockState(targetPos) : null;
                    if (targetState != null && !targetState.isAir()) {
                        PlacementOverrideHandler.setOverrideState(targetPos, targetState, hitResult);

                        float[] rotations = ManualPlacementHandler.calculateRotationsForState(targetState, hitResult.getDirection());
                        if (rotations != null) {
                            float targetYaw = rotations[0];
                            float targetPitch = rotations[1];
                            player.setYRot(targetYaw);
                            player.setXRot(targetPitch);
                            player.setYHeadRot(targetYaw);
                            player.yRotO = targetYaw;
                            player.xRotO = targetPitch;
                            rotated = true;

                            ServerboundMovePlayerPacket.PosRot packet = new ServerboundMovePlayerPacket.PosRot(
                                player.getX(), player.getY(), player.getZ(),
                                targetYaw, targetPitch,
                                player.onGround(), player.horizontalCollision
                            );
                            player.connection.send((Packet<?>) packet);
                        }
                    }
                }
            }

            try {
                client.gameMode.useItemOn(player, hand, hitResult);
                client.gameMode.useItem((Player)player, hand);
            } finally {
                PlacementOverrideHandler.clearAll();
                if (rotated) {
                    player.setYRot(origYaw);
                    player.setXRot(origPitch);
                    player.setYHeadRot(origYHead);
                    player.yRotO = origYRotO;
                    player.xRotO = origXRotO;
                }
            }
        }
    }
}
