/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.Minecraft
 *  oshi.util.tuples.Pair
 */
package com.tick_ins.tick;

import com.tick_ins.tick.RunnableWithCountDown;
import com.tick_ins.tick.RunnableWithLast;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import net.minecraft.client.Minecraft;
import oshi.util.tuples.Pair;

public final class TickThread {
    private static final ScheduledExecutorService EXECUTOR = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "easyplacefix-tick-thread");
        t.setDaemon(true);
        return t;
    });
    private static final AtomicLong TASK_EPOCH = new AtomicLong();
    private static volatile boolean clientStopping = false;
    public static volatile boolean notChangPlayerLook = false;
    public static volatile float yawLock = 0.0f;
    public static volatile float pitchLock = 0.0f;

    private TickThread() {
    }

    public static void addTask(RunnableWithLast first, RunnableWithLast second) {
        if (clientStopping) {
            return;
        }
        Pair<Float, Float> yawAndPitch = first == null ? null : first.yawAndPitch();
        TickThread.applyLookLock(yawAndPitch);
        TickThread.runNow(first == null ? null : first.task());
        TickThread.runAfterTick(() -> {
            if (second != null) {
                TickThread.runNow(() -> {
                    second.task().run();
                    TickThread.clearLookLock();
                });
            } else {
                TickThread.runNow(TickThread::clearLookLock);
            }
        }, 1);
    }

    public static void addLastTask(RunnableWithLast task) {
        if (task == null || clientStopping) {
            return;
        }
        Pair<Float, Float> yawAndPitch = task.yawAndPitch();
        TickThread.applyLookLock(yawAndPitch);
        TickThread.runNow(task.task());
        TickThread.runAfterTick(() -> TickThread.runNow(() -> {
            task.cache().run();
            TickThread.clearLookLock();
        }), 1);
    }

    public static void addCountDownTask(RunnableWithCountDown task) {
        if (task == null || clientStopping) {
            return;
        }
        TickThread.runAfterTick(task.task(), task.count());
    }

    private static void runNow(Runnable runnable) {
        if (runnable == null || clientStopping) {
            return;
        }
        Minecraft client = Minecraft.getInstance();
        if (client == null || client.player == null || client.level == null) {
            return;
        }
        try {
            client.execute(() -> {
                if (!clientStopping) {
                    runnable.run();
                }
            });
        }
        catch (RejectedExecutionException rejectedExecutionException) {
            // empty catch block
        }
    }

    private static void runAfterTick(Runnable runnable, int ticks) {
        if (runnable == null || clientStopping) {
            return;
        }
        long delayMs = (long)Math.max(0, ticks) * 50L;
        long epoch = TASK_EPOCH.get();
        EXECUTOR.schedule(() -> {
            if (!clientStopping && epoch == TASK_EPOCH.get()) {
                TickThread.runNow(runnable);
            }
        }, delayMs, TimeUnit.MILLISECONDS);
    }

    private static void applyLookLock(Pair<Float, Float> yawAndPitch) {
        if (yawAndPitch == null) {
            return;
        }
        yawLock = ((Float)yawAndPitch.getA()).floatValue();
        pitchLock = ((Float)yawAndPitch.getB()).floatValue();
        notChangPlayerLook = true;
    }

    public static void clearLookLock() {
        notChangPlayerLook = false;
    }

    public static void onClientDisconnected() {
        TASK_EPOCH.incrementAndGet();
        TickThread.clearLookLock();
        clientStopping = false;
    }

    public static void onClientShutdown() {
        TASK_EPOCH.incrementAndGet();
        TickThread.clearLookLock();
        clientStopping = true;
    }
}

