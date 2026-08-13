/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.BaseRailBlock
 *  net.minecraft.world.level.block.DetectorRailBlock
 *  net.minecraft.world.level.block.PoweredRailBlock
 *  net.minecraft.world.level.block.RailBlock
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.state.BlockBehaviour$Properties
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.RailShape
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.block;

import fi.dy.masa.litematica.config.Configs;
import net.minecraft.world.level.block.BaseRailBlock;
import net.minecraft.world.level.block.DetectorRailBlock;
import net.minecraft.world.level.block.PoweredRailBlock;
import net.minecraft.world.level.block.RailBlock;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.RailShape;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={RailBlock.class, DetectorRailBlock.class, PoweredRailBlock.class})
public abstract class MixinRailBlocks
extends BaseRailBlock {
    protected MixinRailBlocks(boolean disableCorners, BlockBehaviour.Properties builder) {
        super(disableCorners, builder);
    }

    @Inject(method={"rotate(Lnet/minecraft/world/level/block/state/BlockState;Lnet/minecraft/world/level/block/Rotation;)Lnet/minecraft/world/level/block/state/BlockState;"}, at={@At(value="HEAD")}, cancellable=true)
    private void litematica_fixRailRotation(BlockState state, Rotation rotation, CallbackInfoReturnable<BlockState> cir) {
        if (Configs.Generic.FIX_RAIL_ROTATION.getBooleanValue() && rotation == Rotation.CLOCKWISE_180) {
            RailShape shape = null;
            if (this instanceof RailBlock) {
                shape = (RailShape)state.getValue((Property)RailBlock.SHAPE);
            } else if (this instanceof DetectorRailBlock) {
                shape = (RailShape)state.getValue((Property)DetectorRailBlock.SHAPE);
            } else if (this instanceof PoweredRailBlock) {
                shape = (RailShape)state.getValue((Property)PoweredRailBlock.SHAPE);
            }
            if (shape == RailShape.EAST_WEST || shape == RailShape.NORTH_SOUTH) {
                cir.setReturnValue((Object)state);
                cir.cancel();
            }
        }
    }
}

