/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.registry.Registry
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.game.PlacementUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  org.jetbrains.annotations.ApiStatus$Experimental
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.registry.Registry;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.game.PlacementUtils;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.RegistryAccess;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.ApiStatus;

@ApiStatus.Experimental
public class PickBlockUtils {
    @Nullable
    public static InteractionHand doPickBlockForStack(ItemStack stack) {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc.player;
        if (player == null) {
            return null;
        }
        boolean ignoreNbt = false;
        InteractionHand hand = EntityUtils.getUsedHandForItem((LivingEntity)player, stack, ignoreNbt);
        if (!stack.isEmpty() && hand == null) {
            return null;
        }
        if (hand != null) {
            InventoryUtils.preRestockHand((Player)player, hand, 6, true);
        }
        return hand;
    }

    @Nullable
    public static InteractionHand pickBlockLast() {
        Minecraft mc = Minecraft.getInstance();
        ClientLevel world = mc.level;
        BlockPos pos = Registry.BLOCK_PLACEMENT_POSITION_HANDLER.getCurrentPlacementPosition();
        if (mc.player == null) {
            return null;
        }
        if (pos == null) {
            double reach = mc.player.blockInteractionRange();
            Entity entity = mc.getCameraEntity();
            if (entity != null) {
                pos = RayTraceUtils.getPickBlockLastTrace((Level)world, entity, reach, true);
            }
        }
        if (pos != null && world != null && PlacementUtils.isReplaceable((Level)world, (BlockPos)pos, (boolean)true)) {
            return PickBlockUtils.doPickBlockForPosition(pos);
        }
        return null;
    }

    @Nullable
    private static InteractionHand doPickBlockForPosition(BlockPos pos) {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc.player;
        if (player == null) {
            return null;
        }
        WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
        ClientLevel clientWorld = mc.level;
        if (world == null || clientWorld == null) {
            return null;
        }
        BlockState state = world.getBlockState(pos);
        ItemStack stack = state.getBlock().asItem().getDefaultInstance();
        boolean ignoreNbt = false;
        if (!stack.isEmpty()) {
            InteractionHand hand = EntityUtils.getUsedHandForItem((LivingEntity)player, stack, ignoreNbt);
            if (hand == null) {
                BlockEntity te;
                if (player.isCreative() && GuiBase.isCtrlDown() && (te = world.getBlockEntity(pos)) != null && mc.level.isEmptyBlock(pos)) {
                    stack = stack.copy();
                    BlockUtils.setStackNbt((ItemStack)stack, (BlockEntity)te, (RegistryAccess)clientWorld.registryAccess());
                }
                return PickBlockUtils.doPickBlockForStack(stack);
            }
            return hand;
        }
        return null;
    }
}

