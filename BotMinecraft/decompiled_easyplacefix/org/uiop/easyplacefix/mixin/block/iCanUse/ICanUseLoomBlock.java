/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.LoomBlock
 *  org.spongepowered.asm.mixin.Mixin
 */
package org.uiop.easyplacefix.mixin.block.iCanUse;

import net.minecraft.world.level.block.LoomBlock;
import org.spongepowered.asm.mixin.Mixin;
import org.uiop.easyplacefix.ICanUse;

@Mixin(value={LoomBlock.class})
public class ICanUseLoomBlock
implements ICanUse {
}

