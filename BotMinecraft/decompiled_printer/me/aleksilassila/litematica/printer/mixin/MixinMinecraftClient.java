package me.aleksilassila.litematica.printer.mixin;

import me.aleksilassila.litematica.printer.manual.ManualPlacementHandler;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(Minecraft.class)
public class MixinMinecraftClient {

    @Inject(method = "startUseItem", at = @At("HEAD"), cancellable = true)
    private void onStartUseItem(CallbackInfo ci) {
        if (ManualPlacementHandler.onManualRightClick((Minecraft) (Object) this)) {
            ci.cancel();
        }
    }
}
