/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.BufferBuilder
 *  com.mojang.blaze3d.vertex.PoseStack
 *  com.mojang.blaze3d.vertex.PoseStack$Pose
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.LeftRight
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.InventoryOverlay
 *  fi.dy.masa.malilib.render.InventoryOverlay$InventoryProperties
 *  fi.dy.masa.malilib.render.InventoryOverlayContext
 *  fi.dy.masa.malilib.render.InventoryOverlayType
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  fi.dy.masa.malilib.util.data.DataBlockUtils
 *  fi.dy.masa.malilib.util.data.tag.CompoundData
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  java.lang.MatchException
 *  javax.annotation.Nonnull
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.renderer.block.BlockStateModelSet
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModel
 *  net.minecraft.client.renderer.block.dispatch.BlockStateModelPart
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Direction$Axis
 *  net.minecraft.core.Vec3i
 *  net.minecraft.resources.Identifier
 *  net.minecraft.util.RandomSource
 *  net.minecraft.world.Container
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.entity.CrafterBlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.levelgen.SingleThreadedRandomSource
 *  net.minecraft.world.phys.Vec3
 *  org.joml.Vector3fc
 */
package fi.dy.masa.litematica.render;

import com.mojang.blaze3d.vertex.BufferBuilder;
import com.mojang.blaze3d.vertex.PoseStack;
import fi.dy.masa.litematica.render.OverlayRenderer;
import fi.dy.masa.litematica.util.BlockInfoAlignment;
import fi.dy.masa.litematica.util.InventoryUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.InventoryOverlay;
import fi.dy.masa.malilib.render.InventoryOverlayContext;
import fi.dy.masa.malilib.render.InventoryOverlayType;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import fi.dy.masa.malilib.util.data.DataBlockUtils;
import fi.dy.masa.malilib.util.data.tag.CompoundData;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Nonnull;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.block.BlockStateModelSet;
import net.minecraft.client.renderer.block.dispatch.BlockStateModel;
import net.minecraft.client.renderer.block.dispatch.BlockStateModelPart;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.resources.Identifier;
import net.minecraft.util.RandomSource;
import net.minecraft.world.Container;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.CrafterBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.levelgen.SingleThreadedRandomSource;
import net.minecraft.world.phys.Vec3;
import org.joml.Vector3fc;

public class RenderUtils {
    private static final SingleThreadedRandomSource RAND = new SingleThreadedRandomSource(0L);

    public static int getMaxStringRenderLength(List<String> list) {
        int length = 0;
        for (String str : list) {
            length = Math.max(length, StringUtils.getStringWidth((String)str));
        }
        return length;
    }

    public static void drawDebugBlockModelOutlinesBatched(List<BlockStateModelPart> modelParts, BlockState state, BlockPos pos, Color4f color, double expand, float lineWidth, BufferBuilder buffer) {
        for (BlockStateModelPart part : modelParts) {
            RenderUtils.drawDebugBlockModelOutlinesBatched(part, state, pos, color, expand, lineWidth, buffer);
        }
    }

    public static void drawDebugBlockModelOutlinesBatched(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Color4f color, double expand, float lineWidth, BufferBuilder buffer) {
        for (Direction side : PositionUtils.ALL_DIRECTIONS) {
            RenderUtils.renderDebugModelQuadOutlines(modelPart, state, pos, side, color, expand, lineWidth, buffer);
        }
        RenderUtils.renderDebugModelQuadOutlines(modelPart, state, pos, null, color, expand, lineWidth, buffer);
    }

    public static void renderDebugModelQuadOutlines(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Direction side, Color4f color, double expand, float lineWidth, BufferBuilder buffer) {
        try {
            RenderUtils.renderDebugModelQuadOutlines(pos, buffer, color, lineWidth, modelPart.getQuads(side));
        }
        catch (Exception exception) {
            // empty catch block
        }
    }

    public static void renderDebugModelQuadOutlines(BlockPos pos, BufferBuilder buffer, Color4f color, float lineWidth, List<BakedQuad> quads) {
        for (BakedQuad quad : quads) {
            RenderUtils.renderDebugQuadOutlinesBatched(pos, buffer, color, lineWidth, quad);
        }
    }

    public static void renderDebugQuadOutlinesBatched(BlockPos pos, BufferBuilder buffer, Color4f color, float lineWidth, BakedQuad quad) {
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        float[] fx = new float[4];
        float[] fy = new float[4];
        float[] fz = new float[4];
        for (int index = 0; index < 4; ++index) {
            Vector3fc v3fc = quad.position(index);
            fx[index] = (float)x + v3fc.x();
            fy[index] = (float)y + v3fc.y();
            fz[index] = (float)z + v3fc.z();
        }
        buffer.addVertex(fx[0], fy[0], fz[0]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[1], fy[1], fz[1]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[1], fy[1], fz[1]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[2], fy[2], fz[2]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[2], fy[2], fz[2]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[3], fy[3], fz[3]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[3], fy[3], fz[3]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(fx[0], fy[0], fz[0]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
    }

    public static void drawBlockModelOutlinesBatched(List<BlockStateModelPart> modelParts, BlockState state, BlockPos pos, Color4f color, double expand, float lineWidth, BufferBuilder buffer, PoseStack matrices) {
        for (BlockStateModelPart part : modelParts) {
            RenderUtils.drawBlockModelOutlinesBatched(part, state, pos, color, expand, lineWidth, buffer, matrices);
        }
    }

    public static void drawBlockModelOutlinesBatched(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Color4f color, double expand, float lineWidth, BufferBuilder buffer, PoseStack matrices) {
        for (Direction side : PositionUtils.ALL_DIRECTIONS) {
            RenderUtils.renderModelQuadOutlines(modelPart, state, pos, side, color, expand, lineWidth, buffer, matrices);
        }
        RenderUtils.renderModelQuadOutlines(modelPart, state, pos, null, color, expand, lineWidth, buffer, matrices);
    }

    public static void renderModelQuadOutlines(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Direction side, Color4f color, double expand, float lineWidth, BufferBuilder buffer, PoseStack matrices) {
        try {
            RenderUtils.renderModelQuadOutlines(pos, buffer, color, lineWidth, modelPart.getQuads(side), matrices);
        }
        catch (Exception exception) {
            // empty catch block
        }
    }

    public static void renderModelQuadOutlines(BlockPos pos, BufferBuilder buffer, Color4f color, float lineWidth, List<BakedQuad> quads, PoseStack matrices) {
        for (BakedQuad quad : quads) {
            RenderUtils.renderQuadOutlinesBatched(pos, buffer, color, lineWidth, quad, matrices);
        }
    }

    public static void renderQuadOutlinesBatched(BlockPos pos, BufferBuilder buffer, Color4f color, float lineWidth, BakedQuad quad, PoseStack matrices) {
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        float[] fx = new float[4];
        float[] fy = new float[4];
        float[] fz = new float[4];
        for (int index = 0; index < 4; ++index) {
            Vector3fc v3fc = quad.position(index);
            fx[index] = (float)x + v3fc.x();
            fy[index] = (float)y + v3fc.y();
            fz[index] = (float)z + v3fc.z();
        }
        PoseStack.Pose e = matrices.last();
        buffer.addVertex(e, fx[0], fy[0], fz[0]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[1], fy[1], fz[1]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[1], fy[1], fz[1]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[2], fy[2], fz[2]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[2], fy[2], fz[2]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[3], fy[3], fz[3]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[3], fy[3], fz[3]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(e, fx[0], fy[0], fz[0]).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
    }

    public static boolean stateModelHasQuads(BlockState state) {
        BlockStateModelSet modelSet = Minecraft.getInstance().getModelManager().getBlockStateModelSet();
        return RenderUtils.modelHasQuads(modelSet.get(state));
    }

    public static boolean modelHasQuads(@Nonnull BlockStateModel model) {
        ArrayList<BlockStateModelPart> parts = new ArrayList<BlockStateModelPart>();
        model.collectParts((RandomSource)RAND, parts);
        return RenderUtils.hasQuads(parts);
    }

    public static boolean hasQuads(List<BlockStateModelPart> modelParts) {
        if (modelParts.isEmpty()) {
            return false;
        }
        int totalSize = 0;
        for (BlockStateModelPart part : modelParts) {
            for (Direction face : PositionUtils.ALL_DIRECTIONS) {
                totalSize += part.getQuads(face).size();
            }
            totalSize += part.getQuads(null).size();
        }
        return totalSize > 0;
    }

    public static void drawBlockModelQuadOverlayBatched(List<BlockStateModelPart> modelParts, BlockState state, BlockPos pos, Color4f color, double expand, BufferBuilder buffer) {
        for (BlockStateModelPart part : modelParts) {
            RenderUtils.drawBlockModelQuadOverlayBatched(part, state, pos, color, expand, buffer);
        }
    }

    public static void drawBlockModelQuadOverlayBatched(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Color4f color, double expand, BufferBuilder buffer) {
        for (Direction side : PositionUtils.ALL_DIRECTIONS) {
            RenderUtils.drawBlockModelQuadOverlayBatched(modelPart, state, pos, side, color, expand, buffer);
        }
        RenderUtils.drawBlockModelQuadOverlayBatched(modelPart, state, pos, null, color, expand, buffer);
    }

    public static void drawBlockModelQuadOverlayBatched(BlockStateModelPart modelPart, BlockState state, BlockPos pos, Direction side, Color4f color, double expand, BufferBuilder buffer) {
        RenderUtils.renderModelQuadOverlayBatched(pos, buffer, color, modelPart.getQuads(side));
    }

    private static void renderModelQuadOverlayBatched(BlockPos pos, BufferBuilder buffer, Color4f color, List<BakedQuad> quads) {
        for (BakedQuad quad : quads) {
            RenderUtils.renderModelQuadOverlayBatched(pos, buffer, color, quad);
        }
    }

    private static void renderModelQuadOverlayBatched(BlockPos pos, BufferBuilder buffer, Color4f color, BakedQuad quad) {
        int x = pos.getX();
        int y = pos.getY();
        int z = pos.getZ();
        for (int index = 0; index < 4; ++index) {
            Vector3fc v3fc = quad.position(index);
            float fx = (float)x + v3fc.x();
            float fy = (float)y + v3fc.y();
            float fz = (float)z + v3fc.z();
            buffer.addVertex(fx, fy, fz).setColor(color.r, color.g, color.b, color.a);
        }
    }

    public static void drawBlockBoxBatchedQuads(BlockPos pos, Color4f color, double expand, BufferBuilder buffer) {
        for (Direction side : PositionUtils.ALL_DIRECTIONS) {
            RenderUtils.drawBlockBoxSideBatchedQuads(pos, side, color, expand, buffer);
        }
    }

    public static void drawBlockBoxSideBatchedQuads(BlockPos pos, Direction side, Color4f color, double expand, BufferBuilder buffer) {
        float minX = (float)((double)pos.getX() - expand);
        float minY = (float)((double)pos.getY() - expand);
        float minZ = (float)((double)pos.getZ() - expand);
        float maxX = (float)((double)pos.getX() + expand + 1.0);
        float maxY = (float)((double)pos.getY() + expand + 1.0);
        float maxZ = (float)((double)pos.getZ() + expand + 1.0);
        switch (side) {
            case DOWN: {
                buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                break;
            }
            case UP: {
                buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                break;
            }
            case NORTH: {
                buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                break;
            }
            case SOUTH: {
                buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
                break;
            }
            case WEST: {
                buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                break;
            }
            case EAST: {
                buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a);
                buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a);
            }
        }
    }

    public static void drawBlockBoxEdgeBatchedLines(BlockPos pos, Direction.Axis axis, int cornerIndex, Color4f color, float lineWidth, BufferBuilder buffer) {
        Vec3i offset = fi.dy.masa.litematica.util.PositionUtils.getEdgeNeighborOffsets(axis, cornerIndex)[cornerIndex];
        double minX = pos.getX() + offset.getX();
        double minY = pos.getY() + offset.getY();
        double minZ = pos.getZ() + offset.getZ();
        double maxX = pos.getX() + offset.getX() + (axis == Direction.Axis.X ? 1 : 0);
        double maxY = pos.getY() + offset.getY() + (axis == Direction.Axis.Y ? 1 : 0);
        double maxZ = pos.getZ() + offset.getZ() + (axis == Direction.Axis.Z ? 1 : 0);
        buffer.addVertex((float)minX, (float)minY, (float)minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex((float)maxX, (float)maxY, (float)maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
    }

    public static void drawBlockBoxEdgeBatchedDebugLines(BlockPos pos, Direction.Axis axis, int cornerIndex, Color4f color, float lineWidth, BufferBuilder buffer) {
        Vec3i offset = fi.dy.masa.litematica.util.PositionUtils.getEdgeNeighborOffsets(axis, cornerIndex)[cornerIndex];
        double minX = pos.getX() + offset.getX();
        double minY = pos.getY() + offset.getY();
        double minZ = pos.getZ() + offset.getZ();
        double maxX = pos.getX() + offset.getX() + (axis == Direction.Axis.X ? 1 : 0);
        double maxY = pos.getY() + offset.getY() + (axis == Direction.Axis.Y ? 1 : 0);
        double maxZ = pos.getZ() + offset.getZ() + (axis == Direction.Axis.Z ? 1 : 0);
        buffer.addVertex((float)minX, (float)minY, (float)minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex((float)maxX, (float)maxY, (float)maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
    }

    public static int renderInventoryOverlays(GuiContext ctx, BlockInfoAlignment align, int offY, Level worldSchematic, Level worldClient, BlockPos pos) {
        int heightSch = RenderUtils.renderInventoryOverlay(ctx, align, LeftRight.LEFT, offY, worldSchematic, pos);
        int heightCli = RenderUtils.renderInventoryOverlay(ctx, align, LeftRight.RIGHT, offY, worldClient, pos);
        return Math.max(heightSch, heightCli);
    }

    public static int renderInventoryOverlay(GuiContext guiCtx, BlockInfoAlignment align, LeftRight side, int offY, Level world, BlockPos pos) {
        InventoryOverlayContext ctx = InventoryUtils.getTargetInventory(world, pos);
        if (ctx != null && ctx.inv() != null) {
            InventoryOverlay.InventoryProperties props = InventoryOverlay.getInventoryPropsTemp((InventoryOverlayType)ctx.type(), (int)ctx.inv().getContainerSize());
            if (ctx.type() == InventoryOverlayType.CRAFTER) {
                HashSet<Integer> disabledSlots = new HashSet();
                if (ctx.data() != null && !ctx.data().isEmpty()) {
                    disabledSlots = DataBlockUtils.getDisabledSlots((CompoundData)ctx.data());
                } else {
                    BlockEntity blockEntity = ctx.be();
                    if (blockEntity instanceof CrafterBlockEntity) {
                        CrafterBlockEntity cbe = (CrafterBlockEntity)blockEntity;
                        disabledSlots = BlockUtils.getDisabledSlots((CrafterBlockEntity)cbe);
                    }
                }
                return RenderUtils.renderInventoryOverlay(guiCtx, align, side, offY, ctx.inv(), ctx.type(), props, disabledSlots);
            }
            return RenderUtils.renderInventoryOverlay(guiCtx, align, side, offY, ctx.inv(), ctx.type(), props);
        }
        return 0;
    }

    public static int renderInventoryOverlay(GuiContext ctx, BlockInfoAlignment align, LeftRight side, int offY, Container inv, InventoryOverlayType type, InventoryOverlay.InventoryProperties props) {
        return RenderUtils.renderInventoryOverlay(ctx, align, side, offY, inv, type, props, Set.of());
    }

    public static int renderInventoryOverlay(GuiContext ctx, BlockInfoAlignment align, LeftRight side, int offY, Container inv, InventoryOverlayType type, InventoryOverlay.InventoryProperties props, Set<Integer> disabledSlots) {
        int xInv = 0;
        int yInv = 0;
        int compatShift = OverlayRenderer.calculateCompatYShift();
        switch (align) {
            default: {
                throw new MatchException(null, null);
            }
            case CENTER: {
                xInv = GuiUtils.getScaledWindowWidth() / 2 - props.width / 2;
                int n = GuiUtils.getScaledWindowHeight() / 2 - props.height - offY;
                break;
            }
            case TOP_CENTER: {
                xInv = GuiUtils.getScaledWindowWidth() / 2 - props.width / 2;
                int n = yInv = offY + compatShift;
            }
        }
        if (side == LeftRight.LEFT) {
            xInv -= props.width / 2 + 4;
        } else if (side == LeftRight.RIGHT) {
            xInv += props.width / 2 + 4;
        }
        InventoryOverlay.renderInventoryBackground((GuiContext)ctx, (InventoryOverlayType)type, (int)xInv, (int)yInv, (int)props.slotsPerRow, (int)props.totalSlots);
        InventoryOverlay.renderInventoryStacks((GuiContext)ctx, (InventoryOverlayType)type, (Container)inv, (int)(xInv + props.slotOffsetX), (int)(yInv + props.slotOffsetY), (int)props.slotsPerRow, (int)0, (int)inv.getContainerSize(), disabledSlots);
        return props.height + compatShift;
    }

    public static void renderBackgroundMask(GuiContext ctx, int startX, int startY, int width, int height) {
        fi.dy.masa.malilib.render.RenderUtils.drawTexturedRect((GuiContext)ctx, (Identifier)GuiBase.BG_TEXTURE, (int)startX, (int)startY, (int)0, (int)0, (int)width, (int)height);
    }

    public static void drawBlockBoundingBoxOutlinesBatchedDebugLines(BlockPos pos, Color4f color, double expand, float lineWidth, BufferBuilder buffer) {
        RenderUtils.drawBoxAllEdgesBatchedDebugLines(pos, Vec3.ZERO, color, expand, lineWidth, buffer);
    }

    public static void drawBoxAllEdgesBatchedDebugLines(BlockPos pos, Vec3 cameraPos, Color4f color, double expand, float lineWidth, BufferBuilder buffer) {
        float minX = (float)((double)pos.getX() - expand - cameraPos.x);
        float minY = (float)((double)pos.getY() - expand - cameraPos.y);
        float minZ = (float)((double)pos.getZ() - expand - cameraPos.z);
        float maxX = (float)((double)pos.getX() + expand - cameraPos.x + 1.0);
        float maxY = (float)((double)pos.getY() + expand - cameraPos.y + 1.0);
        float maxZ = (float)((double)pos.getZ() + expand - cameraPos.z + 1.0);
        RenderUtils.drawBoxAllEdgesBatchedDebugLines(minX, minY, minZ, maxX, maxY, maxZ, color, lineWidth, buffer);
    }

    public static void drawBoxAllEdgesBatchedDebugLines(float minX, float minY, float minZ, float maxX, float maxY, float maxZ, Color4f color, float lineWidth, BufferBuilder buffer) {
        buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, minY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, minZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, minY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(maxX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
        buffer.addVertex(minX, maxY, maxZ).setColor(color.r, color.g, color.b, color.a).setLineWidth(lineWidth);
    }
}

