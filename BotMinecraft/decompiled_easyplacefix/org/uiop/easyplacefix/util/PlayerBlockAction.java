/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.state.BlockState
 */
package org.uiop.easyplacefix.util;

import com.tick_ins.packet.Ping2Server;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import org.uiop.easyplacefix.EasyPlaceFix;
import org.uiop.easyplacefix.config.easyPlacefixConfig;

public class PlayerBlockAction {

    public static class useItemOnAction {
        public static boolean modifyBoolean = false;
        public static Map<BlockPos, Long> lastPlacementTimeMap = new ConcurrentHashMap<BlockPos, Long>();
        public static BlockState pistonBlockState = null;
        private static volatile long lastGlobalPlacementTime = 0L;
        private static final long PLACEMENT_OVERRIDE_TTL_MS = 1200L;
        private static final int PLACEMENT_OVERRIDE_MAX_SIZE = 512;
        private static final int PLACEMENT_OVERRIDE_USES = 4;
        private static final ConcurrentLinkedDeque<PlacementStateOverride> placementStateOverrides = new ConcurrentLinkedDeque();

        private static void pruneExpiredOverrides() {
            long now = System.currentTimeMillis();
            Iterator<PlacementStateOverride> iterator = placementStateOverrides.iterator();
            while (iterator.hasNext()) {
                PlacementStateOverride entry = iterator.next();
                if (entry.expiresAt >= now && !entry.exhausted()) continue;
                iterator.remove();
            }
        }

        public static void armPlacementStateOverride(BlockPos targetPos, BlockState state, Direction hitSide) {
            if (state == null || targetPos == null) {
                return;
            }
            useItemOnAction.pruneExpiredOverrides();
            placementStateOverrides.addLast(new PlacementStateOverride(targetPos.immutable(), state.getBlock().getClass(), hitSide, state, System.currentTimeMillis() + 1200L, 4));
            while (placementStateOverrides.size() > 512) {
                placementStateOverrides.pollFirst();
            }
        }

        public static BlockState consumePlacementStateOverrideFor(Class<? extends Block> blockClass, BlockPos targetPos) {
            PlacementStateOverride entry;
            if (blockClass == null || targetPos == null) {
                return null;
            }
            useItemOnAction.pruneExpiredOverrides();
            Iterator<PlacementStateOverride> iterator = placementStateOverrides.descendingIterator();
            while (iterator.hasNext()) {
                entry = iterator.next();
                if (!useItemOnAction.matchesPlacementOverride(entry, blockClass, targetPos, false) || !entry.consumeOneUse()) continue;
                if (entry.exhausted()) {
                    iterator.remove();
                }
                return entry.state;
            }
            iterator = placementStateOverrides.descendingIterator();
            while (iterator.hasNext()) {
                entry = iterator.next();
                if (!useItemOnAction.matchesPlacementOverride(entry, blockClass, targetPos, true) || !entry.consumeOneUse()) continue;
                if (entry.exhausted()) {
                    iterator.remove();
                }
                return entry.state;
            }
            return null;
        }

        private static boolean matchesPlacementOverride(PlacementStateOverride entry, Class<? extends Block> blockClass, BlockPos targetPos, boolean allowOffsetFallback) {
            if (!blockClass.isAssignableFrom(entry.blockClass) || !blockClass.isInstance(entry.state.getBlock())) {
                return false;
            }
            if (entry.targetPos.equals((Object)targetPos)) {
                return true;
            }
            return allowOffsetFallback && entry.hitSide != null && entry.targetPos.relative(entry.hitSide).equals((Object)targetPos);
        }

        public static void clearPlacementStateOverride() {
            placementStateOverrides.clear();
        }

        public static boolean isGlobalPlacementCooling() {
            long delayMs;
            int delayTicks = easyPlacefixConfig.getEffectivePlacementDelayTicks();
            if (delayTicks <= 0) {
                return false;
            }
            long now = System.currentTimeMillis();
            return now - lastGlobalPlacementTime < (delayMs = (long)delayTicks * 50L);
        }

        public static void markGlobalPlacement() {
            lastGlobalPlacementTime = System.currentTimeMillis();
        }

        public static boolean isPlacementCooling(BlockPos pos) {
            long now = System.currentTimeMillis();
            long threshold = Ping2Server.getRtt() + 100;
            if (lastPlacementTimeMap.size() > 256) {
                lastPlacementTimeMap.entrySet().removeIf(e -> now - (Long)e.getValue() > 10000L);
            }
            if (lastPlacementTimeMap.containsKey(pos)) {
                long lastPlaceTime = lastPlacementTimeMap.get(pos);
                if (now - lastPlaceTime > threshold) {
                    lastPlacementTimeMap.put(pos, now);
                    return false;
                }
                if (EasyPlaceFix.LOGGER.isDebugEnabled()) {
                    EasyPlaceFix.LOGGER.debug("EasyPlace cooldown hit at {} (elapsed={}ms, threshold={}ms)", new Object[]{pos, now - lastPlaceTime, threshold});
                }
                return true;
            }
            lastPlacementTimeMap.put(pos, now);
            return false;
        }

        private static final class PlacementStateOverride {
            private final BlockPos targetPos;
            private final Class<? extends Block> blockClass;
            private final Direction hitSide;
            private final BlockState state;
            private final long expiresAt;
            private int usesLeft;

            private PlacementStateOverride(BlockPos targetPos, Class<? extends Block> blockClass, Direction hitSide, BlockState state, long expiresAt, int usesLeft) {
                this.targetPos = targetPos;
                this.blockClass = blockClass;
                this.hitSide = hitSide;
                this.state = state;
                this.expiresAt = expiresAt;
                this.usesLeft = usesLeft;
            }

            private synchronized boolean consumeOneUse() {
                if (this.usesLeft <= 0) {
                    return false;
                }
                --this.usesLeft;
                return true;
            }

            private synchronized boolean exhausted() {
                return this.usesLeft <= 0;
            }
        }
    }

    public static class openSignEditorAction {
        public static volatile int count = 0;

        public static boolean run() {
            return count == 0;
        }
    }

    public static class openScreenAction {
        public static volatile int count = 0;

        public static boolean run() {
            return count == 0;
        }
    }
}

