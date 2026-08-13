/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nonnull
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.state.BlockState
 *  org.jetbrains.annotations.ApiStatus$Internal
 */
package fi.dy.masa.litematica.schematic.pickblock;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.interfaces.ISchematicPickBlockEventListener;
import fi.dy.masa.litematica.interfaces.ISchematicPickBlockEventManager;
import fi.dy.masa.litematica.interfaces.ISchematicPickBlockSlotHandler;
import fi.dy.masa.litematica.schematic.pickblock.SchematicPickBlockEventResult;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
import javax.annotation.Nonnull;
import net.minecraft.core.BlockPos;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.ApiStatus;

public class SchematicPickBlockEventHandler
implements ISchematicPickBlockEventManager {
    private static final SchematicPickBlockEventHandler INSTANCE = new SchematicPickBlockEventHandler();
    private final List<ISchematicPickBlockEventListener> handlers = new ArrayList<ISchematicPickBlockEventListener>();
    private ItemStack pickStack = ItemStack.EMPTY;
    private ISchematicPickBlockSlotHandler slotHandler = null;
    private boolean processingCancelled = false;
    private Supplier<String> processingCancelledBy = () -> "not_cancelled";

    public static SchematicPickBlockEventHandler getInstance() {
        return INSTANCE;
    }

    private SchematicPickBlockEventHandler() {
    }

    @Override
    public void registerSchematicPickBlockEventListener(@Nonnull ISchematicPickBlockEventListener listener) {
        if (!this.handlers.contains(listener)) {
            this.handlers.add(listener);
        }
    }

    @Override
    public SchematicPickBlockEventResult invokeRedirectPickBlockStack(ISchematicPickBlockEventListener listener, ItemStack newStack) {
        if (!this.pickStack.isEmpty()) {
            return SchematicPickBlockEventResult.ERROR;
        }
        this.pickStack = newStack.copy();
        return SchematicPickBlockEventResult.SUCCESS;
    }

    @Override
    public SchematicPickBlockEventResult invokeRedirectPickBlockSlotHandler(ISchematicPickBlockEventListener listener, ISchematicPickBlockSlotHandler slotHandler) {
        if (this.slotHandler != null) {
            return SchematicPickBlockEventResult.ERROR;
        }
        this.slotHandler = slotHandler;
        return SchematicPickBlockEventResult.SUCCESS;
    }

    @Override
    public boolean hasPickStack() {
        return !this.pickStack.isEmpty();
    }

    @Override
    public boolean hasSlotHandler() {
        return this.slotHandler != null;
    }

    @Override
    public ItemStack getPickStack() {
        return this.pickStack;
    }

    @Override
    public boolean isProcessingCancelled() {
        return this.processingCancelled;
    }

    @Override
    public void resetCancelled() {
        if (this.isProcessingCancelled()) {
            this.processingCancelled = false;
            this.processingCancelledBy = () -> "not_cancelled";
        }
    }

    @Override
    public Supplier<String> getProcessingCancelledBy() {
        return this.processingCancelledBy;
    }

    @ApiStatus.Internal
    public boolean executePickBlockHandler(Level world, BlockPos pos, ItemStack stack) {
        if (this.slotHandler != null) {
            SchematicPickBlockEventResult result = this.slotHandler.executePickBlock(world, pos, stack);
            if (result == SchematicPickBlockEventResult.CANCEL) {
                Litematica.LOGGER.warn("SchematicPickBlockEventHandler: Processing cancelled by: {} during 'executePickBlockHandler'", (Object)this.slotHandler.getName().get());
                this.processingCancelled = true;
                this.processingCancelledBy = this.slotHandler.getName();
                return true;
            }
            if (result == SchematicPickBlockEventResult.ERROR) {
                Litematica.LOGGER.error("SchematicPickBlockEventHandler: Error processing 'executePickBlockHandler' from: {}", (Object)this.slotHandler.getName().get());
                this.resetCancelled();
            } else {
                this.resetCancelled();
            }
        }
        return false;
    }

    @ApiStatus.Internal
    public boolean onSchematicPickBlockStart(boolean closest) {
        for (ISchematicPickBlockEventListener handler : this.handlers) {
            if (this.isProcessingCancelled()) {
                handler.onSchematicPickBlockCancelled(this.getProcessingCancelledBy());
                continue;
            }
            SchematicPickBlockEventResult result = handler.onSchematicPickBlockStart(closest);
            if (result == SchematicPickBlockEventResult.CANCEL) {
                Litematica.LOGGER.warn("SchematicPickBlockEventHandler: Processing cancelled by: {} during 'onSchematicPickBlockStart'", (Object)handler.getName().get());
                this.processingCancelled = true;
                this.processingCancelledBy = handler.getName();
                continue;
            }
            if (result == SchematicPickBlockEventResult.ERROR) {
                Litematica.LOGGER.error("SchematicPickBlockEventHandler: Error processing 'onSchematicPickBlockStart' from: {}", (Object)handler.getName().get());
                this.resetCancelled();
                continue;
            }
            this.resetCancelled();
        }
        return this.isProcessingCancelled();
    }

    @ApiStatus.Internal
    public boolean onSchematicPickBlockPreGather(Level schematicWorld, BlockPos pos, BlockState expectedState) {
        for (ISchematicPickBlockEventListener handler : this.handlers) {
            if (this.isProcessingCancelled()) {
                handler.onSchematicPickBlockCancelled(this.getProcessingCancelledBy());
                continue;
            }
            SchematicPickBlockEventResult result = handler.onSchematicPickBlockPreGather(schematicWorld, pos, expectedState);
            if (result == SchematicPickBlockEventResult.CANCEL) {
                Litematica.LOGGER.warn("SchematicPickBlockEventHandler: Processing cancelled by: {} during 'onSchematicPickBlockPreGather'", (Object)handler.getName().get());
                this.processingCancelled = true;
                this.processingCancelledBy = handler.getName();
                continue;
            }
            if (result == SchematicPickBlockEventResult.ERROR) {
                Litematica.LOGGER.error("SchematicPickBlockEventHandler: Error processing 'onSchematicPickBlockPreGather' from: {}", (Object)handler.getName().get());
                this.resetCancelled();
                continue;
            }
            this.resetCancelled();
        }
        return this.isProcessingCancelled();
    }

    @ApiStatus.Internal
    public boolean onSchematicPickBlockPrePick(Level schematicWorld, BlockPos pos, BlockState expectedState, ItemStack stack) {
        for (ISchematicPickBlockEventListener handler : this.handlers) {
            if (this.isProcessingCancelled()) {
                handler.onSchematicPickBlockCancelled(this.getProcessingCancelledBy());
                continue;
            }
            SchematicPickBlockEventResult result = handler.onSchematicPickBlockPrePick(schematicWorld, pos, expectedState, stack);
            if (result == SchematicPickBlockEventResult.CANCEL) {
                Litematica.LOGGER.warn("SchematicPickBlockEventHandler: Processing cancelled by: {} during 'onSchematicPickBlockPrePick'", (Object)handler.getName().get());
                this.processingCancelled = true;
                this.processingCancelledBy = handler.getName();
                continue;
            }
            if (result == SchematicPickBlockEventResult.ERROR) {
                Litematica.LOGGER.error("SchematicPickBlockEventHandler: Error processing 'onSchematicPickBlockPrePick' from: {}", (Object)handler.getName().get());
                this.resetCancelled();
                continue;
            }
            this.resetCancelled();
        }
        return this.isProcessingCancelled();
    }

    @ApiStatus.Internal
    public void onSchematicPickBlockSuccess() {
        for (ISchematicPickBlockEventListener handler : this.handlers) {
            if (this.isProcessingCancelled()) {
                handler.onSchematicPickBlockCancelled(this.getProcessingCancelledBy());
            } else {
                handler.onSchematicPickBlockSuccess();
            }
            this.resetCancelled();
        }
    }
}

