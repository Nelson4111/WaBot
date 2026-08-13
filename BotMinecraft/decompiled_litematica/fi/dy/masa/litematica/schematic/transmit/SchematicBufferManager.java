/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.annotation.Nullable
 *  net.minecraft.nbt.CompoundTag
 */
package fi.dy.masa.litematica.schematic.transmit;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.transmit.SchematicBuffer;
import fi.dy.masa.litematica.util.FileType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import net.minecraft.nbt.CompoundTag;

public class SchematicBufferManager {
    private final ConcurrentHashMap<Long, SchematicBuffer> fileBuffers = new ConcurrentHashMap(16, 0.9f, 1);
    private final ConcurrentHashMap<Long, CompoundTag> optionalNbt = new ConcurrentHashMap(16, 0.9f, 1);

    public void createBuffer(int totalExpectedSlices, long totalExpectedSize, long sessionKey) {
        this.createBuffer(totalExpectedSlices, totalExpectedSize, FileType.LITEMATICA_SCHEMATIC, sessionKey, null);
    }

    public void createBuffer(int totalExpectedSlices, long totalExpectedSize, long sessionKey, @Nullable CompoundTag optional) {
        this.createBuffer(totalExpectedSlices, totalExpectedSize, FileType.LITEMATICA_SCHEMATIC, sessionKey, optional);
    }

    public void createBuffer(int totalExpectedSlices, long totalExpectedSize, FileType type, long sessionKey, @Nullable CompoundTag optional) {
        if (this.fileBuffers.containsKey(sessionKey) || this.optionalNbt.containsKey(sessionKey)) {
            Litematica.LOGGER.warn("createBuffer: Cannot create a new buffer for an existing session key!");
            return;
        }
        SchematicBuffer newBuf = new SchematicBuffer(totalExpectedSlices, totalExpectedSize, type);
        this.fileBuffers.put(sessionKey, newBuf);
        if (optional != null && !optional.isEmpty()) {
            this.optionalNbt.put(sessionKey, optional.copy());
        }
    }

    @Nullable
    private SchematicBuffer getBuffer(long sessionKey) {
        if (this.fileBuffers.containsKey(sessionKey)) {
            return this.fileBuffers.get(sessionKey);
        }
        return null;
    }

    public CompoundTag getOptionalNbt(long sessionKey) {
        if (this.optionalNbt.containsKey(sessionKey)) {
            return this.optionalNbt.get(sessionKey);
        }
        return new CompoundTag();
    }

    public void receiveSlice(long sessionKey, int slice, byte[] dataIn, int size) {
        if (this.fileBuffers.containsKey(sessionKey)) {
            this.fileBuffers.get(sessionKey).receiveSlice(slice, new SchematicBuffer.Slice(dataIn, size));
        } else {
            Litematica.LOGGER.error("receiveSlice: Error; cannot receive a slice for a non-existing session");
        }
    }

    public void cancelBuffer(long sessionKey) {
        if (this.fileBuffers.containsKey(sessionKey)) {
            try {
                this.fileBuffers.remove(sessionKey);
            }
            catch (Exception exception) {
                // empty catch block
            }
        }
        this.optionalNbt.remove(sessionKey);
    }

    @Nullable
    public LitematicaSchematic finishBuffer(long sessionKey, @Nullable Path dir) {
        if (this.fileBuffers.containsKey(sessionKey)) {
            Path file;
            SchematicBuffer buffer = this.fileBuffers.get(sessionKey);
            if (dir == null) {
                dir = DataManager.getSchematicTransmitDirectory();
            }
            if ((file = buffer.writeFile(dir)) == null) {
                Litematica.LOGGER.error("finishBuffer: Failed writing Schematic Buffer to file: '{}'", (Object)buffer.getFileNameWithExt());
                return null;
            }
            LitematicaSchematic schematic = LitematicaSchematic.createFromFile(dir, buffer.getFileName(), buffer.getType());
            this.cancelBuffer(sessionKey);
            if (schematic == null) {
                try {
                    Files.delete(file);
                }
                catch (Exception exception) {
                    // empty catch block
                }
            }
            return schematic;
        }
        return null;
    }
}

