/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.IndexType
 *  com.mojang.blaze3d.vertex.MeshData
 *  com.mojang.blaze3d.vertex.MeshData$SortState
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.client.renderer.chunk.VisGraph
 *  net.minecraft.client.renderer.chunk.VisibilitySet
 *  net.minecraft.core.Direction
 *  net.minecraft.util.Util
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  org.apache.logging.log4j.Logger
 *  org.jspecify.annotations.NonNull
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.IndexType;
import com.mojang.blaze3d.vertex.MeshData;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.render.schematic.ChunkMeshCache;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.client.renderer.chunk.VisGraph;
import net.minecraft.client.renderer.chunk.VisibilitySet;
import net.minecraft.core.Direction;
import net.minecraft.util.Util;
import net.minecraft.world.level.block.entity.BlockEntity;
import org.apache.logging.log4j.Logger;
import org.jspecify.annotations.NonNull;

public class ChunkMeshDataSchematic
implements AutoCloseable {
    private static final Logger LOGGER = Litematica.LOGGER;
    public static final Comparator<ChunkMeshDataSchematic> COMPARATOR = new MeshDataComparator();
    public static final ChunkMeshDataSchematic UNCOMPILED = new ChunkMeshDataSchematic(){

        @Override
        public boolean canSeeEachOther(Direction direction1, Direction direction2) {
            return false;
        }
    };
    public static final ChunkMeshDataSchematic EMPTY = new ChunkMeshDataSchematic(){

        @Override
        protected void saveMeshData(ChunkSectionLayer layer, @NonNull MeshData meshData) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void saveMeshData(OverlayRenderType type, @NonNull MeshData meshData) {
            throw new UnsupportedOperationException();
        }

        @Override
        public boolean canSeeEachOther(Direction direction1, Direction direction2) {
            throw new UnsupportedOperationException();
        }

        @Override
        public boolean isEmpty() {
            return true;
        }

        @Override
        protected void addBlockEntity(BlockEntity be) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void addNoCullBlockEntity(BlockEntity be) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void setTransparentSortingDataForBlockLayer(ChunkSectionLayer layer, // Could not load outer class - annotation placement on inner may be incorrect
        @NonNull MeshData.SortState transparentSortingData) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void setTransparentSortingDataForOverlay(OverlayRenderType type, // Could not load outer class - annotation placement on inner may be incorrect
        @NonNull MeshData.SortState transparentSortingData) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void compileLayerDrawStates(Set<ChunkSectionLayer> blockLayersUsed) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void compileOverlayDrawStates(Set<OverlayRenderType> overlaysUsed) {
            throw new UnsupportedOperationException();
        }

        @Override
        protected void updateVisibility(VisGraph visGraph) {
            throw new UnsupportedOperationException();
        }
    };
    private final ChunkMeshCache chunkMeshCache = new ChunkMeshCache();
    private final HashMap<ChunkSectionLayer, DrawState> blockDrawStates;
    private final HashMap<OverlayRenderType, DrawState> overlayDrawStates;
    private final Map<ChunkSectionLayer, AtomicBoolean> blockVboUploaded;
    private final Map<ChunkSectionLayer, AtomicBoolean> blockIboUploaded;
    private final Map<OverlayRenderType, AtomicBoolean> overlayVboUploaded;
    private final Map<OverlayRenderType, AtomicBoolean> overlayIboUploaded;
    private final Map<ChunkSectionLayer, MeshData.SortState> blockSortingData;
    private final Map<OverlayRenderType, MeshData.SortState> overlaySortingData;
    private final List<BlockEntity> blockEntities = new ArrayList<BlockEntity>();
    private final List<BlockEntity> noCullBlockEntities = new ArrayList<BlockEntity>();
    private VisibilitySet visibility = new VisibilitySet();
    private long timeBuilt = 0L;

    protected ChunkMeshDataSchematic() {
        this.blockSortingData = new HashMap<ChunkSectionLayer, MeshData.SortState>();
        this.blockDrawStates = new HashMap();
        this.blockVboUploaded = Util.makeEnumMap(ChunkSectionLayer.class, layer -> new AtomicBoolean());
        this.blockIboUploaded = Util.makeEnumMap(ChunkSectionLayer.class, layer -> new AtomicBoolean());
        this.overlaySortingData = new HashMap<OverlayRenderType, MeshData.SortState>();
        this.overlayDrawStates = new HashMap();
        this.overlayVboUploaded = Util.makeEnumMap(OverlayRenderType.class, type -> new AtomicBoolean());
        this.overlayIboUploaded = Util.makeEnumMap(OverlayRenderType.class, type -> new AtomicBoolean());
    }

    protected ChunkMeshCache getChunkMeshCache() {
        return this.chunkMeshCache;
    }

    protected void saveMeshData(ChunkSectionLayer layer, @Nonnull MeshData meshData) {
        this.chunkMeshCache.saveMeshData(layer, meshData);
    }

    protected void saveMeshData(OverlayRenderType type, @Nonnull MeshData meshData) {
        this.chunkMeshCache.saveMeshData(type, meshData);
    }

    protected boolean hasMeshData(ChunkSectionLayer layer) {
        return this.chunkMeshCache.hasMeshData(layer);
    }

    protected boolean hasMeshData(OverlayRenderType type) {
        return this.chunkMeshCache.hasMeshData(type);
    }

    @Nullable
    protected MeshData getMeshDataOrNull(ChunkSectionLayer layer) {
        return this.chunkMeshCache.getMeshDataOrNull(layer);
    }

    @Nullable
    protected MeshData getMeshDataOrNull(OverlayRenderType type) {
        return this.chunkMeshCache.getMeshDataOrNull(type);
    }

    private void closeChunkMeshCache() {
        this.chunkMeshCache.closeAll();
    }

    public boolean canSeeEachOther(Direction direction1, Direction direction2) {
        return this.visibility.visibilityBetween(direction1, direction2);
    }

    public boolean isEmpty() {
        return this.blockDrawStates.isEmpty() && this.overlayDrawStates.isEmpty() && this.blockEntities.isEmpty() && this.noCullBlockEntities.isEmpty() && this.timeBuilt < 1L;
    }

    public List<BlockEntity> getBlockEntities() {
        return this.blockEntities;
    }

    public List<BlockEntity> getNoCullBlockEntities() {
        return this.noCullBlockEntities;
    }

    protected void addBlockEntity(BlockEntity be) {
        this.blockEntities.add(be);
    }

    protected void addNoCullBlockEntity(BlockEntity be) {
        this.noCullBlockEntities.add(be);
    }

    public boolean hasTransparentSortingDataForBlockLayer(ChunkSectionLayer layer) {
        return this.blockSortingData.get(layer) != null;
    }

    protected void setTransparentSortingDataForBlockLayer(ChunkSectionLayer layer, @Nonnull MeshData.SortState transparentSortingData) {
        this.blockSortingData.put(layer, transparentSortingData);
    }

    protected MeshData.SortState getTransparentSortingDataForBlockLayer(ChunkSectionLayer layer) {
        return this.blockSortingData.get(layer);
    }

    public boolean hasTransparentSortingDataForOverlay(OverlayRenderType type) {
        return this.overlaySortingData.get((Object)type) != null;
    }

    protected void setTransparentSortingDataForOverlay(OverlayRenderType type, @Nonnull MeshData.SortState transparentSortingData) {
        this.overlaySortingData.put(type, transparentSortingData);
    }

    @Nullable
    protected MeshData.SortState getTransparentSortingDataForOverlay(OverlayRenderType type) {
        return this.overlaySortingData.get((Object)type);
    }

    protected void compileLayerDrawStates(Set<ChunkSectionLayer> blockLayersUsed) {
        this.blockDrawStates.clear();
        for (ChunkSectionLayer layer : blockLayersUsed) {
            MeshData meshData = this.getMeshDataOrNull(layer);
            if (meshData == null) continue;
            this.blockDrawStates.put(layer, new DrawState(meshData.drawState().indexCount(), meshData.drawState().indexType(), meshData.indexBuffer() != null));
        }
    }

    protected void compileOverlayDrawStates(Set<OverlayRenderType> overlaysUsed) {
        this.overlayDrawStates.clear();
        for (OverlayRenderType type : overlaysUsed) {
            MeshData meshData = this.getMeshDataOrNull(type);
            if (meshData == null) continue;
            this.overlayDrawStates.put(type, new DrawState(meshData.drawState().indexCount(), meshData.drawState().indexType(), meshData.indexBuffer() != null));
        }
    }

    @Nullable
    public DrawState getDrawState(ChunkSectionLayer layer) {
        return this.blockDrawStates.get(layer);
    }

    @Nullable
    public DrawState getDrawState(OverlayRenderType type) {
        return this.overlayDrawStates.get((Object)type);
    }

    public boolean hasVBOUpload(ChunkSectionLayer layer) {
        return this.blockVboUploaded.get(layer).get();
    }

    public boolean hasIBOUpload(ChunkSectionLayer layer) {
        return this.blockIboUploaded.get(layer).get();
    }

    public boolean hasVBOUpload(OverlayRenderType type) {
        return this.overlayVboUploaded.get((Object)type).get();
    }

    public boolean hasIBOUpload(OverlayRenderType type) {
        return this.overlayIboUploaded.get((Object)type).get();
    }

    public void markVBOUploaded(ChunkSectionLayer layer) {
        this.blockVboUploaded.get(layer).set(true);
    }

    public void markIBOUploaded(ChunkSectionLayer layer) {
        this.blockIboUploaded.get(layer).set(true);
    }

    public void markVBOUploaded(OverlayRenderType type) {
        this.overlayVboUploaded.get((Object)type).set(true);
    }

    public void markIBOUploaded(OverlayRenderType type) {
        this.overlayIboUploaded.get((Object)type).set(true);
    }

    public VisibilitySet getVisibility() {
        return this.visibility;
    }

    protected void updateVisibility(VisGraph visGraph) {
        this.visibility = visGraph.resolve();
    }

    protected void setTimeBuilt(long time) {
        this.timeBuilt = time;
    }

    public long getTimeBuilt() {
        return this.timeBuilt;
    }

    protected void clearTileCache() {
        this.blockEntities.clear();
        this.noCullBlockEntities.clear();
    }

    protected void clearAll() {
        this.closeChunkMeshCache();
        this.blockDrawStates.clear();
        this.blockSortingData.clear();
        this.blockVboUploaded.clear();
        this.blockIboUploaded.clear();
        this.overlayDrawStates.clear();
        this.overlaySortingData.clear();
        this.overlayVboUploaded.clear();
        this.overlayIboUploaded.clear();
        this.blockEntities.clear();
        this.noCullBlockEntities.clear();
        this.timeBuilt = 0L;
    }

    protected void dumpMeshDataDebug() {
        if (this.isEmpty()) {
            System.out.print("[Mesh] ChunkMeshDataSchematic --> EMPTY\n");
        } else {
            System.out.printf("[Mesh] ChunkMeshDataSchematic; timeBuilt: [%d]\n", this.getTimeBuilt());
        }
        System.out.printf("  [BLOCK_STATES]  : %d\n", this.blockDrawStates.size());
        System.out.printf("  [OVERLAY_STATES]: %d\n", this.overlayDrawStates.size());
        System.out.printf("  [TILE_COUNT]   : %d\n", this.blockEntities.size());
        System.out.printf("  [TILES_NO_CULL]: %d\n", this.noCullBlockEntities.size());
    }

    @Override
    public void close() throws Exception {
        this.clearAll();
    }

    public record DrawState(int indexCount, IndexType indexType, boolean hasIndexBuffer) {
    }

    public static class MeshDataComparator
    implements Comparator<ChunkMeshDataSchematic> {
        @Override
        public int compare(ChunkMeshDataSchematic o1, ChunkMeshDataSchematic o2) {
            if (o1.isEmpty()) {
                return 1;
            }
            if (o2.isEmpty()) {
                return -1;
            }
            int timeCompare = Long.compare(o1.timeBuilt, o2.timeBuilt);
            if (timeCompare != 0) {
                return -timeCompare;
            }
            int blockStates = Integer.compare(o1.blockDrawStates.size(), o2.blockDrawStates.size());
            int overlayStates = Integer.compare(o1.overlayDrawStates.size(), o2.overlayDrawStates.size());
            if (blockStates != 0 || overlayStates != 0) {
                return blockStates > 0 ? 1 : overlayStates;
            }
            int tileEntities = Integer.compare(o1.blockEntities.size(), o2.blockEntities.size());
            int noCullBlocks = Integer.compare(o1.noCullBlockEntities.size(), o2.noCullBlockEntities.size());
            if (tileEntities != 0 || noCullBlocks != 0) {
                return tileEntities > 0 ? 1 : noCullBlocks;
            }
            return 0;
        }
    }
}

