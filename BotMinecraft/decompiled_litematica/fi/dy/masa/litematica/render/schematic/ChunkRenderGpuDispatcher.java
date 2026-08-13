/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuUploader;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.world.level.ChunkPos;

public class ChunkRenderGpuDispatcher {
    protected final ConcurrentHashMap<Long, ChunkRenderGpuUploader> uploaders = new ConcurrentHashMap(1024, 0.9f, 2);
    protected final WorldSchematic world;
    protected final IWorldSchematicRenderer renderer;

    protected ChunkRenderGpuDispatcher(WorldSchematic world, IWorldSchematicRenderer renderer) {
        this.world = world;
        this.renderer = renderer;
    }

    protected int size() {
        return this.uploaders.size();
    }

    protected ChunkRenderGpuUploader addOrGetUploader(int cx, int cz) {
        long index = ChunkPos.pack((int)cx, (int)cz);
        try {
            if (!this.uploaders.containsKey(index)) {
                ChunkRenderGpuUploader uploader = new ChunkRenderGpuUploader(this.world, this.renderer);
                uploader.setPosition(cx << 4, this.world.getMinY(), cz << 4);
                this.uploaders.put(index, uploader);
            }
            return this.uploaders.get(index);
        }
        catch (Exception e) {
            if (Reference.DEBUG_MODE) {
                Litematica.debugLog("addOrGetUploader: Exception obtaining a Chunk Uploader; {}", e.getLocalizedMessage());
            }
            return null;
        }
    }

    protected void removeUploader(int cx, int cz) {
        block3: {
            long index = ChunkPos.pack((int)cx, (int)cz);
            try {
                ChunkRenderGpuUploader oldUploader = this.uploaders.remove(index);
                if (oldUploader != null) {
                    oldUploader.clear();
                }
            }
            catch (Exception e) {
                if (!Reference.DEBUG_MODE) break block3;
                Litematica.debugLog("removeUploader: Exception removing a Chunk Uploader; {}", e.getLocalizedMessage());
            }
        }
    }

    protected void destroy() {
        for (ChunkRenderGpuUploader uploader : this.uploaders.values()) {
            if (uploader == null) continue;
            uploader.clear();
        }
        this.uploaders.clear();
    }
}

