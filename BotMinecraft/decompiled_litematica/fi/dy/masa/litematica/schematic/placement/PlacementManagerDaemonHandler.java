/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.options.ConfigInteger
 *  fi.dy.masa.malilib.interfaces.IThreadDaemonHandler
 *  fi.dy.masa.malilib.util.MathUtils
 *  fi.dy.masa.malilib.util.thread.ThreadExecutorPair
 *  java.lang.runtime.SwitchBootstraps
 *  net.minecraft.client.Minecraft
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.render.LitematicaRenderer;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonExecutor;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTaskRebuild;
import fi.dy.masa.malilib.config.options.ConfigInteger;
import fi.dy.masa.malilib.interfaces.IThreadDaemonHandler;
import fi.dy.masa.malilib.util.MathUtils;
import fi.dy.masa.malilib.util.thread.ThreadExecutorPair;
import java.lang.runtime.SwitchBootstraps;
import java.util.ConcurrentModificationException;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.locks.ReentrantLock;
import net.minecraft.client.Minecraft;
import net.minecraft.world.level.ChunkPos;

public class PlacementManagerDaemonHandler
implements IThreadDaemonHandler<PlacementManagerTask> {
    public static final PlacementManagerDaemonHandler INSTANCE = new PlacementManagerDaemonHandler();
    public static final int MIN_PLATFORM_THREADS = 2;
    public static final int MAX_PLATFORM_THREADS = PlacementManagerDaemonHandler.calculateMaxThreads();
    private static final float TASK_INTERVAL = 1.5f;
    private static final int MAX_DEFERRED_CAP = 850;
    private boolean useVirtual = false;
    private final String namePrefix = "Litematica Placement Manager";
    private int threadCount;
    private final ConcurrentHashMap<String, ThreadExecutorPair<PlacementManagerTask>> threadMap;
    private final LinkedBlockingQueue<PlacementManagerTask> queueRebuild = new LinkedBlockingQueue();
    private final LinkedBlockingQueue<PlacementManagerTask> queueOther = new LinkedBlockingQueue();
    private final LinkedBlockingQueue<PlacementManagerTask> deferredQueue = new LinkedBlockingQueue();
    private final ReentrantLock lock = new ReentrantLock();
    private long lastTick;
    private boolean processing = false;
    private boolean forceStop = false;

    private static int calculateMaxThreads() {
        int count = Runtime.getRuntime().availableProcessors() / 4;
        int result = MathUtils.max((int)count, (int)2);
        Litematica.LOGGER.info("Placement Manager calculated thread limit: [{}]", (Object)String.format("%02d/%02d", 2, result));
        return result;
    }

    private int calculateDefaultSafeThreadCount() {
        int result = this.getThreadCountSafe();
        this.useVirtual = result < 1;
        return MathUtils.clamp((int)result, (int)2, (int)MAX_PLATFORM_THREADS);
    }

    private PlacementManagerDaemonHandler() {
        this.threadCount = MathUtils.max((int)MAX_PLATFORM_THREADS, (int)2);
        this.threadMap = new ConcurrentHashMap(this.threadCount, 0.9f, 1);
        this.lastTick = System.currentTimeMillis();
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    private synchronized void buildThreadMap() {
        if (this.threadMap.isEmpty()) {
            if (this.forceStop) {
                return;
            }
            this.lock.lock();
            try {
                int count = this.getClampedThreadCount(this.threadCount);
                for (int i = 0; i < count; ++i) {
                    String name = count > 1 ? this.namePrefix + " " + (i + 1) : this.namePrefix;
                    this.threadMap.put(name, (ThreadExecutorPair<PlacementManagerTask>)this.threadFactory(name, this.useVirtual, new PlacementManagerDaemonExecutor()));
                }
            }
            finally {
                this.lock.unlock();
            }
        }
    }

    public String getName() {
        return this.namePrefix;
    }

    private int getDeferredCap() {
        return 850;
    }

    private int getClampedThreadCount(int count) {
        return MathUtils.clamp((int)count, (int)2, (int)MAX_PLATFORM_THREADS);
    }

    private int getConfiguredThreadCount() {
        int count = Configs.Generic.PLACEMENT_MANAGER_THREAD_COUNT.getIntegerValue();
        if (count < 2) {
            count = MathUtils.max((int)this.calculateDefaultSafeThreadCount(), (int)2);
        }
        return this.getClampedThreadCount(count);
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void resetThreadCount(ConfigInteger config, boolean noBuild) {
        int lastCount;
        int count = this.getConfiguredThreadCount();
        if (count != (lastCount = this.getClampedThreadCount(config.getLastIntegerValue())) || this.threadCount != count) {
            this.stop();
            this.lock.lock();
            try {
                if (this.useVirtual || count < 2) {
                    count = 2;
                }
                Litematica.LOGGER.info("Resetting Placement Manager Thread count from config change [{} -> {}]", (Object)lastCount, (Object)count);
                ConcurrentHashMap<String, ThreadExecutorPair<PlacementManagerTask>> concurrentHashMap = this.threadMap;
                synchronized (concurrentHashMap) {
                    this.threadMap.clear();
                }
            }
            finally {
                this.threadCount = this.getClampedThreadCount(count);
                this.lock.unlock();
                this.gc();
            }
            if (!noBuild) {
                this.buildThreadMap();
                this.start();
            }
        }
    }

    public void checkThreadCount(boolean noBuild) {
        if (this.threadCount != this.getConfiguredThreadCount()) {
            this.resetThreadCount(Configs.Generic.PLACEMENT_MANAGER_THREAD_COUNT, noBuild);
        }
        if (this.threadMap.isEmpty() && !noBuild) {
            this.gc();
            this.buildThreadMap();
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void start() {
        if (this.forceStop) {
            return;
        }
        Litematica.LOGGER.info("Starting [{}] Placement Manager Daemon threads", (Object)this.threadMap.size());
        Set keys = this.threadMap.keySet();
        for (String key : keys) {
            ThreadExecutorPair pair = this.threadMap.get(key);
            try {
                this.safeStart(pair);
            }
            catch (ConcurrentModificationException concurrentModificationException) {
            }
            catch (IllegalStateException is) {
                this.lock.lock();
                try {
                    pair = this.threadFactory(key, this.useVirtual, new PlacementManagerDaemonExecutor());
                    pair.thread().start();
                    ConcurrentHashMap<String, ThreadExecutorPair<PlacementManagerTask>> concurrentHashMap = this.threadMap;
                    synchronized (concurrentHashMap) {
                        this.threadMap.replace(key, (ThreadExecutorPair<PlacementManagerTask>)pair);
                    }
                }
                finally {
                    this.lock.unlock();
                }
            }
            catch (RuntimeException runtimeException) {
            }
            catch (Exception exception) {}
        }
    }

    public void stop() {
        Litematica.LOGGER.info("Stopping [{}] Placement Manager Daemon threads", (Object)this.threadMap.size());
        Set keys = this.threadMap.keySet();
        for (String key : keys) {
            ThreadExecutorPair<PlacementManagerTask> pair = this.threadMap.get(key);
            try {
                this.safeStop(pair);
            }
            catch (ConcurrentModificationException cme) {
                Litematica.LOGGER.warn("Thread [{}] is currently busy, and shouldn't be stopped", (Object)key);
            }
            catch (IllegalStateException illegalStateException) {
            }
            catch (IllegalThreadStateException illegalThreadStateException) {
            }
            catch (Exception exception) {}
        }
    }

    public void reset() {
        this.clearAllTasks();
    }

    public synchronized void addTask(PlacementManagerTask newTask) {
        if (this.checkIfTasksAreFull()) {
            this.deferredQueue.offer(newTask);
            return;
        }
        boolean empty = this.getTaskCount() == 0;
        PlacementManagerTask placementManagerTask = newTask;
        Objects.requireNonNull(placementManagerTask);
        PlacementManagerTask placementManagerTask2 = placementManagerTask;
        int n = 0;
        switch (SwitchBootstraps.typeSwitch("typeSwitch", new Object[]{PlacementManagerTaskRebuild.class}, (PlacementManagerTask)placementManagerTask2, (int)n)) {
            case 0: {
                PlacementManagerTaskRebuild tL = (PlacementManagerTaskRebuild)placementManagerTask2;
                this.queueRebuild.offer(newTask);
                break;
            }
            default: {
                this.queueOther.offer(newTask);
            }
        }
        if (empty) {
            if (Reference.DEBUG_MODE) {
                Litematica.LOGGER.error("addTask: [EMPTY] Waking up threads...");
            }
            this.ensureThreadsAreAlive();
        }
        this.processing = true;
    }

    public synchronized PlacementManagerTask getNextTask() {
        if (!this.queueRebuild.isEmpty()) {
            return this.queueRebuild.poll();
        }
        if (!this.queueOther.isEmpty()) {
            return this.queueOther.poll();
        }
        return null;
    }

    protected synchronized int getTaskCount() {
        return this.queueRebuild.size() + this.queueOther.size() + this.deferredQueue.size();
    }

    protected synchronized boolean hasActiveTasks() {
        return !this.queueRebuild.isEmpty() || !this.queueOther.isEmpty();
    }

    public synchronized boolean hasTasks() {
        return !this.queueRebuild.isEmpty() || !this.queueOther.isEmpty() || !this.deferredQueue.isEmpty();
    }

    public long getTaskInterval() {
        return MathUtils.floor((float)1500.0f);
    }

    private boolean checkIfTasksAreFull() {
        int calc;
        int threadCount = this.threadMap.size();
        int total = this.queueRebuild.size() + this.queueOther.size();
        return total >= (calc = MathUtils.clamp((int)(threadCount / 2), (int)1, (int)threadCount) * this.getDeferredCap()) && total > 0;
    }

    protected boolean allDone() {
        if (this.queueRebuild.isEmpty() && this.queueOther.isEmpty()) {
            if (!this.deferredQueue.isEmpty()) {
                this.fillDeferredTasks();
                return false;
            }
            return true;
        }
        return false;
    }

    private void fillDeferredTasks() {
        PlacementManagerTask task;
        int cap = this.getDeferredCap();
        for (int total = 0; total < cap && (task = this.deferredQueue.poll()) != null; ++total) {
            this.addTask(task);
        }
    }

    public void onClientTick(Minecraft mc) {
        if (this.forceStop) {
            return;
        }
        long now = System.currentTimeMillis();
        if (this.lastTick > now) {
            this.lastTick = now;
        }
        if (now - this.lastTick > this.getTaskInterval()) {
            if (mc.level != null) {
                if (this.processing && this.allDone()) {
                    Litematica.debugLog("PlacementManagerDaemonHandler:  All tasks complete", new Object[0]);
                    LitematicaRenderer.getInstance().getWorldRenderer().markNeedsUpdate();
                    this.processing = false;
                }
                this.ensureThreadsAreAlive();
            }
            this.lastTick = now;
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    private void ensureThreadsAreAlive() {
        if (this.forceStop) {
            return;
        }
        int count = this.getTaskCount();
        if (count > 0) {
            this.checkThreadCount(false);
            Litematica.debugLog("PlacementManagerDaemonHandler: {} tasks detected --> checking Thread states", count);
            Set keySet = this.threadMap.keySet();
            for (String key : keySet) {
                ThreadExecutorPair pair = this.threadMap.get(key);
                try {
                    this.safeStart(pair);
                }
                catch (IllegalStateException is) {
                    this.lock.lock();
                    try {
                        pair = this.threadFactory(key, this.useVirtual, new PlacementManagerDaemonExecutor());
                        pair.thread().start();
                        ConcurrentHashMap<String, ThreadExecutorPair<PlacementManagerTask>> concurrentHashMap = this.threadMap;
                        synchronized (concurrentHashMap) {
                            this.threadMap.replace(key, (ThreadExecutorPair<PlacementManagerTask>)pair);
                        }
                    }
                    finally {
                        this.lock.unlock();
                    }
                }
                catch (RuntimeException runtimeException) {}
            }
        }
    }

    protected void removeRebuildTasksFor(int x, int z) {
        this.queueRebuild.removeIf(task -> task.cx() == x && task.cz() == z);
    }

    protected void removeOtherTasksFor(int x, int z) {
        this.queueOther.removeIf(task -> task.cx() == x && task.cz() == z);
    }

    protected void removeDeferredTasksFor(int x, int z) {
        this.deferredQueue.removeIf(task -> task.cx() == x && task.cz() == z);
    }

    public boolean hasAnyRebuildTasksFor(ChunkPos pos) {
        return this.hasAnyRebuildTasksFor(pos.x(), pos.z());
    }

    public synchronized boolean hasAnyRebuildTasksFor(int cx, int cz) {
        return this.queueRebuild.stream().anyMatch(task -> task.cx() == cx && task.cz() == cz);
    }

    public synchronized boolean hasAnyOtherTasksFor(int cx, int cz) {
        return this.queueOther.stream().anyMatch(task -> task.cx() == cx && task.cz() == cz);
    }

    public synchronized boolean hasAnyDeferredTasksFor(int cx, int cz) {
        return this.deferredQueue.stream().anyMatch(task -> task.cx() == cx && task.cz() == cz);
    }

    public boolean hasAnyTasks() {
        return this.hasAnyRebuildTasks() || this.hasAnyOtherTasks() || this.hasAnyDeferredTasks();
    }

    public boolean hasAnyRebuildTasks() {
        return !this.queueRebuild.isEmpty();
    }

    public boolean hasAnyOtherTasks() {
        return !this.queueOther.isEmpty();
    }

    public boolean hasAnyDeferredTasks() {
        return !this.deferredQueue.isEmpty();
    }

    public boolean hasAnyTasksFor(int cx, int cz) {
        return this.hasAnyRebuildTasksFor(cx, cz) || this.hasAnyOtherTasksFor(cx, cz) || this.hasAnyDeferredTasksFor(cx, cz);
    }

    protected void removeAllTasksFor(int cx, int cz) {
        this.removeOtherTasksFor(cx, cz);
        this.removeRebuildTasksFor(cx, cz);
        this.removeDeferredTasksFor(cx, cz);
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void removeAllRebuildTasks() {
        LinkedBlockingQueue<PlacementManagerTask> linkedBlockingQueue = this.queueRebuild;
        synchronized (linkedBlockingQueue) {
            this.queueRebuild.clear();
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void removeAllOtherTasks() {
        LinkedBlockingQueue<PlacementManagerTask> linkedBlockingQueue = this.queueOther;
        synchronized (linkedBlockingQueue) {
            this.queueOther.clear();
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    protected void removeAllDeferredTasks() {
        LinkedBlockingQueue<PlacementManagerTask> linkedBlockingQueue = this.deferredQueue;
        synchronized (linkedBlockingQueue) {
            this.deferredQueue.clear();
        }
    }

    public String getDebugString() {
        return String.format("T: %02d RB: %03d O: %02d D: %02d", this.threadMap.size(), this.queueRebuild.size(), this.queueOther.size(), this.deferredQueue.size());
    }

    public void clearAllTasks() {
        this.removeAllRebuildTasks();
        this.removeAllOtherTasks();
        this.removeAllDeferredTasks();
        this.processing = false;
    }

    public void resetForceStop() {
        this.forceStop = false;
    }

    public boolean isForceStop() {
        return this.forceStop;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void endAll() {
        this.forceStop = true;
        this.reset();
        this.stop();
        this.lock.lock();
        try {
            Thread.sleep(50L);
            ConcurrentHashMap<String, ThreadExecutorPair<PlacementManagerTask>> concurrentHashMap = this.threadMap;
            synchronized (concurrentHashMap) {
                this.threadMap.clear();
            }
        }
        catch (InterruptedException interruptedException) {
        }
        finally {
            this.lock.unlock();
            this.gc();
        }
    }

    public void close() throws Exception {
        this.endAll();
    }
}

