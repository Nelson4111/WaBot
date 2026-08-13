/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.serialization.Dynamic
 *  net.minecraft.util.datafix.fixes.BlockStateData
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.injection.At
 *  org.spongepowered.asm.mixin.injection.Inject
 *  org.spongepowered.asm.mixin.injection.callback.CallbackInfo
 */
package fi.dy.masa.litematica.mixin.block;

import com.mojang.serialization.Dynamic;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import java.util.Arrays;
import java.util.List;
import net.minecraft.util.datafix.fixes.BlockStateData;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value={BlockStateData.class})
public abstract class MixinBlockStateData {
    @Inject(method={"register"}, at={@At(value="HEAD")})
    private static void litematica_onAddEntry(int id, Dynamic<?> tag, Dynamic<?>[] legacy, CallbackInfo ci) {
        List oldDynamics = Arrays.stream(legacy).toList();
        SchematicConversionMaps.addDynamicEntry(id, tag, oldDynamics);
    }
}

