/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.util.EntityUtils
 *  fi.dy.masa.litematica.util.InventoryUtils
 *  fi.dy.masa.litematica.world.SchematicWorldHandler
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.FlowerPotBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.BlockHitResult
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 */
package org.uiop.easyplacefix.mixin.block;

import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.FlowerPotBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.uiop.easyplacefix.IBlock;

@Mixin(value={FlowerPotBlock.class})
public abstract class MixinFlowerPotBlock
implements IBlock {
    @Shadow
    public abstract Block getPotted();

    @Shadow
    protected abstract boolean isEmpty();

    @Override
    public Item getItemForBlockState(BlockState blockState) {
        return Blocks.FLOWER_POT.asItem();
    }

    @Override
    public void BlockAction(BlockState blockState, BlockHitResult blockHitResult) {
        if (!this.isEmpty()) {
            Block flower = this.getPotted();
            ItemStack stack = new ItemStack((ItemLike)flower.asItem());
            InventoryUtils.schematicWorldPickBlock((ItemStack)stack, (BlockPos)blockHitResult.getBlockPos(), (Level)SchematicWorldHandler.getSchematicWorld(), (Minecraft)Minecraft.getInstance());
            InteractionHand hand2 = EntityUtils.getUsedHandForItem((Player)Minecraft.getInstance().player, (ItemStack)stack);
            if (hand2 == null) {
                return;
            }
            Minecraft.getInstance().gameMode.useItemOn(Minecraft.getInstance().player, hand2, blockHitResult);
        }
    }
}

