/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListEntrySortable
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.input.MouseButtonEvent
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.Block
 *  net.minecraft.world.level.block.Blocks
 *  net.minecraft.world.level.block.RenderShape
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.gui.GuiSchematicVerifier;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListSchematicVerificationResults;
import fi.dy.masa.litematica.render.RenderUtils;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntrySortable;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.game.BlockUtils;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.RenderShape;
import net.minecraft.world.level.block.state.BlockState;

public class WidgetSchematicVerificationResult
extends WidgetListEntrySortable<GuiSchematicVerifier.BlockMismatchEntry> {
    public static final String HEADER_EXPECTED = "litematica.gui.label.schematic_verifier.expected";
    public static final String HEADER_FOUND = "litematica.gui.label.schematic_verifier.found";
    public static final String HEADER_COUNT = "litematica.gui.label.schematic_verifier.count";
    private static int maxNameLengthExpected;
    private static int maxNameLengthFound;
    private static int maxCountLength;
    private final GuiSchematicVerifier guiSchematicVerifier;
    private final WidgetListSchematicVerificationResults listWidget;
    private final SchematicVerifier verifier;
    private final GuiSchematicVerifier.BlockMismatchEntry mismatchEntry;
    @Nullable
    private final String header1;
    @Nullable
    private final String header2;
    @Nullable
    private final String header3;
    @Nullable
    private final BlockMismatchInfo mismatchInfo;
    private final int count;
    private final boolean isOdd;
    @Nullable
    private final ButtonGeneric buttonIgnore;

    public WidgetSchematicVerificationResult(int x, int y, int width, int height, boolean isOdd, WidgetListSchematicVerificationResults listWidget, GuiSchematicVerifier guiSchematicVerifier, GuiSchematicVerifier.BlockMismatchEntry entry, int listIndex) {
        super(x, y, width, height, (Object)entry, listIndex);
        this.columnCount = 3;
        this.mismatchEntry = entry;
        this.guiSchematicVerifier = guiSchematicVerifier;
        this.listWidget = listWidget;
        this.verifier = guiSchematicVerifier.getPlacement().getSchematicVerifier();
        this.isOdd = isOdd;
        if (entry.header1 != null && entry.header2 != null) {
            this.header1 = entry.header1;
            this.header2 = entry.header2;
            this.header3 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADER_COUNT, (Object[])new Object[0]) + GuiBase.TXT_RST;
            this.mismatchInfo = null;
            this.count = 0;
            this.buttonIgnore = null;
        } else if (entry.header1 != null) {
            this.header1 = entry.header1;
            this.header2 = null;
            this.header3 = null;
            this.mismatchInfo = null;
            this.count = 0;
            this.buttonIgnore = null;
        } else {
            this.header1 = null;
            this.header2 = null;
            this.header3 = null;
            this.mismatchInfo = new BlockMismatchInfo(entry.blockMismatch.stateExpected(), entry.blockMismatch.stateFound());
            this.count = entry.blockMismatch.count();
            this.buttonIgnore = entry.mismatchType != SchematicVerifier.MismatchType.CORRECT_STATE ? this.createButton(this.x + this.width, y + 1, ButtonListener.ButtonType.IGNORE_MISMATCH) : null;
        }
    }

    public static void setMaxNameLengths(List<SchematicVerifier.BlockMismatch> mismatches) {
        maxNameLengthExpected = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADER_EXPECTED, (Object[])new Object[0]) + GuiBase.TXT_RST));
        maxNameLengthFound = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADER_FOUND, (Object[])new Object[0]) + GuiBase.TXT_RST));
        maxCountLength = 7 * StringUtils.getStringWidth((String)"8");
        for (SchematicVerifier.BlockMismatch entry : mismatches) {
            ItemStack stack = ItemUtils.getItemForState(entry.stateExpected());
            String name = BlockMismatchInfo.getDisplayName(entry.stateExpected(), stack);
            maxNameLengthExpected = Math.max(maxNameLengthExpected, StringUtils.getStringWidth((String)name));
            stack = ItemUtils.getItemForState(entry.stateFound());
            name = BlockMismatchInfo.getDisplayName(entry.stateFound(), stack);
            maxNameLengthFound = Math.max(maxNameLengthFound, StringUtils.getStringWidth((String)name));
        }
        maxCountLength = Math.max(maxCountLength, StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADER_COUNT, (Object[])new Object[0]) + GuiBase.TXT_RST)));
    }

    private ButtonGeneric createButton(int x, int y, ButtonListener.ButtonType type) {
        ButtonGeneric button = new ButtonGeneric(x, y, -1, true, type.getDisplayName(), new Object[0]);
        return (ButtonGeneric)this.addButton((ButtonBase)button, new ButtonListener(type, this.mismatchEntry, this.guiSchematicVerifier));
    }

    protected int getCurrentSortColumn() {
        return this.verifier.getSortCriteria().ordinal();
    }

    protected boolean getSortInReverse() {
        return this.verifier.getSortInReverse();
    }

    protected int getColumnPosX(int column) {
        int x1 = this.x + 4;
        int x2 = x1 + maxNameLengthExpected + 40;
        int x3 = x2 + maxNameLengthFound + 40;
        return switch (column) {
            case 0 -> x1;
            case 1 -> x2;
            case 2 -> x3;
            case 3 -> x3 + maxCountLength + 20;
            default -> x1;
        };
    }

    protected boolean onMouseClickedImpl(MouseButtonEvent click, boolean doubleClick) {
        if (super.onMouseClickedImpl(click, doubleClick)) {
            return true;
        }
        if (this.mismatchEntry.type != GuiSchematicVerifier.BlockMismatchEntry.Type.HEADER) {
            return false;
        }
        int column = this.getMouseOverColumn((int)click.x(), (int)click.y());
        switch (column) {
            case 0: {
                this.verifier.setSortCriteria(SchematicVerifier.SortCriteria.NAME_EXPECTED);
                break;
            }
            case 1: {
                this.verifier.setSortCriteria(SchematicVerifier.SortCriteria.NAME_FOUND);
                break;
            }
            case 2: {
                this.verifier.setSortCriteria(SchematicVerifier.SortCriteria.COUNT);
                break;
            }
            default: {
                return false;
            }
        }
        this.listWidget.refreshEntries();
        return true;
    }

    public boolean canSelectAt(MouseButtonEvent click) {
        return (this.buttonIgnore == null || click.x() < (double)this.buttonIgnore.getX()) && super.canSelectAt(click);
    }

    protected boolean shouldRenderAsSelected() {
        if (this.mismatchEntry.type == GuiSchematicVerifier.BlockMismatchEntry.Type.CATEGORY_TITLE) {
            return this.verifier.isMismatchCategorySelected(this.mismatchEntry.mismatchType);
        }
        if (this.mismatchEntry.type == GuiSchematicVerifier.BlockMismatchEntry.Type.DATA) {
            return this.verifier.isMismatchEntrySelected(this.mismatchEntry.blockMismatch);
        }
        return false;
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        selected = this.shouldRenderAsSelected();
        int color = -1607454672;
        if (selected) {
            color = -1603243920;
        } else if (this.isMouseOver(mouseX, mouseY)) {
            color = -1605349296;
        } else if (this.isOdd) {
            color = -1609560048;
        }
        fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)color);
        if (selected) {
            fi.dy.masa.malilib.render.RenderUtils.drawOutline((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-2039584);
        }
        int x1 = this.getColumnPosX(0);
        int x2 = this.getColumnPosX(1);
        int x3 = this.getColumnPosX(2);
        int y = this.y + 7;
        color = -1;
        if (this.header1 != null && this.header2 != null) {
            this.drawString(ctx, x1, y, color, this.header1);
            this.drawString(ctx, x2, y, color, this.header2);
            this.drawString(ctx, x3, y, color, this.header3);
            this.renderColumnHeader(ctx, mouseX, mouseY, Icons.ARROW_DOWN, Icons.ARROW_UP);
        } else if (this.header1 != null) {
            this.drawString(ctx, this.x + 4, this.y + 7, color, this.header1);
        } else if (!(this.mismatchInfo == null || this.mismatchEntry.mismatchType == SchematicVerifier.MismatchType.CORRECT_STATE && this.mismatchEntry.blockMismatch.stateExpected().isAir())) {
            boolean useBlockModelFound;
            this.drawString(ctx, x1 + 20, y, color, this.mismatchInfo.nameExpected);
            if (this.mismatchEntry.mismatchType != SchematicVerifier.MismatchType.CORRECT_STATE) {
                this.drawString(ctx, x2 + 20, y, color, this.mismatchInfo.nameFound);
            }
            this.drawString(ctx, x3, y, color, String.valueOf(this.count));
            y = this.y + 3;
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x1, (int)y, (int)16, (int)16, (int)0x20FFFFFF);
            boolean useBlockModelConfig = false;
            boolean hasModelExpected = this.mismatchInfo.stateExpected.getRenderShape() == RenderShape.MODEL;
            boolean hasModelFound = this.mismatchInfo.stateFound.getRenderShape() == RenderShape.MODEL;
            boolean isAirItemExpected = this.mismatchInfo.stackExpected.isEmpty();
            boolean isAirItemFound = this.mismatchInfo.stackFound.isEmpty();
            boolean useBlockModelExpected = hasModelExpected && (isAirItemExpected || useBlockModelConfig || this.mismatchInfo.stateExpected.getBlock() == Blocks.FLOWER_POT);
            boolean bl = useBlockModelFound = hasModelFound && (isAirItemFound || useBlockModelConfig || this.mismatchInfo.stateFound.getBlock() == Blocks.FLOWER_POT);
            if (useBlockModelExpected && fi.dy.masa.malilib.render.RenderUtils.stateModelHasQuads((BlockState)this.mismatchInfo.stateExpected)) {
                WidgetSchematicVerificationResult.renderModelInGui(ctx, x1, y, 1.0f, this.mismatchInfo.stateExpected);
            } else {
                ctx.renderItem(this.mismatchInfo.stackExpected, x1, y);
                ctx.renderItemDecorations(this.textRenderer, this.mismatchInfo.stackExpected, x1, y);
            }
            if (this.mismatchEntry.mismatchType != SchematicVerifier.MismatchType.CORRECT_STATE) {
                fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x2, (int)y, (int)16, (int)16, (int)0x20FFFFFF);
                if (useBlockModelFound && fi.dy.masa.malilib.render.RenderUtils.stateModelHasQuads((BlockState)this.mismatchInfo.stateFound)) {
                    WidgetSchematicVerificationResult.renderModelInGui(ctx, x2, y, 1.0f, this.mismatchInfo.stateFound);
                } else {
                    ctx.renderItem(this.mismatchInfo.stackFound, x2, y);
                    ctx.renderItemDecorations(this.textRenderer, this.mismatchInfo.stackFound, x2, y);
                }
            }
        }
        super.render(ctx, mouseX, mouseY, selected);
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.mismatchInfo != null && this.buttonIgnore != null && mouseX < this.buttonIgnore.getX()) {
            ctx.pose().pushMatrix();
            ctx.pose().translate(0.0f, 0.0f);
            int x = mouseX + 10;
            int y = mouseY;
            int width = this.mismatchInfo.getTotalWidth();
            int height = this.mismatchInfo.getTotalHeight();
            if (x + width > GuiUtils.getCurrentScreenWidth()) {
                x = mouseX - width - 10;
            }
            if (y + height > GuiUtils.getCurrentScreenHeight()) {
                y = mouseY - height - 2;
            }
            this.mismatchInfo.toggleUseBackgroundMask(true);
            this.mismatchInfo.render(ctx, x, y);
            ctx.pose().popMatrix();
        }
    }

    public static void renderModelInGui(GuiContext ctx, int x, int y, float z, BlockState state) {
        if (state.getBlock() == Blocks.AIR) {
            return;
        }
        int size = 16;
        float scale = 0.625f;
    }

    public static class BlockMismatchInfo {
        private final BlockState stateExpected;
        private final BlockState stateFound;
        private final ItemStack stackExpected;
        private final ItemStack stackFound;
        private final String blockRegistrynameExpected;
        private final String blockRegistrynameFound;
        private final String nameExpected;
        private final String nameFound;
        private final int totalWidth;
        private final int totalHeight;
        private final int columnWidthExpected;
        private boolean useBackgroundMask = false;

        public BlockMismatchInfo(BlockState stateExpected, BlockState stateFound) {
            this.stateExpected = stateExpected;
            this.stateFound = stateFound;
            this.stackExpected = ItemUtils.getItemForState(this.stateExpected);
            this.stackFound = ItemUtils.getItemForState(this.stateFound);
            Block blockExpected = this.stateExpected.getBlock();
            Block blockFound = this.stateFound.getBlock();
            Identifier rl1 = BuiltInRegistries.BLOCK.getKey((Object)blockExpected);
            Identifier rl2 = BuiltInRegistries.BLOCK.getKey((Object)blockFound);
            this.blockRegistrynameExpected = rl1 != null ? rl1.toString() : "<null>";
            this.blockRegistrynameFound = rl2 != null ? rl2.toString() : "<null>";
            this.nameExpected = BlockMismatchInfo.getDisplayName(stateExpected, this.stackExpected);
            this.nameFound = BlockMismatchInfo.getDisplayName(stateFound, this.stackFound);
            List propsExpected = BlockUtils.getFormattedBlockStateProperties((BlockState)this.stateExpected, (String)" = ");
            List propsFound = BlockUtils.getFormattedBlockStateProperties((BlockState)this.stateFound, (String)" = ");
            int w1 = Math.max(StringUtils.getStringWidth((String)this.nameExpected) + 20, StringUtils.getStringWidth((String)this.blockRegistrynameExpected));
            int w2 = Math.max(StringUtils.getStringWidth((String)this.nameFound) + 20, StringUtils.getStringWidth((String)this.blockRegistrynameFound));
            w1 = Math.max(w1, RenderUtils.getMaxStringRenderLength(propsExpected));
            w2 = Math.max(w2, RenderUtils.getMaxStringRenderLength(propsFound));
            this.columnWidthExpected = w1;
            this.totalWidth = this.columnWidthExpected + w2 + 40;
            this.totalHeight = Math.max(propsExpected.size(), propsFound.size()) * (StringUtils.getFontHeight() + 2) + 60;
        }

        public static String getDisplayName(BlockState state, ItemStack stack) {
            String name;
            Block block = state.getBlock();
            String key = block.getDescriptionId() + ".name";
            name = !key.equals(name = StringUtils.translate((String)key, (Object[])new Object[0])) ? name : stack.getHoverName().getString();
            return name;
        }

        public int getTotalWidth() {
            return this.totalWidth;
        }

        public int getTotalHeight() {
            return this.totalHeight;
        }

        public void toggleUseBackgroundMask(boolean toggle) {
            this.useBackgroundMask = toggle;
        }

        public void render(GuiContext ctx, int x, int y) {
            if (this.stateExpected != null && this.stateFound != null) {
                if (this.useBackgroundMask) {
                    RenderUtils.renderBackgroundMask(ctx, x + 1, y + 1, this.totalWidth - 1, this.totalHeight - 1);
                }
                fi.dy.masa.malilib.render.RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)x, (int)y, (int)this.totalWidth, (int)this.totalHeight, (int)-16777216, (int)-6710887);
                int x1 = x + 10;
                int x2 = x + this.columnWidthExpected + 30;
                String pre = GuiBase.TXT_WHITE + GuiBase.TXT_BOLD;
                String strExpected = pre + StringUtils.translate((String)WidgetSchematicVerificationResult.HEADER_EXPECTED, (Object[])new Object[0]) + GuiBase.TXT_RST;
                String strFound = pre + StringUtils.translate((String)WidgetSchematicVerificationResult.HEADER_FOUND, (Object[])new Object[0]) + GuiBase.TXT_RST;
                ctx.drawString(ctx.fontRenderer(), strExpected, x1, y += 4, -1, false);
                ctx.drawString(ctx.fontRenderer(), strFound, x2, y, -1, false);
                y += 12;
                boolean useBlockModelConfig = false;
                boolean hasModelExpected = this.stateExpected.getRenderShape() == RenderShape.MODEL;
                boolean hasModelFound = this.stateFound.getRenderShape() == RenderShape.MODEL;
                boolean isAirItemExpected = this.stackExpected.isEmpty();
                boolean isAirItemFound = this.stackFound.isEmpty();
                boolean useBlockModelExpected = hasModelExpected && (isAirItemExpected || useBlockModelConfig || this.stateExpected.getBlock() == Blocks.FLOWER_POT);
                boolean useBlockModelFound = hasModelFound && (isAirItemFound || useBlockModelConfig || this.stateFound.getBlock() == Blocks.FLOWER_POT);
                fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x1, (int)y, (int)16, (int)16, (int)0x50C0C0C0);
                fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x2, (int)y, (int)16, (int)16, (int)0x50C0C0C0);
                int iconY = y;
                ctx.drawString(ctx.fontRenderer(), this.nameExpected, x1 + 20, y + 4, -1, false);
                ctx.drawString(ctx.fontRenderer(), this.nameFound, x2 + 20, y + 4, -1, false);
                ctx.drawString(ctx.fontRenderer(), this.blockRegistrynameExpected, x1, y += 20, -12558081, false);
                ctx.drawString(ctx.fontRenderer(), this.blockRegistrynameFound, x2, y, -12558081, false);
                List propsExpected = BlockUtils.getFormattedBlockStateProperties((BlockState)this.stateExpected, (String)" = ");
                List propsFound = BlockUtils.getFormattedBlockStateProperties((BlockState)this.stateFound, (String)" = ");
                fi.dy.masa.malilib.render.RenderUtils.renderText((GuiContext)ctx, (int)x1, (int)(y += StringUtils.getFontHeight() + 4), (int)-5197648, (List)propsExpected);
                fi.dy.masa.malilib.render.RenderUtils.renderText((GuiContext)ctx, (int)x2, (int)y, (int)-5197648, (List)propsFound);
                if (useBlockModelExpected && fi.dy.masa.malilib.render.RenderUtils.stateModelHasQuads((BlockState)this.stateExpected)) {
                    WidgetSchematicVerificationResult.renderModelInGui(ctx, x1, iconY, 1.0f, this.stateExpected);
                } else {
                    ctx.renderItem(this.stackExpected, x1, iconY);
                    ctx.renderItemDecorations(ctx.fontRenderer(), this.stackExpected, x1, iconY);
                }
                if (useBlockModelFound) {
                    WidgetSchematicVerificationResult.renderModelInGui(ctx, x2, iconY, 1.0f, this.stateFound);
                } else {
                    ctx.renderItem(this.stackFound, x2, iconY);
                    ctx.renderItemDecorations(ctx.fontRenderer(), this.stackFound, x2, iconY);
                }
            }
        }
    }

    private record ButtonListener(ButtonType type, GuiSchematicVerifier.BlockMismatchEntry mismatchEntry, GuiSchematicVerifier guiSchematicVerifier) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == ButtonType.IGNORE_MISMATCH) {
                this.guiSchematicVerifier.getPlacement().getSchematicVerifier().ignoreStateMismatch(this.mismatchEntry.blockMismatch);
                this.guiSchematicVerifier.initGui();
            }
        }

        public static enum ButtonType {
            IGNORE_MISMATCH("litematica.gui.button.schematic_verifier.ignore");

            private final String translationKey;

            private ButtonType(String translationKey) {
                this.translationKey = translationKey;
            }

            public String getDisplayName() {
                return StringUtils.translate((String)this.translationKey, (Object[])new Object[0]);
            }
        }
    }
}

