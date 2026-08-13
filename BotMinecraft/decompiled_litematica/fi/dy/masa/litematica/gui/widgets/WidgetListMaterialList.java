/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.LeftRight
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.widgets.WidgetListBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetSearchBar
 *  fi.dy.masa.malilib.render.GuiContext
 *  javax.annotation.Nullable
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.item.ItemStack
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.gui.GuiMaterialList;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetMaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListSorter;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.gui.widgets.WidgetSearchBar;
import fi.dy.masa.malilib.render.GuiContext;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import javax.annotation.Nullable;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.ItemStack;

public class WidgetListMaterialList
extends WidgetListBase<MaterialListEntry, WidgetMaterialListEntry> {
    private static int lastScrollbarPosition;
    private final GuiMaterialList gui;
    private final MaterialListSorter sorter;
    private boolean scrollbarRestored;

    public WidgetListMaterialList(int x, int y, int width, int height, GuiMaterialList parent) {
        super(x, y, width, height, null);
        this.browserEntryHeight = 22;
        this.gui = parent;
        this.widgetSearchBar = new WidgetSearchBar(x + 2, y + 8, width - 16, 14, 0, (IGuiIcon)Icons.FILE_ICON_SEARCH, LeftRight.RIGHT);
        this.widgetSearchBar.setZLevel(1);
        this.sorter = new MaterialListSorter(parent.getMaterialList());
        this.shouldSortList = true;
    }

    public void drawContents(GuiContext ctx, int mouseX, int mouseY, float partialTicks) {
        super.drawContents(ctx, mouseX, mouseY, partialTicks);
        lastScrollbarPosition = this.scrollBar.getValue();
    }

    protected void offsetSelectionOrScrollbar(int amount, boolean changeSelection) {
        super.offsetSelectionOrScrollbar(amount, changeSelection);
        lastScrollbarPosition = this.scrollBar.getValue();
    }

    protected WidgetMaterialListEntry createHeaderWidget(int x, int y, int listIndexStart, int usableHeight, int usedHeight) {
        int height = this.browserEntryHeight;
        if (usedHeight + height > usableHeight) {
            return null;
        }
        return this.createListEntryWidget(x, y, listIndexStart, true, null);
    }

    protected Collection<MaterialListEntry> getAllEntries() {
        return this.gui.getMaterialList().getMaterialsFiltered(true);
    }

    protected Comparator<MaterialListEntry> getComparator() {
        return this.sorter;
    }

    protected List<String> getEntryStringsForFilter(MaterialListEntry entry) {
        ItemStack stack = entry.getStack();
        Identifier rl = BuiltInRegistries.ITEM.getKey((Object)stack.getItem());
        if (rl != null) {
            return ImmutableList.of((Object)stack.getHoverName().getString().toLowerCase(), (Object)rl.toString().toLowerCase());
        }
        return ImmutableList.of((Object)stack.getHoverName().getString().toLowerCase());
    }

    protected void refreshBrowserEntries() {
        super.refreshBrowserEntries();
        if (!this.scrollbarRestored && lastScrollbarPosition <= this.scrollBar.getMaxValue()) {
            this.scrollBar.setValue(lastScrollbarPosition);
            this.scrollbarRestored = true;
            this.reCreateListEntryWidgets();
        }
    }

    protected WidgetMaterialListEntry createListEntryWidget(int x, int y, int listIndex, boolean isOdd, @Nullable MaterialListEntry entry) {
        return new WidgetMaterialListEntry(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, this.gui.getMaterialList(), entry, listIndex, this);
    }
}

