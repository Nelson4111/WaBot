/*
 * Decompiled with CFR 0.152.
 */
package fi.dy.masa.litematica.render.schematic;

import fi.dy.masa.litematica.render.IWorldSchematicRenderer;
import fi.dy.masa.litematica.render.schematic.ChunkRendererSchematicVbo;
import fi.dy.masa.litematica.world.WorldSchematic;

public interface IChunkRendererFactory {
    public ChunkRendererSchematicVbo create(WorldSchematic var1, IWorldSchematicRenderer var2);
}

