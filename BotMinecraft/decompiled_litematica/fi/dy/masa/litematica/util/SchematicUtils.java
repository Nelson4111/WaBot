/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiTextInput
 *  fi.dy.masa.malilib.gui.GuiTextInputStackedMultiLine
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.IRangeChangeListener
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.interfaces.IStringDualConsumerFeedback
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  fi.dy.masa.malilib.util.position.SubChunkPos
 *  it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Vec3i
 *  net.minecraft.util.Mth
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.BlockItem
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.item.context.UseOnContext
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.SchematicHolder;
import fi.dy.masa.litematica.gui.GuiSchematicSave;
import fi.dy.masa.litematica.mixin.entity.IMixinEntity;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskDeleteArea;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkBase;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkCommand;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkDirect;
import fi.dy.masa.litematica.scheduler.tasks.TaskSaveSchematic;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.SchematicMetadata;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.util.BlockUtils;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiTextInput;
import fi.dy.masa.malilib.gui.GuiTextInputStackedMultiLine;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.IRangeChangeListener;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.interfaces.IStringDualConsumerFeedback;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import fi.dy.masa.malilib.util.position.SubChunkPos;
import it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.BiPredicate;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.util.Mth;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.item.context.UseOnContext;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public class SchematicUtils {
    private static long areaMovedTime;

    public static boolean saveSchematic(boolean inMemoryOnly) {
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection area = sm.getCurrentSelection();
        if (area != null) {
            if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
                String title = "litematica.gui.title.schematic_projects.save_new_version";
                SchematicProject project = DataManager.getSchematicProjectsManager().getCurrentProject();
                GuiTextInputStackedMultiLine gui = new GuiTextInputStackedMultiLine(512, 2, 8, title, project.getCurrentVersionName(), project.getCurrentVersionDescription(), GuiUtils.getCurrentScreen(), (IStringDualConsumerFeedback)new SchematicVersionCreator());
                GuiBase.openGui((Screen)gui);
            } else if (inMemoryOnly) {
                String title = "litematica.gui.title.create_in_memory_schematic";
                GuiTextInput gui = new GuiTextInput(512, title, area.getName(), GuiUtils.getCurrentScreen(), (IStringConsumer)new GuiSchematicSave.InMemorySchematicCreator(area));
                GuiBase.openGui((Screen)gui);
            } else {
                GuiSchematicSave gui = new GuiSchematicSave();
                gui.setParent(GuiUtils.getCurrentScreen());
                GuiBase.openGui((Screen)gui);
            }
            return true;
        }
        return false;
    }

    public static void unloadCurrentlySelectedSchematic() {
        SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
        if (placement != null) {
            SchematicHolder.getInstance().removeSchematic(placement.getSchematic());
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_placement_selected", (Object[])new Object[0]);
        }
    }

    public static boolean breakSchematicBlock(Minecraft mc) {
        return SchematicUtils.setTargetedSchematicBlockState(mc, Blocks.AIR.defaultBlockState());
    }

    public static boolean placeSchematicBlock(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null) {
            BlockPos pos = info.pos.relative(info.side);
            if (DataManager.getRenderLayerRange().isPositionWithinRange(pos)) {
                return SchematicUtils.setTargetedSchematicBlockState(pos, info.stateNew);
            }
        }
        return false;
    }

    public static boolean replaceSchematicBlocksInDirection(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null) {
            Direction playerFacingH = mc.player.getDirection();
            Direction direction = fi.dy.masa.malilib.util.position.PositionUtils.getTargetedDirection((Direction)info.side, (Direction)playerFacingH, (BlockPos)info.pos, (Vec3)info.hitVec);
            if (direction == info.side) {
                direction = direction.getOpposite();
            }
            BlockPos posEnd = SchematicUtils.getReplacementBoxEndPos(info.pos, direction);
            return SchematicUtils.setSchematicBlockStates(info.pos, posEnd, info.stateNew);
        }
        return false;
    }

    public static boolean replaceAllIdenticalSchematicBlocks(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null) {
            return SchematicUtils.setAllIdenticalSchematicBlockStates(info.pos, info.stateOriginal, info.stateNew, (Level)mc.level);
        }
        return false;
    }

    public static boolean replaceBlocksKeepingProperties(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null && info.stateNew != info.stateOriginal && BlockUtils.blocksHaveSameProperties(info.stateOriginal, info.stateNew)) {
            Object2ObjectOpenHashMap map = new Object2ObjectOpenHashMap();
            BiPredicate<BlockState, BlockState> blockStateTest = (testedState, originalState) -> testedState.getBlock() == originalState.getBlock();
            BiFunction<BlockState, BlockState, BlockState> blockModifier = (newState, originalState) -> (BlockState)map.computeIfAbsent(originalState, k -> {
                BlockState finalState = newState;
                for (Property prop : newState.getProperties()) {
                    finalState = BlockUtils.getBlockStateWithProperty(finalState, prop, originalState.getValue(prop));
                }
                return finalState;
            });
            return SchematicUtils.setAllIdenticalSchematicBlockStates(info.pos, info.stateOriginal, info.stateNew, blockStateTest, blockModifier, (Level)mc.level);
        }
        return false;
    }

    public static boolean breakSchematicBlocks(Minecraft mc) {
        Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
        RayTraceUtils.RayTraceWrapper wrapper = RayTraceUtils.getSchematicWorldTraceWrapperIfClosest((Level)mc.level, entity, 10.0);
        if (wrapper != null && wrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = wrapper.getBlockHitResult();
            BlockPos pos = trace.getBlockPos();
            Direction playerFacingH = mc.player.getDirection();
            Direction direction = fi.dy.masa.malilib.util.position.PositionUtils.getTargetedDirection((Direction)trace.getDirection(), (Direction)playerFacingH, (BlockPos)pos, (Vec3)trace.getLocation());
            if (direction == trace.getDirection()) {
                direction = direction.getOpposite();
            }
            BlockPos posEnd = SchematicUtils.getReplacementBoxEndPos(pos, direction);
            return SchematicUtils.setSchematicBlockStates(pos, posEnd, Blocks.AIR.defaultBlockState());
        }
        return false;
    }

    public static boolean breakAllIdenticalSchematicBlocks(Minecraft mc) {
        Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
        RayTraceUtils.RayTraceWrapper wrapper = RayTraceUtils.getSchematicWorldTraceWrapperIfClosest((Level)mc.level, entity, 10.0);
        if (wrapper != null && wrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = wrapper.getBlockHitResult();
            BlockPos pos = trace.getBlockPos();
            BlockState stateOriginal = SchematicWorldHandler.getSchematicWorld().getBlockState(pos);
            return SchematicUtils.setAllIdenticalSchematicBlockStates(pos, stateOriginal, Blocks.AIR.defaultBlockState(), (Level)mc.level);
        }
        return false;
    }

    public static boolean placeSchematicBlocksInDirection(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null && mc.player != null) {
            Direction playerFacingH = mc.player.getDirection();
            Direction direction = fi.dy.masa.malilib.util.position.PositionUtils.getTargetedDirection((Direction)info.side, (Direction)playerFacingH, (BlockPos)info.pos, (Vec3)info.hitVec);
            BlockPos posStart = info.pos.relative(info.side);
            if (SchematicWorldHandler.getSchematicWorld().getBlockState(posStart).isAir()) {
                BlockPos posEnd = SchematicUtils.getReplacementBoxEndPos(posStart, direction);
                return SchematicUtils.setSchematicBlockStates(posStart, posEnd, info.stateNew);
            }
        }
        return false;
    }

    public static boolean breakAllSchematicBlocksExceptTargeted(Minecraft mc) {
        Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
        RayTraceUtils.RayTraceWrapper wrapper = RayTraceUtils.getSchematicWorldTraceWrapperIfClosest((Level)mc.level, entity, 10.0);
        if (wrapper != null && wrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = wrapper.getBlockHitResult();
            BlockPos pos = trace.getBlockPos();
            BlockState stateOriginal = SchematicWorldHandler.getSchematicWorld().getBlockState(pos);
            return SchematicUtils.setAllStatesToAirExcept(pos, stateOriginal, (Level)mc.level);
        }
        return false;
    }

    public static boolean fillAirWithBlocks(Minecraft mc) {
        ReplacementInfo info = SchematicUtils.getTargetInfo(mc);
        if (info != null && info.stateNew != null) {
            BlockPos posStart = info.pos.relative(info.side);
            if (SchematicWorldHandler.getSchematicWorld().getBlockState(posStart).isAir()) {
                return SchematicUtils.setAllIdenticalSchematicBlockStates(posStart, Blocks.AIR.defaultBlockState(), info.stateNew, (Level)mc.level);
            }
        }
        return false;
    }

    @Nullable
    private static ReplacementInfo getTargetInfo(Minecraft mc) {
        ItemStack stack = mc.player.getMainHandItem();
        if (!stack.isEmpty() && stack.getItem() instanceof BlockItem || stack.isEmpty() && ToolMode.REBUILD.getPrimaryBlock() != null) {
            WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
            Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
            RayTraceUtils.RayTraceWrapper traceWrapper = RayTraceUtils.getGenericTrace((Level)mc.level, entity, 10.0);
            if (worldSchematic != null && traceWrapper != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
                BlockHitResult trace = traceWrapper.getBlockHitResult();
                Direction side = trace.getDirection();
                Vec3 hitVec = trace.getLocation();
                BlockPos pos = trace.getBlockPos();
                BlockState stateOriginal = worldSchematic.getBlockState(pos);
                BlockState stateNew = Blocks.AIR.defaultBlockState();
                if (stack.getItem() instanceof BlockItem) {
                    Level worldClient = mc.player.level();
                    ((IMixinEntity)mc.player).litematica_setWorld(worldSchematic);
                    BlockHitResult hit = new BlockHitResult(trace.getLocation(), side, pos.relative(side), false);
                    BlockPlaceContext ctx = new BlockPlaceContext(new UseOnContext((Player)mc.player, InteractionHand.MAIN_HAND, hit));
                    ((IMixinEntity)mc.player).litematica_setWorld(worldClient);
                    stateNew = ((BlockItem)stack.getItem()).getBlock().getStateForPlacement(ctx);
                } else if (ToolMode.REBUILD.getPrimaryBlock() != null) {
                    stateNew = ToolMode.REBUILD.getPrimaryBlock();
                }
                return new ReplacementInfo(pos, side, hitVec, stateOriginal, stateNew);
            }
        }
        return null;
    }

    private static BlockPos getReplacementBoxEndPos(BlockPos startPos, Direction direction) {
        return SchematicUtils.getReplacementBoxEndPos(startPos, direction, 10000);
    }

    private static BlockPos getReplacementBoxEndPos(BlockPos startPos, Direction direction, int maxBlocks) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        LayerRange range = DataManager.getRenderLayerRange();
        BlockState stateStart = world.getBlockState(startPos);
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        posMutable.set((Vec3i)startPos);
        while (maxBlocks-- > 0) {
            posMutable.move(direction);
            if (range.isPositionWithinRange((BlockPos)posMutable) && world.getChunkSource().hasChunk(posMutable.getX() >> 4, posMutable.getZ() >> 4) && world.getBlockState((BlockPos)posMutable) == stateStart) continue;
            posMutable.move(direction.getOpposite());
            break;
        }
        return posMutable.immutable();
    }

    public static boolean setTargetedSchematicBlockState(Minecraft mc, BlockState state) {
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
        RayTraceUtils.RayTraceWrapper traceWrapper = RayTraceUtils.getGenericTrace((Level)mc.level, entity, WorldUtils.getValidBlockRange(mc));
        if (world != null && traceWrapper != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = traceWrapper.getBlockHitResult();
            BlockPos pos = trace.getBlockPos();
            return SchematicUtils.setTargetedSchematicBlockState(pos, state);
        }
        return false;
    }

    private static boolean setTargetedSchematicBlockState(BlockPos pos, BlockState state) {
        if (pos != null) {
            SubChunkPos cpos = new SubChunkPos(pos);
            List<SchematicPlacementManager.PlacementPart> list = DataManager.getSchematicPlacementManager().getAllPlacementsTouchingChunk(pos);
            if (!list.isEmpty()) {
                for (SchematicPlacementManager.PlacementPart part : list) {
                    if (!part.getBox().contains((Vec3i)pos)) continue;
                    SchematicPlacement placement = part.getPlacement();
                    String regionName = part.getSubRegionName();
                    LitematicaBlockStateContainer container = placement.getSchematic().getSubRegionContainer(regionName);
                    BlockPos posSchematic = SchematicUtils.getSchematicContainerPositionFromWorldPosition(pos, placement.getSchematic(), regionName, placement, placement.getRelativeSubRegionPlacement(regionName), container);
                    if (posSchematic != null) {
                        state = SchematicUtils.getUntransformedBlockState(state, placement, regionName);
                        BlockState stateOriginal = container.get(posSchematic.getX(), posSchematic.getY(), posSchematic.getZ());
                        int totalBlocks = part.getPlacement().getSchematic().getMetadata().getTotalBlocks();
                        int increment = 0;
                        increment = !stateOriginal.isAir() ? (!state.isAir() ? 0 : -1) : (!state.isAir() ? 1 : 0);
                        container.set(posSchematic.getX(), posSchematic.getY(), posSchematic.getZ(), state);
                        SchematicMetadata metadata = part.getPlacement().getSchematic().getMetadata();
                        metadata.setTotalBlocks(totalBlocks += increment);
                        metadata.setTimeModifiedToNow();
                        metadata.setModifiedSinceSaved();
                        DataManager.getSchematicPlacementManager().markChunkForRebuild(new ChunkPos(cpos.getX(), cpos.getZ()));
                        return true;
                    }
                    return false;
                }
            }
        }
        return false;
    }

    private static boolean setSchematicBlockStates(BlockPos posStart, BlockPos posEnd, BlockState state) {
        List<SchematicPlacementManager.PlacementPart> list;
        if (posStart != null && posEnd != null && !(list = DataManager.getSchematicPlacementManager().getAllPlacementsTouchingChunk(posStart)).isEmpty()) {
            for (SchematicPlacementManager.PlacementPart part : list) {
                if (!part.getBox().contains((Vec3i)posStart)) continue;
                SchematicPlacement placement = part.getPlacement();
                String regionName = part.getSubRegionName();
                LitematicaBlockStateContainer container = placement.getSchematic().getSubRegionContainer(regionName);
                BlockPos posStartSchematic = SchematicUtils.getSchematicContainerPositionFromWorldPosition(posStart, placement.getSchematic(), regionName, placement, placement.getRelativeSubRegionPlacement(regionName), container);
                BlockPos posEndSchematic = SchematicUtils.getSchematicContainerPositionFromWorldPosition(posEnd, placement.getSchematic(), regionName, placement, placement.getRelativeSubRegionPlacement(regionName), container);
                if (posStartSchematic != null && posEndSchematic != null) {
                    BlockPos posMin = PositionUtils.getMinCorner(posStartSchematic, posEndSchematic);
                    BlockPos posMax = PositionUtils.getMaxCorner(posStartSchematic, posEndSchematic);
                    int minX = Math.max(posMin.getX(), 0);
                    int minY = Math.max(posMin.getY(), 0);
                    int minZ = Math.max(posMin.getZ(), 0);
                    int maxX = Math.min(posMax.getX(), container.getSize().getX() - 1);
                    int maxY = Math.min(posMax.getY(), container.getSize().getY() - 1);
                    int maxZ = Math.min(posMax.getZ(), container.getSize().getZ() - 1);
                    int totalBlocks = part.getPlacement().getSchematic().getMetadata().getTotalBlocks();
                    int increment = 0;
                    state = SchematicUtils.getUntransformedBlockState(state, placement, regionName);
                    for (int y = minY; y <= maxY; ++y) {
                        for (int z = minZ; z <= maxZ; ++z) {
                            for (int x = minX; x <= maxX; ++x) {
                                BlockState stateOriginal = container.get(x, y, z);
                                increment = !stateOriginal.isAir() ? (!state.isAir() ? 0 : -1) : (!state.isAir() ? 1 : 0);
                                totalBlocks += increment;
                                container.set(x, y, z, state);
                            }
                        }
                    }
                    SchematicMetadata metadata = part.getPlacement().getSchematic().getMetadata();
                    metadata.setTotalBlocks(totalBlocks);
                    metadata.setTimeModifiedToNow();
                    metadata.setModifiedSinceSaved();
                    DataManager.getSchematicPlacementManager().markAllPlacementsOfSchematicForRebuild(placement.getSchematic());
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    private static boolean setAllIdenticalSchematicBlockStates(BlockPos posStart, BlockState stateOriginal, BlockState stateNew, Level world) {
        BiPredicate<BlockState, BlockState> blockStateTest = (testedState, originalState) -> testedState == originalState;
        BiFunction<BlockState, BlockState, BlockState> blockModifier = (newState, originalState) -> newState;
        return SchematicUtils.setAllIdenticalSchematicBlockStates(posStart, stateOriginal, stateNew, blockStateTest, blockModifier, world);
    }

    private static boolean setAllIdenticalSchematicBlockStates(BlockPos posStart, BlockState stateOriginal, BlockState stateNew, BiPredicate<BlockState, BlockState> blockStateTest, BiFunction<BlockState, BlockState, BlockState> blockModifier, Level world) {
        SchematicPlacementManager manager;
        List<SchematicPlacementManager.PlacementPart> list;
        if (posStart != null && !(list = (manager = DataManager.getSchematicPlacementManager()).getAllPlacementsTouchingChunk(posStart)).isEmpty()) {
            for (SchematicPlacementManager.PlacementPart part : list) {
                if (!part.getBox().contains((Vec3i)posStart)) continue;
                if (SchematicUtils.replaceAllIdenticalBlocks(manager, part, stateOriginal, stateNew, blockStateTest, blockModifier, world)) {
                    manager.markAllPlacementsOfSchematicForRebuild(part.getPlacement().getSchematic());
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    private static boolean setAllStatesToAirExcept(BlockPos pos, BlockState state, Level world) {
        SchematicPlacementManager manager;
        List<SchematicPlacementManager.PlacementPart> list;
        if (pos != null && !(list = (manager = DataManager.getSchematicPlacementManager()).getAllPlacementsTouchingChunk(pos)).isEmpty()) {
            for (SchematicPlacementManager.PlacementPart part : list) {
                if (!part.getBox().contains((Vec3i)pos)) continue;
                if (SchematicUtils.setAllStatesToAirExcept(manager, part, state, world)) {
                    manager.markAllPlacementsOfSchematicForRebuild(part.getPlacement().getSchematic());
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    private static boolean setAllStatesToAirExcept(SchematicPlacementManager manager, SchematicPlacementManager.PlacementPart part, BlockState state, Level world) {
        SchematicPlacement schematicPlacement = part.getPlacement();
        String selected = schematicPlacement.getSelectedSubRegionName();
        ArrayList<String> regions = new ArrayList<String>();
        BlockState air = Blocks.AIR.defaultBlockState();
        if (selected != null) {
            regions.add(selected);
        } else if (manager.getSelectedSchematicPlacement() == schematicPlacement) {
            regions.addAll((Collection<String>)schematicPlacement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED).keySet());
        } else {
            InfoUtils.showInGameMessage((Message.MessageType)Message.MessageType.WARNING, (long)20000L, (String)"litematica.message.warn.schematic_rebuild_placement_not_selected", (Object[])new Object[0]);
            return false;
        }
        LayerRange range = DataManager.getRenderLayerRange();
        int totalBlocks = schematicPlacement.getSchematic().getMetadata().getTotalBlocks();
        for (String regionName : regions) {
            LitematicaBlockStateContainer container = schematicPlacement.getSchematic().getSubRegionContainer(regionName);
            SubRegionPlacement placement = schematicPlacement.getRelativeSubRegionPlacement(regionName);
            if (container == null || placement == null) continue;
            int minX = range.getClampedValue(-30000000, Direction.Axis.X);
            int minZ = range.getClampedValue(-30000000, Direction.Axis.Z);
            int maxX = range.getClampedValue(30000000, Direction.Axis.X);
            int maxZ = range.getClampedValue(30000000, Direction.Axis.Z);
            int minY = range.getClampedValue(world.getMinY(), Direction.Axis.Y);
            int maxY = range.getClampedValue(world.getMaxY(), Direction.Axis.Y);
            BlockPos posStart = new BlockPos(minX, minY, minZ);
            BlockPos posEnd = new BlockPos(maxX, maxY, maxZ);
            BlockPos pos1 = SchematicUtils.getReverserTransformedWorldPosition(posStart, schematicPlacement.getSchematic(), regionName, schematicPlacement, schematicPlacement.getRelativeSubRegionPlacement(regionName));
            BlockPos pos2 = SchematicUtils.getReverserTransformedWorldPosition(posEnd, schematicPlacement.getSchematic(), regionName, schematicPlacement, schematicPlacement.getRelativeSubRegionPlacement(regionName));
            if (pos1 == null || pos2 == null) {
                return false;
            }
            BlockPos posStartWorld = PositionUtils.getMinCorner(pos1, pos2);
            BlockPos posEndWorld = PositionUtils.getMaxCorner(pos1, pos2);
            Vec3i size = container.getSize();
            int startX = Math.max(posStartWorld.getX(), 0);
            int startY = Math.max(posStartWorld.getY(), 0);
            int startZ = Math.max(posStartWorld.getZ(), 0);
            int endX = Math.min(posEndWorld.getX(), size.getX() - 1);
            int endY = Math.min(posEndWorld.getY(), size.getY() - 1);
            int endZ = Math.min(posEndWorld.getZ(), size.getZ() - 1);
            if (endX >= size.getX() || endY >= size.getY() || endZ >= size.getZ()) {
                System.out.printf("OUT OF BOUNDS == region: %s, sx: %d, sy: %s, sz: %d, ex: %d, ey: %d, ez: %d - size x: %d y: %d z: %d =============\n", regionName, startX, startY, startZ, endX, endY, endZ, size.getX(), size.getY(), size.getZ());
                return false;
            }
            BlockState stateOriginal = SchematicUtils.getUntransformedBlockState(state, schematicPlacement, regionName);
            for (int y = startY; y <= endY; ++y) {
                for (int z = startZ; z <= endZ; ++z) {
                    for (int x = startX; x <= endX; ++x) {
                        BlockState oldState = container.get(x, y, z);
                        if (oldState == stateOriginal || oldState.isAir()) continue;
                        container.set(x, y, z, air);
                        --totalBlocks;
                    }
                }
            }
        }
        schematicPlacement.getSchematic().getMetadata().setTotalBlocks(totalBlocks);
        return true;
    }

    private static boolean replaceAllIdenticalBlocks(SchematicPlacementManager manager, SchematicPlacementManager.PlacementPart part, BlockState stateOriginalIn, BlockState stateNewIn, BiPredicate<BlockState, BlockState> blockStateTest, BiFunction<BlockState, BlockState, BlockState> blockModifier, Level world) {
        SchematicPlacement schematicPlacement = part.getPlacement();
        String selected = schematicPlacement.getSelectedSubRegionName();
        ArrayList<String> regions = new ArrayList<String>();
        if (selected != null) {
            regions.add(selected);
        } else if (manager.getSelectedSchematicPlacement() == schematicPlacement) {
            regions.addAll((Collection<String>)schematicPlacement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED).keySet());
        } else {
            InfoUtils.showInGameMessage((Message.MessageType)Message.MessageType.WARNING, (long)20000L, (String)"litematica.message.warn.schematic_rebuild_placement_not_selected", (Object[])new Object[0]);
            return false;
        }
        LayerRange range = DataManager.getRenderLayerRange();
        int totalBlocks = schematicPlacement.getSchematic().getMetadata().getTotalBlocks();
        int increment = 0;
        increment = !stateOriginalIn.isAir() ? (!stateNewIn.isAir() ? 0 : -1) : (!stateNewIn.isAir() ? 1 : 0);
        for (String regionName : regions) {
            LitematicaBlockStateContainer container = schematicPlacement.getSchematic().getSubRegionContainer(regionName);
            SubRegionPlacement placement = schematicPlacement.getRelativeSubRegionPlacement(regionName);
            if (container == null || placement == null) continue;
            int minX = range.getClampedValue(-30000000, Direction.Axis.X);
            int minZ = range.getClampedValue(-30000000, Direction.Axis.Z);
            int maxX = range.getClampedValue(30000000, Direction.Axis.X);
            int maxZ = range.getClampedValue(30000000, Direction.Axis.Z);
            int minY = range.getClampedValue(world.getMinY(), Direction.Axis.Y);
            int maxY = range.getClampedValue(world.getMaxY(), Direction.Axis.Y);
            BlockPos posStart = new BlockPos(minX, minY, minZ);
            BlockPos posEnd = new BlockPos(maxX, maxY, maxZ);
            BlockPos pos1 = SchematicUtils.getReverserTransformedWorldPosition(posStart, schematicPlacement.getSchematic(), regionName, schematicPlacement, schematicPlacement.getRelativeSubRegionPlacement(regionName));
            BlockPos pos2 = SchematicUtils.getReverserTransformedWorldPosition(posEnd, schematicPlacement.getSchematic(), regionName, schematicPlacement, schematicPlacement.getRelativeSubRegionPlacement(regionName));
            if (pos1 == null || pos2 == null) {
                return false;
            }
            BlockPos posStartWorld = PositionUtils.getMinCorner(pos1, pos2);
            BlockPos posEndWorld = PositionUtils.getMaxCorner(pos1, pos2);
            Vec3i size = container.getSize();
            int startX = Math.max(posStartWorld.getX(), 0);
            int startY = Math.max(posStartWorld.getY(), 0);
            int startZ = Math.max(posStartWorld.getZ(), 0);
            int endX = Math.min(posEndWorld.getX(), size.getX() - 1);
            int endY = Math.min(posEndWorld.getY(), size.getY() - 1);
            int endZ = Math.min(posEndWorld.getZ(), size.getZ() - 1);
            if (startX < 0 || startY < 0 || startZ < 0 || endX >= size.getX() || endY >= size.getY() || endZ >= size.getZ()) {
                System.out.printf("OUT OF BOUNDS == region: %s, sx: %d, sy: %s, sz: %d, ex: %d, ey: %d, ez: %d - size x: %d y: %d z: %d =============\n", regionName, startX, startY, startZ, endX, endY, endZ, size.getX(), size.getY(), size.getZ());
                return false;
            }
            BlockState stateOriginal = SchematicUtils.getUntransformedBlockState(stateOriginalIn, schematicPlacement, regionName);
            BlockState stateNew = SchematicUtils.getUntransformedBlockState(stateNewIn, schematicPlacement, regionName);
            for (int y = startY; y <= endY; ++y) {
                for (int z = startZ; z <= endZ; ++z) {
                    for (int x = startX; x <= endX; ++x) {
                        BlockState oldState = container.get(x, y, z);
                        if (!blockStateTest.test(oldState, stateOriginal)) continue;
                        BlockState finalState = blockModifier.apply(stateNew, oldState);
                        container.set(x, y, z, finalState);
                        totalBlocks += increment;
                    }
                }
            }
        }
        SchematicMetadata metadata = part.getPlacement().getSchematic().getMetadata();
        metadata.setTotalBlocks(totalBlocks);
        metadata.setTimeModifiedToNow();
        metadata.setModifiedSinceSaved();
        return true;
    }

    public static void moveCurrentlySelectedWorldRegionToLookingDirection(int amount, Entity entity, Minecraft mc) {
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection area = sm.getCurrentSelection();
        if (area != null && area.getAllSubRegionBoxes().size() > 0) {
            BlockPos pos = area.getEffectiveOrigin().relative(EntityUtils.getClosestLookingDirection(entity), amount);
            SchematicUtils.moveCurrentlySelectedWorldRegionTo(pos, mc);
        }
    }

    public static void moveCurrentlySelectedWorldRegionTo(BlockPos pos, Minecraft mc) {
        if (mc.player == null || !EntityUtils.isCreativeMode((Player)mc.player)) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.generic.creative_mode_only", (Object[])new Object[0]);
            return;
        }
        TaskScheduler scheduler = TaskScheduler.getServerInstanceIfExistsOrClient();
        long currentTime = System.currentTimeMillis();
        if (currentTime - areaMovedTime < 400L || scheduler.hasTask(TaskSaveSchematic.class) || scheduler.hasTask(TaskDeleteArea.class) || scheduler.hasTask(TaskPasteSchematicPerChunkCommand.class) || scheduler.hasTask(TaskPasteSchematicPerChunkDirect.class)) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.move.pending_tasks", (Object[])new Object[0]);
            return;
        }
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection area = sm.getCurrentSelection();
        if (area != null && area.getAllSubRegionBoxes().size() > 0) {
            LitematicaSchematic schematic = LitematicaSchematic.createEmptySchematic(area, "");
            LitematicaSchematic.SchematicSaveInfo info = new LitematicaSchematic.SchematicSaveInfo(false, false);
            TaskSaveSchematic taskSave = new TaskSaveSchematic(schematic, area, info);
            taskSave.disableCompletionMessage();
            areaMovedTime = System.currentTimeMillis();
            taskSave.setCompletionListener(() -> {
                SchematicPlacement placement = SchematicPlacement.createFor(schematic, pos, "-", true, true);
                DataManager.getSchematicPlacementManager().addSchematicPlacement(placement, false);
                TaskDeleteArea taskDelete = new TaskDeleteArea(area.getAllSubRegionBoxes(), true);
                taskDelete.disableCompletionMessage();
                areaMovedTime = System.currentTimeMillis();
                taskDelete.setCompletionListener(() -> {
                    LayerRange range = new LayerRange((IRangeChangeListener)SchematicWorldRefresher.INSTANCE);
                    TaskPasteSchematicPerChunkBase taskPaste = mc.hasSingleplayerServer() ? new TaskPasteSchematicPerChunkDirect(Collections.singletonList(placement), range, false) : new TaskPasteSchematicPerChunkCommand(Collections.singletonList(placement), range, false);
                    taskPaste.disableCompletionMessage();
                    areaMovedTime = System.currentTimeMillis();
                    taskPaste.setCompletionListener(() -> {
                        SchematicHolder.getInstance().removeSchematic(schematic);
                        area.moveEntireSelectionTo(pos, false);
                        areaMovedTime = System.currentTimeMillis();
                    });
                    scheduler.scheduleTask(taskPaste, 1);
                });
                scheduler.scheduleTask(taskDelete, 1);
            });
            scheduler.scheduleTask(taskSave, 1);
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_area_selected", (Object[])new Object[0]);
        }
    }

    public static void cloneSelectionArea(Minecraft mc) {
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection area = sm.getCurrentSelection();
        if (area != null && area.getAllSubRegionBoxes().size() > 0) {
            BlockPos originTmp;
            LitematicaSchematic schematic = LitematicaSchematic.createEmptySchematic(area, mc.player.getName().getString());
            LitematicaSchematic.SchematicSaveInfo info = new LitematicaSchematic.SchematicSaveInfo(false, false);
            TaskSaveSchematic taskSave = new TaskSaveSchematic(schematic, area, info);
            taskSave.disableCompletionMessage();
            Entity entity = fi.dy.masa.malilib.util.EntityUtils.getCameraEntity();
            if (Configs.Generic.CLONE_AT_ORIGINAL_POS.getBooleanValue()) {
                originTmp = area.getEffectiveOrigin();
            } else {
                originTmp = RayTraceUtils.getTargetedPosition((Level)mc.level, entity, WorldUtils.getValidBlockRange(mc), false);
                if (originTmp == null) {
                    originTmp = fi.dy.masa.malilib.util.position.PositionUtils.getEntityBlockPos((Entity)entity);
                }
            }
            BlockPos origin = originTmp;
            String name = schematic.getMetadata().getName();
            taskSave.setCompletionListener(() -> {
                SchematicPlacementManager manager = DataManager.getSchematicPlacementManager();
                SchematicPlacement placement = SchematicPlacement.createFor(schematic, origin, name, true, true);
                manager.addSchematicPlacement(placement, false);
                manager.setSelectedSchematicPlacement(placement);
                if (EntityUtils.isCreativeMode((Player)mc.player)) {
                    DataManager.setToolMode(ToolMode.PASTE_SCHEMATIC);
                }
            });
            TaskScheduler.getServerInstanceIfExistsOrClient().scheduleTask(taskSave, 10);
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.no_area_selected", (Object[])new Object[0]);
        }
    }

    @Nullable
    public static BlockPos getSchematicContainerPositionFromWorldPosition(BlockPos worldPos, LitematicaSchematic schematic, String regionName, SchematicPlacement schematicPlacement, SubRegionPlacement regionPlacement, LitematicaBlockStateContainer container) {
        BlockPos boxMinRel = SchematicUtils.getReverserTransformedWorldPosition(worldPos, schematic, regionName, schematicPlacement, regionPlacement);
        if (boxMinRel == null) {
            return null;
        }
        int startX = boxMinRel.getX();
        int startY = boxMinRel.getY();
        int startZ = boxMinRel.getZ();
        Vec3i size = container.getSize();
        return new BlockPos(Mth.clamp((int)startX, (int)0, (int)(size.getX() - 1)), Mth.clamp((int)startY, (int)0, (int)(size.getY() - 1)), Mth.clamp((int)startZ, (int)0, (int)(size.getZ() - 1)));
    }

    @Nullable
    private static BlockPos getReverserTransformedWorldPosition(BlockPos worldPos, LitematicaSchematic schematic, String regionName, SchematicPlacement schematicPlacement, SubRegionPlacement regionPlacement) {
        BlockPos origin = schematicPlacement.getOrigin();
        BlockPos regionPos = regionPlacement.getPos();
        BlockPos regionSize = schematic.getAreaSize(regionName);
        if (regionSize == null) {
            return null;
        }
        BlockPos posEndRel = PositionUtils.getRelativeEndPositionFromAreaSize((Vec3i)regionSize).offset((Vec3i)regionPos);
        BlockPos posMinRel = PositionUtils.getMinCorner(regionPos, posEndRel);
        BlockPos regionPosTransformed = PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        BlockPos relPos = new BlockPos(worldPos.getX() - origin.getX() - regionPosTransformed.getX(), worldPos.getY() - origin.getY() - regionPosTransformed.getY(), worldPos.getZ() - origin.getZ() - regionPosTransformed.getZ());
        relPos = PositionUtils.getReverseTransformedBlockPos(relPos, regionPlacement.getMirror(), regionPlacement.getRotation());
        relPos = PositionUtils.getReverseTransformedBlockPos(relPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        relPos = relPos.subtract((Vec3i)posMinRel.subtract((Vec3i)regionPos));
        return relPos;
    }

    public static BlockState getUntransformedBlockState(BlockState state, SchematicPlacement schematicPlacement, String subRegionName) {
        SubRegionPlacement placement = schematicPlacement.getRelativeSubRegionPlacement(subRegionName);
        if (placement != null) {
            Rotation rotationCombined = PositionUtils.getReverseRotation(schematicPlacement.getRotation().getRotated(placement.getRotation()));
            Mirror mirrorMain = schematicPlacement.getMirror();
            Mirror mirrorSub = placement.getMirror();
            if (mirrorSub != Mirror.NONE && (schematicPlacement.getRotation() == Rotation.CLOCKWISE_90 || schematicPlacement.getRotation() == Rotation.COUNTERCLOCKWISE_90)) {
                Mirror mirror = mirrorSub = mirrorSub == Mirror.FRONT_BACK ? Mirror.LEFT_RIGHT : Mirror.FRONT_BACK;
            }
            if (rotationCombined != Rotation.NONE) {
                state = state.rotate(rotationCombined);
            }
            if (mirrorSub != Mirror.NONE) {
                state = state.mirror(mirrorSub);
            }
            if (mirrorMain != Mirror.NONE) {
                state = state.mirror(mirrorMain);
            }
        }
        return state;
    }

    public static boolean saveAreaSelectionToSchematic(AreaSelection currentSelection, Level mcWorld) {
        if (currentSelection == null) {
            return false;
        }
        WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
        if (schematicWorld == null) {
            return false;
        }
        for (Box subregion : currentSelection.getAllSubRegionBoxes()) {
            BlockPos pos1 = subregion.getPos1();
            BlockPos pos2 = subregion.getPos2();
            if (pos1 == null || pos2 == null) continue;
            BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
            int yEnd = Math.max(pos1.getY(), pos2.getY());
            for (int y = Math.min(pos1.getY(), pos2.getY()); y <= yEnd; ++y) {
                int xEnd = Math.max(pos1.getX(), pos2.getX());
                for (int x = Math.min(pos1.getX(), pos2.getX()); x <= xEnd; ++x) {
                    int zEnd = Math.max(pos1.getZ(), pos2.getZ());
                    for (int z = Math.min(pos1.getZ(), pos2.getZ()); z <= zEnd; ++z) {
                        pos.set(x, y, z);
                        BlockState worldState = mcWorld.getBlockState((BlockPos)pos);
                        BlockState schematicState = schematicWorld.getBlockState((BlockPos)pos);
                        if (worldState == schematicState) continue;
                        SchematicUtils.setTargetedSchematicBlockState((BlockPos)pos, worldState);
                    }
                }
            }
        }
        return true;
    }

    public static class SchematicVersionCreator
    implements IStringDualConsumerFeedback {
        public boolean setStrings(String string1, String string2) {
            return DataManager.getSchematicProjectsManager().commitNewVersion(string1, string2);
        }
    }

    private static class ReplacementInfo {
        public final BlockPos pos;
        public final Direction side;
        public final Vec3 hitVec;
        public final BlockState stateOriginal;
        public final BlockState stateNew;

        public ReplacementInfo(BlockPos pos, Direction side, Vec3 hitVec, BlockState stateOriginal, BlockState stateNew) {
            this.pos = pos;
            this.side = side;
            this.hitVec = hitVec;
            this.stateOriginal = stateOriginal;
            this.stateNew = stateNew;
        }
    }
}

