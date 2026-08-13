/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d.systems;

import java.util.OptionalLong;

public interface GpuQueryPool
extends AutoCloseable {
    public int size();

    public OptionalLong getValue(int var1);

    public OptionalLong[] getValues(int var1, int var2);

    @Override
    public void close();
}

