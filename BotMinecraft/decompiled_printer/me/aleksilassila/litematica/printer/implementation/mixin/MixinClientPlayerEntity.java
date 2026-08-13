/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.authlib.GameProfile
 *  fi.dy.masa.litematica.world.SchematicWorldHandler
 *  fi.dy.masa.litematica.world.WorldSchematic
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.multiplayer.ClientPacketListener
 *  net.minecraft.client.player.AbstractClientPlayer
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.network.protocol.Packet
 *  net.minecraft.network.protocol.game.ServerboundSignUpdatePacket
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.entity.SignBlockEntity
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.Unique
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package me.aleksilassila.litematica.printer.implementation.mixin;

import com.mojang.authlib.GameProfile;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.Optional;
import me.aleksilassila.litematica.printer.LitematicaMixinMod;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.client.player.AbstractClientPlayer;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ServerboundSignUpdatePacket;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.SignBlockEntity;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={LocalPlayer.class})
public class MixinClientPlayerEntity
extends AbstractClientPlayer {
    @Unique
    private static boolean didCheckForUpdates = false;
    @Final
    @Shadow
    protected Minecraft minecraft;
    @Final
    @Shadow
    public ClientPacketListener connection;

    public MixinClientPlayerEntity(ClientLevel world, GameProfile profile) {
        super(world, profile);
    }

    @Inject(at={@At(value="TAIL")}, method={"tick"})
    public void tick(CallbackInfo ci) {
        LocalPlayer clientPlayer = (LocalPlayer)this;
        if (!didCheckForUpdates) {
            didCheckForUpdates = true;
        }
        if (LitematicaMixinMod.printer == null || LitematicaMixinMod.printer.player != clientPlayer) {
            Printer.printDebug("Initializing printer, player: {}, client: {}", clientPlayer, this.minecraft);
            LitematicaMixinMod.printer = new Printer(this.minecraft, clientPlayer);
        }
        boolean didFindPlacement = true;
        for (int i = 0; i < 10; ++i) {
            if (didFindPlacement) {
                didFindPlacement = LitematicaMixinMod.printer.onGameTick();
            }
            LitematicaMixinMod.printer.actionHandler.onGameTick();
        }
    }

    @Inject(method={"openTextEdit"}, at={@At(value="HEAD")}, cancellable=true)
    public void openEditSignScreen(SignBlockEntity sign, boolean front, CallbackInfo ci) {
        this.getTargetSignEntity(sign).ifPresent(signBlockEntity -> {
            ServerboundSignUpdatePacket packet = new ServerboundSignUpdatePacket(sign.getBlockPos(), front, signBlockEntity.getText(front).getMessage(0, false).getString(), signBlockEntity.getText(front).getMessage(1, false).getString(), signBlockEntity.getText(front).getMessage(2, false).getString(), signBlockEntity.getText(front).getMessage(3, false).getString());
            this.connection.send((Packet)packet);
            ci.cancel();
        });
    }

    @Unique
    private Optional<SignBlockEntity> getTargetSignEntity(SignBlockEntity sign) {
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        if (sign.getLevel() == null || worldSchematic == null) {
            return Optional.empty();
        }
        SchematicBlockState state = new SchematicBlockState(sign.getLevel(), worldSchematic, sign.getBlockPos());
        BlockEntity targetBlockEntity = worldSchematic.getBlockEntity(state.blockPos);
        if (targetBlockEntity instanceof SignBlockEntity) {
            SignBlockEntity targetSignEntity = (SignBlockEntity)targetBlockEntity;
            return Optional.of(targetSignEntity);
        }
        return Optional.empty();
    }
}

