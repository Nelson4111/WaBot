package me.aleksilassila.litematica.printer.manual;

import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.core.BlockPos;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;

public class PlacementOverrideHandler {
    private static final Map<BlockPos, BlockStateEntry> overrides = new ConcurrentHashMap<>();

    private static class BlockStateEntry {
        final BlockState state;
        final long expiresAt;

        BlockStateEntry(BlockState state, long expiresAt) {
            this.state = state;
            this.expiresAt = expiresAt;
        }
    }

    public static BlockPos getTargetPlacementPos(Level clientWorld, WorldSchematic schematicWorld, BlockHitResult hitResult) {
        if (hitResult == null || schematicWorld == null) return null;

        BlockPos clickedPos = hitResult.getBlockPos();
        BlockPos offsetPos = clickedPos.relative(hitResult.getDirection());

        BlockState targetAtOffset = schematicWorld.getBlockState(offsetPos);
        if (targetAtOffset != null && !targetAtOffset.isAir()) {
            return offsetPos;
        }

        BlockState targetAtClicked = schematicWorld.getBlockState(clickedPos);
        if (targetAtClicked != null && !targetAtClicked.isAir()) {
            return clickedPos;
        }

        return offsetPos;
    }

    public static void setOverrideState(BlockPos pos, BlockState state, BlockHitResult hitResult) {
        if (state != null && !state.isAir()) {
            long expires = System.currentTimeMillis() + 1200L;
            BlockStateEntry entry = new BlockStateEntry(state, expires);
            if (pos != null) {
                overrides.put(pos.immutable(), entry);
            }
            if (hitResult != null) {
                overrides.put(hitResult.getBlockPos().immutable(), entry);
                overrides.put(hitResult.getBlockPos().relative(hitResult.getDirection()).immutable(), entry);
            }
        }
    }

    public static BlockState getOverrideState(BlockPos pos) {
        if (pos == null) return null;
        BlockStateEntry entry = overrides.get(pos);
        if (entry != null) {
            if (System.currentTimeMillis() > entry.expiresAt) {
                overrides.remove(pos);
                return null;
            }
            return entry.state;
        }
        return null;
    }

    public static BlockState getTargetStateForContext(WorldSchematic schematicWorld, BlockPlaceContext context) {
        if (schematicWorld == null || context == null) return null;

        BlockPos clickedPos = context.getClickedPos();
        BlockState target = schematicWorld.getBlockState(clickedPos);
        if (target != null && !target.isAir()) {
            return target;
        }

        return null;
    }

    public static void clearOverride(BlockPos pos) {
        if (pos != null) {
            overrides.remove(pos);
        }
    }

    public static void clearAll() {
        overrides.clear();
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public static BlockState applyProperties(BlockState current, BlockState override) {
        if (current == null || override == null) return current;

        Property[] propertiesToCopy = new Property[] {
            BlockStateProperties.FACING,
            BlockStateProperties.HORIZONTAL_FACING,
            BlockStateProperties.FACING_HOPPER,
            BlockStateProperties.AXIS,
            BlockStateProperties.HALF,
            BlockStateProperties.SLAB_TYPE,
            BlockStateProperties.DOOR_HINGE,
            BlockStateProperties.ATTACH_FACE,
            BlockStateProperties.ROTATION_16,
            BlockStateProperties.HANGING,
            BlockStateProperties.BELL_ATTACHMENT,
            BlockStateProperties.ORIENTATION,
            BlockStateProperties.STAIRS_SHAPE
        };

        BlockState result = current;
        for (Property prop : propertiesToCopy) {
            if (result.hasProperty(prop) && override.hasProperty(prop)) {
                try {
                    Comparable val = override.getValue(prop);
                    result = result.setValue(prop, val);
                } catch (Exception ignored) {}
            }
        }
        return result;
    }
}
