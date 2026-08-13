/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.buffers.GpuBuffer
 *  com.mojang.blaze3d.systems.CommandEncoder
 *  com.mojang.blaze3d.systems.GpuDevice
 *  com.mojang.blaze3d.systems.RenderSystem
 *  com.mojang.blaze3d.vertex.ByteBufferBuilder$Result
 *  com.mojang.blaze3d.vertex.MeshData
 *  com.mojang.blaze3d.vertex.VertexSorting
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.Camera
 *  net.minecraft.client.renderer.chunk.ChunkSectionLayer
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.Vec3
 *  org.apache.logging.log4j.Logger
 */
package fi.dy.masa.litematica.render.schematic;

import com.mojang.blaze3d.buffers.GpuBuffer;
import com.mojang.blaze3d.systems.CommandEncoder;
import com.mojang.blaze3d.systems.GpuDevice;
import com.mojang.blaze3d.systems.RenderSystem;
import com.mojang.blaze3d.vertex.ByteBufferBuilder;
import com.mojang.blaze3d.vertex.MeshData;
import com.mojang.blaze3d.vertex.VertexSorting;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.schematic.ChunkRenderGpuBuffers;
import fi.dy.masa.litematica.render.schematic.GpuBufferCache;
import fi.dy.masa.litematica.render.schematic.OverlayRenderType;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.function.Supplier;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.Camera;
import net.minecraft.client.renderer.chunk.ChunkSectionLayer;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import org.apache.logging.log4j.Logger;

public class ChunkRenderGpuUploader {
    private static final Logger LOGGER = Litematica.LOGGER;
    protected volatile WorldSchematic world;
    protected final IWorldSchematicRenderer worldRenderer;
    protected final BlockPos.MutableBlockPos position;
    protected final BlockPos.MutableBlockPos chunkRelativePos;
    protected ChunkPos chunkPosition;
    private AABB boundingBox;
    private final GpuBufferCache gpuBufferCache;

    protected ChunkRenderGpuUploader(WorldSchematic world, IWorldSchematicRenderer worldRenderer) {
        this.world = world;
        this.worldRenderer = worldRenderer;
        this.position = new BlockPos.MutableBlockPos();
        this.chunkRelativePos = new BlockPos.MutableBlockPos();
        this.gpuBufferCache = new GpuBufferCache();
    }

    protected boolean isEmpty() {
        return this.gpuBufferCache.isEmpty();
    }

    protected boolean hasBuffers(ChunkSectionLayer layer) {
        return this.gpuBufferCache.hasBuffers(layer);
    }

    protected boolean hasBuffers(OverlayRenderType type) {
        return this.gpuBufferCache.hasBuffers(type);
    }

    @Nullable
    protected ChunkRenderGpuBuffers buffersOrNull(ChunkSectionLayer layer) {
        return this.gpuBufferCache.getBuffersOrNull(layer);
    }

    @Nullable
    protected ChunkRenderGpuBuffers buffersOrNull(OverlayRenderType type) {
        return this.gpuBufferCache.getBuffersOrNull(type);
    }

    protected GpuBufferCache gpuBufferCache() {
        return this.gpuBufferCache;
    }

    public BlockPos origin() {
        return this.position.immutable();
    }

    protected ChunkPos chunkPos() {
        if (this.chunkPosition == null) {
            this.chunkPosition = ChunkPos.containing((BlockPos)this.position.immutable());
        }
        return this.chunkPosition;
    }

    public AABB boundingBox() {
        if (this.boundingBox == null) {
            int x = this.position.getX();
            int y = this.position.getY();
            int z = this.position.getZ();
            this.boundingBox = new AABB((double)x, (double)y, (double)z, (double)(x + 16), (double)(y + this.world.getHeight()), (double)(z + 16));
        }
        return this.boundingBox;
    }

    protected void setPosition(int x, int y, int z) {
        if (x != this.position.getX() || y != this.position.getY() || z != this.position.getZ()) {
            this.clear();
            this.position.set(x, y, z);
            this.chunkPosition = ChunkPos.containing((BlockPos)this.position.immutable());
            this.boundingBox = new AABB((double)x, (double)y, (double)z, (double)(x + 16), (double)(y + this.world.getHeight()), (double)(z + 16));
        }
    }

    protected VertexSorting createVertexSorter(float x, float y, float z) {
        return VertexSorting.byDistance((float)x, (float)y, (float)z);
    }

    protected VertexSorting createVertexSorter(Vec3 pos) {
        return VertexSorting.byDistance((float)((float)pos.x()), (float)((float)pos.y()), (float)((float)pos.z()));
    }

    protected VertexSorting createVertexSorter(Vec3 pos, BlockPos origin) {
        return VertexSorting.byDistance((float)((float)(pos.x - (double)origin.getX())), (float)((float)(pos.y - (double)origin.getY())), (float)((float)(pos.z - (double)origin.getZ())));
    }

    protected VertexSorting createVertexSorter(Camera camera) {
        Vec3 vec3d = camera.position();
        return this.createVertexSorter(vec3d, this.origin());
    }

    protected void uploadBuffersByLayer(ChunkSectionLayer layer, @Nonnull MeshData meshData, boolean useResorting) {
        ChunkRenderGpuBuffers gpuBuffers = this.buffersOrNull(layer);
        GpuDevice device = RenderSystem.getDevice();
        if (gpuBuffers != null) {
            if (gpuBuffers.vertexBuffer != null) {
                gpuBuffers.vertexBuffer.close();
            }
            if (gpuBuffers.indexBuffer != null) {
                gpuBuffers.indexBuffer.close();
                gpuBuffers.indexBuffer = null;
            }
            CommandEncoder encoder = device.createCommandEncoder();
            if (gpuBuffers.vertexBuffer.size() < (long)meshData.vertexBuffer().remaining()) {
                gpuBuffers.vertexBuffer.close();
                gpuBuffers.setVertexBuffer(device.createBuffer(() -> "VertexBuffer: " + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 40, meshData.vertexBuffer()));
            } else if (!gpuBuffers.vertexBuffer.isClosed()) {
                encoder.writeToBuffer(gpuBuffers.vertexBuffer.slice(), meshData.vertexBuffer());
            }
            if (meshData.indexBuffer() != null && useResorting) {
                if (gpuBuffers.indexBuffer != null && gpuBuffers.indexBuffer.size() >= (long)meshData.indexBuffer().remaining()) {
                    if (!gpuBuffers.indexBuffer.isClosed()) {
                        encoder.writeToBuffer(gpuBuffers.indexBuffer.slice(), meshData.indexBuffer());
                    }
                } else {
                    if (gpuBuffers.indexBuffer != null) {
                        gpuBuffers.indexBuffer.close();
                    }
                    gpuBuffers.setIndexBuffer(device.createBuffer(() -> "SortedBuffer: " + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, meshData.indexBuffer()));
                }
            } else if (gpuBuffers.indexBuffer != null) {
                gpuBuffers.indexBuffer.close();
                gpuBuffers.setIndexBuffer(null);
            }
            gpuBuffers.setIndexCount(meshData.drawState().indexCount());
            gpuBuffers.setIndexType(meshData.drawState().indexType());
            this.gpuBufferCache.saveBuffers(layer, gpuBuffers);
        } else {
            Supplier<String> name = () -> ((ChunkSectionLayer)layer).label();
            GpuBuffer vertexBuffer = device.createBuffer(() -> "VertexBuffer: " + (String)name.get() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 40, meshData.vertexBuffer());
            GpuBuffer indexBuffer = meshData.indexBuffer() != null && useResorting ? device.createBuffer(() -> "IndexBuffer: " + (String)name.get() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, meshData.indexBuffer()) : null;
            this.gpuBufferCache.saveBuffers(layer, new ChunkRenderGpuBuffers(name, vertexBuffer, indexBuffer, meshData.drawState().indexCount(), meshData.drawState().indexType()));
        }
        meshData.close();
    }

    protected void uploadBuffersByType(OverlayRenderType type, @Nonnull MeshData meshData, boolean useResorting) {
        ChunkRenderGpuBuffers gpuBuffers = this.buffersOrNull(type);
        GpuDevice device = RenderSystem.getDevice();
        if (gpuBuffers != null) {
            if (gpuBuffers.vertexBuffer != null) {
                gpuBuffers.vertexBuffer.close();
            }
            if (gpuBuffers.indexBuffer != null) {
                gpuBuffers.indexBuffer.close();
                gpuBuffers.indexBuffer = null;
            }
            CommandEncoder encoder = device.createCommandEncoder();
            if (gpuBuffers.vertexBuffer.size() < (long)meshData.vertexBuffer().remaining()) {
                gpuBuffers.vertexBuffer.close();
                gpuBuffers.setVertexBuffer(device.createBuffer(() -> "VertexBuffer: Overlay/" + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 40, meshData.vertexBuffer()));
            } else if (!gpuBuffers.vertexBuffer.isClosed()) {
                encoder.writeToBuffer(gpuBuffers.vertexBuffer.slice(), meshData.vertexBuffer());
            }
            if (meshData.indexBuffer() != null && useResorting) {
                if (gpuBuffers.indexBuffer != null && gpuBuffers.indexBuffer.size() >= (long)meshData.indexBuffer().remaining()) {
                    if (!gpuBuffers.indexBuffer.isClosed()) {
                        encoder.writeToBuffer(gpuBuffers.indexBuffer.slice(), meshData.indexBuffer());
                    }
                } else {
                    if (gpuBuffers.indexBuffer != null) {
                        gpuBuffers.indexBuffer.close();
                    }
                    gpuBuffers.setIndexBuffer(RenderSystem.getDevice().createBuffer(() -> "SortedBuffer: Overlay/" + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, meshData.indexBuffer()));
                }
            } else if (gpuBuffers.indexBuffer != null) {
                gpuBuffers.indexBuffer.close();
                gpuBuffers.setIndexBuffer(null);
            }
            gpuBuffers.setIndexCount(meshData.drawState().indexCount());
            gpuBuffers.setIndexType(meshData.drawState().indexType());
            this.gpuBufferCache.saveBuffers(type, gpuBuffers);
        } else {
            Supplier<String> name = type::name;
            GpuBuffer vertexBuffer = device.createBuffer(() -> "VertexBuffer: Overlay/" + (String)name.get() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 40, meshData.vertexBuffer());
            GpuBuffer indexBuffer = meshData.indexBuffer() != null && useResorting ? RenderSystem.getDevice().createBuffer(() -> "IndexBuffer: " + (String)name.get() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, meshData.indexBuffer()) : null;
            this.gpuBufferCache.saveBuffers(type, new ChunkRenderGpuBuffers(name, vertexBuffer, indexBuffer, meshData.drawState().indexCount(), meshData.drawState().indexType()));
        }
        meshData.close();
    }

    protected void uploadIndexByBlockLayer(ChunkSectionLayer layer, @Nonnull ByteBufferBuilder.Result buffer) {
        if (this.hasBuffers(layer)) {
            ChunkRenderGpuBuffers gpuBuffers = this.buffersOrNull(layer);
            GpuDevice device = RenderSystem.getDevice();
            assert (gpuBuffers != null);
            if (gpuBuffers.indexBuffer == null) {
                gpuBuffers.setIndexBuffer(device.createBuffer(() -> "IndexBuffer: " + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, buffer.byteBuffer()));
            } else if (!gpuBuffers.indexBuffer.isClosed()) {
                device.createCommandEncoder().writeToBuffer(gpuBuffers.indexBuffer.slice(), buffer.byteBuffer());
            }
        }
        buffer.close();
    }

    protected void uploadIndexByType(OverlayRenderType type, @Nonnull ByteBufferBuilder.Result buffer) {
        if (this.hasBuffers(type)) {
            ChunkRenderGpuBuffers gpuBuffers = this.buffersOrNull(type);
            GpuDevice device = RenderSystem.getDevice();
            assert (gpuBuffers != null);
            if (gpuBuffers.indexBuffer == null) {
                gpuBuffers.setIndexBuffer(device.createBuffer(() -> "IndexBuffer: Overlay/" + gpuBuffers.getName() + " VBO Section: [" + this.chunkRelativePos.toShortString() + "]", 72, buffer.byteBuffer()));
            } else if (!gpuBuffers.indexBuffer.isClosed()) {
                device.createCommandEncoder().writeToBuffer(gpuBuffers.indexBuffer.slice(), buffer.byteBuffer());
            }
        }
        buffer.close();
    }

    protected void clear() {
        this.gpuBufferCache.clearAll();
    }
}

