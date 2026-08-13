/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableMap
 *  com.google.common.collect.ImmutableSet
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.util.Mth
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.BedBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.ComparatorBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.ComparatorMode
 *  net.minecraft.world.level.block.state.properties.EnumProperty
 *  net.minecraft.world.level.block.state.properties.Half
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.level.material.Fluids
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.util.EasyPlaceProtocol;
import fi.dy.masa.malilib.util.game.BlockUtils;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Optional;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Mth;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.BedBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.ComparatorBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.ComparatorMode;
import net.minecraft.world.level.block.state.properties.EnumProperty;
import net.minecraft.world.level.block.state.properties.Half;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.material.Fluids;
import net.minecraft.world.phys.Vec3;

public class PlacementHandler {
    public static final ImmutableSet<Property<?>> WHITELISTED_PROPERTIES = ImmutableSet.of((Object)BlockStateProperties.INVERTED, (Object)BlockStateProperties.OPEN, (Object)BlockStateProperties.BELL_ATTACHMENT, (Object)BlockStateProperties.AXIS, (Object)BlockStateProperties.HALF, (Object)BlockStateProperties.ATTACH_FACE, (Object[])new Property[]{BlockStateProperties.CHEST_TYPE, BlockStateProperties.MODE_COMPARATOR, BlockStateProperties.DOOR_HINGE, BlockStateProperties.FACING, BlockStateProperties.HORIZONTAL_FACING, BlockStateProperties.FACING_HOPPER, BlockStateProperties.ORIENTATION, BlockStateProperties.RAIL_SHAPE, BlockStateProperties.RAIL_SHAPE_STRAIGHT, BlockStateProperties.SLAB_TYPE, BlockStateProperties.STAIRS_SHAPE, BlockStateProperties.COPPER_GOLEM_POSE, BlockStateProperties.BITES, BlockStateProperties.DELAY, BlockStateProperties.NOTE, BlockStateProperties.ROTATION_16});
    public static final ImmutableMap<Property<?>, ? extends Comparable<?>> BLACKLISTED_PROPERTIES = ImmutableMap.of((Object)BlockStateProperties.WATERLOGGED, (Object)Boolean.FALSE, (Object)BlockStateProperties.POWERED, (Object)Boolean.FALSE);

    public static EasyPlaceProtocol getEffectiveProtocolVersion() {
        EasyPlaceProtocol protocol = (EasyPlaceProtocol)Configs.Generic.EASY_PLACE_PROTOCOL.getOptionListValue();
        if (protocol == EasyPlaceProtocol.AUTO) {
            if (Minecraft.getInstance().isLocalServer() || EntityDataManager.getInstance().hasServuxServer() || DataManager.hasServuxServer()) {
                return EasyPlaceProtocol.V3;
            }
            if (DataManager.isCarpetServer()) {
                return EasyPlaceProtocol.V2;
            }
            return EasyPlaceProtocol.SLAB_ONLY;
        }
        return protocol;
    }

    @Nullable
    public static BlockState applyPlacementProtocolToPlacementState(BlockState state, UseContext context) {
        EasyPlaceProtocol protocol = PlacementHandler.getEffectiveProtocolVersion();
        if (protocol == EasyPlaceProtocol.V3) {
            return PlacementHandler.applyPlacementProtocolV3(state, context);
        }
        if (protocol == EasyPlaceProtocol.V2) {
            return PlacementHandler.applyPlacementProtocolV2(state, context);
        }
        return state;
    }

    public static BlockState applyPlacementProtocolV2(BlockState state, UseContext context) {
        int protocolValue = (int)(context.hitVec().x - (double)context.pos().getX()) - 2;
        if (protocolValue < 0) {
            return state;
        }
        Optional property = BlockUtils.getFirstDirectionProperty((BlockState)state);
        if (property.isPresent()) {
            if ((state = PlacementHandler.applyDirectionProperty(state, context, (EnumProperty<Direction>)((EnumProperty)property.get()), protocolValue)) == null) {
                return null;
            }
        } else if (state.hasProperty((Property)BlockStateProperties.AXIS)) {
            Direction.Axis axis = Direction.Axis.VALUES[(protocolValue >> 1 & 3) % 3];
            if (BlockStateProperties.AXIS.getPossibleValues().contains(axis)) {
                state = (BlockState)state.setValue((Property)BlockStateProperties.AXIS, (Comparable)axis);
            }
        }
        if ((protocolValue >>>= 5) > 0) {
            Block block = state.getBlock();
            if (block instanceof RepeaterBlock) {
                Integer delay = protocolValue;
                if (RepeaterBlock.DELAY.getPossibleValues().contains(delay)) {
                    state = (BlockState)state.setValue((Property)RepeaterBlock.DELAY, (Comparable)delay);
                }
            } else if (block instanceof ComparatorBlock) {
                state = (BlockState)state.setValue((Property)ComparatorBlock.MODE, (Comparable)ComparatorMode.SUBTRACT);
            }
        }
        if (state.hasProperty((Property)BlockStateProperties.HALF)) {
            state = (BlockState)state.setValue((Property)BlockStateProperties.HALF, (Comparable)(protocolValue > 0 ? Half.TOP : Half.BOTTOM));
        }
        return state;
    }

    public static <T extends Comparable<T>> BlockState applyPlacementProtocolV3(BlockState state, UseContext context) {
        Property prop;
        int protocolValue = (int)(context.hitVec().x - (double)context.pos().getX()) - 2;
        BlockState oldState = state;
        if (protocolValue < 0) {
            return oldState;
        }
        Optional property = BlockUtils.getFirstDirectionProperty((BlockState)state);
        if (property.isPresent() && property.get() != BlockStateProperties.VERTICAL_DIRECTION) {
            if ((state = PlacementHandler.applyDirectionProperty(state, context, (EnumProperty<Direction>)((EnumProperty)property.get()), protocolValue)) == null) {
                return null;
            }
            if (Configs.Generic.EASY_PLACE_SP_VALIDATION.getBooleanValue()) {
                if (state.canSurvive((LevelReader)context.world(), context.pos())) {
                    oldState = state;
                } else {
                    state = oldState;
                }
            } else {
                oldState = state;
            }
            protocolValue >>>= 3;
        }
        protocolValue >>>= 1;
        ArrayList<Property> propList = new ArrayList<Property>(state.getBlock().getStateDefinition().getProperties());
        propList.sort(Comparator.comparing(Property::getName));
        try {
            for (Property p : propList) {
                if (property.isPresent() && ((EnumProperty)property.get()).equals((Object)p) || !WHITELISTED_PROPERTIES.contains((Object)p) || BLACKLISTED_PROPERTIES.containsKey((Object)p)) continue;
                prop = p;
                ArrayList list = new ArrayList(prop.getPossibleValues());
                list.sort(Comparable::compareTo);
                int requiredBits = Mth.log2((int)Mth.smallestEncompassingPowerOfTwo((int)list.size()));
                int bitMask = ~(-1 << requiredBits);
                int valueIndex = protocolValue & bitMask;
                if (valueIndex < 0 || valueIndex >= list.size()) continue;
                Comparable value = (Comparable)list.get(valueIndex);
                if (!state.getValue(prop).equals(value) && value != SlabType.DOUBLE) {
                    state = (BlockState)state.setValue(prop, value);
                    if (Configs.Generic.EASY_PLACE_SP_VALIDATION.getBooleanValue()) {
                        if (state.canSurvive((LevelReader)context.world(), context.pos())) {
                            oldState = state;
                        } else {
                            state = oldState;
                        }
                    } else {
                        oldState = state;
                    }
                }
                protocolValue >>>= requiredBits;
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("Exception trying to apply placement protocol value", (Throwable)e);
        }
        for (Property p : BLACKLISTED_PROPERTIES.keySet()) {
            if (!state.hasProperty(p)) continue;
            prop = p;
            state = (BlockState)state.setValue(prop, (Comparable)BLACKLISTED_PROPERTIES.get((Object)p));
        }
        if (state.hasProperty((Property)BlockStateProperties.WATERLOGGED) && (oldState.hasProperty((Property)BlockStateProperties.WATERLOGGED) && ((Boolean)oldState.getValue((Property)BlockStateProperties.WATERLOGGED)).booleanValue() || oldState.getFluidState() != null && oldState.getFluidState().getType().isSame((Fluid)Fluids.WATER))) {
            state = (BlockState)state.setValue((Property)BlockStateProperties.WATERLOGGED, (Comparable)Boolean.valueOf(true));
        }
        if (Configs.Generic.EASY_PLACE_SP_VALIDATION.getBooleanValue()) {
            if (state.canSurvive((LevelReader)context.world(), context.pos())) {
                return state;
            }
            return null;
        }
        return state;
    }

    private static BlockState applyDirectionProperty(BlockState state, UseContext context, EnumProperty<Direction> property, int protocolValue) {
        Direction facingOrig;
        Direction facing = facingOrig = (Direction)state.getValue(property);
        int decodedFacingIndex = (protocolValue & 0xF) >> 1;
        if (decodedFacingIndex == 6) {
            facing = facing.getOpposite();
        } else if (decodedFacingIndex >= 0 && decodedFacingIndex <= 5) {
            facing = Direction.from3DDataValue((int)decodedFacingIndex);
            if (!property.getPossibleValues().contains(facing)) {
                facing = context.entity().getDirection().getOpposite();
            }
        }
        if (facing != facingOrig && property.getPossibleValues().contains(facing)) {
            if (state.getBlock() instanceof BedBlock) {
                BlockPos headPos = context.pos.relative(facing);
                BlockPlaceContext ctx = context.itemPlacementContext();
                if (!context.world().getBlockState(headPos).canBeReplaced(ctx)) {
                    return null;
                }
            }
            state = (BlockState)state.setValue(property, (Comparable)facing);
        }
        return state;
    }

    public record UseContext(Level world, BlockPos pos, Direction side, Vec3 hitVec, LivingEntity entity, InteractionHand hand, @Nullable BlockPlaceContext itemPlacementContext) {
        public static UseContext from(BlockPlaceContext ctx, InteractionHand hand) {
            Vec3 pos = ctx.getClickLocation();
            return new UseContext(ctx.getLevel(), ctx.getClickedPos(), ctx.getClickedFace(), new Vec3(pos.x, pos.y, pos.z), (LivingEntity)ctx.getPlayer(), hand, ctx);
        }
    }
}

