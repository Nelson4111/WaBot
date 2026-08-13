/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nonnull
 *  net.minecraft.world.entity.player.Player
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMaterialListSaveBase;
import fi.dy.masa.litematica.gui.widgets.WidgetMaterialListBrowser;
import fi.dy.masa.litematica.materials.MaterialListCustom;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import javax.annotation.Nonnull;
import net.minecraft.world.entity.player.Player;

public class GuiMaterialListSave
extends GuiMaterialListSaveBase
implements ICompletionListener {
    public GuiMaterialListSave(@Nonnull MaterialListCustom materialList) {
        super(materialList);
        this.title = StringUtils.translate((String)"litematica.gui.title.save_material_list", (Object[])new Object[0]);
        this.defaultText = materialList.getName().replaceAll("[^a-zA-Z0-9_\\-]", "_") + ".json";
    }

    @Override
    public String getBrowserContext() {
        return "material_list_save";
    }

    @Override
    public Path getDefaultDirectory() {
        return DataManager.getSchematicsBaseDirectory();
    }

    @Override
    protected IButtonActionListener createButtonListener(GuiMaterialListSaveBase.ButtonType type) {
        return new ButtonListener(type, this);
    }

    public void onTaskCompleted() {
        if (this.mc.isSameThread()) {
            this.refreshList();
        } else {
            this.mc.execute(this::refreshList);
        }
    }

    private void refreshList() {
        if (GuiUtils.getCurrentScreen() == this) {
            ((WidgetMaterialListBrowser)this.getListWidget()).refreshEntries();
            ((WidgetMaterialListBrowser)this.getListWidget()).clearMetadataCache();
        }
    }

    private record ButtonListener(GuiMaterialListSaveBase.ButtonType type, GuiMaterialListSave gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == GuiMaterialListSaveBase.ButtonType.SAVE) {
                Path dir = ((WidgetMaterialListBrowser)this.gui.getListWidget()).getCurrentDirectory();
                String fileName = this.gui.getTextFieldText();
                if (!Files.isDirectory(dir, new LinkOption[0])) {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.schematic_save.invalid_directory", new Object[]{dir.toAbsolutePath()});
                    return;
                }
                if (fileName.isEmpty()) {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.material_list_save.invalid_name", new Object[]{fileName});
                    return;
                }
                if (this.gui.materialList != null) {
                    Object customFileName = fileName;
                    boolean shiftDown = GuiBase.isShiftDown();
                    if (!((String)customFileName).endsWith(".json")) {
                        customFileName = (String)customFileName + ".json";
                    }
                    if (!FileUtils.canWriteToFileAsPath((Path)dir, (String)customFileName, (boolean)shiftDown)) {
                        this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.material_list_write_to_file_failed.exists", new Object[]{fileName});
                        return;
                    }
                    Path customFile = dir.resolve((String)customFileName);
                    if (this.gui.materialList.toJsonFile(customFile, shiftDown)) {
                        ((WidgetMaterialListBrowser)this.gui.getListWidget()).refreshEntries();
                        String key = "litematica.message.material_list_save.exported";
                        this.gui.addMessage(Message.MessageType.SUCCESS, key, new Object[]{customFile.getFileName().toString()});
                        if (this.gui.mc.player != null) {
                            StringUtils.sendOpenFileChatMessage((Player)this.gui.mc.player, (String)key, (File)customFile.toFile());
                        }
                    }
                } else {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.message.error.material_list_save", new Object[0]);
                }
            }
        }
    }
}

