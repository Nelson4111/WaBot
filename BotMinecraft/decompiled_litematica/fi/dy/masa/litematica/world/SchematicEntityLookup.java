/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Iterables
 *  javax.annotation.Nonnull
 *  net.minecraft.util.AbortableIterationConsumer
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragon
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.entity.EntityAccess
 *  net.minecraft.world.level.entity.EntityTypeTest
 *  net.minecraft.world.level.entity.LevelEntityGetter
 *  net.minecraft.world.phys.AABB
 *  org.jetbrains.annotations.Nullable
 */
package fi.dy.masa.litematica.world;

import com.google.common.collect.Iterables;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import javax.annotation.Nonnull;
import net.minecraft.util.AbortableIterationConsumer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.entity.EntityAccess;
import net.minecraft.world.level.entity.EntityTypeTest;
import net.minecraft.world.level.entity.LevelEntityGetter;
import net.minecraft.world.phys.AABB;
import org.jetbrains.annotations.Nullable;

public class SchematicEntityLookup<T extends EntityAccess>
implements LevelEntityGetter<T>,
AutoCloseable {
    private final ConcurrentHashMap<Integer, T> entityMap = new ConcurrentHashMap(256, 0.9f, 1);
    private final ConcurrentHashMap<UUID, Integer> uuidMap = new ConcurrentHashMap(256, 0.9f, 1);
    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<UUID>> chunkMap = new ConcurrentHashMap(256, 0.9f, 1);

    protected SchematicEntityLookup() {
    }

    protected String getDebugString() {
        return String.format("E: %02d, U: %02d, C: %02d", this.entityMap.size(), this.uuidMap.size(), this.chunkMap.size());
    }

    protected void put(T entity, ChunkPos pos, @Nonnull WorldSchematic world) {
        T tmp = this.get(entity.getUUID());
        if (tmp != null) {
            this.remove(entity.getUUID(), world);
        }
        this.uuidMap.put(entity.getUUID(), entity.getId());
        this.entityMap.put(entity.getId(), entity);
        if (entity instanceof EnderDragon) {
            AABB bb = entity.getBoundingBox();
            int minChunkX = (int)Math.floor(bb.minX) >> 4;
            int maxChunkX = (int)Math.floor(bb.maxX) >> 4;
            int minChunkZ = (int)Math.floor(bb.minZ) >> 4;
            int maxChunkZ = (int)Math.floor(bb.maxZ) >> 4;
            for (int cx = minChunkX; cx <= maxChunkX; ++cx) {
                for (int cz = minChunkZ; cz <= maxChunkZ; ++cz) {
                    long cp = ChunkPos.pack((int)cx, (int)cz);
                    CopyOnWriteArrayList list = this.chunkMap.computeIfAbsent(cp, k -> new CopyOnWriteArrayList());
                    list.addIfAbsent(entity.getUUID());
                    if (list.size() != 1) continue;
                    this.chunkMap.put(cp, list);
                }
            }
        } else {
            long cp = pos.pack();
            CopyOnWriteArrayList list = this.chunkMap.computeIfAbsent(cp, k -> new CopyOnWriteArrayList());
            list.addIfAbsent(entity.getUUID());
            if (list.size() == 1) {
                this.chunkMap.put(cp, list);
            }
        }
        world.onTrackingStart((Entity)entity);
    }

    protected int size() {
        return this.entityMap.size();
    }

    protected boolean remove(UUID uuid, @Nonnull WorldSchematic world) {
        Integer key = this.uuidMap.get(uuid);
        for (Map.Entry<Long, CopyOnWriteArrayList<UUID>> entry : this.chunkMap.entrySet()) {
            Long longPos = entry.getKey();
            CopyOnWriteArrayList<UUID> list = entry.getValue();
            if (!list.remove(uuid) || !list.isEmpty()) continue;
            this.chunkMap.remove(longPos);
        }
        if (key != null) {
            this.uuidMap.remove(uuid);
            EntityAccess e = (EntityAccess)this.entityMap.remove(key);
            if (e != null) {
                world.onTrackingStop((Entity)e);
                return true;
            }
        } else {
            for (Map.Entry<Number, CopyOnWriteArrayList<UUID>> entry : this.entityMap.entrySet()) {
                Integer id = (Integer)entry.getKey();
                EntityAccess e = (EntityAccess)entry.getValue();
                if (!e.getUUID().equals(uuid)) continue;
                this.entityMap.remove(id);
                world.onTrackingStop((Entity)e);
                return true;
            }
        }
        return false;
    }

    protected int removeByChunk(ChunkPos pos, @Nonnull WorldSchematic world) {
        Long longPos = pos.pack();
        int count = 0;
        CopyOnWriteArrayList<UUID> list = this.chunkMap.get(longPos);
        if (list == null || list.isEmpty()) {
            return count;
        }
        for (UUID uuid : list) {
            Integer key = this.uuidMap.remove(uuid);
            if (key != null) {
                EntityAccess entry = (EntityAccess)this.entityMap.remove(key);
                world.onTrackingStop((Entity)entry);
                ++count;
                continue;
            }
            for (Map.Entry<Integer, T> entry : this.entityMap.entrySet()) {
                Integer id = entry.getKey();
                EntityAccess e = (EntityAccess)entry.getValue();
                if (!e.getUUID().equals(uuid)) continue;
                this.entityMap.remove(id);
                world.onTrackingStop((Entity)e);
                ++count;
            }
        }
        this.chunkMap.remove(longPos);
        return count;
    }

    @Nullable
    public T get(int id) {
        if (this.entityMap.containsKey(id)) {
            EntityAccess e = (EntityAccess)this.entityMap.get(id);
            if (!this.uuidMap.containsKey(e.getUUID())) {
                this.uuidMap.put(e.getUUID(), id);
            }
            return (T)e;
        }
        return null;
    }

    @Nullable
    public T get(@Nonnull UUID uuid) {
        if (this.uuidMap.containsKey(uuid)) {
            int key = this.uuidMap.get(uuid);
            if (this.entityMap.containsKey(key)) {
                return (T)((EntityAccess)this.entityMap.get(key));
            }
            this.uuidMap.remove(uuid);
            return null;
        }
        for (Map.Entry<Integer, T> entry : this.entityMap.entrySet()) {
            Integer id = entry.getKey();
            EntityAccess e = (EntityAccess)entry.getValue();
            if (!e.getUUID().equals(uuid)) continue;
            if (!this.uuidMap.containsKey(uuid)) {
                this.uuidMap.put(uuid, id);
            }
            return (T)e;
        }
        return null;
    }

    public Iterable<T> getAllByChunk(ChunkPos pos) {
        CopyOnWriteArrayList<UUID> list = this.chunkMap.get(pos.pack());
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return Iterables.unmodifiableIterable((Iterable)this.entityMap.values().stream().filter(e -> list.contains(e.getUUID())).toList());
    }

    @Nonnull
    public Iterable<T> getAll() {
        return Iterables.unmodifiableIterable(this.entityMap.values());
    }

    public void get(@Nonnull AABB box, @Nonnull Consumer<T> action) {
        AABB adjBox = new AABB(box.minX - 2.0, box.minY - 4.0, box.minZ - 2.0, box.maxX + 2.0, box.maxY + 0.0, box.maxZ + 2.0);
        ArrayList added = new ArrayList();
        this.entityMap.forEach((id, e) -> {
            if (adjBox.intersects(e.getBoundingBox())) {
                AbortableIterationConsumer consumer = AbortableIterationConsumer.forConsumer((Consumer)action);
                if (!added.contains(e.getUUID())) {
                    added.add(e.getUUID());
                    if (consumer.accept(e).shouldAbort()) {
                        return;
                    }
                }
            }
        });
    }

    public <U extends T> void get(@Nonnull EntityTypeTest<T, U> filter, @Nonnull AABB box, @Nonnull AbortableIterationConsumer<U> consumer) {
        AABB adjBox = new AABB(box.minX - 2.0, box.minY - 4.0, box.minZ - 2.0, box.maxX + 2.0, box.maxY + 0.0, box.maxZ + 2.0);
        ArrayList added = new ArrayList();
        this.entityMap.forEach((id, e) -> {
            EntityAccess filtered = (EntityAccess)filter.tryCast(e);
            if (filtered != null && adjBox.intersects(filtered.getBoundingBox()) && !added.contains(e.getUUID())) {
                added.add(e.getUUID());
                if (consumer.accept((Object)filtered).shouldAbort()) {
                    return;
                }
            }
        });
    }

    public <U extends T> void get(@Nonnull EntityTypeTest<T, U> filter, @Nonnull AbortableIterationConsumer<U> consumer) {
        this.entityMap.forEach((id, e) -> {
            EntityAccess filtered = (EntityAccess)filter.tryCast(e);
            if (filtered != null && consumer.accept((Object)filtered).shouldAbort()) {
                return;
            }
        });
    }

    public boolean contains(int id) {
        return this.entityMap.containsKey(id);
    }

    public boolean contains(UUID uuid) {
        return this.uuidMap.containsKey(uuid);
    }

    public boolean contains(ChunkPos pos) {
        return this.chunkMap.containsKey(pos.pack());
    }

    protected void reset() {
        this.entityMap.clear();
        this.uuidMap.clear();
        this.chunkMap.clear();
    }

    @Override
    public void close() throws Exception {
        this.reset();
    }
}

