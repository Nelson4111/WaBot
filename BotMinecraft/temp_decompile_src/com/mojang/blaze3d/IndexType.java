/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d;

public enum IndexType {
    SHORT(2),
    INT(4);

    public final int bytes;

    private IndexType(int bytes) {
        this.bytes = bytes;
    }

    public static IndexType least(int length) {
        if ((length & 0xFFFF0000) != 0) {
            return INT;
        }
        return SHORT;
    }
}

