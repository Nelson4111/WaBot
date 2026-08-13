/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.gui.widgets.WidgetSchematicBrowser;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import java.nio.file.Path;
import javax.annotation.Nullable;

public abstract class GuiSchematicBrowserBase
extends GuiListBase<WidgetFileBrowserBase.DirectoryEntry, WidgetDirectoryEntry, WidgetSchematicBrowser> {
    public GuiSchematicBrowserBase(int browserX, int browserY) {
        super(browserX, browserY);
    }

    protected WidgetSchematicBrowser createListWidget(int listX, int listY) {
        return new WidgetSchematicBrowser(listX, listY, 100, 100, this, this.getSelectionListener());
    }

    public abstract String getBrowserContext();

    public abstract Path getDefaultDirectory();

    @Nullable
    protected ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> getSelectionListener() {
        return null;
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 70;
    }

    public int getMaxInfoHeight() {
        return this.getBrowserHeight();
    }
}

