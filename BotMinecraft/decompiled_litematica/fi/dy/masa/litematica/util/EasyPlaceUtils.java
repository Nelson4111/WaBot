/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.registry.Registry
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.MessageOutputType
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.game.PlacementUtils
 *  fi.dy.masa.malilib.util.game.RayTraceUtils
 *  fi.dy.masa.malilib.util.game.wrap.GameWrap
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.tags.BlockTags
 *  net.minecraft.util.Mth
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.InteractionResult$SwingSource
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.item.context.UseOnContext
 *  net.minecraft.world.level.ClipContext$Fluid
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.AbstractBannerBlock
 *  net.minecraft.world.level.block.AbstractSkullBlock
 *  net.minecraft.world.level.block.BaseTorchBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.ComparatorBlock
 *  net.minecraft.world.level.block.FaceAttachedHorizontalDirectionalBlock
 *  net.minecraft.world.level.block.RedstoneWallTorchBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.SignBlock
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.WallBannerBlock
 *  net.minecraft.world.level.block.WallSignBlock
 *  net.minecraft.world.level.block.WallSkullBlock
 *  net.minecraft.world.level.block.WallTorchBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.ComparatorMode
 *  net.minecraft.world.level.block.state.properties.EnumProperty
 *  net.minecraft.world.level.block.state.properties.Half
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.HitResult
 *  net.minecraft.world.phys.HitResult$Type
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.materials.MaterialCache;
import fi.dy.masa.litematica.mixin.block.IMixinWallMountedBlock;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.util.EasyPlaceProtocol;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.PlacementHandler;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.registry.Registry;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.MessageOutputType;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.game.PlacementUtils;
import fi.dy.masa.malilib.util.game.wrap.GameWrap;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.Mth;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.item.context.UseOnContext;
import net.minecraft.world.level.ClipContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.AbstractBannerBlock;
import net.minecraft.world.level.block.AbstractSkullBlock;
import net.minecraft.world.level.block.BaseTorchBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.ComparatorBlock;
import net.minecraft.world.level.block.FaceAttachedHorizontalDirectionalBlock;
import net.minecraft.world.level.block.RedstoneWallTorchBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.SignBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.WallBannerBlock;
import net.minecraft.world.level.block.WallSignBlock;
import net.minecraft.world.level.block.WallSkullBlock;
import net.minecraft.world.level.block.WallTorchBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.ComparatorMode;
import net.minecraft.world.level.block.state.properties.EnumProperty;
import net.minecraft.world.level.block.state.properties.Half;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;

public class EasyPlaceUtils {
    private static final List<PositionCache> EASY_PLACE_POSITIONS = new ArrayList<PositionCache>();
    private static final HashMap<Block, Boolean> HAS_USE_ACTION_CACHE = new HashMap();
    private static boolean isHandling;
    private static boolean isFirstClickEasyPlace;
    private static boolean isFirstClickPlacementRestriction;
    private static long easyPlaceLastPickBlockTime;

    public static boolean isHandling() {
        return isHandling;
    }

    public static void setHandling(boolean handling) {
        isHandling = handling;
    }

    public static double getValidBlockRange(Minecraft mc) {
        return Configs.Generic.EASY_PLACE_VANILLA_REACH.getBooleanValue() ? mc.player.blockInteractionRange() : mc.player.blockInteractionRange() + 1.0;
    }

    public static void setIsFirstClick() {
        if (EasyPlaceUtils.shouldDoEasyPlaceActions()) {
            isFirstClickEasyPlace = true;
        }
        if (Configs.Generic.PLACEMENT_RESTRICTION.getBooleanValue()) {
            isFirstClickPlacementRestriction = true;
        }
    }

    private static boolean hasUseAction(Block block) {
        Boolean val = HAS_USE_ACTION_CACHE.get(block);
        if (val == null) {
            try {
                String name = Block.class.getSimpleName().equals("Block") ? "useWithoutItem" : "a";
                Method method = block.getClass().getMethod(name, BlockState.class, Level.class, BlockPos.class, Player.class, BlockHitResult.class);
                Method baseMethod = Block.class.getMethod(name, BlockState.class, Level.class, BlockPos.class, Player.class, BlockHitResult.class);
                val = !method.equals(baseMethod);
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("EasyPlaceUtils: Failed to reflect method Block::useWithoutItem", (Throwable)e);
                val = false;
            }
            HAS_USE_ACTION_CACHE.put(block, val);
        }
        return val;
    }

    public static boolean shouldDoEasyPlaceActions() {
        return Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && Configs.Generic.EASY_PLACE_POST_REWRITE.getBooleanValue() && GameWrap.getClientPlayer() != null && DataManager.getToolMode() != ToolMode.REBUILD && Hotkeys.EASY_PLACE_ACTIVATION.getKeybind().isKeybindHeld();
    }

    public static void easyPlaceOnUseTick() {
        if (!isHandling && Configs.Generic.EASY_PLACE_HOLD_ENABLED.getBooleanValue() && EasyPlaceUtils.shouldDoEasyPlaceActions() && Hotkeys.EASY_PLACE_ACTIVATION.getKeybind().isKeybindHeld()) {
            isHandling = true;
            EasyPlaceUtils.handleEasyPlace();
            isHandling = false;
        }
    }

    public static boolean handleEasyPlaceWithMessage() {
        if (EasyPlaceUtils.isHandling()) {
            return false;
        }
        isHandling = true;
        InteractionResult result = EasyPlaceUtils.handleEasyPlace();
        isHandling = false;
        if (isFirstClickEasyPlace && result == InteractionResult.FAIL) {
            MessageOutputType type = (MessageOutputType)Configs.Generic.PLACEMENT_RESTRICTION_WARN.getOptionListValue();
            if (type == MessageOutputType.MESSAGE) {
                InfoUtils.showInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.easy_place_fail", (Object[])new Object[0]);
            } else if (type == MessageOutputType.ACTIONBAR) {
                InfoUtils.printActionbarMessage((String)"litematica.message.easy_place_fail", (Object[])new Object[0]);
            }
            isFirstClickEasyPlace = false;
            return true;
        }
        isFirstClickEasyPlace = false;
        return result != InteractionResult.PASS;
    }

    public static void onRightClickTail() {
        if (isFirstClickEasyPlace) {
            EasyPlaceUtils.handleEasyPlaceWithMessage();
        }
    }

    @Nullable
    private static BlockHitResult getTargetPosition(@Nullable RayTraceUtils.RayTraceWrapper traceWrapper) {
        Minecraft mc = Minecraft.getInstance();
        BlockPos overriddenPos = Registry.BLOCK_PLACEMENT_POSITION_HANDLER.getCurrentPlacementPosition();
        if (overriddenPos != null) {
            Direction side;
            Vec3 hitPos;
            if (mc.player == null) {
                return null;
            }
            double reach = mc.player.blockInteractionRange();
            Entity entity = mc.getCameraEntity();
            BlockHitResult trace = RayTraceUtils.traceToPositions(Collections.singletonList(overriddenPos), entity, reach);
            BlockPos pos = overriddenPos;
            if (trace != null && trace.getType() == HitResult.Type.BLOCK) {
                hitPos = trace.getLocation();
                side = trace.getDirection();
            } else {
                hitPos = new Vec3((double)pos.getX() + 0.5, (double)pos.getY() + 1.0, (double)pos.getZ() + 0.5);
                side = Direction.UP;
            }
            return new BlockHitResult(hitPos, side, pos, false);
        }
        if (traceWrapper != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            return traceWrapper.getBlockHitResult();
        }
        return null;
    }

    @Nullable
    private static BlockHitResult getAdjacentClickPosition(BlockPos targetPos) {
        BlockHitResult blockHitResult;
        BlockPos posVanilla;
        Minecraft mc = Minecraft.getInstance();
        ClientLevel world = mc.level;
        if (mc.player == null) {
            return null;
        }
        double reach = mc.player.blockInteractionRange();
        Entity entity = mc.getCameraEntity();
        if (entity == null || world == null) {
            return null;
        }
        HitResult traceVanilla = fi.dy.masa.malilib.util.game.RayTraceUtils.getRayTraceFromEntity((Level)world, (Entity)entity, (ClipContext.Fluid)ClipContext.Fluid.NONE, (boolean)false, (double)reach);
        if (traceVanilla == null) {
            return null;
        }
        if (traceVanilla.getType() == HitResult.Type.BLOCK && !PlacementUtils.isReplaceable((Level)world, (BlockPos)(posVanilla = (blockHitResult = (BlockHitResult)traceVanilla).getBlockPos()), (boolean)false) && targetPos.equals((Object)posVanilla.relative(blockHitResult.getDirection()))) {
            return new BlockHitResult(blockHitResult.getLocation(), ((BlockHitResult)traceVanilla).getDirection(), posVanilla, false);
        }
        for (Direction side : Direction.values()) {
            BlockPos posSide = targetPos.relative(side);
            if (PlacementUtils.isReplaceable((Level)world, (BlockPos)posSide, (boolean)false)) continue;
            Vec3 hitPos = EasyPlaceUtils.getHitPositionForSidePosition(posSide, side);
            return new BlockHitResult(hitPos, side.getOpposite(), posSide, false);
        }
        return null;
    }

    private static Vec3 getHitPositionForSidePosition(BlockPos posSide, Direction sideFromTarget) {
        Direction.Axis axis = sideFromTarget.getAxis();
        double x = (double)posSide.getX() + 0.5 - (double)sideFromTarget.getStepX() * 0.5;
        double y = (double)posSide.getY() + (axis == Direction.Axis.Y ? (sideFromTarget == Direction.DOWN ? 1.0 : 0.0) : 0.0);
        double z = (double)posSide.getZ() + 0.5 - (double)sideFromTarget.getStepZ() * 0.5;
        return new Vec3(x, y, z);
    }

    @Nullable
    private static BlockHitResult getClickPosition(BlockHitResult targetPosition, BlockState stateSchematic, BlockState stateClient) {
        boolean isSlab = stateSchematic.getBlock() instanceof SlabBlock;
        if (isSlab) {
            return EasyPlaceUtils.getClickPositionForSlab(targetPosition, stateSchematic, stateClient);
        }
        BlockPos targetBlockPos = targetPosition.getBlockPos();
        boolean requireAdjacent = Configs.Generic.EASY_PLACE_CLICK_ADJACENT.getBooleanValue();
        return requireAdjacent ? EasyPlaceUtils.getAdjacentClickPosition(targetBlockPos) : targetPosition;
    }

    @Nullable
    private static BlockHitResult getClickPositionForSlab(BlockHitResult targetPosition, BlockState stateSchematic, BlockState stateClient) {
        Minecraft mc = Minecraft.getInstance();
        SlabBlock slab = (SlabBlock)stateSchematic.getBlock();
        BlockPos targetBlockPos = targetPosition.getBlockPos();
        ClientLevel worldClient = mc.level;
        boolean isDouble = ((SlabType)stateSchematic.getValue((Property)SlabBlock.TYPE)).equals((Object)SlabType.DOUBLE);
        if (isDouble) {
            if (EasyPlaceUtils.clientBlockIsSameMaterialSingleSlab(stateSchematic, stateClient)) {
                boolean isTop = stateClient.getValue((Property)SlabBlock.TYPE) == SlabType.TOP;
                Direction side = isTop ? Direction.DOWN : Direction.UP;
                Vec3 hitPos = targetPosition.getLocation();
                return new BlockHitResult(new Vec3(hitPos.x, (double)targetBlockPos.getY() + 0.5, hitPos.z), side, targetBlockPos, false);
            }
            if (PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)targetBlockPos, (boolean)true)) {
                BlockHitResult pos = EasyPlaceUtils.getClickPositionForSlabHalf(targetPosition, stateSchematic, false, (Level)worldClient);
                return pos != null ? pos : EasyPlaceUtils.getClickPositionForSlabHalf(targetPosition, stateSchematic, true, (Level)worldClient);
            }
        } else if (!isDouble && PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)targetBlockPos, (boolean)true)) {
            boolean isTop = stateSchematic.getValue((Property)SlabBlock.TYPE) == SlabType.TOP;
            return EasyPlaceUtils.getClickPositionForSlabHalf(targetPosition, stateSchematic, isTop, (Level)worldClient);
        }
        return null;
    }

    @Nullable
    private static BlockHitResult getClickPositionForSlabHalf(BlockHitResult targetPosition, BlockState stateSchematic, boolean isTop, Level worldClient) {
        BlockPos targetBlockPos = targetPosition.getBlockPos();
        boolean requireAdjacent = Configs.Generic.EASY_PLACE_CLICK_ADJACENT.getBooleanValue();
        if (!requireAdjacent) {
            Direction clickSide = isTop ? Direction.DOWN : Direction.UP;
            boolean isReplaceable = PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)targetBlockPos, (boolean)false);
            if (isReplaceable) {
                BlockPos posOffset = targetBlockPos.relative(clickSide);
                BlockState stateSide = worldClient.getBlockState(posOffset);
                if (!EasyPlaceUtils.clientBlockIsSameMaterialSingleSlab(stateSchematic, stateSide)) {
                    Vec3 hitPos = targetPosition.getLocation();
                    return new BlockHitResult(new Vec3(hitPos.x, (double)targetBlockPos.getY() + 0.5, hitPos.z), clickSide, targetBlockPos, false);
                }
            } else if (worldClient.getBlockState(targetBlockPos).liquid() && EasyPlaceUtils.canClickOnAdjacentBlockToPlaceSingleSlabAt(targetBlockPos, stateSchematic, clickSide.getOpposite(), worldClient)) {
                BlockPos pos = targetBlockPos.relative(clickSide.getOpposite());
                Vec3 hitPos = new Vec3((double)pos.getX() + 0.5, (double)pos.getY() + 0.5, (double)pos.getZ() + 0.5);
                return new BlockHitResult(hitPos, clickSide, pos, false);
            }
        }
        return EasyPlaceUtils.getAdjacentClickPositionForSlab(targetBlockPos, stateSchematic, isTop, worldClient);
    }

    @Nullable
    private static BlockHitResult getAdjacentClickPositionForSlab(BlockPos targetBlockPos, BlockState stateSchematic, boolean isTop, Level worldClient) {
        Direction clickSide = isTop ? Direction.DOWN : Direction.UP;
        Direction clickSideOpposite = clickSide.getOpposite();
        BlockPos posSide = targetBlockPos.relative(clickSideOpposite);
        if (EasyPlaceUtils.canClickOnAdjacentBlockToPlaceSingleSlabAt(targetBlockPos, stateSchematic, clickSideOpposite, worldClient)) {
            return new BlockHitResult(EasyPlaceUtils.getHitPositionForSidePosition(posSide, clickSideOpposite), clickSide, posSide, false);
        }
        for (Direction side : Direction.values()) {
            if (!EasyPlaceUtils.canClickOnAdjacentBlockToPlaceSingleSlabAt(targetBlockPos, stateSchematic, side, worldClient)) continue;
            posSide = targetBlockPos.relative(side);
            Vec3 hitPos = EasyPlaceUtils.getHitPositionForSidePosition(posSide, side);
            double y = isTop ? 0.9 : 0.1;
            return new BlockHitResult(new Vec3(hitPos.x, (double)posSide.getY() + y, hitPos.z), side.getOpposite(), posSide, false);
        }
        return null;
    }

    private static boolean canClickOnAdjacentBlockToPlaceSingleSlabAt(BlockPos targetBlockPos, BlockState targetState, Direction side, Level worldClient) {
        BlockPos posSide = targetBlockPos.relative(side);
        BlockState stateSide = worldClient.getBlockState(posSide);
        return !PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)posSide, (boolean)false) && (side.getAxis() != Direction.Axis.Y || !EasyPlaceUtils.clientBlockIsSameMaterialSingleSlab(targetState, stateSide) || stateSide.getValue((Property)SlabBlock.TYPE) != targetState.getValue((Property)SlabBlock.TYPE));
    }

    private static InteractionResult handleEasyPlace() {
        RayTraceUtils.RayTraceWrapper traceWrapper;
        Minecraft mc = Minecraft.getInstance();
        Entity entity = mc.getCameraEntity();
        ClientLevel world = mc.level;
        double reach = EasyPlaceUtils.getValidBlockRange(mc);
        if (Configs.Generic.EASY_PLACE_FIRST.getBooleanValue()) {
            boolean targetFluids = Configs.InfoOverlays.INFO_OVERLAYS_TARGET_FLUIDS.getBooleanValue();
            traceWrapper = RayTraceUtils.getGenericTrace((Level)world, entity, reach, true, targetFluids, false);
        } else {
            traceWrapper = RayTraceUtils.getFurthestSchematicWorldTraceBeforeVanilla((Level)mc.level, (Entity)mc.player, reach);
            if (traceWrapper == null && EasyPlaceUtils.placementRestrictionInEffect()) {
                return InteractionResult.FAIL;
            }
        }
        BlockHitResult targetPosition = EasyPlaceUtils.getTargetPosition(traceWrapper);
        if (targetPosition == null) {
            if (traceWrapper != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.VANILLA_BLOCK) {
                return EasyPlaceUtils.placementRestrictionInEffect() ? InteractionResult.FAIL : InteractionResult.PASS;
            }
            return InteractionResult.PASS;
        }
        BlockPos targetBlockPos = targetPosition.getBlockPos();
        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        BlockState stateSchematic = schematicWorld.getBlockState(targetBlockPos);
        BlockState stateClient = world.getBlockState(targetBlockPos);
        ItemStack requiredStack = MaterialCache.getInstance().getRequiredBuildItemForState(stateSchematic, schematicWorld, targetBlockPos);
        if (stateSchematic.is(BlockTags.AIR)) {
            return InteractionResult.FAIL;
        }
        if (stateSchematic == stateClient || requiredStack.isEmpty() || EasyPlaceUtils.easyPlaceIsPositionCached(targetBlockPos) || EasyPlaceUtils.easyPlaceIsTooFast() || !EasyPlaceUtils.canPlaceBlock(targetBlockPos, (Level)world, stateSchematic, stateClient)) {
            return InteractionResult.FAIL;
        }
        BlockHitResult clickPosition = EasyPlaceUtils.getClickPosition(targetPosition, stateSchematic, stateClient);
        InventoryUtils.schematicWorldPickBlock(requiredStack, targetBlockPos, (Level)world, mc);
        InteractionHand hand = EntityUtils.getUsedHandForItem((Player)mc.player, requiredStack);
        if (clickPosition == null || hand == null) {
            return InteractionResult.FAIL;
        }
        boolean isSlab = stateSchematic.getBlock() instanceof SlabBlock;
        boolean usingAdjacentClickPosition = !clickPosition.getBlockPos().equals((Object)targetBlockPos);
        BlockPos clickPos = clickPosition.getBlockPos();
        Vec3 hitPos = clickPosition.getLocation();
        Direction side = clickPosition.getDirection();
        Direction sideOrig = targetPosition.getDirection();
        EasyPlaceProtocol protocol = PlacementHandler.getEffectiveProtocolVersion();
        double traceMaxRange = Configs.Generic.EASY_PLACE_VANILLA_REACH.getBooleanValue() ? 4.5 : 6.0;
        HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity((Level)mc.level, (Entity)mc.player, false, traceMaxRange);
        if ((protocol == EasyPlaceProtocol.NONE || protocol == EasyPlaceProtocol.SLAB_ONLY) && traceVanilla != null && traceVanilla.getType() == HitResult.Type.BLOCK) {
            BlockHitResult hitResult = (BlockHitResult)traceVanilla;
            BlockPos posVanilla = hitResult.getBlockPos();
            Direction sideVanilla = hitResult.getDirection();
            BlockState stateVanilla = mc.level.getBlockState(posVanilla);
            Vec3 hit = traceVanilla.getLocation();
            BlockPlaceContext ctx = new BlockPlaceContext(new UseOnContext((Player)mc.player, hand, hitResult));
            if (!stateVanilla.canBeReplaced(ctx) && targetBlockPos.equals((Object)(posVanilla = posVanilla.relative(sideVanilla)))) {
                hitPos = hit;
                sideOrig = sideVanilla;
            }
        }
        if (!usingAdjacentClickPosition && !isSlab) {
            side = EasyPlaceUtils.applyPlacementFacing(stateSchematic, side, stateClient);
            if (!stateClient.canSurvive((LevelReader)world, targetBlockPos) && stateClient.liquid()) {
                clickPos = clickPos.relative(side, -1);
            }
        }
        PlacementProtocolData placementData = EasyPlaceUtils.applyPlacementProtocolAll(clickPos, stateSchematic, hitPos);
        if (placementData.mustFail) {
            return InteractionResult.FAIL;
        }
        if (placementData.handled) {
            clickPos = placementData.pos;
            side = placementData.side;
            hitPos = placementData.hitVec;
        }
        if (protocol == EasyPlaceProtocol.V3) {
            hitPos = EasyPlaceUtils.applyPlacementProtocolV3(clickPos, stateSchematic, hitPos);
        } else if (protocol == EasyPlaceProtocol.V2 && !isSlab) {
            hitPos = EasyPlaceUtils.applyCarpetProtocolHitVec(clickPos, stateSchematic, hitPos);
        } else if (protocol == EasyPlaceProtocol.SLAB_ONLY) {
            hitPos = EasyPlaceUtils.applyBlockSlabProtocol(clickPos, stateSchematic, hitPos);
        }
        stateClient = world.getBlockState(clickPos);
        boolean needsSneak = EasyPlaceUtils.hasUseAction(stateClient.getBlock());
        boolean didFakeSneak = needsSneak && EntityUtils.setFakedSneakingState(true);
        LocalPlayer player = mc.player;
        EasyPlaceUtils.cacheEasyPlacePosition(clickPos);
        BlockHitResult hitResult = new BlockHitResult(hitPos, side, clickPos, false);
        InteractionResult result = mc.gameMode.useItemOn(mc.player, hand, hitResult);
        if (result == InteractionResult.PASS) {
            if (InteractionResult.SUCCESS.swingSource().equals((Object)InteractionResult.SwingSource.CLIENT) && Configs.Generic.EASY_PLACE_SWING_HAND.getBooleanValue()) {
                player.swing(hand);
            }
            mc.getEntityRenderDispatcher().getItemInHandRenderer().itemUsed(hand);
            if (isSlab && ((SlabType)stateSchematic.getValue((Property)SlabBlock.TYPE)).equals((Object)SlabType.DOUBLE) && (stateClient = world.getBlockState(clickPos)).getBlock() instanceof SlabBlock && !((SlabType)stateClient.getValue((Property)SlabBlock.TYPE)).equals((Object)SlabType.DOUBLE) && stateClient.getBlock() instanceof SlabBlock && stateClient.getValue((Property)SlabBlock.TYPE) != SlabType.DOUBLE) {
                side = EasyPlaceUtils.applyPlacementFacing(stateSchematic, sideOrig, stateClient);
                hitResult = new BlockHitResult(hitPos, side, clickPos, false);
                mc.gameMode.useItemOn(mc.player, hand, hitResult);
            }
            if (didFakeSneak) {
                EntityUtils.setFakedSneakingState(false);
            }
            return InteractionResult.SUCCESS;
        }
        return InteractionResult.PASS;
    }

    private static boolean clientBlockIsSameMaterialSingleSlab(BlockState stateSchematic, BlockState stateClient) {
        Block blockSchematic = stateSchematic.getBlock();
        Block blockClient = stateClient.getBlock();
        if (blockSchematic instanceof SlabBlock && blockClient instanceof SlabBlock && !((SlabType)stateClient.getValue((Property)SlabBlock.TYPE)).equals((Object)SlabType.DOUBLE)) {
            SlabType propClient;
            SlabType propSchematic = (SlabType)stateSchematic.getValue((Property)SlabBlock.TYPE);
            return propSchematic == (propClient = (SlabType)stateClient.getValue((Property)SlabBlock.TYPE)) && stateSchematic.getValue((Property)SlabBlock.TYPE) == stateClient.getValue((Property)SlabBlock.TYPE);
        }
        return false;
    }

    private static boolean canPlaceBlock(BlockPos targetPos, Level worldClient, BlockState stateSchematic, BlockState stateClient) {
        boolean isSlab = stateSchematic.getBlock() instanceof SlabBlock;
        if (isSlab) {
            return PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)targetPos, (boolean)true) || ((SlabType)stateSchematic.getValue((Property)SlabBlock.TYPE)).equals((Object)SlabType.DOUBLE) && EasyPlaceUtils.clientBlockIsSameMaterialSingleSlab(stateSchematic, stateClient);
        }
        return PlacementUtils.isReplaceable((Level)worldClient, (BlockPos)targetPos, (boolean)true);
    }

    public static boolean handlePlacementRestriction() {
        boolean cancel = EasyPlaceUtils.placementRestrictionInEffect();
        if (cancel && isFirstClickPlacementRestriction) {
            MessageOutputType type = (MessageOutputType)Configs.Generic.PLACEMENT_RESTRICTION_WARN.getOptionListValue();
            if (type == MessageOutputType.MESSAGE) {
                InfoUtils.showInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.placement_restriction_fail", (Object[])new Object[0]);
            } else if (type == MessageOutputType.ACTIONBAR) {
                InfoUtils.printActionbarMessage((String)"litematica.message.placement_restriction_fail", (Object[])new Object[0]);
            }
        }
        isFirstClickPlacementRestriction = false;
        return cancel;
    }

    private static boolean placementRestrictionInEffect() {
        Minecraft mc = Minecraft.getInstance();
        Entity entity = mc.getCameraEntity();
        ClientLevel world = mc.level;
        if (world == null || entity == null || mc.player == null) {
            return false;
        }
        double reach = mc.player.blockInteractionRange();
        HitResult trace = fi.dy.masa.malilib.util.game.RayTraceUtils.getRayTraceFromEntity((Level)world, (Entity)entity, (ClipContext.Fluid)ClipContext.Fluid.NONE, (boolean)false, (double)reach);
        if (trace == null) {
            return false;
        }
        if (trace.getType() == HitResult.Type.BLOCK) {
            BlockHitResult blockHitResult = (BlockHitResult)trace;
            BlockPos pos = blockHitResult.getBlockPos();
            BlockState stateClient = world.getBlockState(pos);
            if (!stateClient.canSurvive((LevelReader)world, pos)) {
                pos = pos.relative(blockHitResult.getDirection());
                stateClient = world.getBlockState(pos);
            }
            if (!EasyPlaceUtils.isPositionWithinRangeOfSchematicRegions(pos, 2)) {
                return false;
            }
            if (!stateClient.canSurvive((LevelReader)world, pos) && !stateClient.liquid()) {
                return true;
            }
            WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
            LayerRange range = DataManager.getRenderLayerRange();
            if (worldSchematic.isEmptyBlock(pos) || !range.isPositionWithinRange(pos)) {
                return true;
            }
            BlockState stateSchematic = worldSchematic.getBlockState(pos);
            ItemStack stack = MaterialCache.getInstance().getRequiredBuildItemForState(stateSchematic, worldSchematic, pos);
            return stack.isEmpty() || EntityUtils.getUsedHandForItem((LivingEntity)mc.player, stack, true) == null;
        }
        return false;
    }

    static boolean easyPlaceBlockChecksCancel(BlockState stateSchematic, BlockState stateClient, Player player, HitResult trace, ItemStack stack) {
        Block blockClient;
        Block blockSchematic = stateSchematic.getBlock();
        if (blockSchematic instanceof SlabBlock && stateSchematic.getValue((Property)SlabBlock.TYPE) == SlabType.DOUBLE && (blockClient = stateClient.getBlock()) instanceof SlabBlock && stateClient.getValue((Property)SlabBlock.TYPE) != SlabType.DOUBLE) {
            return blockSchematic != blockClient;
        }
        if (trace.getType() != HitResult.Type.BLOCK) {
            return false;
        }
        BlockHitResult hitResult = (BlockHitResult)trace;
        BlockPlaceContext ctx = new BlockPlaceContext(new UseOnContext(player, InteractionHand.MAIN_HAND, hitResult));
        return !stateClient.canBeReplaced(ctx);
    }

    public static PlacementProtocolData applyPlacementProtocolAll(BlockPos pos, BlockState stateSchematic, Vec3 hitVecIn) {
        PlacementProtocolData placementData = new PlacementProtocolData();
        Block stateBlock = stateSchematic.getBlock();
        ClientLevel world = Minecraft.getInstance().level;
        if (stateBlock instanceof BaseTorchBlock || stateBlock instanceof AbstractBannerBlock || stateBlock instanceof SignBlock || stateBlock instanceof AbstractSkullBlock) {
            placementData.handled = true;
            placementData.hitVec = hitVecIn;
            if (stateBlock instanceof WallTorchBlock || stateBlock instanceof RedstoneWallTorchBlock || stateBlock instanceof WallBannerBlock || stateBlock instanceof WallSignBlock || stateBlock instanceof WallSkullBlock) {
                placementData.side = (Direction)stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING);
                placementData.pos = pos.relative(placementData.side.getOpposite());
            } else {
                placementData.side = Direction.UP;
                placementData.pos = pos.below();
            }
            BlockState stateFacing = world.getBlockState(placementData.pos);
            if (stateFacing == null || stateFacing.isAir()) {
                placementData.mustFail = true;
            }
        } else if (stateBlock instanceof FaceAttachedHorizontalDirectionalBlock && !((IMixinWallMountedBlock)stateBlock).litematica_invokeCanPlaceAt(stateSchematic, (LevelReader)world, pos)) {
            placementData.mustFail = true;
        }
        return placementData;
    }

    public static Vec3 applyCarpetProtocolHitVec(BlockPos pos, BlockState state, Vec3 hitVecIn) {
        double x = hitVecIn.x;
        double y = hitVecIn.y;
        double z = hitVecIn.z;
        Block block = state.getBlock();
        Optional facing = BlockUtils.getFirstPropertyFacingValue((BlockState)state);
        int propertyIncrement = 16;
        boolean hasData = false;
        int protocolValue = 0;
        if (facing.isPresent()) {
            protocolValue = ((Direction)facing.get()).get3DDataValue();
            hasData = true;
        } else if (state.hasProperty((Property)BlockStateProperties.AXIS)) {
            Direction.Axis axis = (Direction.Axis)state.getValue((Property)BlockStateProperties.AXIS);
            protocolValue = axis.ordinal();
            hasData = true;
        }
        if (block instanceof RepeaterBlock) {
            protocolValue += (Integer)state.getValue((Property)RepeaterBlock.DELAY) * 16;
        } else if (block instanceof ComparatorBlock && state.getValue((Property)ComparatorBlock.MODE) == ComparatorMode.SUBTRACT) {
            protocolValue += 16;
        } else if (state.hasProperty((Property)BlockStateProperties.HALF) && state.getValue((Property)BlockStateProperties.HALF) == Half.TOP) {
            protocolValue += 16;
        } else if (state.hasProperty((Property)BlockStateProperties.SLAB_TYPE) && state.getValue((Property)BlockStateProperties.SLAB_TYPE) == SlabType.TOP) {
            protocolValue += 16;
        }
        y = EasyPlaceUtils.applySlabOrStairHitVecY(y, pos, state);
        if (protocolValue != 0 || hasData) {
            x += (double)(protocolValue * 2 + 2);
        }
        return new Vec3(x, y, z);
    }

    private static double applySlabOrStairHitVecY(double origY, BlockPos pos, BlockState state) {
        double y = origY;
        if (state.hasProperty((Property)BlockStateProperties.SLAB_TYPE)) {
            y = pos.getY();
            if (state.getValue((Property)BlockStateProperties.SLAB_TYPE) == SlabType.TOP) {
                y += 0.99;
            }
        } else if (state.hasProperty((Property)BlockStateProperties.HALF)) {
            y = pos.getY();
            if (state.getValue((Property)BlockStateProperties.HALF) == Half.TOP) {
                y += 0.99;
            }
        }
        return y;
    }

    public static Vec3 applyBlockSlabProtocol(BlockPos pos, BlockState state, Vec3 hitVecIn) {
        double newY = EasyPlaceUtils.applySlabOrStairHitVecY(hitVecIn.y, pos, state);
        return newY != hitVecIn.y ? new Vec3(hitVecIn.x, newY, hitVecIn.z) : hitVecIn;
    }

    public static <T extends Comparable<T>> Vec3 applyPlacementProtocolV3(BlockPos pos, BlockState state, Vec3 hitVecIn) {
        Collection props = state.getBlock().getStateDefinition().getProperties();
        if (props.isEmpty()) {
            return hitVecIn;
        }
        double relX = hitVecIn.x - (double)pos.getX();
        int protocolValue = 0;
        int shiftAmount = 1;
        int propCount = 0;
        Optional property = BlockUtils.getFirstDirectionProperty((BlockState)state);
        if (property.isPresent() && property.get() != BlockStateProperties.VERTICAL_DIRECTION) {
            Direction direction = (Direction)state.getValue((Property)property.get());
            protocolValue |= direction.get3DDataValue() << shiftAmount;
            shiftAmount += 3;
            ++propCount;
        }
        ArrayList<Property> propList = new ArrayList<Property>(props);
        propList.sort(Comparator.comparing(Property::getName));
        try {
            for (Property p : propList) {
                if (property.isPresent() && ((EnumProperty)property.get()).equals((Object)p) || !PlacementHandler.WHITELISTED_PROPERTIES.contains((Object)p) || PlacementHandler.BLACKLISTED_PROPERTIES.containsKey((Object)p)) continue;
                Property prop = p;
                ArrayList list = new ArrayList(prop.getPossibleValues());
                list.sort(Comparable::compareTo);
                int requiredBits = Mth.log2((int)Mth.smallestEncompassingPowerOfTwo((int)list.size()));
                int valueIndex = list.indexOf(state.getValue(prop));
                if (valueIndex == -1) continue;
                protocolValue |= valueIndex << shiftAmount;
                shiftAmount += requiredBits;
                ++propCount;
            }
        }
        catch (Exception e) {
            Litematica.LOGGER.warn("Exception trying to request placement protocol value", (Throwable)e);
        }
        if (propCount > 0) {
            double x = (double)pos.getX() + relX + 2.0 + (double)protocolValue;
            return new Vec3(x, hitVecIn.y, hitVecIn.z);
        }
        return hitVecIn;
    }

    public static Direction applyPlacementFacing(BlockState stateSchematic, Direction side, BlockState stateClient) {
        Block blockSchematic = stateSchematic.getBlock();
        Block blockClient = stateClient.getBlock();
        if (blockSchematic instanceof SlabBlock) {
            if (stateSchematic.getValue((Property)SlabBlock.TYPE) == SlabType.DOUBLE && blockClient instanceof SlabBlock && stateClient.getValue((Property)SlabBlock.TYPE) != SlabType.DOUBLE) {
                if (stateClient.getValue((Property)SlabBlock.TYPE) == SlabType.TOP) {
                    return Direction.DOWN;
                }
                return Direction.UP;
            }
            return Direction.NORTH;
        }
        if (stateSchematic.hasProperty((Property)BlockStateProperties.HALF)) {
            side = stateSchematic.getValue((Property)BlockStateProperties.HALF) == Half.TOP ? Direction.DOWN : Direction.UP;
        }
        return side;
    }

    public static boolean handlePlacementRestriction(Minecraft mc) {
        boolean cancel = EasyPlaceUtils.placementRestrictionInEffect(mc);
        if (cancel) {
            MessageOutputType type = (MessageOutputType)Configs.Generic.PLACEMENT_RESTRICTION_WARN.getOptionListValue();
            if (type == MessageOutputType.MESSAGE) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.placement_restriction_fail", (Object[])new Object[0]);
            } else if (type == MessageOutputType.ACTIONBAR) {
                InfoUtils.printActionbarMessage((String)"litematica.message.placement_restriction_fail", (Object[])new Object[0]);
            }
        }
        return cancel;
    }

    static boolean placementRestrictionInEffect(Minecraft mc) {
        HitResult trace = mc.hitResult;
        ItemStack stack = mc.player.getMainHandItem();
        if (stack.isEmpty()) {
            stack = mc.player.getOffhandItem();
        }
        if (stack.isEmpty()) {
            return false;
        }
        if (trace != null && trace.getType() == HitResult.Type.BLOCK) {
            BlockHitResult blockHitResult = (BlockHitResult)trace;
            BlockPlaceContext ctx = new BlockPlaceContext(new UseOnContext((Player)mc.player, InteractionHand.MAIN_HAND, blockHitResult));
            BlockPos pos = ctx.getClickedPos();
            BlockState stateClient = mc.level.getBlockState(pos);
            WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
            LayerRange range = DataManager.getRenderLayerRange();
            boolean schematicHasAir = worldSchematic.isEmptyBlock(pos);
            if (!schematicHasAir && !range.isPositionWithinRange(pos)) {
                return true;
            }
            if (schematicHasAir && EasyPlaceUtils.isPositionWithinRangeOfSchematicRegions(pos, 2)) {
                return true;
            }
            ctx = new BlockPlaceContext(new UseOnContext((Player)mc.player, InteractionHand.MAIN_HAND, blockHitResult = new BlockHitResult(blockHitResult.getLocation(), blockHitResult.getDirection(), pos, false)));
            if (!stateClient.canBeReplaced(ctx)) {
                return true;
            }
            BlockState stateSchematic = worldSchematic.getBlockState(pos);
            stack = MaterialCache.getInstance().getRequiredBuildItemForState(stateSchematic, worldSchematic, pos);
            if (!stack.isEmpty() && EntityUtils.getUsedHandForItem((Player)mc.player, stack) == null) {
                return true;
            }
            Block schematicBlock = stateSchematic.getBlock();
            if ((schematicBlock instanceof WallTorchBlock || schematicBlock instanceof RedstoneWallTorchBlock || schematicBlock instanceof WallBannerBlock || schematicBlock instanceof WallSignBlock || schematicBlock instanceof WallSkullBlock) && blockHitResult.getDirection() != stateSchematic.getValue((Property)BlockStateProperties.HORIZONTAL_FACING)) {
                return true;
            }
            BlockState attemptState = schematicBlock.getStateForPlacement(ctx);
            return !EasyPlaceUtils.isMatchingStatePlacementRestriction(attemptState, stateSchematic);
        }
        return false;
    }

    private static boolean isMatchingStatePlacementRestriction(BlockState state1, BlockState state2) {
        Property[] orientationProperties;
        if (state1 == null || state2 == null) {
            return false;
        }
        if (state1 == state2) {
            return true;
        }
        for (Property property : orientationProperties = new Property[]{BlockStateProperties.FACING, BlockStateProperties.HALF, BlockStateProperties.FACING_HOPPER, BlockStateProperties.DOOR_HINGE, BlockStateProperties.HORIZONTAL_FACING, BlockStateProperties.AXIS, BlockStateProperties.SLAB_TYPE, BlockStateProperties.VERTICAL_DIRECTION, BlockStateProperties.ROTATION_16, BlockStateProperties.HANGING, BlockStateProperties.ATTACH_FACE, BlockStateProperties.BELL_ATTACHMENT}) {
            boolean hasProperty2;
            boolean hasProperty1 = state1.hasProperty(property);
            if (hasProperty1 != (hasProperty2 = state2.hasProperty(property))) {
                return false;
            }
            if (!hasProperty1 || state1.getValue(property) == state2.getValue(property)) continue;
            return false;
        }
        return true;
    }

    private static boolean isPositionWithinRangeOfSchematicRegions(BlockPos pos, int range) {
        SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
        int minCX = pos.getX() - range >> 4;
        int minCY = pos.getY() - range >> 4;
        int minCZ = pos.getZ() - range >> 4;
        int maxCX = pos.getX() + range >> 4;
        int maxCY = pos.getY() + range >> 4;
        int maxCZ = pos.getZ() + range >> 4;
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        for (int cy = minCY; cy <= maxCY; ++cy) {
            for (int cz = minCZ; cz <= maxCZ; ++cz) {
                for (int cx = minCX; cx <= maxCX; ++cx) {
                    List<SchematicPlacementManager.PlacementPart> parts = manager.getPlacementPartsInChunk(cx, cz);
                    for (SchematicPlacementManager.PlacementPart part : parts) {
                        IntBoundingBox box = part.bb;
                        if (x < box.minX() - range || x > box.maxX() + range || y < box.minY() - range || y > box.maxY() + range || z < box.minZ() - range || z > box.maxZ() + range) continue;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    protected static boolean easyPlaceIsPositionCached(BlockPos pos) {
        long currentTime = System.nanoTime();
        boolean cached = false;
        for (int i = 0; i < EASY_PLACE_POSITIONS.size(); ++i) {
            PositionCache val = EASY_PLACE_POSITIONS.get(i);
            boolean expired = val.hasExpired(currentTime);
            if (expired) {
                EASY_PLACE_POSITIONS.remove(i);
                --i;
                continue;
            }
            if (!val.getPos().equals((Object)pos)) continue;
            cached = true;
            if (EASY_PLACE_POSITIONS.size() < 16) break;
        }
        return cached;
    }

    protected static void cacheEasyPlacePosition(BlockPos pos) {
        EASY_PLACE_POSITIONS.add(new PositionCache(pos, System.nanoTime(), 2000000000L));
    }

    protected static boolean easyPlaceIsTooFast() {
        return System.nanoTime() - easyPlaceLastPickBlockTime < 1000000L * (long)Configs.Generic.EASY_PLACE_SWAP_INTERVAL.getIntegerValue();
    }

    protected static void setEasyPlaceLastPickBlockTime() {
        easyPlaceLastPickBlockTime = System.nanoTime();
    }

    static {
        easyPlaceLastPickBlockTime = System.nanoTime();
    }

    public static class PlacementProtocolData {
        boolean handled;
        boolean mustFail;
        BlockPos pos;
        Direction side;
        Vec3 hitVec;
    }

    public static class PositionCache {
        private final BlockPos pos;
        private final long time;
        private final long timeout;

        private PositionCache(BlockPos pos, long time, long timeout) {
            this.pos = pos;
            this.time = time;
            this.timeout = timeout;
        }

        public BlockPos getPos() {
            return this.pos;
        }

        public boolean hasExpired(long currentTime) {
            return currentTime - this.time > this.timeout;
        }
    }
}

