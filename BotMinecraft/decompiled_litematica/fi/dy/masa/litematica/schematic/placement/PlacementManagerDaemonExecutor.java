/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.interfaces.IThreadDaemonExecutor
 *  fi.dy.masa.malilib.util.MathUtils
 */
package fi.dy.masa.litematica.schematic.placement;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerTask;
import fi.dy.masa.malilib.interfaces.IThreadDaemonExecutor;
import fi.dy.masa.malilib.util.MathUtils;
import java.util.concurrent.atomic.AtomicBoolean;

public class PlacementManagerDaemonExecutor
implements IThreadDaemonExecutor<PlacementManagerTask> {
    private final AtomicBoolean running = new AtomicBoolean(true);
    private final AtomicBoolean paused = new AtomicBoolean(false);
    private final long sleepTime;
    private final float sleepDelay;
    private final long maxTicks;
    private long lastTaskTime;
    private long ticks;

    public PlacementManagerDaemonExecutor() {
        this(1800000L);
    }

    public PlacementManagerDaemonExecutor(long sleepTime) {
        this.sleepTime = MathUtils.clamp((long)sleepTime, (long)60000L, (long)Long.MAX_VALUE);
        this.sleepDelay = 0.75f;
        this.maxTicks = 64L;
        this.ticks = 0L;
    }

    public boolean isRunning() {
        return this.running.get();
    }

    public boolean isPaused() {
        return this.paused.get();
    }

    public void start() {
        if (PlacementManagerDaemonHandler.INSTANCE.isForceStop()) {
            this.stop();
            return;
        }
        if (!this.isRunning()) {
            Litematica.debugLog("Executor: Starting", new Object[0]);
            if (this.isPaused()) {
                this.paused.set(false);
            }
            this.run();
        }
    }

    public void interrupt(InterruptedException interrupt) {
        Litematica.debugLog("Executor: Interrupt Signal: {}", interrupt.getLocalizedMessage() != null ? interrupt.getLocalizedMessage() : "received interrupt signal");
        if (this.isPaused() || !this.isRunning()) {
            this.resume();
        }
    }

    public void pause() {
        Litematica.debugLog("Executor: Pausing", new Object[0]);
        this.paused.set(true);
    }

    public void resume() {
        if (PlacementManagerDaemonHandler.INSTANCE.isForceStop()) {
            this.stop();
            return;
        }
        if (this.isPaused()) {
            Litematica.debugLog("Executor: Paused; Resuming", new Object[0]);
            this.paused.set(false);
        }
        this.start();
    }

    public void stop() {
        Litematica.debugLog("Executor: Stopping", new Object[0]);
        if (!this.isPaused()) {
            this.paused.set(true);
        }
        if (this.isRunning()) {
            this.running.set(false);
        }
    }

    public long sleepTime() {
        return this.sleepTime;
    }

    public String getName() {
        return PlacementManagerDaemonHandler.INSTANCE.getName();
    }

    public boolean hasTasks() {
        return PlacementManagerDaemonHandler.INSTANCE.hasActiveTasks();
    }

    public void run() {
        if (!this.isCorrectThread()) {
            return;
        }
        if (PlacementManagerDaemonHandler.INSTANCE.isForceStop()) {
            this.stop();
            return;
        }
        this.running.set(true);
        this.lastTaskTime = System.currentTimeMillis();
        this.ticks = 0L;
        Litematica.debugLog("Executor: Running: [{}/{}]", this.isRunning(), this.isPaused());
        while (this.isRunning()) {
            if (this.isPaused() && this.hasTasks()) {
                this.resume();
            } else if (!this.isPaused() && this.loopSafe()) {
                this.paused.set(true);
                this.ticks = 0L;
                this.sleep();
            }
            if (!PlacementManagerDaemonHandler.INSTANCE.isForceStop()) continue;
            this.stop();
            return;
        }
        Litematica.debugLog("Executor: Stopped: [{}/{}]", this.isRunning(), this.isPaused());
    }

    public boolean loopSafe() {
        ++this.ticks;
        try {
            PlacementManagerTask task = this.takeNextTask();
            if (task != null) {
                this.processTask(task);
                this.lastTaskTime = System.currentTimeMillis();
            }
        }
        catch (InterruptedException e) {
            this.interrupt(e);
        }
        catch (Exception err) {
            Litematica.debugLog("PlacementManagerDaemonExecutor#loopSafe: Exception: {}", err.getLocalizedMessage());
        }
        return this.shouldPause();
    }

    public boolean shouldPause() {
        if (this.hasTasks()) {
            return false;
        }
        if (this.ticks > this.maxTicks) {
            return true;
        }
        return this.checkTaskTime();
    }

    private boolean checkTaskTime() {
        return (float)(System.currentTimeMillis() - this.lastTaskTime) > this.sleepDelay * 1000.0f;
    }

    private PlacementManagerTask takeNextTask() throws InterruptedException {
        return PlacementManagerDaemonHandler.INSTANCE.getNextTask();
    }

    public void processTask(PlacementManagerTask task) throws InterruptedException {
        task.run();
    }
}

