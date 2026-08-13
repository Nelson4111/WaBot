/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.render.GuiContext
 *  net.minecraft.client.gui.GuiGraphicsExtractor
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.client.gui.screens.inventory.AbstractContainerScreen
 *  net.minecraft.network.chat.Component
 *  net.minecraft.world.inventory.Slot
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Unique
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.At$Shift
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.screen;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.materials.MaterialListHudRenderer;
import fi.dy.masa.litematica.materials.MaterialListItemCache;
import fi.dy.masa.malilib.render.GuiContext;
import java.util.List;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.gui.screens.inventory.AbstractContainerScreen;
import net.minecraft.network.chat.Component;
import net.minecraft.world.inventory.Slot;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={AbstractContainerScreen.class})
public abstract class MixinAbstractContainerScreen
extends Screen {
    @Unique
    private boolean litematica_containerScanned = false;

    private MixinAbstractContainerScreen(Component title) {
        super(title);
    }

    @Inject(method={"extractContents"}, at={@At(value="INVOKE", target="Lnet/minecraft/client/gui/screens/inventory/AbstractContainerScreen;getHoveredSlot(DD)Lnet/minecraft/world/inventory/Slot;", shift=At.Shift.AFTER)})
    private void litematica_renderSlotHighlightsPre(GuiGraphicsExtractor graphics, int mouseX, int mouseY, float a, CallbackInfo ci) {
        AbstractContainerScreen screen = (AbstractContainerScreen)this;
        if (Configs.Generic.MATERIAL_LIST_CONTAINER_SCAN.getBooleanValue() && !this.litematica_containerScanned) {
            MaterialListItemCache.getInstance().scanContainer((List<Slot>)screen.getMenu().slots);
            this.litematica_containerScanned = true;
        }
        MaterialListHudRenderer.renderLookedAtBlockInInventory(GuiContext.fromGuiGraphics((GuiGraphicsExtractor)graphics), screen, this.minecraft);
    }

    @Inject(method={"onClose"}, at={@At(value="HEAD")})
    private void litematica_onContainerClose(CallbackInfo ci) {
        this.litematica_containerScanned = false;
    }
}

