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
 *  net.minecraft.util.CrudeIncrementalIntIdentityHashBiMap
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
import net.minecraft.util.CrudeIncrementalIntIdentityHashBiMap;
import net.minecraft.world.level.block.state.BlockState;

public class LitematicaBlockStatePaletteHashMap
implements ILitematicaBlockStatePalette {
    public static final Codec<LitematicaBlockStatePaletteHashMap> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.INT.fieldOf("Bits").forGetter(get -> get.bits), (App)Codec.list((Codec)BlockState.CODEC).fieldOf("StatePalette").forGetter(LitematicaBlockStatePaletteHashMap::fromMapping)).apply((Applicative)inst, LitematicaBlockStatePaletteHashMap::new));
    public static final StreamCodec<ByteBuf, LitematicaBlockStatePaletteHashMap> PACKET_CODEC = new StreamCodec<ByteBuf, LitematicaBlockStatePaletteHashMap>(){

        public void encode(@Nonnull ByteBuf buf, LitematicaBlockStatePaletteHashMap value) {
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.bits);
            ByteBufCodecs.TRUSTED_TAG.encode((Object)buf, (Object)value.writeToNBT());
        }

        @Nonnull
        public LitematicaBlockStatePaletteHashMap decode(@Nonnull ByteBuf buf) {
            Integer bitsIn = (Integer)ByteBufCodecs.INT.decode((Object)buf);
            Tag nbt = (Tag)ByteBufCodecs.TRUSTED_TAG.decode((Object)buf);
            return new LitematicaBlockStatePaletteHashMap((int)bitsIn, (ListTag)nbt);
        }
    };
    private final CrudeIncrementalIntIdentityHashBiMap<BlockState> statePaletteMap;
    private ILitematicaBlockStatePaletteResizer paletteResizer;
    private final int bits;

    public LitematicaBlockStatePaletteHashMap(int bitsIn, ILitematicaBlockStatePaletteResizer paletteResizer) {
        this.bits = bitsIn;
        this.paletteResizer = paletteResizer;
        this.statePaletteMap = CrudeIncrementalIntIdentityHashBiMap.create((int)(1 << bitsIn));
    }

    private LitematicaBlockStatePaletteHashMap(int bitsIn, List<BlockState> list) {
        this.bits = bitsIn;
        this.paletteResizer = null;
        this.statePaletteMap = CrudeIncrementalIntIdentityHashBiMap.create((int)(1 << bitsIn));
        this.setMapping(list);
    }

    private LitematicaBlockStatePaletteHashMap(int bitsIn, ListTag list) {
        this.bits = bitsIn;
        this.paletteResizer = null;
        this.statePaletteMap = CrudeIncrementalIntIdentityHashBiMap.create((int)(1 << bitsIn));
        this.readFromNBT(list);
    }

    public Codec<LitematicaBlockStatePaletteHashMap> codec() {
        return CODEC;
    }

    @Override
    public void setResizer(ILitematicaBlockStatePaletteResizer resizer) {
        this.paletteResizer = resizer;
    }

    @Override
    public int idFor(BlockState state) {
        int i = this.statePaletteMap.getId((Object)state);
        if (i == -1 && (i = this.statePaletteMap.add((Object)state)) >= 1 << this.bits) {
            i = this.paletteResizer.onResize(this.bits + 1, state);
        }
        return i;
    }

    @Override
    @Nullable
    public BlockState getBlockState(int indexKey) {
        return (BlockState)this.statePaletteMap.byId(indexKey);
    }

    @Override
    public int getPaletteSize() {
        return this.statePaletteMap.size();
    }

    private void requestNewId(BlockState state) {
        int newId;
        int origId = this.statePaletteMap.add((Object)state);
        if (origId >= 1 << this.bits && (newId = this.paletteResizer.onResize(this.bits + 1, LitematicaBlockStateContainer.AIR_BLOCK_STATE)) <= origId) {
            this.statePaletteMap.add((Object)state);
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
        for (int id = 0; id < this.statePaletteMap.size(); ++id) {
            BlockState state = (BlockState)this.statePaletteMap.byId(id);
            if (state == null) {
                state = LitematicaBlockStateContainer.AIR_BLOCK_STATE;
            }
            CompoundTag tag = NbtUtils.writeBlockState((BlockState)state);
            tagList.add((Object)tag);
        }
        return tagList;
    }

    @Override
    public List<BlockState> fromMapping() {
        ArrayList<BlockState> list = new ArrayList<BlockState>();
        for (int i = 0; i < this.statePaletteMap.size(); ++i) {
            BlockState state = (BlockState)this.statePaletteMap.byId(i);
            if (state == null) {
                state = LitematicaBlockStateContainer.AIR_BLOCK_STATE;
            }
            list.add(state);
        }
        return list;
    }

    @Override
    public boolean setMapping(List<BlockState> list) {
        this.statePaletteMap.clear();
        for (BlockState blockState : list) {
            this.statePaletteMap.add((Object)blockState);
        }
        return true;
    }
}

