/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  me.fallenbreath.conditionalmixin.api.mixin.RestrictiveMixinConfigPlugin
 */
package fi.dy.masa.litematica.compat.mixin;

import fi.dy.masa.litematica.Litematica;
import java.util.List;
import java.util.Set;
import me.fallenbreath.conditionalmixin.api.mixin.RestrictiveMixinConfigPlugin;

public class LitematicaMixinConfigPlugin
extends RestrictiveMixinConfigPlugin {
    protected void onRestrictionCheckFailed(String mixinClassName, String reason) {
        Litematica.LOGGER.warn("Disabled mixin '{}' due to: '{}'", (Object)mixinClassName, (Object)reason);
    }

    public String getRefMapperConfig() {
        return null;
    }

    public void acceptTargets(Set<String> myTargets, Set<String> otherTargets) {
    }

    public List<String> getMixins() {
        return null;
    }
}

