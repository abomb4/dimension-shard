package com.abomb4.antialias;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class Main {

    private static int getRGB(BufferedImage image, int ix, int iy) {
        return image.getRGB(Math.max(Math.min(ix, image.getWidth() - 1), 0), Math.max(Math.min(iy, image.getHeight() - 1), 0));
    }

    public static void main(String[] args) throws Exception {

        final String prefix = "D:\\tmp\\ss\\";
        final File dir = new File(prefix);
        final List<File> files = Arrays.stream(Optional.of(dir)
                        .map(File::listFiles)
                        .orElseGet(() -> new File[0]))
                        .filter(file -> file.getName().endsWith(".png"))
                        .filter(File::canWrite)
                        .filter(File::canRead)
                        .collect(Collectors.toList());
        files.forEach(file -> {
            System.out.println("处理文件 " + file.getAbsolutePath());
            antialias(file);
        });
    }

    public static void antialias(File file) {
        try {
            final BufferedImage image = ImageIO.read(file);
            final BufferedImage out = ImageIO.read(file);
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

            ImageIO.write(out, "png", file);
        } catch (Exception e) {
            throw new RuntimeException("DIE", e);
        }
    }
}
