/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.util.Util
 */
package fi.dy.masa.litematica.render.schematic.ao;

import net.minecraft.core.Direction;
import net.minecraft.util.Util;

public enum AOVertexMap {
    DOWN(0, 1, 2, 3),
    UP(2, 3, 0, 1),
    NORTH(3, 0, 1, 2),
    SOUTH(0, 1, 2, 3),
    WEST(3, 0, 1, 2),
    EAST(1, 2, 3, 0);

    final int vert0;
    final int vert1;
    final int vert2;
    final int vert3;
    private static final AOVertexMap[] VALUES;

    private AOVertexMap(int vert0, int vert1, int vert2, int vert3) {
        this.vert0 = vert0;
        this.vert1 = vert1;
        this.vert2 = vert2;
        this.vert3 = vert3;
    }

    public static AOVertexMap getVertexTranslations(Direction face) {
        return VALUES[face.get3DDataValue()];
    }

    static {
        VALUES = (AOVertexMap[])Util.make((Object)new AOVertexMap[6], values -> {
            values[Direction.DOWN.get3DDataValue()] = DOWN;
            values[Direction.UP.get3DDataValue()] = UP;
            values[Direction.NORTH.get3DDataValue()] = NORTH;
            values[Direction.SOUTH.get3DDataValue()] = SOUTH;
            values[Direction.WEST.get3DDataValue()] = WEST;
            values[Direction.EAST.get3DDataValue()] = EAST;
        });
    }
}

