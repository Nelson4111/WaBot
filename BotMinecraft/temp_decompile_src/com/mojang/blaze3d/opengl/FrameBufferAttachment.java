/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d.opengl;

import com.mojang.blaze3d.opengl.FrameBufferCache;

public interface FrameBufferAttachment {
    public int glId();

    public int fboMipLevel();

    public void addAssociatedFbo(FrameBufferCache.CacheKey var1);

    public void removeAssociatedFbo(FrameBufferCache.CacheKey var1);
}

