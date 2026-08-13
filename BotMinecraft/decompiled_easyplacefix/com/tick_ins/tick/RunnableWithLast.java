/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  oshi.util.tuples.Pair
 */
package com.tick_ins.tick;

import oshi.util.tuples.Pair;

public final class RunnableWithLast {
    private final Runnable task;
    private final Runnable cache;
    private final Pair<Float, Float> yawAndPitch;

    private RunnableWithLast(Runnable task, Runnable cache, Pair<Float, Float> yawAndPitch) {
        this.task = task;
        this.cache = cache;
        this.yawAndPitch = yawAndPitch;
    }

    public Runnable task() {
        return this.task;
    }

    public Runnable cache() {
        return this.cache;
    }

    public Pair<Float, Float> yawAndPitch() {
        return this.yawAndPitch;
    }

    public static final class Builder {
        private Runnable task;
        private Runnable cache;
        private Pair<Float, Float> yawAndPitch;

        public Builder setTask(Runnable task) {
            this.task = task;
            return this;
        }

        public Builder cache(Runnable cache) {
            this.cache = cache;
            return this;
        }

        public Builder setYawAndPitch(Pair<Float, Float> yawAndPitch) {
            this.yawAndPitch = yawAndPitch;
            return this;
        }

        public RunnableWithLast build() {
            return new RunnableWithLast(this.task, this.cache, this.yawAndPitch);
        }
    }
}

