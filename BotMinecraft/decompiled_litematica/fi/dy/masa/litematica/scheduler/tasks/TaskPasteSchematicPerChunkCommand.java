/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.Queues
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  fi.dy.masa.malilib.util.position.IntBoundingBox
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  it.unimi.dsi.fastutil.longs.Long2LongOpenHashMap
 *  it.unimi.dsi.fastutil.longs.LongArrayList
 *  javax.annotation.Nonnull
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.multiplayer.ClientLevel
 *  net.minecraft.commands.arguments.blocks.BlockStateParser
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.BlockPos$MutableBlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.HolderLookup$Provider
 *  net.minecraft.core.RegistryAccess
 *  net.minecraft.core.Vec3i
 *  net.minecraft.nbt.CompoundTag
 *  net.minecraft.nbt.Tag
 *  net.minecraft.tags.BlockTags
 *  net.minecraft.util.Mth
 *  net.minecraft.util.profiling.ProfilerFiller
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.decoration.ItemFrame
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.DyeColor
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.ChunkPos
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.LevelReader
 *  net.minecraft.world.level.block.entity.BlockEntity
 *  net.minecraft.world.level.block.entity.SignBlockEntity
 *  net.minecraft.world.level.block.state.BlockState
 *  net.minecraft.world.level.chunk.ChunkAccess
 *  net.minecraft.world.level.chunk.LevelChunk
 *  net.minecraft.world.phys.AABB
 *  net.minecraft.world.phys.BlockHitResult
 *  net.minecraft.world.phys.Vec3
 */
package fi.dy.masa.litematica.scheduler.tasks;

import com.google.common.collect.Queues;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.mixin.block.IMixinAbstractBlock;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.scheduler.tasks.TaskPasteSchematicPerChunkBase;
import fi.dy.masa.litematica.scheduler.tasks.TaskProcessChunkMultiPhase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PasteNbtBehavior;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.litematica.world.ChunkSchematic;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.game.BlockUtils;
import fi.dy.masa.malilib.util.position.IntBoundingBox;
import fi.dy.masa.malilib.util.position.LayerRange;
import fi.dy.masa.malilib.util.position.PositionUtils;
import it.unimi.dsi.fastutil.longs.Long2LongOpenHashMap;
import it.unimi.dsi.fastutil.longs.LongArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Queue;
import java.util.function.Consumer;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.commands.arguments.blocks.BlockStateParser;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.Tag;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.Mth;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.DyeColor;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.SignBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

public class TaskPasteSchematicPerChunkCommand
extends TaskPasteSchematicPerChunkBase {
    protected final Queue<String> queuedCommands = Queues.newArrayDeque();
    protected final Long2LongOpenHashMap placedPositionTimestamps = new Long2LongOpenHashMap();
    protected final LongArrayList fillVolumes = new LongArrayList();
    protected final BlockPos.MutableBlockPos mutablePos = new BlockPos.MutableBlockPos();
    protected final PasteNbtBehavior nbtBehavior;
    protected final String cloneCommand;
    protected final String fillCommand;
    protected final String setBlockCommand;
    protected final String summonCommand;
    protected final String delayCommand;
    protected final int maxBoxVolume;
    protected final boolean useFillCommand;
    protected final boolean useWorldEdit;
    protected int[][][] workArr;
    protected int maxCommandLength = 255;
    protected int sentFillCommands;
    protected int sentSetblockCommands;
    protected String useStrict;

    public TaskPasteSchematicPerChunkCommand(Collection<SchematicPlacement> placements, LayerRange range, boolean changedBlocksOnly) {
        super(placements, range, changedBlocksOnly);
        this.maxCommandsPerTick = Configs.Generic.COMMAND_LIMIT.getIntegerValue();
        this.maxBoxVolume = Configs.Generic.COMMAND_FILL_MAX_VOLUME.getIntegerValue();
        this.cloneCommand = Configs.Generic.COMMAND_NAME_CLONE.getStringValue();
        this.fillCommand = Configs.Generic.COMMAND_NAME_FILL.getStringValue();
        this.setBlockCommand = Configs.Generic.COMMAND_NAME_SETBLOCK.getStringValue();
        this.summonCommand = Configs.Generic.COMMAND_NAME_SUMMON.getStringValue();
        this.delayCommand = "<TICK_DELAY>";
        this.useFillCommand = Configs.Generic.PASTE_USE_FILL_COMMAND.getBooleanValue();
        this.useWorldEdit = Configs.Generic.COMMAND_USE_WORLDEDIT.getBooleanValue();
        this.useStrict = Configs.Generic.COMMAND_USE_STRICT.getBooleanValue() ? " strict" : "";
        this.nbtBehavior = (PasteNbtBehavior)Configs.Generic.PASTE_NBT_BEHAVIOR.getOptionListValue();
        this.processBoxBlocksTask = this.useFillCommand ? this::processBlocksInCurrentBoxUsingFill : this::processBlocksInCurrentBoxUsingSetBlockOnly;
        this.processBoxEntitiesTask = this::processEntitiesInCurrentBox;
    }

    @Override
    public boolean execute(ProfilerFiller profiler) {
        if (this.ignoreBlocks && this.ignoreEntities) {
            return true;
        }
        return this.executeMultiPhase(profiler);
    }

    @Override
    public void init() {
        super.init();
        if (this.useWorldEdit && this.isInWorld()) {
            this.sendCommand("/perf neighbors off");
        }
    }

    @Override
    protected void onNextChunkFetched(ChunkPos pos) {
        this.startNextBox(pos);
    }

    @Override
    protected void onStartNextBox(IntBoundingBox box) {
        if (!this.ignoreBlocks) {
            this.prepareSettingBlocks(box);
        } else {
            this.prepareSummoningEntities(box);
        }
    }

    protected void prepareSettingBlocks(IntBoundingBox box) {
        if (this.useFillCommand) {
            this.generateFillVolumes(box);
        } else {
            this.positionIterator = BlockPos.betweenClosed((int)box.minX(), (int)box.minY(), (int)box.minZ(), (int)box.maxX(), (int)box.maxY(), (int)box.maxZ()).iterator();
        }
        this.phase = TaskProcessChunkMultiPhase.TaskPhase.PROCESS_BOX_BLOCKS;
    }

    protected void prepareSummoningEntities(IntBoundingBox box) {
        AABB bb = new AABB((double)box.minX(), (double)box.minY(), (double)box.minZ(), (double)(box.maxX() + 1), (double)(box.maxY() + 1), (double)(box.maxZ() + 1));
        this.entityIterator = this.schematicWorld.getEntities((Entity)null, bb, e -> true).iterator();
        this.phase = TaskProcessChunkMultiPhase.TaskPhase.PROCESS_BOX_ENTITIES;
    }

    @Override
    protected void sendQueuedCommands() {
        while (this.sentCommandsThisTick < this.maxCommandsPerTick && !this.queuedCommands.isEmpty()) {
            String command = this.queuedCommands.poll();
            if (command.equals(this.delayCommand)) {
                this.sentCommandsThisTick = this.maxCommandsPerTick;
                continue;
            }
            this.sendCommand(command);
        }
    }

    protected void processBlocksInCurrentBoxUsingSetBlockOnly() {
        ChunkPos chunkPos = this.currentChunkPos;
        if (chunkPos == null || this.positionIterator == null || this.mc.level == null) {
            return;
        }
        ChunkSchematic schematicChunk = this.schematicWorld.getChunkSource().getChunkForLighting(chunkPos.x(), chunkPos.z());
        if (schematicChunk == null || this.currentBox == null) {
            return;
        }
        LevelChunk clientChunk = this.mc.level.getChunk(chunkPos.x(), chunkPos.z());
        boolean ignoreLimit = Configs.Generic.PASTE_IGNORE_CMD_LIMIT.getBooleanValue();
        while (this.positionIterator.hasNext() && this.queuedCommands.size() < this.maxCommandsPerTick && (!ignoreLimit || this.sentCommandsThisTick < this.maxCommandsPerTick)) {
            BlockPos pos = (BlockPos)this.positionIterator.next();
            this.pasteBlock(pos, schematicChunk, (ChunkAccess)clientChunk, ignoreLimit);
        }
        this.sendQueuedCommands();
        if (!this.positionIterator.hasNext() && this.queuedCommands.isEmpty()) {
            if (this.ignoreEntities) {
                this.onFinishedProcessingBox(this.currentChunkPos, this.currentBox);
            } else {
                this.prepareSummoningEntities(this.currentBox);
            }
        }
    }

    protected void processBlocksInCurrentBoxUsingFill() {
        ChunkPos chunkPos = this.currentChunkPos;
        if (chunkPos == null || this.currentBox == null || this.mc.level == null) {
            return;
        }
        int baseX = chunkPos.x() << 4;
        int baseZ = chunkPos.z() << 4;
        ChunkSchematic schematicChunk = this.schematicWorld.getChunkSource().getChunkForLighting(chunkPos.x(), chunkPos.z());
        LevelChunk clientChunk = this.mc.level.getChunk(chunkPos.x(), chunkPos.z());
        while (!this.fillVolumes.isEmpty() && this.queuedCommands.size() < this.maxCommandsPerTick) {
            int index = this.fillVolumes.size() - 1;
            long encodedValue = this.fillVolumes.removeLong(index);
            this.fillVolume(encodedValue, baseX, baseZ, schematicChunk, (ChunkAccess)clientChunk);
        }
        this.sendQueuedCommands();
        if (this.fillVolumes.isEmpty() && this.queuedCommands.isEmpty()) {
            if (this.ignoreEntities) {
                this.onFinishedProcessingBox(this.currentChunkPos, this.currentBox);
            } else {
                this.prepareSummoningEntities(this.currentBox);
            }
        }
    }

    protected void processEntitiesInCurrentBox() {
        if (this.entityIterator == null || this.currentBox == null || this.mc.level == null) {
            return;
        }
        while (this.entityIterator.hasNext() && this.queuedCommands.size() < this.maxCommandsPerTick) {
            this.summonEntity((Entity)this.entityIterator.next());
        }
        this.sendQueuedCommands();
        if (!this.entityIterator.hasNext() && this.queuedCommands.isEmpty()) {
            this.onFinishedProcessingBox(this.currentChunkPos, this.currentBox);
        }
    }

    protected void pasteBlock(BlockPos pos, LevelChunk schematicChunk, ChunkAccess clientChunk, boolean ignoreLimit) {
        BlockState stateClient;
        BlockState stateSchematic = schematicChunk.getBlockState(pos);
        if (this.shouldSetBlock(stateSchematic, stateClient = clientChunk.getBlockState(pos))) {
            if (this.useSpecialPasting(stateSchematic)) {
                this.specialPasteBlock(pos, stateSchematic, this.schematicWorld, this.queuedCommands::offer);
                return;
            }
            PasteNbtBehavior nbtBehavior = this.nbtBehavior;
            BlockEntity be = schematicChunk.getBlockEntity(pos);
            if (be != null && nbtBehavior != PasteNbtBehavior.NONE && !this.useWorldEdit) {
                Consumer<String> commandHandler = ignoreLimit ? this::sendCommand : this.queuedCommands::offer;
                Level schematicWorld = schematicChunk.getLevel();
                if (nbtBehavior == PasteNbtBehavior.PLACE_MODIFY) {
                    this.setDataViaDataModify(pos, stateSchematic, be, schematicWorld, this.mc.level, commandHandler);
                } else if (nbtBehavior == PasteNbtBehavior.PLACE_CLONE) {
                    this.placeBlockViaClone(pos, stateSchematic, be, schematicWorld, this.mc.level, commandHandler);
                }
            } else {
                this.queueSetBlockCommand(pos.getX(), pos.getY(), pos.getZ(), stateSchematic);
            }
        }
    }

    protected boolean useSpecialPasting(BlockState state) {
        return !this.useWorldEdit && state.is(BlockTags.ALL_SIGNS);
    }

    protected boolean shouldSetBlock(BlockState stateSchematic, BlockState stateClient) {
        boolean matched;
        boolean bl = matched = stateClient == stateSchematic;
        if (stateSchematic.hasBlockEntity() && Configs.Generic.PASTE_IGNORE_BE_ENTIRELY.getBooleanValue()) {
            return false;
        }
        if (stateSchematic.isAir() && stateClient.isAir() || this.changedBlockOnly && matched) {
            return false;
        }
        return !(this.replace == ReplaceBehavior.NONE && !stateClient.isAir() || this.replace == ReplaceBehavior.WITH_NON_AIR && stateSchematic.isAir());
    }

    protected void summonEntity(Entity entity) {
        String id;
        if (this.currentBox != null) {
            int x = entity.getBlockX();
            int y = entity.getBlockY();
            int z = entity.getBlockZ();
            if (x < this.currentBox.minX() || x > this.currentBox.maxX() || y < this.currentBox.minY() || y > this.currentBox.maxY() || z < this.currentBox.minZ() || z > this.currentBox.maxZ()) {
                return;
            }
        }
        if ((id = EntityUtils.getEntityId(entity)) != null) {
            String command = String.format(Locale.ROOT, "%s %s %f %f %f", this.summonCommand, id, entity.getX(), entity.getY(), entity.getZ());
            if (entity instanceof ItemFrame) {
                ItemFrame itemFrame = (ItemFrame)entity;
                this.handleSummonItemFrame(itemFrame, command, entity.getX(), entity.getY(), entity.getZ());
            } else {
                this.queuedCommands.offer(command);
            }
        }
    }

    protected void handleSummonItemFrame(ItemFrame itemFrame, String baseSummonCmd, double x, double y, double z) {
        ItemStack stack = itemFrame.getItem();
        int facingId = itemFrame.getDirection().get3DDataValue();
        String facingTag = String.format("{Facing:%db}", facingId);
        if (stack.isEmpty()) {
            this.queuedCommands.offer(baseSummonCmd + " " + facingTag);
            return;
        }
        CompoundTag itemNbt = InventoryUtils.toNbtOrEmpty((ItemStack)stack, (RegistryAccess)this.schematicWorld.registryAccess());
        String fullNbtStr = String.format("{Facing:%db,Item:%s}", facingId, itemNbt.toString());
        String fullCmd = baseSummonCmd + " " + fullNbtStr;
        if (fullCmd.length() <= this.maxCommandLength) {
            this.queuedCommands.offer(fullCmd);
        } else {
            String itemId = itemNbt.getStringOr("id", "");
            CompoundTag visualItemNbt = new CompoundTag();
            if (!itemId.isEmpty()) {
                visualItemNbt.putString("id", itemId);
            }
            String visualCmd = baseSummonCmd + " " + (itemId.isEmpty() ? facingTag : String.format("{Facing:%db,Item:%s}", facingId, visualItemNbt.toString()));
            if (!itemId.isEmpty() && itemNbt.contains("components")) {
                String testCmd;
                CompoundTag components = itemNbt.getCompoundOrEmpty("components");
                CompoundTag visualComponents = new CompoundTag();
                boolean hasComponents = false;
                if (components.contains("minecraft:custom_name")) {
                    visualComponents.put("minecraft:custom_name", components.get("minecraft:custom_name"));
                    visualItemNbt.put("components", (Tag)visualComponents);
                    testCmd = baseSummonCmd + " " + String.format("{Facing:%db,Item:%s}", facingId, visualItemNbt.toString());
                    if (testCmd.length() <= this.maxCommandLength) {
                        visualCmd = testCmd;
                        hasComponents = true;
                    } else {
                        visualComponents.remove("minecraft:custom_name");
                    }
                }
                if (components.contains("minecraft:dyed_color")) {
                    visualComponents.put("minecraft:dyed_color", components.get("minecraft:dyed_color"));
                    visualItemNbt.put("components", (Tag)visualComponents);
                    testCmd = baseSummonCmd + " " + String.format("{Facing:%db,Item:%s}", facingId, visualItemNbt.toString());
                    if (testCmd.length() <= this.maxCommandLength) {
                        visualCmd = testCmd;
                        hasComponents = true;
                    } else {
                        visualComponents.remove("minecraft:dyed_color");
                    }
                }
                if (!hasComponents) {
                    visualItemNbt.remove("components");
                }
            }
            String visualNbtStr = itemId.isEmpty() ? facingTag : String.format("{Facing:%db,Item:%s}", facingId, visualItemNbt.toString());
            String dataModifyCmd = String.format(Locale.ROOT, "data modify entity @e[type=item_frame,x=%f,y=%f,z=%f,distance=..0.1,limit=1] Item set value %s", x, y, z, itemNbt);
            if (!itemId.isEmpty() && dataModifyCmd.length() <= this.maxCommandLength) {
                this.queuedCommands.offer(visualCmd);
                this.queuedCommands.offer(this.delayCommand);
                this.queuedCommands.offer(dataModifyCmd);
            } else {
                Litematica.LOGGER.error("handleSummonItemFrame: Split command failed. NBT too large for command; using a fallback (visual only) item!");
                this.queuedCommands.offer(visualCmd);
            }
        }
    }

    protected void queueSetBlockCommand(int x, int y, int z, BlockState state) {
        this.queueSetBlockCommand(x, y, z, state, this.queuedCommands::offer);
    }

    protected void queueSetBlockCommand(int x, int y, int z, BlockState state, Consumer<String> commandHandler) {
        String blockString = BlockStateParser.serialize((BlockState)state);
        if (this.useWorldEdit) {
            commandHandler.accept(String.format("/pos1 %d,%d,%d", x, y, z));
            commandHandler.accept(String.format("/pos2 %d,%d,%d", x, y, z));
            commandHandler.accept("/set " + blockString);
        } else {
            String cmdName = this.setBlockCommand;
            String cmd = String.format("%s %d %d %d %s%s", cmdName, x, y, z, blockString, this.useStrict);
            commandHandler.accept(cmd);
        }
        ++this.sentSetblockCommands;
    }

    protected void pasteVolume(int x1, int y1, int z1, int x2, int y2, int z2, BlockState state) {
        int minX = Math.min(x1, x2);
        int minY = Math.min(y1, y2);
        int minZ = Math.min(z1, z2);
        int maxX = Math.max(x1, x2);
        int maxY = Math.max(y1, y2);
        int maxZ = Math.max(z1, z2);
        int singleLayerVolume = (maxX - minX + 1) * (maxZ - minZ + 1);
        int totalVolume = singleLayerVolume * (maxY - minY + 1);
        if (totalVolume <= this.maxBoxVolume || this.useWorldEdit) {
            this.queueFillCommandForBox(minX, minY, minZ, maxX, maxY, maxZ, state);
        } else {
            int singleBoxHeight = this.maxBoxVolume / singleLayerVolume;
            if (singleBoxHeight < 1) {
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"Error: Calculated single box height was less than 1 block", (Object[])new Object[0]);
                return;
            }
            for (int y = minY; y <= maxY; y += singleBoxHeight) {
                int boxMaxY = Math.min(y + singleBoxHeight - 1, maxY);
                this.queueFillCommandForBox(minX, y, minZ, maxX, boxMaxY, maxZ, state);
            }
        }
    }

    protected void queueFillCommandForBox(int minX, int minY, int minZ, int maxX, int maxY, int maxZ, BlockState state) {
        String blockString = BlockStateParser.serialize((BlockState)state);
        if (this.useWorldEdit) {
            this.queuedCommands.offer(String.format("/pos1 %d,%d,%d", minX, minY, minZ));
            this.queuedCommands.offer(String.format("/pos2 %d,%d,%d", maxX, maxY, maxZ));
            this.queuedCommands.offer("/set " + blockString);
        } else {
            String cmdName = this.fillCommand;
            Object fillCommand = String.format("%s %d %d %d %d %d %d %s", cmdName, minX, minY, minZ, maxX, maxY, maxZ, blockString);
            if (this.replace == ReplaceBehavior.NONE || this.replace == ReplaceBehavior.WITH_NON_AIR && state.isAir()) {
                fillCommand = (String)fillCommand + " replace air";
            }
            fillCommand = (String)fillCommand + this.useStrict;
            this.queuedCommands.offer((String)fillCommand);
        }
        ++this.sentFillCommands;
    }

    protected void setDataViaDataModify(BlockPos pos, BlockState state, BlockEntity be, Level schematicWorld, ClientLevel clientWorld, Consumer<String> commandHandler) {
        BlockPos placementPos = this.placeNbtPickedBlock(pos, state, be, schematicWorld, clientWorld);
        if (placementPos != null) {
            this.queueSetBlockCommand(pos.getX(), pos.getY(), pos.getZ(), state, commandHandler);
            try {
                HashSet keys = new HashSet(be.saveWithoutMetadata((HolderLookup.Provider)clientWorld.registryAccess()).keySet());
                keys.remove("id");
                keys.remove("x");
                keys.remove("y");
                keys.remove("z");
                for (String key : keys) {
                    String command = String.format("data modify block %d %d %d %s set from block %d %d %d %s", pos.getX(), pos.getY(), pos.getZ(), key, placementPos.getX(), placementPos.getY(), placementPos.getZ(), key);
                    commandHandler.accept(this.delayCommand);
                    commandHandler.accept(command);
                }
            }
            catch (Exception keys) {
                // empty catch block
            }
            String cmdName = this.setBlockCommand;
            String command = String.format("%s %d %d %d air%s", cmdName, placementPos.getX(), placementPos.getY(), placementPos.getZ(), this.useStrict);
            commandHandler.accept(command);
        }
    }

    protected void specialPasteBlock(BlockPos pos, BlockState state, Level schematicWorld, Consumer<String> commandHandler) {
        if (state.is(BlockTags.ALL_SIGNS)) {
            this.specialPasteSignBlock(pos, state, schematicWorld, commandHandler);
        }
    }

    protected void specialPasteSignBlock(BlockPos pos, BlockState state, Level schematicWorld, Consumer<String> commandHandler) {
        BlockEntity be = schematicWorld.getBlockEntity(pos);
        String blockString = BlockStateParser.serialize((BlockState)state);
        if (be instanceof SignBlockEntity) {
            SignBlockEntity signBe = (SignBlockEntity)be;
            CompoundTag tag = be.saveWithoutMetadata((HolderLookup.Provider)schematicWorld.registryAccess());
            if (tag != null) {
                if (!signBe.getFrontText().hasMessage((Player)this.mc.player)) {
                    tag.remove("front_text");
                } else {
                    CompoundTag frontText = tag.getCompoundOrEmpty("front_text");
                    if (!signBe.getFrontText().hasGlowingText()) {
                        frontText.remove("has_glowing_text");
                    }
                    if (signBe.getFrontText().getColor() == DyeColor.BLACK) {
                        frontText.remove("color");
                    }
                    tag.put("front_text", (Tag)frontText);
                }
                if (!signBe.getBackText().hasMessage((Player)this.mc.player)) {
                    tag.remove("back_text");
                } else {
                    CompoundTag backText = tag.getCompoundOrEmpty("back_text");
                    if (!signBe.getBackText().hasGlowingText()) {
                        backText.remove("has_glowing_text");
                    }
                    if (signBe.getBackText().getColor() == DyeColor.BLACK) {
                        backText.remove("color");
                    }
                    tag.put("back_text", (Tag)backText);
                }
                if (!signBe.isWaxed()) {
                    tag.remove("is_waxed");
                }
                tag.remove("components");
                String cmd = String.format("%s %d %d %d %s%s%s", this.setBlockCommand, pos.getX(), pos.getY(), pos.getZ(), blockString, tag.toString(), this.useStrict);
                if (cmd.length() <= this.maxCommandLength) {
                    commandHandler.accept(cmd);
                    ++this.sentSetblockCommands;
                    return;
                }
                CompoundTag baseTag = new CompoundTag();
                if (tag.contains("is_waxed")) {
                    baseTag.put("is_waxed", tag.get("is_waxed"));
                }
                String baseCmd = String.format("%s %d %d %d %s%s%s", this.setBlockCommand, pos.getX(), pos.getY(), pos.getZ(), blockString, baseTag.toString(), this.useStrict);
                String frontCmd = null;
                if (tag.contains("front_text")) {
                    frontCmd = String.format("data modify block %d %d %d front_text set value %s", pos.getX(), pos.getY(), pos.getZ(), tag.get("front_text").toString());
                }
                String backCmd = null;
                if (tag.contains("back_text")) {
                    backCmd = String.format("data modify block %d %d %d back_text set value %s", pos.getX(), pos.getY(), pos.getZ(), tag.get("back_text").toString());
                }
                boolean safeLength = true;
                if (frontCmd != null && frontCmd.length() > this.maxCommandLength) {
                    safeLength = false;
                }
                if (backCmd != null && backCmd.length() > this.maxCommandLength) {
                    safeLength = false;
                }
                if (safeLength) {
                    commandHandler.accept(baseCmd);
                    if (frontCmd != null) {
                        commandHandler.accept(this.delayCommand);
                        commandHandler.accept(frontCmd);
                    }
                    if (backCmd != null) {
                        commandHandler.accept(this.delayCommand);
                        commandHandler.accept(backCmd);
                    }
                    ++this.sentSetblockCommands;
                    return;
                }
                this.setDataViaDataModify(pos, state, be, schematicWorld, this.mc.level, commandHandler);
                return;
            }
        }
        String cmd = String.format("%s %d %d %d %s%s", this.setBlockCommand, pos.getX(), pos.getY(), pos.getZ(), blockString, this.useStrict);
        commandHandler.accept(cmd);
        ++this.sentSetblockCommands;
    }

    protected void placeBlockViaClone(BlockPos pos, BlockState state, BlockEntity be, Level schematicWorld, ClientLevel clientWorld, Consumer<String> commandHandler) {
        BlockPos placementPos = this.placeNbtPickedBlock(pos, state, be, schematicWorld, clientWorld);
        if (placementPos != null) {
            String command = String.format("%s %d %d %d %d %d %d %d %d %d%s", this.cloneCommand, placementPos.getX(), placementPos.getY(), placementPos.getZ(), placementPos.getX(), placementPos.getY(), placementPos.getZ(), pos.getX(), pos.getY(), pos.getZ(), this.useStrict);
            commandHandler.accept(command);
            String cmdName = this.setBlockCommand;
            command = String.format("%s %d %d %d air%s", cmdName, placementPos.getX(), placementPos.getY(), placementPos.getZ(), this.useStrict);
            commandHandler.accept(command);
        }
    }

    @Nullable
    protected BlockPos placeNbtPickedBlock(BlockPos pos, BlockState state, BlockEntity be, @Nonnull Level schematicWorld, @Nonnull ClientLevel clientWorld) {
        if (this.mc.player == null || this.mc.gameMode == null) {
            return null;
        }
        double reach = this.mc.player.blockInteractionRange();
        BlockPos placementPos = this.findEmptyNearbyPosition((Level)clientWorld, this.mc.player.position(), 4, reach);
        if (placementPos != null && TaskPasteSchematicPerChunkCommand.preparePickedStack(pos, state, be, schematicWorld, this.mc, clientWorld.registryAccess())) {
            Vec3 posVec = new Vec3((double)placementPos.getX() + 0.5, (double)placementPos.getY() + 0.5, (double)placementPos.getZ() + 0.5);
            BlockHitResult hitResult = new BlockHitResult(posVec, Direction.UP, placementPos, true);
            this.mc.gameMode.useItemOn(this.mc.player, InteractionHand.OFF_HAND, hitResult);
            this.placedPositionTimestamps.put(placementPos.asLong(), System.nanoTime());
            this.mc.player.getInventory().setItem(40, ItemStack.EMPTY);
            return placementPos;
        }
        return null;
    }

    protected void fillVolume(long encodedValue, int baseX, int baseZ, ChunkSchematic schematicChunk, ChunkAccess clientChunk) {
        int startPos = (int)encodedValue;
        int packedOffset = TaskPasteSchematicPerChunkCommand.getPackedSize(encodedValue);
        int startX = TaskPasteSchematicPerChunkCommand.unpackX(startPos) + baseX;
        int startY = TaskPasteSchematicPerChunkCommand.unpackY(startPos);
        int startZ = TaskPasteSchematicPerChunkCommand.unpackZ(startPos) + baseZ;
        int endOffsetX = TaskPasteSchematicPerChunkCommand.unpackX(packedOffset);
        int endOffsetY = TaskPasteSchematicPerChunkCommand.unpackY(packedOffset);
        int endOffsetZ = TaskPasteSchematicPerChunkCommand.unpackZ(packedOffset);
        this.mutablePos.set(startX, startY, startZ);
        if (endOffsetX > 0 || endOffsetY > 0 || endOffsetZ > 0 || Configs.Generic.PASTE_ALWAYS_USE_FILL.getBooleanValue()) {
            int endX = startX + endOffsetX;
            int endY = startY + endOffsetY;
            int endZ = startZ + endOffsetZ;
            BlockState state = schematicChunk.getBlockState((BlockPos)this.mutablePos);
            this.pasteVolume(startX, startY, startZ, endX, endY, endZ, state);
        } else {
            this.pasteBlock((BlockPos)this.mutablePos, schematicChunk, clientChunk, false);
        }
    }

    protected void generateFillVolumes(IntBoundingBox box) {
        ChunkSchematic chunk = this.schematicWorld.getChunkSource().getChunkForLighting(box.minX() >> 4, box.minZ() >> 4);
        boolean ignoreBeFromFill = Configs.Generic.PASTE_IGNORE_BE_IN_FILL.getBooleanValue() && Configs.Generic.PASTE_NBT_BEHAVIOR.getOptionListValue() != PasteNbtBehavior.NONE;
        this.fillVolumes.clear();
        if (this.workArr == null) {
            int height = this.world.getHeight();
            this.workArr = new int[16][height][16];
        }
        this.generateStrips(this.workArr, Direction.EAST, box, chunk, ignoreBeFromFill);
        this.combineStripsToLayers(this.workArr, Direction.EAST, Direction.SOUTH, Direction.UP, box, chunk, this.fillVolumes, ignoreBeFromFill);
        Collections.reverse(this.fillVolumes);
    }

    protected int getBlockStripLength(BlockPos.MutableBlockPos pos, Direction direction, int maxLength, BlockState firstState, ChunkAccess chunk) {
        int length;
        for (length = 1; length < maxLength; ++length) {
            pos.move(direction);
            BlockState state = chunk.getBlockState((BlockPos)pos);
            if (state != firstState) break;
        }
        return length;
    }

    protected void generateStrips(int[][][] workArr, Direction stripDirection, IntBoundingBox box, ChunkSchematic chunk, boolean ignoreBeFromFill) {
        boolean ignoreBeEntirely = Configs.Generic.PASTE_IGNORE_BE_ENTIRELY.getBooleanValue();
        BlockPos.MutableBlockPos mutablePos = this.mutablePos;
        ReplaceBehavior replace = this.replace;
        int startX = box.minX() & 0xF;
        int startZ = box.minZ() & 0xF;
        int endX = box.maxX() & 0xF;
        int endZ = box.maxZ() & 0xF;
        int worldMinY = chunk.getMinY();
        for (int y = box.minY(); y <= box.maxY(); ++y) {
            for (int z = startZ; z <= endZ; ++z) {
                for (int x = startX; x <= endX; ++x) {
                    int length;
                    mutablePos.set(x, y, z);
                    BlockState state = chunk.getBlockState((BlockPos)mutablePos);
                    if (state.isAir() && replace != ReplaceBehavior.ALL) continue;
                    if (state.hasBlockEntity()) {
                        if (ignoreBeFromFill) {
                            workArr[x][y - worldMinY][z] = 1;
                            continue;
                        }
                        if (ignoreBeEntirely) continue;
                    }
                    workArr[x][y - worldMinY][z] = length = this.getBlockStripLength(mutablePos, stripDirection, endX - x + 1, state, (ChunkAccess)chunk);
                    x += length - 1;
                }
            }
        }
    }

    protected void combineStripsToLayers(int[][][] workArr, Direction stripDirection, Direction stripCombineDirection, Direction layerCombineDirection, IntBoundingBox box, ChunkSchematic chunk, LongArrayList volumesOut, boolean ignoreBe) {
        int nextZ;
        BlockState state;
        int nextY;
        int nextX;
        BlockPos.MutableBlockPos mutablePos = this.mutablePos;
        int sdOffX = stripDirection.getStepX();
        int sdOffY = stripDirection.getStepY();
        int sdOffZ = stripDirection.getStepZ();
        int scOffX = stripCombineDirection.getStepX();
        int scOffY = stripCombineDirection.getStepY();
        int scOffZ = stripCombineDirection.getStepZ();
        int lcOffX = layerCombineDirection.getStepX();
        int lcOffY = layerCombineDirection.getStepY();
        int lcOffZ = layerCombineDirection.getStepZ();
        int startX = box.minX() & 0xF;
        int startZ = box.minZ() & 0xF;
        int endX = box.maxX() & 0xF;
        int endZ = box.maxZ() & 0xF;
        int worldMinY = chunk.getMinY();
        for (int y = box.minY(); y <= box.maxY(); ++y) {
            for (int x = startX; x <= endX; ++x) {
                for (int z = startZ; z <= endZ; ++z) {
                    int packedSize;
                    int length = workArr[x][y - worldMinY][z];
                    if (length <= 0) continue;
                    nextX = x + scOffX;
                    nextY = y + scOffY;
                    int stripCount = 1;
                    mutablePos.set(x, y, z);
                    state = chunk.getBlockState((BlockPos)mutablePos);
                    if (!ignoreBe || !state.hasBlockEntity()) {
                        for (nextZ = z + scOffZ; nextX <= 15 && nextY <= box.maxY() && nextZ <= 15 && workArr[nextX][nextY - worldMinY][nextZ] == length && chunk.getBlockState((BlockPos)mutablePos.set(nextX, nextY, nextZ)) == state; nextX += scOffX, nextY += scOffY, nextZ += scOffZ) {
                            ++stripCount;
                            workArr[nextX][nextY - worldMinY][nextZ] = 0;
                        }
                    }
                    int packedX = sdOffX * length + scOffX * stripCount;
                    int packedY = sdOffY * length + scOffY * stripCount;
                    int packedZ = sdOffZ * length + scOffZ * stripCount;
                    workArr[x][y - worldMinY][z] = packedSize = TaskPasteSchematicPerChunkCommand.packCoordinate5bit(packedX, packedY, packedZ);
                    if (stripCount <= 1) continue;
                    int extraStrips = stripCount - 1;
                    x += scOffX * extraStrips;
                    y += scOffY * extraStrips;
                    z += scOffZ * extraStrips;
                }
            }
        }
        for (int x = startX; x <= endX; ++x) {
            for (int z = startZ; z <= endZ; ++z) {
                for (int y = box.minY(); y <= box.maxY(); ++y) {
                    int packedSize = workArr[x][y - worldMinY][z];
                    if (packedSize == 0) continue;
                    nextX = x + lcOffX;
                    nextY = y + lcOffY;
                    int layerCount = 1;
                    mutablePos.set(x, y, z);
                    state = chunk.getBlockState((BlockPos)mutablePos);
                    if (!ignoreBe || !state.hasBlockEntity()) {
                        for (nextZ = z + lcOffZ; nextX <= 15 && nextY <= box.maxY() && nextZ <= 15 && workArr[nextX][nextY - worldMinY][nextZ] == packedSize && chunk.getBlockState((BlockPos)mutablePos.set(nextX, nextY, nextZ)) == state; nextX += lcOffX, nextY += lcOffY, nextZ += lcOffZ) {
                            ++layerCount;
                            workArr[nextX][nextY - worldMinY][nextZ] = 0;
                        }
                    }
                    int volumeEndOffsetX = lcOffX * layerCount + TaskPasteSchematicPerChunkCommand.unpackX5bit(packedSize) - 1;
                    int volumeEndOffsetY = lcOffY * layerCount + TaskPasteSchematicPerChunkCommand.unpackY5bit(packedSize) - 1;
                    int volumeEndOffsetZ = lcOffZ * layerCount + TaskPasteSchematicPerChunkCommand.unpackZ5bit(packedSize) - 1;
                    int packedVolumeEndOffset = TaskPasteSchematicPerChunkCommand.packCoordinate(volumeEndOffsetX, volumeEndOffsetY, volumeEndOffsetZ);
                    long encodedValue = (long)packedVolumeEndOffset << 32 | (long)TaskPasteSchematicPerChunkCommand.packCoordinate(x, y, z) & 0xFFFFFFFFL;
                    volumesOut.add(encodedValue);
                    workArr[x][y - worldMinY][z] = 0;
                    if (layerCount <= 1) continue;
                    int extraLayers = layerCount - 1;
                    x += lcOffX * extraLayers;
                    y += lcOffY * extraLayers;
                    z += lcOffZ * extraLayers;
                }
            }
        }
    }

    @Override
    protected void onStop() {
        if (this.finished) {
            if (this.printCompletionMessage) {
                if (this.useWorldEdit) {
                    InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.schematic_pasted_using_world_edit", (Object[])new Object[]{this.sentSetblockCommands + this.sentFillCommands});
                } else if (this.useFillCommand) {
                    InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.schematic_pasted_using_fill_and_setblock", (Object[])new Object[]{this.sentFillCommands, this.sentSetblockCommands});
                } else {
                    InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.INFO, (String)"litematica.message.schematic_pasted_using_setblock", (Object[])new Object[]{this.sentSetblockCommands});
                }
            }
        } else {
            InfoUtils.showGuiOrActionBarMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.message.error.schematic_paste_failed", (Object[])new Object[0]);
        }
        this.sendTaskEndCommands();
        DataManager.removeChatListener(this.gameRuleListener);
        InfoHud.getInstance().removeInfoHudRenderer(this, false);
        super.onStop();
    }

    protected static int unpackX(int value) {
        return value & 0xF;
    }

    protected static int unpackY(int value) {
        return value >> 8;
    }

    protected static int unpackZ(int value) {
        return value >> 4 & 0xF;
    }

    protected static int packCoordinate(int x, int y, int z) {
        return y << 8 | (z & 0xF) << 4 | x & 0xF;
    }

    protected static int unpackX5bit(int value) {
        return value & 0x1F;
    }

    protected static int unpackY5bit(int value) {
        return value >> 10;
    }

    protected static int unpackZ5bit(int value) {
        return value >> 5 & 0x1F;
    }

    protected static int packCoordinate5bit(int x, int y, int z) {
        return y << 10 | (z & 0x1F) << 5 | x & 0x1F;
    }

    protected static int getPackedSize(long fullPackedValue) {
        return (int)(fullPackedValue >> 32);
    }

    @Nullable
    public BlockPos findEmptyNearbyPosition(Level world, Vec3 centerPos, int radius, double reachDistance) {
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
        BlockPos.MutableBlockPos sidePos = new BlockPos.MutableBlockPos();
        long currentTime = System.nanoTime();
        long timeout = 2000000000L;
        double squaredReach = reachDistance * reachDistance;
        int radiusY = Math.min(radius, 2);
        for (double y = centerPos.y() - (double)radiusY; y <= centerPos.y() + (double)radiusY; y += 1.0) {
            for (double z = centerPos.z() - (double)radius; z <= centerPos.z() + (double)radius; z += 1.0) {
                for (double x = centerPos.x() - (double)radius; x <= centerPos.x() + (double)radius; x += 1.0) {
                    if (centerPos.distanceToSqr(x, y, z) > squaredReach || Mth.floor((float)Mth.abs((float)((float)(centerPos.x() - x)))) < 2 && Mth.floor((float)Mth.abs((float)((float)(centerPos.z() - z)))) < 2 && y >= centerPos.y() - 2.0 && y <= centerPos.y() + 2.0) continue;
                    pos.set(x, y, z);
                    long posLong = pos.asLong();
                    if (this.placedPositionTimestamps.containsKey(posLong) && currentTime - this.placedPositionTimestamps.get(posLong) < timeout || !TaskPasteSchematicPerChunkCommand.isPositionAndSidesEmpty(world, (BlockPos)pos, sidePos)) continue;
                    return pos.immutable();
                }
            }
        }
        return null;
    }

    public static boolean isPositionAndSidesEmpty(Level world, BlockPos centerPos, BlockPos.MutableBlockPos pos) {
        if (!world.isEmptyBlock(centerPos)) {
            return false;
        }
        for (Direction side : PositionUtils.ALL_DIRECTIONS) {
            if (world.isEmptyBlock((BlockPos)pos.setWithOffset((Vec3i)centerPos, side))) continue;
            return false;
        }
        return true;
    }

    protected static boolean preparePickedStack(BlockPos pos, BlockState state, BlockEntity be, Level world, Minecraft mc, @Nonnull RegistryAccess registryManager) {
        if (mc.player == null || mc.gameMode == null) {
            return false;
        }
        ItemStack stack = ((IMixinAbstractBlock)state.getBlock()).litematica_getPickStack((LevelReader)world, pos, state, false);
        if (!stack.isEmpty()) {
            BlockUtils.setStackNbt((ItemStack)stack, (BlockEntity)be, (RegistryAccess)registryManager);
            mc.player.getInventory().setItem(40, stack);
            mc.gameMode.handleCreativeModeItemAdd(stack, 45);
            return true;
        }
        return false;
    }
}

