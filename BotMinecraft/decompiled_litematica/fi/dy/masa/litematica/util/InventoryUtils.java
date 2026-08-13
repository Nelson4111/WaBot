/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.render.InventoryOverlay
 *  fi.dy.masa.malilib.render.InventoryOverlayContext
 *  fi.dy.masa.malilib.render.InventoryOverlayRefresher
 *  fi.dy.masa.malilib.util.EquipmentUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.data.tag.BaseData
 *  fi.dy.masa.malilib.util.data.tag.CompoundData
 *  fi.dy.masa.malilib.util.data.tag.ListData
 *  fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.nbt.NbtInventory
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.HolderLookup$Provider
 *  net.minecraft.core.NonNullList
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.server.level.ServerLevel
 *  net.minecraft.world.Container
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.player.Inventory
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.inventory.AbstractContainerMenu
 *  net.minecraft.world.inventory.ContainerInput
 *  net.minecraft.world.inventory.InventoryMenu
 *  net.minecraft.world.inventory.Slot
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.EntityBlock
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  org.apache.commons.lang3.tuple.Pair
 *  org.jetbrains.annotations.ApiStatus$Experimental
 */
package fi.dy.masa.litematica.util;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.util.EasyPlaceUtils;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.render.InventoryOverlay;
import fi.dy.masa.malilib.render.InventoryOverlayContext;
import fi.dy.masa.malilib.render.InventoryOverlayRefresher;
import fi.dy.masa.malilib.util.EquipmentUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.tag.BaseData;
import fi.dy.masa.malilib.util.data.tag.CompoundData;
import fi.dy.masa.malilib.util.data.tag.ListData;
import fi.dy.masa.malilib.util.data.tag.converter.DataConverterNbt;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.nbt.NbtInventory;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.NonNullList;
import net.minecraft.core.RegistryAccess;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.Container;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.inventory.AbstractContainerMenu;
import net.minecraft.world.inventory.ContainerInput;
import net.minecraft.world.inventory.InventoryMenu;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.EntityBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import org.apache.commons.lang3.tuple.Pair;
import org.jetbrains.annotations.ApiStatus;

public class InventoryUtils {
    private static final List<Integer> PICK_BLOCKABLE_SLOTS = new ArrayList<Integer>();
    private static int nextPickSlotIndex;
    private static Pair<BlockPos, InventoryOverlayContext> lastBlockEntityContext;

    public static void setPickBlockableSlots(String configStr) {
        String[] parts;
        PICK_BLOCKABLE_SLOTS.clear();
        for (String str : parts = configStr.split(",")) {
            try {
                int slotNum = Integer.parseInt(str) - 1;
                if (!Inventory.isHotbarSlot((int)slotNum) || PICK_BLOCKABLE_SLOTS.contains(slotNum)) continue;
                PICK_BLOCKABLE_SLOTS.add(slotNum);
            }
            catch (NumberFormatException numberFormatException) {
                // empty catch block
            }
        }
    }

    public static void setPickedItemToHand(ItemStack stack, Minecraft mc) {
        if (mc.player == null) {
            return;
        }
        int slotNum = mc.player.getInventory().findSlotMatchingItem(stack);
        InventoryUtils.setPickedItemToHand(slotNum, stack, mc);
    }

    public static void setPickedItemToHand(int sourceSlot, ItemStack stack, Minecraft mc) {
        if (mc.player == null) {
            return;
        }
        LocalPlayer player = mc.player;
        Inventory inventory = player.getInventory();
        if (Inventory.isHotbarSlot((int)sourceSlot)) {
            inventory.setSelectedSlot(sourceSlot);
        } else {
            if (PICK_BLOCKABLE_SLOTS.size() == 0) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.pickblock.no_valid_slots_configured", (Object[])new Object[0]);
                return;
            }
            int hotbarSlot = sourceSlot;
            if (sourceSlot == -1 || !Inventory.isHotbarSlot((int)sourceSlot)) {
                hotbarSlot = InventoryUtils.getEmptyPickBlockableHotbarSlot(inventory);
            }
            if (hotbarSlot == -1) {
                hotbarSlot = InventoryUtils.getPickBlockTargetSlot((Player)player);
            }
            if (hotbarSlot != -1) {
                inventory.setSelectedSlot(hotbarSlot);
                if (EntityUtils.isCreativeMode((Player)player)) {
                    inventory.getNonEquipmentItems().set(hotbarSlot, (Object)stack.copy());
                } else {
                    fi.dy.masa.malilib.util.InventoryUtils.swapItemToMainHand((ItemStack)stack.copy(), (Minecraft)mc);
                }
                EasyPlaceUtils.setEasyPlaceLastPickBlockTime();
            } else {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.pickblock.no_suitable_slot_found", (Object[])new Object[0]);
            }
        }
    }

    public static int getPickedItemHandSlotNoSwap(ItemStack stack, Minecraft mc) {
        if (mc.player == null) {
            return -1;
        }
        int slotNum = mc.player.getInventory().findSlotMatchingItem(stack);
        return InventoryUtils.getPickedItemHandSlotNoSwap(slotNum, stack, mc);
    }

    public static int getPickedItemHandSlotNoSwap(int sourceSlot, ItemStack stack, Minecraft mc) {
        if (mc.player == null) {
            return -1;
        }
        LocalPlayer player = mc.player;
        Inventory inventory = player.getInventory();
        if (Inventory.isHotbarSlot((int)sourceSlot)) {
            inventory.setSelectedSlot(sourceSlot);
        } else {
            if (PICK_BLOCKABLE_SLOTS.size() == 0) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.pickblock.no_valid_slots_configured", (Object[])new Object[0]);
                return -1;
            }
            int hotbarSlot = sourceSlot;
            if (sourceSlot == -1 || !Inventory.isHotbarSlot((int)sourceSlot)) {
                hotbarSlot = InventoryUtils.getEmptyPickBlockableHotbarSlot(inventory);
            }
            if (hotbarSlot == -1) {
                hotbarSlot = InventoryUtils.getPickBlockTargetSlot((Player)player);
            }
            if (hotbarSlot != -1) {
                int resultSlot = -1;
                inventory.setSelectedSlot(hotbarSlot);
                resultSlot = EntityUtils.isCreativeMode((Player)player) ? hotbarSlot : InventoryUtils.getMainHandSlotForItem(stack.copy(), mc);
                if (resultSlot != -1) {
                    EasyPlaceUtils.setEasyPlaceLastPickBlockTime();
                }
                return resultSlot;
            }
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.pickblock.no_suitable_slot_found", (Object[])new Object[0]);
        }
        return -1;
    }

    private static int getMainHandSlotForItem(ItemStack stackReference, Minecraft mc) {
        LocalPlayer player = mc.player;
        if (mc.player == null) {
            return -1;
        }
        boolean isCreative = player.hasInfiniteMaterials();
        if (fi.dy.masa.malilib.util.InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)stackReference, (ItemStack)player.getMainHandItem())) {
            return -1;
        }
        if (isCreative) {
            player.getInventory().setSelectedSlot(player.getInventory().getSuitableHotbarSlot());
            return 36 + player.getInventory().getSelectedSlot();
        }
        return fi.dy.masa.malilib.util.InventoryUtils.findSlotWithItem((AbstractContainerMenu)player.inventoryMenu, (ItemStack)stackReference, (boolean)true);
    }

    public static void schematicWorldPickBlock(ItemStack stack, BlockPos pos, Level schematicWorld, Minecraft mc) {
        if (mc.player == null || mc.gameMode == null || mc.level == null) {
            return;
        }
        if (!stack.isEmpty()) {
            Inventory inv = mc.player.getInventory();
            stack = stack.copy();
            if (EntityUtils.isCreativeMode((Player)mc.player)) {
                BlockEntity te = schematicWorld.getBlockEntity(pos);
                if (GuiBase.isCtrlDown() && te != null && mc.level.isEmptyBlock(pos)) {
                    BlockUtils.setStackNbt((ItemStack)stack, (BlockEntity)te, (RegistryAccess)schematicWorld.registryAccess());
                }
                InventoryUtils.setPickedItemToHand(stack, mc);
                mc.gameMode.handleCreativeModeItemAdd(mc.player.getItemInHand(InteractionHand.MAIN_HAND), 36 + inv.getSelectedSlot());
            } else {
                boolean shouldPick;
                int slot = inv.findSlotMatchingItem(stack);
                boolean bl = shouldPick = inv.getSelectedSlot() != slot;
                if (shouldPick && slot != -1) {
                    InventoryUtils.setPickedItemToHand(stack, mc);
                } else if (slot == -1 && Configs.Generic.PICK_BLOCK_SHULKERS.getBooleanValue() && (slot = InventoryUtils.findSlotWithBoxWithItem((AbstractContainerMenu)mc.player.inventoryMenu, stack, false)) != -1) {
                    ItemStack boxStack = ((Slot)mc.player.inventoryMenu.slots.get(slot)).getItem();
                    InventoryUtils.setPickedItemToHand(boxStack, mc);
                }
            }
        }
    }

    private static boolean canPickToSlot(Inventory inventory, int slotNum) {
        if (!PICK_BLOCKABLE_SLOTS.contains(slotNum)) {
            return false;
        }
        ItemStack stack = inventory.getItem(slotNum);
        if (stack.isEmpty()) {
            return true;
        }
        return !(Configs.Generic.PICK_BLOCK_AVOID_DAMAGEABLE.getBooleanValue() && stack.isDamageableItem() || Configs.Generic.PICK_BLOCK_AVOID_TOOLS.getBooleanValue() && EquipmentUtils.isRegularTool((ItemStack)stack));
    }

    private static int getPickBlockTargetSlot(Player player) {
        if (PICK_BLOCKABLE_SLOTS.isEmpty() || player == null) {
            return -1;
        }
        int slotNum = player.getInventory().getSelectedSlot();
        if (InventoryUtils.canPickToSlot(player.getInventory(), slotNum)) {
            return slotNum;
        }
        if (nextPickSlotIndex >= PICK_BLOCKABLE_SLOTS.size()) {
            nextPickSlotIndex = 0;
        }
        for (int i = 0; i < PICK_BLOCKABLE_SLOTS.size(); ++i) {
            slotNum = PICK_BLOCKABLE_SLOTS.get(nextPickSlotIndex);
            if (++nextPickSlotIndex >= PICK_BLOCKABLE_SLOTS.size()) {
                nextPickSlotIndex = 0;
            }
            if (!InventoryUtils.canPickToSlot(player.getInventory(), slotNum)) continue;
            return slotNum;
        }
        return -1;
    }

    private static int getEmptyPickBlockableHotbarSlot(Inventory inventory) {
        for (int i = 0; i < PICK_BLOCKABLE_SLOTS.size(); ++i) {
            ItemStack stack;
            int slotNum = PICK_BLOCKABLE_SLOTS.get(i);
            if (!Inventory.isHotbarSlot((int)slotNum) || !(stack = inventory.getItem(slotNum)).isEmpty()) continue;
            return slotNum;
        }
        return -1;
    }

    public static boolean doesShulkerBoxContainItem(ItemStack stack, ItemStack referenceItem) {
        NonNullList items = fi.dy.masa.malilib.util.InventoryUtils.getStoredItems((ItemStack)stack);
        return InventoryUtils.doesListContainItem((NonNullList<ItemStack>)items, referenceItem);
    }

    public static boolean doesBundleContainItem(ItemStack stack, ItemStack referenceItem) {
        NonNullList items = fi.dy.masa.malilib.util.InventoryUtils.getBundleItems((ItemStack)stack);
        return InventoryUtils.doesListContainItem((NonNullList<ItemStack>)items, referenceItem);
    }

    private static boolean doesListContainItem(NonNullList<ItemStack> items, ItemStack referenceItem) {
        if (items.size() > 0) {
            for (ItemStack item : items) {
                if (!fi.dy.masa.malilib.util.InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)item, (ItemStack)referenceItem)) continue;
                return true;
            }
        }
        return false;
    }

    public static int findSlotWithBoxWithItem(AbstractContainerMenu container, ItemStack stackReference, boolean reverse) {
        int startSlot = reverse ? container.slots.size() - 1 : 0;
        int endSlot = reverse ? -1 : container.slots.size();
        int increment = reverse ? -1 : 1;
        boolean isPlayerInv = container instanceof InventoryMenu;
        for (int slotNum = startSlot; slotNum != endSlot; slotNum += increment) {
            Slot slot = (Slot)container.slots.get(slotNum);
            if (isPlayerInv && !fi.dy.masa.malilib.util.InventoryUtils.isRegularInventorySlot((int)slot.index, (boolean)false) || !InventoryUtils.doesShulkerBoxContainItem(slot.getItem(), stackReference)) continue;
            return slot.index;
        }
        return -1;
    }

    @Nullable
    public static InventoryOverlayContext getTargetInventory(Level world, BlockPos pos) {
        BlockState state = world.getBlockState(pos);
        Block blockTmp = state.getBlock();
        CompoundData data = new CompoundData();
        BlockEntity be = null;
        if (blockTmp instanceof EntityBlock) {
            Optional<NbtInventory> combinedInv = InventoryUtils.getCombinedInventory(world, pos);
            ListData list = null;
            if (combinedInv.isPresent()) {
                NbtInventory inventory = combinedInv.get();
                list = inventory.sorted().toDataList(world.registryAccess());
            }
            if (world instanceof ServerLevel || world instanceof WorldSchematic) {
                be = world.getChunkAt(pos).getBlockEntity(pos);
                if (be != null) {
                    data = DataConverterNbt.fromVanillaCompound((CompoundTag)be.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess()));
                    if (list != null && !list.isEmpty()) {
                        data.remove("Items");
                        data.put("Items", (BaseData)list);
                    }
                }
            } else {
                Pair<BlockEntity, CompoundData> pair = EntityDataManager.getInstance().requestBlockEntityWrapped(world, pos);
                if (pair != null) {
                    data = (CompoundData)pair.getRight();
                    be = (BlockEntity)pair.getLeft();
                    if (list != null && !list.isEmpty()) {
                        data.remove("Items");
                        data.put("Items", (BaseData)list);
                    }
                }
            }
            InventoryOverlayContext ctx = InventoryUtils.getTargetInventoryFromBlock(world, pos, be, data);
            if (world instanceof WorldSchematic) {
                return ctx;
            }
            if (lastBlockEntityContext != null && !((BlockPos)lastBlockEntityContext.getLeft()).equals((Object)pos)) {
                lastBlockEntityContext = null;
            }
            if (ctx != null && ctx.inv() != null) {
                lastBlockEntityContext = Pair.of((Object)pos, (Object)ctx);
                return ctx;
            }
            if (lastBlockEntityContext != null && ((BlockPos)lastBlockEntityContext.getLeft()).equals((Object)pos)) {
                return (InventoryOverlayContext)lastBlockEntityContext.getRight();
            }
        }
        return null;
    }

    @Nullable
    private static InventoryOverlayContext getTargetInventoryFromBlock(Level world, BlockPos pos, @Nullable BlockEntity be, CompoundData data) {
        Container inv;
        if (be != null) {
            if (data.isEmpty()) {
                data = DataConverterNbt.fromVanillaCompound((CompoundTag)be.saveWithFullMetadata((HolderLookup.Provider)world.registryAccess()));
            }
            inv = fi.dy.masa.malilib.util.InventoryUtils.getInventory((Level)world, (BlockPos)pos);
        } else {
            Pair<BlockEntity, CompoundData> pair;
            if (data.isEmpty() && (pair = EntityDataManager.getInstance().requestBlockEntityWrapped(world, pos)) != null) {
                data = (CompoundData)pair.getRight();
            }
            inv = EntityDataManager.getInstance().getBlockInventoryWrapped(world, pos, false);
        }
        if (data != null && !data.isEmpty()) {
            Container inv2 = fi.dy.masa.malilib.util.InventoryUtils.getDataInventory((CompoundData)data, (int)(inv != null ? inv.getContainerSize() : -1), (RegistryAccess)world.registryAccess());
            if (inv == null) {
                inv = inv2;
            }
        }
        if (inv == null || data == null) {
            return null;
        }
        return new InventoryOverlayContext(InventoryOverlay.getBestInventoryType((Container)inv, (CompoundData)data), inv, be != null ? be : world.getBlockEntity(pos), null, data, (InventoryOverlayRefresher)new Refresher());
    }

    public static Optional<NbtInventory> getCombinedInventory(Level world, BlockPos pos) {
        Container inv = world instanceof ServerLevel || world instanceof WorldSchematic ? fi.dy.masa.malilib.util.InventoryUtils.getInventory((Level)world, (BlockPos)pos) : EntityDataManager.getInstance().getBlockInventoryWrapped(world, pos, false);
        if (inv != null && inv.getContainerSize() >= 27) {
            return Optional.of(NbtInventory.fromInventory((Container)inv));
        }
        return Optional.empty();
    }

    @Nullable
    public static String convertItemNbtToString(CompoundTag nbt) {
        int count;
        StringBuilder result = new StringBuilder();
        if (nbt.isEmpty()) {
            return null;
        }
        if (!nbt.contains("id")) {
            return null;
        }
        result.append(nbt.getStringOr("id", "?"));
        if (nbt.contains("components")) {
            CompoundTag components = nbt.getCompoundOrEmpty("components");
            int count2 = 0;
            result.append("[");
            for (String key : components.keySet()) {
                if (count2 > 0) {
                    result.append(", ");
                }
                result.append(key);
                result.append("=");
                result.append(components.get(key));
                ++count2;
            }
            result.append("]");
        }
        if (nbt.contains("count") && (count = nbt.getIntOr("count", 1)) > 1) {
            result.append(" ");
            result.append(count);
        }
        return result.toString();
    }

    @ApiStatus.Experimental
    public static void preRestockHand(Player player, InteractionHand hand, int threshold, boolean allowHotbar) {
        if (player == null) {
            return;
        }
        Inventory container = player.getInventory();
        ItemStack handStack = player.getItemInHand(hand);
        int count = handStack.getCount();
        int max = handStack.getMaxStackSize();
        if (!handStack.isEmpty() && InventoryUtils.getCursorStack().isEmpty() && count <= threshold && count < max) {
            int endSlot = allowHotbar ? 44 : 35;
            int currentMainHandSlot = InventoryUtils.getSelectedHotbarSlot() + 36;
            int currentSlot = hand == InteractionHand.MAIN_HAND ? currentMainHandSlot : 45;
            for (int slotNum = 9; slotNum <= endSlot; ++slotNum) {
                if (slotNum == currentMainHandSlot) continue;
                Minecraft mc = Minecraft.getInstance();
                InventoryMenu handler = player.inventoryMenu;
                Slot slot = (Slot)handler.slots.get(slotNum);
                ItemStack stackSlot = container.getItem(slotNum);
                if (!fi.dy.masa.malilib.util.InventoryUtils.areStacksEqualIgnoreDurability((ItemStack)stackSlot, (ItemStack)handStack)) continue;
                int button = stackSlot.getCount() + count <= max ? 0 : 1;
                mc.gameMode.handleContainerInput(handler.containerId, slot.index, button, ContainerInput.PICKUP, player);
                mc.gameMode.handleContainerInput(handler.containerId, currentSlot, 0, ContainerInput.PICKUP, player);
                break;
            }
        }
    }

    @ApiStatus.Experimental
    public static ItemStack getCursorStack() {
        LocalPlayer player = Minecraft.getInstance().player;
        if (player == null) {
            return ItemStack.EMPTY;
        }
        Inventory inv = player.getInventory();
        return inv != null ? inv.getSelectedItem() : ItemStack.EMPTY;
    }

    @ApiStatus.Experimental
    public static int getSelectedHotbarSlot() {
        LocalPlayer player = Minecraft.getInstance().player;
        if (player == null) {
            return 0;
        }
        Inventory inv = player.getInventory();
        return inv != null ? inv.getSelectedSlot() : 0;
    }

    static {
        lastBlockEntityContext = null;
    }

    public static class Refresher
    implements InventoryOverlayRefresher {
        public InventoryOverlayContext onContextRefresh(InventoryOverlayContext data, Level world) {
            if (data.be() != null) {
                InventoryUtils.getTargetInventory(world, data.be().getBlockPos());
                data = InventoryUtils.getTargetInventoryFromBlock(data.be().getLevel(), data.be().getBlockPos(), data.be(), data.data());
            }
            return data;
        }
    }
}

