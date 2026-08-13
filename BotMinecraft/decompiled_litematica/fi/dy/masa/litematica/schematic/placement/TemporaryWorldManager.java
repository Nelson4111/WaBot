/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.util.FileNameUtils
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.schematic.placement.TemporaryWorldHolder;
import fi.dy.masa.malilib.util.FileNameUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.world.level.ChunkPos;

public class TemporaryWorldManager
implements AutoCloseable {
    public static final TemporaryWorldManager INSTANCE = new TemporaryWorldManager();
    private final ConcurrentHashMap<String, TemporaryWorldHolder> tempWorlds = new ConcurrentHashMap(2, 0.9f, 1);

    private TemporaryWorldManager() {
    }

    protected synchronized TemporaryWorldHolder getTemporaryWorld(String worldName) {
        if (!this.tempWorlds.containsKey(worldName = this.ensureSafeWorldName(worldName))) {
            this.tempWorlds.put(worldName, new TemporaryWorldHolder());
            Litematica.debugLog("TemporaryWorldManager: Created New temporary world: '{}' (No origin / size provided)", worldName);
        }
        return this.tempWorlds.get(worldName);
    }

    public synchronized TemporaryWorldHolder getTemporaryWorld(String worldName, BlockPos origin, Vec3i size) {
        if (!this.tempWorlds.containsKey(worldName = this.ensureSafeWorldName(worldName))) {
            this.tempWorlds.put(worldName, new TemporaryWorldHolder(origin, size));
            Litematica.debugLog("TemporaryWorldManager: Created New temporary world: '{}', at '{}' with a size of: '{}'", worldName, origin.toShortString(), size.toShortString());
        }
        return this.tempWorlds.get(worldName);
    }

    public synchronized boolean hasTemporaryWorld(String worldName) {
        return this.tempWorlds.containsKey(this.ensureSafeWorldName(worldName));
    }

    public synchronized void removeTemporaryWorld(String worldName) {
        worldName = this.ensureSafeWorldName(worldName);
        try (TemporaryWorldHolder removed = this.tempWorlds.remove(worldName);){
            if (removed != null) {
                Litematica.debugLog("TemporaryWorldManager: Removed temporary world: '{}'", worldName);
            }
        }
        catch (Exception exception) {
            // empty catch block
        }
    }

    public synchronized void setOriginAndSize(String worldName, BlockPos origin, Vec3i size) {
        if (!this.tempWorlds.containsKey(worldName = this.ensureSafeWorldName(worldName))) {
            this.tempWorlds.get(worldName).clear();
            this.tempWorlds.put(worldName, new TemporaryWorldHolder(origin, size));
            Litematica.debugLog("TemporaryWorldManager: Replaced temporary world: '{}', at '{}' with a size of: '{}'", worldName, origin.toShortString(), size.toShortString());
        }
    }

    /*
     * Enabled force condition propagation
     * Lifted jumps to return sites
     */
    public synchronized List<ChunkPos> getChunks(String worldName) {
        worldName = this.ensureSafeWorldName(worldName);
        ArrayList<ChunkPos> chunks = new ArrayList<ChunkPos>();
        if (this.tempWorlds.containsKey(worldName)) {
            TemporaryWorldHolder world = this.tempWorlds.get(worldName);
            if (!world.isEmpty()) return world.chunkList().stream().map(pair -> new ChunkPos(((Integer)pair.getLeft()).intValue(), ((Integer)pair.getRight()).intValue())).toList();
            Litematica.LOGGER.error("TemporaryWorldManager#getChunks(): Temporary world: '{}' is empty!  Cannot replace a chunk that was not calculated!", (Object)worldName);
            return chunks;
        } else {
            Litematica.LOGGER.error("TemporaryWorldManager#getChunks(): Temporary world: '{}'; was not found!", (Object)worldName);
        }
        return chunks;
    }

    private String ensureSafeWorldName(String worldName) throws IllegalStateException {
        if (worldName == null || worldName.isEmpty()) {
            throw new IllegalStateException("Temporary World Name is empty!");
        }
        if (worldName.length() > 256) {
            throw new IllegalStateException("Temporary World Name is too long!");
        }
        return FileNameUtils.generateSafeFileName((String)worldName);
    }

    public void reset() {
        this.clear();
    }

    public synchronized void clear() {
        if (!this.tempWorlds.isEmpty()) {
            this.tempWorlds.forEach((s, world) -> {
                try {
                    world.close();
                }
                catch (Exception exception) {
                    // empty catch block
                }
            });
            this.tempWorlds.clear();
        }
    }

    @Override
    public void close() throws Exception {
        this.clear();
    }
}

