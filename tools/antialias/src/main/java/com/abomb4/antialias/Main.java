package com.abomb4.antialias;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.function.BiFunction;

public class Main {

    public static final Color OUTLINE_BLOCK = Color.valueOf("404049");
    public static final Color darkMetal = Color.valueOf("6e7080");
    public static final Color darkerMetal = Color.valueOf("565666");

    public static final GenerationConfig DEFAULT_CONFIG = c();

    public static final Map<String, Integer> iconSizeMap = Map.of(
        "large", 40,
        "medium", 32,
        "small", 24,
        "tiny", 16,
        "xlarge", 48
    );

    public static final Map<String, GenerationConfig> FILE_CONFIG = Map.ofEntries(
        Map.entry("core-construction-platform-gate-left1.png", c().noAntialias()),
        Map.entry("core-construction-platform-gate-left2.png", c().noAntialias()),

        Map.entry("beat.png", c().outline()),
        Map.entry("beat-full.png", c().outline().setOutlineOverride().icons()),
        Map.entry("beat-weapon.png", c().outline()),
        Map.entry("beat-base.png", c().outline().setOutlineOverride()),
        Map.entry("beat-leg.png", c().outline().setOutlineOverride()),

        Map.entry("burn.png", c().outline()),
        Map.entry("burn-full.png", c().outline().setOutlineOverride().icons()),
        Map.entry("burn-ion-cannon.png", c().outline()),

        Map.entry("equa.png", c().outline().icons().setIconNameReplacer((fn, in) -> fn.replaceAll("-outline\\.png", "-" + in + ".png"))),
        Map.entry("formula.png", c().outline().icons().setIconNameReplacer((fn, in) -> fn.replaceAll("-outline\\.png", "-" + in + ".png"))),

        Map.entry("rhapsody.png", c().outline()),
        Map.entry("rhapsody-full.png", c().outline().setOutlineOverride().icons()),
        Map.entry("rhapsody-base.png", c().outline().setOutlineOverride()),
        Map.entry("rhapsody-leg.png", c().outline().setOutlineOverride()),

        Map.entry("collapse.png", c().outline()),
        Map.entry("collapse-full.png", c().noAntialias().icons()),
        Map.entry("collapse-weapon-0.png", c().outline()),
        Map.entry("collapse-weapon-1.png", c().outline()),
        Map.entry("collapse-weapon-2.png", c().outline())
    );

    public static final String SPRITES_RAW = "sprites-raw";

    public static void log(String txt) {
        System.out.println(txt);
    }

    public static int getRGB(BufferedImage image, int ix, int iy) {
        return image.getRGB(Math.max(Math.min(ix, image.getWidth() - 1), 0), Math.max(Math.min(iy, image.getHeight() - 1), 0));
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

                final GenerationConfig config = FILE_CONFIG.getOrDefault(file.getName(), DEFAULT_CONFIG);
                if (config.antialias) {
                    final File outFile = getOutFile(file);
                    log("生成抗锯齿 " + outFile.getAbsolutePath());
                    antialias(file, outFile);
                } else {
                    final File outFile = getOutFile(file);
                    log("无需抗锯齿 " + file.getName() + "，直接复制");
                    Files.copy(file.toPath(), outFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }

                final String outlineFileName = getOutFile(file).getAbsolutePath().replaceAll("\\.png$", "-outline.png");
                if (config.generateOutline) {
                    final Color outlineColor = config.outlineColor;
                    final File outlineOutFile = config.outlineOverride ? getOutFile(file) : new File(outlineFileName);
                    log("生成 Outline: " + outlineOutFile.getAbsolutePath());
                    generateOutline(file, outlineOutFile, outlineColor);
                }

                if (config.generateIcons) {
                    if (config.generateOutline) {
                        // 单位图标都是根据 outline 生成的
                        if (config.outlineOverride) {
                            generateIcon(getOutFile(file), config.iconNameReplacer);
                        } else {
                            generateIcon(new File(outlineFileName), config.iconNameReplacer);
                        }
                    } else {
                        // 方块图标不需要
                        generateIcon(file, config.iconNameReplacer);
                    }
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        final File rawDir = getRawDir(System.getProperty("user.dir"));
        // Remove output dir
        final File outputDir = new File(rawDir.getAbsolutePath().replaceAll(SPRITES_RAW, "sprites"));
        outputDir.delete();
        recursive(rawDir.listFiles());
    }

    /**
     * @param inFile Input file
     * @param fileNameMapper param1: Full filename, param2: Icon name, return: New full file name
     */
    public static void generateIcon(File inFile, BiFunction<String, String, String> fileNameMapper) {

        try {
            final BufferedImage image = ImageIO.read(inFile);
            for (Map.Entry<String, Integer> entry : iconSizeMap.entrySet()) {
                final String iconName = entry.getKey();
                final String outFileName = fileNameMapper.apply(getOutFile(inFile).getAbsolutePath(), iconName);
                final Integer maxSize = entry.getValue();
                final BigDecimal scale = BigDecimal.valueOf(maxSize).divide(BigDecimal.valueOf(Math.max(image.getWidth(), image.getHeight())), 4, RoundingMode.HALF_UP);
                final int width = scale.multiply(BigDecimal.valueOf(image.getWidth())).intValue();
                final int height = scale.multiply(BigDecimal.valueOf(image.getHeight())).intValue();
                final BufferedImage newImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

                final Graphics2D newGraph = newImage.createGraphics();
                newGraph.drawImage(image.getScaledInstance(width, height, java.awt.Image.SCALE_AREA_AVERAGING), 0, 0, width, height, null);
                ImageIO.write(newImage, "png", new File(outFileName));
            }
        } catch (Exception e) {
            throw new RuntimeException("ICON DIE!");
        }
    }
    public static void generateOutline(File inFile, File outFile, Color outlineColor) {
        final int outline888 = outlineColor.argb8888();
        final int radius = 3;
        final float flouat = .00001F;
        final Color color = new Color();
        try {
            final BufferedImage image = ImageIO.read(inFile);
            final BufferedImage out = ImageIO.read(inFile);

            for (int x = 0; x < image.getWidth(); x++) {
                for (int y = 0; y < image.getHeight(); y++) {
                    final int point = getRGB(image, x, y);
                    out.setRGB(x, y, point);
                    if (point == 0) {
                        boolean found = false;
                        outer:
                        for (int rx = -radius; rx <= radius; rx++) {
                            for (int ry = -radius; ry <= radius; ry++) {
                                if (Mathf.within(rx, ry, radius + flouat) && color.argb8888(getRGB(image, rx + x, ry + y)).a > 0.01f) {
                                    found = true;
                                    break outer;
                                }
                            }
                        }
                        if (found) {
                            out.setRGB(x, y, outline888);
                        }
                    }
                }
            }
            ImageIO.write(out, "png", outFile);
            antialias(outFile, outFile);
        } catch (Exception e) {
            throw new RuntimeException("OUTLINE DIE", e);
        }
    }

    public static void antialias(File inFile, File outFile) {
        try {
            final BufferedImage image = ImageIO.read(inFile);
            final BufferedImage out = ImageIO.read(inFile);
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
                    // Ugly way to deal with Vertical and Horizontal line
                    // A B C   0 1 2
                    // D E F   3 4 5
                    // G H I   6 7 8
                    if (E == 0 && Arrays.stream(p).noneMatch(v -> v != 0)) {
                        if (A == 0 && C == 0 && B == 0 && D == 0 && F == 0 && H != 0) {
                            // p[6] = G;
                            p[7] = H;
                            // p[8] = I;
                        } else if (A == 0 && G == 0 && B == 0 && D == 0 && F != 0 && H == 0) {
                            // p[2] = C;
                            p[5] = F;
                            // p[8] = I;
                        } else if (C == 0 && I == 0 && B == 0 && D != 0 && F == 0 && H == 0) {
                            // p[0] = A;
                            p[3] = D;
                            // p[6] = G;
                        } else if (G == 0 && I == 0 && B != 0 && D == 0 && F == 0 && H == 0) {
                            // p[0] = A;
                            p[1] = B;
                            // p[2] = C;
                        } else if (D != 0 && H != 0) {
                            p[3] = D;
                            p[7] = H;
                        } else if (F != 0 && H != 0) {
                            p[5] = F;
                            p[7] = H;
                        } else if (D != 0 && B != 0) {
                            p[3] = D;
                            p[1] = B;
                        } else if (F != 0 && B != 0) {
                            p[5] = F;
                            p[1] = B;
                        }

                    }
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

    public static class GenerationConfig {
        boolean antialias = true;
        boolean generateOutline = false;
        boolean outlineOverride = false;
        boolean generateIcons = false;
        BiFunction<String, String, String> iconNameReplacer = (name, iconName) -> name.replaceAll("-full\\.png$", "-" + iconName + ".png");
        Color outlineColor = darkerMetal;

        public GenerationConfig noAntialias() {
            this.antialias = false;
            return this;
        }
        public GenerationConfig outline() {
            this.generateOutline = true;
            return this;
        }
        public GenerationConfig outline(Color outlineColor) {
            this.generateOutline = true;
            this.outlineColor = outlineColor;
            return this;
        }
        public GenerationConfig setOutlineOverride() {
            this.outlineOverride = true;
            return this;
        }
        public GenerationConfig icons() {
            this.generateIcons = true;
            return this;
        }
        public GenerationConfig setIconNameReplacer(BiFunction<String, String, String> iconNameReplacer) {
            this.iconNameReplacer = iconNameReplacer;
            return this;
        }
    }

    public static GenerationConfig c() {
        return new GenerationConfig();
    }
}
