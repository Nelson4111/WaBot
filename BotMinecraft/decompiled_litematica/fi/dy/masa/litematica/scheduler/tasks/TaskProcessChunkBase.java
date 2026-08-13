/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ArrayListMultimap
 *  fi.dy.masa.malilib.util.LayerMode
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.WorldUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.ArrayListMultimap;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskBase;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.LayerMode;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.WorldUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.function.BiConsumer;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;

public abstract class TaskProcessChunkBase
extends TaskBase {
    protected final ArrayListMultimap<ChunkPos, IntBoundingBox> boxesInChunks = ArrayListMultimap.create();
    protected final ArrayList<ChunkPos> pendingChunks = new ArrayList();
    protected final ClientLevel clientWorld;
    protected final WorldSchematic schematicWorld;
    protected final Level world;
    protected final boolean isClientWorld;
    protected PositionUtils.ChunkPosComparator comparator = new PositionUtils.ChunkPosComparator();

    protected TaskProcessChunkBase(String nameOnHud) {
        this.clientWorld = this.mc.level;
        this.world = WorldUtils.getBestWorld((Minecraft)this.mc);
        this.schematicWorld = SchematicWorldHandler.getSchematicWorld();
        this.isClientWorld = this.world == this.mc.level;
        this.name = StringUtils.translate((String)nameOnHud, (Object[])new Object[0]);
        this.comparator.setClosestFirst(true);
        InfoHud.getInstance().addInfoHudRenderer(this, true);
    }

    @Override
    public boolean execute(ProfilerFiller profiler) {
        return this.executeForAllPendingChunks(profiler);
    }

    @Override
    public void stop() {
        if (this.isClientWorld) {
            this.onStop();
        } else {
            this.mc.execute(this::onStop);
        }
    }

    protected void onStop() {
        this.notifyListener();
    }

    protected abstract boolean canProcessChunk(ChunkPos var1);

    protected boolean processChunk(ChunkPos pos) {
        return true;
    }

    protected boolean executeForAllPendingChunks(ProfilerFiller profiler) {
        profiler.push("process_chunks");
        Iterator<ChunkPos> iterator = this.pendingChunks.iterator();
        int processed = 0;
        while (iterator.hasNext()) {
            ChunkPos pos = iterator.next();
            profiler.push("process_chunk");
            if (this.canProcessChunk(pos) && this.processChunk(pos)) {
                iterator.remove();
                ++processed;
            }
            profiler.pop();
        }
        if (processed > 0) {
            this.updateInfoHudLinesPendingChunks(this.pendingChunks);
        }
        this.finished = this.pendingChunks.isEmpty();
        profiler.pop();
        return this.finished;
    }

    protected void addPerChunkBoxes(Collection<Box> allBoxes) {
        this.addPerChunkBoxes(allBoxes, new LayerRange(null));
    }

    protected void addPerChunkBoxes(Collection<Box> allBoxes, LayerRange range) {
        this.boxesInChunks.clear();
        this.pendingChunks.clear();
        if (range.getLayerMode() == LayerMode.ALL) {
            PositionUtils.getPerChunkBoxes(allBoxes, this::clampToWorldHeightAndAddBox);
        } else {
            PositionUtils.getLayerRangeClampedPerChunkBoxes(allBoxes, range, this::clampToWorldHeightAndAddBox);
        }
        this.pendingChunks.addAll(this.boxesInChunks.keySet());
        this.sortChunkList();
    }

    protected void clampToWorldHeightAndAddBox(ChunkPos pos, IntBoundingBox box) {
        if ((box = PositionUtils.clampBoxToWorldHeightRange(box, (Level)this.clientWorld)) != null) {
            this.boxesInChunks.put((Object)pos, (Object)box);
        }
    }

    protected void addNonChunkClampedBoxes(Collection<Box> allBoxes) {
        this.addNonChunkClampedBoxes(allBoxes, new LayerRange(null));
    }

    protected void addNonChunkClampedBoxes(Collection<Box> allBoxes, LayerRange range) {
        this.boxesInChunks.clear();
        this.pendingChunks.clear();
        if (range.getLayerMode() == LayerMode.ALL) {
            TaskProcessChunkBase.addBoxes(allBoxes, this::clampToWorldHeightAndAddBox);
        } else {
            TaskProcessChunkBase.getLayerRangeClampedBoxes(allBoxes, range, this::clampToWorldHeightAndAddBox);
        }
        this.pendingChunks.addAll(this.boxesInChunks.keySet());
        this.sortChunkList();
    }

    protected static void addBoxes(Collection<Box> boxes, BiConsumer<ChunkPos, IntBoundingBox> consumer) {
        for (Box box : boxes) {
            int boxMinX = Math.min(box.getPos1().getX(), box.getPos2().getX());
            int boxMinY = Math.min(box.getPos1().getY(), box.getPos2().getY());
            int boxMinZ = Math.min(box.getPos1().getZ(), box.getPos2().getZ());
            int boxMaxX = Math.max(box.getPos1().getX(), box.getPos2().getX());
            int boxMaxY = Math.max(box.getPos1().getY(), box.getPos2().getY());
            int boxMaxZ = Math.max(box.getPos1().getZ(), box.getPos2().getZ());
            consumer.accept(new ChunkPos(boxMinX >> 4, boxMinZ >> 4), new IntBoundingBox(boxMinX, boxMinY, boxMinZ, boxMaxX, boxMaxY, boxMaxZ));
        }
    }

    protected static void getLayerRangeClampedBoxes(Collection<Box> boxes, LayerRange range, BiConsumer<ChunkPos, IntBoundingBox> consumer) {
        block5: for (Box box : boxes) {
            int rangeMin = range.getMinLayerBoundary();
            int rangeMax = range.getMaxLayerBoundary();
            int boxMinX = Math.min(box.getPos1().getX(), box.getPos2().getX());
            int boxMinY = Math.min(box.getPos1().getY(), box.getPos2().getY());
            int boxMinZ = Math.min(box.getPos1().getZ(), box.getPos2().getZ());
            int boxMaxX = Math.max(box.getPos1().getX(), box.getPos2().getX());
            int boxMaxY = Math.max(box.getPos1().getY(), box.getPos2().getY());
            int boxMaxZ = Math.max(box.getPos1().getZ(), box.getPos2().getZ());
            switch (range.getAxis()) {
                case X: {
                    if (rangeMax < boxMinX || rangeMin > boxMaxX) continue block5;
                    boxMinX = Math.max(boxMinX, rangeMin);
                    boxMaxX = Math.min(boxMaxX, rangeMax);
                    break;
                }
                case Y: {
                    if (rangeMax < boxMinY || rangeMin > boxMaxY) continue block5;
                    boxMinY = Math.max(boxMinY, rangeMin);
                    boxMaxY = Math.min(boxMaxY, rangeMax);
                    break;
                }
                case Z: {
                    if (rangeMax < boxMinZ || rangeMin > boxMaxZ) continue block5;
                    boxMinZ = Math.max(boxMinZ, rangeMin);
                    boxMaxZ = Math.min(boxMaxZ, rangeMax);
                }
            }
            consumer.accept(new ChunkPos(boxMinX >> 4, boxMinZ >> 4), new IntBoundingBox(boxMinX, boxMinY, boxMinZ, boxMaxX, boxMaxY, boxMaxZ));
        }
    }

    protected List<IntBoundingBox> getBoxesInChunk(ChunkPos pos) {
        return this.boxesInChunks.get((Object)pos);
    }

    protected void sortChunkList() {
        if (this.pendingChunks.size() > 0) {
            if (this.mc.player != null) {
                this.comparator.setReferencePosition(this.mc.player.blockPosition());
                this.pendingChunks.sort(this.comparator);
            }
            this.updateInfoHudLines();
            this.onChunkListSorted();
        }
    }

    protected void onChunkListSorted() {
    }

    protected void updateInfoHudLines() {
        this.updateInfoHudLinesPendingChunks(this.pendingChunks);
    }
}

