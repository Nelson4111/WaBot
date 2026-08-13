/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.litematica.world.WorldSchematic
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.state.BlockState
 */
package me.aleksilassila.litematica.printer;

import fi.dy.masa.litematica.world.WorldSchematic;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;

public class SchematicBlockState {
    public final Level world;
    public final WorldSchematic schematic;
    public final BlockPos blockPos;
    public final BlockState targetState;
    public final BlockState currentState;

    public SchematicBlockState(Level world, WorldSchematic schematic, BlockPos blockPos) {
        this.world = world;
        this.schematic = schematic;
        this.blockPos = blockPos;
        this.targetState = schematic.getBlockState(blockPos);
        this.currentState = world.getBlockState(blockPos);
    }

    public SchematicBlockState offset(Direction direction) {
        return new SchematicBlockState(this.world, this.schematic, this.blockPos.relative(direction));
    }

    public String toString() {
        return "SchematicBlockState{world=" + String.valueOf(this.world) + ", schematic=" + String.valueOf(this.schematic) + ", blockPos=" + String.valueOf(this.blockPos) + ", targetState=" + String.valueOf(this.targetState) + ", currentState=" + String.valueOf(this.currentState) + "}";
    }
}

