/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Holder
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.item.alchemy.PotionContents
 *  net.minecraft.world.item.alchemy.Potions
 *  net.minecraft.world.level.ItemLike
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.AbstractCauldronBlock
 *  net.minecraft.world.level.block.BedBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.CandleBlock
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.DoublePlantBlock
 *  net.minecraft.world.level.block.FlowerPotBlock
 *  net.minecraft.world.level.block.LavaCauldronBlock
 *  net.minecraft.world.level.block.LayeredCauldronBlock
 *  net.minecraft.world.level.block.LiquidBlock
 *  net.minecraft.world.level.block.MultifaceSpreadeableBlock
 *  net.minecraft.world.level.block.SeaPickleBlock
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.SnowLayerBlock
 *  net.minecraft.world.level.block.TurtleEggBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BedPart
 *  net.minecraft.world.level.block.state.properties.DoubleBlockHalf
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 */
package fi.dy.masa.litematica.materials;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.mixin.block.IMixinAbstractBlock;
import java.util.IdentityHashMap;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.alchemy.PotionContents;
import net.minecraft.world.item.alchemy.Potions;
import net.minecraft.world.level.ItemLike;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.AbstractCauldronBlock;
import net.minecraft.world.level.block.BedBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CandleBlock;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.DoublePlantBlock;
import net.minecraft.world.level.block.FlowerPotBlock;
import net.minecraft.world.level.block.LavaCauldronBlock;
import net.minecraft.world.level.block.LayeredCauldronBlock;
import net.minecraft.world.level.block.LiquidBlock;
import net.minecraft.world.level.block.MultifaceSpreadeableBlock;
import net.minecraft.world.level.block.SeaPickleBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.SnowLayerBlock;
import net.minecraft.world.level.block.TurtleEggBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BedPart;
import net.minecraft.world.level.block.state.properties.DoubleBlockHalf;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;

public class MaterialCache {
    private static final MaterialCache INSTANCE = new MaterialCache();
    protected final IdentityHashMap<BlockState, ItemStack> buildItemsForStates = new IdentityHashMap();
    protected final IdentityHashMap<BlockState, ItemStack> displayItemsForStates = new IdentityHashMap();

    private MaterialCache() {
    }

    public static MaterialCache getInstance() {
        return INSTANCE;
    }

    public void clearCache() {
        this.buildItemsForStates.clear();
        this.displayItemsForStates.clear();
    }

    public ItemStack getRequiredBuildItemForState(BlockState state) {
        ItemStack stack = this.buildItemsForStates.get(state);
        if (stack == null) {
            stack = this.getItemForStateFromWorld(state, true);
        }
        return stack;
    }

    public ItemStack getRequiredBuildItemForState(BlockState state, @Nullable Level world, BlockPos pos) {
        ItemStack stack = this.buildItemsForStates.get(state);
        if (stack == null) {
            stack = this.getItemForStateFromWorld(state, world, pos, true);
        }
        return stack;
    }

    public ItemStack getItemForDisplayNameForState(BlockState state) {
        ItemStack stack = this.displayItemsForStates.get(state);
        if (stack == null) {
            stack = this.getItemForStateFromWorld(state, false);
        }
        return stack;
    }

    protected ItemStack getItemForStateFromWorld(BlockState state, boolean isBuildItem) {
        return this.getItemForStateFromWorld(state, null, BlockPos.ZERO, isBuildItem);
    }

    protected ItemStack getItemForStateFromWorld(BlockState state, @Nullable Level world, BlockPos pos, boolean isBuildItem) {
        ItemStack stack;
        ItemStack itemStack = stack = isBuildItem ? this.getStateToItemOverride(state) : null;
        if (stack == null) {
            stack = world == null ? state.getBlock().asItem().getDefaultInstance() : ((IMixinAbstractBlock)state.getBlock()).litematica_getPickStack((LevelReader)world, pos, state, false);
        }
        if (stack == null || stack.isEmpty()) {
            stack = ItemStack.EMPTY;
        } else {
            this.overrideStackSize(state, stack);
        }
        if (isBuildItem) {
            this.buildItemsForStates.put(state, stack);
        } else {
            this.displayItemsForStates.put(state, stack);
        }
        return stack;
    }

    public boolean requiresMultipleItems(BlockState state) {
        Block block = state.getBlock();
        if (block instanceof FlowerPotBlock && block != Blocks.FLOWER_POT) {
            return true;
        }
        return block instanceof AbstractCauldronBlock && block != Blocks.CAULDRON;
    }

    public ImmutableList<ItemStack> getItems(BlockState state) {
        Block block = state.getBlock();
        if (block instanceof FlowerPotBlock && block != Blocks.FLOWER_POT) {
            Block pottedBlock = ((FlowerPotBlock)block).getPotted();
            return ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.FLOWER_POT), (Object)(pottedBlock.equals(Blocks.AIR) ? ItemStack.EMPTY : pottedBlock.asItem().getDefaultInstance()));
        }
        if (block instanceof AbstractCauldronBlock && block != Blocks.CAULDRON) {
            if (block instanceof LavaCauldronBlock) {
                return ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON), (Object)new ItemStack((ItemLike)Items.LAVA_BUCKET));
            }
            if (block == Blocks.POWDER_SNOW_CAULDRON) {
                return ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON), (Object)new ItemStack((ItemLike)Items.POWDER_SNOW_BUCKET));
            }
            if (block == Blocks.WATER_CAULDRON) {
                int level = (Integer)state.getValue((Property)LayeredCauldronBlock.LEVEL);
                return switch (level) {
                    case 1 -> ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON), (Object)PotionContents.createItemStack((Item)Items.POTION, (Holder)Potions.WATER));
                    case 2 -> ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON), (Object)PotionContents.createItemStack((Item)Items.POTION, (Holder)Potions.WATER), (Object)PotionContents.createItemStack((Item)Items.POTION, (Holder)Potions.WATER));
                    case 3 -> ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON), (Object)new ItemStack((ItemLike)Items.WATER_BUCKET));
                    default -> ImmutableList.of((Object)new ItemStack((ItemLike)Blocks.CAULDRON));
                };
            }
        }
        return ImmutableList.of((Object)this.getRequiredBuildItemForState(state));
    }

    @Nullable
    protected ItemStack getStateToItemOverride(BlockState state) {
        Block block = state.getBlock();
        if (block == Blocks.PISTON_HEAD || block == Blocks.MOVING_PISTON || block == Blocks.NETHER_PORTAL || block == Blocks.END_PORTAL || block == Blocks.END_GATEWAY) {
            return ItemStack.EMPTY;
        }
        if (block == Blocks.FARMLAND) {
            return new ItemStack((ItemLike)Blocks.DIRT);
        }
        if (block == Blocks.BROWN_MUSHROOM_BLOCK) {
            return new ItemStack((ItemLike)Blocks.BROWN_MUSHROOM_BLOCK);
        }
        if (block == Blocks.RED_MUSHROOM_BLOCK) {
            return new ItemStack((ItemLike)Blocks.RED_MUSHROOM_BLOCK);
        }
        if (block == Blocks.LAVA) {
            if ((Integer)state.getValue((Property)LiquidBlock.LEVEL) == 0) {
                return new ItemStack((ItemLike)Items.LAVA_BUCKET);
            }
            return ItemStack.EMPTY;
        }
        if (block == Blocks.WATER) {
            if ((Integer)state.getValue((Property)LiquidBlock.LEVEL) == 0) {
                return new ItemStack((ItemLike)Items.WATER_BUCKET);
            }
            return ItemStack.EMPTY;
        }
        if (block instanceof DoorBlock && state.getValue((Property)DoorBlock.HALF) == DoubleBlockHalf.UPPER) {
            return ItemStack.EMPTY;
        }
        if (block instanceof BedBlock && state.getValue((Property)BedBlock.PART) == BedPart.HEAD) {
            return ItemStack.EMPTY;
        }
        if (block instanceof DoublePlantBlock && state.getValue((Property)DoublePlantBlock.HALF) == DoubleBlockHalf.UPPER) {
            return ItemStack.EMPTY;
        }
        return null;
    }

    protected void overrideStackSize(BlockState state, ItemStack stack) {
        Block block = state.getBlock();
        if (block instanceof SlabBlock && state.getValue((Property)SlabBlock.TYPE) == SlabType.DOUBLE) {
            stack.setCount(2);
        } else if (block == Blocks.SNOW) {
            stack.setCount(((Integer)state.getValue((Property)SnowLayerBlock.LAYERS)).intValue());
        } else if (block instanceof TurtleEggBlock) {
            stack.setCount(((Integer)state.getValue((Property)TurtleEggBlock.EGGS)).intValue());
        } else if (block instanceof SeaPickleBlock) {
            stack.setCount(((Integer)state.getValue((Property)SeaPickleBlock.PICKLES)).intValue());
        } else if (block instanceof CandleBlock) {
            stack.setCount(((Integer)state.getValue((Property)CandleBlock.CANDLES)).intValue());
        } else if (block instanceof MultifaceSpreadeableBlock) {
            stack.setCount(MultifaceSpreadeableBlock.availableFaces((BlockState)state).size());
        }
    }
}

