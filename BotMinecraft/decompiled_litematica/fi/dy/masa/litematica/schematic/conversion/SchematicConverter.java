/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.world.level.block.BannerBlock
 *  net.minecraft.world.level.block.BedBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.ChorusPlantBlock
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.DoublePlantBlock
 *  net.minecraft.world.level.block.FenceBlock
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.FireBlock
 *  net.minecraft.world.level.block.FlowerPotBlock
 *  net.minecraft.world.level.block.GrassBlock
 *  net.minecraft.world.level.block.IronBarsBlock
 *  net.minecraft.world.level.block.MyceliumBlock
 *  net.minecraft.world.level.block.NoteBlock
 *  net.minecraft.world.level.block.RedStoneWireBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.SkullBlock
 *  net.minecraft.world.level.block.SnowyBlock
 *  net.minecraft.world.level.block.StainedGlassPaneBlock
 *  net.minecraft.world.level.block.StairBlock
 *  net.minecraft.world.level.block.StandingSignBlock
 *  net.minecraft.world.level.block.StemBlock
 *  net.minecraft.world.level.block.TallFlowerBlock
 *  net.minecraft.world.level.block.TripWireBlock
 *  net.minecraft.world.level.block.VineBlock
 *  net.minecraft.world.level.block.WallBannerBlock
 *  net.minecraft.world.level.block.WallBlock
 *  net.minecraft.world.level.block.WallSignBlock
 *  net.minecraft.world.level.block.WallSkullBlock
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.material.FluidState
 */
package fi.dy.masa.litematica.schematic.conversion;

import fi.dy.masa.litematica.schematic.container.LitematicaBlockStateContainer;
import fi.dy.masa.litematica.schematic.conversion.IBlockReaderWithData;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionFixers;
import fi.dy.masa.litematica.schematic.conversion.SchematicConversionMaps;
import fi.dy.masa.litematica.schematic.conversion.WallStateFixer;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.block.BannerBlock;
import net.minecraft.world.level.block.BedBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.ChorusPlantBlock;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.DoublePlantBlock;
import net.minecraft.world.level.block.FenceBlock;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.FireBlock;
import net.minecraft.world.level.block.FlowerPotBlock;
import net.minecraft.world.level.block.GrassBlock;
import net.minecraft.world.level.block.IronBarsBlock;
import net.minecraft.world.level.block.MyceliumBlock;
import net.minecraft.world.level.block.NoteBlock;
import net.minecraft.world.level.block.RedStoneWireBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.SkullBlock;
import net.minecraft.world.level.block.SnowyBlock;
import net.minecraft.world.level.block.StainedGlassPaneBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.StandingSignBlock;
import net.minecraft.world.level.block.StemBlock;
import net.minecraft.world.level.block.TallFlowerBlock;
import net.minecraft.world.level.block.TripWireBlock;
import net.minecraft.world.level.block.VineBlock;
import net.minecraft.world.level.block.WallBannerBlock;
import net.minecraft.world.level.block.WallBlock;
import net.minecraft.world.level.block.WallSignBlock;
import net.minecraft.world.level.block.WallSkullBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.FluidState;

public class SchematicConverter {
    private final IdentityHashMap<Class<? extends Block>, SchematicConversionFixers.IStateFixer> fixersPerBlock = new IdentityHashMap();
    private final IdentityHashMap<BlockState, SchematicConversionFixers.IStateFixer> postProcessingStateFixers = new IdentityHashMap();

    private SchematicConverter() {
    }

    public static SchematicConverter createForSchematica() {
        SchematicConverter converter = new SchematicConverter();
        converter.addPostUpdateBlocksSchematica();
        return converter;
    }

    public static SchematicConverter createForLitematica() {
        SchematicConverter converter = new SchematicConverter();
        converter.addPostUpdateBlocksLitematica();
        return converter;
    }

    public boolean getConvertedStatesForBlock(int schematicBlockId, String blockName, BlockState[] paletteOut) {
        int shiftedOldVanillaId = SchematicConversionMaps.getOldNameToShiftedBlockId(blockName);
        int successCount = 0;
        if (shiftedOldVanillaId >= 0) {
            for (int meta = 0; meta < 16; ++meta) {
                BlockState state = SchematicConversionMaps.get_1_13_2_StateForIdMeta(shiftedOldVanillaId & 0xFFF0 | meta);
                if (state == null) continue;
                paletteOut[schematicBlockId << 4 | meta] = state;
                ++successCount;
            }
        } else {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)("Failed to convert block with old name '" + blockName + "'"), (Object[])new Object[0]);
        }
        return successCount > 0;
    }

    public boolean getVanillaBlockPalette(BlockState[] paletteOut) {
        for (int idMeta = 0; idMeta < paletteOut.length; ++idMeta) {
            BlockState state = SchematicConversionMaps.get_1_13_2_StateForIdMeta(idMeta);
            if (state == null) continue;
            paletteOut[idMeta] = state;
        }
        return true;
    }

    public BlockState[] getBlockStatePaletteForBlockPalette(String[] blockPalette) {
        Object[] palette = new BlockState[blockPalette.length * 16];
        Arrays.fill(palette, Blocks.AIR.defaultBlockState());
        for (int schematicBlockId = 0; schematicBlockId < blockPalette.length; ++schematicBlockId) {
            String blockName = blockPalette[schematicBlockId];
            this.getConvertedStatesForBlock(schematicBlockId, blockName, (BlockState[])palette);
        }
        return palette;
    }

    public boolean createPostProcessStateFilter(BlockState[] palette) {
        return this.createPostProcessStateFilter(Arrays.asList(palette));
    }

    public boolean createPostProcessStateFilter(Collection<BlockState> palette) {
        boolean needsPostProcess = false;
        this.postProcessingStateFixers.clear();
        for (BlockState state : palette) {
            if (!this.needsPostProcess(state)) continue;
            this.postProcessingStateFixers.put(state, this.getFixerFor(state));
            needsPostProcess = true;
        }
        return needsPostProcess;
    }

    public IdentityHashMap<BlockState, SchematicConversionFixers.IStateFixer> getPostProcessStateFilter() {
        return this.postProcessingStateFixers;
    }

    private boolean needsPostProcess(BlockState state) {
        return !state.isAir() && this.fixersPerBlock.containsKey(state.getBlock().getClass());
    }

    @Nullable
    private SchematicConversionFixers.IStateFixer getFixerFor(BlockState state) {
        return this.fixersPerBlock.get(state.getBlock().getClass());
    }

    public static void postProcessBlocks(LitematicaBlockStateContainer container, @Nullable Map<BlockPos, CompoundTag> tiles, IdentityHashMap<BlockState, SchematicConversionFixers.IStateFixer> postProcessingFilter) {
        int sizeX = container.getSize().getX();
        int sizeY = container.getSize().getY();
        int sizeZ = container.getSize().getZ();
        BlockReaderLitematicaContainer reader = new BlockReaderLitematicaContainer(container, tiles);
        BlockPos.MutableBlockPos posMutable = new BlockPos.MutableBlockPos();
        for (int y = 0; y < sizeY; ++y) {
            for (int z = 0; z < sizeZ; ++z) {
                for (int x = 0; x < sizeX; ++x) {
                    BlockState state = container.get(x, y, z);
                    SchematicConversionFixers.IStateFixer fixer = postProcessingFilter.get(state);
                    if (fixer == null) continue;
                    posMutable.set(x, y, z);
                    BlockState stateFixed = fixer.fixState(reader, state, (BlockPos)posMutable);
                    if (stateFixed == state) continue;
                    container.set(x, y, z, stateFixed);
                }
            }
        }
    }

    private void addPostUpdateBlocksLitematica() {
        this.fixersPerBlock.put(RedStoneWireBlock.class, SchematicConversionFixers.FIXER_REDSTONE_WIRE);
        this.fixersPerBlock.put(WallBlock.class, WallStateFixer.INSTANCE);
        this.fixersPerBlock.put(BannerBlock.class, SchematicConversionFixers.FIXER_BANNER);
        this.fixersPerBlock.put(WallBannerBlock.class, SchematicConversionFixers.FIXER_BANNER_WALL);
        this.fixersPerBlock.put(BedBlock.class, SchematicConversionFixers.FIXER_BED);
        this.fixersPerBlock.put(FlowerPotBlock.class, SchematicConversionFixers.FIXER_FLOWER_POT);
        this.fixersPerBlock.put(NoteBlock.class, SchematicConversionFixers.FIXER_NOTE_BLOCK);
        this.fixersPerBlock.put(StandingSignBlock.class, SchematicConversionFixers.FIXER_SIGN);
        this.fixersPerBlock.put(SkullBlock.class, SchematicConversionFixers.FIXER_SKULL);
        this.fixersPerBlock.put(WallSignBlock.class, SchematicConversionFixers.FIXER_SIGN);
        this.fixersPerBlock.put(WallSkullBlock.class, SchematicConversionFixers.FIXER_SKULL_WALL);
    }

    private void addPostUpdateBlocksSchematica() {
        this.fixersPerBlock.put(ChorusPlantBlock.class, SchematicConversionFixers.FIXER_CHRORUS_PLANT);
        this.fixersPerBlock.put(DoorBlock.class, SchematicConversionFixers.FIXER_DOOR);
        this.fixersPerBlock.put(FenceBlock.class, SchematicConversionFixers.FIXER_FENCE);
        this.fixersPerBlock.put(FenceGateBlock.class, SchematicConversionFixers.FIXER_FENCE_GATE);
        this.fixersPerBlock.put(FireBlock.class, SchematicConversionFixers.FIXER_FIRE);
        this.fixersPerBlock.put(GrassBlock.class, SchematicConversionFixers.FIXER_DIRT_SNOWY);
        this.fixersPerBlock.put(MyceliumBlock.class, SchematicConversionFixers.FIXER_DIRT_SNOWY);
        this.fixersPerBlock.put(IronBarsBlock.class, SchematicConversionFixers.FIXER_PANE);
        this.fixersPerBlock.put(RepeaterBlock.class, SchematicConversionFixers.FIXER_REDSTONE_REPEATER);
        this.fixersPerBlock.put(RedStoneWireBlock.class, SchematicConversionFixers.FIXER_REDSTONE_WIRE);
        this.fixersPerBlock.put(SnowyBlock.class, SchematicConversionFixers.FIXER_DIRT_SNOWY);
        this.fixersPerBlock.put(StemBlock.class, SchematicConversionFixers.FIXER_STEM);
        this.fixersPerBlock.put(StainedGlassPaneBlock.class, SchematicConversionFixers.FIXER_PANE);
        this.fixersPerBlock.put(StairBlock.class, SchematicConversionFixers.FIXER_STAIRS);
        this.fixersPerBlock.put(TallFlowerBlock.class, SchematicConversionFixers.FIXER_DOUBLE_PLANT);
        this.fixersPerBlock.put(DoublePlantBlock.class, SchematicConversionFixers.FIXER_DOUBLE_PLANT);
        this.fixersPerBlock.put(TripWireBlock.class, SchematicConversionFixers.FIXER_TRIPWIRE);
        this.fixersPerBlock.put(VineBlock.class, SchematicConversionFixers.FIXER_VINE);
        this.fixersPerBlock.put(WallBlock.class, WallStateFixer.INSTANCE);
        this.fixersPerBlock.put(BannerBlock.class, SchematicConversionFixers.FIXER_BANNER);
        this.fixersPerBlock.put(WallBannerBlock.class, SchematicConversionFixers.FIXER_BANNER_WALL);
        this.fixersPerBlock.put(BedBlock.class, SchematicConversionFixers.FIXER_BED);
        this.fixersPerBlock.put(FlowerPotBlock.class, SchematicConversionFixers.FIXER_FLOWER_POT);
        this.fixersPerBlock.put(NoteBlock.class, SchematicConversionFixers.FIXER_NOTE_BLOCK);
        this.fixersPerBlock.put(StandingSignBlock.class, SchematicConversionFixers.FIXER_SIGN);
        this.fixersPerBlock.put(SkullBlock.class, SchematicConversionFixers.FIXER_SKULL);
        this.fixersPerBlock.put(WallSignBlock.class, SchematicConversionFixers.FIXER_SIGN);
        this.fixersPerBlock.put(WallSkullBlock.class, SchematicConversionFixers.FIXER_SKULL_WALL);
    }

    public static class BlockReaderLitematicaContainer
    implements IBlockReaderWithData {
        private final LitematicaBlockStateContainer container;
        private final Map<BlockPos, CompoundTag> blockEntityData;
        private final Vec3i size;
        private final BlockState air;

        public BlockReaderLitematicaContainer(LitematicaBlockStateContainer container, @Nullable Map<BlockPos, CompoundTag> blockEntityData) {
            this.container = container;
            this.blockEntityData = blockEntityData != null ? blockEntityData : new HashMap();
            this.size = container.getSize();
            this.air = Blocks.AIR.defaultBlockState();
        }

        @Nonnull
        public BlockState getBlockState(BlockPos pos) {
            if (pos.getX() >= 0 && pos.getX() < this.size.getX() && pos.getY() >= 0 && pos.getY() < this.size.getY() && pos.getZ() >= 0 && pos.getZ() < this.size.getZ()) {
                return this.container.get(pos.getX(), pos.getY(), pos.getZ());
            }
            return this.air;
        }

        @Nonnull
        public FluidState getFluidState(@Nonnull BlockPos pos) {
            return this.getBlockState(pos).getFluidState();
        }

        @Nullable
        public BlockEntity getBlockEntity(@Nonnull BlockPos pos) {
            return null;
        }

        @Override
        @Nullable
        public CompoundTag getBlockEntityData(BlockPos pos) {
            return this.blockEntityData.get(pos);
        }
    }
}

