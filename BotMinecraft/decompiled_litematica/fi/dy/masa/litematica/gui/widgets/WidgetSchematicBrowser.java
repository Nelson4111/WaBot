/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.mojang.blaze3d.platform.NativeImage
 *  fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$FileFilter
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.Schema
 *  javax.annotation.Nullable
 *  net.minecraft.client.renderer.RenderPipelines
 *  net.minecraft.client.renderer.texture.AbstractTexture
 *  net.minecraft.client.renderer.texture.DynamicTexture
 *  net.minecraft.resources.Identifier
 *  org.apache.commons.codec.digest.DigestUtils
 *  org.apache.commons.lang3.tuple.Pair
 */
package fi.dy.masa.litematica.gui.widgets;

import com.mojang.blaze3d.platform.NativeImage;
import fi.dy.masa.litematica.Litematica;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiSchematicBrowserBase;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.materials.MaterialListCustom;
import fi.dy.masa.litematica.materials.MaterialListPreview;
import fi.dy.masa.litematica.schematic.LitematicaSchematic;
import fi.dy.masa.litematica.schematic.SchematicMetadata;
import fi.dy.masa.litematica.schematic.SchematicSchema;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.Schema;
import java.nio.file.Path;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nullable;
import net.minecraft.client.renderer.RenderPipelines;
import net.minecraft.client.renderer.texture.AbstractTexture;
import net.minecraft.client.renderer.texture.DynamicTexture;
import net.minecraft.resources.Identifier;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.tuple.Pair;

public class WidgetSchematicBrowser
extends WidgetFileBrowserBase {
    protected static final WidgetFileBrowserBase.FileFilter SCHEMATIC_FILTER = new FileFilterSchematics();
    protected final Map<Path, SchematicMetadata> cachedMetadata = new HashMap<Path, SchematicMetadata>();
    protected final Map<Path, SchematicSchema> cachedVersion = new HashMap<Path, SchematicSchema>();
    protected final Map<Path, Pair<Identifier, DynamicTexture>> cachedPreviewImages = new HashMap<Path, Pair<Identifier, DynamicTexture>>();
    protected final Map<Path, MaterialListPreview> cachedMatsMetadata = new HashMap<Path, MaterialListPreview>();
    protected final GuiSchematicBrowserBase parent;
    protected final int infoWidth;
    protected final int infoHeight;

    public WidgetSchematicBrowser(int x, int y, int width, int height, GuiSchematicBrowserBase parent, @Nullable ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> selectionListener) {
        super(x, y, width, height, DataManager.getDirectoryCache(), parent.getBrowserContext(), parent.getDefaultDirectory(), selectionListener, (IFileBrowserIconProvider)Icons.FILE_ICON_LITEMATIC);
        this.title = StringUtils.translate((String)"litematica.gui.title.schematic_browser", (Object[])new Object[0]);
        this.infoWidth = 170;
        this.infoHeight = 310;
        this.parent = parent;
    }

    protected int getBrowserWidthForTotalWidth(int width) {
        return super.getBrowserWidthForTotalWidth(width) - this.infoWidth;
    }

    public void onClose() {
        super.onClose();
        this.clearPreviewImages();
    }

    protected Path getRootDirectory() {
        return DataManager.getSchematicsBaseDirectory();
    }

    protected WidgetFileBrowserBase.FileFilter getFileFilter() {
        return SCHEMATIC_FILTER;
    }

    protected void drawAdditionalContents(GuiContext ctx, int mouseX, int mouseY) {
        this.drawSelectedSchematicInfo(ctx, (WidgetFileBrowserBase.DirectoryEntry)this.getLastSelectedEntry());
    }

    protected void drawSelectedSchematicInfo(GuiContext ctx, @Nullable WidgetFileBrowserBase.DirectoryEntry entry) {
        int x = this.posX + this.totalWidth - this.infoWidth;
        int y = this.posY;
        int height = Math.min(this.infoHeight, this.parent.getMaxInfoHeight());
        RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)x, (int)y, (int)this.infoWidth, (int)height, (int)-1610612736, (int)-6710887);
        if (entry == null) {
            return;
        }
        FileType type = FileType.fromName(entry.getName());
        boolean matType = type == FileType.JSON || type == FileType.TEXT;
        boolean schemType = type == FileType.LITEMATICA_SCHEMATIC || type == FileType.SPONGE_SCHEMATIC || type == FileType.VANILLA_STRUCTURE;
        Pair<SchematicSchema, SchematicMetadata> metaPair = schemType ? this.getSchematicVersionAndMetadata(entry) : null;
        MaterialListPreview listData = matType ? this.getMaterialListPreview(entry) : null;
        SchematicMetadata meta = null;
        SchematicSchema version = null;
        if (metaPair != null) {
            meta = (SchematicMetadata)metaPair.getRight();
            version = (SchematicSchema)((Object)metaPair.getLeft());
        }
        if (meta == null && listData == null) {
            return;
        }
        if (meta != null) {
            Pair<Identifier, DynamicTexture> pair;
            int textColor = -1061109568;
            int valueColor = -1;
            String str = StringUtils.translate((String)"litematica.gui.label.schematic_info.name", (Object[])new Object[0]);
            this.drawString(ctx, str, x += 3, y += 3, textColor);
            this.drawString(ctx, meta.getName(), x + 4, y += 12, valueColor);
            str = StringUtils.translate((String)"litematica.gui.label.schematic_info.schematic_author", (Object[])new Object[]{meta.getAuthor()});
            this.drawString(ctx, str, x, y += 12, textColor);
            String strDate = DATE_FORMAT.format(new Date(meta.getTimeCreated()));
            str = StringUtils.translate((String)"litematica.gui.label.schematic_info.time_created", (Object[])new Object[]{strDate});
            this.drawString(ctx, str, x, y += 12, textColor);
            y += 12;
            if (meta.hasBeenModified()) {
                strDate = DATE_FORMAT.format(new Date(meta.getTimeModified()));
                str = StringUtils.translate((String)"litematica.gui.label.schematic_info.time_modified", (Object[])new Object[]{strDate});
                this.drawString(ctx, str, x, y, textColor);
                y += 12;
            }
            str = StringUtils.translate((String)"litematica.gui.label.schematic_info.region_count", (Object[])new Object[]{meta.getRegionCount()});
            this.drawString(ctx, str, x, y, textColor);
            y += 12;
            if (this.parent.getScreenHeight() >= 340) {
                str = StringUtils.translate((String)"litematica.gui.label.schematic_info.total_volume", (Object[])new Object[]{meta.getTotalVolume()});
                this.drawString(ctx, str, x, y, textColor);
                y += 12;
                if (meta.getTotalBlocks() > 0) {
                    str = StringUtils.translate((String)"litematica.gui.label.schematic_info.total_blocks", (Object[])new Object[]{meta.getTotalBlocks()});
                    this.drawString(ctx, str, x, y, textColor);
                    y += 12;
                }
                str = StringUtils.translate((String)"litematica.gui.label.schematic_info.enclosing_size", (Object[])new Object[0]);
                this.drawString(ctx, str, x, y, textColor);
                areaSize = meta.getEnclosingSize();
                tmp = String.format("%d x %d x %d", areaSize.getX(), areaSize.getY(), areaSize.getZ());
                this.drawString(ctx, tmp, x + 4, y += 12, valueColor);
                y += 12;
            } else {
                if (meta.getTotalBlocks() > 0) {
                    str = StringUtils.translate((String)"litematica.gui.label.schematic_info.total_blocks_and_volume", (Object[])new Object[]{meta.getTotalBlocks(), meta.getTotalVolume()});
                    this.drawString(ctx, str, x, y, textColor);
                    y += 12;
                } else {
                    str = StringUtils.translate((String)"litematica.gui.label.schematic_info.total_volume", (Object[])new Object[]{meta.getTotalVolume()});
                    this.drawString(ctx, str, x, y, textColor);
                    y += 12;
                }
                areaSize = meta.getEnclosingSize();
                tmp = String.format("%d x %d x %d", areaSize.getX(), areaSize.getY(), areaSize.getZ());
                str = StringUtils.translate((String)"litematica.gui.label.schematic_info.enclosing_size_value", (Object[])new Object[]{tmp});
                this.drawString(ctx, str, x, y, textColor);
                y += 12;
            }
            if (version != null) {
                switch (meta.getFileType()) {
                    case LITEMATICA_SCHEMATIC: {
                        str = StringUtils.translate((String)"litematica.gui.label.schematic_info.version", (Object[])new Object[]{version.litematicVersion()});
                        this.drawString(ctx, str, x, y, textColor);
                        y += 12;
                        break;
                    }
                    case SPONGE_SCHEMATIC: {
                        str = StringUtils.translate((String)"litematica.gui.label.schematic_info.sponge_version", (Object[])new Object[]{version.litematicVersion()});
                        this.drawString(ctx, str, x, y, textColor);
                        y += 12;
                        break;
                    }
                    case VANILLA_STRUCTURE: {
                        str = StringUtils.translate((String)"litematica.gui.label.schematic_info.vanilla_version", (Object[])new Object[0]);
                        this.drawString(ctx, str, x, y, textColor);
                        y += 12;
                    }
                }
                Schema schema = Schema.getSchemaByDataVersion((int)version.minecraftDataVersion());
                if (schema != null) {
                    str = version.minecraftDataVersion() - LitematicaSchematic.MINECRAFT_DATA_VERSION > 100 ? StringUtils.translate((String)"litematica.gui.label.schematic_info.schema.newer", (Object[])new Object[]{schema.getString(), version.minecraftDataVersion()}) : StringUtils.translate((String)"litematica.gui.label.schematic_info.schema", (Object[])new Object[]{schema.getString(), version.minecraftDataVersion()});
                    this.drawString(ctx, str, x, y, textColor);
                    y += 12;
                }
            }
            if ((pair = this.cachedPreviewImages.get(entry.getFullPath())) != null && ((DynamicTexture)pair.getRight()).getPixels() != null) {
                boolean needsScaling;
                y += 12;
                int iconSize = ((DynamicTexture)pair.getRight()).getPixels().getWidth();
                boolean bl = needsScaling = height < this.infoHeight;
                if (needsScaling) {
                    iconSize = height - y + this.posY - 6;
                }
                RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)(x + 4), (int)y, (int)iconSize, (int)iconSize, (int)-1610612736, (int)-6710887);
                ctx.blit(RenderPipelines.GUI_TEXTURED, (Identifier)pair.getLeft(), x + 4, y, 0.0f, 0.0f, iconSize, iconSize, iconSize, iconSize);
            }
        } else {
            int textColor = -1061109568;
            int valueColor = -1;
            String str = StringUtils.translate((String)"litematica.gui.label.material_list_info.title_colon", (Object[])new Object[0]);
            this.drawString(ctx, str, x += 3, y += 3, textColor);
            this.drawString(ctx, FileType.getString(listData.type()), x + 4, y += 12, valueColor);
            str = StringUtils.translate((String)"litematica.gui.label.material_list_info.name", (Object[])new Object[0]);
            this.drawString(ctx, str, x, y += 12, textColor);
            this.drawString(ctx, listData.name(), x + 4, y += 12, valueColor);
            str = StringUtils.translate((String)"litematica.gui.label.material_list_info.item_count", (Object[])new Object[0]);
            this.drawString(ctx, str, x, y += 12, textColor);
            str = String.format("%03d", listData.itemCount());
            this.drawString(ctx, str, x + 4, y += 12, valueColor);
            y += 12;
        }
    }

    public void clearSchematicMetadataCache() {
        this.clearPreviewImages();
        this.cachedMetadata.clear();
        this.cachedPreviewImages.clear();
        this.cachedVersion.clear();
        this.cachedMatsMetadata.clear();
    }

    @Deprecated
    @Nullable
    protected SchematicMetadata getSchematicMetadata(WidgetFileBrowserBase.DirectoryEntry entry) {
        Path file = entry.getDirectory().resolve(entry.name());
        SchematicMetadata meta = this.cachedMetadata.get(file);
        if (meta == null && !this.cachedMetadata.containsKey(file)) {
            if (entry.name().endsWith(".litematic") && (meta = LitematicaSchematic.readMetadataFromFile(entry.getDirectory(), entry.name())) != null) {
                this.createPreviewImage(file, meta);
            }
            this.cachedMetadata.put(file, meta);
        }
        return meta;
    }

    @Nullable
    protected Pair<SchematicSchema, SchematicMetadata> getSchematicVersionAndMetadata(WidgetFileBrowserBase.DirectoryEntry entry) {
        Pair<SchematicSchema, SchematicMetadata> pair;
        Path file = entry.getDirectory().resolve(entry.name());
        SchematicMetadata meta = this.cachedMetadata.get(file);
        SchematicSchema version = this.cachedVersion.get(file);
        if (meta == null && !this.cachedMetadata.containsKey(file) && (pair = LitematicaSchematic.readMetadataAndVersionFromFile(entry.getDirectory(), entry.name())) != null) {
            meta = (SchematicMetadata)pair.getRight();
            version = (SchematicSchema)((Object)pair.getLeft());
            if (entry.name().endsWith(".litematic")) {
                this.createPreviewImage(file, meta);
            }
            this.cachedMetadata.put(file, meta);
            this.cachedVersion.put(file, version);
        }
        return Pair.of((Object)((Object)version), (Object)meta);
    }

    @Nullable
    protected MaterialListPreview getMaterialListPreview(WidgetFileBrowserBase.DirectoryEntry entry) {
        MaterialListCustom data;
        Path file = entry.getDirectory().resolve(entry.getName());
        MaterialListPreview meta = this.cachedMatsMetadata.get(file);
        if (meta == null && !this.cachedMatsMetadata.containsKey(file) && (data = MaterialListCustom.fromFile(file)) != null) {
            meta = new MaterialListPreview(FileType.fromFile(file), data.getName(), data.getMaterialsAll().size());
            this.cachedMatsMetadata.put(file, meta);
        }
        return meta;
    }

    private void clearPreviewImages() {
        for (Pair<Identifier, DynamicTexture> pair : this.cachedPreviewImages.values()) {
            this.mc.getTextureManager().release((Identifier)pair.getLeft());
        }
    }

    private void createPreviewImage(Path file, SchematicMetadata meta) {
        int size;
        int[] previewImageData = meta.getPreviewImagePixelData();
        if (previewImageData != null && previewImageData.length > 0 && (size = (int)Math.sqrt(previewImageData.length)) * size == previewImageData.length) {
            try {
                NativeImage image = new NativeImage(size, size, false);
                Identifier rl = Identifier.fromNamespaceAndPath((String)"litematica", (String)DigestUtils.sha1Hex((String)file.toAbsolutePath().toString()));
                DynamicTexture tex = new DynamicTexture(() -> ((Identifier)rl).toString(), image);
                this.mc.getTextureManager().register(rl, (AbstractTexture)tex);
                int i = 0;
                for (int y = 0; y < size; ++y) {
                    for (int x = 0; x < size; ++x) {
                        int val = previewImageData[i++];
                        image.setPixel(x, y, val);
                    }
                }
                tex.upload();
                this.cachedPreviewImages.put(file, (Pair<Identifier, DynamicTexture>)Pair.of((Object)rl, (Object)tex));
            }
            catch (Exception e) {
                Litematica.LOGGER.warn("Failed to create a preview image", (Throwable)e);
            }
        }
    }

    public static class FileFilterSchematics
    extends WidgetFileBrowserBase.FileFilter {
        public boolean accept(Path pathName) {
            String name = pathName.getFileName().toString();
            return name.endsWith(".litematic") || name.endsWith(".schem") || name.endsWith(".schematic") || name.endsWith(".nbt") || name.endsWith(".json") || name.endsWith(".txt");
        }
    }
}

