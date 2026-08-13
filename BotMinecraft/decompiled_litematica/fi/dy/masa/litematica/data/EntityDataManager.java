/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonObject
 *  com.mojang.datafixers.util.Either
 *  fi.dy.masa.malilib.config.options.ConfigBoolean
 *  fi.dy.masa.malilib.interfaces.IClientTickHandler
 *  fi.dy.masa.malilib.interfaces.IDataSyncer
 *  fi.dy.masa.malilib.mixin.entity.IMixinAbstractHorseEntity
 *  fi.dy.masa.malilib.mixin.entity.IMixinAbstractNautilus
 *  fi.dy.masa.malilib.mixin.entity.IMixinPiglinEntity
 *  fi.dy.masa.malilib.mixin.network.IMixinDebugQueryHandler
 *  fi.dy.masa.malilib.network.ClientPlayHandler
 *  fi.dy.masa.malilib.network.IPluginClientPlayHandler
 *  fi.dy.masa.malilib.registry.Registry
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.WorldUtils
 *  fi.dy.masa.malilib.util.data.DataEntityUtils
 *  fi.dy.masa.malilib.util.data.tag.CompoundData
 *  fi.dy.masa.malilib.util.data.tag.DataView
 *  fi.dy.masa.malilib.util.data.tag.ListData
 *  fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt
 *  fi.dy.masa.malilib.util.data.tag.util.DataTypeUtils
 *  fi.dy.masa.malilib.util.data_syncer.EntityDataCache
 *  fi.dy.masa.malilib.util.data_syncer.EntityDataRequestTracker
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  java.lang.runtime.SwitchBootstraps
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.multiplayer.ClientPacketListener
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.Mth
 *  net.minecraft.world.Container
 *  net.minecraft.world.SimpleContainer
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.EntityType
 *  net.minecraft.world.entity.animal.equine.AbstractHorse
 *  net.minecraft.world.entity.animal.nautilus.AbstractNautilus
 *  net.minecraft.world.entity.monster.piglin.Piglin
 *  net.minecraft.world.entity.npc.villager.Villager
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.chunk.ChunkAccess
 *  net.minecraft.world.level.chunk.status.ChunkStatus
 *  net.minecraft.world.phys.AABB
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.data;

import com.google.gson.JsonObject;
import com.mojang.datafixers.util.Either;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.network.ServuxLitematicaHandler;
import fi.dy.masa.litematica.network.ServuxLitematicaPacket;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.config.options.ConfigBoolean;
import fi.dy.masa.malilib.interfaces.IClientTickHandler;
import fi.dy.masa.malilib.interfaces.IDataSyncer;
import fi.dy.masa.malilib.mixin.entity.IMixinAbstractHorseEntity;
import fi.dy.masa.malilib.mixin.entity.IMixinAbstractNautilus;
import fi.dy.masa.malilib.mixin.entity.IMixinPiglinEntity;
import fi.dy.masa.malilib.mixin.network.IMixinDebugQueryHandler;
import fi.dy.masa.malilib.network.ClientPlayHandler;
import fi.dy.masa.malilib.network.IPluginClientPlayHandler;
import fi.dy.masa.malilib.registry.Registry;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.WorldUtils;
import fi.dy.masa.malilib.util.data.DataEntityUtils;
import fi.dy.masa.malilib.util.data.tag.CompoundData;
import fi.dy.masa.malilib.util.data.tag.DataView;
import fi.dy.masa.malilib.util.data.tag.ListData;
import fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt;
import fi.dy.masa.malilib.util.data.tag.util.DataTypeUtils;
import fi.dy.masa.malilib.util.data_syncer.EntityDataCache;
import fi.dy.masa.malilib.util.data_syncer.EntityDataRequestTracker;
import fi.dy.masa.malilib.util.nbt.NbtView;
import java.lang.runtime.SwitchBootstraps;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.core.BlockPos;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.resources.Identifier;
import net.minecraft.util.Mth;
import net.minecraft.world.Container;
import net.minecraft.world.SimpleContainer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.animal.equine.AbstractHorse;
import net.minecraft.world.entity.animal.nautilus.AbstractNautilus;
import net.minecraft.world.entity.monster.piglin.Piglin;
import net.minecraft.world.entity.npc.villager.Villager;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.status.ChunkStatus;
import net.minecraft.world.phys.AABB;
import org.apache.commons.lang3.tuple.Pair;

public class EntityDataManager
implements IClientTickHandler,
IDataSyncer {
    private static final EntityDataManager INSTANCE = new EntityDataManager();
    private static final ServuxLitematicaHandler<ServuxLitematicaPacket.Payload> HANDLER = ServuxLitematicaHandler.getInstance();
    private static final long LONG_CACHE_TIMEOUT = 30L;
    private static final long CHUNK_TIMEOUT_MS = 7500L;
    private final Minecraft mc;
    private ClientLevel clientWorld;
    private boolean servuxServer = false;
    private boolean hasInValidServux = false;
    private String servuxVersion;
    private boolean checkOpStatus = true;
    private boolean hasOpStatus = false;
    private long lastOpCheck = 0L;
    private boolean sentBackupPackets = false;
    private boolean receivedBackupPackets = false;
    private boolean shouldUseLongTimeout = false;
    private final EntityDataCache cache;
    private final EntityDataRequestTracker requestTracker;
    private final Map<Integer, Either<BlockPos, Integer>> transactionToBlockPosOrEntityId = new HashMap<Integer, Either<BlockPos, Integer>>();
    private long lastTickTime;
    private final Set<ChunkPos> pendingChunks = new LinkedHashSet<ChunkPos>();
    private final Set<ChunkPos> completedChunks = new LinkedHashSet<ChunkPos>();
    private final Map<ChunkPos, Long> pendingChunkTimeout = new HashMap<ChunkPos, Long>();
    private final HashMap<ChunkPos, Set<BlockPos>> pendingBackupChunk_BlockEntities = new HashMap();
    private final HashMap<ChunkPos, Set<Integer>> pendingBackupChunk_Entities = new HashMap();

    public static EntityDataManager getInstance() {
        return INSTANCE;
    }

    @Nullable
    public Level getBestWorld() {
        return WorldUtils.getBestWorld((Minecraft)this.mc);
    }

    public ClientLevel getClientWorld() {
        if (this.clientWorld == null) {
            this.clientWorld = this.mc.level;
        }
        return this.clientWorld;
    }

    private EntityDataManager() {
        this.mc = Minecraft.getInstance();
        this.cache = new EntityDataCache("litematica", this.getCacheTimeoutLong());
        this.requestTracker = new EntityDataRequestTracker();
        this.lastTickTime = System.currentTimeMillis();
        Registry.ENTITY_DATA_REGISTRY.registerEntityDataCache(this.cache);
    }

    public void onClientTick(Minecraft mc) {
        long now = System.currentTimeMillis();
        if (now - this.lastTickTime > 50L) {
            if (!Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue()) {
                this.lastTickTime = now;
                if (!DataManager.getInstance().hasIntegratedServer() && this.hasServuxServer()) {
                    this.servuxServer = false;
                    HANDLER.unregisterPlayReceiver();
                }
                if (!Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
                    this.requestTracker.clearAll();
                    return;
                }
            } else if (Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue() && !DataManager.getInstance().hasIntegratedServer() && !this.hasServuxServer() && !this.hasInValidServux && this.getBestWorld() != null) {
                HANDLER.registerPlayReceiver(ServuxLitematicaPacket.Payload.ID, HANDLER::receivePlayPayload);
                this.requestMetadata();
            }
            this.tickCache(now);
            int limit = Configs.Generic.SERVER_NBT_REQUEST_RATE.getIntegerValue();
            for (int i = 0; i < limit; ++i) {
                BlockPos nextPos = this.requestTracker.pollNextBlockEntity();
                Integer nextId = this.requestTracker.pollNextEntity();
                if (nextPos == null && nextId == null) break;
                if (nextPos != null) {
                    if (this.hasServuxServer()) {
                        this.requestServuxBlockEntityData(nextPos);
                    } else if (this.shouldUseQuery()) {
                        this.requestQueryBlockEntity(nextPos);
                    }
                }
                if (nextId == null) continue;
                if (this.hasServuxServer()) {
                    this.requestServuxEntityData(nextId);
                    continue;
                }
                if (!this.shouldUseQuery()) continue;
                this.requestQueryEntityData(nextId);
            }
            this.lastTickTime = now;
        }
    }

    public Identifier getNetworkChannel() {
        return ServuxLitematicaHandler.CHANNEL_ID;
    }

    private ClientPacketListener getVanillaHandler() {
        if (this.mc.player != null) {
            return this.mc.player.connection;
        }
        return null;
    }

    public IPluginClientPlayHandler<ServuxLitematicaPacket.Payload> getNetworkHandler() {
        return HANDLER;
    }

    public void reset(boolean isLogout) {
        if (isLogout) {
            Litematica.debugLog("EntityDataManager#reset() - log-out", new Object[0]);
            HANDLER.reset(this.getNetworkChannel());
            HANDLER.resetFailures(this.getNetworkChannel());
            this.servuxServer = false;
            this.hasInValidServux = false;
            this.sentBackupPackets = false;
            this.receivedBackupPackets = false;
            this.checkOpStatus = false;
            this.hasOpStatus = false;
            this.lastOpCheck = 0L;
        } else {
            Litematica.debugLog("EntityDataManager#reset() - dimension change or log-in", new Object[0]);
            long now = System.currentTimeMillis();
            this.lastTickTime = now - (this.getCacheTimeout() + 5000L);
            this.tickCache(now);
            this.lastTickTime = now;
            this.clientWorld = this.mc.level;
            this.checkOpStatus = true;
            this.lastOpCheck = now;
        }
        this.clearAll();
        this.completedChunks.clear();
        this.pendingChunks.clear();
        this.pendingChunkTimeout.clear();
        this.pendingBackupChunk_BlockEntities.clear();
        this.pendingBackupChunk_Entities.clear();
    }

    private boolean shouldUseQuery() {
        if (this.hasOpStatus) {
            return true;
        }
        if (this.checkOpStatus) {
            if (System.currentTimeMillis() - this.lastOpCheck < 900000L) {
                return true;
            }
            this.checkOpStatus = false;
        }
        return false;
    }

    public void resetOpCheck() {
        this.hasOpStatus = false;
        this.checkOpStatus = true;
        this.lastOpCheck = System.currentTimeMillis();
    }

    public EntityDataCache getCache() {
        return this.cache;
    }

    public EntityDataRequestTracker getRequestTracker() {
        return this.requestTracker;
    }

    public boolean isEnabled() {
        return Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue();
    }

    public boolean isBackupEnabled() {
        return Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue();
    }

    public boolean loadContainerBlockEntities() {
        return true;
    }

    public long getRefreshTime() {
        return this.getCacheTimeout() / 4L;
    }

    public long getCacheTimeout() {
        int modifier = Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue() ? 5 : 1;
        return (long)(MathUtils.clamp((float)(Configs.Generic.ENTITY_DATA_SYNC_CACHE_TIMEOUT.getFloatValue() * (float)modifier), (float)1.0f, (float)50.0f) * 1000.0f);
    }

    private long getCacheTimeoutLong() {
        int modifier = Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue() ? 5 : 1;
        long result = (long)(MathUtils.clamp((float)(Configs.Generic.ENTITY_DATA_SYNC_CACHE_TIMEOUT.getFloatValue() * (float)modifier * 30.0f), (float)120.0f, (float)(300.0f * (float)modifier)) * 1000.0f);
        if (!this.hasServuxServer() && this.getIfReceivedBackupPackets()) {
            return result + 3000L;
        }
        return result;
    }

    private void tickCache(long nowTime) {
        boolean entEmpty;
        if (this.shouldUseLongTimeout) {
            if (this.cache.getTimeout() != this.getCacheTimeoutLong()) {
                this.cache.setTimeout(this.getCacheTimeoutLong());
            }
        } else if (this.cache.getTimeout() != this.getCacheTimeout()) {
            this.cache.setTimeout(this.getCacheTimeout());
        }
        this.cache.tickCache(nowTime);
        boolean beEmpty = this.cache.blockEntityCount() == 0;
        boolean bl = entEmpty = this.cache.entityCount() == 0;
        if (beEmpty && entEmpty && this.shouldUseLongTimeout) {
            this.shouldUseLongTimeout = false;
        }
    }

    public void setIsServuxServer() {
        this.servuxServer = true;
        this.hasInValidServux = false;
    }

    public boolean hasServuxServer() {
        return this.servuxServer;
    }

    public boolean hasBackupStatus() {
        return Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue() && this.hasOpStatus;
    }

    public boolean hasOperatorStatus() {
        return this.hasOpStatus;
    }

    public void setServuxVersion(String ver) {
        if (ver != null && !ver.isEmpty()) {
            this.servuxVersion = ver;
            Litematica.debugLog("LitematicDataChannel: joining Servux version {}", ver);
        } else {
            this.servuxVersion = "unknown";
        }
    }

    public String getServuxVersion() {
        return this.servuxVersion;
    }

    public int getPendingBlockEntitiesCount() {
        return this.requestTracker.getPendingBlockEntityCount();
    }

    public int getPendingEntitiesCount() {
        return this.requestTracker.getPendingEntityCount();
    }

    public int getBlockEntityCacheCount() {
        return this.cache.blockEntityCount();
    }

    public int getEntityCacheCount() {
        return this.cache.entityCount();
    }

    public boolean getIfReceivedBackupPackets() {
        if (Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
            return this.sentBackupPackets & this.receivedBackupPackets;
        }
        return false;
    }

    public void onGameInit() {
        ClientPlayHandler.getInstance().registerClientPlayHandler(HANDLER);
        HANDLER.registerPlayPayload(ServuxLitematicaPacket.Payload.ID, ServuxLitematicaPacket.Payload.CODEC, 6);
    }

    public void onWorldPre() {
        if (!DataManager.getInstance().hasIntegratedServer()) {
            HANDLER.registerPlayReceiver(ServuxLitematicaPacket.Payload.ID, HANDLER::receivePlayPayload);
        }
    }

    public void onWorldJoin() {
        EntityUtils.initEntityUtils();
    }

    public void requestMetadata() {
        if (!DataManager.getInstance().hasIntegratedServer() && Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue()) {
            CompoundTag nbt = new CompoundTag();
            nbt.putString("version", Reference.MOD_STRING);
            HANDLER.encodeClientData(ServuxLitematicaPacket.MetadataRequest(nbt));
        }
    }

    public boolean receiveServuxMetadata(CompoundTag data) {
        if (!DataManager.getInstance().hasIntegratedServer()) {
            Litematica.debugLog("LitematicDataChannel: received METADATA from Servux", new Object[0]);
            if (Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue()) {
                if (data.getIntOr("version", -1) != 1) {
                    Litematica.LOGGER.warn("LitematicDataChannel: Mis-matched protocol version!");
                }
                this.setServuxVersion(data.getStringOr("servux", "?"));
                this.setIsServuxServer();
                return true;
            }
        }
        return false;
    }

    public void onPacketFailure() {
        this.servuxServer = false;
        this.hasInValidServux = true;
    }

    public void onEntityDataSyncToggled(ConfigBoolean config) {
        if (this.hasInValidServux) {
            this.reset(true);
        }
    }

    @Nullable
    public Pair<BlockEntity, CompoundData> requestBlockEntityWrapped(Level world, BlockPos pos) {
        if (world instanceof WorldSchematic) {
            return this.refreshBlockEntityFromWorld(world, pos);
        }
        return this.requestBlockEntity(world, pos);
    }

    @Nullable
    public Pair<Entity, CompoundData> requestEntityWrapped(Level world, int entityId) {
        if (world instanceof WorldSchematic) {
            return this.refreshEntityFromWorld(world, entityId);
        }
        return this.requestEntity(world, entityId);
    }

    @Nullable
    public Container getBlockInventoryWrapped(Level world, BlockPos pos, boolean useNbt) {
        if (world instanceof WorldSchematic) {
            return InventoryUtils.getInventory((Level)world, (BlockPos)pos);
        }
        return this.getBlockInventory(world, pos, useNbt);
    }

    @Nullable
    public Container getEntityInventoryWrapped(Level world, int entityId, boolean useNbt) {
        if (world instanceof WorldSchematic) {
            WorldSchematic ws = (WorldSchematic)world;
            Container inv = null;
            Entity entity = ws.getEntity(entityId);
            if (entity != null) {
                if (useNbt) {
                    CompoundData data = DataEntityUtils.invokeEntityDataTagNoPassengers((Entity)entity, (int)entityId);
                    inv = InventoryUtils.getDataInventory((CompoundData)data, (int)-1, (RegistryAccess)ws.registryAccess());
                } else {
                    Entity entity2 = entity;
                    Objects.requireNonNull(entity2);
                    Entity entity3 = entity2;
                    int n = 0;
                    block8: while (true) {
                        switch (SwitchBootstraps.typeSwitch("typeSwitch", new Object[]{Container.class, Player.class, Villager.class, AbstractHorse.class, AbstractNautilus.class, Piglin.class}, (Entity)entity3, (int)n)) {
                            case 0: {
                                Container itemStacks;
                                inv = itemStacks = (Container)entity3;
                                break block8;
                            }
                            case 1: {
                                Player player = (Player)entity3;
                                if (player == null) {
                                    n = 2;
                                    continue block8;
                                }
                                inv = new SimpleContainer((ItemStack[])player.getInventory().getNonEquipmentItems().toArray((Object[])new ItemStack[36]));
                                break block8;
                            }
                            case 2: {
                                Villager villager = (Villager)entity3;
                                inv = villager.getInventory();
                                break block8;
                            }
                            case 3: {
                                AbstractHorse abstractHorse = (AbstractHorse)entity3;
                                inv = ((IMixinAbstractHorseEntity)entity).malilib_getHorseInventory();
                                break block8;
                            }
                            case 4: {
                                AbstractNautilus abstractNautilus = (AbstractNautilus)entity3;
                                inv = ((IMixinAbstractNautilus)entity).malilib_getNautilusInventory();
                                break block8;
                            }
                            case 5: {
                                Piglin piglin = (Piglin)entity3;
                                inv = ((IMixinPiglinEntity)entity).malilib_getInventory();
                                break block8;
                            }
                        }
                        break;
                    }
                }
                return inv;
            }
            return null;
        }
        return this.getEntityInventory(world, entityId, useNbt);
    }

    private void requestQueryBlockEntity(BlockPos pos) {
        if (!Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
            return;
        }
        ClientPacketListener handler = this.getVanillaHandler();
        if (handler != null) {
            this.sentBackupPackets = true;
            handler.getDebugQueryHandler().queryBlockEntityTag(pos, nbtCompound -> this.handleBlockEntityData(pos, (CompoundTag)nbtCompound));
            this.transactionToBlockPosOrEntityId.put(((IMixinDebugQueryHandler)handler.getDebugQueryHandler()).malilib_currentTransactionId(), (Either<BlockPos, Integer>)Either.left((Object)pos));
        }
    }

    private void requestQueryEntityData(int entityId) {
        if (!Configs.Generic.ENTITY_DATA_SYNC_BACKUP.getBooleanValue()) {
            return;
        }
        ClientPacketListener handler = this.getVanillaHandler();
        if (handler != null) {
            this.sentBackupPackets = true;
            handler.getDebugQueryHandler().queryEntityTag(entityId, nbtCompound -> this.handleEntityData(entityId, (CompoundTag)nbtCompound));
            this.transactionToBlockPosOrEntityId.put(((IMixinDebugQueryHandler)handler.getDebugQueryHandler()).malilib_currentTransactionId(), (Either<BlockPos, Integer>)Either.right((Object)entityId));
        }
    }

    private void requestServuxBlockEntityData(BlockPos pos) {
        if (Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue()) {
            HANDLER.encodeClientData(ServuxLitematicaPacket.BlockEntityRequest(pos));
        }
    }

    private void requestServuxEntityData(int entityId) {
        if (Configs.Generic.ENTITY_DATA_SYNC.getBooleanValue()) {
            HANDLER.encodeClientData(ServuxLitematicaPacket.EntityRequest(entityId));
        }
    }

    public void requestServuxBulkEntityData(ChunkPos chunkPos, int minY, int maxY) {
        if (!this.hasServuxServer()) {
            return;
        }
        CompoundTag req = new CompoundTag();
        this.completedChunks.remove(chunkPos);
        this.pendingChunks.add(chunkPos);
        this.pendingChunkTimeout.put(chunkPos, System.currentTimeMillis());
        minY = Mth.clamp((int)minY, (int)-60, (int)319);
        maxY = Mth.clamp((int)maxY, (int)-60, (int)319);
        req.putString("Task", "BulkEntityRequest");
        req.putInt("minY", minY);
        req.putInt("maxY", maxY);
        Litematica.debugLog("EntityDataManager#requestServuxBulkEntityData(): for chunkPos {} to Servux (minY [{}], maxY [{}])", chunkPos.toString(), minY, maxY);
        HANDLER.encodeClientData(ServuxLitematicaPacket.BulkNbtRequest(chunkPos, req));
    }

    public void requestBackupBulkEntityData(ChunkPos chunkPos, int minY, int maxY) {
        ChunkAccess chunk;
        if (!this.getIfReceivedBackupPackets() || this.hasServuxServer()) {
            return;
        }
        this.completedChunks.remove(chunkPos);
        minY = Mth.clamp((int)minY, (int)-60, (int)319);
        maxY = Mth.clamp((int)maxY, (int)-60, (int)319);
        ClientLevel world = this.getClientWorld();
        ChunkAccess chunkAccess = chunk = world != null ? world.getChunk(chunkPos.x(), chunkPos.z(), ChunkStatus.FULL, false) : null;
        if (chunk == null) {
            return;
        }
        BlockPos pos1 = new BlockPos(chunkPos.getMinBlockX(), minY, chunkPos.getMinBlockZ());
        BlockPos pos2 = new BlockPos(chunkPos.getMaxBlockX(), maxY, chunkPos.getMaxBlockZ());
        AABB bb = PositionUtils.createEnclosingAABB(pos1, pos2);
        HashSet teSet = new HashSet(chunk.getBlockEntitiesPos());
        List entList = world.getEntities((Entity)null, bb, EntityUtils.NOT_PLAYER);
        Litematica.debugLog("EntityDataManager#requestBackupBulkEntityData(): for chunkPos {} (minY [{}], maxY [{}]) // Request --> TE: [{}], E: [{}]", chunkPos.toString(), minY, maxY, teSet.size(), entList.size());
        for (BlockPos tePos : teSet) {
            if (tePos.getX() < chunkPos.getMinBlockX() || tePos.getX() > chunkPos.getMaxBlockX() || tePos.getZ() < chunkPos.getMinBlockZ() || tePos.getZ() > chunkPos.getMaxBlockZ() || tePos.getY() < minY || tePos.getY() > maxY) continue;
            this.requestBlockEntityWrapped((Level)world, tePos);
        }
        if (teSet.size() > 0) {
            this.pendingBackupChunk_BlockEntities.put(chunkPos, teSet);
        }
        LinkedHashSet<Integer> entSet = new LinkedHashSet<Integer>();
        for (Entity entity : entList) {
            this.requestEntityWrapped((Level)world, entity.getId());
            entSet.add(entity.getId());
        }
        if (entSet.size() > 0) {
            this.pendingBackupChunk_Entities.put(chunkPos, entSet);
        }
        if (teSet.size() > 0 || entSet.size() > 0) {
            this.pendingChunks.add(chunkPos);
            this.pendingChunkTimeout.put(chunkPos, System.currentTimeMillis());
        } else {
            this.completedChunks.add(chunkPos);
        }
    }

    private boolean markBackupBlockEntityComplete(ChunkPos chunkPos, BlockPos pos) {
        Set<BlockPos> teSet;
        if (!this.getIfReceivedBackupPackets() || this.hasServuxServer()) {
            return true;
        }
        if (Reference.DEBUG_MODE) {
            Litematica.LOGGER.warn("EntityDataManager#markBackupBlockEntityComplete() - Marking ChunkPos {} - Block Entity at [{}] as complete.", (Object)chunkPos.toString(), (Object)pos.toShortString());
        }
        if (this.pendingChunks.contains(chunkPos) && this.pendingBackupChunk_BlockEntities.containsKey(chunkPos) && (teSet = this.pendingBackupChunk_BlockEntities.get(chunkPos)).contains(pos)) {
            teSet.remove(pos);
            if (teSet.isEmpty()) {
                Litematica.debugLog("EntityDataManager#markBackupBlockEntityComplete(): ChunkPos {} - Block Entity List Complete!", chunkPos.toString());
                this.pendingBackupChunk_BlockEntities.remove(chunkPos);
                this.pendingChunks.remove(chunkPos);
                this.pendingChunkTimeout.remove(chunkPos);
                this.completedChunks.add(chunkPos);
                return true;
            }
            this.pendingBackupChunk_BlockEntities.replace(chunkPos, teSet);
        }
        return false;
    }

    private boolean markBackupEntityComplete(ChunkPos chunkPos, int entityId) {
        Set<Integer> entSet;
        if (!this.getIfReceivedBackupPackets() || this.hasServuxServer()) {
            return true;
        }
        if (Reference.DEBUG_MODE) {
            Litematica.LOGGER.warn("EntityDataManager#markBackupEntityComplete() - Marking ChunkPos {} - EntityId [{}] as complete.", (Object)chunkPos.toString(), (Object)entityId);
        }
        if (this.pendingChunks.contains(chunkPos) && this.pendingBackupChunk_Entities.containsKey(chunkPos) && (entSet = this.pendingBackupChunk_Entities.get(chunkPos)).contains(entityId)) {
            entSet.remove(entityId);
            if (entSet.isEmpty()) {
                Litematica.debugLog("EntityDataManager#markBackupEntityComplete(): ChunkPos {} - EntitiyList Complete!", chunkPos.toString());
                this.pendingBackupChunk_Entities.remove(chunkPos);
                this.pendingChunks.remove(chunkPos);
                this.pendingChunkTimeout.remove(chunkPos);
                this.completedChunks.add(chunkPos);
                return true;
            }
            this.pendingBackupChunk_Entities.replace(chunkPos, entSet);
        }
        return false;
    }

    @Nullable
    public BlockEntity handleBlockEntityData(BlockPos pos, CompoundData data) {
        this.getRequestTracker().removeScheduledBlockEntity(pos);
        this.getRequestTracker().setPendingLocalBlockEntityRequest(pos, false);
        if (data == null || this.getClientWorld() == null) {
            return null;
        }
        BlockEntity be = this.getClientWorld().getBlockEntity(pos);
        if (be != null) {
            Identifier id;
            if (!data.contains("id", 8) && (id = BuiltInRegistries.BLOCK_ENTITY_TYPE.getKey((Object)be.getType())) != null) {
                data.putString("id", id.toString());
            }
            this.getCache().removeFromCache(pos);
            this.getCache().addToCache(pos, be, data);
            ChunkPos chunkPos = ChunkPos.containing((BlockPos)pos);
            if (this.loadContainerBlockEntities() && be instanceof Container || this.hasPendingChunk(chunkPos)) {
                NbtView view = NbtView.getReader((CompoundData)data, (RegistryAccess)this.getClientWorld().registryAccess());
                be.loadWithComponents(view.getReader());
            }
            if (this.hasPendingChunk(chunkPos) && !this.hasServuxServer()) {
                this.markBackupBlockEntityComplete(chunkPos, pos);
            }
            return be;
        }
        return null;
    }

    @Nullable
    public Entity handleEntityData(int entityId, CompoundData data) {
        this.getRequestTracker().removeScheduledEntity(entityId);
        this.getRequestTracker().setPendingLocalEntityRequest(entityId, false);
        if (data == null || this.getClientWorld() == null) {
            return null;
        }
        Entity entity = this.getClientWorld().getEntity(entityId);
        if (entity != null) {
            Identifier id;
            if (!data.contains("id", 8) && (id = EntityType.getKey((EntityType)entity.getType())) != null) {
                data.putString("id", id.toString());
            }
            this.getCache().removeFromCache(entityId);
            this.getCache().addToCache(entityId, entity, data);
            if (this.hasPendingChunk(entity.chunkPosition()) && !this.hasServuxServer()) {
                this.markBackupEntityComplete(entity.chunkPosition(), entityId);
            }
        }
        return entity;
    }

    public void handleBulkEntityData(int transactionId, @Nullable CompoundData data) {
        if (data == null || this.getClientWorld() == null) {
            return;
        }
        String task = data.getStringOrDefault("Task", "BulkEntityReply");
        if (task.equals("BulkEntityReply")) {
            int i;
            ListData tileList = data.containsLenient("TileEntities") ? data.getList("TileEntities") : new ListData();
            ListData entityList = data.containsLenient("Entities") ? data.getList("Entities") : new ListData();
            ChunkPos chunkPos = new ChunkPos(data.getInt("chunkX"), data.getInt("chunkZ"));
            this.shouldUseLongTimeout = true;
            for (i = 0; i < tileList.size(); ++i) {
                CompoundData te = tileList.getCompoundAt(i);
                BlockPos pos = DataTypeUtils.readBlockPos((DataView)te);
                this.handleBlockEntityData(pos, te);
            }
            for (i = 0; i < entityList.size(); ++i) {
                CompoundData ent = entityList.getCompoundAt(i);
                int entityId = ent.getInt("entityId");
                this.handleEntityData(entityId, ent);
            }
            this.pendingChunks.remove(chunkPos);
            this.pendingChunkTimeout.remove(chunkPos);
            this.completedChunks.add(chunkPos);
            Litematica.debugLog("EntityDataManager#handleBulkEntityData(): chunkPos {} received TE: [{}], and E: [{}] entiries from Servux", chunkPos.toString(), tileList.size(), entityList.size());
        }
    }

    public void handleVanillaQueryNbt(int transactionId, CompoundData data) {
        Either<BlockPos, Integer> either;
        if (this.checkOpStatus) {
            this.hasOpStatus = true;
            this.checkOpStatus = false;
            this.lastOpCheck = System.currentTimeMillis();
        }
        if ((either = this.transactionToBlockPosOrEntityId.remove(transactionId)) != null) {
            this.receivedBackupPackets = true;
            either.ifLeft(pos -> this.handleBlockEntityData((BlockPos)pos, data)).ifRight(entityId -> this.handleEntityData((int)entityId, data));
        }
    }

    public void handleVanillaQueryNbt(int transactionId, CompoundTag nbt) {
        this.handleVanillaQueryNbt(transactionId, DataConverterNbt.fromVanillaCompound((CompoundTag)nbt));
    }

    public boolean hasPendingChunk(ChunkPos pos) {
        if (this.hasServuxServer() || this.getIfReceivedBackupPackets()) {
            return this.pendingChunks.contains(pos);
        }
        return false;
    }

    private void checkForPendingChunkTimeout(ChunkPos pos) {
        if (this.hasServuxServer() && this.hasPendingChunk(pos) || this.getIfReceivedBackupPackets() && this.hasPendingChunk(pos)) {
            ClientLevel cw = this.getClientWorld();
            long now = System.currentTimeMillis();
            if (cw != null && !fi.dy.masa.litematica.util.WorldUtils.isClientChunkLoaded(cw, pos.x(), pos.z())) {
                this.pendingChunkTimeout.replace(pos, now);
                return;
            }
            long duration = now - this.pendingChunkTimeout.get(pos);
            if (duration > this.getChunkTimeoutMs()) {
                Litematica.debugLog("EntityDataManager#checkForPendingChunkTimeout(): chunkPos {} has timed out waiting for data, marking complete without Receiving Entity Data.", pos.toString());
                this.pendingChunkTimeout.remove(pos);
                this.pendingChunks.remove(pos);
                this.completedChunks.add(pos);
            }
        }
    }

    private long getChunkTimeoutMs() {
        if (this.hasServuxServer()) {
            return 7500L;
        }
        if (this.getIfReceivedBackupPackets()) {
            return 10500L;
        }
        return 1000L;
    }

    public boolean hasCompletedChunk(ChunkPos pos) {
        if (this.hasServuxServer() || this.getIfReceivedBackupPackets()) {
            this.checkForPendingChunkTimeout(pos);
            return this.completedChunks.contains(pos);
        }
        return true;
    }

    public void markCompletedChunkDirty(ChunkPos pos) {
        if (this.hasServuxServer() || this.getIfReceivedBackupPackets()) {
            this.completedChunks.remove(pos);
        }
    }

    public JsonObject toJson() {
        return new JsonObject();
    }

    public void fromJson(JsonObject obj) {
    }
}

