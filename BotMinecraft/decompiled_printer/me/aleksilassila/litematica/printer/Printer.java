package me.aleksilassila.litematica.printer;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import me.aleksilassila.litematica.printer.ActionHandler;
import me.aleksilassila.litematica.printer.SchematicBlockState;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.config.Hotkeys;
import me.aleksilassila.litematica.printer.guides.Guide;
import me.aleksilassila.litematica.printer.guides.Guides;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Abilities;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.LiquidBlock;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Printer {
    public static final Logger logger = LogManager.getLogger((String)"litematica_printer");
    public final LocalPlayer player;
    public final ActionHandler actionHandler;
    private final Guides interactionGuides = new Guides();
    private final Map<BlockPos, Long> recentPlacements = new ConcurrentHashMap<>();

    public Printer(Minecraft client, LocalPlayer player) {
        this.player = player;
        this.actionHandler = new ActionHandler(client, player);
    }

    public boolean onGameTick() {
        WorldSchematic worldSchematic = SchematicWorldHandler.getSchematicWorld();
        if (!this.actionHandler.acceptsActions()) {
            return false;
        }
        if (worldSchematic == null) {
            return false;
        }
        if (!Configs.PRINT_MODE.getBooleanValue() && !Hotkeys.PRINT.getKeybind().isPressed()) {
            return false;
        }
        Abilities abilities = this.player.getAbilities();
        if (!abilities.mayBuild) {
            return false;
        }

        long now = System.currentTimeMillis();
        this.recentPlacements.entrySet().removeIf(e -> now - e.getValue() > 800L);

        List<BlockPos> positions = this.getReachablePositions();
        block0: for (BlockPos position : positions) {
            if (this.recentPlacements.containsKey(position)) {
                continue;
            }

            SchematicBlockState state = new SchematicBlockState(this.player.level(), worldSchematic, position);
            if (state.targetState.equals((Object)state.currentState) || state.targetState.isAir()) continue;

            if (!Configs.PLACE_WATER.getBooleanValue()) {
                if (state.targetState.getBlock() instanceof LiquidBlock || state.targetState.is(Blocks.WATER) || state.targetState.is(Blocks.WATER_CAULDRON)) {
                    continue;
                }
            }

            Guide[] guides = this.interactionGuides.getInteractionGuides(state);
            BlockHitResult result = RayTraceUtils.traceToSchematicWorld((Entity)this.player, (double)10.0, (boolean)true, (boolean)true);
            boolean isCurrentlyLookingSchematic = result != null && result.getBlockPos().equals((Object)position);
            for (Guide guide : guides) {
                if (guide.canExecute(this.player) && Configs.INTERACT_BLOCKS.getBooleanValue()) {
                    Printer.printDebug("Executing {} for {}", guide, state);
                    List<Action> actions = guide.execute(this.player);
                    this.recentPlacements.put(position, now);
                    this.actionHandler.addActions((Action[])actions.toArray(Action[]::new));
                    return true;
                }
                if (guide.skipOtherGuides()) continue block0;
            }
        }
        return false;
    }

    private List<BlockPos> getReachablePositions() {
        int maxReach = (int)Math.ceil(Configs.PRINTING_RANGE.getDoubleValue());
        double maxReachSquared = Mth.square((double)Configs.PRINTING_RANGE.getDoubleValue());
        ArrayList<BlockPos> positions = new ArrayList<BlockPos>();
        for (int y = -maxReach; y < maxReach + 1; ++y) {
            for (int x = -maxReach; x < maxReach + 1; ++x) {
                for (int z = -maxReach; z < maxReach + 1; ++z) {
                    BlockPos blockPos = this.player.blockPosition().north(x).west(z).above(y);
                    if (!DataManager.getRenderLayerRange().isPositionWithinRange(blockPos) || this.player.getEyePosition().distanceToSqr(Vec3.atCenterOf((Vec3i)blockPos)) > maxReachSquared) continue;
                    positions.add(blockPos);
                }
            }
        }
        return positions.stream().filter(p -> {
            Vec3 vec = Vec3.atCenterOf((Vec3i)p);
            return this.player.position().distanceToSqr(vec) > 1.0 && this.player.getEyePosition().distanceToSqr(vec) > 1.0;
        }).sorted((a, b) -> {
            double aDistance = this.player.position().distanceToSqr(Vec3.atCenterOf((Vec3i)a));
            double bDistance = this.player.position().distanceToSqr(Vec3.atCenterOf((Vec3i)b));
            return Double.compare(aDistance, bDistance);
        }).toList();
    }

    public static void printDebug(String key, Object ... args) {
        if (Configs.PRINT_DEBUG.getBooleanValue()) {
            logger.info(key, args);
        }
    }
}
