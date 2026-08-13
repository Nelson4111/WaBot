/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.phys.AABB
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTaskRebuild;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.HashSet;
import java.util.List;
import java.util.function.Supplier;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.phys.AABB;

public class PlacementManagerTaskFixer
extends PlacementManagerTask {
    private final Runnable task = this.buildTask();
    int offset;

    protected PlacementManagerTaskFixer(Supplier<WorldSchematic> worldSupplier, int chunkX, int chunkZ, int offset) {
        super(worldSupplier, chunkX, chunkZ);
        this.offset = offset;
    }

    public void run() {
        this.task.run();
    }

    @Override
    protected Runnable buildTask() {
        return () -> {
            HashSet<ChunkPos> loaded = new HashSet<ChunkPos>();
            HashSet<ChunkPos> notLoaded = new HashSet<ChunkPos>();
            int startX = this.pos().x() - this.offset;
            int startZ = this.pos().z() - this.offset;
            int endX = this.pos().x() + this.offset;
            int endZ = this.pos().z() + this.offset;
            ClientLevel clientWorld = Minecraft.getInstance().level;
            if (clientWorld == null) {
                return;
            }
            for (int cx = startX; cx < endX; ++cx) {
                for (int cz = startZ; cz < endZ; ++cz) {
                    ChunkPos cp = new ChunkPos(cx, cz);
                    if (!this.worldSupplier().get().getChunkSource().hasChunk(cx, cz) && DataManager.getSchematicPlacementManager().canHandleChunk(clientWorld, cx, cz)) {
                        Frustum frustum = Minecraft.getInstance().gameRenderer.mainCamera().getCapturedFrustum();
                        if (frustum != null) {
                            int z;
                            int y;
                            BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos(cx << 4, clientWorld.getMinY(), cz << 4);
                            int x = pos.getX();
                            AABB bb = new AABB((double)x, (double)(y = pos.getY()), (double)(z = pos.getZ()), (double)(x + 16), (double)(y + clientWorld.getHeight()), (double)(z + 16));
                            if (!frustum.isVisible(bb)) continue;
                            notLoaded.add(cp);
                            continue;
                        }
                        notLoaded.add(cp);
                        continue;
                    }
                    if (!this.worldSupplier().get().getChunkSource().hasChunk(cx, cz)) continue;
                    loaded.add(cp);
                }
            }
            if (!loaded.isEmpty()) {
                Litematica.debugLog("SchematicPlacementManager//FIXER: checking [{}] loaded chunks", loaded.size());
                loaded.forEach(c -> {
                    List<SchematicPlacement> placements = DataManager.getSchematicPlacementManager().getAllSchematicsTouchingChunk((ChunkPos)c);
                    if (placements.isEmpty()) {
                        DataManager.getSchematicPlacementManager().markChunkForUnload(c.x(), c.z());
                    } else {
                        boolean unload = true;
                        for (SchematicPlacement s : placements) {
                            if (!s.isRenderingEnabled()) continue;
                            unload = false;
                        }
                        if (unload) {
                            DataManager.getSchematicPlacementManager().markChunkForUnload(c.x(), c.z());
                        }
                    }
                });
            }
            if (!notLoaded.isEmpty()) {
                Litematica.debugLog("SchematicPlacementManager//FIXER: checking [{}] unloaded chunks", notLoaded.size());
                notLoaded.forEach(c -> {
                    List<SchematicPlacement> placements = DataManager.getSchematicPlacementManager().getAllSchematicsTouchingChunk((ChunkPos)c);
                    if (c.getChessboardDistance(this.pos()) <= 3) {
                        DataManager.getSchematicPlacementManager().schedulePendingTaskForNextTick(new PlacementManagerTaskRebuild(this.worldSupplier(), c.x(), c.z()));
                    } else if (!placements.isEmpty()) {
                        boolean rebuild = false;
                        for (SchematicPlacement s : placements) {
                            if (!s.isRenderingEnabled()) continue;
                            rebuild = true;
                        }
                        if (rebuild) {
                            DataManager.getSchematicPlacementManager().schedulePendingTaskForNextTick(new PlacementManagerTaskRebuild(this.worldSupplier(), c.x(), c.z()));
                        }
                    }
                });
            }
        };
    }
}

