/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.DispenserBlock
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block.iCanUse;

import net.minecraft.world.level.block.DispenserBlock;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.ICanUse;

@Mixin(value={DispenserBlock.class})
public class ICanUseDispenserBlock
implements ICanUse {
}

