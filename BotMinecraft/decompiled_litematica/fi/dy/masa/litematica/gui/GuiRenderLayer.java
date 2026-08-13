/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiRenderLayerEditBase
 *  fi.dy.masa.malilib.gui.GuiRenderLayerEditBase$RangeHotkeyListener
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetCheckBox
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 *  net.minecraft.client.gui.screens.Screen
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiRenderLayerEditBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetBase;
import fi.dy.masa.malilib.gui.widgets.WidgetCheckBox;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import net.minecraft.client.gui.screens.Screen;

public class GuiRenderLayer
extends GuiRenderLayerEditBase {
    public void initGui() {
        super.initGui();
        int x = 10;
        int y = 26;
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.GENERIC);
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.INFO_OVERLAYS);
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.VISUALS);
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.COLORS);
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.HOTKEYS);
        x += this.createTabButton(x, y, -1, GuiConfigs.ConfigGuiTab.RENDER_LAYERS);
        x = 10;
        y = 60;
        this.createLayerEditControls(x, y, this.getLayerRange());
    }

    protected LayerRange getLayerRange() {
        return DataManager.getRenderLayerRange();
    }

    protected IGuiIcon getValueAdjustButtonIcon() {
        return Icons.BUTTON_PLUS_MINUS_16;
    }

    private int createTabButton(int x, int y, int width, GuiConfigs.ConfigGuiTab tab) {
        ButtonListenerTab listener = new ButtonListenerTab(tab);
        boolean enabled = DataManager.getConfigGuiTab() != tab;
        String label = tab.getDisplayName();
        if (width < 0) {
            width = this.getStringWidth(label) + 10;
        }
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, label, new String[0]);
        button.setEnabled(enabled);
        this.addButton((ButtonBase)button, listener);
        return width + 2;
    }

    protected int createHotkeyCheckBoxes(int x, int y, LayerRange layerRange) {
        String label = StringUtils.translate((String)"litematica.gui.label.render_layers.hotkey", (Object[])new Object[0]);
        String hover = StringUtils.translate((String)"litematica.gui.label.render_layers.hover.hotkey", (Object[])new Object[0]);
        WidgetCheckBox cb = new WidgetCheckBox(x, y + 4, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, label, hover);
        cb.setChecked(layerRange.getMoveLayerRangeMax(), false);
        cb.setListener((ISelectionListener)new GuiRenderLayerEditBase.RangeHotkeyListener(layerRange, true));
        this.addWidget((WidgetBase)cb);
        cb = new WidgetCheckBox(x, (y += 23) + 4, (IGuiIcon)Icons.CHECKBOX_UNSELECTED, (IGuiIcon)Icons.CHECKBOX_SELECTED, label, hover);
        cb.setChecked(layerRange.getMoveLayerRangeMin(), false);
        cb.setListener((ISelectionListener)new GuiRenderLayerEditBase.RangeHotkeyListener(layerRange, false));
        this.addWidget((WidgetBase)cb);
        return y;
    }

    private record ButtonListenerTab(GuiConfigs.ConfigGuiTab tab) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            DataManager.setConfigGuiTab(this.tab);
            GuiBase.openGui((Screen)new GuiConfigs());
        }
    }
}

