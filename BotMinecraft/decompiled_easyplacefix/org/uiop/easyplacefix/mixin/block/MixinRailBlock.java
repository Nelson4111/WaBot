/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.RailBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.RailShape
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.util.Tuple;
import net.minecraft.world.level.block.RailBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.RailShape;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.LookAt;

@Mixin(value={RailBlock.class})
public class MixinRailBlock
implements IBlock {
    @Override
    public Tuple<LookAt, LookAt> getYawAndPitch(BlockState blockState) {
        RailShape railShape = (RailShape)blockState.getValue((Property)BlockStateProperties.RAIL_SHAPE);
        if (railShape == RailShape.NORTH_SOUTH) {
            return new Tuple<LookAt, LookAt>(LookAt.North, LookAt.PlayerPitch);
        }
        return new Tuple<LookAt, LookAt>(LookAt.East, LookAt.PlayerPitch);
    }
}

