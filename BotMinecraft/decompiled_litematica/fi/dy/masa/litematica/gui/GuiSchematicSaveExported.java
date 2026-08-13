/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntryType
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.util.FileNameUtils
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.StringUtils
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiSchematicManager;
import fi.dy.masa.litematica.gui.GuiSchematicSaveBase;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicBrowser;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.litematica.util.WorldUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.util.FileNameUtils;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;

public class GuiSchematicSaveExported
extends GuiSchematicSaveBase {
    private final GuiSchematicManager.ExportType exportType;
    private final WidgetFileBrowserBase.DirectoryEntryType type;
    private final Path dirSource;
    private final String inputFileName;

    public GuiSchematicSaveExported(WidgetFileBrowserBase.DirectoryEntryType type, Path dirSource, String inputFileName, GuiSchematicManager.ExportType exportType) {
        super(null);
        this.exportType = exportType;
        this.type = type;
        this.dirSource = dirSource;
        this.inputFileName = inputFileName;
        this.defaultText = FileUtils.getNameWithoutExtension((String)inputFileName);
        this.title = StringUtils.translate((String)"litematica.gui.title.save_exported_schematic", (Object[])new Object[]{exportType.getDisplayName(), inputFileName});
        this.useTitleHierarchy = false;
    }

    @Override
    public String getBrowserContext() {
        return "schematic_save_exported";
    }

    @Override
    public Path getDefaultDirectory() {
        return DataManager.getSchematicsBaseDirectory();
    }

    @Override
    protected IButtonActionListener createButtonListener(GuiSchematicSaveBase.ButtonType type) {
        return new ButtonListener(type, this);
    }

    private record ButtonListener(GuiSchematicSaveBase.ButtonType type, GuiSchematicSaveExported gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == GuiSchematicSaveBase.ButtonType.SAVE) {
                Path dir = ((WidgetSchematicBrowser)this.gui.getListWidget()).getCurrentDirectory();
                String fileName = FileNameUtils.generateSimpleUnicodeSafeFileName((String)this.gui.getTextFieldText());
                if (FileNameUtils.doesFileNameContainIllegalCharacters((String)fileName)) {
                    fileName = FileNameUtils.generateSafeFileName((String)fileName);
                }
                if (!Files.isDirectory(dir, new LinkOption[0])) {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.schematic_save.invalid_directory", new Object[]{dir.toAbsolutePath()});
                    return;
                }
                if (fileName.isEmpty()) {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.schematic_save.invalid_schematic_name", new Object[]{fileName});
                    return;
                }
                if (this.gui.type == WidgetFileBrowserBase.DirectoryEntryType.FILE) {
                    FileType fileType;
                    Path inDir = this.gui.dirSource;
                    String inFile = FileNameUtils.generateSimpleUnicodeSafeFileName((String)this.gui.inputFileName);
                    boolean override = GuiBase.isShiftDown();
                    boolean ignoreEntities = this.gui.checkboxIgnoreEntities.isChecked();
                    if (FileNameUtils.doesFileNameContainIllegalCharacters((String)inFile)) {
                        inFile = FileNameUtils.generateSafeFileName((String)inFile);
                    }
                    if ((fileType = FileType.fromFile(inDir.resolve(inFile))) == FileType.LITEMATICA_SCHEMATIC) {
                        if (this.gui.exportType == GuiSchematicManager.ExportType.V6_LITEMATIC) {
                            if (WorldUtils.convertLitematicaSchematicToV6LitematicaSchematic(inDir, inFile, dir, fileName, ignoreEntities, override, (IStringConsumer)this.gui)) {
                                this.gui.addMessage(Message.MessageType.SUCCESS, "litematica.message.litematic_downgrade_exported_as", new Object[]{fileName});
                                ((WidgetSchematicBrowser)this.gui.getListWidget()).refreshEntries();
                            }
                        } else if (this.gui.exportType == GuiSchematicManager.ExportType.SCHEMATIC) {
                            if (WorldUtils.convertLitematicaSchematicToSchematicaSchematic(inDir, inFile, dir, fileName, ignoreEntities, override, (IStringConsumer)this.gui)) {
                                this.gui.addMessage(Message.MessageType.SUCCESS, "litematica.message.schematic_exported_as", new Object[]{fileName});
                                ((WidgetSchematicBrowser)this.gui.getListWidget()).refreshEntries();
                            }
                        } else if (this.gui.exportType == GuiSchematicManager.ExportType.VANILLA && WorldUtils.convertLitematicaSchematicToVanillaStructure(inDir, inFile, dir, fileName, ignoreEntities, override, (IStringConsumer)this.gui)) {
                            this.gui.addMessage(Message.MessageType.SUCCESS, "litematica.message.schematic_exported_as", new Object[]{fileName});
                            ((WidgetSchematicBrowser)this.gui.getListWidget()).refreshEntries();
                        }
                        return;
                    }
                }
                this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.schematic_export.unsupported_type", new Object[]{this.gui.inputFileName});
            }
        }
    }
}

