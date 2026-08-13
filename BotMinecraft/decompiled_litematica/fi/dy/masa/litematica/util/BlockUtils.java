/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.base.Splitter
 *  javax.annotation.Nullable
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Holder$Reference
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.core.registries.Registries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.resources.ResourceKey
 *  net.minecraft.tags.TagKey
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.StateDefinition
 *  net.minecraft.world.level.block.state.properties.ChestType
 *  net.minecraft.world.level.block.state.properties.Property
 */
package fi.dy.masa.litematica.util;

import com.google.common.base.Splitter;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import java.util.Iterator;
import java.util.Optional;
import javax.annotation.Nullable;
import net.minecraft.core.Direction;
import net.minecraft.core.Holder;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.tags.TagKey;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.StateDefinition;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.Property;

public class BlockUtils {
    private static final Splitter COMMA_SPLITTER = Splitter.on((char)',');
    private static final Splitter EQUAL_SPLITTER = Splitter.on((char)'=').limit(2);

    public static BlockState fixMirrorDoubleChest(BlockState state, Mirror mirror, ChestType type) {
        Direction facing = (Direction)state.getValue((Property)ChestBlock.FACING);
        Direction.Axis axis = facing.getAxis();
        if (mirror == Mirror.FRONT_BACK) {
            state = (BlockState)state.setValue((Property)ChestBlock.TYPE, (Comparable)type.getOpposite());
            if (axis == Direction.Axis.X) {
                state = (BlockState)state.setValue((Property)ChestBlock.FACING, (Comparable)facing.getOpposite());
            }
        } else if (mirror == Mirror.LEFT_RIGHT) {
            state = (BlockState)state.setValue((Property)ChestBlock.TYPE, (Comparable)type.getOpposite());
            if (axis == Direction.Axis.Z) {
                state = (BlockState)state.setValue((Property)ChestBlock.FACING, (Comparable)facing.getOpposite());
            }
        }
        return state;
    }

    public static Optional<BlockState> getBlockStateFromString(String str, int minecraftDataVersion) {
        int index = str.indexOf("[");
        String blockName = index != -1 ? str.substring(0, index) : str;
        try {
            Optional opt;
            blockName = SchematicConversionMaps.updateBlockName(blockName, minecraftDataVersion);
            Identifier id = Identifier.tryParse((String)blockName);
            if (id != null && BuiltInRegistries.BLOCK.containsKey(id) && (opt = BuiltInRegistries.BLOCK.get(id)).isPresent()) {
                Block block = (Block)((Holder.Reference)opt.get()).value();
                BlockState state = block.defaultBlockState();
                if (index != -1 && str.length() > index + 4 && str.charAt(str.length() - 1) == ']') {
                    StateDefinition stateManager = block.getStateDefinition();
                    String propStr = str.substring(index + 1, str.length() - 1);
                    for (String propAndVal : COMMA_SPLITTER.split((CharSequence)propStr)) {
                        Object val;
                        Property prop;
                        Iterator valIter = EQUAL_SPLITTER.split((CharSequence)propAndVal).iterator();
                        if (!valIter.hasNext() || (prop = stateManager.getProperty((String)valIter.next())) == null || !valIter.hasNext() || (val = BlockUtils.getPropertyValueByName(prop, (String)valIter.next())) == null) continue;
                        state = BlockUtils.getBlockStateWithProperty(state, prop, val);
                    }
                }
                return Optional.of(state);
            }
        }
        catch (Exception e) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    public static <T extends Comparable<T>> BlockState getBlockStateWithProperty(BlockState state, Property<T> prop, Comparable<?> value) {
        return (BlockState)state.setValue(prop, value);
    }

    @Nullable
    public static <T extends Comparable<T>> T getPropertyValueByName(Property<T> prop, String valStr) {
        return (T)((Comparable)prop.getValue(valStr).orElse(null));
    }

    public static boolean blocksHaveSameProperties(BlockState state1, BlockState state2) {
        StateDefinition stateManager1 = state1.getBlock().getStateDefinition();
        StateDefinition stateManager2 = state2.getBlock().getStateDefinition();
        return stateManager1.getProperties().equals(stateManager2.getProperties());
    }

    public static Optional<Block> getBlockFromString(String str) {
        int index = str.indexOf("[");
        String blockName = index != -1 ? str.substring(0, index) : str;
        try {
            Identifier id = Identifier.tryParse((String)blockName);
            if (id != null && BuiltInRegistries.BLOCK.containsKey(id)) {
                Block block = (Block)BuiltInRegistries.BLOCK.getValue(id);
                return Optional.of(block);
            }
        }
        catch (Exception e) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    public static Optional<TagKey<Block>> getBlockTagFromString(String str) {
        if (str.startsWith("#")) {
            try {
                String tagName = str.substring(1);
                Identifier id = Identifier.tryParse((String)tagName);
                if (id != null) {
                    TagKey blockTag = TagKey.create((ResourceKey)Registries.BLOCK, (Identifier)id);
                    return Optional.of(blockTag);
                }
            }
            catch (Exception e) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }
}

