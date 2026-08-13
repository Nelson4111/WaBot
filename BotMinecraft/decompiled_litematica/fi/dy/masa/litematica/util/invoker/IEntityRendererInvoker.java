/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.entity.EntityRenderer
 *  net.minecraft.client.renderer.entity.state.EntityRenderState
 *  net.minecraft.world.entity.Entity
 */
package fi.dy.masa.litematica.util.invoker;

import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.entity.EntityRenderer;
import net.minecraft.client.renderer.entity.state.EntityRenderState;
import net.minecraft.world.entity.Entity;

public interface IEntityRendererInvoker {
    public <E extends Entity> EntityRenderer<? super E, ?> litematica_getEntityRendererNullSafe(E var1);

    public <E extends Entity> EntityRenderState litematica_getRenderStateNullSafe(E var1, float var2);

    public <E extends Entity> boolean litematica_shouldRender(E var1, Frustum var2, double var3, double var5, double var7);
}

