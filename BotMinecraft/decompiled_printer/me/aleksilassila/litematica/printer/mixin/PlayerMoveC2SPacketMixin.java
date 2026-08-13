/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.network.protocol.game.ServerboundMovePlayerPacket
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.ModifyVariable
 */
package me.aleksilassila.litematica.printer.mixin;

import me.aleksilassila.litematica.printer.LitematicaMixinMod;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.actions.PrepareAction;
import me.aleksilassila.litematica.printer.config.Configs;
import net.minecraft.network.protocol.game.ServerboundMovePlayerPacket;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

@Mixin(value={ServerboundMovePlayerPacket.class})
public class PlayerMoveC2SPacketMixin {
    @ModifyVariable(method={"<init>(DDDFFZZZZ)V"}, at=@At(value="HEAD"), ordinal=0, argsOnly=true)
    private static float modifyLookYaw(float yaw) {
        Printer printer = LitematicaMixinMod.printer;
        if (printer == null) {
            return yaw;
        }
        if (!Configs.ROTATE.getBooleanValue()) {
            return yaw;
        }
        PrepareAction action = printer.actionHandler.lookAction;
        if (action != null && action.modifyYaw) {
            Printer.printDebug("YAW: {}", Float.valueOf(action.yaw));
            return action.yaw;
        }
        return yaw;
    }

    @ModifyVariable(method={"<init>(DDDFFZZZZ)V"}, at=@At(value="HEAD"), ordinal=1, argsOnly=true)
    private static float modifyLookPitch(float pitch) {
        Printer printer = LitematicaMixinMod.printer;
        if (printer == null) {
            return pitch;
        }
        if (!Configs.ROTATE.getBooleanValue()) {
            return pitch;
        }
        PrepareAction action = printer.actionHandler.lookAction;
        if (action != null && action.modifyPitch) {
            Printer.printDebug("PITCH: {}", Float.valueOf(action.pitch));
            return action.pitch;
        }
        return pitch;
    }
}

