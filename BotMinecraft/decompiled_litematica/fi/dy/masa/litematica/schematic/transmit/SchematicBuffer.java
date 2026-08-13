/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.schematic.transmit;

import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.util.FileType;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.OpenOption;
import java.nio.file.Path;
import java.nio.file.attribute.FileAttribute;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

public class SchematicBuffer {
    public static final int BUFFER_SIZE = 16384;
    private final FileType type;
    private final String fileName;
    private Slice[] buffer;
    private final int totalExpectedSlices;
    private final long totalExpectedSize;
    private final AtomicInteger receivedSlices = new AtomicInteger(0);

    public SchematicBuffer(int totalExpectedSlices, long totalExpectedSize) {
        this(totalExpectedSlices, totalExpectedSize, FileType.LITEMATICA_SCHEMATIC);
    }

    public SchematicBuffer(int totalExpectedSlices, long totalExpectedSize, FileType type) {
        this.type = type;
        this.fileName = UUID.randomUUID().toString();
        this.totalExpectedSlices = totalExpectedSlices;
        this.totalExpectedSize = totalExpectedSize;
        this.buffer = new Slice[totalExpectedSlices];
    }

    public FileType getType() {
        return this.type;
    }

    public String getFileName() {
        return this.fileName;
    }

    public String getFileNameWithExt() {
        return this.fileName + "." + FileType.getFileExt(this.type);
    }

    public void receiveSlice(int number, Slice slice) {
        if (number >= 0 && number < this.totalExpectedSlices && this.buffer[number] == null) {
            this.buffer[number] = slice;
            this.receivedSlices.incrementAndGet();
        }
    }

    public boolean isComplete() {
        return this.receivedSlices.get() == this.totalExpectedSlices;
    }

    public Path writeFile(Path dir) {
        Path file;
        if (!this.isComplete()) {
            Litematica.LOGGER.error("SchematicBuffer#writeFile(): Attempted to write incomplete buffer! Expected: {}, Received: {}", (Object)this.totalExpectedSlices, (Object)this.receivedSlices.get());
            return null;
        }
        if (!Files.isDirectory(dir, new LinkOption[0])) {
            try {
                Files.createDirectory(dir, new FileAttribute[0]);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("SchematicBuffer#writeFile(): Exception creating directory '{}'; {}", (Object)dir.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return null;
            }
        }
        if (Files.exists(file = dir.resolve(this.getFileName()), new LinkOption[0])) {
            try {
                Files.delete(file);
            }
            catch (IOException err) {
                Litematica.LOGGER.error("SchematicBuffer#writeFile(): Exception deleting file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
                return null;
            }
        }
        try (OutputStream os = Files.newOutputStream(file, new OpenOption[0]);){
            for (Slice entry : this.buffer) {
                os.write(entry.data(), 0, entry.size());
            }
        }
        catch (Exception err) {
            Litematica.LOGGER.error("SchematicBuffer#writeFile(): Exception saving file '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return null;
        }
        try {
            long actualSize = Files.size(file);
            if (actualSize != this.totalExpectedSize) {
                Litematica.LOGGER.error("SchematicBuffer#writeFile(): File size mismatch for '{}'! Expected: {} bytes, Actual: {} bytes. Deleting corrupted file.", (Object)file.getFileName(), (Object)this.totalExpectedSize, (Object)actualSize);
                Files.deleteIfExists(file);
                return null;
            }
        }
        catch (IOException err) {
            Litematica.LOGGER.error("SchematicBuffer#writeFile(): Exception verifying file size for '{}'; {}", (Object)file.toAbsolutePath().toString(), (Object)err.getLocalizedMessage());
            return null;
        }
        Litematica.debugLog("SchematicBuffer#writeFile(): Saved file '{}' successfully", file.toAbsolutePath().toString());
        this.buffer = null;
        return file;
    }

    public record Slice(byte[] data, int size) {
    }
}

