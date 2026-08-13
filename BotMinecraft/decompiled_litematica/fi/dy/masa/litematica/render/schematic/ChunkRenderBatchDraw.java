/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.IndexType
 *  com.mojang.blaze3d.PrimitiveTopology
 *  com.mojang.blaze3d.buffers.GpuBuffer
 *  com.mojang.blaze3d.buffers.GpuBufferSlice
 *  com.mojang.blaze3d.pipeline.RenderPipeline
 *  com.mojang.blaze3d.pipeline.RenderTarget
 *  com.mojang.blaze3d.systems.RenderPass
 *  com.mojang.blaze3d.systems.RenderPass$Draw
 *  com.mojang.blaze3d.systems.RenderSystem
 *  com.mojang.blaze3d.systems.RenderSystem$AutoStorageIndexBuffer
 *  com.mojang.blaze3d.textures.FilterMode
 *  com.mojang.blaze3d.textures.GpuSampler
 *  com.mojang.blaze3d.textures.GpuTextureView
 *  net.minecraft.SharedConstants
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup
 *  net.minecraft.util.profiling.ProfilerFiller
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.IndexType;
import com.mojang.blaze3d.PrimitiveTopology;
import com.mojang.blaze3d.buffers.GpuBuffer;
import com.mojang.blaze3d.buffers.GpuBufferSlice;
import com.mojang.blaze3d.pipeline.RenderPipeline;
import com.mojang.blaze3d.pipeline.RenderTarget;
import com.mojang.blaze3d.systems.RenderPass;
import com.mojang.blaze3d.systems.RenderSystem;
import com.mojang.blaze3d.textures.FilterMode;
import com.mojang.blaze3d.textures.GpuSampler;
import com.mojang.blaze3d.textures.GpuTextureView;
import fi.dy.masa.litematica.render.schematic.ChunkRenderLayers;
import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import net.minecraft.SharedConstants;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.client.renderer.chunk.ChunkSectionLayerGroup;
import net.minecraft.util.profiling.ProfilerFiller;

public record ChunkRenderBatchDraw(GpuTextureView atlasTexture, EnumMap<ChunkSectionLayer, List<RenderPass.Draw<GpuBufferSlice[]>>> drawData, boolean renderCollidingBlocks, boolean renderTranslucent, int maxIndicesRequired, GpuBufferSlice[] dynamicTransforms, GpuBufferSlice chunkFixUBO) {
    public void draw(ChunkSectionLayerGroup group, GpuSampler sampler, ProfilerFiller profiler) {
        RenderSystem.AutoStorageIndexBuffer defaultIndices = RenderSystem.getSequentialBuffer((PrimitiveTopology)PrimitiveTopology.QUADS);
        GpuBuffer defaultIBO = this.maxIndicesRequired() == 0 ? null : defaultIndices.getBuffer(this.maxIndicesRequired());
        IndexType indexType = this.maxIndicesRequired() == 0 ? null : defaultIndices.type();
        ChunkSectionLayer[] layers = group.layers();
        Minecraft mc = Minecraft.getInstance();
        boolean wf = SharedConstants.DEBUG_HOTKEYS && mc.wireframe;
        RenderTarget fb = group.outputTarget();
        profiler.push("draw_group");
        try (RenderPass pass = RenderSystem.getDevice().createCommandEncoder().createRenderPass(() -> "litematica:schematic_chunk/" + group.label(), fb.getColorTextureView(), Optional.empty(), fb.getDepthTextureView(), OptionalDouble.empty());){
            RenderSystem.bindDefaultUniforms((RenderPass)pass);
            pass.setUniform("ChunkFix", this.chunkFixUBO);
            pass.bindTexture("Sampler0", this.atlasTexture, sampler);
            pass.bindTexture("Sampler2", mc.gameRenderer.lightmap(), RenderSystem.getSamplerCache().getClampToEdge(FilterMode.LINEAR));
            for (ChunkSectionLayer layer : layers) {
                List draws = this.drawData().get(layer);
                profiler.popPush("draw_group_" + layer.label());
                if (draws.isEmpty()) continue;
                if (layer == ChunkSectionLayer.TRANSLUCENT) {
                    draws = draws.reversed();
                }
                if (wf) {
                    pass.setPipeline(this.renderCollidingBlocks() ? (RenderPipeline)ChunkRenderLayers.getWireframe().getRight() : (RenderPipeline)ChunkRenderLayers.getWireframe().getLeft());
                    continue;
                }
                if (this.renderTranslucent()) {
                    pass.setPipeline(this.renderCollidingBlocks() ? (RenderPipeline)ChunkRenderLayers.PIPELINE_MAP.get(ChunkSectionLayer.TRANSLUCENT).getRight() : (RenderPipeline)ChunkRenderLayers.PIPELINE_MAP.get(ChunkSectionLayer.TRANSLUCENT).getLeft());
                } else {
                    pass.setPipeline(this.renderCollidingBlocks() ? (RenderPipeline)ChunkRenderLayers.PIPELINE_MAP.get(layer).getRight() : (RenderPipeline)ChunkRenderLayers.PIPELINE_MAP.get(layer).getLeft());
                }
                pass.drawMultipleIndexed((Collection)draws, defaultIBO, indexType, (Collection)List.of((Object)"DynamicTransforms"), (Object)this.dynamicTransforms());
            }
        }
        catch (Exception exception) {
            // empty catch block
        }
        profiler.pop();
    }
}

