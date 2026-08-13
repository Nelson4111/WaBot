/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.StairBlock
 *  net.minecraft.world.level.block.state.BlockBehaviour$Properties
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.StairsShape
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.block;

import fi.dy.masa.litematica.config.Configs;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.StairsShape;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={StairBlock.class})
public abstract class MixinStairsBlock
extends Block {
    public MixinStairsBlock(BlockBehaviour.Properties settings) {
        super(settings);
    }

    @Inject(method={"mirror"}, at={@At(value="HEAD")}, cancellable=true)
    private void litematica_fixStairsMirror(BlockState state, Mirror mirror, CallbackInfoReturnable<BlockState> cir) {
        if (Configs.Generic.FIX_STAIRS_MIRROR.getBooleanValue()) {
            Direction direction = (Direction)state.getValue((Property)StairBlock.FACING);
            StairsShape stairShape = (StairsShape)state.getValue((Property)StairBlock.SHAPE);
            if (direction.getAxis() == Direction.Axis.X && mirror == Mirror.FRONT_BACK) {
                cir.setReturnValue((Object)(switch (stairShape) {
                    case StairsShape.INNER_LEFT -> (BlockState)state.rotate(Rotation.CLOCKWISE_180).setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.INNER_RIGHT);
                    case StairsShape.INNER_RIGHT -> (BlockState)state.rotate(Rotation.CLOCKWISE_180).setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.INNER_LEFT);
                    case StairsShape.OUTER_LEFT -> (BlockState)state.rotate(Rotation.CLOCKWISE_180).setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.OUTER_RIGHT);
                    case StairsShape.OUTER_RIGHT -> (BlockState)state.rotate(Rotation.CLOCKWISE_180).setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.OUTER_LEFT);
                    default -> state.rotate(Rotation.CLOCKWISE_180);
                }));
                cir.cancel();
            } else if (direction.getAxis() == Direction.Axis.X && mirror == Mirror.LEFT_RIGHT || direction.getAxis() == Direction.Axis.Z && mirror == Mirror.FRONT_BACK) {
                cir.setReturnValue((Object)(switch (stairShape) {
                    case StairsShape.INNER_LEFT -> (BlockState)state.setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.INNER_RIGHT);
                    case StairsShape.INNER_RIGHT -> (BlockState)state.setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.INNER_LEFT);
                    case StairsShape.OUTER_LEFT -> (BlockState)state.setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.OUTER_RIGHT);
                    case StairsShape.OUTER_RIGHT -> (BlockState)state.setValue((Property)StairBlock.SHAPE, (Comparable)StairsShape.OUTER_LEFT);
                    default -> state;
                }));
                cir.cancel();
            }
        }
    }
}

