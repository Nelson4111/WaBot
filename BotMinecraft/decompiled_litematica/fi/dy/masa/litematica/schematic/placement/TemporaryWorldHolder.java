/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  org.apache.commons.lang3.tuple.Pair
 *  org.jspecify.annotations.Nullable
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.ChunkManagerSchematic;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import org.apache.commons.lang3.tuple.Pair;
import org.jspecify.annotations.Nullable;

public class TemporaryWorldHolder
implements AutoCloseable {
    private WorldSchematic world = null;
    private BlockPos origin = BlockPos.ZERO;
    private Vec3i size = BlockPos.ZERO;
    private List<Pair<Integer, Integer>> chunks = new ArrayList<Pair<Integer, Integer>>();

    protected TemporaryWorldHolder() {
    }

    protected TemporaryWorldHolder(BlockPos origin, Vec3i size) {
        this();
        this.createWorld();
        this.calculateChunks(origin, size);
    }

    protected void createWorld() {
        this.world = SchematicWorldHandler.createSchematicWorld(null);
    }

    protected void calculateChunks(BlockPos origin, Vec3i size) throws IllegalArgumentException {
        this.ensureWorld();
        this.chunks = new ArrayList<Pair<Integer, Integer>>();
        this.origin = origin;
        this.size = size;
        BlockPos posEnd = origin.offset((Vec3i)PositionUtils.getRelativeEndPositionFromAreaSize(size));
        BlockPos posMin = PositionUtils.getMinCorner(origin, posEnd);
        BlockPos posMax = PositionUtils.getMaxCorner(origin, posEnd);
        int cxMin = posMin.getX() >> 4;
        int czMin = posMin.getZ() >> 4;
        int cxMax = posMax.getX() >> 4;
        int czMax = posMax.getZ() >> 4;
        for (int cz = czMin; cz <= czMax; ++cz) {
            for (int cx = cxMin; cx <= cxMax; ++cx) {
                this.chunkManager().loadChunk(cx, cz);
                this.chunks.add((Pair<Integer, Integer>)Pair.of((Object)cx, (Object)cz));
            }
        }
    }

    public boolean hasWorld() {
        return this.world != null;
    }

    public boolean isEmpty() {
        return this.chunks.isEmpty();
    }

    public @Nullable WorldSchematic world() {
        return this.world;
    }

    public BlockPos origin() {
        return this.origin;
    }

    public Vec3i size() {
        return this.size;
    }

    public List<Pair<Integer, Integer>> chunkList() {
        return this.chunks;
    }

    protected @Nullable ChunkManagerSchematic chunkManager() throws IllegalStateException {
        this.ensureWorld();
        return this.world.getChunkSource();
    }

    private void ensureWorld() throws IllegalStateException {
        if (this.world == null) {
            throw new IllegalStateException("TemporaryWorldHolder: No World!");
        }
    }

    protected void clear() {
        this.chunks.clear();
        this.origin = BlockPos.ZERO;
        this.size = BlockPos.ZERO;
        if (this.world != null) {
            this.world.clearEntities();
            try {
                this.world.close();
            }
            catch (Exception exception) {
                // empty catch block
            }
            this.world = null;
        }
    }

    @Override
    public void close() throws Exception {
        this.clear();
    }
}

