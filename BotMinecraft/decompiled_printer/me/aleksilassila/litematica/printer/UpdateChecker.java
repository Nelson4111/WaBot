/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonArray
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonParser
 */
package me.aleksilassila.litematica.printer;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.net.URL;
import java.util.Scanner;
import me.aleksilassila.litematica.printer.PrinterReference;

public class UpdateChecker {
    public static final String version = "v" + PrinterReference.MOD_VERSION;

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    public static String getPrinterVersion() {
        try (InputStream inputStream = new URL("https://api.github.com/repos/aleksilassila/litematica-printer/tags").openStream();
             Scanner scanner = new Scanner(inputStream);){
            if (!scanner.hasNext()) return "";
            JsonArray tags = new JsonParser().parse(scanner.next()).getAsJsonArray();
            String string = ((JsonObject)tags.get(0)).get("name").getAsString();
            return string;
        }
        catch (Exception exception) {
            System.out.println("Cannot look for updates: " + exception.getMessage());
        }
        return "";
    }
}

