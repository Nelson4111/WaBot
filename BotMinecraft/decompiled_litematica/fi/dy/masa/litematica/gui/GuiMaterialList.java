/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.data.DataDump
 *  fi.dy.masa.malilib.data.DataDump$Alignment
 *  fi.dy.masa.malilib.data.DataDump$Format
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.GuiTextFieldGeneric
 *  fi.dy.masa.malilib.gui.GuiTextFieldInteger
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.ButtonOnOff
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.ITextFieldListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetInfoIcon
 *  fi.dy.masa.malilib.gui.wrappers.TextFieldType
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.ItemType
 *  fi.dy.masa.malilib.util.time.TimeFormat
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.world.entity.player.Player
 *  net.minecraft.world.item.ItemStack
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.GuiMaterialListSave;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetListMaterialList;
import fi.dy.masa.litematica.gui.widgets.WidgetMaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialCache;
import fi.dy.masa.litematica.materials.MaterialListAreaAnalyzer;
import fi.dy.masa.litematica.materials.MaterialListBase;
import fi.dy.masa.litematica.materials.MaterialListCustom;
import fi.dy.masa.litematica.materials.MaterialListEntry;
import fi.dy.masa.litematica.materials.MaterialListHudRenderer;
import fi.dy.masa.litematica.materials.MaterialListJsonExporter;
import fi.dy.masa.litematica.materials.MaterialListSorter;
import fi.dy.masa.litematica.materials.MaterialListUtils;
import fi.dy.masa.litematica.materials.json.MaterialListJson;
import fi.dy.masa.litematica.materials.json.MaterialListJsonCache;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.malilib.data.DataDump;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.GuiTextFieldGeneric;
import fi.dy.masa.malilib.gui.GuiTextFieldInteger;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.ButtonOnOff;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ITextFieldListener;
import fi.dy.masa.malilib.gui.widgets.WidgetBase;
import fi.dy.masa.malilib.gui.widgets.WidgetInfoIcon;
import fi.dy.masa.malilib.gui.wrappers.TextFieldType;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.ItemType;
import fi.dy.masa.malilib.util.time.TimeFormat;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;

public class GuiMaterialList
extends GuiListBase<MaterialListEntry, WidgetMaterialListEntry, WidgetListMaterialList>
implements ICompletionListener {
    private final MaterialListBase materialList;

    public GuiMaterialList(MaterialListBase materialList) {
        super(10, 44);
        this.materialList = materialList;
        this.materialList.setCompletionListener(this);
        this.title = this.materialList.getTitle();
        this.useTitleHierarchy = false;
        MaterialListUtils.updateAvailableCounts(this.materialList.getMaterialsAll(), (Player)this.mc.player);
        WidgetMaterialListEntry.setMaxNameLength(materialList.getMaterialsAll(), materialList.getMultiplier());
        if (DataManager.getMaterialList() == null) {
            DataManager.setMaterialList(materialList);
        }
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 80;
    }

    public void initGui() {
        super.initGui();
        boolean isNarrow = this.getScreenWidth() < this.getElementTotalWidth();
        int x = 12;
        int y = 24;
        Object str = StringUtils.translate((String)"litematica.gui.label.material_list.multiplier", (Object[])new Object[0]);
        int w = this.getStringWidth((String)str);
        this.addLabel(this.getScreenWidth() - w - 56, y + 5, w, 12, -1, new String[]{str});
        GuiTextFieldInteger tf = new GuiTextFieldInteger(this.getScreenWidth() - 52, y + 2, 40, 16, this.font);
        tf.setValueWrapper(String.valueOf(this.materialList.getMultiplier()));
        MultiplierListener listener = new MultiplierListener(this.materialList, this);
        this.addTextField((GuiTextFieldGeneric)tf, listener, TextFieldType.STRING);
        this.addWidget((WidgetBase)new WidgetInfoIcon(this.getScreenWidth() - 23, 10, (IGuiIcon)Icons.INFO_11, "litematica.info.material_list", new Object[0]));
        int gap = 1;
        x += this.createButton(x, y, -1, ButtonListener.Type.REFRESH_LIST) + gap;
        if (this.materialList.supportsRenderLayers()) {
            x += this.createButton(x, y, -1, ButtonListener.Type.LIST_TYPE) + gap;
        }
        x += this.createButtonOnOff(x, y, -1, this.materialList.getHideAvailable(), ButtonListener.Type.HIDE_AVAILABLE) + gap;
        x += this.createButtonOnOff(x, y, -1, this.materialList.getHudRenderer().getShouldRenderCustom(), ButtonListener.Type.TOGGLE_INFO_HUD) + gap;
        if (isNarrow) {
            x = 12;
            y = this.getScreenHeight() - 22;
        }
        x += this.createButton(x, y, -1, ButtonListener.Type.CLEAR_IGNORED) + gap;
        x += this.createButton(x, y, -1, ButtonListener.Type.CLEAR_CACHE) + gap;
        x += this.createButton(x, y, -1, ButtonListener.Type.WRITE_TO_FILE) + gap;
        x += this.createButton(x, y, -1, ButtonListener.Type.WRITE_TO_JSON) + gap;
        x += this.createButton(x, y, -1, ButtonListener.Type.EXPORT) + gap;
        y += 22;
        y = this.getScreenHeight() - 36;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 20;
        x = this.getScreenWidth() - buttonWidth - 10;
        ButtonGeneric button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
        long total = this.materialList.getCountTotal();
        long missing = this.materialList.getCountMissing() - this.materialList.getCountMismatched();
        long mismatch = this.materialList.getCountMismatched();
        if (total != 0L && !(this.materialList instanceof MaterialListAreaAnalyzer)) {
            String strp;
            double pctDone = (double)(total - (missing + mismatch)) / (double)total * 100.0;
            double pctMissing = (double)missing / (double)total * 100.0;
            double pctMismatch = (double)mismatch / (double)total * 100.0;
            String strt = StringUtils.translate((String)"litematica.gui.label.material_list.total", (Object[])new Object[]{total});
            if (missing == 0L && mismatch == 0L) {
                strp = StringUtils.translate((String)"litematica.gui.label.material_list.progress.done", (Object[])new Object[]{String.format("%.0f %%%%", pctDone)});
            } else {
                String str1 = StringUtils.translate((String)"litematica.gui.label.material_list.progress.done", (Object[])new Object[]{String.format("%.1f %%%%", pctDone)});
                String str2 = StringUtils.translate((String)"litematica.gui.label.material_list.progress.missing", (Object[])new Object[]{String.format("%.1f %%%%", pctMissing)});
                String str3 = StringUtils.translate((String)"litematica.gui.label.material_list.progress.mismatch", (Object[])new Object[]{String.format("%.1f %%%%", pctMismatch)});
                strp = String.format("%s / %s / %s", str1, str2, str3);
            }
            str = strt + " / " + StringUtils.translate((String)"litematica.gui.label.material_list.progress", (Object[])new Object[]{strp});
            w = this.getStringWidth((String)str);
            this.addLabel(12, this.getScreenHeight() - 36, w, 12, -1, new String[]{str});
        }
        if (this.mc.player == null) {
            this.addMessage(Message.MessageType.WARNING, 3000, "litematica.message.warn.material_list.no_player_inv", new Object[0]);
        }
    }

    private int createButton(int x, int y, int width, ButtonListener.Type type) {
        ButtonListener listener = new ButtonListener(type, this);
        String label = type == ButtonListener.Type.LIST_TYPE ? type.getDisplayName(this.materialList.getMaterialListType().getDisplayName()) : type.getDisplayName(new Object[0]);
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, label, new String[0]);
        if (type == ButtonListener.Type.CLEAR_CACHE) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.material_list.clear_cache"});
        } else if (type == ButtonListener.Type.WRITE_TO_FILE) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.material_list.write_hold_shift_for_csv"});
        } else if (type == ButtonListener.Type.WRITE_TO_JSON) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.material_list.json_hold_shift_for_missing_only"});
        } else if (type == ButtonListener.Type.EXPORT) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.material_list.export_custom_json"});
        }
        this.addButton((ButtonBase)button, listener);
        return button.getWidth();
    }

    private int getElementTotalWidth() {
        int width = 0;
        width += this.getStringWidth(ButtonListener.Type.REFRESH_LIST.getDisplayName(new Object[0]));
        width += this.getStringWidth(ButtonListener.Type.LIST_TYPE.getDisplayName(this.materialList.getMaterialListType().getDisplayName()));
        width += this.getStringWidth(ButtonListener.Type.CLEAR_IGNORED.getDisplayName(new Object[0]));
        width += this.getStringWidth(ButtonListener.Type.CLEAR_CACHE.getDisplayName(new Object[0]));
        width += this.getStringWidth(ButtonListener.Type.WRITE_TO_FILE.getDisplayName(new Object[0]));
        width += this.getStringWidth(ButtonListener.Type.WRITE_TO_JSON.getDisplayName(new Object[0]));
        width += this.getStringWidth(ButtonListener.Type.EXPORT.getDisplayName(new Object[0]));
        width += new ButtonOnOff(0, 0, -1, false, ButtonListener.Type.HIDE_AVAILABLE.getTranslationKey(), false, new String[0]).getWidth();
        width += new ButtonOnOff(0, 0, -1, false, ButtonListener.Type.TOGGLE_INFO_HUD.getTranslationKey(), false, new String[0]).getWidth();
        width += this.getStringWidth(StringUtils.translate((String)"litematica.gui.label.material_list.multiplier", (Object[])new Object[0]));
        return width += 130;
    }

    private int createButtonOnOff(int x, int y, int width, boolean isCurrentlyOn, ButtonListener.Type type) {
        ButtonOnOff button = new ButtonOnOff(x, y, width, false, type.getTranslationKey(), isCurrentlyOn, new String[0]);
        this.addButton((ButtonBase)button, new ButtonListener(type, this));
        return button.getWidth();
    }

    public MaterialListBase getMaterialList() {
        return this.materialList;
    }

    public void onTaskCompleted() {
        if (GuiUtils.getCurrentScreen() == this) {
            WidgetMaterialListEntry.setMaxNameLength(this.materialList.getMaterialsAll(), this.materialList.getMultiplier());
            this.initGui();
        }
    }

    protected WidgetListMaterialList createListWidget(int listX, int listY) {
        return new WidgetListMaterialList(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), this);
    }

    private record MultiplierListener(MaterialListBase materialList, GuiMaterialList gui) implements ITextFieldListener<GuiTextFieldInteger>
    {
        public boolean onTextChange(GuiTextFieldInteger textField) {
            try {
                int multiplier = Integer.parseInt(textField.getValueWrapper());
                if (multiplier != this.materialList.getMultiplier()) {
                    this.materialList.setMultiplier(multiplier);
                    ((WidgetListMaterialList)this.gui.getListWidget()).refreshEntries();
                    return true;
                }
            }
            catch (Exception e) {
                this.materialList.setMultiplier(1);
                ((WidgetListMaterialList)this.gui.getListWidget()).refreshEntries();
            }
            return false;
        }
    }

    private record ButtonListener(Type type, GuiMaterialList parent) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            MaterialListBase materialList = this.parent.materialList;
            switch (this.type.ordinal()) {
                case 0: {
                    materialList.reCreateMaterialList();
                    break;
                }
                case 1: {
                    BlockInfoListType type = materialList.getMaterialListType();
                    materialList.setMaterialListType((BlockInfoListType)type.cycle(mouseButton == 0));
                    materialList.reCreateMaterialList();
                    break;
                }
                case 2: {
                    materialList.setHideAvailable(!materialList.getHideAvailable());
                    materialList.refreshPreFilteredList();
                    materialList.recreateFilteredList();
                    break;
                }
                case 3: {
                    MaterialListHudRenderer renderer = materialList.getHudRenderer();
                    renderer.toggleShouldRender();
                    if (materialList.getHudRenderer().getShouldRenderCustom()) {
                        InfoHud.getInstance().addInfoHudRenderer(renderer, true);
                        break;
                    }
                    InfoHud.getInstance().removeInfoHudRenderersOfType(renderer.getClass(), true);
                    break;
                }
                case 4: {
                    materialList.clearIgnored();
                    break;
                }
                case 5: {
                    MaterialCache.getInstance().clearCache();
                    this.parent.addMessage(Message.MessageType.SUCCESS, 3000, "litematica.message.material_list.material_cache_cleared", new Object[0]);
                    break;
                }
                case 6: {
                    Path file;
                    Path dir = FileUtils.getConfigDirectory().resolve("litematica");
                    boolean csv = GuiBase.isShiftDown();
                    boolean json = GuiBase.isAltDown();
                    if (json) {
                        MaterialListJsonExporter exporter = new MaterialListJsonExporter(materialList);
                        String fileName = "material_list_" + TimeFormat.REGULAR.formatNow() + ".json";
                        file = dir.resolve(fileName);
                        if (!exporter.writeCacheToFile(file, TimeFormat.RFC1123, Minecraft.getInstance())) {
                            file = null;
                        }
                    } else {
                        String ext = csv ? ".csv" : ".txt";
                        file = DataDump.dumpDataToFile((Path)dir, (String)"material_list", (String)ext, (List)this.getMaterialListDump(materialList, csv).getLines());
                    }
                    if (file == null) break;
                    String key = "litematica.message.material_list_written_to_file";
                    this.parent.addMessage(Message.MessageType.SUCCESS, key, new Object[]{file.getFileName().toString()});
                    if (this.parent.mc.player == null) break;
                    StringUtils.sendOpenFileChatMessage((Player)this.parent.mc.player, (String)key, (File)file.toFile());
                    break;
                }
                case 7: {
                    Minecraft mc = Minecraft.getInstance();
                    Path jsonDir = FileUtils.getConfigDirectory().resolve("litematica");
                    boolean missingOnly = GuiBase.isShiftDown();
                    boolean craftingOnly = GuiBase.isAltDown();
                    String dateExt = "_" + TimeFormat.REGULAR.formatNow();
                    String fileName = "raw_material_list_recipe_details" + (missingOnly ? "_missing_only" : "") + dateExt;
                    MaterialListJson jsonWriter = new MaterialListJson();
                    Path jsonFile = jsonDir.resolve(fileName + ".json");
                    MaterialListJsonCache cache = new MaterialListJsonCache();
                    if (!this.getMaterialListForJson(materialList, jsonWriter, cache, missingOnly, craftingOnly)) {
                        String key = "litematica.message.error.json_material_list_copy_failure";
                        this.parent.addMessage(Message.MessageType.ERROR, key, new Object[]{jsonFile.getFileName().toString()});
                        cache.clearAll();
                        jsonWriter.clear();
                        break;
                    }
                    if (Configs.Generic.MATERIAL_LIST_RECIPE_DETAILS.getBooleanValue() && !jsonWriter.writeRecipeDetailJson(jsonFile, mc)) {
                        String key = "litematica.message.error.json_material_list_failure";
                        this.parent.addMessage(Message.MessageType.ERROR, key, new Object[]{jsonFile.getFileName().toString()});
                        cache.clearAll();
                        jsonWriter.clear();
                        break;
                    }
                    fileName = "raw_material_list_recipe_steps" + (missingOnly ? "_missing_only" : "") + dateExt;
                    jsonFile = jsonDir.resolve(fileName + ".json");
                    if (!jsonWriter.writeCacheFlatJson(cache, jsonFile, mc)) {
                        String key = "litematica.message.error.json_material_list_failure";
                        this.parent.addMessage(Message.MessageType.ERROR, key, new Object[]{jsonFile.getFileName().toString()});
                        cache.clearAll();
                        jsonWriter.clear();
                        break;
                    }
                    fileName = "raw_material_list_simplified" + (missingOnly ? "_missing_only" : "") + dateExt;
                    jsonFile = jsonDir.resolve(fileName + ".json");
                    if (jsonWriter.writeCacheCombinedJson(cache, jsonFile, mc)) {
                        String key = "litematica.message.material_list_written_to_json_file";
                        this.parent.addMessage(Message.MessageType.SUCCESS, key, new Object[]{jsonFile.getFileName().toString()});
                        if (this.parent.mc.player != null) {
                            StringUtils.sendOpenFileChatMessage((Player)this.parent.mc.player, (String)key, (File)jsonFile.toFile());
                        }
                    } else {
                        String key = "litematica.message.error.json_material_list_failure";
                        this.parent.addMessage(Message.MessageType.ERROR, key, new Object[]{jsonFile.getFileName().toString()});
                    }
                    cache.clearAll();
                    jsonWriter.clear();
                    break;
                }
                case 8: {
                    MaterialListCustom customList = this.getMaterialListCustom(materialList);
                    GuiMaterialListSave gui = new GuiMaterialListSave(customList);
                    gui.setParent(GuiUtils.getCurrentScreen());
                    GuiBase.openGui((Screen)gui);
                }
            }
            this.parent.initGui();
        }

        private MaterialListCustom getMaterialListCustom(MaterialListBase materialList) {
            Object2IntOpenHashMap items = new Object2IntOpenHashMap();
            for (MaterialListEntry entry : materialList.getMaterialsAll()) {
                ItemStack stack = entry.getStack();
                ItemType itemType = new ItemType(stack, false, false);
                items.put((Object)itemType, entry.getCountTotal());
            }
            return new MaterialListCustom(materialList.getName(), (Map<ItemType, Integer>)items, null);
        }

        private DataDump getMaterialListDump(MaterialListBase materialList, boolean csv) {
            DataDump dump = new DataDump(4, csv ? DataDump.Format.CSV : DataDump.Format.ASCII);
            int multiplier = materialList.getMultiplier();
            ArrayList<MaterialListEntry> list = new ArrayList<MaterialListEntry>(materialList.getMaterialsFiltered(false));
            list.sort(new MaterialListSorter(materialList));
            for (MaterialListEntry entry : list) {
                int total = entry.getCountTotal() * multiplier;
                int missing = multiplier > 1 ? total : entry.getCountMissing();
                int available = entry.getCountAvailable();
                dump.addData(new String[]{entry.getStack().getHoverName().getString(), String.valueOf(total), String.valueOf(missing), String.valueOf(available)});
            }
            String titleTotal = multiplier > 1 ? String.format("Total (x%d)", multiplier) : "Total";
            dump.addTitle(new String[]{"Item", titleTotal, "Missing", "Available"});
            dump.addHeader(new String[]{materialList.getTitle()});
            dump.setColumnProperties(1, DataDump.Alignment.RIGHT, true);
            dump.setColumnProperties(2, DataDump.Alignment.RIGHT, true);
            dump.setColumnProperties(3, DataDump.Alignment.RIGHT, true);
            dump.setSort(false);
            dump.setUseColumnSeparator(true);
            return dump;
        }

        private boolean getMaterialListForJson(MaterialListBase materialList, MaterialListJson jsonWriter, MaterialListJsonCache cache, boolean missingOnly, boolean craftingOnly) {
            if (missingOnly) {
                return jsonWriter.readMaterialListMissingOnly(materialList, cache, craftingOnly);
            }
            return jsonWriter.readMaterialListAll(materialList, cache, craftingOnly);
        }

        public static enum Type {
            REFRESH_LIST("litematica.gui.button.material_list.refresh_list"),
            LIST_TYPE("litematica.gui.button.material_list.list_type"),
            HIDE_AVAILABLE("litematica.gui.button.material_list.hide_available"),
            TOGGLE_INFO_HUD("litematica.gui.button.material_list.toggle_info_hud"),
            CLEAR_IGNORED("litematica.gui.button.material_list.clear_ignored"),
            CLEAR_CACHE("litematica.gui.button.material_list.clear_cache"),
            WRITE_TO_FILE("litematica.gui.button.material_list.write_to_file"),
            WRITE_TO_JSON("litematica.gui.button.material_list.write_to_json"),
            EXPORT("litematica.gui.button.material_list.export");

            private final String translationKey;

            private Type(String translationKey) {
                this.translationKey = translationKey;
            }

            public String getTranslationKey() {
                return this.translationKey;
            }

            public String getDisplayName(Object ... args) {
                return StringUtils.translate((String)this.translationKey, (Object[])args);
            }
        }
    }
}

