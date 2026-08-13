/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.nbt.NbtUtils
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  javax.annotation.Nonnull
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Direction$AxisDirection
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.world.Container
 *  net.minecraft.world.entity.Display
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.decoration.ItemFrame
 *  net.minecraft.world.entity.decoration.painting.Painting
 *  net.minecraft.world.entity.decoration.painting.PaintingVariant
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.Mirror
 *  net.minecraft.world.level.block.Rotation
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.ChestType
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.phys.Vec3
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.litematica.world.ChunkSchematicState;
import fi.dy.masa.litematica.world.ProtoChunkSchematic;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.malilib.util.nbt.NbtUtils;
import fi.dy.masa.malilib.util.nbt.NbtView;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nonnull;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.world.Container;
import net.minecraft.world.entity.Display;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.decoration.painting.Painting;
import net.minecraft.world.entity.decoration.painting.PaintingVariant;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.Mirror;
import net.minecraft.world.level.block.Rotation;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.ChestType;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.phys.Vec3;
import org.apache.commons.lang3.tuple.Pair;

public class WorldPlacingUtils {
    public static ProtoChunkSchematic placeToProtoChunk(@Nonnull ProtoChunkSchematic chunk, ChunkPos chunkPos, SchematicPlacement schematicPlacement) {
        ProtoChunkSchematic filledChunk = null;
        LitematicaSchematic schematic = schematicPlacement.getSchematic();
        Set<String> regionsTouchingChunk = schematicPlacement.getRegionsTouchingChunk(chunkPos.x(), chunkPos.z());
        BlockPos origin = schematicPlacement.getOrigin();
        boolean allSuccess = true;
        try {
            for (String regionName : regionsTouchingChunk) {
                LitematicaBlockStateContainer container = schematic.getSubRegionContainer(regionName);
                if (container == null) {
                    allSuccess = false;
                    continue;
                }
                SubRegionPlacement placement = schematicPlacement.getRelativeSubRegionPlacement(regionName);
                if (placement == null || !placement.isEnabled()) continue;
                Map<BlockPos, CompoundTag> blockEntityMap = schematic.getBlockEntityMapForRegion(regionName);
                filledChunk = WorldPlacingUtils.placeBlocksToProtoChunk(chunk, chunkPos, regionName, container, blockEntityMap, origin, schematicPlacement, placement);
                if (filledChunk == null) {
                    allSuccess = false;
                    Litematica.LOGGER.warn("Invalid/missing schematic data in schematic '{}' for sub-region '{}'", (Object)schematic.getMetadata().getName(), (Object)regionName);
                }
                List<LitematicaSchematic.EntityInfo> entityList = schematic.getEntityListForRegion(regionName);
                if (filledChunk == null || schematicPlacement.ignoreEntities() || placement.ignoreEntities() || entityList == null) continue;
                filledChunk = WorldPlacingUtils.prepareEntitiesInProtoChunk(filledChunk, chunkPos, entityList, origin, schematicPlacement, placement);
            }
        }
        catch (Exception exception) {
            // empty catch block
        }
        if (allSuccess) {
            return filledChunk;
        }
        return null;
    }

    public static ProtoChunkSchematic placeBlocksToProtoChunk(@Nonnull ProtoChunkSchematic chunk, ChunkPos chunkPos, String regionName, LitematicaBlockStateContainer container, Map<BlockPos, CompoundTag> blockEntityMap, BlockPos origin, SchematicPlacement schematicPlacement, SubRegionPlacement placement) {
        ReplaceBehavior replace = (ReplaceBehavior)Configs.Generic.PLACEMENT_REPLACE_BEHAVIOR.getOptionListValue();
        IntBoundingBox bounds = schematicPlacement.getBoxWithinChunkForRegion(regionName, chunkPos.x(), chunkPos.z());
        Vec3i regionSize = schematicPlacement.getSchematic().getAreaSizeAsVec3i(regionName);
        if (bounds == null || container == null || blockEntityMap == null || regionSize == null) {
            return null;
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
            return null;
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
        for (int y = 0; y <= endY; ++y) {
            for (int z = startZ; z <= endZ; ++z) {
                for (int x = startX; x <= endX; ++x) {
                    BlockEntity te;
                    BlockState state = container.get(x, y, z);
                    if (state.getBlock() == Blocks.STRUCTURE_VOID) continue;
                    posMutable.set(x, y, z);
                    CompoundTag teNBT = blockEntityMap.get(posMutable);
                    BlockPos origPos = posMutable.immutable();
                    posMutable.set(posMinRelMinusRegX + x, posMinRelMinusRegY + y, posMinRelMinusRegZ + z);
                    BlockPos pos = PositionUtils.getTransformedPlacementPosition((BlockPos)posMutable, schematicPlacement, placement);
                    pos = pos.offset((Vec3i)totalRegionPosTransformed);
                    BlockState stateOld = chunk.getBlockState(pos);
                    if (replace == ReplaceBehavior.NONE && !stateOld.isAir() || replace == ReplaceBehavior.WITH_NON_AIR && state.isAir()) continue;
                    if (state.hasBlockEntity() && state.is((Object)Blocks.CHEST) && !ignoreInventories && mirrorMain != Mirror.NONE && state.getValue((Property)ChestBlock.TYPE) != ChestType.SINGLE && Configs.Generic.FIX_CHEST_MIRROR.getBooleanValue()) {
                        Direction facingAdj;
                        BlockPos posAdj;
                        Direction facing = (Direction)state.getValue((Property)ChestBlock.FACING);
                        Direction.Axis axis = facing.getAxis();
                        ChestType type = ((ChestType)state.getValue((Property)ChestBlock.TYPE)).getOpposite();
                        if (mirrorMain != Mirror.NONE && axis != Direction.Axis.Y && blockEntityMap.containsKey(posAdj = origPos.relative(facingAdj = type == ChestType.LEFT ? facing.getCounterClockWise(Direction.Axis.Y) : facing.getClockWise(Direction.Axis.Y)))) {
                            teNBT = blockEntityMap.getOrDefault(posAdj, teNBT).copy();
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
                    if ((te = chunk.getBlockEntity(pos)) != null) {
                        if (te instanceof Container) {
                            ((Container)te).clearContent();
                        }
                        chunk.setBlockState(pos, barrier, 20);
                    }
                    chunk.setBlockState(pos, state, 18);
                    if (teNBT == null || (te = chunk.createBlockEntity(pos)) == null) continue;
                    teNBT = teNBT.copy();
                    teNBT.putInt("x", pos.getX());
                    teNBT.putInt("y", pos.getY());
                    teNBT.putInt("z", pos.getZ());
                    if (ignoreInventories) {
                        teNBT.remove("Items");
                    }
                    try {
                        NbtView view = NbtView.getReader((CompoundTag)teNBT, (RegistryAccess)SchematicWorldHandler.INSTANCE.getRegistryManager());
                        te.loadWithComponents(view.getReader());
                        if (ignoreInventories && te instanceof Container) {
                            ((Container)te).clearContent();
                        }
                    }
                    catch (Exception e) {
                        Litematica.LOGGER.warn("Failed to load BlockEntity data for {} @ {}", (Object)state, (Object)pos);
                    }
                    chunk.setBlockEntity(te);
                }
            }
        }
        if (!chunk.getState().atLeast(ChunkSchematicState.FILLED)) {
            chunk.setState(ChunkSchematicState.FILLED);
        }
        return chunk;
    }

    public static ProtoChunkSchematic prepareEntitiesInProtoChunk(@Nonnull ProtoChunkSchematic chunk, ChunkPos chunkPos, List<LitematicaSchematic.EntityInfo> entityList, BlockPos origin, SchematicPlacement schematicPlacement, SubRegionPlacement placement) {
        BlockPos regionPos = placement.getPos();
        if (entityList == null) {
            return chunk;
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
            Vec3 pos = info.posVec();
            pos = PositionUtils.getTransformedPosition(pos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
            pos = PositionUtils.getTransformedPosition(pos, placement.getMirror(), placement.getRotation());
            double x = pos.x + (double)offX;
            double y = pos.y + (double)offY;
            double z = pos.z + (double)offZ;
            float[] origRot = new float[2];
            if (!(x >= minX) || !(x < maxX) || !(z >= minZ) || !(z < maxZ)) continue;
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
                tag.read("block_pos", BlockPos.CODEC).ifPresent(px -> tag.store("block_pos", BlockPos.CODEC, (Object)new BlockPos((int)x, (int)y, (int)z)));
            }
            ListTag rotation = tag.getListOrEmpty("Rotation");
            origRot[0] = rotation.getFloatOr(0, 0.0f);
            origRot[1] = rotation.getFloatOr(1, 0.0f);
            chunk.addEntityPairForLater((Pair<EntityPosAndRot, CompoundTag>)Pair.of((Object)((Object)new EntityPosAndRot(x, y, z, rotationCombined, mirrorMain, mirrorSub, origRot)), (Object)tag));
        }
        return chunk;
    }

    public static void spawnEntityToWorldNow(@Nonnull Level world, Pair<EntityPosAndRot, CompoundTag> entityPair) {
        double x = ((EntityPosAndRot)((Object)entityPair.getLeft())).x;
        double y = ((EntityPosAndRot)((Object)entityPair.getLeft())).y;
        double z = ((EntityPosAndRot)((Object)entityPair.getLeft())).z;
        Rotation rotationCombined = ((EntityPosAndRot)((Object)entityPair.getLeft())).rot();
        Mirror mirrorMain = ((EntityPosAndRot)((Object)entityPair.getLeft())).mirrorMain();
        Mirror mirrorSub = ((EntityPosAndRot)((Object)entityPair.getLeft())).mirrorSub();
        float[] origRot = ((EntityPosAndRot)((Object)entityPair.getLeft())).origRot();
        Entity entity = EntityUtils.createEntityAndPassengersFromNBT((CompoundTag)entityPair.getRight(), world);
        if (entity != null) {
            ItemFrame frameEntity;
            LivingEntity living;
            WorldPlacingUtils.rotateEntity(entity, x, y, z, rotationCombined, mirrorMain, mirrorSub);
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
            if (entity instanceof Display) {
                entity.tick();
            }
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

    public record EntityPosAndRot(double x, double y, double z, Rotation rot, Mirror mirrorMain, Mirror mirrorSub, float[] origRot) {
    }
}

