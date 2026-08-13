/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.command.ClientCommandHandler
 *  fi.dy.masa.malilib.config.ConfigManager
 *  fi.dy.masa.malilib.config.IConfigHandler
 *  fi.dy.masa.malilib.event.InputEventHandler
 *  fi.dy.masa.malilib.event.RenderEventHandler
 *  fi.dy.masa.malilib.event.ServerHandler
 *  fi.dy.masa.malilib.event.TickHandler
 *  fi.dy.masa.malilib.event.WorldLoadHandler
 *  fi.dy.masa.malilib.hotkeys.IKeybindProvider
 *  fi.dy.masa.malilib.hotkeys.IKeyboardInputHandler
 *  fi.dy.masa.malilib.hotkeys.IMouseInputHandler
 *  fi.dy.masa.malilib.interfaces.IClientCommandListener
 *  fi.dy.masa.malilib.interfaces.IClientTickHandler
 *  fi.dy.masa.malilib.interfaces.IInitializationHandler
 *  fi.dy.masa.malilib.interfaces.IRenderer
 *  fi.dy.masa.malilib.interfaces.IServerListener
 *  fi.dy.masa.malilib.interfaces.IWorldLoadListener
 *  fi.dy.masa.malilib.registry.Registry
 *  fi.dy.masa.malilib.util.data.ModInfo
 *  fi.dy.masa.malilib.util.i18n.i18nMode
 *  net.minecraft.client.Minecraft
 */
package fi.dy.masa.litematica;

import fi.dy.masa.litematica.command.PmCommand;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.event.InputHandler;
import fi.dy.masa.litematica.event.KeyCallbacks;
import fi.dy.masa.litematica.event.RenderHandler;
import fi.dy.masa.litematica.event.ServerListener;
import fi.dy.masa.litematica.event.WorldLoadListener;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.litematica.render.infohud.StatusInfoRenderer;
import fi.dy.masa.litematica.scheduler.ClientTickHandler;
import fi.dy.masa.litematica.schematic.placement.PlacementManagerDaemonHandler;
import fi.dy.masa.malilib.command.ClientCommandHandler;
import fi.dy.masa.malilib.config.ConfigManager;
import fi.dy.masa.malilib.config.IConfigHandler;
import fi.dy.masa.malilib.event.InputEventHandler;
import fi.dy.masa.malilib.event.RenderEventHandler;
import fi.dy.masa.malilib.event.ServerHandler;
import fi.dy.masa.malilib.event.TickHandler;
import fi.dy.masa.malilib.event.WorldLoadHandler;
import fi.dy.masa.malilib.hotkeys.IKeybindProvider;
import fi.dy.masa.malilib.hotkeys.IKeyboardInputHandler;
import fi.dy.masa.malilib.hotkeys.IMouseInputHandler;
import fi.dy.masa.malilib.interfaces.IClientCommandListener;
import fi.dy.masa.malilib.interfaces.IClientTickHandler;
import fi.dy.masa.malilib.interfaces.IInitializationHandler;
import fi.dy.masa.malilib.interfaces.IRenderer;
import fi.dy.masa.malilib.interfaces.IServerListener;
import fi.dy.masa.malilib.interfaces.IWorldLoadListener;
import fi.dy.masa.malilib.registry.Registry;
import fi.dy.masa.malilib.util.data.ModInfo;
import fi.dy.masa.malilib.util.i18n.i18nMode;
import net.minecraft.client.Minecraft;

public class InitHandler
implements IInitializationHandler {
    public void registerModHandlers() {
        ConfigManager.getInstance().registerConfigHandler("litematica", (IConfigHandler)new Configs());
        Registry.CONFIG_SCREEN.registerConfigScreenFactory(new ModInfo("litematica", "Litematica", GuiConfigs::new));
        Configs.LANG.ifPresent(i18nManager2 -> Registry.TRANSLATION_OVERRIDE_MANAGER.registerTranslationManager("litematica", i18nManager2, (i18nMode)Configs.Generic.TRANSLATION_MODE.getOptionListValue()));
        Configs.Generic.TRANSLATION_MODE.setValueChangeCallback(cfg -> Registry.TRANSLATION_OVERRIDE_MANAGER.registerLanguageMode("litematica", (i18nMode)cfg.getOptionListValue()));
        EntityDataManager.getInstance().onGameInit();
        InputEventHandler.getKeybindManager().registerKeybindProvider((IKeybindProvider)InputHandler.getInstance());
        InputEventHandler.getInputManager().registerKeyboardInputHandler((IKeyboardInputHandler)InputHandler.getInstance());
        InputEventHandler.getInputManager().registerMouseInputHandler((IMouseInputHandler)InputHandler.getInstance());
        RenderHandler renderer = new RenderHandler();
        RenderEventHandler.getInstance().registerInGameGuiRenderer((IRenderer)renderer);
        RenderEventHandler.getInstance().registerWorldPreWeatherRenderer((IRenderer)renderer);
        RenderEventHandler.getInstance().registerWorldLastRenderer((IRenderer)renderer);
        ServerHandler.getInstance().registerServerHandler((IServerListener)new ServerListener());
        TickHandler.getInstance().registerClientTickHandler((IClientTickHandler)new ClientTickHandler());
        TickHandler.getInstance().registerClientTickHandler((IClientTickHandler)EntityDataManager.getInstance());
        TickHandler.getInstance().registerClientTickHandler((IClientTickHandler)PlacementManagerDaemonHandler.INSTANCE);
        WorldLoadListener listener = new WorldLoadListener();
        WorldLoadHandler.getInstance().registerWorldLoadPreHandler((IWorldLoadListener)listener);
        WorldLoadHandler.getInstance().registerWorldLoadPostHandler((IWorldLoadListener)listener);
        KeyCallbacks.init(Minecraft.getInstance());
        StatusInfoRenderer.init();
        ClientCommandHandler.INSTANCE.registerCommand((IClientCommandListener)new PmCommand());
        DataManager.getAreaSelectionsBaseDirectory();
        DataManager.getSchematicsBaseDirectory();
    }
}

