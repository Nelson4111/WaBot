/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.interfaces.IRangeChangeListener
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.scheduler.tasks;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.materials.IMaterialList;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListUtils;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkBase;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import fi.dy.masa.malilib.interfaces.IRangeChangeListener;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.util.List;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.state.BlockState;

public abstract class TaskCountBlocksBase
extends TaskProcessChunkBase {
    protected final Object2IntOpenHashMap<BlockState> countsTotal = new Object2IntOpenHashMap();
    protected final Object2IntOpenHashMap<BlockState> countsMissing = new Object2IntOpenHashMap();
    protected final Object2IntOpenHashMap<BlockState> countsMismatch = new Object2IntOpenHashMap();
    protected final IMaterialList materialList;
    protected final LayerRange layerRange;

    protected TaskCountBlocksBase(IMaterialList materialList, String nameOnHud) {
        super(nameOnHud);
        this.materialList = materialList;
        this.layerRange = materialList.getMaterialListType() == BlockInfoListType.ALL ? new LayerRange((IRangeChangeListener)SchematicWorldRefresher.INSTANCE) : DataManager.getRenderLayerRange();
    }

    @Override
    protected boolean canProcessChunk(ChunkPos pos) {
        return this.areSurroundingChunksLoaded(pos, this.clientWorld, 0);
    }

    @Override
    protected boolean processChunk(ChunkPos pos) {
        this.countBlocksInChunk(pos);
        return true;
    }

    protected void countBlocksInChunk(ChunkPos pos) {
        LayerRange range = this.layerRange;
        Direction.Axis axis = range.getAxis();
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        for (IntBoundingBox bb : this.getBoxesInChunk(pos)) {
            int startX = axis == Direction.Axis.X ? Math.max(bb.minX(), range.getMinLayerBoundary()) : bb.minX();
            int startY = axis == Direction.Axis.Y ? Math.max(bb.minY(), range.getMinLayerBoundary()) : bb.minY();
            int startZ = axis == Direction.Axis.Z ? Math.max(bb.minZ(), range.getMinLayerBoundary()) : bb.minZ();
            int endX = axis == Direction.Axis.X ? Math.min(bb.maxX(), range.getMaxLayerBoundary()) : bb.maxX();
            int endY = axis == Direction.Axis.Y ? Math.min(bb.maxY(), range.getMaxLayerBoundary()) : bb.maxY();
            int endZ = axis == Direction.Axis.Z ? Math.min(bb.maxZ(), range.getMaxLayerBoundary()) : bb.maxZ();
            for (int y = startY; y <= endY; ++y) {
                for (int z = startZ; z <= endZ; ++z) {
                    for (int x = startX; x <= endX; ++x) {
                        posMutable.set(x, y, z);
                        this.countAtPosition((BlockPos)posMutable);
                    }
                }
            }
        }
    }

    protected abstract void countAtPosition(BlockPos var1);

    @Override
    protected void onStop() {
        if (this.finished && this.isInWorld()) {
            List<MaterialListEntry> list = MaterialListUtils.getMaterialList(this.countsTotal, this.countsMissing, this.countsMismatch, (Player)this.mc.player);
            this.materialList.setMaterialListEntries(list);
        }
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        super.onStop();
    }
}

