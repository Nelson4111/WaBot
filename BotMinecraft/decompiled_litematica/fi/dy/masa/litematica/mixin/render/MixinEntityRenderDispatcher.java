/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.client.entity.ClientMannequin
 *  net.minecraft.client.player.AbstractClientPlayer
 *  net.minecraft.client.renderer.culling.Frustum
 *  net.minecraft.client.renderer.entity.EntityRenderDispatcher
 *  net.minecraft.client.renderer.entity.EntityRenderer
 *  net.minecraft.client.renderer.entity.player.AvatarRenderer
 *  net.minecraft.client.renderer.entity.state.EntityRenderState
 *  net.minecraft.client.resources.DefaultPlayerSkin
 *  net.minecraft.world.entity.Display
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.Leashable
 *  net.minecraft.world.entity.LightningBolt
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragon
 *  net.minecraft.world.entity.boss.enderdragon.EnderDragonPart
 *  net.minecraft.world.entity.player.PlayerModelType
 *  net.minecraft.world.entity.player.PlayerSkin
 *  net.minecraft.world.entity.projectile.FishingHook
 *  net.minecraft.world.phys.AABB
 *  org.spongepowered.asm.mixin.Mixin
 *  org.spongepowered.asm.mixin.Shadow
 *  org.spongepowered.asm.mixin.Unique
 */
package fi.dy.masa.litematica.mixin.render;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.util.invoker.IEntityRendererInvoker;
import java.util.Map;
import java.util.UUID;
import net.minecraft.client.entity.ClientMannequin;
import net.minecraft.client.player.AbstractClientPlayer;
import net.minecraft.client.renderer.culling.Frustum;
import net.minecraft.client.renderer.entity.EntityRenderDispatcher;
import net.minecraft.client.renderer.entity.EntityRenderer;
import net.minecraft.client.renderer.entity.player.AvatarRenderer;
import net.minecraft.client.renderer.entity.state.EntityRenderState;
import net.minecraft.client.resources.DefaultPlayerSkin;
import net.minecraft.world.entity.Display;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.Leashable;
import net.minecraft.world.entity.LightningBolt;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.entity.boss.enderdragon.EnderDragonPart;
import net.minecraft.world.entity.player.PlayerModelType;
import net.minecraft.world.entity.player.PlayerSkin;
import net.minecraft.world.entity.projectile.FishingHook;
import net.minecraft.world.phys.AABB;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;

@Mixin(value={EntityRenderDispatcher.class})
public abstract class MixinEntityRenderDispatcher
implements IEntityRendererInvoker {
    @Shadow
    private Map<PlayerModelType, AvatarRenderer<ClientMannequin>> mannequinRenderers;
    @Shadow
    private Map<PlayerModelType, AvatarRenderer<AbstractClientPlayer>> playerRenderers;

    @Shadow
    public abstract <T extends Entity> EntityRenderer<? super T, ?> getRenderer(T var1);

    @Override
    public <E extends Entity> EntityRenderer<? super E, ?> litematica_getEntityRendererNullSafe(E entity) {
        PlayerSkin skin = DefaultPlayerSkin.get((UUID)entity.getUUID());
        if (entity instanceof ClientMannequin) {
            ClientMannequin cme = (ClientMannequin)entity;
            cme.tick();
            skin = cme.getSkin() != null ? cme.getSkin() : skin;
            return this.litematica_getMannequinRendererBySkin(skin);
        }
        if (entity instanceof AbstractClientPlayer) {
            AbstractClientPlayer acp = (AbstractClientPlayer)entity;
            skin = acp.getSkin() != null ? acp.getSkin() : skin;
            return this.litematica_getPlayerRendererBySkin(skin);
        }
        return this.getRenderer(entity);
    }

    @Override
    public <E extends Entity> EntityRenderState litematica_getRenderStateNullSafe(E entity, float tickProgress) {
        EntityRenderer<E, ?> renderer = this.litematica_getEntityRendererNullSafe(entity);
        if (renderer == null) {
            renderer = this.getRenderer(entity);
        }
        if (renderer != null) {
            try {
                return renderer.createRenderState(entity, tickProgress);
            }
            catch (Exception err) {
                Litematica.LOGGER.error("litematica_getRenderState: Exception getting Entity Render State; {}", (Object)err.getLocalizedMessage());
            }
        }
        return null;
    }

    @Override
    public <E extends Entity> boolean litematica_shouldRender(E entity, Frustum culler, double camX, double camY, double camZ) {
        Leashable le;
        Entity lead;
        if (!entity.shouldRender(camX, camY, camZ)) {
            return false;
        }
        if (!this.effectedByCullingWrapper(entity)) {
            return true;
        }
        AABB bb = entity.getBoundingBox().inflate(0.5);
        if (bb.hasNaN() || bb.getSize() == 0.0) {
            bb = new AABB(entity.getX() - 2.0, entity.getY() - 2.0, entity.getZ() - 2.0, entity.getX() + 2.0, entity.getY() + 2.0, entity.getZ() + 2.0);
        }
        if (culler.isVisible(bb)) {
            return true;
        }
        if (entity instanceof Leashable && (lead = (le = (Leashable)entity).getLeashHolder()) != null) {
            AABB leadBb = lead.getBoundingBox();
            return culler.isVisible(leadBb) || culler.isVisible(bb.minmax(leadBb));
        }
        return false;
    }

    @Unique
    private <E extends Entity> boolean effectedByCullingWrapper(E e) {
        if (e instanceof EnderDragon || e instanceof EnderDragonPart || e instanceof FishingHook || e instanceof LightningBolt) {
            return false;
        }
        if (e instanceof Display) {
            Display d = (Display)e;
            return d.affectedByCulling();
        }
        return true;
    }

    @Unique
    private <E extends Entity> EntityRenderer<? super E, ?> litematica_getPlayerRendererBySkin(PlayerSkin skin) {
        if (this.playerRenderers.containsKey(skin.model())) {
            return (EntityRenderer)this.playerRenderers.get(skin.model());
        }
        if (this.playerRenderers.containsKey(PlayerModelType.WIDE)) {
            return (EntityRenderer)this.playerRenderers.get(PlayerModelType.WIDE);
        }
        return null;
    }

    @Unique
    private <E extends Entity> EntityRenderer<? super E, ?> litematica_getMannequinRendererBySkin(PlayerSkin skin) {
        if (this.mannequinRenderers.containsKey(skin.model())) {
            return (EntityRenderer)this.mannequinRenderers.get(skin.model());
        }
        if (this.mannequinRenderers.containsKey(PlayerModelType.WIDE)) {
            return (EntityRenderer)this.mannequinRenderers.get(PlayerModelType.WIDE);
        }
        return null;
    }
}

