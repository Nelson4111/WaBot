/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.CrossCollisionBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.StateDefinition
 *  net.minecraft.world.level.block.state.StateDefinition$Builder
 *  net.minecraft.world.level.block.state.properties.Property
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.Litematica;
import java.util.HashMap;
import net.minecraft.resources.Identifier;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CrossCollisionBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.StateDefinition;
import net.minecraft.world.level.block.state.properties.Property;

public class FallbackBlocks {
    public static HashMap<Block, Identifier> BLOCK_TO_ID = new HashMap();
    public static HashMap<Identifier, Block> ID_TO_BLOCK = new HashMap();
    public static HashMap<Identifier, StateDefinition<Block, BlockState>> ID_TO_STATE_MANAGER = new HashMap();
    public static Identifier BLACK_GLASS = FallbackBlocks.registerBasic("black_glass_fallback", (Block)Blocks.STAINED_GLASS.black());
    public static Identifier BLUE_GLASS = FallbackBlocks.registerBasic("blue_glass_fallback", (Block)Blocks.STAINED_GLASS.blue());
    public static Identifier BROWN_GLASS = FallbackBlocks.registerBasic("brown_glass_fallback", (Block)Blocks.STAINED_GLASS.brown());
    public static Identifier CYAN_GLASS = FallbackBlocks.registerBasic("cyan_glass_fallback", (Block)Blocks.STAINED_GLASS.cyan());
    public static Identifier GLASS = FallbackBlocks.registerBasic("glass_fallback", Blocks.GLASS);
    public static Identifier GRAY_GLASS = FallbackBlocks.registerBasic("gray_glass_fallback", (Block)Blocks.STAINED_GLASS.gray());
    public static Identifier GREEN_GLASS = FallbackBlocks.registerBasic("green_glass_fallback", (Block)Blocks.STAINED_GLASS.green());
    public static Identifier LIME_GLASS = FallbackBlocks.registerBasic("lime_glass_fallback", (Block)Blocks.STAINED_GLASS.lime());
    public static Identifier LT_BLUE_GLASS = FallbackBlocks.registerBasic("lt_blue_glass_fallback", (Block)Blocks.STAINED_GLASS.lightBlue());
    public static Identifier LT_GRAY_GLASS = FallbackBlocks.registerBasic("lt_gray_glass_fallback", (Block)Blocks.STAINED_GLASS.lightGray());
    public static Identifier MAGENTA_GLASS = FallbackBlocks.registerBasic("magenta_glass_fallback", (Block)Blocks.STAINED_GLASS.magenta());
    public static Identifier ORANGE_GLASS = FallbackBlocks.registerBasic("orange_glass_fallback", (Block)Blocks.STAINED_GLASS.orange());
    public static Identifier PINK_GLASS = FallbackBlocks.registerBasic("pink_glass_fallback", (Block)Blocks.STAINED_GLASS.pink());
    public static Identifier PURPLE_GLASS = FallbackBlocks.registerBasic("purple_glass_fallback", (Block)Blocks.STAINED_GLASS.purple());
    public static Identifier RED_GLASS = FallbackBlocks.registerBasic("red_glass_fallback", (Block)Blocks.STAINED_GLASS.red());
    public static Identifier TINTED_GLASS = FallbackBlocks.registerBasic("tinted_glass_fallback", Blocks.TINTED_GLASS);
    public static Identifier WHITE_GLASS = FallbackBlocks.registerBasic("white_glass_fallback", (Block)Blocks.STAINED_GLASS.white());
    public static Identifier YELLOW_GLASS = FallbackBlocks.registerBasic("yellow_glass_fallback", (Block)Blocks.STAINED_GLASS.yellow());
    public static Identifier BLACK_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("black_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.black());
    public static Identifier BLUE_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("blue_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.blue());
    public static Identifier BROWN_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("brown_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.brown());
    public static Identifier CYAN_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("cyan_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.cyan());
    public static Identifier GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("glass_pane_fallback", Blocks.GLASS_PANE);
    public static Identifier GRAY_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("gray_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.gray());
    public static Identifier GREEN_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("green_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.green());
    public static Identifier LIME_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("lime_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.lime());
    public static Identifier LT_BLUE_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("lt_blue_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.lightBlue());
    public static Identifier LT_GRAY_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("lt_gray_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.lightGray());
    public static Identifier MAGENTA_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("magenta_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.magenta());
    public static Identifier ORANGE_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("orange_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.orange());
    public static Identifier PINK_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("pink_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.pink());
    public static Identifier PURPLE_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("purple_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.purple());
    public static Identifier RED_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("red_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.red());
    public static Identifier WHITE_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("white_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.white());
    public static Identifier YELLOW_GLASS_PANE = FallbackBlocks.registerHorizontalConnecting("yellow_glass_pane_fallback", (Block)Blocks.STAINED_GLASS_PANE.yellow());

    private static Identifier registerBasic(String name, Block block) {
        Identifier id = Identifier.fromNamespaceAndPath((String)"litematica", (String)name);
        BLOCK_TO_ID.put(block, id);
        ID_TO_BLOCK.put(id, block);
        ID_TO_STATE_MANAGER.put(id, (StateDefinition<Block, BlockState>)new StateDefinition.Builder((Object)block).create(Block::defaultBlockState, BlockState::new));
        return id;
    }

    private static Identifier registerHorizontalConnecting(String name, Block block) {
        StateDefinition.Builder builder = new StateDefinition.Builder((Object)block);
        Identifier id = Identifier.fromNamespaceAndPath((String)"litematica", (String)name);
        BLOCK_TO_ID.put(block, id);
        ID_TO_BLOCK.put(id, block);
        builder.add(new Property[]{CrossCollisionBlock.NORTH});
        builder.add(new Property[]{CrossCollisionBlock.EAST});
        builder.add(new Property[]{CrossCollisionBlock.SOUTH});
        builder.add(new Property[]{CrossCollisionBlock.WEST});
        builder.add(new Property[]{CrossCollisionBlock.WATERLOGGED});
        ID_TO_STATE_MANAGER.put(id, (StateDefinition<Block, BlockState>)builder.create(FallbackBlocks::defaultHorizontalConnectingBlockState, BlockState::new));
        return id;
    }

    public static BlockState defaultHorizontalConnectingBlockState(Block block) {
        return (BlockState)((BlockState)((BlockState)((BlockState)((BlockState)block.defaultBlockState().setValue((Property)CrossCollisionBlock.NORTH, (Comparable)Boolean.valueOf(false))).setValue((Property)CrossCollisionBlock.EAST, (Comparable)Boolean.valueOf(false))).setValue((Property)CrossCollisionBlock.SOUTH, (Comparable)Boolean.valueOf(false))).setValue((Property)CrossCollisionBlock.WEST, (Comparable)Boolean.valueOf(false))).setValue((Property)CrossCollisionBlock.WATERLOGGED, (Comparable)Boolean.valueOf(false));
    }

    public static void register() {
        Litematica.debugLog("FallbackBlockModels: initialized.", new Object[0]);
    }
}

