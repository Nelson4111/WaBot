/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 */
package fi.dy.masa.litematica.selection;

import fi.dy.masa.litematica.selection.Box;
import net.minecraft.core.Direction;

public class BoxSliced
extends Box {
    private Direction sliceDirection = Direction.EAST;
    private int sliceStart = 0;
    private int sliceEnd = 1;
    private int sliceCount;

    public Direction getSliceDirection() {
        return this.sliceDirection;
    }

    public int getSliceStart() {
        return this.sliceStart;
    }

    public int getSliceEnd() {
        return this.sliceEnd;
    }

    public int getSliceCount() {
        return this.sliceCount;
    }

    public int getMaxSliceLength() {
        return switch (this.sliceDirection.getAxis()) {
            case Direction.Axis.X -> this.getSize().getX();
            case Direction.Axis.Y -> this.getSize().getY();
            case Direction.Axis.Z -> this.getSize().getZ();
            default -> 1;
        };
    }

    public void setSliceDirection(Direction sliceDirection) {
        this.sliceDirection = sliceDirection;
    }

    public void setSliceStart(int sliceStart) {
        this.sliceStart = Math.min(sliceStart, this.getMaxSliceLength() - 1);
    }

    public void setSliceEnd(int sliceEnd) {
        this.sliceEnd = Math.min(sliceEnd, this.getMaxSliceLength());
    }

    public void setSliceCount(int sliceCount) {
        this.sliceCount = sliceCount;
    }
}

