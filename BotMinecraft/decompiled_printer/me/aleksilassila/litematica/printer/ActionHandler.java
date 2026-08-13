package me.aleksilassila.litematica.printer;

import java.util.Collections;
import java.util.LinkedList;
import java.util.Queue;
import me.aleksilassila.litematica.printer.Printer;
import me.aleksilassila.litematica.printer.actions.Action;
import me.aleksilassila.litematica.printer.actions.PrepareAction;
import me.aleksilassila.litematica.printer.config.Configs;
import me.aleksilassila.litematica.printer.implementation.actions.InteractActionImpl;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

public class ActionHandler {
    private final Minecraft client;
    private final LocalPlayer player;
    private final Queue<Action> actionQueue = new LinkedList<Action>();
    public PrepareAction lookAction = null;
    private int tick = 0;

    public ActionHandler(Minecraft client, LocalPlayer player) {
        this.client = client;
        this.player = player;
    }

    public void onGameTick() {
        int tickRate = Configs.PRINTING_INTERVAL.getIntegerValue();
        int n = this.tick = this.tick % tickRate == tickRate - 1 ? 0 : this.tick + 1;
        if (this.tick % tickRate != 0) {
            return;
        }
        while (!this.actionQueue.isEmpty()) {
            Action nextAction = this.actionQueue.poll();
            if (nextAction != null) {
                Printer.printDebug("Sending action {}", nextAction);
                nextAction.send(this.client, this.player);

                if (nextAction instanceof PrepareAction && !this.actionQueue.isEmpty() && this.actionQueue.peek() instanceof InteractActionImpl) {
                    Action interactAction = this.actionQueue.poll();
                    Printer.printDebug("Sending paired placement action {}", interactAction);
                    interactAction.send(this.client, this.player);
                }
                break;
            }
        }
        if (this.actionQueue.isEmpty()) {
            this.lookAction = null;
        }
    }

    public boolean acceptsActions() {
        return this.actionQueue.isEmpty();
    }

    public void addActions(Action ... actions) {
        if (!this.acceptsActions()) {
            return;
        }
        for (Action action : actions) {
            if (!(action instanceof PrepareAction)) continue;
            this.lookAction = (PrepareAction)action;
        }
        Collections.addAll(this.actionQueue, actions);
    }
}
