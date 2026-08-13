/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.Direction
 */
package org.uiop.easyplacefix.struct;

import net.minecraft.core.Direction;

public enum DirectionRange {
    North_Range(136.0f, -136.0f, Direction.NORTH),
    South_Range(-44.0f, 44.0f, Direction.SOUTH),
    West_Range(46.0f, 134.0f, Direction.WEST),
    East_Range(-46.0f, -134.0f, Direction.EAST),
    Up_Range(-46.0f, -90.0f, Direction.UP),
    Horizontal_range(44.0f, -44.0f, null),
    Down_Range(46.0f, 90.0f, Direction.DOWN);

    private final float firstValue;
    private final float secondValue;
    private final Direction direction;

    private DirectionRange(float firstValue, float secondValue, Direction direction) {
        this.firstValue = firstValue;
        this.secondValue = secondValue;
        this.direction = direction;
    }

    public float getFirstValue() {
        return this.firstValue;
    }

    public float getSecondValue() {
        return this.secondValue;
    }

    public Direction getDirection() {
        return this.direction;
    }

    public static DirectionRange DirectionToRange(Direction direction) {
        if (direction == null) {
            return Horizontal_range;
        }
        switch (direction) {
            case NORTH: {
                return North_Range;
            }
            case SOUTH: {
                return South_Range;
            }
            case WEST: {
                return West_Range;
            }
            case EAST: {
                return East_Range;
            }
            case UP: {
                return Up_Range;
            }
            case DOWN: {
                return Down_Range;
            }
        }
        return Horizontal_range;
    }

    public boolean isInRange(Direction direction) {
        return direction == this.direction;
    }
}

