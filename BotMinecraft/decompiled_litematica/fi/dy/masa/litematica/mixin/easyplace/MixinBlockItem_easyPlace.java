/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.item.BlockItem
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.Item$Properties
 *  net.minecraft.world.item.context.BlockPlaceContext
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.state.BlockState
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable
 */
package fi.dy.masa.litematica.mixin.easyplace;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.util.PlacementHandler;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(value={BlockItem.class}, priority=980)
public abstract class MixinBlockItem_easyPlace
extends Item {
    private MixinBlockItem_easyPlace(Item.Properties builder) {
        super(builder);
    }

    @Shadow
    protected abstract BlockState getPlacementState(BlockPlaceContext var1);

    @Shadow
    protected abstract boolean canPlace(BlockPlaceContext var1, BlockState var2);

    @Shadow
    public abstract Block getBlock();

    @Inject(method={"getPlacementState"}, at={@At(value="HEAD")}, cancellable=true)
    private void litematica_modifyPlacementState(BlockPlaceContext context, CallbackInfoReturnable<BlockState> cir) {
        BlockState stateOrig;
        if (Configs.Generic.EASY_PLACE_MODE.getBooleanValue() && Configs.Generic.EASY_PLACE_SP_HANDLING.getBooleanValue() && (stateOrig = this.getBlock().getStateForPlacement(context)) != null && (!Configs.Generic.EASY_PLACE_SP_VALIDATION.getBooleanValue() || this.canPlace(context, stateOrig))) {
            PlacementHandler.UseContext ctx = PlacementHandler.UseContext.from(context, context.getHand());
            cir.setReturnValue((Object)PlacementHandler.applyPlacementProtocolToPlacementState(stateOrig, ctx));
        }
    }
}

