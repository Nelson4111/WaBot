/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  io.netty.buffer.ByteBuf
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.HolderGetter
 *  net.minecraft.core.Registry
 *  net.minecraft.core.registries.Registries
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.nbt.NbtUtils
 *  net.minecraft.nbt.Tag
 *  net.minecraft.network.codec.ByteBufCodecs
 *  net.minecraft.network.codec.StreamCodec
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.schematic.container;

import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePalette;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePaletteResizer;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import io.netty.buffer.ByteBuf;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.HolderGetter;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.Registries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.NbtUtils;
import net.minecraft.nbt.Tag;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.world.level.block.state.BlockState;

public class LitematicaBlockStatePaletteLinear
implements ILitematicaBlockStatePalette {
    public static final Codec<LitematicaBlockStatePaletteLinear> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.INT.fieldOf("Bits").forGetter(get -> get.bits), (App)Codec.list((Codec)BlockState.CODEC).fieldOf("StatePalette").forGetter(LitematicaBlockStatePaletteLinear::fromMapping)).apply((Applicative)inst, LitematicaBlockStatePaletteLinear::new));
    public static final StreamCodec<ByteBuf, LitematicaBlockStatePaletteLinear> PACKET_CODEC = new StreamCodec<ByteBuf, LitematicaBlockStatePaletteLinear>(){

        public void encode(@Nonnull ByteBuf buf, LitematicaBlockStatePaletteLinear value) {
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.bits);
            ByteBufCodecs.TRUSTED_TAG.encode((Object)buf, (Object)value.writeToNBT());
        }

        @Nonnull
        public LitematicaBlockStatePaletteLinear decode(@Nonnull ByteBuf buf) {
            Integer bitsIn = (Integer)ByteBufCodecs.INT.decode((Object)buf);
            Tag nbt = (Tag)ByteBufCodecs.TRUSTED_TAG.decode((Object)buf);
            return new LitematicaBlockStatePaletteLinear((int)bitsIn, (ListTag)nbt);
        }
    };
    private final BlockState[] states;
    private ILitematicaBlockStatePaletteResizer resizeHandler;
    private final int bits;
    private int currentSize;

    public LitematicaBlockStatePaletteLinear(int bitsIn, ILitematicaBlockStatePaletteResizer resizeHandler) {
        this.states = new BlockState[1 << bitsIn];
        this.bits = bitsIn;
        this.resizeHandler = resizeHandler;
    }

    private LitematicaBlockStatePaletteLinear(int bitsIn, List<BlockState> list) {
        this.bits = bitsIn;
        this.resizeHandler = null;
        this.states = new BlockState[1 << bitsIn];
        this.setMapping(list);
    }

    private LitematicaBlockStatePaletteLinear(int bitsIn, ListTag list) {
        this.bits = bitsIn;
        this.resizeHandler = null;
        this.states = new BlockState[1 << bitsIn];
        this.readFromNBT(list);
    }

    public Codec<LitematicaBlockStatePaletteLinear> codec() {
        return CODEC;
    }

    @Override
    public void setResizer(ILitematicaBlockStatePaletteResizer resizer) {
        this.resizeHandler = resizer;
    }

    @Override
    public int idFor(BlockState state) {
        int size;
        for (int i = 0; i < this.currentSize; ++i) {
            if (this.states[i] != state) continue;
            return i;
        }
        if ((size = this.currentSize++) < this.states.length) {
            this.states[size] = state;
            return size;
        }
        return this.resizeHandler.onResize(this.bits + 1, state);
    }

    @Override
    @Nullable
    public BlockState getBlockState(int indexKey) {
        return indexKey >= 0 && indexKey < this.currentSize ? this.states[indexKey] : null;
    }

    @Override
    public int getPaletteSize() {
        return this.currentSize;
    }

    private void requestNewId(BlockState state) {
        int size;
        if ((size = this.currentSize++) < this.states.length) {
            this.states[size] = state;
        } else {
            int newId = this.resizeHandler.onResize(this.bits + 1, LitematicaBlockStateContainer.AIR_BLOCK_STATE);
            if (newId <= size) {
                this.states[size] = state;
                ++this.currentSize;
            }
        }
    }

    @Override
    public void readFromNBT(ListTag tagList) {
        Registry lookup = SchematicWorldHandler.INSTANCE.getRegistryManager().lookupOrThrow(Registries.BLOCK);
        int size = tagList.size();
        for (int i = 0; i < size; ++i) {
            CompoundTag tag = tagList.getCompoundOrEmpty(i);
            BlockState state = NbtUtils.readBlockState((HolderGetter)lookup, (CompoundTag)tag);
            if (i <= 0 && state == LitematicaBlockStateContainer.AIR_BLOCK_STATE) continue;
            this.requestNewId(state);
        }
    }

    @Override
    public ListTag writeToNBT() {
        ListTag tagList = new ListTag();
        for (int id = 0; id < this.currentSize; ++id) {
            BlockState state = this.states[id];
            if (state == null) {
                state = LitematicaBlockStateContainer.AIR_BLOCK_STATE;
            }
            CompoundTag tag = NbtUtils.writeBlockState((BlockState)state);
            tagList.add((Object)tag);
        }
        return tagList;
    }

    @Override
    public boolean setMapping(List<BlockState> list) {
        int size = list.size();
        if (size <= this.states.length) {
            for (int id = 0; id < size; ++id) {
                this.states[id] = list.get(id);
            }
            this.currentSize = size;
            return true;
        }
        return false;
    }

    @Override
    public List<BlockState> fromMapping() {
        ArrayList<BlockState> list = new ArrayList<BlockState>();
        for (int id = 0; id < this.currentSize; ++id) {
            BlockState state = this.states[id];
            if (state == null) {
                state = LitematicaBlockStateContainer.AIR_BLOCK_STATE;
            }
            list.add(state);
        }
        return list;
    }
}

