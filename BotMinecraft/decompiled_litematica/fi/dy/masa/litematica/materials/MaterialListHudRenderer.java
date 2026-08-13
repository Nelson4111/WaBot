/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.HudAlignment
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InventoryUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Color4f
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.Font
 *  net.minecraft.client.gui.GuiGraphicsExtractor
 *  net.minecraft.client.gui.screens.inventory.AbstractContainerScreen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.NonNullList
 *  net.minecraft.world.entity.Entity
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.inventory.Slot
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.Level
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.materials;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.materials.MaterialCache;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListSorter;
import fi.dy.masa.litematica.materials.MaterialListUtils;
import fi.dy.masa.litematica.render.infohud.IInfoHudRenderer;
import fi.dy.masa.litematica.render.infohud.RenderPhase;
import fi.dy.masa.litematica.util.RayTraceUtils;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.config.HudAlignment;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InventoryUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Color4f;
import java.util.Collections;
import java.util.List;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.inventory.AbstractContainerScreen;
import net.minecraft.core.BlockPos;
import net.minecraft.core.NonNullList;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;

public class MaterialListHudRenderer
implements IInfoHudRenderer {
    protected static BlockState lastLookedAtBlock = Blocks.AIR.defaultBlockState();
    protected static ItemStack lastLookedAtBlocksItem = ItemStack.EMPTY;
    protected final MaterialListBase materialList;
    protected final MaterialListSorter sorter;
    protected boolean shouldRender;
    protected long lastUpdateTime;

    public MaterialListHudRenderer(MaterialListBase materialList) {
        this.materialList = materialList;
        this.sorter = new MaterialListSorter(materialList);
    }

    @Override
    public boolean getShouldRenderText(RenderPhase phase) {
        return false;
    }

    @Override
    public boolean getShouldRenderCustom() {
        return this.shouldRender;
    }

    @Override
    public boolean shouldRenderInGuis() {
        return Configs.Generic.RENDER_MATERIALS_IN_GUI.getBooleanValue();
    }

    public void toggleShouldRender() {
        this.shouldRender = !this.shouldRender;
    }

    @Override
    public List<String> getText(RenderPhase phase) {
        return Collections.emptyList();
    }

    @Override
    public int render(GuiGraphicsExtractor graphics, int xOffset, int yOffset, HudAlignment alignment) {
        List<MaterialListEntry> list;
        Minecraft mc = Minecraft.getInstance();
        long currentTime = System.currentTimeMillis();
        GuiContext ctx = GuiContext.fromGuiGraphics((GuiGraphicsExtractor)graphics);
        if (currentTime - this.lastUpdateTime > 2000L) {
            MaterialListUtils.updateAvailableCounts(this.materialList.getMaterialsAll(), (Player)mc.player);
            list = this.materialList.getMaterialsMissingOnly(true);
            list.sort(this.sorter);
            this.lastUpdateTime = currentTime;
        } else {
            list = this.materialList.getMaterialsMissingOnly(false);
        }
        if (list.size() == 0) {
            return 0;
        }
        Font font = mc.font;
        double scale = Configs.InfoOverlays.MATERIAL_LIST_HUD_SCALE.getDoubleValue();
        int maxLines = Configs.InfoOverlays.MATERIAL_LIST_HUD_MAX_LINES.getIntegerValue();
        int bgMargin = 2;
        int lineHeight = 16;
        int contentHeight = Math.min(list.size(), maxLines) * lineHeight + bgMargin + 10;
        int maxTextLength = 0;
        int maxCountLength = 0;
        int posX = xOffset + bgMargin;
        int posY = yOffset + bgMargin;
        int bgColor = -1610612736;
        int textColor = -1;
        boolean useBackground = true;
        boolean useShadow = false;
        int size = Math.min(list.size(), maxLines);
        if (scale == 0.0) {
            return 0;
        }
        for (int i = 0; i < size; ++i) {
            MaterialListEntry entry = list.get(i);
            maxTextLength = Math.max(maxTextLength, font.width(entry.getStack().getHoverName().getString()));
            int multiplier = this.materialList.getMultiplier();
            int count = multiplier == 1 ? entry.getCountMissing() - entry.getCountAvailable() : entry.getCountTotal();
            String strCount = GuiBase.TXT_RED + this.getFormattedCountString(count *= multiplier, entry.getStack().getMaxStackSize()) + GuiBase.TXT_RST;
            maxCountLength = Math.max(maxCountLength, font.width(strCount));
        }
        int maxLineLength = maxTextLength + maxCountLength + 30;
        switch (alignment) {
            case TOP_RIGHT: 
            case BOTTOM_RIGHT: {
                posX = (int)((double)GuiUtils.getScaledWindowWidth() / scale - (double)maxLineLength - (double)xOffset - (double)bgMargin);
                break;
            }
            case CENTER: {
                posX = (int)((double)GuiUtils.getScaledWindowWidth() / scale / 2.0 - (double)(maxLineLength / 2) - (double)xOffset);
                break;
            }
        }
        if (scale != 1.0 && scale != 0.0) {
            yOffset = (int)((double)yOffset / scale);
        }
        posY = RenderUtils.getHudPosY((int)posY, (int)yOffset, (int)contentHeight, (double)scale, (HudAlignment)alignment);
        posY += RenderUtils.getHudOffsetForPotions((HudAlignment)alignment, (double)scale, (Player)mc.player);
        if (scale != 1.0) {
            ctx.pose().pushMatrix();
            ctx.pose().scale((float)scale, (float)scale);
        }
        if (useBackground) {
            int x1 = posX - bgMargin;
            int y1 = posY - bgMargin;
            int x2 = x1 + maxLineLength + bgMargin * 2;
            int y2 = y1 + contentHeight + bgMargin;
            ctx.fill(x1, y1, x2, y2, bgColor);
        }
        int x = posX;
        int y = posY + 12;
        for (int i = 0; i < size; ++i) {
            ctx.renderItem(list.get(i).getStack(), x, y);
            y += lineHeight;
        }
        String title = GuiBase.TXT_BOLD + StringUtils.translate((String)"litematica.gui.button.material_list", (Object[])new Object[0]) + GuiBase.TXT_RST;
        ctx.drawString(font, title, posX + 2, posY + 2, textColor, useShadow);
        int itemCountTextColor = Configs.Colors.MATERIAL_LIST_HUD_ITEM_COUNTS.getIntegerValue();
        x = posX + 18;
        y = posY + 16;
        for (int i = 0; i < size; ++i) {
            MaterialListEntry entry = list.get(i);
            String text = entry.getStack().getHoverName().getString();
            int multiplier = this.materialList.getMultiplier();
            int count = multiplier == 1 ? entry.getCountMissing() - entry.getCountAvailable() : entry.getCountTotal();
            String strCount = this.getFormattedCountString(count *= multiplier, entry.getStack().getMaxStackSize());
            int cntLen = font.width(strCount);
            int cntPosX = posX + maxLineLength - cntLen - 2;
            ctx.drawString(font, text, x, y, textColor, useShadow);
            ctx.drawString(font, strCount, cntPosX, y, itemCountTextColor, useShadow);
            y += lineHeight;
        }
        if (scale != 1.0) {
            ctx.pose().popMatrix();
        }
        return contentHeight + 4;
    }

    protected String getFormattedCountString(int count, int maxStackSize) {
        int stacks = count / maxStackSize;
        int remainder = count % maxStackSize;
        double boxCount = (double)count / (27.0 * (double)maxStackSize);
        if (count > maxStackSize) {
            if (boxCount >= 1.0) {
                return String.format("%d (%.2f %s)", count, boxCount, StringUtils.translate((String)"litematica.gui.label.material_list.abbr.shulker_box", (Object[])new Object[0]));
            }
            if (remainder > 0) {
                return String.format("%d (%d x %d + %d)", count, stacks, maxStackSize, remainder);
            }
            return String.format("%d (%d x %d)", count, stacks, maxStackSize);
        }
        return String.format("%d", count);
    }

    public static void renderLookedAtBlockInInventory(GuiContext ctx, AbstractContainerScreen<?> gui, Minecraft mc) {
        RayTraceUtils.RayTraceWrapper traceWrapper;
        if (Configs.Generic.HIGHLIGHT_BLOCK_IN_INV.getBooleanValue() && (traceWrapper = RayTraceUtils.getGenericTrace((Level)mc.level, (Entity)mc.player, 10.0)) != null && traceWrapper.getHitType() == RayTraceUtils.RayTraceWrapper.HitType.SCHEMATIC_BLOCK) {
            BlockPos pos = traceWrapper.getBlockHitResult().getBlockPos();
            WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
            BlockState state = world.getBlockState(pos);
            if (state != lastLookedAtBlock) {
                lastLookedAtBlock = state;
                lastLookedAtBlocksItem = MaterialCache.getInstance().getRequiredBuildItemForState(state, world, pos);
            }
            Color4f color = Configs.Colors.HIGHTLIGHT_BLOCK_IN_INV_COLOR.getColor();
            MaterialListHudRenderer.highlightSlotsWithItem(ctx, lastLookedAtBlocksItem, gui, color, mc);
        }
    }

    public static void highlightSlotsWithItem(GuiContext ctx, ItemStack referenceItem, AbstractContainerScreen<?> gui, Color4f color, Minecraft mc) {
        NonNullList slots = gui.getMenu().slots;
        for (Slot slot : slots) {
            if (!slot.hasItem() || !InventoryUtils.areStacksEqualIgnoreNbt((ItemStack)slot.getItem(), (ItemStack)referenceItem) && !fi.dy.masa.litematica.util.InventoryUtils.doesShulkerBoxContainItem(slot.getItem(), referenceItem) && !fi.dy.masa.litematica.util.InventoryUtils.doesBundleContainItem(slot.getItem(), referenceItem)) continue;
            MaterialListHudRenderer.renderOutlinedBox(ctx, slot.x, slot.y, 16, 16, color.intValue, color.intValue | 0xFF000000);
        }
    }

    public static void renderOutlinedBox(GuiContext ctx, int x, int y, int width, int height, int colorBg, int colorBorder) {
        RenderUtils.drawRect((GuiContext)ctx, (int)(x + 1), (int)(y + 1), (int)(width - 2), (int)(height - 2), (int)colorBg);
        RenderUtils.drawOutline((GuiContext)ctx, (int)x, (int)y, (int)width, (int)height, (int)1, (int)colorBorder);
    }

    @Deprecated(forRemoval=true)
    public static void renderOutlinedBox(GuiContext ctx, int x, int y, int width, int height, int colorBg, int colorBorder, float zLevel) {
        MaterialListHudRenderer.renderOutlinedBox(ctx, x, y, width, height, colorBg, colorBorder);
    }
}

