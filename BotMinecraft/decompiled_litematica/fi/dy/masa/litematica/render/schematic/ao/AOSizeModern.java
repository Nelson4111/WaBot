/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.render.schematic.ao;

public enum AOSizeModern {
    DOWN(0),
    UP(1),
    NORTH(2),
    SOUTH(3),
    WEST(4),
    EAST(5),
    FLIP_DOWN(6),
    FLIP_UP(7),
    FLIP_NORTH(8),
    FLIP_SOUTH(9),
    FLIP_WEST(10),
    FLIP_EAST(11);

    public static final int SIZE;
    final int index;

    private AOSizeModern(int index) {
        this.index = index;
    }

    static {
        SIZE = AOSizeModern.values().length;
    }
}

