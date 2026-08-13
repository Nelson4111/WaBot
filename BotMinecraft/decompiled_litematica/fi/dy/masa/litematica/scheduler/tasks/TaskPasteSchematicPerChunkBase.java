/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkMultiPhase;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.util.PasteLayerBehavior;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.Collection;
import java.util.Set;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;

public abstract class TaskPasteSchematicPerChunkBase
extends TaskProcessChunkMultiPhase {
    protected final ImmutableList<SchematicPlacement> placements;
    protected final LayerRange layerRange;
    protected final ReplaceBehavior replace;
    protected final PasteLayerBehavior layerBehavior;
    protected final boolean changedBlockOnly;
    protected boolean ignoreBlocks;
    protected boolean ignoreEntities;

    public TaskPasteSchematicPerChunkBase(Collection<SchematicPlacement> placements, LayerRange range, boolean changedBlocksOnly) {
        super("litematica.gui.label.task_name.paste");
        this.placements = ImmutableList.copyOf(placements);
        this.layerRange = range;
        this.changedBlockOnly = changedBlocksOnly;
        this.ignoreEntities = Configs.Generic.PASTE_IGNORE_ENTITIES.getBooleanValue();
        this.replace = (ReplaceBehavior)Configs.Generic.PASTE_REPLACE_BEHAVIOR.getOptionListValue();
        this.layerBehavior = (PasteLayerBehavior)Configs.Generic.PASTE_LAYER_BEHAVIOR.getOptionListValue();
    }

    @Override
    public void init() {
        for (SchematicPlacement placement : this.placements) {
            this.addPlacement(placement, this.layerRange);
        }
        this.pendingChunks.clear();
        this.pendingChunks.addAll(this.boxesInChunks.keySet());
        this.sortChunkList();
    }

    @Override
    public boolean canExecute() {
        return super.canExecute() && this.schematicWorld != null;
    }

    protected void addPlacement(SchematicPlacement placement, LayerRange range) {
        Set<ChunkPos> touchedChunks = placement.getTouchedChunks(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED);
        for (ChunkPos pos : touchedChunks) {
            int count = 0;
            for (IntBoundingBox box : placement.getBoxesWithinChunk(pos.x(), pos.z()).values()) {
                if ((box = PositionUtils.getClampedBox(box, range)) == null || (box = PositionUtils.clampBoxToWorldHeightRange(box, (Level)this.clientWorld)) == null) continue;
                this.boxesInChunks.put((Object)pos, (Object)box);
                ++count;
            }
            if (count <= 0) continue;
            this.onChunkAddedForHandling(pos, placement);
        }
    }

    protected void onChunkAddedForHandling(ChunkPos pos, SchematicPlacement placement) {
    }

    @Override
    protected boolean canProcessChunk(ChunkPos pos) {
        if (!this.schematicWorld.getChunkSource().hasChunk(pos.x(), pos.z()) || PlacementManagerDaemonHandler.INSTANCE.hasAnyRebuildTasksFor(pos)) {
            return false;
        }
        return this.areSurroundingChunksLoaded(pos, this.clientWorld, 1);
    }
}

