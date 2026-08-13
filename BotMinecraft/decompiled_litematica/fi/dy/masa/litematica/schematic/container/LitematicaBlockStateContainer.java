/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.datafixers.kinds.App
 *  com.mojang.datafixers.kinds.Applicative
 *  com.mojang.datafixers.util.Either
 *  com.mojang.serialization.Codec
 *  com.mojang.serialization.codecs.PrimitiveCodec
 *  com.mojang.serialization.codecs.RecordCodecBuilder
 *  io.netty.buffer.ByteBuf
 *  io.netty.buffer.Unpooled
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.ListTag
 *  net.minecraft.network.FriendlyByteBuf
 *  net.minecraft.network.codec.ByteBufCodecs
 *  net.minecraft.network.codec.StreamCodec
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.schematic.container;

import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.datafixers.util.Either;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePalette;
import fi.dy.masa.litematica.schematic.container.ILitematicaBlockStatePaletteResizer;
import fi.dy.masa.litematica.schematic.container.LitematicaBitArray;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStatePaletteHashMap;
import fi.dy.masa.litematica.schematic.container.LitematicaBlockStatePaletteLinear;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import java.util.Arrays;
import java.util.stream.LongStream;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.ListTag;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;

public class LitematicaBlockStateContainer
implements ILitematicaBlockStatePaletteResizer {
    private static final Codec<ILitematicaBlockStatePalette> PALETTE_CODEC = Codec.either(LitematicaBlockStatePaletteHashMap.CODEC, LitematicaBlockStatePaletteLinear.CODEC).xmap(either -> (ILitematicaBlockStatePalette)either.map(type -> type, type -> type), type -> {
        Either either;
        if (type instanceof LitematicaBlockStatePaletteHashMap) {
            LitematicaBlockStatePaletteHashMap hashMap = (LitematicaBlockStatePaletteHashMap)type;
            either = Either.left((Object)hashMap);
        } else if (type instanceof LitematicaBlockStatePaletteLinear) {
            LitematicaBlockStatePaletteLinear linear = (LitematicaBlockStatePaletteLinear)type;
            either = Either.right((Object)linear);
        } else {
            either = null;
        }
        return either;
    });
    public static final Codec<LitematicaBlockStateContainer> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.INT.fieldOf("Bits").forGetter(get -> get.bits), (App)LitematicaBitArray.CODEC.fieldOf("Storage").forGetter(get -> get.storage), (App)PALETTE_CODEC.fieldOf("Palette").forGetter(get -> get.palette), (App)PrimitiveCodec.INT.fieldOf("SizeX").forGetter(get -> get.sizeX), (App)PrimitiveCodec.INT.fieldOf("SizeY").forGetter(get -> get.sizeY), (App)PrimitiveCodec.INT.fieldOf("SizeZ").forGetter(get -> get.sizeZ), (App)PrimitiveCodec.INT.fieldOf("SizeLayer").forGetter(get -> get.sizeLayer), (App)Vec3i.CODEC.fieldOf("Size").forGetter(get -> get.size), (App)PrimitiveCodec.LONG.fieldOf("TotalVolume").forGetter(get -> get.totalVolume), (App)PrimitiveCodec.LONG_STREAM.optionalFieldOf("BlockCounts", (Object)LongStream.empty()).forGetter(get -> Arrays.stream(get.blockCounts))).apply((Applicative)inst, LitematicaBlockStateContainer::new));
    public static final StreamCodec<ByteBuf, LitematicaBlockStateContainer> PACKET_CODEC = new StreamCodec<ByteBuf, LitematicaBlockStateContainer>(){

        public void encode(@Nonnull ByteBuf buf, LitematicaBlockStateContainer value) {
            LitematicaBitArray.PACKET_CODEC.encode((Object)buf, (Object)value.storage);
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.bits);
            ILitematicaBlockStatePalette iLitematicaBlockStatePalette = value.palette;
            if (iLitematicaBlockStatePalette instanceof LitematicaBlockStatePaletteHashMap) {
                LitematicaBlockStatePaletteHashMap hash = (LitematicaBlockStatePaletteHashMap)iLitematicaBlockStatePalette;
                LitematicaBlockStatePaletteHashMap.PACKET_CODEC.encode((Object)buf, (Object)hash);
            } else {
                iLitematicaBlockStatePalette = value.palette;
                if (iLitematicaBlockStatePalette instanceof LitematicaBlockStatePaletteLinear) {
                    LitematicaBlockStatePaletteLinear linear = (LitematicaBlockStatePaletteLinear)iLitematicaBlockStatePalette;
                    LitematicaBlockStatePaletteLinear.PACKET_CODEC.encode((Object)buf, (Object)linear);
                } else {
                    throw new RuntimeException();
                }
            }
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.sizeX);
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.sizeY);
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.sizeZ);
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.sizeLayer);
            Vec3i.STREAM_CODEC.encode((Object)buf, (Object)value.size);
            ByteBufCodecs.LONG.encode((Object)buf, (Object)value.totalVolume);
            ByteBufCodecs.LONG_ARRAY.encode((Object)buf, (Object)value.blockCounts);
        }

        @Nonnull
        public LitematicaBlockStateContainer decode(@Nonnull ByteBuf buf) {
            LitematicaBitArray storage = (LitematicaBitArray)LitematicaBitArray.PACKET_CODEC.decode((Object)buf);
            int bits = (Integer)ByteBufCodecs.INT.decode((Object)buf);
            ILitematicaBlockStatePalette palette = bits <= 4 ? (ILitematicaBlockStatePalette)LitematicaBlockStatePaletteLinear.PACKET_CODEC.decode((Object)buf) : (ILitematicaBlockStatePalette)LitematicaBlockStatePaletteHashMap.PACKET_CODEC.decode((Object)buf);
            return new LitematicaBlockStateContainer(bits, storage, palette, (Integer)ByteBufCodecs.INT.decode((Object)buf), (Integer)ByteBufCodecs.INT.decode((Object)buf), (Integer)ByteBufCodecs.INT.decode((Object)buf), (Integer)ByteBufCodecs.INT.decode((Object)buf), (Vec3i)Vec3i.STREAM_CODEC.decode((Object)buf), (Long)ByteBufCodecs.LONG.decode((Object)buf), Arrays.stream((long[])ByteBufCodecs.LONG_ARRAY.decode((Object)buf)));
        }
    };
    public static final BlockState AIR_BLOCK_STATE = Blocks.AIR.defaultBlockState();
    protected LitematicaBitArray storage;
    protected ILitematicaBlockStatePalette palette;
    protected final Vec3i size;
    protected final int sizeX;
    protected final int sizeY;
    protected final int sizeZ;
    protected final int sizeLayer;
    protected final long totalVolume;
    protected int bits;
    protected long[] blockCounts = new long[0];

    public LitematicaBlockStateContainer(int sizeX, int sizeY, int sizeZ) {
        this(sizeX, sizeY, sizeZ, 2, null);
    }

    public LitematicaBlockStateContainer(Vec3i size, int bits, @Nullable long[] backingLongArray) {
        this(size.getX(), size.getY(), size.getZ(), bits, backingLongArray);
    }

    public LitematicaBlockStateContainer(int sizeX, int sizeY, int sizeZ, int bits, @Nullable long[] backingLongArray) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.sizeLayer = sizeX * sizeZ;
        this.totalVolume = (long)this.sizeX * (long)this.sizeY * (long)this.sizeZ;
        this.size = new Vec3i(this.sizeX, this.sizeY, this.sizeZ);
        this.setBits(bits, backingLongArray);
    }

    private LitematicaBlockStateContainer(Integer bits, LitematicaBitArray bitArray, ILitematicaBlockStatePalette palette, Integer x, Integer y, Integer z, Integer layer, Vec3i size, Long volume, LongStream counts) {
        this.bits = bits;
        this.storage = bitArray;
        this.palette = palette;
        this.sizeX = x;
        this.sizeY = y;
        this.sizeZ = z;
        this.sizeLayer = layer;
        this.size = size;
        this.totalVolume = volume;
        if (!counts.equals(LongStream.empty())) {
            this.blockCounts = counts.toArray();
        }
    }

    public Vec3i getSize() {
        return this.size;
    }

    public LitematicaBitArray getArray() {
        return this.storage;
    }

    public long[] getBlockCounts() {
        return this.blockCounts;
    }

    public BlockState get(int x, int y, int z) {
        BlockState state = this.palette.getBlockState(this.storage.getAt(this.getIndex(x, y, z)));
        return state == null ? AIR_BLOCK_STATE : state;
    }

    public void set(int x, int y, int z, BlockState state) {
        int id = this.palette.idFor(state);
        this.storage.setAt(this.getIndex(x, y, z), id);
    }

    protected void set(int index, BlockState state) {
        int id = this.palette.idFor(state);
        this.storage.setAt(index, id);
    }

    protected int getIndex(int x, int y, int z) {
        return y * this.sizeLayer + z * this.sizeX + x;
    }

    protected void setBits(int bitsIn, @Nullable long[] backingLongArray) {
        if (bitsIn != this.bits) {
            this.bits = bitsIn;
            if (this.bits <= 4) {
                this.bits = Math.max(2, this.bits);
                this.palette = new LitematicaBlockStatePaletteLinear(this.bits, this);
            } else {
                this.palette = new LitematicaBlockStatePaletteHashMap(this.bits, this);
            }
            this.palette.idFor(AIR_BLOCK_STATE);
            this.storage = backingLongArray != null ? new LitematicaBitArray(this.bits, this.totalVolume, backingLongArray) : new LitematicaBitArray(this.bits, this.totalVolume);
        }
    }

    @Override
    public int onResize(int bits, BlockState state) {
        LitematicaBitArray oldStorage = this.storage;
        ILitematicaBlockStatePalette oldPalette = this.palette;
        long storageLength = oldStorage.size();
        this.setBits(bits, null);
        LitematicaBitArray newStorage = this.storage;
        for (long index = 0L; index < storageLength; ++index) {
            newStorage.setAt(index, oldStorage.getAt(index));
        }
        this.palette.readFromNBT(oldPalette.writeToNBT());
        return this.palette.idFor(state);
    }

    public long[] getBackingLongArray() {
        return this.storage.getBackingLongArray();
    }

    public ILitematicaBlockStatePalette getPalette() {
        return this.palette;
    }

    public static LitematicaBlockStateContainer createFrom(ListTag palette, long[] blockStates, BlockPos size) {
        int bits = Math.max(2, 32 - Integer.numberOfLeadingZeros(palette.size() - 1));
        LitematicaBlockStateContainer container = new LitematicaBlockStateContainer(size.getX(), size.getY(), size.getZ(), bits, blockStates);
        container.palette.readFromNBT(palette);
        return container;
    }

    @Nullable
    public static LitematicaBlockStateContainer createContainer(int paletteSize, byte[] blockData, Vec3i size) {
        int bits = Math.max(2, 32 - Integer.numberOfLeadingZeros(paletteSize - 1));
        SpongeBlockstateConverterResults results = LitematicaBlockStateContainer.convertVarIntByteArrayToPackedLongArray(size, bits, blockData);
        LitematicaBlockStateContainer container = new LitematicaBlockStateContainer(size, bits, results.backingArray);
        container.blockCounts = results.blockCounts;
        return container;
    }

    public static SpongeBlockstateConverterResults convertVarIntByteArrayToPackedLongArray(Vec3i size, int bits, byte[] blockStates) {
        int volume = size.getX() * size.getY() * size.getZ();
        LitematicaBitArray bitArray = new LitematicaBitArray(bits, volume);
        FriendlyByteBuf buf = new FriendlyByteBuf(Unpooled.wrappedBuffer((byte[])blockStates));
        long[] blockCounts = new long[1 << bits];
        for (int i = 0; i < volume; ++i) {
            int id = buf.readVarInt();
            bitArray.setAt(i, id);
            int n = id;
            blockCounts[n] = blockCounts[n] + 1L;
        }
        return new SpongeBlockstateConverterResults(bitArray.getBackingLongArray(), blockCounts);
    }

    public static class SpongeBlockstateConverterResults {
        public final long[] backingArray;
        public final long[] blockCounts;

        protected SpongeBlockstateConverterResults(long[] backingArray, long[] blockCounts) {
            this.backingArray = backingArray;
            this.blockCounts = blockCounts;
        }
    }
}

