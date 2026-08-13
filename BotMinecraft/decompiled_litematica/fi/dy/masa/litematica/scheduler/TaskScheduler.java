/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  net.minecraft.client.Minecraft
 *  net.minecraft.util.profiling.Profiler
 *  net.minecraft.util.profiling.ProfilerFiller
 */
package fi.dy.masa.litematica.scheduler;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.scheduler.ITask;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.Minecraft;
import net.minecraft.util.profiling.Profiler;
import net.minecraft.util.profiling.ProfilerFiller;

public class TaskScheduler {
    private static final TaskScheduler INSTANCE_CLIENT = new TaskScheduler(false);
    private static final TaskScheduler INSTANCE_SERVER = new TaskScheduler(true);
    private final List<ITask> tasks = new ArrayList<ITask>();
    private final List<ITask> tasksToAdd = new ArrayList<ITask>();
    private final boolean isServer;

    private TaskScheduler(boolean isServer) {
        this.isServer = isServer;
    }

    public static TaskScheduler getInstanceClient() {
        return INSTANCE_CLIENT;
    }

    public static TaskScheduler getInstanceServer() {
        return INSTANCE_SERVER;
    }

    public static TaskScheduler getServerInstanceIfExistsOrClient() {
        Minecraft mc = Minecraft.getInstance();
        return mc.hasSingleplayerServer() ? INSTANCE_SERVER : INSTANCE_CLIENT;
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void scheduleTask(ITask task, int interval) {
        TaskScheduler taskScheduler = this;
        synchronized (taskScheduler) {
            task.createTimer(interval);
            task.getTimer().setNextDelay(0);
            this.tasksToAdd.add(task);
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void runTasks() {
        if (Minecraft.getInstance().player == null) {
            return;
        }
        ProfilerFiller profiler = Profiler.get();
        profiler.push("litematica_run_tasks");
        TaskScheduler taskScheduler = this;
        synchronized (taskScheduler) {
            if (!this.tasks.isEmpty()) {
                for (int i = 0; i < this.tasks.size(); ++i) {
                    boolean finished = false;
                    ITask task = this.tasks.get(i);
                    if (task.shouldRemove()) {
                        finished = true;
                    } else if (task.canExecute() && task.getTimer().tick()) {
                        finished = task.execute(profiler);
                    }
                    if (!finished) continue;
                    task.stop();
                    this.tasks.remove(i);
                    --i;
                }
            }
            if (!this.tasksToAdd.isEmpty()) {
                this.addNewTasks();
            }
        }
        profiler.pop();
    }

    private void addNewTasks() {
        for (int i = 0; i < this.tasksToAdd.size(); ++i) {
            ITask task = this.tasksToAdd.get(i);
            task.init();
            this.tasks.add(task);
        }
        this.tasksToAdd.clear();
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public boolean hasTask(Class<? extends ITask> clazz) {
        TaskScheduler taskScheduler = this;
        synchronized (taskScheduler) {
            for (ITask task : this.tasks) {
                if (!clazz.equals(task.getClass())) continue;
                return true;
            }
            for (ITask task : this.tasksToAdd) {
                if (!clazz.equals(task.getClass())) continue;
                return true;
            }
            return false;
        }
    }

    public ImmutableList<ITask> getAllTasks() {
        return ImmutableList.copyOf(this.tasks);
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public boolean removeTask(ITask task) {
        TaskScheduler taskScheduler = this;
        synchronized (taskScheduler) {
            task.stop();
            return this.tasks.remove(task);
        }
    }

    /*
     * WARNING - Removed try catching itself - possible behaviour change.
     */
    public void clearTasks() {
        TaskScheduler taskScheduler = this;
        synchronized (taskScheduler) {
            for (int i = 0; i < this.tasks.size(); ++i) {
                ITask task = this.tasks.get(i);
                task.stop();
            }
            this.tasks.clear();
        }
    }
}

