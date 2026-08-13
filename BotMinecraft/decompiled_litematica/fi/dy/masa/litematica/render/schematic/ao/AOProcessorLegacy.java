/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.QuadInstance
 *  java.lang.MatchException
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.util.ARGB
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.CardinalLighting
 *  net.minecraft.world.level.block.state.BlockState
 *  org.joml.Vector3fc
 */
package fi.dy.masa.litematica.render.schematic.ao;

import com.mojang.blaze3d.vertex.QuadInstance;
import fi.dy.masa.litematica.render.schematic.ao.AONeighborInfoLegacy;
import fi.dy.masa.litematica.render.schematic.ao.AOProcessor;
import fi.dy.masa.litematica.render.schematic.ao.AOSizeLegacy;
import fi.dy.masa.litematica.render.schematic.ao.AOVertexMap;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.util.ARGB;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.CardinalLighting;
import net.minecraft.world.level.block.state.BlockState;
import org.joml.Vector3fc;

public class AOProcessorLegacy
extends AOProcessor {
    public final float[] shape = new float[AOSizeLegacy.values().length];

    @Override
    public void prepareSmooth(BlockAndTintGetter world, BlockState state, BlockPos center, BakedQuad quad, QuadInstance instance) {
        this.prepareShape(world, state, center, quad, true);
        Direction face = quad.direction();
        BlockPos basePos = this.cubic ? center.relative(face) : center;
        AONeighborInfoLegacy info = AONeighborInfoLegacy.getNeighbourInfo(face);
        AOVertexMap remap = AOVertexMap.getVertexTranslations(face);
        int l1 = 0xF000F0;
        int k1 = 0xF000F0;
        int j1 = 0xF000F0;
        int i3 = 0xF000F0;
        int i1 = 0xF000F0;
        int l = 0xF000F0;
        int k = 0xF000F0;
        int j = 0xF000F0;
        int i = 0xF000F0;
        float b1 = 1.0f;
        float b2 = 1.0f;
        float b3 = 1.0f;
        float b4 = 1.0f;
        if (this.hasNeighbors && info.doNonCubicWeight) {
            float f13 = this.shape[info.vert0Weights[0].shape] * this.shape[info.vert0Weights[1].shape];
            float f14 = this.shape[info.vert0Weights[2].shape] * this.shape[info.vert0Weights[3].shape];
            float f15 = this.shape[info.vert0Weights[4].shape] * this.shape[info.vert0Weights[5].shape];
            float f16 = this.shape[info.vert0Weights[6].shape] * this.shape[info.vert0Weights[7].shape];
            float f17 = this.shape[info.vert1Weights[0].shape] * this.shape[info.vert1Weights[1].shape];
            float f18 = this.shape[info.vert1Weights[2].shape] * this.shape[info.vert1Weights[3].shape];
            float f19 = this.shape[info.vert1Weights[4].shape] * this.shape[info.vert1Weights[5].shape];
            float f20 = this.shape[info.vert1Weights[6].shape] * this.shape[info.vert1Weights[7].shape];
            float f21 = this.shape[info.vert2Weights[0].shape] * this.shape[info.vert2Weights[1].shape];
            float f22 = this.shape[info.vert2Weights[2].shape] * this.shape[info.vert2Weights[3].shape];
            float f23 = this.shape[info.vert2Weights[4].shape] * this.shape[info.vert2Weights[5].shape];
            float f24 = this.shape[info.vert2Weights[6].shape] * this.shape[info.vert2Weights[7].shape];
            float f25 = this.shape[info.vert3Weights[0].shape] * this.shape[info.vert3Weights[1].shape];
            float f26 = this.shape[info.vert3Weights[2].shape] * this.shape[info.vert3Weights[3].shape];
            float f27 = this.shape[info.vert3Weights[4].shape] * this.shape[info.vert3Weights[5].shape];
            float f28 = this.shape[info.vert3Weights[6].shape] * this.shape[info.vert3Weights[7].shape];
            instance.setColor(remap.vert0, ARGB.gray((float)Math.clamp((float)(b1 * f13 + b2 * f14 + b3 * f15 + b4 * f16), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert1, ARGB.gray((float)Math.clamp((float)(b1 * f17 + b2 * f18 + b3 * f19 + b4 * f20), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert2, ARGB.gray((float)Math.clamp((float)(b1 * f21 + b2 * f22 + b3 * f23 + b4 * f24), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert3, ARGB.gray((float)Math.clamp((float)(b1 * f25 + b2 * f26 + b3 * f27 + b4 * f28), (float)0.0f, (float)1.0f)));
            int i2 = this.getAoBrightness(l, i, j1, i3);
            int j2 = this.getAoBrightness(k, i, i1, i3);
            int k2 = this.getAoBrightness(k, j, k1, i3);
            int l2 = this.getAoBrightness(l, j, l1, i3);
            instance.setLightCoords(remap.vert0, this.getVertexBrightness(i2, j2, k2, l2, f13, f14, f15, f16));
            instance.setLightCoords(remap.vert1, this.getVertexBrightness(i2, j2, k2, l2, f17, f18, f19, f20));
            instance.setLightCoords(remap.vert2, this.getVertexBrightness(i2, j2, k2, l2, f21, f22, f23, f24));
            instance.setLightCoords(remap.vert3, this.getVertexBrightness(i2, j2, k2, l2, f25, f26, f27, f28));
        } else {
            instance.setLightCoords(remap.vert0, this.getAoBrightness(l, i, j1, i3));
            instance.setLightCoords(remap.vert1, this.getAoBrightness(k, i, i1, i3));
            instance.setLightCoords(remap.vert2, this.getAoBrightness(k, j, k1, i3));
            instance.setLightCoords(remap.vert3, this.getAoBrightness(l, j, l1, i3));
            instance.setColor(remap.vert0, ARGB.gray((float)b1));
            instance.setColor(remap.vert1, ARGB.gray((float)b2));
            instance.setColor(remap.vert2, ARGB.gray((float)b3));
            instance.setColor(remap.vert3, ARGB.gray((float)b4));
        }
        CardinalLighting lighting = world.cardinalLighting();
        instance.scaleColor(quad.materialInfo().shade() ? lighting.byFace(face) : lighting.up());
    }

    private int getAoBrightness(int br1, int br2, int br3, int br4) {
        if (br1 == 0) {
            br1 = br4;
        }
        if (br2 == 0) {
            br2 = br4;
        }
        if (br3 == 0) {
            br3 = br4;
        }
        return br1 + br2 + br3 + br4 >> 2 & 0xFF00FF;
    }

    private int getVertexBrightness(int p_178203_1_, int p_178203_2_, int p_178203_3_, int p_178203_4_, float p_178203_5_, float p_178203_6_, float p_178203_7_, float p_178203_8_) {
        int i = (int)((float)(p_178203_1_ >> 16 & 0xFF) * p_178203_5_ + (float)(p_178203_2_ >> 16 & 0xFF) * p_178203_6_ + (float)(p_178203_3_ >> 16 & 0xFF) * p_178203_7_ + (float)(p_178203_4_ >> 16 & 0xFF) * p_178203_8_) & 0xFF;
        int j = (int)((float)(p_178203_1_ & 0xFF) * p_178203_5_ + (float)(p_178203_2_ & 0xFF) * p_178203_6_ + (float)(p_178203_3_ & 0xFF) * p_178203_7_ + (float)(p_178203_4_ & 0xFF) * p_178203_8_) & 0xFF;
        return i << 16 | j;
    }

    @Override
    public void prepareFlat(BlockAndTintGetter world, BlockState state, BlockPos pos, int light, BakedQuad quad, QuadInstance instance) {
        if (light == -1) {
            this.prepareShape(world, state, pos, quad, false);
            BlockPos lightPos = this.cubic ? this.scratchPos.setWithOffset((Vec3i)pos, quad.direction()) : pos;
            instance.setLightCoords(this.getLight(world, state, lightPos));
        } else {
            instance.setLightCoords(light);
        }
        CardinalLighting lighting = world.cardinalLighting();
        float directionalBrightness = quad.materialInfo().shade() ? lighting.byFace(quad.direction()) : lighting.up();
        instance.setColor(ARGB.gray((float)directionalBrightness));
    }

    @Override
    public void prepareShape(BlockAndTintGetter world, BlockState state, BlockPos pos, BakedQuad quad, boolean useAO) {
        float minX = 32.0f;
        float minY = 32.0f;
        float minZ = 32.0f;
        float maxX = -32.0f;
        float maxY = -32.0f;
        float maxZ = -32.0f;
        for (int i = 0; i < 4; ++i) {
            Vector3fc position = quad.position(i);
            float x = position.x();
            float y = position.y();
            float z = position.z();
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }
        if (useAO) {
            this.shape[Direction.WEST.get3DDataValue()] = minX;
            this.shape[Direction.EAST.get3DDataValue()] = maxX;
            this.shape[Direction.DOWN.get3DDataValue()] = minY;
            this.shape[Direction.UP.get3DDataValue()] = maxY;
            this.shape[Direction.NORTH.get3DDataValue()] = minZ;
            this.shape[Direction.SOUTH.get3DDataValue()] = maxZ;
            this.shape[Direction.WEST.get3DDataValue() + 6] = 1.0f - minX;
            this.shape[Direction.EAST.get3DDataValue() + 6] = 1.0f - maxX;
            this.shape[Direction.DOWN.get3DDataValue() + 6] = 1.0f - minY;
            this.shape[Direction.UP.get3DDataValue() + 6] = 1.0f - maxY;
            this.shape[Direction.NORTH.get3DDataValue() + 6] = 1.0f - minZ;
            this.shape[Direction.SOUTH.get3DDataValue() + 6] = 1.0f - maxZ;
        }
        float min = 1.0E-4f;
        float max = 0.9999f;
        this.hasNeighbors = switch (quad.direction()) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN, Direction.UP -> {
                if (minX >= min || minZ >= min || maxX <= max || maxZ <= max) {
                    yield true;
                }
                yield false;
            }
            case Direction.NORTH, Direction.SOUTH -> {
                if (minX >= min || minY >= min || maxX <= max || maxY <= max) {
                    yield true;
                }
                yield false;
            }
            case Direction.WEST, Direction.EAST -> minY >= min || minZ >= min || maxY <= max || maxZ <= max;
        };
        this.cubic = switch (quad.direction()) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN -> {
                if (minY == maxY && (minY < min || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.UP -> {
                if (minY == maxY && (maxY > max || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.NORTH -> {
                if (minZ == maxZ && (minZ < min || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.SOUTH -> {
                if (minZ == maxZ && (maxZ > max || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.WEST -> {
                if (minX == maxX && (minX < min || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.EAST -> minX == maxX && (maxX > max || state.isCollisionShapeFullBlock((BlockGetter)world, pos));
        };
    }
}

