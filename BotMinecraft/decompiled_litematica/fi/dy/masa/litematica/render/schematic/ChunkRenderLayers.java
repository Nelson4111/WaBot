/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.pipeline.RenderPipeline
 *  fi.dy.masa.malilib.render.MaLiLibPipelines
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.client.renderer.rendertype.RenderType
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.pipeline.RenderPipeline;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import fi.dy.masa.malilib.render.MaLiLibPipelines;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.client.renderer.rendertype.RenderType;
import org.apache.commons.lang3.tuple.Pair;

public record ChunkRenderLayers() {
    public static final List<ChunkSectionLayer> BLOCK_RENDER_LAYERS = ChunkRenderLayers.getBlockRenderLayers();
    public static final List<OverlayRenderType> TYPES = ChunkRenderLayers.getTypes();
    public static final HashMap<ChunkSectionLayer, Pair<RenderPipeline, RenderPipeline>> PIPELINE_MAP = ChunkRenderLayers.getBlockRenderPipelineMap();

    private static List<ChunkSectionLayer> getBlockRenderLayers() {
        return new ArrayList<ChunkSectionLayer>(List.of((Object[])ChunkSectionLayer.values()));
    }

    private static HashMap<ChunkSectionLayer, Pair<RenderPipeline, RenderPipeline>> getBlockRenderPipelineMap() {
        HashMap<ChunkSectionLayer, Pair<RenderPipeline, RenderPipeline>> map = new HashMap<ChunkSectionLayer, Pair<RenderPipeline, RenderPipeline>>();
        map.put(ChunkSectionLayer.SOLID, Pair.of((Object)MaLiLibPipelines.LEGACY_SOLID_TERRAIN, (Object)MaLiLibPipelines.LEGACY_SOLID_TERRAIN_OFFSET));
        map.put(ChunkSectionLayer.CUTOUT, Pair.of((Object)MaLiLibPipelines.LEGACY_CUTOUT_TERRAIN, (Object)MaLiLibPipelines.LEGACY_CUTOUT_TERRAIN_OFFSET));
        map.put(ChunkSectionLayer.TRANSLUCENT, Pair.of((Object)MaLiLibPipelines.LEGACY_TRANSLUCENT, (Object)MaLiLibPipelines.LEGACY_TRANSLUCENT_OFFSET));
        return map;
    }

    public static Pair<RenderPipeline, RenderPipeline> getWireframe() {
        return Pair.of((Object)MaLiLibPipelines.LEGACY_WIREFRAME, (Object)MaLiLibPipelines.LEGACY_WIREFRAME_OFFSET);
    }

    private static List<OverlayRenderType> getTypes() {
        return Arrays.stream(OverlayRenderType.values()).toList();
    }

    public static String getFriendlyName(RenderType layer) {
        String base = layer.toString();
        if (base.contains(":")) {
            String[] results1 = base.split(":", 2);
            if (results1[0].contains("[")) {
                String[] results2 = results1[0].split("\\[");
                return String.valueOf(layer.format()) + "/" + results2[1];
            }
            return String.valueOf(layer.format()) + "/" + results1[0];
        }
        return String.valueOf(layer.format()) + "/" + base;
    }
}

