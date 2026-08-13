/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.gui.components.debug.DebugScreenEntryList
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.hud;

import fi.dy.masa.litematica.render.LitematicaDebugHud;
import net.minecraft.client.gui.components.debug.DebugScreenEntryList;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={DebugScreenEntryList.class})
public abstract class MixinDebugScreenEntryList {
    @Inject(method={"rebuildCurrentList"}, at={@At(value="TAIL")})
    private void litematica_updateVisibleEntries(CallbackInfo ci) {
        LitematicaDebugHud.INSTANCE.checkConfig();
    }
}

