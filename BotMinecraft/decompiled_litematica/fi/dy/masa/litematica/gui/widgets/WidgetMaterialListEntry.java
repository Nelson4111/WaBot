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
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.input.MouseButtonEvent
 *  net.minecraft.world.item.ItemStack
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListMaterialList;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.render.RenderUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntrySortable;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.world.item.ItemStack;

public class WidgetMaterialListEntry
extends WidgetListEntrySortable<MaterialListEntry> {
    private static final String[] HEADERS = new String[]{"litematica.gui.label.material_list.title.item", "litematica.gui.label.material_list.title.total", "litematica.gui.label.material_list.title.missing", "litematica.gui.label.material_list.title.available"};
    private static int maxNameLength;
    private static int maxCountLength1;
    private static int maxCountLength2;
    private static int maxCountLength3;
    private final MaterialListBase materialList;
    private final WidgetListMaterialList listWidget;
    @Nullable
    private final MaterialListEntry entry;
    @Nullable
    private final String header1;
    @Nullable
    private final String header2;
    @Nullable
    private final String header3;
    @Nullable
    private final String header4;
    private final String shulkerBoxAbbr;
    private final boolean isOdd;

    public WidgetMaterialListEntry(int x, int y, int width, int height, boolean isOdd, MaterialListBase materialList, @Nullable MaterialListEntry entry, int listIndex, WidgetListMaterialList listWidget) {
        super(x, y, width, height, (Object)entry, listIndex);
        this.columnCount = 4;
        this.entry = entry;
        this.isOdd = isOdd;
        this.listWidget = listWidget;
        this.materialList = materialList;
        this.shulkerBoxAbbr = StringUtils.translate((String)"litematica.gui.label.material_list.abbr.shulker_box", (Object[])new Object[0]);
        if (this.entry != null) {
            this.header1 = null;
            this.header2 = null;
            this.header3 = null;
            this.header4 = null;
        } else {
            this.header1 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[0], (Object[])new Object[0]) + GuiBase.TXT_RST;
            this.header2 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[1], (Object[])new Object[0]) + GuiBase.TXT_RST;
            this.header3 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[2], (Object[])new Object[0]) + GuiBase.TXT_RST;
            this.header4 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[3], (Object[])new Object[0]) + GuiBase.TXT_RST;
        }
        int posX = x + width;
        int posY = y + 1;
        posX = this.createButtonGeneric(posX, posY, ButtonListener.ButtonType.IGNORE);
    }

    private int createButtonGeneric(int xRight, int y, ButtonListener.ButtonType type) {
        String label = type.getDisplayName();
        ButtonListener listener = new ButtonListener(type, this.materialList, this.entry, this.listWidget);
        return ((ButtonGeneric)this.addButton((ButtonBase)new ButtonGeneric(xRight, y, -1, true, label, new Object[0]), listener)).getX();
    }

    public static void setMaxNameLength(List<MaterialListEntry> materials, int multiplier) {
        maxNameLength = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[0], (Object[])new Object[0]) + GuiBase.TXT_RST));
        maxCountLength1 = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[1], (Object[])new Object[0]) + GuiBase.TXT_RST));
        maxCountLength2 = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[2], (Object[])new Object[0]) + GuiBase.TXT_RST));
        maxCountLength3 = StringUtils.getStringWidth((String)(GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[3], (Object[])new Object[0]) + GuiBase.TXT_RST));
        for (MaterialListEntry entry : materials) {
            int countTotal = entry.getCountTotal() * multiplier;
            int countMissing = multiplier == 1 ? entry.getCountMissing() : countTotal;
            maxNameLength = Math.max(maxNameLength, StringUtils.getStringWidth((String)entry.getStack().getHoverName().getString()));
            maxCountLength1 = Math.max(maxCountLength1, StringUtils.getStringWidth((String)String.valueOf(countTotal)));
            maxCountLength2 = Math.max(maxCountLength2, StringUtils.getStringWidth((String)String.valueOf(countMissing)));
            maxCountLength3 = Math.max(maxCountLength3, StringUtils.getStringWidth((String)String.valueOf(entry.getCountAvailable())));
        }
    }

    public boolean canSelectAt(MouseButtonEvent click) {
        return false;
    }

    protected int getCurrentSortColumn() {
        return this.materialList.getSortCriteria().ordinal();
    }

    protected boolean getSortInReverse() {
        return this.materialList.getSortInReverse();
    }

    protected int getColumnPosX(int column) {
        int x1 = this.x + 4;
        int x2 = x1 + maxNameLength + 40;
        int x3 = x2 + maxCountLength1 + 20;
        int x4 = x3 + maxCountLength2 + 20;
        return switch (column) {
            case 0 -> x1;
            case 1 -> x2;
            case 2 -> x3;
            case 3 -> x4;
            case 4 -> x4 + maxCountLength3 + 20;
            default -> x1;
        };
    }

    protected boolean onMouseClickedImpl(MouseButtonEvent click, boolean doubleClick) {
        if (super.onMouseClickedImpl(click, doubleClick)) {
            return true;
        }
        if (this.entry != null) {
            return false;
        }
        int column = this.getMouseOverColumn((int)click.x(), (int)click.y());
        switch (column) {
            case 0: {
                MaterialListBase.SortCriteria currentCriteria = this.materialList.getSortCriteria();
                if (currentCriteria == MaterialListBase.SortCriteria.NAME) {
                    this.materialList.setSortCriteria(MaterialListBase.SortCriteria.CACHE_ORDER);
                    break;
                }
                if (currentCriteria == MaterialListBase.SortCriteria.CACHE_ORDER) {
                    if (!this.materialList.getSortInReverse()) {
                        this.materialList.setSortCriteria(MaterialListBase.SortCriteria.CACHE_ORDER);
                        break;
                    }
                    this.materialList.setSortCriteria(MaterialListBase.SortCriteria.NAME);
                    break;
                }
                this.materialList.setSortCriteria(MaterialListBase.SortCriteria.NAME);
                break;
            }
            case 1: {
                this.materialList.setSortCriteria(MaterialListBase.SortCriteria.COUNT_TOTAL);
                break;
            }
            case 2: {
                this.materialList.setSortCriteria(MaterialListBase.SortCriteria.COUNT_MISSING);
                break;
            }
            case 3: {
                this.materialList.setSortCriteria(MaterialListBase.SortCriteria.COUNT_AVAILABLE);
                break;
            }
            default: {
                return false;
            }
        }
        this.listWidget.refreshEntries();
        return true;
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.header1 == null && (selected || this.isMouseOver(mouseX, mouseY))) {
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1603243920);
        } else if (this.isOdd) {
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1609560048);
        } else {
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1607454672);
        }
        int x1 = this.getColumnPosX(0);
        int x2 = this.getColumnPosX(1);
        int x3 = this.getColumnPosX(2);
        int x4 = this.getColumnPosX(3);
        int y = this.y + 7;
        int color = -1;
        if (this.header1 != null) {
            if (!this.listWidget.getSearchBarWidget().isSearchOpen()) {
                this.drawString(ctx, x1, y, color, this.header1);
                this.drawString(ctx, x2, y, color, this.header2);
                this.drawString(ctx, x3, y, color, this.header3);
                this.drawString(ctx, x4, y, color, this.header4);
                this.renderColumnHeader(ctx, mouseX, mouseY, Icons.ARROW_DOWN, Icons.ARROW_UP);
            }
        } else if (this.entry != null) {
            int multiplier = this.materialList.getMultiplier();
            int countTotal = this.entry.getCountTotal() * multiplier;
            int countMissing = multiplier == 1 ? this.entry.getCountMissing() : countTotal;
            int countAvailable = this.entry.getCountAvailable();
            String green = GuiBase.TXT_GREEN;
            String gold = GuiBase.TXT_GOLD;
            String red = GuiBase.TXT_RED;
            this.drawString(ctx, x1 + 20, y, color, this.entry.getStack().getHoverName().getString());
            this.drawString(ctx, x2, y, color, String.valueOf(countTotal));
            String pre = countMissing == 0 ? green : (countAvailable >= countMissing ? gold : red);
            this.drawString(ctx, x3, y, color, pre + String.valueOf(countMissing));
            pre = countAvailable >= countMissing ? green : red;
            this.drawString(ctx, x4, y, color, pre + String.valueOf(countAvailable));
            y = this.y + 3;
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x1, (int)y, (int)16, (int)16, (int)0x20FFFFFF);
            ctx.renderItem(this.entry.getStack(), x1, y);
            super.render(ctx, mouseX, mouseY, selected);
        }
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.entry != null) {
            ctx.pose().translate(0.0f, 0.0f);
            String header1 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[0], (Object[])new Object[0]);
            String header2 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[1], (Object[])new Object[0]);
            String header3 = GuiBase.TXT_BOLD + StringUtils.translate((String)HEADERS[2], (Object[])new Object[0]);
            ItemStack stack = this.entry.getStack();
            String stackName = stack.getHoverName().getString();
            int multiplier = this.materialList.getMultiplier();
            int total = this.entry.getCountTotal() * multiplier;
            int missing = multiplier == 1 ? this.entry.getCountMissing() : total;
            String strCountTotal = this.getFormattedCountString(total, stack.getMaxStackSize());
            String strCountMissing = this.getFormattedCountString(missing, stack.getMaxStackSize());
            int w1 = Math.max(this.getStringWidth(header1), Math.max(this.getStringWidth(header2), this.getStringWidth(header3)));
            int w2 = Math.max(this.getStringWidth(stackName) + 20, Math.max(this.getStringWidth(strCountTotal), this.getStringWidth(strCountMissing)));
            int totalWidth = w1 + w2 + 60;
            int x = mouseX + 10;
            int y = mouseY - 10;
            if (x + totalWidth - 20 >= this.width) {
                x -= totalWidth + 20;
            }
            int x1 = x + 10;
            int x2 = x1 + w1 + 20;
            RenderUtils.renderBackgroundMask(ctx, x + 1, y + 1, totalWidth - 2, 58);
            fi.dy.masa.malilib.render.RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)x, (int)y, (int)totalWidth, (int)60, (int)-16777216, (int)-6710887);
            int y1 = y += 6;
            this.drawString(ctx, x1, y += 4, -1, header1);
            this.drawString(ctx, x2 + 20, y, -1, stackName);
            this.drawString(ctx, x1, y += 16, -1, header2);
            this.drawString(ctx, x2, y, -1, strCountTotal);
            this.drawString(ctx, x1, y += 16, -1, header3);
            this.drawString(ctx, x2, y, -1, strCountMissing);
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x2, (int)y1, (int)16, (int)16, (int)0x20FFFFFF);
            ctx.renderItem(stack, x2, y1);
        }
    }

    private String getFormattedCountString(int total, int maxStackSize) {
        int stacks = total / maxStackSize;
        int remainder = total % maxStackSize;
        double boxCount = (double)total / (27.0 * (double)maxStackSize);
        String strCount = total > maxStackSize ? (maxStackSize > 1 ? (remainder > 0 ? String.format("%d = %d x %d + %d = %.2f %s", total, stacks, maxStackSize, remainder, boxCount, this.shulkerBoxAbbr) : String.format("%d = %d x %d = %.2f %s", total, stacks, maxStackSize, boxCount, this.shulkerBoxAbbr)) : String.format("%d = %.2f %s", total, boxCount, this.shulkerBoxAbbr)) : String.format("%d", total);
        return strCount;
    }

    record ButtonListener(ButtonType type, MaterialListBase materialList, MaterialListEntry entry, WidgetListMaterialList listWidget) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == ButtonType.IGNORE) {
                this.materialList.ignoreEntry(this.entry);
                this.listWidget.refreshEntries();
            }
        }

        public static enum ButtonType {
            IGNORE("litematica.gui.button.material_list.ignore");

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

