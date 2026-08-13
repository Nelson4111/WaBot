/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.render.uniform.ChunkFixUniform
 *  net.minecraft.client.renderer.blockentity.state.BlockEntityRenderState
 *  net.minecraft.client.renderer.entity.state.EntityRenderState
 *  net.minecraft.client.renderer.state.level.CameraRenderState
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.render.schematic.ChunkRenderBatchDraw;
import fi.dy.masa.malilib.render.uniform.ChunkFixUniform;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.renderer.blockentity.state.BlockEntityRenderState;
import net.minecraft.client.renderer.entity.state.EntityRenderState;
import net.minecraft.client.renderer.state.level.CameraRenderState;

public class SchematicRenderState {
    protected CameraRenderState cameraState = new CameraRenderState();
    protected final List<BlockEntityRenderState> blockEntityStates = new ArrayList<BlockEntityRenderState>();
    protected final List<EntityRenderState> entityStates = new ArrayList<EntityRenderState>();
    protected ChunkRenderBatchDraw batchDraw = null;
    protected ChunkFixUniform chunkFixUniform = new ChunkFixUniform();

    protected SchematicRenderState() {
    }

    protected boolean hasBatchDraw() {
        return this.batchDraw != null;
    }

    protected ChunkRenderBatchDraw getBatchDraw() {
        return this.batchDraw;
    }

    protected void clear() {
        this.blockEntityStates.clear();
        this.entityStates.clear();
        this.batchDraw = null;
    }

    protected void clearChunkFixUniform() {
        try {
            this.chunkFixUniform.close();
        }
        catch (Exception exception) {
            // empty catch block
        }
        this.chunkFixUniform = new ChunkFixUniform();
    }
}

