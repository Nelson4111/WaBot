/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.QuadInstance
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.vertex.QuadInstance;
import net.minecraft.client.resources.model.geometry.BakedQuad;

@FunctionalInterface
public interface IBlockOutputSchematic {
    public void put(float var1, float var2, float var3, BakedQuad var4, QuadInstance var5);
}

