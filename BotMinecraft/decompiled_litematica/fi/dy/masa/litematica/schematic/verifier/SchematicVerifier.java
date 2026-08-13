/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ArrayListMultimap
 *  com.google.common.collect.HashMultimap
 *  com.google.common.collect.ImmutableMap
 *  com.google.common.collect.Lists
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Position
 *  net.minecraft.core.Vec3i
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.chunk.ChunkAccess
 *  net.minecraft.world.level.chunk.LevelChunk
 *  org.apache.commons.lang3.tuple.MutablePair
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.schematic.verifier;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.infohud.IInfoHudRenderer;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.render.infohud.RenderPhase;
import fi.dy.masa.litematica.scheduler.TaskScheduler;
import fi.dy.masa.litematica.scheduler.tasks.TaskBase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.litematica.util.IgnoreBlockRegistry;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Position;
import net.minecraft.core.Vec3i;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.LevelChunk;
import org.apache.commons.lang3.tuple.MutablePair;
import org.apache.commons.lang3.tuple.Pair;

public class SchematicVerifier
extends TaskBase
implements IInfoHudRenderer {
    private static final MutablePair<BlockState, BlockState> MUTABLE_PAIR = new MutablePair();
    private static final BlockPos.MutableBlockPos MUTABLE_POS = new BlockPos.MutableBlockPos();
    private static final List<SchematicVerifier> ACTIVE_VERIFIERS = new ArrayList<SchematicVerifier>();
    private final ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> missingBlocksPositions = ArrayListMultimap.create();
    private final ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> extraBlocksPositions = ArrayListMultimap.create();
    private final ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> wrongBlocksPositions = ArrayListMultimap.create();
    private final ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> wrongStatesPositions = ArrayListMultimap.create();
    private final ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> diffBlocksPositions = ArrayListMultimap.create();
    private final Object2IntOpenHashMap<BlockState> correctStateCounts = new Object2IntOpenHashMap();
    private final Object2ObjectOpenHashMap<BlockPos, BlockMismatch> blockMismatches = new Object2ObjectOpenHashMap();
    private final HashSet<Pair<BlockState, BlockState>> ignoredMismatches = new HashSet();
    private final List<BlockPos> missingBlocksPositionsClosest = new ArrayList<BlockPos>();
    private final List<BlockPos> extraBlocksPositionsClosest = new ArrayList<BlockPos>();
    private final List<BlockPos> mismatchedBlocksPositionsClosest = new ArrayList<BlockPos>();
    private final List<BlockPos> mismatchedStatesPositionsClosest = new ArrayList<BlockPos>();
    private final List<BlockPos> diffBlocksPositionsClosest = new ArrayList<BlockPos>();
    private final Set<MismatchType> selectedCategories = new HashSet<MismatchType>();
    private final HashMultimap<MismatchType, BlockMismatch> selectedEntries = HashMultimap.create();
    private final Set<ChunkPos> requiredChunks = new HashSet<ChunkPos>();
    private final Set<BlockPos> recheckQueue = new HashSet<BlockPos>();
    private final Minecraft mc = Minecraft.getInstance();
    private ClientLevel worldClient;
    private WorldSchematic worldSchematic;
    private SchematicPlacement schematicPlacement;
    private final List<MismatchRenderPos> mismatchPositionsForRender = new ArrayList<MismatchRenderPos>();
    private final List<BlockPos> mismatchBlockPositionsForRender = new ArrayList<BlockPos>();
    private SortCriteria sortCriteria = SortCriteria.NAME_EXPECTED;
    private boolean sortReverse;
    private boolean verificationStarted;
    private boolean verificationActive;
    private boolean shouldRenderInfoHud = true;
    private int totalRequiredChunks;
    private int schematicBlocks;
    private int clientBlocks;
    private int correctStatesCount;
    private IgnoreBlockRegistry ignoreBlockRegistry;

    public SchematicVerifier() {
        this.name = StringUtils.translate((String)"litematica.gui.label.schematic_verifier.verifier", (Object[])new Object[0]);
    }

    public static void clearActiveVerifiers() {
        ACTIVE_VERIFIERS.clear();
    }

    public static void markVerifierBlockChanges(BlockPos pos) {
        for (SchematicVerifier activeVerifier : ACTIVE_VERIFIERS) {
            activeVerifier.markBlockChanged(pos);
        }
    }

    @Override
    public boolean getShouldRenderText(RenderPhase phase) {
        return this.shouldRenderInfoHud && phase == RenderPhase.POST && Configs.InfoOverlays.VERIFIER_OVERLAY_ENABLED.getBooleanValue();
    }

    public void toggleShouldRenderInfoHUD() {
        this.shouldRenderInfoHud = !this.shouldRenderInfoHud;
    }

    public boolean isActive() {
        return this.verificationActive;
    }

    public boolean isPaused() {
        return this.verificationStarted && !this.verificationActive && !this.finished;
    }

    public boolean isFinished() {
        return this.finished;
    }

    public int getTotalChunks() {
        return this.totalRequiredChunks;
    }

    public int getUnseenChunks() {
        return this.requiredChunks.size();
    }

    public int getSchematicTotalBlocks() {
        return this.schematicBlocks;
    }

    public int getRealWorldTotalBlocks() {
        return this.clientBlocks;
    }

    public int getMissingBlocks() {
        return this.missingBlocksPositions.size();
    }

    public int getExtraBlocks() {
        return this.extraBlocksPositions.size();
    }

    public int getMismatchedBlocks() {
        return this.wrongBlocksPositions.size();
    }

    public int getMismatchedStates() {
        return this.wrongStatesPositions.size();
    }

    public int getDiffBlocks() {
        return this.diffBlocksPositions.size();
    }

    public int getCorrectStatesCount() {
        return this.correctStatesCount;
    }

    public int getTotalErrors() {
        return this.getMismatchedBlocks() + this.getMismatchedStates() + this.getExtraBlocks() + this.getMissingBlocks() + this.getDiffBlocks();
    }

    public SortCriteria getSortCriteria() {
        return this.sortCriteria;
    }

    public boolean getSortInReverse() {
        return this.sortReverse;
    }

    public void setSortCriteria(SortCriteria criteria) {
        if (this.sortCriteria == criteria) {
            this.sortReverse = !this.sortReverse;
        } else {
            this.sortCriteria = criteria;
            this.sortReverse = criteria != SortCriteria.COUNT;
        }
    }

    public void toggleMismatchCategorySelected(MismatchType type) {
        if (type == MismatchType.CORRECT_STATE) {
            return;
        }
        if (this.selectedCategories.contains((Object)type)) {
            this.selectedCategories.remove((Object)type);
        } else {
            this.selectedCategories.add(type);
            this.removeSelectedEntriesOfType(type);
        }
        this.updateMismatchOverlays();
    }

    public void toggleMismatchEntrySelected(BlockMismatch mismatch) {
        MismatchType type = mismatch.mismatchType;
        if (this.selectedEntries.containsValue((Object)mismatch)) {
            this.selectedEntries.remove((Object)type, (Object)mismatch);
        } else {
            this.selectedCategories.remove((Object)type);
            this.selectedEntries.put((Object)type, (Object)mismatch);
        }
        this.updateMismatchOverlays();
    }

    private void removeSelectedEntriesOfType(MismatchType type) {
        this.selectedEntries.removeAll((Object)type);
    }

    public boolean isMismatchCategorySelected(MismatchType type) {
        return this.selectedCategories.contains((Object)type);
    }

    public boolean isMismatchEntrySelected(BlockMismatch mismatch) {
        return this.selectedEntries.containsValue((Object)mismatch);
    }

    private void clearActiveMismatchRenderPositions() {
        this.mismatchPositionsForRender.clear();
        this.mismatchBlockPositionsForRender.clear();
        this.infoHudLines.clear();
    }

    public List<MismatchRenderPos> getSelectedMismatchPositionsForRender() {
        return this.mismatchPositionsForRender;
    }

    public List<BlockPos> getSelectedMismatchBlockPositionsForRender() {
        return this.mismatchBlockPositionsForRender;
    }

    @Override
    public boolean shouldRemove() {
        return !this.canExecute();
    }

    @Override
    public boolean execute(ProfilerFiller profiler) {
        this.verifyChunks(profiler);
        this.checkChangedPositions(profiler);
        return false;
    }

    @Override
    public void stop() {
    }

    public void startVerification(ClientLevel worldClient, WorldSchematic worldSchematic, SchematicPlacement schematicPlacement, ICompletionListener completionListener) {
        this.reset();
        this.worldClient = worldClient;
        this.worldSchematic = worldSchematic;
        this.schematicPlacement = schematicPlacement;
        this.ignoreBlockRegistry = new IgnoreBlockRegistry();
        this.setCompletionListener(completionListener);
        this.requiredChunks.addAll(schematicPlacement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.ANY));
        this.totalRequiredChunks = this.requiredChunks.size();
        this.verificationStarted = true;
        TaskScheduler.getInstanceClient().scheduleTask(this, 10);
        InfoHud.getInstance().addInfoHudRenderer(this, true);
        ACTIVE_VERIFIERS.add(this);
        this.verificationActive = true;
        this.updateRequiredChunksStringList();
    }

    public void resume() {
        if (this.verificationStarted) {
            this.verificationActive = true;
            this.updateRequiredChunksStringList();
        }
    }

    public void stopVerification() {
        this.verificationActive = false;
    }

    public void reset() {
        this.stopVerification();
        this.clearReferences();
        this.clearData();
    }

    private void clearReferences() {
        this.worldClient = null;
        this.worldSchematic = null;
        this.schematicPlacement = null;
    }

    private void clearData() {
        this.verificationActive = false;
        this.verificationStarted = false;
        this.finished = false;
        this.totalRequiredChunks = 0;
        this.correctStatesCount = 0;
        this.schematicBlocks = 0;
        this.clientBlocks = 0;
        this.requiredChunks.clear();
        this.recheckQueue.clear();
        this.missingBlocksPositions.clear();
        this.diffBlocksPositions.clear();
        this.extraBlocksPositions.clear();
        this.wrongBlocksPositions.clear();
        this.wrongStatesPositions.clear();
        this.blockMismatches.clear();
        this.correctStateCounts.clear();
        this.selectedCategories.clear();
        this.selectedEntries.clear();
        this.mismatchBlockPositionsForRender.clear();
        this.mismatchPositionsForRender.clear();
        ACTIVE_VERIFIERS.remove(this);
        TaskScheduler.getInstanceClient().removeTask(this);
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        this.clearActiveMismatchRenderPositions();
    }

    public void markBlockChanged(BlockPos pos) {
        BlockMismatch mismatch;
        if (this.finished && (mismatch = (BlockMismatch)this.blockMismatches.get((Object)pos)) != null) {
            this.recheckQueue.add(pos.immutable());
        }
    }

    private void checkChangedPositions(ProfilerFiller profiler) {
        profiler.push("verify_check_pos");
        if (this.finished && !this.recheckQueue.isEmpty()) {
            Iterator<BlockPos> iter = this.recheckQueue.iterator();
            while (iter.hasNext()) {
                BlockPos pos = iter.next();
                boolean isLoadedClient = this.worldClient.hasChunkAt(pos);
                boolean isLoadedSchematic = this.worldSchematic.hasChunkAt(pos);
                if (!isLoadedClient || !isLoadedSchematic) continue;
                BlockMismatch mismatch = (BlockMismatch)this.blockMismatches.get((Object)pos);
                if (mismatch != null) {
                    this.blockMismatches.remove((Object)pos);
                    BlockState stateFound = this.worldClient.getBlockState(pos);
                    MUTABLE_PAIR.setLeft((Object)mismatch.stateExpected);
                    MUTABLE_PAIR.setRight((Object)mismatch.stateFound);
                    this.getMapForMismatchType(mismatch.mismatchType).remove(MUTABLE_PAIR, (Object)pos);
                    this.checkBlockStates(pos.getX(), pos.getY(), pos.getZ(), mismatch.stateExpected, stateFound);
                    if (!stateFound.isAir() && mismatch.stateFound.isAir()) {
                        ++this.clientBlocks;
                    }
                } else {
                    BlockState stateExpected = this.worldSchematic.getBlockState(pos);
                    BlockState stateFound = this.worldClient.getBlockState(pos);
                    this.checkBlockStates(pos.getX(), pos.getY(), pos.getZ(), stateExpected, stateFound);
                }
                iter.remove();
            }
            if (this.recheckQueue.isEmpty()) {
                this.updateMismatchOverlays();
            }
        }
        profiler.pop();
    }

    private ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> getMapForMismatchType(MismatchType mismatchType) {
        return switch (mismatchType.ordinal()) {
            case 1 -> this.missingBlocksPositions;
            case 2 -> this.extraBlocksPositions;
            case 3 -> this.wrongBlocksPositions;
            case 4 -> this.wrongStatesPositions;
            case 6 -> this.diffBlocksPositions;
            default -> null;
        };
    }

    private boolean verifyChunks(ProfilerFiller profiler) {
        profiler.push("verify_chunks");
        if (this.verificationActive) {
            Iterator<ChunkPos> iter = this.requiredChunks.iterator();
            boolean checkedSome = false;
            while (iter.hasNext() && System.nanoTime() - DataManager.getClientTickStartTime() < 50000000L) {
                ChunkPos pos = iter.next();
                int count = 0;
                for (int cx = pos.x() - 1; cx <= pos.x() + 1; ++cx) {
                    for (int cz = pos.z() - 1; cz <= pos.z() + 1; ++cz) {
                        if (!WorldUtils.isClientChunkLoaded(this.worldClient, cx, cz)) continue;
                        ++count;
                    }
                }
                if (count != 9 || !this.worldSchematic.getChunkSource().hasChunk(pos.x(), pos.z())) continue;
                LevelChunk chunkClient = this.worldClient.getChunk(pos.x(), pos.z());
                ChunkSchematic chunkSchematic = this.worldSchematic.getChunk(pos.x(), pos.z());
                ImmutableMap<String, IntBoundingBox> boxes = this.schematicPlacement.getBoxesWithinChunk(pos.x(), pos.z());
                for (IntBoundingBox box : boxes.values()) {
                    this.verifyChunk((ChunkAccess)chunkClient, (ChunkAccess)chunkSchematic, box);
                }
                iter.remove();
                checkedSome = true;
            }
            if (checkedSome) {
                this.updateRequiredChunksStringList();
            }
            if (this.requiredChunks.isEmpty()) {
                this.verificationActive = false;
                this.verificationStarted = false;
                this.finished = true;
                this.notifyListener();
            }
        }
        profiler.pop();
        return !this.verificationActive;
    }

    public void ignoreStateMismatch(BlockMismatch mismatch) {
        this.ignoreStateMismatch(mismatch, true);
    }

    private void ignoreStateMismatch(BlockMismatch mismatch, boolean updateOverlay) {
        Pair ignore = Pair.of((Object)mismatch.stateExpected, (Object)mismatch.stateFound);
        if (!this.ignoredMismatches.contains(ignore)) {
            this.ignoredMismatches.add((Pair<BlockState, BlockState>)ignore);
            this.getMapForMismatchType(mismatch.mismatchType).removeAll((Object)ignore);
            this.blockMismatches.entrySet().removeIf(entry -> ((BlockMismatch)entry.getValue()).equals(mismatch));
        }
        if (updateOverlay) {
            this.updateMismatchOverlays();
        }
    }

    public void addIgnoredStateMismatches(Collection<BlockMismatch> ignore) {
        for (BlockMismatch mismatch : ignore) {
            this.ignoreStateMismatch(mismatch, false);
        }
        this.updateMismatchOverlays();
    }

    public void resetIgnoredStateMismatches() {
        this.ignoredMismatches.clear();
    }

    public Set<Pair<BlockState, BlockState>> getIgnoredMismatches() {
        return this.ignoredMismatches;
    }

    public Object2IntOpenHashMap<BlockState> getCorrectStates() {
        return this.correctStateCounts;
    }

    @Nullable
    public BlockMismatch getMismatchForPosition(BlockPos pos) {
        return (BlockMismatch)this.blockMismatches.get((Object)pos);
    }

    public List<BlockMismatch> getMismatchOverviewFor(MismatchType type) {
        ArrayList<BlockMismatch> list = new ArrayList<BlockMismatch>();
        if (type == MismatchType.ALL) {
            return this.getMismatchOverviewCombined();
        }
        this.addCountFor(type, this.getMapForMismatchType(type), list);
        return list;
    }

    public List<BlockMismatch> getMismatchOverviewCombined() {
        ArrayList<BlockMismatch> list = new ArrayList<BlockMismatch>();
        this.addCountFor(MismatchType.MISSING, this.missingBlocksPositions, list);
        this.addCountFor(MismatchType.EXTRA, this.extraBlocksPositions, list);
        this.addCountFor(MismatchType.WRONG_BLOCK, this.wrongBlocksPositions, list);
        this.addCountFor(MismatchType.WRONG_STATE, this.wrongStatesPositions, list);
        this.addCountFor(MismatchType.DIFF_BLOCK, this.diffBlocksPositions, list);
        Collections.sort(list);
        return list;
    }

    private void addCountFor(MismatchType mismatchType, ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> map, List<BlockMismatch> list) {
        for (Pair pair : map.keySet()) {
            list.add(new BlockMismatch(mismatchType, (BlockState)pair.getLeft(), (BlockState)pair.getRight(), map.get((Object)pair).size()));
        }
    }

    public List<Pair<BlockState, BlockState>> getIgnoredStateMismatchPairs(GuiBase gui) {
        ArrayList list = Lists.newArrayList(this.ignoredMismatches);
        try {
            list.sort((o1, o2) -> {
                String name2;
                String name1 = BuiltInRegistries.BLOCK.getKey((Object)((BlockState)o1.getLeft()).getBlock()).toString();
                int val = name1.compareTo(name2 = BuiltInRegistries.BLOCK.getKey((Object)((BlockState)o2.getLeft()).getBlock()).toString());
                if (val < 0) {
                    return -1;
                }
                if (val > 0) {
                    return 1;
                }
                name1 = BuiltInRegistries.BLOCK.getKey((Object)((BlockState)o1.getRight()).getBlock()).toString();
                name2 = BuiltInRegistries.BLOCK.getKey((Object)((BlockState)o2.getRight()).getBlock()).toString();
                return name1.compareTo(name2);
            });
        }
        catch (Exception e) {
            gui.addMessage(Message.MessageType.ERROR, "litematica.error.generic.failed_to_sort_list_of_ignored_states", new Object[0]);
        }
        return list;
    }

    private boolean verifyChunk(ChunkAccess chunkClient, ChunkAccess chunkSchematic, IntBoundingBox box) {
        LayerRange range = DataManager.getRenderLayerRange();
        Direction.Axis axis = range.getAxis();
        boolean ranged = this.schematicPlacement.getSchematicVerifierType() == BlockInfoListType.RENDER_LAYERS;
        int startX = ranged && axis == Direction.Axis.X ? Math.max(box.minX(), range.getMinLayerBoundary()) : box.minX();
        int startY = ranged && axis == Direction.Axis.Y ? Math.max(box.minY(), range.getMinLayerBoundary()) : box.minY();
        int startZ = ranged && axis == Direction.Axis.Z ? Math.max(box.minZ(), range.getMinLayerBoundary()) : box.minZ();
        int endX = ranged && axis == Direction.Axis.X ? Math.min(box.maxX(), range.getMaxLayerBoundary()) : box.maxX();
        int endY = ranged && axis == Direction.Axis.Y ? Math.min(box.maxY(), range.getMaxLayerBoundary()) : box.maxY();
        int endZ = ranged && axis == Direction.Axis.Z ? Math.min(box.maxZ(), range.getMaxLayerBoundary()) : box.maxZ();
        for (int y = startY; y <= endY; ++y) {
            for (int z = startZ; z <= endZ; ++z) {
                for (int x = startX; x <= endX; ++x) {
                    MUTABLE_POS.set(x, y, z);
                    BlockState stateClient = chunkClient.getBlockState((BlockPos)MUTABLE_POS);
                    BlockState stateSchematic = chunkSchematic.getBlockState((BlockPos)MUTABLE_POS);
                    this.checkBlockStates(x, y, z, stateSchematic, stateClient);
                    if (!stateSchematic.isAir()) {
                        ++this.schematicBlocks;
                    }
                    if (stateClient.isAir()) continue;
                    ++this.clientBlocks;
                }
            }
        }
        return true;
    }

    private void checkBlockStates(int x, int y, int z, BlockState stateSchematic, BlockState stateClient) {
        BlockPos pos = new BlockPos(x, y, z);
        if (!(stateClient == stateSchematic || stateClient.isAir() && stateSchematic.isAir())) {
            MUTABLE_PAIR.setLeft((Object)stateSchematic);
            MUTABLE_PAIR.setRight((Object)stateClient);
            if (!this.ignoredMismatches.contains(MUTABLE_PAIR)) {
                BlockMismatch mismatch = null;
                if (!stateSchematic.isAir()) {
                    if (stateClient.isAir()) {
                        mismatch = new BlockMismatch(MismatchType.MISSING, stateSchematic, stateClient, 1);
                        this.missingBlocksPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                    } else if (stateSchematic.getBlock() != stateClient.getBlock()) {
                        if (Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue() && BlockUtils.isInSameGroup((BlockState)stateSchematic, (BlockState)stateClient)) {
                            if (BlockUtils.matchPropertiesOnly((BlockState)stateSchematic, (BlockState)stateClient)) {
                                mismatch = new BlockMismatch(MismatchType.DIFF_BLOCK, stateSchematic, stateClient, 1);
                                this.diffBlocksPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                            } else {
                                mismatch = new BlockMismatch(MismatchType.WRONG_STATE, stateSchematic, stateClient, 1);
                                this.wrongStatesPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                            }
                        } else {
                            mismatch = new BlockMismatch(MismatchType.WRONG_BLOCK, stateSchematic, stateClient, 1);
                            this.wrongBlocksPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                        }
                    } else {
                        mismatch = new BlockMismatch(MismatchType.WRONG_STATE, stateSchematic, stateClient, 1);
                        this.wrongStatesPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                    }
                } else if (!(Configs.Visuals.IGNORE_EXISTING_FLUIDS.getBooleanValue() && stateClient.liquid() || this.ignoreBlockRegistry.hasBlock(stateClient.getBlock()))) {
                    mismatch = new BlockMismatch(MismatchType.EXTRA, stateSchematic, stateClient, 1);
                    this.extraBlocksPositions.put((Object)Pair.of((Object)stateSchematic, (Object)stateClient), (Object)pos);
                }
                if (mismatch != null) {
                    this.blockMismatches.put((Object)pos, (Object)mismatch);
                    ItemUtils.setItemForBlock((Level)this.worldClient, pos, stateClient);
                    ItemUtils.setItemForBlock(this.worldSchematic, pos, stateSchematic);
                }
            }
        } else {
            ItemUtils.setItemForBlock((Level)this.worldClient, pos, stateClient);
            this.correctStateCounts.addTo((Object)stateClient, 1);
            if (!stateSchematic.isAir()) {
                ++this.correctStatesCount;
            }
        }
    }

    private void updateMismatchOverlays() {
        if (this.mc.player != null) {
            int maxEntries = Configs.InfoOverlays.VERIFIER_ERROR_HILIGHT_MAX_POSITIONS.getIntegerValue();
            BlockPos centerPos = BlockPos.containing((Position)this.mc.player.position());
            this.updateClosestPositions(centerPos, maxEntries);
            this.combineClosestPositions(centerPos, maxEntries);
            if (this.selectedCategories.size() == 1 && this.selectedEntries.size() == 0) {
                MismatchType type = this.mismatchPositionsForRender.size() > 0 ? this.mismatchPositionsForRender.get((int)0).type : null;
                this.updateMismatchPositionStringList(type, this.mismatchPositionsForRender);
            } else {
                this.updateMismatchPositionStringList(null, this.mismatchPositionsForRender);
            }
        }
    }

    private void updateClosestPositions(BlockPos centerPos, int maxEntries) {
        PositionUtils.BLOCK_POS_COMPARATOR.setReferencePosition(centerPos);
        PositionUtils.BLOCK_POS_COMPARATOR.setClosestFirst(true);
        this.addAndSortPositions(MismatchType.DIFF_BLOCK, this.diffBlocksPositions, this.diffBlocksPositionsClosest, maxEntries);
        this.addAndSortPositions(MismatchType.WRONG_BLOCK, this.wrongBlocksPositions, this.mismatchedBlocksPositionsClosest, maxEntries);
        this.addAndSortPositions(MismatchType.WRONG_STATE, this.wrongStatesPositions, this.mismatchedStatesPositionsClosest, maxEntries);
        this.addAndSortPositions(MismatchType.EXTRA, this.extraBlocksPositions, this.extraBlocksPositionsClosest, maxEntries);
        this.addAndSortPositions(MismatchType.MISSING, this.missingBlocksPositions, this.missingBlocksPositionsClosest, maxEntries);
    }

    private void addAndSortPositions(MismatchType type, ArrayListMultimap<Pair<BlockState, BlockState>, BlockPos> sourceMap, List<BlockPos> listOut, int maxEntries) {
        listOut.clear();
        if (this.selectedCategories.contains((Object)type)) {
            listOut.addAll(sourceMap.values());
        } else {
            Set mismatches = this.selectedEntries.get((Object)type);
            for (BlockMismatch mismatch : mismatches) {
                MUTABLE_PAIR.setLeft((Object)mismatch.stateExpected);
                MUTABLE_PAIR.setRight((Object)mismatch.stateFound);
                listOut.addAll(sourceMap.get(MUTABLE_PAIR));
            }
        }
        listOut.sort(PositionUtils.BLOCK_POS_COMPARATOR);
    }

    private void combineClosestPositions(BlockPos centerPos, int maxEntries) {
        this.mismatchPositionsForRender.clear();
        this.mismatchBlockPositionsForRender.clear();
        ArrayList<MismatchRenderPos> tempList = new ArrayList<MismatchRenderPos>();
        this.getMismatchRenderPositionFor(MismatchType.WRONG_BLOCK, tempList);
        this.getMismatchRenderPositionFor(MismatchType.DIFF_BLOCK, tempList);
        this.getMismatchRenderPositionFor(MismatchType.WRONG_STATE, tempList);
        this.getMismatchRenderPositionFor(MismatchType.EXTRA, tempList);
        this.getMismatchRenderPositionFor(MismatchType.MISSING, tempList);
        tempList.sort(new RenderPosComparator(centerPos, true));
        int max = Math.min(maxEntries, tempList.size());
        for (int i = 0; i < max; ++i) {
            MismatchRenderPos entry = (MismatchRenderPos)((Object)tempList.get(i));
            this.mismatchPositionsForRender.add(entry);
            this.mismatchBlockPositionsForRender.add(entry.pos);
        }
    }

    private void getMismatchRenderPositionFor(MismatchType type, List<MismatchRenderPos> listOut) {
        List<BlockPos> list = this.getClosestMismatchedPositionsFor(type);
        for (BlockPos pos : list) {
            listOut.add(new MismatchRenderPos(type, pos));
        }
    }

    private List<BlockPos> getClosestMismatchedPositionsFor(MismatchType type) {
        return switch (type.ordinal()) {
            case 1 -> this.missingBlocksPositionsClosest;
            case 2 -> this.extraBlocksPositionsClosest;
            case 3 -> this.mismatchedBlocksPositionsClosest;
            case 4 -> this.mismatchedStatesPositionsClosest;
            case 6 -> this.diffBlocksPositionsClosest;
            default -> Collections.emptyList();
        };
    }

    private void updateMismatchPositionStringList(@Nullable MismatchType mismatchType, List<MismatchRenderPos> positionList) {
        this.infoHudLines.clear();
        if (!positionList.isEmpty()) {
            String rst = GuiBase.TXT_RST;
            if (mismatchType != null) {
                this.infoHudLines.add(String.format("%s%s%s", mismatchType.getFormattingCode(), mismatchType.getDisplayname(), rst));
            } else {
                String title = StringUtils.translate((String)"litematica.gui.title.schematic_verifier_errors", (Object[])new Object[0]);
                this.infoHudLines.add(String.format("%s%s%s", GuiBase.TXT_BOLD, title, rst));
            }
            int count = Math.min(positionList.size(), Configs.InfoOverlays.INFO_HUD_MAX_LINES.getIntegerValue());
            for (int i = 0; i < count; ++i) {
                MismatchRenderPos entry = positionList.get(i);
                BlockPos pos = entry.pos;
                String pre = entry.type.getColorCode();
                this.infoHudLines.add(String.format("%sx: %5d, y: %3d, z: %5d%s", pre, pos.getX(), pos.getY(), pos.getZ(), rst));
            }
        }
    }

    public void updateRequiredChunksStringList() {
        this.updateInfoHudLinesPendingChunks(this.requiredChunks);
    }

    public static enum SortCriteria {
        NAME_EXPECTED,
        NAME_FOUND,
        COUNT;

    }

    public static enum MismatchType {
        ALL(0xFF0000, "litematica.gui.label.schematic_verifier_display_type.all", GuiBase.TXT_WHITE),
        MISSING(65535, "litematica.gui.label.schematic_verifier_display_type.missing", GuiBase.TXT_AQUA),
        EXTRA(0xFF00CF, "litematica.gui.label.schematic_verifier_display_type.extra", GuiBase.TXT_LIGHT_PURPLE),
        WRONG_BLOCK(0xFF0000, "litematica.gui.label.schematic_verifier_display_type.wrong_blocks", GuiBase.TXT_RED),
        WRONG_STATE(0xFFAF00, "litematica.gui.label.schematic_verifier_display_type.wrong_state", GuiBase.TXT_GOLD),
        CORRECT_STATE(0x11FF11, "litematica.gui.label.schematic_verifier_display_type.correct_state", GuiBase.TXT_GREEN),
        DIFF_BLOCK(0xFAF000, "litematica.gui.label.schematic_verifier_display_type.diff_blocks", GuiBase.TXT_YELLOW);

        private final String unlocName;
        private final String colorCode;
        private final Color4f color;

        private MismatchType(int color, String unlocName, String colorCode) {
            this.color = Color4f.fromColor((int)color, (float)1.0f);
            this.unlocName = unlocName;
            this.colorCode = colorCode;
        }

        public Color4f getColor() {
            return this.color;
        }

        public String getDisplayname() {
            return StringUtils.translate((String)this.unlocName, (Object[])new Object[0]);
        }

        public String getColorCode() {
            return this.colorCode;
        }

        public String getFormattingCode() {
            return this.colorCode + GuiBase.TXT_BOLD;
        }
    }

    public record BlockMismatch(MismatchType mismatchType, BlockState stateExpected, BlockState stateFound, int count) implements Comparable<BlockMismatch>
    {
        @Override
        public int compareTo(BlockMismatch other) {
            return this.count > other.count ? -1 : (this.count < other.count ? 1 : 0);
        }

        public int hashCode() {
            int prime = 31;
            int result = 1;
            result = 31 * result + (this.mismatchType == null ? 0 : this.mismatchType.hashCode());
            result = 31 * result + (this.stateExpected == null ? 0 : this.stateExpected.hashCode());
            result = 31 * result + (this.stateFound == null ? 0 : this.stateFound.hashCode());
            return result;
        }

        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (this.getClass() != obj.getClass()) {
                return false;
            }
            BlockMismatch other = (BlockMismatch)obj;
            if (this.mismatchType != other.mismatchType) {
                return false;
            }
            if (this.stateExpected == null ? other.stateExpected != null : this.stateExpected != other.stateExpected) {
                return false;
            }
            if (this.stateFound == null) {
                return other.stateFound == null;
            }
            return this.stateFound == other.stateFound;
        }
    }

    public record MismatchRenderPos(MismatchType type, BlockPos pos) {
    }

    private record RenderPosComparator(BlockPos posReference, boolean closestFirst) implements Comparator<MismatchRenderPos>
    {
        @Override
        public int compare(MismatchRenderPos pos1, MismatchRenderPos pos2) {
            double dist2;
            double dist1 = pos1.pos.distSqr((Vec3i)this.posReference);
            if (dist1 == (dist2 = pos2.pos.distSqr((Vec3i)this.posReference))) {
                return 0;
            }
            return dist1 < dist2 == this.closestFirst ? -1 : 1;
        }
    }
}

