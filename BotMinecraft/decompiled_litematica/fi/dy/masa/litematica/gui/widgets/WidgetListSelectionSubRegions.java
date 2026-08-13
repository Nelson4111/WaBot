/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.LeftRight
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetSearchBar
 *  fi.dy.masa.malilib.util.AlphaNumComparator$AlphaNumStringComparator
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorNormal;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetSelectionSubRegion;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.gui.widgets.WidgetSearchBar;
import fi.dy.masa.malilib.util.AlphaNumComparator;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

public class WidgetListSelectionSubRegions
extends WidgetListBase<String, WidgetSelectionSubRegion> {
    private final GuiAreaSelectionEditorNormal gui;
    private final AreaSelection selection;

    public WidgetListSelectionSubRegions(int x, int y, int width, int height, AreaSelection selection, GuiAreaSelectionEditorNormal gui) {
        super(x, y, width, height, (ISelectionListener)gui);
        this.gui = gui;
        this.selection = selection;
        this.browserEntryHeight = 22;
        this.widgetSearchBar = new WidgetSearchBar(x + 2, y + 4, width - 14, 14, 0, (IGuiIcon)Icons.FILE_ICON_SEARCH, LeftRight.LEFT);
        this.browserEntriesOffsetY = this.widgetSearchBar.getHeight() + 3;
        this.shouldSortList = true;
    }

    public GuiAreaSelectionEditorNormal getEditorGui() {
        return this.gui;
    }

    protected Collection<String> getAllEntries() {
        return this.selection.getAllSubRegionNames();
    }

    protected Comparator<String> getComparator() {
        return new AlphaNumComparator.AlphaNumStringComparator();
    }

    protected List<String> getEntryStringsForFilter(String entry) {
        return ImmutableList.of((Object)entry.toLowerCase());
    }

    protected WidgetSelectionSubRegion createListEntryWidget(int x, int y, int listIndex, boolean isOdd, String entry) {
        return new WidgetSelectionSubRegion(x, y, this.browserEntryWidth, this.browserEntryHeight, isOdd, entry, listIndex, this.selection, this);
    }
}

