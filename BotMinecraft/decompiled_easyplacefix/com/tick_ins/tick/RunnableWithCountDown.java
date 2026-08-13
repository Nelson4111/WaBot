/*
 * Decompiled with CFR 0.152.
 */
package com.tick_ins.tick;

public final class RunnableWithCountDown {
    private final int count;
    private final Runnable task;

    private RunnableWithCountDown(int count, Runnable task) {
        this.count = count;
        this.task = task;
    }

    public int count() {
        return this.count;
    }

    public Runnable task() {
        return this.task;
    }

    public static final class Builder {
        private int count;

        public Builder setCount(int count) {
            this.count = count;
            return this;
        }

        public RunnableWithCountDown build(Runnable task) {
            return new RunnableWithCountDown(Math.max(this.count, 0), task);
        }
    }
}

