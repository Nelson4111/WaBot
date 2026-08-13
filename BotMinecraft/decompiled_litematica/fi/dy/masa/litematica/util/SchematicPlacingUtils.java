/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Direction$AxisDirection
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.server.level.ServerLevel
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.Display
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.decoration.ItemFrame
 *  net.minecraft.world.entity.decoration.painting.Painting
 *  net.minecraft.world.entity.decoration.painting.PaintingVariant
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.ChestType
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.phys.Vec3
 *  net.minecraft.world.ticks.LevelTicks
 *  net.minecraft.world.ticks.ScheduledTick
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PasteLayerBehavior;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import fi.dy.masa.malilib.util.nbt.NbtView;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.Container;
import net.minecraft.world.entity.Display;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.decoration.painting.Painting;
import net.minecraft.world.entity.decoration.painting.PaintingVariant;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.ticks.LevelTicks;
import net.minecraft.world.ticks.ScheduledTick;

public class SchematicPlacingUtils {
    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public static boolean placeToWorldWithinChunk(Level world, ChunkPos chunkPos, SchematicPlacement schematicPlacement, ReplaceBehavior replace, PasteLayerBehavior layerBehavior, boolean notifyNeighbors) {
        LitematicaSchematic schematic = schematicPlacement.getSchematic();
        Set<String> regionsTouchingChunk = schematicPlacement.getRegionsTouchingChunk(chunkPos.x(), chunkPos.z());
        BlockPos origin = schematicPlacement.getOrigin();
        boolean allSuccess = true;
        if (world instanceof WorldSchematic && layerBehavior != PasteLayerBehavior.ALL) {
            layerBehavior = PasteLayerBehavior.ALL;
        }
        try {
            if (!notifyNeighbors) {
                WorldUtils.setShouldPreventBlockUpdates(world, true);
            }
            for (String regionName : regionsTouchingChunk) {
                Map<BlockPos, ScheduledTick<Fluid>> scheduledFluidTicks;
                Map<BlockPos, ScheduledTick<Block>> scheduledBlockTicks;
                LitematicaBlockStateContainer container = schematic.getSubRegionContainer(regionName);
                if (container == null) {
                    allSuccess = false;
                    continue;
                }
                SubRegionPlacement placement = schematicPlacement.getRelativeSubRegionPlacement(regionName);
                if (!placement.isEnabled()) continue;
                Map<BlockPos, CompoundTag> blockEntityMap = schematic.getBlockEntityMapForRegion(regionName);
                if (!SchematicPlacingUtils.placeBlocksWithinChunk(world, chunkPos, regionName, container, blockEntityMap, origin, schematicPlacement, placement, scheduledBlockTicks = schematic.getScheduledBlockTicksForRegion(regionName), scheduledFluidTicks = schematic.getScheduledFluidTicksForRegion(regionName), replace, layerBehavior, notifyNeighbors)) {
                    allSuccess = false;
                    Litematica.LOGGER.warn("Invalid/missing schematic data in schematic '{}' for sub-region '{}'", (Object)schematic.getMetadata().getName(), (Object)regionName);
                }
                List<LitematicaSchematic.EntityInfo> entityList = schematic.getEntityListForRegion(regionName);
                if (schematicPlacement.ignoreEntities() || placement.ignoreEntities() || entityList == null) continue;
                SchematicPlacingUtils.placeEntitiesToWorldWithinChunk(world, chunkPos, entityList, origin, schematicPlacement, placement, layerBehavior);
            }
        }
        finally {
            WorldUtils.setShouldPreventBlockUpdates(world, false);
        }
        return allSuccess;
    }

    /*
     * WARNING - void declaration
     */
    public static boolean placeBlocksWithinChunk(Level world, ChunkPos chunkPos, String regionName, LitematicaBlockStateContainer container, Map<BlockPos, CompoundTag> blockEntityMap, BlockPos origin, SchematicPlacement schematicPlacement, SubRegionPlacement placement, @Nullable Map<BlockPos, ScheduledTick<Block>> scheduledBlockTicks, @Nullable Map<BlockPos, ScheduledTick<Fluid>> scheduledFluidTicks, ReplaceBehavior replace, PasteLayerBehavior layerBehavior, boolean notifyNeighbors) {
        WorldSchematic ws;
        int y;
        IntBoundingBox bounds = schematicPlacement.getBoxWithinChunkForRegion(regionName, chunkPos.x(), chunkPos.z());
        Vec3i regionSize = schematicPlacement.getSchematic().getAreaSizeAsVec3i(regionName);
        if (bounds == null || container == null || blockEntityMap == null || regionSize == null) {
            return false;
        }
        BlockPos regionPos = placement.getPos();
        BlockPos posEndRel = new BlockPos((Vec3i)PositionUtils.getRelativeEndPositionFromAreaSize(regionSize)).offset((Vec3i)regionPos);
        BlockPos posMinRel = PositionUtils.getMinCorner(regionPos, posEndRel);
        BlockPos regionPosTransformed = PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        BlockPos boxMinRel = new BlockPos(bounds.minX() - origin.getX() - regionPosTransformed.getX(), 0, bounds.minZ() - origin.getZ() - regionPosTransformed.getZ());
        BlockPos boxMaxRel = new BlockPos(bounds.maxX() - origin.getX() - regionPosTransformed.getX(), 0, bounds.maxZ() - origin.getZ() - regionPosTransformed.getZ());
        boxMinRel = PositionUtils.getReverseTransformedBlockPos(boxMinRel, placement.getMirror(), placement.getRotation());
        boxMaxRel = PositionUtils.getReverseTransformedBlockPos(boxMaxRel, placement.getMirror(), placement.getRotation());
        boxMinRel = PositionUtils.getReverseTransformedBlockPos(boxMinRel, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        boxMaxRel = PositionUtils.getReverseTransformedBlockPos(boxMaxRel, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        boxMinRel = boxMinRel.subtract((Vec3i)posMinRel.subtract((Vec3i)regionPos));
        boxMaxRel = boxMaxRel.subtract((Vec3i)posMinRel.subtract((Vec3i)regionPos));
        BlockPos posMin = PositionUtils.getMinCorner(boxMinRel, boxMaxRel);
        BlockPos posMax = PositionUtils.getMaxCorner(boxMinRel, boxMaxRel);
        BlockPos totalRegionPosTransformed = regionPosTransformed.offset((Vec3i)origin);
        int startX = posMin.getX();
        int startZ = posMin.getZ();
        int endX = posMax.getX();
        int endZ = posMax.getZ();
        boolean startY = false;
        int endY = Math.abs(regionSize.getY()) - 1;
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        if (startX < 0 || startZ < 0 || endX >= container.getSize().getX() || endZ >= container.getSize().getZ()) {
            System.out.printf("DEBUG ============= OUT OF BOUNDS - region: %s, sx: %d, sz: %d, ex: %d, ez: %d - size x: %d z: %d =============\n", regionName, startX, startZ, endX, endZ, container.getSize().getX(), container.getSize().getZ());
            return false;
        }
        Rotation rotationCombined = schematicPlacement.getRotation().getRotated(placement.getRotation());
        Mirror mirrorMain = schematicPlacement.getMirror();
        BlockState barrier = Blocks.BARRIER.defaultBlockState();
        Mirror mirrorSub = placement.getMirror();
        boolean ignoreInventories = Configs.Generic.PASTE_IGNORE_INVENTORY.getBooleanValue();
        if (mirrorSub != Mirror.NONE && (schematicPlacement.getRotation() == Rotation.CLOCKWISE_90 || schematicPlacement.getRotation() == Rotation.COUNTERCLOCKWISE_90)) {
            mirrorSub = mirrorSub == Mirror.FRONT_BACK ? Mirror.LEFT_RIGHT : Mirror.FRONT_BACK;
        }
        int posMinRelMinusRegX = posMinRel.getX() - regionPos.getX();
        int posMinRelMinusRegY = posMinRel.getY() - regionPos.getY();
        int posMinRelMinusRegZ = posMinRel.getZ() - regionPos.getZ();
        for (y = 0; y <= endY; ++y) {
            for (int z = startZ; z <= endZ; ++z) {
                for (int x = startX; x <= endX; ++x) {
                    void var43_55;
                    BlockEntity te;
                    Object state = container.get(x, y, z);
                    if (state.getBlock() == Blocks.STRUCTURE_VOID) continue;
                    posMutable.set(x, y, z);
                    CompoundTag compoundTag = blockEntityMap.get(posMutable);
                    BlockPos origPos = posMutable.immutable();
                    posMutable.set(posMinRelMinusRegX + x, posMinRelMinusRegY + y, posMinRelMinusRegZ + z);
                    BlockPos pos = PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                    pos = pos.offset((Vec3i)totalRegionPosTransformed);
                    if (!SchematicPlacingUtils.shouldPasteBlock(pos, layerBehavior)) continue;
                    BlockState stateOld = world.getBlockState(pos);
                    if (replace == ReplaceBehavior.NONE && !stateOld.isAir() || replace == ReplaceBehavior.WITH_NON_AIR && state.isAir()) continue;
                    if (state.hasBlockEntity() && state.is((Object)Blocks.CHEST) && !ignoreInventories && mirrorMain != Mirror.NONE && state.getValue((Property)ChestBlock.TYPE) != ChestType.SINGLE && Configs.Generic.FIX_CHEST_MIRROR.getBooleanValue()) {
                        Direction facingAdj;
                        BlockPos posAdj;
                        Direction facing = (Direction)state.getValue((Property)ChestBlock.FACING);
                        Direction.Axis axis = facing.getAxis();
                        ChestType type = ((ChestType)state.getValue((Property)ChestBlock.TYPE)).getOpposite();
                        if (mirrorMain != Mirror.NONE && axis != Direction.Axis.Y && blockEntityMap.containsKey(posAdj = origPos.relative(facingAdj = type == ChestType.LEFT ? facing.getCounterClockWise(Direction.Axis.Y) : facing.getClockWise(Direction.Axis.Y)))) {
                            CompoundTag compoundTag2 = blockEntityMap.getOrDefault(posAdj, compoundTag).copy();
                        }
                    }
                    if (mirrorMain != Mirror.NONE) {
                        state = state.mirror(mirrorMain);
                    }
                    if (mirrorSub != Mirror.NONE) {
                        state = state.mirror(mirrorSub);
                    }
                    if (rotationCombined != Rotation.NONE) {
                        state = state.rotate(rotationCombined);
                    }
                    if ((te = world.getBlockEntity(pos)) != null) {
                        if (te instanceof Container) {
                            ((Container)te).clearContent();
                        }
                        world.setBlock(pos, barrier, 20);
                    }
                    if (!world.setBlock(pos, (BlockState)state, 18) || var43_55 == null || (te = world.getBlockEntity(pos)) == null) continue;
                    CompoundTag compoundTag3 = var43_55.copy();
                    compoundTag3.putInt("x", pos.getX());
                    compoundTag3.putInt("y", pos.getY());
                    compoundTag3.putInt("z", pos.getZ());
                    if (ignoreInventories) {
                        compoundTag3.remove("Items");
                    }
                    try {
                        NbtView view = NbtView.getReader((CompoundTag)compoundTag3, (RegistryAccess)world.registryAccess());
                        te.loadWithComponents(view.getReader());
                        if (!ignoreInventories || !(te instanceof Container)) continue;
                        ((Container)te).clearContent();
                        continue;
                    }
                    catch (Exception e) {
                        Litematica.LOGGER.warn("Failed to load BlockEntity data for {} @ {}", state, (Object)pos);
                    }
                }
            }
        }
        if (world instanceof WorldSchematic && !(ws = (WorldSchematic)world).getChunk(chunkPos.x(), chunkPos.z()).getState().atLeast(ChunkSchematicState.FILLED)) {
            ws.getChunkSource().setChunkState(chunkPos.x(), chunkPos.z(), ChunkSchematicState.FILLED);
        }
        if (world instanceof ServerLevel) {
            ScheduledTick tick;
            BlockPos pos;
            ServerLevel serverWorld = (ServerLevel)world;
            IntBoundingBox box = new IntBoundingBox(startX, 0, startZ, endX, endY, endZ);
            if (scheduledBlockTicks != null && !scheduledBlockTicks.isEmpty()) {
                LevelTicks scheduler = serverWorld.getBlockTicks();
                for (Map.Entry entry : scheduledBlockTicks.entrySet()) {
                    pos = (BlockPos)entry.getKey();
                    if (!box.contains((Vec3i)pos)) continue;
                    posMutable.set(posMinRelMinusRegX + pos.getX(), posMinRelMinusRegY + pos.getY(), posMinRelMinusRegZ + pos.getZ());
                    pos = PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                    pos = pos.offset((Vec3i)totalRegionPosTransformed);
                    tick = (ScheduledTick)entry.getValue();
                    if (world.getBlockState(pos).getBlock() != tick.type()) continue;
                    scheduler.schedule(new ScheduledTick((Object)((Block)tick.type()), pos, tick.triggerTick(), tick.priority(), tick.subTickOrder()));
                }
            }
            if (scheduledFluidTicks != null && !scheduledFluidTicks.isEmpty()) {
                LevelTicks scheduler = serverWorld.getFluidTicks();
                for (Map.Entry entry : scheduledFluidTicks.entrySet()) {
                    pos = (BlockPos)entry.getKey();
                    if (!box.contains((Vec3i)pos)) continue;
                    posMutable.set(posMinRelMinusRegX + pos.getX(), posMinRelMinusRegY + pos.getY(), posMinRelMinusRegZ + pos.getZ());
                    pos = PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                    pos = pos.offset((Vec3i)totalRegionPosTransformed);
                    tick = (ScheduledTick)entry.getValue();
                    if (world.getBlockState(pos).getFluidState().getType() != tick.type()) continue;
                    scheduler.schedule(new ScheduledTick((Object)((Fluid)tick.type()), pos, tick.triggerTick(), tick.priority(), tick.subTickOrder()));
                }
            }
        }
        if (notifyNeighbors) {
            for (y = 0; y <= endY; ++y) {
                for (int z = startZ; z <= endZ; ++z) {
                    for (int x = startX; x <= endX; ++x) {
                        posMutable.set(posMinRelMinusRegX + x, posMinRelMinusRegY + y, posMinRelMinusRegZ + z);
                        BlockPos pos = PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                        pos = pos.offset((Vec3i)totalRegionPosTransformed);
                        world.updateNeighborsAt(pos, world.getBlockState(pos).getBlock());
                    }
                }
            }
        }
        return true;
    }

    private static void dumpBlockEntityMap(Map<BlockPos, CompoundTag> teMap) {
        System.out.print("DUMP TE-MAP:\n");
        for (BlockPos pos : teMap.keySet()) {
            CompoundTag nbt = teMap.get(pos);
            System.out.printf("  pos[%s]: %s\n", pos.toShortString(), nbt.toString());
        }
        System.out.print("DUMP TE-MAP -- END\n");
    }

    public static void placeEntitiesToWorldWithinChunk(Level world, ChunkPos chunkPos, List<LitematicaSchematic.EntityInfo> entityList, BlockPos origin, SchematicPlacement schematicPlacement, SubRegionPlacement placement, PasteLayerBehavior layerBehavior) {
        BlockPos regionPos = placement.getPos();
        if (entityList == null) {
            return;
        }
        BlockPos regionPosRelTransformed = PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        int offX = regionPosRelTransformed.getX() + origin.getX();
        int offY = regionPosRelTransformed.getY() + origin.getY();
        int offZ = regionPosRelTransformed.getZ() + origin.getZ();
        double minX = chunkPos.x() << 4;
        double minZ = chunkPos.z() << 4;
        double maxX = (chunkPos.x() << 4) + 16;
        double maxZ = (chunkPos.z() << 4) + 16;
        Rotation rotationCombined = schematicPlacement.getRotation().getRotated(placement.getRotation());
        Mirror mirrorMain = schematicPlacement.getMirror();
        Mirror mirrorSub = placement.getMirror();
        if (mirrorSub != Mirror.NONE && (schematicPlacement.getRotation() == Rotation.CLOCKWISE_90 || schematicPlacement.getRotation() == Rotation.COUNTERCLOCKWISE_90)) {
            mirrorSub = mirrorSub == Mirror.FRONT_BACK ? Mirror.LEFT_RIGHT : Mirror.FRONT_BACK;
        }
        for (LitematicaSchematic.EntityInfo info : entityList) {
            ItemFrame frameEntity;
            LivingEntity living;
            Vec3 pos = info.posVec();
            pos = PositionUtils.getTransformedPosition(pos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
            pos = PositionUtils.getTransformedPosition(pos, placement.getMirror(), placement.getRotation());
            double x = pos.x + (double)offX;
            double y = pos.y + (double)offY;
            double z = pos.z + (double)offZ;
            float[] origRot = new float[2];
            if (!SchematicPlacingUtils.shouldPasteEntity(new Vec3(x, y, z), layerBehavior) || !(x >= minX) || !(x < maxX) || !(z >= minZ) || !(z < maxZ)) continue;
            CompoundTag tag = info.nbt().copy();
            String id = tag.getStringOr("id", "");
            if (id.equals("minecraft:glow_item_frame") || id.equals("minecraft:item_frame") || id.equals("minecraft:leash_knot") || id.equals("minecraft:painting")) {
                Vec3 p = NbtUtils.readEntityPositionFromTag((CompoundTag)tag);
                if (p == null) {
                    p = new Vec3(x, y, z);
                    NbtUtils.putVec3dCodec((CompoundTag)tag, (Vec3)p, (String)"Pos");
                }
                tag.putInt("TileX", (int)p.x);
                tag.putInt("TileY", (int)p.y);
                tag.putInt("TileZ", (int)p.z);
                BlockPos px = tag.read("block_pos", BlockPos.CODEC).orElse(null);
                if (px != null) {
                    tag.store("block_pos", BlockPos.CODEC, (Object)new BlockPos((int)x, (int)y, (int)z));
                }
            }
            ListTag rotation = tag.getListOrEmpty("Rotation");
            origRot[0] = rotation.getFloatOr(0, 0.0f);
            origRot[1] = rotation.getFloatOr(1, 0.0f);
            Entity entity = EntityUtils.createEntityAndPassengersFromNBT(tag, world);
            if (entity == null) continue;
            SchematicPlacingUtils.rotateEntity(entity, x, y, z, rotationCombined, mirrorMain, mirrorSub);
            if (entity instanceof LivingEntity && (living = (LivingEntity)entity).isSleeping()) {
                living.setSleepingPos(BlockPos.containing((double)x, (double)y, (double)z));
            }
            if (entity instanceof Painting) {
                Painting paintingEntity = (Painting)entity;
                Direction right = paintingEntity.getDirection().getCounterClockWise();
                if (((PaintingVariant)paintingEntity.getVariant().value()).width() % 2 == 0 && right.getAxisDirection() == Direction.AxisDirection.POSITIVE) {
                    x -= 1.0 * (double)right.getStepX();
                    z -= 1.0 * (double)right.getStepZ();
                }
                if (((PaintingVariant)paintingEntity.getVariant().value()).height() % 2 == 0) {
                    y -= 1.0;
                }
                entity.setPos(x, y, z);
            }
            if (entity instanceof ItemFrame && (frameEntity = (ItemFrame)entity).getYRot() != origRot[0] && (frameEntity.getXRot() == 90.0f || frameEntity.getXRot() == -90.0f)) {
                frameEntity.setYRot(origRot[0]);
            }
            EntityUtils.spawnEntityAndPassengersInWorld(entity, world);
            if (!(entity instanceof Display)) continue;
            entity.tick();
        }
    }

    public static void rotateEntity(Entity entity, double x, double y, double z, Rotation rotationCombined, Mirror mirrorMain, Mirror mirrorSub) {
        float rotationYaw = entity.getYRot();
        if (mirrorMain != Mirror.NONE) {
            rotationYaw = entity.mirror(mirrorMain);
        }
        if (mirrorSub != Mirror.NONE) {
            rotationYaw = entity.mirror(mirrorSub);
        }
        if (rotationCombined != Rotation.NONE) {
            rotationYaw += entity.getYRot() - entity.rotate(rotationCombined);
        }
        entity.snapTo(x, y, z, rotationYaw, entity.getXRot());
        EntityUtils.setEntityRotations(entity, rotationYaw, entity.getXRot());
    }

    public static boolean shouldPasteBlock(BlockPos pos, PasteLayerBehavior layerBehavior) {
        if (layerBehavior == PasteLayerBehavior.ALL) {
            return true;
        }
        return DataManager.getRenderLayerRange().isPositionWithinRange(pos);
    }

    public static boolean shouldPasteEntity(Vec3 pos, PasteLayerBehavior layerBehavior) {
        if (layerBehavior == PasteLayerBehavior.ALL) {
            return true;
        }
        return DataManager.getRenderLayerRange().isPositionWithinRange((int)pos.x(), (int)pos.y(), (int)pos.z());
    }
}

