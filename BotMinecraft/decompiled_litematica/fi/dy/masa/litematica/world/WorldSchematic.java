/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  com.google.common.collect.ImmutableList$Builder
 *  fi.dy.masa.malilib.util.WorldUtils
 *  java.lang.MatchException
 *  javax.annotation.Nonnull
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Holder
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.particles.ExplosionParticleInfo
 *  net.minecraft.core.particles.ParticleOptions
 *  net.minecraft.core.registries.Registries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.resources.ResourceKey
 *  net.minecraft.sounds.SoundEvent
 *  net.minecraft.sounds.SoundSource
 *  net.minecraft.util.AbortableIterationConsumer$Continuation
 *  net.minecraft.util.Mth
 *  net.minecraft.util.random.WeightedList
 *  net.minecraft.world.TickRateManager
 *  net.minecraft.world.attribute.EnvironmentAttributeSystem
 *  net.minecraft.world.clock.ClockManager
 *  net.minecraft.world.damagesource.DamageSource
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragon
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragonPart
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.flag.FeatureFlagSet
 *  net.minecraft.world.item.alchemy.PotionBrewing
 *  net.minecraft.world.item.crafting.RecipeAccess
 *  net.minecraft.world.level.CardinalLighting$Type
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.ExplosionDamageCalculator
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.Level$ExplosionInteraction
 *  net.minecraft.world.level.biome.Biome
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.entity.FuelValues
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.border.WorldBorder
 *  net.minecraft.world.level.chunk.ChunkAccess
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.level.chunk.status.ChunkStatus
 *  net.minecraft.world.level.dimension.BuiltinDimensionTypes
 *  net.minecraft.world.level.dimension.DimensionType
 *  net.minecraft.world.level.entity.EntityTypeTest
 *  net.minecraft.world.level.entity.LevelEntityGetter
 *  net.minecraft.world.level.gameevent.GameEvent
 *  net.minecraft.world.level.gameevent.GameEvent$Context
 *  net.minecraft.world.level.lighting.LevelLightEngine
 *  net.minecraft.world.level.material.Fluid
 *  net.minecraft.world.level.saveddata.maps.MapId
 *  net.minecraft.world.level.saveddata.maps.MapItemSavedData
 *  net.minecraft.world.level.storage.LevelData$RespawnData
 *  net.minecraft.world.level.storage.WritableLevelData
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  net.minecraft.world.scores.Scoreboard
 *  net.minecraft.world.ticks.BlackholeTickAccess
 *  net.minecraft.world.ticks.LevelTickAccess
 *  org.jetbrains.annotations.Nullable
 *  org.jspecify.annotations.NonNull
 */
package fi.dy.masa.litematica.world;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.world.ChunkManagerSchematic;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.SchematicEntityLookup;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.malilib.util.WorldUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;
import javax.annotation.Nonnull;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Holder;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.particles.ExplosionParticleInfo;
import net.minecraft.core.particles.ParticleOptions;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundSource;
import net.minecraft.util.AbortableIterationConsumer;
import net.minecraft.util.Mth;
import net.minecraft.util.random.WeightedList;
import net.minecraft.world.TickRateManager;
import net.minecraft.world.attribute.EnvironmentAttributeSystem;
import net.minecraft.world.clock.ClockManager;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.entity.boss.enderdragon.EnderDragonPart;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.flag.FeatureFlagSet;
import net.minecraft.world.item.alchemy.PotionBrewing;
import net.minecraft.world.item.crafting.RecipeAccess;
import net.minecraft.world.level.CardinalLighting;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.ExplosionDamageCalculator;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.entity.FuelValues;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.border.WorldBorder;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.chunk.status.ChunkStatus;
import net.minecraft.world.level.dimension.BuiltinDimensionTypes;
import net.minecraft.world.level.dimension.DimensionType;
import net.minecraft.world.level.entity.EntityTypeTest;
import net.minecraft.world.level.entity.LevelEntityGetter;
import net.minecraft.world.level.gameevent.GameEvent;
import net.minecraft.world.level.lighting.LevelLightEngine;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.level.saveddata.maps.MapId;
import net.minecraft.world.level.saveddata.maps.MapItemSavedData;
import net.minecraft.world.level.storage.LevelData;
import net.minecraft.world.level.storage.WritableLevelData;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.scores.Scoreboard;
import net.minecraft.world.ticks.BlackholeTickAccess;
import net.minecraft.world.ticks.LevelTickAccess;
import org.jetbrains.annotations.Nullable;
import org.jspecify.annotations.NonNull;

public class WorldSchematic
extends Level {
    protected static final ResourceKey<Level> REGISTRY_KEY = ResourceKey.create((ResourceKey)Registries.DIMENSION, (Identifier)Identifier.fromNamespaceAndPath((String)"litematica", (String)"schematic_world"));
    protected final Minecraft mc = Minecraft.getInstance();
    protected final ChunkManagerSchematic chunkManagerSchematic;
    @Nullable
    protected final IWorldSchematicRenderer worldRenderer;
    private final TickRateManager tickManager;
    private final Holder<DimensionType> dimensionType;
    private final SchematicEntityLookup<Entity> entityLookup;
    private final ConcurrentHashMap<UUID, EnderDragonPart> dragonParts;
    protected Holder<Biome> biome;
    private LevelData.RespawnData properties;
    protected AtomicInteger nextEntityId;

    public WorldSchematic(WritableLevelData properties, @Nonnull RegistryAccess registryManager, Holder<DimensionType> dimension, @Nullable IWorldSchematicRenderer worldRenderer) {
        super(properties, REGISTRY_KEY, !registryManager.equals((Object)RegistryAccess.EMPTY) ? registryManager : SchematicWorldHandler.INSTANCE.getRegistryManager(), dimension, true, false, 0L, 0);
        if (this.mc == null || this.mc.level == null) {
            throw new RuntimeException("WorldSchematic invoked when MinecraftClient.getInstance() or mc.world is null");
        }
        this.worldRenderer = worldRenderer;
        this.chunkManagerSchematic = new ChunkManagerSchematic(this);
        this.dimensionType = dimension;
        this.dragonParts = new ConcurrentHashMap(12, 0.9f, 2);
        if (!registryManager.equals((Object)RegistryAccess.EMPTY)) {
            this.setDimension(registryManager);
        } else {
            this.setDimension(this.mc.level.registryAccess());
        }
        this.tickManager = new TickRateManager();
        this.entityLookup = new SchematicEntityLookup();
        this.properties = LevelData.RespawnData.DEFAULT;
        this.nextEntityId = new AtomicInteger(0);
    }

    public String toString() {
        return "SchematicWorld[" + REGISTRY_KEY.identifier().toString() + "]";
    }

    private void setDimension(RegistryAccess registryManager) {
        registryManager.lookup(Registries.DIMENSION_TYPE).ifPresent(entryLookup -> {
            Holder nether = entryLookup.get(BuiltinDimensionTypes.NETHER).orElse(null);
            Holder end = entryLookup.get(BuiltinDimensionTypes.END).orElse(null);
            this.biome = nether != null && this.dimensionType.equals((Object)nether) ? WorldUtils.getWastes((RegistryAccess)registryManager) : (end != null && this.dimensionType.equals((Object)end) ? WorldUtils.getTheEnd((RegistryAccess)registryManager) : WorldUtils.getPlains((RegistryAccess)registryManager));
        });
    }

    @Deprecated(forRemoval=true)
    public ChunkManagerSchematic getChunkProvider() {
        return this.getChunkSource();
    }

    @Nonnull
    public ChunkManagerSchematic getChunkSource() {
        return this.chunkManagerSchematic;
    }

    @Nonnull
    public TickRateManager tickRateManager() {
        return this.tickManager;
    }

    @Nullable
    public MapItemSavedData getMapData(@NonNull MapId id) {
        return null;
    }

    @Nonnull
    public LevelTickAccess<Block> getBlockTicks() {
        return BlackholeTickAccess.emptyLevelList();
    }

    @Nonnull
    public LevelTickAccess<Fluid> getFluidTicks() {
        return BlackholeTickAccess.emptyLevelList();
    }

    public int getRegularEntityCount() {
        return this.entityLookup.size();
    }

    public String getEntityDebug() {
        return String.format("%s", this.entityLookup.getDebugString());
    }

    @Nonnull
    public LevelChunk getChunkAt(BlockPos pos) {
        return this.getChunk(pos.getX() >> 4, pos.getZ() >> 4);
    }

    @Nonnull
    public ChunkSchematic getChunk(int chunkX, int chunkZ) {
        return this.chunkManagerSchematic.getChunkForLighting(chunkX, chunkZ);
    }

    public ChunkAccess getChunk(int chunkX, int chunkZ, @Nonnull ChunkStatus status, boolean required) {
        return this.getChunk(chunkX, chunkZ);
    }

    @Nonnull
    public Holder<Biome> getUncachedNoiseBiome(int biomeX, int biomeY, int biomeZ) {
        return this.biome;
    }

    public int getSeaLevel() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.getSeaLevel();
        }
        return 0;
    }

    public boolean setBlock(BlockPos pos, @Nonnull BlockState newState, int flags) {
        if (pos.getY() < this.getMinY() || pos.getY() >= this.getMaxY()) {
            return false;
        }
        return this.getChunk(pos.getX() >> 4, pos.getZ() >> 4).setBlockState(pos, newState, 3) != null;
    }

    public boolean addFreshEntity(@NonNull Entity entity) {
        return this.addFreshEntitySafe(entity);
    }

    /*
     * Enabled force condition propagation
     * Lifted jumps to return sites
     */
    public boolean addFreshEntitySafe(@NonNull Entity entity) {
        int chunkX = Mth.floor((double)(entity.getX() / 16.0));
        int chunkZ = Mth.floor((double)(entity.getZ() / 16.0));
        if (this.entityLookup.contains(entity.getUUID())) {
            if (Configs.Generic.DEDUPLICATE_SCHEMATIC_ENTITIES.getBooleanValue()) {
                Entity e = this.entityLookup.get(entity.getUUID());
                if (e == null || !e.getType().equals(entity.getType())) return false;
                if (e.position().equals((Object)entity.position())) {
                    return false;
                }
                this.entityLookup.remove(entity.getUUID(), this);
            } else {
                entity.setUUID(UUID.randomUUID());
            }
        }
        ChunkPos chunkPos = new ChunkPos(chunkX, chunkZ);
        while (this.entityLookup.contains(entity.getId()) || entity.getId() < 0) {
            entity.setId(this.nextEntityId.incrementAndGet());
        }
        this.entityLookup.put(entity, chunkPos, this);
        return true;
    }

    public int getLastUsedEntityId() {
        return this.nextEntityId.get();
    }

    public void unloadEntitiesByChunk(int chunkX, int chunkZ) {
        if (!this.hasChunk(chunkX, chunkZ)) {
            return;
        }
        ChunkPos pos = new ChunkPos(chunkX, chunkZ);
        int count = this.entityLookup.removeByChunk(pos, this);
        this.checkForStaleEntities();
    }

    private void checkForStaleEntities() {
        if (this.entityLookup.size() < 1) {
            this.entityLookup.reset();
            this.dragonParts.clear();
            this.nextEntityId.set(1);
        }
    }

    @Nullable
    public Entity getEntity(int id) {
        return (Entity)this.getEntities().get(id);
    }

    @Nullable
    public Entity getEntity(@Nonnull UUID uuid) {
        return (Entity)this.getEntities().get(uuid);
    }

    protected void closeEntityLookup() throws Exception {
        this.entityLookup.close();
        this.dragonParts.clear();
    }

    public void clearEntities() {
        try {
            this.closeEntityLookup();
        }
        catch (Exception exception) {
            // empty catch block
        }
        this.nextEntityId.set(1);
    }

    @Nonnull
    public Collection<EnderDragonPart> dragonParts() {
        return this.dragonParts.values();
    }

    @Nonnull
    public List<? extends Player> players() {
        return ImmutableList.of();
    }

    public long getGameTime() {
        return this.mc.level != null ? this.mc.level.getGameTime() : 0L;
    }

    @Nonnull
    public Scoreboard getScoreboard() {
        return this.mc.level != null ? this.mc.level.getScoreboard() : null;
    }

    @Nonnull
    public RecipeAccess recipeAccess() {
        return this.mc.level != null ? this.mc.level.recipeAccess() : null;
    }

    @Nonnull
    public LevelEntityGetter<Entity> getEntities() {
        return this.entityLookup;
    }

    public ImmutableList<Entity> getEntitiesByChunk(int cx, int cz, @Nonnull Predicate<? super Entity> predicate) {
        if (!this.hasChunk(cx, cz)) {
            return ImmutableList.of();
        }
        ImmutableList.Builder builder = ImmutableList.builder();
        for (Entity e : this.entityLookup.getAllByChunk(new ChunkPos(cx, cz))) {
            if (e == null || !predicate.test((Entity)e)) continue;
            builder.add((Object)e);
        }
        return builder.build();
    }

    @Nonnull
    public List<Entity> getEntities(@Nullable Entity except, @Nonnull AABB box, @Nonnull Predicate<? super Entity> predicate) {
        ArrayList<Entity> list = new ArrayList<Entity>();
        this.getEntities().get(box, e -> {
            if (e != except && predicate.test((Entity)e)) {
                list.add((Entity)e);
            }
        });
        for (EnderDragonPart part : this.dragonParts()) {
            if (part == except || part.parentMob == except || !predicate.test((Entity)part) || !box.intersects(part.getBoundingBox())) continue;
            list.add((Entity)part);
        }
        return list;
    }

    @Nonnull
    public <T extends Entity> List<T> getEntities(@Nonnull EntityTypeTest<Entity, T> filter, @Nonnull AABB box, @Nonnull Predicate<? super T> predicate) {
        ArrayList list = new ArrayList();
        this.getEntities(filter, box, predicate, list);
        return list;
    }

    public <T extends Entity> void getEntities(@Nonnull EntityTypeTest<Entity, T> filter, @Nonnull AABB box, @Nonnull Predicate<? super T> predicate, @NonNull List<? super T> list) {
        this.getEntities(filter, box, predicate, list, Integer.MAX_VALUE);
    }

    public <T extends Entity> void getEntities(@Nonnull EntityTypeTest<Entity, T> filter, @Nonnull AABB box, @Nonnull Predicate<? super T> predicate, @NonNull List<? super T> list, int max) {
        this.getEntities().get(filter, box, e -> {
            if (predicate.test(e)) {
                list.add((Object)e);
                if (list.size() >= max) {
                    return AbortableIterationConsumer.Continuation.ABORT;
                }
            }
            if (e instanceof EnderDragon) {
                EnderDragon ed = (EnderDragon)e;
                for (EnderDragonPart part : ed.getSubEntities()) {
                    Entity entity = (Entity)filter.tryCast((Object)part);
                    if (entity == null || !predicate.test(entity)) continue;
                    list.add((Object)entity);
                    if (list.size() < max) continue;
                    return AbortableIterationConsumer.Continuation.ABORT;
                }
            }
            return AbortableIterationConsumer.Continuation.CONTINUE;
        });
    }

    public <T extends Entity> boolean hasEntities(@Nonnull EntityTypeTest<Entity, T> filter, @Nonnull AABB box, @Nonnull Predicate<? super T> predicate) {
        AtomicBoolean result = new AtomicBoolean(false);
        this.getEntities().get(filter, box, e -> {
            if (predicate.test(e)) {
                result.set(true);
                return AbortableIterationConsumer.Continuation.ABORT;
            }
            if (e instanceof EnderDragon) {
                EnderDragon ed = (EnderDragon)e;
                for (EnderDragonPart part : ed.getSubEntities()) {
                    Entity entity = (Entity)filter.tryCast((Object)part);
                    if (entity == null || !predicate.test(entity)) continue;
                    result.set(true);
                    return AbortableIterationConsumer.Continuation.ABORT;
                }
            }
            return AbortableIterationConsumer.Continuation.CONTINUE;
        });
        return result.get();
    }

    public void onTrackingStart(Entity entity) {
        if (entity instanceof EnderDragon) {
            EnderDragon ed = (EnderDragon)entity;
            for (EnderDragonPart part : ed.getSubEntities()) {
                this.dragonParts.put(part.getUUID(), part);
            }
        }
    }

    public void onTrackingStop(Entity entity) {
        if (entity instanceof EnderDragon) {
            EnderDragon ed = (EnderDragon)entity;
            for (EnderDragonPart part : ed.getSubEntities()) {
                this.dragonParts.remove(part.getUUID(), part);
            }
        }
    }

    public List<ChunkSchematic> getChunksWithinBox(AABB box) {
        int minX = Mth.floor((double)(box.minX / 16.0));
        int minZ = Mth.floor((double)(box.minZ / 16.0));
        int maxX = Mth.floor((double)(box.maxX / 16.0));
        int maxZ = Mth.floor((double)(box.maxZ / 16.0));
        ArrayList<ChunkSchematic> chunks = new ArrayList<ChunkSchematic>();
        for (int cx = minX; cx <= maxX; ++cx) {
            for (int cz = minZ; cz <= maxZ; ++cz) {
                ChunkSchematic chunk = this.chunkManagerSchematic.getChunkIfExists(cx, cz);
                if (chunk == null) continue;
                chunks.add(chunk);
            }
        }
        return chunks;
    }

    public void setBlocksDirty(@Nonnull BlockPos pos, @Nonnull BlockState stateOld, @Nonnull BlockState stateNew) {
        if (stateNew != stateOld) {
            this.scheduleChunkRenders(pos.getX() >> 4, pos.getZ() >> 4, true);
        }
    }

    public void playSeededSound(@Nullable Entity source, double x, double y, double z, @Nonnull Holder<SoundEvent> sound, @Nonnull SoundSource category, float volume, float pitch, long seed) {
    }

    public void playSeededSound(@Nullable Entity source, @Nonnull Entity entity, @Nonnull Holder<SoundEvent> sound, @Nonnull SoundSource category, float volume, float pitch, long seed) {
    }

    public void explode(@Nullable Entity entity, @Nullable DamageSource damageSource, @Nullable ExplosionDamageCalculator behavior, double x, double y, double z, float power, boolean createFire, @Nonnull Level.ExplosionInteraction explosionSourceType, @Nonnull ParticleOptions smallParticle, @Nonnull ParticleOptions largeParticle, @Nonnull WeightedList<ExplosionParticleInfo> blockParticles, @Nonnull Holder<SoundEvent> soundEvent) {
    }

    public void scheduleChunkRenders(int chunkX, int chunkZ) {
        this.scheduleChunkRenders(chunkX, chunkZ, false);
    }

    public void scheduleChunkRenders(int chunkX, int chunkZ, boolean immediate) {
        if (this.worldRenderer != null) {
            this.worldRenderer.scheduleChunkRenders(chunkX, chunkZ, immediate);
        }
    }

    public int getMinY() {
        return this.mc.level != null ? this.mc.level.getMinY() : -64;
    }

    public int getHeight() {
        return this.mc.level != null ? this.mc.level.getHeight() : 384;
    }

    public int getMaxY() {
        return this.getMinY() + this.getHeight();
    }

    public int getMinSectionY() {
        return this.getMinY() >> 4;
    }

    public int getMaxSectionY() {
        return this.getMaxY() >> 4;
    }

    public int getSectionsCount() {
        return this.getMaxSectionY() - this.getMinSectionY();
    }

    public boolean isOutsideBuildHeight(BlockPos pos) {
        return this.isOutsideBuildHeight(pos.getY());
    }

    public boolean isOutsideBuildHeight(int y) {
        return y < this.getMinY() || y >= this.getMaxY();
    }

    public int getSectionIndex(int y) {
        return (y >> 4) - (this.getMinY() >> 4);
    }

    public int getSectionIndexFromSectionY(int coord) {
        return coord - (this.getMinY() >> 4);
    }

    public int getSectionYFromSectionIndex(int index) {
        return index + (this.getMinY() >> 4);
    }

    public Holder<DimensionType> getDimensionType() {
        return this.dimensionType;
    }

    public float getShade(@Nonnull Direction direction, boolean shaded) {
        CardinalLighting.Type cardinalLightType = this.dimensionType().cardinalLightType();
        if (!shaded) {
            return cardinalLightType == CardinalLighting.Type.NETHER ? 0.9f : 1.0f;
        }
        return switch (direction) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN -> {
                if (cardinalLightType == CardinalLighting.Type.NETHER) {
                    yield 0.9f;
                }
                yield 0.5f;
            }
            case Direction.UP -> {
                if (cardinalLightType == CardinalLighting.Type.NETHER) {
                    yield 0.9f;
                }
                yield 1.0f;
            }
            case Direction.NORTH, Direction.SOUTH -> 0.8f;
            case Direction.WEST, Direction.EAST -> 0.6f;
        };
    }

    @Nonnull
    public LevelLightEngine getLightEngine() {
        return this.getChunkSource().getLightEngine();
    }

    public void sendBlockUpdated(@Nonnull BlockPos blockPos_1, @Nonnull BlockState blockState_1, @Nonnull BlockState blockState_2, int flags) {
    }

    public void destroyBlockProgress(int entityId, @Nonnull BlockPos pos, int progress) {
    }

    public void globalLevelEvent(int eventId, @Nonnull BlockPos pos, int data) {
    }

    public void gameEvent(@Nonnull Holder<GameEvent> event, @Nonnull Vec3 emitterPos, @Nonnull GameEvent.Context emitter) {
    }

    public void levelEvent(@Nullable Entity entity, int eventId, @Nonnull BlockPos pos, int data) {
    }

    @Nonnull
    public RegistryAccess registryAccess() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.registryAccess();
        }
        if (!SchematicWorldHandler.INSTANCE.getRegistryManager().equals((Object)RegistryAccess.EMPTY)) {
            return SchematicWorldHandler.INSTANCE.getRegistryManager();
        }
        return RegistryAccess.EMPTY;
    }

    public @NonNull ClockManager clockManager() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.clockManager();
        }
        return null;
    }

    public @NonNull EnvironmentAttributeSystem environmentAttributes() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.environmentAttributes();
        }
        return null;
    }

    @Nonnull
    public PotionBrewing potionBrewing() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.potionBrewing();
        }
        return PotionBrewing.EMPTY;
    }

    @Nonnull
    public FuelValues fuelValues() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.fuelValues();
        }
        return null;
    }

    @Nonnull
    public FeatureFlagSet enabledFeatures() {
        if (this.mc != null && this.mc.level != null) {
            return this.mc.level.enabledFeatures();
        }
        return FeatureFlagSet.of();
    }

    @Nonnull
    public String gatherChunkSourceStats() {
        return "Chunks[SCH] W: " + this.getChunkSource().gatherStats() + " E: " + this.getRegularEntityCount() + " (eL: " + this.entityLookup.size() + ")";
    }

    public void setRespawnData(LevelData.RespawnData arg) {
        this.properties = new LevelData.RespawnData(arg.globalPos(), arg.pitch(), arg.yaw());
    }

    @Nonnull
    public LevelData.RespawnData getRespawnData() {
        return this.properties;
    }

    public void gameEvent(@Nullable Entity entity, @Nonnull Holder<GameEvent> event, @Nonnull Vec3 pos) {
    }

    public void gameEvent(@Nullable Entity entity, @Nonnull Holder<GameEvent> event, @Nonnull BlockPos pos) {
    }

    public void gameEvent(@Nonnull ResourceKey<GameEvent> event, @Nonnull BlockPos pos, @Nullable GameEvent.Context emitter) {
    }

    @Nonnull
    public WorldBorder getWorldBorder() {
        return new WorldBorder();
    }
}

