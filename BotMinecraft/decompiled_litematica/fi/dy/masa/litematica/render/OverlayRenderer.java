/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableMap
 *  com.mojang.blaze3d.vertex.BufferBuilder
 *  com.mojang.blaze3d.vertex.MeshData
 *  fi.dy.masa.malilib.config.HudAlignment
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.LeftRight
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.MaLiLibPipelines
 *  fi.dy.masa.malilib.render.RenderContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.EntityUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.WorldUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.HitResult$Type
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.render;

import com.google.common.collect.ImmutableMap;
import com.mojang.blaze3d.vertex.BufferBuilder;
import com.mojang.blaze3d.vertex.MeshData;
import fi.dy.masa.litematica.compat.jade.JadeCompat;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicVerificationResult;
import fi.dy.masa.litematica.render.BlockInfo;
import fi.dy.masa.litematica.render.RenderUtils;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacementManager;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.util.BlockInfoAlignment;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.config.HudAlignment;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.MaLiLibPipelines;
import fi.dy.masa.malilib.render.RenderContext;
import fi.dy.masa.malilib.util.EntityUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.WorldUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import fi.dy.masa.malilib.util.game.BlockUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;

public class OverlayRenderer {
    private static final OverlayRenderer INSTANCE = new OverlayRenderer();
    public static final int[] KELLY_COLORS = new int[]{16757504, 8404597, 16738304, 10927575, 12648480, 13541986, 8482918, 32052, 16152206, 21386, 16743004, 5453690, 16748032, 11741265, 16041984, 8329229, 9677312, 5845781, 15809043, 2305046};
    private final Minecraft mc;
    private final Map<SchematicPlacement, ImmutableMap<String, Box>> placements = new HashMap<SchematicPlacement, ImmutableMap<String, Box>>();
    private final Color4f colorPos1 = new Color4f(1.0f, 0.0625f, 0.0625f);
    private final Color4f colorPos2 = new Color4f(0.0625f, 0.0625f, 1.0f);
    private final Color4f colorOverlapping = new Color4f(1.0f, 0.0625f, 1.0f);
    private final Color4f colorX = new Color4f(1.0f, 0.25f, 0.25f);
    private final Color4f colorY = new Color4f(0.25f, 1.0f, 0.25f);
    private final Color4f colorZ = new Color4f(0.25f, 0.25f, 1.0f);
    private final Color4f colorArea = new Color4f(1.0f, 1.0f, 1.0f);
    private final Color4f colorBoxPlacementSelected = new Color4f(0.08627451f, 1.0f, 1.0f);
    private final Color4f colorSelectedCorner = new Color4f(0.0f, 1.0f, 1.0f);
    private final Color4f colorAreaOrigin = new Color4f(1.0f, 0.5647059f, 0.0627451f);
    private long infoUpdateTime;
    private final List<String> blockInfoLines = new ArrayList<String>();
    private int blockInfoX;
    private int blockInfoY;

    private OverlayRenderer() {
        this.mc = Minecraft.getInstance();
    }

    public static OverlayRenderer getInstance() {
        return INSTANCE;
    }

    public void updatePlacementCache() {
        this.placements.clear();
        List<SchematicPlacement> list = DataManager.getSchematicPlacementManager().getAllSchematicsPlacements();
        for (SchematicPlacement placement : list) {
            if (!placement.isEnabled()) continue;
            this.placements.put(placement, placement.getSubRegionBoxes(SubRegionPlacement.RequiredEnabled.PLACEMENT_ENABLED));
        }
    }

    public void renderBoxes(ProfilerFiller profiler) {
        float lineWidthArea;
        profiler.push("render");
        SelectionManager sm = DataManager.getSelectionManager();
        AreaSelection currentSelection = sm.getCurrentSelection();
        boolean renderAreas = currentSelection != null && Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getBooleanValue();
        boolean renderPlacements = !this.placements.isEmpty() && Configs.Visuals.ENABLE_PLACEMENT_BOXES_RENDERING.getBooleanValue();
        boolean isProjectMode = DataManager.getSchematicProjectsManager().hasProjectOpen();
        float expand = 0.001f;
        float lineWidthBlockBox = 2.0f;
        float f = lineWidthArea = isProjectMode ? 3.0f : 1.5f;
        if (renderAreas || renderPlacements || isProjectMode) {
            SchematicProject project;
            profiler.popPush("render_areas");
            if (renderAreas) {
                profiler.push("selection_boxes");
                Box currentBox = currentSelection.getSelectedSubRegionBox();
                for (Box box : currentSelection.getAllSubRegionBoxes()) {
                    BoxType type = box == currentBox ? BoxType.AREA_SELECTED : BoxType.AREA_UNSELECTED;
                    this.renderSelectionBox(box, type, expand, lineWidthBlockBox, lineWidthArea, null);
                }
                BlockPos origin = currentSelection.getExplicitOrigin();
                if (origin != null) {
                    profiler.popPush("area_sides");
                    if (currentSelection.isOriginSelected()) {
                        Color4f colorTmp = Color4f.fromColor((Color4f)this.colorAreaOrigin, (float)0.4f);
                        fi.dy.masa.malilib.render.RenderUtils.renderAreaSides((BlockPos)origin, (BlockPos)origin, (Color4f)colorTmp);
                    }
                    profiler.popPush("block_outlines");
                    Color4f color = currentSelection.isOriginSelected() ? this.colorSelectedCorner : this.colorAreaOrigin;
                    fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)origin, (float)expand, (float)lineWidthBlockBox, (Color4f)color, (boolean)false);
                }
                profiler.pop();
            }
            profiler.popPush("render_placements");
            if (renderPlacements) {
                SchematicPlacementManager spm = DataManager.getSchematicPlacementManager();
                SchematicPlacement currentPlacement = spm.getSelectedSchematicPlacement();
                profiler.push("placement");
                for (Map.Entry<SchematicPlacement, ImmutableMap<String, Box>> entry : this.placements.entrySet()) {
                    SchematicPlacement schematicPlacement = entry.getKey();
                    ImmutableMap<String, Box> boxMap = entry.getValue();
                    boolean origin = schematicPlacement.getSelectedSubRegionPlacement() == null;
                    profiler.popPush("selection_boxes");
                    for (Map.Entry entryBox : boxMap.entrySet()) {
                        String boxName = (String)entryBox.getKey();
                        boolean boxSelected = schematicPlacement == currentPlacement && (origin || boxName.equals(schematicPlacement.getSelectedSubRegionName()));
                        BoxType type = boxSelected ? BoxType.PLACEMENT_SELECTED : BoxType.PLACEMENT_UNSELECTED;
                        this.renderSelectionBox((Box)entryBox.getValue(), type, expand, 1.0f, 1.0f, schematicPlacement);
                    }
                    profiler.popPush("block_outlines");
                    Color4f color = schematicPlacement == currentPlacement && origin ? this.colorSelectedCorner : schematicPlacement.getBoxesBBColor();
                    fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)schematicPlacement.getOrigin(), (float)expand, (float)lineWidthBlockBox, (Color4f)color, (boolean)false);
                    profiler.popPush("area_sides");
                    if (!Configs.Visuals.RENDER_PLACEMENT_ENCLOSING_BOX.getBooleanValue()) continue;
                    Box box = schematicPlacement.getEclosingBox();
                    if (!schematicPlacement.shouldRenderEnclosingBox() || box == null) continue;
                    fi.dy.masa.malilib.render.RenderUtils.renderAreaOutline((BlockPos)box.getPos1(), (BlockPos)box.getPos2(), (float)1.0f, (Color4f)color, (Color4f)color, (Color4f)color);
                    if (!Configs.Visuals.RENDER_PLACEMENT_ENCLOSING_BOX_SIDES.getBooleanValue()) continue;
                    float alpha = (float)Configs.Visuals.PLACEMENT_BOX_SIDE_ALPHA.getDoubleValue();
                    color = new Color4f(color.r, color.g, color.b, alpha);
                    fi.dy.masa.malilib.render.RenderUtils.renderAreaSides((BlockPos)box.getPos1(), (BlockPos)box.getPos2(), (Color4f)color);
                }
                profiler.pop();
            }
            profiler.popPush("render_projects");
            if (isProjectMode && (project = DataManager.getSchematicProjectsManager().getCurrentProject()) != null) {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)project.getOrigin(), (float)expand, (float)4.0f, (Color4f)this.colorOverlapping, (boolean)false);
            }
        }
        profiler.pop();
    }

    public void renderSelectionBox(Box box, BoxType boxType, float expand, float lineWidthBlockBox, float lineWidthArea, @Nullable SchematicPlacement placement) {
        Color4f sideColor;
        Color4f color2;
        Color4f color1;
        Color4f colorZ;
        Color4f colorY;
        Color4f colorX;
        BlockPos pos1 = box.getPos1();
        BlockPos pos2 = box.getPos2();
        if (pos1 == null && pos2 == null) {
            return;
        }
        switch (boxType.ordinal()) {
            case 0: {
                colorX = this.colorX;
                colorY = this.colorY;
                colorZ = this.colorZ;
                break;
            }
            case 1: {
                colorX = this.colorArea;
                colorY = this.colorArea;
                colorZ = this.colorArea;
                break;
            }
            case 2: {
                colorX = this.colorBoxPlacementSelected;
                colorY = this.colorBoxPlacementSelected;
                colorZ = this.colorBoxPlacementSelected;
                break;
            }
            case 3: {
                Color4f color;
                colorX = color = placement.getBoxesBBColor();
                colorY = color;
                colorZ = color;
                break;
            }
            default: {
                return;
            }
        }
        if (boxType == BoxType.PLACEMENT_SELECTED) {
            color2 = color1 = this.colorBoxPlacementSelected;
            alpha = (float)Configs.Visuals.PLACEMENT_BOX_SIDE_ALPHA.getDoubleValue();
            sideColor = new Color4f(color1.r, color1.g, color1.b, alpha);
        } else if (boxType == BoxType.PLACEMENT_UNSELECTED) {
            color2 = color1 = placement.getBoxesBBColor();
            alpha = (float)Configs.Visuals.PLACEMENT_BOX_SIDE_ALPHA.getDoubleValue();
            sideColor = new Color4f(color1.r, color1.g, color1.b, alpha);
        } else {
            color1 = box.getSelectedCorner() == PositionUtils.Corner.CORNER_1 ? this.colorSelectedCorner : this.colorPos1;
            color2 = box.getSelectedCorner() == PositionUtils.Corner.CORNER_2 ? this.colorSelectedCorner : this.colorPos2;
            sideColor = Color4f.fromColor((int)Configs.Colors.AREA_SELECTION_BOX_SIDE_COLOR.getIntegerValue());
        }
        if (pos1 != null && pos2 != null) {
            if (!pos1.equals((Object)pos2)) {
                fi.dy.masa.malilib.render.RenderUtils.renderAreaOutlineNoCorners((BlockPos)pos1, (BlockPos)pos2, (float)lineWidthArea, (Color4f)colorX, (Color4f)colorY, (Color4f)colorZ);
                if ((boxType == BoxType.AREA_SELECTED || boxType == BoxType.AREA_UNSELECTED) && Configs.Visuals.RENDER_AREA_SELECTION_BOX_SIDES.getBooleanValue() || (boxType == BoxType.PLACEMENT_SELECTED || boxType == BoxType.PLACEMENT_UNSELECTED) && Configs.Visuals.RENDER_PLACEMENT_BOX_SIDES.getBooleanValue()) {
                    fi.dy.masa.malilib.render.RenderUtils.renderAreaSides((BlockPos)pos1, (BlockPos)pos2, (Color4f)sideColor);
                }
                if (box.getSelectedCorner() == PositionUtils.Corner.CORNER_1) {
                    Color4f color = Color4f.fromColor((Color4f)this.colorPos1, (float)0.4f);
                    fi.dy.masa.malilib.render.RenderUtils.renderAreaSides((BlockPos)pos1, (BlockPos)pos1, (Color4f)color);
                } else if (box.getSelectedCorner() == PositionUtils.Corner.CORNER_2) {
                    Color4f color = Color4f.fromColor((Color4f)this.colorPos2, (float)0.4f);
                    fi.dy.masa.malilib.render.RenderUtils.renderAreaSides((BlockPos)pos2, (BlockPos)pos2, (Color4f)color);
                }
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)pos1, (float)expand, (float)lineWidthBlockBox, (Color4f)color1, (boolean)false);
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)pos2, (float)expand, (float)lineWidthBlockBox, (Color4f)color2, (boolean)false);
            } else {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutlineOverlapping((BlockPos)pos1, (float)expand, (float)lineWidthBlockBox, (Color4f)color1, (Color4f)color2, (Color4f)this.colorOverlapping, (boolean)false);
            }
        } else {
            if (pos1 != null) {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)pos1, (float)expand, (float)lineWidthBlockBox, (Color4f)color1, (boolean)false);
            }
            if (pos2 != null) {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockOutline((BlockPos)pos2, (float)expand, (float)lineWidthBlockBox, (Color4f)color2, (boolean)false);
            }
        }
    }

    public void renderSchematicVerifierMismatches(ProfilerFiller profiler) {
        SchematicVerifier verifier;
        List<SchematicVerifier.MismatchRenderPos> list;
        profiler.push("render_mismatches");
        SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
        if (placement != null && placement.hasVerifier() && !(list = (verifier = placement.getSchematicVerifier()).getSelectedMismatchPositionsForRender()).isEmpty()) {
            Entity entity = EntityUtils.getCameraEntity();
            List<BlockPos> posList = verifier.getSelectedMismatchBlockPositionsForRender();
            BlockHitResult trace = RayTraceUtils.traceToPositions(posList, entity, 128.0);
            BlockPos posLook = trace != null && trace.getType() == HitResult.Type.BLOCK ? trace.getBlockPos() : null;
            this.renderSchematicMismatches(list, posLook, profiler);
        }
        profiler.pop();
    }

    private void renderSchematicMismatches(List<SchematicVerifier.MismatchRenderPos> posList, @Nullable BlockPos lookPos, ProfilerFiller profiler) {
        profiler.push("batched_lines");
        RenderContext ctx = new RenderContext(() -> "litematica:schematic_mistaches/batched_lines", MaLiLibPipelines.DEBUG_LINES_MASA_SIMPLE_NO_DEPTH_NO_CULL, 0);
        BufferBuilder buffer = ctx.getBuilder();
        float lineWidth = 2.0f;
        SchematicVerifier.MismatchRenderPos lookedEntry = null;
        SchematicVerifier.MismatchRenderPos prevEntry = null;
        boolean connections = Configs.Visuals.RENDER_ERROR_MARKER_CONNECTIONS.getBooleanValue();
        for (SchematicVerifier.MismatchRenderPos mismatchRenderPos : posList) {
            Color4f color = mismatchRenderPos.type().getColor();
            if (!mismatchRenderPos.pos().equals((Object)lookPos)) {
                fi.dy.masa.malilib.render.RenderUtils.drawBlockBoundingBoxOutlinesBatchedLinesSimple((BlockPos)mismatchRenderPos.pos(), (Color4f)color, (double)0.002, (float)lineWidth, (BufferBuilder)buffer);
            } else {
                lookedEntry = mismatchRenderPos;
            }
            if (connections && prevEntry != null) {
                fi.dy.masa.malilib.render.RenderUtils.drawConnectingLineBatchedLines((BlockPos)prevEntry.pos(), (BlockPos)mismatchRenderPos.pos(), (boolean)false, (Color4f)color, (float)lineWidth, (BufferBuilder)buffer);
            }
            prevEntry = mismatchRenderPos;
        }
        if (lookedEntry != null) {
            if (connections && prevEntry != null) {
                fi.dy.masa.malilib.render.RenderUtils.drawConnectingLineBatchedLines((BlockPos)prevEntry.pos(), (BlockPos)lookedEntry.pos(), (boolean)false, (Color4f)lookedEntry.type().getColor(), (float)lineWidth, (BufferBuilder)buffer);
            }
            try {
                MeshData meshData2 = buffer.build();
                if (meshData2 != null) {
                    ctx.draw(meshData2, false, true);
                    meshData2.close();
                }
                ctx.reset();
            }
            catch (Exception meshData2) {
                // empty catch block
            }
            profiler.popPush("outlines");
            lineWidth = 6.0f;
            buffer = ctx.start(() -> "litematica:schematic_mistaches/outlines", MaLiLibPipelines.DEBUG_LINES_MASA_SIMPLE_NO_DEPTH_NO_CULL, 0);
            fi.dy.masa.malilib.render.RenderUtils.drawBlockBoundingBoxOutlinesBatchedLinesSimple((BlockPos)lookPos, (Color4f)lookedEntry.type().getColor(), (double)0.002, (float)lineWidth, (BufferBuilder)buffer);
        }
        try {
            MeshData meshData3 = buffer.build();
            if (meshData3 != null) {
                ctx.draw(meshData3, false, true);
                meshData3.close();
            }
            ctx.reset();
        }
        catch (Exception meshData3) {
            // empty catch block
        }
        profiler.popPush("sides");
        if (Configs.Visuals.RENDER_ERROR_MARKER_SIDES.getBooleanValue()) {
            buffer = ctx.start(() -> "litematica:schematic_mistaches/side_quads", MaLiLibPipelines.POSITION_COLOR_TRANSLUCENT_NO_DEPTH_NO_CULL, 0);
            float alpha = (float)Configs.InfoOverlays.VERIFIER_ERROR_HILIGHT_ALPHA.getDoubleValue();
            for (SchematicVerifier.MismatchRenderPos entry : posList) {
                Color4f color = entry.type().getColor();
                color = new Color4f(color.r, color.g, color.b, alpha);
                fi.dy.masa.malilib.render.RenderUtils.renderAreaSidesBatched((BlockPos)entry.pos(), (BlockPos)entry.pos(), (Color4f)color, (double)0.002, (BufferBuilder)buffer);
            }
            try {
                MeshData meshData = buffer.build();
                if (meshData != null) {
                    ctx.draw(meshData, false, false);
                    meshData.close();
                }
                ctx.close();
            }
            catch (Exception exception) {
                // empty catch block
            }
        }
        profiler.pop();
    }

    public void renderHoverInfo(GuiContext ctx, ProfilerFiller profiler) {
        profiler.push("render_hover_info");
        if (this.mc.level != null && this.mc.player != null) {
            boolean infoOverlayKeyActive = Hotkeys.RENDER_INFO_OVERLAY.getKeybind().isKeybindHeld();
            boolean verifierOverlayRendered = false;
            profiler.popPush("render_verifier_overlay");
            if (infoOverlayKeyActive && Configs.InfoOverlays.VERIFIER_OVERLAY_ENABLED.getBooleanValue()) {
                verifierOverlayRendered = this.renderVerifierOverlay(ctx);
            }
            boolean renderBlockInfoLines = Configs.InfoOverlays.BLOCK_INFO_LINES_ENABLED.getBooleanValue();
            boolean renderBlockInfoOverlay = !verifierOverlayRendered && infoOverlayKeyActive && Configs.InfoOverlays.BLOCK_INFO_OVERLAY_ENABLED.getBooleanValue();
            RayTraceUtils.RayTraceWrapper traceWrapper = null;
            profiler.popPush("generic_trace");
            if (renderBlockInfoLines || renderBlockInfoOverlay) {
                Entity entity = EntityUtils.getCameraEntity();
                boolean targetFluids = Configs.InfoOverlays.INFO_OVERLAYS_TARGET_FLUIDS.getBooleanValue();
                traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 10.0, true, targetFluids, false);
            }
            if (traceWrapper != null && (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.VANILLA_BLOCK || traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK)) {
                profiler.popPush("render_block_lines");
                if (renderBlockInfoLines) {
                    this.renderBlockInfoLines(ctx, traceWrapper);
                }
                profiler.popPush("render_block_overlay");
                if (renderBlockInfoOverlay) {
                    this.renderBlockInfoOverlay(ctx, traceWrapper);
                }
            }
        }
        profiler.pop();
    }

    private void renderBlockInfoLines(GuiContext ctx, RayTraceUtils.RayTraceWrapper traceWrapper) {
        long currentTime = System.currentTimeMillis();
        if (currentTime - this.infoUpdateTime >= 50L) {
            this.updateBlockInfoLines(traceWrapper);
            this.infoUpdateTime = currentTime;
        }
        int x = Configs.InfoOverlays.BLOCK_INFO_LINES_OFFSET_X.getIntegerValue();
        int y = Configs.InfoOverlays.BLOCK_INFO_LINES_OFFSET_Y.getIntegerValue();
        double fontScale = Configs.InfoOverlays.BLOCK_INFO_LINES_FONT_SCALE.getDoubleValue();
        int textColor = -1;
        int bgColor = -1605349296;
        HudAlignment alignment = (HudAlignment)Configs.InfoOverlays.BLOCK_INFO_LINES_ALIGNMENT.getOptionListValue();
        boolean useBackground = true;
        boolean useShadow = false;
        fi.dy.masa.malilib.render.RenderUtils.renderText((GuiContext)ctx, (int)x, (int)y, (double)fontScale, (int)textColor, (int)bgColor, (HudAlignment)alignment, (boolean)useBackground, (boolean)useShadow, this.blockInfoLines);
    }

    private boolean renderVerifierOverlay(GuiContext ctx) {
        SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
        if (placement != null && placement.hasVerifier()) {
            Entity entity = EntityUtils.getCameraEntity();
            SchematicVerifier verifier = placement.getSchematicVerifier();
            List<BlockPos> posList = verifier.getSelectedMismatchBlockPositionsForRender();
            BlockHitResult trace = RayTraceUtils.traceToPositions(posList, entity, 128.0);
            if (trace != null && trace.getType() == HitResult.Type.BLOCK) {
                SchematicVerifier.BlockMismatch mismatch;
                WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
                BlockPos pos = trace.getBlockPos();
                if (!DataManager.getInstance().hasIntegratedServer()) {
                    EntityDataManager.getInstance().requestBlockEntityWrapped((Level)this.mc.level, pos);
                }
                if ((mismatch = verifier.getMismatchForPosition(pos)) != null && worldSchematic != null) {
                    WidgetSchematicVerificationResult.BlockMismatchInfo info = new WidgetSchematicVerificationResult.BlockMismatchInfo(mismatch.stateExpected(), mismatch.stateFound());
                    BlockInfoAlignment align = (BlockInfoAlignment)Configs.InfoOverlays.BLOCK_INFO_OVERLAY_ALIGNMENT.getOptionListValue();
                    int offY = Configs.InfoOverlays.BLOCK_INFO_OVERLAY_OFFSET_Y.getIntegerValue();
                    int invHeight = RenderUtils.renderInventoryOverlays(ctx, align, offY, worldSchematic, (Level)ctx.mc().level, pos);
                    this.getOverlayPosition(align, info.getTotalWidth(), info.getTotalHeight(), offY, invHeight);
                    info.render(ctx, this.blockInfoX, this.blockInfoY);
                    return true;
                }
            }
        }
        return false;
    }

    private void renderBlockInfoOverlay(GuiContext ctx, RayTraceUtils.RayTraceWrapper traceWrapper) {
        BlockState air = Blocks.AIR.defaultBlockState();
        BlockState voidAir = Blocks.VOID_AIR.defaultBlockState();
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        Level worldClient = WorldUtils.getBestWorld((Minecraft)ctx.mc());
        BlockPos pos = traceWrapper.getBlockHitResult().getBlockPos();
        if (ctx.mc().level == null || worldClient == null || worldSchematic == null) {
            return;
        }
        BlockState stateClient = ctx.mc().level.getBlockState(pos);
        BlockState stateSchematic = worldSchematic.getBlockState(pos);
        boolean hasInvClient = InventoryUtils.getTargetInventory(worldClient, pos) != null;
        boolean hasInvSchematic = InventoryUtils.getTargetInventory(worldSchematic, pos) != null;
        int invHeight = 0;
        int offY = Configs.InfoOverlays.BLOCK_INFO_OVERLAY_OFFSET_Y.getIntegerValue();
        BlockInfoAlignment align = (BlockInfoAlignment)Configs.InfoOverlays.BLOCK_INFO_OVERLAY_ALIGNMENT.getOptionListValue();
        ItemUtils.setItemForBlock(worldSchematic, pos, stateSchematic);
        ItemUtils.setItemForBlock((Level)ctx.mc().level, pos, stateClient);
        if (hasInvClient && hasInvSchematic) {
            invHeight = RenderUtils.renderInventoryOverlays(ctx, align, offY, worldSchematic, worldClient, pos);
        } else if (hasInvClient) {
            invHeight = RenderUtils.renderInventoryOverlay(ctx, align, LeftRight.RIGHT, offY, worldClient, pos);
        } else if (hasInvSchematic) {
            invHeight = RenderUtils.renderInventoryOverlay(ctx, align, LeftRight.LEFT, offY, worldSchematic, pos);
        }
        if (stateSchematic != stateClient && stateClient != air && stateSchematic != air && stateSchematic != voidAir) {
            WidgetSchematicVerificationResult.BlockMismatchInfo info = new WidgetSchematicVerificationResult.BlockMismatchInfo(stateSchematic, stateClient);
            this.getOverlayPosition(align, info.getTotalWidth(), info.getTotalHeight(), offY, invHeight);
            info.toggleUseBackgroundMask(true);
            info.render(ctx, this.blockInfoX, this.blockInfoY);
        } else if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.VANILLA_BLOCK) {
            BlockInfo info = new BlockInfo(stateClient, "litematica.gui.label.block_info.state_client");
            this.getOverlayPosition(align, info.getTotalWidth(), info.getTotalHeight(), offY, invHeight);
            info.toggleUseBackgroundMask(true);
            info.render(ctx, this.blockInfoX, this.blockInfoY);
        } else if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockInfo info = new BlockInfo(stateSchematic, "litematica.gui.label.block_info.state_schematic");
            this.getOverlayPosition(align, info.getTotalWidth(), info.getTotalHeight(), offY, invHeight);
            info.toggleUseBackgroundMask(true);
            info.render(ctx, this.blockInfoX, this.blockInfoY);
        }
    }

    public static int calculateCompatYShift() {
        if (JadeCompat.hasJade()) {
            return JadeCompat.getJadeShift();
        }
        return 0;
    }

    protected void getOverlayPosition(BlockInfoAlignment align, int width, int height, int offY, int invHeight) {
        switch (align) {
            case CENTER: {
                this.blockInfoX = GuiUtils.getScaledWindowWidth() / 2 - width / 2;
                this.blockInfoY = GuiUtils.getScaledWindowHeight() / 2 + offY;
                break;
            }
            case TOP_CENTER: {
                this.blockInfoX = GuiUtils.getScaledWindowWidth() / 2 - width / 2;
                this.blockInfoY = invHeight + offY + (invHeight > 0 ? offY : 0);
                this.blockInfoY += invHeight > 0 ? 0 : OverlayRenderer.calculateCompatYShift();
            }
        }
    }

    private void updateBlockInfoLines(RayTraceUtils.RayTraceWrapper traceWrapper) {
        this.blockInfoLines.clear();
        BlockPos pos = traceWrapper.getBlockHitResult().getBlockPos();
        BlockState stateClient = this.mc.level.getBlockState(pos);
        BlockState voidAir = Blocks.VOID_AIR.defaultBlockState();
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        BlockState stateSchematic = worldSchematic.getBlockState(pos);
        String ul = GuiBase.TXT_UNDERLINE;
        if (stateSchematic != stateClient && !stateClient.isAir() && !stateSchematic.isAir() && stateSchematic != voidAir) {
            this.blockInfoLines.add(ul + "Schematic:");
            this.addBlockInfoLines(stateSchematic);
            this.blockInfoLines.add("");
            this.blockInfoLines.add(ul + "Client:");
            this.addBlockInfoLines(stateClient);
        } else if (traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            this.blockInfoLines.add(ul + "Schematic:");
            this.addBlockInfoLines(stateSchematic);
        }
    }

    private void addBlockInfoLines(BlockState state) {
        this.blockInfoLines.add(String.valueOf(BuiltInRegistries.BLOCK.getKey((Object)state.getBlock())));
        this.blockInfoLines.addAll(BlockUtils.getFormattedBlockStateProperties((BlockState)state));
    }

    public void renderSchematicRebuildTargetingOverlay(ProfilerFiller profiler) {
        profiler.push("rebuild_trace");
        RayTraceUtils.RayTraceWrapper traceWrapper = null;
        Color4f color = null;
        boolean direction = false;
        Entity entity = EntityUtils.getCameraEntity();
        if (Hotkeys.SCHEMATIC_EDIT_BREAK_ALL.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_BREAK_OVERLAY_COLOR.getColor();
        } else if (Hotkeys.SCHEMATIC_EDIT_BREAK_ALL_EXCEPT.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_BREAK_EXCEPT_OVERLAY_COLOR.getColor();
        } else if (Hotkeys.SCHEMATIC_EDIT_BREAK_DIRECTION.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_BREAK_OVERLAY_COLOR.getColor();
            direction = true;
        } else if (Hotkeys.SCHEMATIC_EDIT_REPLACE_ALL.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_REPLACE_OVERLAY_COLOR.getColor();
        } else if (Hotkeys.SCHEMATIC_EDIT_REPLACE_BLOCK.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_REPLACE_OVERLAY_COLOR.getColor();
        } else if (Hotkeys.SCHEMATIC_EDIT_REPLACE_DIRECTION.getKeybind().isKeybindHeld()) {
            traceWrapper = RayTraceUtils.getGenericTrace((Level)this.mc.level, entity, 20.0);
            color = Configs.Colors.REBUILD_REPLACE_OVERLAY_COLOR.getColor();
            direction = true;
        }
        profiler.popPush("render_target_overlay");
        if (traceWrapper != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockHitResult trace = traceWrapper.getBlockHitResult();
            BlockPos pos = trace.getBlockPos();
            if (direction) {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockTargetingOverlay((Entity)entity, (BlockPos)pos, (Direction)trace.getDirection(), (Vec3)trace.getLocation(), (Color4f)color);
            } else {
                fi.dy.masa.malilib.render.RenderUtils.renderBlockTargetingOverlaySimple((Entity)entity, (BlockPos)pos, (Direction)trace.getDirection(), (Color4f)color);
            }
        }
        profiler.pop();
    }

    public void renderPreviewFrame(GuiContext ctx, ProfilerFiller profiler) {
        profiler.push("render_preview_frame");
        int width = GuiUtils.getScaledWindowWidth();
        int height = GuiUtils.getScaledWindowHeight();
        int x = width >= height ? (width - height) / 2 : 0;
        int y = height >= width ? (height - width) / 2 : 0;
        int longerSide = Math.min(width, height);
        fi.dy.masa.malilib.render.RenderUtils.drawOutline((GuiContext)ctx, (int)x, (int)y, (int)longerSide, (int)longerSide, (int)2, (int)-1);
        profiler.pop();
    }

    public static enum BoxType {
        AREA_SELECTED,
        AREA_UNSELECTED,
        PLACEMENT_SELECTED,
        PLACEMENT_UNSELECTED;

    }
}

