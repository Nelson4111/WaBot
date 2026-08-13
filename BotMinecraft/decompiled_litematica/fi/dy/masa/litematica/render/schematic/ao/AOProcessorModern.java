/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.vertex.QuadInstance
 *  java.lang.MatchException
 *  net.minecraft.client.renderer.block.BlockAndTintGetter
 *  net.minecraft.client.resources.model.geometry.BakedQuad
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.util.ARGB
 *  net.minecraft.util.LightCoordsUtil
 *  net.minecraft.world.level.BlockGetter
 *  net.minecraft.world.level.CardinalLighting
 *  net.minecraft.world.level.block.state.BlockState
 *  org.joml.Vector3fc
 */
package fi.dy.masa.litematica.render.schematic.ao;

import com.mojang.blaze3d.vertex.QuadInstance;
import fi.dy.masa.litematica.render.schematic.ao.AONeighborInfoModern;
import fi.dy.masa.litematica.render.schematic.ao.AOProcessor;
import fi.dy.masa.litematica.render.schematic.ao.AOSizeModern;
import fi.dy.masa.litematica.render.schematic.ao.AOVertexMap;
import net.minecraft.client.renderer.block.BlockAndTintGetter;
import net.minecraft.client.resources.model.geometry.BakedQuad;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.util.ARGB;
import net.minecraft.util.LightCoordsUtil;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.CardinalLighting;
import net.minecraft.world.level.block.state.BlockState;
import org.joml.Vector3fc;

public class AOProcessorModern
extends AOProcessor {
    public final float[] shape = new float[AOSizeModern.values().length];

    @Override
    public void prepareSmooth(BlockAndTintGetter world, BlockState state, BlockPos center, BakedQuad quad, QuadInstance instance) {
        int lightCorner13;
        float shadeCorner13;
        int lightCorner12;
        float shadeCorner12;
        int lightCorner03;
        float shadeCorner03;
        int lightCorner02;
        float shadeCorner02;
        boolean translucent3;
        this.prepareShape(world, state, center, quad, true);
        Direction face = quad.direction();
        BlockPos basePos = this.cubic ? center.relative(face) : center;
        AONeighborInfoModern info = AONeighborInfoModern.getNeighbourInfo(face);
        BlockPos.MutableBlockPos pos = this.scratchPos;
        pos.setWithOffset((Vec3i)basePos, info.corners[0]);
        BlockState state0 = world.getBlockState((BlockPos)pos);
        int light0 = this.lightmap.brightnessCache.getLight(state0, world, (BlockPos)pos);
        float shade0 = this.lightmap.brightnessCache.getShade(state0, world, (BlockPos)pos);
        pos.setWithOffset((Vec3i)basePos, info.corners[1]);
        BlockState state1 = world.getBlockState((BlockPos)pos);
        int light1 = this.lightmap.brightnessCache.getLight(state1, world, (BlockPos)pos);
        float shade1 = this.lightmap.brightnessCache.getShade(state1, world, (BlockPos)pos);
        pos.setWithOffset((Vec3i)basePos, info.corners[2]);
        BlockState state2 = world.getBlockState((BlockPos)pos);
        int light2 = this.lightmap.brightnessCache.getLight(state2, world, (BlockPos)pos);
        float shade2 = this.lightmap.brightnessCache.getShade(state2, world, (BlockPos)pos);
        pos.setWithOffset((Vec3i)basePos, info.corners[3]);
        BlockState state3 = world.getBlockState((BlockPos)pos);
        int light3 = this.lightmap.brightnessCache.getLight(state3, world, (BlockPos)pos);
        float shade3 = this.lightmap.brightnessCache.getShade(state3, world, (BlockPos)pos);
        BlockState corner0 = world.getBlockState((BlockPos)pos.setWithOffset((Vec3i)basePos, info.corners[0]).move(face));
        boolean translucent0 = !corner0.isViewBlocking((BlockGetter)world, (BlockPos)pos) || corner0.getLightDampening() == 0;
        BlockState corner1 = world.getBlockState((BlockPos)pos.setWithOffset((Vec3i)basePos, info.corners[1]).move(face));
        boolean translucent1 = !corner1.isViewBlocking((BlockGetter)world, (BlockPos)pos) || corner1.getLightDampening() == 0;
        BlockState corner2 = world.getBlockState((BlockPos)pos.setWithOffset((Vec3i)basePos, info.corners[2]).move(face));
        boolean translucent2 = !corner2.isViewBlocking((BlockGetter)world, (BlockPos)pos) || corner2.getLightDampening() == 0;
        BlockState corner3 = world.getBlockState((BlockPos)pos.setWithOffset((Vec3i)basePos, info.corners[3]).move(face));
        boolean bl = translucent3 = !corner3.isViewBlocking((BlockGetter)world, (BlockPos)pos) || corner3.getLightDampening() == 0;
        if (!translucent2 && !translucent0) {
            shadeCorner02 = shade0;
            lightCorner02 = light0;
        } else {
            pos.setWithOffset((Vec3i)basePos, info.corners[0]).move(info.corners[2]);
            BlockState state02 = world.getBlockState((BlockPos)pos);
            shadeCorner02 = this.lightmap.brightnessCache.getShade(state02, world, (BlockPos)pos);
            lightCorner02 = this.lightmap.brightnessCache.getLight(state02, world, (BlockPos)pos);
        }
        if (!translucent3 && !translucent0) {
            shadeCorner03 = shade0;
            lightCorner03 = light0;
        } else {
            pos.setWithOffset((Vec3i)basePos, info.corners[0]).move(info.corners[3]);
            BlockState state03 = world.getBlockState((BlockPos)pos);
            shadeCorner03 = this.lightmap.brightnessCache.getShade(state03, world, (BlockPos)pos);
            lightCorner03 = this.lightmap.brightnessCache.getLight(state03, world, (BlockPos)pos);
        }
        if (!translucent2 && !translucent1) {
            shadeCorner12 = shade0;
            lightCorner12 = light0;
        } else {
            pos.setWithOffset((Vec3i)basePos, info.corners[1]).move(info.corners[2]);
            BlockState state12 = world.getBlockState((BlockPos)pos);
            shadeCorner12 = this.lightmap.brightnessCache.getShade(state12, world, (BlockPos)pos);
            lightCorner12 = this.lightmap.brightnessCache.getLight(state12, world, (BlockPos)pos);
        }
        if (!translucent3 && !translucent1) {
            shadeCorner13 = shade0;
            lightCorner13 = light0;
        } else {
            pos.setWithOffset((Vec3i)basePos, info.corners[1]).move(info.corners[3]);
            BlockState state13 = world.getBlockState((BlockPos)pos);
            shadeCorner13 = this.lightmap.brightnessCache.getShade(state13, world, (BlockPos)pos);
            lightCorner13 = this.lightmap.brightnessCache.getLight(state13, world, (BlockPos)pos);
        }
        int lightCenter = this.lightmap.brightnessCache.getLight(state, world, center);
        pos.setWithOffset((Vec3i)center, face);
        BlockState nextState = world.getBlockState((BlockPos)pos);
        if (this.cubic || !nextState.isSolidRender()) {
            lightCenter = this.lightmap.brightnessCache.getLight(nextState, world, (BlockPos)pos);
        }
        float shadeCenter = this.cubic ? this.lightmap.brightnessCache.getShade(world.getBlockState(basePos), world, basePos) : this.lightmap.brightnessCache.getShade(world.getBlockState(center), world, center);
        AOVertexMap remap = AOVertexMap.getVertexTranslations(face);
        if (this.hasNeighbors && info.doNonCubicWeight) {
            float tempShade1 = (shade3 + shade0 + shadeCorner03 + shadeCenter) * 0.25f;
            float tempShade2 = (shade2 + shade0 + shadeCorner02 + shadeCenter) * 0.25f;
            float tempShade3 = (shade2 + shade1 + shadeCorner12 + shadeCenter) * 0.25f;
            float tempShade4 = (shade3 + shade1 + shadeCorner13 + shadeCenter) * 0.25f;
            float vert0weight01 = this.shape[info.vert0Weights[0].index] * this.shape[info.vert0Weights[1].index];
            float vert0weight23 = this.shape[info.vert0Weights[2].index] * this.shape[info.vert0Weights[3].index];
            float vert0weight45 = this.shape[info.vert0Weights[4].index] * this.shape[info.vert0Weights[5].index];
            float vert0weight67 = this.shape[info.vert0Weights[6].index] * this.shape[info.vert0Weights[7].index];
            float vert1weight01 = this.shape[info.vert1Weights[0].index] * this.shape[info.vert1Weights[1].index];
            float vert1weight23 = this.shape[info.vert1Weights[2].index] * this.shape[info.vert1Weights[3].index];
            float vert1weight45 = this.shape[info.vert1Weights[4].index] * this.shape[info.vert1Weights[5].index];
            float vert1weight67 = this.shape[info.vert1Weights[6].index] * this.shape[info.vert1Weights[7].index];
            float vert2weight01 = this.shape[info.vert2Weights[0].index] * this.shape[info.vert2Weights[1].index];
            float vert2weight23 = this.shape[info.vert2Weights[2].index] * this.shape[info.vert2Weights[3].index];
            float vert2weight45 = this.shape[info.vert2Weights[4].index] * this.shape[info.vert2Weights[5].index];
            float vert2weight67 = this.shape[info.vert2Weights[6].index] * this.shape[info.vert2Weights[7].index];
            float vert3weight01 = this.shape[info.vert3Weights[0].index] * this.shape[info.vert3Weights[1].index];
            float vert3weight23 = this.shape[info.vert3Weights[2].index] * this.shape[info.vert3Weights[3].index];
            float vert3weight45 = this.shape[info.vert3Weights[4].index] * this.shape[info.vert3Weights[5].index];
            float vert3weight67 = this.shape[info.vert3Weights[6].index] * this.shape[info.vert3Weights[7].index];
            instance.setColor(remap.vert0, ARGB.gray((float)Math.clamp((float)(tempShade1 * vert0weight01 + tempShade2 * vert0weight23 + tempShade3 * vert0weight45 + tempShade4 * vert0weight67), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert1, ARGB.gray((float)Math.clamp((float)(tempShade1 * vert1weight01 + tempShade2 * vert1weight23 + tempShade3 * vert1weight45 + tempShade4 * vert1weight67), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert2, ARGB.gray((float)Math.clamp((float)(tempShade1 * vert2weight01 + tempShade2 * vert2weight23 + tempShade3 * vert2weight45 + tempShade4 * vert2weight67), (float)0.0f, (float)1.0f)));
            instance.setColor(remap.vert3, ARGB.gray((float)Math.clamp((float)(tempShade1 * vert3weight01 + tempShade2 * vert3weight23 + tempShade3 * vert3weight45 + tempShade4 * vert3weight67), (float)0.0f, (float)1.0f)));
            int _tc1 = LightCoordsUtil.smoothBlend((int)light3, (int)light0, (int)lightCorner03, (int)lightCenter);
            int _tc2 = LightCoordsUtil.smoothBlend((int)light2, (int)light0, (int)lightCorner02, (int)lightCenter);
            int _tc3 = LightCoordsUtil.smoothBlend((int)light2, (int)light1, (int)lightCorner12, (int)lightCenter);
            int _tc4 = LightCoordsUtil.smoothBlend((int)light3, (int)light1, (int)lightCorner13, (int)lightCenter);
            instance.setLightCoords(remap.vert0, LightCoordsUtil.smoothWeightedBlend((int)_tc1, (int)_tc2, (int)_tc3, (int)_tc4, (float)vert0weight01, (float)vert0weight23, (float)vert0weight45, (float)vert0weight67));
            instance.setLightCoords(remap.vert1, LightCoordsUtil.smoothWeightedBlend((int)_tc1, (int)_tc2, (int)_tc3, (int)_tc4, (float)vert1weight01, (float)vert1weight23, (float)vert1weight45, (float)vert1weight67));
            instance.setLightCoords(remap.vert2, LightCoordsUtil.smoothWeightedBlend((int)_tc1, (int)_tc2, (int)_tc3, (int)_tc4, (float)vert2weight01, (float)vert2weight23, (float)vert2weight45, (float)vert2weight67));
            instance.setLightCoords(remap.vert3, LightCoordsUtil.smoothWeightedBlend((int)_tc1, (int)_tc2, (int)_tc3, (int)_tc4, (float)vert3weight01, (float)vert3weight23, (float)vert3weight45, (float)vert3weight67));
        } else {
            float lightLevel1 = (shade3 + shade0 + shadeCorner03 + shadeCenter) * 0.25f;
            float lightLevel2 = (shade2 + shade0 + shadeCorner02 + shadeCenter) * 0.25f;
            float lightLevel3 = (shade2 + shade1 + shadeCorner12 + shadeCenter) * 0.25f;
            float lightLevel4 = (shade3 + shade1 + shadeCorner13 + shadeCenter) * 0.25f;
            instance.setLightCoords(remap.vert0, LightCoordsUtil.smoothBlend((int)light3, (int)light0, (int)lightCorner03, (int)lightCenter));
            instance.setLightCoords(remap.vert1, LightCoordsUtil.smoothBlend((int)light2, (int)light0, (int)lightCorner02, (int)lightCenter));
            instance.setLightCoords(remap.vert2, LightCoordsUtil.smoothBlend((int)light2, (int)light1, (int)lightCorner12, (int)lightCenter));
            instance.setLightCoords(remap.vert3, LightCoordsUtil.smoothBlend((int)light3, (int)light1, (int)lightCorner13, (int)lightCenter));
            instance.setColor(remap.vert0, ARGB.gray((float)lightLevel1));
            instance.setColor(remap.vert1, ARGB.gray((float)lightLevel2));
            instance.setColor(remap.vert2, ARGB.gray((float)lightLevel3));
            instance.setColor(remap.vert3, ARGB.gray((float)lightLevel4));
        }
        CardinalLighting lighting = world.cardinalLighting();
        instance.scaleColor(quad.materialInfo().shade() ? lighting.byFace(face) : lighting.up());
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
            this.shape[AOSizeModern.WEST.index] = minX;
            this.shape[AOSizeModern.EAST.index] = maxX;
            this.shape[AOSizeModern.DOWN.index] = minY;
            this.shape[AOSizeModern.UP.index] = maxY;
            this.shape[AOSizeModern.NORTH.index] = minZ;
            this.shape[AOSizeModern.SOUTH.index] = maxZ;
            this.shape[AOSizeModern.FLIP_WEST.index] = 1.0f - minX;
            this.shape[AOSizeModern.FLIP_EAST.index] = 1.0f - maxX;
            this.shape[AOSizeModern.FLIP_DOWN.index] = 1.0f - minY;
            this.shape[AOSizeModern.FLIP_UP.index] = 1.0f - maxY;
            this.shape[AOSizeModern.FLIP_NORTH.index] = 1.0f - minZ;
            this.shape[AOSizeModern.FLIP_SOUTH.index] = 1.0f - maxZ;
        }
        float minEpsilon = 1.0E-4f;
        float maxEpsilon = 0.9999f;
        this.hasNeighbors = switch (quad.direction()) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN, Direction.UP -> {
                if (minX >= minEpsilon || minZ >= minEpsilon || maxX <= maxEpsilon || maxZ <= maxEpsilon) {
                    yield true;
                }
                yield false;
            }
            case Direction.NORTH, Direction.SOUTH -> {
                if (minX >= minEpsilon || minY >= minEpsilon || maxX <= maxEpsilon || maxY <= maxEpsilon) {
                    yield true;
                }
                yield false;
            }
            case Direction.WEST, Direction.EAST -> minY >= minEpsilon || minZ >= minEpsilon || maxY <= maxEpsilon || maxZ <= maxEpsilon;
        };
        this.cubic = switch (quad.direction()) {
            default -> throw new MatchException(null, null);
            case Direction.DOWN -> {
                if (minY == maxY && (minY < minEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.UP -> {
                if (minY == maxY && (maxY > maxEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.NORTH -> {
                if (minZ == maxZ && (minZ < minEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.SOUTH -> {
                if (minZ == maxZ && (maxZ > maxEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.WEST -> {
                if (minX == maxX && (minX < minEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos))) {
                    yield true;
                }
                yield false;
            }
            case Direction.EAST -> minX == maxX && (maxX > maxEpsilon || state.isCollisionShapeFullBlock((BlockGetter)world, pos));
        };
    }
}

