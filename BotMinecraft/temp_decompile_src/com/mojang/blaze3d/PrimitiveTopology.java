/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d;

public enum PrimitiveTopology {
    LINES(2, 2, false),
    DEBUG_LINES(2, 2, false),
    DEBUG_LINE_STRIP(2, 1, true),
    POINTS(1, 1, false),
    TRIANGLES(3, 3, false),
    TRIANGLE_STRIP(3, 1, true),
    TRIANGLE_FAN(3, 1, true),
    QUADS(4, 4, false);

    public final int primitiveLength;
    public final int primitiveStride;
    public final boolean connectedPrimitives;

    private PrimitiveTopology(int primitiveLength, int primitiveStride, boolean connectedPrimitives) {
        this.primitiveLength = primitiveLength;
        this.primitiveStride = primitiveStride;
        this.connectedPrimitives = connectedPrimitives;
    }

    public int indexCount(int vertexCount) {
        int indexCount = switch (this.ordinal()) {
            case 1, 2, 3, 4, 5, 6 -> vertexCount;
            case 0, 7 -> vertexCount / 4 * 6;
            default -> 0;
        };
        return indexCount;
    }
}

