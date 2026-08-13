/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.level.block.GrowingPlantBlock
 *  net.minecraft.world.level.block.GrowingPlantHeadBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block;

import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.GrowingPlantBlock;
import net.minecraft.world.level.block.GrowingPlantHeadBlock;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;

@Mixin(value={GrowingPlantBlock.class})
public abstract class MixinAbstractPlantPartBlock
implements IBlock {
    @Shadow
    protected abstract GrowingPlantHeadBlock getHeadBlock();

    @Override
    public Item getItemForBlockState(BlockState blockState) {
        return this.getHeadBlock().asItem();
    }
}

