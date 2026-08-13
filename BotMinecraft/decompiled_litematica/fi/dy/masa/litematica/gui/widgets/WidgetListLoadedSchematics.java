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
 *  fi.dy.masa.malilib.util.FileUtils
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.data.SchematicHolder;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicEntry;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.gui.widgets.WidgetSearchBar;
import fi.dy.masa.malilib.util.FileUtils;
import java.util.Collection;
import java.util.List;
import javax.annotation.Nullable;

public class WidgetListLoadedSchematics
extends WidgetListBase<LitematicaSchematic, WidgetSchematicEntry> {
    public WidgetListLoadedSchematics(int x, int y, int width, int height, @Nullable ISelectionListener<LitematicaSchematic> selectionListener) {
        super(x, y, width, height, selectionListener);
        this.browserEntryHeight = 22;
        this.widgetSearchBar = new WidgetSearchBar(x + 2, y + 4, width - 14, 14, 0, (IGuiIcon)Icons.FILE_ICON_SEARCH, LeftRight.LEFT);
        this.browserEntriesOffsetY = this.widgetSearchBar.getHeight() + 3;
    }

    protected Collection<LitematicaSchematic> getAllEntries() {
        return SchematicHolder.getInstance().getAllSchematics();
    }

    protected List<String> getEntryStringsForFilter(LitematicaSchematic entry) {
        String metaName = entry.getMetadata().getName().toLowerCase();
        if (entry.getFile() != null) {
            String fileName = FileUtils.getNameWithoutExtension((String)entry.getFile().getFileName().toString().toLowerCase());
            return ImmutableList.of((Object)metaName, (Object)fileName);
        }
        return ImmutableList.of((Object)metaName);
    }

    protected WidgetSchematicEntry createListEntryWidget(int x, int y, int listIndex, boolean isOdd, LitematicaSchematic entry) {
        return new WidgetSchematicEntry(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, entry, listIndex, this);
    }
}

