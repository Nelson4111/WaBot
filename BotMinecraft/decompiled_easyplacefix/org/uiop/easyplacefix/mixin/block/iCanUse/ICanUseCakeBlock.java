/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.CakeBlock
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block.iCanUse;

import net.minecraft.world.level.block.CakeBlock;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.ICanUse;

@Mixin(value={CakeBlock.class})
public class ICanUseCakeBlock
implements ICanUse {
}

