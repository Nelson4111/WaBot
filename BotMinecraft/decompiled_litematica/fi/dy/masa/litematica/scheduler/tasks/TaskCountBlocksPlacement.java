/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableCollection
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.ImmutableCollection;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.materials.IMaterialList;
import fi.dy.masa.litematica.scheduler.tasks.TaskCountBlocksBase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.util.BlockInfoListType;
import java.util.Collection;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.state.BlockState;

public class TaskCountBlocksPlacement
extends TaskCountBlocksBase {
    protected final SchematicPlacement schematicPlacement;
    protected final boolean ignoreState;

    public TaskCountBlocksPlacement(SchematicPlacement schematicPlacement, IMaterialList materialList) {
        this(schematicPlacement, materialList, false);
    }

    public TaskCountBlocksPlacement(SchematicPlacement schematicPlacement, IMaterialList materialList, boolean ignoreState) {
        super(materialList, "litematica.gui.label.task_name.material_list");
        this.schematicPlacement = schematicPlacement;
        this.ignoreState = ignoreState;
        ImmutableCollection boxes = schematicPlacement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED).values();
        if (materialList.getMaterialListType() == BlockInfoListType.RENDER_LAYERS) {
            this.addPerChunkBoxes((Collection<Box>)boxes, DataManager.getRenderLayerRange());
        } else {
            this.addPerChunkBoxes((Collection<Box>)boxes);
        }
    }

    @Override
    public boolean canExecute() {
        return super.canExecute() && this.schematicWorld != null;
    }

    @Override
    protected void countAtPosition(BlockPos pos) {
        BlockState stateSchematic = this.schematicWorld.getBlockState(pos);
        if (!stateSchematic.isAir()) {
            BlockState stateClient = this.clientWorld.getBlockState(pos);
            this.countsTotal.addTo((Object)stateSchematic, 1);
            if (stateClient.isAir()) {
                this.countsMissing.addTo((Object)stateSchematic, 1);
            } else if (!(stateClient == stateSchematic || this.ignoreState && stateClient.getBlock() == stateSchematic.getBlock())) {
                this.countsMissing.addTo((Object)stateSchematic, 1);
                this.countsMismatch.addTo((Object)stateSchematic, 1);
            }
        }
    }
}

