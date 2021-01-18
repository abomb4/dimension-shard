package com.abomb4.antialias;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

public class Main {

    public static final Set<String> EXCLUSIONS = Set.of(
        "core-construction-platform-gate-left1.png",
        "core-construction-platform-gate-left2.png",
        "electric-storm-turret-middle.png"
    );

    public static final String SPRITES_RAW = "sprites-raw";

    public static void log(String txt) {
        System.out.println(txt);
    }
    public static int getRGB(BufferedImage image, int ix, int iy) {
        return image.getRGB(Math.max(Math.min(ix, image.getWidth() - 1), 0), Math.max(Math.min(iy, image.getHeight() - 1), 0));
    }

    public static boolean isExclusion(String filename) {
        return EXCLUSIONS.contains(filename);
    }
    public static File getRawDir(String arg0) {
        File file = new File(arg0);
        while (file != null) {
            if (file.getName().equals("tools")) {
                try {
                    return Objects.requireNonNull(file.getParentFile().listFiles((dir, name) -> SPRITES_RAW.equals(name)))[0];
                } catch (Exception e) {
                    throw new RuntimeException("Cannot find sprites-raw dir!");
                }
            } else {
                file = file.getParentFile();
            }
        }
        throw new RuntimeException("Please run this tool at tools directory!");
    }

    @SuppressWarnings("ResultOfMethodCallIgnored")
    public static File getOutFile(File inFile) {
        final String absolutePath = inFile.getAbsolutePath();
        final File newFile = new File(absolutePath.replaceAll(SPRITES_RAW, "sprites"));
        newFile.mkdirs();
        return newFile;
    }

    public static void recursive(File[] files) throws IOException {
        if (files == null) {
            return;
        }
        for (File file : files) {
            if (file.isDirectory()) {
                recursive(file.listFiles());
            } else if (file.getName().endsWith(".png")) {
                log("处理文件 " + file.getAbsolutePath());
                final File outFile = getOutFile(file);
                if (isExclusion(file.getName())) {
                    log("文件 " + file.getName() + "不进行抗锯齿，直接复制");
                    Files.copy(file.toPath(), outFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                } else {
                    antialias(file, outFile);
                    log("文件输出到 " + outFile.getAbsolutePath());
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        final File rawDir = getRawDir(System.getProperty("user.dir"));
        recursive(rawDir.listFiles());
    }

    public static void antialias(File inFile, File outFile) {
        try {
            final BufferedImage image = ImageIO.read(inFile);
            final BufferedImage out = ImageIO.read(inFile);
            final BufferedImage result = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);
            final int radius = 4;
            var color = new Color();
            var sum = new Color();
            var suma = new Color();
            var p = new int[9];

            for (int x = 0; x < image.getWidth(); x++) {
                for (int y = 0; y < image.getHeight(); y++) {
                    int A = getRGB(image, x - 1, y + 1),
                            B = getRGB(image, x, y + 1),
                            C = getRGB(image, x + 1, y + 1),
                            D = getRGB(image, x - 1, y),
                            E = getRGB(image, x, y),
                            F = getRGB(image, x + 1, y),
                            G = getRGB(image, x - 1, y - 1),
                            H = getRGB(image, x, y - 1),
                            I = getRGB(image, x + 1, y - 1);

                    Arrays.fill(p, E);

                    if (D == B && D != H && B != F) p[0] = D;
                    if ((D == B && D != H && B != F && E != C) || (B == F && B != D && F != H && E != A)) p[1] = B;
                    if (B == F && B != D && F != H) p[2] = F;
                    if ((H == D && H != F && D != B && E != A) || (D == B && D != H && B != F && E != G)) p[3] = D;
                    if ((B == F && B != D && F != H && E != I) || (F == H && F != B && H != D && E != C)) p[5] = F;
                    if (H == D && H != F && D != B) p[6] = D;
                    if ((F == H && F != B && H != D && E != G) || (H == D && H != F && D != B && E != I)) p[7] = H;
                    if (F == H && F != B && H != D) p[8] = F;

                    suma.set(0);

                    for (int val : p) {
                        color.argb8888(val);
                        suma.r += color.r * color.a;
                        suma.g += color.g * color.a;
                        suma.b += color.b * color.a;
                        suma.a += color.a;
                    }

                    float fm = suma.a <= 0.001f ? 0f : (float) (1f / suma.a);
                    suma.mul(fm, fm, fm, fm);

                    float total = 0;
                    sum.set(0);

                    for (int val : p) {
                        color.argb8888(val);
                        float a = color.a;
                        color.lerp(suma, (float) (1f - a));
                        sum.r += color.r;
                        sum.g += color.g;
                        sum.b += color.b;
                        sum.a += a;
                        total += 1f;
                    }

                    fm = (float) (1f / total);
                    sum.mul(fm, fm, fm, fm);
                    out.setRGB(x, y, sum.argb8888());
                    sum.set(0);
                }
            }

            ImageIO.write(out, "png", outFile);
        } catch (Exception e) {
            throw new RuntimeException("DIE", e);
        }
    }
}
