/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.ChestType
 *  net.minecraft.world.level.block.state.properties.Property
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.block;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.util.BlockUtils;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.Property;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={ChestBlock.class})
public class MixinChestBlock {
    @Inject(method={"mirror"}, at={@At(value="HEAD")}, cancellable=true)
    private void litematica_fixChestMirror(BlockState state, Mirror mirror, CallbackInfoReturnable<BlockState> cir) {
        ChestType type = (ChestType)state.getValue((Property)ChestBlock.TYPE);
        if (Configs.Generic.FIX_CHEST_MIRROR.getBooleanValue() && type != ChestType.SINGLE) {
            state = BlockUtils.fixMirrorDoubleChest(state, mirror, type);
            cir.setReturnValue((Object)state);
        }
    }
}

