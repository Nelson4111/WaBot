/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.Direction
 *  net.minecraft.network.protocol.Packet
 *  net.minecraft.network.protocol.game.ServerboundMovePlayerPacket$Rot
 */
package org.uiop.easyplacefix.util;

import net.minecraft.client.Minecraft;
import net.minecraft.core.Direction;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import org.uiop.easyplacefix.struct.DirectionRange;

public class PlayerRotationAction {
    public static void setServerBoundPlayerRotation(Float yaw, Float pitch, Boolean hor) {
        Minecraft minecraftClient = Minecraft.getInstance();
        minecraftClient.getConnection().send((Packet)new ServerboundMovePlayerPacket.Rot(yaw.floatValue(), pitch.floatValue(), Minecraft.getInstance().player.onGround(), hor.booleanValue()));
    }

    public static void restRotation() {
        Minecraft minecraftClient = Minecraft.getInstance();
        minecraftClient.getConnection().send((Packet)new ServerboundMovePlayerPacket.Rot(minecraftClient.player.getYRot(), minecraftClient.player.getXRot(), Minecraft.getInstance().player.onGround(), minecraftClient.player.horizontalCollision));
    }

    public static Float limitYawRotation(Direction direction) {
        float range2;
        DirectionRange directionRange = DirectionRange.DirectionToRange(direction);
        if (directionRange == null) {
            return null;
        }
        Direction playerFacing = Minecraft.getInstance().player.getMotionDirection();
        if (directionRange.isInRange(playerFacing)) {
            return Float.valueOf(Minecraft.getInstance().player.getYRot());
        }
        float range1 = Math.abs(directionRange.getFirstValue() - Minecraft.getInstance().player.getYRot());
        return Float.valueOf(range1 < (range2 = Math.abs(directionRange.getSecondValue() - Minecraft.getInstance().player.getYRot())) ? directionRange.getFirstValue() : directionRange.getSecondValue());
    }

    public static Float limitPitchRotation(Direction direction) {
        float range2;
        DirectionRange directionRange = DirectionRange.DirectionToRange(direction);
        if (directionRange == null) {
            return null;
        }
        Direction playerFacing = PlayerRotationAction.getVertical(Minecraft.getInstance().player.getXRot());
        if (directionRange.isInRange(playerFacing)) {
            return Float.valueOf(Minecraft.getInstance().player.getXRot());
        }
        float range1 = Math.abs(directionRange.getFirstValue() - Minecraft.getInstance().player.getXRot());
        return Float.valueOf(range1 < (range2 = Math.abs(directionRange.getSecondValue() - Minecraft.getInstance().player.getXRot())) ? directionRange.getFirstValue() : directionRange.getSecondValue());
    }

    public static Direction getVertical(float pitchPlayer) {
        Direction playerFacing = null;
        if (pitchPlayer < -45.0f) {
            playerFacing = Direction.UP;
        } else if (pitchPlayer > 45.0f) {
            playerFacing = Direction.DOWN;
        }
        return playerFacing;
    }
}

