/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.llamalad7.mixinextras.injector.wrapoperation.Operation
 *  com.llamalad7.mixinextras.injector.wrapoperation.WrapOperation
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.components.DebugScreenOverlay
 *  net.minecraft.resources.Identifier
 *  org.spongepowered.asm.mixin.Final
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.ModifyArg
 */
package fi.dy.masa.litematica.mixin.hud;

import com.llamalad7.mixinextras.injector.wrapoperation.Operation;
import com.llamalad7.mixinextras.injector.wrapoperation.WrapOperation;
import fi.dy.masa.litematica.render.LitematicaDebugHud;
import fi.dy.masa.litematica.util.DebugHudMode;
import java.util.Collection;
import java.util.List;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.DebugScreenOverlay;
import net.minecraft.resources.Identifier;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyArg;

@Mixin(value={DebugScreenOverlay.class})
public abstract class MixinDebugScreenOverlay {
    @Shadow
    @Final
    private Minecraft minecraft;

    @WrapOperation(method={"extractRenderState(Lnet/minecraft/client/gui/GuiGraphicsExtractor;)V"}, at={@At(value="INVOKE", target="Ljava/util/Collection;isEmpty()Z", ordinal=0)})
    private boolean litematica_fixF3WhenAllDisabled(Collection<Identifier> instance, Operation<Boolean> original) {
        if (LitematicaDebugHud.INSTANCE.getMode() == DebugHudMode.DEFAULT) {
            return false;
        }
        return (Boolean)original.call(new Object[]{instance});
    }

    @ModifyArg(method={"extractRenderState(Lnet/minecraft/client/gui/GuiGraphicsExtractor;)V"}, at=@At(value="INVOKE", target="Lnet/minecraft/client/gui/components/DebugScreenOverlay;extractLines(Lnet/minecraft/client/gui/GuiGraphicsExtractor;Ljava/util/List;Z)V", ordinal=0), index=1)
    private List<String> litematica_addDebugLines_Left(List<String> text) {
        List<String> list;
        if (this.minecraft.debugEntries.isOverlayVisible() && LitematicaDebugHud.INSTANCE.getMode() == DebugHudMode.DEFAULT && !(list = LitematicaDebugHud.INSTANCE.getDebugLines()).isEmpty()) {
            int size = text.size();
            size = size > 3 ? (size -= 3) : 0;
            for (String entry : list) {
                text.add(size++, entry);
            }
        }
        return text;
    }
}

