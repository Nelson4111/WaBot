/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  java.lang.MatchException
 *  javax.annotation.Nonnull
 *  net.minecraft.util.StringRepresentable
 *  net.minecraft.util.StringRepresentable$EnumCodec
 */
package fi.dy.masa.litematica.util;

import com.google.common.collect.ImmutableList;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import javax.annotation.Nonnull;
import net.minecraft.util.StringRepresentable;

public enum FileType implements StringRepresentable
{
    INVALID,
    UNKNOWN,
    JSON,
    TEXT,
    LITEMATICA_SCHEMATIC,
    SCHEMATICA_SCHEMATIC,
    SPONGE_SCHEMATIC,
    VANILLA_STRUCTURE;

    public static final StringRepresentable.EnumCodec<FileType> CODEC;
    public static final ImmutableList<FileType> VALUES;

    public static FileType fromName(String fileName) {
        if (fileName.endsWith(".litematic")) {
            return LITEMATICA_SCHEMATIC;
        }
        if (fileName.endsWith(".schematic")) {
            return SCHEMATICA_SCHEMATIC;
        }
        if (fileName.endsWith(".nbt")) {
            return VANILLA_STRUCTURE;
        }
        if (fileName.endsWith(".schem")) {
            return SPONGE_SCHEMATIC;
        }
        if (fileName.endsWith(".json")) {
            return JSON;
        }
        if (fileName.endsWith(".txt")) {
            return TEXT;
        }
        return UNKNOWN;
    }

    @Deprecated
    public static FileType fromFile(File file) {
        if (file.isFile() && file.canRead()) {
            return FileType.fromName(file.getName());
        }
        return INVALID;
    }

    public static FileType fromFile(Path file) {
        if (Files.exists(file, new LinkOption[0]) && Files.isReadable(file)) {
            return FileType.fromName(file.getFileName().toString());
        }
        return INVALID;
    }

    public static String getFileExt(FileType type) {
        return switch (type.ordinal()) {
            default -> throw new MatchException(null, null);
            case 4 -> ".litematic";
            case 5 -> ".schematic";
            case 6 -> ".schem";
            case 7 -> ".nbt";
            case 2 -> ".json";
            case 3 -> ".txt";
            case 0 -> ".invalid";
            case 1 -> ".unknown";
        };
    }

    public static String getString(FileType type) {
        return switch (type.ordinal()) {
            default -> throw new MatchException(null, null);
            case 4 -> "litematic";
            case 5 -> "schematic";
            case 6 -> "sponge";
            case 7 -> "vanilla_nbt";
            case 2 -> "JSON";
            case 3 -> "TEXT";
            case 0 -> "invalid";
            case 1 -> "unknown";
        };
    }

    @Nonnull
    public String getSerializedName() {
        return FileType.getString(this);
    }

    static {
        CODEC = StringRepresentable.fromEnum(FileType::values);
        VALUES = ImmutableList.copyOf((Object[])FileType.values());
    }
}

