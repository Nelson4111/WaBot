/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiConfigsBase
 *  fi.dy.masa.malilib.gui.GuiConfigsBase$ConfigOptionWrapper
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IConfigGuiAllTab
 *  fi.dy.masa.malilib.gui.widgets.WidgetListConfigOptions
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.client.gui.screens.Screen
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiRenderLayer;
import fi.dy.masa.litematica.util.SchematicWorldRefresher;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiConfigsBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IConfigGuiAllTab;
import fi.dy.masa.malilib.gui.widgets.WidgetListConfigOptions;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import net.minecraft.client.gui.screens.Screen;

public class GuiConfigs
extends GuiConfigsBase
implements IConfigGuiAllTab {
    public GuiConfigs() {
        super(10, 50, "litematica", null, "litematica.gui.title.configs", new Object[]{String.format("%s", Reference.MOD_VERSION)});
    }

    public void initGui() {
        super.initGui();
        this.clearOptions();
        if (DataManager.getConfigGuiTab() == ConfigGuiTab.RENDER_LAYERS) {
            GuiBase.openGui((Screen)new GuiRenderLayer());
            return;
        }
        int x = 10;
        int y = 26;
        for (ConfigGuiTab tab : ConfigGuiTab.values()) {
            if (!this.useAllTab() && tab == ConfigGuiTab.ALL) continue;
            x += this.createButton(x, y, -1, tab);
        }
    }

    public void removed() {
        super.removed();
        Configs.checkBaseLanguage();
    }

    private int createButton(int x, int y, int width, ConfigGuiTab tab) {
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, tab.getDisplayName(), new String[0]);
        button.setEnabled(DataManager.getConfigGuiTab() != tab);
        this.addButton((ButtonBase)button, new ButtonListener(tab, this));
        return button.getWidth() + 2;
    }

    protected int getConfigWidth() {
        ConfigGuiTab tab = DataManager.getConfigGuiTab();
        if (tab == ConfigGuiTab.INFO_OVERLAYS) {
            return 140;
        }
        if (tab == ConfigGuiTab.GENERIC || tab == ConfigGuiTab.VISUALS) {
            return 180;
        }
        if (tab == ConfigGuiTab.COLORS) {
            return 100;
        }
        return super.getConfigWidth();
    }

    protected boolean useKeybindSearch() {
        ConfigGuiTab tab = DataManager.getConfigGuiTab();
        return tab == ConfigGuiTab.ALL || tab == ConfigGuiTab.GENERIC || tab == ConfigGuiTab.VISUALS || tab == ConfigGuiTab.HOTKEYS;
    }

    public List<GuiConfigsBase.ConfigOptionWrapper> getConfigs() {
        ConfigGuiTab tab = DataManager.getConfigGuiTab();
        if (tab == ConfigGuiTab.ALL && this.useAllTab()) {
            return this.getAllConfigs();
        }
        Object configs = tab == ConfigGuiTab.GENERIC ? Configs.Generic.OPTIONS : (tab == ConfigGuiTab.INFO_OVERLAYS ? Configs.InfoOverlays.OPTIONS : (tab == ConfigGuiTab.VISUALS ? Configs.Visuals.OPTIONS : (tab == ConfigGuiTab.COLORS ? Configs.Colors.OPTIONS : (tab == ConfigGuiTab.HOTKEYS ? Hotkeys.HOTKEY_LIST : (tab == ConfigGuiTab.RENDER_LAYERS ? Collections.emptyList() : Collections.emptyList())))));
        return GuiConfigsBase.ConfigOptionWrapper.createFor(configs);
    }

    public boolean useAllTab() {
        return true;
    }

    public List<GuiConfigsBase.ConfigOptionWrapper> getAllConfigs() {
        ArrayList<GuiConfigsBase.ConfigOptionWrapper> configs = new ArrayList<GuiConfigsBase.ConfigOptionWrapper>();
        configs.addAll(GuiConfigsBase.ConfigOptionWrapper.createFor(Configs.Generic.OPTIONS));
        configs.addAll(GuiConfigsBase.ConfigOptionWrapper.createFor(Configs.InfoOverlays.OPTIONS));
        configs.addAll(GuiConfigsBase.ConfigOptionWrapper.createFor(Configs.Visuals.OPTIONS));
        configs.addAll(GuiConfigsBase.ConfigOptionWrapper.createFor(Configs.Colors.OPTIONS));
        configs.addAll(GuiConfigsBase.ConfigOptionWrapper.createFor(Hotkeys.HOTKEY_LIST));
        return configs;
    }

    protected void onSettingsChanged() {
        super.onSettingsChanged();
        SchematicWorldRefresher.INSTANCE.updateAll();
    }

    public static enum ConfigGuiTab {
        ALL(IConfigGuiAllTab.getTranslationKey()),
        GENERIC("litematica.gui.button.config_gui.generic"),
        INFO_OVERLAYS("litematica.gui.button.config_gui.info_overlays"),
        VISUALS("litematica.gui.button.config_gui.visuals"),
        COLORS("litematica.gui.button.config_gui.colors"),
        HOTKEYS("litematica.gui.button.config_gui.hotkeys"),
        RENDER_LAYERS("litematica.gui.button.config_gui.render_layers");

        private final String translationKey;

        private ConfigGuiTab(String translationKey) {
            this.translationKey = translationKey;
        }

        public String getDisplayName() {
            return StringUtils.translate((String)this.translationKey, (Object[])new Object[0]);
        }
    }

    private record ButtonListener(ConfigGuiTab tab, GuiConfigs parent) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            DataManager.setConfigGuiTab(this.tab);
            if (this.tab != ConfigGuiTab.RENDER_LAYERS) {
                this.parent.reCreateListWidget();
                Objects.requireNonNull((WidgetListConfigOptions)this.parent.getListWidget()).resetScrollbarPosition();
                this.parent.initGui();
            } else {
                GuiBase.openGui((Screen)new GuiRenderLayer());
            }
        }
    }
}

