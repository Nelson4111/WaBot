/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.ModifyReturnValue
 *  net.minecraft.world.level.block.piston.PistonBaseBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 */
package org.uiop.easyplacefix.mixin;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import net.minecraft.world.level.block.piston.PistonBaseBlock;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.uiop.easyplacefix.util.PlayerBlockAction;

@Mixin(value={PistonBaseBlock.class})
public class MixinPistonBlock {
    @ModifyReturnValue(method={"getStateForPlacement"}, at={@At(value="RETURN")})
    private BlockState ModgetPlacementState(BlockState original) {
        if (PlayerBlockAction.useItemOnAction.modifyBoolean) {
            PlayerBlockAction.useItemOnAction.modifyBoolean = false;
            return PlayerBlockAction.useItemOnAction.pistonBlockState;
        }
        return original;
    }
}

