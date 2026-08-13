/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.authlib.GameProfile
 *  com.mojang.serialization.DynamicOps
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.nbt.NbtView
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.entity.ClientMannequin
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.UUIDUtil
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.nbt.NbtOps
 *  net.minecraft.network.chat.ComponentSerialization
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.EntitySpawnReason
 *  net.minecraft.world.entity.EntitySpawnRequest
 *  net.minecraft.world.entity.EntityType
 *  net.minecraft.world.entity.EntityTypes
 *  net.minecraft.world.entity.Leashable
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.decoration.LeashFenceKnotEntity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.storage.ValueInput
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  org.apache.commons.lang3.tuple.Pair
 *  org.jetbrains.annotations.ApiStatus$Experimental
 */
package fi.dy.masa.litematica.util;

import com.mojang.authlib.GameProfile;
import com.mojang.serialization.DynamicOps;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.mixin.entity.IMixinEntity;
import fi.dy.masa.litematica.mixin.world.IMixinLevel;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.nbt.NbtView;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.entity.ClientMannequin;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.UUIDUtil;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.NbtOps;
import net.minecraft.network.chat.ComponentSerialization;
import net.minecraft.resources.Identifier;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntitySpawnRequest;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.EntityTypes;
import net.minecraft.world.entity.Leashable;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.decoration.LeashFenceKnotEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import org.apache.commons.lang3.tuple.Pair;
import org.jetbrains.annotations.ApiStatus;

public class EntityUtils {
    public static final Predicate<Entity> NOT_PLAYER = entity -> !(entity instanceof Player);
    private static final ThreadLocalRandom RAND = ThreadLocalRandom.current();
    private static boolean entityDebugRandom;
    private static boolean entityDebugRandom2;

    public static boolean isCreativeMode(Player player) {
        return player.getAbilities().instabuild;
    }

    public static boolean hasToolItem(LivingEntity entity) {
        return EntityUtils.hasToolItemInHand(entity, InteractionHand.MAIN_HAND) || EntityUtils.hasToolItemInHand(entity, InteractionHand.OFF_HAND);
    }

    public static boolean hasToolItemInHand(LivingEntity entity, InteractionHand hand) {
        if (DataManager.getInstance().hasToolItemComponents()) {
            ItemStack toolItem = DataManager.getInstance().getToolItemComponents();
            ItemStack stackHand = entity.getItemInHand(hand);
            if (toolItem != null) {
                return InventoryUtils.areStacksAndNbtEqual((ItemStack)toolItem, (ItemStack)stackHand);
            }
            return false;
        }
        ItemStack toolItem = DataManager.getToolItem();
        if (toolItem.isEmpty()) {
            return entity.getMainHandItem().isEmpty();
        }
        ItemStack stackHand = entity.getItemInHand(hand);
        return InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)toolItem, (ItemStack)stackHand);
    }

    @Nullable
    public static InteractionHand getUsedHandForItem(Player player, ItemStack stack) {
        InteractionHand hand = null;
        if (InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)player.getMainHandItem(), (ItemStack)stack)) {
            hand = InteractionHand.MAIN_HAND;
        } else if (player.getMainHandItem().isEmpty() && InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)player.getOffhandItem(), (ItemStack)stack)) {
            hand = InteractionHand.OFF_HAND;
        }
        return hand;
    }

    public static boolean areStacksEqualIgnoreDurability(ItemStack stack1, ItemStack stack2) {
        return InventoryUtils.areStacksEqualIgnoreDurability((ItemStack)stack1, (ItemStack)stack2);
    }

    public static Direction getHorizontalLookingDirection(Entity entity) {
        return Direction.fromYRot((double)entity.getYRot());
    }

    public static Direction getVerticalLookingDirection(Entity entity) {
        return entity.getXRot() > 0.0f ? Direction.DOWN : Direction.UP;
    }

    public static Direction getClosestLookingDirection(Entity entity) {
        if (entity.getXRot() > 60.0f) {
            return Direction.DOWN;
        }
        if (-entity.getXRot() > 60.0f) {
            return Direction.UP;
        }
        return EntityUtils.getHorizontalLookingDirection(entity);
    }

    @Nullable
    public static <T extends Entity> T findEntityByUUID(List<T> list, UUID uuid) {
        if (uuid == null) {
            return null;
        }
        for (Entity entity : list) {
            if (!entity.getUUID().equals(uuid)) continue;
            return (T)entity;
        }
        return null;
    }

    public static void initEntityUtils() {
        entityDebugRandom = RAND.nextBoolean();
        entityDebugRandom2 = RAND.nextBoolean();
    }

    private static boolean isSakura(GameProfile profile) {
        return profile.name().equalsIgnoreCase("sakuraryoko");
    }

    private static boolean isGoat(GameProfile profile) {
        return profile.name().equalsIgnoreCase("docm77");
    }

    public static Pair<String, String> getEntityDebug() {
        String name;
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null) {
            return Pair.of((Object)"", (Object)"");
        }
        if (EntityUtils.isSakura(mc.player.getGameProfile())) {
            return Pair.of((Object)"Sakuramatica", (Object)"The Sakura Goddess Herself.");
        }
        if (EntityUtils.isGoat(mc.player.getGameProfile())) {
            return Pair.of((Object)"Goatmatica", (Object)"Grind. Optimize. Automate. Thrive.");
        }
        if (!entityDebugRandom) {
            return Pair.of((Object)"", (Object)"");
        }
        switch (name = mc.player.getGameProfile().name().toLowerCase()) {
            case "sakuraryoko": {
                return Pair.of((Object)"Sakuramatica", (Object)"The Sakura Goddess Herself.");
            }
            case "docm77": {
                return Pair.of((Object)"Goatmatica", (Object)"Grind. Optimize. Automate. Thrive.");
            }
            case "xisuma": 
            case "xisumavoid": {
                return entityDebugRandom2 ? Pair.of((Object)"Xisumatica", (Object)"Chief architect & humble leader.") : Pair.of((Object)"Xisumatica", (Object)"Check out Soulside Eclipse on Spotify.");
            }
            case "renthedog": 
            case "rendog": {
                return entityDebugRandom2 ? Pair.of((Object)"Dogmatica", (Object)"Gigacorps' most famous employee.") : Pair.of((Object)"Renmatica", (Object)"Docm77's single ladies' favorite.");
            }
            case "geminitay": {
                return entityDebugRandom2 ? Pair.of((Object)"Slaymatica", (Object)"God's favorite Princess.") : Pair.of((Object)"Slaymatica", (Object)"Hermitcraft's chief remover of heads.");
            }
            case "pearlescentmoon": {
                return entityDebugRandom2 ? Pair.of((Object)"Pearlmatica", (Object)"The queen of aussie ping.") : Pair.of((Object)"", (Object)"");
            }
            case "falsesymmetry": {
                return entityDebugRandom2 ? Pair.of((Object)"Queenmatica", (Object)"The Queen of Hearts, Heads, and Body Parts.") : Pair.of((Object)"", (Object)"");
            }
            case "tango": {
                return entityDebugRandom2 ? Pair.of((Object)"Tangomatica", (Object)"The Dungeon Master.") : Pair.of((Object)"Tangomatica", (Object)"Master of the thingificator.");
            }
            case "etho": 
            case "ethoslab": {
                return entityDebugRandom2 ? Pair.of((Object)"Slabmatica", (Object)"The Canadian legend.") : Pair.of((Object)"", (Object)"");
            }
            case "ijevin": {
                return entityDebugRandom2 ? Pair.of((Object)"iJevinatica", (Object)"iJevin's favorite mod suite (thank you!)") : Pair.of((Object)"", (Object)"");
            }
            case "cubfan135": {
                return entityDebugRandom2 ? Pair.of((Object)"Cubmatica", (Object)"Ladies and gentlemen; Beautiful, absolutely beautiful.") : Pair.of((Object)"", (Object)"");
            }
            case "smajor1995": {
                return entityDebugRandom2 ? Pair.of((Object)"Scottmatica", (Object)"The most friendly and soothing voice in the game.") : Pair.of((Object)"", (Object)"");
            }
            case "shubbleyt": {
                return entityDebugRandom2 ? Pair.of((Object)"Starmatica", (Object)"Red Mushroom blocks are soo underrated.") : Pair.of((Object)"", (Object)"");
            }
            case "goodtimewithscar": {
                return entityDebugRandom2 ? Pair.of((Object)"Scarmatica", (Object)"The Ore Snatcher.") : Pair.of((Object)"Scarmatica", (Object)"Architect of the whimsy.");
            }
            case "joehillssays": 
            case "joehillstsd": {
                return entityDebugRandom2 ? Pair.of((Object)"Joematica", (Object)"One of the True Hermits.") : Pair.of((Object)"Hillsmatica", (Object)"Howdy y'all from Nashville, TN!");
            }
        }
        return Pair.of((Object)"", (Object)"");
    }

    @Nullable
    public static String getEntityId(Entity entity) {
        EntityType entitytype = entity.getType();
        Identifier id = EntityType.getKey((EntityType)entitytype);
        return entitytype.canSerialize() && id != null ? id.toString() : null;
    }

    @Nullable
    private static Entity createEntityFromNBTSingle(CompoundTag nbt, Level world) {
        try {
            NbtView view = NbtView.getReader((CompoundTag)nbt, (RegistryAccess)world.registryAccess());
            Optional optional = EntityType.create((ValueInput)view.getReader(), (Level)world, (EntitySpawnRequest)new EntitySpawnRequest(EntitySpawnReason.LOAD, true));
            if (optional.isPresent()) {
                Entity entity = (Entity)optional.get();
                if (entity.getType().equals(EntityTypes.MANNEQUIN)) {
                    ClientMannequin cm = new ClientMannequin(world, Minecraft.getInstance().playerSkinRenderCache());
                    cm.load(view.getReader());
                    entity = cm;
                }
                if (!nbt.contains("UUID")) {
                    entity.setUUID(UUID.randomUUID());
                }
                if (nbt.contains("LastEntityID")) {
                    entity.setId(nbt.getIntOr("LastEntityID", -1));
                } else if (world instanceof WorldSchematic) {
                    WorldSchematic ws = (WorldSchematic)world;
                    entity.setId(RAND.nextInt(ws.getLastUsedEntityId() * 4, Integer.MAX_VALUE));
                } else {
                    entity.setId(RAND.nextInt(50000, Integer.MAX_VALUE));
                }
                if (Reference.DEBUG_MODE) {
                    Litematica.LOGGER.warn("[EntityUtils] createEntityFromNBTSingle() successful; id({}) [{}/{}]", (Object)entity.getId(), (Object)entity.getStringUUID(), (Object)entity.getType().getDescription().getString());
                }
                return entity;
            }
        }
        catch (Exception err) {
            Litematica.LOGGER.error("createEntityFromNBTSingle: Exception; {}", (Object)err.getLocalizedMessage());
        }
        return null;
    }

    @Nullable
    public static Entity createEntityAndPassengersFromNBT(CompoundTag nbt, Level world) {
        Entity entity = EntityUtils.createEntityFromNBTSingle(nbt, world);
        if (entity == null) {
            return null;
        }
        if (nbt.contains("Passengers")) {
            ListTag taglist = nbt.getListOrEmpty("Passengers");
            for (int i = 0; i < taglist.size(); ++i) {
                Entity passenger = EntityUtils.createEntityAndPassengersFromNBT(taglist.getCompoundOrEmpty(i), world);
                if (passenger == null) continue;
                passenger.startRiding(entity, true, false);
            }
        }
        return entity;
    }

    public static void spawnEntityAndPassengersInWorld(Entity entity, Level world) {
        boolean result;
        if (world instanceof WorldSchematic) {
            WorldSchematic ws = (WorldSchematic)world;
            result = ws.addFreshEntitySafe(entity);
        } else {
            if (!Configs.Generic.DEDUPLICATE_SCHEMATIC_ENTITIES.getBooleanValue()) {
                Entity other = world.getEntity(entity.getId());
                if (other != null) {
                    entity.setId(RAND.nextInt(entity.getId() * 4, Integer.MAX_VALUE));
                }
                if ((other = world.getEntity(entity.getUUID())) != null) {
                    entity.setUUID(UUID.randomUUID());
                }
            }
            try {
                result = world.addFreshEntity(entity);
            }
            catch (Exception e) {
                Litematica.LOGGER.error("EntityUtils#spawnEntityAndPassengersInWorld(): Exception; id({}): [{}/{}]; {}", (Object)entity.getId(), (Object)entity.getStringUUID(), (Object)entity.getType().getDescription().getString(), (Object)e.getLocalizedMessage());
                result = false;
            }
        }
        if (result && entity.isVehicle()) {
            for (Entity passenger : entity.getPassengers()) {
                Vec3 adjPos = entity.getPassengerRidingPosition(passenger);
                passenger.snapTo(adjPos.x(), adjPos.y(), adjPos.z(), passenger.getYRot(), passenger.getXRot());
                EntityUtils.setEntityRotations(passenger, passenger.getYRot(), passenger.getXRot());
                EntityUtils.spawnEntityAndPassengersInWorld(passenger, world);
                entity.positionRider(passenger);
            }
        }
    }

    public static void setEntityRotations(Entity entity, float yaw, float pitch) {
        entity.setYRot(yaw);
        entity.yRotO = yaw;
        entity.setXRot(pitch);
        entity.xRotO = pitch;
        if (entity instanceof LivingEntity) {
            LivingEntity livingBase = (LivingEntity)entity;
            livingBase.yHeadRot = yaw;
            livingBase.yBodyRot = yaw;
            livingBase.yHeadRotO = yaw;
            livingBase.yBodyRotO = yaw;
        }
    }

    public static List<Entity> getEntitiesWithinSubRegion(Level world, BlockPos origin, BlockPos regionPos, BlockPos regionSize, SchematicPlacement schematicPlacement, SubRegionPlacement placement) {
        BlockPos regionPosRelTransformed = PositionUtils.getTransformedBlockPos(regionPos, schematicPlacement.getMirror(), schematicPlacement.getRotation());
        BlockPos posEndAbs = PositionUtils.getTransformedPlacementPosition(regionSize.offset(-1, -1, -1), schematicPlacement, placement).offset((Vec3i)regionPosRelTransformed).offset((Vec3i)origin);
        BlockPos regionPosAbs = regionPosRelTransformed.offset((Vec3i)origin);
        AABB bb = PositionUtils.createEnclosingAABB(regionPosAbs, posEndAbs);
        return world.getEntities((Entity)null, bb, NOT_PLAYER);
    }

    public static boolean shouldPickBlock(Player player) {
        return Configs.Generic.PICK_BLOCK_ENABLED.getBooleanValue() && (!Configs.Generic.TOOL_ITEM_ENABLED.getBooleanValue() || !EntityUtils.hasToolItem((LivingEntity)player)) && Configs.Visuals.ENABLE_RENDERING.getBooleanValue() && Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue();
    }

    @Deprecated
    public static void loadNbtIntoEntity(Entity entity, CompoundTag nbt) {
        entity.fallDistance = nbt.getFloatOr("FallDistance", 0.0f);
        entity.setRemainingFireTicks((int)nbt.getShortOr("Fire", (short)0));
        if (nbt.contains("Air")) {
            entity.setAirSupply((int)nbt.getShortOr("Air", (short)0));
        }
        entity.setOnGround(nbt.getBooleanOr("OnGround", true));
        entity.setInvulnerable(nbt.getBooleanOr("Invulnerable", false));
        entity.setPortalCooldown(nbt.getIntOr("PortalCooldown", 0));
        if (nbt.contains("UUID")) {
            entity.setUUID(nbt.read("UUID", UUIDUtil.AUTHLIB_CODEC, (DynamicOps)entity.registryAccess().createSerializationContext((DynamicOps)NbtOps.INSTANCE)).orElse(UUID.randomUUID()));
        }
        if (nbt.contains("CustomName")) {
            nbt.read("CustomName", ComponentSerialization.CODEC).ifPresent(arg_0 -> ((Entity)entity).setCustomName(arg_0));
        }
        entity.setCustomNameVisible(nbt.getBooleanOr("CustomNameVisible", false));
        entity.setSilent(nbt.getBooleanOr("Silent", false));
        entity.setNoGravity(nbt.getBooleanOr("NoGravity", false));
        entity.setGlowingTag(nbt.getBooleanOr("Glowing", false));
        entity.setTicksFrozen(nbt.getIntOr("TicksFrozen", 0));
        if (nbt.contains("Tags")) {
            entity.entityTags().clear();
            ListTag nbtList4 = nbt.getListOrEmpty("Tags");
            int max = Math.min(nbtList4.size(), 1024);
            for (int i = 0; i < max; ++i) {
                entity.entityTags().add(nbtList4.getStringOr(i, ""));
            }
        }
        if (entity instanceof Leashable) {
            EntityUtils.readLeashableEntityCustomData(entity, nbt);
        } else {
            NbtView view = NbtView.getReader((CompoundTag)nbt, (RegistryAccess)entity.registryAccess());
            ((IMixinEntity)entity).litematica_readCustomData(view.getReader());
        }
    }

    @Deprecated
    private static void readLeashableEntityCustomData(Entity entity, CompoundTag nbt) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.level == null) {
            return;
        }
        assert (entity instanceof Leashable);
        Leashable leashable = (Leashable)entity;
        NbtView view = NbtView.getReader((CompoundTag)nbt, (RegistryAccess)mc.level.registryAccess());
        ((IMixinEntity)entity).litematica_readCustomData(view.getReader());
        if (leashable.getLeashData() != null && leashable.getLeashData().delayedLeashInfo != null) {
            leashable.getLeashData().delayedLeashInfo.ifLeft(uuid -> leashable.setLeashedTo((Entity)((IMixinLevel)mc.level).litematica_getEntityLookup().get(uuid), false)).ifRight(pos -> leashable.setLeashedTo((Entity)LeashFenceKnotEntity.getOrCreateKnot((Level)mc.level, (BlockPos)pos), false));
        }
    }

    @ApiStatus.Experimental
    public static boolean setFakedSneakingState(boolean sneaking) {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc.player;
        if (player != null && player.isShiftKeyDown() != sneaking) {
            player.setShiftKeyDown(sneaking);
            return true;
        }
        return false;
    }

    @Nullable
    @ApiStatus.Experimental
    public static InteractionHand getUsedHandForItem(LivingEntity entity, ItemStack stack, boolean lenient) {
        InteractionHand hand = null;
        InteractionHand tmpHand = entity.getMainHandItem().isEmpty() ? InteractionHand.OFF_HAND : InteractionHand.MAIN_HAND;
        ItemStack handStack = entity.getItemInHand(tmpHand);
        if (lenient && InventoryUtils.areStacksEqualIgnoreDurability((ItemStack)handStack, (ItemStack)stack) || lenient && InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)handStack, (ItemStack)stack) || !lenient && InventoryUtils.areStacksEqual((ItemStack)handStack, (ItemStack)stack)) {
            hand = tmpHand;
        }
        return hand;
    }

    public static ListTag updatePassengersToRelativeRegionPos(ListTag passengers, BlockPos relPos) {
        ListTag newList = new ListTag();
        for (int i = 0; i < passengers.size(); ++i) {
            CompoundTag entry = passengers.getCompoundOrEmpty(i);
            if (entry.isEmpty()) continue;
            if (entry.contains("Pos")) {
                Vec3 pos = entry.read("Pos", Vec3.CODEC).orElse(Vec3.ZERO);
                Vec3 adjPos = new Vec3(pos.x() - (double)relPos.getX(), pos.y() - (double)relPos.getY(), pos.z() - (double)relPos.getZ());
                entry.store("Pos", Vec3.CODEC, (Object)adjPos);
                newList.add((Object)entry);
                continue;
            }
            newList.add((Object)entry);
        }
        return newList;
    }
}

