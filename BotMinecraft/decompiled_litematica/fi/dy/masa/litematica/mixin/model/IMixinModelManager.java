/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.color.block.BlockColors
 *  net.minecraft.client.renderer.PlayerSkinRenderCache
 *  net.minecraft.client.resources.model.ModelManager
 *  net.minecraft.client.resources.model.sprite.AtlasManager
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.gen.Accessor
 */
package fi.dy.masa.litematica.mixin.model;

import net.minecraft.client.color.block.BlockColors;
import net.minecraft.client.renderer.PlayerSkinRenderCache;
import net.minecraft.client.resources.model.ModelManager;
import net.minecraft.client.resources.model.sprite.AtlasManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value={ModelManager.class})
public interface IMixinModelManager {
    @Accessor(value="atlasManager")
    public AtlasManager litematica_getAtlasManager();

    @Accessor(value="playerSkinRenderCache")
    public PlayerSkinRenderCache litematica_getPlayerSkinRenderCache();

    @Accessor(value="blockColors")
    public BlockColors litematica_getBlockColors();
}

