package me.aleksilassila.litematica.printer.mixin;

import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import me.aleksilassila.litematica.printer.manual.PlacementOverrideHandler;
import net.minecraft.world.item.context.BlockPlaceContext;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(Block.class)
public abstract class MixinBlock {

    @Inject(method = "getStateForPlacement", at = @At("RETURN"), cancellable = true)
    private void litematicaPrinter$overridePlacementState(BlockPlaceContext context, CallbackInfoReturnable<BlockState> cir) {
        BlockState original = cir.getReturnValue();
        if (context == null || original == null) return;

        BlockState override = PlacementOverrideHandler.getOverrideState(context.getClickedPos());
        if (override == null) {
            WorldSchematic schematicWorld = SchematicWorldHandler.getSchematicWorld();
            if (schematicWorld != null) {
                override = PlacementOverrideHandler.getTargetStateForContext(schematicWorld, context);
            }
        }

        if (override != null) {
            BlockState result = PlacementOverrideHandler.applyProperties(original, override);
            cir.setReturnValue(result);
        }
    }
}
