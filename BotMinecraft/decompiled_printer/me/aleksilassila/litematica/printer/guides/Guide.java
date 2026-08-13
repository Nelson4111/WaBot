/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.world.entity.player.Inventory
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.CoralPlantBlock
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.block.state.properties.BlockStateProperties
 *  net.minecraft.world.level.block.state.properties.Property
 */
package me.aleksilassila.litematica.printer.guides;

import java.util.List;
import java.util.Optional;
import javax.annotation.Nonnull;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.implementation.BlockHelperImpl;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.CoralPlantBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.world.level.block.state.properties.Property;

public abstract class Guide
extends BlockHelperImpl {
    protected final SchematicBlockState state;
    protected final BlockState currentState;
    protected final BlockState targetState;

    public Guide(SchematicBlockState state) {
        this.state = state;
        this.currentState = state.currentState;
        this.targetState = state.targetState;
    }

    protected boolean playerHasRightItem(LocalPlayer player) {
        return this.getRequiredItemStackSlot(player) != -1;
    }

    protected int getSlotWithItem(LocalPlayer player, ItemStack itemStack) {
        Inventory inventory = player.getInventory();
        for (int i = 0; i < inventory.getNonEquipmentItems().size(); ++i) {
            if (itemStack.isEmpty() && ((ItemStack)inventory.getNonEquipmentItems().get(i)).is((Object)itemStack.getItem())) {
                return i;
            }
            if (((ItemStack)inventory.getNonEquipmentItems().get(i)).isEmpty() || !ItemStack.isSameItem((ItemStack)((ItemStack)inventory.getNonEquipmentItems().get(i)), (ItemStack)itemStack)) continue;
            return i;
        }
        return -1;
    }

    protected int getRequiredItemStackSlot(LocalPlayer player) {
        if (player.getAbilities().instabuild) {
            return player.getInventory().getSelectedSlot();
        }
        Optional<ItemStack> requiredItem = this.getRequiredItem(player);
        return requiredItem.map(itemStack -> this.getSlotWithItem(player, (ItemStack)itemStack)).orElse(-1);
    }

    public boolean canExecute(LocalPlayer player) {
        if (!this.playerHasRightItem(player)) {
            return false;
        }
        BlockState targetState = this.state.targetState;
        BlockState currentState = this.state.currentState;
        return !this.statesEqual(targetState, currentState);
    }

    @Nonnull
    public abstract List<Action> execute(LocalPlayer var1);

    @Nonnull
    protected abstract List<ItemStack> getRequiredItems();

    protected Optional<ItemStack> getRequiredItem(LocalPlayer player) {
        List<ItemStack> requiredItems = this.getRequiredItems();
        for (ItemStack requiredItem : requiredItems) {
            if (player.getAbilities().instabuild) {
                return Optional.of(requiredItem);
            }
            int slot = this.getSlotWithItem(player, requiredItem);
            if (slot <= -1) continue;
            return Optional.of(requiredItem);
        }
        return Optional.empty();
    }

    protected boolean statesEqualIgnoreProperties(BlockState state1, BlockState state2, Property<?> ... propertiesToIgnore) {
        if (state1.getBlock() != state2.getBlock()) {
            return false;
        }
        block2: for (Property property : state1.getProperties()) {
            if (property == BlockStateProperties.WATERLOGGED && !(state1.getBlock() instanceof CoralPlantBlock)) continue;
            for (Property<?> ignoredProperty : propertiesToIgnore) {
                if (property == ignoredProperty) continue block2;
            }
            try {
                if (state1.getValue(property).equals(state2.getValue(property))) continue;
                return false;
            }
            catch (Exception e) {
                return false;
            }
        }
        return true;
    }

    protected static <T extends Comparable<T>> Optional<T> getProperty(BlockState blockState, Property<T> property) {
        if (blockState.hasProperty(property)) {
            return Optional.of(blockState.getValue(property));
        }
        return Optional.empty();
    }

    protected boolean statesEqual(BlockState state1, BlockState state2) {
        return this.statesEqualIgnoreProperties(state1, state2, new Property[0]);
    }

    public boolean skipOtherGuides() {
        return false;
    }
}

