/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.Items
 *  net.minecraft.world.level.block.AbstractCandleBlock
 *  net.minecraft.world.level.block.AbstractChestBlock
 *  net.minecraft.world.level.block.AbstractFurnaceBlock
 *  net.minecraft.world.level.block.AnvilBlock
 *  net.minecraft.world.level.block.BarrelBlock
 *  net.minecraft.world.level.block.BeaconBlock
 *  net.minecraft.world.level.block.BedBlock
 *  net.minecraft.world.level.block.BellBlock
 *  net.minecraft.world.level.block.BrewingStandBlock
 *  net.minecraft.world.level.block.CakeBlock
 *  net.minecraft.world.level.block.CartographyTableBlock
 *  net.minecraft.world.level.block.CommandBlock
 *  net.minecraft.world.level.block.ComparatorBlock
 *  net.minecraft.world.level.block.CraftingTableBlock
 *  net.minecraft.world.level.block.DispenserBlock
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.DragonEggBlock
 *  net.minecraft.world.level.block.DropperBlock
 *  net.minecraft.world.level.block.EnchantingTableBlock
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.FlowerPotBlock
 *  net.minecraft.world.level.block.GrindstoneBlock
 *  net.minecraft.world.level.block.HopperBlock
 *  net.minecraft.world.level.block.JukeboxBlock
 *  net.minecraft.world.level.block.LecternBlock
 *  net.minecraft.world.level.block.LeverBlock
 *  net.minecraft.world.level.block.LoomBlock
 *  net.minecraft.world.level.block.NoteBlock
 *  net.minecraft.world.level.block.RedStoneWireBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.ScaffoldingBlock
 *  net.minecraft.world.level.block.ShulkerBoxBlock
 *  net.minecraft.world.level.block.SignBlock
 *  net.minecraft.world.level.block.SmithingTableBlock
 *  net.minecraft.world.level.block.StonecutterBlock
 *  net.minecraft.world.level.block.TrapDoorBlock
 */
package me.aleksilassila.litematica.printer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.block.AbstractCandleBlock;
import net.minecraft.world.level.block.AbstractChestBlock;
import net.minecraft.world.level.block.AbstractFurnaceBlock;
import net.minecraft.world.level.block.AnvilBlock;
import net.minecraft.world.level.block.BarrelBlock;
import net.minecraft.world.level.block.BeaconBlock;
import net.minecraft.world.level.block.BedBlock;
import net.minecraft.world.level.block.BellBlock;
import net.minecraft.world.level.block.BrewingStandBlock;
import net.minecraft.world.level.block.CakeBlock;
import net.minecraft.world.level.block.CartographyTableBlock;
import net.minecraft.world.level.block.CommandBlock;
import net.minecraft.world.level.block.ComparatorBlock;
import net.minecraft.world.level.block.CraftingTableBlock;
import net.minecraft.world.level.block.DispenserBlock;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.DragonEggBlock;
import net.minecraft.world.level.block.DropperBlock;
import net.minecraft.world.level.block.EnchantingTableBlock;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.FlowerPotBlock;
import net.minecraft.world.level.block.GrindstoneBlock;
import net.minecraft.world.level.block.HopperBlock;
import net.minecraft.world.level.block.JukeboxBlock;
import net.minecraft.world.level.block.LecternBlock;
import net.minecraft.world.level.block.LeverBlock;
import net.minecraft.world.level.block.LoomBlock;
import net.minecraft.world.level.block.NoteBlock;
import net.minecraft.world.level.block.RedStoneWireBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.ScaffoldingBlock;
import net.minecraft.world.level.block.ShulkerBoxBlock;
import net.minecraft.world.level.block.SignBlock;
import net.minecraft.world.level.block.SmithingTableBlock;
import net.minecraft.world.level.block.StonecutterBlock;
import net.minecraft.world.level.block.TrapDoorBlock;

public abstract class BlockHelper {
    public static List<Class<?>> interactiveBlocks = new ArrayList<Class>(Arrays.asList(AbstractChestBlock.class, AbstractFurnaceBlock.class, CraftingTableBlock.class, LeverBlock.class, DoorBlock.class, TrapDoorBlock.class, BedBlock.class, RedStoneWireBlock.class, ScaffoldingBlock.class, HopperBlock.class, EnchantingTableBlock.class, NoteBlock.class, JukeboxBlock.class, CakeBlock.class, FenceGateBlock.class, BrewingStandBlock.class, DragonEggBlock.class, CommandBlock.class, BeaconBlock.class, AnvilBlock.class, ComparatorBlock.class, RepeaterBlock.class, DropperBlock.class, DispenserBlock.class, ShulkerBoxBlock.class, LecternBlock.class, FlowerPotBlock.class, BarrelBlock.class, BellBlock.class, SmithingTableBlock.class, LoomBlock.class, CartographyTableBlock.class, GrindstoneBlock.class, StonecutterBlock.class, SignBlock.class, AbstractCandleBlock.class));
    public static final Item[] SHOVEL_ITEMS = new Item[]{Items.NETHERITE_SHOVEL, Items.DIAMOND_SHOVEL, Items.GOLDEN_SHOVEL, Items.IRON_SHOVEL, Items.STONE_SHOVEL, Items.WOODEN_SHOVEL};
}

