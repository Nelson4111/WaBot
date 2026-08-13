/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.mixin.block.IMixinAbstractBlock;
import java.util.IdentityHashMap;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;

public class ItemUtils {
    private static final IdentityHashMap<BlockState, ItemStack> ITEMS_FOR_STATES = new IdentityHashMap();

    public static boolean areTagsEqualIgnoreDamage(ItemStack stackReference, ItemStack stackToCheck) {
        ItemStack ref = stackReference.copy();
        ItemStack check = stackToCheck.copy();
        if (ref.isDamageableItem() && ref.isDamaged()) {
            ref.setDamageValue(0);
        }
        if (check.isDamageableItem() && check.isDamaged()) {
            check.setDamageValue(0);
        }
        return ItemStack.isSameItemSameComponents((ItemStack)ref, (ItemStack)check);
    }

    public static ItemStack getItemForState(BlockState state) {
        ItemStack stack = ITEMS_FOR_STATES.get(state);
        return stack != null ? stack : ItemStack.EMPTY;
    }

    public static void setItemForBlock(Level world, BlockPos pos, BlockState state) {
        if (!ITEMS_FOR_STATES.containsKey(state)) {
            ITEMS_FOR_STATES.put(state, ItemUtils.getItemForBlock(world, pos, state, false));
        }
    }

    public static ItemStack getItemForBlock(Level world, BlockPos pos, BlockState state, boolean checkCache) {
        ItemStack stack;
        if (checkCache && (stack = ITEMS_FOR_STATES.get(state)) != null) {
            return stack;
        }
        if (state.isAir()) {
            return ItemStack.EMPTY;
        }
        stack = ItemUtils.getStateToItemOverride(state);
        if (stack.isEmpty()) {
            stack = ((IMixinAbstractBlock)state.getBlock()).litematica_getPickStack((LevelReader)world, pos, state, false);
        }
        if (stack.isEmpty()) {
            stack = ItemStack.EMPTY;
        } else {
            ItemUtils.overrideStackSize(state, stack);
        }
        ITEMS_FOR_STATES.put(state, stack);
        return stack;
    }

    public static ItemStack getStateToItemOverride(BlockState state) {
        if (state.getBlock() == Blocks.LAVA) {
            return new ItemStack((ItemLike)Items.LAVA_BUCKET);
        }
        if (state.getBlock() == Blocks.WATER) {
            return new ItemStack((ItemLike)Items.WATER_BUCKET);
        }
        return ItemStack.EMPTY;
    }

    private static void overrideStackSize(BlockState state, ItemStack stack) {
        if (state.getBlock() instanceof SlabBlock && state.getValue((Property)SlabBlock.TYPE) == SlabType.DOUBLE) {
            stack.setCount(2);
        }
    }

    public static String getStackString(ItemStack stack) {
        if (!stack.isEmpty()) {
            Identifier rl = BuiltInRegistries.ITEM.getKey((Object)stack.getItem());
            return String.format("[%s - display: %s - NBT: %s] (%s)", rl != null ? rl.toString() : "null", stack.getHoverName().getString(), stack.getComponents() != null ? stack.getComponents().toString() : "<no NBT>", stack);
        }
        return "<empty>";
    }
}

