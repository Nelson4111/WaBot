/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d.systems;

import com.mojang.blaze3d.systems.CommandEncoderBackend;
import com.mojang.blaze3d.systems.GpuSurface;
import com.mojang.blaze3d.systems.SurfaceException;
import com.mojang.blaze3d.textures.GpuTextureView;
import java.util.Collection;

public interface GpuSurfaceBackend
extends AutoCloseable {
    public void configure(GpuSurface.Configuration var1) throws SurfaceException;

    public boolean isSuboptimal();

    public void acquireNextTexture() throws SurfaceException;

    public void blitFromTexture(CommandEncoderBackend var1, GpuTextureView var2);

    public void present();

    @Override
    public void close();

    public Collection<GpuSurface.PresentMode> supportedPresentModes();
}

