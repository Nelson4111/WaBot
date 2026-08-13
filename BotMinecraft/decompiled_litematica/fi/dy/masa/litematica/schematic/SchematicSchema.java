/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  org.jspecify.annotations.NonNull
 */
package fi.dy.masa.litematica.schematic;

import org.jspecify.annotations.NonNull;

public record SchematicSchema(int litematicVersion, int minecraftDataVersion) {
    public @NonNull String toString() {
        return "V" + this.litematicVersion() + " / DataVersion " + this.minecraftDataVersion();
    }
}

