/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.scheduler;

public class TaskTimer {
    private final int interval;
    private int counter;

    public TaskTimer(int interval) {
        this.interval = interval;
        this.counter = interval;
    }

    public boolean tick() {
        if (--this.counter <= 0) {
            this.reset();
            return true;
        }
        return false;
    }

    public void reset() {
        this.counter = this.interval;
    }

    public void setNextDelay(int delay) {
        this.counter = delay;
    }
}

