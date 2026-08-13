/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.common.collect.ImmutableMap
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.game.RayTraceUtils
 *  fi.dy.masa.malilib.util.game.RayTraceUtils$RayTraceCalculationData
 *  fi.dy.masa.malilib.util.game.RayTraceUtils$RayTraceFluidHandling
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.util.Mth
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.ClipContext$Fluid
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.material.FluidState
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.EntityHitResult
 *  net.minecraft.world.phys.HitResult
 *  net.minecraft.world.phys.HitResult$Type
 *  net.minecraft.world.phys.Vec3
 *  net.minecraft.world.phys.shapes.CollisionContext
 *  net.minecraft.world.phys.shapes.VoxelShape
 *  org.jetbrains.annotations.ApiStatus$Experimental
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.game.RayTraceUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.ClipContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.EntityHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.phys.shapes.CollisionContext;
import net.minecraft.world.phys.shapes.VoxelShape;
import org.jetbrains.annotations.ApiStatus;

public class RayTraceUtils {
    private static final AABB FULL_BLOCK_BOUNDS = new AABB(0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
    private static RayTraceWrapper closestBox;
    private static RayTraceWrapper closestCorner;
    private static RayTraceWrapper closestOrigin;
    private static double closestBoxDistance;
    private static double closestCornerDistance;
    private static double closestOriginDistance;
    private static RayTraceWrapper.HitType originType;

    @Nullable
    public static BlockPos getTargetedPosition(Level world, Entity player, double maxDistance, boolean sneakToOffset) {
        HitResult trace = RayTraceUtils.getRayTraceFromEntity(world, player, false, maxDistance);
        if (trace.getType() != HitResult.Type.BLOCK) {
            return null;
        }
        BlockHitResult traceBlock = (BlockHitResult)trace;
        BlockPos pos = traceBlock.getBlockPos();
        if (sneakToOffset == player.isShiftKeyDown()) {
            pos = pos.relative(traceBlock.getDirection());
        }
        return pos;
    }

    @Nonnull
    public static RayTraceWrapper getWrappedRayTraceFromEntity(Level world, Entity entity, double range) {
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(range);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        HitResult result = RayTraceUtils.getRayTraceFromEntity(world, entity, false, range);
        double closestVanilla = result.getType() != HitResult.Type.MISS ? result.getLocation().distanceTo(eyesPos) : -1.0;
        AreaSelection area = DataManager.getSelectionManager().getCurrentSelection();
        RayTraceWrapper wrapper = null;
        RayTraceUtils.clearTraceVars();
        if (!DataManager.getToolMode().getUsesSchematic() && area != null) {
            for (Box box : area.getAllSubRegionBoxes()) {
                boolean hitCorner = false;
                hitCorner |= RayTraceUtils.traceToSelectionBoxCorner(box, PositionUtils.Corner.CORNER_1, eyesPos, lookEndPos);
                if (hitCorner |= RayTraceUtils.traceToSelectionBoxCorner(box, PositionUtils.Corner.CORNER_2, eyesPos, lookEndPos)) continue;
                RayTraceUtils.traceToSelectionBoxBody(box, eyesPos, lookEndPos);
            }
            BlockPos origin = area.getExplicitOrigin();
            if (origin != null) {
                RayTraceUtils.traceToOrigin(origin, eyesPos, lookEndPos, RayTraceWrapper.HitType.SELECTION_ORIGIN, null);
            }
        }
        if (DataManager.getToolMode().getUsesSchematic()) {
            for (SchematicPlacement placement : DataManager.getSchematicPlacementManager().getAllSchematicsPlacements()) {
                if (!placement.isEnabled()) continue;
                RayTraceUtils.traceToPlacementBox(placement, eyesPos, lookEndPos);
                RayTraceUtils.traceToOrigin(placement.getOrigin(), eyesPos, lookEndPos, RayTraceWrapper.HitType.PLACEMENT_ORIGIN, placement);
            }
        }
        double closestDistance = closestVanilla;
        if (closestBoxDistance >= 0.0 && (closestVanilla < 0.0 || closestBoxDistance <= closestVanilla)) {
            closestDistance = closestBoxDistance;
            wrapper = closestBox;
        }
        if (closestCornerDistance >= 0.0 && (closestVanilla < 0.0 || closestCornerDistance <= closestVanilla)) {
            closestDistance = closestCornerDistance;
            wrapper = closestCorner;
        }
        if (closestOriginDistance >= 0.0 && (closestVanilla < 0.0 || closestOriginDistance <= closestVanilla)) {
            closestDistance = closestOriginDistance;
            wrapper = originType == RayTraceWrapper.HitType.PLACEMENT_ORIGIN ? closestOrigin : new RayTraceWrapper(RayTraceWrapper.HitType.SELECTION_ORIGIN);
        }
        RayTraceUtils.clearTraceVars();
        if (wrapper == null || closestDistance < 0.0) {
            wrapper = new RayTraceWrapper();
        }
        return wrapper;
    }

    private static void clearTraceVars() {
        closestBox = null;
        closestCorner = null;
        closestOrigin = null;
        closestBoxDistance = -1.0;
        closestCornerDistance = -1.0;
        closestOriginDistance = -1.0;
    }

    private static boolean traceToSelectionBoxCorner(Box box, PositionUtils.Corner corner, Vec3 start, Vec3 end) {
        AABB bb;
        Optional optional;
        BlockPos pos;
        Object object = corner == PositionUtils.Corner.CORNER_1 ? box.getPos1() : (pos = corner == PositionUtils.Corner.CORNER_2 ? box.getPos2() : null);
        if (pos != null && (optional = (bb = PositionUtils.createAABBForPosition(pos)).clip(start, end)).isPresent()) {
            double dist = ((Vec3)optional.get()).distanceTo(start);
            if (closestCornerDistance < 0.0 || dist < closestCornerDistance) {
                closestCornerDistance = dist;
                closestCorner = new RayTraceWrapper(box, corner, (Vec3)optional.get());
            }
            return true;
        }
        return false;
    }

    private static boolean traceToSelectionBoxBody(Box box, Vec3 start, Vec3 end) {
        AABB bb;
        Optional optional;
        if (box.getPos1() != null && box.getPos2() != null && (optional = (bb = PositionUtils.createEnclosingAABB(box.getPos1(), box.getPos2())).clip(start, end)).isPresent()) {
            double dist = ((Vec3)optional.get()).distanceTo(start);
            if (closestBoxDistance < 0.0 || dist < closestBoxDistance) {
                closestBoxDistance = dist;
                closestBox = new RayTraceWrapper(box, PositionUtils.Corner.NONE, (Vec3)optional.get());
            }
            return true;
        }
        return false;
    }

    private static boolean traceToPlacementBox(SchematicPlacement placement, Vec3 start, Vec3 end) {
        ImmutableMap<String, Box> boxes = placement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        boolean hitSomething = false;
        for (Map.Entry entry : boxes.entrySet()) {
            AABB bb;
            Optional optional;
            String boxName = (String)entry.getKey();
            Box box = (Box)entry.getValue();
            if (box.getPos1() == null || box.getPos2() == null || !(optional = (bb = PositionUtils.createEnclosingAABB(box.getPos1(), box.getPos2())).clip(start, end)).isPresent()) continue;
            double dist = ((Vec3)optional.get()).distanceTo(start);
            if (!(closestBoxDistance < 0.0) && !(dist < closestBoxDistance)) continue;
            closestBoxDistance = dist;
            closestBox = new RayTraceWrapper(placement, (Vec3)optional.get(), boxName);
            hitSomething = true;
        }
        return hitSomething;
    }

    private static boolean traceToOrigin(BlockPos pos, Vec3 start, Vec3 end, RayTraceWrapper.HitType type, @Nullable SchematicPlacement placement) {
        AABB bb;
        Optional optional;
        if (pos != null && (optional = (bb = PositionUtils.createAABBForPosition(pos)).clip(start, end)).isPresent()) {
            double dist = ((Vec3)optional.get()).distanceTo(start);
            if (closestOriginDistance < 0.0 || dist < closestOriginDistance) {
                closestOriginDistance = dist;
                originType = type;
                if (type == RayTraceWrapper.HitType.PLACEMENT_ORIGIN) {
                    closestOrigin = new RayTraceWrapper(placement, (Vec3)optional.get(), null);
                }
                return true;
            }
        }
        return false;
    }

    @Nullable
    public static BlockHitResult traceToPositions(List<BlockPos> posList, Entity entity, double range) {
        if (posList.isEmpty()) {
            return null;
        }
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(range);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        double closest = -1.0;
        BlockHitResult trace = null;
        for (BlockPos pos : posList) {
            BlockHitResult hit;
            if (pos == null || (hit = AABB.clip((Iterable)ImmutableList.of((Object)FULL_BLOCK_BOUNDS), (Vec3)eyesPos, (Vec3)lookEndPos, (BlockPos)pos)) == null) continue;
            double dist = hit.getLocation().distanceTo(eyesPos);
            if (!(closest < 0.0) && !(dist < closest)) continue;
            trace = new BlockHitResult(hit.getLocation(), hit.getDirection(), pos, false);
            closest = dist;
        }
        return trace;
    }

    @Nullable
    public static BlockHitResult traceToSchematicWorld(Entity entity, double range, boolean respectRenderRange, boolean targetFluids) {
        boolean invert = Hotkeys.INVERT_GHOST_BLOCK_RENDER_STATE.getKeybind().isKeybindHeld();
        if (respectRenderRange && (!Configs.Visuals.ENABLE_RENDERING.getBooleanValue() || Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue() == invert)) {
            return null;
        }
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        if (world == null) {
            return null;
        }
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(range);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        ClipContext.Fluid fluidMode = targetFluids ? ClipContext.Fluid.ANY : ClipContext.Fluid.NONE;
        return RayTraceUtils.rayTraceBlocks(world, eyesPos, lookEndPos, fluidMode, false, true, respectRenderRange, 200);
    }

    @Nullable
    public static RayTraceWrapper getGenericTrace(Level worldClient, Entity entity, double range) {
        return RayTraceUtils.getGenericTrace(worldClient, entity, range, true, true, false);
    }

    @Nullable
    public static RayTraceWrapper getGenericTraceNoFluids(Level worldClient, Entity entity, double range) {
        return RayTraceUtils.getGenericTrace(worldClient, entity, range, true, false, false);
    }

    @Nullable
    public static RayTraceWrapper getGenericTrace(Level worldClient, Entity entity, double range, boolean respectRenderRange, boolean targetFluids, boolean includeVerifier) {
        SchematicVerifier verifier;
        List<BlockPos> posList;
        BlockHitResult traceMismatch;
        double dist;
        HitResult traceClient = RayTraceUtils.getRayTraceFromEntity(worldClient, entity, targetFluids, range);
        BlockHitResult traceSchematic = RayTraceUtils.traceToSchematicWorld(entity, range, respectRenderRange, targetFluids);
        double distClosest = -1.0;
        RayTraceWrapper.HitType type = RayTraceWrapper.HitType.MISS;
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        BlockHitResult trace = null;
        if (traceSchematic != null && traceSchematic.getType() == HitResult.Type.BLOCK) {
            dist = eyesPos.distanceToSqr(traceSchematic.getLocation());
            if (distClosest < 0.0 || dist < distClosest) {
                trace = traceSchematic;
                distClosest = eyesPos.distanceToSqr(traceSchematic.getLocation());
                type = RayTraceWrapper.HitType.SCHEMATIC_BLOCK;
            }
        }
        if (traceClient != null && traceClient.getType() == HitResult.Type.BLOCK) {
            dist = eyesPos.distanceToSqr(traceClient.getLocation());
            if (distClosest < 0.0 || dist < distClosest) {
                trace = traceClient;
                type = RayTraceWrapper.HitType.VANILLA_BLOCK;
            }
        }
        SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
        if (includeVerifier && placement != null && placement.hasVerifier() && (traceMismatch = RayTraceUtils.traceToPositions(posList = (verifier = placement.getSchematicVerifier()).getSelectedMismatchBlockPositionsForRender(), entity, range)) != null) {
            trace = traceMismatch;
            type = RayTraceWrapper.HitType.MISMATCH_OVERLAY;
        }
        if (type != RayTraceWrapper.HitType.MISS) {
            return new RayTraceWrapper(type, trace);
        }
        return null;
    }

    @Nullable
    public static RayTraceWrapper getSchematicWorldTraceWrapperIfClosest(Level worldClient, Entity entity, double range) {
        RayTraceWrapper trace = RayTraceUtils.getGenericTrace(worldClient, entity, range);
        if (trace != null && trace.getHitType() == RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            return trace;
        }
        return null;
    }

    @Nullable
    public static BlockPos getSchematicWorldTraceIfClosest(Level worldClient, Entity entity, double range) {
        RayTraceWrapper trace = RayTraceUtils.getSchematicWorldTraceWrapperIfClosest(worldClient, entity, range);
        return trace != null && trace.getHitType() == RayTraceWrapper.HitType.SCHEMATIC_BLOCK ? trace.getBlockHitResult().getBlockPos() : null;
    }

    @Nullable
    public static BlockPos getSchematicWorldTraceIfClosestNoFluids(Level worldClient, Entity entity, double range) {
        RayTraceWrapper trace = RayTraceUtils.getSchematicWorldTraceWrapperIfClosestNoFluids(worldClient, entity, range);
        return trace != null && trace.getHitType() == RayTraceWrapper.HitType.SCHEMATIC_BLOCK ? trace.getBlockHitResult().getBlockPos() : null;
    }

    @Nullable
    public static RayTraceWrapper getSchematicWorldTraceWrapperIfClosestNoFluids(Level worldClient, Entity entity, double range) {
        RayTraceWrapper trace = RayTraceUtils.getGenericTraceNoFluids(worldClient, entity, range);
        if (trace != null && trace.getHitType() == RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            return trace;
        }
        return null;
    }

    @Nullable
    public static BlockPos getFurthestSchematicWorldBlockBeforeVanilla(Level worldClient, Entity entity, double maxRange, boolean requireVanillaBlockBehind) {
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(maxRange);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        BlockPos closestVanillaPos = null;
        Direction side = null;
        double closestVanilla = -1.0;
        HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity(worldClient, entity, false, maxRange);
        if (traceVanilla.getType() == HitResult.Type.BLOCK) {
            closestVanilla = traceVanilla.getLocation().distanceToSqr(eyesPos);
            BlockHitResult vanillaHitResult = (BlockHitResult)traceVanilla;
            side = vanillaHitResult.getDirection();
            closestVanillaPos = vanillaHitResult.getBlockPos();
        } else if (requireVanillaBlockBehind) {
            return null;
        }
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        List<BlockHitResult> list = RayTraceUtils.rayTraceBlocksToList(worldSchematic, eyesPos, lookEndPos, ClipContext.Fluid.NONE, false, false, true, 200);
        BlockHitResult furthestTrace = null;
        double furthestDist = -1.0;
        if (!list.isEmpty()) {
            for (BlockHitResult trace : list) {
                double dist = trace.getLocation().distanceToSqr(eyesPos);
                if ((furthestDist < 0.0 || dist > furthestDist) && (dist < closestVanilla || closestVanilla < 0.0) && !trace.getBlockPos().equals((Object)closestVanillaPos)) {
                    furthestDist = dist;
                    furthestTrace = trace;
                }
                if (!(closestVanilla >= 0.0) || !(dist > closestVanilla)) continue;
                break;
            }
        }
        if (furthestTrace == null && side != null && closestVanillaPos != null) {
            BlockPos pos = closestVanillaPos.relative(side);
            LayerRange layerRange = DataManager.getRenderLayerRange();
            if (layerRange.isPositionWithinRange(pos) && !worldSchematic.getBlockState(pos).isAir() && worldClient.getBlockState(pos).isAir()) {
                return pos;
            }
        }
        return furthestTrace != null ? furthestTrace.getBlockPos() : null;
    }

    @Nullable
    public static RayTraceWrapper getFurthestSchematicWorldTraceBeforeVanilla(Level worldClient, Entity entity, double maxRange) {
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(maxRange);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        BlockPos closestVanillaPos = null;
        double closestVanilla = -1.0;
        HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity(worldClient, entity, false, maxRange);
        if (traceVanilla.getType() == HitResult.Type.BLOCK) {
            closestVanilla = traceVanilla.getLocation().distanceToSqr(eyesPos);
            BlockHitResult vanillaHitResult = (BlockHitResult)traceVanilla;
            closestVanillaPos = vanillaHitResult.getBlockPos();
        }
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        List<BlockHitResult> list = RayTraceUtils.rayTraceBlocksToList(worldSchematic, eyesPos, lookEndPos, ClipContext.Fluid.NONE, false, false, true, 200);
        BlockHitResult furthestTrace = null;
        double furthestDist = -1.0;
        if (!list.isEmpty()) {
            for (BlockHitResult trace : list) {
                double dist = trace.getLocation().distanceToSqr(eyesPos);
                if ((furthestDist < 0.0 || dist > furthestDist) && (dist < closestVanilla || closestVanilla < 0.0) && !trace.getBlockPos().equals((Object)closestVanillaPos)) {
                    furthestDist = dist;
                    furthestTrace = trace;
                }
                if (!(closestVanilla >= 0.0) || !(dist > closestVanilla)) continue;
                break;
            }
        }
        return furthestTrace != null ? new RayTraceWrapper(RayTraceWrapper.HitType.SCHEMATIC_BLOCK, furthestTrace) : null;
    }

    @Nonnull
    public static HitResult getRayTraceFromEntity(Level worldIn, Entity entityIn, boolean useLiquids) {
        double reach = Minecraft.getInstance().player != null ? Minecraft.getInstance().player.entityInteractionRange() + 0.5 : 5.0;
        return RayTraceUtils.getRayTraceFromEntity(worldIn, entityIn, useLiquids, reach);
    }

    @Nonnull
    public static HitResult getRayTraceFromEntity(Level world, Entity entity, boolean useLiquids, double range) {
        Vec3 eyesPos = entity.getEyePosition(1.0f);
        Vec3 rangedLookRot = entity.getViewVector(1.0f).scale(range);
        Vec3 lookEndPos = eyesPos.add(rangedLookRot);
        ClipContext.Fluid fluidMode = useLiquids ? ClipContext.Fluid.ANY : ClipContext.Fluid.NONE;
        BlockHitResult result = RayTraceUtils.rayTraceBlocks(world, eyesPos, lookEndPos, fluidMode, false, false, false, 1000);
        AABB bb = entity.getBoundingBox().inflate(rangedLookRot.x, rangedLookRot.y, rangedLookRot.z).inflate(1.0, 1.0, 1.0);
        List list = world.getEntities(entity, bb);
        double closest = result != null && result.getType() == HitResult.Type.BLOCK ? eyesPos.distanceTo(result.getLocation()) : Double.MAX_VALUE;
        Entity targetEntity = null;
        Optional optional = Optional.empty();
        for (int i = 0; i < list.size(); ++i) {
            double distance;
            Entity entityTmp = (Entity)list.get(i);
            Optional optionalTmp = entityTmp.getBoundingBox().clip(eyesPos, lookEndPos);
            if (!optionalTmp.isPresent() || !((distance = eyesPos.distanceTo((Vec3)optionalTmp.get())) <= closest)) continue;
            targetEntity = entityTmp;
            optional = optionalTmp;
            closest = distance;
        }
        if (targetEntity != null) {
            result = new EntityHitResult(targetEntity, (Vec3)optional.get());
        }
        if (result == null || eyesPos.distanceTo(result.getLocation()) > range) {
            result = BlockHitResult.miss((Vec3)Vec3.ZERO, (Direction)Direction.UP, (BlockPos)BlockPos.ZERO);
        }
        return result;
    }

    @Nullable
    public static BlockHitResult rayTraceBlocks(Level world, Vec3 start, Vec3 end, ClipContext.Fluid fluidMode, boolean ignoreBlockWithoutBoundingBox, boolean returnLastUncollidableBlock, boolean respectLayerRange, int maxSteps) {
        FluidState fluidState;
        BlockState blockState;
        if (Double.isNaN(start.x) || Double.isNaN(start.y) || Double.isNaN(start.z) || Double.isNaN(end.x) || Double.isNaN(end.y) || Double.isNaN(end.z)) {
            return null;
        }
        LayerRange range = DataManager.getRenderLayerRange();
        RayTraceCalcsData data = new RayTraceCalcsData(start, end, range, fluidMode);
        BlockHitResult trace = RayTraceUtils.traceFirstStep(data, world, blockState = world.getBlockState(data.blockPos), fluidState = world.getFluidState(data.blockPos), ignoreBlockWithoutBoundingBox, returnLastUncollidableBlock, respectLayerRange);
        if (trace != null) {
            return trace;
        }
        while (--maxSteps >= 0) {
            if (RayTraceUtils.rayTraceCalcs(data, returnLastUncollidableBlock, respectLayerRange)) {
                return data.trace;
            }
            blockState = world.getBlockState(data.blockPos);
            if (!RayTraceUtils.traceLoopSteps(data, world, blockState, fluidState = world.getFluidState(data.blockPos), ignoreBlockWithoutBoundingBox, returnLastUncollidableBlock, respectLayerRange)) continue;
            return data.trace;
        }
        return returnLastUncollidableBlock ? data.trace : null;
    }

    @Nullable
    private static BlockHitResult traceFirstStep(RayTraceCalcsData data, Level world, BlockState blockState, FluidState fluidState, boolean ignoreBlockWithoutBoundingBox, boolean returnLastUncollidableBlock, boolean respectLayerRange) {
        if (!(respectLayerRange && !data.range.isPositionWithinRange(data.x, data.y, data.z) || ignoreBlockWithoutBoundingBox && blockState.getCollisionShape((BlockGetter)world, data.blockPos).isEmpty())) {
            VoxelShape blockShape = blockState.getShape((BlockGetter)world, data.blockPos, CollisionContext.of((Entity)Minecraft.getInstance().player));
            boolean blockCollidable = !blockShape.isEmpty();
            boolean fluidCollidable = data.fluidMode.canPick(fluidState);
            if (blockCollidable || fluidCollidable) {
                BlockHitResult trace = null;
                if (blockCollidable) {
                    trace = blockShape.clip(data.start, data.end, data.blockPos);
                }
                if (trace == null && fluidCollidable) {
                    trace = fluidState.getShape((BlockGetter)world, data.blockPos).clip(data.start, data.end, data.blockPos);
                }
                if (trace != null) {
                    return trace;
                }
            }
        }
        return null;
    }

    private static boolean traceLoopSteps(RayTraceCalcsData data, Level world, BlockState blockState, FluidState fluidState, boolean ignoreBlockWithoutBoundingBox, boolean returnLastUncollidableBlock, boolean respectLayerRange) {
        if (!(respectLayerRange && !data.range.isPositionWithinRange(data.x, data.y, data.z) || ignoreBlockWithoutBoundingBox && blockState.getBlock() != Blocks.NETHER_PORTAL && blockState.getBlock() != Blocks.END_PORTAL && blockState.getBlock() != Blocks.END_GATEWAY && blockState.getCollisionShape((BlockGetter)world, data.blockPos).isEmpty())) {
            VoxelShape blockShape = blockState.getShape((BlockGetter)world, data.blockPos, CollisionContext.of((Entity)Minecraft.getInstance().player));
            boolean blockCollidable = !blockShape.isEmpty();
            boolean fluidCollidable = data.fluidMode.canPick(fluidState);
            if (!blockCollidable && !fluidCollidable) {
                Vec3 pos = new Vec3(data.currentX, data.currentY, data.currentZ);
                data.trace = BlockHitResult.miss((Vec3)pos, (Direction)data.facing, (BlockPos)data.blockPos);
            } else {
                BlockHitResult traceTmp = null;
                if (blockCollidable) {
                    traceTmp = blockShape.clip(data.start, data.end, data.blockPos);
                }
                if (traceTmp == null && fluidCollidable) {
                    traceTmp = fluidState.getShape((BlockGetter)world, data.blockPos).clip(data.start, data.end, data.blockPos);
                }
                if (traceTmp != null) {
                    data.trace = traceTmp;
                    return true;
                }
            }
        }
        return false;
    }

    public static List<BlockHitResult> rayTraceBlocksToList(Level world, Vec3 start, Vec3 end, ClipContext.Fluid fluidMode, boolean ignoreBlockWithoutBoundingBox, boolean returnLastUncollidableBlock, boolean respectLayerRange, int maxSteps) {
        if (Double.isNaN(start.x) || Double.isNaN(start.y) || Double.isNaN(start.z) || Double.isNaN(end.x) || Double.isNaN(end.y) || Double.isNaN(end.z)) {
            return ImmutableList.of();
        }
        LayerRange range = DataManager.getRenderLayerRange();
        RayTraceCalcsData data = new RayTraceCalcsData(start, end, range, fluidMode);
        BlockState blockState = world.getBlockState(data.blockPos);
        FluidState fluidState = world.getFluidState(data.blockPos);
        BlockHitResult trace = RayTraceUtils.traceFirstStep(data, world, blockState, fluidState, ignoreBlockWithoutBoundingBox, returnLastUncollidableBlock, respectLayerRange);
        ArrayList<BlockHitResult> hits = new ArrayList<BlockHitResult>();
        if (trace != null) {
            hits.add(trace);
        }
        while (--maxSteps >= 0) {
            if (RayTraceUtils.rayTraceCalcs(data, returnLastUncollidableBlock, respectLayerRange)) {
                if (data.trace != null) {
                    hits.add(data.trace);
                }
                return hits;
            }
            blockState = world.getBlockState(data.blockPos);
            if (!RayTraceUtils.traceLoopSteps(data, world, blockState, fluidState = world.getFluidState(data.blockPos), ignoreBlockWithoutBoundingBox, returnLastUncollidableBlock, respectLayerRange)) continue;
            hits.add(data.trace);
        }
        return hits;
    }

    private static boolean rayTraceCalcs(RayTraceCalcsData data, boolean returnLastNonCollidableBlock, boolean respectLayerRange) {
        boolean xDiffers = true;
        boolean yDiffers = true;
        boolean zDiffers = true;
        double nextX = 999.0;
        double nextY = 999.0;
        double nextZ = 999.0;
        if (Double.isNaN(data.currentX) || Double.isNaN(data.currentY) || Double.isNaN(data.currentZ)) {
            data.trace = null;
            return true;
        }
        if (data.x == data.xEnd && data.y == data.yEnd && data.z == data.zEnd) {
            if (!returnLastNonCollidableBlock) {
                data.trace = null;
            }
            return true;
        }
        if (data.xEnd > data.x) {
            nextX = (double)data.x + 1.0;
        } else if (data.xEnd < data.x) {
            nextX = (double)data.x + 0.0;
        } else {
            xDiffers = false;
        }
        if (data.yEnd > data.y) {
            nextY = (double)data.y + 1.0;
        } else if (data.yEnd < data.y) {
            nextY = (double)data.y + 0.0;
        } else {
            yDiffers = false;
        }
        if (data.zEnd > data.z) {
            nextZ = (double)data.z + 1.0;
        } else if (data.zEnd < data.z) {
            nextZ = (double)data.z + 0.0;
        } else {
            zDiffers = false;
        }
        double relStepX = 999.0;
        double relStepY = 999.0;
        double relStepZ = 999.0;
        double distToEndX = data.end.x - data.currentX;
        double distToEndY = data.end.y - data.currentY;
        double distToEndZ = data.end.z - data.currentZ;
        if (xDiffers) {
            relStepX = (nextX - data.currentX) / distToEndX;
        }
        if (yDiffers) {
            relStepY = (nextY - data.currentY) / distToEndY;
        }
        if (zDiffers) {
            relStepZ = (nextZ - data.currentZ) / distToEndZ;
        }
        if (relStepX == -0.0) {
            relStepX = -1.0E-4;
        }
        if (relStepY == -0.0) {
            relStepY = -1.0E-4;
        }
        if (relStepZ == -0.0) {
            relStepZ = -1.0E-4;
        }
        if (relStepX < relStepY && relStepX < relStepZ) {
            data.facing = data.xEnd > data.x ? Direction.WEST : Direction.EAST;
            data.currentX = nextX;
            data.currentY += distToEndY * relStepX;
            data.currentZ += distToEndZ * relStepX;
        } else if (relStepY < relStepZ) {
            data.facing = data.yEnd > data.y ? Direction.DOWN : Direction.UP;
            data.currentX += distToEndX * relStepY;
            data.currentY = nextY;
            data.currentZ += distToEndZ * relStepY;
        } else {
            data.facing = data.zEnd > data.z ? Direction.NORTH : Direction.SOUTH;
            data.currentX += distToEndX * relStepZ;
            data.currentY += distToEndY * relStepZ;
            data.currentZ = nextZ;
        }
        data.x = Mth.floor((double)data.currentX) - (data.facing == Direction.EAST ? 1 : 0);
        data.y = Mth.floor((double)data.currentY) - (data.facing == Direction.UP ? 1 : 0);
        data.z = Mth.floor((double)data.currentZ) - (data.facing == Direction.SOUTH ? 1 : 0);
        data.blockPos = new BlockPos(data.x, data.y, data.z);
        return false;
    }

    @Nullable
    @ApiStatus.Experimental
    public static BlockPos getPickBlockLastTrace(Level worldClient, Entity entity, double maxRange, boolean adjacentOnly) {
        BlockPos pos;
        Vec3 eyesPos = entity.getEyePosition();
        Vec3 look = MathUtils.scale((Vec3)MathUtils.getRotationVector((float)entity.getYRot(), (float)entity.getXRot()), (double)maxRange);
        Vec3 lookEndPos = eyesPos.add(look);
        HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity(worldClient, entity, false, maxRange);
        if (traceVanilla.getType() != HitResult.Type.BLOCK) {
            return null;
        }
        EntityHitResult entityTrace = (EntityHitResult)traceVanilla;
        double closestVanilla = RayTraceUtils.squareDistanceTo(entityTrace.getLocation(), eyesPos);
        BlockPos closestVanillaPos = entityTrace.getEntity().blockPosition();
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        List<BlockHitResult> list = RayTraceUtils.rayTraceSchematicWorldBlocksToList(worldSchematic, eyesPos, lookEndPos, 24);
        BlockHitResult furthestTrace = null;
        double furthestDist = -1.0;
        boolean vanillaPosReplaceable = worldClient.getBlockState(closestVanillaPos).canSurvive((LevelReader)worldClient, closestVanillaPos);
        if (!list.isEmpty()) {
            for (BlockHitResult trace : list) {
                double dist = RayTraceUtils.squareDistanceTo(trace.getLocation(), eyesPos);
                BlockPos pos2 = trace.getBlockPos();
                if ((furthestDist < 0.0 || dist >= furthestDist) && (closestVanilla < 0.0 || dist < closestVanilla || pos2.equals((Object)closestVanillaPos) && vanillaPosReplaceable) && (vanillaPosReplaceable || !pos2.equals((Object)closestVanillaPos))) {
                    furthestDist = dist;
                    furthestTrace = trace;
                }
                if (!(closestVanilla >= 0.0) || !(dist > closestVanilla)) continue;
                break;
            }
        }
        if (furthestTrace == null) {
            pos = closestVanillaPos.relative(entityTrace.getEntity().getNearestViewDirection());
            LayerRange layerRange = DataManager.getRenderLayerRange();
            if (layerRange.isPositionWithinRange(pos) && worldSchematic.getBlockState(pos) != Blocks.AIR.defaultBlockState() && worldClient.getBlockState(pos) == Blocks.AIR.defaultBlockState()) {
                return pos;
            }
        }
        if (furthestTrace != null) {
            pos = furthestTrace.getBlockPos();
            if (adjacentOnly) {
                BlockPos placementPos;
                BlockPos blockPos = placementPos = vanillaPosReplaceable ? closestVanillaPos : closestVanillaPos.relative(entityTrace.getEntity().getNearestViewDirection());
                if (!pos.equals((Object)placementPos)) {
                    return null;
                }
            }
            return pos;
        }
        return null;
    }

    @ApiStatus.Experimental
    public static List<BlockHitResult> rayTraceSchematicWorldBlocksToList(Level world, Vec3 start, Vec3 end, int maxSteps) {
        if (Double.isNaN(start.x) || Double.isNaN(start.y) || Double.isNaN(start.z) || Double.isNaN(end.x) || Double.isNaN(end.y) || Double.isNaN(end.z)) {
            return ImmutableList.of();
        }
        RayTraceUtils.RayTraceCalculationData data = new RayTraceUtils.RayTraceCalculationData(start, end, RayTraceUtils.RayTraceFluidHandling.SOURCE_ONLY, fi.dy.masa.malilib.util.game.RayTraceUtils.BLOCK_FILTER_NON_AIR, DataManager.getRenderLayerRange());
        ArrayList<BlockHitResult> hits = new ArrayList<BlockHitResult>();
        while (--maxSteps >= 0) {
            if (fi.dy.masa.malilib.util.game.RayTraceUtils.checkRayCollision((RayTraceUtils.RayTraceCalculationData)data, (Level)world, (boolean)false)) {
                hits.add((BlockHitResult)data.trace);
            }
            if (!fi.dy.masa.malilib.util.game.RayTraceUtils.rayTraceAdvance((RayTraceUtils.RayTraceCalculationData)data)) continue;
            break;
        }
        return hits;
    }

    public static double squareDistanceTo(Vec3 i, Vec3 v) {
        return RayTraceUtils.squareDistanceTo(i, v.x, v.y, v.z);
    }

    public static double squareDistanceTo(Vec3 v, double x, double y, double z) {
        return v.x * x + v.y * y + v.z * z;
    }

    public static class RayTraceWrapper {
        private final HitType type;
        private PositionUtils.Corner corner = PositionUtils.Corner.NONE;
        private Vec3 hitVec = Vec3.ZERO;
        @Nullable
        private BlockHitResult traceBlock = null;
        @Nullable
        private EntityHitResult traceEntity = null;
        @Nullable
        private Box box = null;
        @Nullable
        private SchematicPlacement schematicPlacement = null;
        @Nullable
        private String placementRegionName = null;

        public RayTraceWrapper() {
            this.type = HitType.MISS;
        }

        public RayTraceWrapper(HitType type) {
            this.type = type;
        }

        public RayTraceWrapper(HitType type, BlockHitResult trace) {
            this.type = type;
            this.hitVec = trace.getLocation();
            this.traceBlock = trace;
        }

        public RayTraceWrapper(HitType type, EntityHitResult trace) {
            this.type = type;
            this.hitVec = trace.getLocation();
            this.traceEntity = trace;
        }

        public RayTraceWrapper(Box box, PositionUtils.Corner corner, Vec3 hitVec) {
            this.type = corner == PositionUtils.Corner.NONE ? HitType.SELECTION_BOX_BODY : HitType.SELECTION_BOX_CORNER;
            this.corner = corner;
            this.hitVec = hitVec;
            this.box = box;
        }

        public RayTraceWrapper(SchematicPlacement placement, Vec3 hitVec, @Nullable String regionName) {
            this.type = regionName != null ? HitType.PLACEMENT_SUBREGION : HitType.PLACEMENT_ORIGIN;
            this.hitVec = hitVec;
            this.schematicPlacement = placement;
            this.placementRegionName = regionName;
        }

        public HitType getHitType() {
            return this.type;
        }

        @Nullable
        public BlockHitResult getBlockHitResult() {
            return this.traceBlock;
        }

        @Nullable
        public EntityHitResult getEntityHitResult() {
            return this.traceEntity;
        }

        @Nullable
        public Box getHitSelectionBox() {
            return this.box;
        }

        @Nullable
        public SchematicPlacement getHitSchematicPlacement() {
            return this.schematicPlacement;
        }

        @Nullable
        public String getHitSchematicPlacementRegionName() {
            return this.placementRegionName;
        }

        public Vec3 getHitVec() {
            return this.hitVec;
        }

        public PositionUtils.Corner getHitCorner() {
            return this.corner;
        }

        public static enum HitType {
            MISS,
            VANILLA_BLOCK,
            VANILLA_ENTITY,
            SELECTION_BOX_BODY,
            SELECTION_BOX_CORNER,
            SELECTION_ORIGIN,
            PLACEMENT_SUBREGION,
            PLACEMENT_ORIGIN,
            SCHEMATIC_BLOCK,
            SCHEMATIC_ENTITY,
            MISMATCH_OVERLAY;

        }
    }

    public static class RayTraceCalcsData {
        public final LayerRange range;
        public final ClipContext.Fluid fluidMode;
        public final Vec3 start;
        public final Vec3 end;
        public final int xEnd;
        public final int yEnd;
        public final int zEnd;
        public int x;
        public int y;
        public int z;
        public double currentX;
        public double currentY;
        public double currentZ;
        public BlockPos blockPos;
        public Direction facing;
        public BlockHitResult trace;

        public RayTraceCalcsData(Vec3 start, Vec3 end, LayerRange range, ClipContext.Fluid fluidMode) {
            this.start = start;
            this.end = end;
            this.range = range;
            this.fluidMode = fluidMode;
            this.currentX = start.x;
            this.currentY = start.y;
            this.currentZ = start.z;
            this.xEnd = Mth.floor((double)end.x);
            this.yEnd = Mth.floor((double)end.y);
            this.zEnd = Mth.floor((double)end.z);
            this.x = Mth.floor((double)start.x);
            this.y = Mth.floor((double)start.y);
            this.z = Mth.floor((double)start.z);
            this.blockPos = new BlockPos(this.x, this.y, this.z);
            this.trace = null;
        }
    }
}

