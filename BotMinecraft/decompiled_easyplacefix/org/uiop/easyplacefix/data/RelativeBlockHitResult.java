/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package org.uiop.easyplacefix.data;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public class RelativeBlockHitResult
extends BlockHitResult {
    public RelativeBlockHitResult(Vec3 pos, Direction side, BlockPos blockPos, boolean insideBlock) {
        super(pos, side, blockPos, insideBlock);
    }
}

