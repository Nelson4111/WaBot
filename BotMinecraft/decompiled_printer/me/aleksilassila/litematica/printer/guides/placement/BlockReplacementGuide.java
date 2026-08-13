/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nullable
 *  net.minecraft.client.player.LocalPlayer
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.Item
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.CandleBlock
 *  net.minecraft.world.level.block.SeaPickleBlock
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.SnowLayerBlock
 *  net.minecraft.world.level.block.state.properties.IntegerProperty
 *  net.minecraft.world.level.block.state.properties.Property
 *  net.minecraft.world.level.block.state.properties.SlabType
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package me.aleksilassila.litematica.printer.guides.placement;

import java.util.HashMap;
import java.util.Optional;
import javax.annotation.Nullable;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.Guide;
import me.aleksilassila.litematica.printer.guides.placement.PlacementGuide;
import me.aleksilassila.litematica.printer.implementation.PrinterPlacementContext;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.CandleBlock;
import net.minecraft.world.level.block.SeaPickleBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.SnowLayerBlock;
import net.minecraft.world.level.block.state.properties.IntegerProperty;
import net.minecraft.world.level.block.state.properties.Property;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public class BlockReplacementGuide
extends PlacementGuide {
    private static final HashMap<IntegerProperty, Item> increasingProperties = new HashMap();
    private Integer currentLevel = null;
    private Integer targetLevel = null;
    private IntegerProperty increasingProperty = null;

    public BlockReplacementGuide(SchematicBlockState state) {
        super(state);
        for (IntegerProperty property : increasingProperties.keySet()) {
            if (!this.targetState.hasProperty((Property)property) || !this.currentState.hasProperty((Property)property)) continue;
            this.currentLevel = (Integer)this.currentState.getValue((Property)property);
            this.targetLevel = (Integer)this.targetState.getValue((Property)property);
            this.increasingProperty = property;
            break;
        }
    }

    @Override
    protected boolean getUseShift(SchematicBlockState state) {
        return false;
    }

    @Override
    @Nullable
    public PrinterPlacementContext getPlacementContext(LocalPlayer player) {
        Optional<ItemStack> requiredItem = this.getRequiredItem(player);
        int slot = this.getRequiredItemStackSlot(player);
        if (requiredItem.isEmpty() || slot == -1) {
            return null;
        }
        BlockHitResult hitResult = new BlockHitResult(Vec3.atCenterOf((Vec3i)this.state.blockPos), Direction.UP, this.state.blockPos, false);
        return new PrinterPlacementContext((Player)player, hitResult, requiredItem.get(), slot);
    }

    @Override
    public boolean canExecute(LocalPlayer player) {
        if (Guide.getProperty(this.targetState, SlabBlock.TYPE).orElse(null) == SlabType.DOUBLE && Guide.getProperty(this.currentState, SlabBlock.TYPE).orElse(SlabType.DOUBLE) != SlabType.DOUBLE) {
            return super.canExecute(player);
        }
        if (this.currentLevel == null || this.targetLevel == null || this.increasingProperty == null) {
            return false;
        }
        if (!this.statesEqualIgnoreProperties(this.currentState, this.targetState, new Property[]{CandleBlock.LIT, this.increasingProperty})) {
            return false;
        }
        if (this.currentLevel >= this.targetLevel) {
            return false;
        }
        return super.canExecute(player);
    }

    static {
        increasingProperties.put(SnowLayerBlock.LAYERS, null);
        increasingProperties.put(SeaPickleBlock.PICKLES, null);
        increasingProperties.put(CandleBlock.CANDLES, null);
    }
}

