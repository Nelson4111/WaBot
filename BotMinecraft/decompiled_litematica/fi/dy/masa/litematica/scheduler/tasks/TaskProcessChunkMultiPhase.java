/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Queues
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  javax.annotation.Nullable
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.network.chat.Component
 *  net.minecraft.network.chat.ComponentContents
 *  net.minecraft.network.chat.MutableComponent
 *  net.minecraft.network.chat.contents.TranslatableContents
 *  net.minecraft.util.Util
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.Queues;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkBase;
import fi.dy.masa.litematica.util.ToBooleanFunction;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import java.util.Iterator;
import java.util.List;
import java.util.Queue;
import javax.annotation.Nullable;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.ComponentContents;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.network.chat.contents.TranslatableContents;
import net.minecraft.util.Util;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.ChunkPos;

public abstract class TaskProcessChunkMultiPhase
extends TaskProcessChunkBase {
    protected TaskPhase phase = TaskPhase.INIT;
    @Nullable
    protected ChunkPos currentChunkPos;
    @Nullable
    protected IntBoundingBox currentBox;
    @Nullable
    protected Iterator<Entity> entityIterator;
    @Nullable
    protected Iterator<BlockPos> positionIterator;
    protected final boolean useWorldEdit;
    protected int maxCommandsPerTick = 16;
    protected int processedChunksThisTick;
    protected int sentCommandsThisTick;
    protected long gameRuleProbeTimeout;
    protected long maxGameRuleProbeTime = 2000000000L;
    protected long taskStartTimeForCurrentTick;
    protected boolean shouldEnableFeedback;
    protected final Queue<String> queuedCommands = Queues.newArrayDeque();
    protected ToBooleanFunction<Component> gameRuleListener = this::checkCommandFeedbackGameRuleState;
    protected Runnable initTask = this::initPhaseStartProbe;
    protected Runnable probeTask = this::probePhase;
    protected Runnable waitForChunkTask = this::fetchNextChunk;
    protected Runnable processBoxBlocksTask;
    protected Runnable processBoxEntitiesTask;

    protected TaskProcessChunkMultiPhase(String nameOnHud) {
        super(nameOnHud);
        this.useWorldEdit = Configs.Generic.COMMAND_USE_WORLDEDIT.getBooleanValue();
    }

    protected boolean executeMultiPhase(ProfilerFiller profiler) {
        long currentTime;
        long elapsedTickTime;
        profiler.push("chunk_multi_phase");
        this.taskStartTimeForCurrentTick = Util.getNanos();
        this.sentCommandsThisTick = 0;
        this.processedChunksThisTick = 0;
        if (this.phase == TaskPhase.INIT) {
            this.initTask.run();
        }
        if (this.phase == TaskPhase.GAME_RULE_PROBE) {
            this.probeTask.run();
            profiler.pop();
            return false;
        }
        if (this.currentChunkPos != null && !this.canProcessChunk(this.currentChunkPos)) {
            profiler.pop();
            return false;
        }
        int commandsLast = -1;
        int processedChunksLast = -1;
        while (this.sentCommandsThisTick < this.maxCommandsPerTick && (this.sentCommandsThisTick > commandsLast || this.processedChunksThisTick != processedChunksLast) && (elapsedTickTime = (currentTime = Util.getNanos()) - this.taskStartTimeForCurrentTick) < 25000000L) {
            commandsLast = this.sentCommandsThisTick;
            processedChunksLast = this.processedChunksThisTick;
            if (this.phase == TaskPhase.WAIT_FOR_CHUNKS) {
                this.waitForChunkTask.run();
            }
            if (this.phase == TaskPhase.PROCESS_BOX_BLOCKS && this.processBoxBlocksTask != null) {
                this.processBoxBlocksTask.run();
            }
            if (this.phase == TaskPhase.PROCESS_BOX_ENTITIES && this.processBoxEntitiesTask != null) {
                this.processBoxEntitiesTask.run();
            }
            if (this.phase != TaskPhase.FINISHED) continue;
            profiler.pop();
            return true;
        }
        if (this.processedChunksThisTick > 0) {
            this.updateInfoHudLines();
        }
        profiler.pop();
        return false;
    }

    protected void initPhaseStartProbe() {
        if (Configs.Generic.COMMAND_DISABLE_FEEDBACK.getBooleanValue() && this.isInWorld()) {
            DataManager.addChatListener(this.gameRuleListener);
            this.sendCommand("gamerule send_command_feedback");
            this.gameRuleProbeTimeout = Util.getNanos() + this.maxGameRuleProbeTime;
            this.phase = TaskPhase.GAME_RULE_PROBE;
        } else {
            this.shouldEnableFeedback = false;
            this.phase = TaskPhase.WAIT_FOR_CHUNKS;
        }
    }

    protected void probePhase() {
        if (Util.getNanos() > this.gameRuleProbeTimeout) {
            this.shouldEnableFeedback = false;
            this.phase = TaskPhase.WAIT_FOR_CHUNKS;
        }
    }

    protected boolean checkCommandFeedbackGameRuleState(Component message) {
        TranslatableContents text;
        MutableComponent mutableText;
        ComponentContents componentContents;
        if (this.isInWorld() && message instanceof MutableComponent && (componentContents = (mutableText = (MutableComponent)message).getContents()) instanceof TranslatableContents && "commands.gamerule.query".equals((text = (TranslatableContents)componentContents).getKey())) {
            Object[] args = text.getArgs();
            this.shouldEnableFeedback = args.length == 1 && args[0].equals("true");
            this.phase = TaskPhase.WAIT_FOR_CHUNKS;
            if (this.shouldEnableFeedback) {
                this.sendCommand("gamerule send_command_feedback false");
            }
            return true;
        }
        return false;
    }

    protected void fetchNextChunk() {
        if (!this.pendingChunks.isEmpty()) {
            this.sortChunkList();
            ChunkPos pos = (ChunkPos)this.pendingChunks.get(0);
            if (this.canProcessChunk(pos)) {
                this.currentChunkPos = pos;
                this.onNextChunkFetched(pos);
            }
        } else {
            this.phase = TaskPhase.FINISHED;
            this.finished = true;
        }
    }

    protected void onNextChunkFetched(ChunkPos pos) {
    }

    protected void startNextBox(ChunkPos pos) {
        List list = this.boxesInChunks.get((Object)pos);
        if (!list.isEmpty()) {
            this.currentBox = (IntBoundingBox)list.get(0);
            this.onStartNextBox(this.currentBox);
        } else {
            this.currentBox = null;
            this.phase = TaskPhase.WAIT_FOR_CHUNKS;
        }
    }

    protected void onStartNextBox(IntBoundingBox box) {
    }

    protected void onFinishedProcessingBox(ChunkPos pos, IntBoundingBox box) {
        this.boxesInChunks.remove((Object)pos, (Object)box);
        this.currentBox = null;
        this.entityIterator = null;
        this.positionIterator = null;
        if (this.boxesInChunks.get((Object)pos).isEmpty()) {
            this.finishProcessingChunk(pos);
        } else {
            this.startNextBox(pos);
        }
    }

    protected void finishProcessingChunk(ChunkPos pos) {
        this.boxesInChunks.removeAll((Object)pos);
        this.pendingChunks.remove(pos);
        this.currentChunkPos = null;
        ++this.processedChunksThisTick;
        this.phase = TaskPhase.WAIT_FOR_CHUNKS;
        this.onFinishedProcessingChunk(pos);
    }

    protected void onFinishedProcessingChunk(ChunkPos pos) {
    }

    protected void sendCommand(String cmd) {
        this.sendCommand(cmd, this.mc.player);
    }

    protected void sendCommand(String command, LocalPlayer player) {
        player.connection.sendCommand(command);
        ++this.sentCommandsThisTick;
    }

    protected void sendQueuedCommands() {
        while (this.sentCommandsThisTick < this.maxCommandsPerTick && !this.queuedCommands.isEmpty()) {
            this.sendCommand(this.queuedCommands.poll());
        }
        if (this.queuedCommands.isEmpty()) {
            this.finishProcessingChunk(this.currentChunkPos);
        }
    }

    protected void sendTaskEndCommands() {
        if (this.isInWorld()) {
            if (this.useWorldEdit) {
                this.sendCommand("/perf neighbors on");
            }
            if (this.shouldEnableFeedback) {
                this.sendCommand("gamerule send_command_feedback true");
            }
        }
    }

    public static enum TaskPhase {
        INIT,
        GAME_RULE_PROBE,
        WAIT_FOR_CHUNKS,
        PROCESS_BOX_BLOCKS,
        PROCESS_BOX_ENTITIES,
        FINISHED;

    }
}

