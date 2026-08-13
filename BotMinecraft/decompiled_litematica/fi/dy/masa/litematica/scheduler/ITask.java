/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.util.profiling.ProfilerFiller
 */
package fi.dy.masa.litematica.scheduler;

import fi.dy.masa.litematica.scheduler.TaskTimer;
import net.minecraft.util.profiling.ProfilerFiller;

public interface ITask {
    public String getDisplayName();

    public void init();

    public boolean canExecute();

    public boolean execute(ProfilerFiller var1);

    public boolean shouldRemove();

    public void stop();

    public TaskTimer getTimer();

    public void createTimer(int var1);
}

