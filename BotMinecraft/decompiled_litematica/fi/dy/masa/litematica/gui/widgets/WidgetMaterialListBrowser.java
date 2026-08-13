/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$FileFilter
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMaterialListBrowserBase;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.materials.MaterialListCustom;
import fi.dy.masa.litematica.materials.MaterialListPreview;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nullable;

public class WidgetMaterialListBrowser
extends WidgetFileBrowserBase {
    protected static final WidgetFileBrowserBase.FileFilter MATERIAL_LIST_FILTER = new FileFilterMaterials();
    protected final Map<Path, MaterialListPreview> cachedMetadata = new HashMap<Path, MaterialListPreview>();
    protected final GuiMaterialListBrowserBase parent;
    protected final int infoWidth;
    protected final int infoHeight;

    public WidgetMaterialListBrowser(int x, int y, int width, int height, GuiMaterialListBrowserBase parent, @Nullable ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> selectionListener) {
        super(x, y, width, height, DataManager.getDirectoryCache(), parent.getBrowserContext(), parent.getDefaultDirectory(), selectionListener, (IFileBrowserIconProvider)Icons.FILE_ICON_TEXT);
        this.title = StringUtils.translate((String)"litematica.gui.title.material_list_browser", (Object[])new Object[0]);
        this.infoWidth = 170;
        this.infoHeight = 310;
        this.parent = parent;
    }

    protected int getBrowserWidthForTotalWidth(int width) {
        return super.getBrowserWidthForTotalWidth(width) - this.infoWidth;
    }

    protected Path getRootDirectory() {
        return DataManager.getSchematicsBaseDirectory();
    }

    protected WidgetFileBrowserBase.FileFilter getFileFilter() {
        return MATERIAL_LIST_FILTER;
    }

    protected void drawAdditionalContents(GuiContext ctx, int mouseX, int mouseY) {
        this.drawSelectedMaterialListInfo(ctx, (WidgetFileBrowserBase.DirectoryEntry)this.getLastSelectedEntry());
    }

    protected void drawSelectedMaterialListInfo(GuiContext ctx, @Nullable WidgetFileBrowserBase.DirectoryEntry entry) {
        int x = this.posX + this.totalWidth - this.infoWidth;
        int y = this.posY;
        int height = Math.min(this.infoHeight, this.parent.getMaxInfoHeight());
        RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)x, (int)y, (int)this.infoWidth, (int)height, (int)-1610612736, (int)-6710887);
        if (entry == null) {
            return;
        }
        MaterialListPreview data = this.getMaterialListPreview(entry);
        if (data == null) {
            return;
        }
        int textColor = -1061109568;
        int valueColor = -1;
        String str = StringUtils.translate((String)"litematica.gui.label.material_list_info.title_colon", (Object[])new Object[0]);
        this.drawString(ctx, str, x += 3, y += 3, textColor);
        this.drawString(ctx, FileType.getString(data.type()), x + 4, y += 12, valueColor);
        str = StringUtils.translate((String)"litematica.gui.label.material_list_info.name", (Object[])new Object[0]);
        this.drawString(ctx, str, x, y += 12, textColor);
        this.drawString(ctx, data.name(), x + 4, y += 12, valueColor);
        str = StringUtils.translate((String)"litematica.gui.label.material_list_info.item_count", (Object[])new Object[0]);
        this.drawString(ctx, str, x, y += 12, textColor);
        str = String.format("%03d", data.itemCount());
        this.drawString(ctx, str, x + 4, y += 12, valueColor);
        y += 12;
    }

    public void clearMetadataCache() {
        this.cachedMetadata.clear();
    }

    @Nullable
    protected MaterialListPreview getMaterialListPreview(WidgetFileBrowserBase.DirectoryEntry entry) {
        MaterialListCustom data;
        Path file = entry.getDirectory().resolve(entry.getName());
        MaterialListPreview meta = this.cachedMetadata.get(file);
        if (meta == null && !this.cachedMetadata.containsKey(file) && (data = MaterialListCustom.fromFile(file)) != null) {
            meta = new MaterialListPreview(FileType.fromFile(file), data.getName(), data.getMaterialsAll().size());
            this.cachedMetadata.put(file, meta);
        }
        return meta;
    }

    public static class FileFilterMaterials
    extends WidgetFileBrowserBase.FileFilter {
        public boolean accept(Path pathName) {
            String name = pathName.getFileName().toString();
            return name.endsWith(".json") || name.endsWith(".txt");
        }
    }
}

