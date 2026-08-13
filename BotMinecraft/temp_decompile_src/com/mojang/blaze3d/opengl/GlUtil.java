/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d.opengl;

import com.mojang.blaze3d.buffers.GpuBuffer;

public class GlUtil {
    public static int selectBufferBindTarget(@GpuBuffer.Usage int usage) {
        if ((usage & 0x20) != 0) {
            return 34962;
        }
        if ((usage & 0x40) != 0) {
            return 34963;
        }
        if ((usage & 0x80) != 0) {
            return 35345;
        }
        return 36663;
    }
}

