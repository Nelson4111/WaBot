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
 *  fi.dy.masa.malilib.util.AlphaNumComparator
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.gui.GuiPlacementConfiguration;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetPlacementSubRegion;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.gui.widgets.WidgetSearchBar;
import fi.dy.masa.malilib.util.AlphaNumComparator;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

public class WidgetListPlacementSubRegions
extends WidgetListBase<SubRegionPlacement, WidgetPlacementSubRegion> {
    private final GuiPlacementConfiguration parent;

    public WidgetListPlacementSubRegions(int x, int y, int width, int height, GuiPlacementConfiguration parent) {
        super(x, y, width, height, (ISelectionListener)parent);
        this.parent = parent;
        this.browserEntryHeight = 22;
        this.widgetSearchBar = new WidgetSearchBar(x + 2, y + 4, width - 14, 14, 0, (IGuiIcon)Icons.FILE_ICON_SEARCH, LeftRight.LEFT);
        this.browserEntriesOffsetY = this.widgetSearchBar.getHeight() + 3;
        this.shouldSortList = true;
    }

    public GuiPlacementConfiguration getParentGui() {
        return this.parent;
    }

    protected Collection<SubRegionPlacement> getAllEntries() {
        return this.parent.getSchematicPlacement().getAllSubRegionsPlacements();
    }

    protected Comparator<SubRegionPlacement> getComparator() {
        return new PlacementComparator();
    }

    protected List<String> getEntryStringsForFilter(SubRegionPlacement entry) {
        return ImmutableList.of((Object)entry.getName().toLowerCase());
    }

    protected WidgetPlacementSubRegion createListEntryWidget(int x, int y, int listIndex, boolean isOdd, SubRegionPlacement entry) {
        return new WidgetPlacementSubRegion(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, this.parent.getSchematicPlacement(), entry, listIndex, this);
    }

    protected static class PlacementComparator
    extends AlphaNumComparator
    implements Comparator<SubRegionPlacement> {
        protected PlacementComparator() {
        }

        @Override
        public int compare(SubRegionPlacement placement1, SubRegionPlacement placement2) {
            return this.compare(placement1.getName(), placement2.getName());
        }
    }
}

