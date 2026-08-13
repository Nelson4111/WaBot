/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.AbstractBannerBlock
 *  net.minecraft.world.level.block.AbstractCandleBlock
 *  net.minecraft.world.level.block.AbstractSkullBlock
 *  net.minecraft.world.level.block.BambooStalkBlock
 *  net.minecraft.world.level.block.BaseRailBlock
 *  net.minecraft.world.level.block.BigDripleafBlock
 *  net.minecraft.world.level.block.BigDripleafStemBlock
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.CactusBlock
 *  net.minecraft.world.level.block.CampfireBlock
 *  net.minecraft.world.level.block.CandleBlock
 *  net.minecraft.world.level.block.ChestBlock
 *  net.minecraft.world.level.block.ComparatorBlock
 *  net.minecraft.world.level.block.CrossCollisionBlock
 *  net.minecraft.world.level.block.DoorBlock
 *  net.minecraft.world.level.block.EndPortalFrameBlock
 *  net.minecraft.world.level.block.FallingBlock
 *  net.minecraft.world.level.block.FarmlandBlock
 *  net.minecraft.world.level.block.FenceGateBlock
 *  net.minecraft.world.level.block.FlowerPotBlock
 *  net.minecraft.world.level.block.LeavesBlock
 *  net.minecraft.world.level.block.LeverBlock
 *  net.minecraft.world.level.block.NoteBlock
 *  net.minecraft.world.level.block.PointedDripstoneBlock
 *  net.minecraft.world.level.block.PoweredRailBlock
 *  net.minecraft.world.level.block.RedStoneWireBlock
 *  net.minecraft.world.level.block.RedstoneTorchBlock
 *  net.minecraft.world.level.block.RepeaterBlock
 *  net.minecraft.world.level.block.SaplingBlock
 *  net.minecraft.world.level.block.ScaffoldingBlock
 *  net.minecraft.world.level.block.SeaPickleBlock
 *  net.minecraft.world.level.block.SignBlock
 *  net.minecraft.world.level.block.SlabBlock
 *  net.minecraft.world.level.block.SnowLayerBlock
 *  net.minecraft.world.level.block.TorchBlock
 *  net.minecraft.world.level.block.TrapDoorBlock
 *  net.minecraft.world.level.block.TripWireBlock
 *  net.minecraft.world.level.block.TripWireHookBlock
 *  net.minecraft.world.level.block.TwistingVinesPlantBlock
 *  org.apache.commons.lang3.tuple.Pair
 */
package me.aleksilassila.litematica.printer.guides;

import java.util.ArrayList;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.guides.Guide;
import me.aleksilassila.litematica.printer.guides.interaction.CampfireExtinguishGuide;
import me.aleksilassila.litematica.printer.guides.interaction.CycleStateGuide;
import me.aleksilassila.litematica.printer.guides.interaction.EnderEyeGuide;
import me.aleksilassila.litematica.printer.guides.interaction.FlowerPotFillGuide;
import me.aleksilassila.litematica.printer.guides.interaction.LightCandleGuide;
import me.aleksilassila.litematica.printer.guides.interaction.LogStrippingGuide;
import me.aleksilassila.litematica.printer.guides.interaction.TillingGuide;
import me.aleksilassila.litematica.printer.guides.placement.BlockIndifferentGuesserGuide;
import me.aleksilassila.litematica.printer.guides.placement.BlockReplacementGuide;
import me.aleksilassila.litematica.printer.guides.placement.ChestGuide;
import me.aleksilassila.litematica.printer.guides.placement.FallingBlockGuide;
import me.aleksilassila.litematica.printer.guides.placement.FarmlandGuide;
import me.aleksilassila.litematica.printer.guides.placement.FlowerPotGuide;
import me.aleksilassila.litematica.printer.guides.placement.GuesserGuide;
import me.aleksilassila.litematica.printer.guides.placement.LogGuide;
import me.aleksilassila.litematica.printer.guides.placement.PropertySpecificGuesserGuide;
import me.aleksilassila.litematica.printer.guides.placement.RailGuesserGuide;
import me.aleksilassila.litematica.printer.guides.placement.RotatingBlockGuide;
import me.aleksilassila.litematica.printer.guides.placement.SlabGuide;
import me.aleksilassila.litematica.printer.guides.placement.TorchGuide;
import net.minecraft.world.level.block.AbstractBannerBlock;
import net.minecraft.world.level.block.AbstractCandleBlock;
import net.minecraft.world.level.block.AbstractSkullBlock;
import net.minecraft.world.level.block.BambooStalkBlock;
import net.minecraft.world.level.block.BaseRailBlock;
import net.minecraft.world.level.block.BigDripleafBlock;
import net.minecraft.world.level.block.BigDripleafStemBlock;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.CactusBlock;
import net.minecraft.world.level.block.CampfireBlock;
import net.minecraft.world.level.block.CandleBlock;
import net.minecraft.world.level.block.ChestBlock;
import net.minecraft.world.level.block.ComparatorBlock;
import net.minecraft.world.level.block.CrossCollisionBlock;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.EndPortalFrameBlock;
import net.minecraft.world.level.block.FallingBlock;
import net.minecraft.world.level.block.FarmlandBlock;
import net.minecraft.world.level.block.FenceGateBlock;
import net.minecraft.world.level.block.FlowerPotBlock;
import net.minecraft.world.level.block.LeavesBlock;
import net.minecraft.world.level.block.LeverBlock;
import net.minecraft.world.level.block.NoteBlock;
import net.minecraft.world.level.block.PointedDripstoneBlock;
import net.minecraft.world.level.block.PoweredRailBlock;
import net.minecraft.world.level.block.RedStoneWireBlock;
import net.minecraft.world.level.block.RedstoneTorchBlock;
import net.minecraft.world.level.block.RepeaterBlock;
import net.minecraft.world.level.block.SaplingBlock;
import net.minecraft.world.level.block.ScaffoldingBlock;
import net.minecraft.world.level.block.SeaPickleBlock;
import net.minecraft.world.level.block.SignBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.SnowLayerBlock;
import net.minecraft.world.level.block.TorchBlock;
import net.minecraft.world.level.block.TrapDoorBlock;
import net.minecraft.world.level.block.TripWireBlock;
import net.minecraft.world.level.block.TripWireHookBlock;
import net.minecraft.world.level.block.TwistingVinesPlantBlock;
import org.apache.commons.lang3.tuple.Pair;

public class Guides {
    protected static final ArrayList<Pair<Class<? extends Guide>, Class<? extends Block>[]>> guides = new ArrayList();

    @SafeVarargs
    protected static void registerGuide(Class<? extends Guide> guideClass, Class<? extends Block> ... blocks) {
        guides.add((Pair<Class<? extends Guide>, Class<? extends Block>[]>)Pair.of(guideClass, blocks));
    }

    public ArrayList<Pair<Class<? extends Guide>, Class<? extends Block>[]>> getGuides() {
        return guides;
    }

    public Guide[] getInteractionGuides(SchematicBlockState state) {
        ArrayList<Pair<Class<? extends Guide>, Class<? extends Block>[]>> guides = this.getGuides();
        ArrayList applicableGuides = new ArrayList();
        for (Pair<Class<? extends Guide>, Class<? extends Block>[]> guidePair : guides) {
            try {
                if (((Class[])guidePair.getRight()).length == 0) {
                    applicableGuides.add((Guide)((Class)guidePair.getLeft()).getConstructor(SchematicBlockState.class).newInstance(state));
                    continue;
                }
                for (Class clazz : (Class[])guidePair.getRight()) {
                    if (!clazz.isInstance(state.targetState.getBlock())) continue;
                    applicableGuides.add((Guide)((Class)guidePair.getLeft()).getConstructor(SchematicBlockState.class).newInstance(state));
                }
            }
            catch (Exception exception) {
            }
        }
        return (Guide[])applicableGuides.toArray(Guide[]::new);
    }

    static {
        Guides.registerGuide(RotatingBlockGuide.class, AbstractSkullBlock.class, SignBlock.class, AbstractBannerBlock.class);
        Guides.registerGuide(SlabGuide.class, SlabBlock.class);
        Guides.registerGuide(TorchGuide.class, TorchBlock.class);
        Guides.registerGuide(FarmlandGuide.class, FarmlandBlock.class);
        Guides.registerGuide(TillingGuide.class, FarmlandBlock.class);
        Guides.registerGuide(RailGuesserGuide.class, BaseRailBlock.class);
        Guides.registerGuide(ChestGuide.class, ChestBlock.class);
        Guides.registerGuide(FlowerPotGuide.class, FlowerPotBlock.class);
        Guides.registerGuide(FlowerPotFillGuide.class, FlowerPotBlock.class);
        Guides.registerGuide(PropertySpecificGuesserGuide.class, RepeaterBlock.class, ComparatorBlock.class, RedStoneWireBlock.class, RedstoneTorchBlock.class, BambooStalkBlock.class, CactusBlock.class, SaplingBlock.class, ScaffoldingBlock.class, PointedDripstoneBlock.class, CrossCollisionBlock.class, DoorBlock.class, TrapDoorBlock.class, FenceGateBlock.class, ChestBlock.class, SnowLayerBlock.class, SeaPickleBlock.class, CandleBlock.class, LeverBlock.class, EndPortalFrameBlock.class, NoteBlock.class, CampfireBlock.class, PoweredRailBlock.class, LeavesBlock.class, TripWireHookBlock.class);
        Guides.registerGuide(FallingBlockGuide.class, FallingBlock.class);
        Guides.registerGuide(BlockIndifferentGuesserGuide.class, BambooStalkBlock.class, BigDripleafStemBlock.class, BigDripleafBlock.class, TwistingVinesPlantBlock.class, TripWireBlock.class);
        Guides.registerGuide(CampfireExtinguishGuide.class, CampfireBlock.class);
        Guides.registerGuide(LightCandleGuide.class, AbstractCandleBlock.class);
        Guides.registerGuide(EnderEyeGuide.class, EndPortalFrameBlock.class);
        Guides.registerGuide(CycleStateGuide.class, DoorBlock.class, FenceGateBlock.class, TrapDoorBlock.class, LeverBlock.class, RepeaterBlock.class, ComparatorBlock.class, NoteBlock.class);
        Guides.registerGuide(BlockReplacementGuide.class, SnowLayerBlock.class, SeaPickleBlock.class, CandleBlock.class, SlabBlock.class);
        Guides.registerGuide(LogGuide.class, new Class[0]);
        Guides.registerGuide(LogStrippingGuide.class, new Class[0]);
        Guides.registerGuide(GuesserGuide.class, new Class[0]);
    }
}

