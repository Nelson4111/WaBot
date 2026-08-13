/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.network.chat.Component
 *  net.minecraft.network.chat.MutableComponent
 *  net.minecraft.util.Mth
 *  net.minecraft.world.item.DyeColor
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.block.AbstractBannerBlock
 *  net.minecraft.world.level.block.AbstractSkullBlock
 *  net.minecraft.world.level.block.BannerBlock
 *  net.minecraft.world.level.block.BaseFireBlock
 *  net.minecraft.world.level.block.BedBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.ChorusPlantBlock
 *  net.minecraft.world.level.block.CrossCollisionBlock
 *  net.minecraft.world.level.block.DiodeBlock
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.DoublePlantBlock
 *  net.minecraft.world.level.block.FenceBlock
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.IronBarsBlock
 *  net.minecraft.world.level.block.NoteBlock
 *  net.minecraft.world.level.block.RedStoneWireBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.SkullBlock$Type
 *  net.minecraft.world.level.block.SkullBlock$Types
 *  net.minecraft.world.level.block.SnowyBlock
 *  net.minecraft.world.level.block.StairBlock
 *  net.minecraft.world.level.block.TripWireBlock
 *  net.minecraft.world.level.block.VineBlock
 *  net.minecraft.world.level.block.WallBannerBlock
 *  net.minecraft.world.level.block.WallSkullBlock
 *  net.minecraft.world.level.block.entity.SignText
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BedPart
 *  net.minecraft.world.level.block.state.properties.BooleanProperty
 *  net.minecraft.world.level.block.state.properties.DoorHingeSide
 *  net.minecraft.world.level.block.state.properties.DoubleBlockHalf
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.RedstoneSide
 */
package fi.dy.masa.litematica.schematic.conversion;

import fi.dy.masa.litematica.mixin.block.IMixinFenceGateBlock;
import fi.dy.masa.litematica.mixin.block.IMixinRedstoneWireBlock;
import fi.dy.masa.litematica.mixin.block.IMixinStairsBlock;
import fi.dy.masa.litematica.mixin.block.IMixinVineBlock;
import fi.dy.masa.litematica.schematic.conversion.IBlockReaderWithData;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.RegistryAccess;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.util.Mth;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.block.AbstractBannerBlock;
import net.minecraft.world.level.block.AbstractSkullBlock;
import net.minecraft.world.level.block.BannerBlock;
import net.minecraft.world.level.block.BaseFireBlock;
import net.minecraft.world.level.block.BedBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.ChorusPlantBlock;
import net.minecraft.world.level.block.CrossCollisionBlock;
import net.minecraft.world.level.block.DiodeBlock;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.DoublePlantBlock;
import net.minecraft.world.level.block.FenceBlock;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.IronBarsBlock;
import net.minecraft.world.level.block.NoteBlock;
import net.minecraft.world.level.block.RedStoneWireBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.SkullBlock;
import net.minecraft.world.level.block.SnowyBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.TripWireBlock;
import net.minecraft.world.level.block.VineBlock;
import net.minecraft.world.level.block.WallBannerBlock;
import net.minecraft.world.level.block.WallSkullBlock;
import net.minecraft.world.level.block.entity.SignText;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BedPart;
import net.minecraft.world.level.block.state.properties.BooleanProperty;
import net.minecraft.world.level.block.state.properties.DoorHingeSide;
import net.minecraft.world.level.block.state.properties.DoubleBlockHalf;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.RedstoneSide;

public class SchematicConversionFixers {
    private static final BooleanProperty[] HORIZONTAL_CONNECTING_BLOCK_PROPS = new BooleanProperty[]{null, null, CrossCollisionBlock.NORTH, CrossCollisionBlock.SOUTH, CrossCollisionBlock.WEST, CrossCollisionBlock.EAST};
    private static final BlockState REDSTONE_WIRE_DOT_OLD = Blocks.REDSTONE_WIRE.defaultBlockState();
    private static final BlockState REDSTONE_WIRE_DOT = (BlockState)((BlockState)((BlockState)((BlockState)((BlockState)Blocks.REDSTONE_WIRE.defaultBlockState().setValue((Property)RedStoneWireBlock.POWER, (Comparable)Integer.valueOf(0))).setValue((Property)RedStoneWireBlock.NORTH, (Comparable)RedstoneSide.NONE)).setValue((Property)RedStoneWireBlock.EAST, (Comparable)RedstoneSide.NONE)).setValue((Property)RedStoneWireBlock.SOUTH, (Comparable)RedstoneSide.NONE)).setValue((Property)RedStoneWireBlock.WEST, (Comparable)RedstoneSide.NONE);
    private static final BlockState REDSTONE_WIRE_CROSS = (BlockState)((BlockState)((BlockState)((BlockState)Blocks.REDSTONE_WIRE.defaultBlockState().setValue((Property)RedStoneWireBlock.NORTH, (Comparable)RedstoneSide.SIDE)).setValue((Property)RedStoneWireBlock.EAST, (Comparable)RedstoneSide.SIDE)).setValue((Property)RedStoneWireBlock.SOUTH, (Comparable)RedstoneSide.SIDE)).setValue((Property)RedStoneWireBlock.WEST, (Comparable)RedstoneSide.SIDE);
    public static final IStateFixer FIXER_BANNER = (reader, state, pos) -> {
        DyeColor colorFromData;
        DyeColor colorOrig;
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("Base") && (colorOrig = ((AbstractBannerBlock)state.getBlock()).getColor()) != (colorFromData = DyeColor.byId((int)(15 - tag.getIntOr("Base", 0))))) {
            Integer rotation = (Integer)state.getValue((Property)BannerBlock.ROTATION);
            switch (colorFromData) {
                case WHITE: {
                    state = ((Block)Blocks.BANNER.white()).defaultBlockState();
                    break;
                }
                case ORANGE: {
                    state = ((Block)Blocks.BANNER.orange()).defaultBlockState();
                    break;
                }
                case MAGENTA: {
                    state = ((Block)Blocks.BANNER.magenta()).defaultBlockState();
                    break;
                }
                case LIGHT_BLUE: {
                    state = ((Block)Blocks.BANNER.lightBlue()).defaultBlockState();
                    break;
                }
                case YELLOW: {
                    state = ((Block)Blocks.BANNER.yellow()).defaultBlockState();
                    break;
                }
                case LIME: {
                    state = ((Block)Blocks.BANNER.lime()).defaultBlockState();
                    break;
                }
                case PINK: {
                    state = ((Block)Blocks.BANNER.pink()).defaultBlockState();
                    break;
                }
                case GRAY: {
                    state = ((Block)Blocks.BANNER.gray()).defaultBlockState();
                    break;
                }
                case LIGHT_GRAY: {
                    state = ((Block)Blocks.BANNER.lightGray()).defaultBlockState();
                    break;
                }
                case CYAN: {
                    state = ((Block)Blocks.BANNER.cyan()).defaultBlockState();
                    break;
                }
                case PURPLE: {
                    state = ((Block)Blocks.BANNER.purple()).defaultBlockState();
                    break;
                }
                case BLUE: {
                    state = ((Block)Blocks.BANNER.blue()).defaultBlockState();
                    break;
                }
                case BROWN: {
                    state = ((Block)Blocks.BANNER.brown()).defaultBlockState();
                    break;
                }
                case GREEN: {
                    state = ((Block)Blocks.BANNER.green()).defaultBlockState();
                    break;
                }
                case RED: {
                    state = ((Block)Blocks.BANNER.red()).defaultBlockState();
                    break;
                }
                case BLACK: {
                    state = ((Block)Blocks.BANNER.black()).defaultBlockState();
                }
            }
            state = (BlockState)state.setValue((Property)BannerBlock.ROTATION, (Comparable)rotation);
        }
        return state;
    };
    public static final IStateFixer FIXER_BANNER_WALL = (reader, state, pos) -> {
        DyeColor colorFromData;
        DyeColor colorOrig;
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("Base") && (colorOrig = ((AbstractBannerBlock)state.getBlock()).getColor()) != (colorFromData = DyeColor.byId((int)(15 - tag.getIntOr("Base", 0))))) {
            Direction facing = (Direction)state.getValue((Property)WallBannerBlock.FACING);
            switch (colorFromData) {
                case WHITE: {
                    state = ((Block)Blocks.WALL_BANNER.white()).defaultBlockState();
                    break;
                }
                case ORANGE: {
                    state = ((Block)Blocks.WALL_BANNER.orange()).defaultBlockState();
                    break;
                }
                case MAGENTA: {
                    state = ((Block)Blocks.WALL_BANNER.magenta()).defaultBlockState();
                    break;
                }
                case LIGHT_BLUE: {
                    state = ((Block)Blocks.WALL_BANNER.lightBlue()).defaultBlockState();
                    break;
                }
                case YELLOW: {
                    state = ((Block)Blocks.WALL_BANNER.yellow()).defaultBlockState();
                    break;
                }
                case LIME: {
                    state = ((Block)Blocks.WALL_BANNER.lime()).defaultBlockState();
                    break;
                }
                case PINK: {
                    state = ((Block)Blocks.WALL_BANNER.pink()).defaultBlockState();
                    break;
                }
                case GRAY: {
                    state = ((Block)Blocks.WALL_BANNER.gray()).defaultBlockState();
                    break;
                }
                case LIGHT_GRAY: {
                    state = ((Block)Blocks.WALL_BANNER.lightGray()).defaultBlockState();
                    break;
                }
                case CYAN: {
                    state = ((Block)Blocks.WALL_BANNER.cyan()).defaultBlockState();
                    break;
                }
                case PURPLE: {
                    state = ((Block)Blocks.WALL_BANNER.purple()).defaultBlockState();
                    break;
                }
                case BLUE: {
                    state = ((Block)Blocks.WALL_BANNER.blue()).defaultBlockState();
                    break;
                }
                case BROWN: {
                    state = ((Block)Blocks.WALL_BANNER.brown()).defaultBlockState();
                    break;
                }
                case GREEN: {
                    state = ((Block)Blocks.WALL_BANNER.green()).defaultBlockState();
                    break;
                }
                case RED: {
                    state = ((Block)Blocks.WALL_BANNER.red()).defaultBlockState();
                    break;
                }
                case BLACK: {
                    state = ((Block)Blocks.WALL_BANNER.black()).defaultBlockState();
                }
            }
            state = (BlockState)state.setValue((Property)WallBannerBlock.FACING, (Comparable)facing);
        }
        return state;
    };
    public static final IStateFixer FIXER_BED = (reader, state, pos) -> {
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("color")) {
            int colorId = tag.getIntOr("color", -1);
            Direction facing = (Direction)state.getValue((Property)BedBlock.FACING);
            BedPart part = (BedPart)state.getValue((Property)BedBlock.PART);
            Boolean occupied = (Boolean)state.getValue((Property)BedBlock.OCCUPIED);
            switch (colorId) {
                case 0: {
                    state = ((Block)Blocks.BED.white()).defaultBlockState();
                    break;
                }
                case 1: {
                    state = ((Block)Blocks.BED.orange()).defaultBlockState();
                    break;
                }
                case 2: {
                    state = ((Block)Blocks.BED.magenta()).defaultBlockState();
                    break;
                }
                case 3: {
                    state = ((Block)Blocks.BED.lightBlue()).defaultBlockState();
                    break;
                }
                case 4: {
                    state = ((Block)Blocks.BED.yellow()).defaultBlockState();
                    break;
                }
                case 5: {
                    state = ((Block)Blocks.BED.lime()).defaultBlockState();
                    break;
                }
                case 6: {
                    state = ((Block)Blocks.BED.pink()).defaultBlockState();
                    break;
                }
                case 7: {
                    state = ((Block)Blocks.BED.gray()).defaultBlockState();
                    break;
                }
                case 8: {
                    state = ((Block)Blocks.BED.lightGray()).defaultBlockState();
                    break;
                }
                case 9: {
                    state = ((Block)Blocks.BED.cyan()).defaultBlockState();
                    break;
                }
                case 10: {
                    state = ((Block)Blocks.BED.purple()).defaultBlockState();
                    break;
                }
                case 11: {
                    state = ((Block)Blocks.BED.blue()).defaultBlockState();
                    break;
                }
                case 12: {
                    state = ((Block)Blocks.BED.brown()).defaultBlockState();
                    break;
                }
                case 13: {
                    state = ((Block)Blocks.BED.green()).defaultBlockState();
                    break;
                }
                case 14: {
                    state = ((Block)Blocks.BED.red()).defaultBlockState();
                    break;
                }
                case 15: {
                    state = ((Block)Blocks.BED.black()).defaultBlockState();
                    break;
                }
                default: {
                    return state;
                }
            }
            state = (BlockState)((BlockState)((BlockState)state.setValue((Property)BedBlock.FACING, (Comparable)facing)).setValue((Property)BedBlock.PART, (Comparable)part)).setValue((Property)BedBlock.OCCUPIED, (Comparable)occupied);
        }
        return state;
    };
    public static final IStateFixer FIXER_CHRORUS_PLANT = (reader, state, pos) -> ChorusPlantBlock.getStateWithConnections((BlockGetter)reader, (BlockPos)pos, (BlockState)state);
    public static final IStateFixer FIXER_DIRT_SNOWY = (reader, state, pos) -> {
        Block block = reader.getBlockState(pos.above()).getBlock();
        return (BlockState)state.setValue((Property)SnowyBlock.SNOWY, (Comparable)Boolean.valueOf(block == Blocks.SNOW_BLOCK || block == Blocks.SNOW));
    };
    public static final IStateFixer FIXER_DOOR = (reader, state, pos) -> {
        if (state.getValue((Property)DoorBlock.HALF) == DoubleBlockHalf.UPPER) {
            BlockState stateLower = reader.getBlockState(pos.below());
            if (stateLower.getBlock() == state.getBlock()) {
                state = (BlockState)state.setValue((Property)DoorBlock.FACING, (Comparable)((Direction)stateLower.getValue((Property)DoorBlock.FACING)));
                state = (BlockState)state.setValue((Property)DoorBlock.OPEN, (Comparable)((Boolean)stateLower.getValue((Property)DoorBlock.OPEN)));
            }
        } else {
            BlockState stateUpper = reader.getBlockState(pos.above());
            if (stateUpper.getBlock() == state.getBlock()) {
                state = (BlockState)state.setValue((Property)DoorBlock.HINGE, (Comparable)((DoorHingeSide)stateUpper.getValue((Property)DoorBlock.HINGE)));
                state = (BlockState)state.setValue((Property)DoorBlock.POWERED, (Comparable)((Boolean)stateUpper.getValue((Property)DoorBlock.POWERED)));
            }
        }
        return state;
    };
    public static final IStateFixer FIXER_DOUBLE_PLANT = (reader, state, pos) -> {
        BlockState stateLower;
        if (state.getValue((Property)DoublePlantBlock.HALF) == DoubleBlockHalf.UPPER && (stateLower = reader.getBlockState(pos.below())).getBlock() instanceof DoublePlantBlock) {
            state = (BlockState)stateLower.setValue((Property)DoublePlantBlock.HALF, (Comparable)DoubleBlockHalf.UPPER);
        }
        return state;
    };
    public static final IStateFixer FIXER_FENCE = (reader, state, pos) -> {
        FenceBlock fence = (FenceBlock)state.getBlock();
        for (Direction side : PositionUtils.HORIZONTAL_DIRECTIONS) {
            BlockPos posAdj = pos.relative(side);
            BlockState stateAdj = reader.getBlockState(posAdj);
            Direction sideOpposite = side.getOpposite();
            boolean flag = stateAdj.isFaceSturdy((BlockGetter)reader, posAdj, sideOpposite);
            state = (BlockState)state.setValue((Property)HORIZONTAL_CONNECTING_BLOCK_PROPS[side.get3DDataValue()], (Comparable)Boolean.valueOf(fence.connectsTo(stateAdj, flag, sideOpposite)));
        }
        return state;
    };
    public static final IStateFixer FIXER_FENCE_GATE = (reader, state, pos) -> {
        FenceGateBlock gate = (FenceGateBlock)state.getBlock();
        Direction facing = (Direction)state.getValue((Property)FenceGateBlock.FACING);
        boolean inWall = false;
        inWall = facing.getAxis() == Direction.Axis.X ? ((IMixinFenceGateBlock)gate).litematica_invokeIsWall(reader.getBlockState(pos.relative(Direction.NORTH))) || ((IMixinFenceGateBlock)gate).litematica_invokeIsWall(reader.getBlockState(pos.relative(Direction.SOUTH))) : ((IMixinFenceGateBlock)gate).litematica_invokeIsWall(reader.getBlockState(pos.relative(Direction.WEST))) || ((IMixinFenceGateBlock)gate).litematica_invokeIsWall(reader.getBlockState(pos.relative(Direction.EAST)));
        return (BlockState)state.setValue((Property)FenceGateBlock.IN_WALL, (Comparable)Boolean.valueOf(inWall));
    };
    public static final IStateFixer FIXER_FIRE = (reader, state, pos) -> BaseFireBlock.getState((BlockGetter)reader, (BlockPos)pos);
    public static final IStateFixer FIXER_FLOWER_POT = (reader, state, pos) -> {
        String itemName;
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("Item") && (itemName = tag.getStringOr("Item", "")).length() > 0 && tag.contains("Data")) {
            int meta = tag.getIntOr("Data", 0);
            switch (itemName) {
                case "minecraft:sapling": {
                    if (meta == 0) {
                        return Blocks.POTTED_OAK_SAPLING.defaultBlockState();
                    }
                    if (meta == 1) {
                        return Blocks.POTTED_SPRUCE_SAPLING.defaultBlockState();
                    }
                    if (meta == 2) {
                        return Blocks.POTTED_BIRCH_SAPLING.defaultBlockState();
                    }
                    if (meta == 3) {
                        return Blocks.POTTED_JUNGLE_SAPLING.defaultBlockState();
                    }
                    if (meta == 4) {
                        return Blocks.POTTED_ACACIA_SAPLING.defaultBlockState();
                    }
                    if (meta != 5) break;
                    return Blocks.POTTED_DARK_OAK_SAPLING.defaultBlockState();
                }
                case "minecraft:tallgrass": {
                    if (meta == 0) {
                        return Blocks.POTTED_DEAD_BUSH.defaultBlockState();
                    }
                    if (meta != 2) break;
                    return Blocks.POTTED_FERN.defaultBlockState();
                }
                case "minecraft:red_flower": {
                    if (meta == 0) {
                        return Blocks.POTTED_POPPY.defaultBlockState();
                    }
                    if (meta == 1) {
                        return Blocks.POTTED_BLUE_ORCHID.defaultBlockState();
                    }
                    if (meta == 2) {
                        return Blocks.POTTED_ALLIUM.defaultBlockState();
                    }
                    if (meta == 3) {
                        return Blocks.POTTED_AZURE_BLUET.defaultBlockState();
                    }
                    if (meta == 4) {
                        return Blocks.POTTED_RED_TULIP.defaultBlockState();
                    }
                    if (meta == 5) {
                        return Blocks.POTTED_ORANGE_TULIP.defaultBlockState();
                    }
                    if (meta == 6) {
                        return Blocks.POTTED_WHITE_TULIP.defaultBlockState();
                    }
                    if (meta == 7) {
                        return Blocks.POTTED_PINK_TULIP.defaultBlockState();
                    }
                    if (meta != 8) break;
                    return Blocks.POTTED_OXEYE_DAISY.defaultBlockState();
                }
                case "minecraft:yellow_flower": {
                    return Blocks.POTTED_DANDELION.defaultBlockState();
                }
                case "minecraft:brown_mushroom": {
                    return Blocks.POTTED_BROWN_MUSHROOM.defaultBlockState();
                }
                case "minecraft:red_mushroom": {
                    return Blocks.POTTED_RED_MUSHROOM.defaultBlockState();
                }
                case "minecraft:deadbush": {
                    return Blocks.POTTED_DEAD_BUSH.defaultBlockState();
                }
                case "minecraft:cactus": {
                    return Blocks.POTTED_CACTUS.defaultBlockState();
                }
                default: {
                    return state;
                }
            }
        }
        return state;
    };
    public static final IStateFixer FIXER_NOTE_BLOCK = (reader, state, pos) -> {
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null) {
            state = (BlockState)((BlockState)((BlockState)state.setValue((Property)NoteBlock.POWERED, (Comparable)Boolean.valueOf(tag.getBooleanOr("powered", false)))).setValue((Property)NoteBlock.NOTE, (Comparable)Integer.valueOf(Mth.clamp((int)tag.getByteOr("note", (byte)0), (int)0, (int)24)))).setValue((Property)NoteBlock.INSTRUMENT, (Comparable)reader.getBlockState(pos.below()).instrument());
        }
        return state;
    };
    public static final IStateFixer FIXER_PANE = (reader, state, pos) -> {
        IronBarsBlock pane = (IronBarsBlock)state.getBlock();
        for (Direction side : PositionUtils.HORIZONTAL_DIRECTIONS) {
            BlockPos posAdj = pos.relative(side);
            BlockState stateAdj = reader.getBlockState(posAdj);
            Direction sideOpposite = side.getOpposite();
            boolean flag = stateAdj.isFaceSturdy((BlockGetter)reader, posAdj, sideOpposite);
            state = (BlockState)state.setValue((Property)HORIZONTAL_CONNECTING_BLOCK_PROPS[side.get3DDataValue()], (Comparable)Boolean.valueOf(pane.attachsTo(stateAdj, flag)));
        }
        return state;
    };
    public static final IStateFixer FIXER_REDSTONE_REPEATER = (reader, state, pos) -> (BlockState)state.setValue((Property)RepeaterBlock.LOCKED, (Comparable)Boolean.valueOf(SchematicConversionFixers.getIsRepeaterPoweredOnSide(reader, pos, state)));
    public static final IStateFixer FIXER_REDSTONE_WIRE = (reader, state, pos) -> {
        RedStoneWireBlock wire = (RedStoneWireBlock)state.getBlock();
        BlockState stateAdj = ((IMixinRedstoneWireBlock)wire).litematica_GetPlacementState(reader, state, pos);
        if (!stateAdj.equals((Object)state)) {
            stateAdj = state;
        }
        if (!stateAdj.equals((Object)REDSTONE_WIRE_DOT) && stateAdj.setValue((Property)RedStoneWireBlock.POWER, (Comparable)Integer.valueOf(0)) == REDSTONE_WIRE_DOT_OLD) {
            stateAdj = (BlockState)REDSTONE_WIRE_CROSS.setValue((Property)RedStoneWireBlock.POWER, (Comparable)((Integer)stateAdj.getValue((Property)RedStoneWireBlock.POWER)));
        }
        return stateAdj;
    };
    public static final IStateFixer FIXER_SIGN = (reader, state, pos) -> {
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && (tag.contains("Text1") || tag.contains("Text2") || tag.contains("Text3") || tag.contains("Text4"))) {
            MutableComponent text1 = Component.empty();
            MutableComponent text2 = Component.empty();
            MutableComponent text3 = Component.empty();
            MutableComponent text4 = Component.empty();
            try {
                RegistryAccess registry = SchematicWorldHandler.INSTANCE.getRegistryManager();
                text1 = tag.contains("Text1") ? StringUtils.legacyTextSerializer((String)tag.getStringOr("Text1", ""), (RegistryAccess)registry) : Component.empty();
                text2 = tag.contains("Text2") ? StringUtils.legacyTextSerializer((String)tag.getStringOr("Text2", ""), (RegistryAccess)registry) : Component.empty();
                text3 = tag.contains("Text3") ? StringUtils.legacyTextSerializer((String)tag.getStringOr("Text3", ""), (RegistryAccess)registry) : Component.empty();
                text4 = tag.contains("Text4") ? StringUtils.legacyTextSerializer((String)tag.getStringOr("Text4", ""), (RegistryAccess)registry) : Component.empty();
            }
            catch (Exception registry) {
                // empty catch block
            }
            DyeColor color = DyeColor.byName((String)tag.getStringOr("Color", ""), (DyeColor)DyeColor.BLACK);
            boolean glowing = tag.getBooleanOr("GlowingText", false);
            SignText frontText = new SignText(new Component[]{text1, text2, text3, text4}, new Component[]{Component.empty(), Component.empty(), Component.empty(), Component.empty()}, color, glowing);
            tag.store("front_text", SignText.DIRECT_CODEC, (Object)frontText);
            tag.remove("Color");
            tag.remove("GlowingText");
            tag.remove("Text1");
            tag.remove("Text2");
            tag.remove("Text3");
            tag.remove("Text4");
        }
        return state;
    };
    public static final IStateFixer FIXER_SKULL = (reader, state, pos) -> {
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("SkullType")) {
            int id = Mth.clamp((int)tag.getByteOr("SkullType", (byte)0), (int)0, (int)5);
            if (id == 2) {
                id = 3;
            } else if (id == 3) {
                id = 2;
            }
            SkullBlock.Type typeOrig = ((AbstractSkullBlock)state.getBlock()).getType();
            SkullBlock.Types typeFromData = SkullBlock.Types.values()[id];
            if (typeOrig != typeFromData) {
                if (typeFromData == SkullBlock.Types.SKELETON) {
                    state = Blocks.SKELETON_SKULL.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.WITHER_SKELETON) {
                    state = Blocks.WITHER_SKELETON_SKULL.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.PLAYER) {
                    state = Blocks.PLAYER_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.ZOMBIE) {
                    state = Blocks.ZOMBIE_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.CREEPER) {
                    state = Blocks.CREEPER_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.DRAGON) {
                    state = Blocks.DRAGON_HEAD.defaultBlockState();
                }
            }
            state = (BlockState)state.setValue((Property)BannerBlock.ROTATION, (Comparable)Integer.valueOf(Mth.clamp((int)tag.getByteOr("Rot", (byte)0), (int)0, (int)15)));
        }
        return state;
    };
    public static final IStateFixer FIXER_SKULL_WALL = (reader, state, pos) -> {
        CompoundTag tag = reader.getBlockEntityData(pos);
        if (tag != null && tag.contains("SkullType")) {
            int id = Mth.clamp((int)tag.getByteOr("SkullType", (byte)0), (int)0, (int)5);
            if (id == 2) {
                id = 3;
            } else if (id == 3) {
                id = 2;
            }
            SkullBlock.Type typeOrig = ((AbstractSkullBlock)state.getBlock()).getType();
            SkullBlock.Types typeFromData = SkullBlock.Types.values()[id];
            if (typeOrig != typeFromData) {
                Direction facing = (Direction)state.getValue((Property)WallSkullBlock.FACING);
                if (typeFromData == SkullBlock.Types.SKELETON) {
                    state = Blocks.SKELETON_WALL_SKULL.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.WITHER_SKELETON) {
                    state = Blocks.WITHER_SKELETON_WALL_SKULL.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.PLAYER) {
                    state = Blocks.PLAYER_WALL_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.ZOMBIE) {
                    state = Blocks.ZOMBIE_WALL_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.CREEPER) {
                    state = Blocks.CREEPER_WALL_HEAD.defaultBlockState();
                } else if (typeFromData == SkullBlock.Types.DRAGON) {
                    state = Blocks.DRAGON_WALL_HEAD.defaultBlockState();
                }
                state = (BlockState)state.setValue((Property)WallSkullBlock.FACING, (Comparable)facing);
            }
        }
        return state;
    };
    public static final IStateFixer FIXER_STAIRS = (reader, state, pos) -> (BlockState)state.setValue((Property)StairBlock.SHAPE, (Comparable)IMixinStairsBlock.litematica_invokeGetStairShape(state, reader, pos));
    public static final IStateFixer FIXER_STEM = (reader, state, pos) -> state;
    public static final IStateFixer FIXER_TRIPWIRE = (reader, state, pos) -> {
        TripWireBlock wire = (TripWireBlock)state.getBlock();
        return (BlockState)((BlockState)((BlockState)((BlockState)state.setValue((Property)TripWireBlock.NORTH, (Comparable)Boolean.valueOf(wire.shouldConnectTo(reader.getBlockState(pos.north()), Direction.NORTH)))).setValue((Property)TripWireBlock.SOUTH, (Comparable)Boolean.valueOf(wire.shouldConnectTo(reader.getBlockState(pos.south()), Direction.SOUTH)))).setValue((Property)TripWireBlock.WEST, (Comparable)Boolean.valueOf(wire.shouldConnectTo(reader.getBlockState(pos.west()), Direction.WEST)))).setValue((Property)TripWireBlock.EAST, (Comparable)Boolean.valueOf(wire.shouldConnectTo(reader.getBlockState(pos.east()), Direction.EAST)));
    };
    public static final IStateFixer FIXER_VINE = (reader, state, pos) -> {
        VineBlock vine = (VineBlock)state.getBlock();
        return (BlockState)state.setValue((Property)VineBlock.UP, (Comparable)Boolean.valueOf(((IMixinVineBlock)vine).litematica_invokeShouldConnectUp(reader, pos.above(), Direction.UP)));
    };

    private static boolean getIsRepeaterPoweredOnSide(BlockGetter reader, BlockPos pos, BlockState stateRepeater) {
        Direction facing = (Direction)stateRepeater.getValue((Property)RepeaterBlock.FACING);
        Direction sideLeft = facing.getCounterClockWise();
        Direction sideRight = facing.getClockWise();
        return SchematicConversionFixers.getRepeaterPowerOnSide(reader, pos.relative(sideLeft), sideLeft) > 0 || SchematicConversionFixers.getRepeaterPowerOnSide(reader, pos.relative(sideRight), sideRight) > 0;
    }

    private static int getRepeaterPowerOnSide(BlockGetter reader, BlockPos pos, Direction side) {
        BlockState state = reader.getBlockState(pos);
        Block block = state.getBlock();
        if (DiodeBlock.isDiode((BlockState)state)) {
            if (block == Blocks.REDSTONE_BLOCK) {
                return 15;
            }
            return block == Blocks.REDSTONE_WIRE ? ((Integer)state.getValue((Property)RedStoneWireBlock.POWER)).intValue() : state.getDirectSignal(reader, pos, side);
        }
        return 0;
    }

    public static interface IStateFixer {
        public BlockState fixState(IBlockReaderWithData var1, BlockState var2, BlockPos var3);
    }
}

