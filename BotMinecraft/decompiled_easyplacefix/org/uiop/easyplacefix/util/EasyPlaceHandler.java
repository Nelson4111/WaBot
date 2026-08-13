/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.data.DataManager
 *  fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager
 *  fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager$PlacementPart
 *  fi.dy.masa.litematica.util.EntityUtils
 *  fi.dy.masa.litematica.util.RayTraceUtils
 *  fi.dy.masa.litematica.util.RayTraceUtils$RayTraceWrapper
 *  fi.dy.masa.litematica.util.RayTraceUtils$RayTraceWrapper$HitType
 *  fi.dy.masa.litematica.util.WorldUtils
 *  fi.dy.masa.litematica.world.SchematicWorldHandler
 *  fi.dy.masa.litematica.world.WorldSchematic
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.MultiPlayerGameMode
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.InteractionResult
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Inventory
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.CoralFanBlock
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.TrapDoorBlock
 *  net.minecraft.world.level.block.WallBlock
 *  net.minecraft.world.level.block.piston.PistonBaseBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.HitResult
 *  net.minecraft.world.phys.HitResult$Type
 *  oshi.util.tuples.Pair
 */
package org.uiop.easyplacefix.util;

import com.tick_ins.tick.RunnableWithLast;
import com.tick_ins.tick.TickThread;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Predicate;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.MultiPlayerGameMode;
import net.minecraft.core.BlockPos;
import net.minecraft.util.Tuple;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.CoralFanBlock;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.TrapDoorBlock;
import net.minecraft.world.level.block.WallBlock;
import net.minecraft.world.level.block.piston.PistonBaseBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import org.uiop.easyplacefix.EasyPlaceFix;
import org.uiop.easyplacefix.IBlock;
import org.uiop.easyplacefix.IClientPlayerInteractionManager;
import org.uiop.easyplacefix.LookAt;
import org.uiop.easyplacefix.config.easyPlacefixConfig;
import org.uiop.easyplacefix.data.LoosenModeData;
import org.uiop.easyplacefix.data.RelativeBlockHitResult;
import org.uiop.easyplacefix.util.ExtraInteractionRunner;
import org.uiop.easyplacefix.util.PlacementDiagnostics;
import org.uiop.easyplacefix.util.PlacementInventory;
import org.uiop.easyplacefix.util.PlacementItemResolver;
import org.uiop.easyplacefix.util.PlacementStateMatcher;
import org.uiop.easyplacefix.util.PlayerBlockAction;
import org.uiop.easyplacefix.util.PlayerRotationAction;
import oshi.util.tuples.Pair;

public class EasyPlaceHandler {
    private static final String[] BOX_CONTAINS_METHOD_NAMES = new String[]{"contains", "containsPos"};
    private static final Method PLACEMENT_PART_GET_BOX = EasyPlaceHandler.findNoArgMethod(SchematicPlacementManager.PlacementPart.class, "getBox", "getBoundingBox");
    private static final ConcurrentMap<Class<?>, Method> BOX_CONTAINS_METHODS = new ConcurrentHashMap();

    private static Method findNoArgMethod(Class<?> owner, String ... methodNames) {
        for (String methodName : methodNames) {
            try {
                return owner.getMethod(methodName, new Class[0]);
            }
            catch (NoSuchMethodException noSuchMethodException) {
            }
        }
        throw EasyPlaceHandler.unsupportedApi(owner, methodNames);
    }

    private static Method findBoxContainsMethod(Class<?> boxClass) {
        for (String methodName : BOX_CONTAINS_METHOD_NAMES) {
            for (Method method : boxClass.getMethods()) {
                Class<?>[] parameterTypes = method.getParameterTypes();
                if (!method.getName().equals(methodName) || parameterTypes.length != 1 || !parameterTypes[0].isAssignableFrom(BlockPos.class) || method.getReturnType() != Boolean.TYPE && method.getReturnType() != Boolean.class) continue;
                return method;
            }
        }
        throw EasyPlaceHandler.unsupportedApi(boxClass, BOX_CONTAINS_METHOD_NAMES);
    }

    private static IllegalStateException unsupportedApi(Class<?> owner, String ... methodNames) {
        return new IllegalStateException("Unsupported Litematica/MaLiLib API: " + owner.getName() + "#" + String.join((CharSequence)"/", methodNames));
    }

    private static boolean placementContains(SchematicPlacementManager.PlacementPart placementPart, BlockPos pos) {
        try {
            Object box = PLACEMENT_PART_GET_BOX.invoke((Object)placementPart, new Object[0]);
            if (box == null) {
                return false;
            }
            Method containsMethod = BOX_CONTAINS_METHODS.computeIfAbsent(box.getClass(), EasyPlaceHandler::findBoxContainsMethod);
            return Boolean.TRUE.equals(containsMethod.invoke(box, pos));
        }
        catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Could not inspect a Litematica placement bounding box", exception);
        }
    }

    public static boolean shouldAllowVanillaInteraction(Minecraft mc, RayTraceUtils.RayTraceWrapper traceWrapper) {
        if (!easyPlacefixConfig.Allow_Interaction.getBooleanValue() || mc.level == null) {
            return false;
        }
        BlockHitResult trace = traceWrapper.getBlockHitResult();
        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        if (trace == null || schematicWorld == null) {
            return false;
        }
        BlockPos pos = trace.getBlockPos();
        BlockState stateClient = mc.level.getBlockState(pos);
        BlockState stateSchematic = schematicWorld.getBlockState(pos);
        return ((IBlock)stateClient.getBlock()).isWorldTermination(pos, stateSchematic, stateClient) == InteractionResult.PASS;
    }

    public static boolean isSchematicBlock(BlockPos pos) {
        SchematicPlacementManager schematicPlacementManager = DataManager.getSchematicPlacementManager();
        List allPlacementsTouchingChunk = schematicPlacementManager.getAllPlacementsTouchingChunk(pos);
        for (SchematicPlacementManager.PlacementPart placementPart : allPlacementsTouchingChunk) {
            if (!EasyPlaceHandler.placementContains(placementPart, pos)) continue;
            return true;
        }
        return false;
    }

    public static ItemStack loosenMode2(HashSet<ItemStack> itemStackHashSet) {
        for (int i = 0; i < Minecraft.getInstance().player.getInventory().getContainerSize(); ++i) {
            ItemStack stack = Minecraft.getInstance().player.getInventory().getItem(i);
            if ((stack = stack.copy()).isEmpty() || !LoosenModeData.items.contains(stack.getItem())) continue;
            return stack;
        }
        return null;
    }

    public static ItemStack loosenMode(ItemStack stack, BlockState stateSchema) {
        if (stack == null && easyPlacefixConfig.LOOSEN_MODE.getBooleanValue() && !EntityUtils.isCreativeMode((Player)Minecraft.getInstance().player)) {
            Block ReplacedBlock = stateSchema.getBlock();
            Predicate<Block> predicate = null;
            if (ReplacedBlock instanceof WallBlock) {
                predicate = block -> block instanceof WallBlock;
            } else if (ReplacedBlock instanceof FenceGateBlock) {
                predicate = block -> block instanceof FenceGateBlock;
            } else if (ReplacedBlock instanceof TrapDoorBlock) {
                predicate = block -> block instanceof TrapDoorBlock;
            } else if (ReplacedBlock instanceof CoralFanBlock) {
                predicate = block -> block instanceof CoralFanBlock;
            }
            ItemStack stack1 = null;
            if (predicate != null) {
                Inventory playerInventory = Minecraft.getInstance().player.getInventory();
                stack1 = EasyPlaceFix.findBlockInInventory(playerInventory, predicate);
            }
            if (stack1 == null) {
                HashSet<ItemStack> itemStackHashSet = LoosenModeData.loadFromFile();
                return EasyPlaceHandler.loosenMode2(itemStackHashSet);
            }
            return stack1;
        }
        return stack;
    }

    public static InteractionResult doEasyPlace2(Minecraft mc, RayTraceUtils.RayTraceWrapper traceWrapper) {
        BlockHitResult trace = traceWrapper.getBlockHitResult();
        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        if (schematicWorld == null) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.no_schematic_world", new Object[0]);
            return InteractionResult.PASS;
        }
        BlockPos pos = trace.getBlockPos();
        if (PlayerBlockAction.useItemOnAction.isGlobalPlacementCooling()) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.global_cooldown", easyPlacefixConfig.getEffectivePlacementDelayTicks());
            return InteractionResult.FAIL;
        }
        if (PlayerBlockAction.useItemOnAction.isPlacementCooling(pos)) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.position_cooldown", pos.toShortString());
            return InteractionResult.FAIL;
        }
        BlockState stateClient = mc.level.getBlockState(pos);
        BlockState stateSchematic = schematicWorld.getBlockState(pos);
        InteractionResult isTermination = ((IBlock)stateClient.getBlock()).isWorldTermination(pos, stateSchematic, stateClient);
        if (isTermination != null) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.world_termination", pos.toShortString());
            return isTermination;
        }
        isTermination = ((IBlock)stateSchematic.getBlock()).isSchemaTermination(pos, stateSchematic, stateClient);
        if (isTermination != null) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.schema_termination", pos.toShortString());
            return isTermination;
        }
        HitResult traceVanilla = RayTraceUtils.getRayTraceFromEntity((Level)mc.level, (Entity)mc.player, (boolean)false, (double)WorldUtils.getValidBlockRange((Minecraft)mc));
        if (traceVanilla.getType() == HitResult.Type.ENTITY) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.entity_in_crosshair", new Object[0]);
            return InteractionResult.PASS;
        }
        if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            ItemStack stack = PlacementItemResolver.getPlacementStack(stateSchematic, pos, (Level)schematicWorld);
            if (!stack.isEmpty()) {
                BlockState currentState = mc.level.getBlockState(pos);
                if (PlacementStateMatcher.isSatisfied(stateSchematic, currentState)) {
                    if (EasyPlaceFix.LOGGER.isDebugEnabled()) {
                        EasyPlaceFix.LOGGER.debug("EasyPlace skip at {} because world state already matches schematic", (Object)pos);
                    }
                    PlacementDiagnostics.report("easyplacefix.diagnostic.already_correct", pos.toShortString());
                    return InteractionResult.FAIL;
                }
                if (!stateClient.canBeReplaced(new BlockPlaceContext((Player)Minecraft.getInstance().player, InteractionHand.MAIN_HAND, stack, trace))) {
                    PlacementDiagnostics.report("easyplacefix.diagnostic.not_replaceable", pos.toShortString());
                    return InteractionResult.FAIL;
                }
                MultiPlayerGameMode interactionManager = Minecraft.getInstance().gameMode;
                ItemStack itemStack2 = PlacementInventory.searchItem(mc, stack);
                if ((itemStack2 = EasyPlaceHandler.loosenMode(itemStack2, stateSchematic)) == null) {
                    PlacementDiagnostics.report("easyplacefix.diagnostic.missing_item", stack.getHoverName());
                    return InteractionResult.FAIL;
                }
                Block block = stateSchematic.getBlock();
                Tuple<RelativeBlockHitResult, Integer> blockHitResultIntegerPair = ((IBlock)block).getHitResult(stateSchematic, trace.getBlockPos(), stateClient);
                if (blockHitResultIntegerPair == null) {
                    PlacementDiagnostics.report("easyplacefix.diagnostic.no_hit_result", stateSchematic.getBlock().getName());
                    return InteractionResult.FAIL;
                }
                RelativeBlockHitResult offsetBlockHitResult = blockHitResultIntegerPair.getA();
                if (stateSchematic.getBlock() instanceof PistonBaseBlock) {
                    PlayerBlockAction.useItemOnAction.pistonBlockState = stateSchematic;
                    PlayerBlockAction.useItemOnAction.modifyBoolean = true;
                }
                ItemStack finalStack = itemStack2;
                AtomicReference hand = new AtomicReference();
                boolean hasSleep = ((IBlock)block).HasSleepTime(stateSchematic);
                Tuple<LookAt, LookAt> YawAndPitch = ((IBlock)block).getYawAndPitch(stateSchematic);
                boolean hasRotation = YawAndPitch != null;
                float rotationYaw = hasRotation ? YawAndPitch.getA().Value() : 0.0f;
                float rotationPitch = hasRotation ? YawAndPitch.getB().Value() : 0.0f;
                PlayerBlockAction.useItemOnAction.markGlobalPlacement();
                if (hasSleep) {
                    TickThread.addLastTask(new RunnableWithLast.Builder().setTask(() -> {
                        if (hasRotation) {
                            PlayerRotationAction.setServerBoundPlayerRotation(Float.valueOf(rotationYaw), Float.valueOf(rotationPitch), mc.player.horizontalCollision);
                        }
                        EasyPlaceHandler.pickItem(mc, finalStack);
                        hand.set(EntityUtils.getUsedHandForItem((Player)mc.player, (ItemStack)finalStack));
                        ((IClientPlayerInteractionManager)interactionManager).syn();
                    }).setYawAndPitch((Pair<Float, Float>)(hasRotation ? new Pair((Object)Float.valueOf(rotationYaw), (Object)Float.valueOf(rotationPitch)) : null)).cache(() -> {
                        EasyPlaceHandler.pickItem(mc, finalStack);
                        hand.set(EntityUtils.getUsedHandForItem((Player)mc.player, (ItemStack)finalStack));
                        ((IClientPlayerInteractionManager)interactionManager).syn();
                        InteractionHand usedHand = (InteractionHand)hand.get();
                        if (usedHand == null) {
                            return;
                        }
                        if (hasRotation) {
                            PlayerRotationAction.setServerBoundPlayerRotation(Float.valueOf(rotationYaw), Float.valueOf(rotationPitch), mc.player.horizontalCollision);
                        }
                        ((IBlock)block).firstAction(stateSchematic, trace);
                        if (PlacementStateMatcher.shouldUsePlacementOverride(stateSchematic)) {
                            PlayerBlockAction.useItemOnAction.armPlacementStateOverride(trace.getBlockPos(), stateSchematic, offsetBlockHitResult.getDirection());
                        }
                        interactionManager.useItemOn(mc.player, usedHand, (BlockHitResult)offsetBlockHitResult);
                        mc.player.swing(usedHand);
                        ExtraInteractionRunner.run(mc, interactionManager, usedHand, offsetBlockHitResult, (Integer)blockHitResultIntegerPair.getB(), block, trace.getBlockPos());
                        ((IBlock)block).afterAction(stateSchematic, trace);
                        ((IBlock)block).BlockAction(stateSchematic, trace);
                        if (easyPlacefixConfig.CLIENT_ROTATION_REVERT.getBooleanValue()) {
                            PlayerRotationAction.restRotation();
                        }
                    }).build());
                } else {
                    TickThread.addTask(new RunnableWithLast.Builder().setTask(() -> {
                        if (hasRotation) {
                            PlayerRotationAction.setServerBoundPlayerRotation(Float.valueOf(rotationYaw), Float.valueOf(rotationPitch), mc.player.horizontalCollision);
                        }
                        EasyPlaceHandler.pickItem(mc, finalStack);
                        hand.set(EntityUtils.getUsedHandForItem((Player)mc.player, (ItemStack)finalStack));
                        ((IClientPlayerInteractionManager)interactionManager).syn();
                    }).setYawAndPitch((Pair<Float, Float>)(hasRotation ? new Pair((Object)Float.valueOf(rotationYaw), (Object)Float.valueOf(rotationPitch)) : null)).build(), new RunnableWithLast.Builder().setTask(() -> {
                        EasyPlaceHandler.pickItem(mc, finalStack);
                        hand.set(EntityUtils.getUsedHandForItem((Player)mc.player, (ItemStack)finalStack));
                        ((IClientPlayerInteractionManager)interactionManager).syn();
                        InteractionHand usedHand = (InteractionHand)hand.get();
                        if (usedHand == null) {
                            return;
                        }
                        if (hasRotation) {
                            PlayerRotationAction.setServerBoundPlayerRotation(Float.valueOf(rotationYaw), Float.valueOf(rotationPitch), mc.player.horizontalCollision);
                        }
                        ((IBlock)block).firstAction(stateSchematic, trace);
                        if (PlacementStateMatcher.shouldUsePlacementOverride(stateSchematic)) {
                            PlayerBlockAction.useItemOnAction.armPlacementStateOverride(trace.getBlockPos(), stateSchematic, offsetBlockHitResult.getDirection());
                        }
                        interactionManager.useItemOn(mc.player, usedHand, (BlockHitResult)offsetBlockHitResult);
                        mc.player.swing(usedHand);
                        ExtraInteractionRunner.run(mc, interactionManager, usedHand, offsetBlockHitResult, (Integer)blockHitResultIntegerPair.getB(), block, trace.getBlockPos());
                        ((IBlock)block).afterAction(stateSchematic, trace);
                        ((IBlock)block).BlockAction(stateSchematic, trace);
                        if (easyPlacefixConfig.CLIENT_ROTATION_REVERT.getBooleanValue()) {
                            PlayerRotationAction.restRotation();
                        }
                    }).build());
                }
                PlacementDiagnostics.report("easyplacefix.diagnostic.placing", stack.getHoverName(), pos.toShortString());
            } else {
                PlacementDiagnostics.report("easyplacefix.diagnostic.no_block_item", stateSchematic.getBlock().getName());
            }
            return InteractionResult.SUCCESS;
        }
        if (EasyPlaceHandler.placementRestrictionInEffect(pos)) {
            PlacementDiagnostics.report("easyplacefix.diagnostic.restricted_area", pos.toShortString());
            return InteractionResult.FAIL;
        }
        PlacementDiagnostics.report("easyplacefix.diagnostic.no_schematic_hit", new Object[0]);
        return InteractionResult.PASS;
    }

    public static ItemStack searchItem(Minecraft mc, ItemStack stack) {
        return PlacementInventory.searchItem(mc, stack);
    }

    public static int getSlotWithStackWithOutNbt(ItemStack stack, Inventory inv) {
        return PlacementInventory.getSlotWithStackWithoutNbt(stack, inv);
    }

    public static int getSlotWithStack(ItemStack stack, Inventory inv) {
        return PlacementInventory.getSlotWithStack(stack, inv);
    }

    public static void pickItem(Minecraft mc, ItemStack stack) {
        PlacementInventory.pickItem(mc, stack);
    }

    private static boolean placementRestrictionInEffect(BlockPos pos) {
        return WorldUtils.isPositionWithinRangeOfSchematicRegions((BlockPos)pos, (int)2);
    }
}

