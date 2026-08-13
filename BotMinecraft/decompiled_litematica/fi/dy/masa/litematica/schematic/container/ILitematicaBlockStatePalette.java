/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.serialization.Codec
 *  javax.annotation.Nullable
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.world.level.block.state.BlockState
 *  org.jetbrains.annotations.ApiStatus$Experimental
 */
package fi.dy.masa.litematica.schematic.container;

import com.mojang.serialization.Codec;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePaletteResizer;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.nbt.ListTag;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.ApiStatus;

public interface ILitematicaBlockStatePalette {
    @ApiStatus.Experimental
    public Codec<? extends ILitematicaBlockStatePalette> codec();

    public void setResizer(ILitematicaBlockStatePaletteResizer var1);

    public int idFor(BlockState var1);

    @Nullable
    public BlockState getBlockState(int var1);

    public int getPaletteSize();

    public void readFromNBT(ListTag var1);

    public ListTag writeToNBT();

    public boolean setMapping(List<BlockState> var1);

    public List<BlockState> fromMapping();
}

