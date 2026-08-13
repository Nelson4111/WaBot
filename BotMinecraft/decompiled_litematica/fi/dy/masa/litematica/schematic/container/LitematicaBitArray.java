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
 *  net.minecraft.network.codec.ByteBufCodecs
 *  net.minecraft.network.codec.StreamCodec
 *  org.apache.commons.lang3.Validate
 */
package fi.dy.masa.litematica.schematic.container;

import com.mojang.datafixers.kinds.App;
import com.mojang.datafixers.kinds.Applicative;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.PrimitiveCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import io.netty.buffer.ByteBuf;
import java.util.Arrays;
import java.util.stream.LongStream;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import org.apache.commons.lang3.Validate;

public class LitematicaBitArray {
    public static final Codec<LitematicaBitArray> CODEC = RecordCodecBuilder.create(inst -> inst.group((App)PrimitiveCodec.INT.fieldOf("BitsPerEntry").forGetter(get -> get.bitsPerEntry), (App)PrimitiveCodec.LONG.fieldOf("Size").forGetter(get -> get.arraySize), (App)PrimitiveCodec.LONG_STREAM.fieldOf("Array").forGetter(get -> Arrays.stream(get.longArray))).apply((Applicative)inst, LitematicaBitArray::new));
    public static final StreamCodec<ByteBuf, LitematicaBitArray> PACKET_CODEC = new StreamCodec<ByteBuf, LitematicaBitArray>(){

        public void encode(@Nonnull ByteBuf buf, LitematicaBitArray value) {
            ByteBufCodecs.INT.encode((Object)buf, (Object)value.bitsPerEntry);
            ByteBufCodecs.LONG.encode((Object)buf, (Object)value.arraySize);
            ByteBufCodecs.LONG_ARRAY.encode((Object)buf, (Object)value.longArray);
        }

        @Nonnull
        public LitematicaBitArray decode(@Nonnull ByteBuf buf) {
            return new LitematicaBitArray((int)((Integer)ByteBufCodecs.INT.decode((Object)buf)), (long)((Long)ByteBufCodecs.LONG.decode((Object)buf)), (long[])ByteBufCodecs.LONG_ARRAY.decode((Object)buf));
        }
    };
    private final long[] longArray;
    private final int bitsPerEntry;
    private final long maxEntryValue;
    private final long arraySize;

    public LitematicaBitArray(int bitsPerEntryIn, long arraySizeIn) {
        this(bitsPerEntryIn, arraySizeIn, (long[])null);
    }

    public LitematicaBitArray(int bitsPerEntryIn, long arraySizeIn, @Nullable long[] longArrayIn) {
        Validate.inclusiveBetween((long)1L, (long)32L, (long)bitsPerEntryIn);
        this.arraySize = arraySizeIn;
        this.bitsPerEntry = bitsPerEntryIn;
        this.maxEntryValue = (1L << bitsPerEntryIn) - 1L;
        this.longArray = longArrayIn != null ? longArrayIn : new long[(int)(LitematicaBitArray.roundUp(arraySizeIn * (long)bitsPerEntryIn, 64L) / 64L)];
    }

    private LitematicaBitArray(int bitsPerEntryIn, long arraySizeIn, LongStream longArrayIn) {
        this(bitsPerEntryIn, arraySizeIn, longArrayIn.toArray());
    }

    public void setAt(long index, int value) {
        long startOffset = index * (long)this.bitsPerEntry;
        int startArrIndex = (int)(startOffset >> 6);
        int endArrIndex = (int)((index + 1L) * (long)this.bitsPerEntry - 1L >> 6);
        int startBitOffset = (int)(startOffset & 0x3FL);
        this.longArray[startArrIndex] = this.longArray[startArrIndex] & (this.maxEntryValue << startBitOffset ^ 0xFFFFFFFFFFFFFFFFL) | ((long)value & this.maxEntryValue) << startBitOffset;
        if (startArrIndex != endArrIndex) {
            int endOffset = 64 - startBitOffset;
            int j1 = this.bitsPerEntry - endOffset;
            this.longArray[endArrIndex] = this.longArray[endArrIndex] >>> j1 << j1 | ((long)value & this.maxEntryValue) >> endOffset;
        }
    }

    public int getAt(long index) {
        long startOffset = index * (long)this.bitsPerEntry;
        int startArrIndex = (int)(startOffset >> 6);
        int endArrIndex = (int)((index + 1L) * (long)this.bitsPerEntry - 1L >> 6);
        int startBitOffset = (int)(startOffset & 0x3FL);
        if (startArrIndex == endArrIndex) {
            return (int)(this.longArray[startArrIndex] >>> startBitOffset & this.maxEntryValue);
        }
        int endOffset = 64 - startBitOffset;
        return (int)((this.longArray[startArrIndex] >>> startBitOffset | this.longArray[endArrIndex] << endOffset) & this.maxEntryValue);
    }

    public long[] getBackingLongArray() {
        return this.longArray;
    }

    public long size() {
        return this.arraySize;
    }

    public static long roundUp(long value, long interval) {
        long remainder;
        if (interval == 0L) {
            return 0L;
        }
        if (value == 0L) {
            return interval;
        }
        if (value < 0L) {
            interval *= -1L;
        }
        return (remainder = value % interval) == 0L ? value : value + interval - remainder;
    }
}

